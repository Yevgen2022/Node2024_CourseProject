// Робота з таблицею сесій (твій поточний 'authkey' / 'authkeys')
// Модель у models/index.js має експортувати або Session, або Authkey.
// Тут очікуємо Session. Якщо в тебе модель називається Authkey — просто
// у models/index.js зроби: `module.exports = { ..., Session: Authkey }`
const { Session } = require('../models');


// // створити сесію (мультилогін — не обмежуємо кількість)
// async function createSession({ userId, token }) {
//   // у твоїй БД колонка називається 'userid', не 'userId'
//   return Session.create({ userid: userId, authkey: token });
// }


// створити сесію (мультилогін дозволений)
async function createSession({ userId, token, expiresAtSec }) {

  return Session.create({
    authkey: token,    // PK
    userid: userId,
    expires_at: expiresAtSec,
  });
}


// знайти сесію по токену (для перевірки cookie)
// async function findByToken(token) {
//   return Session.findOne({ where: { authkey: token } });
// }
async function findByToken(token) {
  const row = await Session.findOne({ where: { authkey: token }, raw: true });
  return row;
}

// список усіх сесій користувача (для мультилогіну)
async function listByUser(userId) {
  return Session.findAll({
    where: { userid: userId },
    order: [['created_at', 'DESC']],
    attributes: ['authkey', 'userid', 'created_at'],  //дописав
  });
}

// видалити конкретну сесію користувача
async function deleteById(token, userId) {
  return Session.destroy({ where: { authkey: token, userid: userId } });
}

// (опційно) видалити за токеном
async function deleteSessionByToken(token) {
  return Session.destroy({ where: { authkey: token } });
}


async function replaceSessionForDevice({ userId, oldToken, newToken, now = nowUnix() }) {
  if (!oldToken) {
    await createSession({ userId, token: newToken, now });
    return { action: 'created' };
  }

  const prev = await findByToken(oldToken);
  if (!prev || prev.userid !== userId) {
    await createSession({ userId, token: newToken, now });
    return { action: 'created' };
  }

  // same device (та сама cookie), той самий користувач → замінюємо рядок
  return await sequelize.transaction(async (t) => {
    await Session.destroy({ where: { authkey: oldToken }, transaction: t });
    await Session.create({
      authkey: newToken,
      userid: userId,
      created_at: now,
      updated_at: now,
    }, { transaction: t });
    return { action: 'replaced' };
  });
}

module.exports = {
  createSession,
  findByToken,
  listByUser,
  deleteById,   // залишили сумісність (приймає token)
  deleteSessionByToken,
  replaceSessionForDevice,
};
