const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

/**
 * Role — Hybrid tenant model.
 *
 * Two types of roles exist in the system:
 *
 * 1. SYSTEM roles (hospitalId: null) — pre-seeded by the platform
 *    → admin, doctor, nurse, receptionist, pharmacist, lab_technician, patient
 *    → Available to all hospitals
 *    → Cannot be modified or deleted by hospital admins
 *
 * 2. CUSTOM roles (hospitalId: <id>) — created by hospital admins
 *    → "Head of Cardiology", "Insurance Desk Officer", "OT Scrub Nurse"
 *    → Scoped to that hospital only
 *    → Require plan.features.customRoles = true
 *
 * Permissions are stored as slug arrays (string[]) — NOT ObjectId references.
 * This avoids $lookup joins on every authorization check.
 * The RBAC middleware resolves permissions from JWT payload or Redis cache.
 *
 * NOTE: tenantPlugin is applied BUT system roles bypass the hospitalId check
 *       using _bypassTenantCheck option during seeding.
 */
const roleSchema = new mongoose.Schema(
  {
    // hospitalId injected by tenantPlugin
    // null for system roles (platform-wide), ObjectId for custom roles

    // ── Identity ─────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      maxlength: [100, 'Role name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // System: 'admin', 'doctor', 'nurse', etc.
      // Custom: 'head-of-cardiology', 'insurance-desk'
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['system', 'custom'],
      required: true,
      default: 'system',
    },

    // ── Permissions ───────────────────────────────────────────────────────────
    /**
     * Array of permission slugs granted to this role.
     * Format: "{module}:{action}" — e.g. "patients:create", "billing:export"
     *
     * WHY STRINGS, not ObjectIds?
     * → Authorization check = req.user.permissions.includes('patients:create')
     * → This is an in-memory array lookup — zero database round trips
     * → Slugs are embedded in JWT or cached in Redis after login
     * → Changing a permission slug requires a re-login (acceptable trade-off)
     */
    permissions: {
      type: [String],
      default: [],
      // Each entry must match a slug in the permissions collection
    },

    // ── Status ────────────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
      // If true, auto-assigned to new users of this hospital when no role specified
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Apply Tenant Plugin ───────────────────────────────────────────────────────
// Note: System roles override hospitalId to null after creation
roleSchema.plugin(tenantPlugin);

// ── Override tenantPlugin for system roles ────────────────────────────────────
// We allow hospitalId to be null for system-type roles
roleSchema.path('hospitalId').required(false);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound unique: same slug can exist in different hospitals, but not twice
roleSchema.index({ hospitalId: 1, slug: 1 }, { unique: true });
roleSchema.index({ hospitalId: 1, type: 1 });
roleSchema.index({ hospitalId: 1, isActive: 1 });
roleSchema.index({ type: 1 }); // Find all system roles quickly

const Role = mongoose.model('Role', roleSchema);
module.exports = { Role };
