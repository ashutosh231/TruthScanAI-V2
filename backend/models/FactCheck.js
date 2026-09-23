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
      enum: ["TRUE", "FALSE", "MISLEADING", "UNCERTAIN"],
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
