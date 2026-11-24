import { Router } from "express";
import { executeAgentHandler } from "../controller/agent.controller";

const router = Router();

// POST /api/v1/agents/execute
router.post("/execute", executeAgentHandler);

export default router;
