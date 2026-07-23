import api from './axios.instance';

export const adminApi = {
  // ── Departments ─────────────────────────────────────────────────────────────
  getDepartments: (params) => api.get('/departments', { params }),
  getDepartment: (id) => api.get(`/departments/${id}`),
  createDepartment: (data) => api.post('/departments', data),
  updateDepartment: (id, data) => api.put(`/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),

  // ── Staff ───────────────────────────────────────────────────────────────────
  getStaff: (params) => api.get('/staff', { params }),
  getStaffMember: (id) => api.get(`/staff/${id}`),
  updateStaff: (id, data) => api.put(`/staff/${id}`, data),
  deactivateStaff: (id) => api.patch(`/staff/${id}/deactivate`),
  activateStaff: (id) => api.patch(`/staff/${id}/activate`),

  // ── Doctors ─────────────────────────────────────────────────────────────────
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctor: (id) => api.get(`/doctors/${id}`),
  getDoctorByUser: (userId) => api.get(`/doctors/user/${userId}`),
  createDoctor: (data) => api.post('/doctors', data),
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),

  // ── Roles & Permissions ─────────────────────────────────────────────────────
  getRoles: () => api.get('/roles'),
  getRole: (id) => api.get(`/roles/${id}`),
  createRole: (data) => api.post('/roles', data),
  updateRole: (id, data) => api.put(`/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get('/roles/permissions'),

  // ── Settings & Hospital Profile ─────────────────────────────────────────────
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  getHospitalProfile: () => api.get('/settings/hospital'),
  updateHospitalProfile: (data) => api.put('/settings/hospital', data),
};
