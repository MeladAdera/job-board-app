/**
 * 🎯 AUTHENTICATION CONTROLLER
 * Handles user registration, login, and profile management
 * Uses JWT for token-based authentication and bcrypt for password hashing
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const pool = require('../config/database');
const { 
  UnauthorizedError, 
  ValidationError,
  NotFoundError 
} = require('../utils/errors/AppError');
const { sendSuccessResponse } = require('../utils/responseHelper');

/**
 * 🔐 REGISTER NEW USER
 * Creates new user account with hashed password and returns JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ValidationError('All fields (name, email, password) are required');
  }

  // Check if user already exists in database
  const userExists = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (userExists.rows.length > 0) {
    throw new ValidationError('Email is already registered');
  }

  // Hash password with bcrypt (10 salt rounds for security)
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insert new user into database
  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashedPassword, role || 'candidate'] // Default role: candidate
  );

  const user = result.rows[0];

  // Generate JWT token with user data
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' } // Default expiry: 7 days
  );

  sendSuccessResponse(res, {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }, 'Account created successfully', 201);
});

/**
 * 🔐 USER LOGIN
 * Authenticates user credentials and returns JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  // Find user by email
  const result = await pool.query(
    'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const user = result.rows[0];

  // Compare provided password with stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate JWT token for authenticated session
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  sendSuccessResponse(res, {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }, 'Login successful');
});

/**
 * 👤 GET CURRENT USER PROFILE
 * Returns authenticated user's profile data from JWT token
 * @param {Object} req - Express request object (with user data from middleware)
 * @param {Object} res - Express response object
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by authentication middleware
  if (!req.user) {
    throw new NotFoundError('User data not found');
  }

  sendSuccessResponse(res, {
    user: req.user
  }, 'User profile retrieved successfully');
});

module.exports = {
  register,
  login,
  getMe
};