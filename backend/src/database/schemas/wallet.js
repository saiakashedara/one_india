module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR'
    },
    walletStatus: {
      type: DataTypes.ENUM('active', 'frozen', 'suspended'),
      defaultValue: 'active'
    },
    totalRewarded: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    lastTransactionDate: {
      type: DataTypes.DATE
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'wallets',
    timestamps: true
  });

  return Wallet;
};
