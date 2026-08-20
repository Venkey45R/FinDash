import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useFinance } from '../context/FinanceContext.jsx';
import { calculateNetWorth } from '../utils/calculations.js';
import { formatINR } from '../utils/format.js';

const filters = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 9999 },
];

const formatYAxis = (value) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(0)}K`;
  return `${sign}₹${abs}`;
};

const NetWorthChart = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const { isDark } = useTheme();
  const { networthHistory = [], assetCategories = [], liabilityCategories = [] } = useFinance();

  const currentLiveNetWorth = useMemo(
    () => calculateNetWorth(assetCategories, liabilityCategories),
    [assetCategories, liabilityCategories]
  );

  // Prepare chart dataset starting from today
  const allData = useMemo(() => {
    if (networthHistory && networthHistory.length > 0) {
      return networthHistory;
    }
    // Fallback single today's point if history empty
    const todayLabel = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
    }).format(new Date());
    return [
      {
        month: todayLabel,
        dateString: new Date().toISOString().split('T')[0],
        netWorth: currentLiveNetWorth,
        recordedAt: new Date().toISOString(),
      },
    ];
  }, [networthHistory, currentLiveNetWorth]);

  const filteredData = useMemo(() => {
    const filter = filters.find((f) => f.label === activeFilter) || filters[filters.length - 1];
    if (filter.label === 'ALL' || allData.length <= filter.days) {
      return allData;
    }
    return allData.slice(-filter.days);
  }, [activeFilter, allData]);

  const latestPoint = allData[allData.length - 1];
  const firstPoint = allData[0];
  const overallTrendDiff = allData.length > 1 ? (latestPoint?.netWorth || 0) - (firstPoint?.netWorth || 0) : 0;
  const isTrendPositive = overallTrendDiff >= 0;

  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-xs transition-all duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Net Worth Trend
            </h3>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Last on: {latestPoint?.month || 'Today'}
            </span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700/60 border border-gray-200 dark:border-gray-600 rounded-xl p-1 shrink-0 self-start sm:self-auto">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all ${
                activeFilter === f.label
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={isDark ? 0.35 : 0.2} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11, fontWeight: 500 }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 11 }}
              tickFormatter={formatYAxis}
              width={65}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '12px',
                color: isDark ? '#f8fafc' : '#0f172a',
                padding: '8px 12px',
              }}
              formatter={(value, name, item) => [
                formatINR(value),
                'Net Worth',
              ]}
              labelFormatter={(label, items) => {
                const item = items?.[0]?.payload;
                return item?.dateString ? `Date: ${item.dateString} (${label})` : `Date: ${label}`;
              }}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#0d9488"
              strokeWidth={2.5}
              fill="url(#netWorthTrendGradient)"
              dot={filteredData.length <= 15 ? { r: 4, fill: '#0d9488', strokeWidth: 1, stroke: '#fff' } : false}
              activeDot={{ r: 6, fill: '#0d9488', stroke: isDark ? '#0f172a' : '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NetWorthChart;
