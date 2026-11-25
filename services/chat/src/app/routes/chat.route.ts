import { Router } from "express";
import {
  createConversationHandler,
  createMessageHandler,
  deleteConversationHandler,
  getConversationHandler,
  getUserConversationsHandler,
} from "../controller/chat.controller";
import { uploadFileHandler } from "../controller/upload.controller";
import { upload } from "../middlewares/upload";

const router = Router();

// File upload route
router.post("/upload", upload.single("file"), uploadFileHandler);

// Conversation routes
router.post("/conversations", createConversationHandler);
router.get("/conversations", getUserConversationsHandler);
router.get("/conversations/:id", getConversationHandler);
router.delete("/conversations/:id", deleteConversationHandler);

// Message routes
router.post("/conversations/:id/messages", createMessageHandler);

export default router;
