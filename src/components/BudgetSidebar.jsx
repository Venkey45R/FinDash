import React, { useState } from 'react';
import { X, Plus, Save, Trash2, Check, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';
import { useTransaction } from '../context/TransactionContext';
import { formatINR } from '../utils/format';
import ConfirmPopup from './ConfirmPopup';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const BudgetSidebar = ({ isOpen, onClose }) => {
  const { budgets = [], addBudget, updateBudget, deleteBudget, loading } = useBudget();
  const { transactions = [] } = useTransaction();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // Delete confirmation state
  const [itemToDelete, setItemToDelete] = useState(null);

  // Current month state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const isCurrentCalendarMonth = selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();

  const currentMonthStr = `${MONTHS[selectedMonth].substring(0,3)} ${selectedYear}`;

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

  const currentMonthTransactions = React.useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newAmount) return;
    
    await addBudget({
      name: newName,
      amount: Number(newAmount)
    });
    
    setIsAdding(false);
    setNewName('');
    setNewAmount('');
  };

  const handleEditSubmit = async (e, id) => {
    e.preventDefault();
    if (!editName.trim() || !editAmount) return;

    // Find original budget to compare
    const original = budgets.find(b => b._id === id);
    if (original && editName.trim() === original.name && Number(editAmount) === original.amount) {
      setEditingId(null);
      return;
    }

    await updateBudget(id, {
      name: editName,
      amount: Number(editAmount)
    });
    setEditingId(null);
  };

  const startEdit = (budget) => {
    setEditingId(budget._id);
    setEditName(budget.name);
    setEditAmount(budget.amount.toString());
  };

  const toggleMonth = async (budget) => {
    const currentTracking = budget.monthlyTracking || [];
    const monthIndex = currentTracking.findIndex(t => t.month === currentMonthStr);
    let newTracking = [...currentTracking];
    
    if (monthIndex >= 0) {
      newTracking[monthIndex].isMet = !newTracking[monthIndex].isMet;
    } else {
      newTracking.push({ month: currentMonthStr, isMet: true });
    }

    await updateBudget(budget._id, { monthlyTracking: newTracking });
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteBudget(itemToDelete);
      setItemToDelete(null);
    }
  };

  const handleDelete = (id) => {
    setItemToDelete(id);
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
             FinDash Budgeting
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Month Selector */}
        <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-3 px-6 flex items-center justify-between sticky top-[61px] z-10">
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

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading budgets...</div>
          ) : budgets.length === 0 && !isAdding ? (
            <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No budget categories found.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-5">
              {budgets.map((budget) => {
                const isMet = (budget.monthlyTracking || []).find(t => t.month === currentMonthStr)?.isMet || false;
                
                const categoryExpenses = currentMonthTransactions
                  .filter(t => t.type === 'expense' && t.category === budget.name)
                  .reduce((sum, t) => sum + t.amount, 0);

                const remaining = budget.amount - categoryExpenses;
                const isOverdue = remaining < 0;
                
                return (
                  <div key={budget._id} className={`bg-white dark:bg-slate-800 rounded-lg border px-3 py-2.5 shadow-sm transition-all ${isMet ? 'border-teal-200 dark:border-teal-900/50' : 'border-gray-200 dark:border-slate-700'}`}>
                    {editingId === budget._id ? (
                      <form onSubmit={(e) => handleEditSubmit(e, budget._id)} className="flex items-center gap-3">
                        <div className="flex-1">
                          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-2 py-1 text-sm border-b-2 border-teal-500 dark:bg-slate-900 dark:text-white outline-none" required placeholder="Name" />
                        </div>
                        <div className="w-24">
                          <input type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="w-full px-2 py-1 text-sm border-b-2 border-teal-500 dark:bg-slate-900 dark:text-white outline-none" required placeholder="Amount" />
                        </div>
                        <div className="flex gap-1">
                          <button type="submit" className="p-1.5 bg-teal-600 text-white rounded hover:bg-teal-700"><Check className="w-4 h-4" /></button>
                          <button type="button" onClick={() => setEditingId(null)} className="p-1.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300"><X className="w-4 h-4" /></button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <button 
                          onClick={() => isCurrentCalendarMonth && toggleMonth(budget)}
                          disabled={!isCurrentCalendarMonth}
                          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isMet ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-teal-400'
                          } ${!isCurrentCalendarMonth ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isMet && <Check className="w-3.5 h-3.5" />}
                        </button>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-semibold truncate ${isMet ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                            {budget.name}
                          </h4>
                          <div className={`text-xs mt-0.5 font-medium ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isOverdue ? `Over budget: ${formatINR(Math.abs(remaining))}` : `Remaining: ${formatINR(remaining)}`}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className={`font-medium text-sm ${isMet ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                          {formatINR(budget.amount)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(budget)} className="p-1 text-gray-400 hover:text-blue-500 rounded">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(budget._id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Form */}
          {isAdding ? (
            <form onSubmit={handleAddSubmit} className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="flex gap-3 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="New category..."
                    required
                  />
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Amount"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg">Add</button>
              </div>
            </form>
          ) : (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full py-3 flex items-center justify-center gap-2 text-teal-600 dark:text-teal-400 border-2 border-dashed border-teal-200 dark:border-teal-900/50 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" /> Add New Budget Item
            </button>
          )}
        </div>
      </div>
      
      <ConfirmPopup 
        isOpen={!!itemToDelete}
        title="Delete Budget"
        message="Are you sure you want to delete this budget category? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </>
  );
};

export default BudgetSidebar;

