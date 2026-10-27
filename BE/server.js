const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware order is important!
// 1. CORS must come first - Allow localhost, configured FRONTEND_URL, and any *.vercel.app deployment
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 3. Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`\n${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Content-Type:', req.headers['content-type']);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  } else {
    console.log('Body: EMPTY');
  }
  next();
});

// 4. Error handling for JSON parse errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err);
    return res.status(400).json({ 
      message: 'Invalid JSON format',
      error: err.message 
    });
  }
  next(err);
});

// Connect to MongoDB (handles both standard server and serverless environments)
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/asg_sdn', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};
connectDB();

// Import models to ensure they are registered with Mongoose
require('./models/User');
require('./models/Brand');
require('./models/Perfume');
require('./models/Feedback');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/perfumes', require('./routes/perfumes'));
app.use('/api/users', require('./routes/users'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Test endpoint - no auth required
app.get('/api/test', (req, res) => {
  console.log('✓ Test endpoint accessed');
  res.json({ message: 'Backend is working!' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('\n=== GLOBAL ERROR HANDLER ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Start server locally (on Vercel, the app is exported as a serverless function)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;