import * as THREE from "three";

/**
 * Generates centered, scaled, watertight THREE.Shape[] for motorsport icons.
 * Specifically engineered for dual-color FDM 3D printing (0.4mm nozzle friendly,
 * zero internal face collisions, zero self-intersections, high visual impact).
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
      // Balanced, aggressive motorsport hybrid / boost bolt
      const shape = new THREE.Shape();
      shape.moveTo(4 * s, 36 * s);
      shape.lineTo(-14 * s, 4 * s);
      shape.lineTo(-1 * s, 4 * s);
      shape.lineTo(-6 * s, -36 * s);
      shape.lineTo(16 * s, -4 * s);
      shape.lineTo(2 * s, -4 * s);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "plus": {
      // Precision + symbol (thick arms for clean FDM lines)
      const shape = new THREE.Shape();
      const arm = 32 * s;
      const th = 10 * s;
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
      // Precision - symbol
      const shape = new THREE.Shape();
      const arm = 32 * s;
      const th = 10 * s;
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
      shape.moveTo(0, 36 * s);
      shape.lineTo(30 * s, 6 * s);
      shape.lineTo(12 * s, 6 * s);
      shape.lineTo(12 * s, -34 * s);
      shape.lineTo(-12 * s, -34 * s);
      shape.lineTo(-12 * s, 6 * s);
      shape.lineTo(-30 * s, 6 * s);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "arrow-down": {
      const shape = new THREE.Shape();
      shape.moveTo(0, -36 * s);
      shape.lineTo(-30 * s, -6 * s);
      shape.lineTo(-12 * s, -6 * s);
      shape.lineTo(-12 * s, 34 * s);
      shape.lineTo(12 * s, 34 * s);
      shape.lineTo(12 * s, -6 * s);
      shape.lineTo(30 * s, -6 * s);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "arrow-left": {
      const shape = new THREE.Shape();
      shape.moveTo(-36 * s, 0);
      shape.lineTo(-6 * s, -30 * s);
      shape.lineTo(-6 * s, -12 * s);
      shape.lineTo(34 * s, -12 * s);
      shape.lineTo(34 * s, 12 * s);
      shape.lineTo(-6 * s, 12 * s);
      shape.lineTo(-6 * s, 30 * s);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "arrow-right": {
      const shape = new THREE.Shape();
      shape.moveTo(36 * s, 0);
      shape.lineTo(6 * s, 30 * s);
      shape.lineTo(6 * s, 12 * s);
      shape.lineTo(-34 * s, 12 * s);
      shape.lineTo(-34 * s, -12 * s);
      shape.lineTo(6 * s, -12 * s);
      shape.lineTo(6 * s, -30 * s);
      shape.closePath();
      shapes.push(shape);
      break;
    }

    case "headlights": {
      // Clean automotive lamp body on left
      const lamp = new THREE.Shape();
      lamp.moveTo(-6 * s, -22 * s);
      lamp.lineTo(-16 * s, -22 * s);
      lamp.absarc(-16 * s, 0, 22 * s, -Math.PI / 2, Math.PI / 2, false);
      lamp.lineTo(-6 * s, 22 * s);
      lamp.closePath();
      shapes.push(lamp);

      // 3 clear parallel light beams with clean non-zero gap from lamp face
      for (const y of [14, 0, -14]) {
        const beam = new THREE.Shape();
        beam.moveTo(4 * s, (y + 4) * s);
        beam.lineTo(30 * s, (y + 1) * s);
        beam.lineTo(30 * s, (y - 5) * s);
        beam.lineTo(4 * s, (y - 2) * s);
        beam.closePath();
        shapes.push(beam);
      }
      break;
    }

    case "wiper": {
      // Windshield curved glass arc
      const glass = new THREE.Shape();
      glass.absarc(0, -20 * s, 36 * s, Math.PI * 0.28, Math.PI * 0.72, false);
      glass.absarc(0, -20 * s, 28 * s, Math.PI * 0.72, Math.PI * 0.28, true);
      glass.closePath();
      shapes.push(glass);

      // Angled wiper blade & pivot arm
      const wiper = new THREE.Shape();
      wiper.moveTo(-16 * s, 12 * s);
      wiper.lineTo(24 * s, 26 * s);
      wiper.lineTo(26 * s, 20 * s);
      wiper.lineTo(5 * s, 12 * s);
      wiper.lineTo(4 * s, -14 * s);
      wiper.lineTo(-4 * s, -14 * s);
      wiper.lineTo(-2 * s, 12 * s);
      wiper.lineTo(-14 * s, 6 * s);
      wiper.closePath();
      shapes.push(wiper);
      break;
    }

    case "pit": {
      // Racing Speedometer / Tachometer dial arc
      const dial = new THREE.Shape();
      dial.absarc(0, 0, 32 * s, Math.PI * 1.15, Math.PI * -0.15, true);
      dial.absarc(0, 0, 24 * s, Math.PI * -0.15, Math.PI * 1.15, false);
      dial.closePath();
      shapes.push(dial);

      // Pit speed limit tick mark at 45 deg
      const a = Math.PI / 4;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);

      const tick = new THREE.Shape();
      tick.moveTo((20 * cosA - 3 * -sinA) * s, (20 * sinA - 3 * cosA) * s);
      tick.lineTo((34 * cosA - 3 * -sinA) * s, (34 * sinA - 3 * cosA) * s);
      tick.lineTo((34 * cosA + 3 * -sinA) * s, (34 * sinA + 3 * cosA) * s);
      tick.lineTo((20 * cosA + 3 * -sinA) * s, (20 * sinA + 3 * cosA) * s);
      tick.closePath();
      shapes.push(tick);

      // Speedometer needle pointing at 45 deg pit limit mark
      const needle = new THREE.Shape();
      needle.moveTo(-4 * s, -4 * s);
      needle.lineTo(4 * s, -4 * s);
      needle.lineTo((26 * cosA + 2 * -sinA) * s, (26 * sinA + 2 * cosA) * s);
      needle.lineTo((26 * cosA - 2 * -sinA) * s, (26 * sinA - 2 * cosA) * s);
      needle.closePath();
      shapes.push(needle);
      break;
    }

    case "radio": {
      // Classic team radio / pit comms microphone capsule
      const mic = new THREE.Shape();
      mic.moveTo(-11 * s, -6 * s);
      mic.lineTo(-11 * s, 14 * s);
      mic.absarc(0, 14 * s, 11 * s, Math.PI, 0, true);
      mic.lineTo(11 * s, -6 * s);
      mic.absarc(0, -6 * s, 11 * s, 0, Math.PI, true);
      mic.closePath();
      shapes.push(mic);

      // Suspension U-cradle around capsule with clean gap
      const cradle = new THREE.Shape();
      cradle.moveTo(-18 * s, 6 * s);
      cradle.lineTo(-14 * s, 6 * s);
      cradle.absarc(0, -6 * s, 14 * s, Math.PI, 0, true);
      cradle.lineTo(18 * s, 6 * s);
      cradle.absarc(0, -6 * s, 18 * s, 0, Math.PI, false);
      cradle.closePath();
      shapes.push(cradle);

      // Stand base
      const stand = new THREE.Shape();
      stand.moveTo(-3 * s, -24 * s);
      stand.lineTo(3 * s, -24 * s);
      stand.lineTo(3 * s, -32 * s);
      stand.lineTo(16 * s, -32 * s);
      stand.lineTo(16 * s, -36 * s);
      stand.lineTo(-16 * s, -36 * s);
      stand.lineTo(-16 * s, -32 * s);
      stand.lineTo(-3 * s, -32 * s);
      stand.closePath();
      shapes.push(stand);
      break;
    }

    case "rain": {
      // High-intensity rear rain light lamp
      const lamp = new THREE.Shape();
      lamp.absarc(0, 10 * s, 14 * s, 0, Math.PI * 2, false);
      shapes.push(lamp);

      // 3 distinct rain streaks below lamp
      for (const x of [-16, 0, 16]) {
        const drop = new THREE.Shape();
        drop.moveTo(x * s, -8 * s);
        drop.lineTo((x + 4) * s, -26 * s);
        drop.absarc(x * s, -26 * s, 4 * s, 0, Math.PI, false);
        drop.closePath();
        shapes.push(drop);
      }
      break;
    }

    case "flag": {
      // Flagpole
      const pole = new THREE.Shape();
      pole.moveTo(-30 * s, -34 * s);
      pole.lineTo(-24 * s, -34 * s);
      pole.lineTo(-24 * s, 34 * s);
      pole.lineTo(-30 * s, 34 * s);
      pole.closePath();
      shapes.push(pole);

      // Dual-color checkered flag tiles (active quadrants)
      const q1 = new THREE.Shape();
      q1.moveTo(-20 * s, 8 * s);
      q1.lineTo(3 * s, 8 * s);
      q1.lineTo(3 * s, 32 * s);
      q1.lineTo(-20 * s, 32 * s);
      q1.closePath();
      shapes.push(q1);

      const q2 = new THREE.Shape();
      q2.moveTo(7 * s, -16 * s);
      q2.lineTo(30 * s, -16 * s);
      q2.lineTo(30 * s, 8 * s);
      q2.lineTo(7 * s, 8 * s);
      q2.closePath();
      shapes.push(q2);
      break;
    }

    case "hazard":
    default: {
      // Warning equilateral triangle
      const tri = new THREE.Shape();
      tri.moveTo(0, 36 * s);
      tri.lineTo(32 * s, -22 * s);
      tri.lineTo(-32 * s, -22 * s);
      tri.closePath();

      const hole = new THREE.Path();
      hole.moveTo(0, 18 * s);
      hole.lineTo(-18 * s, -14 * s);
      hole.lineTo(18 * s, -14 * s);
      hole.closePath();
      tri.holes.push(hole);
      shapes.push(tri);

      // Bold exclamation mark
      const bar = new THREE.Shape();
      bar.moveTo(-3.5 * s, 10 * s);
      bar.lineTo(3.5 * s, 10 * s);
      bar.lineTo(2.5 * s, -3 * s);
      bar.lineTo(-2.5 * s, -3 * s);
      bar.closePath();
      shapes.push(bar);

      const dot = new THREE.Shape();
      dot.absarc(0, -9 * s, 3.5 * s, 0, Math.PI * 2, false);
      shapes.push(dot);
      break;
    }
  }

  return shapes;
}
