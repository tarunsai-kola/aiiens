const express = require('express');
const router = express.Router();
const labController = require('./laboratory.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

router.use(authenticate);

// --- Test Masters (Blueprints) ---
router.post('/tests',
  authorize('laboratory:create'), // Admin / Pathologist
  asyncHandler(labController.createTestMaster.bind(labController))
);

router.get('/tests',
  authorize('laboratory:read'),
  asyncHandler(labController.getTestMasters.bind(labController))
);

// --- Lab Orders (Patient instances) ---
router.post('/orders',
  authorize('laboratory:create'), // Doctors, Receptionists
  asyncHandler(labController.createLabOrder.bind(labController))
);

router.get('/orders',
  authorize('laboratory:read'),
  asyncHandler(labController.getLabOrders.bind(labController))
);

router.get('/orders/:id',
  authorize('laboratory:read'),
  asyncHandler(labController.getLabOrderById.bind(labController))
);

// --- Workflow Actions ---
// 1. Phlebotomist collects sample
router.put('/orders/:id/collect',
  authorize('laboratory:update'),
  asyncHandler(labController.collectSample.bind(labController))
);

// 2. Technician uploads results
router.put('/orders/:id/results',
  authorize('laboratory:upload_results'),
  asyncHandler(labController.uploadResults.bind(labController))
);

// 3. Pathologist/Doctor verifies report
router.put('/orders/:id/verify',
  authorize('laboratory:update'), // Verifying is an update operation
  asyncHandler(labController.verifyReport.bind(labController))
);

module.exports = router;
