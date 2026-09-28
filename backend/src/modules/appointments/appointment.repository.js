const { Appointment } = require('./appointment.model');
const { paginate } = require('../../utils/paginate');

class AppointmentRepository {
  // ── Paginated list (admin/manager view) ───────────────────────────────────────
  async findAll(hospitalId, queryParams = {}) {
    const filter = { hospitalId };

    // Date range
    if (queryParams.date) {
      const d = new Date(queryParams.date);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end   = new Date(d); end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    } else if (queryParams.dateFrom || queryParams.dateTo) {
      filter.date = {};
      if (queryParams.dateFrom) filter.date.$gte = new Date(queryParams.dateFrom);
      if (queryParams.dateTo)   filter.date.$lte = new Date(new Date(queryParams.dateTo).setHours(23, 59, 59, 999));
    }

    if (queryParams.status)    filter.status    = queryParams.status;
    if (queryParams.doctorId)  filter.doctorId  = queryParams.doctorId;
    if (queryParams.visitType) filter.visitType = queryParams.visitType;
    if (queryParams.priority)  filter.priority  = queryParams.priority;
    if (queryParams.patientId) filter.patientId = queryParams.patientId;

    const { page, limit, skip } = paginate(queryParams);

    const [docs, total] = await Promise.all([
      Appointment.find(filter)
        .populate('patientId', 'firstName lastName uhid phone gender dateOfBirth')
        .populate('doctorId',  'firstName lastName')
        .populate('departmentId', 'name')
        .sort({ date: -1, tokenNumber: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    return { docs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Today's global stats ───────────────────────────────────────────────────────
  async getTodayStats(hospitalId) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    const match = { hospitalId, date: { $gte: start, $lte: end } };

    const [agg] = await Appointment.aggregate([
      { $match: match },
      { $group: {
        _id: null,
        total:      { $sum: 1 },
        triage:     { $sum: { $cond: [{ $eq: ['$status', 'triage'] },      1, 0] } },
        waiting:    { $sum: { $cond: [{ $eq: ['$status', 'waiting'] },     1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] },1, 0] } },
        completed:  { $sum: { $cond: [{ $eq: ['$status', 'completed'] },  1, 0] } },
        cancelled:  { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] },  1, 0] } },
        emergency:  { $sum: { $cond: [{ $eq: ['$priority', 'emergency'] },1, 0] } },
      }},
    ]);

    return agg || { total: 0, triage: 0, waiting: 0, inProgress: 0, completed: 0, cancelled: 0, emergency: 0 };
  }


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
