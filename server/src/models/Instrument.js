const mongoose = require('mongoose');

const instrumentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['STOCK', 'MUTUAL_FUND', 'ETF', 'OTHER'],
    required: true,
    index: true,
  },
  assetClass: {
    type: String,
    enum: ['EQUITY', 'DEBT', 'COMMODITIES', 'CASH', 'OTHER'],
    default: 'EQUITY',
  },
  subCategory: {
    type: String,
    enum: ['STOCKS', 'MUTUAL_FUNDS', 'ETFS', 'OTHER'],
    default: 'OTHER',
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    index: true,
  },
  exchange: {
    type: String,
    default: 'NSE',
    trim: true,
  },
  isin: {
    type: String,
    default: '',
    trim: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  plan: {
    type: String,
    default: '', // e.g. "Direct · Growth" for Mutual Funds
  },
  sector: {
    type: String,
    default: '',
  },
  // Baseline market price/NAV references for future live tick integration
  latestPrice: {
    type: Number,
    default: null,
  },
  previousClose: {
    type: Number,
    default: null,
  },
  latestNAV: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

// Index for fast full-text searching
instrumentSchema.index({ name: 'text', symbol: 'text', isin: 'text' });

module.exports = mongoose.model('Instrument', instrumentSchema);
