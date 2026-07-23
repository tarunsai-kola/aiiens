const Joi = require('joi');

// ── Shared field definitions ──────────────────────────────────────────────────
const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+])/)
  .messages({
    'string.min':          'Password must be at least 8 characters',
    'string.max':          'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
    'any.required':        'Password is required',
  });

const email = Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required().messages({
  'string.email':  'Please provide a valid email address',
  'any.required':  'Email is required',
});

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Must be a valid ID',
});

// ── 1. Hospital Registration ──────────────────────────────────────────────────
const registerHospitalSchema = Joi.object({
  // Hospital info
  hospitalName: Joi.string().trim().min(3).max(150).required().messages({
    'any.required': 'Hospital name is required',
  }),
  hospitalType: Joi.string()
    .valid('general', 'specialty', 'clinic', 'diagnostic', 'nursing_home', 'multispecialty')
    .default('general'),
  hospitalPhone: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).required().messages({
    'string.pattern.base': 'Please enter a valid phone number',
    'any.required':        'Hospital phone is required',
  }),
  hospitalEmail: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().optional(),
  city:  Joi.string().trim().max(100).optional(),
  state: Joi.string().trim().max(100).optional(),

  // First admin user
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    'any.required': 'Last name is required',
  }),
  adminEmail:    email,
  adminPassword: password.required(),
  phone:         Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    'string.pattern.base': 'Phone must be 10 digits',
  }),

  // Plan selection
  planSlug: Joi.string()
    .valid('starter', 'growth', 'professional', 'enterprise')
    .default('starter'),
});

// ── 2. Login ──────────────────────────────────────────────────────────────────
const loginSchema = Joi.object({
  email:      email,
  password:   Joi.string().required().messages({ 'any.required': 'Password is required' }),
  hospitalId: objectId.required().messages({ 'any.required': 'Hospital ID is required' }),
  // Note: hospitalId is also extracted from subdomain/header in production
  // For simplicity in this implementation it's passed in body
});

// ── 3. Refresh Token ──────────────────────────────────────────────────────────
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
  hospitalId: objectId.required(),
});

// ── 4. Forgot Password ────────────────────────────────────────────────────────
const forgotPasswordSchema = Joi.object({
  email:      email,
  hospitalId: objectId.required().messages({ 'any.required': 'Hospital ID is required' }),
});

// ── 5. Reset Password ─────────────────────────────────────────────────────────
const resetPasswordSchema = Joi.object({
  password:        password.required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only':     'Passwords do not match',
    'any.required': 'Please confirm your password',
  }),
});

// ── 6. Change Password (authenticated) ───────────────────────────────────────
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({ 'any.required': 'Current password is required' }),
  newPassword:     password.required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only':     'Passwords do not match',
    'any.required': 'Please confirm your new password',
  }),
});

// ── 7. Invite Staff ───────────────────────────────────────────────────────────
const inviteStaffSchema = Joi.object({
  email:     email,
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'any.required': 'First name is required',
  }),
  lastName:  Joi.string().trim().min(2).max(50).required().messages({
    'any.required': 'Last name is required',
  }),
  roleId:    objectId.required().messages({ 'any.required': 'Role is required' }),
});

// ── 8. Accept Invite ──────────────────────────────────────────────────────────
const acceptInviteSchema = Joi.object({
  password:        password.required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only':     'Passwords do not match',
    'any.required': 'Please confirm your password',
  }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
    'string.pattern.base': 'Phone must be 10 digits',
  }),
});

module.exports = {
  registerHospitalSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  inviteStaffSchema,
  acceptInviteSchema,
};
