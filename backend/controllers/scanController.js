import { extractTextFromImage } from "../services/textractService.js";
import { factCheckWithAI } from "../services/bedrockService.js";
import { FactCheck } from "../models/FactCheck.js";

const VALID_VERDICTS = ["TRUE", "FALSE", "MISLEADING", "UNCERTAIN"];

/**
 * Scan image via Amazon Textract OCR and evaluate with AWS Bedrock DeepSeek V3.2
 * POST /api/scan
 */
export const scanNews = async (req, res, next) => {
  try {
    // 1. Verify image is uploaded
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "No image provided.",
      });
    }

    // 2. Validate MIME type
    const validMimes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only JPG and PNG images are supported.",
      });
    }

    // 3. Validate file size (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (req.file.size > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        message: "Image size must be less than 5MB.",
      });
    }

    // 4. Trial limit enforcement: 2 free trials for free tier users
    const userId = req.user.userId || req.user._id;
    if (!req.user.isPremium) {
      const trialsCount = await FactCheck.countDocuments({ user: userId });
      if (trialsCount >= 2) {
        return res.status(402).json({
          success: false,
          message:
            "Trial limit reached: Free clearance is limited to 2 fact checks. Please upgrade to Premium Investigator (₹200/month) to continue scanning.",
          requiresUpgrade: true,
          trialLimit: 2,
          trialsUsed: trialsCount,
        });
      }
    }

    // 5. Amazon Textract OCR Extraction
    let ocrResult;
    try {
      ocrResult = await extractTextFromImage(req.file.buffer);
    } catch (textractErr) {
      console.error("[Textract Error]:", textractErr);
      return res.status(500).json({
        success: false,
        message: "Unable to extract text from the image.",
      });
    }

    const { text: extractedText, confidence: ocrConfidence } = ocrResult || {};

    // 6. Handle no readable text detected
    if (!extractedText || !extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "No readable text was detected.",
      });
    }

    // 7. AWS Bedrock DeepSeek V3.2 Fact-Checking
    let aiResult;
    try {
      aiResult = await factCheckWithAI(extractedText.trim());
    } catch (bedrockErr) {
      console.error("[Bedrock Error]:", bedrockErr);
      return res.status(500).json({
        success: false,
        message: "Unable to analyze the extracted text.",
      });
    }

    // 8. Validate AI Model Response
    if (
      !aiResult ||
      !VALID_VERDICTS.includes(aiResult.verdict) ||
      typeof aiResult.confidence !== "number" ||
      aiResult.confidence < 0 ||
      aiResult.confidence > 100 ||
      typeof aiResult.explanation !== "string" ||
      !aiResult.explanation.trim()
    ) {
      console.error("[Validation Error] Malformed DeepSeek output:", aiResult);
      return res.status(500).json({
        success: false,
        message: "Unable to analyze the extracted text.",
      });
    }

    // 9. Persist FactCheck Record to MongoDB
    const factCheckRecord = await FactCheck.create({
      user: userId,
      input: extractedText.trim(),
      type: "scan",
      verdict: aiResult.verdict,
      confidence: Math.round(aiResult.confidence),
      explanation: aiResult.explanation.trim(),
      metadata: {
        ocrConfidence: ocrConfidence || 95,
        timelineAndContext: aiResult.timelineAndContext || "",
        debunkingEvidence: aiResult.debunkingEvidence || [],
        keySignals: aiResult.keySignals || [],
        tactics: aiResult.tactics || [],
        sourcesChecked: aiResult.sourcesChecked || [],
        advisory: aiResult.advisory || "",
        source: "Camera Optical Scan (Amazon Textract)",
      },
    });

    // 10. Return Structured Response
    return res.status(200).json({
      success: true,
      data: {
        extractedText: extractedText.trim(),
        ocrConfidence: ocrConfidence || 95,
        verdict: aiResult.verdict,
        confidence: Math.round(aiResult.confidence),
        explanation: aiResult.explanation.trim(),
        timelineAndContext: aiResult.timelineAndContext,
        debunkingEvidence: aiResult.debunkingEvidence,
        keySignals: aiResult.keySignals,
        tactics: aiResult.tactics,
        sourcesChecked: aiResult.sourcesChecked,
        advisory: aiResult.advisory,
        recordId: factCheckRecord._id,
      },
    });
  } catch (error) {
    console.error("[ScanController Critical Error]:", error);
    next(error);
  }
};

export default {
  scanNews,
};
