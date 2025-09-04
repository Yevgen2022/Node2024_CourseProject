const { AppError } = require('../utils/errors');
const { findByToken } = require('../repositories/session.repo');
const { COOKIE_NAME } = require('../utils/cookies');

module.exports = async function auth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token){
      throw new AppError(401, 'UNAUTHENTICATED', 'Missing auth cookie');
    } 

    const rec = await findByToken(token);
    if (!rec) {
      res.clearCookie(cookieName);
      throw new AppError(401, 'UNAUTHENTICATED', 'Invalid session');
    }

    // можна зберегти у req.userId для подальших роутів
    req.userId = rec.userid;
    next();

  } catch (e) { 
    return next(e); }
};
