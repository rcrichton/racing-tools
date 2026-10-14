import * as THREE from "three";
import { SVGLoader } from "three-stdlib";
import { MOTORSPORT_ICONS } from "@/config/wheelPresets";

// Shape cache: key = `${iconId}_${targetSize.toFixed(3)}_${scaleMultiplier.toFixed(3)}`
const shapeCache = new Map<string, THREE.Shape[]>();

function transformPoint(
  p: THREE.Vector2,
  cx: number,
  cy: number,
  scale: number
): THREE.Vector2 {
  return new THREE.Vector2((p.x - cx) * scale, -(p.y - cy) * scale);
}

function transformPath<T extends THREE.Path>(
  path: T,
  cx: number,
  cy: number,
  scale: number
): T {
  const newPath = new (path.constructor as new () => T)();
  for (const curve of path.curves) {
    if (curve instanceof THREE.LineCurve) {
      newPath.curves.push(
        new THREE.LineCurve(
          transformPoint(curve.v1, cx, cy, scale),
          transformPoint(curve.v2, cx, cy, scale)
        )
      );
    } else if (curve instanceof THREE.QuadraticBezierCurve) {
      newPath.curves.push(
        new THREE.QuadraticBezierCurve(
          transformPoint(curve.v0, cx, cy, scale),
          transformPoint(curve.v1, cx, cy, scale),
          transformPoint(curve.v2, cx, cy, scale)
        )
      );
    } else if (curve instanceof THREE.CubicBezierCurve) {
      newPath.curves.push(
        new THREE.CubicBezierCurve(
          transformPoint(curve.v0, cx, cy, scale),
          transformPoint(curve.v1, cx, cy, scale),
          transformPoint(curve.v2, cx, cy, scale),
          transformPoint(curve.v3, cx, cy, scale)
        )
      );
    } else if (curve instanceof THREE.EllipseCurve) {
      const center = transformPoint(
        new THREE.Vector2(curve.aX, curve.aY),
        cx,
        cy,
        scale
      );
      newPath.curves.push(
        new THREE.EllipseCurve(
          center.x,
          center.y,
          curve.xRadius * scale,
          curve.yRadius * scale,
          -curve.aEndAngle,
          -curve.aStartAngle,
          !curve.aClockwise,
          -curve.aRotation
        )
      );
    }
  }
  return newPath;
}

function transformShape(
  shape: THREE.Shape,
  cx: number,
  cy: number,
  scale: number
): THREE.Shape {
  const newShape = transformPath(shape, cx, cy, scale);
  for (const hole of shape.holes) {
    newShape.holes.push(transformPath(hole, cx, cy, scale));
  }
  return newShape;
}

// Minimal DOMParser mock for SSR / Node execution
class SsrMockElement {
  nodeName: string;
  nodeType = 1;
  attributes: Record<string, string>;
  children: SsrMockElement[] = [];
  childNodes: SsrMockElement[] = [];

  constructor(tag: string, attrs: Record<string, string> = {}) {
    this.nodeName = tag;
    this.attributes = attrs;
  }
  getAttribute(name: string) {
    return this.attributes[name] || null;
  }
  hasAttribute(name: string) {
    return name in this.attributes;
  }
  querySelector() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
  getElementsByTagName() {
    return [];
  }
}

/**
 * Generates centered, scaled, watertight THREE.Shape[] for motorsport vector icons.
 * Extruded from proven, solid vector icon path standards (compatible with 0.4mm FDM slicers).
 */
export function generateIconShapes(
  iconId: string,
  targetSize: number, // mm
  scaleMultiplier: number = 1.0
): THREE.Shape[] {
  const cacheKey = `${iconId}_${targetSize.toFixed(3)}_${scaleMultiplier.toFixed(3)}`;
  if (shapeCache.has(cacheKey)) {
    return shapeCache.get(cacheKey)!;
  }

  const iconDef =
    MOTORSPORT_ICONS.find((i) => i.id === iconId) || MOTORSPORT_ICONS[0];
  if (!iconDef) return [];

  // Ensure DOMParser is available (mock for SSR if necessary)
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    (globalThis as any).DOMParser = class {
      parseFromString(text: string) {
        const doc = new SsrMockElement("document");
        const dMatch = text.match(/d="([^"]+)"/);
        const vbMatch = text.match(/viewBox="([^"]+)"/);
        const svg = new SsrMockElement("svg", {
          viewBox: vbMatch ? vbMatch[1] : "0 0 512 512",
        });
        const path = new SsrMockElement("path", {
          d: dMatch ? dMatch[1] : "",
        });
        svg.children = [path];
        svg.childNodes = [path];
        (doc as any).documentElement = svg;
        return doc;
      }
    };
  }

  try {
    const loader = new SVGLoader();
    const viewBox = iconDef.viewBox || "0 0 512 512";
    const svgStr = `<svg viewBox="${viewBox}"><path d="${iconDef.path}" /></svg>`;
    const svgData = loader.parse(svgStr);

    const rawShapes: THREE.Shape[] = svgData.paths.flatMap((p) =>
      SVGLoader.createShapes(p as any)
    );

    if (rawShapes.length === 0) {
      return [];
    }

    // 1. Calculate combined bounding box across all shapes and inner holes
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const shape of rawShapes) {
      const pts = shape.getPoints(24);
      for (const pt of pts) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }
      for (const hole of shape.holes) {
        const holePts = hole.getPoints(24);
        for (const pt of holePts) {
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        }
      }
    }

    const w = maxX - minX;
    const h = maxY - minY;
    if (w <= 0 || h <= 0) return [];

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const maxDim = Math.max(w, h);
    const scale = (targetSize / maxDim) * scaleMultiplier;

    // 2. Transform into centered, Y-inverted Three.js shapes
    const transformedShapes: THREE.Shape[] = rawShapes.map((shape) =>
      transformShape(shape, cx, cy, scale)
    );

    shapeCache.set(cacheKey, transformedShapes);
    return transformedShapes;
  } catch (err) {
    console.error("Failed to generate icon shapes for", iconId, err);
    return [];
  }
}
