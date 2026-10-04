const router = require('express').Router();
const c = require('../controllers/order.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const v = require('../validators');

router.use(protect);
router.post('/', validate(v.order.create), c.create);
router.get('/', c.mine);
router.get('/:id', c.getOne);
router.patch('/:id/cancel', c.cancel);

module.exports = router;
