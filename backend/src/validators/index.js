const Joi = require('joi');

const objectId = Joi.string().hex().length(24).messages({ 'string.length': 'Invalid id' });
const password = Joi.string()
  .min(8)
  .max(72)
  .pattern(/[A-Za-z]/, 'letter')
  .pattern(/\d/, 'number')
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.name': 'Password must contain at least one letter and one number',
  });

const address = Joi.object({
  fullName: Joi.string().trim().min(2).max(80).required(),
  phone: Joi.string().trim().pattern(/^[0-9+\-\s]{7,20}$/).required().messages({ 'string.pattern.base': 'Enter a valid phone number' }),
  line1: Joi.string().trim().min(3).max(150).required(),
  line2: Joi.string().trim().max(150).allow('').default(''),
  city: Joi.string().trim().min(2).max(60).required(),
  state: Joi.string().trim().min(2).max(60).required(),
  postalCode: Joi.string().trim().pattern(/^[A-Za-z0-9\s-]{4,12}$/).required().messages({ 'string.pattern.base': 'Enter a valid postal code' }),
  country: Joi.string().trim().max(60).default('India'),
  isDefault: Joi.boolean().default(false),
});

exports.auth = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(80).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: password.required(),
  }),
  login: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().max(72).required(),
  }),
  forgot: Joi.object({ email: Joi.string().trim().lowercase().email().required() }),
  reset: Joi.object({ token: Joi.string().required(), password: password.required() }),
};

exports.user = {
  updateProfile: Joi.object({
    name: Joi.string().trim().min(2).max(80),
    phone: Joi.string().trim().allow('').pattern(/^[0-9+\-\s]{7,20}$/),
  }).min(1),
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: password.required(),
  }),
  address,
};

exports.product = {
  list: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    search: Joi.string().trim().max(100).allow(''),
    category: Joi.string().trim().max(80),
    brand: Joi.string().trim().max(60),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    rating: Joi.number().min(0).max(5),
    inStock: Joi.boolean(),
    featured: Joi.boolean(),
    onSale: Joi.boolean(),
    sort: Joi.string().valid('newest', 'price_asc', 'price_desc', 'rating', 'popular', 'discount'),
  }),
  body: Joi.object({
    name: Joi.string().trim().min(2).max(150).required(),
    description: Joi.string().trim().min(10).max(4000).required(),
    category: objectId.required(),
    brand: Joi.string().trim().min(1).max(60).required(),
    price: Joi.number().min(0).required(),
    discountPrice: Joi.number().min(0).allow(null),
    stock: Joi.number().integer().min(0).required(),
    lowStockThreshold: Joi.number().integer().min(0),
    sku: Joi.string().trim().min(2).max(40).required(),
    images: Joi.array().items(Joi.object({ url: Joi.string().required(), alt: Joi.string().allow('') })).max(8),
    specifications: Joi.array().items(Joi.object({ key: Joi.string().required(), value: Joi.string().required() })).max(20),
    features: Joi.array().items(Joi.string().trim().max(200)).max(15),
    isFeatured: Joi.boolean(),
    isActive: Joi.boolean(),
  }),
  stock: Joi.object({ stock: Joi.number().integer().min(0).required() }),
};

exports.category = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(60).required(),
    description: Joi.string().trim().max(300).allow(''),
    image: Joi.string().allow(''),
    isActive: Joi.boolean(),
  }),
};

exports.cart = {
  add: Joi.object({ productId: objectId.required(), quantity: Joi.number().integer().min(1).max(20).default(1) }),
  update: Joi.object({ quantity: Joi.number().integer().min(1).max(20).required() }),
};

exports.order = {
  create: Joi.object({
    shippingAddress: address.required(),
    paymentMethod: Joi.string().valid('COD', 'MOCK_CARD', 'MOCK_UPI').required(),
    paymentDetails: Joi.object({
      cardNumber: Joi.string().allow(''),
      upiId: Joi.string().allow(''),
    }).default({}),
  }),
  status: Joi.object({
    status: Joi.string().valid('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled').required(),
  }),
  adminList: Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    status: Joi.string().valid('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
    search: Joi.string().trim().max(60).allow(''),
  }),
};

exports.review = {
  create: Joi.object({
    productId: objectId.required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().trim().max(100).allow(''),
    comment: Joi.string().trim().max(1500).allow(''),
  }),
};

exports.paging = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1).max(100),
  search: Joi.string().trim().max(60).allow(''),
});
