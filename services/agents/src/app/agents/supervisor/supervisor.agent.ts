import { SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "../../config";
import { chatAgent } from "../chat/chat.agent";
import { codingAgent } from "../coding/coding.agent";
import { imageAgent } from "../image/image.agent";
import { pdfAgent } from "../pdf/pdf.agent";
import { pptAgent } from "../ppt/ppt.agent";
import { searchAgent } from "../search/search.agent";
import { AgentStateType, AgentType } from "../types";

// 1. Fast, low-temperature Gemini model for intent classification
const routerModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  temperature: 0.1, // Near zero for deterministic classification
  apiKey: config.geminiApiKey,
});

// 2. Supervisor routing system instructions
const SUPERVISOR_PROMPT = new SystemMessage(
  `You are the SkyGPT Supervisor Router. Your task is to analyze the user's latest message (and conversation history) and select the single most appropriate agent to answer.

Available Agents:
- "search": When the user asks about current events, latest news, weather, real-time facts, recent releases, sports scores, or anything requiring live web search.
- "coding": When the user asks for code, programming, debugging, refactoring, algorithms, SQL queries, system architecture, or software engineering.
- "pdf": When the user asks questions about an uploaded document, PDF, contract, resume, policy, or file context.
- "ppt": When the user asks to create a presentation, slide deck, PowerPoint, keynote outline, or pitch deck.
- "image": When the user asks to create, draw, generate, paint, design, or visualize an image, illustration, or artwork.
- "chat": For general conversation, greetings, creative writing, explanations, philosophy, math, or anything that does not clearly require the specialized agents above.

Respond with ONLY valid JSON in this exact structure:
{
  "selectedAgent": "search" | "coding" | "pdf" | "ppt" | "image" | "chat",
  "reasoning": "brief 1-sentence reason"
}`,
);

/**
 * Classifies user intent to determine target agent
 */
export const classifyIntent = async (
  state: AgentStateType,
): Promise<Exclude<AgentType, "auto">> => {
  try {
    const promptMessages = [SUPERVISOR_PROMPT, ...state.messages];
    const response = await routerModel.invoke(promptMessages);

    const rawContent =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // Strip any markdown code fences if present
    const cleanJson = rawContent
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleanJson);
    const validAgents: Array<Exclude<AgentType, "auto">> = [
      "chat",
      "search",
      "coding",
      "pdf",
      "ppt",
      "image",
    ];

    if (validAgents.includes(parsed.selectedAgent)) {
      return parsed.selectedAgent;
    }
    return "chat";
  } catch (error) {
    console.warn("[Supervisor Classification Fallback to chat]:", error);
    return "chat";
  }
};

/**
 * Supervisor Agent: routes dynamically to the selected agent graph
 */
export const supervisorAgent = {
  invoke: async (state: AgentStateType) => {
    // 1. Identify best agent
    const targetAgent = await classifyIntent(state);

    // 2. Map target agent to graph
    const agentMap: Record<Exclude<AgentType, "auto">, any> = {
      chat: chatAgent,
      search: searchAgent,
      coding: codingAgent,
      pdf: pdfAgent,
      ppt: pptAgent,
      image: imageAgent,
    };

    const selectedGraph = agentMap[targetAgent] || chatAgent;

    // 3. Execute target agent graph
    const result = await selectedGraph.invoke({
      ...state,
      currentAgent: targetAgent,
    });

    return {
      ...result,
      agentUsed: targetAgent,
    };
  },
};
