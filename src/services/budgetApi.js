const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export const budgetApi = {
  getBudgets: async () => {
    const response = await fetch(`${API_BASE}/budgets`);
    if (!response.ok) throw new Error('Failed to fetch budgets');
    return response.json();
  },

  createBudget: async (budgetData) => {
    const response = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetData),
    });
    if (!response.ok) throw new Error('Failed to create budget');
    return response.json();
  },

  updateBudget: async (id, budgetData) => {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetData),
    });
    if (!response.ok) throw new Error('Failed to update budget');
    return response.json();
  },

  deleteBudget: async (id) => {
    const response = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete budget');
    return response.json();
  }
};
