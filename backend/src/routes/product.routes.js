const router = require('express').Router();
const c = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const v = require('../validators');

router.get('/', validate(v.product.list, 'query'), c.list);
router.get('/brands', c.brands);
router.get('/:slug', c.getBySlug);
router.get('/:slug/related', c.related);

module.exports = router;
