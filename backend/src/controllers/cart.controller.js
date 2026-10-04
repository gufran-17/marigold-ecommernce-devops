const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const cartService = require('../services/cart.service');

const respond = async (res, userId, message) => {
  const view = await cartService.getCartView(userId);
  success(res, view, message);
};

async function getOrCreate(userId) {
  return (await Cart.findOne({ user: userId })) || Cart.create({ user: userId, items: [] });
}

exports.get = asyncHandler(async (req, res) => respond(res, req.user.id, 'Cart fetched'));

exports.addItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw ApiError.notFound('Product not found');
  if (product.stock === 0) throw ApiError.conflict('This product is out of stock');

  const cart = await getOrCreate(req.user.id);
  const existing = cart.items.find((i) => String(i.product) === productId);
  const newQty = (existing ? existing.quantity : 0) + quantity;
  if (newQty > product.stock) throw ApiError.conflict(`Only ${product.stock} available in stock`);
  if (newQty > 20) throw ApiError.badRequest('You can add up to 20 of one item');
  if (existing) existing.quantity = newQty;
  else cart.items.push({ product: product._id, quantity });
  await cart.save();
  await respond(res, req.user.id, 'Added to cart');
});

exports.updateItem = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.productId, isActive: true });
  if (!product) throw ApiError.notFound('Product not found');
  if (req.body.quantity > product.stock) throw ApiError.conflict(`Only ${product.stock} available in stock`);
  const cart = await getOrCreate(req.user.id);
  const item = cart.items.find((i) => String(i.product) === req.params.productId);
  if (!item) throw ApiError.notFound('Item is not in your cart');
  item.quantity = req.body.quantity;
  await cart.save();
  await respond(res, req.user.id, 'Cart updated');
});

exports.removeItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreate(req.user.id);
  cart.items = cart.items.filter((i) => String(i.product) !== req.params.productId);
  await cart.save();
  await respond(res, req.user.id, 'Item removed');
});

exports.clear = asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } });
  await respond(res, req.user.id, 'Cart cleared');
});
