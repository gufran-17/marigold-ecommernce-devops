const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { getPagination, pageMeta } = require('../utils/pagination');
const { recalculateRating } = require('../services/review.service');

exports.listForProduct = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const filter = { product: req.params.productId };
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name'),
    Review.countDocuments(filter),
  ]);
  success(res, { reviews, pagination: pageMeta(total, page, limit) }, 'Reviews fetched');
});

exports.create = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw ApiError.notFound('Product not found');
  const bought = await Order.exists({ user: req.user.id, 'items.product': productId, orderStatus: { $ne: 'Cancelled' } });
  if (!bought) throw ApiError.forbidden('You can review a product after you have ordered it');
  if (await Review.exists({ user: req.user.id, product: productId })) {
    throw ApiError.conflict('You have already reviewed this product');
  }
  const review = await Review.create({ user: req.user.id, product: productId, rating, title, comment });
  await recalculateRating(productId);
  created(res, { review }, 'Thanks for your review');
});

exports.remove = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user.id });
  if (!review) throw ApiError.notFound('Review not found');
  await review.deleteOne();
  await recalculateRating(review.product);
  success(res, {}, 'Review deleted');
});
