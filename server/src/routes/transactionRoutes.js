const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const IncomeCategory = require('../models/IncomeCategory');
const { getSingleUserId } = require('../utils/singleUser');

// --- Transactions ---

// Get total transaction balance (income - expense)
router.get('/balance', async (req, res) => {
  try {
    const userId = req.userId || (await getSingleUserId());
    const matchStage = userId ? [{ $match: { userId: new mongoose.Types.ObjectId(userId) } }] : [];

    const balanceResult = await Transaction.aggregate([
      ...matchStage,
      { 
        $group: { 
          _id: null, 
          balance: { 
            $sum: { 
              $cond: [{ $eq: ["$type", "income"] }, "$amount", { $multiply: ["$amount", -1] }] 
            } 
          } 
        } 
      }
    ]);

    const totalBalance = balanceResult.length > 0 ? balanceResult[0].balance : 0;
    res.json({ totalBalance });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching balance' });
  }
});

// Get all transactions (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const userId = req.userId || (await getSingleUserId());
    const filter = userId ? { userId } : {};
    const matchStage = userId ? [{ $match: { userId: new mongoose.Types.ObjectId(userId) } }] : [];

    const [transactions, total, balanceResult] = await Promise.all([
      Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(filter),
      Transaction.aggregate([
        ...matchStage,
        { 
          $group: { 
            _id: null, 
            balance: { 
              $sum: { 
                $cond: [{ $eq: ["$type", "income"] }, "$amount", { $multiply: ["$amount", -1] }] 
              } 
            } 
          } 
        }
      ])
    ]);

    const totalBalance = balanceResult.length > 0 ? balanceResult[0].balance : 0;

    res.json({
      data: transactions,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching transactions' });
  }
});

// Add a transaction
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, date } = req.body;
    
    if (!type || !category) {
      return res.status(400).json({ message: 'Please provide type and category' });
    }
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const userId = req.userId || (await getSingleUserId());

    const transaction = new Transaction({
      userId,
      type,
      amount: numAmount,
      category,
      date: date || Date.now()
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error adding transaction:', error.message);
    res.status(500).json({ message: 'Server Error adding transaction' });
  }
});

// Update a transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { amount, category, date } = req.body;
    if (amount) transaction.amount = amount;
    if (category) transaction.category = category;
    if (date) transaction.date = date;

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating transaction' });
  }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting transaction' });
  }
});

// --- Income Categories ---

// Get all income categories
router.get('/income-categories', async (req, res) => {
  try {
    const userId = req.userId || (await getSingleUserId());
    const filter = userId ? { userId } : {};
    const categories = await IncomeCategory.find(filter);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching income categories' });
  }
});

// Add an income category
router.post('/income-categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });

    const userId = req.userId || (await getSingleUserId());

    const category = new IncomeCategory({
      userId,
      name: name.trim()
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error adding income category:', error.message);
    res.status(500).json({ message: 'Server Error adding income category' });
  }
});

// Update an income category
router.put('/income-categories/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });

    const category = await IncomeCategory.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating income category' });
  }
});

// Delete an income category
router.delete('/income-categories/:id', async (req, res) => {
  try {
    const category = await IncomeCategory.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting income category' });
  }
});

module.exports = router;
