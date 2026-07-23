const hrService = require('./hr.service');
const ApiResponse = require('../../utils/ApiResponse');

class HRController {
  // --- STAFF PROFILES ---
  async getStaffList(req, res) {
    const data = await hrService.getStaffList(req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Staff list retrieved', data));
  }

  async updateStaffProfile(req, res) {
    const data = await hrService.upsertStaffProfile(req.params.userId, req.user.hospitalId, req.body);
    res.status(200).json(ApiResponse.success('Staff profile updated', data));
  }

  // --- SHIFTS & ROSTER ---
  async createShift(req, res) {
    const data = await hrService.createShift(req.body, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Shift created', data));
  }

  async getShifts(req, res) {
    const data = await hrService.getShifts(req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Shifts retrieved', data));
  }

  async assignRoster(req, res) {
    const data = await hrService.assignRoster(req.body, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Roster assigned', data));
  }

  async getRoster(req, res) {
    const { startDate, endDate } = req.query;
    const data = await hrService.getRoster(req.user.hospitalId, startDate, endDate);
    res.status(200).json(ApiResponse.success('Roster retrieved', data));
  }

  // --- ATTENDANCE ---
  async markAttendance(req, res) {
    const data = await hrService.markAttendance(req.body, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Attendance marked', data));
  }

  async getAttendance(req, res) {
    const { date } = req.query;
    const data = await hrService.getAttendance(req.user.hospitalId, date);
    res.status(200).json(ApiResponse.success('Attendance retrieved', data));
  }

  // --- LEAVES ---
  async requestLeave(req, res) {
    // Employee requesting for themselves
    const data = await hrService.requestLeave(req.body, req.user.id, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Leave requested', data));
  }

  async getLeaveRequests(req, res) {
    const data = await hrService.getLeaveRequests(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Leaves retrieved', data));
  }

  async updateLeaveStatus(req, res) {
    const { status } = req.body;
    const data = await hrService.updateLeaveStatus(req.params.id, status, req.user.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success(`Leave ${status}`, data));
  }

  // --- PAYROLL ---
  async generatePayroll(req, res) {
    const { month, year } = req.body;
    const data = await hrService.generatePayroll(month, year, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Payroll generated', data));
  }

  async getPayrolls(req, res) {
    const { month, year } = req.query;
    const data = await hrService.getPayrolls(month, year, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Payrolls retrieved', data));
  }

  async paySalary(req, res) {
    const data = await hrService.paySalary(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Salary paid', data));
  }
}

module.exports = new HRController();
