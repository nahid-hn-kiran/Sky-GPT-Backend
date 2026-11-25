import { Request, Response } from "express";
import path from "path";

/**
 * POST /api/v1/chat/upload
 * Handle single file upload for documents and images
 */
export const uploadFileHandler = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: "No file was uploaded",
      });
    }

    // Determine the accessible URL (served via Gateway on port 4000)
    const fileUrl = `/uploads/${file.filename}`;
    const isImage = file.mimetype.startsWith("image/");
    const isPdf = file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf");

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName: file.originalname,
        storedName: file.filename,
        fileUrl,
        mimeType: file.mimetype,
        size: file.size,
        isImage,
        isPdf,
        localPath: file.path,
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
