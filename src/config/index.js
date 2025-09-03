// src/config/index.js
const dotenv = require('dotenv');
dotenv.config();


//a small helper for correct parsing of boolean values ​​from .env.
const toBool = (v, def = false) =>
  v == null || v === '' ? def : /^(1|true|yes|on)$/i.test(String(v));


//helper for normalizing values ​​from .env
//specifically for the SameSite parameter in the cookie.
const toSameSite = (v = 'lax') => {
  const s = String(v).toLowerCase();
  return s === 'none' ? 'none' : s === 'strict' ? 'strict' : 'lax';
};

const env = process.env.NODE_ENV || 'development';
const port = Number(process.env.PORT || 3500);

// cookieSameSite: lax | strict | none
const cookieSameSite = toSameSite(process.env.COOKIE_SAMESITE || 'lax');

// cookieSecure: with .env if specified, otherwise prod ⇒ true
let cookieSecure = process.env.COOKIE_SECURE != null && process.env.COOKIE_SECURE !== ''
  ? toBool(process.env.COOKIE_SECURE)
  : env === 'production';

// Якщо SameSite=None → Secure має бути true (вимога стандарту)
if (cookieSameSite === 'none') cookieSecure = true;

module.exports = {
  env,
  port,
  security: {
    cookieName: process.env.AUTH_COOKIE || 'auth',
    cookieSecure,
    cookieSameSite,           // 'lax' | 'strict' | 'none'
    sessionTtlSec: Number(process.env.SESSION_TTL_SEC || 7200), // 2h default
  },
  db: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'Gena2022$',
    database: process.env.DB_NAME || 'node_2024',
    logging: process.env.DB_LOGGING === 'true',
  },
};
