import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { budgetApi } from '../services/budgetApi';

const BudgetContext = createContext();

const initialState = {
  budgets: [],
  loading: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    default:
      return state;
  }
};

export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchInitialData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const budgetsRes = await budgetApi.getBudgets().catch(() => []);
      dispatch({ type: 'SET_BUDGETS', payload: budgetsRes });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const addBudget = useCallback(async (data) => {
    const res = await budgetApi.createBudget(data);
    dispatch({ type: 'SET_BUDGETS', payload: [...state.budgets, res] });
    return res;
  }, [state.budgets]);

  const updateBudget = useCallback(async (id, data) => {
    const res = await budgetApi.updateBudget(id, data);
    dispatch({
      type: 'SET_BUDGETS',
      payload: state.budgets.map((b) => (b._id === id ? res : b)),
    });
    return res;
  }, [state.budgets]);

  const deleteBudget = useCallback(async (id) => {
    await budgetApi.deleteBudget(id);
    dispatch({
      type: 'SET_BUDGETS',
      payload: state.budgets.filter((b) => b._id !== id),
    });
  }, [state.budgets]);

  const value = {
    budgets: state.budgets,
    loading: state.loading,
    error: state.error,
    addBudget,
    updateBudget,
    deleteBudget,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
