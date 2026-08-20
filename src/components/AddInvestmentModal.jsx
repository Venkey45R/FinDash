import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Search,
  Check,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { searchInstruments, fetchLivePrice } from '../services/api.js';
import { searchCatalog } from '../data/instrumentsData.js';
import { formatINR } from '../utils/format.js';

const AddInvestmentModal = ({ isOpen, onClose }) => {
  const { assetCategories = [], addInvestment, addEntry, showToast } = useFinance();

  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [formData, setFormData] = useState({
    holdingName: '',
    quantity: '',
    averageBuyPrice: '',
    investedAmount: '',
    currentValue: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const [submitting, setSubmitting] = useState(false);
  const [isFetchingLivePrice, setIsFetchingLivePrice] = useState(false);
  const [livePriceData, setLivePriceData] = useState(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const isDomesticEquity = useMemo(() => {
    const cat = (selectedCategoryName || '').toLowerCase();
    return cat.includes('dom') || cat.includes('stock') || cat.includes('equity');
  }, [selectedCategoryName]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      if (assetCategories.length > 0) {
        setSelectedCategoryName(assetCategories[0]?.name || 'Domestic Equity');
      }
      setSelectedInstrument(null);
      setSearchQuery('');
      setIsDropdownOpen(false);
      setLivePriceData(null);
      setIsFetchingLivePrice(false);
      setFormData({
        holdingName: '',
        quantity: '',
        averageBuyPrice: '',
        investedAmount: '',
        currentValue: '',
        purchaseDate: new Date().toISOString().split('T')[0],
      });

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
  }, [isOpen, assetCategories, onClose]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search catalog when typing in domestic equity
  useEffect(() => {
    if (!isDomesticEquity) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const localStocks = searchCatalog(query, 'STOCK');
    const localMFs = searchCatalog(query, 'MUTUAL_FUND');
    const localETFs = searchCatalog(query, 'ETF');
    const combined = [...localStocks, ...localETFs, ...localMFs];
    setSearchResults(combined.slice(0, 25));

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const serverResults = await searchInstruments(query);
        if (serverResults && serverResults.length > 0) {
          const seen = new Set();
          const merged = [];
          for (const item of [...serverResults, ...combined]) {
            const key = item.symbol || item.name;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }
          setSearchResults(merged.slice(0, 25));
        }
      } catch {
        // use local catalog
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, isDomesticEquity]);

  const handleSelectCategory = (catName) => {
    setSelectedCategoryName(catName);
    setSelectedInstrument(null);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setLivePriceData(null);
    setIsFetchingLivePrice(false);
    setFormData((prev) => ({
      ...prev,
      holdingName: '',
      quantity: '',
      averageBuyPrice: '',
      investedAmount: '',
      currentValue: '',
    }));
  };

  const handleSelectInstrument = async (inst) => {
    setSelectedInstrument(inst);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setLivePriceData(null);

    const initialPrice = inst.price || inst.latestPrice || inst.nav || inst.latestNAV || '';
    setFormData((prev) => ({
      ...prev,
      holdingName: inst.name,
      averageBuyPrice: initialPrice ? String(initialPrice) : prev.averageBuyPrice,
    }));

    setIsFetchingLivePrice(true);
    try {
      const liveData = await fetchLivePrice(inst.symbol, inst.type, inst.name, inst.exchange);
      if (liveData && (liveData.price || liveData.nav)) {
        const p = liveData.price || liveData.nav;
        setLivePriceData(liveData);
        setFormData((prev) => ({
          ...prev,
          averageBuyPrice: prev.averageBuyPrice || String(p),
        }));
      }
    } catch {
      // fallback
    } finally {
      setIsFetchingLivePrice(false);
    }
  };

  const handleClearInstrument = () => {
    setSelectedInstrument(null);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setLivePriceData(null);
    setIsFetchingLivePrice(false);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const calculatedInvested = useMemo(() => {
    if (isDomesticEquity && (selectedInstrument || (formData.quantity && formData.averageBuyPrice))) {
      const q = parseFloat(formData.quantity) || 0;
      const p = parseFloat(formData.averageBuyPrice) || 0;
      return q * p;
    }
    return parseFloat(formData.investedAmount) || 0;
  }, [isDomesticEquity, selectedInstrument, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const targetCategory = assetCategories.find(
        (c) => c.name.toLowerCase() === selectedCategoryName.toLowerCase()
      ) || assetCategories[0];

      if (isDomesticEquity && selectedInstrument) {
        const qty = parseFloat(formData.quantity);
        const price = parseFloat(formData.averageBuyPrice);

        if (!qty || qty <= 0) {
          showToast('Please enter a valid quantity / units', 'error');
          setSubmitting(false);
          return;
        }
        if (!price || price <= 0) {
          showToast('Please enter a valid buy price / purchase NAV', 'error');
          setSubmitting(false);
          return;
        }

        const isMF = selectedInstrument.type === 'MUTUAL_FUND' || selectedInstrument.plan;
        const isETF = selectedInstrument.type === 'ETF';

        await addInvestment({
          type: isMF ? 'MUTUAL_FUND' : isETF ? 'ETF' : 'STOCK',
          instrumentId: selectedInstrument?._id,
          name: selectedInstrument?.name,
          symbol: selectedInstrument?.symbol,
          exchange: selectedInstrument?.exchange || 'NSE',
          isin: selectedInstrument?.isin || '',
          plan: selectedInstrument?.plan || '',
          quantity: qty,
          averageBuyPrice: price,
          units: isMF ? qty : 0,
          averageNAV: isMF ? price : 0,
          purchaseDate: formData.purchaseDate,
          categoryName: selectedCategoryName,
        });
      } else {
        const name = (formData.holdingName || searchQuery).trim();
        const invested = parseFloat(formData.investedAmount) || 0;
        const current = parseFloat(formData.currentValue) || invested;

        if (!name) {
          showToast('Please enter a holding / asset name', 'error');
          setSubmitting(false);
          return;
        }

        if (targetCategory?._id) {
          await addEntry(targetCategory._id, {
            name: name,
            investedAmount: invested,
            currentValue: current,
            purchaseDate: formData.purchaseDate,
          });
        } else {
          await addInvestment({
            type: 'OTHER',
            name: name,
            categoryName: selectedCategoryName,
            investedAmount: invested,
            currentValue: current,
            purchaseDate: formData.purchaseDate,
          });
        }
      }

      onClose();
    } catch (err) {
      console.error('Failed to add investment:', err);
      showToast(err.message || 'Failed to add investment', 'error');
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
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Investment
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Add stocks, mutual funds, or manual holdings
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
            {assetCategories.map((cat) => {
              const isSelected = selectedCategoryName.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat._id || cat.name}
                  type="button"
                  onClick={() => handleSelectCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
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
          {/* DOMESTIC EQUITY: Search or Custom Input */}
          {isDomesticEquity ? (
            <div className="space-y-4">
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Stock, ETF, or Mutual Fund
                </label>

                {selectedInstrument ? (
                  /* Selected Instrument Card */
                  <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 shrink-0">
                        {selectedInstrument.symbol || 'MF'}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {selectedInstrument.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {selectedInstrument.type === 'MUTUAL_FUND' || selectedInstrument.plan ? 'Mutual Fund' : selectedInstrument.exchange || 'NSE/BSE'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearInstrument}
                      className="px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-lg transition-colors shrink-0"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  /* Search Input Field */
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(e.target.value.trim().length > 0);
                      }}
                      placeholder="Search by company or fund name (e.g. Reliance, TCS, Parag Parikh)..."
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                      autoFocus
                    />

                    {/* Autocomplete Dropdown (NO PRICE DISPLAYED) */}
                    {isDropdownOpen && searchQuery.trim().length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                        {isSearching ? (
                          <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                            <span>Searching stocks & funds...</span>
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((item) => {
                            const isFund = item.type === 'MUTUAL_FUND' || item.plan;
                            const isEtf = item.type === 'ETF';
                            const tagLabel = isFund ? 'Mutual Fund' : isEtf ? 'ETF' : 'Stock';
                            return (
                              <button
                                key={item.symbol || item.name}
                                type="button"
                                onClick={() => handleSelectInstrument(item)}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-teal-50/50 dark:hover:bg-slate-700/60 transition-colors group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-teal-700 dark:text-teal-400 shrink-0">
                                    {item.symbol || 'MF'}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-700 dark:group-hover:text-teal-300">
                                      {item.name}
                                    </p>
                                    {item.sector && (
                                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                        {item.sector}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
                                  {tagLabel}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No matching stock or mutual fund found for "{searchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity & Buy Price Inputs */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {selectedInstrument?.type === 'MUTUAL_FUND' || selectedInstrument?.plan ? 'Units Held' : 'Quantity (Shares)'}
                  </label>
                  <input
                    type="number"
                    min="0.0001"
                    step="any"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {selectedInstrument?.type === 'MUTUAL_FUND' || selectedInstrument?.plan ? 'Purchase NAV (₹)' : 'Buy Price (₹)'}
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={formData.averageBuyPrice}
                    onChange={(e) => setFormData({ ...formData, averageBuyPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Live Price Helper Indicator */}
              {isFetchingLivePrice && (
                <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking latest market price...</span>
                </div>
              )}

              {!isFetchingLivePrice && livePriceData && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <span>
                      Live Market: <strong className="text-slate-900 dark:text-white font-bold">{formatINR(livePriceData.price || livePriceData.nav)}</strong>
                    </span>
                    {livePriceData.changePercent !== undefined && livePriceData.changePercent !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        livePriceData.changePercent >= 0 ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}>
                        {livePriceData.changePercent >= 0 ? '+' : ''}{livePriceData.changePercent}%
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, averageBuyPrice: String(livePriceData.price || livePriceData.nav) }))}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Use as Buy Price
                  </button>
                </div>
              )}

              {/* Purchase Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          ) : (
            /* NON-DOMESTIC CATEGORIES (Clean & Direct) */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Holding / Asset Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.holdingName}
                  onChange={(e) => setFormData({ ...formData, holdingName: e.target.value })}
                  placeholder="e.g. EPF, Sovereign Gold Bond, SBI Fixed Deposit..."
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invested Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={formData.investedAmount}
                    onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    placeholder="Defaults to invested"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase / Start Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>
            </div>
          )}

          {/* Calculated Total Banner */}
          {calculatedInvested > 0 && (
            <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Total Cost Basis:</span>
              <span className="font-extrabold text-sm text-teal-700 dark:text-teal-300">{formatINR(calculatedInvested)}</span>
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
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Add Investment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInvestmentModal;

