import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import redis from "../config/redis.js";
import { generateOtp } from "../utils/generateOtp.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";
import { addEmailJob } from "../queues/emailQueue.js";

const OTP_TTL_SECONDS = 300; // 5 minutes
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const isProduction = process.env.NODE_ENV === "production";

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: REFRESH_TTL_SECONDS * 1000,
});

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.isVerified) {
        res.status(409);
        throw new Error("An account with this email address already exists.");
      }
      // If unverified, update name and password and re-dispatch OTP
      const salt = await bcrypt.genSalt(10);
      existingUser.name = name.trim();
      existingUser.password = await bcrypt.hash(password, salt);
      await existingUser.save();
    } else {
      // Hash password and create user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: false,
      });
    }

    // Generate 6-digit OTP
    const otp = generateOtp();

    // Store in Redis (otp:<email> -> otp, EX 300)
    await redis.set(`otp:${normalizedEmail}`, otp, "EX", OTP_TTL_SECONDS);

    // Queue email job via BullMQ
    try {
      await addEmailJob("send-otp", { email: normalizedEmail, otp });
    } catch (err) {
      console.warn(`[AuthController] BullMQ enqueue warning: ${err.message}`);
    }

    res.status(201).json({
      success: true,
      message: "Registration initiated. Verification OTP has been dispatched to your email.",
      data: {
        email: normalizedEmail,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request or resend an OTP
 * POST /api/auth/send-otp
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email address is required.");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.status(404);
      throw new Error("User with this email was not found.");
    }

    const otp = generateOtp();
    await redis.set(`otp:${normalizedEmail}`, otp, "EX", OTP_TTL_SECONDS);

    try {
      await addEmailJob("send-otp", { email: normalizedEmail, otp });
    } catch (err) {
      console.warn(`[AuthController] BullMQ enqueue warning: ${err.message}`);
    }

    res.status(200).json({
      success: true,
      message: "A fresh verification OTP has been dispatched to your email.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and activate user account
 * POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error("Email and OTP code are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const redisOtp = await redis.get(`otp:${normalizedEmail}`);

    if (!redisOtp || redisOtp !== otp.trim()) {
      res.status(400);
      throw new Error("Invalid or expired OTP code.");
    }

    // Delete verified OTP from Redis
    await redis.del(`otp:${normalizedEmail}`);

    // Mark user as verified
    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { isVerified: true },
      { returnDocument: "after" }
    );

    if (!user) {
      res.status(404);
      throw new Error("User record not found.");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const tokenId = crypto.randomUUID();
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      tokenId,
    });

    // Store refresh token in Redis
    await redis.set(`refresh:${tokenId}`, user._id.toString(), "EX", REFRESH_TTL_SECONDS);

    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: "Account verified and authenticated successfully.",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: user.isPremium,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required.");
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      res.status(401);
      throw new Error("Invalid credentials. Please verify your email and password.");
    }

    if (!user.isVerified) {
      res.status(403);
      throw new Error("Account not verified. Please verify your OTP code first.");
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    const tokenId = crypto.randomUUID();
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      tokenId,
    });

    // Store in Redis (refresh:<tokenId> -> userId)
    await redis.set(`refresh:${tokenId}`, user._id.toString(), "EX", REFRESH_TTL_SECONDS);

    // Set httpOnly cookie
    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPremium: user.isPremium,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using httpOnly cookie
 * POST /api/auth/refresh
 */
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401);
      throw new Error("No refresh token found in request cookies.");
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      res.status(401);
      throw new Error("Invalid or expired refresh token.");
    }

    const { userId, tokenId } = decoded;

    // Check if refresh token exists in Redis
    const storedUserId = await redis.get(`refresh:${tokenId}`);
    if (!storedUserId || storedUserId !== userId) {
      res.status(401);
      throw new Error("Refresh token revoked or expired in cache.");
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(401);
      throw new Error("User account no longer exists.");
    }

    // Issue new access token
    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: "Session token refreshed.",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        if (decoded?.tokenId) {
          await redis.del(`refresh:${decoded.tokenId}`);
        }
      } catch {
        // Ignore token decode failure on logout
      }
    }

    // Clear httpOnly cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Session logged out and refresh token revoked successfully.",
    });
  } catch (error) {
    next(error);
  }
};
