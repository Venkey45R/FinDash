const cron = require('node-cron');
const { syncAllAssetPrices, processDailySips } = require('./priceService');
const { recordAllUsersDailyNetWorthSnapshot } = require('./netWorthService');
const SyncMeta = require('../models/SyncMeta');

// ─── In-memory cache (used while DB is not yet connected) ───
let _lastSyncTimestamp = null;
let _lastSyncResult = null;

/**
 * Persist the last sync result to DB so it survives server restarts.
 * Falls back gracefully if DB is unavailable.
 */
async function _persistSyncResult(timestamp, result) {
  _lastSyncTimestamp = timestamp;
  _lastSyncResult = result;
  try {
    await SyncMeta.findOneAndUpdate(
      { key: 'global' },
      { lastSyncTimestamp: timestamp, lastSyncResult: result },
      { upsert: true, new: true }
    );
  } catch (e) {
    console.warn('[SchedulerService] Could not persist sync meta to DB:', e.message);
  }
}

/**
 * Load the last sync timestamp from DB (called once on startup).
 * Populates the in-memory cache so getSyncStatus() works immediately.
 */
async function _loadPersistedSyncMeta() {
  try {
    const meta = await SyncMeta.findOne({ key: 'global' });
    if (meta?.lastSyncTimestamp) {
      _lastSyncTimestamp = new Date(meta.lastSyncTimestamp);
      _lastSyncResult = meta.lastSyncResult || null;
      console.log(`[SchedulerService] Loaded persisted lastSync: ${_lastSyncTimestamp.toISOString()}`);
    }
  } catch (e) {
    console.warn('[SchedulerService] Could not load persisted sync meta:', e.message);
  }
}

const mongoose = require('mongoose');

let _schedulerInitialized = false;

/**
 * Initialize daily schedulers:
 *   - 3:45 PM IST: Sync market prices & NAVs for holdings/investments
 *   - 4:00 PM IST: Record daily net worth snapshot (uses freshly synced prices)
 */
function initPriceScheduler() {
  if (_schedulerInitialized) {
    return;
  }
  _schedulerInitialized = true;
  console.log('[SchedulerService] Initializing daily schedulers (3:45 PM IST price sync + 4:00 PM IST net worth snapshot)...');

  const runStartupTasks = async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await _loadPersistedSyncMeta();
        await recordAllUsersDailyNetWorthSnapshot();
      }
    } catch (e) {
      console.warn('[SchedulerService] Initial startup tasks deferred:', e.message);
    }
  };

  // Run on startup or when DB connects
  setTimeout(runStartupTasks, 2000);
  if (mongoose.connection.readyState !== 1) {
    mongoose.connection.once('connected', () => {
      console.log('[SchedulerService] MongoDB connected. Running deferred startup tasks...');
      setTimeout(runStartupTasks, 1000);
    });
  }

  // ─── 3:45 PM IST — Sync market prices & NAVs ───
  cron.schedule(
    '45 15 * * *',
    async () => {
      console.log(`[SchedulerService] 3:45 PM IST triggered. Running daily price sync on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}...`);
      try {
        const result = await syncAllAssetPrices();
        await processDailySips(); // Automatically invest SIP amounts if it's the right day
        await _persistSyncResult(new Date(), result);
        console.log(`[SchedulerService] 3:45 PM price sync succeeded. Updated ${result.totalUpdated} holdings.`);
      } catch (err) {
        console.error('[SchedulerService] Error running 3:45 PM price sync:', err);
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );

  // ─── 4:00 PM IST — Record net worth snapshot (uses freshly synced prices) ───
  cron.schedule(
    '0 16 * * *',
    async () => {
      console.log(`[SchedulerService] 4:00 PM IST triggered. Recording daily net worth snapshot on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}...`);
      try {
        await recordAllUsersDailyNetWorthSnapshot();
        console.log('[SchedulerService] 4:00 PM net worth snapshot recorded successfully.');
      } catch (err) {
        console.error('[SchedulerService] Error recording 4:00 PM net worth snapshot:', err);
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );

  console.log('[SchedulerService] Daily schedulers active: 3:45 PM (prices) + 4:00 PM (net worth).');
}

/**
 * Manual trigger helper
 */
async function triggerManualSync(userId = null) {
  const { recordDailyNetWorthSnapshot } = require('./netWorthService');
  const result = await syncAllAssetPrices();
  await processDailySips();
  const now = new Date();
  await _persistSyncResult(now, result);
  if (userId) {
    await recordDailyNetWorthSnapshot(userId);
  } else {
    await recordAllUsersDailyNetWorthSnapshot();
  }
  return result;
}

/**
 * Get current sync status with robust UTC-based next sync calculation (immune to server locale/DST bugs).
 * 3:45 PM IST is exactly 10:15:00 UTC every day.
 */
function getSyncStatus() {
  const now = new Date();
  const todayTargetUtc = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    10, 15, 0, 0
  ));

  const nextSyncUtc = now.getTime() >= todayTargetUtc.getTime()
    ? new Date(todayTargetUtc.getTime() + 24 * 60 * 60 * 1000)
    : todayTargetUtc;

  return {
    lastSync: _lastSyncTimestamp ? _lastSyncTimestamp.toISOString() : null,
    nextScheduledSync: nextSyncUtc.toISOString(),
    lastResult: _lastSyncResult,
    schedule: 'Daily at 3:45 PM IST (prices) + 4:00 PM IST (net worth)',
  };
}

module.exports = {
  initPriceScheduler,
  triggerManualSync,
  getSyncStatus,
};
