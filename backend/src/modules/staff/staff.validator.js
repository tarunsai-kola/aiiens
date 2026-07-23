const Joi = require('joi');

const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Must be a valid ID',
});

const updateStaffSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(''),
  roleId: objectId.optional(),
});

module.exports = {
  updateStaffSchema,
};
