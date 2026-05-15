const { User, Wallet } = require('../../database/models');
const { generateToken, hashPassword, comparePassword } = require('../../utils/auth');
const logger = require('../../utils/logger');

const register = async (userData) => {
  const { phone, email, firstName, lastName, password, language } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ where: { phone } });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    phone,
    email,
    firstName,
    lastName,
    passwordHash,
    language: language || 'en'
  });

  logger.info(`New user registered: ${user.id}`);

  // Create wallet
  await Wallet.create({
    userId: user.id,
    balance: 0.00,
    currency: 'INR'
  });

  const token = generateToken(user.id);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      language: user.language
    },
    token
  };
};

const login = async (credentials) => {
  const { phone, password } = credentials;

  const user = await User.findOne({ where: { phone } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  await user.update({ lastLogin: new Date() });

  const token = generateToken(user.id);

  logger.info(`User logged in: ${user.id}`);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      kycStatus: user.kycStatus
    },
    token
  };
};

const refresh = async (data) => {
  const { userId } = data;
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const token = generateToken(user.id);

  return { token };
};

module.exports = {
  register,
  login,
  refresh
};
