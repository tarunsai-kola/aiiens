// ── User Roles ────────────────────────────────────────────────────────────────
export const ROLES = {
  ADMIN:          'admin',
  DOCTOR:         'doctor',
  NURSE:          'nurse',
  RECEPTIONIST:   'receptionist',
  PHARMACIST:     'pharmacist',
  LAB_TECHNICIAN: 'lab_technician',
  PATIENT:        'patient',
};

// ── Appointment Statuses ──────────────────────────────────────────────────────
export const APPOINTMENT_STATUS = {
  SCHEDULED:  'scheduled',
  CONFIRMED:  'confirmed',
  IN_PROGRESS:'in_progress',
  COMPLETED:  'completed',
  CANCELLED:  'cancelled',
  NO_SHOW:    'no_show',
};

// ── Billing Statuses ──────────────────────────────────────────────────────────
export const BILLING_STATUS = {
  PENDING:    'pending',
  PAID:       'paid',
  PARTIAL:    'partial',
  CANCELLED:  'cancelled',
  REFUNDED:   'refunded',
};

// ── Gender Options ────────────────────────────────────────────────────────────
export const GENDER_OPTIONS = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
];

// ── Blood Group Options ───────────────────────────────────────────────────────
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// ── API Base URL ──────────────────────────────────────────────────────────────
export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
