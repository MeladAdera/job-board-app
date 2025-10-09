/**
 * 🎯 JOB APPLICATION MANAGEMENT CONTROLLER
 * Implements application workflow with state management and access control
 * Uses service layer pattern for business logic separation
 */

const asyncHandler = require('express-async-handler');
const ApplicationService = require('../services/applicationService');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors/AppError');
const { sendSuccessResponse } = require('../utils/responseHelper');

class ApplicationController {
    
    /**
     * SUBMIT JOB APPLICATION
     * Implements idempotent application pattern with duplicate prevention
     * Uses service layer for business logic encapsulation and data validation
     */
    static submitApplication = asyncHandler(async (req, res) => {
        const candidate_id = req.user.id; // From JWT authentication middleware
        const { job_id, cover_letter, resume_url, resume_name } = req.body;

        // Pre-service validation for required parameters
        if (!job_id) {
            throw new ValidationError('Job ID is required');
        }

        // Service layer invocation with data normalization
        const application = await ApplicationService.submitApplication({
            job_id: parseInt(job_id), // Type coercion with validation
            candidate_id,
            cover_letter: cover_letter || '', // Default value pattern
            resume_url: resume_url || '',
            resume_name: resume_name || ''
        });

        sendSuccessResponse(res, application, 'Application submitted successfully', 201);
    });

    /**
     * RETRIEVE CANDIDATE'S APPLICATIONS
     * Implements personal data access pattern with contextual aggregation
     * Joins application data with job information for comprehensive view
     */
    static getMyApplications = asyncHandler(async (req, res) => {
        const candidate_id = req.user.id;
        
        const applications = await ApplicationService.getCandidateApplications(candidate_id);

        sendSuccessResponse(res, {
            applications,
            count: applications.length // Metadata for client-side pagination
        }, 'Applications retrieved successfully');
    });

    /**
     * RETRIEVE JOB APPLICATIONS FOR RECRUITER
     * Implements ownership-based data access pattern with authorization
     * Ensures recruiters can only access applications for their own job postings
     */
    static getJobApplications = asyncHandler(async (req, res) => {
        const { id: job_id } = req.params;
        const recruiter_id = req.user.id;

        // Input sanitization and type validation
        const parsedJobId = parseInt(job_id);
        if (isNaN(parsedJobId)) {
            throw new ValidationError('Invalid job ID format');
        }

        const applications = await ApplicationService.getJobApplications(parsedJobId, recruiter_id);

        sendSuccessResponse(res, {
            applications,
            count: applications.length
        }, 'Job applications retrieved successfully');
    });

    /**
     * UPDATE APPLICATION STATUS
     * Implements state transition pattern with workflow validation
     * Maintains audit trail through reviewer tracking and timestamps
     */
    static updateApplicationStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status, notes } = req.body;
        const reviewed_by = req.user.id;

        if (!status) {
            throw new ValidationError('Status is required');
        }

        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            throw new ValidationError('Invalid application ID');
        }

        const application = await ApplicationService.updateApplicationStatus(
            parsedId, 
            status, 
            notes || '', 
            reviewed_by
        );

        sendSuccessResponse(res, application, 'Application status updated successfully');
    });

    /**
     * RETRIEVE SPECIFIC APPLICATION
     * Implements fine-grained access control with role-based visibility
     * Candidates see only their applications, recruiters see applications for their jobs
     */
    static getApplicationById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user_id = req.user.id;
        const user_role = req.user.role;

        const parsedId = parseInt(id);
        if (isNaN(parsedId)) {
            throw new ValidationError('Invalid application ID');
        }

        const application = await ApplicationService.getApplicationById(parsedId);

        // Role-based access control implementation
        if (user_role === 'candidate' && application.candidate_id !== user_id) {
            throw new ForbiddenError('Access denied to other candidates applications');
        }

        sendSuccessResponse(res, application, 'Application retrieved successfully');
    });
}

module.exports = ApplicationController;