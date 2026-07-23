const express = require('express');
const router = express.Router();
const vitalsController = require('./vitals.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const { saveVitalsSchema } = require('./vitals.validator');
const asyncHandler = require('../../middlewares/asyncHandler');

// All routes require authentication
router.use(authenticate);

// POST /api/v1/vitals
router.post('/',
  authorize('vitals:write'), // e.g. nurses, doctors
  validate(saveVitalsSchema),
  asyncHandler(vitalsController.saveVitals.bind(vitalsController))
);

// GET /api/v1/vitals/appointment/:appointmentId
router.get('/appointment/:appointmentId',
  authorize('vitals:read'),
  asyncHandler(vitalsController.getVitals.bind(vitalsController))
);

module.exports = router;
