module.exports = (sequelize, DataTypes) => {
  const OtpToken = sequelize.define('OtpToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    purpose: {
      type: DataTypes.ENUM('login', 'password_reset'),
      allowNull: false
    },
    codeHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    consumedAt: {
      type: DataTypes.DATE
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'otp_tokens',
    timestamps: false
  });

  return OtpToken;
};
