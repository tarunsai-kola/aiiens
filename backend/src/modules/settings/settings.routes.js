const express = require('express');
const router = express.Router();

const settingsController = require('./settings.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');
const { updateSettingsSchema, updateHospitalSchema } = require('./settings.validator');

// All settings routes require authentication
router.use(authenticate);

// ── Settings ─────────────────────────────────────────────────────────────────

// GET /api/v1/settings
router.get('/',
  authorize('settings:read'),
  asyncHandler(settingsController.getSettings.bind(settingsController))
);

// PUT /api/v1/settings
router.put('/',
  authorize('settings:update'),
  validate(updateSettingsSchema),
  asyncHandler(settingsController.updateSettings.bind(settingsController))
);

// ── Hospital Profile ─────────────────────────────────────────────────────────

// GET /api/v1/settings/hospital
router.get('/hospital',
  authorize('settings:read'),
  asyncHandler(settingsController.getHospitalProfile.bind(settingsController))
);

// PUT /api/v1/settings/hospital
router.put('/hospital',
  authorize('settings:update'),
  validate(updateHospitalSchema),
  asyncHandler(settingsController.updateHospitalProfile.bind(settingsController))
);

module.exports = router;
