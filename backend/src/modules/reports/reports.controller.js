const reportsService = require('./reports.service');
const ApiResponse = require('../../utils/ApiResponse');

class ReportsController {
  async getRevenueTrend(req, res) {
    const { startDate, endDate, groupBy } = req.query;
    const data = await reportsService.getRevenueTrend(req.user.hospitalId, startDate, endDate, groupBy);
    res.status(200).json(ApiResponse.success('Revenue trend', data));
  }

  async getRevenueByDepartment(req, res) {
    const { startDate, endDate } = req.query;
    const data = await reportsService.getRevenueByDepartment(req.user.hospitalId, startDate, endDate);
    res.status(200).json(ApiResponse.success('Revenue by department', data));
  }

  async getTopMedicines(req, res) {
    const { startDate, endDate } = req.query;
    const data = await reportsService.getTopMedicines(req.user.hospitalId, startDate, endDate);
    res.status(200).json(ApiResponse.success('Top medicines', data));
  }

  async getAppointmentStats(req, res) {
    const { startDate, endDate } = req.query;
    const data = await reportsService.getAppointmentStats(req.user.hospitalId, startDate, endDate);
    res.status(200).json(ApiResponse.success('Appointment stats', data));
  }

  async getPatientDemographics(req, res) {
    const { startDate, endDate } = req.query;
    const data = await reportsService.getPatientDemographics(req.user.hospitalId, startDate, endDate);
    res.status(200).json(ApiResponse.success('Patient demographics', data));
  }
}

module.exports = new ReportsController();
