import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const EMAIL_QUEUE_NAME = "email-queue";

/**
 * BullMQ Queue for dispatching background email jobs.
 * Reuses the ioredis instance from config/redis.js.
 */
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: 100, // Retain last 100 completed jobs
    removeOnFail: 50,
  },
});

/**
 * Helper to enqueue an OTP verification email job.
 */
export const addEmailJob = async (jobName, data) => {
  return await emailQueue.add(jobName, data);
};

export default emailQueue;
