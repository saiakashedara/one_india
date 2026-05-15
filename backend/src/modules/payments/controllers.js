const { Wallet, Transaction, User, KYC } = require('../../database/models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

const getWallet = async (userId) => {
  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  return wallet;
};

const addMoney = async (userId, data) => {
  const { amount, paymentMethod } = data;

  if (amount <= 0) {
    throw new Error('Invalid amount');
  }

  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  // Create transaction record
  const transaction = await Transaction.create({
    userId,
    transactionType: 'credit',
    amount,
    status: 'completed',
    module: 'payments',
    description: `Money added via ${paymentMethod || 'card'}`,
    referenceId: `ADD_${uuidv4()}`
  });

  // Update wallet balance
  wallet.balance = parseFloat(wallet.balance) + parseFloat(amount);
  wallet.lastTransactionDate = new Date();
  await wallet.save();

  logger.info(`Money added to wallet: User ${userId}, Amount ${amount}`);

  return {
    transaction,
    wallet: {
      balance: wallet.balance,
      currency: wallet.currency
    }
  };
};

const transferMoney = async (userId, data) => {
  const { recipientPhone, amount, description } = data;

  if (amount <= 0) {
    throw new Error('Invalid amount');
  }

  // Get sender's wallet
  const senderWallet = await Wallet.findOne({ where: { userId } });
  if (!senderWallet) {
    throw new Error('Sender wallet not found');
  }

  if (parseFloat(senderWallet.balance) < parseFloat(amount)) {
    throw new Error('Insufficient balance');
  }

  // Get recipient user
  const recipient = await User.findOne({ where: { phone: recipientPhone } });
  if (!recipient) {
    throw new Error('Recipient not found');
  }

  if (recipient.id === userId) {
    throw new Error('Cannot transfer to yourself');
  }

  // Get recipient's wallet
  const recipientWallet = await Wallet.findOne({ where: { userId: recipient.id } });
  if (!recipientWallet) {
    throw new Error('Recipient wallet not found');
  }

  const referenceId = `TRANSFER_${uuidv4()}`;

  // Create transactions
  await Transaction.create({
    userId,
    transactionType: 'debit',
    amount,
    status: 'completed',
    module: 'payments',
    description: `Transfer to ${recipient.firstName} ${recipient.lastName}`,
    referenceId
  });

  await Transaction.create({
    userId: recipient.id,
    transactionType: 'credit',
    amount,
    status: 'completed',
    module: 'payments',
    description: `Transfer from ${recipient.firstName} ${recipient.lastName}`,
    referenceId
  });

  // Update balances
  senderWallet.balance = parseFloat(senderWallet.balance) - parseFloat(amount);
  senderWallet.lastTransactionDate = new Date();
  await senderWallet.save();

  recipientWallet.balance = parseFloat(recipientWallet.balance) + parseFloat(amount);
  recipientWallet.lastTransactionDate = new Date();
  await recipientWallet.save();

  logger.info(`Transfer successful: ${userId} to ${recipient.id}, Amount ${amount}`);

  return {
    referenceId,
    status: 'completed',
    message: 'Transfer successful',
    newBalance: senderWallet.balance
  };
};

const getTransactions = async (userId, query) => {
  const { limit = 20, offset = 0, module, status } = query;

  const where = { userId };
  if (module) where.module = module;
  if (status) where.status = status;

  const transactions = await Transaction.findAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  });

  const total = await Transaction.count({ where });

  return {
    transactions,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset)
  };
};

const submitKYC = async (userId, data) => {
  const { documentType, documentNumber, documentImageUrl } = data;

  // Check if KYC already submitted
  const existingKYC = await KYC.findOne({ where: { userId } });
  if (existingKYC && existingKYC.verificationStatus === 'verified') {
    throw new Error('KYC already verified');
  }

  const kyc = await KYC.create({
    userId,
    documentType,
    documentNumber,
    documentImageUrl,
    verificationStatus: 'pending'
  });

  logger.info(`KYC submitted: User ${userId}, Document Type ${documentType}`);

  return {
    kycId: kyc.id,
    status: 'pending',
    message: 'KYC submitted for verification'
  };
};

const verifyKYC = async (kycId, data) => {
  const { status, rejectionReason } = data;

  const kyc = await KYC.findByPk(kycId);
  if (!kyc) {
    throw new Error('KYC record not found');
  }

  await kyc.update({
    verificationStatus: status,
    rejectionReason: status === 'rejected' ? rejectionReason : null,
    verifiedAt: status === 'verified' ? new Date() : null
  });

  // Update user KYC status
  await User.update(
    { kycStatus: status },
    { where: { id: kyc.userId } }
  );

  logger.info(`KYC ${status}: ${kycId}`);

  return {
    kycId,
    status,
    message: `KYC ${status}`
  };
};

module.exports = {
  getWallet,
  addMoney,
  transferMoney,
  getTransactions,
  submitKYC,
  verifyKYC
};
