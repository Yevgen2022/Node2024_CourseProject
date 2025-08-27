const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const routes = require('./routes/auth.routes');
const errorHandler = require('./middleware/error');

const app = express();
const ROOT = process.cwd();

// парсери тіла (JSON і x-www-form-urlencoded як твій qs.parse)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// статика (аналог твого staticFile для /assets і т.п.)
// app.use('/static', express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(ROOT, 'public')));            // /css/site.css, /js/login.js, ...
app.use('/static', express.static(path.join(ROOT, 'public'))); // /static/css/site.css, ...

// маршрути
app.use('/', routes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// централізований обробник помилок
app.use(errorHandler);

module.exports = app;
