const { request, startDb, stopDb, clearDb, createProduct, createAdmin, registerUser, auth } = require('./helpers');
const Product = require('../src/models/Product');

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const address = { fullName: 'Test User', phone: '9999999999', line1: '1 Main Street', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001' };

async function cartWith(token, product, quantity = 1) {
  await request().post('/api/cart/items').set(auth(token)).send({ productId: String(product._id), quantity });
}

describe('Order API', () => {
  it('places a COD order, reduces stock, clears the cart', async () => {
    const { token } = await registerUser();
    const p = await createProduct({ stock: 10, price: 1000, discountPrice: 800 });
    await cartWith(token, p, 2);
    const res = await request().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod: 'COD' });
    expect(res.status).toBe(201);
    const order = res.body.data.order;
    expect(order.orderNumber).toMatch(/^ORD-/);
    expect(order.orderStatus).toBe('Pending');
    expect(order.paymentStatus).toBe('Pending');
    expect(order.totalAmount).toBe(1600);
    expect(order.items[0]).toMatchObject({ name: p.name, price: 800, quantity: 2 });
    expect((await Product.findById(p._id)).stock).toBe(8);
    expect((await request().get('/api/cart').set(auth(token))).body.data.items).toHaveLength(0);
  });

  it('marks a mock UPI order as paid and fails on a bad UPI id', async () => {
    const { token } = await registerUser();
    const p = await createProduct({ stock: 5 });
    await cartWith(token, p);
    const bad = await request().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod: 'MOCK_UPI', paymentDetails: { upiId: 'nope' } });
    expect(bad.status).toBe(400);
    expect((await Product.findById(p._id)).stock).toBe(5); // stock restored
    const ok = await request().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod: 'MOCK_UPI', paymentDetails: { upiId: 'test@upi' } });
    expect(ok.status).toBe(201);
    expect(ok.body.data.order.paymentStatus).toBe('Paid');
  });

  it('rejects an empty cart and an invalid address', async () => {
    const { token } = await registerUser();
    const empty = await request().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod: 'COD' });
    expect(empty.status).toBe(400);
    const bad = await request().post('/api/orders').set(auth(token)).send({ shippingAddress: { fullName: 'X' }, paymentMethod: 'COD' });
    expect(bad.status).toBe(422);
  });

  it('does not oversell when stock changes after adding to cart', async () => {
    const { token } = await registerUser();
    const p = await createProduct({ stock: 3 });
    await cartWith(token, p, 3);
    await Product.updateOne({ _id: p._id }, { stock: 1 });
    const res = await request().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod: 'COD' });
    // cart is clamped to the remaining stock, so the order succeeds with quantity 1
    expect(res.status).toBe(201);
    expect(res.body.data.order.items[0].quantity).toBe(1);
    expect((await Product.findById(p._id)).stock).toBe(0);
  });

  it('shows order history and details only to the owner', async () => {
    const a = await registerUser();
    const b = await registerUser();
    const p = await createProduct();
    await cartWith(a.token, p);
    const created = await request().post('/api/orders').set(auth(a.token)).send({ shippingAddress: address, paymentMethod: 'COD' });
    const id = created.body.data.order._id;
    const list = await request().get('/api/orders').set(auth(a.token));
    expect(list.body.data.orders).toHaveLength(1);
    expect((await request().get(`/api/orders/${id}`).set(auth(a.token))).status).toBe(200);
    expect((await request().get(`/api/orders/${id}`).set(auth(b.token))).status).toBe(404);
  });

  it('lets the customer cancel a pending order and restores stock', async () => {
    const { token } = await registerUser();
    const p = await createProduct({ stock: 5 });
    await cartWith(token, p, 2);
    const created = await request().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod: 'COD' });
    const id = created.body.data.order._id;
    const res = await request().patch(`/api/orders/${id}/cancel`).set(auth(token));
    expect(res.body.data.order.orderStatus).toBe('Cancelled');
    expect((await Product.findById(p._id)).stock).toBe(5);
  });

  it('lets an admin update status but not move backwards, and blocks customers', async () => {
    const admin = await createAdmin();
    const { token } = await registerUser();
    const p = await createProduct();
    await cartWith(token, p);
    const created = await request().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod: 'COD' });
    const id = created.body.data.order._id;

    expect((await request().patch(`/api/admin/orders/${id}/status`).set(auth(token)).send({ status: 'Shipped' })).status).toBe(403);
    const shipped = await request().patch(`/api/admin/orders/${id}/status`).set(auth(admin)).send({ status: 'Shipped' });
    expect(shipped.body.data.order.orderStatus).toBe('Shipped');
    expect((await request().patch(`/api/admin/orders/${id}/status`).set(auth(admin)).send({ status: 'Pending' })).status).toBe(400);
    const delivered = await request().patch(`/api/admin/orders/${id}/status`).set(auth(admin)).send({ status: 'Delivered' });
    expect(delivered.body.data.order.paymentStatus).toBe('Paid'); // COD is paid on delivery
    // customers can no longer cancel a delivered order
    expect((await request().patch(`/api/orders/${id}/cancel`).set(auth(token))).status).toBe(400);
  });

  it('allows a review only after purchase and updates the product rating', async () => {
    const { token } = await registerUser();
    const p = await createProduct();
    const early = await request().post('/api/reviews').set(auth(token)).send({ productId: String(p._id), rating: 5 });
    expect(early.status).toBe(403);
    await cartWith(token, p);
    await request().post('/api/orders').set(auth(token)).send({ shippingAddress: address, paymentMethod: 'COD' });
    const ok = await request().post('/api/reviews').set(auth(token)).send({ productId: String(p._id), rating: 4, comment: 'Nice' });
    expect(ok.status).toBe(201);
    expect((await request().post('/api/reviews').set(auth(token)).send({ productId: String(p._id), rating: 5 })).status).toBe(409);
    const updated = await Product.findById(p._id);
    expect(updated.ratingAverage).toBe(4);
    expect(updated.ratingCount).toBe(1);
  });

  it('serves admin dashboard stats', async () => {
    const admin = await createAdmin();
    await createProduct({ stock: 1 });
    const res = await request().get('/api/admin/stats').set(auth(admin));
    expect(res.status).toBe(200);
    expect(res.body.data.totals.totalProducts).toBe(1);
    expect(res.body.data.lowStock).toHaveLength(1);
  });
});

describe('Error handling', () => {
  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request().get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false });
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request().post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
  });

  it('blocks NoSQL operator injection in login', async () => {
    const res = await request().post('/api/auth/login').send({ email: { $ne: '' }, password: 'x' });
    expect(res.status).toBe(422);
  });
});
