/**
 * 🎯 INPUT VALIDATION CONFIGURATION
 * Implements declarative validation rules using express-validator
 * Provides schema-based validation with custom error messages and sanitization
 */

const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { ValidationError } = require('../utils/errors/AppError');

/**
 * USER REGISTRATION VALIDATION RULES
 * Implements comprehensive user input validation with security considerations
 * Uses chainable validation methods with custom error messaging
 */
const validateRegistration = [
  // Name validation - prevents empty and boundary overflow
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  // Email validation with normalization
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(), // Sanitization: lowercases and trims email
  
  // Password validation with security requirements
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  // Role validation with allowed values
  body('role')
    .isIn(['candidate', 'recruiter'])
    .withMessage('Role must be either candidate or recruiter')
];

/**
 * USER LOGIN VALIDATION RULES  
 * Implements minimal validation for authentication endpoints
 * Focuses on essential credential validation without over-constraining
 */
const validateLogin = [
  // Email validation for login
  body('email')
    .isEmail()
    .withMessage('Invalid email address')
    .normalizeEmail(),
  
  // Password presence check
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * VALIDATION ERROR HANDLING MIDDLEWARE
 * Implements centralized validation error processing with structured responses
 * Transforms express-validator results into application-specific error format
 */
const handleValidationErrors = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  
  // Check if validation produced any errors
  if (!errors.isEmpty()) {
    // Transform validation errors into structured format
    const errorMessages = errors.array().map(error => ({
      field: error.param,      // Field name that failed validation
      message: error.msg       // Custom error message from validation rule
    }));
    
    // Throw structured validation error for consistent error handling
    throw new ValidationError('Input validation failed', errorMessages);
  }
  
  // Proceed to next middleware if validation passes
  next();
});

module.exports = {
  validateRegistration,
  validateLogin,
  handleValidationErrors
};