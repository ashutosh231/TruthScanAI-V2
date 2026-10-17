import { URL } from "url";
import net from "net";

/**
 * Validates a user-supplied URL to protect against SSRF (Server-Side Request Forgery).
 * Checks protocol, private IP ranges, loopback, and cloud metadata addresses.
 *
 * @param {string} urlString
 * @returns {{ valid: boolean, error?: string, parsedUrl?: URL }}
 */
export function validateSafeUrl(urlString) {
  if (!urlString || typeof urlString !== "string") {
    return { valid: false, error: "A valid URL string is required." };
  }

  let parsed;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    return { valid: false, error: "Malformed URL format." };
  }

  // Only allow http and https protocols
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: `Invalid protocol '${parsed.protocol}'. Only http and https URLs are permitted.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and standard loopback hostnames
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return {
      valid: false,
      error: "Access to local or internal loopback hostnames is prohibited.",
    };
  }

  // If hostname is an IP address, check for private / restricted ranges
  const ipType = net.isIP(hostname);
  if (ipType === 4) {
    if (isPrivateIPv4(hostname)) {
      return {
        valid: false,
        error: "Access to private or link-local IP addresses is prohibited.",
      };
    }
  } else if (ipType === 6) {
    if (isPrivateIPv6(hostname)) {
      return {
        valid: false,
        error: "Access to private or loopback IPv6 addresses is prohibited.",
      };
    }
  }

  return { valid: true, parsedUrl: parsed };
}

/**
 * Checks if IPv4 address is in private, loopback, or cloud metadata ranges.
 */
function isPrivateIPv4(ip) {
  const parts = ip.split(".").map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true;
  }

  // 127.0.0.0/8 (Loopback)
  if (parts[0] === 127) return true;
  // 10.0.0.0/8 (Private)
  if (parts[0] === 10) return true;
  // 172.16.0.0/12 (Private)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16 (Private)
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.0.0/16 (Link-local / Cloud metadata: 169.254.169.254)
  if (parts[0] === 169 && parts[1] === 254) return true;
  // 0.0.0.0/8 (Current network)
  if (parts[0] === 0) return true;
  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (parts[0] >= 224) return true;

  return false;
}

/**
 * Checks if IPv6 address is loopback (::1) or unique local address (fc00::/7) or link-local (fe80::/10).
 */
function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA
  if (normalized.startsWith("fe80:")) return true; // Link-local
  return false;
}

export default {
  validateSafeUrl,
};
