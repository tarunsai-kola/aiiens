import api from './axios.instance';

export const billingApi = {
  createBill: (data) => api.post('/billing', data),
  getBills: (params) => api.get('/billing', { params }),
  getBillById: (id) => api.get(`/billing/${id}`),
  addPayment: (id, data) => api.post(`/billing/${id}/payments`, data),
  getCollectionReport: (params) => api.get('/billing/reports/collection', { params }),
};
