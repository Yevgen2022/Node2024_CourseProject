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
  
  //  indexes: [
  //     // primary key on authkey is already there automatically
  //     { fields: ['expires_at'] },   // index for quick cleanup of expired sessions
  //     { fields: ['userid'] }        // can be added if you often search for all user sessions
  //   ],
});

  // Authkey.beforeUpdate((instance) => { instance.updated_at = Math.floor(Date.now() / 1000); });

  return Authkey;
};
