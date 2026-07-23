/**
 * ApiError — Custom operational error class.
 *
 * Distinguishes between operational errors (safe to expose to clients)
 * and programming errors (bugs that should be logged and hidden in production).
 *
 * Operational errors have isOperational = true and known HTTP status codes.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable error message
   * @param {boolean} isOperational - Whether this is an expected operational error
   * @param {string} stack      - Optional stack trace override
   */
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Static Factory Methods ──────────────────────────────────────────────────

  static badRequest(message = 'Bad request') {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static unprocessable(message = 'Unprocessable entity') {
    return new ApiError(422, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, false);
  }
}

module.exports = ApiError;
