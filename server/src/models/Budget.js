const mongoose = require('mongoose');
const { getSingleUserId } = require('../utils/singleUser');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
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

budgetSchema.pre('validate', async function() {
  if (!this.userId) {
    this.userId = await getSingleUserId();
  }
});

module.exports = mongoose.model('Budget', budgetSchema);
