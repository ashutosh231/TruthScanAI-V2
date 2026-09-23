"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { createPaymentOrder, verifyPayment } from "@/lib/api";
import { Check, CreditCard, Sparkles, AlertCircle, Loader2, AlertTriangle, Zap } from "lucide-react";

function PlansContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTrialEnded = searchParams?.get("trialEnded") === "true" || searchParams?.get("limit") === "reached";
  const { user, isAuthenticated, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const plans = [
    {
      id: "free",
      name: "FREE CLEARANCE",
      price: "₹0",
      period: "2 trials",
      description: "Introductory fact checking capability for individual readers and social monitors.",
      accent: false,
      features: [
        "2 free trial investigations (Text, URL, File, Scan)",
        "Live news wire access",
        "Community knowledge base",
        "Standard AI explanations",
      ],
      ctaText: user?.isPremium ? "FREE TIER" : "CURRENT PLAN",
      disabled: true,
    },
    {
      id: "premium",
      name: "PREMIUM INVESTIGATOR",
      price: "₹200",
      period: "per month",
      description: "High-throughput intelligence suite for journalists, researchers, and forensic analysts.",
      accent: true,
      features: [
        "Unlimited fact checks (50 / day)",
        "Optical camera & document OCR",
        "Unlimited historical archive",
        "Deep signal & consensus analysis",
        "Priority queue processing",
        "Cloudinary forensic profile integration",
        "Exportable PDF/JSON audit dossiers",
      ],
      ctaText: user?.isPremium ? "CLEARANCE ACTIVE" : "UPGRADE CLEARANCE",
      disabled: !!user?.isPremium,
    },
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/plans");
      return;
    }

    if (user?.isPremium) {
      alert("You are already on the Premium Investigator plan.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay payment SDK. Check your internet connection.");
      }

      // Create order with backend (amount ₹200.00 = 20000 paise)
      const res = await createPaymentOrder("PREMIUM_MONTHLY");
      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to create payment order.");
      }

      const { orderId, keyId, amount, currency } = res.data;

      const options = {
        key: keyId || "rzp_test_placeholder",
        amount: amount,
        currency: currency || "INR",
        name: "TruthScan AI",
        description: "Premium Investigator Clearance (₹200/month)",
        order_id: orderId,
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setSuccessMsg("Payment verified! Premium Investigator status activated.");
              if (updateUser) {
                updateUser({ isPremium: true });
              }
              setTimeout(() => {
                router.push("/dashboard");
              }, 1500);
            } else {
              setErrorMsg(verifyRes.message || "Payment signature verification failed.");
            }
          } catch (err) {
            setErrorMsg(err.message || "Error verifying payment signature.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#111111",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp) {
        setErrorMsg(resp.error?.description || "Payment failed or was cancelled.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message || "Failed to initiate payment checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="border-b-2 border-[#111111] pb-6 space-y-2 text-center">
        <div className="inline-flex items-center gap-2 font-mono-tech text-xs uppercase font-bold text-[#111111]">
          <CreditCard className="w-4 h-4 text-[#111111]" />
          <span>TRANSPARENT INTELLIGENCE TIERS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tighter text-[#111111]">
          MEMBERSHIP PLANS
        </h1>
        <p className="font-mono-tech text-xs sm:text-sm text-[#111111]/80 max-w-xl mx-auto">
          Scale your disinformation defense. Upgrade to Premium Investigator for expanded daily throughput and priority optical pipelines at ₹200/month.
        </p>
      </div>

      {/* Free Trial Limit Exhausted Banner */}
      {isTrialEnded && (
        <div className="border-3 border-[#111111] bg-[#FF4D4D] text-white p-5 shadow-hard-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-[#FF4D4D] border-2 border-black flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-display text-sm sm:text-base uppercase tracking-tight font-bold">
                FREE TRIAL ALLOCATION EXHAUSTED (2/2 INVESTIGATIONS USED)
              </h4>
              <p className="font-mono-tech text-xs opacity-90">
                You have utilized both complimentary free trial checks. Activate the Premium Investigator plan below for ₹200/month to unlock unlimited multimodal verification.
              </p>
            </div>
          </div>
          <Button
            variant="accent"
            size="sm"
            onClick={handleUpgrade}
            disabled={loading}
            className="shrink-0 whitespace-nowrap text-[#111111]"
          >
            SUBSCRIBE NOW
          </Button>
        </div>
      )}

      {/* Notifications */}
      {errorMsg && (
        <div className="border-2 border-[#111111] bg-[#FF4D4D] text-white p-4 font-mono-tech text-xs flex items-center gap-2 shadow-hard">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="border-2 border-[#111111] bg-[#B7FF3C] text-[#111111] p-4 font-mono-tech text-xs font-bold flex items-center gap-2 shadow-hard">
          <Check className="w-4 h-4 shrink-0 stroke-[3]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border-3 border-[#111111] p-6 sm:p-8 flex flex-col justify-between space-y-8 relative ${
              plan.accent
                ? "bg-[#B7FF3C] shadow-hard-lg"
                : "bg-white shadow-hard"
            }`}
          >
            {plan.accent && (
              <div className="absolute -top-3.5 right-6 bg-[#111111] text-[#B7FF3C] border-2 border-[#111111] font-mono-tech text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                RECOMMENDED BY FACT-CHECKERS
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2 border-b-2 border-[#111111] pb-4">
                <h3 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
                  {plan.name}
                </h3>
                <p className="font-mono-tech text-xs text-[#111111]/80 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl sm:text-6xl font-bold text-[#111111]">
                  {plan.price}
                </span>
                <span className="font-mono-tech text-xs uppercase text-[#111111]/70 font-bold">
                  / {plan.period}
                </span>
              </div>

              {/* Features List */}
              <div className="space-y-3 pt-2">
                <span className="font-mono-tech text-xs font-bold uppercase text-[#111111] block">
                  INCLUDED CAPABILITIES:
                </span>
                <ul className="space-y-2.5 font-mono-tech text-xs text-[#111111]">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-none bg-[#111111] text-[#B7FF3C] flex items-center justify-center border border-[#111111] shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              {plan.accent ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleUpgrade}
                  disabled={plan.disabled || loading}
                  icon={loading ? Loader2 : Sparkles}
                >
                  {loading ? "COMMUNICATING WITH GATEWAY..." : plan.ctaText}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  disabled={true}
                >
                  {plan.ctaText}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enterprise callout */}
      <div className="border-2 border-[#111111] bg-[#E8E2D5] p-6 shadow-hard flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-display text-lg uppercase tracking-tight text-[#111111]">
            NEED ENTERPRISE OR NEWSROOM VOLUME?
          </h4>
          <p className="font-mono-tech text-xs text-[#111111]/80">
            Dedicated API throughput, on-premise embeddings, and custom domain threat monitors.
          </p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={() => alert("Enterprise briefing request sent to contact@truthscan.ai")}
        >
          CONTACT SALES
        </Button>
      </div>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-mono-tech">LOADING INTELLIGENCE TIERS...</div>}>
      <PlansContent />
    </Suspense>
  );
}
