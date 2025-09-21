const express = require('express');
const router = express.Router();
const { createJob, getAllJobs } = require('../controllers/jobController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Create job (recruiters only)
router.post('/', authorizeRoles('recruiter', 'admin'), createJob);

// Get all jobs (accessible to everyone)
router.get('/', getAllJobs);

module.exports = router;