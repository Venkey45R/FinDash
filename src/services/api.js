const API_BASE = '/api';

// ─── User & History (read-only) ───

export const fetchUser = async () => {
  const res = await fetch(`${API_BASE}/dashboard/user`);
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

export const fetchNetWorthHistory = async () => {
  const res = await fetch(`${API_BASE}/dashboard/networth-history`);
  if (!res.ok) throw new Error('Failed to fetch net worth history');
  return res.json();
};

// ─── Instruments Search (V3) ───

export const searchInstruments = async (query = '', type = '') => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (type) params.append('type', type);
  const res = await fetch(`${API_BASE}/instruments/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search instruments');
  return res.json();
};

// ─── Asset Categories & Investments (CRUD) ───

export const fetchAssetCategories = async () => {
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error('Failed to fetch asset categories');
  return res.json();
};

export const addInvestment = async (investmentData) => {
  const res = await fetch(`${API_BASE}/assets/investment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
  });
  if (!res.ok) throw new Error('Failed to delete entry');
  return res.json();
};

// ─── Liability Categories (CRUD) ───

export const fetchLiabilityCategories = async () => {
  const res = await fetch(`${API_BASE}/liabilities`);
  if (!res.ok) throw new Error('Failed to fetch liability categories');
  return res.json();
};

export const addLiabilityEntry = async (categoryId, entryData) => {
  const res = await fetch(`${API_BASE}/liabilities/${categoryId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
  });
  if (!res.ok) throw new Error('Failed to delete liability entry');
  return res.json();
};

// ─── Daily Market Price Sync ───

export const syncMarketPrices = async () => {
  const res = await fetch(`${API_BASE}/assets/sync-prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to sync market prices');
  }
  return res.json();
};

export const fetchSyncStatus = async () => {
  const res = await fetch(`${API_BASE}/assets/sync-status`);
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

    const res = await fetch(`${API_BASE}/instruments/live-price?${params.toString()}`);
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
    // try direct client fallback
  }

  // Direct client fallback for stock via Yahoo Finance
  if (symbol && (type === 'STOCK' || type === 'ETF' || !type)) {
    try {
      const yahooSym = symbol.endsWith('.NS') || symbol.endsWith('.BO') ? symbol : `${symbol}.NS`;
      const yRes = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?interval=1d&range=2d`, {
        signal: AbortSignal.timeout(3000),
      });
      if (yRes.ok) {
        const yData = await yRes.json();
        const meta = yData?.chart?.result?.[0]?.meta;
        const p = meta?.regularMarketPrice || meta?.chartPreviousClose;
        if (p && typeof p === 'number') {
          const price = parseFloat(p.toFixed(2));
          const prev = meta?.chartPreviousClose ? parseFloat(meta.chartPreviousClose.toFixed(2)) : price;
          const change = parseFloat((price - prev).toFixed(2));
          const changePercent = prev > 0 ? parseFloat((((price - prev) / prev) * 100).toFixed(2)) : 0;
          return {
            price,
            latestPrice: price,
            previousClose: prev,
            change,
            changePercent,
            type: 'STOCK',
          };
        }
      }
    } catch {
      // fallback
    }
  }

  // Direct client fallback for mutual fund via MFAPI.in
  if (name && (type === 'MUTUAL_FUND' || name.toLowerCase().includes('fund'))) {
    try {
      const clean = encodeURIComponent(name.slice(0, 30));
      const sRes = await fetch(`https://api.mfapi.in/mf/search?q=${clean}`, { signal: AbortSignal.timeout(3000) });
      if (sRes.ok) {
        const list = await sRes.json();
        if (list.length > 0) {
          const code = list[0].schemeCode;
          const nRes = await fetch(`https://api.mfapi.in/mf/${code}`, { signal: AbortSignal.timeout(3000) });
          if (nRes.ok) {
            const nData = await nRes.json();
            const series = nData?.data;
            if (Array.isArray(series) && series.length > 0) {
              const latest = parseFloat(series[0]?.nav);
              const prev = series.length > 1 ? parseFloat(series[1]?.nav) : latest;
              if (!isNaN(latest) && latest > 0) {
                const nav = parseFloat(latest.toFixed(4));
                const prevNav = !isNaN(prev) && prev > 0 ? parseFloat(prev.toFixed(4)) : nav;
                const change = parseFloat((nav - prevNav).toFixed(4));
                const changePercent = prevNav > 0 ? parseFloat((((nav - prevNav) / prevNav) * 100).toFixed(2)) : 0;
                return {
                  price: nav,
                  nav,
                  latestNAV: nav,
                  previousNAV: prevNav,
                  change,
                  changePercent,
                  date: series[0]?.date,
                  type: 'MUTUAL_FUND',
                };
              }
            }
          }
        }
      }
    } catch {
      // fallback
    }
  }

  return null;
};
