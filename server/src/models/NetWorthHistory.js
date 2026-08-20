const mongoose = require('mongoose');

const netWorthHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dateString: {
      type: String, // e.g. '2026-08-15'
      required: true,
      index: true,
    },
    month: {
      type: String, // Chart display label, e.g. '15 Aug' or 'Aug 2026'
      required: true,
      trim: true,
    },
    netWorth: {
      type: Number,
      required: true,
    },
    totalAssets: {
      type: Number,
      default: 0,
    },
    totalLiabilities: {
      type: Number,
      default: 0,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure exactly one snapshot per user per day
netWorthHistorySchema.index({ userId: 1, dateString: 1 }, { unique: true });

// TTL index: automatically delete records older than 2 years (730 days)
// MongoDB TTL monitor runs every 60 seconds and removes expired documents
netWorthHistorySchema.index({ recordedAt: 1 }, { expireAfterSeconds: 730 * 24 * 60 * 60 });

module.exports = mongoose.model('NetWorthHistory', netWorthHistorySchema);
