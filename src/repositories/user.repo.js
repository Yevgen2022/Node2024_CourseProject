// Working with the users table
const { User } = require('../models');

async function findByEmail(email) {
  const emailNorm = String(email).trim().toLowerCase();
  return User.findOne({
    where: { email: emailNorm },
    attributes: ['id', 'email', 'passwordHash'],
  });
}

// creating a user (passwordHash зберігаємо у колонку 'password')
async function createUser({ email, passwordHash }) {
  return User.create({ email, passwordHash });
}

module.exports = {
  findByEmail,
  createUser,
};