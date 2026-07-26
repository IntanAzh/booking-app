import api from './api';

export const bookingApi = {
  getAllBookings: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/bookings${params ? `?${params}` : ''}`);
    return response.data;
  },

  getBookingById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  updateBookingStatus: async (id, status) => {
    const response = await api.put(`/bookings/${id}`, { status });
    return response.data;
  },

  deleteBooking: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  }
};
