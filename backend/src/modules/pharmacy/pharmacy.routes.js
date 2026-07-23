const express = require('express');
const router = express.Router();
const pharmacyController = require('./pharmacy.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

router.use(authenticate);

// Inventory
router.post('/inventory',
  authorize('pharmacy:write'),
  asyncHandler(pharmacyController.addInventory.bind(pharmacyController))
);

router.get('/inventory',
  authorize('pharmacy:read'),
  asyncHandler(pharmacyController.getInventory.bind(pharmacyController))
);

router.get('/search',
  authorize('pharmacy:read'),
  asyncHandler(pharmacyController.searchInventory.bind(pharmacyController))
);

// Prescriptions Queue
router.get('/queue',
  authorize('pharmacy:read'),
  asyncHandler(pharmacyController.getIncomingPrescriptions.bind(pharmacyController))
);

// Dispense & Billing
router.post('/dispense',
  authorize('pharmacy:write'),
  asyncHandler(pharmacyController.dispense.bind(pharmacyController))
);

module.exports = router;
