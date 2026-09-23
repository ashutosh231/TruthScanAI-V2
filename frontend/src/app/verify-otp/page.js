"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import ErrorState from "@/components/ErrorState";
import { KeyRound, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

export default function VerifyOtpPage() {
  const router = useRouter();
  const { verifyOtp, pendingOtpEmail, loading } = useAuth();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState(null);
  const [resendNotice, setResendNotice] = useState(false);

  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1); // Only keep last typed char
    setDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || "";
      }
      setDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = digits.join("");
    if (otpCode.length !== 6) {
      setError("Please input the complete 6-digit verification code.");
      return;
    }

    setError(null);
    try {
      await verifyOtp({
        email: pendingOtpEmail || "investigator@truthscan.ai",
        otp: otpCode,
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid or expired OTP token.");
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setCountdown(45);
    setCanResend(false);
    setResendNotice(true);
    setTimeout(() => setResendNotice(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-16 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#FFC857] text-[#111111] border-2 border-[#111111] shadow-hard-xs mx-auto flex items-center justify-center">
          <KeyRound className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-[#111111]">
          VERIFY CLEARANCE
        </h1>
        <p className="font-mono-tech text-xs text-[#111111]/70">
          Enter the 6-digit one-time code sent to{" "}
          <strong className="text-[#111111]">
            {pendingOtpEmail || "your registered email"}
          </strong>
        </p>
      </div>

      {error && (
        <ErrorState
          title="VERIFICATION REJECTED"
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      {resendNotice && (
        <div className="p-3 bg-[#B7FF3C] border-2 border-[#111111] font-mono-tech text-xs font-bold text-[#111111] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>NEW OTP DISPATCHED TO TERMINAL</span>
        </div>
      )}

      {/* Main OTP Card */}
      <div className="border-3 border-[#111111] bg-white shadow-hard-lg p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6 Digit Inputs */}
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center font-display text-2xl font-bold bg-[#F5F1E8] border-2 border-[#111111] focus:outline-none focus:bg-[#B7FF3C] focus:border-[#111111] shadow-hard-xs transition-colors"
                disabled={loading}
              />
            ))}
          </div>

          <Button
            type="submit"
            variant="accent"
            size="md"
            loading={loading}
            className="w-full"
            icon={ArrowRight}
          >
            VERIFY OTP & ACTIVATE
          </Button>
        </form>

        {/* Resend OTP Bar */}
        <div className="pt-3 border-t-2 border-[#111111] flex items-center justify-between text-xs font-mono-tech">
          <span className="text-[#111111]/70">
            {canResend ? "Code expired?" : `Resend in ${countdown}s`}
          </span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || loading}
            className="font-bold uppercase text-[#111111] hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            RESEND CODE
          </button>
        </div>
      </div>
    </div>
  );
}
