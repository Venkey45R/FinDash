const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  investedAmount: { type: Number, default: 0 },
  currentValue: { type: Number, default: 0 },
  
  // Instrument & V3 Valuation metadata
  valuationType: {
    type: String,
    enum: ['MARKET', 'MANUAL'],
    default: 'MANUAL',
  },
  subCategory: {
    type: String,
    enum: ['STOCKS', 'MUTUAL_FUNDS', 'ETFS', 'OTHER'],
    default: 'OTHER',
  },
  instrumentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instrument',
    default: null,
  },
  symbol: { type: String, default: '', trim: true },
  exchange: { type: String, default: '', trim: true },
  isin: { type: String, default: '', trim: true },
  plan: { type: String, default: '' },
  
  // Holding metrics
  quantity: { type: Number, default: 0 },
  averageBuyPrice: { type: Number, default: 0 },
  units: { type: Number, default: 0 },
  averageNAV: { type: Number, default: 0 },
  purchaseDate: { type: Date, default: null },

  // Market-derived metrics (populated when market ticks are ingested)
  latestPrice: { type: Number, default: null },
  currentPrice: { type: Number, default: null },
  previousClose: { type: Number, default: null },
  latestNAV: { type: Number, default: null },
  previousNAV: { type: Number, default: null },
  dailyChange: { type: Number, default: null },
  dailyChangePercent: { type: Number, default: null },
  navDate: { type: String, default: '' },
  lastPriceUpdated: { type: Date, default: null },
}, { timestamps: true });

const assetCategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: 'Briefcase' },
  color: { type: String, default: 'bg-teal-500' },
  order: { type: Number, default: 0 },
  entries: [entrySchema],
}, { timestamps: true });

module.exports = mongoose.model('AssetCategory', assetCategorySchema);
