import api from './axios.instance';

export const hrApi = {
  // Staff
  getStaffList: () => api.get('/hr/staff'),
  updateStaffProfile: (userId, data) => api.put(`/hr/staff/${userId}`, data),

  // Shifts & Roster
  createShift: (data) => api.post('/hr/shifts', data),
  getShifts: () => api.get('/hr/shifts'),
  assignRoster: (data) => api.post('/hr/roster', data),
  getRoster: (params) => api.get('/hr/roster', { params }),

  // Attendance
  markAttendance: (data) => api.post('/hr/attendance', data),
  getAttendance: (params) => api.get('/hr/attendance', { params }),

  // Leaves
  requestLeave: (data) => api.post('/hr/leaves', data),
  getLeaveRequests: (params) => api.get('/hr/leaves', { params }),
  updateLeaveStatus: (id, status) => api.put(`/hr/leaves/${id}/status`, { status }),

  // Payroll
  generatePayroll: (data) => api.post('/hr/payroll/generate', data),
  getPayrolls: (params) => api.get('/hr/payroll', { params }),
  paySalary: (id) => api.put(`/hr/payroll/${id}/pay`),
};
