import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useFinance } from '../context/FinanceContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut } from 'lucide-react';

const navLinks = [
  { label: 'Overview', id: 'overview' },
  { label: 'Portfolio', id: 'portfolio' },
  { label: 'Holdings', id: 'holdings' },
  { label: 'Liabilities', id: 'liabilities' },
];

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useFinance();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const isScrolling = React.useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling.current) return;

      const container = document.getElementById('dashboard-scroll-container');
      if (!container) return;

      // Check if we're at the bottom of the page
      const isAtBottom = container.clientHeight + container.scrollTop >= container.scrollHeight - 50;
      if (isAtBottom) {
        setActiveSection(navLinks[navLinks.length - 1].id);
        return;
      }

      // Find the current section using viewport position
      let current = navLinks[0].id;
      for (let i = 0; i < navLinks.length; i++) {
        const section = document.getElementById(navLinks[i].id);
        if (section) {
          const containerRect = container.getBoundingClientRect();
          const rect = section.getBoundingClientRect();
          // Calculate element's top relative to container's top
          const relativeTop = rect.top - containerRect.top;
          
          if (relativeTop <= 300) {
            current = navLinks[i].id;
          }
        }
      }
      setActiveSection(current);
    };

    const container = document.getElementById('dashboard-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      isScrolling.current = true;
      setActiveSection(id);

      const container = document.getElementById('dashboard-scroll-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      const offsetTop = rect.top - containerRect.top + container.scrollTop - 80;
      
      container.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Release scroll lock after animation completes
      setTimeout(() => {
        isScrolling.current = false;
      }, 800);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 sticky top-0 z-50 transition-colors duration-300">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6 lg:gap-10">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Fin Dash</h1>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${activeSection === link.id
                  ? 'text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400'
                  : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Right: Welcome message + Theme toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="hidden sm:inline">Welcome, </span>
          <span className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</span>
        </div>
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-all duration-300 group"
        >
          <Moon className={`w-[18px] h-[18px] text-amber-500 absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
          <Sun className={`w-[18px] h-[18px] text-blue-400 absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
        </button>
        <button
          onClick={logout}
          aria-label="Log out"
          className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-300 group ml-2"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>
      </div>
    </header>
  );
};

export default Header;
