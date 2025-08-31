const router = require('express').Router();
const api = require('../controllers/auth.api.controller');
const auth = require('../middleware/auth');

// публічні API
router.post('/register', api.register);
router.post('/login',    api.login);
router.post('/logout', api.logout);


module.exports = router;