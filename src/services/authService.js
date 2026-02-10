/**
 * Authentication Service
 * API calls for auth endpoints
 */

import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  verifyMFA: async (data) => {
    const response = await api.post('/auth/verify-mfa', data);
    return response.data;
  },

  resendOTP: async (userId) => {
    const response = await api.post('/auth/resend-otp', { userId });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  }
};
