const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', chatRoutes);
app.use('/api/admin', adminRoutes);

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Backend is running',
    apiKeys: {
      GROQ_API_KEY: process.env.GROQ_API_KEY ? '✅ Configured' : '❌ Missing',
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? '✅ Configured' : '❌ Missing',
      GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? '✅ Configured' : '❌ Missing'
    },
    uploads: {
      directory: 'src/uploads',
      exists: require('fs').existsSync('src/uploads')
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CodeTribe LMS Backend API',
    version: '1.0.0',
    endpoints: {
      chat: 'POST /api/chat',
      upload: 'POST /api/admin/upload',
      files: 'GET /api/admin/files',
      status: 'GET /api/status'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CodeTribe Backend running on port ${PORT}`));


