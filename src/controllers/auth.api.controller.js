const authService = require('../services/auth.service');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookies');
const cfg = require('../config');
const { asyncHandler, AppError } = require('../utils/errors');



// POST /api/register. //////////////////////////////////////////////
exports.register = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim();
  const password = String(req.body?.pass ?? req.body?.password ?? '').trim();

  if (!email || !password) {
    throw new AppError(400, 'BAD_REQUEST', 'Email and password are required');
  }

  const result = await authService.register({ email, password });

  if (!result.ok) {
    const code = result.error?.code || 'BAD_REQUEST';
    const status = code === 'EMAIL_TAKEN' ? 409 : 400;

    throw new AppError(status, code, result.error?.message || 'Registration failed');
  }

  // якщо не логінимо автоматично після реєстрації:
  return res.status(201).json({
    ok: true,
    code: 'USER_CREATED',
    user: result.user, // { id, email } — якщо сервіс повертає
  });
});

// POST /api/login. //////////////////////////////////////////////
exports.login = asyncHandler(async (req, res) => {
  const email = String(req.body?.email || '').trim();
  const password = String(req.body?.password ?? req.body?.pass ?? '').trim();
  const oldToken = req.cookies?.[cfg.security.cookieName] || null;

  if (!email || !password) {
    throw new AppError(400, 'BAD_REQUEST', 'Email and password are required');
  }

  const result = await authService.login({ email, password, oldToken });
  if (!result.ok) {
    // приклад: мапимо результат сервісу в AppError
    const status = result.error?.code === 'BAD_CREDENTIALS' ? 401 : 400;
    throw new AppError(status, result.error.code, result.error.message);
  }

  setAuthCookie(res, result.session.token, result.session.expires_at);
  res.status(200).json({ ok: true, code: 'LOGGED_IN' });
});


// POST /api/logout. //////////////////////////////////////////////
exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[cfg.security.cookieName];
  if (token) await authService.revokeSession(token); // ідемпотентно
  clearAuthCookie(res);
  res.status(204).end();
});
