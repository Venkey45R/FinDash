const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const { getNetWorthHistory } = require('../services/netWorthService');
const { getSingleUserId } = require('../utils/singleUser');

// ─── Benchmark Index Config ───────────────────────────────────────────────────
const BENCHMARK_INDICES = {
  NIFTY50: { symbol: '^NSEI', label: 'Nifty 50' },
  NIFTY500: { symbol: '^CRSLDX', label: 'Nifty 500' },
  SENSEX: { symbol: '^BSESN', label: 'Sensex' },
};

/**
 * Fetch historical daily closing prices for a Yahoo Finance symbol.
 * Returns array of { dateString, close } sorted ascending.
 */
async function fetchYahooHistory(symbol, period1Unix, period2Unix) {
  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&period1=${period1Unix}&period2=${period2Unix}&events=history`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  });

  if (!res.ok) return [];

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) return [];

  const timestamps = result.timestamp || [];
  const closes = result.indicators?.quote?.[0]?.close || [];

  const points = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close == null || isNaN(close)) continue;
    const dateString = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
    points.push({ dateString, close: parseFloat(close.toFixed(2)) });
  }

  // Deduplicate by dateString (keep last for each date)
  const map = new Map();
  for (const p of points) map.set(p.dateString, p);
  return Array.from(map.values()).sort((a, b) => a.dateString.localeCompare(b.dateString));
}

// GET /api/dashboard/user — Return the single user's profile
router.get('/user', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database disconnected' });
    }
    const uid = req.userId || (await getSingleUserId());
    let user = null;
    if (uid) {
      user = await User.findById(uid).select('name email avatar isOnboarded');
    }
    if (!user) {
      user = await User.findOne({}).select('name email avatar isOnboarded');
    }
    if (!user) {
      return res.json({ name: 'User', email: '', avatar: null, isOnboarded: true });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/dashboard/networth-history — Net worth time series
router.get('/networth-history', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const uid = req.userId || (await getSingleUserId());
    let targetUserId = uid;
    if (!targetUserId) {
      const user = await User.findOne({});
      targetUserId = user?._id;
    }
    if (!targetUserId) return res.json([]);
    const history = await getNetWorthHistory(targetUserId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching net worth history:', error.message);
    res.json([]);
  }
});

// GET /api/dashboard/benchmark-history — Index historical data for benchmark overlay
// Query params:
//   index: NIFTY50 | NIFTY500 | SENSEX  (required)
//   from:  YYYY-MM-DD start date         (optional, defaults to 5 years ago)
//   to:    YYYY-MM-DD end date           (optional, defaults to today)
router.get('/benchmark-history', async (req, res) => {
  try {
    const { index = 'NIFTY50', from, to } = req.query;
    const cfg = BENCHMARK_INDICES[index.toUpperCase()];
    if (!cfg) {
      return res.status(400).json({ error: `Unknown index. Valid values: ${Object.keys(BENCHMARK_INDICES).join(', ')}` });
    }

    // Build unix timestamps
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from ? new Date(from) : new Date(toDate.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);

    const period1 = Math.floor(fromDate.getTime() / 1000);
    const period2 = Math.floor(toDate.getTime() / 1000) + 86400; // include today

    const history = await fetchYahooHistory(cfg.symbol, period1, period2);

    // Build response: raw close + normalised gain % from first available point
    const baseClose = history.length > 0 ? history[0].close : null;
    const points = history.map((p) => ({
      dateString: p.dateString,
      close: p.close,
      // percentage gain relative to the first data point
      gainPct: baseClose && baseClose > 0 ? parseFloat((((p.close - baseClose) / baseClose) * 100).toFixed(2)) : 0,
    }));

    res.json({ index, label: cfg.label, symbol: cfg.symbol, baseClose, data: points });
  } catch (error) {
    console.error('Error fetching benchmark history:', error.message);
    res.status(500).json({ error: 'Failed to fetch benchmark history' });
  }
});

module.exports = router;
