import api from './api';

export const slotService = {
  getAllSlots: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/slots${params ? `?${params}` : ''}`);
    return response.data;
  },

  getSlotById: async (id) => {
    const response = await api.get(`/slots/${id}`);
    return response.data;
  },
  
  createSlot: async (data) => {
    const response = await api.post('/slots', data);
    return response.data;
  },
  
  updateSlot: async (id, data) => {
    const response = await api.put(`/slots/${id}`, data);
    return response.data;
  },

  deleteSlot: async (id) => {
    const response = await api.delete(`/slots/${id}`);
    return response.data;
  }
};
