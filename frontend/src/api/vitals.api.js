import api from './axios.instance';

export const vitalsApi = {
  saveVitals: (data) => api.post('/vitals', data),
  getVitalsByAppointment: (appointmentId) => api.get(`/vitals/appointment/${appointmentId}`),
};
