import api from './api';

export const paymentService = {
  getAllPayments: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/payments${params ? `?${params}` : ''}`);
    return response.data;
  },

  getPaymentById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
  
  processPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },
  
  updatePaymentStatus: async (id, status) => {
    // Simulasi jika ada endpoint webhook / update manual
    const response = await api.put(`/payments/${id}`, { status });
    return response.data;
  }
};
