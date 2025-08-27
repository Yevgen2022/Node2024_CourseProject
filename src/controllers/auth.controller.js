const path = require('path');
const authService = require('../services/auth.service');

// де лежать твої HTML-файли (як раніше: /html/*.html в корені проекту)
const HTML_ROOT = path.join(__dirname, '..', 'public', 'html');

exports.mainPage = (req, res) => {
  res.sendFile(path.join(HTML_ROOT, 'main_page.html'));
};

exports.loginPage = (req, res) => {
  res.sendFile(path.join(HTML_ROOT, 'login.html'));
};

exports.register = async (req, res, next) => {
  try {
    const { email, pass } = req.body;
    const result = await authService.register({ email, password: pass });
    if (!result.ok) {
      return res.json({ success: false, action: result.error?.message || 'create user error' });
    }
    return res.json({ success: true, action: 'user was created' });
  } catch (e) { next(e); }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { email, pass } = req.body;
    const result = await authService.login({ email, password: pass });
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

exports.adminPage = (req, res) => {
  // якщо пройшли auth middleware — показуємо admin.html
  res.sendFile(path.join(HTML_ROOT, 'admin.html'));
};
