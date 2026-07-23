const express = require('express');
const router = express.Router();

const staffController = require('./staff.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');
const { updateStaffSchema } = require('./staff.validator');

// All staff routes require authentication
router.use(authenticate);

// GET /api/v1/staff
router.get('/',
  authorize('users:read'),
  asyncHandler(staffController.getAll.bind(staffController))
);

// GET /api/v1/staff/:id
router.get('/:id',
  authorize('users:read'),
  asyncHandler(staffController.getOne.bind(staffController))
);

// PUT /api/v1/staff/:id
router.put('/:id',
  authorize('users:manage'),
  validate(updateStaffSchema),
  asyncHandler(staffController.update.bind(staffController))
);

// PATCH /api/v1/staff/:id/deactivate
router.patch('/:id/deactivate',
  authorize('users:manage'),
  asyncHandler(staffController.deactivate.bind(staffController))
);

// PATCH /api/v1/staff/:id/activate
router.patch('/:id/activate',
  authorize('users:manage'),
  asyncHandler(staffController.activate.bind(staffController))
);

module.exports = router;
