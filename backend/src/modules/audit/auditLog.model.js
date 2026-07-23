const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

/**
 * AuditLog — Tenant-scoped, append-only immutable trail.
 *
 * Records every sensitive action performed in the system.
 * NEVER updated — only inserted. Use the service layer to enforce this.
 *
 * Design decisions:
 * - `changes` stores a diff snapshot (before/after), NOT a full document copy
 * - PII fields (SSN, Aadhaar) must be redacted before storage (service layer responsibility)
 * - TTL index on `createdAt` auto-purges records after 365 days (HIPAA minimum)
 * - `userId` stores the actor's ID + a snapshot of their name for historical accuracy
 *   (in case the user is deleted later, the log remains meaningful)
 */

const AUDIT_ACTIONS = [
  'CREATE', 'READ', 'UPDATE', 'DELETE',
  'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGE', 'PASSWORD_RESET',
  'EXPORT', 'IMPORT', 'PRINT',
  'APPROVE', 'REJECT',
  'ASSIGN', 'UNASSIGN',
  'ACTIVATE', 'DEACTIVATE',
  'UPLOAD', 'DOWNLOAD',
  'SETTINGS_CHANGE',
  'SUBSCRIPTION_CHANGE',
  'PERMISSION_CHANGE',
];

const AUDIT_MODULES = [
  'auth', 'patients', 'doctors', 'appointments', 'billing',
  'pharmacy', 'laboratory', 'wards', 'reports', 'settings',
  'users', 'roles', 'notifications', 'subscriptions',
];

const auditLogSchema = new mongoose.Schema(
  {
    // hospitalId injected by tenantPlugin

    // ── Actor ─────────────────────────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userSnapshot: {
      // Snapshot of user details at time of action (preserved even if user deleted)
      name:  { type: String },
      email: { type: String },
      role:  { type: String },
    },

    // ── Action ────────────────────────────────────────────────────────────────
    action: {
      type: String,
      required: true,
      enum: AUDIT_ACTIONS,
      uppercase: true,
    },
    module: {
      type: String,
      required: true,
      enum: AUDIT_MODULES,
      lowercase: true,
    },

    // ── Resource ──────────────────────────────────────────────────────────────
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      // ID of the document that was affected (Patient, Invoice, User, etc.)
    },
    resourceType: {
      type: String,
      // Mongoose model name: 'Patient', 'Invoice', 'User', 'Appointment'
    },
    resourceSnapshot: {
      // Human-readable identifier of the resource (for display in audit UI)
      // e.g. { label: "Patient: John Doe (HMS-PAT-00123)" }
      label: { type: String },
    },

    // ── Change Diff ───────────────────────────────────────────────────────────
    changes: {
      before: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
        // State of the resource BEFORE the action
        // null for CREATE actions
        // PII must be redacted: { ssn: '[REDACTED]', ... }
      },
      after: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
        // State of the resource AFTER the action
        // null for DELETE actions
      },
    },

    // ── Request Context ───────────────────────────────────────────────────────
    ipAddress:  { type: String },
    userAgent:  { type: String },
    requestId:  { type: String }, // Correlation ID for distributed tracing

    // ── Outcome ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
      default: 'success',
    },
    failureReason: {
      type: String,
      // Populated only when status === 'failure'
    },

    // ── Compliance Tags ────────────────────────────────────────────────────────
    tags: {
      type: [String],
      default: [],
      // e.g. ['hipaa', 'pii_access', 'financial', 'critical']
    },
  },
  {
    timestamps: true,
    // Immutable: prevent any updates to audit log documents
    // Enforced at the service layer — repository only has `create` method
  }
);

// ── Apply Tenant Plugin ───────────────────────────────────────────────────────
auditLogSchema.plugin(tenantPlugin);

// ── Indexes ───────────────────────────────────────────────────────────────────
// TTL Index — auto-purge after 1 year (365 days) — zero maintenance
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

// Query patterns: by hospital + time (most common — audit dashboard)
auditLogSchema.index({ hospitalId: 1, createdAt: -1 });

// Query: all actions by a specific user
auditLogSchema.index({ hospitalId: 1, userId: 1, createdAt: -1 });

// Query: all actions on a specific resource
auditLogSchema.index({ hospitalId: 1, resourceId: 1, createdAt: -1 });

// Query: filter by module (e.g. "show all billing actions")
auditLogSchema.index({ hospitalId: 1, module: 1, action: 1, createdAt: -1 });

// Query: filter by status (e.g. "show all failed actions")
auditLogSchema.index({ hospitalId: 1, status: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = { AuditLog, AUDIT_ACTIONS, AUDIT_MODULES };
