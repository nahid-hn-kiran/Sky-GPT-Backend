import Conversation from "../models/conversation.model";
import Message from "../models/message.model";

/**
 * 1. Create a new conversation thread
 */
export const createConversation = async (userId: string, title?: string) => {
  const conversation = await Conversation.create({
    userId,
    title: title || "New Conversation",
  });
  return conversation;
};

/**
 * 2. Get all conversations for a user (ordered by latest active)
 */
export const getUserConversations = async (userId: string) => {
  const conversations = await Conversation.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
  return conversations;
};

/**
 * 3. Get a single conversation with its message history
 */
export const getConversationWithMessages = async (
  conversationId: string,
  userId: string,
) => {
  // Ensure the conversation exists and belongs to the requesting user
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  }).lean();
  if (!conversation) {
    return null;
  }

  // Fetch messages in chronological order
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean();

  return {
    ...conversation,
    messages,
  };
};

/**
 * 4. Delete a conversation and all its associated messages (Cascade Delete)
 */
export const deleteConversation = async (
  conversationId: string,
  userId: string,
) => {
  // Ensure the user owns this conversation before deleting
  const conversation = await Conversation.findOneAndDelete({
    _id: conversationId,
    userId,
  });
  if (!conversation) {
    return false;
  }

  // Delete all messages belonging to this thread
  await Message.deleteMany({ conversationId });
  return true;
};

/**
 * 5. Save a message to a conversation
 */
export const saveMessage = async (
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
) => {
  const message = await Message.create({
    conversationId,
    role,
    content,
  });

  // Touch the conversation's updatedAt timestamp
  await Conversation.findByIdAndUpdate(conversationId, {
    updatedAt: new Date(),
  });

  return message;
};

/**
 * 6. Create a user message with ownership check and auto-title generation
 */
export const createUserMessage = async (
  conversationId: string,
  userId: string,
  content: string,
) => {
  // 1. Verify that the conversation exists and belongs to this user
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  });
  if (!conversation) {
    return null;
  }
  // 2. Save the user's message
  const userMessage = await Message.create({
    conversationId,
    role: "user",
    content,
  });
  // 3. Smart ChatGPT Touch: If title is still default, rename it based on the first prompt
  if (conversation.title === "New Conversation") {
    const generatedTitle =
      content.length > 30 ? `${content.substring(0, 30)}...` : content;
    conversation.title = generatedTitle;
  }
  // 4. Update conversation timestamp
  conversation.updatedAt = new Date();
  await conversation.save();
  return {
    conversation,
    message: userMessage,
  };
};
