Auth Project — Cookie-based Authentication on Node/Express

Server app built with Express + Sequelize using stateful authentication via httpOnly cookies. Sessions are stored in the database (table authkey). The app cleanly separates HTML pages from JSON API (/api/*), uses an auth middleware, and protects the /admin page.

Project Goals

Demonstrate a production-like cookie + DB session auth flow (no OAuth/JWT).

Enforce clear separation of concerns: routing, controllers, middleware, services, repositories, models.

Provide a solid base for further hardening (session TTL, “Remember me”, CSRF, rate-limit, Docker, tests).

Tech Stack

Runtime: Node.js (Express)

ORM: Sequelize

DB: MySQL/MariaDB/Postgres (dialect via config)

Middleware: cookie-parser, cors, express.json, express.urlencoded

Sessions: custom table authkey (exported as model alias Session)

Views: static HTML from public/html (no templating)

Client: minimal JS (fetch) for login

Architecture & Request Flow
server.js → app.js
  ├─ global middleware: json, urlencoded, cookieParser
  ├─ static: /public (+ /static alias)
  ├─ CORS: only for /api (if needed)
  ├─ pages router:    '/', '/login', '/admin' (HTML; /admin protected)
  ├─ api router:      '/api/*'       (JSON: register, login, logout)
  ├─ 404 JSON
  └─ error handler


Authentication (stateful):

POST /api/login → validate password → create a row in authkey → Set-Cookie: auth=... (httpOnly).

For protected routes → auth middleware reads req.cookies.auth, checks DB → either next() or 401.

POST /api/logout → delete row in authkey + clear cookie.

Project Structure (short)
src/
  app.js
  server.js
  config/                 # DB/port/logging settings
  controllers/
    pages.controller.js       # HTML: '/', '/login', '/admin'
    auth.api.controller.js    # JSON: /api/register, /api/login, /api/logout
  middleware/
    auth.js                   # cookie → DB session check
    error.js                  # centralized error handler
  repositories/
    user.repo.js              # users table
    session.repo.js           # authkey (Session alias)
  services/
    auth.service.js           # business logic (register/login/me/sessions)
  models/
    index.js                  # sequelize instance, exports User & Session alias
    User.js
    Authkey.js                # table 'authkey' (exported as Session)
public/
  html/
    main_page.html
    login.html
    admin.html
  js/
    login.js                  # fetch('/api/login', ...)
  css/ ...

Setup & Run
Prereqs

Node.js 18+

A database (MySQL/MariaDB/Postgres)

.env example
PORT=3500
DB_HOST=localhost
DB_NAME=auth_project
DB_USER=root
DB_PASS=secret
DB_DIALECT=mysql       # or postgres/mariadb
DB_LOGGING=false
PASS_SALT=@Da!@$7d     # salt for SHA-256 (training/demo)
CORS_ORIGIN=http://localhost:3000  # if front-end runs on a different origin


Config is read in models/index.js / config.

Commands
npm install
node src/server.js            # or: npm run dev


server.js calls initDb() to verify DB connectivity before listen.

Database Schema (matches the code)
users

id (PK, int)

email (varchar, UNIQUE, not null)

password (varchar) — stores the hash

createdAt / updatedAt — if timestamps enabled for the user model

authkey (model file Authkey.js, exported as Session)

authkey (PK, varchar(44)) — session token string

userid (int, FK → users.id)

created_at (int, UNIX seconds)

updated_at (int, UNIX seconds)

timestamps: false (a beforeUpdate hook updates updated_at)

Endpoints
HTML (Pages)
Method	Path	Description	Auth
GET	/	Home	—
GET	/login	Login form	—
GET	/admin	Protected page (HTML)	✓ auth
API (JSON)
Method	Path	Body	Success Response	Errors
POST	/api/register	email, pass (json/urlencoded)	201 { ok:true, code:'USER_CREATED' }	400 BAD_REQUEST, 409 USER_EXISTS, 500 INTERNAL
POST	/api/login	email, pass (json/urlencoded)	200 { ok:true, code:'LOGGED_IN' } + Set-Cookie: auth=...	400 BAD_REQUEST, 401 INVALID_CREDENTIALS
POST	/api/logout	—	200 { ok:true, code:'LOGGED_OUT' } (if implemented)	401 UNAUTHENTICATED (when applicable)

Cookie: auth (httpOnly, SameSite=Lax, optional maxAge).
Cross-origin front-end: use credentials:'include' in fetch, and enable CORS only for /api.

curl Samples
# Register
curl -i -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&pass=123" \
  http://localhost:3500/api/register

# Login (stores cookie in cookies.txt)
curl -i -c cookies.txt -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@example.com&pass=123" \
  http://localhost:3500/api/login

# Access /admin with cookie
curl -i -b cookies.txt http://localhost:3500/admin

# Logout
curl -i -b cookies.txt -X POST http://localhost:3500/api/logout

Key Components
middleware/auth.js

Reads req.cookies.auth.

DB lookup with findByToken(token):

not found → res.clearCookie('auth') + 401 UNAUTHENTICATED (for HTML you can redirect to /login);

found → req.userId = rec.userid, next().

services/auth.service.js

register: uniqueness check, SHA-256(salt+password), create user.

login: password validation, token generation (length 44), createSession({ userid, token }).

meFromCookie: via token → session → userId.

(Optional) listSessions / revokeSession for multi-login.

repositories/*

user.repo: findByEmail, createUser, findById.

session.repo: createSession, findByToken, listByUser, deleteById(token, userId), deleteByToken.

Security Notes (realistic expectations)

Passwords currently use SHA-256 + salt (for simplicity/demo).
Roadmap: switch to bcrypt/argon2 (slow hashes), add login rate-limit, helmet, optional session expiresAt.

Cookies:

same-origin → SameSite=Lax works well;

cross-origin → SameSite=None; Secure (HTTPS required) + credentials:'include' on the client.

For the admin HTML page, consider Cache-Control: no-store (can be added later).

Development & Debugging

Helpful logs:

[LOGIN] email → OK/FAIL

[AUTH] url, hasCookie, tokenFound

Error handler returns JSON for /api/*.

404 is JSON: { error: { code:'NOT_FOUND', ... } }.

Roadmap (easy next steps)

Migrate passwords to bcrypt/argon2.

Add expiresAt to sessions + auto-cleanup of expired rows.

/api/me to return the profile by cookie.

UI for multi-login (list sessions + revoke).

helmet, rate-limit for /api/login.

Dockerfile + docker-compose (app + db), GitHub Actions (lint/test).

Integration tests (Jest + supertest) for /api/login and the auth middleware.

Screenshots (optional)

public/html/login.html — login form

public/html/admin.html — protected page





                          The second option

                          Auth Project — Cookie-based Auth (Node/Express)

Production-like stateful auth without JWT: httpOnly cookie + DB session. Separate HTML and API, auth middleware, protected /admin.

Stack

Node.js (Express), Sequelize (MySQL/Postgres)

Middleware: cookie-parser, cors, express.json, express.urlencoded

Static HTML (no templating), client login via fetch

Run
npm i
cp .env.example .env    # PORT, DB_*, PASS_SALT, CORS_ORIGIN (if needed)
node src/server.js

How it works

POST /api/login: validate password → create row in authkey → Set-Cookie: auth=... (httpOnly).

Protected routes: auth middleware reads cookie, checks DB → next() or 401.

POST /api/logout: delete session row + clear cookie.

Routes

Pages

GET / — Home

GET /login — Login form

GET /admin — Protected page (requires cookie)

API

POST /api/register → 201 { ok:true, code:'USER_CREATED' }

POST /api/login → 200 { ok:true, code:'LOGGED_IN' } + cookie

POST /api/logout → 200 { ok:true, code:'LOGGED_OUT' }

Project layout

src/app.js (middleware, static, routers) • src/server.js (boot) • controllers/ (pages/api) • middleware/auth.js • services/auth.service.js • repositories/ (user/session) • models/ (User, Authkey→Session) • public/html|js|css

Notes

Passwords: currently SHA-256 + salt (demo).

Cookies: same-origin → SameSite=Lax; cross-origin → SameSite=None; Secure + credentials:'include'.

Suggested next steps: bcrypt/argon2, session TTL, /api/me, helmet, rate-limit, Docker, tests.

# .env.example
PORT=3500

DB_HOST=localhost
DB_NAME=auth_project
DB_USER=root
DB_PASS=secret
DB_DIALECT=mysql        # or: postgres | mariadb
DB_LOGGING=false

# Demo salt for SHA-256 (training)
PASS_SALT=@Da!@$7d

# If frontend runs on a different origin (uncomment/adjust as needed)
# CORS_ORIGIN=http://localhost:3000
