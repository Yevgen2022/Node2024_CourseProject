// src/utils/cookieOptions.js
module.exports = (overrides = {}) => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',                 // має збігатися при setCookie і clearCookie
  ...overrides,
});
