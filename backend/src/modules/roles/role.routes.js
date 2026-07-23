const express = require('express');
const router = express.Router();

const roleController = require('./role.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const validate = require('../../middlewares/validate.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');
const { createRoleSchema, updateRoleSchema } = require('./role.validator');

// All role routes require authentication
router.use(authenticate);

// GET /api/v1/roles/permissions
router.get('/permissions',
  authorize('roles:read'),
  asyncHandler(roleController.getPermissions.bind(roleController))
);

// GET /api/v1/roles
router.get('/',
  authorize('roles:read'),
  asyncHandler(roleController.getAll.bind(roleController))
);

// GET /api/v1/roles/:id
router.get('/:id',
  authorize('roles:read'),
  asyncHandler(roleController.getOne.bind(roleController))
);

// POST /api/v1/roles
router.post('/',
  authorize('roles:write'),
  validate(createRoleSchema),
  asyncHandler(roleController.create.bind(roleController))
);

// PUT /api/v1/roles/:id
router.put('/:id',
  authorize('roles:write'),
  validate(updateRoleSchema),
  asyncHandler(roleController.update.bind(roleController))
);

// DELETE /api/v1/roles/:id
router.delete('/:id',
  authorize('roles:delete'),
  asyncHandler(roleController.delete.bind(roleController))
);

module.exports = router;
