/**
 * 🎯 MULTER FILE UPLOAD CONFIGURATION
 * Configures Multer for secure file uploads with validation and storage management
 * Implements disk storage with user-specific file naming and type filtering
 */

const multer = require('multer');
const path = require('path');
const { ValidationError } = require('../utils/errors/AppError');

/**
 * DISK STORAGE CONFIGURATION
 * Uses disk storage for persistent file handling with user-specific organization
 * Implements deterministic file naming for easy management and cleanup
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
    // Directory creation handled by FileStorageService for atomic operations
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const user_id = req.user.id; // From authenticated request context
    const fileExtension = path.extname(file.originalname).toLowerCase();
    // Unique filename pattern: resume_{user_id}_{timestamp}{extension}
    const fileName = `resume_${user_id}_${Date.now()}${fileExtension}`;
    cb(null, fileName);
  }
});

/**
 * FILE TYPE VALIDATION
 * Implements whitelist approach for allowed file types
 * Prevents malicious file uploads through extension validation
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new ValidationError('File type not supported. Please upload PDF, Word, or Text files'), false);
  }
};

/**
 * MULTER MIDDLEWARE INSTANCE
 * Configured with storage engine, file filtering, and size limits
 * Provides secure file upload handling for resume documents
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB size limit to prevent resource exhaustion
  }
});

module.exports = upload;