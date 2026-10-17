import { executeFactCheckAgent } from "./factCheckAgentService.js";

/**
 * Unified AI fact-checking service.
 * LangChain-powered research agent.
 * Retrieves live evidence via Tavily Search API, analyzes claims via AWS Bedrock DeepSeek V3.2,
 * and produces a structured, Zod-validated verification dossier.
 *
 * @param {string} text - Claim or extracted document content to verify
 * @param {Object} [options] - Optional runtime overrides for model/tools
 * @returns {Promise<import("./factCheckAgentService.js").FactCheckReportSchema>}
 */
export const factCheckWithAI = async (text, options = {}) => {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("Text content is required for fact-check analysis.");
  }

  // Delegate execution to the LangChain live-research agent
  return await executeFactCheckAgent(text.trim(), options);
};

export { executeFactCheckAgent };
export default {
  factCheckWithAI,
  executeFactCheckAgent,
};
