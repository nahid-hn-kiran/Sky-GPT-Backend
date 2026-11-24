import { SystemMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { END, START, StateGraph } from "@langchain/langgraph";
import { config } from "../../config";
import { AgentState, AgentStateType } from "../types";

// 1. Initialize Gemini with temperature 0.4 for creative visual elaboration
const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.1-flash-lite",
  temperature: 0.4,
  apiKey: config.geminiApiKey,
});

// 2. Specialized Visual Prompt Artist System Prompt
const IMAGE_SYSTEM_PROMPT = new SystemMessage(
  `You are SkyGPT Visual Creator, a master digital artist and prompt engineer.
When a user asks to generate, create, or imagine an image:
1. Carefully extract the subject, style, lighting, mood, and color palette from the user request.
2. Generate a highly descriptive, refined image prompt (around 25-50 words) optimized for modern image models like FLUX and SDXL.
3. Construct a public rendering image URL using Pollinations AI with the encoded prompt:
   https://image.pollinations.ai/prompt/<encoded_prompt>?width=1024&height=768&nologo=true&enhance=true
4. Return a response with:
   - The rendered image: ![Generated Image](https://image.pollinations.ai/prompt/<encoded_prompt>?width=1024&height=768&nologo=true&enhance=true)
   - **Enhanced Prompt**: The detailed prompt you constructed.
   - **Artistic Attributes**: Style, Lighting, Mood, Aspect Ratio.
   - [Direct Image Link](https://image.pollinations.ai/prompt/<encoded_prompt>?width=1024&height=768&nologo=true&enhance=true)`,
);

// 3. Worker Node: Expand prompt and generate the image markdown
const generateImage = async (state: AgentStateType) => {
  const promptMessages = [IMAGE_SYSTEM_PROMPT, ...state.messages];
  const response = await model.invoke(promptMessages);

  return {
    messages: [response],
  };
};

// 4. Build the LangGraph Workflow
const workflow = new StateGraph(AgentState)
  .addNode("image_creator", generateImage)
  .addEdge(START, "image_creator")
  .addEdge("image_creator", END);

// 5. Compile and export
export const imageAgent = workflow.compile();
