import api from './axios.instance';

export const patientsApi = {
  getAll:   (params) => api.get('/patients', { params }),
  getById:  (id)     => api.get(`/patients/${id}`),
  create:   (data)   => api.post('/patients', data),
  update:   (id, data) => api.put(`/patients/${id}`, data),
  delete:   (id)     => api.delete(`/patients/${id}`),
};
