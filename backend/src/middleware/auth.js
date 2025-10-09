/**
 * 🎯 AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * Implements JWT-based authentication and role-based access control
 * Provides security layers for API endpoint protection
 */

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors/AppError');

/**
 * JWT TOKEN VERIFICATION MIDDLEWARE
 * Implements Bearer token authentication with database validation
 * Provides request context enrichment with authenticated user data
 */
const authenticateToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract Bearer token

  if (!token) {
    throw new UnauthorizedError('Access token required');
  }

  // JWT verification with secret key
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // Database validation - ensure user still exists and is active
  const userResult = await pool.query(
    'SELECT id, email, name, role FROM users WHERE id = $1',
    [decoded.userId]
  );

  if (userResult.rows.length === 0) {
    throw new UnauthorizedError('User not found');
  }

  // Enrich request context with user data for downstream middleware
  req.user = userResult.rows[0];
  next();
});

/**
 * ROLE-BASED AUTHORIZATION MIDDLEWARE
 * Implements flexible role checking with variadic parameters
 * Uses higher-order function pattern for middleware composition
 */
const authorizeRoles = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions to access this resource');
    }
    next();
  });
};

module.exports = { authenticateToken, authorizeRoles };