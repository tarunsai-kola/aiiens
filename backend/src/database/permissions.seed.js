/**
 * Permission Seeds — All platform permissions.
 * Format: { slug, module, action, description, isSensitive }
 *
 * Add new permissions here when adding new features.
 * Running the seeder is idempotent (upserts, not inserts).
 */

const permissionSeeds = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  { slug: 'auth:manage',          module: 'auth',         action: 'manage',         description: 'Manage authentication settings' },

  // ── Users ─────────────────────────────────────────────────────────────────
  { slug: 'users:create',         module: 'users',        action: 'create',         description: 'Create new staff users' },
  { slug: 'users:read',           module: 'users',        action: 'read',           description: 'View staff users' },
  { slug: 'users:update',         module: 'users',        action: 'update',         description: 'Update staff user details' },
  { slug: 'users:delete',         module: 'users',        action: 'delete',         description: 'Deactivate staff users' },
  { slug: 'users:manage',         module: 'users',        action: 'manage',         description: 'Full user management', isSensitive: true },

  // ── Roles ─────────────────────────────────────────────────────────────────
  { slug: 'roles:read',           module: 'roles',        action: 'read',           description: 'View roles' },
  { slug: 'roles:create',         module: 'roles',        action: 'create',         description: 'Create custom roles' },
  { slug: 'roles:update',         module: 'roles',        action: 'update',         description: 'Update roles and permissions', isSensitive: true },
  { slug: 'roles:delete',         module: 'roles',        action: 'delete',         description: 'Delete custom roles', isSensitive: true },

  // ── Patients ──────────────────────────────────────────────────────────────
  { slug: 'patients:create',      module: 'patients',     action: 'create',         description: 'Register new patients' },
  { slug: 'patients:read',        module: 'patients',     action: 'read',           description: 'View patient records' },
  { slug: 'patients:update',      module: 'patients',     action: 'update',         description: 'Update patient details' },
  { slug: 'patients:delete',      module: 'patients',     action: 'delete',         description: 'Deactivate patient records' },
  { slug: 'patients:export',      module: 'patients',     action: 'export',         description: 'Export patient data', isSensitive: true },
  { slug: 'patients:view_sensitive', module: 'patients',  action: 'view_sensitive', description: 'View sensitive patient info (SSN, insurance)', isSensitive: true },

  // ── Doctors ───────────────────────────────────────────────────────────────
  { slug: 'doctors:create',       module: 'doctors',      action: 'create',         description: 'Add new doctors' },
  { slug: 'doctors:read',         module: 'doctors',      action: 'read',           description: 'View doctor profiles' },
  { slug: 'doctors:update',       module: 'doctors',      action: 'update',         description: 'Update doctor details' },
  { slug: 'doctors:delete',       module: 'doctors',      action: 'delete',         description: 'Deactivate doctor profiles' },

  // ── Appointments ──────────────────────────────────────────────────────────
  { slug: 'appointments:create',  module: 'appointments', action: 'create',         description: 'Book appointments' },
  { slug: 'appointments:read',    module: 'appointments', action: 'read',           description: 'View appointments' },
  { slug: 'appointments:update',  module: 'appointments', action: 'update',         description: 'Reschedule/update appointments' },
  { slug: 'appointments:delete',  module: 'appointments', action: 'delete',         description: 'Cancel appointments' },
  { slug: 'appointments:approve', module: 'appointments', action: 'approve',        description: 'Confirm appointments' },

  // ── Billing ───────────────────────────────────────────────────────────────
  { slug: 'billing:create',       module: 'billing',      action: 'create',         description: 'Generate invoices' },
  { slug: 'billing:read',         module: 'billing',      action: 'read',           description: 'View billing records' },
  { slug: 'billing:update',       module: 'billing',      action: 'update',         description: 'Update billing records' },
  { slug: 'billing:delete',       module: 'billing',      action: 'delete',         description: 'Cancel invoices', isSensitive: true },
  { slug: 'billing:export',       module: 'billing',      action: 'export',         description: 'Export financial reports', isSensitive: true },
  { slug: 'billing:approve',      module: 'billing',      action: 'approve',        description: 'Approve/process payments' },

  // ── Pharmacy ──────────────────────────────────────────────────────────────
  { slug: 'pharmacy:read',        module: 'pharmacy',     action: 'read',           description: 'View pharmacy inventory' },
  { slug: 'pharmacy:create',      module: 'pharmacy',     action: 'create',         description: 'Add medicines to inventory' },
  { slug: 'pharmacy:update',      module: 'pharmacy',     action: 'update',         description: 'Update inventory' },
  { slug: 'pharmacy:delete',      module: 'pharmacy',     action: 'delete',         description: 'Remove inventory items' },
  { slug: 'pharmacy:dispense',    module: 'pharmacy',     action: 'dispense',       description: 'Dispense medications to patients' },

  // ── Laboratory ────────────────────────────────────────────────────────────
  { slug: 'laboratory:read',         module: 'laboratory', action: 'read',          description: 'View lab tests and results' },
  { slug: 'laboratory:create',       module: 'laboratory', action: 'create',        description: 'Create lab test orders' },
  { slug: 'laboratory:update',       module: 'laboratory', action: 'update',        description: 'Update lab test orders' },
  { slug: 'laboratory:delete',       module: 'laboratory', action: 'delete',        description: 'Cancel lab test orders' },
  { slug: 'laboratory:upload_results', module: 'laboratory', action: 'upload_results', description: 'Upload lab test results' },
  { slug: 'laboratory:export',       module: 'laboratory', action: 'export',        description: 'Export lab reports' },

  // ── Wards ─────────────────────────────────────────────────────────────────
  { slug: 'wards:read',           module: 'wards',        action: 'read',           description: 'View ward and bed status' },
  { slug: 'wards:create',         module: 'wards',        action: 'create',         description: 'Add wards and beds' },
  { slug: 'wards:update',         module: 'wards',        action: 'update',         description: 'Update ward details' },
  { slug: 'wards:admit',          module: 'wards',        action: 'admit',          description: 'Admit patients to wards' },
  { slug: 'wards:discharge',      module: 'wards',        action: 'discharge',      description: 'Discharge patients from wards' },

  // ── Reports ───────────────────────────────────────────────────────────────
  { slug: 'reports:read',         module: 'reports',      action: 'read',           description: 'View reports and analytics' },
  { slug: 'reports:export',       module: 'reports',      action: 'export',         description: 'Export reports', isSensitive: true },

  // ── Settings ──────────────────────────────────────────────────────────────
  { slug: 'settings:read',        module: 'settings',     action: 'read',           description: 'View hospital settings' },
  { slug: 'settings:update',      module: 'settings',     action: 'update',         description: 'Update hospital settings', isSensitive: true },

  // ── Audit ─────────────────────────────────────────────────────────────────
  { slug: 'audit:read',           module: 'audit',        action: 'read',           description: 'View audit logs', isSensitive: true },
  { slug: 'audit:export',         module: 'audit',        action: 'export',         description: 'Export audit logs', isSensitive: true },

  // ── Notifications ─────────────────────────────────────────────────────────
  { slug: 'notifications:read',   module: 'notifications', action: 'read',          description: 'View notifications' },
  { slug: 'notifications:manage', module: 'notifications', action: 'manage',        description: 'Manage notification settings' },

  // ── Subscriptions (Platform Admin) ────────────────────────────────────────
  { slug: 'subscriptions:manage', module: 'subscriptions', action: 'manage',       description: 'Manage subscription plans', isSensitive: true },
];

module.exports = permissionSeeds;
