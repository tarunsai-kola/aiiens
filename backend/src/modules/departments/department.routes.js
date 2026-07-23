const express = require('express');
const router = express.Router();

const departmentController = require('./department.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');
const { createDepartmentSchema, updateDepartmentSchema } = require('./department.validator');

// All department routes require authentication
router.use(authenticate);

// GET /api/v1/departments
router.get('/',
  asyncHandler(departmentController.getAll.bind(departmentController))
);

// GET /api/v1/departments/:id
router.get('/:id',
  asyncHandler(departmentController.getOne.bind(departmentController))
);

// POST /api/v1/departments
router.post('/',
  authorize('admin'),
  validate(createDepartmentSchema),
  asyncHandler(departmentController.create.bind(departmentController))
);

// PUT /api/v1/departments/:id
router.put('/:id',
  authorize('admin'),
  validate(updateDepartmentSchema),
  asyncHandler(departmentController.update.bind(departmentController))
);

// DELETE /api/v1/departments/:id
router.delete('/:id',
  authorize('admin'),
  asyncHandler(departmentController.delete.bind(departmentController))
);

module.exports = router;
