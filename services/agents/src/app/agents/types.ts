import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

/**
 * The standard agent types supported across SkyGPT.
 * "auto" invokes the LangGraph Supervisor to classify and route dynamically!
 */
export type AgentType =
  | "auto"
  | "chat"
  | "search"
  | "coding"
  | "pdf"
  | "ppt"
  | "image";

/**
 * Unified State shared across all agents and the supervisor.
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
    default: () => "auto",
  }),
});

export type AgentStateType = typeof AgentState.State;
