const express = require('express');
const router = express.Router();

const doctorController = require('./doctor.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');
const { createDoctorSchema, updateDoctorSchema } = require('./doctor.validator');

// All doctor routes require authentication
router.use(authenticate);

// GET /api/v1/doctors
router.get('/',
  authorize('doctors:read'),
  asyncHandler(doctorController.getAll.bind(doctorController))
);

// GET /api/v1/doctors/:id
router.get('/:id',
  authorize('doctors:read'),
  asyncHandler(doctorController.getOne.bind(doctorController))
);

// GET /api/v1/doctors/user/:userId
router.get('/user/:userId',
  authorize('doctors:read'),
  asyncHandler(doctorController.getByUserId.bind(doctorController))
);

// POST /api/v1/doctors
router.post('/',
  authorize('doctors:write'),
  validate(createDoctorSchema),
  asyncHandler(doctorController.create.bind(doctorController))
);

// PUT /api/v1/doctors/:id
router.put('/:id',
  authorize('doctors:write'),
  validate(updateDoctorSchema),
  asyncHandler(doctorController.update.bind(doctorController))
);

// DELETE /api/v1/doctors/:id
router.delete('/:id',
  authorize('doctors:delete'),
  asyncHandler(doctorController.delete.bind(doctorController))
);

module.exports = router;
