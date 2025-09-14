// src/models/User.js
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    email: { type: Sequelize.STRING(191), allowNull: false, unique: true },
    passwordHash: { type: Sequelize.STRING(255), allowNull: false, field: 'password' },

    // ↓ UNIX time (INT):
    created_at: { type: Sequelize.INTEGER, allowNull: false, defaultValue: Sequelize.literal('UNIX_TIMESTAMP()') },
    updated_at: { type: Sequelize.INTEGER, allowNull: false, defaultValue: Sequelize.literal('UNIX_TIMESTAMP()') },
  }, {
    tableName: 'users',
    timestamps: false,   // very important: do not use built-in Date timestamps

    hooks: {
      beforeUpdate(instance) {
        const now = Math.floor(Date.now() / 1000);
        instance.updated_at = now;
      }
    }

  });

  return User;
};