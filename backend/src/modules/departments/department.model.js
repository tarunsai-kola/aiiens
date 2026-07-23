const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    headDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      trim: true, // e.g., 'Building A, Floor 2'
    },
  },
  {
    timestamps: true,
  }
);

departmentSchema.plugin(tenantPlugin);

// Ensure unique department names per hospital
departmentSchema.index({ hospitalId: 1, name: 1 }, { unique: true });
departmentSchema.index({ hospitalId: 1, isActive: 1 });

const Department = mongoose.model('Department', departmentSchema);

module.exports = { Department };
