const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const jwtConfig = require('../config/jwt');

/**
 * Verifies the Bearer JWT token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Access token is missing or malformed'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token has expired'));
    }
    return next(ApiError.unauthorized('Invalid access token'));
  }
};

module.exports = { authenticate };
