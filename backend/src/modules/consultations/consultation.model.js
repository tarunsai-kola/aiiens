const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

const consultationSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // SOAP Notes
    subjective: { type: String, trim: true }, // Symptoms, HPI
    objective: { type: String, trim: true },  // Exam findings
    assessment: [{ type: String, trim: true }], // Diagnoses
    plan: { type: String, trim: true }, // Treatment plan

    // Additional fields
    clinicalNotes: { type: String, trim: true },
    followUpDate: { type: Date },
    
    isCompleted: { type: Boolean, default: false } // True when doctor finishes consultation
  },
  { timestamps: true }
);

consultationSchema.plugin(tenantPlugin);
// Only one consultation per appointment
consultationSchema.index({ hospitalId: 1, appointmentId: 1 }, { unique: true });

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = { Consultation };
