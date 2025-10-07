const express = require('express');
const router = express.Router();
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// جميع المسارات تتطلب مصادقة
router.use(authenticateToken);

// إنشاء وظيفة (للمسؤولين فقط)
router.post('/', authorizeRoles('recruiter', 'admin'), createJob);

// الحصول على جميع الوظائف (مسموح للجميع)
router.get('/', getAllJobs);

// الحصول على وظيفة محددة (مسموح للجميع)
router.get('/:id', getJobById);

// تحديث وظيفة (للمالك أو المسؤول فقط)
router.put('/:id', authorizeRoles('recruiter', 'admin'), updateJob);

// حذف وظيفة (للمالك أو المسؤول فقط)
router.delete('/:id', authorizeRoles('recruiter', 'admin'), deleteJob);

module.exports = router;