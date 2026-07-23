const labService = require('./laboratory.service');
const ApiResponse = require('../../utils/ApiResponse');

class LaboratoryController {
  // Test Master
  async createTestMaster(req, res) {
    const test = await labService.createTestMaster(req.body, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Test master created', test));
  }

  async getTestMasters(req, res) {
    const tests = await labService.getTestMasters(req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Test masters retrieved', tests));
  }

  // Orders
  async createLabOrder(req, res) {
    const order = await labService.createLabOrder(req.body, req.user.hospitalId, req.user.id);
    res.status(201).json(ApiResponse.success('Lab order created', order));
  }

  async getLabOrders(req, res) {
    // optional query filters e.g. ?status=ordered
    const orders = await labService.getLabOrders(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Lab orders retrieved', orders));
  }

  async getLabOrderById(req, res) {
    const order = await labService.getLabOrderById(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Lab order retrieved', order));
  }

  // Workflow Actions
  async collectSample(req, res) {
    const order = await labService.collectSample(req.params.id, req.user.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Sample marked as collected', order));
  }

  async uploadResults(req, res) {
    const order = await labService.uploadResults(req.params.id, req.body, req.user.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Results uploaded successfully', order));
  }

  async verifyReport(req, res) {
    const order = await labService.verifyReport(req.params.id, req.user.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Report verified successfully', order));
  }
}

module.exports = new LaboratoryController();
