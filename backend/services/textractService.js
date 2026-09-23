import { DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { textractClient } from "../config/aws.js";
import Tesseract from "tesseract.js";

/**
 * Extracts text from an image buffer using Amazon Textract DetectDocumentText API.
 * Only blocks with BlockType === 'LINE' are extracted and concatenated.
 * If AWS IAM permissions are pending, seamlessly falls back to real local OCR
 * on the actual image buffer (never static/mock text).
 * 
 * @param {Buffer} buffer - In-memory image buffer (JPEG, PNG)
 * @returns {Promise<{ text: string, confidence: number, engine: string }>}
 */
export const extractTextFromImage = async (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Valid image buffer is required for Textract analysis.");
  }

  // 1. Primary: Amazon Textract Cloud OCR
  try {
    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: buffer,
      },
    });

    const response = await textractClient.send(command);

    const blocks = response.Blocks || [];
    let lineBlocks = blocks.filter(
      (block) => block.BlockType === "LINE" && block.Text && block.Text.trim()
    );

    // If Textract did not group into LINE blocks, try WORD blocks
    if (lineBlocks.length === 0) {
      lineBlocks = blocks.filter(
        (block) => block.BlockType === "WORD" && block.Text && block.Text.trim()
      );
    }

    if (lineBlocks.length === 0) {
      // Secondary pass in case camera snapshot had lighting or perspective distortion
      try {
        const { data } = await Tesseract.recognize(buffer, "eng");
        const rawText = (data?.text || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
        if (rawText && rawText.length >= 3) {
          console.log(`[Secondary OCR Extracted]: "${rawText.substring(0, 100)}"`);
          return {
            text: rawText,
            confidence: Math.round(data?.confidence || 85),
            engine: "Dual-Engine OCR",
          };
        }
      } catch (err) {
        console.warn("[Secondary OCR Notice]:", err.message);
      }

      return {
        text: "",
        confidence: 0,
        engine: "Amazon Textract",
      };
    }

    // Combine blocks into a single cohesive string
    const lines = lineBlocks.map((block) => block.Text.trim());
    const combinedText = lines.join(" ");

    // Calculate mean confidence percentage across extracted lines
    const totalConfidence = lineBlocks.reduce(
      (sum, block) => sum + (typeof block.Confidence === "number" ? block.Confidence : 0),
      0
    );
    const averageConfidence = Math.round(totalConfidence / lineBlocks.length);

    console.log(`[Textract Success] Extracted ${lines.length} blocks with ${averageConfidence}% confidence.`);

    return {
      text: combinedText,
      confidence: averageConfidence,
      engine: "Amazon Textract",
    };
  } catch (error) {
    console.error(`[Textract Service Note]: ${error.name} - ${error.message}`);

    // If AWS IAM user is missing textract:DetectDocumentText permission
    const isPermissionError =
      error.name === "AccessDeniedException" ||
      error.__type === "AccessDeniedException" ||
      error.message?.includes("not authorized to perform: textract:DetectDocumentText") ||
      error.name === "UnrecognizedClientException";

    if (isPermissionError) {
      console.warn(
        `[AWS IAM Action Required]: User 'arn:aws:iam::242736648346:user/Ashutosh' needs 'AmazonTextractFullAccess' in AWS IAM. Performing real optical character recognition on uploaded image buffer...`
      );

      // Perform real OCR on the user's actual image buffer using Tesseract
      try {
        const { data } = await Tesseract.recognize(buffer, "eng");
        const rawText = (data?.text || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
        const ocrConfidence = Math.round(data?.confidence || 90);

        console.log(`[Local OCR Extracted]: "${rawText.substring(0, 100)}..." (Confidence: ${ocrConfidence}%)`);

        return {
          text: rawText,
          confidence: ocrConfidence,
          engine: "OCR Lens (Textract Fallback)",
        };
      } catch (localOcrErr) {
        console.error("[Local OCR Extraction Error]:", localOcrErr);
      }
    }

    throw error;
  }
};

export default {
  extractTextFromImage,
};
