const { request, startDb, stopDb, clearDb, createProduct, createAdmin, registerUser, auth } = require('./helpers');
const Category = require('../src/models/Category');

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe('Product API (public)', () => {
  it('lists products with pagination', async () => {
    for (let i = 0; i < 5; i += 1) await createProduct();
    const res = await request().get('/api/products?limit=2&page=1');
    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(2);
    expect(res.body.data.pagination.total).toBe(5);
    expect(res.body.data.pagination.pages).toBe(3);
  });

  it('searches by name', async () => {
    await createProduct({ name: 'Blue Kettle', slug: 'blue-kettle' });
    await createProduct({ name: 'Red Lamp', slug: 'red-lamp' });
    const res = await request().get('/api/products?search=kettle');
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].slug).toBe('blue-kettle');
  });

  it('filters by price (using the discounted price) and stock', async () => {
    await createProduct({ price: 500, discountPrice: null, stock: 3 });
    await createProduct({ price: 5000, discountPrice: 4000, stock: 0 });
    const cheap = await request().get('/api/products?maxPrice=1000');
    expect(cheap.body.data.products).toHaveLength(1);
    const inStock = await request().get('/api/products?inStock=true');
    expect(inStock.body.data.products).toHaveLength(1);
  });

  it('filters by category slug and sorts by price', async () => {
    const a = await Category.create({ name: 'A Cat', slug: 'a-cat' });
    await createProduct({ category: a._id, price: 300, discountPrice: null });
    await createProduct({ category: a._id, price: 100, discountPrice: null });
    const b = await Category.create({ name: 'B Cat', slug: 'b-cat' });
    await createProduct({ category: b._id, price: 999, discountPrice: null });
    const res = await request().get('/api/products?category=a-cat&sort=price_asc');
    expect(res.body.data.products.map((p) => p.price)).toEqual([100, 300]);
  });

  it('returns product details with computed price fields, and 404 for unknown', async () => {
    const p = await createProduct({ price: 1000, discountPrice: 750 });
    const res = await request().get(`/api/products/${p.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.product.finalPrice).toBe(750);
    expect(res.body.data.product.discountPercent).toBe(25);
    expect((await request().get('/api/products/does-not-exist')).status).toBe(404);
  });

  it('hides inactive products', async () => {
    const p = await createProduct({ isActive: false });
    expect((await request().get(`/api/products/${p.slug}`)).status).toBe(404);
    expect((await request().get('/api/products')).body.data.products).toHaveLength(0);
  });

  it('rejects invalid query params with 422', async () => {
    expect((await request().get('/api/products?sort=weird')).status).toBe(422);
  });
});

describe('Admin product management', () => {
  it('blocks customers and anonymous users from admin APIs', async () => {
    expect((await request().get('/api/admin/stats')).status).toBe(401);
    const { token } = await registerUser();
    expect((await request().get('/api/admin/stats').set(auth(token))).status).toBe(403);
  });

  it('lets an admin create, update, toggle and delete a product', async () => {
    const admin = await createAdmin();
    const cat = await Category.create({ name: 'Toys', slug: 'toys' });
    const payload = { name: 'Puzzle Box', description: 'A fun wooden puzzle box.', category: String(cat._id), brand: 'Playco', price: 500, discountPrice: 400, stock: 12, sku: 'PLY-1' };

    const create = await request().post('/api/admin/products').set(auth(admin)).send(payload);
    expect(create.status).toBe(201);
    const id = create.body.data.product.id || create.body.data.product._id;
    expect(create.body.data.product.slug).toBe('puzzle-box');

    const bad = await request().post('/api/admin/products').set(auth(admin)).send({ ...payload, sku: 'PLY-2', discountPrice: 900 });
    expect(bad.status).toBe(422);

    const update = await request().put(`/api/admin/products/${id}`).set(auth(admin)).send({ ...payload, price: 600, discountPrice: 450 });
    expect(update.status).toBe(200);
    expect(update.body.data.product.price).toBe(600);

    const stock = await request().patch(`/api/admin/products/${id}/stock`).set(auth(admin)).send({ stock: 3 });
    expect(stock.body.data.product.stock).toBe(3);

    const toggle = await request().patch(`/api/admin/products/${id}/toggle`).set(auth(admin));
    expect(toggle.body.data.product.isActive).toBe(false);

    const del = await request().delete(`/api/admin/products/${id}`).set(auth(admin));
    expect(del.status).toBe(200);
    expect((await request().get(`/api/admin/products/${id}`).set(auth(admin))).status).toBe(404);
  });
});
