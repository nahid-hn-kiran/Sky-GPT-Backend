import { SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { config } from "../../config";
import { AgentState, AgentStateType } from "../types";

// 1. Initialize Gemini with temperature 0.3 for creative yet structured presentation design
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  temperature: 0.3,
  apiKey: config.geminiApiKey,
});

// 2. Specialized Presentation Architecture System Prompt
const PPT_SYSTEM_PROMPT = new SystemMessage(
  `You are SkyGPT Presentation Maker, an expert executive presentation designer.
When a user asks for a presentation, deck, or slide outline:
1. Produce a comprehensive, high-impact slide presentation.
2. Structure your answer with clear Slide Headers (e.g., "## Slide 1: Title", "## Slide 2: Problem Statement", etc.).
3. For each slide, include:
   - **Slide Title**
   - **Key Bullet Points** (3-5 concise, impactful bullets)
   - **Visual Suggestion** (e.g., "[Visual: Bar chart comparing 2025 vs 2026 growth]")
   - **Speaker Notes** (what the presenter should say)
4. Wrap with an executive summary slide and next steps/call-to-action.
5. Provide a JSON-ready metadata block at the very end in a \`\`\`json\`\`\` code fence containing:
   {
     "title": "Presentation Title",
     "totalSlides": 5,
     "theme": "modern-dark",
     "slides": [
       { "slideNumber": 1, "title": "...", "bullets": ["..."], "speakerNotes": "..." }
     ]
   }
This allows frontend clients to either read the markdown slides directly or render them in an interactive slide preview!`,
);

// 3. Worker Node: Generate the presentation outline and slides
const generatePresentation = async (state: AgentStateType) => {
  const promptMessages = [PPT_SYSTEM_PROMPT, ...state.messages];
  const response = await model.invoke(promptMessages);

  return {
    messages: [response],
  };
};

// 4. Build the LangGraph Workflow
const workflow = new StateGraph(AgentState)
  .addNode("generator", generatePresentation)
  .addEdge(START, "generator")
  .addEdge("generator", END);

// 5. Compile and export
export const pptAgent = workflow.compile();
