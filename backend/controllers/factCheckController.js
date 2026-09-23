import FactCheck from "../models/FactCheck.js";
import { factCheckWithAI } from "../services/bedrockService.js";

const VALID_INPUT_TYPES = ["text", "url", "file", "news", "scan"];

/**
 * Perform AI fact-checking on submitted content
 * POST /api/fact-check
 */
export const createFactCheck = async (req, res, next) => {
  try {
    const { text, type = "text", metadata = {} } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400);
      throw new Error("Text content is required for fact-check verification.");
    }

    const normalizedType = type.toLowerCase();
    if (!VALID_INPUT_TYPES.includes(normalizedType)) {
      res.status(400);
      throw new Error(
        `Invalid input type '${type}'. Allowed types are: ${VALID_INPUT_TYPES.join(", ")}`
      );
    }

    // Strict 2 Free Trials Check for Non-Premium Users
    if (!req.user.isPremium) {
      const priorChecksCount = await FactCheck.countDocuments({ user: req.user._id });
      if (priorChecksCount >= 2) {
        return res.status(402).json({
          success: false,
          message:
            "Trial limit reached: Free clearance is limited to 2 fact checks. Please upgrade to Premium Investigator (₹200/month) to continue scanning.",
          requiresUpgrade: true,
          trialLimit: 2,
          trialsUsed: priorChecksCount,
        });
      }
    }

    // Call unified AI fact-checking service
    const aiResult = await factCheckWithAI(text.trim());

    const detailedMetadata = {
      ...metadata,
      timelineAndContext: aiResult.timelineAndContext,
      debunkingEvidence: aiResult.debunkingEvidence,
      keySignals: aiResult.keySignals,
      tactics: aiResult.tactics,
      sourcesChecked: aiResult.sourcesChecked,
      advisory: aiResult.advisory,
    };

    // Save record to MongoDB
    const factCheck = await FactCheck.create({
      user: req.user._id,
      input: text.trim(),
      type: normalizedType,
      verdict: aiResult.verdict,
      confidence: aiResult.confidence,
      explanation: aiResult.explanation,
      metadata: detailedMetadata,
    });

    const totalUsage = await FactCheck.countDocuments({ user: req.user._id });

    res.status(201).json({
      success: true,
      result: {
        id: factCheck._id,
        input: factCheck.input,
        type: factCheck.type,
        verdict: factCheck.verdict,
        confidence: factCheck.confidence,
        explanation: factCheck.explanation,
        timelineAndContext: aiResult.timelineAndContext,
        debunkingEvidence: aiResult.debunkingEvidence,
        keySignals: aiResult.keySignals,
        tactics: aiResult.tactics,
        sourcesChecked: aiResult.sourcesChecked,
        advisory: aiResult.advisory,
        trialsUsed: totalUsage,
        trialsRemaining: req.user.isPremium ? null : Math.max(0, 2 - totalUsage),
        isPremium: req.user.isPremium,
        createdAt: factCheck.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Perform fact-checking on an uploaded file (PDF, TXT, or Image)
 * POST /api/fact-check/file
 */
export const checkFile = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded. Please upload a PDF, TXT, PNG, or JPG file.");
    }

    // Strict 2 Free Trials Check for Non-Premium Users
    if (!req.user.isPremium) {
      const priorChecksCount = await FactCheck.countDocuments({ user: req.user._id });
      if (priorChecksCount >= 2) {
        return res.status(402).json({
          success: false,
          message:
            "Trial limit reached: Free clearance is limited to 2 fact checks. Please upgrade to Premium Investigator (₹200/month) to continue scanning.",
          requiresUpgrade: true,
          trialLimit: 2,
          trialsUsed: priorChecksCount,
        });
      }
    }

    let extractedText = "";

    // If text file, read buffer directly
    if (req.file.mimetype === "text/plain") {
      extractedText = req.file.buffer.toString("utf-8");
    } else {
      // For images and PDFs in this initial backend, extract filename and descriptive context
      extractedText = `Document Evidence File: ${req.file.originalname} (Size: ${(req.file.size / 1024).toFixed(1)} KB, Type: ${req.file.mimetype})`;
    }

    const aiResult = await factCheckWithAI(extractedText);

    const detailedMetadata = {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      timelineAndContext: aiResult.timelineAndContext,
      debunkingEvidence: aiResult.debunkingEvidence,
      keySignals: aiResult.keySignals,
      tactics: aiResult.tactics,
      sourcesChecked: aiResult.sourcesChecked,
      advisory: aiResult.advisory,
    };

    const factCheck = await FactCheck.create({
      user: req.user._id,
      input: extractedText,
      type: "file",
      verdict: aiResult.verdict,
      confidence: aiResult.confidence,
      explanation: aiResult.explanation,
      metadata: detailedMetadata,
    });

    const totalUsage = await FactCheck.countDocuments({ user: req.user._id });

    res.status(201).json({
      success: true,
      result: {
        id: factCheck._id,
        input: factCheck.input,
        type: factCheck.type,
        verdict: factCheck.verdict,
        confidence: factCheck.confidence,
        explanation: factCheck.explanation,
        timelineAndContext: aiResult.timelineAndContext,
        debunkingEvidence: aiResult.debunkingEvidence,
        keySignals: aiResult.keySignals,
        tactics: aiResult.tactics,
        sourcesChecked: aiResult.sourcesChecked,
        advisory: aiResult.advisory,
        trialsUsed: totalUsage,
        trialsRemaining: req.user.isPremium ? null : Math.max(0, 2 - totalUsage),
        isPremium: req.user.isPremium,
        createdAt: factCheck.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user's fact check history
 * GET /api/fact-check/history?page=1&limit=10
 */
export const getFactCheckHistory = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = { user: req.user._id };

    const [items, total] = await Promise.all([
      FactCheck.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FactCheck.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single fact check result by ID
 * GET /api/fact-check/:id
 */
export const getFactCheckById = async (req, res, next) => {
  try {
    const factCheck = await FactCheck.findById(req.params.id);

    // Return 404 if record doesn't exist OR belongs to another user
    if (!factCheck || factCheck.user.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error("Fact check record not found.");
    }

    res.status(200).json({
      success: true,
      data: factCheck,
    });
  } catch (error) {
    next(error);
  }
};
