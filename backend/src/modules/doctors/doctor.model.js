const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    specializations: {
      type: [String],
      default: [],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

doctorSchema.plugin(tenantPlugin);

// One doctor profile per user per hospital
doctorSchema.index({ hospitalId: 1, userId: 1 }, { unique: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = { Doctor };
