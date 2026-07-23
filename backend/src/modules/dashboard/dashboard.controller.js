const dashboardService = require('./dashboard.service');
const ApiResponse = require('../../utils/ApiResponse');

class DashboardController {
  async getStats(req, res) {
    const stats = await dashboardService.getDashboardStats(req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Dashboard stats retrieved', stats));
  }
}

module.exports = new DashboardController();
