const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('fin-dash-token');
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const budgetApi = {
  getBudgets: async () => {
    const response = await fetch(`${API_BASE}/budgets`, { headers: getHeaders(false) });
    if (!response.ok) throw new Error('Failed to fetch budgets');
    return response.json();
  },

  createBudget: async (budgetData) => {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(budgetData),
    });
    if (!response.ok) throw new Error('Failed to create budget');
    return response.json();
  },

  updateBudget: async (id, budgetData) => {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(budgetData),
    });
    if (!response.ok) throw new Error('Failed to update budget');
    return response.json();
  },

  deleteBudget: async (id) => {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });
    if (!response.ok) throw new Error('Failed to delete budget');
    return response.json();
  }
};
