import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpCircle,
  CreditCard,
  PieChart,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import {
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
  getAssetBreakdown,
} from '../utils/calculations.js';
import { formatINR } from '../utils/format.js';

const SummaryCards = () => {
  const { assetCategories = [], liabilityCategories = [], networthHistory = [] } = useFinance();

  const totalAssets = useMemo(() => calculateTotalAssets(assetCategories), [assetCategories]);
  const totalLiabilities = useMemo(() => calculateTotalLiabilities(liabilityCategories), [liabilityCategories]);
  const netWorth = useMemo(() => calculateNetWorth(assetCategories, liabilityCategories), [assetCategories, liabilityCategories]);
  const breakdown = useMemo(() => getAssetBreakdown(assetCategories), [assetCategories]);

  const { invested, gainLoss } = useMemo(() => {
    const totalInvested = breakdown.reduce((s, b) => s + b.investedValue, 0);
    const gl = totalAssets - totalInvested;
    return { invested: totalInvested, gainLoss: gl };
  }, [breakdown, totalAssets]);

  // Month-over-month change comparing live netWorth to snapshot from ~30 days ago
  const monthChangePct = useMemo(() => {
    if (!networthHistory || networthHistory.length < 1) return null;
    
    // Find a snapshot from roughly 30 days ago, or the oldest available if less than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let previousSnapshot = networthHistory[0];
    for (let i = networthHistory.length - 1; i >= 0; i--) {
      const snapDate = new Date(networthHistory[i].dateString);
      if (snapDate <= thirtyDaysAgo) {
        previousSnapshot = networthHistory[i];
        break;
      }
    }
    
    const previous = previousSnapshot?.netWorth;
    // If it's the same day, don't show MoM
    if (networthHistory.length === 1 && previousSnapshot.dateString === new Date().toISOString().split('T')[0]) {
      return null;
    }

    if (previous === undefined || previous === null || previous === 0) return null;
    return parseFloat((((netWorth - previous) / previous) * 100).toFixed(1));
  }, [networthHistory, netWorth]);

  const hasMoM = monthChangePct !== null;
  const isPositiveMonth = monthChangePct !== null && monthChangePct >= 0;
  const isPositiveGL = gainLoss >= 0;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
      {/* 1. Net Worth */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 relative overflow-hidden transition-colors duration-300">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Net Worth</p>
          <div className="w-8 h-8 bg-teal-50 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
            <PieChart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight break-all">{formatINR(netWorth)}</h2>
        <div className="mt-3 flex items-center">
          {hasMoM ? (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              isPositiveMonth
                ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {isPositiveMonth ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositiveMonth ? '+' : ''}{monthChangePct}% MoM
            </span>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Live Balance</span>
          )}
        </div>
      </div>

      {/* 2. Total Assets */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Assets</p>
          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight break-all">{formatINR(totalAssets)}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Invested: {formatINR(invested)}
        </p>
      </div>

      {/* 3. Total Liabilities */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Total Liabilities</p>
          <div className="w-8 h-8 bg-rose-50 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight break-all">{formatINR(totalLiabilities)}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Across {liabilityCategories.reduce((s, c) => s + (c.entries?.length || 0), 0)} debt accounts
        </p>
      </div>

      {/* 4. Total Gain / Loss */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Investment Gain / Loss</p>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isPositiveGL ? 'bg-teal-50 dark:bg-teal-900/30' : 'bg-red-50 dark:bg-red-900/30'
          }`}>
            <ArrowUpCircle className={`w-4 h-4 ${isPositiveGL ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`} />
          </div>
        </div>
        <h2 className={`text-2xl font-extrabold tracking-tight break-all ${
          isPositiveGL ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'
        }`}>
          {isPositiveGL ? '+' : ''}{formatINR(gainLoss)}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          {Number(invested) > 0 
            ? `${isPositiveGL ? '+' : ''}${((gainLoss / invested) * 100).toFixed(1)}% total return` 
            : 'Portfolio returns'}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;
