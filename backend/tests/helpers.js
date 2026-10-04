const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

let mongod;

exports.app = app;
exports.request = () => request(app);

// By default an in-memory MongoDB is used. Set TEST_MONGODB_URI to use an existing MongoDB instead.
exports.startDb = async () => {
  if (process.env.TEST_MONGODB_URI) {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
    return;
  }
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

exports.stopDb = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};

exports.clearDb = async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
};

exports.registerUser = async (overrides = {}) => {
  const body = { name: 'Test User', email: `user${Date.now()}${Math.floor(Math.random() * 1000)}@test.com`, password: 'Password1', ...overrides };
  const res = await request(app).post('/api/auth/register').send(body);
  return { body, res, token: res.body.data && res.body.data.token, user: res.body.data && res.body.data.user };
};

exports.createAdmin = async () => {
  await User.create({ name: 'Admin', email: 'admin@test.com', password: 'AdminPass1', role: 'admin' });
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'AdminPass1' });
  return res.body.data.token;
};

exports.createProduct = async (overrides = {}) => {
  let category = await Category.findOne();
  if (!category) category = await Category.create({ name: 'Gadgets', slug: 'gadgets' });
  const n = Math.floor(Math.random() * 1e6);
  return Product.create({
    name: `Product ${n}`, slug: `product-${n}`, description: 'A very useful test product.', category: category._id,
    brand: 'TestBrand', price: 1000, discountPrice: 800, stock: 10, sku: `SKU-${n}`, images: [{ url: '/uploads/x.jpg' }], ...overrides,
  });
};

exports.auth = (token) => ({ Authorization: `Bearer ${token}` });
