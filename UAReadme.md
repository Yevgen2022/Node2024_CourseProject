Auth Project — cookie-based аутентифікація на Node/Express

Коротко: серверний застосунок на Express + Sequelize із stateful автентифікацією через httpOnly cookie. Сесії зберігаються в БД (таблиця authkey). Є розділення HTML-сторінок та JSON-API (/api/*), middleware auth, захищена сторінка /admin.

                    Цілі проєкту

*Показати продакшн-лайк підхід до аутентифікації без OAuth/JWT: cookie + сесії в БД.

*Відокремити рівні відповідальності: роутинг, контролери, middleware, сервіси, репозиторії, моделі.

*Дати зрозумілу базу для подальших покращень (TTL, “Remember me”, CSRF, rate-limit, Docker, тести).

                    Техстек

*Runtime: Node.js (Express)

*ORM: Sequelize

*DB: MySQL/MariaDB/Postgres (через sequelize — вибір діалекту в конфіг)

*Middleware: cookie-parser, cors, express.json/urlencoded

*Сесії: власна таблиця authkey (аліас моделі — Session)

*В’юшки: сервер віддає статичний HTML (public/html), без шаблонізатора

*Клієнт: мінімальний JS (fetch) для логіну

                    Архітектура та потік запиту

server.js → app.js
  ├─ global middleware: json, urlencoded, cookieParser
  ├─ static: /public (+ /static alias)
  ├─ CORS: тільки для /api (за потреби)
  ├─ pages router:    '/', '/login', '/admin' (HTML; /admin захищена)
  ├─ api router:      '/api/*'       (JSON: register, login, logout)
  ├─ 404 JSON
  └─ error handler


                    Аутентифікація (stateful):

1. POST /api/login → валідація пароля → створення запису в authkey → Set-Cookie: auth=... (httpOnly).

2. Доступ до захищених ресурсів → middleware auth читає req.cookies.auth, звіряє в БД → або next(), або 401.

3. POST /api/logout → видалення запису з authkey + clear cookie.

                    Структура проєкту (скорочено)
src/
  app.js
  server.js
  config/           # налаштування БД/порта/логування
  controllers/
    pages.controller.js       # HTML (/, /login, /admin)
    auth.api.controller.js    # JSON (/api/register, /api/login, /api/logout)
  middleware/
    auth.js                   # перевірка cookie → сесія в БД
    error.js                  # централізований handler
  repositories/
    user.repo.js              # робота з таблицею users
    session.repo.js           # робота з таблицею authkey (Session)
  services/
    auth.service.js           # бізнес-логіка (register/login/me/sessions)
  models/
    index.js                  # sequelize інстанс, експорт User, Session (alias)
    User.js
    Authkey.js                # таблиця 'authkey' (Session alias)
public/
  html/
    main_page.html
    login.html
    admin.html
  js/
    login.js                  # fetch('/api/login', ...)
  css/ ...


                            Налаштування та запуск
     Вимоги:
 * Node.js 18+;
 * База даних (MySQL/MariaDB/PG)
 

.env (приклад)
PORT=3500
DB_HOST=localhost
DB_NAME=auth_project
DB_USER=root
DB_PASS=secret
DB_DIALECT=mysql       
DB_LOGGING=false
PASS_SALT=@Da!@$7d     # сіль для SHA-256 (навчально)
CORS_ORIGIN=http://localhost:3000  # якщо фронт на іншому origin

Конфіг читається в models/index.js / config.


Команди:
1. npm install
2. npm run dev
server.js викликає initDb() для перевірки підключення до БД перед listen.


Схема БД (актуально до коду)
                     Таблиця users

id (PK, int)

email (varchar, UNIQUE, not null)

password (varchar) — зберігається хеш

createdAt/updatedAt — якщо ввімкнені timestamps у моделі користувача

                    Таблиця authkey (модель Authkey, у коді експортується як Session)

authkey (PK, varchar(44)) — рядок токена

userid (int, FK → users.id)

created_at (int, UNIX seconds)

updated_at (int, UNIX seconds)

timestamps: false (оновлення updated_at робиться хук-ом beforeUpdate)

Ендпоїнти:
HTML (сторінки)
Method	Path	Опис	Auth
GET	/	Головна	—
GET	/login	Форма логіну	—
GET	/admin	Захищена сторінка (HTML)	✓ auth

API (JSON)
Method	          Path	            Body	                     Відповідь (успіх)	                        Помилки
POST	      /api/register	     email, pass (json/urlencoded)	201 { ok:true, code:'USER_CREATED' }	400 BAD_REQUEST, 409 USER_EXISTS, 500 INTERNAL

POST	/api/login	email, pass (json/urlencoded)	200 { ok:true, code:'LOGGED_IN' } + Set-Cookie: auth=...	400 BAD_REQUEST, 401 INVALID_CREDENTIALS

POST	/api/logout	—	200 { ok:true, code:'LOGGED_OUT' } (якщо реалізовано)	401 UNAUTHENTICATED (коли треба)


Кука: auth (httpOnly, SameSite=Lax, optional maxAge) — виставляється на логіні, видаляється на логауті.
Якщо фронт на іншому origin — в fetch треба credentials:'include', а на бекенді CORS увімкнено лише для /api.

Приклади curl
# Реєстрація
curl -i -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&pass=123" \
  http://localhost:3500/api/register

# Логін (запише cookie у cookies.txt)
curl -i -c cookies.txt -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&pass=123" \
  http://localhost:3500/api/login

# Доступ до /admin з cookie
curl -i -b cookies.txt http://localhost:3500/admin

# Логаут
curl -i -b cookies.txt -X POST http://localhost:3500/api/logout

Ключові компоненти
middleware/auth.js

Читає req.cookies.auth.

findByToken(token) у БД:

немає → res.clearCookie('auth') + 401 UNAUTHENTICATED (для HTML можна редірект на /login);

є → req.userId = rec.userid, next().

services/auth.service.js

register: перевірка унікальності, SHA-256(salt+password), створення користувача.

login: валідація пароля, генерація token (довжина 44), createSession({ userid, token }).

meFromCookie: за token → сесія → userId.

(Опційно) listSessions/revokeSession для мультилогіну.

repositories/*

user.repo: findByEmail, createUser, findById.

session.repo: createSession, findByToken, listByUser, deleteById(token, userId), deleteByToken.

Безпекові нотатки (реалістичні очікування)

Паролі зараз хешуються SHA-256 + salt (для простоти).
Roadmap: перейти на bcrypt/argon2 (повільні хеші), додати rate-limit на логін, helmet, опціонально expiresAt для сесій.

Cookie:

same-origin → SameSite=Lax ок;

крос-ориджин → SameSite=None; Secure (потрібен HTTPS) + credentials:'include' на клієнті.

Для HTML-адмінки рекомендується Cache-Control: no-store (можна ввімкнути пізніше).

Розробка та налагодження

Логи корисних точок:

[LOGIN] email → OK/FAIL

[AUTH] url, hasCookie, tokenFound

Error handler повертає JSON для /api/*.

404 — у JSON ({ error: { code:'NOT_FOUND', ... } }).

Roadmap (що легко додати далі)

bcrypt/argon2 для паролів.

expiresAt у сесіях + auto-cleanup старих сесій.

/api/me (вернути профіль по cookie).

UI для “мультилогіну” (список сесій, відкликання).

helmet, rate-limit для /api/login.

Dockerfile + docker-compose (app + db), GitHub Actions (lint/test).

Інтеграційні тести (Jest + supertest) для /api/login та auth middleware.

Скриншоти (опційно)

public/html/login.html (форма логіну)

public/html/admin.html (доступна лише з cookie)