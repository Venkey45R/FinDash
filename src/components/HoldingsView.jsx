import React, { useState } from 'react';
import {
  Plus,
  TrendingUp,
  Layers,
  Activity,
  Briefcase,
  ChevronRight,
  RefreshCw,
  Clock,
  Loader2,
  Globe,
  Shield,
  Gem,
  Banknote,
  Home,
  Landmark,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { calculateCategoryTotal, groupCategoryEntries } from '../utils/calculations.js';
import { formatINR } from '../utils/format.js';
import AddInvestmentModal from './AddInvestmentModal.jsx';
import HoldingsTableModal from './HoldingsTableModal.jsx';

const dotColors = ['bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-amber-500', 'bg-emerald-500'];

const subCategoryIcons = {
  STOCKS: TrendingUp,
  MUTUAL_FUNDS: Layers,
  ETFS: Activity,
  FOREIGN: Globe,
  DEBT: Shield,
  GOLD: Gem,
  CASH: Banknote,
  REAL_ESTATE: Home,
  OTHER: Briefcase,
};

const HoldingsView = () => {
  const { assetCategories, updateEntry, deleteEntry, syncPrices, syncingPrices, showToast } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tableModalState, setTableModalState] = useState({
    isOpen: false,
    categoryName: '',
    categoryId: null,
    groupTitle: '',
    entries: [],
  });

  const handleOpenTable = (category, groupTitle = '', entries = []) => {
    setTableModalState({
      isOpen: true,
      categoryName: category.name,
      categoryId: category._id,
      groupTitle: groupTitle || '',
      entries: entries.length > 0 ? entries : category.entries || [],
    });
  };

  const handleCloseTable = () => {
    setTableModalState({
      isOpen: false,
      categoryName: '',
      categoryId: null,
      groupTitle: '',
      entries: [],
    });
  };

  const handleSaveEntryEdit = async (categoryId, entryId, updates) => {
    try {
      await updateEntry(categoryId, entryId, updates);
      // Update local modal entries as well
      setTableModalState((prev) => ({
        ...prev,
        entries: prev.entries.map((e) => (e._id === entryId ? { ...e, ...updates } : e)),
      }));
      showToast('Holding updated successfully');
    } catch (e) {
      console.error(e);
      showToast('Failed to update holding', 'error');
    }
  };

  const handleDeleteEntry = async (categoryId, entryId) => {
    // Rely on context soft-delete / undo functionality
    await deleteEntry(categoryId, entryId);
    // Remove from table modal state if open
    setTableModalState((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e._id !== entryId),
    }));
  };

  // Active Asset Categories with entries (ignore empty categories to prevent clutter)
  const activeAssetCategories = (assetCategories || []).filter(
    (cat) => cat.entries && cat.entries.length > 0
  );

  return (
    <section>
      {/* Header with + Add Investment Action & Daily 4 PM Auto-Sync */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Holdings & Investments
            </h3>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Last on: Today
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Summarized portfolio with live market-linked valuations and full table views.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => syncPrices()}
            disabled={syncingPrices}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-teal-500 text-gray-700 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400 text-sm font-semibold rounded-xl shadow-2xs hover:shadow-xs transition-all duration-200 disabled:opacity-60"
            title="Sync live prices for all stocks and mutual funds"
          >
            {syncingPrices ? (
              <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
            ) : (
              <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-teal-600" />
            )}
            <span>{syncingPrices ? 'Syncing...' : 'Sync Prices'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Investment</span>
          </button>
        </div>
      </div>

      {/* Categories Grid or Clean Empty Banner */}
      {activeAssetCategories.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 text-center shadow-sm mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Active Holdings</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
            You don't have any stocks, mutual funds, or assets recorded yet.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Investment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {activeAssetCategories.map((cat, ci) => {
            const catTotal = calculateCategoryTotal(cat);
            const subGroups = groupCategoryEntries(cat.entries || [], cat.name);

            return (
              <div
                key={cat._id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden transition-colors duration-300"
              >
                {/* Category Card Header */}
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/60 dark:bg-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">{cat.name}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {cat.entries?.length || 0} {cat.entries?.length === 1 ? 'total item' : 'total items'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">
                      {formatINR(catTotal)}
                    </span>
                  </div>
                </div>

                {/* Summarized Sub-groups List (No Accordion) */}
                <div className="flex-1 p-0 divide-y divide-gray-100 dark:divide-gray-700/60">
                  {subGroups.map((group) => {
                    const SubIcon = subCategoryIcons[group.icon] || subCategoryIcons[group.key] || Briefcase;

                    return (
                      <div
                        key={group.key}
                        onClick={() => handleOpenTable(cat, group.label, group.entries)}
                        className="px-5 py-4 hover:bg-gray-50/80 dark:hover:bg-slate-700/40 transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        {/* Left: Sub-group info */}
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                            <SubIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                                {group.label}
                              </h5>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              Invested: {formatINR(group.invested)}
                            </span>
                          </div>
                        </div>

                        {/* Right: Amount & More Button */}
                        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatINR(group.total)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenTable(cat, group.label, group.entries)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 px-2.5 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-all group-hover:translate-x-0.5"
                          >
                            <span>More</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Holdings Table Modal */}
      {tableModalState.isOpen && (
        <HoldingsTableModal
          isOpen={tableModalState.isOpen}
          onClose={handleCloseTable}
          categoryName={tableModalState.categoryName}
          categoryId={tableModalState.categoryId}
          groupTitle={tableModalState.groupTitle}
          entries={tableModalState.entries}
          onEdit={handleSaveEntryEdit}
          onDelete={handleDeleteEntry}
        />
      )}

      {/* Add Investment Modal */}
      <AddInvestmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </section>
  );
};

export default HoldingsView;
