import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { getRandomChallenge } from '../data/challenges.js';

const router = express.Router();

router.get('/random', authenticate, async (req, res) => {
  try {
    const { type, category, excludeIds } = req.query;
    const user = await User.findById(req.user._id);
    
    const challenge = getRandomChallenge(type, category, excludeIds, user.customChallenges);
    res.json({ challenge });
  } catch (error) {
    console.error('Get random challenge error:', error);
    res.status(500).json({ error: 'Server error fetching challenge.' });
  }
});

router.post('/custom', authenticate, async (req, res) => {
  try {
    const { text, type, category } = req.body;

    if (!text || !type || !category) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!['truth', 'dare'].includes(type)) {
      return res.status(400).json({ error: 'Invalid challenge type.' });
    }

    if (!['funny', 'bold', 'personal', 'silly'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category.' });
    }

    const user = await User.findById(req.user._id);
    user.customChallenges.push({ text, type, category });
    await user.save();

    res.status(201).json({ 
      message: 'Challenge created successfully!',
      challenges: user.customChallenges 
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ error: 'Server error creating challenge.' });
  }
});

router.get('/custom', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ challenges: user.customChallenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Server error fetching challenges.' });
  }
});

router.put('/custom/:challengeId', authenticate, async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { text, type, category, isActive } = req.body;

    const user = await User.findById(req.user._id);
    const challenge = user.customChallenges.id(challengeId);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    if (text) challenge.text = text;
    if (type) challenge.type = type;
    if (category) challenge.category = category;
    if (isActive !== undefined) challenge.isActive = isActive;

    await user.save();

    res.json({ 
      message: 'Challenge updated!',
      challenges: user.customChallenges 
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({ error: 'Server error updating challenge.' });
  }
});

router.delete('/custom/:challengeId', authenticate, async (req, res) => {
  try {
    const { challengeId } = req.params;

    const user = await User.findById(req.user._id);
    const challenge = user.customChallenges.id(challengeId);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }

    challenge.deleteOne();
    await user.save();

    res.json({ 
      message: 'Challenge deleted!',
      challenges: user.customChallenges 
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ error: 'Server error deleting challenge.' });
  }
});

export default router;
