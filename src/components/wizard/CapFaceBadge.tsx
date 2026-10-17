"use client";

import React, { useEffect, useState } from "react";
import { getInlayShapes } from "@/lib/cad/buildCapGeometry";
import { ButtonCapConfig } from "@/config/wheelPresets";

interface CapFaceBadgeProps {
  inscriptionMode: "text" | "symbol";
  text: string;
  subtext?: string;
  symbolId: string;
  bodyColor: string;
  inlayColor: string;
  hasAccentRing: boolean;
  accentRingThickness?: number;
  fontFamily?: "JetBrains Mono" | "Chakra Petch" | "Orbitron";
  fontScale?: number;
  letterSpacing?: number;
  symbolScale?: number;
  outerDiameter?: number;
  size?: "sm" | "md" | "lg";
}

// In-memory SVG path cache keyed by cap geometry signature
const svgPathCache = new Map<string, string>();

export function CapFaceBadge({
  inscriptionMode,
  text,
  subtext = "",
  symbolId,
  bodyColor,
  inlayColor,
  hasAccentRing,
  accentRingThickness = 0.55,
  fontFamily = "JetBrains Mono",
  fontScale = 1.0,
  letterSpacing = 0.04,
  symbolScale = 1.0,
  outerDiameter = 11.4,
  size = "md",
}: CapFaceBadgeProps) {
  const cacheKey = [
    outerDiameter,
    inscriptionMode,
    text,
    subtext,
    symbolId,
    hasAccentRing,
    accentRingThickness,
    fontFamily,
    fontScale,
    letterSpacing,
    symbolScale,
  ].join("|");

  const [svgPath, setSvgPath] = useState<string>(
    () => svgPathCache.get(cacheKey) || ""
  );

  useEffect(() => {
    let active = true;
    const cached = svgPathCache.get(cacheKey);
    if (cached) {
      return;
    }

    const mockConfig: ButtonCapConfig = {
      id: "badge",
      name: "Badge",
      presetId: "fanatec",
      outerDiameter,
      baseInnerDiameter: 9.7,
      toleranceModifier: 0,
      capHeight: 4.2,
      topWallThickness: 1.0,
      inlayDepth: 0.5,
      inscriptionMode,
      text,
      subtext,
      fontFamily,
      fontScale,
      letterSpacing,
      symbolId,
      symbolScale,
      hasAccentRing,
      accentRingThickness,
      reliefMode: "flush",
      embossHeight: 0.4,
      bodyColor,
      inlayColor,
    };

    getInlayShapes(mockConfig)
      .then((shapes) => {
        if (!active) return;
        const parts: string[] = [];
        for (const shape of shapes) {
          const pts = shape.getPoints(16);
          if (pts.length > 0) {
            parts.push(
              "M" +
                pts
                  .map((p) => `${p.x.toFixed(2)},${(-p.y).toFixed(2)}`)
                  .join("L") +
                "Z"
            );
          }
          for (const hole of shape.holes) {
            const hPts = hole.getPoints(16);
            if (hPts.length > 0) {
              parts.push(
                "M" +
                  hPts
                    .map((p) => `${p.x.toFixed(2)},${(-p.y).toFixed(2)}`)
                    .join("L") +
                  "Z"
              );
            }
          }
        }
        const d = parts.join(" ");
        svgPathCache.set(cacheKey, d);
        setSvgPath(d);
      })
      .catch(() => {
        // Ignore transient font load error
      });

    return () => {
      active = false;
    };
  }, [
    cacheKey,
    outerDiameter,
    inscriptionMode,
    text,
    subtext,
    fontFamily,
    fontScale,
    letterSpacing,
    symbolId,
    symbolScale,
    hasAccentRing,
    accentRingThickness,
    bodyColor,
    inlayColor,
  ]);

  const effectivePath = svgPathCache.get(cacheKey) || svgPath;
  const r = outerDiameter / 2;

  const sizeClasses = {
    sm: "w-9 h-9",
    md: "w-11 h-11",
    lg: "w-12 h-12",
  }[size];

  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center shrink-0 relative shadow-inner border border-white/15 select-none overflow-hidden`}
      style={{ backgroundColor: bodyColor }}
    >
      <svg
        viewBox={`${-r} ${-r} ${outerDiameter} ${outerDiameter}`}
        className="w-full h-full"
      >
        {effectivePath && (
          <path d={effectivePath} fill={inlayColor} fillRule="evenodd" />
        )}
      </svg>
    </div>
  );
}

