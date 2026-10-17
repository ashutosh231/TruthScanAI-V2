import mongoose from "mongoose";

const factCheckSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    input: {
      type: String,
      required: [true, "Input content is required"],
    },
    type: {
      type: String,
      enum: ["text", "url", "file", "news", "scan"],
      required: [true, "Input type is required"],
    },
    verdict: {
      type: String,
      enum: [
        "TRUE",
        "FALSE",
        "MISLEADING",
        "UNCERTAIN",
        "MIXED",
        "UNVERIFIED",
        "VERIFICATION_UNAVAILABLE",
      ],
      required: [true, "Verdict is required"],
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: [true, "Confidence score is required"],
    },
    explanation: {
      type: String,
      required: [true, "Explanation is required"],
    },
    sources: [
      {
        title: { type: String },
        url: { type: String },
        publisher: { type: String },
        publishedAt: { type: String, default: null },
        retrievedAt: { type: String },
        sourceType: { type: String, default: "web" },
        snippet: { type: String },
        relevance: { type: String },
      },
    ],
    researchMetadata: {
      searchSucceeded: { type: Boolean, default: false },
      resultsCount: { type: Number, default: 0 },
      searchProvider: { type: String, default: "Tavily" },
      searchQuery: { type: String, default: "" },
      searchError: { type: String, default: null },
      webSearchSucceeded: { type: Boolean, default: false },
      newsSearchSucceeded: { type: Boolean, default: false },
      webResultsCount: { type: Number, default: 0 },
      newsResultsCount: { type: Number, default: 0 },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast user history queries sorted by recency
factCheckSchema.index({ user: 1, createdAt: -1 });

export const FactCheck = mongoose.model("FactCheck", factCheckSchema);
export default FactCheck;
