const mongoose = require('mongoose');

/**
 * Permission — Global catalog (NOT tenant-scoped).
 * Defines every possible action in the system using a slug format:
 *   {module}:{action}  →  e.g. "patients:create", "billing:export"
 *
 * These are seeded once at platform launch and shared across all hospitals.
 * New feature modules add new permission slugs without schema changes.
 */
const MODULES = [
  'auth',
  'patients',
  'doctors',
  'appointments',
  'billing',
  'pharmacy',
  'laboratory',
  'wards',
  'reports',
  'settings',
  'users',
  'roles',
  'notifications',
  'audit',
  'subscriptions',
];

const ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'export',
  'import',
  'approve',
  'reject',
  'assign',
  'manage',         // catch-all admin action
  'view_sensitive', // e.g. view patient PII
  'dispense',       // pharmacy
  'upload_results', // laboratory
  'admit',          // wards
  'discharge',      // wards
];

const permissionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Permission slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      // Format: {module}:{action}  e.g. "patients:create"
      match: [/^[a-z_]+:[a-z_]+$/, 'Slug must be in format {module}:{action}'],
    },
    module: {
      type: String,
      required: true,
      enum: MODULES,
      lowercase: true,
    },
    action: {
      type: String,
      required: true,
      enum: ACTIONS,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSensitive: {
      type: Boolean,
      default: false,
      // true = requires MFA or audit logging even if user has permission
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
permissionSchema.index({ slug: 1 }, { unique: true });
permissionSchema.index({ module: 1, action: 1 });
permissionSchema.index({ isActive: 1 });

// ── Static: get all slugs for a module ───────────────────────────────────────
permissionSchema.statics.getModulePermissions = function (moduleName) {
  return this.find({ module: moduleName, isActive: true }).select('slug description');
};

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = { Permission, MODULES, ACTIONS };
