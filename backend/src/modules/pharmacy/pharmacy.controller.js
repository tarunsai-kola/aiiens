const pharmacyService = require('./pharmacy.service');
const ApiResponse = require('../../utils/ApiResponse');

class PharmacyController {
  async addInventory(req, res) {
    const item = await pharmacyService.addInventory(req.body, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Inventory added', item));
  }

  async getInventory(req, res) {
    const items = await pharmacyService.getInventory(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Inventory retrieved', items));
  }

  async searchInventory(req, res) {
    const { q } = req.query;
    const items = await pharmacyService.searchInventory(q, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Search results', items));
  }

  async getIncomingPrescriptions(req, res) {
    const rx = await pharmacyService.getIncomingPrescriptions(req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Incoming prescriptions', rx));
  }

  async dispense(req, res) {
    const sale = await pharmacyService.dispense(req.body, req.user.hospitalId, req.user.id);
    res.status(200).json(ApiResponse.success('Dispense successful', sale));
  }
}

module.exports = new PharmacyController();
