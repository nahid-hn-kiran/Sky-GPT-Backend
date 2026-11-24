import { Request, Response, Router } from "express";
import agentRoutes from "./agent.route";

const router = Router();

// Health check endpoints
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "agents-service",
    timestamp: new Date().toISOString(),
  });
});

router.get("/api/v1/agents/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "agents-service",
    message: "Agents service is operational",
    timestamp: new Date().toISOString(),
  });
});

// Register Agent execution routes under /api/v1/agents
router.use("/api/v1/agents", agentRoutes);

export default router;
