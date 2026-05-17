const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  register,
  login,
  refresh,
  requestPasswordReset,
  resetPassword,
  requestLoginOtp,
  loginWithOtp
} = require('./controllers');
const { rateLimit } = require('../../middleware/security');
const logger = require('../../utils/logger');

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').isLength({ min: 2 }).withMessage('First name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email address'),
  body('lastName').optional({ checkFalsy: true }).trim().isLength({ max: 80 }).withMessage('Last name is too long'),
];

const validateLogin = [
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validatePhone = [
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
];

const validateOtpLogin = [
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const validatePasswordReset = [
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  keyPrefix: 'auth'
});

const loginLimiter = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 8,
  keyPrefix: 'login'
});

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes
router.post('/register', authLimiter, validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/login', loginLimiter, validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const result = await login(req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(401).json({ message: error.message });
  }
});

router.post('/otp/request', loginLimiter, validatePhone, handleValidationErrors, async (req, res) => {
  try {
    const result = await requestLoginOtp(req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('OTP request error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/otp/login', loginLimiter, validateOtpLogin, handleValidationErrors, async (req, res) => {
  try {
    const result = await loginWithOtp(req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('OTP login error:', error);
    res.status(401).json({ message: error.message });
  }
});

router.post('/password/forgot', authLimiter, validatePhone, handleValidationErrors, async (req, res) => {
  try {
    const result = await requestPasswordReset(req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.post('/password/reset', authLimiter, validatePasswordReset, handleValidationErrors, async (req, res) => {
  try {
    const result = await resetPassword(req.body);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(400).json({ message: error.message });
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
