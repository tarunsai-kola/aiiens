const settingsService = require('./settings.service');
const ApiResponse = require('../../utils/ApiResponse');

class SettingsController {
  async getSettings(req, res) {
    const settings = await settingsService.getSettings(req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Settings retrieved', settings));
  }

  async updateSettings(req, res) {
    const settings = await settingsService.updateSettings(req.user.hospitalId, req.body, req.user.id);
    res.status(200).json(ApiResponse.success('Settings updated', settings));
  }

  async getHospitalProfile(req, res) {
    const hospital = await settingsService.getHospitalProfile(req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Hospital profile retrieved', hospital));
  }

  async updateHospitalProfile(req, res) {
    const hospital = await settingsService.updateHospitalProfile(req.user.hospitalId, req.body);
    res.status(200).json(ApiResponse.success('Hospital profile updated', hospital));
  }
}

module.exports = new SettingsController();
