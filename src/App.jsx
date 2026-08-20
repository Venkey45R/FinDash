import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Header from './components/Header.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import NetWorthChart from './components/NetWorthChart.jsx';
import PortfolioView from './components/PortfolioView.jsx';
import HoldingsView from './components/HoldingsView.jsx';
import LiabilitiesView from './components/LiabilitiesView.jsx';
import Footer from './components/Footer.jsx';
import { FinanceProvider, useFinance } from './context/FinanceContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import SkeletonLoader from './components/SkeletonLoader.jsx';
import AIAdvisorView from './components/AIAdvisorView.jsx';
import AIChatSidebar from './components/AIChatSidebar.jsx';
import { MessageSquare, Sparkles, X } from 'lucide-react';

const getFormattedDate = () => {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const DashboardContent = () => {
  const { loading, error } = useFinance();
  const [chatOpen, setChatOpen] = React.useState(false);
  const [advisorOpen, setAdvisorOpen] = React.useState(false);

  const sidebarOpen = chatOpen || advisorOpen;

  // Lock body scroll when any sidebar is open; restore on close
  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen]);

  if (loading) {
    return (
      <>
        <Header />
        <SkeletonLoader />
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="px-4 sm:px-8 py-6 flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-red-500 font-medium">Failed to load dashboard data</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm font-medium text-teal-600 dark:text-teal-400 border border-teal-600 dark:border-teal-400 rounded-lg px-4 py-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className={`w-full flex bg-[#f8f9fc] dark:bg-[#0f172a] ${sidebarOpen ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <div id="dashboard-scroll-container" className={`flex flex-col flex-1 bg-white dark:bg-[#1e293b] transition-all duration-300 ${sidebarOpen ? 'h-full overflow-y-auto' : ''} ${advisorOpen ? 'md:mr-[600px] lg:mr-[800px]' : chatOpen ? 'md:mr-[500px]' : 'max-w-[1280px] mx-auto w-full shadow-sm'}`}>
        <Header />
        <main className="px-4 sm:px-8 py-6 flex-1">
        <div id="overview">
          {/* Dashboard Overview Header */}
          <div className="flex items-end justify-between mb-6">
            <div className='flex justify-between items-center w-full'>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Dashboard Overview</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{getFormattedDate()}</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-8">
            <SummaryCards />
          </div>

          {/* Net Worth Trend Chart */}
          <div className="mb-8">
            <NetWorthChart />
          </div>
        </div>

        {/* Portfolio Performance */}
        <div id="portfolio" className="mb-8">
          <PortfolioView />
        </div>

        {/* Holdings View (Assets) */}
        <div id="holdings" className="mb-8">
          <HoldingsView />
        </div>

        {/* Liabilities View */}
        <div id="liabilities" className="mb-8">
          <LiabilitiesView />
        </div>
      </main>

      {/* Floating Actions */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
        {/* Insight Report Floater */}
        <button
          onClick={() => setAdvisorOpen(true)}
          className={`group relative p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.3)] rounded-full transition-all duration-300 hover:-translate-y-1 overflow-hidden ${advisorOpen ? 'hidden' : 'flex'} items-center justify-center`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400 relative z-10" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl transform translate-x-2 group-hover:translate-x-0">
            AI Portfolio Insights
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900 dark:border-l-white" />
          </div>
        </button>

        {/* Chat Floater */}
        <button
          onClick={() => setChatOpen(true)}
          className={`group relative p-4 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-[0_8px_30px_rgba(16,185,129,0.4)] rounded-full transition-all duration-300 hover:-translate-y-1 ${chatOpen ? 'hidden' : 'flex'} items-center justify-center`}
        >
          <MessageSquare className="w-6 h-6 text-white" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl transform translate-x-2 group-hover:translate-x-0">
            AI Assistant Chat
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900 dark:border-l-white" />
          </div>
        </button>
      </div>

      {/* AI Advisor Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] lg:w-[800px] bg-slate-50 dark:bg-slate-950 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 transition-transform transform duration-300 ${advisorOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" /> FinDash Analysis
          </h2>
          <button onClick={() => setAdvisorOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AIAdvisorView />
        </div>
      </div>
      
      {/* Backdrop for Advisor Sidebar */}
      {advisorOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 md:hidden" onClick={() => setAdvisorOpen(false)} />
      )}

      {/* Backdrop for Chat Sidebar (mobile only) */}
      {chatOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 md:hidden" onClick={() => setChatOpen(false)} />
      )}

      {/* Slide-over Chat Sidebar */}
      <AIChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />

        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <FinanceProvider>
        <DashboardContent />
      </FinanceProvider>
    </ErrorBoundary>
  );
}

export default App;
