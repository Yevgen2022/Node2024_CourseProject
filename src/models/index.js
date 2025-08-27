// src/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(
  config.db.database, config.db.username, config.db.password, {
    host: config.db.host,
    dialect: config.db.dialect,
    logging: config.db.logging,
  }
);

// підключаємо файли моделей
const User = require('./User')(sequelize, DataTypes);
const Authkey = require('./Authkey')(sequelize, DataTypes);

// АЛІАС: називаємо Authkey як Session в експорті
const Session = Authkey;

async function initDb() {
  await sequelize.authenticate();
  await sequelize.sync(); // ок для деву
}

module.exports = { sequelize, initDb, User, Session };
