const { Appointment } = require('./appointment.model');

class AppointmentRepository {
  async getMaxTokenNumber(hospitalId, doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const latest = await Appointment.findOne({
      hospitalId,
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ tokenNumber: -1 });

    return latest ? latest.tokenNumber : 0;
  }

  async getWaitingCount(hospitalId, doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Appointment.countDocuments({
      hospitalId,
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'waiting'
    });
  }

  async create(data) {
    const appointment = new Appointment(data);
    await appointment.save();
    return this.findById(appointment._id, data.hospitalId);
  }

  async findById(id, hospitalId) {
    return Appointment.findOne({ _id: id, hospitalId })
      .populate('patientId', 'firstName lastName uhid phone')
      .populate('doctorId', 'firstName lastName')
      .populate('departmentId', 'name');
  }

  async updateStatus(id, hospitalId, status, updates = {}) {
    return Appointment.findOneAndUpdate(
      { _id: id, hospitalId },
      { status, ...updates },
      { new: true }
    ).populate('patientId', 'firstName lastName uhid phone')
     .populate('doctorId', 'firstName lastName');
  }

  async getDailyQueueByDoctor(hospitalId, doctorId, date, statusFilter = null) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      hospitalId,
      date: { $gte: startOfDay, $lte: endOfDay }
    };
    
    if (doctorId) query.doctorId = doctorId;
    
    if (statusFilter === 'triage') {
      query.status = 'triage';
    } else if (statusFilter === 'active') {
      query.status = { $ne: 'triage' };
    }

    return Appointment.find(query)
    .populate('patientId', 'firstName lastName uhid gender age')
    .populate('doctorId', 'firstName lastName')
    .sort({ priority: -1, tokenNumber: 1 }); // Higher priority first, then token order
  }

  async getHospitalDailyStats(hospitalId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Appointment.aggregate([
      { $match: { hospitalId, date: { $gte: startOfDay, $lte: endOfDay } } },
      { $group: {
          _id: '$departmentId',
          totalTokens: { $sum: 1 },
          waiting: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ]);
  }
}

module.exports = new AppointmentRepository();
