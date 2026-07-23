const express = require('express');
const router = express.Router();
const hrController = require('./hr.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/rbac.middleware');
const asyncHandler = require('../../middlewares/asyncHandler');

router.use(authenticate);

// --- STAFF PROFILES ---
router.get('/staff', authorize('hr:read'), asyncHandler(hrController.getStaffList.bind(hrController)));
router.put('/staff/:userId', authorize('hr:write'), asyncHandler(hrController.updateStaffProfile.bind(hrController)));

// --- SHIFTS & ROSTER ---
router.post('/shifts', authorize('hr:write'), asyncHandler(hrController.createShift.bind(hrController)));
router.get('/shifts', authorize('hr:read'), asyncHandler(hrController.getShifts.bind(hrController)));
router.post('/roster', authorize('hr:write'), asyncHandler(hrController.assignRoster.bind(hrController)));
router.get('/roster', authorize('hr:read'), asyncHandler(hrController.getRoster.bind(hrController)));

// --- ATTENDANCE ---
router.post('/attendance', authorize('hr:write'), asyncHandler(hrController.markAttendance.bind(hrController)));
router.get('/attendance', authorize('hr:read'), asyncHandler(hrController.getAttendance.bind(hrController)));

// --- LEAVES ---
// Any authenticated user can request a leave for themselves
router.post('/leaves', asyncHandler(hrController.requestLeave.bind(hrController)));
// Only HR can view all and update status
router.get('/leaves', authorize('hr:read'), asyncHandler(hrController.getLeaveRequests.bind(hrController)));
router.put('/leaves/:id/status', authorize('hr:write'), asyncHandler(hrController.updateLeaveStatus.bind(hrController)));

// --- PAYROLL ---
router.post('/payroll/generate', authorize('hr:write'), asyncHandler(hrController.generatePayroll.bind(hrController)));
router.get('/payroll', authorize('hr:read'), asyncHandler(hrController.getPayrolls.bind(hrController)));
router.put('/payroll/:id/pay', authorize('hr:write'), asyncHandler(hrController.paySalary.bind(hrController)));

module.exports = router;
