const Cart = require('../models/Cart');
const pricing = require('./pricing.service');

// Returns the cart with populated products, drops products that no longer exist/are inactive,
// and clamps quantities to available stock. Adds a `notices` list when something changed.
exports.getCartView = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    populate: { path: 'category', select: 'name slug' },
  });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  const notices = [];
  const valid = [];
  cart.items.forEach((item) => {
    const p = item.product;
    if (!p || !p.isActive) {
      notices.push('An unavailable item was removed from your cart');
      return;
    }
    if (p.stock === 0) {
      notices.push(`${p.name} is out of stock and was removed`);
      return;
    }
    if (item.quantity > p.stock) {
      item.quantity = p.stock;
      notices.push(`Quantity for ${p.name} reduced to ${p.stock} (limited stock)`);
    }
    valid.push(item);
  });

  if (valid.length !== cart.items.length || notices.length) {
    cart.items = valid;
    await cart.save();
  }

  const items = valid.map((i) => ({ product: i.product, quantity: i.quantity }));
  return { items, summary: pricing.calculate(items), notices };
};
