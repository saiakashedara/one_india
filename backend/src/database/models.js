const Sequelize = require('sequelize');
const logger = require('../utils/logger');

const dbDialect = process.env.DB_DIALECT || (process.env.DB_HOST ? 'postgres' : 'sqlite');
const baseOptions = {
  logging: msg => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

let sequelize;
if (dbDialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || 'backend.sqlite',
    ...baseOptions
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'oneindia_dev',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      ...baseOptions
    }
  );
}

const User = require('./schemas/user')(sequelize, Sequelize);
const Wallet = require('./schemas/wallet')(sequelize, Sequelize);
const Transaction = require('./schemas/transaction')(sequelize, Sequelize);
const KYC = require('./schemas/kyc')(sequelize, Sequelize);
const AuditLog = require('./schemas/auditLog')(sequelize, Sequelize);
const OtpToken = require('./schemas/otpToken')(sequelize, Sequelize);

// Associations
User.hasOne(Wallet, { foreignKey: 'userId' });
Wallet.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Transaction, { foreignKey: 'userId' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(KYC, { foreignKey: 'userId' });
KYC.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(AuditLog, { foreignKey: 'userId' });
AuditLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Wallet,
  Transaction,
  KYC,
  AuditLog,
  OtpToken
};
