import { getLatestNews, refreshNewsCache } from "../services/newsService.js";
import { factCheckWithAI } from "../services/bedrockService.js";
import FactCheck from "../models/FactCheck.js";

/**
 * Get latest news articles (cached via Redis)
 * GET /api/news
 */
export const getNews = async (req, res, next) => {
  try {
    const category = req.query.category || "all";
    const result = await getLatestNews({ category });

    res.status(200).json({
      success: true,
      cached: result.cached,
      count: result.articles.length,
      data: result.articles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Explicitly refresh news cache from NewsAPI.org
 * GET /api/news/refresh
 */
export const refreshNews = async (req, res, next) => {
  try {
    const category = req.query.category || "all";
    const result = await refreshNewsCache(category);

    res.status(200).json({
      success: true,
      message: "News cache successfully refreshed from provider.",
      cached: false,
      count: result.articles.length,
      data: result.articles,
    });
  } catch (error) {
    next(error);
  }
};

import { sanitizePublicReport } from "../utils/responseSanitizer.js";

/**
 * Fact-check a news wire article
 * POST /api/news/fact-check
 */
export const factCheckNewsArticle = async (req, res, next) => {
  try {
    const { title, description, url, articleId } = req.body;

    if (!title && !description) {
      res.status(400);
      throw new Error("Article title or description is required for fact-checking.");
    }

    const claimText = `${title || ""}. ${description || ""}`.trim();

    // Call unified AI fact-checking service
    const aiResult = await factCheckWithAI(claimText);

    // If user is authenticated, associate with user history
    let savedRecord = null;
    const userId = req.user?._id || req.user?.userId;
    if (userId) {
      try {
        savedRecord = await FactCheck.create({
          user: userId,
          input: claimText,
          type: "news",
          verdict: aiResult.verdict,
          confidence: Math.round(aiResult.confidence),
          explanation: aiResult.explanation,
          sources: aiResult.sources || [],
          researchMetadata: aiResult.researchMetadata || {},
          metadata: {
            articleId,
            title,
            url,
            timelineAndContext: aiResult.timelineAndContext || "",
            debunkingEvidence: aiResult.debunkingEvidence || [],
            keySignals: aiResult.keySignals || [],
            tactics: aiResult.tactics || [],
            sourcesChecked: aiResult.sourcesChecked || [],
            advisory: aiResult.advisory || "",
            sources: aiResult.sources || [],
            researchMetadata: aiResult.researchMetadata || {},
          },
        });
      } catch (dbErr) {
        console.warn("[NewsController DB Save Notice]:", dbErr.message);
      }
    }

    const publicData = sanitizePublicReport({
      verdict: aiResult.verdict,
      confidence: Math.round(aiResult.confidence),
      explanation: aiResult.explanation.trim(),
      timelineAndContext: aiResult.timelineAndContext,
      debunkingEvidence: aiResult.debunkingEvidence,
      keySignals: aiResult.keySignals,
      tactics: aiResult.tactics,
      sourcesChecked: aiResult.sourcesChecked,
      advisory: aiResult.advisory,
      claimAnalyzed: claimText,
      sources: aiResult.sources || [],
      researchMetadata: aiResult.researchMetadata || {},
      recordId: savedRecord?._id || null,
    });

    res.status(200).json({
      success: true,
      ...publicData,
      data: publicData,
    });
  } catch (error) {
    next(error);
  }
};
