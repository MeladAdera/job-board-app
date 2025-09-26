const ApplicationService = require('../services/applicationService');

class ApplicationController {
    
    static async submitApplication(req, res) {
        try {
            const candidate_id = req.user.id;
            const { job_id, cover_letter, resume_url, resume_name } = req.body;

            if (!job_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Job ID is required'
                });
            }

            const application = await ApplicationService.submitApplication({
                job_id: parseInt(job_id),
                candidate_id,
                cover_letter: cover_letter || '',
                resume_url: resume_url || '',
                resume_name: resume_name || ''
            });

            res.status(201).json({
                success: true,
                message: 'Application submitted successfully',
                data: application
            });

        } catch (error) {
            if (error.message.includes('already applied')) {
                return res.status(400).json({
                    success: false,
                    error: 'You have already applied to this job'
                });
            }

            console.error('Application submission error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    static async getMyApplications(req, res) {
        try {
            const candidate_id = req.user.id;
            
            const applications = await ApplicationService.getCandidateApplications(candidate_id);

            res.json({
                success: true,
                data: applications,
                count: applications.length
            });

        } catch (error) {
            console.error('Get my applications error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve applications'
            });
        }
    }

    static async getJobApplications(req, res) {
        try {
            const { id: job_id } = req.params;
            const recruiter_id = req.user.id;

            const parsedJobId = parseInt(job_id);
            if (isNaN(parsedJobId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid job ID format'
                });
            }

            const applications = await ApplicationService.getJobApplications(parsedJobId, recruiter_id);

            res.json({
                success: true,
                data: applications,
                count: applications.length
            });

        } catch (error) {
            let statusCode = 500;
            let errorMessage = 'Failed to retrieve job applications';

            if (error.message.includes('Access denied')) {
                statusCode = 403;
                errorMessage = 'You do not have permission to view these applications';
            }

            console.error('Get job applications error:', error);
            res.status(statusCode).json({
                success: false,
                error: errorMessage
            });
        }
    }

    static async updateApplicationStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const reviewed_by = req.user.id;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: 'Status is required'
                });
            }

            const parsedId = parseInt(id);
            if (isNaN(parsedId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid application ID'
                });
            }

            const application = await ApplicationService.updateApplicationStatus(
                parsedId, 
                status, 
                notes || '', 
                reviewed_by
            );

            res.json({
                success: true,
                message: 'Application status updated successfully',
                data: application
            });

        } catch (error) {
            console.error('Update application status error:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getApplicationById(req, res) {
        try {
            const { id } = req.params;
            const user_id = req.user.id;
            const user_role = req.user.role;

            const parsedId = parseInt(id);
            if (isNaN(parsedId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid application ID'
                });
            }

            const application = await ApplicationService.getApplicationById(parsedId);

            if (user_role === 'candidate' && application.candidate_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    error: 'Access denied. You can only view your own applications'
                });
            }

            res.json({
                success: true,
                data: application
            });

        } catch (error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({
                    success: false,
                    error: 'Application not found'
                });
            }

            console.error('Get application by ID error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve application'
            });
        }
    }
}

module.exports = ApplicationController;