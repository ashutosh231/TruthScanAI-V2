import express from "express";
import {
  createFactCheck,
  checkFile,
  getFactCheckHistory,
  getFactCheckById,
} from "../controllers/factCheckController.js";
import { protect } from "../middleware/auth.js";
import { factCheckRateLimiter } from "../middleware/rateLimiter.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// All fact-check endpoints require authentication
router.use(protect);

router.post("/", factCheckRateLimiter, createFactCheck);
router.post("/file", factCheckRateLimiter, upload.single("file"), checkFile);
router.get("/history", getFactCheckHistory);
router.get("/:id", getFactCheckById);

export default router;
