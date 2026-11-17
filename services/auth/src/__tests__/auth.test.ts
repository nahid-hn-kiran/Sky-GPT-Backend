import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Auth Service Initial Setup', () => {
  it('GET /health returns 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'auth-service');
  });

  it('GET /api/v1/auth/health returns 200', async () => {
    const res = await request(app).get('/api/v1/auth/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'auth-service');
  });

  it('GET /unknown-route returns 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });
});
