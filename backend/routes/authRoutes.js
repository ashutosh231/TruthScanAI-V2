import express from "express";
import {
  register,
  sendOtp,
  verifyOtp,
  login,
  refresh,
  logout,
} from "../controllers/authController.js";
import {
  registerRateLimiter,
  sendOtpRateLimiter,
  verifyOtpRateLimiter,
  loginRateLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", registerRateLimiter, register);
router.post("/send-otp", sendOtpRateLimiter, sendOtp);
router.post("/verify-otp", verifyOtpRateLimiter, verifyOtp);
router.post("/login", loginRateLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
