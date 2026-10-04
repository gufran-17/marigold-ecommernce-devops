const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const cartService = require('./cart.service');
const paymentService = require('./payment.service');

const newOrderNumber = () => {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `ORD-${stamp}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

async function restoreStock(items) {
  await Promise.all(
    items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity, soldCount: -i.quantity } }))
  );
}

// Reserve stock with atomic conditional updates. If any item fails, undo the ones already done.
async function reserveStock(items) {
  const done = [];
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    const res = await Product.updateOne(
      { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, soldCount: item.quantity } }
    );
    if (res.modifiedCount !== 1) {
      await restoreStock(done);
      throw ApiError.conflict(`Not enough stock for ${item.name}`);
    }
    done.push(item);
  }
}

exports.placeOrder = async (user, { shippingAddress, paymentMethod, paymentDetails }) => {
  const { items, summary } = await cartService.getCartView(user.id);
  if (items.length === 0) throw ApiError.badRequest('Your cart is empty');

  const orderItems = items.map(({ product, quantity }) => ({
    product: product._id,
    name: product.name,
    slug: product.slug,
    image: product.images[0] ? product.images[0].url : '',
    price: product.finalPrice,
    quantity,
  }));

  await reserveStock(orderItems);

  let payment;
  try {
    payment = await paymentService.charge({ method: paymentMethod, amount: summary.totalAmount, details: paymentDetails });
  } catch (err) {
    await restoreStock(orderItems);
    throw err;
  }
  if (payment.status === 'Failed') {
    await restoreStock(orderItems);
    logger.warn({ userId: user.id, paymentMethod }, 'Payment failed');
    throw ApiError.badRequest('Payment failed. Please check your payment details or choose another method');
  }

  let order;
  try {
    order = await Order.create({
      orderNumber: newOrderNumber(),
      user: user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: payment.status,
      paymentReference: payment.reference,
      orderStatus: 'Pending',
      itemsTotal: summary.itemsTotal,
      shippingFee: summary.shippingFee,
      discount: summary.discount,
      totalAmount: summary.totalAmount,
      statusHistory: [{ status: 'Pending' }],
    });
  } catch (err) {
    await restoreStock(orderItems);
    throw err;
  }

  await Cart.updateOne({ user: user._id }, { $set: { items: [] } });
  logger.info({ orderId: order.id, orderNumber: order.orderNumber, userId: user.id, total: order.totalAmount, paymentMethod }, 'Order created');
  return order;
};

const CANCELLABLE_BY_CUSTOMER = ['Pending', 'Confirmed'];

async function cancel(order, by) {
  await restoreStock(order.items);
  order.orderStatus = 'Cancelled';
  if (order.paymentStatus === 'Paid') order.paymentStatus = 'Refunded';
  order.statusHistory.push({ status: 'Cancelled' });
  await order.save();
  logger.info({ orderId: order.id, by }, 'Order cancelled');
  return order;
}

exports.cancelByCustomer = async (order) => {
  if (!CANCELLABLE_BY_CUSTOMER.includes(order.orderStatus)) {
    throw ApiError.badRequest(`An order that is ${order.orderStatus.toLowerCase()} can no longer be cancelled`);
  }
  return cancel(order, 'customer');
};

const FLOW = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

exports.updateStatus = async (order, status, adminId) => {
  const from = order.orderStatus;
  if (from === status) return order;
  if (['Delivered', 'Cancelled'].includes(from)) {
    throw ApiError.badRequest(`A ${from.toLowerCase()} order cannot be changed`);
  }
  if (status === 'Cancelled') return cancel(order, `admin:${adminId}`);
  if (FLOW.indexOf(status) < FLOW.indexOf(from)) {
    throw ApiError.badRequest(`Cannot move an order back from ${from} to ${status}`);
  }
  order.orderStatus = status;
  if (status === 'Delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'Paid';
  order.statusHistory.push({ status });
  await order.save();
  logger.info({ orderId: order.id, from, to: status, adminId }, 'Order status changed');
  return order;
};
