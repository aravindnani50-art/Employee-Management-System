// Main Application Entry Point
// Sets up Express, middleware, API routes, 404 handling, and centralized error handling.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import route handlers
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

// Import error and 404 middleware
const notFound = require('./middleware/notFound');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();

// -------------------------------------------------------------
// 1. Core Middleware Configuration
// -------------------------------------------------------------

// CORS Configuration: Allows React frontend to communicate with this backend
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000', // Standard Create React App port
  'http://localhost:5173', // Standard Vite React port
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman, Thunder Client)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation: Access denied from this origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Built-in JSON body parser middleware
app.use(express.json());

// -------------------------------------------------------------
// 2. Health Check Endpoint
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Employee Management Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 3. API Routes
// -------------------------------------------------------------
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);

// -------------------------------------------------------------
// 4. 404 Catch-all Middleware (must be after all routes)
// -------------------------------------------------------------
app.use(notFound);

// -------------------------------------------------------------
// 5. Centralized Error Handling Middleware (must be last)
// -------------------------------------------------------------
app.use(errorHandler);

// -------------------------------------------------------------
// 6. Server Initialization
// -------------------------------------------------------------
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Employees API: http://localhost:${PORT}/api/employees`);
    console.log(`🏢 Departments API: http://localhost:${PORT}/api/departments`);
    console.log(`=========================================`);
  });
}

module.exports = app;
