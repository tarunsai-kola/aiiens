const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

router.use(authenticate);

// All routes require 'reports:read' or standard admin privileges
router.use(authorize('reports:read'));

router.get('/revenue/trend', asyncHandler(reportsController.getRevenueTrend.bind(reportsController)));
router.get('/revenue/department', asyncHandler(reportsController.getRevenueByDepartment.bind(reportsController)));
router.get('/pharmacy/top', asyncHandler(reportsController.getTopMedicines.bind(reportsController)));
router.get('/appointments/stats', asyncHandler(reportsController.getAppointmentStats.bind(reportsController)));
router.get('/patients/demographics', asyncHandler(reportsController.getPatientDemographics.bind(reportsController)));

module.exports = router;
