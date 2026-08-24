const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  amount: { type: Number, default: 0, required: true },
  monthlyTracking: [
    {
      month: { type: String, required: true }, // e.g., "Jan 2026"
      isMet: { type: Boolean, default: false },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
