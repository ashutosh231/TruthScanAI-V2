import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { tavily } from "@tavily/core";

const MAX_SNIPPET_LENGTH = 600;
const DEFAULT_MAX_RESULTS = 5;
const DEFAULT_TIMEOUT_MS = 10000;

// Commercial and affiliate spam patterns that pollute factual verification queries
const COMMERCIAL_SPAM_PATTERNS = [
  /\bcoffee\s*(maker|machine)?s?\b/i,
  /\bespresso\s*(machine)?s?\b/i,
  /\bair\s*fryers?\b/i,
  /\btoaster\s*ovens?\b/i,
  /\bkitchen\s*appliances?\b/i,
  /\bmattress\s*(review|deals)?s?\b/i,
  /\bcoupon\s*codes?\b/i,
  /\bpromo\s*codes?\b/i,
  /\bdiscount\s*codes?\b/i,
  /\baffiliate\b/i,
  /\bweight\s*loss\s*gummies\b/i,
  /\bketo\s*gummies\b/i,
  /\bdiet\s*pills\b/i,
  /\bcasino\s*(bonus|slots|games)?\b/i,
  /\bfree\s*spins\b/i,
  /\bslot\s*machines?\b/i,
  /\bbest\s+deals?\s+on\b/i,
];

const STOP_WORDS = new Set([
  "is", "are", "was", "were", "am", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "the", "a", "an", "and", "or", "but", "in", "on", "at",
  "to", "for", "of", "with", "by", "from", "up", "about",
  "into", "over", "after", "today", "yesterday", "now", "tomorrow",
  "this", "that", "these", "those", "what", "which", "who", "whom",
  "whose", "why", "how", "where", "when", "there", "their", "they",
  "not", "can", "could", "will", "would", "shall", "should",
]);

/**
 * Extracts publisher/domain from URL
 */
export function extractPublisher(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (/tavily|newsapi|eventregistry/i.test(host)) {
      return "Web Source";
    }
    return host;
  } catch {
    return "Web Source";
  }
}

/**
 * Extracts core semantic entities and keywords from a claim string.
 *
 * @param {string} claim
 * @returns {Array<string>}
 */
export function extractClaimEntities(claim) {
  if (!claim || typeof claim !== "string") return [];
  const words = claim
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return Array.from(new Set(words));
}

/**
 * Evaluates whether a retrieved search snippet/page actually relates to the submitted claim.
 * Distinguishes genuine corroborating/debunking sources from irrelevant commercial or affiliate pages.
 *
 * @param {string} claim
 * @param {Object} item
 * @returns {{ isRelevant: boolean, score: number, reason: string }}
 */
export function assessEvidenceRelevance(claim, item) {
  if (!item || typeof item !== "object") {
    return { isRelevant: false, score: 0, reason: "Empty or invalid result item" };
  }

  const title = (item.title || "").toLowerCase();
  const snippet = (item.snippet || item.content || "").toLowerCase();
  const combined = `${title} ${snippet}`;

  // 1. Reject commercial and affiliate spam if claim is not about consumer products
  const claimLower = (claim || "").toLowerCase();
  const isClaimShopping = /coffee|appliance|product|buy|coupon|deal|fryer|mattress/i.test(claimLower);
  if (!isClaimShopping) {
    for (const pattern of COMMERCIAL_SPAM_PATTERNS) {
      if (pattern.test(title) || pattern.test(snippet)) {
        return {
          isRelevant: false,
          score: 0,
          reason: "Unrelated commercial or affiliate product page rejected",
        };
      }
    }
  }

  // 2. Extract core claim entities
  const claimTerms = extractClaimEntities(claim);
  if (claimTerms.length === 0) {
    return { isRelevant: true, score: 1, reason: "No specific entities extracted; default accepted" };
  }

  // 3. Count entity matches in retrieved title and snippet
  let matchedCount = 0;
  for (const term of claimTerms) {
    if (combined.includes(term)) {
      matchedCount++;
    }
  }

  const matchRatio = matchedCount / claimTerms.length;

  // If claim is about death / public figures ("died", "death", "kill", "hospital")
  const isDeathClaim = /died|death|passed\s+away|killed|hospital|alive|fatal/i.test(claimLower);
  if (isDeathClaim) {
    // Subject terms are terms other than the death action words
    const subjectTerms = claimTerms.filter(
      (t) => !["died", "death", "kill", "killed", "hospital", "alive", "today"].includes(t)
    );
    if (subjectTerms.length > 0) {
      const hasSubject = subjectTerms.some((t) => combined.includes(t));
      if (!hasSubject) {
        return {
          isRelevant: false,
          score: 0,
          reason: "Missing primary subject entity for sensitive claim",
        };
      }
    }
  }

  // If claim has 2+ entities and matched 0, it is irrelevant
  if (claimTerms.length >= 2 && matchedCount === 0) {
    return {
      isRelevant: false,
      score: 0,
      reason: "Zero matching entities between claim and retrieved content",
    };
  }

  // Accepted if at least 1 term matches and (title matches or match ratio >= 0.25)
  if (matchedCount > 0 && (matchRatio >= 0.25 || title.includes(claimTerms[0]))) {
    return {
      isRelevant: true,
      score: matchRatio,
      reason: "Entity and semantic overlap verified",
    };
  }

  return {
    isRelevant: false,
    score: matchRatio,
    reason: `Insufficient semantic relevance to claim (score: ${matchRatio.toFixed(2)})`,
  };
}

/**
 * Generates an effective, focused initial search query from a user claim.
 *
 * @param {string} claim
 * @returns {string}
 */
export function generateSearchQuery(claim) {
  if (!claim || typeof claim !== "string") return "";

  let cleaned = claim
    .replace(/ignore\s+(all\s+)?(previous\s+)?instructions/gi, "")
    .replace(/system\s*:\s*/gi, "")
    .replace(/assistant\s*:\s*/gi, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/["“”'‘’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // If query is very long (e.g. pasted article excerpt), extract the first 1-2 core sentences
  if (cleaned.length > 180) {
    const sentences = cleaned.split(/(?<=[.?!])\s+/);
    if (sentences.length > 0 && sentences[0].length >= 20) {
      cleaned = sentences.slice(0, 2).join(" ");
    }
  }

  if (cleaned.length > 250) {
    cleaned = cleaned.substring(0, 250).trim();
  }

  return cleaned;
}

/**
 * Generates a refined, targeted search query for a bounded retry
 * when initial search results yield zero relevant evidence.
 *
 * @param {string} claim
 * @returns {{ query: string, topic: "news" | "general" }}
 */
export function generateRefinedSearchQuery(claim) {
  const terms = extractClaimEntities(claim);
  const claimLower = (claim || "").toLowerCase();

  // For breaking news, deaths, or public figure rumors:
  if (/died|death|killed|hospital|passed\s+away|arrested|resigned/i.test(claimLower)) {
    const subjects = terms.filter((t) => !["died", "death", "killed", "hospital", "today"].includes(t));
    const subjectStr = subjects.join(" ");
    return {
      query: `"${subjectStr}" news official statement updates`,
      topic: "news",
    };
  }

  return {
    query: `${terms.slice(0, 5).join(" ")} fact check news report`,
    topic: "news",
  };
}

/**
 * Executes direct web search via Tavily Search API.
 * Automatically validates evidence relevance and executes at most 1 bounded retry
 * with a refined query if initial results are irrelevant.
 *
 * @param {string} rawQuery - The claim or query string to search
 * @param {Object} [options]
 * @param {string} [options.apiKey] - Explicit API key override
 * @param {number} [options.maxResults] - Max search results (default 5)
 * @param {number} [options.timeoutMs] - Request timeout in ms (default 10000)
 * @param {string} [options.searchDepth] - "basic" or "advanced"
 * @param {string} [options.topic] - "general" or "news"
 * @returns {Promise<{
 *   success: boolean,
 *   count: number,
 *   rawCount: number,
 *   query: string,
 *   results: Array<Object>,
 *   rawResults: Array<Object>,
 *   hasRelevantEvidence: boolean,
 *   error?: string,
 *   errorCode?: string
 * }>}
 */
export async function searchTavily(rawQuery, options = {}) {
  const query = generateSearchQuery(rawQuery);
  const apiKey = (options.apiKey || process.env.TAVILY_API_KEY || "").split("#")[0].trim();

  if (!apiKey) {
    return {
      success: false,
      count: 0,
      rawCount: 0,
      query,
      results: [],
      rawResults: [],
      hasRelevantEvidence: false,
      error: "TAVILY_API_KEY is not configured.",
      errorCode: "MISSING_API_KEY",
    };
  }

  if (!query) {
    return {
      success: false,
      count: 0,
      rawCount: 0,
      query: "",
      results: [],
      rawResults: [],
      hasRelevantEvidence: false,
      error: "Search query must be a non-empty string.",
      errorCode: "EMPTY_QUERY",
    };
  }

  const maxResults = options.maxResults || DEFAULT_MAX_RESULTS;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const searchDepth = options.searchDepth === "advanced" ? "advanced" : "basic";

  // Automatically select "news" topic for breaking news / death / public figure claims
  const isNewsEvent = /died|death|killed|hospital|passed\s+away|arrested|resigned|today|breaking/i.test(rawQuery);
  const topic = options.topic || (isNewsEvent ? "news" : "general");

  const executeApiSearch = async (targetQuery, targetTopic) => {
    const client = tavily({ apiKey });

    const searchPromise = client.search(targetQuery, {
      searchDepth,
      topic: targetTopic,
      maxResults,
      includeAnswer: false,
      includeRawContent: false,
    });

    const timeoutPromise = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Live web research timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      if (typeof timer.unref === "function") timer.unref();
    });

    const response = await Promise.race([searchPromise, timeoutPromise]);
    return Array.isArray(response?.results) ? response.results : [];
  };

  try {
    // 1. Initial Search Execution
    let rawResults = await executeApiSearch(query, topic);

    // Normalize raw results
    const normalize = (items) =>
      items.map((item, idx) => {
        const title = (item.title || "Untitled Web Resource").trim();
        const url = item.url;
        const publisher = extractPublisher(url);
        const publishedAt = item.publishedDate || null;
        const snippet = (item.content || "")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, MAX_SNIPPET_LENGTH);

        return {
          id: `source-${idx + 1}`,
          title,
          url,
          publisher,
          publishedAt,
          retrievedAt: new Date().toISOString(),
          sourceType: "web",
          snippet,
          score: typeof item.score === "number" ? item.score : null,
          relevance: `Live web evidence search for: "${query.substring(0, 100)}"`,
        };
      });

    let allRawItems = normalize(rawResults);

    // 2. Relevance Filtering: Reject clearly unrelated commercial/affiliate pages
    let relevantItems = allRawItems.filter((item) => {
      const { isRelevant } = assessEvidenceRelevance(rawQuery, item);
      return isRelevant;
    });

    // 3. Bounded Retry: If 0 results were relevant, retry ONCE with refined search query
    if (relevantItems.length === 0 && allRawItems.length > 0) {
      const refined = generateRefinedSearchQuery(rawQuery);
      try {
        const retryRaw = await executeApiSearch(refined.query, refined.topic);
        const retryNormalized = normalize(retryRaw);
        allRawItems = [...allRawItems, ...retryNormalized];

        const retryRelevant = retryNormalized.filter((item) => {
          const { isRelevant } = assessEvidenceRelevance(rawQuery, item);
          return isRelevant;
        });

        if (retryRelevant.length > 0) {
          relevantItems = retryRelevant;
        }
      } catch (retryErr) {
        console.warn(`[TavilySearch] Refined query search attempt note: ${retryErr.message}`);
      }
    }

    return {
      success: true,
      count: relevantItems.length,
      rawCount: allRawItems.length,
      query,
      results: relevantItems,
      rawResults: allRawItems,
      hasRelevantEvidence: relevantItems.length > 0,
    };
  } catch (err) {
    const errMsg = err?.message || String(err);
    let errorCode = "PROVIDER_ERROR";

    if (/timed? out/i.test(errMsg)) {
      errorCode = "SEARCH_TIMEOUT";
    } else if (/401|unauthorized|invalid api key/i.test(errMsg)) {
      errorCode = "INVALID_API_KEY";
    } else if (/429|rate limit|too many requests/i.test(errMsg)) {
      errorCode = "RATE_LIMIT_EXCEEDED";
    }

    console.error(`[TavilySearch] Web search error (${errorCode}): ${errMsg}`);

    return {
      success: false,
      count: 0,
      rawCount: 0,
      query,
      results: [],
      rawResults: [],
      hasRelevantEvidence: false,
      error: `Live web research service unavailable: ${errMsg}`,
      errorCode,
    };
  }
}

/**
 * Creates the search_web LangChain tool with integrated relevance checking.
 *
 * @param {Object} options
 * @param {string} [options.apiKey] - Explicit Tavily API key override
 * @param {Object} [options.collector] - Collector to register executed sources & status
 * @returns {import("@langchain/core/tools").StructuredTool}
 */
export function createTavilySearchTool(options = {}) {
  const collector = options.collector;

  return tool(
    async ({ query, topic = "general", searchDepth = "basic" }) => {
      const result = await searchTavily(query, {
        apiKey: options.apiKey,
        topic,
        searchDepth,
      });

      if (collector) {
        collector.searchQuery = result.query;
        if (result.success) {
          collector.webSearchSucceeded = true;
          collector.searchSucceeded = true;
          collector.hasRelevantEvidence = result.hasRelevantEvidence;
          collector.resultsCount = result.count;
          collector.webResultsCount = result.count;
          collector.searchError = null;
          collector.addSources(result.results);
          collector.rawResults = result.rawResults;
        } else {
          collector.webSearchSucceeded = false;
          collector.searchSucceeded = false;
          collector.hasRelevantEvidence = false;
          collector.searchError = result.error || "Research service unavailable";
        }
      }

      return JSON.stringify(result);
    },
    {
      name: "search_web",
      description:
        "Search the live web for authoritative, primary, and institutional evidence regarding a claim. Retrieves source URLs, titles, publication dates, and empirical content snippets.",
      schema: z.object({
        query: z
          .string()
          .describe("The specific, focused search query to verify the claim or find primary sources"),
        topic: z
          .enum(["general", "news"])
          .optional()
          .default("general")
          .describe("Search category topic"),
        searchDepth: z
          .enum(["basic", "advanced"])
          .optional()
          .default("basic")
          .describe("Search depth level"),
      }),
    }
  );
}

export default createTavilySearchTool;
