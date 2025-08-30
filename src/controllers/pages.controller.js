const path = require('path');

// public/html відносно кореня проекту
const HTML_ROOT = path.resolve(__dirname, '..', '..', 'public', 'html');

exports.mainPage = (req, res, next) => {
  res.sendFile('main_page.html', { root: HTML_ROOT }, (err) => err && next(err));
};

exports.loginPage = (req, res, next) => {
  res.sendFile('login.html', { root: HTML_ROOT }, (err) => err && next(err));
};

exports.adminPage = (req, res, next) => {
  // якщо пройшли auth middleware — показуємо admin.html
  res.sendFile('admin.html', { root: HTML_ROOT }, (err) => err && next(err));
};
