import fs from "fs";
import path from "path";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { AgentType, getAgent } from "../agents";

export interface IncomingMessageDTO {
  role: "user" | "assistant" | "system";
  content: string;
  imageUrl?: string;
}

/**
 * Resolves an image URL or file path to a base64 Data URL required by Gemini
 */
const resolveToBase64DataUrl = (rawUrl: string): string | null => {
  if (!rawUrl || typeof rawUrl !== "string") return null;

  // 1. If already a valid base64 data URL, return it
  if (rawUrl.startsWith("data:image/")) {
    return rawUrl;
  }

  // 2. If it's a relative or localhost upload URL, resolve from disk
  // e.g. "/uploads/xyz.jpg" or "http://localhost:4000/uploads/xyz.jpg"
  const match = rawUrl.match(/\/uploads\/([^\/\s?#]+)/);
  if (match) {
    const filename = match[1];
    // Path to chat service uploads directory
    const uploadFilePath = path.resolve(
      process.cwd(),
      "../chat/uploads",
      filename,
    );
    const altUploadFilePath = path.resolve(
      process.cwd(),
      "services/chat/uploads",
      filename,
    );

    const targetPath = fs.existsSync(uploadFilePath)
      ? uploadFilePath
      : fs.existsSync(altUploadFilePath)
        ? altUploadFilePath
        : null;

    if (targetPath) {
      try {
        const fileBuffer = fs.readFileSync(targetPath);
        const ext = path.extname(targetPath).toLowerCase();
        let mimeType = "image/jpeg";
        if (ext === ".png") mimeType = "image/png";
        else if (ext === ".webp") mimeType = "image/webp";
        else if (ext === ".gif") mimeType = "image/gif";

        return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
      } catch (err) {
        console.warn(`[Resolve Image Error for ${filename}]:`, err);
      }
    }
  }

  return null;
};

/**
 * Converts plain client/DB message objects to LangChain BaseMessage classes
 * Supports multimodal inputs (text + image) for Gemini
 */
const toLangChainMessages = (messages: IncomingMessageDTO[]): BaseMessage[] => {
  return messages.map((msg) => {
    switch (msg.role) {
      case "user": {
        // If an image is attached, convert/resolve to base64 data URL
        const base64DataUrl = msg.imageUrl
          ? resolveToBase64DataUrl(msg.imageUrl)
          : null;

        if (base64DataUrl) {
          return new HumanMessage({
            content: [
              {
                type: "text",
                text: msg.content || "Please analyze this image.",
              },
              {
                type: "image_url",
                image_url: {
                  url: base64DataUrl,
                },
              },
            ],
          });
        }
        return new HumanMessage(msg.content);
      }
      case "assistant":
        return new AIMessage(msg.content);
      case "system":
        return new SystemMessage(msg.content);
      default:
        return new HumanMessage(msg.content);
    }
  });
};

/**
 * Executes the selected LangGraph agent and returns the final response
 */
export const executeAgent = async (
  agentType: AgentType,
  messages: IncomingMessageDTO[],
  userId: string,
  conversationId: string,
) => {
  // 1. Resolve the requested agent graph
  const agent = getAgent(agentType);

  // 2. Format messages for LangGraph State
  const formattedMessages = toLangChainMessages(messages);

  // 3. Run the LangGraph State Machine
  const result = await agent.invoke({
    messages: formattedMessages,
    userId,
    conversationId,
    currentAgent: agentType,
  });

  // 4. Extract the last message (the AI's final answer)
  const lastMessage = result.messages[result.messages.length - 1];

  let cleanContent = "";
  if (typeof lastMessage.content === "string") {
    cleanContent = lastMessage.content;
  } else if (Array.isArray(lastMessage.content)) {
    // Flatten array of parts [{ type: 'text', text: '...' }]
    cleanContent = lastMessage.content
      .map((part: any) => (typeof part === "string" ? part : part?.text || ""))
      .join("");
  } else {
    cleanContent = JSON.stringify(lastMessage.content);
  }

  return {
    role: "assistant" as const,
    content: cleanContent,
    agentUsed: (result as any).agentUsed || agentType,
  };
};
