const { Hospital } = require('../models/Hospital.model');
const ApiError = require('../utils/ApiError');

/**
 * tenantMiddleware — Resolves and validates the current hospital tenant
 * from the authenticated user's JWT payload.
 *
 * This middleware runs AFTER authenticate middleware.
 * It attaches `req.hospital` for downstream use.
 *
 * What it enforces:
 * 1. Hospital exists
 * 2. Hospital is active (isActive = true)
 * 3. Hospital subscription is not cancelled/suspended
 * 4. Hospital trial hasn't expired
 *
 * Usage in routes:
 *   router.use(authenticate, tenantMiddleware);
 *   // Now all handlers have req.user AND req.hospital
 */
const tenantMiddleware = async (req, _res, next) => {
  try {
    const hospitalId = req.user?.hospitalId;

    if (!hospitalId) {
      return next(
        ApiError.unauthorized('Hospital context missing from token. Please re-login.')
      );
    }

    const hospital = await Hospital.findById(hospitalId)
      .populate('subscriptionPlanId', 'name slug features limits')
      .lean();

    if (!hospital) {
      return next(ApiError.notFound('Hospital not found. Account may have been removed.'));
    }

    if (!hospital.isActive) {
      return next(
        ApiError.forbidden(
          'Your hospital account has been deactivated. Please contact support.'
        )
      );
    }

    if (hospital.subscriptionStatus === 'suspended') {
      return next(
        ApiError.forbidden(
          'Your subscription has been suspended due to a billing issue. Please update your payment method.'
        )
      );
    }

    if (hospital.subscriptionStatus === 'cancelled') {
      return next(
        ApiError.forbidden(
          'Your subscription has been cancelled. Please contact support to reactivate.'
        )
      );
    }

    if (
      hospital.subscriptionStatus === 'trial' &&
      hospital.trialEndsAt &&
      new Date(hospital.trialEndsAt) < new Date()
    ) {
      return next(
        ApiError.forbidden(
          'Your free trial has expired. Please subscribe to a plan to continue.'
        )
      );
    }

    // Attach to request for downstream use
    req.hospital = hospital;
    req.hospitalId = hospital._id;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { tenantMiddleware };
