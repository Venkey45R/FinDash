const mongoose = require('mongoose');

/**
 * SyncMeta — singleton document to persist the last price-sync timestamp
 * across server restarts. Only one document (key: 'global') is ever created.
 */
const syncMetaSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  lastSyncTimestamp: { type: Date, default: null },
  lastSyncResult: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: false });

module.exports = mongoose.model('SyncMeta', syncMetaSchema);
