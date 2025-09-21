//backend/src/utils/testDB.js
const pool = require('../config/database');

const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ الاتصال بقاعدة البيانات ناجح:', result.rows[0].current_time);
    
    // اختبار وجود الجداول
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 الجداول الموجودة:');
    tables.rows.forEach(table => {
      console.log('  -', table.table_name);
    });
    
    return true;
  } catch (error) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', error.message);
    return false;
  }
};

module.exports = testConnection;