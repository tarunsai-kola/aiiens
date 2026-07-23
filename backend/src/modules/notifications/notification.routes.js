const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

router.use(authenticate);

// Logged-in user fetching their own socket notifications
router.get('/my', asyncHandler(notificationController.getMyNotifications.bind(notificationController)));
router.put('/:id/read', asyncHandler(notificationController.markAsRead.bind(notificationController)));

// Admin viewing all outbound SMS/Email logs
router.get('/logs', authorize('admin'), asyncHandler(notificationController.getAdminLogs.bind(notificationController)));

module.exports = router;
