import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => (
  <footer className="border-t border-gray-200 dark:border-gray-700 px-8 py-6 mt-auto transition-colors duration-300">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-xs text-gray-400 dark:text-gray-500">© 2026 FinDash. All rights reserved.</p>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> by Venkatesh
      </div>
    </div>
  </footer>
);

export default Footer;
