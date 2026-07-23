const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    
    date: { type: Date, required: true }, // The day of the queue
    tokenNumber: { type: Number, required: true }, // Reset to 1 per day per doctor
    
    visitType: { 
      type: String, 
      enum: ['walk-in', 'appointment', 'follow-up'], 
      default: 'walk-in' 
    },
    priority: { 
      type: String, 
      enum: ['normal', 'emergency', 'vip'], 
      default: 'normal' 
    },
    status: { 
      type: String, 
      enum: ['triage', 'waiting', 'in-progress', 'completed', 'cancelled', 'missed', 'hold', 'skipped', 'transferred'], 
      default: 'triage' 
    },
    
    estimatedTime: { type: Date }, // Optional: when they might be seen
    timeIn: { type: Date }, // When they actually entered doctor's room
    timeOut: { type: Date }, // When consultation finished
    
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

appointmentSchema.plugin(tenantPlugin);

// ── Indexes ───────────────────────────────────────────────────────────────────
appointmentSchema.index({ hospitalId: 1, appointmentDate: -1 }); // Dashboard stats query
appointmentSchema.index({ hospitalId: 1, doctorId: 1, appointmentDate: 1 }); // Doctor Queue query
appointmentSchema.index({ hospitalId: 1, patientId: 1 }); // Patient history query
appointmentSchema.index({ hospitalId: 1, tokenNumber: 1, date: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = { Appointment };
