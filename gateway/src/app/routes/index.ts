import { Router, Request, Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import { config } from '../config';

const router = Router();

// Gateway Health Check
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'gateway',
    timestamp: new Date().toISOString(),
  });
});

// Helper for error handling when target microservice is offline
const handleProxyError = (serviceName: string) => {
  return (err: any, res: Response, next: NextFunction) => {
    res.status(503).json({
      error: 'Service Unavailable',
      message: `${serviceName} is not reachable`,
      details: err.message,
    });
  };
};

// Route proxying to services
router.use(
  '/api/v1/auth',
  proxy(config.services.auth, {
    proxyReqPathResolver: (req) => `/api/v1/auth${req.url}`,
    proxyErrorHandler: handleProxyError('Auth Service'),
  })
);

router.use(
  '/api/v1/chat',
  proxy(config.services.chat, {
    proxyReqPathResolver: (req) => `/api/v1/chat${req.url}`,
    proxyErrorHandler: handleProxyError('Chat Service'),
  })
);

router.use(
  '/api/v1/agents',
  proxy(config.services.agents, {
    proxyReqPathResolver: (req) => `/api/v1/agents${req.url}`,
    proxyErrorHandler: handleProxyError('Agents Service'),
  })
);

router.use(
  '/api/v1/billing',
  proxy(config.services.billing, {
    proxyReqPathResolver: (req) => `/api/v1/billing${req.url}`,
    proxyErrorHandler: handleProxyError('Billing Service'),
  })
);

export default router;
