import api from './axios.instance';

export const consultationApi = {
  saveConsultation: (data) => api.post('/consultations', data),
  getConsultation: (appointmentId) => api.get(`/consultations/appointment/${appointmentId}`),
  getPatientHistory: (patientId) => api.get(`/consultations/patient/${patientId}/history`),
};
