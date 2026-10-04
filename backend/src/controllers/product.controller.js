const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const { success } = require('../utils/response');
const { getPagination, pageMeta } = require('../utils/pagination');

const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { finalPrice: 1 },
  price_desc: { finalPrice: -1 },
  rating: { ratingAverage: -1, ratingCount: -1 },
  popular: { soldCount: -1 },
  discount: { discountPercent: -1 },
};

exports.list = asyncHandler(async (req, res) => {
  const q = req.query;
  const { page, limit, skip } = getPagination(q);
  const filter = { isActive: true };

  if (q.category) {
    const cat = await Category.findOne({ slug: q.category, isActive: true });
    filter.category = cat ? cat._id : new mongoose.Types.ObjectId();
  }
  if (q.brand) filter.brand = new RegExp(`^${escapeRegex(q.brand)}$`, 'i');
  if (q.rating) filter.ratingAverage = { $gte: Number(q.rating) };
  if (q.inStock) filter.stock = { $gt: 0 };
  if (q.featured) filter.isFeatured = true;
  if (q.onSale) filter.discountPercent = { $gt: 0 };
  if (q.minPrice != null || q.maxPrice != null) {
    filter.finalPrice = {};
    if (q.minPrice != null) filter.finalPrice.$gte = q.minPrice;
    if (q.maxPrice != null) filter.finalPrice.$lte = q.maxPrice;
  }
  if (q.search) {
    const words = q.search.split(/\s+/).filter(Boolean).slice(0, 6).map(escapeRegex);
    filter.$and = words.map((w) => ({
      $or: [{ name: new RegExp(w, 'i') }, { brand: new RegExp(w, 'i') }, { description: new RegExp(w, 'i') }],
    }));
  }

  const sort = { ...SORTS[q.sort || 'newest'], _id: 1 };
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  success(res, { products, pagination: pageMeta(total, page, limit) }, 'Products fetched successfully');
});

exports.brands = asyncHandler(async (_req, res) => {
  const brands = await Product.distinct('brand', { isActive: true });
  success(res, { brands: brands.sort() }, 'Brands fetched successfully');
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');
  if (!product) throw ApiError.notFound('Product not found');
  success(res, { product }, 'Product fetched successfully');
});

exports.related = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true });
  if (!product) throw ApiError.notFound('Product not found');
  const products = await Product.find({ category: product.category, _id: { $ne: product._id }, isActive: true })
    .sort({ soldCount: -1 })
    .limit(4)
    .populate('category', 'name slug');
  success(res, { products }, 'Related products fetched successfully');
});
