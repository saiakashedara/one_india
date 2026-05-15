const Sequelize = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'oneindia_dev',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: msg => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const User = require('./schemas/user')(sequelize, Sequelize);
const Wallet = require('./schemas/wallet')(sequelize, Sequelize);
const Transaction = require('./schemas/transaction')(sequelize, Sequelize);
const KYC = require('./schemas/kyc')(sequelize, Sequelize);

// Associations
User.hasOne(Wallet, { foreignKey: 'userId' });
Wallet.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(KYC, { foreignKey: 'userId' });
KYC.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Wallet,
  Transaction,
  KYC
};
