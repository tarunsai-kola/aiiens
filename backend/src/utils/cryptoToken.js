const crypto = require('crypto');

/**
 * Generates a cryptographically secure random token.
 * Returns both the raw token (to send to the user) and
 * the SHA-256 hash (to store in the database).
 *
 * Why hash before storing?
 * → If the DB is compromised, stored hashes cannot be used directly.
 * → The raw token is only ever in memory and sent once via email.
 *
 * @param {number} bytes - Number of random bytes (default: 32)
 * @returns {{ rawToken: string, hashedToken: string, expiresAt: Date }}
 */
const generateSecureToken = (bytes = 32, expiresInMs = 60 * 60 * 1000) => {
  const rawToken    = crypto.randomBytes(bytes).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt   = new Date(Date.now() + expiresInMs);

  return { rawToken, hashedToken, expiresAt };
};

/**
 * Hashes a raw token using SHA-256 for DB lookup.
 * Used to verify a token received in a request.
 *
 * @param {string} rawToken
 * @returns {string} SHA-256 hash
 */
const hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

module.exports = { generateSecureToken, hashToken };
