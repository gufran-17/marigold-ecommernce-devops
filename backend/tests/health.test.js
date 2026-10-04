const { request, startDb, stopDb } = require('./helpers');

describe('GET /health', () => {
  it('returns unhealthy (503) when the database is not connected', async () => {
    const res = await request().get('/health');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('unhealthy');
    expect(res.body.database).not.toBe('connected');
  });

  it('returns healthy (200) when the database is connected, without secrets', async () => {
    await startDb();
    const res = await request().get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'healthy', service: 'ecommerce-backend', database: 'connected' });
    expect(JSON.stringify(res.body)).not.toMatch(/mongodb:\/\/|secret|password/i);
    await stopDb();
  });
});
