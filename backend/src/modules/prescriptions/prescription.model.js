const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, required: true, trim: true }, // e.g. 500mg
  frequency: { type: String, required: true, trim: true }, // e.g. 1-0-1
  duration: { type: String, required: true, trim: true }, // e.g. 5 days
  advice: { type: String, trim: true } // e.g. After Food
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
    consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    medicines: [medicineSchema],
    labTests: [{ type: String, trim: true }],
    radiology: [{ type: String, trim: true }],
    
    advice: { type: String, trim: true },
    followUpDate: { type: Date },
    
    isDigitallySigned: { type: Boolean, default: false },
    signatureTimestamp: { type: Date },

    isDispensed: { type: Boolean, default: false },
    dispenseTimestamp: { type: Date }
  },
  { timestamps: true }
);

prescriptionSchema.plugin(tenantPlugin);

// One prescription per consultation
prescriptionSchema.index({ hospitalId: 1, consultationId: 1 }, { unique: true });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = { Prescription };
