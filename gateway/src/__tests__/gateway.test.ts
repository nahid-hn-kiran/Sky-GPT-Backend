import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Gateway Initial Setup', () => {
  it('GET /health returns 200 and healthy gateway payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'gateway');
  });

  it('GET /unknown-route returns 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });

  it('GET /api/v1/auth without downstream service running returns 503 Service Unavailable', async () => {
    const res = await request(app).get('/api/v1/auth/health');
    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('error', 'Service Unavailable');
  });
});
