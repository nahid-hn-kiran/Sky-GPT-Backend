import { Request, Response } from "express";
import { AgentType } from "../agents/types";
import * as agentService from "../service/agent.service";

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
      conversationId || "",
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
