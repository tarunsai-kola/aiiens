const vitalsService = require('./vitals.service');
const ApiResponse = require('../../utils/ApiResponse');

class VitalsController {
  async saveVitals(req, res) {
    const payload = {
      ...req.body,
      recordedBy: req.user.id
    };
    
    const vitals = await vitalsService.saveVitals(payload, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Vitals saved successfully', vitals));
  }

  async getVitals(req, res) {
    const { appointmentId } = req.params;
    const vitals = await vitalsService.getVitalsByAppointment(appointmentId, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Vitals retrieved', vitals));
  }
}

module.exports = new VitalsController();
