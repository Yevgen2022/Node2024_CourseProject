const Sequelize = require("sequelize");


module.exports = function (sequelize) {
    return sequelize.define("Authkey", {
        authkey: {
            type: Sequelize.STRING(44),
            primaryKey: true,
        },
        userid: {
            type: Sequelize.INTEGER(),
        },
        
        created_at:{
            type: Sequelize.INTEGER(),
            defaultValue: Math.floor(Date.now() / 1000)
        },
        updated_at:{
            type: Sequelize.INTEGER(),
            defaultValue: Math.floor(Date.now() / 1000)
        },
    }, {
        timestamps: false,
        tableName: 'authkey'
    });
}
