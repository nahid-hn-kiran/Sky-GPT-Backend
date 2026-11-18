import { Router } from "express";
import {
  createConversationHandler,
  createMessageHandler,
  deleteConversationHandler,
  getConversationHandler,
  getUserConversationsHandler,
} from "../controller/chat.controller";

const router = Router();

// Conversation routes
router.post("/conversations", createConversationHandler);
router.get("/conversations", getUserConversationsHandler);
router.get("/conversations/:id", getConversationHandler);
router.delete("/conversations/:id", deleteConversationHandler);

// Message routes
router.post("/conversations/:id/messages", createMessageHandler); // <-- Add this route

export default router;
