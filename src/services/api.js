const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('fin-dash-token');
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// ─── User & History (read-only) ───

export const fetchUser = async () => {
  const res = await fetch(`${API_BASE}/dashboard/user`, { headers: getHeaders(false) });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

export const fetchNetWorthHistory = async () => {
  const res = await fetch(`${API_BASE}/dashboard/networth-history`, { headers: getHeaders(false) });
  if (!res.ok) throw new Error('Failed to fetch net worth history');
  return res.json();
};

// ─── Instruments Search (V3) ───

export const searchInstruments = async (query = '', type = '') => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (type) params.append('type', type);
  const res = await fetch(`${API_BASE}/instruments/search?${params.toString()}`, { headers: getHeaders(false) });
  if (!res.ok) throw new Error('Failed to search instruments');
  return res.json();
};

// ─── Asset Categories & Investments (CRUD) ───

export const fetchAssetCategories = async () => {
  const res = await fetch(`${API_BASE}/assets`, { headers: getHeaders(false) });
  if (!res.ok) throw new Error('Failed to fetch asset categories');
  return res.json();
};

export const addInvestment = async (investmentData) => {
  const res = await fetch(`${API_BASE}/assets/investment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(investmentData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add investment');
  }
  return res.json();
};

export const addEntry = async (categoryId, entryData) => {
  const res = await fetch(`${API_BASE}/assets/${categoryId}/entries`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(entryData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add entry');
  }
  return res.json();
};

export const updateEntry = async (categoryId, entryId, updates) => {
  const res = await fetch(`${API_BASE}/assets/${categoryId}/entries/${entryId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update entry');
  }
  return res.json();
};

export const deleteEntry = async (categoryId, entryId) => {
  const res = await fetch(`${API_BASE}/assets/${categoryId}/entries/${entryId}`, {
    method: 'DELETE',
    headers: getHeaders(false),
  });
  if (!res.ok) throw new Error('Failed to delete entry');
  return res.json();
};

// ─── Liability Categories (CRUD) ───

export const fetchLiabilityCategories = async () => {
  const res = await fetch(`${API_BASE}/liabilities`, { headers: getHeaders(false) });
  if (!res.ok) throw new Error('Failed to fetch liability categories');
  return res.json();
};

export const addLiabilityEntry = async (categoryId, entryData) => {
  const res = await fetch(`${API_BASE}/liabilities/${categoryId}/entries`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(entryData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add liability entry');
  }
  return res.json();
};

export const updateLiabilityEntry = async (categoryId, entryId, updates) => {
  const res = await fetch(`${API_BASE}/liabilities/${categoryId}/entries/${entryId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update liability entry');
  }
  return res.json();
};

export const deleteLiabilityEntry = async (categoryId, entryId) => {
  const res = await fetch(`${API_BASE}/liabilities/${categoryId}/entries/${entryId}`, {
    method: 'DELETE',
    headers: getHeaders(false),
  });
  if (!res.ok) throw new Error('Failed to delete liability entry');
  return res.json();
};

// ─── Daily Market Price Sync ───

export const syncMarketPrices = async () => {
  const res = await fetch(`${API_BASE}/assets/sync-prices`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to sync market prices');
  }
  return res.json();
};

export const fetchSyncStatus = async () => {
  const res = await fetch(`${API_BASE}/assets/sync-status`, { headers: getHeaders(false) });
  if (!res.ok) throw new Error('Failed to fetch sync status');
  return res.json();
};

// ─── Single Instrument Live Price ───

export const fetchLivePrice = async (symbol = '', type = '', name = '', exchange = 'NSE') => {
  try {
    const params = new URLSearchParams();
    if (symbol) params.append('symbol', symbol);
    if (type) params.append('type', type);
    if (name) params.append('name', name);
    if (exchange) params.append('exchange', exchange);

    const res = await fetch(`${API_BASE}/instruments/live-price?${params.toString()}`, { headers: getHeaders(false) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.price) {
        return {
          price: data.price,
          nav: data.nav || data.price,
          latestPrice: data.latestPrice || data.price,
          latestNAV: data.latestNAV || data.price,
          previousClose: data.previousClose,
          previousNAV: data.previousNAV,
          change: data.change,
          changePercent: data.changePercent,
          date: data.date,
          type: data.type,
        };
      }
    }
  } catch (e) {
    console.warn('[API] Failed to fetch live price:', e.message);
  }

  return null;
};
