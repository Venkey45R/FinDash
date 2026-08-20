import React, { useState } from 'react';
import {
  Plus,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import {
  calculateCategoryLiabilityTotal,
  calculateCategoryLiabilityOriginalTotal,
  calculateCategoryLiabilityEmiTotal,
} from '../utils/calculations.js';
import AddLiabilityModal from './AddLiabilityModal.jsx';
import LiabilitiesTableModal from './LiabilitiesTableModal.jsx';
import { formatINR, getCategoryIcon } from '../utils/format.js';

const categoryColors = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-amber-600',
];

const LiabilitiesView = () => {
  const {
    liabilityCategories = [],
    updateLiabilityEntry,
    deleteLiabilityEntry,
    showToast,
  } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null);
  const [tableModalState, setTableModalState] = useState({
    isOpen: false,
    categoryName: '',
    categoryId: null,
    entries: [],
  });

  const handleOpenTable = (category) => {
    setTableModalState({
      isOpen: true,
      categoryName: category.name,
      categoryId: category._id,
      entries: category.entries || [],
    });
  };

  const handleCloseTable = () => {
    setTableModalState({
      isOpen: false,
      categoryName: '',
      categoryId: null,
      entries: [],
    });
  };

  const handleSaveEntryEdit = async (categoryId, entryId, updates) => {
    try {
      await updateLiabilityEntry(categoryId, entryId, updates);
      setTableModalState((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e._id === entryId ? { ...e, ...updates } : e)),
      }));
      showToast('Liability updated successfully');
    } catch (e) {
      console.error(e);
      showToast('Failed to update liability', 'error');
    }
  };

  const handleDeleteEntry = async (categoryId, entryId) => {
    await deleteLiabilityEntry(categoryId, entryId);
    setTableModalState((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e._id !== entryId),
    }));
  };

  // Only render categories with entries
  const activeCategories = liabilityCategories.filter(
    (cat) => cat.entries && cat.entries.length > 0
  );

  return (
    <section>
      {/* Header with + Add Liability Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Liabilities & Debt
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Summarized breakdown of your debts with detailed table views.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCategoryForModal(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-200 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Liability</span>
        </button>
      </div>

      {/* Categories Grid or Clean Empty Banner */}
      {activeCategories.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 text-center shadow-sm mb-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
            <TrendingDown className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Active Liabilities</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
            You don't have any outstanding loans or credit card balances recorded.
          </p>
          <button
            onClick={() => {
              setSelectedCategoryForModal(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Liability</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {activeCategories.map((cat, ci) => {
            const catOutstanding = calculateCategoryLiabilityTotal(cat);
            const catEmi = calculateCategoryLiabilityEmiTotal(cat);
            const IconComponent = getCategoryIcon(cat.name);
            const colorDot = categoryColors[ci % categoryColors.length] || categoryColors[0];
            const entries = cat.entries || [];

            return (
              <div
                key={cat._id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden transition-colors duration-300"
              >
                {/* Category Card Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">{cat.name}</h4>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {entries.length} {entries.length === 1 ? 'account' : 'accounts'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                      {formatINR(catOutstanding)}
                    </span>
                    {catEmi > 0 && (
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        EMI: {formatINR(catEmi)}/mo
                      </span>
                    )}
                  </div>
                </div>

                {/* Summarized Category Body (No Accordion) */}
                <div className="flex-1 p-0 divide-y divide-gray-100 dark:divide-gray-700/60">
                  {entries.map((entry) => (
                    <div
                      key={entry._id}
                      onClick={() => handleOpenTable(cat)}
                      className="px-5 py-4 hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition-colors flex items-center justify-between cursor-pointer group"
                    >
                      {/* Left: Account Name & specs */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                              {entry.name}
                            </h5>
                            {entry.interestRate > 0 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/40 shrink-0">
                                {entry.interestRate}% p.a.
                              </span>
                            )}
                          </div>
                          {entry.emi > 0 && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              EMI: {formatINR(entry.emi)}/mo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Outstanding & More Button */}
                      <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {formatINR(entry.outstandingAmount || entry.originalAmount)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenTable(cat)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all group-hover:translate-x-0.5"
                        >
                          <span>More</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Liabilities Table Modal */}
      {tableModalState.isOpen && (
        <LiabilitiesTableModal
          isOpen={tableModalState.isOpen}
          onClose={handleCloseTable}
          categoryName={tableModalState.categoryName}
          categoryId={tableModalState.categoryId}
          entries={tableModalState.entries}
          onEdit={handleSaveEntryEdit}
          onDelete={handleDeleteEntry}
        />
      )}

      {/* Add Liability Modal */}
      <AddLiabilityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultCategoryId={selectedCategoryForModal}
      />
    </section>
  );
};

export default LiabilitiesView;
