import * as THREE from "three";
import { parse, type Font, type Path } from "opentype.js";

// Cache for loaded opentype Font instances
const fontCache = new Map<string, Font>();
const fontLoadingPromises = new Map<string, Promise<Font | null>>();

const FONT_URLS: Record<string, string> = {
  Orbitron: "/fonts/Orbitron-Bold.ttf",
  "Chakra Petch": "/fonts/ChakraPetch-Bold.ttf",
  "JetBrains Mono": "/fonts/JetBrainsMono-Bold.ttf",
};

/**
 * Preload and parse a font by name
 */
export async function loadFont(family: string): Promise<Font | null> {
  if (fontCache.has(family)) {
    return fontCache.get(family)!;
  }
  if (fontLoadingPromises.has(family)) {
    return fontLoadingPromises.get(family)!;
  }

  const url = FONT_URLS[family] || FONT_URLS["JetBrains Mono"];
  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching font ${url}`);
      const arrayBuffer = await res.arrayBuffer();
      const font = parse(arrayBuffer);
      fontCache.set(family, font);
      return font;
    } catch (err) {
      console.warn(`Could not load font "${family}", using fallback.`, err);
      return null;
    }
  })();

  fontLoadingPromises.set(family, promise);
  return promise;
}

/**
 * Outward-only polygon dilation to boost stroke boldness (+0.07mm total stroke width)
 * without shrinking inner counter-holes (P, R, B, A, O, D).
 */
function dilateOuterContour(
  rawPts: THREE.Vector2[],
  offsetMm: number
): THREE.Vector2[] {
  if (!offsetMm || offsetMm <= 0 || rawPts.length < 3) return rawPts;

  const pts: THREE.Vector2[] = [];
  for (const p of rawPts) {
    if (pts.length === 0 || p.distanceTo(pts[pts.length - 1]) > 0.015) {
      pts.push(p.clone());
    }
  }
  if (pts.length > 1 && pts[0].distanceTo(pts[pts.length - 1]) <= 0.015) {
    pts.pop();
  }
  const n = pts.length;
  if (n < 3) return rawPts;

  const area = THREE.ShapeUtils.area(pts);
  const sign = area < 0 ? -1 : 1;

  const out: THREE.Vector2[] = [];
  for (let i = 0; i < n; i++) {
    const pPrev = pts[(i - 1 + n) % n];
    const pCurr = pts[i];
    const pNext = pts[(i + 1) % n];

    const v1 = new THREE.Vector2().subVectors(pCurr, pPrev).normalize();
    const v2 = new THREE.Vector2().subVectors(pNext, pCurr).normalize();

    const n1 = new THREE.Vector2(sign * v1.y, -sign * v1.x);
    const n2 = new THREE.Vector2(sign * v2.y, -sign * v2.x);

    const bis = new THREE.Vector2().addVectors(n1, n2);
    const len = bis.length();
    if (len < 1e-4) {
      out.push(pCurr.clone().addScaledVector(n1, offsetMm));
    } else {
      bis.divideScalar(len);
      const dot = Math.max(0.6, bis.dot(n1));
      const d = Math.min(offsetMm * 1.25, offsetMm / dot);
      out.push(pCurr.clone().addScaledVector(bis, d));
    }
  }
  return out;
}

interface RawGlyphData {
  ch: string;
  path?: Path;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  width: number;
}

function measureGlyph(
  ch: string,
  font: Font,
  fontFamily: string,
  fontSize: number
): RawGlyphData {
  // Clean sans-serif pillar for 'I' in JetBrains Mono so words like PIT / WIP don't waste 25% width on monospace serifs
  if (ch === "I" && fontFamily === "JetBrains Mono") {
    return { ch, x1: 0, x2: 16.0, y1: 0, y2: 73.0, width: 16.0 };
  }
  // Extra-bold centered '+' and '-' for high-visibility adjustment labels (TC+, TC-, ABS+, ABS-)
  if (ch === "+" && fontFamily === "JetBrains Mono") {
    return { ch, x1: 0, x2: 44.0, y1: 14.5, y2: 58.5, width: 44.0 };
  }
  if (ch === "-" && fontFamily === "JetBrains Mono") {
    return { ch, x1: 0, x2: 34.0, y1: 28.5, y2: 44.5, width: 34.0 };
  }
  if (ch === "8" && fontFamily === "JetBrains Mono") {
    const gO = font.charToGlyph("O");
    const pO = gO.getPath(0, 0, fontSize);
    const bb = pO.getBoundingBox();
    return {
      ch,
      path: pO,
      x1: bb.x1,
      x2: bb.x2,
      y1: -bb.y2,
      y2: -bb.y1,
      width: Math.max(10, bb.x2 - bb.x1),
    };
  }

  const glyph = font.charToGlyph(ch);
  const path = glyph.getPath(0, 0, fontSize);
  const bb = path.getBoundingBox();
  const width = Math.max(10, bb.x2 - bb.x1);
  return {
    ch,
    path,
    x1: bb.x1,
    x2: bb.x2,
    y1: -bb.y2,
    y2: -bb.y1,
    width,
  };
}

function buildScaledGlyphShapes(
  item: RawGlyphData,
  cursorX: number,
  centerX: number,
  centerY: number,
  scaleX: number,
  scaleY: number,
  targetYOffset: number,
  fontFamily: string,
  boldOffsetMm: number
): THREE.Shape[] {
  const tx = (x: number) => (x - item.x1 + cursorX - centerX) * scaleX;
  const ty = (yUp: number) => (yUp - centerY) * scaleY + targetYOffset;

  if (item.ch === "I" && fontFamily === "JetBrains Mono") {
    const s = new THREE.Shape([
      new THREE.Vector2(tx(0), ty(0)),
      new THREE.Vector2(tx(16.0), ty(0)),
      new THREE.Vector2(tx(16.0), ty(73.0)),
      new THREE.Vector2(tx(0), ty(73.0)),
    ]);
    const dilated = dilateOuterContour(s.getPoints(8), boldOffsetMm);
    return [new THREE.Shape(dilated)];
  }

  if (item.ch === "-" && fontFamily === "JetBrains Mono") {
    const s = new THREE.Shape([
      new THREE.Vector2(tx(0), ty(28.5)),
      new THREE.Vector2(tx(34.0), ty(28.5)),
      new THREE.Vector2(tx(34.0), ty(44.5)),
      new THREE.Vector2(tx(0), ty(44.5)),
    ]);
    const dilated = dilateOuterContour(s.getPoints(8), boldOffsetMm);
    return [new THREE.Shape(dilated)];
  }

  if (item.ch === "+" && fontFamily === "JetBrains Mono") {
    // 44x44 cross centered at (22, 36.5) with 15.5 stem thickness
    const pts = [
      new THREE.Vector2(tx(14.25), ty(14.5)),
      new THREE.Vector2(tx(29.75), ty(14.5)),
      new THREE.Vector2(tx(29.75), ty(28.75)),
      new THREE.Vector2(tx(44.0), ty(28.75)),
      new THREE.Vector2(tx(44.0), ty(44.25)),
      new THREE.Vector2(tx(29.75), ty(44.25)),
      new THREE.Vector2(tx(29.75), ty(58.5)),
      new THREE.Vector2(tx(14.25), ty(58.5)),
      new THREE.Vector2(tx(14.25), ty(44.25)),
      new THREE.Vector2(tx(0), ty(44.25)),
      new THREE.Vector2(tx(0), ty(28.75)),
      new THREE.Vector2(tx(14.25), ty(28.75)),
    ];
    const dilated = dilateOuterContour(pts, boldOffsetMm * 0.7);
    return [new THREE.Shape(dilated)];
  }

  if (!item.path) return [];

  const sp = new THREE.ShapePath();
  for (const cmd of item.path.commands) {
    if (cmd.type === "M") {
      sp.moveTo(tx(cmd.x), ty(-cmd.y));
    } else if (cmd.type === "L") {
      sp.lineTo(tx(cmd.x), ty(-cmd.y));
    } else if (cmd.type === "Q") {
      sp.quadraticCurveTo(tx(cmd.x1), ty(-cmd.y1), tx(cmd.x), ty(-cmd.y));
    } else if (cmd.type === "C") {
      sp.bezierCurveTo(
        tx(cmd.x1),
        ty(-cmd.y1),
        tx(cmd.x2),
        ty(-cmd.y2),
        tx(cmd.x),
        ty(-cmd.y)
      );
    } else if (cmd.type === "Z" && sp.currentPath) {
      sp.currentPath.closePath();
    }
  }

  // Remove the center dot inside '0' in JetBrains Mono so the counter hole prints cleanly
  if (
    item.ch === "0" &&
    fontFamily === "JetBrains Mono" &&
    sp.subPaths.length > 2
  ) {
    sp.subPaths = sp.subPaths.slice(0, 2);
  }

  const rawShapes = sp.toShapes();

  if (item.ch === "8" && fontFamily === "JetBrains Mono" && rawShapes.length > 0) {
    const outer = rawShapes[0];
    outer.holes = [];
    const h1 = new THREE.Path([
      new THREE.Vector2(tx(19.5), ty(11.5)),
      new THREE.Vector2(tx(40.5), ty(11.5)),
      new THREE.Vector2(tx(40.5), ty(31.0)),
      new THREE.Vector2(tx(19.5), ty(31.0)),
    ]);
    h1.closePath();
    const h2 = new THREE.Path([
      new THREE.Vector2(tx(19.5), ty(42.0)),
      new THREE.Vector2(tx(40.5), ty(42.0)),
      new THREE.Vector2(tx(40.5), ty(61.5)),
      new THREE.Vector2(tx(19.5), ty(61.5)),
    ]);
    h2.closePath();
    outer.holes.push(h1, h2);
  }

  return rawShapes.map((s) => {
    const dilatedPts = dilateOuterContour(s.getPoints(18), boldOffsetMm);
    const boldShape = new THREE.Shape(dilatedPts);
    boldShape.holes = s.holes;
    return boldShape;
  });
}

/**
 * Geometric fallback shape generator for letters when font is not yet parsed
 */
function createFallbackTextShapes(
  text: string,
  targetWidth: number,
  targetHeight: number,
  targetYOffset: number = 0
): THREE.Shape[] {
  const shapes: THREE.Shape[] = [];
  const charCount = Math.max(1, text.length);
  const charWidth = Math.min(targetHeight * 0.65, (targetWidth / charCount) * 0.85);
  const spacing = charWidth * 1.15;
  const totalW = (charCount - 1) * spacing + charWidth;
  const startX = -totalW / 2 + charWidth / 2;

  for (let i = 0; i < text.length; i++) {
    const cx = startX + i * spacing;
    const shape = new THREE.Shape();
    const halfW = charWidth / 2;
    const halfH = targetHeight / 2;

    shape.moveTo(cx - halfW, -halfH + targetYOffset);
    shape.lineTo(cx + halfW, -halfH + targetYOffset);
    shape.lineTo(cx + halfW, halfH + targetYOffset);
    shape.lineTo(cx - halfW, halfH + targetYOffset);
    shape.closePath();

    shapes.push(shape);
  }

  return shapes;
}

/**
 * Generate centered, scaled, bold THREE.Shape[] from text string.
 * Uses per-character visual kerning, tall motorsport aspect scaling, and outward-only
 * stroke dilation so 1–4 character labels and subtext maximize the circular cap face.
 */
export async function generateTextShapes(
  text: string,
  fontFamily: "Orbitron" | "Chakra Petch" | "JetBrains Mono",
  maxWidth: number,
  maxHeight: number,
  letterSpacing: number = 0.04,
  userFontScale: number = 1.0,
  targetYOffset: number = 0,
  maxSafeDiameter?: number
): Promise<THREE.Shape[]> {
  const cleanText = (text || "PIT").trim().toUpperCase();
  if (!cleanText) return [];

  const font = await loadFont(fontFamily);
  if (!font) {
    return createFallbackTextShapes(
      cleanText,
      maxWidth * 0.8,
      maxHeight * 0.8,
      targetYOffset
    );
  }

  const baseFontSize = 100;
  // Smooth, responsive spacing across the entire slider range (-0.02 to +0.14)
  // while keeping a print-safe minimum gap (>= 7.5 units) so dilated strokes never fuse
  const gap = Math.max(7.5, 10.5 + (letterSpacing ?? 0.04) * 110);

  const items: RawGlyphData[] = [];
  let totalRawW = 0;
  let minRawY = Infinity;
  let maxRawY = -Infinity;

  for (let i = 0; i < cleanText.length; i++) {
    const item = measureGlyph(cleanText[i], font, fontFamily, baseFontSize);
    items.push(item);
    totalRawW += item.width + (i > 0 ? gap : 0);
    if (item.y1 < minRawY) minRawY = item.y1;
    if (item.y2 > maxRawY) maxRawY = item.y2;
  }

  const rawW = Math.max(1, totalRawW);
  const rawH = Math.max(1, maxRawY - minRawY);
  const centerX = rawW / 2;
  const centerY = (minRawY + maxRawY) / 2;

  // Base horizontal & vertical scale to maximize space
  let scaleX = Math.min(maxWidth / rawW, maxHeight / rawH);
  // Allow vertical aspect boost (up to 1.32x) so 3-4 letter labels fill vertical circle space
  const aspectBoost = cleanText.length >= 4 ? 1.34 : cleanText.length === 3 ? 1.28 : 1.12;
  let scaleY = Math.min(maxHeight / rawH, scaleX * aspectBoost);

  if (maxSafeDiameter && maxSafeDiameter > 0) {
    const maxR = (maxSafeDiameter / 2) * 0.97;
    const cornerX = (rawW * scaleX) / 2;
    const cornerY = Math.abs(targetYOffset) + (rawH * scaleY) / 2;
    const cornerDist = Math.hypot(cornerX, cornerY);
    if (cornerDist > maxR) {
      const f = maxR / cornerDist;
      scaleX *= f;
      scaleY *= f;
    }
  }

  scaleX *= userFontScale || 1.0;
  scaleY *= userFontScale || 1.0;

  // Outward stroke boost (+0.032mm per side = +0.064mm thicker strokes)
  const boldOffsetMm = targetYOffset !== 0 ? 0.025 : 0.032;

  const allShapes: THREE.Shape[] = [];
  let cursorX = 0;
  for (const item of items) {
    const gShapes = buildScaledGlyphShapes(
      item,
      cursorX,
      centerX,
      centerY,
      scaleX,
      scaleY,
      targetYOffset,
      fontFamily,
      boldOffsetMm
    );
    allShapes.push(...gShapes);
    cursorX += item.width + gap;
  }

  if (allShapes.length === 0) {
    return createFallbackTextShapes(
      cleanText,
      maxWidth * 0.8,
      maxHeight * 0.8,
      targetYOffset
    );
  }

  return allShapes;
}

