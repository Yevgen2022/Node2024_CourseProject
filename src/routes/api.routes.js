const router = require('express').Router();
const api = require('../controllers/auth.api.controller');
const auth = require('../middleware/auth');

// публічні API
router.post('/register', api.register);
router.post('/login',    api.login);

// захищені API (приклади)
// router.post('/logout', auth, api.logout);

module.exports = router;