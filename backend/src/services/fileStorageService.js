const fs = require('fs').promises;
const path = require('path');

class FileStorageService {
  
  static async saveResume(file, user_id) {
    try {
      console.log('🏭 Starting file save in service...');
      
      // 1. Delete old files instead of checking (FIXED)
      await this.deleteExistingResumes(user_id);

      // 2. Ensure directory exists
      const uploadsDir = path.join(__dirname, '../../uploads/resumes');
      await this.ensureDirectoryExists(uploadsDir);

      // 3. Create file info
      const fileInfo = {
        originalName: file.originalname,
        fileName: file.filename,
        filePath: file.path,
        fileUrl: `/uploads/resumes/${file.filename}`,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId: user_id,
        uploadedAt: new Date()
      };

      // 4. Log file upload
      await this.logFileUpload(fileInfo);

      console.log('✅ File info saved:', fileInfo);
      return fileInfo;

    } catch (error) {
      console.error('❌ Failed to save file:', error);
      throw new Error(`File save failed: ${error.message}`);
    }
  }

  static async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
      console.log('📁 Directory exists');
    } catch (error) {
      console.log('📁 Creating new directory:', dirPath);
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  // FIXED: Delete old files instead of throwing error
  static async deleteExistingResumes(user_id) {
    try {
      const uploadsDir = path.join(__dirname, '../../uploads/resumes');
      const files = await fs.readdir(uploadsDir);
      
      const userFiles = files.filter(file => file.includes(`resume_${user_id}_`));
      
      if (userFiles.length > 0) {
        console.log('🔄 Deleting old files:', userFiles);
        
        for (const oldFile of userFiles) {
          const oldFilePath = path.join(uploadsDir, oldFile);
          await fs.unlink(oldFilePath);
          console.log('✅ Deleted old file:', oldFile);
        }
      } else {
        console.log('ℹ️ No old files found for user');
      }
    } catch (error) {
      // Ignore if directory doesn't exist
      if (error.code !== 'ENOENT') {
        console.log('⚠️ Error deleting old files:', error.message);
      }
    }
  }

  static async logFileUpload(fileInfo) {
    console.log('📝 Upload info:', {
      userId: fileInfo.userId,
      fileName: fileInfo.fileName,
      fileSize: fileInfo.fileSize,
      uploadedAt: fileInfo.uploadedAt
    });
  }

  static async deleteResume(resumeUrl, user_id) {
    try {
      console.log('🗑️ Starting file delete:', resumeUrl);
      
      if (!resumeUrl) {
        throw new Error('No file URL provided');
      }

      const fileName = path.basename(resumeUrl);
      const filePath = path.join(__dirname, '../../uploads/resumes', fileName);

      try {
        await fs.access(filePath);
      } catch (error) {
        console.log('⚠️ File not found, may already be deleted');
        return;
      }

      if (!fileName.includes(`resume_${user_id}_`)) {
        throw new Error('Not authorized to delete this file');
      }

      await fs.unlink(filePath);
      console.log('✅ File deleted successfully:', fileName);

    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      throw new Error(`File delete failed: ${error.message}`);
    }
  }

  static async getFileInfo(fileName) {
    try {
      const filePath = path.join(__dirname, '../../uploads/resumes', fileName);
      const stats = await fs.stat(filePath);
      
      return {
        fileName: fileName,
        filePath: filePath,
        fileSize: stats.size,
        modifiedAt: stats.mtime,
        createdAt: stats.birthtime
      };
    } catch (error) {
      throw new Error(`File not found: ${error.message}`);
    }
  }
}

module.exports = FileStorageService;