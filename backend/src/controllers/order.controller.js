const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { getPagination, pageMeta } = require('../utils/pagination');
const orderService = require('../services/order.service');

exports.create = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user, req.body);
  created(res, { order }, 'Order placed successfully');
});

exports.mine = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ user: req.user.id }),
  ]);
  success(res, { orders, pagination: pageMeta(total, page, limit) }, 'Orders fetched');
});

async function findOwn(req) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
}

exports.getOne = asyncHandler(async (req, res) => success(res, { order: await findOwn(req) }, 'Order fetched'));

exports.cancel = asyncHandler(async (req, res) => {
  const order = await orderService.cancelByCustomer(await findOwn(req));
  success(res, { order }, 'Order cancelled');
});
