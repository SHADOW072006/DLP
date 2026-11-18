import api from './client';
export const getEvents = (params) => api.get('/events', { params });
export const getLatestEvents = (limit = 50) => api.get('/events/latest', { params: { limit } });
export const reportEvent = (data) => api.post('/events/report', data);
