const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
// const cors = require('cors');

// const routes = require('./routes/auth.routes');
const pagesRoutes = require('./routes/pages.routes');
const apiRoutes   = require('./routes/api.routes');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');

const app = express();
// const ROOT = process.cwd();


//Стабільний корінь відносно файлу app.js, а не від CWD
const APP_ROOT = path.resolve(__dirname, '..');
// Збережемо в налаштуваннях Express, щоб діставати у будь-якому місці
app.set('ROOT', APP_ROOT);



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
app.use(express.static(path.join(APP_ROOT, 'public')));      


// CORS вмикаємо лише для /api (за потреби)
// app.use('/api', cors({
//   origin: 'http://localhost:3000', // ваш фронтенд, якщо окремий
//   credentials: true
// }));



// Додатковий "аліас" для тих самих файлів під префіксом /static
// Тобто /static/css/site.css = public/css/site.css
// (Не обов’язково мати обидва; буде працювати і так, і так.)
app.use('/static', express.static(path.join(APP_ROOT, 'public'))); 


/* =========================
 * 3) Роутинг застосунку
 * ========================= */

// Підключаємо усі ваші маршрути на кореневий шлях.
// ВАЖЛИВО: middleware аутентифікації (який читає cookie 'auth')
// має стояти ДО цього рядка, якщо він у вас є.
// app.use('/', routes);



// сторінки без префікса
app.use('/', pagesRoutes);


// app.use((req, res, next) => {
//   console.log('[HIT]', req.method, req.originalUrl);
//   next();
// });

// API під префіксом /api
app.use('/api', apiRoutes);


/* =========================
 * 4) 404 — якщо жоден роут не підійшов
 * ========================= */

// Якщо ми дійшли сюди — жоден попередній роут не обробив запит.
// Повертаємо стандартизовану помилку 404 у JSON.
app.use(notFoundHandler);

/* =========================
 * 5) Централізований обробник помилок
 * ========================= */

// Має мати сигнатуру (err, req, res, next).
// Сюди потрапляють помилки, які кидають/передають через next(err) попередні middleware/роути.
// Тримайте його ОСТАННІМ у ланцюжку app.use(...).
app.use(errorHandler);

module.exports = app;
