const router = require('express').Router();
const c = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const v = require('../validators');

router.post('/register', authLimiter, validate(v.auth.register), c.register);
router.post('/login', authLimiter, validate(v.auth.login), c.login);
router.post('/admin/login', authLimiter, validate(v.auth.login), c.adminLogin);
router.get('/me', protect, c.me);
router.post('/forgot-password', authLimiter, validate(v.auth.forgot), c.forgotPassword);
router.post('/reset-password', authLimiter, validate(v.auth.reset), c.resetPassword);

module.exports = router;
