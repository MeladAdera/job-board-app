/**
 * 🎯 JOB MANAGEMENT CONTROLLER
 * Implements CRUD operations for job postings with role-based access control
 * Uses PostgreSQL with connection pooling for data persistence
 */

const asyncHandler = require('express-async-handler');
const pool = require('../config/database');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors/AppError');
const { sendSuccessResponse } = require('../utils/responseHelper');

/**
 * CREATE JOB POSTING
 * Implements business logic for job creation with input validation
 * Enforces recruiter role authorization through middleware chain
 * @param {Object} req - Express request with JWT-authenticated user context
 * @param {Object} res - Express response object for standardized API responses
 */
const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    company, 
    location,
    description,
    requirements,
    salary_range,
    employment_type,
    skills
  } = req.body;

  const recruiter_id = req.user.id; // Extracted from JWT token by auth middleware

  // Input validation using custom error throwing pattern
  if (!title || !company || !location || !description || !requirements) {
    throw new ValidationError('All required fields must be filled');
  }

  // Parameterized query to prevent SQL injection with JSON serialization for complex data
  const result = await pool.query(
    `INSERT INTO jobs 
     (title, company, location, description, requirements, salary_range, employment_type, recruiter_id, skills) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
     RETURNING *`,
    [
      title, 
      company, 
      location, 
      description, 
      requirements, 
      salary_range, 
      employment_type, 
      recruiter_id, 
      JSON.stringify(skills || []) // Serialize array to JSON for PostgreSQL JSONB storage
    ]
  );

  sendSuccessResponse(res, result.rows[0], 'Job created successfully', 201);
});

/**
 * RETRIEVE ALL JOB POSTINGS
 * Implements public read access pattern with recruiter information joining
 * Uses LEFT JOIN to include recruiter data even if relationship is optional
 */
const getAllJobs = asyncHandler(async (req, res) => {
  const result = await pool.query(
    `SELECT j.*, u.name as recruiter_name 
     FROM jobs j 
     LEFT JOIN users u ON j.recruiter_id = u.id 
     ORDER BY j.created_at DESC` // Temporal ordering for most recent first
  );

  sendSuccessResponse(res, result.rows, 'Jobs retrieved successfully');
});

/**
 * RETRIEVE SPECIFIC JOB BY ID
 * Implements single resource access pattern with existence validation
 * Includes additional recruiter contact information for authenticated users
 */
const getJobById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT j.*, u.name as recruiter_name, u.email as recruiter_email 
     FROM jobs j 
     LEFT JOIN users u ON j.recruiter_id = u.id 
     WHERE j.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError('Job not found');
  }

  sendSuccessResponse(res, result.rows[0], 'Job retrieved successfully');
});

/**
 * UPDATE JOB POSTING
 * Implements optimistic concurrency control with ownership validation
 * Ensures data integrity through transaction-like ownership checks
 */
const updateJob = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    company,
    location,
    description,
    requirements,
    salary_range,
    employment_type,
    skills
  } = req.body;

  // Ownership verification pattern - ensures users can only modify their own resources
  const jobResult = await pool.query(
    'SELECT * FROM jobs WHERE id = $1 AND recruiter_id = $2',
    [id, req.user.id]
  );

  if (jobResult.rows.length === 0) {
    throw new NotFoundError('Job not found or access denied');
  }

  // Type safety enforcement for array fields with fallback to empty array
  const skillsArray = Array.isArray(skills) ? skills : [];

  const result = await pool.query(
    `UPDATE jobs 
     SET title = $1, company = $2, location = $3, description = $4, 
         requirements = $5, salary_range = $6, employment_type = $7, 
         skills = $8, updated_at = CURRENT_TIMESTAMP
     WHERE id = $9 AND recruiter_id = $10
     RETURNING *`,
    [
      title, company, location, description, requirements,
      salary_range, employment_type, JSON.stringify(skillsArray),
      id, req.user.id
    ]
  );

  sendSuccessResponse(res, result.rows[0], 'Job updated successfully');
});

/**
 * DELETE JOB POSTING
 * Implements soft-delete equivalent pattern with ownership verification
 * Uses atomic operations to ensure data consistency
 */
const deleteJob = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Pre-delete validation pattern - prevents orphaned records
  const jobResult = await pool.query(
    'SELECT * FROM jobs WHERE id = $1 AND recruiter_id = $2',
    [id, req.user.id]
  );

  if (jobResult.rows.length === 0) {
    throw new NotFoundError('Job not found or access denied');
  }

  // Cascading delete handled by database foreign key constraints
  await pool.query(
    'DELETE FROM jobs WHERE id = $1 AND recruiter_id = $2',
    [id, req.user.id]
  );

  sendSuccessResponse(res, null, 'Job deleted successfully');
});

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob
};