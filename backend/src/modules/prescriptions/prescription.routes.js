const express = require('express');
const router = express.Router();
const prescriptionController = require('./prescription.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

// All routes require authentication
router.use(authenticate);

// GET /api/v1/prescriptions/medicines/search
router.get('/medicines/search',
  authorize('prescriptions:read', 'consultations:write'),
  asyncHandler(prescriptionController.searchMedicines.bind(prescriptionController))
);

// POST /api/v1/prescriptions
router.post('/',
  authorize('prescriptions:write', 'consultations:write'),
  asyncHandler(prescriptionController.savePrescription.bind(prescriptionController))
);

// GET /api/v1/prescriptions/consultation/:consultationId
router.get('/consultation/:consultationId',
  authorize('prescriptions:read', 'consultations:read'),
  asyncHandler(prescriptionController.getPrescription.bind(prescriptionController))
);

module.exports = router;
