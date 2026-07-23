import api from './axios.instance';

export const wardsApi = {
  getAll:  (params)    => api.get('/wards', { params }),
  getById: (id)        => api.get('/wards/' + id),
  create:  (data)      => api.post('/wards', data),
  update:  (id, data)  => api.put('/wards/' + id, data),
  delete:  (id)        => api.delete('/wards/' + id),
};
