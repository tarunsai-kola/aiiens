const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../config/logger');

/**
 * 404 handler — must be placed AFTER all routes.
 */
const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handler — must be placed LAST in the middleware stack.
 * Distinguishes between operational errors (safe to expose) and programming errors.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Wrap non-ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message =
      process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal server error'
        : error.message || 'Internal server error';

    error = new ApiError(statusCode, message, false, err.stack);
  }

  // Log server errors
  if (error.statusCode >= 500) {
    logger.error(error.stack || error.message);
  }

  const response = ApiResponse.error(
    error.message,
    process.env.NODE_ENV === 'development' ? error.stack : undefined
  );

  res.status(error.statusCode).json(response);
};

module.exports = { notFound, errorHandler };
