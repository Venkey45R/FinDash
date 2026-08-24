import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { transactionApi } from '../services/transactionApi';
import { useFinance } from './FinanceContext';

const TransactionContext = createContext();

const initialState = {
  transactions: [],
  incomeCategories: [],
  metadata: {
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  },
  loading: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        transactions: action.payload.transactions,
        metadata: action.payload.metadata || initialState.metadata,
        incomeCategories: action.payload.incomeCategories,
      };
    case 'APPEND_TRANSACTIONS':
      return {
        ...state,
        transactions: [...state.transactions, ...action.payload.transactions],
        metadata: action.payload.metadata,
      };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'SET_INCOME_CATEGORIES':
      return { ...state, incomeCategories: action.payload };
    default:
      return state;
  }
};

export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { updateTotalBalance } = useFinance();

  const syncBalance = useCallback(async () => {
    try {
      const bal = await transactionApi.getBalance();
      if (updateTotalBalance) updateTotalBalance(bal);
    } catch (e) {
      console.error('Failed to sync balance', e);
    }
  }, [updateTotalBalance]);

  const fetchInitialData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [transRes, incRes] = await Promise.all([
        transactionApi.getTransactions(1, 50).catch(() => ({ data: [], metadata: null })),
        transactionApi.getIncomeCategories().catch(() => []),
      ]);
      dispatch({
        type: 'SET_INITIAL_DATA',
        payload: {
          transactions: transRes.data || transRes, // Fallback if API hasn't updated yet
          metadata: transRes.metadata,
          incomeCategories: incRes,
        },
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadMoreTransactions = useCallback(async () => {
    if (state.metadata && state.metadata.page < state.metadata.totalPages) {
      const nextPage = state.metadata.page + 1;
      try {
        const transRes = await transactionApi.getTransactions(nextPage, 50);
        if (transRes.data) {
          dispatch({
            type: 'APPEND_TRANSACTIONS',
            payload: { transactions: transRes.data, metadata: transRes.metadata },
          });
        }
      } catch (err) {
        console.error('Failed to load more transactions:', err);
      }
    }
  }, [state.metadata]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // CRUD actions...
  const addTransaction = useCallback(async (data) => {
    const res = await transactionApi.addTransaction(data);
    dispatch({ type: 'SET_TRANSACTIONS', payload: [res, ...state.transactions] });
    syncBalance();
    return res;
  }, [state.transactions, syncBalance]);

  const updateTransaction = useCallback(async (id, data) => {
    const res = await transactionApi.updateTransaction(id, data);
    dispatch({
      type: 'SET_TRANSACTIONS',
      payload: state.transactions.map((t) => (t._id === id ? res : t)),
    });
    syncBalance();
    return res;
  }, [state.transactions, syncBalance]);

  const deleteTransaction = useCallback(async (id) => {
    await transactionApi.deleteTransaction(id);
    dispatch({
      type: 'SET_TRANSACTIONS',
      payload: state.transactions.filter((t) => t._id !== id),
    });
    syncBalance();
  }, [state.transactions, syncBalance]);

  const addIncomeCategory = useCallback(async (name) => {
    const res = await transactionApi.addIncomeCategory({ name });
    dispatch({ type: 'SET_INCOME_CATEGORIES', payload: [...state.incomeCategories, res] });
    return res;
  }, [state.incomeCategories]);

  const updateIncomeCategory = useCallback(async (id, name) => {
    const res = await transactionApi.updateIncomeCategory(id, { name });
    dispatch({
      type: 'SET_INCOME_CATEGORIES',
      payload: state.incomeCategories.map((c) => (c._id === id ? res : c)),
    });
    return res;
  }, [state.incomeCategories]);

  const deleteIncomeCategory = useCallback(async (id) => {
    await transactionApi.deleteIncomeCategory(id);
    dispatch({
      type: 'SET_INCOME_CATEGORIES',
      payload: state.incomeCategories.filter((c) => c._id !== id),
    });
  }, [state.incomeCategories]);

  const value = {
    transactions: state.transactions,
    incomeCategories: state.incomeCategories,
    metadata: state.metadata,
    loading: state.loading,
    error: state.error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addIncomeCategory,
    updateIncomeCategory,
    deleteIncomeCategory,
    loadMoreTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => useContext(TransactionContext);
