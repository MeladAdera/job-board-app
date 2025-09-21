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
      }
    }
  });
});

// Use Routes
app.use('/api/auth', authRoutes);

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