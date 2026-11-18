import { NextFunction, Request, Response, Router } from "express";
import proxy from "express-http-proxy";
import { config } from "../config";
import { AuthenticatedGatewayRequest, gatewayAuth } from "../middlewares/auth";

const router = Router();

// Gateway Health Check (Public)
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "gateway",
    timestamp: new Date().toISOString(),
  });
});

// Helper for error handling when target microservice is offline
const handleProxyError = (serviceName: string) => {
  return (err: any, res: Response, next: NextFunction) => {
    res.status(503).json({
      error: "Service Unavailable",
      message: `${serviceName} is not reachable`,
      details: err.message,
    });
  };
};

// Helper: Injects verified user context into proxy headers
const injectUserHeaders = (proxyReqOpts: any, srcReq: Request) => {
  const req = srcReq as AuthenticatedGatewayRequest;
  if (req.user) {
    proxyReqOpts.headers["x-user-id"] = req.user.id;
    proxyReqOpts.headers["x-user-role"] = req.user.role;
    proxyReqOpts.headers["x-user-email"] = req.user.email;
  }
  return proxyReqOpts;
};

// 1. Auth Service (Public: handles sign-in, callbacks, get-session)
router.use(
  "/api/v1/auth",
  proxy(config.services.auth, {
    proxyReqPathResolver: (req) => `/api/v1/auth${req.url}`,
    proxyErrorHandler: handleProxyError("Auth Service"),
  }),
);

// 2. Chat Service (PROTECTED: Requires authenticated user)
router.use(
  "/api/v1/chat",
  gatewayAuth,
  proxy(config.services.chat, {
    proxyReqPathResolver: (req) => `/api/v1/chat${req.url}`,
    proxyReqOptDecorator: injectUserHeaders,
    proxyErrorHandler: handleProxyError("Chat Service"),
  }),
);

// 3. Agents Service (PROTECTED: Requires authenticated user)
router.use(
  "/api/v1/agents",
  gatewayAuth,
  proxy(config.services.agents, {
    proxyReqPathResolver: (req) => `/api/v1/agents${req.url}`,
    proxyReqOptDecorator: injectUserHeaders,
    proxyErrorHandler: handleProxyError("Agents Service"),
  }),
);

// 4. Billing Service (PROTECTED: Requires authenticated user)
router.use(
  "/api/v1/billing",
  gatewayAuth,
  proxy(config.services.billing, {
    proxyReqPathResolver: (req) => `/api/v1/billing${req.url}`,
    proxyReqOptDecorator: injectUserHeaders,
    proxyErrorHandler: handleProxyError("Billing Service"),
  }),
);

export default router;
