'use strict';

module.exports = {
  async up (qi, Sequelize) {
    await qi.createTable('devices', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      // приклад полів пристрою (додай свої за потреби)
      user_id:       { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      user_agent:    { type: Sequelize.STRING(255), allowNull: true },
      ip_address:    { type: Sequelize.STRING(45),  allowNull: true }, // IPv4/IPv6

      created_at:    { type: Sequelize.INTEGER, allowNull: false },
      updated_at:    { type: Sequelize.INTEGER, allowNull: false },
    });

    // опціонально індекси
    await qi.addIndex('devices', ['user_id']);
    await qi.addIndex('devices', ['updated_at']);
  },

  async down (qi) {
    await qi.dropTable('devices');
  }
};
