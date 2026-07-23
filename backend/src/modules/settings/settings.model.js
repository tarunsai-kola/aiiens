const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

/**
 * Settings — Tenant-scoped. One document per hospital.
 *
 * Stores all hospital-specific configuration.
 * Separated from the Hospital document because:
 *   1. Settings change frequently (admin edits)
 *   2. Hospital identity/subscription data changes rarely
 *   3. Separation prevents write amplification on the core Hospital document
 *
 * Enforced: unique index on hospitalId
 */

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const generalSettingsSchema = new mongoose.Schema(
  {
    timezone:     { type: String, default: 'Asia/Kolkata' },
    currency:     { type: String, default: 'INR' },
    language:     { type: String, default: 'en' },
    dateFormat:   { type: String, default: 'DD/MM/YYYY', enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
    timeFormat:   { type: String, default: '12h', enum: ['12h', '24h'] },
    fiscalYearStart: { type: String, default: 'April' },
  },
  { _id: false }
);

const workingHoursSchema = new mongoose.Schema(
  {
    day:    { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
    open:   { type: String, default: '09:00' }, // HH:MM
    close:  { type: String, default: '17:00' }, // HH:MM
    isOpen: { type: Boolean, default: true },
  },
  { _id: false }
);

const appointmentSettingsSchema = new mongoose.Schema(
  {
    slotDurationMinutes:     { type: Number, default: 15, enum: [10, 15, 20, 30, 45, 60] },
    maxAdvanceBookingDays:   { type: Number, default: 30 },
    cancellationWindowHours: { type: Number, default: 24 },
    autoConfirm:             { type: Boolean, default: false },
    allowOnlineBooking:      { type: Boolean, default: true },
    workingHours: {
      type: [workingHoursSchema],
      default: () => [
        { day: 'monday',    open: '09:00', close: '17:00', isOpen: true },
        { day: 'tuesday',   open: '09:00', close: '17:00', isOpen: true },
        { day: 'wednesday', open: '09:00', close: '17:00', isOpen: true },
        { day: 'thursday',  open: '09:00', close: '17:00', isOpen: true },
        { day: 'friday',    open: '09:00', close: '17:00', isOpen: true },
        { day: 'saturday',  open: '09:00', close: '13:00', isOpen: true },
        { day: 'sunday',    open: '09:00', close: '13:00', isOpen: false },
      ],
    },
    holidays: [{ type: Date }],
  },
  { _id: false }
);

const billingSettingsSchema = new mongoose.Schema(
  {
    taxRate:          { type: Number, default: 18, min: 0, max: 100 }, // GST %
    invoicePrefix:    { type: String, default: 'INV' },
    invoiceCounter:   { type: Number, default: 1 },
    gstNumber:        { type: String },
    panNumber:        { type: String },
    paymentMethods:   { type: [String], default: ['cash', 'card', 'upi', 'netbanking'] },
    autoGenerateBill: { type: Boolean, default: false },
    billFooterNote:   { type: String },
  },
  { _id: false }
);

const notificationSettingsSchema = new mongoose.Schema(
  {
    emailEnabled:     { type: Boolean, default: true },
    smsEnabled:       { type: Boolean, default: false },
    whatsappEnabled:  { type: Boolean, default: false },
    pushEnabled:      { type: Boolean, default: false },
    // Provider configs (store credentials encrypted in production)
    emailProvider:    { type: String, enum: ['smtp', 'sendgrid', 'aws_ses'], default: 'smtp' },
    smsProvider:      { type: String, enum: ['twilio', 'msg91', 'fast2sms'] },
    appointmentReminder: {
      enabled:        { type: Boolean, default: true },
      hoursBefore:    { type: Number, default: 24 },
    },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    // hospitalId injected by tenantPlugin

    general:       { type: generalSettingsSchema,      default: () => ({}) },
    appointment:   { type: appointmentSettingsSchema,  default: () => ({}) },
    billing:       { type: billingSettingsSchema,      default: () => ({}) },
    notifications: { type: notificationSettingsSchema, default: () => ({}) },

    // Branding (duplicated here for fast read without joining hospitals)
    branding: {
      logoUrl:      { type: String },
      faviconUrl:   { type: String },
      primaryColor: { type: String, default: '#2563eb' },
      theme:        { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      hospitalTagline: { type: String },
    },

    // Track who last changed settings
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// ── Apply Tenant Plugin ───────────────────────────────────────────────────────
settingsSchema.plugin(tenantPlugin);

// ── Indexes ───────────────────────────────────────────────────────────────────
// ONE settings document per hospital — enforced by unique index
settingsSchema.index({ hospitalId: 1 }, { unique: true });

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = { Settings };
