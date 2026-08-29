import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LineChart, HandHeart, ChevronRight, AlertTriangle } from 'lucide-react';

const OnboardingPage = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await completeOnboarding();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0f172a] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="bg-teal-500 rounded-lg p-2">
            <LineChart className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">FinDash</span>
        </div>
        <div className="flex justify-center mb-4 text-emerald-500">
          <HandHeart className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
          Welcome aboard, {user?.name?.split(' ')[0] || 'Friend'}!
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          We've set up your default portfolio categories. You can add your actual financial data inside the dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl shadow-slate-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-slate-100 dark:border-slate-700">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Click below to jump into your dashboard and start tracking your net worth.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Setting things up...' : 'Go to Dashboard'}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
