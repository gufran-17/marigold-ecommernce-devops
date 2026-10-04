const router = require('express').Router();
const c = require('../controllers/admin.controller');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const v = require('../validators');

router.use(protect, authorize('admin'));

router.get('/stats', c.stats);

router.get('/products', c.listProducts);
router.post('/products', validate(v.product.body), c.createProduct);
router.post('/products/images', upload.array('images', 5), c.uploadImages);
router.get('/products/:id', c.getProduct);
router.put('/products/:id', validate(v.product.body), c.updateProduct);
router.delete('/products/:id', c.deleteProduct);
router.patch('/products/:id/toggle', c.toggleProduct);
router.patch('/products/:id/stock', validate(v.product.stock), c.updateStock);

router.get('/categories', c.listCategories);
router.post('/categories', validate(v.category.body), c.createCategory);
router.put('/categories/:id', validate(v.category.body), c.updateCategory);
router.delete('/categories/:id', c.deleteCategory);

router.get('/orders', validate(v.order.adminList, 'query'), c.listOrders);
router.get('/orders/:id', c.getOrder);
router.patch('/orders/:id/status', validate(v.order.status), c.updateOrderStatus);

router.get('/customers', c.listCustomers);
router.get('/customers/:id', c.getCustomer);
router.patch('/customers/:id/toggle', c.toggleCustomer);

router.get('/reviews', c.listReviews);
router.delete('/reviews/:id', c.deleteReview);

router.get('/inventory', c.inventory);

module.exports = router;
