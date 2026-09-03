const cron = require('node-cron');
const { syncAllAssetPrices, processDailySips } = require('./priceService');
const { recordAllUsersDailyNetWorthSnapshot } = require('./netWorthService');

let lastSyncTimestamp = null;
let lastSyncResult = null;

/**
 * Initialize daily schedulers:
 *   - 3:45 PM IST: Sync market prices & NAVs for holdings/investments
 *   - 4:00 PM IST: Record daily net worth snapshot (uses freshly synced prices)
 */
function initPriceScheduler() {
  console.log('[SchedulerService] Initializing daily schedulers (3:45 PM price sync + 4:00 PM net worth snapshot)...');

  // Ensure today's baseline snapshot exists on startup
  setTimeout(async () => {
    try {
      await recordAllUsersDailyNetWorthSnapshot();
    } catch (e) {
      console.warn('[SchedulerService] Initial net worth snapshot recording deferred:', e.message);
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
        lastSyncTimestamp = new Date();
        lastSyncResult = result;
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
async function triggerManualSync() {
  const result = await syncAllAssetPrices();
  await processDailySips();
  lastSyncTimestamp = new Date();
  lastSyncResult = result;
  await recordAllUsersDailyNetWorthSnapshot();
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
    lastSync: lastSyncTimestamp || null,
    nextScheduledSync: next345PMUtc.toISOString(),
    lastResult: lastSyncResult,
    schedule: 'Daily at 3:45 PM IST (prices) + 4:00 PM IST (net worth)',
  };
}

module.exports = {
  initPriceScheduler,
  triggerManualSync,
  getSyncStatus,
};
