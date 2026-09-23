import {
  createPaymentOrder,
  verifyPaymentSignature,
  processWebhookEvent,
} from "../services/paymentService.js";

/**
 * Initiate Razorpay checkout order
 * POST /api/payments/create-order
 */
export const createOrder = async (req, res, next) => {
  try {
    const { planType } = req.body;

    const orderData = await createPaymentOrder({
      userId: req.user._id,
      planType,
    });

    res.status(201).json({
      success: true,
      data: orderData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment signature
 * POST /api/payments/verify
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400);
      throw new Error(
        "Missing required payment verification parameters: razorpayOrderId, razorpayPaymentId, and razorpaySignature are required."
      );
    }

    const verificationResult = await verifyPaymentSignature({
      userId: req.user._id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    res.status(200).json({
      success: true,
      message: "Payment successfully verified. Premium clearance activated.",
      data: verificationResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle incoming Razorpay Webhook notifications
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];

    // Use rawBody if available or JSON stringify
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await processWebhookEvent(rawBody, signature);

    res.status(200).json({
      success: true,
      message: "Webhook processed.",
      data: result,
    });
  } catch (error) {
    console.error(`[PaymentController] Webhook error: ${error.message}`);
    // Always return 200 or 400 with message to prevent Razorpay retrying endlessly on bad signatures
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
