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
