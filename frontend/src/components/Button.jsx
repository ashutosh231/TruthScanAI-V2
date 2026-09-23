"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  icon: Icon,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-display uppercase tracking-wider font-bold border-2 border-[#111111] transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs shadow-hard-xs gap-1.5",
    md: "px-5 py-2.5 text-sm shadow-hard gap-2",
    lg: "px-7 py-3.5 text-base shadow-hard-lg gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-[#111111] text-[#F5F1E8] hover:bg-[#222222] hover:text-[#B7FF3C]",
    accent:
      "bg-[#B7FF3C] text-[#111111] hover:bg-[#a6ec2e] hover:shadow-hard-lg",
    secondary:
      "bg-[#E8E2D5] text-[#111111] hover:bg-[#ded6c7]",
    danger:
      "bg-[#FF4D4D] text-[#111111] hover:bg-[#fa3838]",
    outline:
      "bg-white/90 text-[#111111] hover:bg-[#B7FF3C]",
    ghost:
      "border-transparent shadow-none hover:bg-black/5 hover:border-[#111111]",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
