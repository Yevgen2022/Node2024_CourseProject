const crypto = require('crypto');
const db = require('../db');
const user = db.user;


module.exports = class User {
    constructor(email, password) {
        this.email = email;
        this.password = password;

        this.salt = '@Da!@$7d';
    }

    async findUser() {
        return await user.findOne({
            where: {
                'email': this.email
            }
        })
    }

    async createUser() {
        return await user.create({
            email: this.email,
            password: crypto.createHash('sha256').update(this.salt + this.password).digest('base64')
        })
    }

    async authUser() {
        return await user.findOne({
            where: {
                'email': this.email,
                'password': crypto.createHash('sha256').update(this.salt + this.password).digest('base64')
            }
        })
    }

}