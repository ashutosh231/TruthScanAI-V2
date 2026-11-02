/**
 * E2E test: BullMQ worker → Resend email
 * Run: node tests/e2e-email.test.js
 */
import dotenv from "dotenv";
dotenv.config();

import { Worker, Queue } from "bullmq";
import { redis } from "../config/redis.js";
import { sendOtpEmail } from "../services/emailService.js";

const QUEUE_NAME = "email-queue";
const TEST_EMAIL = "adiashuto30@gmail.com";
const TEST_OTP = "938271";

console.log("═══════════════════════════════════════════════════");
console.log("  TruthScan AI — Resend E2E Email Worker Test");
console.log("═══════════════════════════════════════════════════\n");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ set" : "❌ MISSING");
console.log("FROM_EMAIL    :", process.env.FROM_EMAIL);
console.log("FROM_NAME     :", process.env.FROM_NAME);
console.log("");

// 1. Start worker
console.log("[1/4] Starting email worker...");
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    console.log(`      ↳ Worker picked up job [id=${job.id}] name="${job.name}"`);
    if (job.name === "send-otp") {
      const { email, otp } = job.data;
      if (!email || !otp) throw new Error("Job missing email or otp");
      await sendOtpEmail(email, otp);
      return { success: true, email };
    }
    throw new Error(`Unknown job: ${job.name}`);
  },
  { connection: redis, concurrency: 5 }
);

// 2. Drain stale jobs
console.log("[2/4] Draining stale jobs...");
const queue = new Queue(QUEUE_NAME, { connection: redis });
await queue.drain();
console.log("      ↳ Queue drained.\n");

// 3. Enqueue job (mirrors authController register flow)
console.log(`[3/4] Enqueueing "send-otp" → ${TEST_EMAIL}`);
const job = await queue.add("send-otp", { email: TEST_EMAIL, otp: TEST_OTP });
console.log(`      ↳ Job enqueued [id=${job.id}]\n`);

// 4. Wait for completion or failure
console.log("[4/4] Waiting for worker to process job...");
const result = await new Promise((resolve, reject) => {
  const tid = setTimeout(
    () => reject(new Error("TIMEOUT: Worker did not process job within 20s")),
    20000
  );

  worker.on("completed", (j, returnVal) => {
    if (j.id === job.id) {
      clearTimeout(tid);
      resolve({ status: "completed", returnVal });
    }
  });

  worker.on("failed", (j, err) => {
    if (j?.id === job.id) {
      clearTimeout(tid);
      reject(new Error(`Job failed: ${err.message}`));
    }
  });
});

console.log("\n═══════════════════════════════════════════════════");
console.log("  ✅ E2E TEST PASSED — Resend is working!");
console.log(`  To      : ${TEST_EMAIL}`);
console.log(`  OTP     : ${TEST_OTP}`);
console.log(`  Result  : ${JSON.stringify(result)}`);
console.log("═══════════════════════════════════════════════════");
console.log("\n📬 Check your inbox for the TruthScan AI OTP email.\n");

await worker.close();
await queue.close();
redis.disconnect();
process.exit(0);

