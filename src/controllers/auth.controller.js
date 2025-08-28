const path = require('path');
const authService = require('../services/auth.service');

// const ROOT = process.cwd();                         // <-- корінь проєкту
// const HTML_ROOT = path.join(ROOT, 'public', 'html'); // <-- public/html у корені
const HTML_ROOT = path.resolve(__dirname, '..', '..', 'public', 'html');

exports.mainPage = (req, res, next) => {
  res.sendFile('main_page.html', { root: HTML_ROOT }, (err) => err && next(err));
};

exports.loginPage = (req, res, next) => {
  res.sendFile('login.html', { root: HTML_ROOT }, (err) => err && next(err));
};



// controllers/auth.controller.js
exports.register = async (req, res, next) => {
  try {
    const { email, pass } = req.body;
    if (!email || !pass) {
      // некоректний запит
      return res.status(400).json({ ok: false, code: 'BAD_REQUEST', message: 'Email and password are required' });
    }

    const result = await authService.register({ email, password: pass });

    if (!result.ok && result.error?.message === 'user exists') {
      // Користувач уже існує
      return res.status(409).json({ ok: false, code: 'USER_EXISTS', message: 'User already exists' });
    }

    if (!result.ok) {
      // Інша помилка
      return res.status(500).json({ ok: false, code: 'INTERNAL', message: 'Create user error' });
    }

    // Успішно створено
    return res.status(201).json({ ok: true, code: 'USER_CREATED' });
  } catch (e) { next(e); }
};

// controllers/auth.controller.js
exports.loginUser = async (req, res, next) => {

  console.log('[HIT] POST /login-user', req.body);

  try {
    const { email, pass } = req.body;
    if (!email || !pass) {
      return res.status(400).json({ ok: false, code: 'BAD_REQUEST', message: 'Email and password are required' });
    }

    const result = await authService.login({ email, password: pass });
    console.log('[RESULT /login-user]', result);

    // беремо токен з того місця, де він реально є
    const authToken = result?.token || result?.session?.token;

    if (!result.ok || !authToken) {
      // невірні креденшали
      return res.status(401).json({ ok: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
    }

    // ставимо httpOnly cookie (без повернення її у JSON)
    // result.token — це унікальний токен сесії (рядок) збережений у БД
    res.cookie('auth', authToken, {
      httpOnly: true,
      sameSite: 'lax',          // 'lax' малими
      // secure: true,          // увімкни на HTTPS
      maxAge: 7 * 24 * 3600 * 1000
    });

    // успішний логін
    return res.status(200).json({ ok: true, code: 'LOGGED_IN' });
  } catch (e) {
    next(e);
  }
};

exports.adminPage = (req, res, next) => {
  // якщо пройшли auth middleware — показуємо admin.html
  res.sendFile('admin.html', { root: HTML_ROOT }, (err) => err && next(err));
};
