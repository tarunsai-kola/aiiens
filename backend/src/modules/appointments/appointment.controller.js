const appointmentService = require('./appointment.service');
const ApiResponse = require('../../utils/ApiResponse');

class AppointmentController {
  async generateToken(req, res) {
    const appointment = await appointmentService.generateToken(req.body, req.user.hospitalId);
    res.status(201).json(ApiResponse.success('Token generated successfully', appointment));
  }

  async getDoctorQueue(req, res) {
    const { doctorId, date, statusFilter } = req.query;
    // Default to the requesting user's ID if role is doctor
    const docId = doctorId || (req.user.role === 'doctor' ? req.user.id : null);

    // If fetching triage queue, docId is optional (global triage view)
    if (!docId && statusFilter !== 'triage') {
      return res.status(400).json(ApiResponse.error('Doctor ID is required to fetch specific queue'));
    }

    const queue = await appointmentService.getDoctorQueue(req.user.hospitalId, docId, date, statusFilter);
    res.status(200).json(ApiResponse.success('Queue retrieved', queue));
  }

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const appointment = await appointmentService.updateStatus(id, req.user.hospitalId, status, { notes });
    res.status(200).json(ApiResponse.success(`Status updated to ${status}`, appointment));
  }

  async transfer(req, res) {
    const { id } = req.params;
    const { doctorId, departmentId } = req.body;
    
    const appointment = await appointmentService.transfer(id, req.user.hospitalId, doctorId, departmentId);
    res.status(200).json(ApiResponse.success('Patient transferred successfully', appointment));
  }
}

module.exports = new AppointmentController();
