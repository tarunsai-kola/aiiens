import api from './axios.instance';

export const reportsApi = {
  getRevenueTrend: (params) => api.get('/reports/revenue/trend', { params }),
  getRevenueByDepartment: (params) => api.get('/reports/revenue/department', { params }),
  getTopMedicines: (params) => api.get('/reports/pharmacy/top', { params }),
  getAppointmentStats: (params) => api.get('/reports/appointments/stats', { params }),
  getPatientDemographics: (params) => api.get('/reports/patients/demographics', { params }),
};
