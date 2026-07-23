import api from './axios.instance';

export const doctorsApi = {
  getAll:  (params)    => api.get('/doctors', { params }),
  getById: (id)        => api.get('/doctors/' + id),
  create:  (data)      => api.post('/doctors', data),
  update:  (id, data)  => api.put('/doctors/' + id, data),
  delete:  (id)        => api.delete('/doctors/' + id),
};
