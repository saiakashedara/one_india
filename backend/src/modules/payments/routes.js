const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../../middleware/auth');
const { 
  getWallet, 
  addMoney, 
  transferMoney, 
  getTransactions,
  verifyKYC,
  submitKYC
} = require('./controllers');
const logger = require('../../utils/logger');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get wallet
router.get('/wallet', authMiddleware, async (req, res) => {
  try {
    const wallet = await getWallet(req.userId);
    res.status(200).json(wallet);
  } catch (error) {
    logger.error('Get wallet error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add money to wallet
router.post('/wallet/add-money', 
  authMiddleware,
  [body('amount').isFloat({ min: 1 }).withMessage('Invalid amount')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await addMoney(req.userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Add money error:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Transfer money
router.post('/transfer',
  authMiddleware,
  [
    body('recipientPhone').isMobilePhone('en-IN').withMessage('Invalid recipient phone'),
    body('amount').isFloat({ min: 1 }).withMessage('Invalid amount')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await transferMoney(req.userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Transfer error:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Get transactions
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await getTransactions(req.userId, req.query);
    res.status(200).json(transactions);
  } catch (error) {
    logger.error('Get transactions error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Submit KYC
router.post('/kyc/submit',
  authMiddleware,
  [
    body('documentType').isIn(['aadhaar', 'pan', 'voter_id', 'license']).withMessage('Invalid document type'),
    body('documentNumber').notEmpty().withMessage('Document number is required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await submitKYC(req.userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Submit KYC error:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

// Verify KYC (admin route - not auth protected for now)
router.post('/kyc/verify/:kycId', 
  [body('status').isIn(['verified', 'rejected']).withMessage('Invalid status')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const result = await verifyKYC(req.params.kycId, req.body);
      res.status(200).json(result);
    } catch (error) {
      logger.error('Verify KYC error:', error);
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
