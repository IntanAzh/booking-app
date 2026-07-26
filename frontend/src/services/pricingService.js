import api from './api';

export const pricingService = {
  getAllRules: async () => {
    const response = await api.get('/pricing/rules');
    return response.data;
  },

  createRule: async (data) => {
    const response = await api.post('/pricing/rules', data);
    return response.data;
  },

  updateRule: async (id, data) => {
    const response = await api.put(`/pricing/rules/${id}`, data);
    return response.data;
  },

  deleteRule: async (id) => {
    const response = await api.delete(`/pricing/rules/${id}`);
    return response.data;
  }
};
