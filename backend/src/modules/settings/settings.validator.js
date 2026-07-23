const Joi = require('joi');

const updateSettingsSchema = Joi.object({
  general: Joi.object({
    timezone: Joi.string().optional(),
    currency: Joi.string().optional(),
    language: Joi.string().optional(),
    dateFormat: Joi.string().valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD').optional(),
    timeFormat: Joi.string().valid('12h', '24h').optional(),
    fiscalYearStart: Joi.string().optional(),
  }).optional(),
  
  appointment: Joi.object({
    slotDurationMinutes: Joi.number().valid(10, 15, 20, 30, 45, 60).optional(),
    maxAdvanceBookingDays: Joi.number().optional(),
    cancellationWindowHours: Joi.number().optional(),
    autoConfirm: Joi.boolean().optional(),
    allowOnlineBooking: Joi.boolean().optional(),
    workingHours: Joi.array().items(Joi.object({
      day: Joi.string().valid('monday','tuesday','wednesday','thursday','friday','saturday','sunday').required(),
      open: Joi.string().required(),
      close: Joi.string().required(),
      isOpen: Joi.boolean().required(),
    })).optional(),
  }).optional(),
  
  billing: Joi.object({
    taxRate: Joi.number().min(0).max(100).optional(),
    invoicePrefix: Joi.string().optional(),
    gstNumber: Joi.string().optional().allow(''),
    panNumber: Joi.string().optional().allow(''),
    paymentMethods: Joi.array().items(Joi.string()).optional(),
    autoGenerateBill: Joi.boolean().optional(),
    billFooterNote: Joi.string().optional().allow(''),
  }).optional(),
  
  notifications: Joi.object({
    emailEnabled: Joi.boolean().optional(),
    smsEnabled: Joi.boolean().optional(),
    whatsappEnabled: Joi.boolean().optional(),
    appointmentReminder: Joi.object({
      enabled: Joi.boolean().optional(),
      hoursBefore: Joi.number().optional(),
    }).optional(),
  }).optional(),
  
  branding: Joi.object({
    logoUrl: Joi.string().uri().optional().allow(''),
    primaryColor: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
    theme: Joi.string().valid('light', 'dark', 'system').optional(),
    hospitalTagline: Joi.string().optional().allow(''),
  }).optional(),
});

const updateHospitalSchema = Joi.object({
  name: Joi.string().trim().min(3).max(150).optional(),
  type: Joi.string().valid('general', 'specialty', 'clinic', 'diagnostic', 'nursing_home', 'multispecialty').optional(),
  contact: Joi.object({
    primaryPhone: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).optional().allow(''),
    secondaryPhone: Joi.string().pattern(/^[0-9+\-\s]{7,15}$/).optional().allow(''),
    email: Joi.string().email().optional().allow(''),
    website: Joi.string().uri().optional().allow(''),
  }).optional(),
  address: Joi.object({
    street: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    zipCode: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
  }).optional(),
});

module.exports = {
  updateSettingsSchema,
  updateHospitalSchema,
};
