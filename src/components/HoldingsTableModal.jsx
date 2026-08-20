import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Pencil,
  Trash2,
  Check,
  Search,
  Gem,
  Shield,
  Banknote,
  Layers,
  Activity,
  Globe,
  Briefcase,
} from 'lucide-react';
import { formatINR } from '../utils/format.js';

/**
 * Determines column layout based on categoryName + groupTitle.
 * Returns { mode, icon, columns, colSpan }
 *
 * Modes:
 *   'stocks'       — Qty, Avg & Live Price, 1D Change
 *   'mutual_funds' — Units, Avg & Live NAV, 1D Change
 *   'etfs'         — Qty, Avg & Live Price, 1D Change
 *   'manual'       — Simple: just name, invested, current value
 */
function getTableLayout(categoryName = '', groupTitle = '') {
  const cat = categoryName.toLowerCase();
  const group = groupTitle.toLowerCase();

  if (group.includes('mutual') || group.includes('fund')) {
    return {
      mode: 'mutual_funds',
      icon: Layers,
      columns: [
        { key: 'name', label: 'Fund Name', align: 'left' },
        { key: 'units', label: 'Units', align: 'center' },
        { key: 'nav', label: 'Avg & Live NAV', align: 'right' },
        { key: '1d', label: '1D Change', align: 'center' },
        { key: 'invested', label: 'Invested', align: 'right' },
        { key: 'current', label: 'Current Value', align: 'right' },
      ],
    };
  }

  if (group.includes('etf')) {
    return {
      mode: 'etfs',
      icon: Activity,
      columns: [
        { key: 'name', label: 'ETF Name', align: 'left' },
        { key: 'qty', label: 'Qty', align: 'center' },
        { key: 'price', label: 'Avg & Live Price', align: 'right' },
        { key: '1d', label: '1D Change', align: 'center' },
        { key: 'invested', label: 'Invested', align: 'right' },
        { key: 'current', label: 'Current Value', align: 'right' },
      ],
    };
  }

  if (group.includes('stock') || (cat.includes('dom') && !group)) {
    return {
      mode: 'stocks',
      icon: TrendingUp,
      columns: [
        { key: 'name', label: 'Asset / Holding', align: 'left' },
        { key: 'qty', label: 'Qty / Units', align: 'center' },
        { key: 'price', label: 'Avg & Live Price/NAV', align: 'right' },
        { key: '1d', label: '1D Change', align: 'center' },
        { key: 'invested', label: 'Invested', align: 'right' },
        { key: 'current', label: 'Current Value', align: 'right' },
      ],
    };
  }

  // Foreign equity with holdings
  if (cat.includes('foreign')) {
    return {
      mode: 'stocks',
      icon: Globe,
      columns: [
        { key: 'name', label: 'Holding', align: 'left' },
        { key: 'qty', label: 'Qty / Units', align: 'center' },
        { key: 'price', label: 'Avg & Live Price', align: 'right' },
        { key: '1d', label: '1D Change', align: 'center' },
        { key: 'invested', label: 'Invested', align: 'right' },
        { key: 'current', label: 'Current Value', align: 'right' },
      ],
    };
  }

  // Manual categories: Gold, Debt, Cash, Real Estate, etc.
  let icon = Briefcase;
  let nameLabel = 'Asset';
  if (cat.includes('gold') || cat.includes('silver')) {
    icon = Gem;
    nameLabel = 'Gold Asset';
  } else if (cat.includes('debt') || cat.includes('bond') || cat.includes('ppf') || cat.includes('epf')) {
    icon = Shield;
    nameLabel = 'Instrument';
  } else if (cat.includes('cash') || cat.includes('saving') || cat.includes('bank')) {
    icon = Banknote;
    nameLabel = 'Account';
  }

  return {
    mode: 'manual',
    icon,
    columns: [
      { key: 'name', label: nameLabel, align: 'left' },
      { key: 'invested', label: 'Invested Amount', align: 'right' },
      { key: 'current', label: 'Current Value', align: 'right' },
    ],
  };
}

const HoldingsTableModal = ({
  isOpen,
  onClose,
  categoryName,
  categoryId,
  groupTitle,
  entries = [],
  onEdit,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const layout = useMemo(
    () => getTableLayout(categoryName, groupTitle),
    [categoryName, groupTitle]
  );

  const isMarketMode = layout.mode !== 'manual';
  const IconComponent = layout.icon;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        // Only restore scroll if no sidebar is open
        if (!document.body.classList.contains('sidebar-open')) {
          document.body.style.overflow = '';
        }
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEntries = entries.filter((entry) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (entry.name && entry.name.toLowerCase().includes(q)) ||
      (entry.symbol && entry.symbol.toLowerCase().includes(q))
    );
  });

  // Calculate Group Totals
  const totalInvested = entries.reduce((sum, e) => sum + (Number(e.investedAmount) || 0), 0);
  const totalCurrent = entries.reduce((sum, e) => sum + (Number(e.currentValue) || Number(e.investedAmount) || 0), 0);
  const totalGainLoss = totalCurrent - totalInvested;
  const totalGainLossPct = totalInvested > 0 ? parseFloat(((totalGainLoss / totalInvested) * 100).toFixed(2)) : 0;
  const isPositive = totalGainLoss >= 0;

  const isDomesticCategory = (categoryName || '').toLowerCase().includes('dom');

  const handleStartInlineEdit = (entry) => {
    setInlineEditingId(entry._id);
    setEditFormData({
      name: entry.name,
      investedAmount: entry.investedAmount || '',
      currentValue: entry.currentValue || entry.investedAmount || '',
      quantity: entry.quantity || '',
      averageBuyPrice: entry.averageBuyPrice || '',
      units: entry.units || '',
      averageNAV: entry.averageNAV || '',
    });
  };

  const handleSaveInlineEdit = (entry) => {
    const qty = parseFloat(editFormData.quantity) || 0;
    const price = parseFloat(editFormData.averageBuyPrice) || 0;
    const units = parseFloat(editFormData.units) || 0;
    const nav = parseFloat(editFormData.averageNAV) || 0;

    let invested = parseFloat(editFormData.investedAmount);
    if (isNaN(invested)) {
      if (qty > 0 && price > 0) invested = qty * price;
      else if (units > 0 && nav > 0) invested = units * nav;
      else invested = entry.investedAmount || 0;
    }

    let current = invested;
    if (isDomesticCategory && qty > 0) {
      const marketPrice = entry.latestPrice || price;
      current = parseFloat((qty * marketPrice).toFixed(2));
    } else if (isDomesticCategory && units > 0) {
      const marketNAV = entry.latestNAV || nav;
      current = parseFloat((units * marketNAV).toFixed(2));
    } else {
      current = parseFloat(editFormData.currentValue) || invested;
    }

    onEdit(categoryId, entry._id, {
      name: editFormData.name || entry.name,
      investedAmount: invested,
      currentValue: current,
      quantity: qty,
      averageBuyPrice: price,
      units: units,
      averageNAV: nav,
    });

    setInlineEditingId(null);
  };

  // --- Render Helpers ---

  const renderMarketRow = (entry) => {
    const inv = Number(entry.investedAmount) || 0;
    const cur = Number(entry.currentValue) || inv;
    const liveVal = entry.latestNAV || entry.latestPrice;
    const avgVal = entry.averageNAV || entry.averageBuyPrice;
    const dayChg = entry.dailyChange;
    const dayChgPct = entry.dailyChangePercent;
    const has1D = dayChgPct !== undefined && dayChgPct !== null;
    const is1DPos = has1D && dayChgPct >= 0;
    const isMF = layout.mode === 'mutual_funds';

    return (
      <tr
        key={entry._id}
        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
      >
        {/* Name & Symbol */}
        <td className="py-3.5 px-5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white text-[13px]">
              {entry.name}
            </span>
            {entry.symbol && (
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-teal-700 dark:text-teal-300 shrink-0">
                {entry.symbol}
              </span>
            )}
          </div>
          {entry.plan && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{entry.plan}</span>
          )}
        </td>

        {/* Qty / Units */}
        <td className="py-3.5 px-4 text-center font-semibold text-slate-800 dark:text-slate-200">
          {isMF
            ? (entry.units > 0 ? entry.units : '—')
            : (entry.quantity > 0 ? entry.quantity : entry.units > 0 ? entry.units : '—')
          }
        </td>

        {/* Avg & Live Price / NAV */}
        <td className="py-3.5 px-4 text-right text-slate-700 dark:text-slate-300">
          {avgVal > 0 && (
            <span className="block text-slate-500 dark:text-slate-400 text-[11px]">
              Avg: {formatINR(avgVal)}
            </span>
          )}
          {liveVal > 0 ? (
            <span className="font-bold text-slate-900 dark:text-white text-xs block">
              Live: {formatINR(liveVal)}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>

        {/* 1D Change */}
        <td className="py-3.5 px-4 text-center">
          {has1D ? (
            <span className={`text-xs font-semibold ${
              is1DPos ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {is1DPos ? '+' : ''}{dayChgPct}%
              {dayChg !== null && dayChg !== undefined && (
                <span className="text-[10px] opacity-75 font-normal ml-1">
                  ({is1DPos ? '+' : ''}₹{Math.abs(dayChg).toFixed(1)})
                </span>
              )}
            </span>
          ) : (
            <span className="text-slate-400 text-xs">—</span>
          )}
        </td>

        {/* Invested */}
        <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
          {formatINR(inv)}
        </td>

        {/* Current Value + Actions */}
        <td className="py-3.5 px-5 text-right font-bold text-slate-900 dark:text-white">
          <div className="flex items-center justify-end gap-2">
            <span>{formatINR(cur)}</span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleStartInlineEdit(entry)}
                className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Edit"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDelete(categoryId, entry._id, entry.name)}
                className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderManualRow = (entry) => {
    const inv = Number(entry.investedAmount) || 0;
    const cur = Number(entry.currentValue) || inv;
    const gl = cur - inv;
    const isGain = gl >= 0;

    return (
      <tr
        key={entry._id}
        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors group"
      >
        {/* Name */}
        <td className="py-3.5 px-5">
          <span className="font-semibold text-slate-900 dark:text-white text-[13px]">
            {entry.name}
          </span>
        </td>

        {/* Invested */}
        <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400 font-medium">
          {formatINR(inv)}
        </td>

        {/* Current Value + Gain/Loss + Actions */}
        <td className="py-3.5 px-5 text-right">
          <div className="flex items-center justify-end gap-2">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">{formatINR(cur)}</span>
              {inv > 0 && gl !== 0 && (
                <span className={`text-[10px] font-medium ${isGain ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
                  {isGain ? '+' : ''}{formatINR(gl)} ({isGain ? '+' : ''}{inv > 0 ? ((gl / inv) * 100).toFixed(1) : 0}%)
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleStartInlineEdit(entry)}
                className="p-1 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Edit"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDelete(categoryId, entry._id, entry.name)}
                className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  const renderMarketEditRow = (entry) => {
    const isMF = layout.mode === 'mutual_funds';
    return (
      <tr key={entry._id} className="bg-teal-50/30 dark:bg-teal-950/20">
        <td className="py-2.5 px-5">
          <input
            type="text"
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white font-medium"
            autoFocus
          />
        </td>
        <td className="py-2.5 px-4 text-center">
          <input
            type="number"
            step="any"
            value={isMF ? (editFormData.units || '') : (editFormData.quantity || editFormData.units || '')}
            onChange={(e) =>
              setEditFormData({
                ...editFormData,
                quantity: isMF ? '' : e.target.value,
                units: isMF ? e.target.value : e.target.value,
              })
            }
            placeholder={isMF ? 'Units' : 'Qty'}
            className="w-16 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-center text-slate-900 dark:text-white"
          />
        </td>
        <td className="py-2.5 px-4 text-right">
          <input
            type="number"
            step="any"
            value={isMF ? (editFormData.averageNAV || '') : (editFormData.averageBuyPrice || editFormData.averageNAV || '')}
            onChange={(e) =>
              setEditFormData({
                ...editFormData,
                averageBuyPrice: isMF ? '' : e.target.value,
                averageNAV: isMF ? e.target.value : e.target.value,
              })
            }
            placeholder={isMF ? 'NAV' : 'Price'}
            className="w-20 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-right text-slate-900 dark:text-white"
          />
        </td>
        <td className="py-2.5 px-4 text-center text-slate-400">—</td>
        <td className="py-2.5 px-4 text-right">
          <input
            type="number"
            step="any"
            value={editFormData.investedAmount}
            onChange={(e) => setEditFormData({ ...editFormData, investedAmount: e.target.value })}
            placeholder="Invested"
            className="w-20 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-right text-slate-900 dark:text-white"
          />
        </td>
        <td className="py-2.5 px-5 text-right">
          <div className="flex items-center justify-end gap-1.5">
            {isDomesticCategory && (entry.quantity > 0 || entry.units > 0) ? (
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                {formatINR(
                  (parseFloat(editFormData.quantity) || entry.quantity || 0) * (entry.latestPrice || parseFloat(editFormData.averageBuyPrice) || 0) ||
                  (parseFloat(editFormData.units) || entry.units || 0) * (entry.latestNAV || parseFloat(editFormData.averageNAV) || 0) ||
                  parseFloat(editFormData.investedAmount) || entry.investedAmount || 0
                )}
              </span>
            ) : (
              <input
                type="number"
                step="any"
                value={editFormData.currentValue}
                onChange={(e) => setEditFormData({ ...editFormData, currentValue: e.target.value })}
                placeholder="Current"
                className="w-20 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-right text-slate-900 dark:text-white font-bold"
              />
            )}
            <button onClick={() => handleSaveInlineEdit(entry)} className="p-1 rounded bg-teal-600 hover:bg-teal-700 text-white" title="Save">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setInlineEditingId(null)} className="p-1 rounded bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-300" title="Cancel">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderManualEditRow = (entry) => {
    return (
      <tr key={entry._id} className="bg-teal-50/30 dark:bg-teal-950/20">
        <td className="py-2.5 px-5">
          <input
            type="text"
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            className="w-full px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-slate-900 dark:text-white font-medium"
            autoFocus
          />
        </td>
        <td className="py-2.5 px-4 text-right">
          <input
            type="number"
            step="any"
            value={editFormData.investedAmount}
            onChange={(e) => setEditFormData({ ...editFormData, investedAmount: e.target.value })}
            placeholder="Invested"
            className="w-24 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-right text-slate-900 dark:text-white"
          />
        </td>
        <td className="py-2.5 px-5 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <input
              type="number"
              step="any"
              value={editFormData.currentValue}
              onChange={(e) => setEditFormData({ ...editFormData, currentValue: e.target.value })}
              placeholder="Current"
              className="w-24 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs text-right text-slate-900 dark:text-white font-bold"
            />
            <button onClick={() => handleSaveInlineEdit(entry)} className="p-1 rounded bg-teal-600 hover:bg-teal-700 text-white" title="Save">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setInlineEditingId(null)} className="p-1 rounded bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-300" title="Cancel">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const colCount = layout.columns.length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full ${isMarketMode ? 'max-w-4xl' : 'max-w-2xl'} h-[85vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {categoryName} {groupTitle ? `· ${groupTitle}` : ''}
                </h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400">
                  {entries.length} {entries.length === 1 ? 'holding' : 'holdings'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Detailed portfolio breakdown & performance
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

        {/* Metrics Banner & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
                Current Value
              </span>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                {formatINR(totalCurrent)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
                Invested
              </span>
              <span className="font-medium text-sm text-slate-600 dark:text-slate-300">
                {formatINR(totalInvested)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-semibold tracking-wider">
                Returns
              </span>
              <span
                className={`font-bold text-sm ${
                  isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                ₹{isPositive ? '' : '-'}{formatINR(Math.abs(totalGainLoss)).replace('₹', '')} ({isPositive ? '' : '-'}{Math.abs(totalGainLossPct)}%)
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search holdings..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Table Content Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
              <tr>
                {layout.columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-3 ${col.key === 'name' ? 'px-5' : col.key === 'current' ? 'px-5' : 'px-4'} ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredEntries.map((entry) => {
                const isEditing = inlineEditingId === entry._id;

                if (isEditing) {
                  return isMarketMode
                    ? renderMarketEditRow(entry)
                    : renderManualEditRow(entry);
                }

                return isMarketMode
                  ? renderMarketRow(entry)
                  : renderManualRow(entry);
              })}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="py-8 text-center text-xs text-slate-400">
                    No holdings found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-teal-600 dark:text-teal-400 font-medium">
            Showing {filteredEntries.length} of {entries.length} holdings
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            Press ESC or click outside to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default HoldingsTableModal;
