import api from './api';

export const providerService = {
  getAllProviders: async () => {
    const response = await api.get('/providers');
    return response.data;
  },

  getProviderById: async (id) => {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },

  createProvider: async (providerData) => {
    const response = await api.post('/providers', providerData);
    return response.data;
  },

  updateProvider: async (id, providerData) => {
    const response = await api.put(`/providers/${id}`, providerData);
    return response.data;
  },

  deleteProvider: async (id) => {
    const response = await api.delete(`/providers/${id}`);
    return response.data;
  }
};
