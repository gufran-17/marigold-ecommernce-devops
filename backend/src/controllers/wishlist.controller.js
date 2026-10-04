const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

async function view(userId) {
  const w = (await Wishlist.findOne({ user: userId })) || (await Wishlist.create({ user: userId, products: [] }));
  await w.populate({ path: 'products', match: { isActive: true }, populate: { path: 'category', select: 'name slug' } });
  return w.products.filter(Boolean);
}

exports.get = asyncHandler(async (req, res) => success(res, { products: await view(req.user.id) }, 'Wishlist fetched'));

exports.add = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.productId, isActive: true });
  if (!product) throw ApiError.notFound('Product not found');
  await Wishlist.updateOne({ user: req.user.id }, { $addToSet: { products: product._id } }, { upsert: true });
  success(res, { products: await view(req.user.id) }, 'Added to wishlist');
});

exports.remove = asyncHandler(async (req, res) => {
  await Wishlist.updateOne({ user: req.user.id }, { $pull: { products: req.params.productId } });
  success(res, { products: await view(req.user.id) }, 'Removed from wishlist');
});

// "Save for later" from cart: move an item from cart to wishlist
exports.moveFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await Wishlist.updateOne({ user: req.user.id }, { $addToSet: { products: productId } }, { upsert: true });
  const cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.items = cart.items.filter((i) => String(i.product) !== productId);
    await cart.save();
  }
  success(res, { products: await view(req.user.id) }, 'Saved for later');
});
