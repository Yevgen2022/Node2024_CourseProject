// src/models/Authkey.js
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const Authkey = sequelize.define('Authkey', {
    authkey:    { type: Sequelize.STRING(44), primaryKey: true },
    userid:     { type: Sequelize.INTEGER },

    created_at: { type: Sequelize.INTEGER, allowNull: false, defaultValue: Sequelize.literal('UNIX_TIMESTAMP()') },
    expires_at: { type: Sequelize.INTEGER, allowNull: false, defaultValue: Sequelize.literal('UNIX_TIMESTAMP()') },
  }, {
    timestamps: false,
    tableName: 'authkey',
  });

  Authkey.beforeUpdate((instance) => { instance.updated_at = Math.floor(Date.now() / 1000); });

  return Authkey;
};
