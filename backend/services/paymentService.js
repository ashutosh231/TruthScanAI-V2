import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// Canonical server-side pricing catalog (NEVER trust frontend for amount)
const PLANS_CATALOG = {
  PREMIUM_MONTHLY: {
    name: "PREMIUM INVESTIGATOR",
    amount: 20000, // INR 200.00 in paise (Rs 200/month)
    currency: "INR",
  },
  PREMIUM_ANNUAL: {
    name: "PREMIUM INVESTIGATOR ANNUAL",
    amount: 200000, // INR 2,000.00 in paise (Rs 2,000/year)
    currency: "INR",
  },
};

/**
 * Creates a new Razorpay payment order.
 */
export const createPaymentOrder = async ({ userId, planType = "PREMIUM_MONTHLY" }) => {
  const plan = PLANS_CATALOG[planType] || PLANS_CATALOG.PREMIUM_MONTHLY;

  if (!razorpay) {
    throw new Error("Razorpay payment gateway is not initialized on the server.");
  }

  // Create order via Razorpay SDK
  const receiptId = `rcpt_${userId.toString().slice(-6)}_${Date.now()}`;
  const options = {
    amount: plan.amount,
    currency: plan.currency,
    receipt: receiptId,
    notes: {
      userId: userId.toString(),
      planType,
    },
  };

  const order = await razorpay.orders.create(options);

  // Store initial order record in MongoDB
  const paymentRecord = await Payment.create({
    user: userId,
    razorpayOrderId: order.id,
    amount: plan.amount,
    currency: plan.currency,
    plan: planType,
    status: "created",
  });

  return {
    orderId: order.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    paymentRecordId: paymentRecord._id,
  };
};

/**
 * Verifies Razorpay HMAC-SHA256 signature for client checkout completion.
 */
export const verifyPaymentSignature = async ({
  userId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is not configured on the server.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new Error("Invalid payment signature. Verification failed.");
  }

  // Update payment record in database
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId, user: userId },
    {
      razorpayPaymentId,
      razorpaySignature,
      status: "paid",
    },
    { returnDocument: "after" }
  );

  if (!payment) {
    throw new Error("Payment record for this order was not found.");
  }

  // Elevate user to premium status
  await User.findByIdAndUpdate(userId, { isPremium: true });

  return {
    verified: true,
    paymentId: payment._id,
    status: "paid",
  };
};

/**
 * Validates and processes Razorpay webhook events.
 */
export const processWebhookEvent = async (rawBody, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret && webhookSecret !== "your_webhook_secret") {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error("Invalid webhook signature.");
    }
  }

  const event = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
  const eventType = event.event;
  const paymentEntity = event.payload?.payment?.entity;

  if (eventType === "payment.captured" && paymentEntity) {
    const orderId = paymentEntity.order_id;
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        razorpayPaymentId: paymentEntity.id,
        status: "paid",
      },
      { returnDocument: "after" }
    );

    if (payment) {
      await User.findByIdAndUpdate(payment.user, { isPremium: true });
    }
  } else if (eventType === "payment.failed" && paymentEntity) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: paymentEntity.order_id },
      {
        razorpayPaymentId: paymentEntity.id,
        status: "failed",
      }
    );
  }

  return { received: true, event: eventType };
};

export default { createPaymentOrder, verifyPaymentSignature, processWebhookEvent };
