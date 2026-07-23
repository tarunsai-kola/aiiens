const Joi = require('joi');

const createRoleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().trim().max(200).optional().allow(''),
  permissions: Joi.array().items(Joi.string()).optional(),
});

const updateRoleSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  description: Joi.string().trim().max(200).optional().allow(''),
  permissions: Joi.array().items(Joi.string()).optional(),
});

module.exports = {
  createRoleSchema,
  updateRoleSchema,
};
