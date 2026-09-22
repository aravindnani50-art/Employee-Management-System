// 404 Not Found Middleware
// This middleware catches any incoming requests that do not match any defined routes.
// It returns a consistent 404 JSON response.

const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};

module.exports = notFound;
