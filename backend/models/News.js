import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "News Wire",
    },
    category: {
      type: String,
      default: "general",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

newsSchema.index({ publishedAt: -1 });

export const News = mongoose.model("News", newsSchema);
export default News;
