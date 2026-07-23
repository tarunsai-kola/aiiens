const { Settings } = require('./settings.model');
const { Hospital } = require('../../models/Hospital.model');
const ApiError = require('../../utils/ApiError');

class SettingsService {
  async getSettings(hospitalId) {
    let settings = await Settings.findOne({ hospitalId });
    if (!settings) {
      // Auto-create if it doesn't exist (though it should from registration)
      settings = await Settings.create({ hospitalId });
    }
    return settings;
  }

  async updateSettings(hospitalId, data, userId) {
    const settings = await Settings.findOneAndUpdate(
      { hospitalId },
      { $set: { ...data, updatedBy: userId } },
      { new: true, runValidators: true, upsert: true }
    );
    return settings;
  }

  async getHospitalProfile(hospitalId) {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) throw ApiError.notFound('Hospital not found');
    return hospital;
  }

  async updateHospitalProfile(hospitalId, data) {
    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!hospital) throw ApiError.notFound('Hospital not found');
    return hospital;
  }
}

module.exports = new SettingsService();
