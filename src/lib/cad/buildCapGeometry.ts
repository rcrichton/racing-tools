import * as THREE from "three";
import { Evaluator, Brush, SUBTRACTION } from "three-bvh-csg";
import { ButtonCapConfig } from "@/config/wheelPresets";
import { generateTextShapes } from "./fontManager";
import { generateIconShapes } from "./iconManager";

export interface CapGeometryResult {
  bodyGeometry: THREE.BufferGeometry;
  inlayGeometry: THREE.BufferGeometry | null;
  effectiveInnerDiameter: number;
  wallThickness: number;
  outerDiameter: number;
  capHeight: number;
  topWallThickness: number;
  inlayDepth: number;
}

// In-memory cache for fast parametric updates
const geometryCache = new Map<string, CapGeometryResult>();

function getCacheKey(config: ButtonCapConfig): string {
  return [
    config.outerDiameter,
    config.baseInnerDiameter,
    config.toleranceModifier,
    config.capHeight,
    config.topWallThickness,
    config.inlayDepth,
    config.inscriptionMode,
    config.text,
    config.subtext || "",
    config.fontFamily,
    config.fontScale,
    config.letterSpacing,
    config.symbolId,
    config.symbolScale,
    config.hasAccentRing,
    config.accentRingThickness,
    config.reliefMode,
    config.embossHeight,
  ].join("|");
}

/**
 * Generates the unified 2D shapes for inscription (text / symbol + optional subtext) and optional accent ring.
 * Shared directly by both 3D CAD extrusion and 2D Canvas preview for 100% scale parity.
 */
export async function getInlayShapes(
  config: ButtonCapConfig
): Promise<THREE.Shape[]> {
  const {
    outerDiameter: OD,
    hasAccentRing,
    accentRingThickness = 0.55,
  } = config;

  const Ro = OD / 2;
  const C = 0.25; // 0.25mm top outer chamfer

  // Safe usable diameter on top face (0.15mm margin from outer chamfer or accent ring)
  const maxSafeDiameter = hasAccentRing
    ? Math.max(2.0, (Ro - C - 0.18 - accentRingThickness - 0.18) * 2)
    : Math.max(3.0, (Ro - C - 0.15) * 2);

  let inscriptionShapes: THREE.Shape[] = [];

  if (config.inscriptionMode === "text") {
    // Maximize available space across the circular face
    const targetWidth = maxSafeDiameter * 0.95;
    const targetHeight = maxSafeDiameter * 0.78;

    inscriptionShapes = await generateTextShapes(
      config.text,
      config.fontFamily,
      targetWidth,
      targetHeight,
      config.letterSpacing,
      config.fontScale,
      0,
      maxSafeDiameter
    );
  } else {
    const cleanSubtext = (config.subtext || "").trim().toUpperCase();
    if (cleanSubtext.length > 0) {
      const iconShapes = generateIconShapes(
        config.symbolId,
        maxSafeDiameter * 0.52,
        config.symbolScale,
        maxSafeDiameter * 0.19
      );
      const subtextShapes = await generateTextShapes(
        cleanSubtext,
        "JetBrains Mono",
        maxSafeDiameter * 0.78,
        maxSafeDiameter * 0.30,
        0.02,
        1.0,
        -maxSafeDiameter * 0.21,
        maxSafeDiameter
      );
      inscriptionShapes = [...iconShapes, ...subtextShapes];
    } else {
      inscriptionShapes = generateIconShapes(
        config.symbolId,
        maxSafeDiameter * 0.86,
        config.symbolScale,
        0
      );
    }
  }

  const allShapes: THREE.Shape[] = [...inscriptionShapes];

  // Optional concentric outer accent ring
  if (hasAccentRing) {
    const ringOutRadius = Ro - C - 0.20;
    const ringInRadius = Math.max(0.5, ringOutRadius - accentRingThickness);

    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, ringOutRadius, 0, Math.PI * 2, false);

    const ringHole = new THREE.Path();
    ringHole.absarc(0, 0, ringInRadius, 0, Math.PI * 2, true);
    ringShape.holes.push(ringHole);

    allShapes.push(ringShape);
  }

  return allShapes;
}

/**
 * Builds parametric 3D watertight geometries for the Cap Body and Dual-Color Inlay.
 * Correctly oriented so text and symbols are upright when viewed from the front camera.
 */
export async function buildCapGeometry(
  config: ButtonCapConfig
): Promise<CapGeometryResult> {
  const cacheKey = getCacheKey(config);
  if (geometryCache.has(cacheKey)) {
    return geometryCache.get(cacheKey)!;
  }

  const {
    outerDiameter: OD,
    baseInnerDiameter: baseID,
    toleranceModifier,
    capHeight: H,
    topWallThickness: T,
    inlayDepth,
    reliefMode,
    embossHeight = 0.4,
  } = config;

  const effectiveID = +(baseID + toleranceModifier).toFixed(2);
  const wallThickness = +((OD - effectiveID) / 2).toFixed(2);

  const Ro = OD / 2;
  const Ri = Math.min(Ro - 0.35, effectiveID / 2);
  const C = 0.25; // 0.25mm top outer chamfer
  const leadInChamfer = 0.15; // 0.15mm bottom inner lead-in chamfer for easy push fit

  // 1. Build Parametric Smooth-Bore Hollow Cup (Lathe)
  // Coordinates in (radius, Y): Y=0 at skirt bottom, Y=H at top face
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.001, H), // Top face center
    new THREE.Vector2(Ro - C, H), // Top face outer chamfer start
    new THREE.Vector2(Ro, H - C), // Outer chamfer end
    new THREE.Vector2(Ro, 0), // Bottom outer skirt rim
    new THREE.Vector2(Ri + leadInChamfer, 0), // Bottom inner lead-in chamfer start
    new THREE.Vector2(Ri, leadInChamfer), // Bottom inner lead-in chamfer end
    new THREE.Vector2(Ri, H - T), // Inner bore top corner
    new THREE.Vector2(0.001, H - T), // Bore ceiling center
  ];

  const bodyCupGeo = new THREE.LatheGeometry(points, 64);
  bodyCupGeo.computeVertexNormals();

  // 2. Gather 2D Inscription Shapes (Text / Symbol / Accent Ring)
  const allInlayShapes = await getInlayShapes(config);

  // If no shapes exist, return pure body geometry
  if (allInlayShapes.length === 0) {
    const result: CapGeometryResult = {
      bodyGeometry: bodyCupGeo,
      inlayGeometry: null,
      effectiveInnerDiameter: effectiveID,
      wallThickness,
      outerDiameter: OD,
      capHeight: H,
      topWallThickness: T,
      inlayDepth,
    };
    geometryCache.set(cacheKey, result);
    return result;
  }

  // 3. Extrude Inlay / Inscription Geometry & Construct Volumes
  // Note on orientation:
  // ExtrudeGeometry builds 2D shapes (X, Y) along +Z.
  // Rotating around X by -Math.PI / 2 transforms:
  // X -> X (Left to Right)
  // Y -> Z (Top of letter at +Y in 2D becomes -Z, pointing away from viewer / upright)
  // Z -> Y (Extrusion depth along Z becomes vertical height along Y)
  let finalBodyGeo: THREE.BufferGeometry = bodyCupGeo;
  let finalInlayGeo: THREE.BufferGeometry | null = null;

  try {
    const evaluator = new Evaluator();
    evaluator.useGroups = false;

    if (reliefMode === "flush") {
      // FLUSH DUAL-COLOR INLAY:
      // Inlay depth D: from Y = H - D to Y = H
      const inlayGeo = new THREE.ExtrudeGeometry(allInlayShapes, {
        depth: inlayDepth,
        bevelEnabled: false,
        curveSegments: 20,
      });
      inlayGeo.rotateX(-Math.PI / 2);
      inlayGeo.translate(0, H - inlayDepth, 0); // Position exactly at Y = H - inlayDepth up to Y = H
      inlayGeo.computeVertexNormals();
      finalInlayGeo = inlayGeo;

      // Body Pocket Cutter: slightly extended vertically to guarantee clean planar subtraction
      const cutterGeo = new THREE.ExtrudeGeometry(allInlayShapes, {
        depth: inlayDepth + 0.05,
        bevelEnabled: false,
        curveSegments: 20,
      });
      cutterGeo.rotateX(-Math.PI / 2);
      cutterGeo.translate(0, H - inlayDepth - 0.02, 0);

      const bodyBrush = new Brush(bodyCupGeo);
      bodyBrush.updateMatrixWorld();

      const cutterBrush = new Brush(cutterGeo);
      cutterBrush.updateMatrixWorld();

      const cutBody = evaluator.evaluate(bodyBrush, cutterBrush, SUBTRACTION);
      cutBody.geometry.computeVertexNormals();
      finalBodyGeo = cutBody.geometry;
    } else if (reliefMode === "emboss") {
      // RAISED EMBOSS:
      // Inlay protrudes above the cap face from Y = H to Y = H + embossHeight
      const inlayGeo = new THREE.ExtrudeGeometry(allInlayShapes, {
        depth: embossHeight,
        bevelEnabled: false,
        curveSegments: 20,
      });
      inlayGeo.rotateX(-Math.PI / 2);
      inlayGeo.translate(0, H, 0); // Extrudes from Y = H to Y = H + embossHeight
      inlayGeo.computeVertexNormals();
      finalInlayGeo = inlayGeo;
      finalBodyGeo = bodyCupGeo;
    } else if (reliefMode === "deboss") {
      // ENGRAVED DEBOSS:
      // Cavity cut into the top face of depth inlayDepth
      const cutterGeo = new THREE.ExtrudeGeometry(allInlayShapes, {
        depth: inlayDepth + 0.05,
        bevelEnabled: false,
        curveSegments: 20,
      });
      cutterGeo.rotateX(-Math.PI / 2);
      cutterGeo.translate(0, H - inlayDepth - 0.02, 0);

      const bodyBrush = new Brush(bodyCupGeo);
      bodyBrush.updateMatrixWorld();

      const cutterBrush = new Brush(cutterGeo);
      cutterBrush.updateMatrixWorld();

      const cutBody = evaluator.evaluate(bodyBrush, cutterBrush, SUBTRACTION);
      cutBody.geometry.computeVertexNormals();
      finalBodyGeo = cutBody.geometry;

      // Recessed accent inlay at bottom of deboss pocket (optional for visualization)
      const recessedInlay = new THREE.ExtrudeGeometry(allInlayShapes, {
        depth: 0.1,
        bevelEnabled: false,
        curveSegments: 20,
      });
      recessedInlay.rotateX(-Math.PI / 2);
      recessedInlay.translate(0, H - inlayDepth, 0);
      recessedInlay.computeVertexNormals();
      finalInlayGeo = recessedInlay;
    }
  } catch (err) {
    console.error("CSG geometry calculation failed, using fallback:", err);
    finalBodyGeo = bodyCupGeo;
    const fallbackInlay = new THREE.ExtrudeGeometry(allInlayShapes, {
      depth: inlayDepth,
      bevelEnabled: false,
      curveSegments: 16,
    });
    fallbackInlay.rotateX(-Math.PI / 2);
    fallbackInlay.translate(0, H - inlayDepth, 0);
    finalInlayGeo = fallbackInlay;
  }

  const result: CapGeometryResult = {
    bodyGeometry: finalBodyGeo,
    inlayGeometry: finalInlayGeo,
    effectiveInnerDiameter: effectiveID,
    wallThickness,
    outerDiameter: OD,
    capHeight: H,
    topWallThickness: T,
    inlayDepth,
  };

  geometryCache.set(cacheKey, result);
  return result;
}

/**
 * Builds a blank button cap geometry (smooth-bore hollow cup with a completely flat, uncut top face).
 * Used when printing solid blank caps to apply printed vinyl stickers (Cricut) or UV printing.
 */
export function buildBlankCapGeometry(
  config: ButtonCapConfig
): CapGeometryResult {
  const {
    outerDiameter: OD,
    baseInnerDiameter: baseID,
    toleranceModifier,
    capHeight: H,
    topWallThickness: T,
    inlayDepth,
  } = config;

  const effectiveID = +(baseID + toleranceModifier).toFixed(2);
  const wallThickness = +((OD - effectiveID) / 2).toFixed(2);

  const Ro = OD / 2;
  const Ri = Math.min(Ro - 0.35, effectiveID / 2);
  const C = 0.25; // 0.25mm top outer chamfer
  const leadInChamfer = 0.15; // 0.15mm bottom inner lead-in chamfer

  const points: THREE.Vector2[] = [
    new THREE.Vector2(0.001, H),
    new THREE.Vector2(Ro - C, H),
    new THREE.Vector2(Ro, H - C),
    new THREE.Vector2(Ro, 0),
    new THREE.Vector2(Ri + leadInChamfer, 0),
    new THREE.Vector2(Ri, leadInChamfer),
    new THREE.Vector2(Ri, H - T),
    new THREE.Vector2(0.001, H - T),
  ];

  const bodyCupGeo = new THREE.LatheGeometry(points, 64);
  bodyCupGeo.computeVertexNormals();

  return {
    bodyGeometry: bodyCupGeo,
    inlayGeometry: null,
    effectiveInnerDiameter: effectiveID,
    wallThickness,
    outerDiameter: OD,
    capHeight: H,
    topWallThickness: T,
    inlayDepth,
  };
}

/**
 * Evaluates whether a cap's inscription has fine details (such as symbol + subtext, symbols, or 4-char text)
 * that are difficult to print cleanly with a standard 0.4mm multi-color FDM nozzle, recommending stickers or UV printing.
 */
export function getCapPrintabilityWarning(config: ButtonCapConfig): {
  warn: boolean;
  level: "high" | "medium" | "none";
  reason: string;
} {
  const cleanSub = (config.subtext || "").trim();
  const cleanText = (config.text || "").trim();

  if (config.inscriptionMode === "symbol" && cleanSub.length > 0) {
    return {
      warn: true,
      level: "high",
      reason:
        "Combining an icon and subtext on a small cap creates ultra-fine strokes (<0.38mm) that often blur on 0.4mm multi-color printers. Printing Blank Caps + Stickers (Cricut / UV) or using a 0.2mm nozzle is strongly recommended.",
    };
  }

  if (config.inscriptionMode === "symbol") {
    return {
      warn: true,
      level: "medium",
      reason:
        "Detailed motorsport icons can lose sharpness on standard 0.4mm nozzles. Consider exporting Blank Caps + Stickers (Cricut / UV) if your multi-color first layer blurs.",
    };
  }

  if (
    config.inscriptionMode === "text" &&
    (cleanText.length >= 4 || (config.fontScale || 1.0) < 0.85)
  ) {
    return {
      warn: true,
      level: "medium",
      reason:
        "4-letter labels have tight letter spacing on ~11mm caps. If multi-color FDM printing blurs the letters, use Blank Caps + Stickers (Cricut / UV) or a 0.2mm nozzle.",
    };
  }

  return { warn: false, level: "none", reason: "" };
}

