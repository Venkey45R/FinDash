const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { seedDefaultCategories } = require('../services/seedService');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'findash-dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate a signed JWT for a user.
 */
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * POST /api/auth/signup — Email + password registration
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      authProvider: 'local',
      isOnboarded: false,
    });

    // Seed default categories for the new user
    try {
      await seedDefaultCategories(user._id);
    } catch (seedErr) {
      console.error('[Auth] Failed to seed default categories:', seedErr.message);
    }

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isOnboarded: user.isOnboarded,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error('[Auth] Signup error:', error.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

/**
 * POST /api/auth/login — Email + password login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If user signed up with Google and has no password
    if (!user.password) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please login with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isOnboarded: user.isOnboarded,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * POST /api/auth/google — Google OAuth login/signup
 * Receives the Google credential token, verifies it, and finds or creates a user.
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    // Dynamically import google-auth-library
    const { OAuth2Client } = require('google-auth-library');
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

    if (!GOOGLE_CLIENT_ID) {
      return res.status(503).json({ error: 'Google OAuth is not configured on this server' });
    }

    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    let isNewUser = false;

    if (!user) {
      // New Google user — create account
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        authProvider: 'google',
        isOnboarded: false,
      });
      isNewUser = true;

      // Seed default categories
      try {
        await seedDefaultCategories(user._id);
      } catch (seedErr) {
        console.error('[Auth] Failed to seed categories for Google user:', seedErr.message);
      }
    } else {
      // Existing user — update Google info if missing
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      if (user.authProvider === 'local') user.authProvider = 'google';
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isOnboarded: user.isOnboarded,
        authProvider: user.authProvider,
      },
      isNewUser,
    });
  } catch (error) {
    console.error('[Auth] Google auth error:', error.message);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

/**
 * GET /api/auth/me — Get current user profile (requires auth)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnboarded: user.isOnboarded,
      authProvider: user.authProvider,
    });
  } catch (error) {
    console.error('[Auth] /me error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /api/auth/onboarding — Mark onboarding as complete
 */
router.post('/onboarding', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { isOnboarded: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnboarded: user.isOnboarded,
      authProvider: user.authProvider,
    });
  } catch (error) {
    console.error('[Auth] Onboarding error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
