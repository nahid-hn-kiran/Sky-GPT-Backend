import { chatAgent } from "./chat/chat.agent";
import { codingAgent } from "./coding/coding.agent";
import { pdfAgent } from "./pdf/pdf.agent";
import { searchAgent } from "./search/search.agent";
import { AgentType } from "./types";

export * from "./types";

export const agentRegistry: Record<AgentType, any> = {
  chat: chatAgent,
  search: searchAgent,
  coding: codingAgent, // placeholder until we build coding agent
  pdf: pdfAgent, // placeholder
  ppt: chatAgent, // placeholder
  image: chatAgent, // placeholder
};

export const getAgent = (agentType: AgentType) => {
  return agentRegistry[agentType] || chatAgent;
};
