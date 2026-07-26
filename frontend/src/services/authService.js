import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  logout: () => {
    // Akan ditangani oleh context dengan menghapus token
    // Tapi jika ada endpoint logout di backend:
    return api.post('/auth/logout');
  }
};
