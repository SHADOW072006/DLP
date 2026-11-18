import api from './client';
export const getOrganization = () => api.get('/organization');
export const updateOrganization = (data) => api.put('/organization', data);
export const getDepartments = () => api.get('/departments');
export const createDepartment = (data) => api.post('/departments', data);
export const updateDepartment = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);
