const consultationService = require('./consultation.service');
const ApiResponse = require('../../utils/ApiResponse');

class ConsultationController {
  async saveConsultation(req, res) {
    const payload = {
      ...req.body,
      doctorId: req.user.id
    };
    
    const consultation = await consultationService.saveConsultation(payload, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Consultation saved successfully', consultation));
  }

  async getConsultation(req, res) {
    const { appointmentId } = req.params;
    const consultation = await consultationService.getConsultationByAppointment(appointmentId, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Consultation retrieved', consultation));
  }

  async getPatientHistory(req, res) {
    const { patientId } = req.params;
    const history = await consultationService.getPatientHistory(patientId, req.user.hospitalId);
    res.status(200).json(ApiResponse.success('Patient history retrieved', history));
  }
}

module.exports = new ConsultationController();
