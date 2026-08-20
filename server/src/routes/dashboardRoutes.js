const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const { getNetWorthHistory } = require('../services/netWorthService');

// GET /api/dashboard/user — User profile
router.get('/user', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ name: 'Venkatesh', email: 'venkatesh@example.com' });
    }
    const user = await User.findOne().select('name email');
    if (!user) {
      return res.json({ name: 'Venkatesh', email: 'venkatesh@example.com' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.json({ name: 'Venkatesh', email: 'venkatesh@example.com' });
  }
});

// GET /api/dashboard/networth-history — Net worth time series starting from today
router.get('/networth-history', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const history = await getNetWorthHistory();
    res.json(history);
  } catch (error) {
    console.error('Error fetching net worth history:', error.message);
    res.json([]);
  }
});

module.exports = router;

