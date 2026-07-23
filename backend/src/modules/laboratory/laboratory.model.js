const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

// Test Parameter Schema (Blueprint)
const parameterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  unit: { type: String, trim: true },
  referenceRange: { type: String, trim: true }, // e.g., '4.5 - 11.0' or '< 200'
}, { _id: false });

// Test Master Blueprint Model
const labTestMasterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g. "Complete Blood Count (CBC)"
  code: { type: String, required: true, trim: true }, // e.g. "CBC-01"
  department: { type: String, required: true, trim: true }, // e.g. "Pathology", "Biochemistry"
  sampleType: { type: String, required: true, trim: true }, // e.g. "Blood", "Urine"
  
  parameters: [parameterSchema],
  
  price: { type: Number, default: 0 },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true }
}, { timestamps: true });

labTestMasterSchema.plugin(tenantPlugin);

// Patient Test Results Schema
const testResultSchema = new mongoose.Schema({
  parameterName: { type: String, required: true },
  value: { type: String, required: true },
  isAbnormal: { type: Boolean, default: false }
}, { _id: false });

// Patient Lab Order Model
const labOrderSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  
  // Who ordered it
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  
  // The test being performed
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTestMaster', required: true },
  
  // State Machine
  status: { 
    type: String, 
    enum: ['ordered', 'sample_collected', 'completed', 'verified', 'cancelled'], 
    default: 'ordered' 
  },
  
  // Tracking timelines & actors
  sampleCollectionTime: { type: Date },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who entered results
  resultEntryTime: { type: Date },
  
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Pathologist/Doctor signature
  verificationTime: { type: Date },
  
  // The Actual Data
  results: [testResultSchema],
  reportNotes: { type: String, trim: true },
  
}, { timestamps: true });

labOrderSchema.plugin(tenantPlugin);

const LabTestMaster = mongoose.model('LabTestMaster', labTestMasterSchema);
const LabOrder = mongoose.model('LabOrder', labOrderSchema);

module.exports = { LabTestMaster, LabOrder };
