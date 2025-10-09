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
  validateRegistration,  // ✅ تفعيل التحقق
  handleValidationErrors, // ✅ تفعيل معالجة أخطاء التحقق
  register
);

// Login
router.post(
  '/login', 
  validateLogin,        // ✅ تفعيل التحقق
  handleValidationErrors, // ✅ تفعيل معالجة أخطاء التحقق
  login
);

// Get current user data
router.get('/me', authenticateToken, getMe);

module.exports = router;