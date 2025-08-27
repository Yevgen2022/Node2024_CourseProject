// Робота з таблицею users
const { User } = require('../models');

// пошук користувача за email
async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

// створення користувача (passwordHash зберігаємо у колонку 'password')
async function createUser({ email, passwordHash }) {
  return User.create({ email, password: passwordHash });
}

// (опційно) пошук за id
async function findById(id) {
  return User.findByPk(id);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
};
