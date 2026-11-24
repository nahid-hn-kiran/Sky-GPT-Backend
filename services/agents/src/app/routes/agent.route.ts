import { Router } from "express";
import {
  executeAgentHandler,
  ingestDocumentHandler,
} from "../controller/agent.controller";

const router = Router();

// POST /api/v1/agents/execute
router.post("/execute", executeAgentHandler);

// POST /api/v1/agents/documents/ingest
router.post("/documents/ingest", ingestDocumentHandler);

export default router;
