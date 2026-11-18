import { Request, Response } from "express";
import * as chatService from "../service/chat.service";

/**
 * POST /api/v1/chat/conversations
 * Start a new conversation
 */
export const createConversationHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "User ID missing",
      });
    }

    const { title } = req.body;
    const conversation = await chatService.createConversation(userId, title);

    return res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/chat/conversations
 * List all conversations for the user's sidebar
 */
export const getUserConversationsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "User ID missing",
      });
    }

    const conversations = await chatService.getUserConversations(userId);

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/chat/conversations/:id
 * Get conversation details + message history
 */
export const getConversationHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "User ID missing",
      });
    }

    const conversation = await chatService.getConversationWithMessages(
      id as string,
      userId,
    );
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Conversation not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * DELETE /api/v1/chat/conversations/:id
 * Delete conversation and its messages
 */
export const deleteConversationHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "User ID missing",
      });
    }

    const deleted = await chatService.deleteConversation(id as string, userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Conversation not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation and messages deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

/**
 * POST /api/v1/chat/conversations/:id/messages
 * Send a user message to a conversation
 */
export const createMessageHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { id: conversationId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "User ID missing",
      });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "Message content is required and cannot be empty",
      });
    }

    const result = await chatService.createUserMessage(
      conversationId as string,
      userId,
      content.trim(),
    );
    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: "Conversation not found or access denied",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: result.message,
      conversationTitle: result.conversation.title,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};
