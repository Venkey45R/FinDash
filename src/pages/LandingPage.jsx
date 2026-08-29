import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LineChart, Shield, Target, Zap, ChevronRight, Activity, PieChart, Sparkles } from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-[#0f172a] text-slate-900 dark:text-white font-sans">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-teal-500 rounded-lg p-1.5 flex items-center justify-center">
                <LineChart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-500">
                FinDash
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Master your wealth with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">intelligent insights</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8">
            The all-in-one platform to track your net worth, monitor live market portfolios, set budgets, and get AI-powered financial advice.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="bg-teal-600 hover:bg-teal-700 text-white text-lg font-medium px-8 py-4 rounded-xl shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2">
              Get Started for Free <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup/Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 aspect-video max-w-5xl mx-auto mb-24">
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fc] dark:from-[#0f172a] via-transparent to-transparent z-10" />
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>
          <div className="p-8 grid grid-cols-3 gap-6 opacity-80">
            <div className="col-span-2 space-y-6">
              <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-teal-50 dark:bg-teal-900/20 rounded-xl" />
              <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          <FeatureCard 
            icon={<Activity className="text-teal-500" />}
            title="Net Worth Tracking"
            description="Watch your wealth grow over time with daily snapshots and beautiful historical charts."
          />
          <FeatureCard 
            icon={<Zap className="text-amber-500" />}
            title="Live Market Prices"
            description="Auto-synced stock and mutual fund prices so your portfolio valuation is always up to date."
          />
          <FeatureCard 
            icon={<Target className="text-indigo-500" />}
            title="Budget & Expenses"
            description="Set monthly spending limits, log your daily expenses, and keep your cashflow in check."
          />
          <FeatureCard 
            icon={<Sparkles className="text-emerald-500" />}
            title="AI Financial Advisor"
            description="Get personalized portfolio analysis and financial health reports powered by advanced AI."
          />
          <FeatureCard 
            icon={<Shield className="text-rose-500" />}
            title="Liability Management"
            description="Track your home loans, vehicle EMIs, and credit card debts all in one place."
          />
          <FeatureCard 
            icon={<PieChart className="text-blue-500" />}
            title="Broker Integration"
            description="Seamlessly sync your holdings directly from Angel One with a single click."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400">
          <div className="flex justify-center items-center gap-2 mb-4">
            <LineChart className="w-5 h-5 text-teal-500" />
            <span className="font-bold text-slate-900 dark:text-white">FinDash</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} FinDash. Built with ♥ by Venkatesh.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow">
    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400">{description}</p>
  </div>
);

export default LandingPage;
