const authService = require('../services/auth.service');
const cookieOptions = require('../utils/cookieOptions');   

// POST /api/register
exports.register = async (req, res, next) => {
  try {
    const { email, pass } = req.body;
    if (!email || !pass) {
      return res.status(400).json({ ok: false, code: 'BAD_REQUEST', message: 'Email and password are required' });
    }

    const result = await authService.register({ email, password: pass });

    if (!result.ok && result.error?.message === 'user exists') {
      return res.status(409).json({ ok: false, code: 'USER_EXISTS', message: 'User already exists' });
    }

    if (!result.ok) {
      return res.status(500).json({ ok: false, code: 'INTERNAL', message: 'Create user error' });
    }

    return res.status(201).json({ ok: true, code: 'USER_CREATED' });
  } catch (e) { next(e); }
};

// POST /api/login
exports.login = async (req, res, next) => {
  console.log('[HIT] POST /api/login', req.body);
  try {
    const { email, pass } = req.body;
    if (!email || !pass) {
      return res.status(400).json({ ok: false, code: 'BAD_REQUEST', message: 'Email and password are required' });
    }

    const result = await authService.login({ email, password: pass });
    console.log('[RESULT /api/login]', result);

    const authToken = result?.token || result?.session?.token;
    if (!result.ok || !authToken) {
      return res.status(401).json({ ok: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    // залишаю вашу поточну cookie-конфігурацію з maxAge на 7 днів
    res.cookie('auth', authToken, {
      httpOnly: true,
      sameSite: 'lax',          // у проді крос-сайт → 'none' + secure: true
      // secure: true,          // вмикайте на HTTPS
      maxAge: 7 * 24 * 3600 * 1000
    });

    return res.status(200).json({ ok: true, code: 'LOGGED_IN' });
  } catch (e) { next(e); }
};


//POST /api/logout
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.auth;         // синхронно
    console.log('[logout] token:', token);

    if (token) {
      // якщо у тебе є "м'який" attach, можна передати req.userId; інакше видалимо по токену
      await authService.revokeSession(token, req.userId ?? null);
    }

    // чистимо cookie в будь-якому випадку (ідемпотентно)
    res.clearCookie('auth', cookieOptions());

    return res.status(200).json({ ok: true });
  } catch (e) { next(e); }
};