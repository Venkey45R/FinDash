const mongoose = require('mongoose');

const liabilityEntrySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  originalAmount: { type: Number, default: 0 },
  outstandingAmount: { type: Number, default: 0 },
  emi: { type: Number, default: 0 },
  interestRate: { type: Number, default: 0 },
}, { timestamps: true });

const liabilityCategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: 'CreditCard' },
  color: { type: String, default: 'bg-rose-500' },
  order: { type: Number, default: 0 },
  entries: [liabilityEntrySchema],
}, { timestamps: true });

module.exports = mongoose.model('LiabilityCategory', liabilityCategorySchema);
