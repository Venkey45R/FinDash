const mongoose = require('mongoose');
const { getSingleUserId } = require('../utils/singleUser');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

transactionSchema.pre('validate', async function() {
  if (!this.userId) {
    this.userId = await getSingleUserId();
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
