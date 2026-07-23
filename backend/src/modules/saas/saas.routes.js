const express = require('express');
const router = express.Router();
const saasController = require('./saas.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

// ONLY superadmin can access these routes
router.use(authenticate, authorize('superadmin'));

router.get('/dashboard/stats', asyncHandler(saasController.getDashboardStats.bind(saasController)));

router.get('/hospitals', asyncHandler(saasController.getHospitals.bind(saasController)));
router.put('/hospitals/:id/status', asyncHandler(saasController.toggleHospital.bind(saasController)));

router.get('/plans', asyncHandler(saasController.getPlans.bind(saasController)));
router.put('/plans/:id', asyncHandler(saasController.updatePlan.bind(saasController)));

router.get('/tickets', asyncHandler(saasController.getTickets.bind(saasController)));
router.put('/tickets/:id/status', asyncHandler(saasController.updateTicket.bind(saasController)));

router.get('/logs', asyncHandler(saasController.getLogs.bind(saasController)));

module.exports = router;
