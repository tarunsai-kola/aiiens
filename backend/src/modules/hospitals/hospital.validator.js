const Joi = require('joi');

const registerHospitalSchema = Joi.object({
  // Hospital
  hospitalName: Joi.string().trim().min(3).max(150).required(),
  hospitalType: Joi.string()
    .valid('general', 'specialty', 'clinic', 'diagnostic', 'nursing_home', 'multispecialty')
    .default('general'),
  hospitalPhone: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).required().messages({
    'string.pattern.base': 'Please enter a valid phone number',
    'any.required':        'Hospital phone is required',
  }),
  hospitalEmail: Joi.string().email({ tlds: { allow: false } }).lowercase().allow('').optional(),
  city:          Joi.string().trim().max(100).allow('').optional(),
  state:         Joi.string().trim().max(100).allow('').optional(),
  planSlug:      Joi.string().valid('starter','growth','professional','enterprise').default('starter'),

  // First Admin
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName:  Joi.string().trim().min(2).max(50).required(),
  adminEmail: Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required(),
  adminPassword: Joi.string()
    .min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+])/)
    .required()
    .messages({
      'string.min':          'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
      'any.required':        'Password is required',
    }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).allow('').optional(),
});

module.exports = { registerHospitalSchema };
