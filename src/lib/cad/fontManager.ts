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

  const url = FONT_URLS[family] || FONT_URLS.Orbitron;
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
 * Convert OpenType commands to Three.js ShapePath
 */
export function opentypePathToShapePath(
  path: Path,
  offsetX: number = 0,
  offsetY: number = 0,
  scale: number = 1
): THREE.ShapePath {
  const sp = new THREE.ShapePath();

  for (const cmd of path.commands) {
    if (cmd.type === "M") {
      sp.moveTo((cmd.x - offsetX) * scale, -(cmd.y - offsetY) * scale);
    } else if (cmd.type === "L") {
      sp.lineTo((cmd.x - offsetX) * scale, -(cmd.y - offsetY) * scale);
    } else if (cmd.type === "Q") {
      sp.quadraticCurveTo(
        (cmd.x1 - offsetX) * scale,
        -(cmd.y1 - offsetY) * scale,
        (cmd.x - offsetX) * scale,
        -(cmd.y - offsetY) * scale
      );
    } else if (cmd.type === "C") {
      sp.bezierCurveTo(
        (cmd.x1 - offsetX) * scale,
        -(cmd.y1 - offsetY) * scale,
        (cmd.x2 - offsetX) * scale,
        -(cmd.y2 - offsetY) * scale,
        (cmd.x - offsetX) * scale,
        -(cmd.y - offsetY) * scale
      );
    }
  }

  return sp;
}

/**
 * Geometric fallback shape generator for letters when font is not yet parsed
 */
function createFallbackTextShapes(
  text: string,
  targetWidth: number,
  targetHeight: number
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

    shape.moveTo(cx - halfW, -halfH);
    shape.lineTo(cx + halfW, -halfH);
    shape.lineTo(cx + halfW, halfH);
    shape.lineTo(cx - halfW, halfH);
    shape.closePath();

    shapes.push(shape);
  }

  return shapes;
}

/**
 * Generate centered, scaled THREE.Shape[] from text string
 */
export async function generateTextShapes(
  text: string,
  fontFamily: "Orbitron" | "Chakra Petch" | "JetBrains Mono",
  maxWidth: number,
  maxHeight: number,
  letterSpacing: number = 0.02,
  userFontScale: number = 1.0
): Promise<THREE.Shape[]> {
  const cleanText = (text || "PIT").trim().toUpperCase();
  if (!cleanText) return [];

  const font = await loadFont(fontFamily);
  if (!font) {
    return createFallbackTextShapes(cleanText, maxWidth * 0.8, maxHeight * 0.8);
  }

  // Base font size to measure
  const baseFontSize = 72;
  const path = font.getPath(cleanText, 0, 0, baseFontSize, {
    kerning: true,
    letterSpacing: letterSpacing,
  });

  const bb = path.getBoundingBox();
  const rawW = Math.max(0.1, bb.x2 - bb.x1);
  const rawH = Math.max(0.1, bb.y2 - bb.y1);
  const centerX = (bb.x1 + bb.x2) / 2;
  const centerY = (bb.y1 + bb.y2) / 2;

  // Auto-scale based on character count and bounding box
  const fitScaleW = maxWidth / rawW;
  const fitScaleH = maxHeight / rawH;
  const baseScale = Math.min(fitScaleW, fitScaleH);
  const finalScale = baseScale * userFontScale;

  const sp = opentypePathToShapePath(path, centerX, centerY, finalScale);
  const shapes = sp.toShapes();

  if (!shapes || shapes.length === 0) {
    return createFallbackTextShapes(cleanText, maxWidth * 0.8, maxHeight * 0.8);
  }

  return shapes;
}
