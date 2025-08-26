module.exports = class User{
    constructor (email, password){
        this.email = email;
        this.password = password;

        this.salt = '@Da!@$7d';
    }
}