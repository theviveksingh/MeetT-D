import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      displayName,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Signup successful!',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful!',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    const updates = {};
    
    if (displayName) updates.displayName = displayName;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error during profile update.' });
  }
});

router.get('/room-history', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('roomHistory.roomCode', 'roomCode createdAt participants');
    res.json({ history: user.roomHistory });
  } catch (error) {
    console.error('Room history error:', error);
    res.status(500).json({ error: 'Server error fetching room history.' });
  }
});

export default router;
