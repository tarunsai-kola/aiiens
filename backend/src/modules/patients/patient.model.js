const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

const patientSchema = new mongoose.Schema(
  {
    uhid: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }, // Optional link to User account (if patient can login)
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','O+','O-','AB+','AB-'] },
    
    // Contact
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    
    // Identifiers
    aadhaar: { type: String, trim: true },
    abha: { type: String, trim: true },
    
    // Emergency Contact
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    
    // Insurance
    insurance: {
      provider: String,
      policyNumber: String,
      validTill: Date,
    },

    // Medical
    allergies: [String],
    chronicConditions: [String],
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

patientSchema.plugin(tenantPlugin);

patientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

patientSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  return Math.floor((Date.now() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

// ── Indexes ───────────────────────────────────────────────────────────────────
patientSchema.index({ hospitalId: 1, 'contact.phone': 1 }); // High-traffic query: Searching patient by phone
patientSchema.index({ hospitalId: 1, abhaId: 1 });          // High-traffic query: ABDM integration lookups
patientSchema.index({ hospitalId: 1, 'name.first': 1, 'name.last': 1 }); // Patient name search

// Enforce unique UHID per hospital
patientSchema.index({ hospitalId: 1, uhid: 1 }, { unique: true });

// Avoid duplicate phone, aadhaar, abha per hospital, but allow nulls (sparse index)
patientSchema.index({ hospitalId: 1, phone: 1 });
patientSchema.index({ hospitalId: 1, aadhaar: 1 }, { unique: true, partialFilterExpression: { aadhaar: { $exists: true, $ne: "" } } });
patientSchema.index({ hospitalId: 1, abha: 1 }, { unique: true, partialFilterExpression: { abha: { $exists: true, $ne: "" } } });

patientSchema.index({ firstName: 'text', lastName: 'text' });

const Patient = mongoose.model('Patient', patientSchema);
module.exports = { Patient };
