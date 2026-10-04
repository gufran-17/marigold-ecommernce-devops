import client, { unwrap } from './client';

const get = (url, params) => unwrap(client.get(url, { params }));
const post = (url, body) => unwrap(client.post(url, body));
const put = (url, body) => unwrap(client.put(url, body));
const patch = (url, body) => unwrap(client.patch(url, body));
const del = (url) => unwrap(client.delete(url));

export const authApi = {
  register: (b) => post('/auth/register', b),
  login: (b) => post('/auth/login', b),
  adminLogin: (b) => post('/auth/admin/login', b),
  me: () => get('/auth/me'),
  forgot: (b) => post('/auth/forgot-password', b),
  reset: (b) => post('/auth/reset-password', b),
};

export const userApi = {
  updateProfile: (b) => put('/users/profile', b),
  changePassword: (b) => put('/users/password', b),
  addAddress: (b) => post('/users/addresses', b),
  updateAddress: (id, b) => put(`/users/addresses/${id}`, b),
  deleteAddress: (id) => del(`/users/addresses/${id}`),
};

export const productApi = {
  list: (params) => get('/products', params),
  brands: () => get('/products/brands'),
  bySlug: (slug) => get(`/products/${slug}`),
  related: (slug) => get(`/products/${slug}/related`),
};

export const categoryApi = { list: () => get('/categories') };

export const cartApi = {
  get: () => get('/cart'),
  add: (productId, quantity = 1) => post('/cart/items', { productId, quantity }),
  update: (productId, quantity) => patch(`/cart/items/${productId}`, { quantity }),
  remove: (productId) => del(`/cart/items/${productId}`),
  clear: () => del('/cart'),
};

export const wishlistApi = {
  get: () => get('/wishlist'),
  add: (id) => post(`/wishlist/${id}`),
  remove: (id) => del(`/wishlist/${id}`),
  fromCart: (id) => post(`/wishlist/${id}/from-cart`),
};

export const orderApi = {
  create: (b) => post('/orders', b),
  mine: (params) => get('/orders', params),
  get: (id) => get(`/orders/${id}`),
  cancel: (id) => patch(`/orders/${id}/cancel`),
};

export const reviewApi = {
  forProduct: (id, params) => get(`/reviews/product/${id}`, params),
  create: (b) => post('/reviews', b),
  remove: (id) => del(`/reviews/${id}`),
};

export const adminApi = {
  stats: () => get('/admin/stats'),
  products: (p) => get('/admin/products', p),
  product: (id) => get(`/admin/products/${id}`),
  createProduct: (b) => post('/admin/products', b),
  updateProduct: (id, b) => put(`/admin/products/${id}`, b),
  deleteProduct: (id) => del(`/admin/products/${id}`),
  toggleProduct: (id) => patch(`/admin/products/${id}/toggle`),
  updateStock: (id, stock) => patch(`/admin/products/${id}/stock`, { stock }),
  uploadImages: (files) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return unwrap(client.post('/admin/products/images', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  categories: () => get('/admin/categories'),
  createCategory: (b) => post('/admin/categories', b),
  updateCategory: (id, b) => put(`/admin/categories/${id}`, b),
  deleteCategory: (id) => del(`/admin/categories/${id}`),
  orders: (p) => get('/admin/orders', p),
  order: (id) => get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => patch(`/admin/orders/${id}/status`, { status }),
  customers: (p) => get('/admin/customers', p),
  customer: (id) => get(`/admin/customers/${id}`),
  toggleCustomer: (id) => patch(`/admin/customers/${id}/toggle`),
  reviews: (p) => get('/admin/reviews', p),
  deleteReview: (id) => del(`/admin/reviews/${id}`),
  inventory: (p) => get('/admin/inventory', p),
};
