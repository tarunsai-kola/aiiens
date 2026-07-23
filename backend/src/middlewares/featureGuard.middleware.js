const { Hospital } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * featureGuard — Middleware factory that checks if a specific feature
 * is enabled for the current hospital's subscription plan.
 *
 * It merges plan-level features with hospital-level overrides:
 *   effective = { ...plan.features, ...hospital.featureOverrides }
 *
 * Usage:
 *   router.use(authenticate, tenantMiddleware, featureGuard('pharmacyModule'));
 *   router.use(authenticate, tenantMiddleware, featureGuard('laboratoryModule'));
 *
 * @param {string} featureKey - Key from featureFlagsSchema
 * @returns {Function} Express middleware
 */
const featureGuard = (featureKey) => {
  return (req, _res, next) => {
    const hospital = req.hospital;

    if (!hospital) {
      return next(ApiError.internal('tenantMiddleware must run before featureGuard'));
    }

    const planFeatures      = hospital.subscriptionPlanId?.features || {};
    const hospitalOverrides = hospital.featureOverrides || {};

    // Hospital-level overrides take precedence over plan defaults
    const effectiveFeatures = { ...planFeatures, ...hospitalOverrides };

    if (!effectiveFeatures[featureKey]) {
      return next(
        ApiError.forbidden(
          `The '${featureKey}' feature is not available on your current plan. ` +
          `Please upgrade to access this module.`
        )
      );
    }

    next();
  };
};

module.exports = { featureGuard };
