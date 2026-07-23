const saasService = require('./saas.service');
const ApiResponse = require('../../utils/ApiResponse');

class SaaSController {
  async getDashboardStats(req, res) {
    const stats = await saasService.getPlatformStats();
    res.status(200).json(ApiResponse.success('Platform stats retrieved', stats));
  }

  async getHospitals(req, res) {
    const hospitals = await saasService.getAllHospitals();
    res.status(200).json(ApiResponse.success('Hospitals retrieved', hospitals));
  }

  async toggleHospital(req, res) {
    const { isActive } = req.body;
    const hospital = await saasService.toggleHospitalStatus(req.params.id, isActive, req.user.id);
    res.status(200).json(ApiResponse.success(`Hospital ${isActive ? 'activated' : 'suspended'}`, hospital));
  }

  async getPlans(req, res) {
    const plans = await saasService.getSubscriptionPlans();
    res.status(200).json(ApiResponse.success('Plans retrieved', plans));
  }

  async updatePlan(req, res) {
    const plan = await saasService.updatePlan(req.params.id, req.body, req.user.id);
    res.status(200).json(ApiResponse.success('Plan updated', plan));
  }

  async getTickets(req, res) {
    const tickets = await saasService.getTickets();
    res.status(200).json(ApiResponse.success('Tickets retrieved', tickets));
  }

  async updateTicket(req, res) {
    const { status, resolutionNotes } = req.body;
    const ticket = await saasService.updateTicketStatus(req.params.id, status, resolutionNotes, req.user.id);
    res.status(200).json(ApiResponse.success('Ticket updated', ticket));
  }

  async getLogs(req, res) {
    const logs = await saasService.getSystemLogs();
    res.status(200).json(ApiResponse.success('System logs retrieved', logs));
  }
}

module.exports = new SaaSController();
