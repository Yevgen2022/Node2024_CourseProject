// src/models/Device.js
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const Device = sequelize.define('Device', {
    id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
    user_agent: { type: Sequelize.STRING(255), allowNull: false },
    ip_address: { type: Sequelize.STRING(45), allowNull: false },

    created_at: { type: Sequelize.INTEGER, allowNull: false, defaultValue: () => Math.floor(Date.now() / 1000) },
    updated_at: { type: Sequelize.INTEGER, allowNull: false, defaultValue: () => Math.floor(Date.now() / 1000) },
  }, {
    tableName: 'device',
    timestamps: false, // керуємо своїми created_at/updated_at

    hooks: {
      beforeCreate(instance) {
        const now = Math.floor(Date.now() / 1000);
        instance.created_at = now;
        instance.updated_at = now;
      },
      beforeUpdate(instance) {
        instance.updated_at = Math.floor(Date.now() / 1000);
      },
    },
    indexes: [
      { fields: ['user_id'] },
      { fields: ['updated_at'] },
    ],
  });


  return Device;
};
