import api from './axios.instance';

export const laboratoryApi = {
  // Master
  createTestMaster: (data) => api.post('/laboratory/tests', data),
  getTestMasters: () => api.get('/laboratory/tests'),

  // Orders
  createLabOrder: (data) => api.post('/laboratory/orders', data),
  getLabOrders: (params) => api.get('/laboratory/orders', { params }),
  getLabOrderById: (id) => api.get(`/laboratory/orders/${id}`),

  // Workflow Actions
  collectSample: (id) => api.put(`/laboratory/orders/${id}/collect`),
  uploadResults: (id, data) => api.put(`/laboratory/orders/${id}/results`, data),
  verifyReport: (id) => api.put(`/laboratory/orders/${id}/verify`),
};
