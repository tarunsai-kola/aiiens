const mongoose               = require('mongoose');
const { Hospital }           = require('../../models/Hospital.model');
const { SubscriptionPlan }   = require('../../models/SubscriptionPlan.model');
const { User }               = require('../auth/auth.model');
const { Role }               = require('../roles/role.model');
const { Settings }           = require('../settings/settings.model');
const { generateAccessToken, generateRefreshToken } = require('../../utils/generateToken');
const emailService           = require('../../utils/emailService');
const ApiError               = require('../../utils/ApiError');
const logger                 = require('../../config/logger');
const { withTransaction }    = require('../../utils/transaction');

/**
 * HospitalService — Handles hospital registration.
 *
 * Registration flow (atomic via Mongoose session):
 *   1. Validate plan slug → get plan
 *   2. Check hospital name uniqueness (slug)
 *   3. Create Hospital document
 *   4. Create Settings document
 *   5. Resolve admin role (system role)
 *   6. Create first admin User
 *   7. Link hospital.ownerId → user._id
 *   8. Send welcome email
 *   9. Return tokens for immediate login
 *
 * All steps run inside a MongoDB session (transaction) —
 * if any step fails, all changes roll back.
 */
class HospitalService {
  async register({
    hospitalName, hospitalType, hospitalPhone, hospitalEmail,
    city, state, planSlug,
    firstName, lastName, adminEmail, adminPassword, phone,
  }) {
    // ── 1. Find plan ────────────────────────────────────────────────────────
    const plan = await SubscriptionPlan.findOne({ slug: planSlug, isActive: true });
    if (!plan) throw ApiError.badRequest('Selected plan is not available');

    // ── 2. Generate slug ────────────────────────────────────────────────────
    const slug = this._slugify(hospitalName);
    const slugExists = await Hospital.exists({ slug });
    if (slugExists) {
      throw ApiError.conflict(
        'A hospital with a similar name already exists. Please use a more specific name.'
      );
    }

    // ── 3. Get admin role (system role) ────────────────────────────────────
    const adminRole = await Role.findOne({ slug: 'admin', type: 'system' }, null, {
      _bypassTenantCheck: true,
    });
    if (!adminRole) {
      throw ApiError.internal('System roles not seeded. Run: npm run seed');
    }

    // ── 4. Start MongoDB Session (Transaction) ─────────────────────────────
    return withTransaction(async (session) => {
      // ── 5. Create Hospital ───────────────────────────────────────────────
      const trialEndsAt = new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000);

      const [hospital] = await Hospital.create([{
        name:               hospitalName,
        slug,
        type:               hospitalType || 'general',
        contact: {
          primaryPhone: hospitalPhone,
          email:        hospitalEmail,
        },
        address: { city, state },
        subscriptionPlanId:    plan._id,
        subscriptionStatus:    'trial',
        trialEndsAt,
        isActive:              true,
        isVerified:            false,
      }], { session });

      // ── 6. Create default Settings ────────────────────────────────────────
      await Settings.create([{
        hospitalId: hospital._id,
      }], { session });

      // ── 7. Create first Admin User ────────────────────────────────────────
      const [user] = await User.create([{
        hospitalId:      hospital._id,
        firstName,
        lastName,
        email:           adminEmail,
        password:        adminPassword,  // pre-save hook hashes
        phone,
        roleId:          adminRole._id,
        isActive:        true,
        isEmailVerified: true,  // First admin auto-verified
      }], { session });

      // ── 8. Link owner to hospital ─────────────────────────────────────────
      await Hospital.findByIdAndUpdate(hospital._id, { ownerId: user._id }, { session });

      // ── 9. Populate role for token generation ─────────────────────────────
      await user.populate({ path: 'roleId', select: 'name slug permissions' });

      // ── 10. Generate tokens ───────────────────────────────────────────────
      const permissions = adminRole.permissions || [];
      const payload = {
        id:          user._id,
        hospitalId:  hospital._id,
        role:        'admin',
        email:       user.email,
        permissions,
      };
      const accessToken  = generateAccessToken(payload);
      const refreshToken = generateRefreshToken({ id: user._id, hospitalId: hospital._id });

      // Store refresh token
      await User.findByIdAndUpdate(user._id, { refreshToken });

      // ── 11. Send welcome email (non-blocking) ─────────────────────────────
      emailService.sendWelcome({
        to:           adminEmail,
        name:         firstName,
        hospitalName: hospitalName,
        loginUrl:     process.env.CLIENT_URL,
      }).catch((err) => logger.error('Welcome email error:', err.message));

      logger.info(`Hospital registered: ${hospitalName} (${hospital._id}), admin: ${adminEmail}`);

      return {
        hospital,
        user,
        accessToken,
        refreshToken,
      };
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  _slugify(name) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);
  }
}

module.exports = new HospitalService();
