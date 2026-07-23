const Joi = require('joi');

const saveVitalsSchema = Joi.object({
  appointmentId: Joi.string().required(),
  patientId: Joi.string().required(),
  
  height: Joi.number().min(0).max(300).optional(),
  weight: Joi.number().min(0).max(500).optional(),
  bmi: Joi.number().min(0).max(150).optional(),
  
  bpSystolic: Joi.number().min(0).max(300).optional(),
  bpDiastolic: Joi.number().min(0).max(200).optional(),
  
  temperature: Joi.number().min(30).max(115).optional(), // Assume F mostly but allow wide range
  pulse: Joi.number().min(0).max(300).optional(),
  spo2: Joi.number().min(0).max(100).optional(),
  respiration: Joi.number().min(0).max(100).optional(),
  sugar: Joi.number().min(0).max(1000).optional(),
  
  painScore: Joi.number().min(0).max(10).optional(),
  
  allergies: Joi.string().trim().optional().allow(''),
  notes: Joi.string().trim().optional().allow('')
});

module.exports = {
  saveVitalsSchema
};
