const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const AssetCategory = require('../models/AssetCategory');
const User = require('../models/User');
const { triggerManualSync, getSyncStatus } = require('../services/schedulerService');

/**
 * Escape special regex characters in a string to prevent ReDoS attacks.
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GET /api/assets — Get all asset categories for the user
 */
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: 'No user found' });

    const categories = await AssetCategory.find({ userId: user._id }).sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching assets:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/assets/sync-status — Get scheduler and last sync info
 * NOTE: Placed BEFORE /:categoryId routes to prevent route shadowing.
 */
router.get('/sync-status', async (req, res) => {
  try {
    const status = getSyncStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

/**
 * POST /api/assets/sync-prices — Trigger live market price synchronization
 * NOTE: Placed BEFORE /:categoryId routes to prevent route shadowing.
 */
router.post('/sync-prices', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database connection is initializing or offline',
        dbOffline: true,
      });
    }

    const syncResult = await triggerManualSync();
    const user = await User.findOne();
    const categories = await AssetCategory.find({ userId: user ? user._id : undefined }).sort({ order: 1 });
    res.json({
      success: true,
      categories,
      syncResult,
    });
  } catch (error) {
    console.error('Error syncing asset prices:', error.message);
    res.status(500).json({ error: 'Failed to sync prices: ' + error.message, dbOffline: true });
  }
});

/**
 * POST /api/assets/investment — Add an instrument-level investment holding
 */
router.post('/investment', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ error: 'No user found' });

    const {
      type, // 'STOCK' | 'MUTUAL_FUND' | 'ETF' | 'OTHER'
      instrumentId,
      name,
      symbol,
      exchange = 'NSE',
      isin = '',
      plan = '',
      categoryName,
      quantity,
      averageBuyPrice,
      units,
      averageNAV,
      investedAmount,
      currentValue,
      purchaseDate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Investment name is required' });
    }

    // Determine target category
    let targetCatName = categoryName;
    if (!targetCatName) {
      if (type === 'STOCK' || type === 'MUTUAL_FUND' || type === 'ETF') {
        targetCatName = 'Domestic Equity';
      } else {
        targetCatName = 'Domestic Equity';
      }
    }

    // Use escaped regex to prevent ReDoS (fixes #2)
    let category = await AssetCategory.findOne({
      userId: user._id,
      name: { $regex: new RegExp(`^${escapeRegex(targetCatName)}$`, 'i') },
    });

    if (!category) {
      category = await AssetCategory.findOne({ userId: user._id }).sort({ order: 1 });
    }
    if (!category) return res.status(404).json({ error: 'Category not found' });

    let finalSubCategory = 'OTHER';
    if (type === 'STOCK') finalSubCategory = 'STOCKS';
    else if (type === 'MUTUAL_FUND') finalSubCategory = 'MUTUAL_FUNDS';
    else if (type === 'ETF') finalSubCategory = 'ETFS';

    let finalInvested = 0;
    let finalCurrent = 0;

    const numQty = Number(quantity) || 0;
    const numPrice = Number(averageBuyPrice) || 0;
    const numUnits = Number(units) || 0;
    const numNav = Number(averageNAV) || 0;

    if (type === 'STOCK' || type === 'ETF') {
      if (numQty <= 0) return res.status(400).json({ error: 'Quantity must be greater than 0' });
      if (numPrice <= 0) return res.status(400).json({ error: 'Average buy price must be greater than 0' });
      finalInvested = parseFloat((numQty * numPrice).toFixed(2));
      finalCurrent = finalInvested;
    } else if (type === 'MUTUAL_FUND') {
      if (numUnits <= 0) return res.status(400).json({ error: 'Units must be greater than 0' });
      if (numNav <= 0) return res.status(400).json({ error: 'Average NAV must be greater than 0' });
      finalInvested = parseFloat((numUnits * numNav).toFixed(2));
      finalCurrent = finalInvested;
    } else {
      // Manual / OTHER
      finalInvested = Number(investedAmount) || 0;
      finalCurrent = Number(currentValue) || finalInvested;
    }

    // Check for existing holding by instrumentId, symbol, or exact/trimmed name
    const cleanName = name.trim().toLowerCase();
    let existingEntry = null;
    if (instrumentId) {
      existingEntry = category.entries.find(
        (e) => e.instrumentId && e.instrumentId.toString() === instrumentId.toString()
      );
    }
    if (!existingEntry && symbol) {
      existingEntry = category.entries.find(
        (e) => e.symbol && e.symbol.toUpperCase() === symbol.toUpperCase()
      );
    }
    if (!existingEntry && cleanName) {
      existingEntry = category.entries.find(
        (e) => e.name && e.name.trim().toLowerCase() === cleanName
      );
    }

    if (existingEntry) {
      const isStockOrETF = type === 'STOCK' || type === 'ETF' || existingEntry.quantity > 0;
      const isMF = type === 'MUTUAL_FUND' || existingEntry.units > 0;

      if (isStockOrETF && numQty > 0) {
        const oldQty = existingEntry.quantity || 0;
        const oldInvested = existingEntry.investedAmount || 0;
        const newTotalQty = oldQty + numQty;
        const newTotalInvested = oldInvested + finalInvested;
        const newAvgPrice = newTotalQty > 0 ? parseFloat((newTotalInvested / newTotalQty).toFixed(2)) : numPrice;

        existingEntry.quantity = newTotalQty;
        existingEntry.investedAmount = newTotalInvested;
        existingEntry.averageBuyPrice = newAvgPrice;
        existingEntry.currentValue = (existingEntry.currentValue || oldInvested) + finalCurrent;
      } else if (isMF && numUnits > 0) {
        const oldUnits = existingEntry.units || 0;
        const oldInvested = existingEntry.investedAmount || 0;
        const newTotalUnits = oldUnits + numUnits;
        const newTotalInvested = oldInvested + finalInvested;
        const newAvgNav = newTotalUnits > 0 ? parseFloat((newTotalInvested / newTotalUnits).toFixed(2)) : numNav;

        existingEntry.units = newTotalUnits;
        existingEntry.investedAmount = newTotalInvested;
        existingEntry.averageNAV = newAvgNav;
        existingEntry.currentValue = (existingEntry.currentValue || oldInvested) + finalCurrent;
      } else {
        existingEntry.investedAmount = (existingEntry.investedAmount || 0) + finalInvested;
        existingEntry.currentValue = (existingEntry.currentValue || 0) + finalCurrent;
      }

      if (purchaseDate) existingEntry.purchaseDate = new Date(purchaseDate);
      if (symbol && !existingEntry.symbol) existingEntry.symbol = symbol;
      if (isin && !existingEntry.isin) existingEntry.isin = isin;

      await category.save();
      return res.status(200).json({ category: category.toObject(), entry: existingEntry, aggregated: true });
    }

    // Add new entry
    const newEntryPayload = {
      name: name.trim(),
      investedAmount: finalInvested,
      currentValue: finalCurrent,
      valuationType: type === 'OTHER' ? 'MANUAL' : 'MARKET',
      subCategory: finalSubCategory,
      instrumentId: instrumentId || null,
      symbol: symbol || '',
      exchange: exchange || 'NSE',
      isin: isin || '',
      plan: plan || '',
      quantity: numQty,
      averageBuyPrice: numPrice,
      units: numUnits,
      averageNAV: numNav,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
    };

    category.entries.push(newEntryPayload);
    await category.save();

    const createdEntry = category.entries[category.entries.length - 1];
    res.status(201).json({ category: category.toObject(), entry: createdEntry, aggregated: false });
  } catch (error) {
    console.error('Error creating investment holding:', error.message);
    res.status(500).json({ error: 'Server error creating investment' });
  }
});

/**
 * POST /api/assets/:categoryId/entries — Add a standard entry (with duplicate aggregation)
 */
router.post('/:categoryId/entries', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const {
      name,
      investedAmount,
      currentValue,
      subCategory,
      quantity,
      averageBuyPrice,
      units,
      averageNAV,
      symbol,
      exchange,
      purchaseDate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Entry name is required' });
    }

    const category = await AssetCategory.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const cleanName = name.trim().toLowerCase();
    const existingEntry = category.entries.find(
      (e) => (e.name && e.name.trim().toLowerCase() === cleanName) ||
             (symbol && e.symbol && e.symbol.toUpperCase() === symbol.toUpperCase())
    );

    const numInvested = Number(investedAmount) || 0;
    const numCurrent = Number(currentValue) || numInvested;
    const numQty = Number(quantity) || 0;
    const numPrice = Number(averageBuyPrice) || 0;
    const numUnits = Number(units) || 0;
    const numNav = Number(averageNAV) || 0;

    if (existingEntry) {
      if (numQty > 0 || (existingEntry.quantity > 0 && numPrice > 0)) {
        const oldQty = existingEntry.quantity || 0;
        const oldInvested = existingEntry.investedAmount || 0;
        const newTotalQty = oldQty + numQty;
        const newTotalInvested = oldInvested + numInvested;
        const newAvgPrice = newTotalQty > 0 ? parseFloat((newTotalInvested / newTotalQty).toFixed(2)) : numPrice;

        existingEntry.quantity = newTotalQty;
        existingEntry.investedAmount = newTotalInvested;
        existingEntry.averageBuyPrice = newAvgPrice;
        existingEntry.currentValue = (existingEntry.currentValue || oldInvested) + numCurrent;
      } else if (numUnits > 0 || (existingEntry.units > 0 && numNav > 0)) {
        const oldUnits = existingEntry.units || 0;
        const oldInvested = existingEntry.investedAmount || 0;
        const newTotalUnits = oldUnits + numUnits;
        const newTotalInvested = oldInvested + numInvested;
        const newAvgNav = newTotalUnits > 0 ? parseFloat((newTotalInvested / newTotalUnits).toFixed(2)) : numNav;

        existingEntry.units = newTotalUnits;
        existingEntry.investedAmount = newTotalInvested;
        existingEntry.averageNAV = newAvgNav;
        existingEntry.currentValue = (existingEntry.currentValue || oldInvested) + numCurrent;
      } else {
        existingEntry.investedAmount = (existingEntry.investedAmount || 0) + numInvested;
        existingEntry.currentValue = (existingEntry.currentValue || 0) + numCurrent;
      }

      if (purchaseDate) existingEntry.purchaseDate = new Date(purchaseDate);
      if (symbol && !existingEntry.symbol) existingEntry.symbol = symbol;

      await category.save();
      return res.status(200).json({ category: category.toObject(), entry: existingEntry, aggregated: true });
    }

    category.entries.push({
      name: name.trim(),
      investedAmount: numInvested,
      currentValue: numCurrent,
      subCategory: subCategory || 'OTHER',
      quantity: numQty,
      averageBuyPrice: numPrice,
      units: numUnits,
      averageNAV: numNav,
      symbol: symbol || '',
      exchange: exchange || '',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
    });
    await category.save();

    const newEntry = category.entries[category.entries.length - 1];
    res.status(201).json({ category: category.toObject(), entry: newEntry, aggregated: false });
  } catch (error) {
    console.error('Error adding entry:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * PUT /api/assets/:categoryId/entries/:entryId — Update an entry
 * Validates: no empty name, no negative quantities/units.
 */
router.put('/:categoryId/entries/:entryId', async (req, res) => {
  try {
    const { categoryId, entryId } = req.params;
    const {
      name,
      investedAmount,
      currentValue,
      quantity,
      averageBuyPrice,
      units,
      averageNAV,
      subCategory,
      symbol,
    } = req.body;

    const category = await AssetCategory.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const entry = category.entries.id(entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    // Validate name is not empty on update (fixes E4)
    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) return res.status(400).json({ error: 'Entry name cannot be empty' });
      entry.name = trimmed;
    }

    // Validate no negative quantities/units (fixes E2)
    if (quantity !== undefined) {
      const numQty = Number(quantity);
      if (numQty < 0) return res.status(400).json({ error: 'Quantity cannot be negative' });
      entry.quantity = numQty || 0;
    }
    if (units !== undefined) {
      const numUnits = Number(units);
      if (numUnits < 0) return res.status(400).json({ error: 'Units cannot be negative' });
      entry.units = numUnits || 0;
    }
    if (averageBuyPrice !== undefined) {
      const numPrice = Number(averageBuyPrice);
      if (numPrice < 0) return res.status(400).json({ error: 'Buy price cannot be negative' });
      entry.averageBuyPrice = numPrice || 0;
    }
    if (averageNAV !== undefined) {
      const numNav = Number(averageNAV);
      if (numNav < 0) return res.status(400).json({ error: 'NAV cannot be negative' });
      entry.averageNAV = numNav || 0;
    }

    if (investedAmount !== undefined) entry.investedAmount = Number(investedAmount) || 0;
    if (currentValue !== undefined) entry.currentValue = Number(currentValue) || 0;
    if (subCategory !== undefined) entry.subCategory = subCategory;
    if (symbol !== undefined) entry.symbol = symbol;

    await category.save();
    res.json({ category: category.toObject(), entry: entry.toObject() });
  } catch (error) {
    console.error('Error updating entry:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * DELETE /api/assets/:categoryId/entries/:entryId — Delete an entry
 */
router.delete('/:categoryId/entries/:entryId', async (req, res) => {
  try {
    const { categoryId, entryId } = req.params;

    const category = await AssetCategory.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const entry = category.entries.id(entryId);
    if (!entry) return res.status(404).json({ error: 'Entry not found' });

    category.entries.pull({ _id: entryId });
    await category.save();

    res.json({ category: category.toObject(), message: 'Entry deleted' });
  } catch (error) {
    console.error('Error deleting entry:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
