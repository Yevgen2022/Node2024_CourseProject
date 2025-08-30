const path = require('path');

// Хелпер: дістати папку з HTML, базуючись на ROOT з app.js
const getHtmlRoot = (req) => path.join(req.app.get('ROOT'), 'public', 'html');

exports.mainPage = (req, res, next) => {
  res.sendFile('main_page.html', { root: getHtmlRoot(req) }, (err) => err && next(err));
};

exports.loginPage = (req, res, next) => {
  res.sendFile('login.html', { root: getHtmlRoot(req) }, (err) => err && next(err));
};

exports.adminPage = (req, res, next) => {
  // якщо пройшли auth middleware — показуємо admin.html
  res.sendFile('admin.html', { root: getHtmlRoot(req) }, (err) => err && next(err));
};
