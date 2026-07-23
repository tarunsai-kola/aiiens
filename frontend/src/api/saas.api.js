import api from './axios.instance';

export const saasApi = {
  getDashboardStats: () => api.get('/saas/dashboard/stats'),
  
  getHospitals: () => api.get('/saas/hospitals'),
  toggleHospitalStatus: (id, isActive) => api.put(`/saas/hospitals/${id}/status`, { isActive }),
  
  getPlans: () => api.get('/saas/plans'),
  updatePlan: (id, data) => api.put(`/saas/plans/${id}`, data),
  
  getTickets: () => api.get('/saas/tickets'),
  updateTicketStatus: (id, status, resolutionNotes) => api.put(`/saas/tickets/${id}/status`, { status, resolutionNotes }),
  
  getLogs: () => api.get('/saas/logs'),
};
