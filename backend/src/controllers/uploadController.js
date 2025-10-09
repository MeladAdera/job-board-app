/**
 * 🎯 FILE UPLOAD MANAGEMENT CONTROLLER
 * Implements secure file handling with validation, storage, and user association
 * Uses Multer for multipart form handling and custom file storage service
 */

const asyncHandler = require('express-async-handler');
const FileStorageService = require('../services/FileStorageService');
const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const { ValidationError, NotFoundError } = require('../utils/errors/AppError');
const { sendSuccessResponse } = require('../utils/responseHelper');

class UploadController {
  
  /**
   * UPLOAD RESUME FILE
   * Implements file upload pipeline with validation, processing, and user association
   * Uses atomic operations to maintain data consistency between file system and database
   */
  static uploadResume = asyncHandler(async (req, res) => {
    console.log('🔍 Starting upload process...');
    
    // Multer file existence validation
    if (!req.file) {
      throw new ValidationError('No file uploaded');
    }

    // File content validation - prevent empty file uploads
    if (req.file.size === 0) {
      await fs.unlink(req.file.path).catch(() => {}); // Cleanup temporary file
      throw new ValidationError('File is empty');
    }

    const user_id = req.user.id;
    const file = req.file;

    console.log('📄 Processing file:', file.originalname, 'Size:', file.size);

    // Delegate file storage logic to service layer
    const fileInfo = await FileStorageService.saveResume(file, user_id);

    // Atomic update of user record with resume URL
    await pool.query(
      'UPDATE users SET resume_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [fileInfo.fileUrl, user_id]
    );

    console.log('✅ Upload completed successfully');

    sendSuccessResponse(res, fileInfo, 'Resume uploaded successfully', 201);
  });

  /**
   * RETRIEVE USER'S RESUME INFORMATION
   * Implements file metadata retrieval with existence validation
   * Maintains data integrity by verifying both database record and physical file
   */
  static getMyResume = asyncHandler(async (req, res) => {
    const user_id = req.user.id;

    // Database record retrieval
    const result = await pool.query(
      'SELECT resume_url FROM users WHERE id = $1',
      [user_id]
    );

    if (!result.rows[0] || !result.rows[0].resume_url) {
      throw new NotFoundError('No resume uploaded');
    }

    // Physical file existence verification
    const filePath = path.join(__dirname, '..', '..', result.rows[0].resume_url);
    try {
      await fs.access(filePath); // Check if file actually exists on filesystem
    } catch (error) {
      // Auto-cleanup orphaned database records
      await pool.query(
        'UPDATE users SET resume_url = NULL WHERE id = $1',
        [user_id]
      );
      
      throw new NotFoundError('File not found on server');
    }

    sendSuccessResponse(res, {
      resume_url: result.rows[0].resume_url
    }, 'Resume information retrieved successfully');
  });

  /**
   * DELETE USER'S RESUME
   * Implements cascading deletion pattern across file system and database
   * Uses transaction-like cleanup to maintain system consistency
   */
  static deleteResume = asyncHandler(async (req, res) => {
    const user_id = req.user.id;

    const userResult = await pool.query(
      'SELECT resume_url FROM users WHERE id = $1',
      [user_id]
    );

    if (!userResult.rows[0] || !userResult.rows[0].resume_url) {
      throw new NotFoundError('No resume uploaded');
    }

    const resumeUrl = userResult.rows[0].resume_url;
    
    // File system cleanup through service layer
    await FileStorageService.deleteResume(resumeUrl, user_id);

    // Database record cleanup
    await pool.query(
      'UPDATE users SET resume_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user_id]
    );

    sendSuccessResponse(res, null, 'Resume deleted successfully');
  });
}

module.exports = UploadController;