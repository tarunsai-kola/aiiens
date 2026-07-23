const { User } = require('../auth/auth.model');
const { StaffProfile, Shift, DutyRoster, Attendance, LeaveRequest, Payroll } = require('./hr.model');
const ApiError = require('../../utils/ApiError');

class HRService {
  // --- STAFF PROFILES ---
  async getStaffList(hospitalId) {
    const users = await User.find({ hospitalId, role: { $in: ['doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician'] } })
      .select('firstName lastName email role phone');
    
    // Get profiles and merge
    const profiles = await StaffProfile.find({ hospitalId }).populate('departmentId', 'name');
    const profileMap = {};
    profiles.forEach(p => profileMap[p.userId.toString()] = p);

    return users.map(u => ({
      ...u.toObject(),
      profile: profileMap[u._id.toString()] || null
    }));
  }

  async upsertStaffProfile(userId, hospitalId, profileData) {
    // Make sure user exists
    const user = await User.findOne({ _id: userId, hospitalId });
    if (!user) throw ApiError.notFound('User not found');

    return StaffProfile.findOneAndUpdate(
      { userId, hospitalId },
      { ...profileData, userId, hospitalId },
      { new: true, upsert: true }
    );
  }

  // --- SHIFTS & ROSTER ---
  async createShift(data, hospitalId) {
    return Shift.create({ ...data, hospitalId });
  }

  async getShifts(hospitalId) {
    return Shift.find({ hospitalId });
  }

  async assignRoster(data, hospitalId) {
    // data: { userId, shiftId, date }
    return DutyRoster.findOneAndUpdate(
      { userId: data.userId, date: new Date(data.date), hospitalId },
      { shiftId: data.shiftId },
      { new: true, upsert: true }
    );
  }

  async getRoster(hospitalId, startDate, endDate) {
    return DutyRoster.find({
      hospitalId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    }).populate('userId', 'firstName lastName role').populate('shiftId');
  }

  // --- ATTENDANCE ---
  async markAttendance(data, hospitalId) {
    // data: { userId, date, status, notes }
    return Attendance.findOneAndUpdate(
      { userId: data.userId, date: new Date(data.date), hospitalId },
      { ...data },
      { new: true, upsert: true }
    );
  }

  async getAttendance(hospitalId, date) {
    return Attendance.find({ hospitalId, date: new Date(date) })
      .populate('userId', 'firstName lastName role');
  }

  // --- LEAVES ---
  async requestLeave(data, userId, hospitalId) {
    return LeaveRequest.create({ ...data, userId, hospitalId });
  }

  async getLeaveRequests(hospitalId, filters = {}) {
    return LeaveRequest.find({ hospitalId, ...filters })
      .populate('userId', 'firstName lastName role')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async updateLeaveStatus(leaveId, status, adminId, hospitalId) {
    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: leaveId, hospitalId },
      { status, approvedBy: adminId },
      { new: true }
    );
    if (!leave) throw ApiError.notFound('Leave request not found');
    return leave;
  }

  // --- PAYROLL ---
  async generatePayroll(month, year, hospitalId) {
    // Simplified logic: Find all profiles with baseSalary > 0
    const profiles = await StaffProfile.find({ hospitalId, baseSalary: { $gt: 0 } }).populate('userId', 'firstName lastName');
    
    // For MVP, we won't do complex attendance deductions automatically unless requested.
    // We will just calculate net = base. 
    // In a real app, we would query Attendance and calculate un-paid days.
    
    const results = [];
    for (const p of profiles) {
      // Check if already generated
      let payroll = await Payroll.findOne({ userId: p.userId._id, month, year, hospitalId });
      if (!payroll) {
        // Calculate (Mock deduction logic here if needed)
        const deductions = 0; 
        const allowances = 0;
        const netSalary = p.baseSalary + allowances - deductions;

        payroll = await Payroll.create({
          hospitalId,
          userId: p.userId._id,
          month,
          year,
          baseSalary: p.baseSalary,
          allowances,
          deductions,
          netSalary
        });
      }
      results.push(payroll);
    }
    return results;
  }

  async getPayrolls(month, year, hospitalId) {
    return Payroll.find({ month, year, hospitalId })
      .populate('userId', 'firstName lastName role');
  }

  async paySalary(payrollId, hospitalId) {
    return Payroll.findOneAndUpdate(
      { _id: payrollId, hospitalId },
      { status: 'Paid', paymentDate: new Date() },
      { new: true }
    );
  }
}

module.exports = new HRService();
