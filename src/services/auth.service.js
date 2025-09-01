// Бізнес-логіка: реєстрація / логін / me / мультилогін (список/ревок)
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const cfg = require('../config');
const { findByEmail, createUser } = require('../repositories/user.repo');
const {
  createSession,
  findByToken,
  deleteSessionByToken,

} = require('../repositories/session.repo');


///////////////////////////////////////////////////////////////////////////

async function register({ email, password }) {

  const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12); // 10–12 для дев, 12–14 для прод
  const emailNorm = String(email).trim().toLowerCase();

  const existing = await findByEmail(emailNorm);
  if (existing) {
    return { ok: false, error: { code: 'EMAIL_TAKEN', message: 'User already exists' } };
  }

  const passwordHash = await bcrypt.hash(password, ROUNDS);

  const user = await createUser({ email, passwordHash });
  return { ok: true, user: { id: user.id, email: user.email } };

}

///////////////////////////////////////////////////////////////////////////

async function login({ email, password, oldToken = null }) {

  const user = await findByEmail(email);
  if (!user) {
    return { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' } };
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' } };
  }

  const newToken = crypto.randomBytes(32).toString('base64url');
  const nowSec = Math.floor(Date.now() / 1000);
  const expiresAtSec = nowSec + Number(cfg.security.sessionTtlSec);

  if (oldToken) {
    const prev = await findByToken(oldToken);
    if (prev && prev.userid === user.id) await deleteSessionByToken(oldToken);
  }

  await createSession({ userId: user.id, token: newToken, expiresAtSec });

  return {
    ok: true,
    user: { id: user.id, email: user.email },
    session: { token: newToken, expires_at: expiresAtSec },
  };
}

///////////////////////////////////////////////////////////////////////////

// Ревок конкретної сесії користувача
async function revokeSession(token) {
  const n = await deleteSessionByToken(token);
  if (n === 0) {
    return { ok: false, error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } };
  }
  return { ok: true };
}

module.exports = {
  register,
  login,
  revokeSession,
};