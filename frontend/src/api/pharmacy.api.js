import api from './axios.instance';

export const pharmacyApi = {
  // Inventory
  addInventory: (data) => api.post('/pharmacy/inventory', data),
  getInventory: (params) => api.get('/pharmacy/inventory', { params }),
  searchInventory: (q) => api.get('/pharmacy/search', { params: { q } }),

  // Queue
  getQueue: () => api.get('/pharmacy/queue'),

  // Dispense & Billing
  dispense: (data) => api.post('/pharmacy/dispense', data),
};
