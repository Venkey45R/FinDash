import React, { useState, useMemo, Fragment } from 'react';
import { X, Plus, Save, Trash2, Check, Edit2, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Receipt, Settings, CalendarDays } from 'lucide-react';
import { useTransaction } from '../context/TransactionContext';
import { useBudget } from '../context/BudgetContext';
import { formatINR } from '../utils/format';
import ConfirmPopup from './ConfirmPopup';
import ManageCategoriesModal from './ManageCategoriesModal';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DEFAULT_INCOME_CATEGORIES = ['Salary', 'Share Market', 'Bonus', 'Others'];

const TrackingSidebar = ({ isOpen, onClose }) => {
  const { budgets = [] } = useBudget();
  const { 
    transactions = [], 
    incomeCategories = [], 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    addIncomeCategory, 
    loading,
    metadata,
    loadMoreTransactions
  } = useTransaction();
  
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState('expense'); // 'expense' | 'income'
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCustomCategory, setNewCustomCategory] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Current month state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const { currentMonthIncome, currentMonthExpense, totalBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let balance = 0;

    const selectedDateEnd = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
    
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const isThisMonth = tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
      const isBeforeOrThisMonth = tDate <= selectedDateEnd;

      if (isBeforeOrThisMonth) {
        if (t.type === 'income') {
          balance += t.amount;
          if (isThisMonth) income += t.amount;
        } else {
          balance -= t.amount;
          if (isThisMonth) expense += t.amount;
        }
      }
    });

    return { currentMonthIncome: income, currentMonthExpense: expense, totalBalance: balance };
  }, [transactions, selectedMonth, selectedYear]);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Group transactions by date, sorted newest-first
  const groupedTransactions = useMemo(() => {
    const groups = {};
    currentMonthTransactions.forEach(t => {
      const dateObj = new Date(t.date);
      const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });

    // Sort date keys newest first
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    return sortedKeys.map(dateKey => ({
      dateKey,
      label: new Date(dateKey + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      transactions: groups[dateKey]
    }));
  }, [currentMonthTransactions]);

  const expenseCategories = useMemo(() => budgets.map(b => b.name), [budgets]);
  const userIncomeCategories = useMemo(() => {
    const custom = incomeCategories.map(c => c.name);
    const combined = [...new Set([...DEFAULT_INCOME_CATEGORIES, ...custom])];
    return combined;
  }, [incomeCategories]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newAmount || (!newCategory && !isAddingNewCategory)) return;
    
    let finalCategory = newCategory;
    
    if (addType === 'income' && isAddingNewCategory && newCustomCategory.trim()) {
      finalCategory = newCustomCategory.trim();
      await addIncomeCategory(finalCategory);
    }
    
    await addTransaction({
      type: addType,
      amount: Number(newAmount),
      category: finalCategory,
      date: new Date(selectedYear, selectedMonth, new Date().getDate()) // Default to today within selected month
    });
    
    setIsAdding(false);
    setNewAmount('');
    setNewCategory('');
    setNewCustomCategory('');
    setIsAddingNewCategory(false);
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    if (!editAmount || !editCategory) return;

    // Find original transaction to compare
    const original = transactions.find(t => t._id === id);
    if (original && Number(editAmount) === original.amount && editCategory === original.category) {
      setEditingId(null);
      return;
    }

    await updateTransaction(id, {
      amount: Number(editAmount),
      category: editCategory
    });
    setEditingId(null);
  };

  const startEdit = (transaction) => {
    setEditingId(transaction._id);
    setEditAmount(transaction.amount.toString());
    setEditCategory(transaction.category);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteTransaction(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] lg:w-[600px] bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-transform transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
             FinDash Tracking
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Month Selector */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-3 px-6 flex items-center justify-between shrink-0">
          <button onClick={handlePrevMonth} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
            {MONTHS[selectedMonth]} {selectedYear}
          </h3>
          <button onClick={handleNextMonth} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Summarizer */}
        <div className="bg-gray-50 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800 p-4 shrink-0 flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Income</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(currentMonthIncome)}</div>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
          <div className="text-center flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Expense</div>
            <div className="font-bold text-red-600 dark:text-red-400">{formatINR(currentMonthExpense)}</div>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
          <div className="text-center flex-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Balance</div>
            <div className={`font-bold ${totalBalance >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatINR(totalBalance)}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading tracking...</div>
          ) : currentMonthTransactions.length === 0 && !isAdding ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
                <Receipt className="w-8 h-8" />
              </div>
              <h4 className="text-gray-900 dark:text-white font-medium mb-1">No transactions yet</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[250px]">
                You haven't recorded any income or expenses for this month.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-5">
              {groupedTransactions.map(({ dateKey, label, transactions: dateTxns }) => (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className="flex items-center gap-2 mb-1.5 px-0.5">
                    <CalendarDays className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {label}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                  </div>

                  {/* Transactions for this date — indented */}
                  <div className="space-y-1.5 pl-5">
                    {dateTxns.map((transaction) => {
                      const isIncome = transaction.type === 'income';
                      
                      return (
                        <div key={transaction._id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-2 shadow-sm hover:border-gray-300 dark:hover:border-slate-600 transition-all flex items-center gap-2.5">
                          
                          {/* Type Icon */}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          </div>

                          {editingId === transaction._id ? (
                            <form onSubmit={(e) => handleEditSubmit(e, transaction._id)} className="flex items-center gap-2 flex-1">
                              <select 
                                value={editCategory} 
                                onChange={(e) => setEditCategory(e.target.value)} 
                                className="flex-1 px-2 py-1 text-sm border-b-2 border-teal-500 bg-transparent dark:text-white outline-none" 
                                required
                              >
                                {isIncome 
                                  ? userIncomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                                  : expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                                }
                              </select>
                              <div className="w-24">
                                <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full px-2 py-1 text-sm border-b-2 border-teal-500 bg-transparent dark:text-white outline-none" required placeholder="Amount" />
                              </div>
                              <div className="flex gap-1">
                                <button type="submit" className="p-1 bg-teal-600 text-white rounded hover:bg-teal-700"><Check className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setEditingId(null)} className="p-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300"><X className="w-4 h-4" /></button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {transaction.category}
                                </h4>
                              </div>

                              <div className={`font-medium text-sm ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                {isIncome ? '+' : '-'}{formatINR(transaction.amount)}
                              </div>

                              <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(transaction)} className="p-1 text-gray-400 hover:text-blue-500 rounded">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setItemToDelete(transaction._id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {metadata && metadata.page < metadata.totalPages && (
            <div className="flex justify-center mt-6 mb-4">
              <button
                onClick={loadMoreTransactions}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More Transactions'}
              </button>
            </div>
          )}
        </div>

        {/* Fixed Bottom Action Area */}
        <div className="shrink-0 p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {isAdding ? (
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex gap-2 mb-4 p-1 bg-gray-200 dark:bg-slate-800 rounded-lg">
                <button 
                  onClick={() => { setAddType('expense'); setNewCategory(''); setIsAddingNewCategory(false); }}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${addType === 'expense' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Expense
                </button>
                <button 
                  onClick={() => { setAddType('income'); setNewCategory(''); setIsAddingNewCategory(false); }}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${addType === 'income' ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'}`}
                >
                  Income
                </button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Amount</label>
                    <input
                      type="number"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Category</label>
                      {addType === 'income' && !isAddingNewCategory && (
                        <button type="button" onClick={() => setIsManageModalOpen(true)} className="text-xs text-teal-600 hover:underline">
                          Manage
                        </button>
                      )}
                    </div>
                    
                    {!isAddingNewCategory ? (
                      <select
                        value={newCategory}
                        onChange={(e) => {
                          if (e.target.value === 'ADD_NEW') {
                            setIsAddingNewCategory(true);
                            setNewCategory('');
                          } else {
                            setNewCategory(e.target.value);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                        required
                      >
                        <option value="">Select Category</option>
                        {addType === 'expense' 
                          ? expenseCategories.map(c => <option key={c} value={c}>{c}</option>)
                          : userIncomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                        }
                        {addType === 'income' && (
                          <option value="ADD_NEW" className="font-semibold text-teal-600">+ Add New Category</option>
                        )}
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCustomCategory}
                          onChange={(e) => setNewCustomCategory(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                          placeholder="New category name"
                          required
                        />
                        <button type="button" onClick={() => setIsAddingNewCategory(false)} className="px-2 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"><X className="w-4 h-4"/></button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">Save</button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-3 flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400 border-2 border-dashed border-teal-200 dark:border-teal-900/50 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" /> Add New Transaction
            </button>
          )}
        </div>
      </div>
      
      <ConfirmPopup 
        isOpen={!!itemToDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />

      <ManageCategoriesModal 
        isOpen={isManageModalOpen} 
        onClose={() => setIsManageModalOpen(false)} 
      />
    </>
  );
};

export default TrackingSidebar;
