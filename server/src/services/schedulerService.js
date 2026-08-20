const cron = require('node-cron');
const { syncAllAssetPrices } = require('./priceService');
const { recordDailyNetWorthSnapshot } = require('./netWorthService');

let lastSyncTimestamp = null;
let lastSyncResult = null;

/**
 * Initialize daily 4:00 PM (16:00 IST) Cron Scheduler
 */
function initPriceScheduler() {
  console.log('[SchedulerService] Initializing Daily 4:00 PM IST Market Price & Net Worth Scheduler...');

  // Ensure today's baseline snapshot exists starting from today
  setTimeout(async () => {
    try {
      await recordDailyNetWorthSnapshot();
    } catch (e) {
      console.warn('[SchedulerService] Initial net worth snapshot recording deferred:', e.message);
    }
  }, 2000);

  // Schedule to run every day at 16:00 (4:00 PM) in Asia/Kolkata timezone
  // Format: minute hour day-of-month month day-of-week
  cron.schedule(
    '0 16 * * *',
    async () => {
      console.log(`[SchedulerService] 4:00 PM IST triggered. Running daily price sync & net worth snapshot on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}...`);
      try {
        const result = await syncAllAssetPrices();
        lastSyncTimestamp = new Date();
        lastSyncResult = result;
        console.log(`[SchedulerService] Daily 4:00 PM price sync succeeded. Updated ${result.totalUpdated} holdings.`);

        // Record updated daily Net Worth in DB
        await recordDailyNetWorthSnapshot();
      } catch (err) {
        console.error('[SchedulerService] Error running scheduled price sync & net worth snapshot:', err);
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );

  console.log('[SchedulerService] Daily 4:00 PM IST Market Price & Net Worth Scheduler active.');
}

/**
 * Manual trigger helper
 */
async function triggerManualSync() {
  const result = await syncAllAssetPrices();
  lastSyncTimestamp = new Date();
  lastSyncResult = result;
  await recordDailyNetWorthSnapshot();
  return result;
}

/**
 * Get current sync status with IST-aware next sync calculation.
 */
function getSyncStatus() {
  // Calculate next 4:00 PM IST using IST-aware date math
  const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const next4PM = new Date(nowIST);
  next4PM.setHours(16, 0, 0, 0);
  if (nowIST.getHours() >= 16) {
    next4PM.setDate(next4PM.getDate() + 1);
  }

  // Convert back to a proper ISO timestamp by computing IST offset (UTC+5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const next4PMUtc = new Date(next4PM.getTime() - istOffsetMs + (new Date().getTimezoneOffset() * 60 * 1000));

  return {
    lastSync: lastSyncTimestamp || null,
    nextScheduledSync: next4PMUtc.toISOString(),
    lastResult: lastSyncResult,
    schedule: 'Daily at 4:00 PM IST',
  };
}

module.exports = {
  initPriceScheduler,
  triggerManualSync,
  getSyncStatus,
};
