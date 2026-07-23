import api from './axios.instance';

export const prescriptionApi = {
  savePrescription: (data) => api.post('/prescriptions', data),
  getPrescription: (consultationId) => api.get(`/prescriptions/consultation/${consultationId}`),
  searchMedicines: (q) => api.get('/prescriptions/medicines/search', { params: { q } }),
};
