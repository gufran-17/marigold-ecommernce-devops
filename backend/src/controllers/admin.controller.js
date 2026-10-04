const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const slugify = require('../utils/slugify');
const { success, created } = require('../utils/response');
const { getPagination, pageMeta } = require('../utils/pagination');
const orderService = require('../services/order.service');
const imageStorage = require('../services/imageStorage.service');
const { recalculateRating } = require('../services/review.service');
const logger = require('../config/logger');

/* ---------- Stats ---------- */
exports.stats = asyncHandler(async (_req, res) => {
  const [totalProducts, totalCustomers, totalOrders, pendingOrders, deliveredOrders, revenueAgg, lowStock, recentOrders, recentCustomers, byStatus] =
    await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' }, paymentStatus: { $in: ['Paid'] } } },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
      ]),
      Product.find({ $or: [{ isLowStock: true }, { stock: 0 }] }).sort({ stock: 1 }).limit(8).select('name sku stock lowStockThreshold images slug'),
      Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email'),
      User.find({ role: 'customer' }).sort({ createdAt: -1 }).limit(6),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
    ]);

  const pendingRevenueAgg = await Order.aggregate([
    { $match: { orderStatus: { $nin: ['Cancelled', 'Delivered'] }, paymentStatus: 'Pending' } },
    { $group: { _id: null, amount: { $sum: '$totalAmount' } } },
  ]);

  success(
    res,
    {
      totals: { totalProducts, totalCustomers, totalOrders, pendingOrders, deliveredOrders },
      revenue: { collected: revenueAgg[0] ? revenueAgg[0].revenue : 0, pending: pendingRevenueAgg[0] ? pendingRevenueAgg[0].amount : 0 },
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      lowStock,
      recentOrders,
      recentCustomers,
    },
    'Statistics fetched'
  );
});

/* ---------- Products ---------- */
exports.listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const filter = {};
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: rx }, { sku: rx }, { brand: rx }];
  }
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'inactive') filter.isActive = false;
  if (req.query.lowStock === 'true') filter.isLowStock = true;
  const [products, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);
  success(res, { products, pagination: pageMeta(total, page, limit) }, 'Products fetched');
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) throw ApiError.notFound('Product not found');
  success(res, { product }, 'Product fetched');
});

async function uniqueSlug(name, ignoreId) {
  const base = slugify(name) || 'product';
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug, ...(ignoreId ? { _id: { $ne: ignoreId } } : {}) })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

exports.createProduct = asyncHandler(async (req, res) => {
  if (!(await Category.exists({ _id: req.body.category }))) throw ApiError.badRequest('Category does not exist');
  const slug = await uniqueSlug(req.body.name);
  const product = await Product.create({ ...req.body, slug });
  logger.info({ productId: product.id, adminId: req.user.id }, 'Product created');
  created(res, { product }, 'Product created');
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  if (req.body.category && !(await Category.exists({ _id: req.body.category }))) {
    throw ApiError.badRequest('Category does not exist');
  }
  if (req.body.name && req.body.name !== product.name) product.slug = await uniqueSlug(req.body.name, product.id);
  Object.assign(product, req.body);
  if (product.discountPrice != null && product.discountPrice > product.price) {
    throw ApiError.unprocessable('Validation failed', [{ field: 'discountPrice', message: 'Discount price cannot be higher than price' }]);
  }
  await product.save();
  logger.info({ productId: product.id, adminId: req.user.id }, 'Product updated');
  success(res, { product }, 'Product updated');
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  await product.deleteOne();
  await Promise.all([
    Cart.updateMany({ 'items.product': product._id }, { $pull: { items: { product: product._id } } }),
    Wishlist.updateMany({}, { $pull: { products: product._id } }),
    Review.deleteMany({ product: product._id }),
    ...product.images.map((i) => imageStorage.deleteImage(i.url)),
  ]);
  logger.info({ productId: product.id, adminId: req.user.id }, 'Product deleted');
  success(res, {}, 'Product deleted');
});

exports.toggleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  product.isActive = !product.isActive;
  await product.save();
  logger.info({ productId: product.id, isActive: product.isActive, adminId: req.user.id }, 'Product status toggled');
  success(res, { product }, product.isActive ? 'Product activated' : 'Product deactivated');
});

exports.updateStock = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { stock: req.body.stock }, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound('Product not found');
  logger.info({ productId: product.id, stock: product.stock, adminId: req.user.id }, 'Stock updated');
  success(res, { product }, 'Stock updated');
});

exports.uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) throw ApiError.badRequest('Please choose at least one image');
  const images = await Promise.all(req.files.map(async (f) => ({ url: await imageStorage.saveImage(f), alt: '' })));
  success(res, { images }, 'Images uploaded');
});

/* ---------- Categories ---------- */
exports.listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();
  const counts = await Product.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  success(res, { categories: categories.map((c) => ({ ...c, id: c._id, productCount: map[String(c._id)] || 0 })) }, 'Categories fetched');
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ ...req.body, slug: slugify(req.body.name) });
  created(res, { category }, 'Category created');
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  if (req.body.name && req.body.name !== category.name) category.slug = slugify(req.body.name);
  Object.assign(category, req.body);
  await category.save();
  success(res, { category }, 'Category updated');
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  if (await Product.exists({ category: category._id })) {
    throw ApiError.conflict('Move or delete the products in this category first');
  }
  await category.deleteOne();
  success(res, {}, 'Category deleted');
});

/* ---------- Orders ---------- */
exports.listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.search) filter.orderNumber = new RegExp(escapeRegex(req.query.search), 'i');
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);
  success(res, { orders, pagination: pageMeta(total, page, limit) }, 'Orders fetched');
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw ApiError.notFound('Order not found');
  success(res, { order }, 'Order fetched');
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  await orderService.updateStatus(order, req.body.status, req.user.id);
  await order.populate('user', 'name email phone');
  success(res, { order }, 'Order status updated');
});

/* ---------- Customers ---------- */
exports.listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const filter = { role: 'customer' };
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }
  const [customers, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  success(res, { customers, pagination: pageMeta(total, page, limit) }, 'Customers fetched');
});

exports.getCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!customer) throw ApiError.notFound('Customer not found');
  const [orders, spent] = await Promise.all([
    Order.find({ user: customer._id }).sort({ createdAt: -1 }).limit(10),
    Order.aggregate([
      { $match: { user: customer._id, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
  ]);
  success(res, { customer, orders, totalSpent: spent[0] ? spent[0].total : 0, orderCount: spent[0] ? spent[0].count : 0 }, 'Customer fetched');
});

exports.toggleCustomer = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!customer) throw ApiError.notFound('Customer not found');
  customer.isActive = !customer.isActive;
  await customer.save();
  logger.info({ customerId: customer.id, isActive: customer.isActive, adminId: req.user.id }, 'Customer status toggled');
  success(res, { customer }, customer.isActive ? 'Customer enabled' : 'Customer disabled');
});

/* ---------- Reviews ---------- */
exports.listReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const [reviews, total] = await Promise.all([
    Review.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email').populate('product', 'name slug'),
    Review.countDocuments(),
  ]);
  success(res, { reviews, pagination: pageMeta(total, page, limit) }, 'Reviews fetched');
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  await review.deleteOne();
  await recalculateRating(review.product);
  logger.info({ reviewId: review.id, adminId: req.user.id }, 'Review deleted by admin');
  success(res, {}, 'Review deleted');
});

/* ---------- Inventory ---------- */
exports.inventory = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 15);
  const filter = {};
  if (req.query.filter === 'low') filter.isLowStock = true;
  if (req.query.filter === 'out') filter.stock = 0;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: rx }, { sku: rx }];
  }
  const [products, total, lowCount, outCount] = await Promise.all([
    Product.find(filter).sort({ stock: 1, name: 1 }).skip(skip).limit(limit).select('name slug sku stock lowStockThreshold images isActive brand'),
    Product.countDocuments(filter),
    Product.countDocuments({ isLowStock: true }),
    Product.countDocuments({ stock: 0 }),
  ]);
  success(res, { products, pagination: pageMeta(total, page, limit), summary: { lowCount, outCount } }, 'Inventory fetched');
});
