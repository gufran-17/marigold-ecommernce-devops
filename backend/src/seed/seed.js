/* Seed script. Usage:  npm run seed            (adds sample data, wipes existing catalog/orders)
 * Dev credentials are printed at the end. In production, set SEED_ADMIN_PASSWORD explicitly. */
const fs = require('fs');
const path = require('path');
const env = require('../config/env');
const logger = require('../config/logger');
const { connectDB, disconnectDB } = require('../config/db');
const slugify = require('../utils/slugify');
const { uploadRoot } = require('../services/imageStorage.service');
const { recalculateRating } = require('../services/review.service');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { categories, products } = require('./products');

const DEV_ADMIN_PASSWORD = 'Admin@12345';
const DEV_CUSTOMER_PASSWORD = 'Customer@12345';

function svgImage(label, [c1, c2], variant) {
  const shapes = [
    `<circle cx="600" cy="220" r="260" fill="#fff" opacity="0.14"/><circle cx="180" cy="640" r="200" fill="#fff" opacity="0.10"/>`,
    `<rect x="380" y="-60" width="420" height="420" rx="60" transform="rotate(20 590 150)" fill="#fff" opacity="0.14"/><circle cx="160" cy="620" r="140" fill="#fff" opacity="0.12"/>`,
    `<circle cx="400" cy="400" r="300" fill="none" stroke="#fff" stroke-width="30" opacity="0.16"/><circle cx="400" cy="400" r="150" fill="#fff" opacity="0.12"/>`,
  ][variant % 3];
  const words = label.split(' ');
  const lines = [];
  let cur = '';
  words.forEach((w) => {
    if ((cur + ' ' + w).trim().length > 18) { lines.push(cur.trim()); cur = w; } else cur = `${cur} ${w}`;
  });
  if (cur.trim()) lines.push(cur.trim());
  const text = lines.slice(0, 3).map((l, i) => `<text x="60" y="${560 + i * 56}" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#fff">${l.replace(/&/g, '&amp;')}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/>${shapes}${text}</svg>`;
}

const comments = [
  ['Great value', 'Works exactly as described. Happy with the purchase.'],
  ['Good quality', 'Build quality is better than I expected for the price.'],
  ['Does the job', 'Nothing fancy, but solid and reliable so far.'],
  ['Would buy again', 'Delivery was quick and the product was well packed.'],
  ['Decent', 'Good overall. A few small things could be better.'],
];

async function run() {
  await connectDB();
  logger.info('Seeding database...');
  await Promise.all([Category, Product, Cart, Wishlist, Review, Order].map((m) => m.deleteMany({})));
  await User.deleteMany({ email: { $in: [env.seedAdminEmail, 'customer@example.com'] } });
  await User.deleteMany({ email: /@demo\.shop$/ });

  const seedDir = path.join(uploadRoot, 'seed');
  fs.mkdirSync(seedDir, { recursive: true });

  const isProd = env.nodeEnv === 'production';
  if (isProd && !env.seedAdminPassword) throw new Error('Set SEED_ADMIN_PASSWORD to seed an admin in production');
  const adminPassword = env.seedAdminPassword || DEV_ADMIN_PASSWORD;

  const admin = await User.create({ name: 'Store Admin', email: env.seedAdminEmail, password: adminPassword, role: 'admin' });
  await Promise.all([Cart.create({ user: admin._id, items: [] }), Wishlist.create({ user: admin._id, products: [] })]);

  const cats = {};
  for (const c of categories) {
    const slug = slugify(c.name);
    fs.writeFileSync(path.join(seedDir, `cat-${slug}.svg`), svgImage(c.name, c.colors, 1));
    // eslint-disable-next-line no-await-in-loop
    cats[c.name] = await Category.create({ name: c.name, slug, description: c.description, image: `/uploads/seed/cat-${slug}.svg` });
  }

  const created = [];
  let i = 0;
  for (const [name, cat, brand, price, discountPrice, stock, features, specs] of products) {
    const slug = slugify(name);
    const colors = categories.find((c) => c.name === cat).colors;
    const images = [0, 1, 2].map((v) => {
      const file = `${slug}-${v + 1}.svg`;
      fs.writeFileSync(path.join(seedDir, file), svgImage(name, v === 1 ? [colors[1], colors[0]] : colors, v));
      return { url: `/uploads/seed/${file}`, alt: `${name} - view ${v + 1}` };
    });
    i += 1;
    // eslint-disable-next-line no-await-in-loop
    created.push(await Product.create({
      name, slug, brand, price, discountPrice, stock,
      category: cats[cat]._id,
      sku: `${slugify(brand).slice(0, 3).toUpperCase()}-${String(1000 + i)}`,
      description: `${name} by ${brand}. ${features.join('. ')}. Designed for everyday use and backed by a 1 year brand warranty.`,
      features,
      specifications: Object.entries(specs).map(([key, value]) => ({ key, value })),
      images,
      isFeatured: i % 4 === 0,
      soldCount: Math.floor(((i * 37) % 90) + 5),
    }));
  }

  const customers = [];
  const names = ['Aarav Mehta', 'Diya Nair', 'Kabir Shah', 'Isha Patil', 'Rehan Khan'];
  for (const n of names) {
    // eslint-disable-next-line no-await-in-loop
    const u = await User.create({ name: n, email: `${n.split(' ')[0].toLowerCase()}@demo.shop`, password: DEV_CUSTOMER_PASSWORD });
    // eslint-disable-next-line no-await-in-loop
    await Promise.all([Cart.create({ user: u._id, items: [] }), Wishlist.create({ user: u._id, products: [] })]);
    customers.push(u);
  }
  const demo = await User.create({
    name: 'Demo Customer', email: 'customer@example.com', password: DEV_CUSTOMER_PASSWORD, phone: '9876543210',
    addresses: [{ fullName: 'Demo Customer', phone: '9876543210', line1: '12 Lake View Road', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001', country: 'India', isDefault: true }],
  });
  await Promise.all([Cart.create({ user: demo._id, items: [] }), Wishlist.create({ user: demo._id, products: [] })]);
  customers.push(demo);

  // Reviews (users need not have ordered in seed data)
  let r = 0;
  for (const p of created) {
    const n = 1 + (r % 4);
    for (let k = 0; k < n; k += 1) {
      const [title, comment] = comments[(r + k) % comments.length];
      // eslint-disable-next-line no-await-in-loop
      await Review.create({ user: customers[(r + k) % customers.length]._id, product: p._id, rating: 3 + ((r + k * 2) % 3), title, comment });
    }
    // eslint-disable-next-line no-await-in-loop
    await recalculateRating(p._id);
    r += 1;
  }

  // Sample orders for the admin dashboard
  const statuses = ['Delivered', 'Delivered', 'Shipped', 'Processing', 'Confirmed', 'Pending', 'Pending', 'Cancelled'];
  for (let k = 0; k < statuses.length; k += 1) {
    const user = customers[k % customers.length];
    const picks = [created[(k * 3) % created.length], created[(k * 3 + 5) % created.length]].filter((p) => p.stock > 0);
    const items = picks.map((p, idx) => ({ product: p._id, name: p.name, slug: p.slug, image: p.images[0].url, price: p.finalPrice, quantity: idx + 1 }));
    const itemsTotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const shippingFee = itemsTotal >= env.freeShippingThreshold ? 0 : env.shippingFee;
    const status = statuses[k];
    // eslint-disable-next-line no-await-in-loop
    await Order.create({
      orderNumber: `ORD-SEED-${1000 + k}`, user: user._id, items,
      shippingAddress: { fullName: user.name, phone: '9000000000', line1: '21 Park Street', line2: '', city: 'Pune', state: 'Maharashtra', postalCode: '411001', country: 'India' },
      paymentMethod: k % 2 ? 'MOCK_UPI' : 'COD',
      paymentStatus: status === 'Delivered' || (k % 2 && status !== 'Cancelled') ? 'Paid' : 'Pending',
      orderStatus: status, itemsTotal, shippingFee, discount: 0, totalAmount: itemsTotal + shippingFee,
      statusHistory: [{ status: 'Pending' }, { status }],
    });
  }

  logger.info({ products: created.length, categories: categories.length }, 'Seed complete');
  // eslint-disable-next-line no-console
  console.log(`\nSeed complete: ${created.length} products, ${categories.length} categories.\n`);
  // eslint-disable-next-line no-console
  console.log(isProd
    ? `Admin created: ${env.seedAdminEmail} (password from SEED_ADMIN_PASSWORD)\n`
    : `DEV credentials (local use only):\n  Admin:    ${env.seedAdminEmail} / ${adminPassword}\n  Customer: customer@example.com / ${DEV_CUSTOMER_PASSWORD}\n`);
  await disconnectDB();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err.message);
  process.exit(1);
});
