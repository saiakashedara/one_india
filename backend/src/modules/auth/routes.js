const express = require('express');
const { body, validationResult } = require('express-validator');
const { register, login, refresh } = require('./controllers');
const logger = require('../../utils/logger');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').isLength({ min: 2 }).withMessage('First name is required'),
];

const validateLogin = [
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('password').notEmpty().withMessage('Password is required'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const result = await login(req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({ message: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const result = await refresh(req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Refresh error:', error);
    res.status(401).json({ message: error.message });
  }
});

module.exports = router;
