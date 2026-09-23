import crypto from "crypto";

/**
 * Generates a secure, cryptographically random 6-digit OTP string.
 */
export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export default generateOtp;
