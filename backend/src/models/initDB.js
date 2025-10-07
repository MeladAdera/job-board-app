//backend/src/models/initDB.js
const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
  try {
    // We can add any initial data here if needed
    console.log('Database connection verified successfully');
    
    // We can add a default user if needed for testing
    // await createDefaultUser();
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

// Helper function to create a default user (optional)
const createDefaultUser = async () => {
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
      console.log('Default user created successfully');
    }
  } catch (error) {
    console.error('Error creating default user:', error);
  }
};

module.exports = initDatabase;