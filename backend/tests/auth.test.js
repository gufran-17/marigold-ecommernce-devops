const { request, startDb, stopDb, clearDb, registerUser, auth } = require('./helpers');

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe('Auth API', () => {
  it('registers a customer and never returns the password', async () => {
    const { res } = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.role).toBe('customer');
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('ignores a role sent during registration', async () => {
    const { res } = await registerUser({ role: 'admin' });
    expect(res.body.data.user.role).toBe('customer');
  });

  it('rejects a weak password with 422', async () => {
    const { res } = await registerUser({ password: 'short' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('rejects a duplicate email with 409', async () => {
    const first = await registerUser({ email: 'dup@test.com' });
    expect(first.res.status).toBe(201);
    const second = await registerUser({ email: 'dup@test.com' });
    expect(second.res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const { body } = await registerUser({ email: 'login@test.com' });
    const res = await request().post('/api/auth/login').send({ email: body.email, password: body.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeTruthy();
  });

  it('rejects a wrong password with 401', async () => {
    const { body } = await registerUser({ email: 'wrong@test.com' });
    const res = await request().post('/api/auth/login').send({ email: body.email, password: 'Nope12345' });
    expect(res.status).toBe(401);
  });

  it('protects /api/auth/me', async () => {
    expect((await request().get('/api/auth/me')).status).toBe(401);
    const { token } = await registerUser();
    const res = await request().get('/api/auth/me').set(auth(token));
    expect(res.status).toBe(200);
  });

  it('rejects an invalid token', async () => {
    const res = await request().get('/api/auth/me').set(auth('not.a.token'));
    expect(res.status).toBe(401);
  });

  it('blocks a disabled user', async () => {
    const { body, user } = await registerUser({ email: 'off@test.com' });
    const User = require('../src/models/User');
    await User.updateOne({ _id: user._id }, { isActive: false });
    const res = await request().post('/api/auth/login').send({ email: body.email, password: body.password });
    expect(res.status).toBe(403);
  });

  it('supports the forgot and reset password flow', async () => {
    const { body } = await registerUser({ email: 'reset@test.com' });
    const forgot = await request().post('/api/auth/forgot-password').send({ email: body.email });
    expect(forgot.status).toBe(200);
    const token = forgot.body.data.devResetToken;
    expect(token).toBeTruthy();
    const reset = await request().post('/api/auth/reset-password').send({ token, password: 'NewPass123' });
    expect(reset.status).toBe(200);
    const login = await request().post('/api/auth/login').send({ email: body.email, password: 'NewPass123' });
    expect(login.status).toBe(200);
  });
});

describe('User profile', () => {
  it('changes password only with the correct current password', async () => {
    const { body, token } = await registerUser();
    const bad = await request().put('/api/users/password').set(auth(token)).send({ currentPassword: 'Wrong1234', newPassword: 'Another123' });
    expect(bad.status).toBe(400);
    const ok = await request().put('/api/users/password').set(auth(token)).send({ currentPassword: body.password, newPassword: 'Another123' });
    expect(ok.status).toBe(200);
  });

  it('adds an address and marks the first as default', async () => {
    const { token } = await registerUser();
    const res = await request().post('/api/users/addresses').set(auth(token)).send({
      fullName: 'Test User', phone: '9999999999', line1: '1 Main Street', city: 'Mumbai', state: 'MH', postalCode: '400001',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.addresses[0].isDefault).toBe(true);
  });
});
