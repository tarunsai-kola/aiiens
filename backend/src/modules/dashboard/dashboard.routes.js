const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

router.use(authenticate);

router.get('/stats', asyncHandler(dashboardController.getStats.bind(dashboardController)));

module.exports = router;
