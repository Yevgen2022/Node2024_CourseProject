const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3500),
  security: {
    cookieName: process.env.AUTH_COOKIE || 'auth',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    cookieSameSite: (process.env.COOKIE_SAMESITE || 'lax').toLowerCase(),
    sessionTtlSec: Number(process.env.SESSION_TTL_SEC || 7200), //2 hours default
    passSalt: process.env.PASS_SALT || '@Da!@$7d'
  },
  db: {
    dialect: process.env.DB_DIALECT || 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'node_2024',
    logging: process.env.DB_LOGGING === 'true'
  }
};
