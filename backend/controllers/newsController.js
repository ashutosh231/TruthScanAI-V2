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
    if (req.user?._id) {
      savedRecord = await FactCheck.create({
        user: req.user._id,
        input: claimText,
        type: "news",
        verdict: aiResult.verdict,
        confidence: aiResult.confidence,
        explanation: aiResult.explanation,
        metadata: {
          articleId,
          title,
          url,
        },
      });
    }

    res.status(200).json({
      success: true,
      id: savedRecord?._id || null,
      verdict: aiResult.verdict,
      confidence: aiResult.confidence,
      explanation: aiResult.explanation,
      claimAnalyzed: claimText,
    });
  } catch (error) {
    next(error);
  }
};
