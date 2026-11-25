import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { config } from "../../config";

export interface DocumentChunk {
  pageContent: string;
  metadata?: {
    fileName?: string;
    page?: number;
    [key: string]: any;
  };
  embedding?: number[];
}

// 1. Initialize Google Embeddings model
export const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: config.geminiApiKey,
});

// 2. Math helper: Cosine similarity between two float vectors
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// 3. Simple text chunker helper (splits text into chunks with overlap)
export const splitTextIntoChunks = (
  text: string,
  chunkSize: number = 800,
  overlap: number = 150,
): string[] => {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    chunks.push(text.slice(startIndex, endIndex));
    if (endIndex === text.length) break;
    startIndex += chunkSize - overlap;
  }

  return chunks;
};

// 4. In-Memory Store Map: conversationId -> DocumentChunk[]
const conversationStores = new Map<string, DocumentChunk[]>();

/**
 * Ingest raw text into the conversation's vector store with embeddings
 */
export const ingestDocumentText = async (
  conversationId: string,
  rawText: string,
  metadata: { fileName?: string; [key: string]: any } = {},
): Promise<number> => {
  const textChunks = splitTextIntoChunks(rawText);
  if (textChunks.length === 0) return 0;

  // Generate embeddings for all chunks via Gemini Embeddings
  const chunkVectors = await embeddings.embedDocuments(textChunks);

  const documentChunks: DocumentChunk[] = textChunks.map((content, idx) => ({
    pageContent: content,
    metadata,
    embedding: chunkVectors[idx],
  }));

  const existingChunks = conversationStores.get(conversationId) || [];
  conversationStores.set(conversationId, [
    ...existingChunks,
    ...documentChunks,
  ]);

  return documentChunks.length;
};

/**
 * Perform cosine-similarity vector search against the conversation's stored chunks
 */
export const searchSimilarChunks = async (
  conversationId: string,
  query: string,
  topK: number = 3,
): Promise<DocumentChunk[]> => {
  const chunks = conversationStores.get(conversationId);
  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Embed the user's search query
  const queryVector = await embeddings.embedQuery(query);

  // Score each chunk using cosine similarity
  const scoredChunks = chunks
    .filter((c) => c.embedding && c.embedding.length > 0)
    .map((chunk) => ({
      chunk,
      similarity: cosineSimilarity(queryVector, chunk.embedding!),
    }));

  // Sort descending by similarity and take topK
  scoredChunks.sort((a, b) => b.similarity - a.similarity);

  return scoredChunks.slice(0, topK).map((item) => item.chunk);
};
