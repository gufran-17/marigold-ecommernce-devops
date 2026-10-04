const router = require('express').Router();
const c = require('../controllers/review.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const v = require('../validators');

router.get('/product/:productId', c.listForProduct);
router.post('/', protect, validate(v.review.create), c.create);
router.delete('/:id', protect, c.remove);

module.exports = router;
