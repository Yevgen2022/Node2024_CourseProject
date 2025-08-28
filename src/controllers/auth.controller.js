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

// exports.register = async (req, res, next) => {
//   try {
//     const { email, pass } = req.body;
//     const result = await authService.register({ email, password: pass });

//     console.log('[RESULT /reguser]', result);    // ← ДОДАЙ

//     if (!result.ok) {
//       return res.json({ success: false, action: result.error?.message || 'create user error' });
//     }
//     return res.json({ success: true, action: 'user was created' });
//   } catch (e) { next(e); }
// };



exports.loginUser = async (req, res, next) => {

   console.log('[HIT] POST /login-user', req.body); // ← ДОДАЙ

  try {
    const { email, pass } = req.body;
    const result = await authService.login({ email, password: pass });

     console.log('[RESULT /login-user]', result);   // ← ДОДАЙ
    

    if (!result.ok) {
      return res.json({ success: false, action: 'user not found' });
    }

    // виставляємо справжній Set-Cookie (краще за повернення в JSON)
    const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    res.cookie('auth', result.token, {
      httpOnly: true,
      sameSite: 'Lax',
      expires
    });

    // для сумісності з твоїм старим підходом також повернемо рядок cookie в JSON
    return res.json({
      success: true,
      action: 'You are logged in',
      cookie: `auth=${result.token}; expires=${expires.toUTCString()}; path=/`
    });
  } catch (e) { next(e); }
};

exports.adminPage = (req, res, next) => {
  // якщо пройшли auth middleware — показуємо admin.html
  res.sendFile('admin.html', { root: HTML_ROOT }, (err) => err && next(err));
};
