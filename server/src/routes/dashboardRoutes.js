const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const { getNetWorthHistory } = require('../services/netWorthService');

// GET /api/dashboard/user — User profile
router.get('/user', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database disconnected' });
    }
    const user = await User.findById(req.userId).select('name email avatar isOnboarded');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/dashboard/networth-history — Net worth time series starting from today
router.get('/networth-history', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const history = await getNetWorthHistory(req.userId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching net worth history:', error.message);
    res.json([]);
  }
});

module.exports = router;

