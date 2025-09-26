//backend/src/services/applicationService.js
const pool = require('../config/database');

class ApplicationService {
    // 🎯 الثوابت المحسنة
    static ALLOWED_STATUSES = {
        PENDING: 'pending',
        REVIEWING: 'reviewing',
        ACCEPTED: 'accepted', 
        REJECTED: 'rejected'
    };

    // 🎯 دوال مساعدة محسنة
    static _validateResultExists(result, entityName = 'Record') {
        if (!result || !result.rows || result.rows.length === 0) {
            throw new Error(`${entityName} not found`);
        }
        return result.rows[0];
    }

    static _validateResultsExist(result, entityName = 'Records') {
        if (!result || !result.rows) {
            throw new Error(`No ${entityName.toLowerCase()} found`);
        }
        return result.rows;
    }

    static _validateStatus(status) {
        const allowedValues = Object.values(this.ALLOWED_STATUSES);
        if (!allowedValues.includes(status)) {
            throw new Error(`Invalid status. Allowed values: ${allowedValues.join(', ')}`);
        }
    }

    // 🎯 الدوال الرئيسية المحسنة
    static async submitApplication(applicationData) {
        const { job_id, candidate_id, cover_letter, resume_url, resume_name } = applicationData;

        try {
            const existingApplication = await pool.query(
                'SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2',
                [job_id, candidate_id]
            );

            if (existingApplication.rows.length > 0) {
                throw new Error('You have already applied to this job');
            }

            const result = await pool.query(
                `INSERT INTO applications (job_id, candidate_id, cover_letter, resume_url, resume_name, status) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [job_id, candidate_id, cover_letter, resume_url, resume_name, this.ALLOWED_STATUSES.PENDING]
            );

            return this._validateResultExists(result, 'Application');
        } catch (error) {
            throw new Error(`Submit application failed: ${error.message}`);
        }
    }

    static async getCandidateApplications(candidate_id) {
        try {
            const result = await pool.query(
                `SELECT a.*, j.title as job_title, j.company, j.location 
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.id
                 WHERE a.candidate_id = $1
                 ORDER BY a.applied_at DESC`,
                [candidate_id]
            );

            return this._validateResultsExist(result, 'Applications');
        } catch (error) {
            throw new Error(`Get candidate applications failed: ${error.message}`);
        }
    }

    static async getJobApplications(job_id, recruiter_id) {
        try {
            const jobResult = await pool.query(
                'SELECT recruiter_id FROM jobs WHERE id = $1',
                [job_id]
            );

            const job = this._validateResultExists(jobResult, 'Job');
            
            if (job.recruiter_id !== recruiter_id) {
                throw new Error('Access denied. You are not the job owner');
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
        } catch (error) {
            throw new Error(`Get job applications failed: ${error.message}`);
        }
    }

    static async updateApplicationStatus(application_id, status, notes, reviewed_by) {
        try {
            this._validateStatus(status);

            const result = await pool.query(
                `UPDATE applications 
                 SET status = $1, notes = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP 
                 WHERE id = $4 
                 RETURNING *`,
                [status, notes, reviewed_by, application_id]
            );

            return this._validateResultExists(result, 'Application');
        } catch (error) {
            throw new Error(`Update application status failed: ${error.message}`);
        }
    }

    static async getApplicationById(application_id) {
        try {
            const result = await pool.query(
                `SELECT a.*, j.title as job_title, u.name as candidate_name
                 FROM applications a
                 JOIN jobs j ON a.job_id = j.id
                 JOIN users u ON a.candidate_id = u.id
                 WHERE a.id = $1`,
                [application_id]
            );

            return this._validateResultExists(result, 'Application');
        } catch (error) {
            throw new Error(`Get application by ID failed: ${error.message}`);
        }
    }
}

module.exports = ApplicationService;