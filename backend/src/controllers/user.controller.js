const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const logger = require('../config/logger');

exports.getProfile = asyncHandler(async (req, res) => success(res, { user: req.user }, 'Profile fetched'));

exports.updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  success(res, { user: req.user }, 'Profile updated');
});

exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  user.password = req.body.newPassword;
  await user.save();
  logger.info({ userId: user.id }, 'Password changed');
  success(res, {}, 'Password changed successfully');
});

function applyDefault(user, addr) {
  if (addr.isDefault) user.addresses.forEach((a) => { a.isDefault = false; });
}

exports.addAddress = asyncHandler(async (req, res) => {
  if (req.user.addresses.length >= 10) throw ApiError.badRequest('You can save up to 10 addresses');
  const makeDefault = req.body.isDefault || req.user.addresses.length === 0;
  applyDefault(req.user, { isDefault: makeDefault });
  req.user.addresses.push({ ...req.body, isDefault: makeDefault });
  await req.user.save();
  created(res, { addresses: req.user.addresses }, 'Address added');
});

exports.updateAddress = asyncHandler(async (req, res) => {
  const addr = req.user.addresses.id(req.params.id);
  if (!addr) throw ApiError.notFound('Address not found');
  applyDefault(req.user, req.body);
  Object.assign(addr, req.body);
  await req.user.save();
  success(res, { addresses: req.user.addresses }, 'Address updated');
});

exports.deleteAddress = asyncHandler(async (req, res) => {
  const addr = req.user.addresses.id(req.params.id);
  if (!addr) throw ApiError.notFound('Address not found');
  const wasDefault = addr.isDefault;
  addr.deleteOne();
  if (wasDefault && req.user.addresses.length) req.user.addresses[0].isDefault = true;
  await req.user.save();
  success(res, { addresses: req.user.addresses }, 'Address removed');
});
