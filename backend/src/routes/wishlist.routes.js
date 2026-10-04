const router = require('express').Router();
const c = require('../controllers/wishlist.controller');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.get);
router.post('/:productId', c.add);
router.post('/:productId/from-cart', c.moveFromCart);
router.delete('/:productId', c.remove);

module.exports = router;
