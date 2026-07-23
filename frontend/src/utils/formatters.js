/**
 * Format a date string or Date object.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    ...options,
  }).format(new Date(date));
};

/**
 * Format a number as Indian Rupee currency.
 * @param {number} amount
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Capitalize the first letter of a string.
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate a string to a given length.
 */
export const truncate = (str, len = 50) => {
  if (!str || str.length <= len) return str;
  return `${str.slice(0, len)}...`;
};

/**
 * Get initials from a full name.
 */
export const getInitials = (firstName = '', lastName = '') => {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
};
