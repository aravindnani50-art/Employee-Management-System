// Centralized Error Handling Middleware
// Catches all synchronous and asynchronous errors passed via next(error).
// Returns clean, consistent error responses and shields sensitive database details.

// Custom Application Error class for controlled business/validation errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  // Log full error details to console during development for easy debugging
  console.error('[Error Details]:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Default response values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle malformed JSON body from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload provided in request body',
    });
  }

  // Handle Prisma-specific database errors
  if (err.code) {
    switch (err.code) {
      // P2002: Unique constraint failed
      case 'P2002': {
        statusCode = 409;
        const target = err.meta?.target;
        if (Array.isArray(target) && target.includes('email')) {
          message = 'Employee with this email already exists';
        } else {
          message = 'A record with this unique value already exists';
        }
        break;
      }

      // P2025: Record to update/delete not found
      case 'P2025': {
        statusCode = 404;
        message = 'Record not found';
        break;
      }

      // P2003: Foreign key constraint failed (e.g. invalid departmentId)
      case 'P2003': {
        statusCode = 400;
        message = 'Invalid reference: The specified department does not exist';
        break;
      }

      default:
        // Generic database error - do not leak internal SQL/Prisma details to client
        statusCode = 500;
        message = 'Database operation failed';
        break;
    }
  }

  // Send consistent JSON error response
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  errorHandler,
  AppError,
};
