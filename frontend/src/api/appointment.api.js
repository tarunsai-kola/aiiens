import api from './axios.instance';

export const appointmentApi = {
  generateToken: (data) => api.post('/appointments/token', data),
  getDoctorQueue: (doctorId, date, statusFilter) => api.get('/appointments/queue', { params: { doctorId, date, statusFilter } }),
  updateStatus: (id, status, notes) => api.patch(`/appointments/${id}/status`, { status, notes }),
  transfer: (id, doctorId, departmentId) => api.post(`/appointments/${id}/transfer`, { doctorId, departmentId }),
};
