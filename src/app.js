const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const routes = require('./routes/auth.routes');
const errorHandler = require('./middleware/error');

const app = express();
const ROOT = process.cwd();


/*=====================================
         0)Порядок — критично важливий
1.Спершу парсери / CORS / автентифікаційний
middleware → тоді статика/роутери → вкінці 404 → і вже після цього error-handler.
2.Якщо, наприклад, cookieParser або сесійний middleware стоятимуть після
роутів — req.cookies/req.user там будуть порожні.
======================================*/



/* =========================
 * 1) Глобальні middleware
 * ========================= */
// Парсимо JSON-тіло запитів: Content-Type: application/json
// -> додає об'єкт у req.body
app.use(express.json());


// Парсимо URL-encoded форми: Content-Type: application/x-www-form-urlencoded
// extended: true — дозволяє вкладені об'єкти (через qs-парсер)
app.use(express.urlencoded({ extended: true }));

// Парсимо cookie з заголовку Cookie -> додає об'єкт у req.cookies
// (в т.ч. дістане ваш 'auth' токен для сесії)
app.use(cookieParser());


/* =========================
 * 2) Статичні файли
 * ========================= */

// Віддаємо статичні файли з папки /public з кореня сайту.
// Приклад: /css/site.css, /js/login.js, /images/logo.png
app.use(express.static(path.join(ROOT, 'public')));      

// Додатковий "аліас" для тих самих файлів під префіксом /static
// Тобто /static/css/site.css = public/css/site.css
// (Не обов’язково мати обидва; буде працювати і так, і так.)
app.use('/static', express.static(path.join(ROOT, 'public'))); 


/* =========================
 * 3) Роутинг застосунку
 * ========================= */

// Підключаємо усі ваші маршрути на кореневий шлях.
// ВАЖЛИВО: middleware аутентифікації (який читає cookie 'auth')
// має стояти ДО цього рядка, якщо він у вас є.
app.use('/', routes);




/* =========================
 * 4) 404 — якщо жоден роут не підійшов
 * ========================= */

// Якщо ми дійшли сюди — жоден попередній роут не обробив запит.
// Повертаємо стандартизовану помилку 404 у JSON.
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});


/* =========================
 * 5) Централізований обробник помилок
 * ========================= */

// Має мати сигнатуру (err, req, res, next).
// Сюди потрапляють помилки, які кидають/передають через next(err) попередні middleware/роути.
// Тримайте його ОСТАННІМ у ланцюжку app.use(...).
app.use(errorHandler);

module.exports = app;
