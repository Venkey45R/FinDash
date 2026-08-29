const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const IncomeCategory = require('../models/IncomeCategory');
const User = require('../models/User');

// --- Transactions ---

// Get total transaction balance (income - expense)
router.get('/balance', async (req, res) => {
  try {
    const balanceResult = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
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

// Get all transactions for the user (with pagination)
router.get('/', async (req, res) => {
  try {

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const query = { userId: req.userId };
    
    const [transactions, total, balanceResult] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(query),
      Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
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

    const transaction = new Transaction({
      userId: req.userId,
      type,
      amount: numAmount,
      category,
      date: date || Date.now()
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error adding transaction' });
  }
});

// Update a transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.userId });
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
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
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
    const categories = await IncomeCategory.find({ userId: req.userId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching income categories' });
  }
});

// Add an income category
router.post('/income-categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const category = new IncomeCategory({
      userId: req.userId,
      name
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server Error adding income category' });
  }
});

// Update an income category
router.put('/income-categories/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const category = await IncomeCategory.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name },
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
    const category = await IncomeCategory.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting income category' });
  }
});

module.exports = router;
