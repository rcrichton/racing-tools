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
 * Builds parametric 3D watertight geometries for the Cap Body and Dual-Color Inlay
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
    hasAccentRing,
    accentRingThickness = 0.55,
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
  const maxSafeDiameter = hasAccentRing
    ? Math.max(2.0, (Ro - C - 0.35 - accentRingThickness - 0.4) * 2)
    : Math.max(3.0, (Ro - C - 0.4) * 2);

  let inscriptionShapes: THREE.Shape[] = [];

  if (config.inscriptionMode === "text") {
    // Dynamic aspect ratio calculation based on character count
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
      config.fontScale
    );
  } else {
    inscriptionShapes = generateIconShapes(
      config.symbolId,
      maxSafeDiameter * 0.8,
      config.symbolScale
    );
  }

  // Add Outer Accent Ring if enabled
  const allInlayShapes: THREE.Shape[] = [...inscriptionShapes];

  if (hasAccentRing) {
    const ringOutRadius = Ro - C - 0.3;
    const ringInRadius = Math.max(0.5, ringOutRadius - accentRingThickness);

    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, ringOutRadius, 0, Math.PI * 2, false);

    const ringHole = new THREE.Path();
    ringHole.absarc(0, 0, ringInRadius, 0, Math.PI * 2, true);
    ringShape.holes.push(ringHole);

    allInlayShapes.push(ringShape);
  }

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
      // In Three.js, ExtrudeGeometry builds along +Z. Rotate so it aligns with Y.
      inlayGeo.rotateX(Math.PI / 2);
      inlayGeo.translate(0, H, 0); // Position exactly at Y = H down to Y = H - inlayDepth
      inlayGeo.computeVertexNormals();
      finalInlayGeo = inlayGeo;

      // Body Pocket Cutter: slightly extended upwards to ensure clean planar cut
      const cutterGeo = new THREE.ExtrudeGeometry(allInlayShapes, {
        depth: inlayDepth + 0.04,
        bevelEnabled: false,
        curveSegments: 20,
      });
      cutterGeo.rotateX(Math.PI / 2);
      cutterGeo.translate(0, H + 0.02, 0);

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
      inlayGeo.rotateX(Math.PI / 2);
      inlayGeo.translate(0, H + embossHeight, 0);
      inlayGeo.computeVertexNormals();
      finalInlayGeo = inlayGeo;
      finalBodyGeo = bodyCupGeo;
    } else if (reliefMode === "deboss") {
      // ENGRAVED DEBOSS:
      // Cavity cut into the top face of depth inlayDepth
      const cutterGeo = new THREE.ExtrudeGeometry(allInlayShapes, {
        depth: inlayDepth + 0.04,
        bevelEnabled: false,
        curveSegments: 20,
      });
      cutterGeo.rotateX(Math.PI / 2);
      cutterGeo.translate(0, H + 0.02, 0);

      const bodyBrush = new Brush(bodyCupGeo);
      bodyBrush.updateMatrixWorld();

      const cutterBrush = new Brush(cutterGeo);
      cutterBrush.updateMatrixWorld();

      const cutBody = evaluator.evaluate(bodyBrush, cutterBrush, SUBTRACTION);
      cutBody.geometry.computeVertexNormals();
      finalBodyGeo = cutBody.geometry;

      // Recessed thin accent inlay at bottom of deboss pocket (optional for visualization)
      const recessedInlay = new THREE.ExtrudeGeometry(allInlayShapes, {
        depth: 0.1,
        bevelEnabled: false,
        curveSegments: 20,
      });
      recessedInlay.rotateX(Math.PI / 2);
      recessedInlay.translate(0, H - inlayDepth + 0.1, 0);
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
    fallbackInlay.rotateX(Math.PI / 2);
    fallbackInlay.translate(0, H, 0);
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
