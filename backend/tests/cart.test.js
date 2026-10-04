const { request, startDb, stopDb, clearDb, createProduct, registerUser, auth } = require('./helpers');

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe('Cart API', () => {
  it('requires login', async () => {
    expect((await request().get('/api/cart')).status).toBe(401);
  });

  it('adds items, merges quantities and calculates totals', async () => {
    const { token } = await registerUser();
    const p = await createProduct({ price: 1000, discountPrice: 800, stock: 10 });
    await request().post('/api/cart/items').set(auth(token)).send({ productId: String(p._id), quantity: 2 });
    const res = await request().post('/api/cart/items').set(auth(token)).send({ productId: String(p._id), quantity: 1 });
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(3);
    expect(res.body.data.summary).toMatchObject({ listTotal: 3000, itemsTotal: 2400, discount: 600, shippingFee: 0, totalAmount: 2400 });
  });

  it('charges shipping under the free-shipping threshold', async () => {
    const { token } = await registerUser();
    const p = await createProduct({ price: 300, discountPrice: null });
    const res = await request().post('/api/cart/items').set(auth(token)).send({ productId: String(p._id) });
    expect(res.body.data.summary.shippingFee).toBe(49);
    expect(res.body.data.summary.totalAmount).toBe(349);
  });

  it('prevents adding more than available stock', async () => {
    const { token } = await registerUser();
    const p = await createProduct({ stock: 2 });
    const res = await request().post('/api/cart/items').set(auth(token)).send({ productId: String(p._id), quantity: 3 });
    expect(res.status).toBe(409);
  });

  it('updates and removes items', async () => {
    const { token } = await registerUser();
    const p = await createProduct({ stock: 5 });
    await request().post('/api/cart/items').set(auth(token)).send({ productId: String(p._id) });
    const upd = await request().patch(`/api/cart/items/${p._id}`).set(auth(token)).send({ quantity: 4 });
    expect(upd.body.data.items[0].quantity).toBe(4);
    const over = await request().patch(`/api/cart/items/${p._id}`).set(auth(token)).send({ quantity: 6 });
    expect(over.status).toBe(409);
    const del = await request().delete(`/api/cart/items/${p._id}`).set(auth(token));
    expect(del.body.data.items).toHaveLength(0);
  });

  it('rejects invalid ids with 422', async () => {
    const { token } = await registerUser();
    const res = await request().post('/api/cart/items').set(auth(token)).send({ productId: 'abc' });
    expect(res.status).toBe(422);
  });
});

describe('Wishlist API', () => {
  it('adds, lists, moves from cart and removes', async () => {
    const { token } = await registerUser();
    const p = await createProduct();
    const add = await request().post(`/api/wishlist/${p._id}`).set(auth(token));
    expect(add.body.data.products).toHaveLength(1);
    await request().post(`/api/wishlist/${p._id}`).set(auth(token)); // no duplicates
    const list = await request().get('/api/wishlist').set(auth(token));
    expect(list.body.data.products).toHaveLength(1);
    await request().post('/api/cart/items').set(auth(token)).send({ productId: String(p._id) });
    await request().post(`/api/wishlist/${p._id}/from-cart`).set(auth(token));
    expect((await request().get('/api/cart').set(auth(token))).body.data.items).toHaveLength(0);
    const rm = await request().delete(`/api/wishlist/${p._id}`).set(auth(token));
    expect(rm.body.data.products).toHaveLength(0);
  });
});
