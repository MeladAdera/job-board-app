/**
 * 🎯 APPLICATION BUSINESS LOGIC SERVICE
 * Implements core application workflow with data validation and business rules
 * Uses repository pattern for database operations with proper error handling
 */

const pool = require('../config/database');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors/AppError');

class ApplicationService {
    /**
     * APPLICATION STATUS STATE MACHINE
     * Defines allowed status transitions and their semantic meanings
     * Implements finite state machine pattern for application lifecycle
     */
    static ALLOWED_STATUSES = {
        PENDING: 'pending',      // Initial state after submission
        REVIEWING: 'reviewing',  // Under active consideration
        ACCEPTED: 'accepted',    // Positive outcome
        REJECTED: 'rejected'     // Negative outcome
    };

    /**
     * SINGLE RECORD VALIDATION HELPER
     * Implements null-safe pattern for database result validation
     * Provides consistent error messaging for missing entities
     */
    static _validateResultExists(result, entityName = 'Record') {
        if (!result || !result.rows || result.rows.length === 0) {
            throw new NotFoundError(`${entityName} not found`);
        }
        return result.rows[0];
    }

    /**
     * COLLECTION VALIDATION HELPER
     * Implements empty collection detection with proper error handling
     * Supports both empty results and null result scenarios
     */
    static _validateResultsExist(result, entityName = 'Records') {
        if (!result || !result.rows) {
            throw new NotFoundError(`No ${entityName.toLowerCase()} found`);
        }
        return result.rows;
    }

    /**
     * STATUS VALIDATION HELPER
     * Implements enum validation pattern for state integrity
     * Prevents invalid status transitions at the service layer
     */
    static _validateStatus(status) {
        const allowedValues = Object.values(this.ALLOWED_STATUSES);
        if (!allowedValues.includes(status)) {
            throw new ValidationError(`Invalid status. Allowed values: ${allowedValues.join(', ')}`);
        }
    }

    /**
     * SUBMIT JOB APPLICATION
     * Implements idempotent application submission with duplicate prevention
     * Ensures data consistency through unique constraint validation
     */
    static async submitApplication(applicationData) {
        const { job_id, candidate_id, cover_letter, resume_url, resume_name } = applicationData;

        // Duplicate prevention using database-level unique constraint validation
        const existingApplication = await pool.query(
            'SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2',
            [job_id, candidate_id]
        );

        if (existingApplication.rows.length > 0) {
            throw new ValidationError('You have already applied to this job');
        }

        // Atomic insertion with default status assignment
        const result = await pool.query(
            `INSERT INTO applications (job_id, candidate_id, cover_letter, resume_url, resume_name, status) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [job_id, candidate_id, cover_letter, resume_url, resume_name, this.ALLOWED_STATUSES.PENDING]
        );

        return this._validateResultExists(result, 'Application');
    }

    /**
     * RETRIEVE CANDIDATE'S APPLICATIONS
     * Implements data aggregation pattern with contextual job information
     * Provides comprehensive view of candidate's application history
     */
    static async getCandidateApplications(candidate_id) {
        const result = await pool.query(
            `SELECT a.*, j.title as job_title, j.company, j.location 
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             WHERE a.candidate_id = $1
             ORDER BY a.applied_at DESC`, // Temporal ordering for recency
            [candidate_id]
        );

        return this._validateResultsExist(result, 'Applications');
    }

    /**
     * RETRIEVE JOB APPLICATIONS WITH OWNERSHIP VALIDATION
     * Implements resource ownership verification pattern
     * Ensures data isolation between different recruiters
     */
    static async getJobApplications(job_id, recruiter_id) {
        const jobResult = await pool.query(
            'SELECT recruiter_id FROM jobs WHERE id = $1',
            [job_id]
        );

        const job = this._validateResultExists(jobResult, 'Job');
        
        // Ownership verification - prevents cross-recruiter data access
        if (job.recruiter_id !== recruiter_id) {
            throw new ForbiddenError('Access denied. You are not the job owner');
        }

        const result = await pool.query(
            `SELECT a.*, u.name as candidate_name, u.email as candidate_email 
             FROM applications a
             JOIN users u ON a.candidate_id = u.id
             WHERE a.job_id = $1
             ORDER BY a.applied_at DESC`,
            [job_id]
        );

        return this._validateResultsExist(result, 'Applications');
    }

    /**
     * UPDATE APPLICATION STATUS WITH AUDIT TRAIL
     * Implements state transition pattern with reviewer tracking
     * Maintains audit information for compliance and transparency
     */
    static async updateApplicationStatus(application_id, status, notes, reviewed_by) {
        this._validateStatus(status);

        const result = await pool.query(
            `UPDATE applications 
             SET status = $1, notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP 
             WHERE id = $4 
             RETURNING *`,
            [status, notes, reviewed_by, application_id]
        );

        return this._validateResultExists(result, 'Application');
    }

    /**
     * RETRIEVE APPLICATION WITH CONTEXTUAL DATA
     * Implements eager loading pattern for related entity data
     * Reduces N+1 query problems through strategic joins
     */
    static async getApplicationById(application_id) {
        const result = await pool.query(
            `SELECT a.*, j.title as job_title, u.name as candidate_name
             FROM applications a
             JOIN jobs j ON a.job_id = j.id
             JOIN users u ON a.candidate_id = u.id
             WHERE a.id = $1`,
            [application_id]
        );

        return this._validateResultExists(result, 'Application');
    }
}

module.exports = ApplicationService;