import { SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { config } from "../../config";
import { AgentState, AgentStateType } from "../types";

// 1. Initialize Gemini LLM with API Key from config
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  temperature: 0.7,
  apiKey: config.geminiApiKey,
});

// 2. The Worker Node (Arrow Function)
const callChatModel = async (state: AgentStateType) => {
  const systemPrompt = new SystemMessage(
    "You are SkyGPT, a friendly, intelligent, and highly capable AI assistant. Answer user questions clearly and concisely.",
  );

  // Combine system instructions with full conversation history
  const promptMessages = [systemPrompt, ...state.messages];

  // Invoke the LLM
  const response = await model.invoke(promptMessages);

  // Return the new AIMessage to append to the State
  return {
    messages: [response],
  };
};

// 3. Assemble the State Graph
const workflow = new StateGraph(AgentState)
  .addNode("chatNode", callChatModel)
  .addEdge(START, "chatNode")
  .addEdge("chatNode", END);

// 4. Compile the graph into an executable agent
export const chatAgent = workflow.compile();
