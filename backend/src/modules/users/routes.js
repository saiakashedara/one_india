const express = require('express');
const authMiddleware = require('../../middleware/auth');
const { getUserProfile, updateProfile } = require('./controllers');
const logger = require('../../utils/logger');

const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await getUserProfile(req.userId);
    res.status(200).json(profile);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update profile
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const updated = await updateProfile(req.userId, req.body);
    res.status(200).json(updated);
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
