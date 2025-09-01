// Робота з таблицею users
const { User } = require('../models');

// пошук користувача за email
async function findByEmail(email) {
  const emailNorm = String(email).trim().toLowerCase();
  return User.findOne({
    where: { email: emailNorm },
    attributes: ['id', 'email', 'passwordHash'],
  });
}

// створення користувача (passwordHash зберігаємо у колонку 'password')
async function createUser({ email, passwordHash }) {
  return User.create({ email, password: passwordHash });
}

// “безпечний” пошук без пароля — для віддачі назовні
// async function findById(id) {
//   return User.findByPk(id);
// }

async function findByIdSafe(id) {
  return User.findByPk(id, {
    attributes: ['id', 'email', 'name', 'createdAt', 'updatedAt']
  });
}

module.exports = {
  findByEmail,
  findByIdSafe,
  createUser,
};