import redis from "../config/redis.js";

/**
 * Higher-order Redis rate limiter.
 * Increments an atomic counter in Redis with an expiration window.
 */
export const createRedisRateLimiter = ({
  prefix,
  limit,
  windowSeconds,
  keyGenerator,
  message,
}) => {
  return async (req, res, next) => {
    try {
      const id = keyGenerator(req);
      if (!id) {
        return next();
      }

      const key = `ratelimit:${prefix}:${id}`;
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > limit) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          success: false,
          message:
            message ||
            `Too many requests. Please try again in ${ttl > 0 ? ttl : windowSeconds} seconds.`,
          retryAfter: ttl > 0 ? ttl : windowSeconds,
        });
      }

      next();
    } catch (error) {
      console.warn(`[RateLimiter] Redis warning: ${error.message}. Failing open.`);
      next();
    }
  };
};

// 1. Register: 5 requests / minute / IP
export const registerRateLimiter = createRedisRateLimiter({
  prefix: "register",
  limit: 5,
  windowSeconds: 60,
  keyGenerator: (req) => req.ip || req.headers["x-forwarded-for"] || "ip_unknown",
  message: "Too many registration attempts from this IP. Please wait a minute before trying again.",
});

// 2. Send OTP: 3 requests / 10 minutes / email
export const sendOtpRateLimiter = createRedisRateLimiter({
  prefix: "send-otp",
  limit: 3,
  windowSeconds: 600,
  keyGenerator: (req) => req.body?.email?.toLowerCase() || req.ip,
  message: "Too many OTP requests for this email address. Please try again after 10 minutes.",
});

// 3. Verify OTP: 5 requests / 10 minutes / email
export const verifyOtpRateLimiter = createRedisRateLimiter({
  prefix: "verify-otp",
  limit: 5,
  windowSeconds: 600,
  keyGenerator: (req) => req.body?.email?.toLowerCase() || req.ip,
  message: "Too many incorrect OTP attempts. Please wait 10 minutes before retrying.",
});

// 4. Login: 5 requests / 10 minutes / IP or email
export const loginRateLimiter = createRedisRateLimiter({
  prefix: "login",
  limit: 5,
  windowSeconds: 600,
  keyGenerator: (req) =>
    (req.body?.email ? `email:${req.body.email.toLowerCase()}` : `ip:${req.ip}`),
  message: "Too many login attempts. Account temporarily locked for 10 minutes for security.",
});

// 5. Fact Check: 30 requests / 10 minutes / user
export const factCheckRateLimiter = createRedisRateLimiter({
  prefix: "factcheck",
  limit: 30,
  windowSeconds: 600,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: "Rate limit reached for fact checking queries. Please wait before submitting more claims.",
});
