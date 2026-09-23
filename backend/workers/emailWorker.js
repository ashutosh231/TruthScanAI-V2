import http from "http";
import { Worker } from "bullmq";
import dotenv from "dotenv";
import { redis } from "../config/redis.js";
import { EMAIL_QUEUE_NAME } from "../queues/emailQueue.js";
import { sendOtpEmail } from "../services/emailService.js";

dotenv.config();

console.log(`[Worker] Starting TruthScan AI Email Worker on queue: '${EMAIL_QUEUE_NAME}'...`);

// Minimal HTTP health check server strictly for Render Web Service compatibility
let healthServer = null;
const workerPort = process.env.PORT;

if (workerPort) {
  healthServer = http.createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: "TruthScan Email Worker is running",
          queue: EMAIL_QUEUE_NAME,
        })
      );
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  healthServer.listen(workerPort, () => {
    console.log(
      `[Worker] Health server listening on port ${workerPort} for Render Web Service compatibility.`
    );
  });
}

export const emailWorker = new Worker(
  EMAIL_QUEUE_NAME,
  async (job) => {
    console.log(`[Worker] Processing job ${job.id} of type: ${job.name}`);

    if (job.name === "send-otp") {
      const { email, otp } = job.data;
      if (!email || !otp) {
        throw new Error("Job missing required parameters: email and otp.");
      }
      await sendOtpEmail(email, otp);
      return { success: true, email };
    }

    console.warn(`[Worker] Unknown job name received: ${job.name}`);
    return { ignored: true };
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} (${job.name}) completed successfully.`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error: ${err.message}`);
});

emailWorker.on("error", (err) => {
  console.error(`[Worker] Worker error: ${err.message}`);
});

// Graceful shutdown handling
const shutdown = async () => {
  console.log("[Worker] Shutting down worker gracefully...");
  if (healthServer) {
    healthServer.close();
  }
  await emailWorker.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default emailWorker;
