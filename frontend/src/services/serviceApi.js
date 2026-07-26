import api from './api';

export const serviceApi = {
  getAllServices: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/services${params ? `?${params}` : ''}`);
    return response.data.data || []; // Array ada di properti 'data'
  },

  getServiceById: async (id) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },
  
  // Endpoint untuk mengambil provider (bisa dipisah ke providerApi jika sudah berkembang)
  getAllProviders: async () => {
    const response = await api.get('/providers');
    return response.data.data || [];
  },

  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  updateService: async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
  },

  deleteService: async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  }
};
