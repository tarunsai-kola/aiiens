const { Vitals } = require('./vitals.model');
const appointmentService = require('../appointments/appointment.service');
const ApiError = require('../../utils/ApiError');

class VitalsService {
  async saveVitals(data, hospitalId) {
    // 1. Create or Update Vitals record
    const vitals = await Vitals.findOneAndUpdate(
      { appointmentId: data.appointmentId, hospitalId },
      { ...data, hospitalId },
      { new: true, upsert: true, runValidators: true }
    );

    // 2. Update Appointment Status from 'triage' to 'waiting'
    // This will trigger the socket event 'queue:updated' pushing it to the Doctor's active queue
    await appointmentService.updateStatus(data.appointmentId, hospitalId, 'waiting', {
      notes: data.notes // Optionally pass notes up to the appointment level
    });

    return vitals;
  }

  async getVitalsByAppointment(appointmentId, hospitalId) {
    const vitals = await Vitals.findOne({ appointmentId, hospitalId })
      .populate('recordedBy', 'firstName lastName');
    return vitals;
  }
}

module.exports = new VitalsService();
