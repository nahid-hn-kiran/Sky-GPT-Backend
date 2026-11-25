import { SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { config } from "../../config";
import { AgentState, AgentStateType } from "../types";
import { searchSimilarChunks } from "./vector-store";

// 1. Initialize Gemini with balanced temperature for document Q&A
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  temperature: 0.2,
  apiKey: config.geminiApiKey,
});

// 2. Worker Node: Retrieve relevant document context and answer
const answerWithDocumentContext = async (state: AgentStateType) => {
  const conversationId = state.conversationId || "default";
  const userMessages = state.messages.filter((m) => m._getType() === "human");
  const latestQuery =
    userMessages.length > 0
      ? String(userMessages[userMessages.length - 1].content)
      : "";

  let contextText = "";
  try {
    const relevantChunks = await searchSimilarChunks(
      conversationId,
      latestQuery,
      3,
    );
    if (relevantChunks.length > 0) {
      contextText = relevantChunks
        .map(
          (chunk, idx) =>
            `[Source ${idx + 1} - ${chunk.metadata?.fileName || "Document"}]:\n${chunk.pageContent}`,
        )
        .join("\n\n---\n\n");
    }
  } catch {
    contextText = "";
  }

  // 3. System prompt instructing the model to ground its response in retrieved context
  const systemPrompt = new SystemMessage(
    contextText
      ? `You are SkyGPT Document & PDF Assistant. Answer the user's question accurately using only the following retrieved context. If the answer cannot be found in the context, politely state that the document does not contain that information. Always cite source names where applicable.

Retrieved Context:
${contextText}`
      : `You are SkyGPT Document & PDF Assistant. No documents have been indexed yet for this conversation, or no matches were found. Politely explain that you are ready to answer questions once a document is uploaded, or offer general guidance about documents.`,
  );

  const promptMessages = [systemPrompt, ...state.messages];
  const response = await model.invoke(promptMessages);

  return {
    messages: [response],
  };
};

// 4. Build the LangGraph Workflow
const workflow = new StateGraph(AgentState)
  .addNode("rag", answerWithDocumentContext)
  .addEdge(START, "rag")
  .addEdge("rag", END);

// 5. Compile and export
export const pdfAgent = workflow.compile();
