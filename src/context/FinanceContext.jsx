import React, { createContext, useContext, useReducer, useEffect, useState, useCallback, useRef } from 'react';
import {
  fetchUser,
  fetchNetWorthHistory,
  fetchAssetCategories,
  fetchLiabilityCategories,
  addInvestment as apiAddInvestment,
  addEntry as apiAddEntry,
  updateEntry as apiUpdateEntry,
  deleteEntry as apiDeleteEntry,
  addLiabilityEntry as apiAddLiabilityEntry,
  updateLiabilityEntry as apiUpdateLiabilityEntry,
  deleteLiabilityEntry as apiDeleteLiabilityEntry,
  syncMarketPrices as apiSyncMarketPrices,
  fetchSyncStatus as apiFetchSyncStatus,
} from '../services/api';
import { searchCatalog } from '../data/instrumentsData';
import { saveState, loadState } from '../utils/idb';

const STORAGE_KEY = 'pfd_state_v3';

// ─── Reducer Actions ───
const SET_DATA = 'SET_DATA';
const SET_ASSET_CATEGORIES = 'SET_ASSET_CATEGORIES';
const UPDATE_ASSET_CATEGORY = 'UPDATE_ASSET_CATEGORY';
const SET_LIABILITY_CATEGORIES = 'SET_LIABILITY_CATEGORIES';
const UPDATE_LIABILITY_CATEGORY = 'UPDATE_LIABILITY_CATEGORY';
const SET_NETWORTH_HISTORY = 'SET_NETWORTH_HISTORY';

const defaultFallbackState = {
  user: { name: 'Venkatesh', email: 'venkatesh@example.com' },
  networthHistory: [],
  assetCategories: [
    {
      _id: 'cat_dom_equity',
      name: 'Domestic Equity',
      icon: 'TrendingUp',
      color: 'bg-teal-500',
      order: 1,
      entries: [
        { _id: 'entry_stocks', name: 'Portfolio Stocks', investedAmount: 65000, currentValue: 62500 },
        { _id: 'entry_mf', name: 'Equity Mutual Fund', investedAmount: 90000, currentValue: 92502 },
      ],
    },
    { _id: 'cat_foreign_equity', name: 'Foreign Equity', icon: 'Globe', color: 'bg-blue-500', order: 2, entries: [] },
    {
      _id: 'cat_debt',
      name: 'Debt',
      icon: 'Shield',
      color: 'bg-indigo-500',
      order: 3,
      entries: [{ _id: 'entry_epf', name: 'EPF', investedAmount: 21600, currentValue: 21600 }],
    },
    {
      _id: 'cat_gold',
      name: 'Gold',
      icon: 'Gem',
      color: 'bg-amber-500',
      order: 4,
      entries: [{ _id: 'entry_gold', name: 'Gold Jewellery', investedAmount: 39620, currentValue: 48562 }],
    },
    {
      _id: 'cat_cash',
      name: 'Cash',
      icon: 'Banknote',
      color: 'bg-emerald-500',
      order: 5,
      entries: [
        { _id: 'entry_savings', name: 'Savings Account', investedAmount: 17500, currentValue: 17500 },
        { _id: 'entry_cash', name: 'Physical Cash', investedAmount: 1500, currentValue: 1500 },
      ],
    },
  ],
  liabilityCategories: [
    {
      _id: 'liab_home',
      name: 'Home Loans',
      icon: 'Home',
      color: 'bg-rose-500',
      order: 1,
      entries: [
        {
          _id: 'entry_homeloan',
          name: 'HDFC Housing Loan',
          originalAmount: 2500000,
          outstandingAmount: 1840000,
          emi: 22500,
          interestRate: 8.5,
        },
      ],
    },
    {
      _id: 'liab_vehicle',
      name: 'Vehicle Loans',
      icon: 'Car',
      color: 'bg-orange-500',
      order: 2,
      entries: [
        {
          _id: 'entry_carloan',
          name: 'Car Loan (ICICI)',
          originalAmount: 600000,
          outstandingAmount: 210000,
          emi: 12400,
          interestRate: 9.2,
        },
      ],
    },
    {
      _id: 'liab_personal',
      name: 'Personal & Consumer Loans',
      icon: 'GraduationCap',
      color: 'bg-purple-500',
      order: 3,
      entries: [
        {
          _id: 'entry_eduloan',
          name: 'Education Loan (SBI)',
          originalAmount: 400000,
          outstandingAmount: 150000,
          emi: 7500,
          interestRate: 10.5,
        },
      ],
    },
    {
      _id: 'liab_cards',
      name: 'Credit Cards',
      icon: 'CreditCard',
      color: 'bg-red-500',
      order: 4,
      entries: [
        {
          _id: 'entry_card_hdfc',
          name: 'HDFC Millennia Credit Card',
          originalAmount: 150000,
          outstandingAmount: 24500,
          emi: 0,
          interestRate: 0,
        },
      ],
    },
    {
      _id: 'liab_other',
      name: 'Other Liabilities',
      icon: 'ShieldAlert',
      color: 'bg-amber-600',
      order: 5,
      entries: [],
    },
  ],
};

const initialState = {
  user: null,
  networthHistory: [],
  assetCategories: [],
  liabilityCategories: [],
  syncStatus: null,
};

function financeReducer(state, action) {
  switch (action.type) {
    case SET_DATA:
      return { ...state, ...action.payload };

    case SET_ASSET_CATEGORIES:
      return { ...state, assetCategories: action.payload };

    case UPDATE_ASSET_CATEGORY: {
      const updated = action.payload;
      return {
        ...state,
        assetCategories: state.assetCategories.map((cat) =>
          cat._id === updated._id ? updated : cat
        ),
      };
    }

    case SET_LIABILITY_CATEGORIES:
      return { ...state, liabilityCategories: action.payload };

    case UPDATE_LIABILITY_CATEGORY: {
      const updated = action.payload;
      return {
        ...state,
        liabilityCategories: state.liabilityCategories.map((cat) =>
          cat._id === updated._id ? updated : cat
        ),
      };
    }

    case SET_NETWORTH_HISTORY:
      return { ...state, networthHistory: action.payload };

    default:
      return state;
  }
}

// ─── Context ───
const FinanceContext = createContext(null);

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within a FinanceProvider');
  return ctx;
};

export const FinanceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Keep a ref to the latest state to avoid stale closures in local fallbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Show a toast notification
  const showToast = useCallback((message, type = 'success', action = null) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type, action });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 5000); // 5s for undo support
  }, []);

  // ─── Initial Load ───
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clean up any legacy mock caches
        try {
          localStorage.removeItem('pfd_state_v1');
          localStorage.removeItem('pfd_state_v2');
        } catch { /* ignore */ }

        // Try IndexedDB cache first for instant render
        const cached = await loadState();
        if (cached) {
          dispatch({ type: SET_DATA, payload: cached });
        }

        // Fetch fresh from API
        try {
          const [userData, historyData, assetData, liabilityData, syncStatusData] = await Promise.all([
            fetchUser(),
            fetchNetWorthHistory(),
            fetchAssetCategories(),
            fetchLiabilityCategories(),
            apiFetchSyncStatus().catch(() => null),
          ]);

          const freshState = {
            user: userData,
            networthHistory: historyData,
            assetCategories: assetData,
            liabilityCategories: liabilityData,
            syncStatus: syncStatusData,
          };

          dispatch({ type: SET_DATA, payload: freshState });
          await saveState(freshState);
        } catch (apiErr) {
          console.warn('Backend fetch failed or offline, falling back to local cached/default state:', apiErr.message);
          if (!cached) {
            dispatch({ type: SET_DATA, payload: defaultFallbackState });
            await saveState(defaultFallbackState);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ─── Persist to IndexedDB on every state change ───
  useEffect(() => {
    if (state.user) {
      saveState(state);
    }
  }, [state]);

  // ─── Asset Entry & Investment CRUD Actions ───

  const addInvestment = useCallback(async (investmentData) => {
    try {
      try {
        const result = await apiAddInvestment(investmentData);
        dispatch({ type: UPDATE_ASSET_CATEGORY, payload: result.category });
        const actionText = result.aggregated ? 'Holding grouped & averaged' : 'Investment added';
        showToast(`${actionText}: "${investmentData.name}"`);
        return result;
      } catch (apiErr) {
        // Fallback local update using stateRef to avoid stale closures
        const targetCatName = investmentData.categoryName || 'Domestic Equity';
        let cat = stateRef.current.assetCategories.find(
          (c) => c.name.toLowerCase() === targetCatName.toLowerCase()
        );
        if (!cat) cat = stateRef.current.assetCategories[0];

        if (cat) {
          const isStockOrETF = investmentData.type === 'STOCK' || investmentData.type === 'ETF';
          const isMF = investmentData.type === 'MUTUAL_FUND';
          const numQty = Number(investmentData.quantity) || 0;
          const numPrice = Number(investmentData.averageBuyPrice) || 0;
          const numUnits = Number(investmentData.units) || 0;
          const numNav = Number(investmentData.averageNAV) || 0;

          let calculatedInvested = 0;
          if (isStockOrETF) calculatedInvested = numQty * numPrice;
          else if (isMF) calculatedInvested = numUnits * numNav;
          else calculatedInvested = Number(investmentData.investedAmount) || 0;

          const calculatedCurrent = Number(investmentData.currentValue) || calculatedInvested;

          let subCat = 'OTHER';
          if (investmentData.type === 'STOCK') subCat = 'STOCKS';
          else if (investmentData.type === 'MUTUAL_FUND') subCat = 'MUTUAL_FUNDS';
          else if (investmentData.type === 'ETF') subCat = 'ETFS';

          const cleanName = (investmentData.name || '').trim().toLowerCase();
          const existingEntryIndex = (cat.entries || []).findIndex(
            (e) => (e.name && e.name.trim().toLowerCase() === cleanName) ||
                   (investmentData.symbol && e.symbol && e.symbol.toUpperCase() === investmentData.symbol.toUpperCase())
          );

          if (existingEntryIndex >= 0) {
            const existing = { ...(cat.entries[existingEntryIndex]) };
            if (isStockOrETF && numQty > 0) {
              const oldQty = existing.quantity || 0;
              const oldInvested = existing.investedAmount || 0;
              const totalQty = oldQty + numQty;
              const totalInvested = oldInvested + calculatedInvested;
              existing.quantity = totalQty;
              existing.investedAmount = totalInvested;
              existing.averageBuyPrice = totalQty > 0 ? parseFloat((totalInvested / totalQty).toFixed(2)) : numPrice;
              existing.currentValue = (existing.currentValue || oldInvested) + calculatedCurrent;
            } else if (isMF && numUnits > 0) {
              const oldUnits = existing.units || 0;
              const oldInvested = existing.investedAmount || 0;
              const totalUnits = oldUnits + numUnits;
              const totalInvested = oldInvested + calculatedInvested;
              existing.units = totalUnits;
              existing.investedAmount = totalInvested;
              existing.averageNAV = totalUnits > 0 ? parseFloat((totalInvested / totalUnits).toFixed(2)) : numNav;
              existing.currentValue = (existing.currentValue || oldInvested) + calculatedCurrent;
            } else {
              existing.investedAmount = (existing.investedAmount || 0) + calculatedInvested;
              existing.currentValue = (existing.currentValue || 0) + calculatedCurrent;
            }

            const updatedEntries = [...(cat.entries || [])];
            updatedEntries[existingEntryIndex] = existing;
            const updatedCat = { ...cat, entries: updatedEntries };
            dispatch({ type: UPDATE_ASSET_CATEGORY, payload: updatedCat });
            showToast(`Holding grouped & averaged: "${investmentData.name}"`);
            return { category: updatedCat, entry: existing, aggregated: true };
          }

          const newEntry = {
            _id: `holding_${Date.now()}`,
            name: investmentData.name,
            symbol: investmentData.symbol || '',
            exchange: investmentData.exchange || 'NSE',
            isin: investmentData.isin || '',
            plan: investmentData.plan || '',
            subCategory: subCat,
            valuationType: investmentData.type === 'OTHER' ? 'MANUAL' : 'MARKET',
            quantity: numQty,
            averageBuyPrice: numPrice,
            units: numUnits,
            averageNAV: numNav,
            investedAmount: calculatedInvested,
            currentValue: calculatedCurrent,
            purchaseDate: investmentData.purchaseDate || new Date(),
          };

          const updatedCat = { ...cat, entries: [...(cat.entries || []), newEntry] };
          dispatch({ type: UPDATE_ASSET_CATEGORY, payload: updatedCat });
          showToast(`"${investmentData.name}" added successfully`);
          return { category: updatedCat, entry: newEntry, aggregated: false };
        }
        throw apiErr;
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }, [showToast]);

  const addEntry = useCallback(async (categoryId, entryData) => {
    try {
      try {
        const result = await apiAddEntry(categoryId, entryData);
        dispatch({ type: UPDATE_ASSET_CATEGORY, payload: result.category });
        const actionText = result.aggregated ? 'Holding grouped & averaged' : 'Added successfully';
        showToast(`${actionText}: "${entryData.name}"`);
        return result;
      } catch (apiErr) {
        // Local state fallback update using stateRef
        const cat = stateRef.current.assetCategories.find((c) => c._id === categoryId);
        if (cat) {
          const cleanName = (entryData.name || '').trim().toLowerCase();
          const existingIndex = (cat.entries || []).findIndex(
            (e) => (e.name && e.name.trim().toLowerCase() === cleanName) ||
                   (entryData.symbol && e.symbol && e.symbol.toUpperCase() === entryData.symbol.toUpperCase())
          );

          const numInvested = Number(entryData.investedAmount) || 0;
          const numCurrent = Number(entryData.currentValue) || numInvested;
          const numQty = Number(entryData.quantity) || 0;
          const numPrice = Number(entryData.averageBuyPrice) || 0;
          const numUnits = Number(entryData.units) || 0;
          const numNav = Number(entryData.averageNAV) || 0;

          if (existingIndex >= 0) {
            const existing = { ...(cat.entries[existingIndex]) };
            if (numQty > 0 || (existing.quantity > 0 && numPrice > 0)) {
              const oldQty = existing.quantity || 0;
              const oldInvested = existing.investedAmount || 0;
              const totalQty = oldQty + numQty;
              const totalInvested = oldInvested + numInvested;
              existing.quantity = totalQty;
              existing.investedAmount = totalInvested;
              existing.averageBuyPrice = totalQty > 0 ? parseFloat((totalInvested / totalQty).toFixed(2)) : numPrice;
              existing.currentValue = (existing.currentValue || oldInvested) + numCurrent;
            } else if (numUnits > 0 || (existing.units > 0 && numNav > 0)) {
              const oldUnits = existing.units || 0;
              const oldInvested = existing.investedAmount || 0;
              const totalUnits = oldUnits + numUnits;
              const totalInvested = oldInvested + numInvested;
              existing.units = totalUnits;
              existing.investedAmount = totalInvested;
              existing.averageNAV = totalUnits > 0 ? parseFloat((totalInvested / totalUnits).toFixed(2)) : numNav;
              existing.currentValue = (existing.currentValue || oldInvested) + numCurrent;
            } else {
              existing.investedAmount = (existing.investedAmount || 0) + numInvested;
              existing.currentValue = (existing.currentValue || 0) + numCurrent;
            }

            const updatedEntries = [...(cat.entries || [])];
            updatedEntries[existingIndex] = existing;
            const updatedCat = { ...cat, entries: updatedEntries };
            dispatch({ type: UPDATE_ASSET_CATEGORY, payload: updatedCat });
            showToast(`Holding grouped & averaged: "${entryData.name}"`);
            return { category: updatedCat, entry: existing, aggregated: true };
          }

          const newEntry = {
            _id: `entry_${Date.now()}`,
            name: entryData.name,
            investedAmount: numInvested,
            currentValue: numCurrent,
            quantity: numQty,
            averageBuyPrice: numPrice,
            units: numUnits,
            averageNAV: numNav,
            symbol: entryData.symbol || '',
            exchange: entryData.exchange || '',
          };
          const updatedCat = { ...cat, entries: [...(cat.entries || []), newEntry] };
          dispatch({ type: UPDATE_ASSET_CATEGORY, payload: updatedCat });
          showToast(`"${entryData.name}" added successfully`);
          return { category: updatedCat, entry: newEntry, aggregated: false };
        }
        throw apiErr;
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }, [showToast]);

  const updateEntry = useCallback(async (categoryId, entryId, updates) => {
    try {
      try {
        const result = await apiUpdateEntry(categoryId, entryId, updates);
        dispatch({ type: UPDATE_ASSET_CATEGORY, payload: result.category });
        showToast('Entry updated successfully');
        return result;
      } catch (apiErr) {
        // Local state fallback update
        const cat = stateRef.current.assetCategories.find((c) => c._id === categoryId);
        if (cat) {
          const updatedEntries = (cat.entries || []).map((e) =>
            e._id === entryId ? { ...e, ...updates } : e
          );
          const updatedCat = { ...cat, entries: updatedEntries };
          dispatch({ type: UPDATE_ASSET_CATEGORY, payload: updatedCat });
          showToast('Entry updated successfully');
          return { category: updatedCat };
        }
        throw apiErr;
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }, [showToast]);

  const deleteEntry = useCallback(async (categoryId, entryId) => {
    // Implement soft-delete / undo functionality
    const cat = stateRef.current.assetCategories.find((c) => c._id === categoryId);
    if (!cat) return;
    
    const entryToDelete = cat.entries.find((e) => e._id === entryId);
    if (!entryToDelete) return;

    // Remove from UI immediately
    const updatedEntries = cat.entries.filter((e) => e._id !== entryId);
    const updatedCat = { ...cat, entries: updatedEntries };
    dispatch({ type: UPDATE_ASSET_CATEGORY, payload: updatedCat });

    let isUndone = false;
    
    // Show undo toast
    showToast(`Deleted ${entryToDelete.name}`, 'success', {
      label: 'Undo',
      onClick: () => {
        isUndone = true;
        // Restore to state
        dispatch({ type: UPDATE_ASSET_CATEGORY, payload: cat });
        setToast(null);
      }
    });

    // Wait for 5 seconds to give user time to undo
    setTimeout(async () => {
      if (isUndone) return;
      
      try {
        await apiDeleteEntry(categoryId, entryId);
      } catch (apiErr) {
        // Ignore api errors for soft-delete background tasks
      }
    }, 5000);
    
    return { category: updatedCat };
  }, [showToast]);

  // ─── Liability Entry CRUD Actions ───

  const addLiabilityEntry = useCallback(async (categoryId, entryData) => {
    try {
      try {
        const result = await apiAddLiabilityEntry(categoryId, entryData);
        dispatch({ type: UPDATE_LIABILITY_CATEGORY, payload: result.category });
        const actionText = result.aggregated ? 'Liability grouped & updated' : 'Added to liabilities';
        showToast(`${actionText}: "${entryData.name}"`);
        return result;
      } catch (apiErr) {
        // Local state fallback update
        const cat = stateRef.current.liabilityCategories.find((c) => c._id === categoryId);
        if (cat) {
          const cleanName = (entryData.name || '').trim().toLowerCase();
          const existingIndex = (cat.entries || []).findIndex(
            (e) => e.name && e.name.trim().toLowerCase() === cleanName
          );

          const numOriginal = Number(entryData.originalAmount) || 0;
          const numOutstanding = Number(entryData.outstandingAmount) || numOriginal;
          const numEmi = Number(entryData.emi) || 0;
          const numRate = Number(entryData.interestRate) || 0;

          if (existingIndex >= 0) {
            const existing = { ...(cat.entries[existingIndex]) };
            const oldOutstanding = existing.outstandingAmount || 0;
            const oldRate = existing.interestRate || 0;
            const totalOutstanding = oldOutstanding + numOutstanding;

            let weightedRate = numRate;
            if (totalOutstanding > 0 && oldRate > 0 && numRate > 0) {
              weightedRate = parseFloat(
                ((oldOutstanding * oldRate + numOutstanding * numRate) / totalOutstanding).toFixed(2)
              );
            } else if (oldRate > 0) {
              weightedRate = oldRate;
            }

            existing.originalAmount = (existing.originalAmount || 0) + numOriginal;
            existing.outstandingAmount = totalOutstanding;
            existing.emi = (existing.emi || 0) + numEmi;
            existing.interestRate = weightedRate;

            const updatedEntries = [...(cat.entries || [])];
            updatedEntries[existingIndex] = existing;
            const updatedCat = { ...cat, entries: updatedEntries };
            dispatch({ type: UPDATE_LIABILITY_CATEGORY, payload: updatedCat });
            showToast(`Liability grouped & updated: "${entryData.name}"`);
            return { category: updatedCat, entry: existing, aggregated: true };
          }

          const newEntry = {
            _id: `liab_entry_${Date.now()}`,
            name: entryData.name,
            originalAmount: numOriginal,
            outstandingAmount: numOutstanding,
            emi: numEmi,
            interestRate: numRate,
          };
          const updatedCat = { ...cat, entries: [...(cat.entries || []), newEntry] };
          dispatch({ type: UPDATE_LIABILITY_CATEGORY, payload: updatedCat });
          showToast(`"${entryData.name}" added to liabilities`);
          return { category: updatedCat, entry: newEntry, aggregated: false };
        }
        throw apiErr;
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }, [showToast]);

  const updateLiabilityEntry = useCallback(async (categoryId, entryId, updates) => {
    try {
      try {
        const result = await apiUpdateLiabilityEntry(categoryId, entryId, updates);
        dispatch({ type: UPDATE_LIABILITY_CATEGORY, payload: result.category });
        showToast('Liability updated successfully');
        return result;
      } catch (apiErr) {
        // Local state fallback update
        const cat = stateRef.current.liabilityCategories.find((c) => c._id === categoryId);
        if (cat) {
          const updatedEntries = (cat.entries || []).map((e) =>
            e._id === entryId ? { ...e, ...updates } : e
          );
          const updatedCat = { ...cat, entries: updatedEntries };
          dispatch({ type: UPDATE_LIABILITY_CATEGORY, payload: updatedCat });
          showToast('Liability updated successfully');
          return { category: updatedCat };
        }
        throw apiErr;
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }, [showToast]);

  const deleteLiabilityEntry = useCallback(async (categoryId, entryId) => {
    // Implement soft-delete / undo functionality
    const cat = stateRef.current.liabilityCategories.find((c) => c._id === categoryId);
    if (!cat) return;
    
    const entryToDelete = cat.entries.find((e) => e._id === entryId);
    if (!entryToDelete) return;

    // Remove from UI immediately
    const updatedEntries = cat.entries.filter((e) => e._id !== entryId);
    const updatedCat = { ...cat, entries: updatedEntries };
    dispatch({ type: UPDATE_LIABILITY_CATEGORY, payload: updatedCat });

    let isUndone = false;
    
    // Show undo toast
    showToast(`Deleted ${entryToDelete.name}`, 'success', {
      label: 'Undo',
      onClick: () => {
        isUndone = true;
        // Restore to state
        dispatch({ type: UPDATE_LIABILITY_CATEGORY, payload: cat });
        setToast(null);
      }
    });

    // Wait for 5 seconds to give user time to undo
    setTimeout(async () => {
      if (isUndone) return;
      
      try {
        await apiDeleteLiabilityEntry(categoryId, entryId);
      } catch (apiErr) {
        // Ignore api errors for soft-delete background tasks
      }
    }, 5000);
    
    return { category: updatedCat };
  }, [showToast]);

  const [syncingPrices, setSyncingPrices] = useState(false);

  const syncPrices = useCallback(async (isAutoTrigger = false) => {
    setSyncingPrices(true);
    try {
      try {
        const result = await apiSyncMarketPrices();
        if (result.categories) {
          dispatch({ type: SET_ASSET_CATEGORIES, payload: result.categories });
        }
        try {
          const freshHistory = await fetchNetWorthHistory();
          if (freshHistory && Array.isArray(freshHistory)) {
            dispatch({ type: SET_NETWORTH_HISTORY, payload: freshHistory });
          }
        } catch { /* ignore */ }
        const count = result.syncResult?.totalUpdated || 0;
        showToast(
          isAutoTrigger
            ? `[4:00 PM Auto-Sync] Updated ${count} mutual funds & stocks!`
            : `Synced market prices & NAVs! ${count} holdings updated.`
        );
        return result;
      } catch (apiErr) {
        console.warn('Backend sync returned error, applying local price update fallback:', apiErr.message);

        let localUpdatedCount = 0;
        const updatedCategories = (stateRef.current.assetCategories || []).map((cat) => {
          const updatedEntries = (cat.entries || []).map((entry) => {
            const isStockOrETF = entry.quantity > 0 && entry.averageBuyPrice > 0;
            const isMF = entry.units > 0 && entry.averageNAV > 0;

            if (isStockOrETF) {
              const matches = searchCatalog(entry.symbol || entry.name);
              const found = matches[0];
              const price = found?.price || found?.latestPrice || entry.averageBuyPrice;
              const prev = found?.previousClose || entry.previousClose || price;
              const change = parseFloat((price - prev).toFixed(2));
              const changePercent = prev > 0 ? parseFloat((((price - prev) / prev) * 100).toFixed(2)) : 0;

              if (price) {
                localUpdatedCount++;
                return {
                  ...entry,
                  latestPrice: price,
                  currentPrice: price,
                  previousClose: prev,
                  dailyChange: change,
                  dailyChangePercent: changePercent,
                  currentValue: parseFloat((entry.quantity * price).toFixed(2)),
                  lastPriceUpdated: new Date().toISOString(),
                };
              }
            } else if (isMF) {
              const matches = searchCatalog(entry.symbol || entry.name, 'MUTUAL_FUND');
              const found = matches[0];
              const nav = found?.nav || found?.latestNAV || entry.averageNAV;
              const prevNav = found?.previousClose || entry.previousNAV || nav;
              const change = parseFloat((nav - prevNav).toFixed(4));
              const changePercent = prevNav > 0 ? parseFloat((((nav - prevNav) / prevNav) * 100).toFixed(2)) : 0;

              if (nav) {
                localUpdatedCount++;
                return {
                  ...entry,
                  latestNAV: nav,
                  previousNAV: prevNav,
                  dailyChange: change,
                  dailyChangePercent: changePercent,
                  navDate: new Date().toLocaleDateString('en-IN'),
                  currentValue: parseFloat((entry.units * nav).toFixed(2)),
                  lastPriceUpdated: new Date().toISOString(),
                };
              }
            }
            return entry;
          });

          return { ...cat, entries: updatedEntries };
        });

        dispatch({ type: SET_ASSET_CATEGORIES, payload: updatedCategories });
        showToast(
          isAutoTrigger
            ? `[4:00 PM Auto-Sync] Updated ${localUpdatedCount} mutual funds & stocks!`
            : `Synced market prices & NAVs! ${localUpdatedCount} holdings updated.`
        );
        return { success: true, totalUpdated: localUpdatedCount };
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to sync market prices: ' + err.message, 'error');
    } finally {
      setSyncingPrices(false);
    }
  }, [showToast]); // removed state.assetCategories from deps using stateRef

  // ─── 4:00 PM (16:00 IST) Daily Auto-Sync Timer in Browser ───
  // Use a ref for syncPrices to prevent useEffect re-triggering (fixes #9)
  const syncPricesRef = useRef(syncPrices);
  useEffect(() => {
    syncPricesRef.current = syncPrices;
  }, [syncPrices]);

  useEffect(() => {
    let timerId = null;

    const scheduleNext4PM = () => {
      const now = new Date();
      // IST offset is UTC+5:30
      const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
      const istNow = new Date(utcNow + 5.5 * 3600000);

      const targetIST = new Date(istNow);
      targetIST.setHours(16, 0, 0, 0);

      // If already past 4:00 PM IST today, set for tomorrow 4:00 PM
      if (istNow.getTime() >= targetIST.getTime()) {
        targetIST.setDate(targetIST.getDate() + 1);
      }

      const delayMs = targetIST.getTime() - istNow.getTime();

      timerId = setTimeout(async () => {
        console.log('[FinanceContext] 4:00 PM IST reached! Auto-syncing mutual fund NAVs and stock prices...');
        await syncPricesRef.current(true);
        // Schedule next day
        scheduleNext4PM();
      }, Math.max(delayMs, 1000));
    };

    scheduleNext4PM();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  const value = {
    ...state,
    loading,
    error,
    toast,
    showToast,
    // Daily Price Sync
    syncPrices,
    syncingPrices,
    // Asset Entry CRUD
    addInvestment,
    addEntry,
    updateEntry,
    deleteEntry,
    // Liability Entry CRUD
    addLiabilityEntry,
    updateLiabilityEntry,
    deleteLiabilityEntry,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-24 right-6 z-[100] px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 animate-slide-up flex items-center gap-3 ${
          toast.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-teal-600 text-white'
        }`}>
          <span>{toast.message}</span>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </FinanceContext.Provider>
  );
};
