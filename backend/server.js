// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const asyncHandler = require('express-async-handler'); 

const testConnection = require('./src/utils/testDB');
const { NotFoundError } = require('./src/utils/errors/AppError');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route مع asyncHandler
app.get('/', asyncHandler(async (req, res) => {
  res.json({ 
    message: 'Welcome! Job Board Server is running successfully',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login', 
        getMe: 'GET /api/auth/me'
      },
      jobs: {
        getAll: 'GET /api/jobs',
        getOne: 'GET /api/jobs/:id',
        create: 'POST /api/jobs',
        update: 'PUT /api/jobs/:id', 
        delete: 'DELETE /api/jobs/:id'
      },
      applications: {
        submit: 'POST /api/applications',
        getMy: 'GET /api/applications/my',
        getJobApps: 'GET /api/applications/job/:id',
        updateStatus: 'PUT /api/applications/:id/status',
        getOne: 'GET /api/applications/:id'
      },
      upload: {
        uploadResume: 'POST /api/upload/resume',
        getResume: 'GET /api/upload/resume', 
        deleteResume: 'DELETE /api/upload/resume'
      }
    }
  });
}));

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/upload', uploadRoutes);

// 🔹 معالج 404 - لم يتم العثور على Route
app.use('*', asyncHandler(async (req, res) => {
  throw new NotFoundError(`Route not found: ${req.originalUrl}`);
}));

// 🔹 معالج الأخطاء العام (يجب أن يكون الأخير)
app.use((error, req, res, next) => {
  console.error('🚨 Error Handler:', error);

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    error: error.name || 'ServerError',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      path: req.path 
    })
  });
});

// Start Server
const startServer = async () => {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    app.listen(PORT, () => {
      console.log(`✅ Server is running on: http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();