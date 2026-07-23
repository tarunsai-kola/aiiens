const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Must be a valid ID',
});

const createDoctorSchema = Joi.object({
  userId: objectId.required(),
  departmentId: objectId.optional().allow(null),
  specializations: Joi.array().items(Joi.string().trim()).optional(),
  qualifications: Joi.array().items(Joi.string().trim()).optional(),
  experienceYears: Joi.number().min(0).optional(),
  consultationFee: Joi.number().min(0).optional(),
  bio: Joi.string().max(1000).optional().allow(''),
  isActive: Joi.boolean().optional(),
});

const updateDoctorSchema = Joi.object({
  departmentId: objectId.optional().allow(null),
  specializations: Joi.array().items(Joi.string().trim()).optional(),
  qualifications: Joi.array().items(Joi.string().trim()).optional(),
  experienceYears: Joi.number().min(0).optional(),
  consultationFee: Joi.number().min(0).optional(),
  bio: Joi.string().max(1000).optional().allow(''),
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createDoctorSchema,
  updateDoctorSchema,
};
