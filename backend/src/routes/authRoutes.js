// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe
} = require('../controllers/authController');
const {
  validateRegistration,
  validateLogin,
  handleValidationErrors
} = require('../validation/authValidation');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post(
  '/register',
  validateRegistration,
  handleValidationErrors,
  register
);

// Login
router.post(
  '/login', 
  validateLogin,
  handleValidationErrors,
  login
);

// Get current user data
router.get('/me', authenticateToken, getMe);

module.exports = router;