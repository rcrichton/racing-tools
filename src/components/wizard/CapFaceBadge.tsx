"use client";

import React from "react";
import { getIconSvgPath } from "@/lib/cad/iconManager";

interface CapFaceBadgeProps {
  inscriptionMode: "text" | "symbol";
  text: string;
  subtext?: string;
  symbolId: string;
  bodyColor: string;
  inlayColor: string;
  hasAccentRing: boolean;
  size?: "sm" | "md" | "lg";
}

export function CapFaceBadge({
  inscriptionMode,
  text,
  subtext,
  symbolId,
  bodyColor,
  inlayColor,
  hasAccentRing,
  size = "md",
}: CapFaceBadgeProps) {
  const cleanSub = (subtext || "").trim().toUpperCase();
  const cleanText = (text || "").trim().toUpperCase();

  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-12 h-12",
  }[size];

  const textFontClasses = {
    sm: cleanText.length >= 4 ? "text-[8px]" : cleanText.length === 3 ? "text-[9px]" : "text-[11px]",
    md: cleanText.length >= 4 ? "text-[9px]" : cleanText.length === 3 ? "text-[10px]" : "text-xs",
    lg: cleanText.length >= 4 ? "text-[10px]" : cleanText.length === 3 ? "text-[11px]" : "text-sm",
  }[size];

  return (
    <div
      className={`${sizeClasses} rounded-full flex flex-col items-center justify-center shrink-0 relative shadow-inner border border-white/15 select-none overflow-hidden`}
      style={{ backgroundColor: bodyColor }}
    >
      {hasAccentRing && (
        <span
          className="absolute inset-[2.5px] rounded-full border-[1.75px] pointer-events-none"
          style={{ borderColor: inlayColor }}
        />
      )}

      {inscriptionMode === "text" ? (
        <span
          className={`font-display font-bold tracking-tight leading-none z-10 ${textFontClasses}`}
          style={{ color: inlayColor }}
        >
          {cleanText}
        </span>
      ) : cleanSub ? (
        <div
          className="flex flex-col items-center justify-center z-10 leading-none"
          style={{ color: inlayColor }}
        >
          <svg
            viewBox="0 0 100 100"
            className={size === "sm" ? "w-3.5 h-3.5 -mt-0.5" : "w-4 h-4 -mt-0.5"}
          >
            <path d={getIconSvgPath(symbolId)} fill="currentColor" fillRule="evenodd" />
          </svg>
          <span
            className={`font-display font-bold tracking-tighter leading-none mt-[1px] ${
              size === "sm" ? "text-[5.5px]" : "text-[6.5px]"
            }`}
          >
            {cleanSub.slice(0, 4)}
          </span>
        </div>
      ) : (
        <svg
          viewBox="0 0 100 100"
          className={`z-10 ${
            size === "sm" ? "w-5 h-5" : size === "lg" ? "w-6 h-6" : "w-5.5 h-5.5"
          }`}
          style={{ color: inlayColor }}
        >
          <path d={getIconSvgPath(symbolId)} fill="currentColor" fillRule="evenodd" />
        </svg>
      )}
    </div>
  );
}
