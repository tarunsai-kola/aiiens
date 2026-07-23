const Joi = require('joi');

// TODO: Define validation schemas for appointment
const createAppointmentSchema = Joi.object({
  // Add validation rules here
});

const updateAppointmentSchema = Joi.object({
  // Add validation rules here
});

module.exports = { createAppointmentSchema, updateAppointmentSchema };
