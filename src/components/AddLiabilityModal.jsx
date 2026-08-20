import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Loader2,
  TrendingDown,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { formatINR } from '../utils/format.js';

const AddLiabilityModal = ({ isOpen, onClose, defaultCategoryId = null }) => {
  const { liabilityCategories = [], addLiabilityEntry, showToast } = useFinance();

  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    originalAmount: '',
    outstandingAmount: '',
    emi: '',
    interestRate: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && liabilityCategories.length > 0) {
      let initialCat = null;
      if (defaultCategoryId) {
        initialCat = liabilityCategories.find((c) => c._id === defaultCategoryId);
      }
      if (!initialCat) {
        initialCat = liabilityCategories[0];
      }

      const initialId = initialCat?._id || liabilityCategories[0]?._id;
      setSelectedCategoryId(initialId);

      setFormData({
        name: '',
        originalAmount: '',
        outstandingAmount: '',
        emi: '',
        interestRate: '',
      });

      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, defaultCategoryId, liabilityCategories, onClose]);

  const handleSelectCategory = (catId) => {
    setSelectedCategoryId(catId);
  };

  const selectedCategory = useMemo(() => {
    return liabilityCategories.find((c) => c._id === selectedCategoryId) || liabilityCategories[0];
  }, [liabilityCategories, selectedCategoryId]);

  const liveOutstanding = parseFloat(formData.outstandingAmount) || 0;
  const liveEmi = parseFloat(formData.emi) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      showToast('Please enter a liability or loan name', 'error');
      return;
    }

    if (!selectedCategoryId) {
      showToast('Please select a category', 'error');
      return;
    }

    const outstanding = parseFloat(formData.outstandingAmount) || 0;
    const original = parseFloat(formData.originalAmount) || outstanding;

    setSubmitting(true);
    try {
      await addLiabilityEntry(selectedCategoryId, {
        name: trimmedName,
        originalAmount: original,
        outstandingAmount: outstanding,
        emi: parseFloat(formData.emi) || 0,
        interestRate: parseFloat(formData.interestRate) || 0,
      });

      onClose();
    } catch (err) {
      console.error('Failed to add liability:', err);
      showToast(err.message || 'Failed to add liability', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Liability / Loan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Record home loans, vehicle loans, personal debt, or credit cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Horizontal Segmented Navigation */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {liabilityCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat._id;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => handleSelectCategory(cat._id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Loan / Account Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account / Loan Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. HDFC Home Loan, ICICI Car Loan, SBI Credit Card..."
              className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              autoFocus
            />
          </div>

          {/* Sanctioned and Outstanding Amounts */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Outstanding Balance (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={formData.outstandingAmount}
                onChange={(e) => setFormData({ ...formData, outstandingAmount: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Original Sanction / Limit (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.originalAmount}
                onChange={(e) => setFormData({ ...formData, originalAmount: e.target.value })}
                placeholder="Defaults to balance"
                className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          {/* EMI and Interest Rate */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly EMI (₹)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.emi}
                onChange={(e) => setFormData({ ...formData, emi: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                min="0"
                step="0.05"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="e.g. 8.5"
                className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>
          </div>

          {/* Live Summary Pill */}
          {(liveOutstanding > 0 || liveEmi > 0) && (
            <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Total Liability: </span>
                <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">{formatINR(liveOutstanding)}</span>
              </div>
              {liveEmi > 0 && (
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  EMI: {formatINR(liveEmi)}/mo
                </span>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Add Liability</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLiabilityModal;

