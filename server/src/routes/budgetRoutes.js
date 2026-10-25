const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { getSingleUserId } = require('../utils/singleUser');

/**
 * GET /api/budgets - Get all budgets
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.userId || (await getSingleUserId());
    const filter = userId ? { userId } : {};
    const budgets = await Budget.find(filter).sort({ createdAt: 1 });
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/budgets - Create a new budget
 */
router.post('/', async (req, res) => {
  try {
    const { name, amount } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Budget name is required' });
    }
    if (amount === undefined || amount < 0) {
      return res.status(400).json({ error: 'Valid budget amount is required' });
    }

    const userId = req.userId || (await getSingleUserId());

    const newBudget = new Budget({
      userId,
      name: name.trim(),
      amount: Number(amount),
      monthlyTracking: [],
    });

    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Error creating budget:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/budgets/:id - Update an existing budget (name, amount, tracking)
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, amount, monthlyTracking } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (amount !== undefined) updateData.amount = Number(amount);
    if (monthlyTracking !== undefined) updateData.monthlyTracking = monthlyTracking;

    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedBudget) return res.status(404).json({ error: 'Budget not found' });
    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/budgets/:id - Delete a budget
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedBudget = await Budget.findByIdAndDelete(req.params.id);
    if (!deletedBudget) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
