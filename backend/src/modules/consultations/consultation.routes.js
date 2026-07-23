const express = require('express');
const router = express.Router();
const consultationController = require('./consultation.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

// All routes require authentication
router.use(authenticate);

// POST /api/v1/consultations
router.post('/',
  authorize('consultations:write'), // e.g. doctor
  asyncHandler(consultationController.saveConsultation.bind(consultationController))
);

// GET /api/v1/consultations/appointment/:appointmentId
router.get('/appointment/:appointmentId',
  authorize('consultations:read'),
  asyncHandler(consultationController.getConsultation.bind(consultationController))
);

// GET /api/v1/consultations/patient/:patientId/history
router.get('/patient/:patientId/history',
  authorize('consultations:read'),
  asyncHandler(consultationController.getPatientHistory.bind(consultationController))
);

module.exports = router;
