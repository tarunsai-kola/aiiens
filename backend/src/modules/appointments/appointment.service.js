const appointmentRepository = require('./appointment.repository');
const Patient = require('../patients/patient.model');
const { User } = require('../auth/auth.model');
const notificationService = require('../notifications/notification.service');
const ApiError = require('../../utils/ApiError');
const socketUtils = require('../../utils/socket');

class AppointmentService {
  async generateToken(data, hospitalId) {
    const today = new Date();
    
    // 1. Get max token for today to auto-increment
    const maxToken = await appointmentRepository.getMaxTokenNumber(hospitalId, data.doctorId, today);
    const newTokenNumber = maxToken + 1;

    // 2. Calculate EWT (Estimated Waiting Time)
    // Assume 15 mins per patient
    const waitingCount = await appointmentRepository.getWaitingCount(hospitalId, data.doctorId, today);
    const estimatedWaitMinutes = waitingCount * 15;
    const estimatedTime = new Date(today.getTime() + estimatedWaitMinutes * 60000);

    // 3. Create appointment
    const appointment = await appointmentRepository.create({
      ...data,
      hospitalId,
      date: today,
      tokenNumber: newTokenNumber,
      estimatedTime,
      status: 'triage' // Used to be 'waiting'
    });

    // 4. Emit Socket Event to Reception & Doctor
    const io = socketUtils.getIO();
    io.to(`hospital_${hospitalId}`).emit('queue:updated', {
      action: 'token_generated',
      doctorId: data.doctorId,
      appointment
    });

    // --- TRIGGER NOTIFICATION ---
    try {
      const patient = await Patient.findById(data.patientId);
      if (patient && patient.phone) {
        // Asynchronously send SMS so it doesn't block the API response
        notificationService.send({
          hospitalId,
          recipientId: patient._id,
          recipientModel: 'Patient',
          channel: 'sms',
          contactDetail: patient.phone,
          title: 'Appointment Confirmed',
          message: `Dear ${patient.firstName}, your appointment is confirmed with token ${newTokenNumber}.`,
          metadata: { appointmentId: appointment._id }
        }).catch(err => console.error(err));
      }
    } catch (e) {
      console.error('Notification Trigger Failed:', e.message);
    }

    return appointment;
  }

  async getDoctorQueue(hospitalId, doctorId, dateStr, statusFilter) {
    const date = dateStr ? new Date(dateStr) : new Date();
    return appointmentRepository.getDailyQueueByDoctor(hospitalId, doctorId, date, statusFilter);
  }

  async updateStatus(id, hospitalId, status, payload = {}) {
    const updates = {};
    if (status === 'in-progress') updates.timeIn = new Date();
    if (status === 'completed') updates.timeOut = new Date();
    
    if (payload.notes) updates.notes = payload.notes;

    const appointment = await appointmentRepository.updateStatus(id, hospitalId, status, updates);
    if (!appointment) throw ApiError.notFound('Appointment/Token not found');

    // Emit real-time update
    const io = socketUtils.getIO();
    
    // Emit global queue update
    io.to(`hospital_${hospitalId}`).emit('queue:updated', {
      action: 'status_changed',
      doctorId: appointment.doctorId._id,
      appointment
    });

    // Specific alert if called
    if (status === 'in-progress') {
      io.to(`hospital_${hospitalId}`).emit('token:called', {
        appointment
      });
    }

    return appointment;
  }

  async transfer(id, hospitalId, newDoctorId, newDepartmentId) {
    const updates = {
      doctorId: newDoctorId,
      departmentId: newDepartmentId,
      status: 'waiting' // Send back to waiting queue for the new doctor
    };

    const appointment = await appointmentRepository.updateStatus(id, hospitalId, 'waiting', updates);
    if (!appointment) throw ApiError.notFound('Appointment not found');

    const io = socketUtils.getIO();
    
    // Broadcast transfer to hospital so old doctor's queue updates and new doctor's queue updates
    io.to(`hospital_${hospitalId}`).emit('queue:updated', {
      action: 'transferred',
      appointment
    });

    return appointment;
  }
}

module.exports = new AppointmentService();
