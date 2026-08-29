import React, { useState, useEffect, useCallback } from 'react';
import { useFinance } from '../context/FinanceContext.jsx';
import { useBudget } from '../context/BudgetContext.jsx';
import { useTransaction } from '../context/TransactionContext.jsx';
import { generateHealthReport } from '../services/aiService.js';
import { ShieldCheck, Activity, TrendingUp, AlertTriangle, Loader2, RefreshCcw, Zap } from 'lucide-react';

const AIAdvisorView = () => {
  const { networthHistory, assetCategories, liabilityCategories } = useFinance();
  const { budgets = [] } = useBudget();
  const { transactions = [] } = useTransaction();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const handleGenerateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = { networthHistory, assetCategories, liabilityCategories, budgets, transactions };
      const result = await generateHealthReport(data);
      setReport(result);
      
      const now = new Date();
      setLastFetched(now);
      localStorage.setItem('aiAdvisorReport', JSON.stringify(result));
      localStorage.setItem('aiAdvisorDate', now.toISOString());
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  }, [networthHistory, assetCategories, liabilityCategories, budgets, transactions]);

  useEffect(() => {
    const cachedData = localStorage.getItem('aiAdvisorReport');
    const cachedDate = localStorage.getItem('aiAdvisorDate');
    
    if (cachedData && cachedDate) {
      const parsedDate = new Date(cachedDate);
      const now = new Date();
      const diffTime = Math.abs(now - parsedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays > 30) {
        // Cache expired, auto-refresh
        if (networthHistory.length > 0) {
          handleGenerateReport();
        }
      } else {
        setReport(JSON.parse(cachedData));
        setLastFetched(parsedDate);
      }
    }
  }, [networthHistory, assetCategories, liabilityCategories, budgets, transactions, handleGenerateReport]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-4xl mx-auto space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Automated insights based on your current portfolio allocation and trends.</p>
        </div>
        <div className="flex items-center gap-3">
          {lastFetched && report && (
            <span className="text-xs text-slate-400 font-medium">
              Last on: {lastFetched.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center gap-2 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            {report ? 'Refresh' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!report && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Analysis Yet</h3>
          <p className="text-slate-500 max-w-sm mb-6 text-sm">
            Run an analysis to let FinDash scan your portfolio and generate a personalized health score.
          </p>
        </div>
      )}

      {loading && !report && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium text-sm">Analyzing your portfolio...</p>
        </div>
      )}

      {report && (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Top Score Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm gap-6">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-100 dark:text-slate-800" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(report.score / 100) * 282.7} 282.7`}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-xl font-black text-slate-800 dark:text-white">{report.score}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Portfolio Health</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {report.score >= 80 ? 'Excellent' : report.score >= 60 ? 'Good, but needs tweaks' : 'High Risk'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pros and Cons */}
            <div className="space-y-8">
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Strengths
                </h4>
                <ul className="space-y-3">
                  {report.pros?.map((pro, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="leading-relaxed">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Risks
                </h4>
                <ul className="space-y-3">
                  {report.cons?.map((con, i) => (
                    <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="leading-relaxed">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-4">
                <Zap className="w-4 h-4 text-amber-500" /> Recommended Actions
              </h4>
              <div className="space-y-3">
                {report.immediateActions?.map((action, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-slate-500 shadow-sm flex items-center justify-center shrink-0 text-xs font-bold border border-slate-200 dark:border-slate-700">
                      {i + 1}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisorView;
