const authService = require('../services/auth.service');
const cookieOptions = require('../utils/cookieOptions');
const cfg = require('../config');



// POST /api/register. //////////////////////////////////////////////
exports.register = async (req, res, next) => {
  try {
    const { email, pass } = req.body;

    if (!email || !pass) {
      return res.status(400).json({
        ok: false, code: 'BAD_REQUEST',
        message: 'Email and password are required'
      });
    }

    const result = await authService.register({ email, password: pass });

    if (!result.ok && result.error?.message === 'user exists') {
      return res.status(409).json({
        ok: false, code: 'USER_EXISTS',
        message: 'User already exists'
      });
    }

    if (!result.ok) {
      return res.status(500).json({
        ok: false, code: 'INTERNAL',
        message: 'Create user error'
      });
    }

    return res.status(201).json({ ok: true, code: 'USER_CREATED' });
  } catch (e) { next(e); }
};


// POST /api/login. //////////////////////////////////////////////
exports.login = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim();
    const password = String(req.body?.password ?? req.body?.pass ?? '').trim();
    const oldToken = req.cookies?.[cfg.security.cookieName] || null;

    if (!email || !password) {
      return res.status(400).json({
        ok: false, code: 'BAD_REQUEST',
        error: 'Email and password are required'
      });
    }

    const result = await authService.login({ email, password, oldToken });
    if (!result.ok) return res.status(401).json(result);

    const expiresDate = new Date(result.session.expires_at * 1000);

    return res
      .status(200)

      .cookie(cfg.security.cookieName, result.session.token, {
        httpOnly: true,
        sameSite: String(cfg.security.cookieSameSite || 'lax').toLowerCase(), // 'lax' | 'strict' | 'none'
        secure: cfg.security.cookieSecure ?? (cfg.env === 'production'),
        path: '/',
        expires: expiresDate,
      })

      .json({ ok: true, code: 'LOGGED_IN' });
  } catch (e) {
    return next(e);
  }
};


// POST /api/logout. //////////////////////////////////////////////
exports.logout = async (req, res, next) => {
  const opts = cookieOptions();
  const token = req.cookies?.auth;

  try {
    if (token) {
      // Ідемпотентно ігноруємо SESSION_NOT_FOUND
      await authService.revokeSession(token);
    }

    res.clearCookie('auth', opts);

    return res.status(204).end();
  } catch (e) {
    
    res.clearCookie('auth', opts);

    return res.status(500).json({
      ok: false,
      error: { code: 'INTERNAL', message: 'Logout failed' },
    });
  }
};
