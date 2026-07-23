/**
 * System Role Seeds — Platform-wide roles available to all hospitals.
 * hospitalId: null = system role (not scoped to any hospital)
 *
 * Permissions are listed as slug arrays — aligned with permissionSeeds.
 */

const systemRoleSeeds = [
  {
    name: 'Admin',
    slug: 'admin',
    type: 'system',
    description: 'Full access to all hospital modules and settings',
    hospitalId: null,
    permissions: [
      // Users
      'users:create', 'users:read', 'users:update', 'users:delete', 'users:manage',
      // Roles
      'roles:read', 'roles:create', 'roles:update', 'roles:delete',
      // Patients
      'patients:create', 'patients:read', 'patients:update', 'patients:delete',
      'patients:export', 'patients:view_sensitive',
      // Doctors
      'doctors:create', 'doctors:read', 'doctors:update', 'doctors:delete',
      // Appointments
      'appointments:create', 'appointments:read', 'appointments:update',
      'appointments:delete', 'appointments:approve',
      // Billing
      'billing:create', 'billing:read', 'billing:update', 'billing:delete',
      'billing:export', 'billing:approve',
      // Pharmacy
      'pharmacy:read', 'pharmacy:create', 'pharmacy:update',
      'pharmacy:delete', 'pharmacy:dispense',
      // Laboratory
      'laboratory:read', 'laboratory:create', 'laboratory:update',
      'laboratory:delete', 'laboratory:upload_results', 'laboratory:export',
      // Wards
      'wards:read', 'wards:create', 'wards:update', 'wards:admit', 'wards:discharge',
      // Reports
      'reports:read', 'reports:export',
      // Settings
      'settings:read', 'settings:update',
      // Audit
      'audit:read', 'audit:export',
      // Notifications
      'notifications:read', 'notifications:manage',
    ],
    isDefault: false,
  },
  {
    name: 'Doctor',
    slug: 'doctor',
    type: 'system',
    description: 'Clinical access — patients, appointments, prescriptions, lab results',
    hospitalId: null,
    permissions: [
      'patients:create', 'patients:read', 'patients:update', 'patients:view_sensitive',
      'doctors:read',
      'appointments:create', 'appointments:read', 'appointments:update', 'appointments:approve',
      'billing:read',
      'pharmacy:read', 'pharmacy:dispense',
      'laboratory:read', 'laboratory:create', 'laboratory:update', 'laboratory:upload_results',
      'wards:read', 'wards:admit', 'wards:discharge',
      'reports:read',
      'notifications:read',
    ],
  },
  {
    name: 'Nurse',
    slug: 'nurse',
    type: 'system',
    description: 'Patient care — view and update patient records, appointments, wards',
    hospitalId: null,
    permissions: [
      'patients:read', 'patients:update',
      'appointments:read', 'appointments:update',
      'pharmacy:read',
      'laboratory:read',
      'wards:read', 'wards:admit', 'wards:discharge',
      'notifications:read',
    ],
  },
  {
    name: 'Receptionist',
    slug: 'receptionist',
    type: 'system',
    description: 'Front desk — patient registration, appointments, basic billing',
    hospitalId: null,
    isDefault: true, // Default role when no role specified at registration
    permissions: [
      'patients:create', 'patients:read', 'patients:update',
      'doctors:read',
      'appointments:create', 'appointments:read', 'appointments:update',
      'appointments:delete', 'appointments:approve',
      'billing:create', 'billing:read', 'billing:update', 'billing:approve',
      'notifications:read',
    ],
  },
  {
    name: 'Pharmacist',
    slug: 'pharmacist',
    type: 'system',
    description: 'Pharmacy management — inventory, dispensing, prescriptions',
    hospitalId: null,
    permissions: [
      'patients:read',
      'pharmacy:read', 'pharmacy:create', 'pharmacy:update', 'pharmacy:dispense',
      'notifications:read',
    ],
  },
  {
    name: 'Lab Technician',
    slug: 'lab_technician',
    type: 'system',
    description: 'Laboratory — process test orders, upload results',
    hospitalId: null,
    permissions: [
      'patients:read',
      'laboratory:read', 'laboratory:create', 'laboratory:update',
      'laboratory:upload_results', 'laboratory:export',
      'notifications:read',
    ],
  },
  {
    name: 'Patient',
    slug: 'patient',
    type: 'system',
    description: 'Patient portal access — view own records, book appointments',
    hospitalId: null,
    permissions: [
      'appointments:create', 'appointments:read',
      'notifications:read',
    ],
  },
];

module.exports = systemRoleSeeds;
