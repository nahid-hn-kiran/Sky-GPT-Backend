import { Request, Response } from "express";
import { extractDocumentText } from "../lib/pdf-parser";

/**
 * POST /api/v1/chat/upload
 * Handles file uploads, extracts PDF/doc text, and indexes into the RAG vector store
 */
export const uploadFileHandler = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const conversationId = (req.body.conversationId as string) || "default-session";

    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "No file was uploaded",
      });
    }

    const fileUrl = `/uploads/${file.filename}`;
    const isImage = file.mimetype.startsWith("image/");
    const isPdf =
      file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf");

    let chunkCount = 0;
    let pageCount = 0;
    let extractedSnippet = "";

    // If file is a PDF or text document, extract and ingest into vector store
    if (!isImage) {
      try {
        const doc = await extractDocumentText(file.path, file.mimetype);
        pageCount = doc.pageCount;
        extractedSnippet = doc.text.substring(0, 300);

        if (doc.text.length > 20) {
          const AGENTS_SERVICE_URL =
            process.env.AGENTS_SERVICE_URL || "http://localhost:4003";

          // Ingest extracted text directly into the Agents Service vector store
          const ingestRes = await fetch(
            `${AGENTS_SERVICE_URL}/api/v1/agents/documents/ingest`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                conversationId,
                fileName: file.originalname,
                text: doc.text,
              }),
            },
          );

          if (ingestRes.ok) {
            const ingestData = (await ingestRes.json()) as any;
            chunkCount = ingestData.data?.chunkCount || 0;
          }
        }
      } catch (err: any) {
        console.warn(`[Document Extraction Warning for ${file.originalname}]:`, err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: isPdf
        ? `PDF extracted (${pageCount} pages) and indexed into memory`
        : "File uploaded successfully",
      data: {
        fileName: file.originalname,
        storedName: file.filename,
        fileUrl,
        mimeType: file.mimetype,
        size: file.size,
        isImage,
        isPdf,
        pageCount,
        chunkCount,
        extractedSnippet,
        conversationId,
      },
    });
  } catch (error: any) {
    console.error("[Upload Error]:", error);
    return res.status(500).json({
      success: false,
      error: "Upload Failed",
      message: error.message || "An error occurred during file upload",
    });
  }
};
