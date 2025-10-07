//backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const testConnection = require('./src/utils/testDB');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Routes
app.get('/', (req, res) => {
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
});

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', require('./src/routes/jobRoutes'));

app.use('/api/applications', require('./src/routes/applicationRoutes'));
app.use('/api/upload', require('./src/routes/uploadRoutes'));
// Start Server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    app.listen(PORT, () => {
      console.log(`✅ Server is running on: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();