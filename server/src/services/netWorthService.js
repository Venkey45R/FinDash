const User = require('../models/User');
const AssetCategory = require('../models/AssetCategory');
const LiabilityCategory = require('../models/LiabilityCategory');
const NetWorthHistory = require('../models/NetWorthHistory');

/**
 * Get current date string in IST (Asia/Kolkata), e.g. "2026-08-15"
 */
function getTodayISTString() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // "YYYY-MM-DD"
}

/**
 * Get display label for chart, e.g. "15 Aug"
 */
function getTodayDisplayLabel() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
  });
  return formatter.format(now); // e.g. "15 Aug"
}

/**
 * Calculate user's current net worth from active asset & liability categories
 */
async function calculateUserNetWorth(userId = null) {
  let user = null;
  if (userId) {
    user = await User.findById(userId);
  } else {
    user = await User.findOne();
  }

  if (!user) {
    return {
      userId: null,
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
    };
  }

  // Calculate Total Assets
  const assetCategories = await AssetCategory.find({ userId: user._id });
  let totalAssets = 0;
  for (const cat of assetCategories) {
    for (const entry of cat.entries || []) {
      const val = Number(entry.currentValue) || Number(entry.investedAmount) || 0;
      totalAssets += val;
    }
  }

  // Calculate Total Liabilities
  const liabilityCategories = await LiabilityCategory.find({ userId: user._id });
  let totalLiabilities = 0;
  for (const cat of liabilityCategories) {
    for (const entry of cat.entries || []) {
      const debt = Number(entry.outstandingAmount) || Number(entry.originalAmount) || 0;
      totalLiabilities += debt;
    }
  }

  const netWorth = parseFloat((totalAssets - totalLiabilities).toFixed(2));
  totalAssets = parseFloat(totalAssets.toFixed(2));
  totalLiabilities = parseFloat(totalLiabilities.toFixed(2));

  return {
    userId: user._id,
    totalAssets,
    totalLiabilities,
    netWorth,
  };
}

/**
 * Record or update daily snapshot for today (triggered at 4:00 PM cron or upon first check)
 */
async function recordDailyNetWorthSnapshot(userId = null) {
  try {
    const { userId: uid, totalAssets, totalLiabilities, netWorth } = await calculateUserNetWorth(userId);
    if (!uid) return null;

    const dateString = getTodayISTString();
    const displayLabel = getTodayDisplayLabel();

    const snapshot = await NetWorthHistory.findOneAndUpdate(
      { userId: uid, dateString },
      {
        userId: uid,
        dateString,
        month: displayLabel,
        netWorth,
        totalAssets,
        totalLiabilities,
        recordedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log(`[NetWorthService] Recorded daily snapshot for ${dateString} (${displayLabel}): Net Worth = ₹${netWorth.toLocaleString('en-IN')}`);
    return snapshot;
  } catch (err) {
    console.error('[NetWorthService] Error recording daily snapshot:', err.message);
    return null;
  }
}

/**
 * Fetch net worth history time series starting from today
 */
async function getNetWorthHistory(userId = null) {
  let user = null;
  if (userId) {
    user = await User.findById(userId);
  } else {
    user = await User.findOne();
  }

  if (!user) return [];

  let history = await NetWorthHistory.find({ userId: user._id })
    .sort({ dateString: 1 })
    .select('dateString month netWorth totalAssets totalLiabilities recordedAt -_id');

  // If no snapshots recorded yet, record today's initial snapshot immediately
  if (!history || history.length === 0) {
    const initial = await recordDailyNetWorthSnapshot(user._id);
    if (initial) {
      history = [
        {
          dateString: initial.dateString,
          month: initial.month,
          netWorth: initial.netWorth,
          totalAssets: initial.totalAssets,
          totalLiabilities: initial.totalLiabilities,
          recordedAt: initial.recordedAt,
        },
      ];
    }
  }

  return history;
}

module.exports = {
  calculateUserNetWorth,
  recordDailyNetWorthSnapshot,
  getNetWorthHistory,
};
