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
}

/**
 * Converts plain client/DB message objects to LangChain BaseMessage classes
 */
const toLangChainMessages = (messages: IncomingMessageDTO[]): BaseMessage[] => {
  return messages.map((msg) => {
    switch (msg.role) {
      case "user":
        return new HumanMessage(msg.content);
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

  return {
    role: "assistant" as const,
    content:
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : JSON.stringify(lastMessage.content),
    agentUsed: agentType,
  };
};
