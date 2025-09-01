//Working with the auth table
const { Session } = require('../models');


async function createSession({ userId, token, expiresAtSec }) {

  return Session.create({
    authkey: token,    // PK
    userid: userId,
    expires_at: expiresAtSec,
  });
}

async function findByToken(token) {
  const row = await Session.findOne({ where: { authkey: token }, raw: true });
  return row;
}


async function deleteSessionByToken(token) {
  return Session.destroy({ where: { authkey: token } });
}

module.exports = {
  createSession,
  findByToken,
  deleteSessionByToken,
};
