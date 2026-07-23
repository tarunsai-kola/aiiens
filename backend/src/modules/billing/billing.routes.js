const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

router.use(authenticate);

// Reports
router.get('/reports/collection',
  authorize('billing:read'),
  asyncHandler(billingController.getCollectionReport.bind(billingController))
);

// Bills
router.post('/',
  authorize('billing:write'),
  asyncHandler(billingController.createBill.bind(billingController))
);

router.get('/',
  authorize('billing:read'),
  asyncHandler(billingController.getBills.bind(billingController))
);

router.get('/:id',
  authorize('billing:read'),
  asyncHandler(billingController.getBill.bind(billingController))
);

// Payments
router.post('/:id/payments',
  authorize('billing:write'),
  asyncHandler(billingController.addPayment.bind(billingController))
);

module.exports = router;
