import api from './axios.instance';

export const appointmentsApi = {
  getAll:  (params)    => api.get('/appointments', { params }),
  getById: (id)        => api.get('/appointments/' + id),
  create:  (data)      => api.post('/appointments', data),
  update:  (id, data)  => api.put('/appointments/' + id, data),
  delete:  (id)        => api.delete('/appointments/' + id),
};
