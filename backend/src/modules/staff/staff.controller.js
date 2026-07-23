const staffService = require('./staff.service');
const ApiResponse = require('../../utils/ApiResponse');

class StaffController {
  async getAll(req, res) {
    const result = await staffService.getAllStaff(req.user.hospitalId, req.query);
    res.status(200).json(ApiResponse.success('Staff retrieved', result));
  }

  async getOne(req, res) {
    const staff = await staffService.getStaffById(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Staff member retrieved', staff));
  }

  async update(req, res) {
    const staff = await staffService.updateStaff(req.params.id, req.body, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Staff member updated', staff));
  }

  async deactivate(req, res) {
    await staffService.deactivateStaff(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Staff member deactivated successfully'));
  }

  async activate(req, res) {
    await staffService.activateStaff(req.params.id, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Staff member activated successfully'));
  }
}

module.exports = new StaffController();
