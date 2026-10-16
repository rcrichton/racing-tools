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

  // Safe inner diameter on top face
  const maxSafeDiameter = hasAccentRing
    ? Math.max(2.0, (Ro - C - 0.35 - accentRingThickness - 0.4) * 2)
    : Math.max(3.0, (Ro - C - 0.4) * 2);

  let inscriptionShapes: THREE.Shape[] = [];

  if (config.inscriptionMode === "text") {
    const charLen = Math.max(1, (config.text || "").trim().length);
    let targetWidth = maxSafeDiameter * 0.85;
    let targetHeight = maxSafeDiameter * 0.75;

    if (charLen === 1) {
      targetWidth = maxSafeDiameter * 0.7;
      targetHeight = maxSafeDiameter * 0.7;
    } else if (charLen === 2) {
      targetWidth = maxSafeDiameter * 0.82;
      targetHeight = maxSafeDiameter * 0.72;
    } else if (charLen >= 4) {
      targetWidth = maxSafeDiameter * 0.92;
      targetHeight = maxSafeDiameter * 0.65;
    }

    inscriptionShapes = await generateTextShapes(
      config.text,
      config.fontFamily,
      targetWidth,
      targetHeight,
      config.letterSpacing,
      config.fontScale,
      0
    );
  } else {
    const cleanSubtext = (config.subtext || "").trim().toUpperCase();
    if (cleanSubtext.length > 0) {
      const iconShapes = generateIconShapes(
        config.symbolId,
        maxSafeDiameter * 0.5,
        config.symbolScale,
        maxSafeDiameter * 0.14
      );
      const subtextShapes = await generateTextShapes(
        cleanSubtext,
        config.fontFamily,
        maxSafeDiameter * 0.64,
        maxSafeDiameter * 0.19,
        config.letterSpacing,
        1.0,
        -maxSafeDiameter * 0.25
      );
      inscriptionShapes = [...iconShapes, ...subtextShapes];
    } else {
      inscriptionShapes = generateIconShapes(
        config.symbolId,
        maxSafeDiameter * 0.72,
        config.symbolScale,
        0
      );
    }
  }

  const allShapes: THREE.Shape[] = [...inscriptionShapes];

  // Optional concentric outer accent ring
  if (hasAccentRing) {
    const ringOutRadius = Ro - C - 0.3;
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
