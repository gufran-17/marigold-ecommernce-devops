const router = require('express').Router();
const c = require('../controllers/cart.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const v = require('../validators');

router.use(protect);
router.get('/', c.get);
router.post('/items', validate(v.cart.add), c.addItem);
router.patch('/items/:productId', validate(v.cart.update), c.updateItem);
router.delete('/items/:productId', c.removeItem);
router.delete('/', c.clear);

module.exports = router;
