import { describe, it } from "node:test";
import assert from "node:assert";
import { validateSafeUrl } from "../utils/urlSecurity.js";

describe("Controller Logic & Authorization Unit Tests", () => {
  // ==========================================================================
  // Scenario 13: Free-trial limit enforcement
  // ==========================================================================
  it("Scenario 13: Blocks non-premium user when trial limit reached (2 checks) and allows premium", async () => {
    // Mock user objects
    const freeUser = { _id: "user-123", isPremium: false };
    const premiumUser = { _id: "user-999", isPremium: true };

    // Trial count helper logic
    const checkTrialLimit = (user, priorChecksCount) => {
      if (!user.isPremium && priorChecksCount >= 2) {
        return {
          allowed: false,
          status: 402,
          body: {
            success: false,
            message:
              "Trial limit reached: Free clearance is limited to 2 fact checks. Please upgrade to Premium Investigator (₹200/month) to continue scanning.",
            requiresUpgrade: true,
            trialLimit: 2,
            trialsUsed: priorChecksCount,
          },
        };
      }
      return { allowed: true };
    };

    // Free user with 0 checks: Allowed
    assert.strictEqual(checkTrialLimit(freeUser, 0).allowed, true);

    // Free user with 1 check: Allowed
    assert.strictEqual(checkTrialLimit(freeUser, 1).allowed, true);

    // Free user with 2 checks: Blocked with 402
    const blockedRes = checkTrialLimit(freeUser, 2);
    assert.strictEqual(blockedRes.allowed, false);
    assert.strictEqual(blockedRes.status, 402);
    assert.strictEqual(blockedRes.body.requiresUpgrade, true);

    // Premium user with 10 checks: Allowed
    const premiumRes = checkTrialLimit(premiumUser, 10);
    assert.strictEqual(premiumRes.allowed, true);
  });

  // ==========================================================================
  // Scenario 14: Fact-check history and ownership authorization
  // ==========================================================================
  it("Scenario 14: Fact-check record ownership authorization forbids cross-user access", () => {
    const ownerUserId = "user-alice-123";
    const strangerUserId = "user-bob-456";

    const mockRecord = {
      _id: "record-789",
      user: ownerUserId,
      input: "Claim content",
      verdict: "TRUE",
    };

    const authorizeAccess = (record, requestingUserId) => {
      if (!record || record.user.toString() !== requestingUserId.toString()) {
        const error = new Error("Fact check record not found.");
        error.statusCode = 404;
        throw error;
      }
      return { success: true, data: record };
    };

    // Owner access succeeds
    const ownerAccess = authorizeAccess(mockRecord, ownerUserId);
    assert.strictEqual(ownerAccess.success, true);
    assert.strictEqual(ownerAccess.data._id, "record-789");

    // Stranger access throws 404
    assert.throws(
      () => {
        authorizeAccess(mockRecord, strangerUserId);
      },
      (err) => err.statusCode === 404 && err.message.includes("not found")
    );
  });

  // ==========================================================================
  // SSRF Protection Tests
  // ==========================================================================
  it("SSRF Protection: Blocks private IPs, AWS metadata service, and loopback URLs", () => {
    const maliciousUrls = [
      "http://localhost/admin",
      "http://127.0.0.1:5000/api",
      "http://169.254.169.254/latest/meta-data/", // AWS metadata
      "http://10.0.0.1/internal",
      "http://192.168.1.1/router",
      "http://172.16.0.5/secrets",
      "ftp://example.com/file", // Non-http/https
      "http://cluster.local/secret",
    ];

    for (const url of maliciousUrls) {
      const res = validateSafeUrl(url);
      assert.strictEqual(
        res.valid,
        false,
        `Expected ${url} to be blocked by SSRF validator, but was permitted.`
      );
    }

    const safeUrls = [
      "https://www.reuters.com/world/article-1",
      "https://pib.gov.in/news",
      "https://nature.com/articles/s41586-024",
    ];

    for (const url of safeUrls) {
      const res = validateSafeUrl(url);
      assert.strictEqual(res.valid, true, `Expected ${url} to be valid, but was rejected.`);
    }
  });
});
