const crypto = require('crypto');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { signToken } = require('../services/token.service');
const logger = require('../config/logger');
const env = require('../config/env');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) throw ApiError.conflict('An account with this email already exists');
  const user = await User.create({ name, email, password, role: 'customer' });
  await Promise.all([Cart.create({ user: user._id, items: [] }), Wishlist.create({ user: user._id, products: [] })]);
  logger.info({ userId: user.id }, 'User registered');
  created(res, { user, token: signToken(user) }, 'Account created successfully');
});

async function doLogin(req, res, { adminOnly = false } = {}) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const valid = user && (await user.comparePassword(password));
  if (!valid) {
    logger.warn({ ip: req.ip }, 'Login failed: wrong email or password');
    throw ApiError.unauthorized('Incorrect email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('This account has been disabled. Contact support');
  if (adminOnly && user.role !== 'admin') {
    logger.warn({ userId: user.id }, 'Admin login denied for non-admin');
    throw ApiError.forbidden('This account does not have admin access');
  }
  user.lastLoginAt = new Date();
  await user.save();
  logger.info({ userId: user.id, role: user.role }, 'User logged in');
  success(res, { user, token: signToken(user) }, 'Logged in successfully');
}

exports.login = asyncHandler((req, res) => doLogin(req, res));
exports.adminLogin = asyncHandler((req, res) => doLogin(req, res, { adminOnly: true }));

exports.me = asyncHandler(async (req, res) => success(res, { user: req.user }, 'Profile fetched'));

// No email service yet: in development the reset token is returned/logged so the flow can be tested.
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const generic = 'If an account exists for this email, a reset link has been sent';
  if (!user) return success(res, {}, generic);
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save({ validateBeforeSave: false });
  logger.info({ userId: user.id }, 'Password reset requested');
  const data = env.nodeEnv === 'production' ? {} : { devResetToken: token };
  return success(res, data, generic);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const hash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({ resetPasswordTokenHash: hash, resetPasswordExpires: { $gt: new Date() } }).select(
    '+resetPasswordTokenHash +resetPasswordExpires'
  );
  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired');
  user.password = req.body.password;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  logger.info({ userId: user.id }, 'Password reset completed');
  success(res, {}, 'Password updated. You can log in now');
});
