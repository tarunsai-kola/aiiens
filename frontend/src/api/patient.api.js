import api from './axios.instance';

export const patientApi = {
  getPatients: (params) => api.get('/patients', { params }),
  searchPatients: (query) => api.get(`/patients/search?q=${query}`),
  getPatient: (id) => api.get(`/patients/${id}`),
  registerPatient: (data) => api.post('/patients/register', data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`),
};
