import { Request, Response, Router } from "express";
import chatRoutes from "./chat.route";

const router = Router();

// Health check endpoints
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "chat-service",
    timestamp: new Date().toISOString(),
  });
});

router.get("/api/v1/chat/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "chat-service",
    message: "Chat service is operational",
    timestamp: new Date().toISOString(),
  });
});

// Register Chat & Conversation routes
router.use("/api/v1/chat", chatRoutes);

export default router;
