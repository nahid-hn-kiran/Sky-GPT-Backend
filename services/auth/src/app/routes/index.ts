import { Router, Request, Response } from 'express';

const router = Router();

// Direct health check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
});

// Gateway-proxied route prefix: /api/v1/auth
router.get('/api/v1/auth/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    message: 'Auth service is operational',
    timestamp: new Date().toISOString(),
  });
});

export default router;
