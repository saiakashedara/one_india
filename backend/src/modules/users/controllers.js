const { User, Wallet, KYC } = require('../../database/models');

const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const wallet = await Wallet.findOne({ where: { userId } });
  const kyc = await KYC.findOne({ where: { userId } });

  return {
    user: {
      id: user.id,
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      language: user.language,
      kycStatus: user.kycStatus,
      createdAt: user.createdAt
    },
    wallet: wallet ? {
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.walletStatus
    } : null,
    kyc: kyc ? {
      documentType: kyc.documentType,
      verificationStatus: kyc.verificationStatus
    } : null
  };
};

const updateProfile = async (userId, data) => {
  const { firstName, lastName, email, language } = data;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (language) user.language = language;

  await user.save();

  return {
    message: 'Profile updated',
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      language: user.language
    }
  };
};

module.exports = {
  getUserProfile,
  updateProfile
};
