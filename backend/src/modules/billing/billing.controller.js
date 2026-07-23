const billingService = require('./billing.service');
const ApiResponse = require('../../utils/ApiResponse');

class BillingController {
  async createBill(req, res) {
    const bill = await billingService.createBill(req.body, req.user.hospitalId, req.user.id);
    res.status(201).json(ApiResponse.success('Bill generated successfully', bill));
  }

  async getBills(req, res) {
    const bills = await billingService.getBills(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Bills retrieved', bills));
  }

  async getBill(req, res) {
    const { id } = req.params;
    const data = await billingService.getBillById(id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Bill retrieved', data));
  }

  async addPayment(req, res) {
    const { id } = req.params;
    const data = await billingService.addPayment(id, req.body, req.user.hospitalId, req.user.id);
    res.status(200).json(ApiResponse.success('Payment recorded successfully', data));
  }

  async getCollectionReport(req, res) {
    const report = await billingService.getCollectionReport(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Collection report generated', report));
  }
}

module.exports = new BillingController();
