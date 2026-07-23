const mongoose = require('mongoose');

/**
 * Hospital — The tenant root document.
 * This is NOT tenant-scoped itself (it IS the tenant).
 * Every other tenant-scoped collection references hospitals._id as hospitalId.
 *
 * IMPORTANT: Do NOT apply tenantPlugin to this schema.
 */

const addressSchema = new mongoose.Schema(
  {
    street:  { type: String, trim: true },
    city:    { type: String, trim: true },
    state:   { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    primaryPhone:   { type: String, trim: true },
    secondaryPhone: { type: String, trim: true },
    email:          { type: String, lowercase: true, trim: true },
    website:        { type: String, trim: true },
    emergencyLine:  { type: String, trim: true },
  },
  { _id: false }
);

// Per-hospital feature overrides (can extend or restrict plan defaults)
const featureOverridesSchema = new mongoose.Schema(
  {
    pharmacyModule:     { type: Boolean },
    laboratoryModule:   { type: Boolean },
    wardsModule:        { type: Boolean },
    advancedReports:    { type: Boolean },
    apiAccess:          { type: Boolean },
    whiteLabel:         { type: Boolean },
    customRoles:        { type: Boolean },
    smsNotifications:   { type: Boolean },
    whatsappNotifications: { type: Boolean },
  },
  { _id: false }
);

const hospitalSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      maxlength: [150, 'Hospital name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Used in subdomains: apollo-delhi.hms.com
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    registrationNumber: {
      type: String,
      trim: true,
      // Government-issued hospital registration ID
    },
    type: {
      type: String,
      required: true,
      enum: ['general', 'specialty', 'clinic', 'diagnostic', 'nursing_home', 'multispecialty'],
      default: 'general',
    },
    specializations: [
      {
        type: String,
        trim: true,
        // e.g. "Cardiology", "Neurology", "Orthopedics"
      },
    ],
    bedCount: {
      type: Number,
      default: 0,
    },

    // ── Contact & Location ────────────────────────────────────────────────────
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    contact: {
      type: contactSchema,
      default: () => ({}),
    },

    // ── Subscription ──────────────────────────────────────────────────────────
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      required: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['trial', 'active', 'past_due', 'suspended', 'cancelled'],
      default: 'trial',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'annually'],
      default: 'monthly',
    },
    trialEndsAt: {
      type: Date,
      // Automatically set to 14 days from createdAt in service layer
    },
    subscriptionStartedAt: {
      type: Date,
    },
    subscriptionEndsAt: {
      type: Date,
    },
    lastBilledAt: {
      type: Date,
    },

    // ── Feature Overrides ─────────────────────────────────────────────────────
    featureOverrides: {
      type: featureOverridesSchema,
      default: () => ({}),
      // These override plan-level features for this specific hospital.
      // Allows granting early access to premium features or restricting defaults.
    },

    // ── Branding ──────────────────────────────────────────────────────────────
    branding: {
      logoUrl:      { type: String },
      faviconUrl:   { type: String },
      primaryColor: { type: String, default: '#2563eb' },
      theme:        { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    },

    // ── Admin ─────────────────────────────────────────────────────────────────
    ownerId: {
      // The super-admin user of this hospital (set after first user created)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
      // false = blocks ALL API access for this hospital
    },
    isVerified: {
      type: Boolean,
      default: false,
      // Verified by platform admin after document review
    },
    onboardingCompletedAt: {
      type: Date,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Flexible field for platform-internal notes, CRM data, etc.
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
hospitalSchema.index({ slug: 1 }, { unique: true });
hospitalSchema.index({ subscriptionStatus: 1, isActive: 1 });
hospitalSchema.index({ subscriptionPlanId: 1 });
hospitalSchema.index({ 'address.city': 1, 'address.state': 1 });
hospitalSchema.index({ createdAt: -1 });

// ── Virtuals ──────────────────────────────────────────────────────────────────
hospitalSchema.virtual('isTrialing').get(function () {
  return this.subscriptionStatus === 'trial' && this.trialEndsAt > new Date();
});

hospitalSchema.virtual('isSubscriptionActive').get(function () {
  return ['active', 'trial'].includes(this.subscriptionStatus) && this.isActive;
});

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = { Hospital };
