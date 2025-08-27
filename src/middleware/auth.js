const cookieName = 'auth';
const { findByToken } = require('../repositories/session.repo');

module.exports = async function auth(req, res, next) {
  try {
    const token = req.cookies?.[cookieName];
    if (!token) return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing auth cookie' } });

    const rec = await findByToken(token);
    if (!rec) {
      res.clearCookie(cookieName);
      return res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid session' } });
    }

    // можна зберегти у req.userId для подальших роутів
    req.userId = rec.userid;
    next();
  } catch (e) { next(e); }
};
