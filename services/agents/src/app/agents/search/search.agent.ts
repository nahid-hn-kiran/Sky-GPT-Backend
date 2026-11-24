import { SystemMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { z } from "zod";
import { config } from "../../config";
import { AgentState, AgentStateType } from "../types";

// 1. Define the Tavily Search Tool using LangChain's native `tool` helper
export const tavilySearchTool = tool(
  async ({ query }: { query: string }) => {
    try {
      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: config.tavilyApiKey,
          query,
          search_depth: "basic",
          max_results: 3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return `Tavily Search API Error: ${response.status} - ${errorText}`;
      }

      const data = (await response.json()) as {
        results?: Array<{ title: string; url: string; content: string }>;
      };

      if (!data.results || data.results.length === 0) {
        return "No relevant search results found.";
      }

      // Format results cleanly for the LLM with titles, URLs, and snippets
      return data.results
        .map(
          (result, idx) =>
            `[${idx + 1}] ${result.title}\nURL: ${result.url}\nSummary: ${result.content}`,
        )
        .join("\n\n");
    } catch (error) {
      return `Failed to execute search: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "tavily_search",
    description:
      "Search the web for real-time information, current events, recent news, or factual queries.",
    schema: z.object({
      query: z.string().describe("The search query to look up on the web"),
    }),
  },
);

// 2. Setup tools and tool execution node
const tools = [tavilySearchTool];
const toolNode = new ToolNode(tools);

// 3. Initialize Gemini and bind our search tool to it
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  temperature: 0.2, // Lower temperature for factual accuracy
  apiKey: config.geminiApiKey,
}).bindTools(tools);

// 4. Worker Node: Call the model with tools enabled
const callModelWithTools = async (state: AgentStateType) => {
  const systemPrompt = new SystemMessage(
    "You are SkyGPT Search Agent, an autonomous research assistant. When asked about current events, news, or facts you need updated information on, use the tavily_search tool. Always provide links and cite your sources in markdown.",
  );

  const promptMessages = [systemPrompt, ...state.messages];
  const response = await model.invoke(promptMessages);

  return {
    messages: [response],
  };
};

// 5. Conditional Edge: Decide whether to run tools or terminate
const shouldContinue = (state: AgentStateType) => {
  const lastMessage = state.messages[state.messages.length - 1];

  // If Gemini generated tool calls, loop to the "tools" node
  if (
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  // Otherwise, the agent has finished answering -> terminate
  return END;
};

// 6. Build the Cyclic LangGraph
const workflow = new StateGraph(AgentState)
  .addNode("model", callModelWithTools)
  .addNode("tools", toolNode)
  .addEdge(START, "model")
  .addConditionalEdges("model", shouldContinue, {
    tools: "tools",
    [END]: END,
  })
  .addEdge("tools", "model"); // Loop back to model after tools execute so it can synthesize the answer

// 7. Compile the graph
export const searchAgent = workflow.compile();
