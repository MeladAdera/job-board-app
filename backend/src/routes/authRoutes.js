//backend/src/routes/authRoutes.js
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

// تسجيل مستخدم جديد
router.post(
  '/register',
  validateRegistration,
  handleValidationErrors,
  register
);

// تسجيل الدخول
router.post(
  '/login', 
  validateLogin,
  handleValidationErrors,
  login
);

// الحصول على بيانات المستخدم الحالي
router.get('/me', authenticateToken, getMe);

module.exports = router;