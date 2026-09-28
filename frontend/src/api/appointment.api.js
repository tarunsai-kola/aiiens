import api from './axios.instance';

// ── Appointment / Token / Queue API ───────────────────────────────────────────
export const appointmentApi = {
  // Generate a new OPD token for a patient
  generateToken: (data) => api.post('/appointments/token', data),

  // Fetch doctor queue (today's queue by default)
  getDoctorQueue: (params) => api.get('/appointments/queue', { params }),

  // Get all appointments (paginated)
  getAll: (params) => api.get('/appointments', { params }),

  // Today's stats summary
  getStats: () => api.get('/appointments/stats'),

  // Get single appointment
  getById: (id) => api.get(`/appointments/${id}`),

  // Update appointment/token status
  updateStatus: (id, status, notes) =>
    api.patch(`/appointments/${id}/status`, { status, notes }),

  // Transfer patient to a different doctor/dept
  transfer: (id, data) => api.post(`/appointments/${id}/transfer`, data),
};
