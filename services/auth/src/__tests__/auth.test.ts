import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Auth Service with Better Auth & RBAC', () => {
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
  });

  it('GET /api/v1/auth/test renders the EJS tester HTML page', async () => {
    const res = await request(app).get('/api/v1/auth/test');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('SkyGPT Auth Tester');
  });

  it('POST /api/v1/auth/admin/create-admin without admin session returns 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/v1/auth/admin/create-admin')
      .send({
        email: 'newadmin@skygpt.com',
        password: 'password1234',
        name: 'New Admin',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('GET /unknown-route returns 404', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
  });
});
