// Робота з таблицею сесій (твій поточний 'authkey' / 'authkeys')
// Модель у models/index.js має експортувати або Session, або Authkey.
// Тут очікуємо Session. Якщо в тебе модель називається Authkey — просто
// у models/index.js зроби: `module.exports = { ..., Session: Authkey }`
const { Session } = require('../models');

// створити сесію (мультилогін — не обмежуємо кількість)
async function createSession({ userId, token }) {
  // у твоїй БД колонка називається 'userid', не 'userId'
  return Session.create({ userid: userId, authkey: token });
}

// знайти сесію по токену (для перевірки cookie)
async function findByToken(token) {
  return Session.findOne({ where: { authkey: token } });
}

// список усіх сесій користувача (для мультилогіну)
async function listByUser(userId) {
  return Session.findAll({
    where: { userid: userId },
    order: [['createdAt', 'DESC']],
  });
}

// видалити конкретну сесію користувача
async function deleteById(sessionId, userId) {
  return Session.destroy({ where: { id: sessionId, userid: userId } });
}

// (опційно) видалити за токеном
async function deleteByToken(token) {
  return Session.destroy({ where: { authkey: token } });
}

module.exports = {
  createSession,
  findByToken,
  listByUser,
  deleteById,
  deleteByToken,
};
