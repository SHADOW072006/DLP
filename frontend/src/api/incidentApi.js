import api from './client';
export const getIncidents = (params) => api.get('/incidents', { params });
export const getIncidentById = (id) => api.get(`/incidents/${id}`);
export const updateIncidentStatus = (id, data) => api.patch(`/incidents/${id}/status`, data);
export const addIncidentNote = (id, data) => api.post(`/incidents/${id}/notes`, data);
export const getRecentIncidents = (limit = 10) => api.get('/incidents/recent', { params: { limit } });
