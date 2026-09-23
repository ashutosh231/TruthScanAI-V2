import express from "express";
import { scanNews } from "../controllers/scanController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/**
 * @route   POST /api/scan
 * @desc    Upload image, extract text via Amazon Textract, and fact check via AWS Bedrock DeepSeek V3.2
 * @access  Private (JWT Protected)
 */
router.post("/", protect, upload.single("image"), scanNews);

export default router;
