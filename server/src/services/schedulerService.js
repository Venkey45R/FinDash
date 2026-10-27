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

/**
 * Initialize daily schedulers:
 *   - 3:45 PM IST: Sync market prices & NAVs for holdings/investments
 *   - 4:00 PM IST: Record daily net worth snapshot (uses freshly synced prices)
 */
function initPriceScheduler() {
  console.log('[SchedulerService] Initializing daily schedulers (3:45 PM price sync + 4:00 PM net worth snapshot)...');

  // Ensure today's baseline snapshot exists on startup + load persisted sync meta
  setTimeout(async () => {
    try {
      await _loadPersistedSyncMeta();
      await recordAllUsersDailyNetWorthSnapshot();
    } catch (e) {
      console.warn('[SchedulerService] Initial startup tasks deferred:', e.message);
    }
  }, 2000);

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
 * Get current sync status with IST-aware next sync calculation.
 */
function getSyncStatus() {
  // Calculate next 3:45 PM IST for price sync
  const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const next345PM = new Date(nowIST);
  next345PM.setHours(15, 45, 0, 0);
  if (nowIST.getHours() > 15 || (nowIST.getHours() === 15 && nowIST.getMinutes() >= 45)) {
    next345PM.setDate(next345PM.getDate() + 1);
  }

  // Convert back to a proper ISO timestamp by computing IST offset (UTC+5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const next345PMUtc = new Date(next345PM.getTime() - istOffsetMs + (new Date().getTimezoneOffset() * 60 * 1000));

  return {
    lastSync: _lastSyncTimestamp ? _lastSyncTimestamp.toISOString() : null,
    nextScheduledSync: next345PMUtc.toISOString(),
    lastResult: _lastSyncResult,
    schedule: 'Daily at 3:45 PM IST (prices) + 4:00 PM IST (net worth)',
  };
}

module.exports = {
  initPriceScheduler,
  triggerManualSync,
  getSyncStatus,
};
