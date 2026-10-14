"use client";

import React, { useEffect, useRef, useState } from "react";
import { useCapStore } from "@/store/useCapStore";
import { MOTORSPORT_ICONS } from "@/config/wheelPresets";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

export const Face2DPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cap = useCapStore((state) => state.getActiveCap());
  const [zoomLevel, setZoomLevel] = useState<number>(14); // pixels per millimeter

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // 1. Draw millimeter background engineering grid
    const pxPerMm = zoomLevel;
    ctx.lineWidth = 1;

    // 1mm grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    for (let x = cx % pxPerMm; x < width; x += pxPerMm) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = cy % pxPerMm; y < height; y += pxPerMm) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 5mm grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    for (let x = cx % (pxPerMm * 5); x < width; x += pxPerMm * 5) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = cy % (pxPerMm * 5); y < height; y += pxPerMm * 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Concentric calibration rings (5mm, 10mm, 15mm)
    for (const d of [5, 10, 15]) {
      const r = (d / 2) * pxPerMm;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.stroke();
    }

    // Center Crosshairs
    ctx.strokeStyle = "rgba(255, 102, 0, 0.25)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy);
    ctx.lineTo(cx + 30, cy);
    ctx.moveTo(cx, cy - 30);
    ctx.lineTo(cx, cy + 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Outer Cap Body Face
    const outerRadiusPx = (cap.outerDiameter / 2) * pxPerMm;
    const chamferRadiusPx = ((cap.outerDiameter - 0.5) / 2) * pxPerMm;

    // Chamfer shadow / outer boundary
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadiusPx, 0, Math.PI * 2);
    ctx.fillStyle = "#0c0e14";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Chamfer inner bevel gradient
    const grad = ctx.createRadialGradient(cx, cy, chamferRadiusPx, cx, cy, outerRadiusPx);
    grad.addColorStop(0, cap.bodyColor);
    grad.addColorStop(1, "#0a0c12");
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadiusPx, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Main flat top face
    ctx.beginPath();
    ctx.arc(cx, cy, chamferRadiusPx, 0, Math.PI * 2);
    ctx.fillStyle = cap.bodyColor;
    ctx.fill();

    // Subtle chamfer ring outline
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Optional Concentric Outer Accent Ring
    if (cap.hasAccentRing) {
      const ringOutPx = chamferRadiusPx - 0.3 * pxPerMm;
      const ringThPx = (cap.accentRingThickness || 0.55) * pxPerMm;
      const ringInPx = Math.max(2, ringOutPx - ringThPx);

      ctx.beginPath();
      ctx.arc(cx, cy, ringOutPx, 0, Math.PI * 2, false);
      ctx.arc(cx, cy, ringInPx, 0, Math.PI * 2, true);
      ctx.fillStyle = cap.inlayColor;
      ctx.fill();
    }

    // 4. Inscription Rendering (Text or Symbol)
    if (cap.inscriptionMode === "text") {
      const text = (cap.text || "PIT").trim().toUpperCase();
      const safeDiameterMm = cap.hasAccentRing
        ? (cap.outerDiameter - 0.5) - 0.6 - (cap.accentRingThickness || 0.55) * 2 - 0.8
        : (cap.outerDiameter - 0.5) - 0.8;

      const safeDiameterPx = safeDiameterMm * pxPerMm;

      // Base font size calculation
      const charCount = Math.max(1, text.length);
      let fontSizePx = (safeDiameterPx / charCount) * 1.5 * cap.fontScale;
      if (charCount === 1) fontSizePx = safeDiameterPx * 0.75 * cap.fontScale;
      else if (charCount === 2) fontSizePx = (safeDiameterPx / 1.7) * cap.fontScale;
      else if (charCount >= 4) fontSizePx = (safeDiameterPx / 2.9) * cap.fontScale;

      ctx.font = `900 ${Math.round(fontSizePx)}px ${
        cap.fontFamily === "Orbitron"
          ? "var(--font-orbitron), Orbitron, sans-serif"
          : cap.fontFamily === "Chakra Petch"
          ? "var(--font-chakra), 'Chakra Petch', sans-serif"
          : "var(--font-mono), 'JetBrains Mono', monospace"
      }`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = cap.inlayColor;

      // Letter spacing simulation
      if (cap.letterSpacing && charCount > 1) {
        // Use standard canvas letterSpacing if supported
        try {
          (ctx as unknown as { letterSpacing: string }).letterSpacing = `${cap.letterSpacing * fontSizePx}px`;
        } catch {
          // ignore
        }
      }

      ctx.fillText(text, cx, cy + fontSizePx * 0.05);
    } else {
      // Motorsport vector icon
      const icon = MOTORSPORT_ICONS.find((i) => i.id === cap.symbolId);
      if (icon) {
        const safeDiameterMm = cap.hasAccentRing
          ? (cap.outerDiameter - 0.5) - 0.6 - (cap.accentRingThickness || 0.55) * 2 - 0.8
          : (cap.outerDiameter - 0.5) - 0.8;

        const iconScale = ((safeDiameterMm * pxPerMm * 0.75) / 100) * (cap.symbolScale || 1.0);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(iconScale, iconScale);
        ctx.translate(-50, -50); // Center standard 100x100 SVG path

        const path2d = new Path2D(icon.path);
        ctx.fillStyle = cap.inlayColor;
        ctx.fill(path2d);
        ctx.restore();
      }
    }

    // 5. Dimension Annotation Line at the bottom
    const dimY = height - 14;
    const dimLeft = cx - outerRadiusPx;
    const dimRight = cx + outerRadiusPx;
    ctx.strokeStyle = "#FF6600";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dimLeft, dimY);
    ctx.lineTo(dimRight, dimY);
    // End ticks
    ctx.moveTo(dimLeft, dimY - 4);
    ctx.lineTo(dimLeft, dimY + 4);
    ctx.moveTo(dimRight, dimY - 4);
    ctx.lineTo(dimRight, dimY + 4);
    ctx.stroke();

    ctx.fillStyle = "#FF6600";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`Ø ${cap.outerDiameter.toFixed(2)}mm`, cx, dimY - 2);
  }, [cap, zoomLevel]);

  return (
    <div className="flex flex-col bg-[#12151E] border border-[#1E2330] rounded-xl p-3 shadow-md">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1E2330] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">2D Face Preview</span>
          <span className="text-[10px] text-slate-500">
            ({(zoomLevel / 3.78).toFixed(1)}x Zoom)
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel((z) => Math.max(8, z - 2))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(14)}
            className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Reset Zoom"
          >
            Reset
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(26, z + 2))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#090A0F] rounded-lg border border-[#1E2330] p-2 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={240}
          height={240}
          className="rounded cursor-crosshair"
        />
        <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-500 bg-[#090A0F]/80 px-1.5 py-0.5 rounded border border-[#1E2330]">
          1:1 Scale Reticle
        </div>
      </div>
    </div>
  );
};
