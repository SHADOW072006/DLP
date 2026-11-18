import api from './client';
export const explainIncident = (incidentId) => api.post('/ai/explain-incident', { incidentId });
export const recommendPolicies = (context) => api.post('/ai/recommend-policies', { context });
