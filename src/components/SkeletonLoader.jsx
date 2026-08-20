import React from 'react';

/**
 * Skeleton loader cards for the dashboard loading state.
 * Provides visual structure while data is being fetched,
 * improving perceived performance over a plain spinner.
 */
const SkeletonPulse = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-slate-700 rounded-lg ${className}`} />
);

const SkeletonCard = () => (
  <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-3">
      <SkeletonPulse className="h-3 w-24" />
      <SkeletonPulse className="h-8 w-8 rounded-lg" />
    </div>
    <SkeletonPulse className="h-8 w-36 mb-3" />
    <SkeletonPulse className="h-3 w-20" />
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 sm:p-6 border border-gray-200/80 dark:border-gray-700/80">
    <div className="flex items-center justify-between mb-5">
      <div>
        <SkeletonPulse className="h-5 w-40 mb-2" />
        <SkeletonPulse className="h-3 w-56" />
      </div>
      <SkeletonPulse className="h-8 w-48 rounded-xl" />
    </div>
    <SkeletonPulse className="h-64 sm:h-72 w-full rounded-xl" />
  </div>
);

const SkeletonTable = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700">
    <div className="p-5">
      <SkeletonPulse className="h-5 w-48 mb-2" />
      <SkeletonPulse className="h-3 w-72" />
    </div>
    <div className="px-5 space-y-3 pb-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="h-8 w-8 rounded-lg" />
            <div>
              <SkeletonPulse className="h-4 w-32 mb-1" />
              <SkeletonPulse className="h-3 w-20" />
            </div>
          </div>
          <SkeletonPulse className="h-4 w-24" />
        </div>
      ))}
    </div>
  </div>
);

const SkeletonLoader = () => (
  <main className="px-4 sm:px-8 py-6 flex-1">
    {/* Header area */}
    <div className="flex justify-between items-center mb-6">
      <SkeletonPulse className="h-7 w-52" />
      <SkeletonPulse className="h-4 w-44" />
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>

    {/* Chart */}
    <div className="mb-8">
      <SkeletonChart />
    </div>

    {/* Tables */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <SkeletonTable />
      <SkeletonTable />
    </div>
  </main>
);

export default SkeletonLoader;
