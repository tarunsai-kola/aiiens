const Joi = require('joi');

const addressSchema = Joi.object({
  street: Joi.string().trim().optional().allow(''),
  city: Joi.string().trim().optional().allow(''),
  state: Joi.string().trim().optional().allow(''),
  pincode: Joi.string().trim().optional().allow(''),
  country: Joi.string().trim().optional().default('India'),
});

const emergencyContactSchema = Joi.object({
  name: Joi.string().trim().optional().allow(''),
  relationship: Joi.string().trim().optional().allow(''),
  phone: Joi.string().trim().optional().allow(''),
});

const insuranceSchema = Joi.object({
  provider: Joi.string().trim().optional().allow(''),
  policyNumber: Joi.string().trim().optional().allow(''),
  validTill: Joi.date().iso().optional().allow(null, ''),
});

const createPatientSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  dateOfBirth: Joi.date().iso().required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-').optional().allow(''),
  
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().pattern(/^[0-9+\-\s]{10,15}$/).required(),
  address: addressSchema.optional(),
  
  aadhaar: Joi.string().pattern(/^[0-9]{12}$/).optional().allow('', null).messages({'string.pattern.base': 'Aadhaar must be a 12-digit number'}),
  abha: Joi.string().pattern(/^[0-9]{14}$/).optional().allow('', null).messages({'string.pattern.base': 'ABHA must be a 14-digit number'}),
  
  emergencyContact: emergencyContactSchema.optional(),
  insurance: insuranceSchema.optional(),
  
  allergies: Joi.array().items(Joi.string().trim()).optional(),
  chronicConditions: Joi.array().items(Joi.string().trim()).optional(),
  
  isActive: Joi.boolean().optional(),
});

const updatePatientSchema = Joi.object({
  firstName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional(),
  dateOfBirth: Joi.date().iso().optional(),
  gender: Joi.string().valid('male', 'female', 'other').optional(),
  bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-').optional().allow(''),
  
  email: Joi.string().email().optional().allow(''),
  phone: Joi.string().pattern(/^[0-9+\-\s]{10,15}$/).optional(),
  address: addressSchema.optional(),
  
  aadhaar: Joi.string().pattern(/^[0-9]{12}$/).optional().allow('', null).messages({'string.pattern.base': 'Aadhaar must be a 12-digit number'}),
  abha: Joi.string().pattern(/^[0-9]{14}$/).optional().allow('', null).messages({'string.pattern.base': 'ABHA must be a 14-digit number'}),
  
  emergencyContact: emergencyContactSchema.optional(),
  insurance: insuranceSchema.optional(),
  
  allergies: Joi.array().items(Joi.string().trim()).optional(),
  chronicConditions: Joi.array().items(Joi.string().trim()).optional(),
  
  isActive: Joi.boolean().optional(),
});

module.exports = {
  createPatientSchema,
  updatePatientSchema,
};
