const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

// --- STAFF PROFILE ---
// Extends the core User model with HR-specific data
const staffProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  
  employeeId: { type: String, trim: true },
  joiningDate: { type: Date, default: Date.now },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String, trim: true }, // e.g. "Senior Consultant", "Head Nurse"
  
  baseSalary: { type: Number, default: 0 },
  bankName: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  ifscCode: { type: String, trim: true },
  panNumber: { type: String, trim: true }
}, { timestamps: true });
staffProfileSchema.plugin(tenantPlugin);
const StaffProfile = mongoose.model('StaffProfile', staffProfileSchema);


// --- SHIFTS & DUTY ROSTER ---
const shiftSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true }, // Morning, Evening, Night
  startTime: { type: String, required: true }, // "08:00"
  endTime: { type: String, required: true }    // "16:00"
}, { timestamps: true });
shiftSchema.plugin(tenantPlugin);
const Shift = mongoose.model('Shift', shiftSchema);

const dutyRosterSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
  date: { type: Date, required: true } // YYYY-MM-DD
}, { timestamps: true });
dutyRosterSchema.plugin(tenantPlugin);
const DutyRoster = mongoose.model('DutyRoster', dutyRosterSchema);


// --- ATTENDANCE ---
const attendanceSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['Present', 'Absent', 'Half-Day', 'Late'], required: true },
  clockInTime: { type: Date },
  clockOutTime: { type: Date },
  notes: { type: String, trim: true }
}, { timestamps: true });
attendanceSchema.plugin(tenantPlugin);
// Ensure one record per user per day
attendanceSchema.index({ hospitalId: 1, userId: 1, date: 1 }, { unique: true });
const Attendance = mongoose.model('Attendance', attendanceSchema);


// --- LEAVES ---
const leaveRequestSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['Sick', 'Casual', 'Annual', 'Unpaid'], required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: { type: String }
}, { timestamps: true });
leaveRequestSchema.plugin(tenantPlugin);
const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);


// --- PAYROLL ---
const payrollSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true }, // e.g. 2026
  
  baseSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paymentDate: { type: Date }
}, { timestamps: true });
payrollSchema.plugin(tenantPlugin);
// Ensure one payslip per user per month
payrollSchema.index({ hospitalId: 1, userId: 1, month: 1, year: 1 }, { unique: true });
const Payroll = mongoose.model('Payroll', payrollSchema);


module.exports = {
  StaffProfile,
  Shift,
  DutyRoster,
  Attendance,
  LeaveRequest,
  Payroll
};
