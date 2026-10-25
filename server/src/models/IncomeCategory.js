const mongoose = require('mongoose');
const { getSingleUserId } = require('../utils/singleUser');

const incomeCategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

incomeCategorySchema.pre('validate', async function() {
  if (!this.userId) {
    this.userId = await getSingleUserId();
  }
});

module.exports = mongoose.model('IncomeCategory', incomeCategorySchema);
