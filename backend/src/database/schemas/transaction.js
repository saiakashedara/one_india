module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    transactionType: {
      type: DataTypes.ENUM('credit', 'debit', 'refund', 'transfer'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'INR'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    module: {
      type: DataTypes.ENUM('payments', 'travel', 'shopping', 'home-services'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    referenceId: {
      type: DataTypes.STRING,
      unique: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'transactions',
    timestamps: false
  });

  return Transaction;
};
