const { Consultation } = require('./consultation.model');
const appointmentService = require('../appointments/appointment.service');
const ApiError = require('../../utils/ApiError');

class ConsultationService {
  async saveConsultation(data, hospitalId) {
    // Upsert consultation
    const consultation = await Consultation.findOneAndUpdate(
      { appointmentId: data.appointmentId, hospitalId },
      { ...data, hospitalId },
      { new: true, upsert: true, runValidators: true }
    );

    // If completed, update appointment status to 'completed'
    if (data.isCompleted) {
      await appointmentService.updateStatus(data.appointmentId, hospitalId, 'completed');
    }

    return consultation;
  }

  async getConsultationByAppointment(appointmentId, hospitalId) {
    return Consultation.findOne({ appointmentId, hospitalId });
  }

  async getPatientHistory(patientId, hospitalId) {
    return Consultation.find({ patientId, hospitalId, isCompleted: true })
      .populate('doctorId', 'firstName lastName')
      .populate('appointmentId', 'date departmentId')
      .sort({ createdAt: -1 });
  }
}

module.exports = new ConsultationService();
