import api from './client';
export const getPolicies = () => api.get('/policies');
export const getPolicyById = (id) => api.get(`/policies/${id}`);
export const createPolicy = (data) => api.post('/policies', data);
export const updatePolicy = (id, data) => api.put(`/policies/${id}`, data);
export const deletePolicy = (id) => api.delete(`/policies/${id}`);
export const toggleSimulationMode = (id) => api.put(`/policies/${id}/toggle-mode`);
