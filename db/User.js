
const Sequelize = require("sequelize");

module.exports = function (sequelize) {
    return sequelize.define("User", {
        id: {
            type: Sequelize.INTEGER(),
            primaryKey: true,
        },
        email: {
            type: Sequelize.STRING(100),
        },
        password: {
            type: Sequelize.STRING(44),
        },
        created_at: {
            type: Sequelize.INTEGER(),
            defaultValue: Math.floor(Date.now() / 1000),
        },
        updated_at: {
            type: Sequelize.INTEGER(),
            defaultValue: Math.floor(Date.now() / 1000),
        }
    }, {
        timestamps: false,
        tableName: "user"
        
    });
}