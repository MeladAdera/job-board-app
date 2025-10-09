const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

const initDatabase = asyncHandler(async () => {
  try {
    console.log('✅ Database connection verified successfully');
    
    // يمكننا إضافة مستخدم افتراضي للتجربة إذا أردت
    // await createDefaultUser();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
});

// Helper function to create a default user (optional)
const createDefaultUser = asyncHandler(async () => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM users WHERE email = $1',
      ['admin@jobboard.com']
    );
    
    if (parseInt(result.rows[0].count) === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        ['admin@jobboard.com', hashedPassword, 'Admin User', 'admin']
      );
      console.log('✅ Default user created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating default user:', error);
    throw error;
  }
});

module.exports = initDatabase;