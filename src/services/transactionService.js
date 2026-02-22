/**
 * Transaction Service
 * API calls for transactions
 */

import api from './api';

export const transactionService = {
  getTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  createTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  approveTransaction: async (transactionId) => {
    const response = await api.post(`/transactions/${transactionId}/approve`);
    return response.data;
  },

  // Admin endpoints
  getFraudLogs: async () => {
    const response = await api.get('/admin/fraud-logs');
    return response.data;
  },

  getAuditLogs: async () => {
    const response = await api.get('/admin/audit-logs');
    return response.data;
  },

  resolveFraudLog: async (id, notes, action) => {
    const response = await api.post(`/admin/fraud-logs/${id}/resolve`, { notes, action });
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  }
};
