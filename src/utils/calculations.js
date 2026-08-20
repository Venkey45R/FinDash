/**
 * Pure calculation utilities for the finance dashboard.
 * All functions handle null/undefined/empty gracefully and return 0 as default.
 */

/**
 * Get the current market value of an entry.
 */
export const getEntryValue = (entry) => {
  if (entry?.currentValue !== undefined && entry?.currentValue !== null && !isNaN(entry.currentValue) && Number(entry.currentValue) > 0) {
    return Number(entry.currentValue);
  }
  if (entry?.quantity && entry?.averageBuyPrice) {
    return Number(entry.quantity) * Number(entry.averageBuyPrice);
  }
  if (entry?.units && entry?.averageNAV) {
    return Number(entry.units) * Number(entry.averageNAV);
  }
  return Number(entry?.investedAmount) || 0;
};

/**
 * Get the invested (cost) value of an entry.
 */
export const getEntryInvested = (entry) => {
  if (entry?.investedAmount !== undefined && entry?.investedAmount !== null && !isNaN(entry.investedAmount) && Number(entry.investedAmount) > 0) {
    return Number(entry.investedAmount);
  }
  if (entry?.quantity && entry?.averageBuyPrice) {
    return Number(entry.quantity) * Number(entry.averageBuyPrice);
  }
  if (entry?.units && entry?.averageNAV) {
    return Number(entry.units) * Number(entry.averageNAV);
  }
  return Number(entry?.currentValue) || 0;
};

/**
 * Calculate gain/loss for an entry (absolute and percentage).
 */
export const calculateGainLoss = (entry) => {
  const current = getEntryValue(entry);
  const invested = getEntryInvested(entry);
  const amount = current - invested;
  const percentage = invested !== 0 ? (amount / invested) * 100 : 0;
  return { amount, percentage: parseFloat(percentage.toFixed(2)) };
};

/**
 * Sum all entries in a category (current value).
 */
export const calculateCategoryTotal = (category) => {
  if (!category?.entries?.length) return 0;
  return category.entries.reduce((sum, entry) => sum + getEntryValue(entry), 0);
};

/**
 * Sum all entries in a category (invested amount).
 */
export const calculateCategoryInvested = (category) => {
  if (!category?.entries?.length) return 0;
  return category.entries.reduce((sum, entry) => sum + getEntryInvested(entry), 0);
};

/**
 * Grand total of all asset categories.
 */
export const calculateTotalAssets = (assetCategories) => {
  if (!assetCategories?.length) return 0;
  return assetCategories.reduce((sum, cat) => sum + calculateCategoryTotal(cat), 0);
};

/**
 * Net worth = total assets - total liabilities.
 */
export const calculateNetWorth = (assetCategories, liabilityCategories = []) => {
  return calculateTotalAssets(assetCategories) - calculateTotalLiabilities(liabilityCategories);
};

/**
 * Breakdown of assets by category for charts and portfolio view.
 */
export const getAssetBreakdown = (assetCategories) => {
  if (!assetCategories?.length) return [];
  const total = calculateTotalAssets(assetCategories);
  return assetCategories.map((cat) => {
    const value = calculateCategoryTotal(cat);
    const investedValue = calculateCategoryInvested(cat);
    const gainLoss = value - investedValue;
    const gainLossPct = investedValue !== 0 ? (gainLoss / investedValue) * 100 : 0;

    return {
      categoryId: cat._id,
      name: cat.name,
      value,
      investedValue,
      gainLoss,
      gainLossPct: parseFloat(gainLossPct.toFixed(2)),
      percentage: total > 0 ? parseFloat(((value / total) * 100).toFixed(2)) : 0,
      color: cat.color || 'bg-gray-500',
    };
  }).filter((item) => item.value > 0 || item.investedValue > 0);
};

/**
 * ─── LIABILITY CALCULATIONS ───
 */

export const getLiabilityOutstanding = (entry) => {
  return entry?.outstandingAmount ?? entry?.currentValue ?? 0;
};

export const getLiabilityOriginal = (entry) => {
  return entry?.originalAmount ?? entry?.investedAmount ?? 0;
};

export const getLiabilityEmi = (entry) => {
  return entry?.emi ?? 0;
};

export const calculateCategoryLiabilityTotal = (category) => {
  if (!category?.entries?.length) return 0;
  return category.entries.reduce((sum, entry) => sum + getLiabilityOutstanding(entry), 0);
};

export const calculateCategoryLiabilityOriginalTotal = (category) => {
  if (!category?.entries?.length) return 0;
  return category.entries.reduce((sum, entry) => sum + getLiabilityOriginal(entry), 0);
};

export const calculateCategoryLiabilityEmiTotal = (category) => {
  if (!category?.entries?.length) return 0;
  return category.entries.reduce((sum, entry) => sum + getLiabilityEmi(entry), 0);
};

export const calculateTotalLiabilities = (liabilityCategories) => {
  if (!liabilityCategories?.length) return 0;
  return liabilityCategories.reduce((sum, cat) => sum + calculateCategoryLiabilityTotal(cat), 0);
};

export const calculateTotalOriginalDebt = (liabilityCategories) => {
  if (!liabilityCategories?.length) return 0;
  return liabilityCategories.reduce((sum, cat) => sum + calculateCategoryLiabilityOriginalTotal(cat), 0);
};

export const calculateTotalMonthlyEmi = (liabilityCategories) => {
  if (!liabilityCategories?.length) return 0;
  return liabilityCategories.reduce((sum, cat) => sum + calculateCategoryLiabilityEmiTotal(cat), 0);
};

export const getDebtToAssetRatio = (totalAssets, totalLiabilities) => {
  if (!totalLiabilities || totalLiabilities <= 0) return 0;
  if (!totalAssets || totalAssets <= 0) return 100;
  return parseFloat(((totalLiabilities / totalAssets) * 100).toFixed(1));
};

export const getLiabilityBreakdown = (liabilityCategories) => {
  if (!liabilityCategories?.length) return [];
  const total = calculateTotalLiabilities(liabilityCategories);
  return liabilityCategories.map((cat) => {
    const outstanding = calculateCategoryLiabilityTotal(cat);
    const original = calculateCategoryLiabilityOriginalTotal(cat);
    const emi = calculateCategoryLiabilityEmiTotal(cat);

    return {
      categoryId: cat._id,
      name: cat.name,
      outstanding,
      original,
      emi,
      count: cat.entries?.length || 0,
      percentage: total > 0 ? parseFloat(((outstanding / total) * 100).toFixed(1)) : 0,
      color: cat.color || 'bg-rose-500',
    };
  }).filter((item) => item.outstanding > 0 || item.original > 0 || item.count > 0);
};

/**
 * Group entries of a category.
 * For Domestic Equity: groups into Stocks, Mutual Funds, ETFs, and Other.
 * For all other categories (Debt, Gold, Cash, Foreign, Real Estate, etc.): returns distinct named holding rows.
 */
export const groupCategoryEntries = (entries = [], categoryName = '') => {
  const isDomestic = (categoryName || '').toLowerCase().includes('dom');

  if (isDomestic) {
    const groups = {
      STOCKS: { key: 'STOCKS', label: 'Stocks', icon: 'STOCKS', entries: [], total: 0, invested: 0 },
      MUTUAL_FUNDS: { key: 'MUTUAL_FUNDS', label: 'Mutual Funds', icon: 'MUTUAL_FUNDS', entries: [], total: 0, invested: 0 },
      ETFS: { key: 'ETFS', label: 'ETFs', icon: 'ETFS', entries: [], total: 0, invested: 0 },
      OTHER: { key: 'OTHER', label: 'Other Equities', icon: 'OTHER', entries: [], total: 0, invested: 0 },
    };

    for (const entry of entries) {
      let subCat = (entry.subCategory || '').toUpperCase();
      if (!groups[subCat]) {
        if (entry.quantity > 0 && entry.averageBuyPrice > 0) subCat = 'STOCKS';
        else if (entry.units > 0 && entry.averageNAV > 0) subCat = 'MUTUAL_FUNDS';
        else subCat = 'OTHER';
      }
      const targetGroup = groups[subCat] || groups.OTHER;
      targetGroup.entries.push(entry);
      targetGroup.total += getEntryValue(entry);
      targetGroup.invested += getEntryInvested(entry);
    }

    return Object.values(groups).filter((g) => g.entries.length > 0);
  }

  // Non-Domestic categories: render each distinct holding with its actual name & category-specific icon
  return entries.map((entry) => {
    const val = getEntryValue(entry);
    const inv = getEntryInvested(entry);
    const nameLower = (entry.name || '').toLowerCase();
    const catLower = (categoryName || '').toLowerCase();

    let iconKey = 'OTHER';
    if (nameLower.includes('gold') || nameLower.includes('silver') || nameLower.includes('sgb') || nameLower.includes('metal') || catLower.includes('gold')) {
      iconKey = 'GOLD';
    } else if (nameLower.includes('epf') || nameLower.includes('ppf') || nameLower.includes('fd') || nameLower.includes('bond') || nameLower.includes('debt') || nameLower.includes('nps') || catLower.includes('debt')) {
      iconKey = 'DEBT';
    } else if (nameLower.includes('cash') || nameLower.includes('saving') || nameLower.includes('bank') || nameLower.includes('account') || catLower.includes('cash')) {
      iconKey = 'CASH';
    } else if (nameLower.includes('us') || nameLower.includes('global') || nameLower.includes('foreign') || nameLower.includes('international') || nameLower.includes('nasdaq') || catLower.includes('foreign')) {
      iconKey = 'FOREIGN';
    } else if (nameLower.includes('property') || nameLower.includes('land') || nameLower.includes('real estate') || nameLower.includes('house') || catLower.includes('real estate')) {
      iconKey = 'REAL_ESTATE';
    } else if (entry.subCategory === 'STOCKS') {
      iconKey = 'STOCKS';
    } else if (entry.subCategory === 'MUTUAL_FUNDS') {
      iconKey = 'MUTUAL_FUNDS';
    } else if (entry.subCategory === 'ETFS') {
      iconKey = 'ETFS';
    }

    return {
      key: entry._id || entry.name,
      label: entry.name,
      icon: iconKey,
      entries: [entry],
      total: val,
      invested: inv,
      isDirectEntry: true,
      entry: entry,
    };
  });
};

