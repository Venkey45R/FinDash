import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingDown,
  Pencil,
  Trash2,
  Check,
  Search,
} from 'lucide-react';
import { formatINR } from '../utils/format.js';

const LiabilitiesTableModal = ({
  isOpen,
  onClose,
  categoryName,
  categoryId,
  entries = [],
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEntries = entries.filter((entry) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return entry.name && entry.name.toLowerCase().includes(q);
  });

  const totalOutstanding = entries.reduce(
    (sum, e) => sum + (Number(e.outstandingAmount) || Number(e.originalAmount) || 0),
    0
  );
  const totalOriginal = entries.reduce((sum, e) => sum + (Number(e.originalAmount) || 0), 0);
  const totalEmi = entries.reduce((sum, e) => sum + (Number(e.emi) || 0), 0);

  const handleStartInlineEdit = (entry) => {
    setInlineEditingId(entry._id);
    setEditFormData({
      name: entry.name,
      originalAmount: entry.originalAmount || '',
      outstandingAmount: entry.outstandingAmount || '',
      emi: entry.emi || '',
      interestRate: entry.interestRate || '',
    });
  };

  const handleSaveInlineEdit = (entry) => {
    const original = parseFloat(editFormData.originalAmount) || 0;
    const outstanding = parseFloat(editFormData.outstandingAmount) || original;
    const emi = parseFloat(editFormData.emi) || 0;
    const rate = parseFloat(editFormData.interestRate) || 0;

    onEdit(categoryId, entry._id, {
      name: editFormData.name || entry.name,
      originalAmount: original,
      outstandingAmount: outstanding,
      emi: emi,
      interestRate: rate,
    });

    setInlineEditingId(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col transition-all duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {categoryName}
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  {entries.length} {entries.length === 1 ? 'account' : 'accounts'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Detailed loan & debt breakdown
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

        {/* Metrics Banner & Search */}
        <div className="px-6 py-3 bg-slate-50/40 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                Total Outstanding
              </span>
              <span className="font-extrabold text-sm text-rose-600 dark:text-rose-400">
                {formatINR(totalOutstanding)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                Sanctioned Limit
              </span>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                {formatINR(totalOriginal)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold">
                Monthly EMI
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {formatINR(totalEmi)}/mo
              </span>
            </div>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter loans..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 dark:bg-slate-800/90 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Loan / Account</th>
                <th className="py-3 px-3 text-right">Limit / Original</th>
                <th className="py-3 px-3 text-right">Outstanding</th>
                <th className="py-3 px-3 text-right">Monthly EMI</th>
                <th className="py-3 px-3 text-right">Rate (% p.a.)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEntries.map((entry) => {
                const isEditing = inlineEditingId === entry._id;

                if (isEditing) {
                  return (
                    <tr key={entry._id} className="bg-rose-50/40 dark:bg-rose-950/30">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-white font-medium"
                          autoFocus
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          value={editFormData.originalAmount}
                          onChange={(e) => setEditFormData({ ...editFormData, originalAmount: e.target.value })}
                          placeholder="Limit"
                          className="w-24 px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded text-xs text-right text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          value={editFormData.outstandingAmount}
                          onChange={(e) => setEditFormData({ ...editFormData, outstandingAmount: e.target.value })}
                          placeholder="Outstanding"
                          className="w-24 px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded text-xs text-right text-gray-900 dark:text-white font-bold"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          value={editFormData.emi}
                          onChange={(e) => setEditFormData({ ...editFormData, emi: e.target.value })}
                          placeholder="EMI"
                          className="w-20 px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded text-xs text-right text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="0.05"
                          value={editFormData.interestRate}
                          onChange={(e) => setEditFormData({ ...editFormData, interestRate: e.target.value })}
                          placeholder="Rate"
                          className="w-16 px-2 py-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded text-xs text-right text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleSaveInlineEdit(entry)}
                            className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setInlineEditingId(null)}
                            className="p-1 rounded bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-200 hover:bg-gray-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={entry._id}
                    className="hover:bg-gray-50/70 dark:hover:bg-slate-700/30 transition-colors group"
                  >
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {entry.name}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-600 dark:text-gray-400">
                      {formatINR(entry.originalAmount || 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      {formatINR(entry.outstandingAmount || entry.originalAmount || 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-800 dark:text-gray-200">
                      {entry.emi > 0 ? formatINR(entry.emi) + '/mo' : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-800 dark:text-gray-200">
                      {entry.interestRate > 0 ? `${entry.interestRate}%` : '0%'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartInlineEdit(entry)}
                          className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(categoryId, entry._id, entry.name)}
                          className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-gray-400">
                    No liabilities found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/70 dark:bg-slate-800/90 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            Showing {filteredEntries.length} of {entries.length} accounts
          </span>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            Press ESC or click outside to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiabilitiesTableModal;
