/**
 * Centralized JWT configuration.
 * All token-related settings live here — never scattered in routes or controllers.
 */
const jwtConfig = {
  accessToken: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
};

// Fail fast if secrets are not set
if (!jwtConfig.accessToken.secret || !jwtConfig.refreshToken.secret) {
  throw new Error('JWT secrets are not defined. Check your .env file.');
}

module.exports = jwtConfig;
