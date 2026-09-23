import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;

if (key_id && key_secret) {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} else {
  console.warn("[Razorpay] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set.");
}

export const razorpay = razorpayInstance;
export default razorpay;
