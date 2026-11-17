import { Router, Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth';
import adminRoutes from './admin';

const router = Router();

// Health check endpoints
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

router.get('/api/v1/auth/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    message: 'Auth service with Better Auth is operational',
    timestamp: new Date().toISOString(),
  });
});

// Self-contained EJS Auth test sandbox
router.get(['/test', '/api/v1/auth/test'], (req: Request, res: Response) => {
  res.render('test-auth');
});

// Admin management routes (e.g., /api/v1/auth/admin/create-admin)
router.use('/api/v1/auth/admin', adminRoutes);

// Mount all Better Auth handlers (/api/v1/auth/*)
// Covers /sign-in/social, /callback/*, /sign-in/email, /get-session, /sign-out, etc.
router.all('/api/v1/auth/*', toNodeHandler(auth));

export default router;
