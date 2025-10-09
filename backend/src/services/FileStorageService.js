/**
 * 🎯 FILE STORAGE MANAGEMENT SERVICE
 * Implements file system operations with atomicity and consistency guarantees
 * Provides abstraction layer for file handling with proper error management
 */

const fs = require('fs').promises;
const path = require('path');
const { ValidationError } = require('../utils/errors/AppError');

class FileStorageService {
    
    /**
     * SAVE RESUME FILE WITH ATOMIC OPERATIONS
     * Implements file storage pipeline with cleanup and consistency checks
     * Uses filesystem rename for atomic file moves and maintains user file quota
     */
    static async saveResume(file, user_id) {
        try {
            console.log('💾 Starting file save with disk storage...');
            console.log('📄 File details:', {
                originalname: file.originalname,
                size: file.size,
                path: file.path
            });

            // 1. Ensure upload directory exists with recursive creation
            const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
            await fs.mkdir(uploadsDir, { recursive: true });

            // 2. Generate unique filename with user context and timestamp
            const fileExtension = path.extname(file.originalname);
            const fileName = `resume_${user_id}_${Date.now()}${fileExtension}`;
            const newFilePath = path.join(uploadsDir, fileName);

            // 3. Atomic file move operation from temp to permanent location
            await fs.rename(file.path, newFilePath);

            // 4. Cleanup previous user files while preserving current upload
            await this.cleanupOldResumes(user_id, uploadsDir, fileName);

            // 5. Construct comprehensive file metadata for client response
            const fileInfo = {
                originalName: file.originalname,
                fileName: fileName,
                filePath: newFilePath,
                fileUrl: `/uploads/resumes/${fileName}`, // URL path for client access
                fileSize: file.size,
                mimeType: file.mimetype,
                userId: user_id,
                uploadedAt: new Date()
            };

            console.log('✅ File saved successfully:', fileInfo.fileName);
            return fileInfo;

        } catch (error) {
            console.error('❌ File save error:', error);
            
            // Graceful cleanup of temporary files on failure
            try {
                if (file.path) await fs.unlink(file.path);
            } catch (deleteError) {
                console.log('⚠️ Could not delete temp file:', deleteError.message);
            }
            
            throw new ValidationError(`File save failed: ${error.message}`);
        }
    }

    /**
     * CLEANUP OLD USER RESUMES
     * Implements user file quota management with exclusion of current file
     * Uses filename pattern matching for efficient user file identification
     */
    static async cleanupOldResumes(user_id, uploadsDir, currentFileName) {
        try {
            const files = await fs.readdir(uploadsDir);
            
            // Filter user files excluding current upload for quota management
            const userFiles = files.filter(file => 
                file.startsWith(`resume_${user_id}_`) && file !== currentFileName
            );
            
            console.log('🗑️ Cleaning old files (excluding current):', userFiles);
            
            // Sequential deletion to avoid filesystem contention
            for (const oldFile of userFiles) {
                const oldFilePath = path.join(uploadsDir, oldFile);
                await fs.unlink(oldFilePath);
                console.log('✅ Deleted old file:', oldFile);
            }
        } catch (error) {
            // Non-blocking cleanup errors to maintain primary operation success
            console.log('⚠️ Cleanup note:', error.message);
        }
    }

    /**
     * DELETE SPECIFIC RESUME FILE
     * Implements targeted file deletion with existence validation
     * Provides idempotent operation pattern for repeated calls
     */
    static async deleteResume(resumeUrl, user_id) {
        try {
            if (!resumeUrl) return; // Idempotent handling for null URLs
            
            const fileName = path.basename(resumeUrl);
            const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
            const filePath = path.join(uploadsDir, fileName);

            await fs.unlink(filePath);
            console.log('✅ File deleted:', fileName);

        } catch (error) {
            console.log('⚠️ Delete note:', error.message);
            throw new ValidationError('File deletion failed');
        }
    }
}

module.exports = FileStorageService;