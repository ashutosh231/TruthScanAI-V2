import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";

export default function Badge({
  children,
  verdict,
  category,
  variant = "default",
  size = "md",
  className = "",
  showIcon = false,
}) {
  let computedVariant = variant;
  let IconComponent = null;

  if (verdict) {
    const v = String(verdict).toUpperCase();
    if (v === "TRUE") {
      computedVariant = "true";
      IconComponent = CheckCircle2;
    } else if (v === "FALSE") {
      computedVariant = "false";
      IconComponent = XCircle;
    } else if (v === "MISLEADING") {
      computedVariant = "misleading";
      IconComponent = AlertTriangle;
    } else {
      computedVariant = "uncertain";
      IconComponent = HelpCircle;
    }
  }

  const variantStyles = {
    true: "bg-[#75D66A] text-[#111111] border-2 border-[#111111] shadow-hard-xs",
    false: "bg-[#FF4D4D] text-[#111111] border-2 border-[#111111] shadow-hard-xs",
    misleading: "bg-[#FFC857] text-[#111111] border-2 border-[#111111] shadow-hard-xs",
    uncertain: "bg-[#E8E2D5] text-[#111111] border-2 border-[#111111] shadow-hard-xs",
    lime: "bg-[#B7FF3C] text-[#111111] border-2 border-[#111111] shadow-hard-xs",
    dark: "bg-[#111111] text-[#F5F1E8] border-2 border-[#111111]",
    outline: "bg-transparent text-[#111111] border-2 border-[#111111]",
    default: "bg-[#E8E2D5] text-[#111111] border-2 border-[#111111]",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3.5 py-1.5 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono-tech font-bold uppercase tracking-wider select-none ${
        sizeStyles[size] || sizeStyles.md
      } ${variantStyles[computedVariant] || variantStyles.default} ${className}`}
    >
      {showIcon && IconComponent && <IconComponent className="w-3.5 h-3.5 stroke-[2.5]" />}
      <span>{children || verdict || category}</span>
    </span>
  );
}
