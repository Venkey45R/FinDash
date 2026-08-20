import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { calculateTotalAssets, getAssetBreakdown } from '../utils/calculations.js';
import { formatINR } from '../utils/format.js';

const allocationColors = [
  'bg-teal-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-emerald-500',
];

const PortfolioView = () => {
  const { assetCategories } = useFinance();

  const breakdown = useMemo(() => getAssetBreakdown(assetCategories), [assetCategories]);
  const totalAssets = useMemo(() => calculateTotalAssets(assetCategories), [assetCategories]);

  const totals = useMemo(() => {
    const invested = breakdown.reduce((s, b) => s + b.investedValue, 0);
    const current = breakdown.reduce((s, b) => s + b.value, 0);
    const gl = current - invested;
    const pct = invested !== 0 ? (gl / invested) * 100 : 0;
    return { invested, current, gainLoss: gl, pct: parseFloat(pct.toFixed(2)) };
  }, [breakdown]);

  return (
    <section>
      {/* Portfolio Value Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Portfolio Value</h3>
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight leading-none">{formatINR(totalAssets)}</h2>
            <div className={`flex items-center gap-1.5 ${totals.gainLoss >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500 dark:text-rose-400'} text-sm font-bold`}>
              {totals.gainLoss >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>{totals.gainLoss >= 0 ? '+' : ''}{formatINR(totals.gainLoss)} ({totals.pct >= 0 ? '+' : ''}{totals.pct}%)</span>
            </div>
          </div>
        </div>

        {/* Allocation Bar */}
        {breakdown.length > 0 && (
          <div className="w-full">
            <div className="flex rounded-full overflow-hidden h-3 mb-4 bg-gray-100 dark:bg-slate-800">
              {breakdown.map((b, i) => (
                <div
                  key={b.name}
                  className={`${allocationColors[i % allocationColors.length]} transition-all duration-500`}
                  style={{ width: `${b.percentage}%` }}
                  title={`${b.name}: ${b.percentage}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-5 gap-y-2">
              {breakdown.map((b, i) => (
                <div key={b.name} className="flex items-center gap-2 text-sm">
                  <span className={`w-2.5 h-2.5 rounded-full ${allocationColors[i % allocationColors.length]}`} />
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{b.name}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{b.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Holdings Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 dark:bg-slate-700/30 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3 font-medium uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 font-medium uppercase tracking-wider text-right">Invested</th>
                <th className="px-5 py-3 font-medium uppercase tracking-wider text-right">Current Value</th>
                <th className="px-5 py-3 font-medium uppercase tracking-wider text-right">Gain/Loss</th>
                <th className="px-5 py-3 font-medium uppercase tracking-wider text-right w-24">Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {breakdown.map((b, index) => {
                const isPositive = b.gainLoss >= 0;

                return (
                  <tr key={b.categoryId || index} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-gray-100">
                      {b.name}
                    </td>
                    <td className="px-5 py-3.5 text-right text-gray-600 dark:text-gray-400">{formatINR(b.investedValue)}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-900 dark:text-white">{formatINR(b.value)}</td>
                    <td className={`px-5 py-3.5 text-right font-medium ${isPositive ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
                      {isPositive ? '+' : ''}{formatINR(b.gainLoss)}
                      <span className="block text-xs font-normal opacity-80 mt-0.5">{isPositive ? '+' : ''}{b.gainLossPct}%</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-900 dark:text-white">
                      {b.percentage}%
                    </td>
                  </tr>
                );
              })}
              {breakdown.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
                    No categories found with investments. Go to Holdings to add entries.
                  </td>
                </tr>
              )}
            </tbody>
            {breakdown.length > 0 && (
              <tfoot className="bg-gray-50/80 dark:bg-slate-800/80 border-t border-gray-200 dark:border-gray-700">
                <tr>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">Total Portfolio</td>
                  <td className="px-5 py-4 text-right font-bold text-gray-900 dark:text-white">{formatINR(totals.invested)}</td>
                  <td className="px-5 py-4 text-right font-bold text-gray-900 dark:text-white">{formatINR(totals.current)}</td>
                  <td className={`px-5 py-4 text-right font-bold ${totals.gainLoss >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-500 dark:text-red-400'}`}>
                    {totals.gainLoss >= 0 ? '+' : ''}{formatINR(totals.gainLoss)}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-gray-900 dark:text-white">100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </section>
  );
};

export default PortfolioView;
