const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');
const { hashPassword } = require('../../utils/hashPassword');

/**
 * User — Tenant-scoped (hospitalId required).
 *
 * Represents all human actors in the system:
 *   - Hospital staff: admin, doctor, nurse, receptionist, pharmacist, lab_technician
 *   - Patients with portal access
 *
 * IMPORTANT: Email uniqueness is PER-TENANT, not global.
 * The compound unique index { email: 1, hospitalId: 1 } enforces this.
 * dr.smith@gmail.com can exist in multiple hospitals independently.
 */
const userSchema = new mongoose.Schema(
  {
    // hospitalId injected by tenantPlugin

    // ── Identity ─────────────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
      // Auto-generated per hospital: HMS-USR-00001
      // Unique per hospital (compound index below)
    },
    avatar: {
      type: String, // URL to profile image
    },

    // ── Authentication ────────────────────────────────────────────────────────
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // NEVER returned in queries
    },
    refreshToken: {
      type: String,
      select: false, // NEVER returned in queries
    },

    // ── Authorization ─────────────────────────────────────────────────────────
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role is required'],
    },

    // ── Account Status ────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    // ── Staff Invite ──────────────────────────────────────────────────────────
    inviteToken: {
      type: String,
      select: false,
    },
    inviteExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
    },

    // ── Timestamps & Tracking ─────────────────────────────────────────────────
    lastLogin: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
      // Account temporarily locked after too many failed login attempts
    },

    // ── Notification Preferences ──────────────────────────────────────────────
    notificationPreferences: {
      email:    { type: Boolean, default: true },
      sms:      { type: Boolean, default: false },
      inApp:    { type: Boolean, default: true },
      push:     { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Apply Tenant Plugin ───────────────────────────────────────────────────────
userSchema.plugin(tenantPlugin);

// ── Indexes ───────────────────────────────────────────────────────────────────
// CRITICAL: Per-tenant email uniqueness (NOT global)
userSchema.index({ hospitalId: 1, email: 1 }, { unique: true });
userSchema.index({ hospitalId: 1, roleId: 1 });
userSchema.index({ hospitalId: 1, isActive: 1 });
userSchema.index(
  { hospitalId: 1, employeeId: 1 },
  { 
    unique: true,
    sparse: true,
    partialFilterExpression: { employeeId: { $exists: true, $ne: null } },
  }
);
userSchema.index({ hospitalId: 1, createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Pre-save: Hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = { User };
