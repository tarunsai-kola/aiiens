const express = require('express');
const router = express.Router();
const appointmentController = require('./appointment.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

// All routes require authentication
router.use(authenticate);

// GET /api/v1/appointments — Paginated list (admin/manager)
router.get('/',
  authorize('appointments:read', 'receptionist', 'opdesk'),
  asyncHandler(appointmentController.getAll.bind(appointmentController))
);

// GET /api/v1/appointments/stats — Today's stats
router.get('/stats',
  authorize('appointments:read', 'receptionist', 'opdesk'),
  asyncHandler(appointmentController.getStats.bind(appointmentController))
);

// Generate a Token (Receptionist, Admin)
router.post('/token',
  authorize('appointments:create', 'receptionist', 'opdesk'),
  asyncHandler(appointmentController.generateToken.bind(appointmentController))
);

// Get Doctor Queue (all roles with appointments:read can view)
router.get('/queue',
  authorize('appointments:read', 'receptionist', 'opdesk'),
  asyncHandler(appointmentController.getDoctorQueue.bind(appointmentController))
);

// Update Status (Call Next, Complete, Hold)
router.patch('/:id/status',
  authorize('appointments:update', 'receptionist', 'opdesk'),
  asyncHandler(appointmentController.updateStatus.bind(appointmentController))
);

// Transfer Patient
router.post('/:id/transfer',
  authorize('appointments:update', 'receptionist', 'opdesk'),
  asyncHandler(appointmentController.transfer.bind(appointmentController))
);

module.exports = router;
