const FileStorageService = require('../services/fileStorageService');
const pool = require('../config/database');

class UploadController {
  
  static async uploadResume(req, res) {
    try {
      console.log('🔍 Starting file upload process...');
      console.log('User:', req.user);
      console.log('File received:', req.file);

      if (!req.file) {
        console.log('❌ No file received');
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const user_id = req.user.id;
      const file = req.file;

      console.log('📁 Calling Service to save file...');
      const fileInfo = await FileStorageService.saveResume(file, user_id);

      console.log('💾 Updating database...');
      await pool.query(
        'UPDATE users SET resume_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [fileInfo.fileUrl, user_id]
      );

      console.log('✅ File uploaded successfully');
      res.status(201).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: fileInfo
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      
      if (error.message.includes('File type not allowed')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('already exists')) {
        return res.status(400).json({
          success: false,
          error: 'You already have a resume uploaded'
        });
      }

      res.status(500).json({
        success: false,
        error: 'File upload failed'
      });
    }
  }

  static async getMyResume(req, res) {
    try {
      const user_id = req.user.id;

      const result = await pool.query(
        'SELECT resume_url FROM users WHERE id = $1',
        [user_id]
      );

      if (!result.rows[0].resume_url) {
        return res.status(404).json({
          success: false,
          error: 'No resume found'
        });
      }

      res.json({
        success: true,
        data: {
          resume_url: result.rows[0].resume_url
        }
      });

    } catch (error) {
      console.error('Get resume error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get resume data'
      });
    }
  }

  static async deleteResume(req, res) {
    try {
      const user_id = req.user.id;

      const userResult = await pool.query(
        'SELECT resume_url FROM users WHERE id = $1',
        [user_id]
      );

      if (!userResult.rows[0].resume_url) {
        return res.status(404).json({
          success: false,
          error: 'No resume found'
        });
      }

      await FileStorageService.deleteResume(userResult.rows[0].resume_url, user_id);

      await pool.query(
        'UPDATE users SET resume_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [user_id]
      );

      res.json({
        success: true,
        message: 'Resume deleted successfully'
      });

    } catch (error) {
      console.error('Delete resume error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete resume'
      });
    }
  }
}

module.exports = UploadController;