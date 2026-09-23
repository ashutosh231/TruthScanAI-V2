import express from "express";
import {
  getNews,
  refreshNews,
  factCheckNewsArticle,
} from "../controllers/newsController.js";
import { verifyAccessToken } from "../utils/tokens.js";
import User from "../models/User.js";

const router = express.Router();

// Optional auth middleware for news fact-checking so logged-in users get their checks saved to history
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = verifyAccessToken(token);
      req.user = await User.findById(decoded.userId).select("-password");
    } catch {
      // Continue unauthenticated if token is invalid or expired
    }
  }
  next();
};

router.get("/", getNews);
router.get("/refresh", refreshNews);
router.post("/fact-check", optionalAuth, factCheckNewsArticle);

export default router;
