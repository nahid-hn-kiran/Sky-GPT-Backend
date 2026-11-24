import { chatAgent } from "./chat/chat.agent";
import { AgentType } from "./types";

// Map of all compiled LangGraph agents
const agentRegistry: Record<AgentType, any> = {
  chat: chatAgent,
  // Remaining agents will be plugged in here:
  search: chatAgent, // placeholder fallback
  coding: chatAgent, // placeholder fallback
  pdf: chatAgent, // placeholder fallback
  ppt: chatAgent, // placeholder fallback
  image: chatAgent, // placeholder fallback
};

/**
 * Returns the requested LangGraph agent or defaults to 'chat'
 */
export const getAgent = (type?: AgentType) => {
  if (type && agentRegistry[type]) {
    return agentRegistry[type];
  }
  return agentRegistry.chat;
};

export * from "./types";
