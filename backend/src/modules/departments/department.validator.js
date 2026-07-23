const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Must be a valid ID',
});

const createDepartmentSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(500).optional().allow(''),
  headDoctorId: objectId.optional().allow(null),
  isActive: Joi.boolean().optional(),
  contactPhone: Joi.string().trim().optional().allow(''),
  contactEmail: Joi.string().email().optional().allow(''),
  location: Joi.string().trim().optional().allow(''),
});

const updateDepartmentSchema = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  description: Joi.string().trim().max(500).optional().allow(''),
  headDoctorId: objectId.optional().allow(null),
  isActive: Joi.boolean().optional(),
  contactPhone: Joi.string().trim().optional().allow(''),
  contactEmail: Joi.string().email().optional().allow(''),
  location: Joi.string().trim().optional().allow(''),
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
};
