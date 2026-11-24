import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

/**
 * The standard agent types supported across SkyGPT
 */
export type AgentType = "chat" | "search" | "coding" | "pdf" | "ppt" | "image";

/**
 * Unified State shared across all 6 agents.
 */
export const AgentState = Annotation.Root({
  // All chat history (UserMessage, AIMessage, ToolMessage)
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
  // Active user ID from the Gateway
  userId: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),
  // Active conversation thread ID
  conversationId: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),
  // Which agent is currently handling the request
  currentAgent: Annotation<AgentType>({
    reducer: (_, update) => update,
    default: () => "chat",
  }),
});

export type AgentStateType = typeof AgentState.State;
