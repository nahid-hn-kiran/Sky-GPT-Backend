import { chatAgent } from "./chat/chat.agent";
import { codingAgent } from "./coding/coding.agent";
import { imageAgent } from "./image/image.agent";
import { pdfAgent } from "./pdf/pdf.agent";
import { pptAgent } from "./ppt/ppt.agent";
import { searchAgent } from "./search/search.agent";
import { supervisorAgent } from "./supervisor/supervisor.agent";
import { AgentType } from "./types";

export * from "./types";

export const agentRegistry: Record<AgentType, any> = {
  auto: supervisorAgent,
  chat: chatAgent,
  search: searchAgent,
  coding: codingAgent,
  pdf: pdfAgent,
  ppt: pptAgent,
  image: imageAgent,
};

export const getAgent = (agentType: AgentType = "auto") => {
  return agentRegistry[agentType] || supervisorAgent;
};
