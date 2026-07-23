const ApiError = require('../utils/ApiError');

/**
 * Role-Based Access Control middleware factory.
 * Usage: router.get('/admin-only', authenticate, authorize('admin'), handler)
 * Usage: router.get('/staff', authenticate, authorize('admin', 'doctor', 'nurse'), handler)
 *
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRolesOrPermissions) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    // 1. Check if the user's role slug matches directly
    if (allowedRolesOrPermissions.includes(req.user.role)) {
      return next();
    }

    // 2. Check if the user has any of the required permissions
    const userPermissions = req.user.permissions || [];
    const hasPermission = allowedRolesOrPermissions.some(p => userPermissions.includes(p));

    if (hasPermission) {
      return next();
    }

    return next(
      ApiError.forbidden(
        `Your current role (${req.user.role}) does not have the required permissions to access this resource.`
      )
    );
  };
};

module.exports = { authorize };
