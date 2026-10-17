/**
 * TruthScan AI — Response Sanitization Layer
 *
 * Enforces confidential implementation shielding:
 * Ensures internal AI model names (AWS Bedrock, DeepSeek), external search
 * APIs (Tavily, NewsAPI.ai), and orchestration engines (LangChain) are never
 * leaked into user-facing API responses or telemetry.
 *
 * Preserves original publisher names, source URLs, titles, and factual quotes intact.
 */

const LEAKED_PROVIDER_PATTERNS = [
  { pattern: /AWS\s*Bedrock\s*(DeepSeek(\s*V3\.2)?)?/gi, replacement: "TruthScan AI Analysis" },
  { pattern: /DeepSeek(\s*V3\.2)?/gi, replacement: "TruthScan AI Neural Core" },
  { pattern: /Amazon\s*Textract(\s*OCR\s*Engine)?/gi, replacement: "Optical Document Reader" },
  { pattern: /Textract/gi, replacement: "Optical Document Reader" },
  { pattern: /Tavily(\s*Search(\s*API)?)?/gi, replacement: "Live Web Research" },
  { pattern: /NewsAPI(\.ai)?/gi, replacement: "News Research" },
  { pattern: /LangChain(\s*Agent)?/gi, replacement: "Investigation Engine" },
];

/**
 * Sanitizes a string from internal provider names without modifying general text.
 *
 * @param {string} text
 * @returns {string}
 */
export function sanitizeText(text) {
  if (!text || typeof text !== "string") return text || "";

  let cleaned = text;
  for (const { pattern, replacement } of LEAKED_PROVIDER_PATTERNS) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned;
}

/**
 * Sanitizes a list of strings (e.g. keySignals, sourcesChecked, debunkingEvidence).
 *
 * @param {Array<string>} list
 * @returns {Array<string>}
 */
export function sanitizeStringList(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => (typeof item === "string" ? sanitizeText(item) : item));
}

/**
 * Sanitizes research metadata for public delivery.
 *
 * @param {Object} meta
 * @returns {Object}
 */
export function sanitizeResearchMetadata(meta) {
  if (!meta || typeof meta !== "object") {
    return {
      searchSucceeded: false,
      resultsCount: 0,
      searchProvider: "Live Web Research",
      hasRelevantEvidence: false,
      searchError: null,
    };
  }

  const searchSucceeded = Boolean(meta.searchSucceeded ?? meta.webSearchSucceeded);
  const resultsCount = Number(meta.resultsCount ?? meta.webResultsCount ?? 0);
  const hasRelevantEvidence = Boolean(meta.hasRelevantEvidence ?? (resultsCount > 0));

  let publicError = null;
  if (meta.searchError) {
    publicError = "Research service temporarily unavailable";
  }

  return {
    searchSucceeded,
    resultsCount,
    hasRelevantEvidence,
    searchProvider: "Live Web Research",
    searchQuery: typeof meta.searchQuery === "string" ? meta.searchQuery : "",
    searchError: publicError,
    // Preserved for legacy components
    webSearchSucceeded: searchSucceeded,
    webResultsCount: resultsCount,
  };
}

/**
 * Sanitizes sources list, ensuring publishers never name an internal search provider.
 *
 * @param {Array<Object>} sources
 * @returns {Array<Object>}
 */
export function sanitizeSources(sources) {
  if (!Array.isArray(sources)) return [];

  return sources.map((src) => {
    if (!src || typeof src !== "object") return src;

    let publisher = src.publisher || "Web Source";
    if (/tavily|newsapi|eventregistry/i.test(publisher)) {
      publisher = "Live Web Source";
    }

    return {
      ...src,
      publisher,
      sourceType: "web",
    };
  });
}

/**
 * Main sanitization pipeline for any user-facing FactCheck report or DB document.
 *
 * @param {Object} report
 * @returns {Object}
 */
export function sanitizePublicReport(report) {
  if (!report || typeof report !== "object") return report;

  const sanitized = { ...report };

  // Sanitize explanation
  if (typeof sanitized.explanation === "string") {
    sanitized.explanation = sanitizeText(sanitized.explanation);
  }

  // Sanitize advisory
  if (typeof sanitized.advisory === "string") {
    sanitized.advisory = sanitizeText(sanitized.advisory);
  }

  // Sanitize timelineAndContext
  if (typeof sanitized.timelineAndContext === "string") {
    sanitized.timelineAndContext = sanitizeText(sanitized.timelineAndContext);
  }

  // Sanitize keySignals
  if (Array.isArray(sanitized.keySignals)) {
    sanitized.keySignals = sanitizeStringList(sanitized.keySignals);
  }

  // Sanitize tactics
  if (Array.isArray(sanitized.tactics)) {
    sanitized.tactics = sanitizeStringList(sanitized.tactics);
  }

  // Sanitize debunkingEvidence
  if (Array.isArray(sanitized.debunkingEvidence)) {
    sanitized.debunkingEvidence = sanitizeStringList(sanitized.debunkingEvidence);
  }

  // Sanitize sourcesChecked
  if (Array.isArray(sanitized.sourcesChecked)) {
    sanitized.sourcesChecked = sanitizeStringList(sanitized.sourcesChecked);
  }

  // Sanitize sources
  if (Array.isArray(sanitized.sources)) {
    sanitized.sources = sanitizeSources(sanitized.sources);
  }

  // Sanitize researchMetadata
  if (sanitized.researchMetadata) {
    sanitized.researchMetadata = sanitizeResearchMetadata(sanitized.researchMetadata);
  }

  // Sanitize source label
  if (typeof sanitized.source === "string") {
    sanitized.source = sanitizeText(sanitized.source);
  }

  // Sanitize nested metadata object if present
  if (sanitized.metadata && typeof sanitized.metadata === "object") {
    const meta = { ...sanitized.metadata };
    if (meta.source) meta.source = sanitizeText(meta.source);
    if (meta.extractionEngine) meta.extractionEngine = sanitizeText(meta.extractionEngine);
    if (Array.isArray(meta.keySignals)) meta.keySignals = sanitizeStringList(meta.keySignals);
    if (Array.isArray(meta.sourcesChecked)) meta.sourcesChecked = sanitizeStringList(meta.sourcesChecked);
    if (meta.researchMetadata) meta.researchMetadata = sanitizeResearchMetadata(meta.researchMetadata);
    sanitized.metadata = meta;
  }

  return sanitized;
}

export default {
  sanitizeText,
  sanitizeStringList,
  sanitizeResearchMetadata,
  sanitizeSources,
  sanitizePublicReport,
};
