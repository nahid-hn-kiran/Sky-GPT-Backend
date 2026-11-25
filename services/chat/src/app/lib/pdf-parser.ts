import fs from "fs";

export interface ExtractedDocument {
  text: string;
  pageCount: number;
}

/**
 * Extracts plain text from an uploaded PDF or text file
 */
export const extractDocumentText = async (
  filePath: string,
  mimeType: string,
): Promise<ExtractedDocument> => {
  // 1. If it's a PDF, extract via modern PDFParse class
  if (mimeType === "application/pdf" || filePath.endsWith(".pdf")) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      // Dynamic import to support both CJS and ESM versions of pdf-parse
      const pdfModule = require("pdf-parse");
      if (pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        await parser.destroy();
        return {
          text: (result?.text || "").trim(),
          pageCount: result?.total || 1,
        };
      } else if (typeof pdfModule === "function") {
        const data = await pdfModule(dataBuffer);
        return {
          text: (data?.text || "").trim(),
          pageCount: data?.numpages || 1,
        };
      }
    } catch (err: any) {
      console.warn("[PDFParse extraction error]:", err.message);
    }
  }

  // 2. If it's a text/markdown file, read directly
  if (
    mimeType.startsWith("text/") ||
    filePath.endsWith(".txt") ||
    filePath.endsWith(".md") ||
    filePath.endsWith(".json")
  ) {
    const text = fs.readFileSync(filePath, "utf-8");
    return {
      text: text.trim(),
      pageCount: 1,
    };
  }

  // 3. Fallback for other files
  return {
    text: "",
    pageCount: 0,
  };
};
