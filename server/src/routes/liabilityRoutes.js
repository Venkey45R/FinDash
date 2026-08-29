const express = require('express');
const router = express.Router();
const LiabilityCategory = require('../models/LiabilityCategory');
const User = require('../models/User');

/**
 * GET /api/liabilities — Get all liability categories for the user
 */
router.get('/', async (req, res) => {
  try {
    const categories = await LiabilityCategory.find({ userId: req.userId }).sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching liabilities:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/liabilities/:categoryId/entries — Add a new liability entry (with duplicate aggregation)
 */
router.post('/:categoryId/entries', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, originalAmount, outstandingAmount, emi, interestRate } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Liability name is required' });
    }

    const category = await LiabilityCategory.findOne({ _id: categoryId, userId: req.userId });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const cleanName = name.trim().toLowerCase();
    const existingEntry = category.entries.find(
      (e) => e.name && e.name.trim().toLowerCase() === cleanName
    );

    const numOriginal = Number(originalAmount) || 0;
    const numOutstanding = Number(outstandingAmount) || numOriginal;
    const numEmi = Number(emi) || 0;
    const numRate = Number(interestRate) || 0;

    if (existingEntry) {
      const oldOutstanding = existingEntry.outstandingAmount || 0;
      const oldRate = existingEntry.interestRate || 0;
      const totalOutstanding = oldOutstanding + numOutstanding;

      let weightedRate = numRate;
      if (totalOutstanding > 0 && oldRate > 0 && numRate > 0) {
        weightedRate = parseFloat(
          ((oldOutstanding * oldRate + numOutstanding * numRate) / totalOutstanding).toFixed(2)
        );
      } else if (oldRate > 0) {
        weightedRate = oldRate;
      }

      existingEntry.originalAmount = (existingEntry.originalAmount || 0) + numOriginal;
      existingEntry.outstandingAmount = totalOutstanding;
      existingEntry.emi = (existingEntry.emi || 0) + numEmi;
      existingEntry.interestRate = weightedRate;

      await category.save();
      return res.status(200).json({ category: category.toObject(), entry: existingEntry, aggregated: true });
    }

    category.entries.push({
      name: name.trim(),
      originalAmount: numOriginal,
      outstandingAmount: numOutstanding,
      emi: numEmi,
      interestRate: numRate,
    });
    await category.save();

    const newEntry = category.entries[category.entries.length - 1];
    res.status(201).json({ category: category.toObject(), entry: newEntry, aggregated: false });
  } catch (error) {
    console.error('Error adding liability entry:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/liabilities/:categoryId/entries/:entryId — Update a liability entry
 */
router.put('/:categoryId/entries/:entryId', async (req, res) => {
  try {
    const { categoryId, entryId } = req.params;
    const { name, originalAmount, outstandingAmount, emi, interestRate } = req.body;

    const category = await LiabilityCategory.findOne({ _id: categoryId, userId: req.userId });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const entry = category.entries.id(entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) return res.status(400).json({ error: 'Liability name cannot be empty' });
      entry.name = trimmed;
    }
    if (originalAmount !== undefined) entry.originalAmount = Number(originalAmount) || 0;
    if (outstandingAmount !== undefined) entry.outstandingAmount = Number(outstandingAmount) || 0;
    if (emi !== undefined) entry.emi = Number(emi) || 0;
    if (interestRate !== undefined) entry.interestRate = Number(interestRate) || 0;

    await category.save();
    res.json({ category: category.toObject(), entry: entry.toObject() });
  } catch (error) {
    console.error('Error updating liability entry:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/liabilities/:categoryId/entries/:entryId — Delete a liability entry
 */
router.delete('/:categoryId/entries/:entryId', async (req, res) => {
  try {
    const { categoryId, entryId } = req.params;

    const category = await LiabilityCategory.findOne({ _id: categoryId, userId: req.userId });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const entry = category.entries.id(entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    category.entries.pull({ _id: entryId });
    await category.save();

    res.json({ category: category.toObject(), message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting liability entry:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
