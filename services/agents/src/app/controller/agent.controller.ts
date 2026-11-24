import { Request, Response } from "express";
import { ingestDocumentText } from "../agents/pdf/vector-store";
import { AgentType } from "../agents/types";
import * as agentService from "../service/agent.service";

/**
 * POST /api/v1/agents/documents/ingest
 * Ingest document text or PDF content into the conversation's vector store
 */
export const ingestDocumentHandler = async (req: Request, res: Response) => {
  try {
    const { conversationId, text, fileName } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "text field is required for document ingestion",
      });
    }

    const chunkCount = await ingestDocumentText(
      conversationId || "default-session",
      text,
      { fileName: fileName || "uploaded-doc.txt" },
    );

    return res.status(200).json({
      success: true,
      message: `Successfully indexed ${chunkCount} chunks into vector store!`,
      data: {
        conversationId: conversationId || "default-session",
        chunkCount,
        fileName: fileName || "uploaded-doc.txt",
      },
    });
  } catch (error: any) {
    console.error("[Document Ingest Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Ingestion Failed",
      message: error.message || "Failed to ingest document",
    });
  }
};

/**
 * POST /api/v1/agents/execute
 * Execute the LangGraph agent
 */
export const executeAgentHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || "anonymous";
    const { messages, conversationId, agentType } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message:
          "messages array is required and must contain at least one message",
      });
    }

    const response = await agentService.executeAgent(
      (agentType as AgentType) || "chat",
      messages,
      userId,
      conversationId || "default-session",
    );

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("[Agent Execution Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Agent Execution Failed",
      message: error.message || "An error occurred while executing the agent",
    });
  }
};
