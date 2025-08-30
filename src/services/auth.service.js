// Бізнес-логіка: реєстрація / логін / me / мультилогін (список/ревок)
const crypto = require('crypto');
const randomstring = require('randomstring');
const { findByEmail, createUser } = require('../repositories/user.repo');
const {
  createSession,
  findByToken,
  listByUser,
  deleteById: deleteSessionById,
} = require('../repositories/session.repo');

// Щоб було конфігуровано, з .env (fallback — твій старий salt)
const PASS_SALT = process.env.PASS_SALT || '@Da!@$7d';

// просте хешування як у твоєму класі
function hashPassword(plain) {
  return crypto.createHash('sha256').update(PASS_SALT + plain).digest('base64');
}

// Реєстрація
async function register({ email, password }) {
  const existing = await findByEmail(email);
  if (existing) {
    return { ok: false, error: { code: 'EMAIL_TAKEN', message: 'User already exists' } };
  }
  const passwordHash = hashPassword(password);
  const user = await createUser({ email, passwordHash });
  return { ok: true, user: { id: user.id, email: user.email } };
}

// Логін + створення сесії (мультилогін дозволений)
async function login({ email, password }) {
  const user = await findByEmail(email);
  if (!user) {
    return { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' } };
  }
  const incomingHash = hashPassword(password);
  if (incomingHash !== user.password) {
    return { ok: false, error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect' } };
  }

  const token = randomstring.generate(44);
  //  const session = await createSession({ userId: user.id, token });
  await createSession({ userId: user.id, token }); // створюємо в authkey

  return {
    ok: true,
    user: { id: user.id, email: user.email },
    session: { token }, 
    // session: { id: session.id, token },
  };
}

// Отримати поточного користувача по cookie токену
async function meFromCookie(token) {
  const session = await findByToken(token);
  if (!session) {
    return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Session not found' } };
  }
  // Якщо в моделі Session є асоціація belongsTo(User), можна так:
  const user = session.User ? session.User : (await session.getUser?.());
  // Якщо асоціації ще немає — збережи userId в самій сесії або додай зв’язок у models/index.js
  const userId = user?.id || session.userid;
  return { ok: true, userId };
}

// Список сесій користувача (мультилогін)
async function listSessions(userId) {
  const items = await listByUser(userId);
  return items.map(s => ({ id: s.authkey, createdAt: s.created_at }));
}

// Ревок конкретної сесії користувача
async function revokeSession(token, userId) {
  const n = await deleteSessionById(token, userId);
  if (!n) return { ok: false, error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' } };
  return { ok: true };
}

module.exports = {
  register,
  login,
  meFromCookie,
  listSessions,
  revokeSession,
};