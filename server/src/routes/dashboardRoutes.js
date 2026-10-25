const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');
const { getNetWorthHistory } = require('../services/netWorthService');
const { getSingleUserId } = require('../utils/singleUser');

// GET /api/dashboard/user — Return the single user's profile
router.get('/user', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database disconnected' });
    }
    const uid = req.userId || (await getSingleUserId());
    let user = null;
    if (uid) {
      user = await User.findById(uid).select('name email avatar isOnboarded');
    }
    if (!user) {
      user = await User.findOne({}).select('name email avatar isOnboarded');
    }
    if (!user) {
      return res.json({ name: 'User', email: '', avatar: null, isOnboarded: true });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/dashboard/networth-history — Net worth time series
router.get('/networth-history', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json([]);
    }
    const uid = req.userId || (await getSingleUserId());
    let targetUserId = uid;
    if (!targetUserId) {
      const user = await User.findOne({});
      targetUserId = user?._id;
    }
    if (!targetUserId) return res.json([]);
    const history = await getNetWorthHistory(targetUserId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching net worth history:', error.message);
    res.json([]);
  }
});

module.exports = router;
