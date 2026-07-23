const express = require('express');
const router = express.Router();
const appointmentController = require('./appointment.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

// All routes require authentication
router.use(authenticate);

// Generate a Token (Receptionist, Admin)
router.post('/token',
  authorize('appointments:write'), // Or specific OP desk permission
  asyncHandler(appointmentController.generateToken.bind(appointmentController))
);

// Get Doctor Queue
router.get('/queue',
  // authorize('appointments:read'), 
  asyncHandler(appointmentController.getDoctorQueue.bind(appointmentController))
);

// Update Status (Call Next, Complete, Hold)
router.patch('/:id/status',
  // authorize('appointments:write'), 
  asyncHandler(appointmentController.updateStatus.bind(appointmentController))
);

// Transfer Patient
router.post('/:id/transfer',
  asyncHandler(appointmentController.transfer.bind(appointmentController))
);

module.exports = router;
