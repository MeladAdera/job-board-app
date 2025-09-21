//backend/src/models/initDB.js
const pool = require('../config/database');

const initDatabase = async () => {
  try {
    // يمكننا هنا إضافة أي بيانات أولية إذا needed
    console.log('تم التحقق من اتصال قاعدة البيانات بنجاح');
    
    // يمكننا إضافة مستخدم افتراضي إذا needed للتجربة
    // await createDefaultUser();
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
  }
};

// دالة مساعدة لإنشاء مستخدم افتراضي (اختياري)
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
      console.log('تم إنشاء المستخدم الافتراضي');
    }
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم الافتراضي:', error);
  }
};

module.exports = initDatabase;