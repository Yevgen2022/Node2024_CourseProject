
const router = require('express').Router();

const pages = require('../controllers/pages.controller');
const auth = require('../middleware/auth');

router.get('/', pages.mainPage);
router.get('/login', pages.loginPage);
router.get('/admin', auth, pages.adminPage); // захищена HTML-сторінка

module.exports = router;