const mongoose = require('mongoose');

/**
 * SubscriptionPlan — Global collection (NOT tenant-scoped).
 * Defines what each pricing tier allows in terms of features and limits.
 * Plans are platform-wide; hospitals subscribe to a plan.
 */
const featureFlagsSchema = new mongoose.Schema(
  {
    patientsModule:     { type: Boolean, default: true },
    doctorsModule:      { type: Boolean, default: true },
    appointmentsModule: { type: Boolean, default: true },
    billingModule:      { type: Boolean, default: true },
    pharmacyModule:     { type: Boolean, default: false },
    laboratoryModule:   { type: Boolean, default: false },
    wardsModule:        { type: Boolean, default: false },
    advancedReports:    { type: Boolean, default: false },
    apiAccess:          { type: Boolean, default: false },
    whiteLabel:         { type: Boolean, default: false },
    auditLogs:          { type: Boolean, default: true },
    customRoles:        { type: Boolean, default: false },
    multiLocation:      { type: Boolean, default: false },
    smsNotifications:   { type: Boolean, default: false },
    whatsappNotifications: { type: Boolean, default: false },
  },
  { _id: false }
);

const planLimitsSchema = new mongoose.Schema(
  {
    maxUsers:     { type: Number, default: 10 },
    maxPatients:  { type: Number, default: 1000 },
    maxDoctors:   { type: Number, default: 5 },
    storageGB:    { type: Number, default: 10 },
    maxLocations: { type: Number, default: 1 },
    apiCallsPerDay: { type: Number, default: 0 }, // 0 = no API access
  },
  { _id: false }
);

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      enum: ['Starter', 'Growth', 'Professional', 'Enterprise'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // e.g. 'starter', 'growth', 'professional', 'enterprise'
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      monthly: { type: Number, required: true, min: 0 },
      annually: { type: Number, required: true, min: 0 }, // Usually discounted
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
    },
    trialDays: {
      type: Number,
      default: 14,
    },
    limits: {
      type: planLimitsSchema,
      default: () => ({}),
    },
    features: {
      type: featureFlagsSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
subscriptionPlanSchema.index({ slug: 1 }, { unique: true });
subscriptionPlanSchema.index({ isActive: 1, sortOrder: 1 });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
module.exports = { SubscriptionPlan };
