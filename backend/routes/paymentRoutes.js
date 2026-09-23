import express from "express";
import {
  createOrder,
  verifyPayment,
  handleWebhook,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Webhook endpoint must NOT require JWT authentication
router.post("/webhook", handleWebhook);

// Protected payment endpoints
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;
