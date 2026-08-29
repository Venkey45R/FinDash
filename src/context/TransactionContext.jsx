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
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t._id === action.payload._id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t._id !== action.payload),
      };
    case 'SET_INCOME_CATEGORIES':
      return { ...state, incomeCategories: action.payload };
    case 'ADD_INCOME_CATEGORY':
      return { ...state, incomeCategories: [...state.incomeCategories, action.payload] };
    case 'UPDATE_INCOME_CATEGORY':
      return {
        ...state,
        incomeCategories: state.incomeCategories.map((c) =>
          c._id === action.payload._id ? action.payload : c
        ),
      };
    case 'DELETE_INCOME_CATEGORY':
      return {
        ...state,
        incomeCategories: state.incomeCategories.filter((c) => c._id !== action.payload),
      };
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

  // CRUD actions — use dedicated reducer actions to avoid stale closure bugs.
  // Each callback only dispatches; the reducer reads the latest state internally.
  const addTransaction = useCallback(async (data) => {
    const res = await transactionApi.addTransaction(data);
    dispatch({ type: 'ADD_TRANSACTION', payload: res });
    syncBalance();
    return res;
  }, [syncBalance]);

  const updateTransaction = useCallback(async (id, data) => {
    const res = await transactionApi.updateTransaction(id, data);
    dispatch({ type: 'UPDATE_TRANSACTION', payload: res });
    syncBalance();
    return res;
  }, [syncBalance]);

  const deleteTransaction = useCallback(async (id) => {
    await transactionApi.deleteTransaction(id);
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
    syncBalance();
  }, [syncBalance]);

  const addIncomeCategory = useCallback(async (name) => {
    const res = await transactionApi.addIncomeCategory({ name });
    dispatch({ type: 'ADD_INCOME_CATEGORY', payload: res });
    return res;
  }, []);

  const updateIncomeCategory = useCallback(async (id, name) => {
    const res = await transactionApi.updateIncomeCategory(id, { name });
    dispatch({ type: 'UPDATE_INCOME_CATEGORY', payload: res });
    return res;
  }, []);

  const deleteIncomeCategory = useCallback(async (id) => {
    await transactionApi.deleteIncomeCategory(id);
    dispatch({ type: 'DELETE_INCOME_CATEGORY', payload: id });
  }, []);

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
