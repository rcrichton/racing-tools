import * as THREE from "three";

/**
 * Generate centered, scaled THREE.Shape[] for motorsport icons
 */
export function generateIconShapes(
  iconId: string,
  targetSize: number, // mm
  scaleMultiplier: number = 1.0
): THREE.Shape[] {
  const s = (targetSize / 100) * scaleMultiplier;
  const shapes: THREE.Shape[] = [];

  switch (iconId) {
    case "lightning": {
      // Bold motorsport hybrid/boost lightning bolt
      const shape = new THREE.Shape();
      const pts = [
        [6, 42],
        [-18, 2],
        [-2, 2],
        [-10, -42],
        [22, -2],
        [4, -2],
      ];
      shape.moveTo(pts[0][0] * s, pts[0][1] * s);
      for (let i = 1; i < pts.length; i++) {
        shape.lineTo(pts[i][0] * s, pts[i][1] * s);
      }
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "plus": {
      // Precision + icon
      const shape = new THREE.Shape();
      const arm = 36 * s;
      const th = 11 * s;
      shape.moveTo(-th, arm);
      shape.lineTo(th, arm);
      shape.lineTo(th, th);
      shape.lineTo(arm, th);
      shape.lineTo(arm, -th);
      shape.lineTo(th, -th);
      shape.lineTo(th, -arm);
      shape.lineTo(-th, -arm);
      shape.lineTo(-th, -th);
      shape.lineTo(-arm, -th);
      shape.lineTo(-arm, th);
      shape.lineTo(-th, th);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "minus": {
      // Precision - icon
      const shape = new THREE.Shape();
      const arm = 36 * s;
      const th = 11 * s;
      shape.moveTo(-arm, -th);
      shape.lineTo(arm, -th);
      shape.lineTo(arm, th);
      shape.lineTo(-arm, th);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "arrow-up": {
      const shape = new THREE.Shape();
      shape.moveTo(0, 38 * s);
      shape.lineTo(34 * s, 4 * s);
      shape.lineTo(13 * s, 4 * s);
      shape.lineTo(13 * s, -38 * s);
      shape.lineTo(-13 * s, -38 * s);
      shape.lineTo(-13 * s, 4 * s);
      shape.lineTo(-34 * s, 4 * s);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "arrow-down": {
      const shape = new THREE.Shape();
      shape.moveTo(0, -38 * s);
      shape.lineTo(-34 * s, -4 * s);
      shape.lineTo(-13 * s, -4 * s);
      shape.lineTo(-13 * s, 38 * s);
      shape.lineTo(13 * s, 38 * s);
      shape.lineTo(13 * s, -4 * s);
      shape.lineTo(34 * s, -4 * s);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "arrow-left": {
      const shape = new THREE.Shape();
      shape.moveTo(-38 * s, 0);
      shape.lineTo(-4 * s, -34 * s);
      shape.lineTo(-4 * s, -13 * s);
      shape.lineTo(38 * s, -13 * s);
      shape.lineTo(38 * s, 13 * s);
      shape.lineTo(-4 * s, 13 * s);
      shape.lineTo(-4 * s, 34 * s);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "arrow-right": {
      const shape = new THREE.Shape();
      shape.moveTo(38 * s, 0);
      shape.lineTo(4 * s, 34 * s);
      shape.lineTo(4 * s, 13 * s);
      shape.lineTo(-38 * s, 13 * s);
      shape.lineTo(-38 * s, -13 * s);
      shape.lineTo(4 * s, -13 * s);
      shape.lineTo(4 * s, -34 * s);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "pit": {
      // Pit speed limiter (speedometer ring + needle)
      const outerRing = new THREE.Shape();
      outerRing.absarc(0, 0, 36 * s, 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      hole.absarc(0, 0, 24 * s, 0, Math.PI * 2, true);
      outerRing.holes.push(hole);
      shapes.push(outerRing);

      // Center needle/exclamation
      const needle = new THREE.Shape();
      needle.moveTo(-5 * s, -10 * s);
      needle.lineTo(5 * s, -10 * s);
      needle.lineTo(3 * s, 26 * s);
      needle.lineTo(-3 * s, 26 * s);
      needle.closePath();
      shapes.push(needle);
      break;
    }

    case "headlights": {
      // Headlights main D-body
      const dBody = new THREE.Shape();
      dBody.moveTo(-18 * s, -26 * s);
      dBody.lineTo(4 * s, -26 * s);
      dBody.absarc(4 * s, 0, 26 * s, -Math.PI / 2, Math.PI / 2, false);
      dBody.lineTo(-18 * s, 26 * s);
      dBody.closePath();
      shapes.push(dBody);

      // Light beams
      for (const y of [-16, 0, 16]) {
        const beam = new THREE.Shape();
        beam.moveTo(14 * s, (y - 4) * s);
        beam.lineTo(38 * s, (y - 7) * s);
        beam.lineTo(38 * s, (y + 1) * s);
        beam.lineTo(14 * s, (y + 4) * s);
        beam.closePath();
        shapes.push(beam);
      }
      break;
    }

    case "wiper": {
      // Windshield wiper sweep arc + blade
      const blade = new THREE.Shape();
      blade.moveTo(-32 * s, 14 * s);
      blade.lineTo(28 * s, 28 * s);
      blade.lineTo(26 * s, 18 * s);
      blade.lineTo(-30 * s, 4 * s);
      blade.closePath();
      shapes.push(blade);

      const arm = new THREE.Shape();
      arm.moveTo(-6 * s, -32 * s);
      arm.lineTo(6 * s, -32 * s);
      arm.lineTo(2 * s, 20 * s);
      arm.lineTo(-2 * s, 20 * s);
      arm.closePath();
      shapes.push(arm);
      break;
    }

    case "rain": {
      // Rain / Wet light (Sun / Light with droplets)
      const center = new THREE.Shape();
      center.absarc(0, 8 * s, 16 * s, 0, Math.PI * 2, false);
      shapes.push(center);

      // 3 drops
      for (const x of [-20, 0, 20]) {
        const drop = new THREE.Shape();
        drop.moveTo(x * s, -14 * s);
        drop.lineTo((x + 5) * s, -30 * s);
        drop.lineTo((x - 5) * s, -30 * s);
        drop.closePath();
        shapes.push(drop);
      }
      break;
    }

    case "radio": {
      // Radio microphone silhouette
      const mic = new THREE.Shape();
      mic.absarc(0, 10 * s, 14 * s, 0, Math.PI, false);
      mic.lineTo(14 * s, -6 * s);
      mic.absarc(0, -6 * s, 14 * s, 0, Math.PI, true);
      mic.closePath();
      shapes.push(mic);

      const base = new THREE.Shape();
      base.moveTo(-16 * s, -30 * s);
      base.lineTo(16 * s, -30 * s);
      base.lineTo(16 * s, -22 * s);
      base.lineTo(-16 * s, -22 * s);
      base.closePath();
      shapes.push(base);

      const stem = new THREE.Shape();
      stem.moveTo(-4 * s, -22 * s);
      stem.lineTo(4 * s, -22 * s);
      stem.lineTo(4 * s, -10 * s);
      stem.lineTo(-4 * s, -10 * s);
      stem.closePath();
      shapes.push(stem);
      break;
    }

    case "flag": {
      // Chequered flag with pole
      const pole = new THREE.Shape();
      pole.moveTo(-32 * s, -38 * s);
      pole.lineTo(-24 * s, -38 * s);
      pole.lineTo(-24 * s, 38 * s);
      pole.lineTo(-32 * s, 38 * s);
      pole.closePath();
      shapes.push(pole);

      const banner = new THREE.Shape();
      banner.moveTo(-24 * s, 36 * s);
      banner.lineTo(34 * s, 30 * s);
      banner.lineTo(26 * s, -6 * s);
      banner.lineTo(-24 * s, 0);
      banner.closePath();
      shapes.push(banner);
      break;
    }

    case "hazard":
    default: {
      // Warning triangle with exclamation
      const tri = new THREE.Shape();
      tri.moveTo(0, 36 * s);
      tri.lineTo(34 * s, -26 * s);
      tri.lineTo(-34 * s, -26 * s);
      tri.closePath();
      // Triangle hole
      const innerTri = new THREE.Path();
      innerTri.moveTo(0, 18 * s);
      innerTri.lineTo(-18 * s, -18 * s);
      innerTri.lineTo(18 * s, -18 * s);
      innerTri.closePath();
      tri.holes.push(innerTri);
      shapes.push(tri);

      // Exclamation point
      const exTop = new THREE.Shape();
      exTop.moveTo(-3 * s, 12 * s);
      exTop.lineTo(3 * s, 12 * s);
      exTop.lineTo(2 * s, -4 * s);
      exTop.lineTo(-2 * s, -4 * s);
      exTop.closePath();
      shapes.push(exTop);

      const exDot = new THREE.Shape();
      exDot.absarc(0, -11 * s, 3 * s, 0, Math.PI * 2, false);
      shapes.push(exDot);
      break;
    }
  }

  return shapes;
}
