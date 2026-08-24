import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const transactionApi = {
  // Transactions
  getBalance: async () => {
    const response = await api.get('/transactions/balance');
    return response.data.totalBalance;
  },
  getTransactions: async (page = 1, limit = 50) => {
    const response = await api.get(`/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  addTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },
  
  updateTransaction: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },
  
  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Income Categories
  getIncomeCategories: async () => {
    const response = await api.get('/transactions/income-categories');
    return response.data;
  },
  
  addIncomeCategory: async (data) => {
    const response = await api.post('/transactions/income-categories', data);
    return response.data;
  },
  
  updateIncomeCategory: async (id, data) => {
    const response = await api.put(`/transactions/income-categories/${id}`, data);
    return response.data;
  },
  
  deleteIncomeCategory: async (id) => {
    const response = await api.delete(`/transactions/income-categories/${id}`);
    return response.data;
  }
};
