const { User, Wallet, OtpToken } = require('../../database/models');
const { generateToken, hashPassword, comparePassword } = require('../../utils/auth');
const logger = require('../../utils/logger');

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES) || 10;
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS) || 5;

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const issueOtp = async ({ phone, purpose }) => {
  const user = await User.findOne({ where: { phone } });
  if (!user) {
    throw new Error('User not found');
  }

  const code = createOtp();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await OtpToken.create({
    phone,
    purpose,
    codeHash,
    expiresAt
  });

  logger.info(`OTP issued for ${purpose}: ${phone}`);

  return {
    message: 'OTP sent successfully',
    expiresAt,
    ...(process.env.NODE_ENV !== 'production' && { devOtp: code })
  };
};

const verifyOtpCode = async ({ phone, purpose, code }) => {
  const token = await OtpToken.findOne({
    where: {
      phone,
      purpose,
      consumedAt: null
    },
    order: [['createdAt', 'DESC']]
  });

  if (!token || token.expiresAt < new Date()) {
    throw new Error('OTP expired or not found');
  }

  if (token.attempts >= OTP_MAX_ATTEMPTS) {
    throw new Error('Too many OTP attempts');
  }

  const isValid = await comparePassword(code, token.codeHash);
  await token.update({
    attempts: token.attempts + 1,
    ...(isValid && { consumedAt: new Date() })
  });

  if (!isValid) {
    throw new Error('Invalid OTP');
  }

  return true;
};

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

const requestPasswordReset = async ({ phone }) => {
  return issueOtp({ phone, purpose: 'password_reset' });
};

const resetPassword = async ({ phone, otp, newPassword }) => {
  await verifyOtpCode({ phone, purpose: 'password_reset', code: otp });

  const user = await User.findOne({ where: { phone } });
  if (!user) {
    throw new Error('User not found');
  }

  const passwordHash = await hashPassword(newPassword);
  await user.update({ passwordHash });

  logger.info(`Password reset completed for user: ${user.id}`);

  return { message: 'Password reset successful' };
};

const requestLoginOtp = async ({ phone }) => {
  return issueOtp({ phone, purpose: 'login' });
};

const loginWithOtp = async ({ phone, otp }) => {
  await verifyOtpCode({ phone, purpose: 'login', code: otp });

  const user = await User.findOne({ where: { phone } });
  if (!user) {
    throw new Error('User not found');
  }

  await user.update({ lastLogin: new Date() });
  const token = generateToken(user.id);

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
  refresh,
  requestPasswordReset,
  resetPassword,
  requestLoginOtp,
  loginWithOtp
};
