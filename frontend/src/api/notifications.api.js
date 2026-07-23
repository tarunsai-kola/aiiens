import api from './axios.instance';

export const notificationApi = {
  getMyNotifications: () => api.get('/notifications/my'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  getAdminLogs: (params) => api.get('/notifications/logs', { params })
};
