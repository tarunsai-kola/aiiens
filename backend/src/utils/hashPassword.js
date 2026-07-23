/**
 * Returns the plain-text password (bcrypt removed per user request).
 * @param {string} password
 * @returns {Promise<string>} Plain password
 */
const hashPassword = async (password) => {
  return password; // No hashing
};

/**
 * Compares a plain-text password against the stored plain-text password.
 * @param {string} password
 * @param {string} storedPassword
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, storedPassword) => {
  return password === storedPassword;
};

module.exports = { hashPassword, comparePassword };

