require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const receptionistRoutes = require('./routes/receptionistRoutes');
const patientRoutes = require('./routes/patientRoutes');

// Import middleware
const { handleValidationErrors, errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// ============================================
// Security Middleware
// ============================================

// Set security HTTP headers
app.use(helmet());

// Enable CORS with options
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// ============================================
// Body Parser Middleware
// ============================================

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// Database Connection
// ============================================

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management';
    
    const conn = await mongoose.connect(mongoUri, {
      // Mongoose 6+ connection options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('   1. Check your MongoDB URI in .env file');
    console.error('   2. Ensure your IP address is whitelisted in MongoDB Atlas');
    console.error('   3. Verify your database username and password');
    console.error('   4. Check your network connection\n');
    process.exit(1);
  }
};

// ============================================
// API Routes
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hospital Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger API Documentation
try {
  const setupSwagger = require('./utils/swagger');
  setupSwagger(app);
  console.log('✅ Swagger documentation available at /api-docs');
} catch (error) {
  console.log('⚠️  Swagger not available (install swagger-jsdoc and swagger-ui-express for docs)');
}

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/patient', patientRoutes);

// ============================================
// Error Handling Middleware
// ============================================

// Handle validation errors
app.use(handleValidationErrors);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// Server Start
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to database
  await connectDB();

  // Start server
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥 Hospital Management System API                       ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║                                                           ║
║   API Documentation: http://localhost:${PORT}/api-docs      ║
║                                                           ║
║   API Endpoints:                                          ║
║   - Auth:         /api/auth/*                             ║
║   - Admin:        /api/admin/*                            ║
║   - Doctor:       /api/doctor/*                           ║
║   - Receptionist: /api/receptionist/*                     ║
║   - Patient:      /api/patient/*                          ║
║                                                           ║
║   Health Check:   GET /api/health                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
