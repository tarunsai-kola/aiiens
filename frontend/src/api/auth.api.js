import api from './axios.instance';

export const authApi = {
  // Public
  login:          (data)          => api.post('/auth/login', data),
  refreshToken:   (data)          => api.post('/auth/refresh-token', data),
  forgotPassword: (data)          => api.post('/auth/forgot-password', data),
  resetPassword:  (token, data, hospitalId) =>
    api.post(`/auth/reset-password/${token}?hospitalId=${hospitalId}`, data),
  acceptInvite:   (token, data, hospitalId) =>
    api.post(`/auth/accept-invite/${token}?hospitalId=${hospitalId}`, data),

  // Protected
  logout:         ()              => api.post('/auth/logout'),
  getMe:          ()              => api.get('/auth/me'),
  changePassword: (data)          => api.post('/auth/change-password', data),
  inviteStaff:    (data)          => api.post('/auth/invite-staff', data),

  // Hospital Registration
  registerHospital: (data)        => api.post('/hospitals/register', data),
};
