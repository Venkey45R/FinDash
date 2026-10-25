/**
 * Shared formatting and icon utilities for FinDash.
 * Centralizes duplicated helpers used across 11+ component files.
 */

import {
  Home,
  Car,
  GraduationCap,
  CreditCard,
  Landmark,
} from 'lucide-react';

/**
 * Format a number as Indian Rupees (₹) with locale-aware commas.
 * NaN-safe: handles undefined, null, NaN, non-numeric strings gracefully.
 * @param {number|string} num
 * @returns {string}
 */
export const formatINR = (num) => {
  const parsed = Number(num);
  const safe = isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  return '₹' + safe.toLocaleString('en-IN');
};

/**
 * Get the appropriate Lucide icon component for a liability category name.
 * @param {string} name - Category name
 * @returns {React.ComponentType}
 */
export const getCategoryIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('home') || lower.includes('mortgage') || lower.includes('housing')) {
    return Home;
  }
  if (lower.includes('vehicle') || lower.includes('car') || lower.includes('auto') || lower.includes('bike')) {
    return Car;
  }
  if (lower.includes('personal') || lower.includes('education') || lower.includes('student')) {
    return GraduationCap;
  }
  if (lower.includes('card') || lower.includes('credit')) {
    return CreditCard;
  }
  return Landmark;
};

/**
 * Format a Date to local YYYY-MM-DD string without UTC offset shifting.
 * @param {Date|string|number} date
 * @returns {string} YYYY-MM-DD
 */
export const getLocalDateString = (date = new Date()) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a local YYYY-MM-DD date key into a readable Indian locale date string.
 * @param {string} dateKey - YYYY-MM-DD
 * @returns {string} e.g. "Tue, 20 Oct, 2026"
 */
export const formatLocalDateLabel = (dateKey) => {
  if (!dateKey) return '';
  const parts = String(dateKey).split('T')[0].split('-');
  if (parts.length !== 3) return dateKey;
  const [y, m, d] = parts.map(Number);
  const dateObj = new Date(y, m - 1, d);
  if (isNaN(dateObj.getTime())) return dateKey;
  return dateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

