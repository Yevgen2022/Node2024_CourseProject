const db = require('../db');
const authkey = db.authkey;
const randomstring = require("randomstring");

module.exports = class Authkey {
    static async createAuthKey (userid) {
        const authString = randomstring.generate(44);
        return await authkey.create({
            userid : userid,
            authkey : authString
        })
    }

    static async checkCookie (cookie) {
        return await authkey.findOne({
            where : {
                authkey : cookie
            }
        })
    }
}