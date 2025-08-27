const Sequelize = require("sequelize");

const sequelize =  new Sequelize("node_2024", "root", "Gena2022$", {
    dialect: "mysql",
    host: "127.0.0.1",
    logging: false
});

const User = require('./User')(sequelize);
const Authkey = require('./Authkey')(sequelize);

module.exports = {
    sequelize : sequelize,
    user : User,
    authkey : Authkey
}