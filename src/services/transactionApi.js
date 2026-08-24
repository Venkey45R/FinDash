const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export const transactionApi = {
  // Transactions
  getBalance: async () => {
    const response = await fetch(`${API_BASE}/transactions/balance`);
    if (!response.ok) throw new Error('Failed to fetch balance');
    const data = await response.json();
    return data.totalBalance;
  },
  getTransactions: async (page = 1, limit = 50) => {
    const response = await fetch(`${API_BASE}/transactions?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },
  
  addTransaction: async (data) => {
    const response = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add transaction');
    return response.json();
  },
  
  updateTransaction: async (id, data) => {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  },
  
  deleteTransaction: async (id) => {
    const response = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    return response.json();
  },

  // Income Categories
  getIncomeCategories: async () => {
    const response = await fetch(`${API_BASE}/transactions/income-categories`);
    if (!response.ok) throw new Error('Failed to fetch income categories');
    return response.json();
  },
  
  addIncomeCategory: async (data) => {
    const response = await fetch(`${API_BASE}/transactions/income-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add income category');
    return response.json();
  },
  
  updateIncomeCategory: async (id, data) => {
    const response = await fetch(`${API_BASE}/transactions/income-categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update income category');
    return response.json();
  },
  
  deleteIncomeCategory: async (id) => {
    const response = await fetch(`${API_BASE}/transactions/income-categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete income category');
    return response.json();
  }
};
