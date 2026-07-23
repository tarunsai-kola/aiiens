/**
 * Centralized Constants for the Aiiens HMS System.
 * Extracting magic strings to prevent typos and ensure consistency across models and controllers.
 */

const APPOINTMENT_STATUS = Object.freeze({
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show'
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
});

const PAYMENT_METHOD = Object.freeze({
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card',
  INSURANCE: 'Insurance'
});

const ROLES = Object.freeze({
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  PHARMACIST: 'pharmacist',
  LAB_TECHNICIAN: 'lab_technician',
  ACCOUNTANT: 'accountant'
});

const SUBSCRIPTION_STATUS = Object.freeze({
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled'
});

const TICKET_STATUS = Object.freeze({
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved'
});

module.exports = {
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  ROLES,
  SUBSCRIPTION_STATUS,
  TICKET_STATUS
};
