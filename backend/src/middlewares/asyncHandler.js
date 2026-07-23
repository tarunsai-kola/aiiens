/**
 * asyncHandler — Eliminates try/catch boilerplate in async controllers.
 *
 * Usage:
 *   router.get('/patients', asyncHandler(patientController.getAll));
 *
 * Any thrown error or rejected promise is forwarded to Express's next(err).
 *
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
