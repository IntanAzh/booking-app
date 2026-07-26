import api from './api';

export const scheduleService = {
  getAllSchedules: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/schedules${params ? `?${params}` : ''}`);
    return response.data;
  },

  getScheduleById: async (id) => {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },
  
  createSchedule: async (data) => {
    const response = await api.post('/schedules', data);
    return response.data;
  },
  
  updateSchedule: async (id, data) => {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },

  deleteSchedule: async (id) => {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  }
};
