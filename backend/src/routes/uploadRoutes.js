//backend/src/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticateToken);

router.post('/resume', 
  upload.single('resume'),
  UploadController.uploadResume
);

router.get('/resume', 
  UploadController.getMyResume
);

router.delete('/resume', 
  UploadController.deleteResume
);

module.exports = router;