const express = require('express');
const router = express.Router();

const patientController = require('./patient.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');
const { createPatientSchema, updatePatientSchema } = require('./patient.validator');

// All patient routes require authentication
router.use(authenticate);

// GET /api/v1/patients/search?q=...
router.get('/search',
  authorize('patients:read'),
  asyncHandler(patientController.search.bind(patientController))
);

// GET /api/v1/patients
router.get('/',
  authorize('patients:read'),
  asyncHandler(patientController.getAll.bind(patientController))
);

// GET /api/v1/patients/:id
router.get('/:id',
  authorize('patients:read'),
  asyncHandler(patientController.getOne.bind(patientController))
);

// POST /api/v1/patients/register
router.post('/register',
  authorize('patients:write'),
  validate(createPatientSchema),
  asyncHandler(patientController.create.bind(patientController))
);

// PUT /api/v1/patients/:id
router.put('/:id',
  authorize('patients:write'),
  validate(updatePatientSchema),
  asyncHandler(patientController.update.bind(patientController))
);

// DELETE /api/v1/patients/:id
router.delete('/:id',
  authorize('patients:delete'),
  asyncHandler(patientController.delete.bind(patientController))
);

module.exports = router;
