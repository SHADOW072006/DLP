import api from './client';
export const getSummary = () => api.get('/analytics/summary');
export const getDepartmentStats = () => api.get('/analytics/departments');
export const getIncidentTrends = (days = 30) => api.get('/analytics/trends', { params: { days } });
export const exportReport = (type = 'CSV') => api.get('/reports/export', { params: { type }, responseType: 'blob' });
