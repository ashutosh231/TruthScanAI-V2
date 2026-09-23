import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB database
await connectDB();

// Start Express HTTP Server
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`⚡ TruthScan AI Backend Server Online`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
});

// Handle unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`[Process] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`[Process] Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("[Process] Received termination signal. Closing HTTP server...");
  server.close(() => {
    console.log("[Process] HTTP server closed cleanly.");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
