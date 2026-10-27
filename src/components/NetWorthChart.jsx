import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart2, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useFinance } from '../context/FinanceContext.jsx';
import { calculateNetWorth } from '../utils/calculations.js';
import { formatINR } from '../utils/format.js';
import { fetchBenchmarkHistory } from '../services/api.js';

const TIME_FILTERS = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 9999 },
];

const BENCHMARKS = [
  { key: 'NIFTY50',  label: 'Nifty 50',  color: '#f59e0b' },
  { key: 'NIFTY500', label: 'Nifty 500', color: '#a78bfa' },
  { key: 'SENSEX',   label: 'Sensex',    color: '#f97316' },
];

const formatYAxis = (value) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 10000000) return sign + 'Rs.' + (abs / 10000000).toFixed(1) + 'Cr';
  if (abs >= 100000)   return sign + 'Rs.' + (abs / 100000).toFixed(1) + 'L';
  if (abs >= 1000)     return sign + 'Rs.' + (abs / 1000).toFixed(0) + 'K';
  return sign + 'Rs.' + abs;
};

const formatPctAxis = (v) => (v >= 0 ? '+' : '') + (v != null ? v.toFixed(1) : '0') + '%';

const CustomTooltip = ({ active, payload, label, isDark, activeBenchmarks }) => {
  if (!active || !payload || payload.length === 0) return null;

  const networthEntry = payload.find((p) => p.dataKey === 'netWorth');
  const netWorth = networthEntry?.value;
  const item = networthEntry?.payload;
  const networthGainPct = item?._networthGainPct;

  const base = {
    backgroundColor: isDark ? 'rgba(15,23,42,0.97)' : 'rgba(255,255,255,0.97)',
    border: '1px solid ' + (isDark ? '#334155' : '#e2e8f0'),
    borderRadius: '14px',
    boxShadow: '0 20px 40px -8px rgba(0,0,0,0.25)',
    padding: '12px 16px',
    minWidth: '220px',
  };

  return (
    React.createElement('div', { style: base },
      React.createElement('p', {
        style: { fontSize: '11px', fontWeight: 600, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }
      }, item?.dateString || label),

      netWorth != null && React.createElement('div', {
        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: activeBenchmarks.length > 0 ? '8px' : 0, paddingBottom: activeBenchmarks.length > 0 ? '8px' : 0, borderBottom: activeBenchmarks.length > 0 ? '1px solid ' + (isDark ? '#1e293b' : '#f1f5f9') : 'none' }
      },
        React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
          React.createElement('span', { style: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0d9488', flexShrink: 0, display: 'inline-block' } }),
          React.createElement('span', { style: { fontSize: '12px', fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' } }, 'Net Worth')
        ),
        React.createElement('div', { style: { textAlign: 'right' } },
          React.createElement('span', { style: { display: 'block', fontSize: '13px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' } }, formatINR(netWorth)),
          networthGainPct != null && React.createElement('span', { style: { display: 'block', fontSize: '11px', fontWeight: 600, color: networthGainPct >= 0 ? '#10b981' : '#f43f5e', marginTop: '1px' } },
            (networthGainPct >= 0 ? '+' : '') + networthGainPct.toFixed(2) + '% vs start'
          )
        )
      ),

      ...activeBenchmarks.map((bKey) => {
        const bm = BENCHMARKS.find((b) => b.key === bKey);
        if (!bm) return null;
        const bmEntry = payload.find((p) => p.dataKey === '_bm_gainPct_' + bKey);
        const gainPct = bmEntry?.value;
        const close = item?.['_bm_close_' + bKey];
        return React.createElement('div', { key: bKey, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '6px' } },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
            React.createElement('svg', { width: '16', height: '6', viewBox: '0 0 16 6' },
              React.createElement('line', { x1: '0', y1: '3', x2: '16', y2: '3', stroke: bm.color, strokeWidth: '2', strokeDasharray: '5 2' })
            ),
            React.createElement('span', { style: { fontSize: '12px', fontWeight: 600, color: isDark ? '#cbd5e1' : '#374151' } }, bm.label)
          ),
          React.createElement('div', { style: { textAlign: 'right' } },
            close != null && React.createElement('span', { style: { display: 'block', fontSize: '12px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' } },
              close.toLocaleString('en-IN', { maximumFractionDigits: 0 })
            ),
            gainPct != null && React.createElement('span', { style: { display: 'block', fontSize: '11px', fontWeight: 600, color: gainPct >= 0 ? '#10b981' : '#f43f5e', marginTop: '1px' } },
              (gainPct >= 0 ? '+' : '') + gainPct.toFixed(2) + '% vs start'
            )
          )
        );
      })
    )
  );
};

const NetWorthChart = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeBenchmarks, setActiveBenchmarks] = useState([]);
  const [benchmarkData, setBenchmarkData] = useState({});
  const [benchmarkLoading, setBenchmarkLoading] = useState({});
  const [benchmarkError, setBenchmarkError] = useState({});
  const fetchedRef = useRef(new Set());

  const { isDark } = useTheme();
  const { networthHistory = [], assetCategories = [], liabilityCategories = [] } = useFinance();

  const currentLiveNetWorth = useMemo(
    () => calculateNetWorth(assetCategories, liabilityCategories),
    [assetCategories, liabilityCategories]
  );

  const allData = useMemo(() => {
    if (networthHistory && networthHistory.length > 0) return networthHistory;
    const todayLabel = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date());
    return [{ month: todayLabel, dateString: new Date().toISOString().split('T')[0], netWorth: currentLiveNetWorth, recordedAt: new Date().toISOString() }];
  }, [networthHistory, currentLiveNetWorth]);

  const filteredData = useMemo(() => {
    const filter = TIME_FILTERS.find((f) => f.label === activeFilter) || TIME_FILTERS[TIME_FILTERS.length - 1];
    const base = filter.label === 'ALL' || allData.length <= filter.days ? allData : allData.slice(-filter.days);
    const baseNW = base[0]?.netWorth || 0;
    return base.map((d) => ({
      ...d,
      _networthGainPct: baseNW > 0 ? parseFloat((((d.netWorth - baseNW) / baseNW) * 100).toFixed(2)) : 0,
    }));
  }, [activeFilter, allData]);

  const loadBenchmark = useCallback(async (key) => {
    if (fetchedRef.current.has(key)) return;
    fetchedRef.current.add(key);
    setBenchmarkLoading((prev) => ({ ...prev, [key]: true }));
    setBenchmarkError((prev) => ({ ...prev, [key]: null }));
    try {
      const result = await fetchBenchmarkHistory(key);
      setBenchmarkData((prev) => ({ ...prev, [key]: result }));
    } catch (err) {
      setBenchmarkError((prev) => ({ ...prev, [key]: err.message || 'Failed to load' }));
      fetchedRef.current.delete(key);
    } finally {
      setBenchmarkLoading((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const toggleBenchmark = useCallback((key) => {
    setActiveBenchmarks((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      loadBenchmark(key);
      return [...prev, key];
    });
  }, [loadBenchmark]);

  const chartData = useMemo(() => {
    if (activeBenchmarks.length === 0) return filteredData;
    const alignedBMs = {};
    for (const bKey of activeBenchmarks) {
      const bd = benchmarkData[bKey];
      if (!bd || !bd.data || bd.data.length === 0) { alignedBMs[bKey] = filteredData.map(() => null); continue; }
      const firstDate = filteredData[0]?.dateString || '';
      const lastDate = filteredData[filteredData.length - 1]?.dateString || '';
      const windowData = bd.data.filter((p) => (!firstDate || p.dateString >= firstDate) && (!lastDate || p.dateString <= lastDate));
      const baseClose = windowData.length > 0 ? windowData[0].close : null;
      const reNormed = new Map(windowData.map((p) => [p.dateString, {
        gainPct: baseClose && baseClose > 0 ? parseFloat((((p.close - baseClose) / baseClose) * 100).toFixed(2)) : 0,
        close: p.close,
      }]));
      const sortedBmDates = windowData.map((p) => p.dateString).sort();
      alignedBMs[bKey] = filteredData.map((nw) => {
        const d = nw.dateString;
        if (!d) return null;
        if (reNormed.has(d)) return reNormed.get(d);
        let best = null;
        for (const bd2 of sortedBmDates) { if (bd2 <= d) best = bd2; else break; }
        return best ? reNormed.get(best) : null;
      });
    }
    return filteredData.map((row, i) => {
      const merged = { ...row };
      for (const bKey of activeBenchmarks) {
        const aligned = alignedBMs[bKey]?.[i];
        merged['_bm_gainPct_' + bKey] = aligned?.gainPct ?? null;
        merged['_bm_close_' + bKey] = aligned?.close ?? null;
      }
      return merged;
    });
  }, [filteredData, activeBenchmarks, benchmarkData]);

  const latestPoint = allData[allData.length - 1];
  const firstFiltered = filteredData[0];
  const lastFiltered = filteredData[filteredData.length - 1];
  const overallTrendDiff = filteredData.length > 1 ? (lastFiltered?.netWorth || 0) - (firstFiltered?.netWorth || 0) : 0;
  const isTrendPositive = overallTrendDiff >= 0;
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const showDualAxis = activeBenchmarks.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Net Worth Trend</h3>
            {filteredData.length > 1 && (
              <span className={'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ' + (isTrendPositive ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30' : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30')}>
                {isTrendPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isTrendPositive ? '+' : ''}{formatINR(overallTrendDiff)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last: {latestPoint?.month || 'Today'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 bg-gray-100 dark:bg-slate-700/60 border border-gray-200 dark:border-gray-600 rounded-xl p-1 shrink-0 self-start">
          {TIME_FILTERS.map((f) => (
            <button key={f.label} onClick={() => setActiveFilter(f.label)}
              className={'text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ' + (activeFilter === f.label ? 'bg-teal-600 text-white shadow-xs' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Benchmark selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-1.5">
          <BarChart2 size={13} className="text-gray-400 dark:text-gray-500" />
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide select-none">vs Index</span>
        </div>
        {BENCHMARKS.map((bm) => {
          const isActive = activeBenchmarks.includes(bm.key);
          const isLoading = benchmarkLoading[bm.key];
          const hasError = !!benchmarkError[bm.key];
          return (
            <button key={bm.key} onClick={() => toggleBenchmark(bm.key)}
              title={hasError ? ('Error: ' + benchmarkError[bm.key]) : ('Toggle ' + bm.label)}
              style={isActive ? { borderColor: bm.color, backgroundColor: bm.color + '18', color: bm.color } : {}}
              className={'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 ' + (isActive ? 'shadow-sm' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-400 bg-transparent hover:bg-gray-50 dark:hover:bg-slate-700/50') + (hasError ? ' opacity-60' : '')}>
              {isLoading ? <Loader2 size={10} className="animate-spin" /> : hasError ? <AlertCircle size={10} /> : (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isActive ? bm.color : 'currentColor', display: 'inline-block', flexShrink: 0, opacity: isActive ? 1 : 0.5 }} />
              )}
              {bm.label}
            </button>
          );
        })}
        {showDualAxis && (
          <span className="text-xs text-gray-400 dark:text-gray-500 italic ml-auto hidden sm:block">Dashed = % gain from period start (right axis)</span>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: showDualAxis ? 52 : 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="networthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={isDark ? 0.35 : 0.2} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }} interval="preserveStartEnd" minTickGap={20} />
            <YAxis yAxisId="networth" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={formatYAxis} width={50} />
            {showDualAxis && (
              <YAxis yAxisId="pct" orientation="right" axisLine={false} tickLine={false} tick={{ fill: tickColor, fontSize: 11 }} tickFormatter={formatPctAxis} width={50} />
            )}
            <Tooltip content={<CustomTooltip isDark={isDark} activeBenchmarks={activeBenchmarks} />} />
            <Area yAxisId="networth" type="monotone" dataKey="netWorth" stroke="#0d9488" strokeWidth={2.5} fill="url(#networthAreaGrad)"
              dot={chartData.length <= 15 ? { r: 4, fill: '#0d9488', strokeWidth: 1, stroke: '#fff' } : false}
              activeDot={{ r: 6, fill: '#0d9488', stroke: isDark ? '#0f172a' : '#fff', strokeWidth: 2 }} />
            {BENCHMARKS.filter((bm) => activeBenchmarks.includes(bm.key)).map((bm) => (
              <Line key={bm.key} yAxisId="pct" type="monotone" dataKey={'_bm_gainPct_' + bm.key}
                stroke={bm.color} strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls
                activeDot={{ r: 5, fill: bm.color, stroke: isDark ? '#0f172a' : '#fff', strokeWidth: 2 }} />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      {showDualAxis && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/60 pt-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 bg-teal-500 rounded" />
            <span>Net Worth (₹ — left axis)</span>
          </div>
          {BENCHMARKS.filter((bm) => activeBenchmarks.includes(bm.key)).map((bm) => (
            <div key={bm.key} className="flex items-center gap-1.5">
              <svg width="18" height="6" viewBox="0 0 18 6"><line x1="0" y1="3" x2="18" y2="3" stroke={bm.color} strokeWidth="2" strokeDasharray="5 2" /></svg>
              <span style={{ color: bm.color }}>{bm.label}</span>
              <span>(% gain — right axis)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetWorthChart;