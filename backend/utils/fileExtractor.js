import path from "path";
import { PDFParse } from "pdf-parse";
import { extractTextFromImage } from "../services/textractService.js";

const MIN_TEXT_LENGTH = 5;

/**
 * Extracts readable textual content from an uploaded file buffer.
 * Supports:
 * - Plain text (text/plain, .txt)
 * - PDF documents (application/pdf, .pdf)
 * - Image files (image/png, image/jpeg, image/jpg) via Textract OCR with local fallback
 *
 * @param {Object} file - Multer file object with buffer, mimetype, originalname, size
 * @returns {Promise<{ text: string, engine: string, confidence?: number }>}
 */
export async function extractFileContent(file) {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided for content extraction.");
  }

  const mime = (file.mimetype || "").toLowerCase();
  const ext = path.extname(file.originalname || "").toLowerCase();

  let extractedText = "";
  let engine = "Unknown";
  let confidence = 100;

  // 1. Plain text files
  if (mime === "text/plain" || ext === ".txt") {
    extractedText = file.buffer.toString("utf-8");
    engine = "Text Buffer Reader";
  }
  // 2. PDF Documents
  else if (mime === "application/pdf" || ext === ".pdf") {
    try {
      const parser = new PDFParse({ data: file.buffer });
      const result = await parser.getText();
      extractedText = (result?.text || "").replace(/[\r\n]+/g, "\n").trim();
      engine = "PDF Document Parser";
    } catch (pdfErr) {
      console.error("[FileExtractor] PDF extraction error:", pdfErr.message);
      throw new Error(`Failed to parse PDF document: ${pdfErr.message}`);
    }
  }
  // 3. Image OCR
  else if (
    mime.startsWith("image/") ||
    [".png", ".jpg", ".jpeg"].includes(ext)
  ) {
    try {
      const ocrResult = await extractTextFromImage(file.buffer);
      extractedText = (ocrResult?.text || "").trim();
      engine = ocrResult?.engine || "OCR Engine";
      confidence = ocrResult?.confidence ?? 90;
    } catch (imgErr) {
      console.error("[FileExtractor] Image OCR error:", imgErr.message);
      throw new Error(`Failed to extract text from image: ${imgErr.message}`);
    }
  } else {
    throw new Error(
      `Unsupported file type '${file.mimetype}'. Supported types: PDF, TXT, PNG, JPG, JPEG.`
    );
  }

  // Sanitize extracted text
  const cleanedText = extractedText.replace(/\s+/g, " ").trim();

  // Validate extracted text presence and sufficient length
  if (!cleanedText || cleanedText.length < MIN_TEXT_LENGTH) {
    throw new Error(
      "No legible or sufficient text content could be extracted from this document/image. Please ensure the file contains verifiable written text."
    );
  }

  return {
    text: cleanedText,
    engine,
    confidence,
  };
}

export default {
  extractFileContent,
};
