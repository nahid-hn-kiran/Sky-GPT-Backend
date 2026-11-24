import { SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { config } from "../../config";
import { AgentState, AgentStateType } from "../types";

// 1. Initialize Gemini with low temperature for code accuracy
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  temperature: 0.1, // Near-zero temperature minimizes syntax bugs and hallucinations
  apiKey: config.geminiApiKey,
});

// 2. Coding Specialist System Prompt
const CODING_SYSTEM_PROMPT = new SystemMessage(
  `You are SkyGPT Coding Specialist, a world-class senior software engineer and architect.
Follow these guidelines strictly:
1. Always produce clean, modular, production-ready, and well-typed code.
2. In TypeScript/JavaScript, prefer modern ES6+ syntax, TypeScript strict typing, and arrow functions for function definitions.
3. Include brief inline comments explaining non-trivial logic, edge cases, and performance considerations.
4. Format all code inside standard markdown fences with language tags (e.g. \`\`\`typescript ... \`\`\`).
5. After the code, provide a concise explanation of how it works and any relevant time/space complexity (Big-O).
6. Suggest brief unit tests or edge-case validation whenever appropriate.`,
);

// 3. Worker Node: Invoke the model with the coding persona
const callCodingModel = async (state: AgentStateType) => {
  const promptMessages = [CODING_SYSTEM_PROMPT, ...state.messages];
  const response = await model.invoke(promptMessages);

  return {
    messages: [response],
  };
};

// 4. Build the LangGraph Workflow
const workflow = new StateGraph(AgentState)
  .addNode("coder", callCodingModel)
  .addEdge(START, "coder")
  .addEdge("coder", END);

// 5. Compile and export
export const codingAgent = workflow.compile();
