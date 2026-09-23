import redis from "../config/redis.js";

const NEWS_CACHE_TTL = 300; // 5 minutes in seconds

// Curated fallback wire articles if external provider is rate-limited or offline
const FALLBACK_NEWS = [
  {
    id: "fb-news-1",
    title: "NASA James Webb Space Telescope Detects Atmospheric Water Vapor on Habitable-Zone Exoplanet",
    description: "Astronomers confirm atmospheric signatures consistent with water vapor and possible methane on a sub-Neptune exoplanet 120 light years away.",
    url: "https://www.nasa.gov",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    source: "NASA Science Wire",
    publishedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    category: "Science",
  },
  {
    id: "fb-news-2",
    title: "Viral Audio Deepfake Fabricates Emergency Bank Shutdown Leading to Global Financial Panic",
    description: "Financial authorities investigate synthetic voice cloning impersonating central bankers that triggered automated bank runs.",
    url: "https://www.reuters.com",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
    source: "Global Financial Monitor",
    publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    category: "Technology",
  },
  {
    id: "fb-news-3",
    title: "International Regulatory Body Proposes Cryptographic Provenance Standards for Synthetic Media",
    description: "Draft standards aim to mandate machine-readable cryptographic signatures on commercial AI foundation models.",
    url: "https://www.apnews.com",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop",
    source: "Policy Review",
    publishedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    category: "Politics",
  },
  {
    id: "fb-news-4",
    title: "Phase 3 Trials Confirm 91% Protective Efficacy in Next-Gen Universal mRNA Vaccine Candidate",
    description: "Peer-reviewed multicenter clinical trials confirm broad neutralization against mutating respiratory pathogens.",
    url: "https://www.who.int",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop",
    source: "Health Dispatch",
    publishedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    category: "Health",
  },
  {
    id: "fb-news-5",
    title: "Unverified Claims Circulate Alleging Arctic Sea Ice Extent Reached Record Seasonal Highs",
    description: "Satellite telemetry from NSIDC clarifies that polar sea ice extent remains near historic record lows despite viral claims.",
    url: "https://nsidc.org",
    image: "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=800&auto=format&fit=crop",
    source: "Climate Watch",
    publishedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    category: "Climate",
  },
  {
    id: "fb-news-6",
    title: "Quantum Benchmark Paper Withdrawn Following Cryptographic Peer Review",
    description: "Researchers retract claims of factoring RSA-4096 after fault-tolerant simulation was shown to contain logical shortcuts.",
    url: "https://www.nature.com",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    source: "Cyber Intel",
    publishedAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    category: "Technology",
  },
];

/**
 * Fetches raw articles from NewsAPI.org and normalizes them.
 */
const fetchAndNormalizeFromProvider = async (category = "all") => {
  const apiKey = (process.env.NEWSAPI_AI_KEY || "").split("#")[0].trim();

  if (!apiKey) {
    console.warn("[NewsService] NewsAPI key is missing, returning curated news wire.");
    return FALLBACK_NEWS;
  }

  try {
    let url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=12&apiKey=${apiKey}`;

    // Map categories if specified
    const catLower = category.toLowerCase();
    if (catLower && catLower !== "all") {
      const validCategories = ["business", "entertainment", "general", "health", "science", "sports", "technology"];
      const targetCategory = validCategories.includes(catLower) ? catLower : "general";
      url = `https://newsapi.org/v2/top-headlines?language=en&category=${targetCategory}&pageSize=12&apiKey=${apiKey}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "TruthScanAI/1.0",
      },
    });

    if (!response.ok) {
      console.warn(`[NewsService] NewsAPI.org returned HTTP ${response.status}. Using fallback news wire.`);
      return FALLBACK_NEWS;
    }

    const data = await response.json();
    const articles = data.articles || [];

    if (!articles.length) {
      return FALLBACK_NEWS;
    }

    return articles
      .filter((item) => item.title && !item.title.includes("[Removed]"))
      .map((item, index) => ({
        id: item.url || `news-${index}-${Date.now()}`,
        title: item.title,
        description:
          item.description ||
          item.content?.split("[+")[0] ||
          "News dispatch reported via global wire service.",
        url: item.url || "https://news.google.com",
        image:
          item.urlToImage ||
          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop",
        source: item.source?.name || "Global News Wire",
        publishedAt: item.publishedAt || new Date().toISOString(),
        category: category !== "all" ? category : "General",
      }));
  } catch (error) {
    console.warn(`[NewsService] Error contacting NewsAPI.org: ${error.message}. Using fallback wire.`);
    return FALLBACK_NEWS;
  }
};

/**
 * Retrieves latest news with Redis caching (5 min TTL).
 */
export const getLatestNews = async ({ category = "all", forceRefresh = false } = {}) => {
  const cacheKey = `news:${category.toLowerCase()}`;

  // Check Redis cache first if not forced refresh
  if (!forceRefresh) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return {
          cached: true,
          articles: JSON.parse(cached),
        };
      }
    } catch (err) {
      console.warn(`[NewsService] Redis cache read warning: ${err.message}`);
    }
  }

  // Fetch fresh articles from provider
  const normalizedArticles = await fetchAndNormalizeFromProvider(category);

  // Store in Redis with TTL
  try {
    await redis.set(cacheKey, JSON.stringify(normalizedArticles), "EX", NEWS_CACHE_TTL);
  } catch (err) {
    console.warn(`[NewsService] Redis cache write warning: ${err.message}`);
  }

  return {
    cached: false,
    articles: normalizedArticles,
  };
};

/**
 * Explicitly refresh news cache in Redis.
 */
export const refreshNewsCache = async (category = "all") => {
  return await getLatestNews({ category, forceRefresh: true });
};

export default { getLatestNews, refreshNewsCache };
