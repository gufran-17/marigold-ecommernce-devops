const router = require('express').Router();
const c = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const v = require('../validators');

router.use(protect);
router.get('/profile', c.getProfile);
router.put('/profile', validate(v.user.updateProfile), c.updateProfile);
router.put('/password', validate(v.user.changePassword), c.changePassword);
router.post('/addresses', validate(v.user.address), c.addAddress);
router.put('/addresses/:id', validate(v.user.address), c.updateAddress);
router.delete('/addresses/:id', c.deleteAddress);

module.exports = router;
