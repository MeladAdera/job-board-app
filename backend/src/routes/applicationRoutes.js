//backend/src/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/applicationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 🎯 جميع مسارات التقديمات تتطلب مصادقة
router.use(authenticateToken);

// 🎯 مسار تقديم طلب جديد (للمرشحين فقط)
router.post('/', 
    authorizeRoles('candidate'), 
    ApplicationController.submitApplication
);

// 🎯 مسار الحصول على تقديماتي (للمرشحين فقط)
router.get('/my', 
    authorizeRoles('candidate'), 
    ApplicationController.getMyApplications
);

// 🎯 مسار الحصول على متقدمي وظيفة (للمسؤولين فقط)
router.get('/job/:id', 
    authorizeRoles('recruiter', 'admin'), 
    ApplicationController.getJobApplications
);

// 🎯 مسار تحديث حالة التقديم (للمسؤولين فقط)
router.put('/:id/status', 
    authorizeRoles('recruiter', 'admin'), 
    ApplicationController.updateApplicationStatus
);

// 🎯 مسار الحصول على تقديم محدد (للجميع مع تحقق الصلاحيات)
router.get('/:id', 
    ApplicationController.getApplicationById
);

module.exports = router;