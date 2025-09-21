const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// تسجيل مستخدم جديد
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // التحقق إذا كان المستخدم موجود بالفعل
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني مستخدم already' });
    }

    // تشفير كلمة المرور
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // حفظ المستخدم في قاعدة البيانات
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];

    // إنشاء token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'تم إنشاء الحساب successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};

// تسجيل الدخول
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // البحث عن المستخدم
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const user = result.rows[0];

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // إنشاء token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'تم تسجيل الدخول successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};

// الحصول على بيانات المستخدم الحالي
const getMe = async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('خطأ في جلب بيانات المستخدم:', error);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};

module.exports = {
  register,
  login,
  getMe
};