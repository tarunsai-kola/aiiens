/**
 * ApiResponse — Standardizes all API response envelopes.
 *
 * Every response from the API follows the same shape:
 * {
 *   success: boolean,
 *   message: string,
 *   data: any | null,
 *   error: string | null,
 *   stack: string | undefined  (development only)
 * }
 */
class ApiResponse {
  /**
   * Success response
   * @param {string} message
   * @param {any} data
   * @param {number} statusCode
   */
  static success(message = 'Success', data = null, statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  /**
   * Paginated success response
   * @param {string} message
   * @param {Array} data
   * @param {Object} pagination  - { total, page, limit, totalPages }
   */
  static paginated(message = 'Success', data = [], pagination = {}) {
    return {
      success: true,
      message,
      data,
      pagination,
    };
  }

  /**
   * Error response
   * @param {string} message
   * @param {string|undefined} stack - Only included in development
   */
  static error(message = 'An error occurred', stack = undefined) {
    return {
      success: false,
      message,
      data: null,
      ...(stack && { stack }),
    };
  }
}

module.exports = ApiResponse;
