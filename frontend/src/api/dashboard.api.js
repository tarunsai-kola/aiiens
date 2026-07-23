import api from './axios.instance';

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats')
};
