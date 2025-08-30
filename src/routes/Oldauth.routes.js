const path = require('path');
const router = require('express').Router();

const ctrl = require('../controllers/auth.controller');
const auth = require('../middleware/auth');

// сторінки (аналог case '/' і '/login')
router.get('/', ctrl.mainPage);
router.get('/login', ctrl.loginPage);

// API (аналог '/reguser' (POST) і '/login-user' (POST))
router.post('/reguser', ctrl.register);
router.post('/login-user', ctrl.loginUser);

// захищена сторінка /admin (раніше перевірявся cookie всередині case)
router.get('/admin', auth, ctrl.adminPage);

module.exports = router;
