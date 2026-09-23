import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import factCheckRoutes from "./routes/factCheckRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import scanRoutes from "./routes/scanRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Allowed frontend origins for CORS with credentials
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = clientUrl.split(",").map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check configured origins, any vercel.app deployment, or local dev
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("vercel.app") ||
        (process.env.NODE_ENV !== "production" && origin.startsWith("http://localhost"));

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin '${origin}' not allowed by CORS.`));
      }
    },
    credentials: true, // Required for httpOnly cookies (refresh tokens)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature"],
  })
);

// Body parser with raw body retention for Razorpay webhooks
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Production Health Check Endpoints
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TruthScan API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TruthScan API is running",
  });
});

// Primary API Routes (standard /api prefix)
app.use("/api/auth", authRoutes);
app.use("/api/fact-check", factCheckRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/scan", scanRoutes);

// Fallback Route Mounts (if NEXT_PUBLIC_API_URL was configured without /api)
app.use("/auth", authRoutes);
app.use("/fact-check", factCheckRoutes);
app.use("/news", newsRoutes);
app.use("/payments", paymentRoutes);
app.use("/users", userRoutes);
app.use("/scan", scanRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
