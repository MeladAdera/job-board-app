//backend/src/validation/authValidation.js
const { body, validationResult } = require('express-validator');

// قواعد التحقق من صحة بيانات التسجيل
const validateRegistration = [
  body('name')
    .notEmpty()
    .withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 50 })
    .withMessage('الاسم يجب أن يكون بين 2 و 50 حرفاً'),
  
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('كلمة المرور يجب أن تكون至少 6 أحرف')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('كلمة المرور يجب أن تحتوي على حرف كبير, حرف صغير, ورقم'),
  
  body('role')
    .isIn(['candidate', 'recruiter'])
    .withMessage('الدور يجب أن يكون either candidate or recruiter')
];

// قواعد التحقق من صحة بيانات تسجيل الدخول
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('البريد الإلكتروني غير صالح')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('كلمة المرور مطلوبة')
];

// دالة للتحقق من الأخطاء
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  handleValidationErrors
};