// src/utils/cookies.js
const { security } = require('../config');

const COOKIE_NAME = security.cookieName;

function baseCookieOptions() {
    return {
        httpOnly: true,                    //Cookie is not available with JS in the browser.
        sameSite: security.cookieSameSite, // 'lax' | 'strict' | 'none'
        secure: security.cookieSecure,     //whether the browser will send your cookie only over an HTTPS connection.
        path: '/',                         // critical: the same path and set/clear
    };
}

function setAuthCookie(res, token, expiresAtSec) {
    res.cookie(COOKIE_NAME, token, {
        ...baseCookieOptions(),
        expires: new Date(expiresAtSec * 1000),
    });
}

function clearAuthCookie(res) {
    const base = baseCookieOptions();
    res.clearCookie(COOKIE_NAME, base);

}

module.exports = { COOKIE_NAME, baseCookieOptions, setAuthCookie, clearAuthCookie };
