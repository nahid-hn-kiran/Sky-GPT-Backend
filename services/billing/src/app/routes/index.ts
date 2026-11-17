import { Router, Request, Response } from 'express';

const router = Router();

// Direct health check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'billing-service',
    timestamp: new Date().toISOString(),
  });
});

// Gateway-proxied route prefix: /api/v1/billing
router.get('/api/v1/billing/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'billing-service',
    message: 'Billing service is operational',
    timestamp: new Date().toISOString(),
  });
});

export default router;
