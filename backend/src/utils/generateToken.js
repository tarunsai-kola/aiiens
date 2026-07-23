const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Generates a signed JWT access token.
 * @param {Object} payload - { id, role, email }
 * @returns {string} Signed JWT
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.accessToken.secret, {
    expiresIn: jwtConfig.accessToken.expiresIn,
    algorithm: 'HS256',
  });
};

/**
 * Generates a signed JWT refresh token.
 * @param {Object} payload - { id }
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshToken.secret, {
    expiresIn: jwtConfig.refreshToken.expiresIn,
    algorithm: 'HS256',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
