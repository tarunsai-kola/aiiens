const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

const vitalsSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Measurements
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    bmi: { type: Number },
    
    bpSystolic: { type: Number },
    bpDiastolic: { type: Number },
    
    temperature: { type: Number }, // Fahrenheit or Celsius
    pulse: { type: Number }, // bpm
    spo2: { type: Number }, // percentage
    respiration: { type: Number }, // breaths per minute
    sugar: { type: Number }, // mg/dL
    
    painScore: { type: Number, min: 0, max: 10 },
    
    // Notes & Conditions
    allergies: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

vitalsSchema.plugin(tenantPlugin);
vitalsSchema.index({ hospitalId: 1, appointmentId: 1 }, { unique: true });

const Vitals = mongoose.model('Vitals', vitalsSchema);
module.exports = { Vitals };
