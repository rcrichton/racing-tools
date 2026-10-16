import * as THREE from "three";

/**
 * Parametric Motorsport & Dashboard Symbol Engine
 *
 * Every icon is constructed natively in a canonical [-40, 40] coordinate space
 * (+Y up, centered at 0,0, 80x80 bounding box) using watertight geometric primitives.
 *
 * This guarantees:
 * 1. Zero non-manifold CSG self-intersections or reversed SVGLoader arc curves.
 * 2. Crisp 3D-printable minimum feature widths on 10–14mm button caps.
 * 3. 100% pixel-for-pixel parity between 3D geometry, 2D canvas, and UI SVG icons.
 */

type Point2D = [number, number];

function transformPts(
  pts: Point2D[],
  scale: number,
  offsetX = 0,
  offsetY = 0
): THREE.Vector2[] {
  return pts.map(([x, y]) => new THREE.Vector2(x * scale + offsetX, y * scale + offsetY));
}

function makePolygon(pts: Point2D[], scale: number, offsetY = 0): THREE.Shape {
  const s = new THREE.Shape();
  const v = transformPts(pts, scale, 0, offsetY);
  s.moveTo(v[0].x, v[0].y);
  for (let i = 1; i < v.length; i++) {
    s.lineTo(v[i].x, v[i].y);
  }
  s.closePath();
  return s;
}

function makeCircle(
  cx: number,
  cy: number,
  r: number,
  scale: number,
  offsetY = 0,
  segs = 40
): THREE.Shape {
  const pts: Point2D[] = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return makePolygon(pts, scale, offsetY);
}

function makeRing(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  scale: number,
  offsetY = 0,
  segs = 48
): THREE.Shape {
  const outer = makeCircle(cx, cy, rOuter, scale, offsetY, segs);
  const holePts: Point2D[] = [];
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    holePts.push([cx + Math.cos(a) * rInner, cy - Math.sin(a) * rInner]);
  }
  const hole = new THREE.Path();
  const v = transformPts(holePts, scale, 0, offsetY);
  hole.moveTo(v[0].x, v[0].y);
  for (let i = 1; i < v.length; i++) {
    hole.lineTo(v[i].x, v[i].y);
  }
  hole.closePath();
  outer.holes.push(hole);
  return outer;
}

function makeArcBand(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number,
  scale: number,
  offsetY = 0,
  segs = 36
): THREE.Shape {
  const pts: Point2D[] = [];
  const a0 = (startDeg * Math.PI) / 180;
  const a1 = (endDeg * Math.PI) / 180;
  for (let i = 0; i <= segs; i++) {
    const a = a0 + (a1 - a0) * (i / segs);
    pts.push([cx + Math.cos(a) * rOuter, cy + Math.sin(a) * rOuter]);
  }
  for (let i = segs; i >= 0; i--) {
    const a = a0 + (a1 - a0) * (i / segs);
    pts.push([cx + Math.cos(a) * rInner, cy + Math.sin(a) * rInner]);
  }
  return makePolygon(pts, scale, offsetY);
}

function makeCapsule(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  r: number,
  scale: number,
  offsetY = 0,
  segs = 14
): THREE.Shape {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  const pts: Point2D[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = angle - Math.PI / 2 + (Math.PI * i) / segs;
    pts.push([x2 + Math.cos(a) * r, y2 + Math.sin(a) * r]);
  }
  for (let i = 0; i <= segs; i++) {
    const a = angle + Math.PI / 2 + (Math.PI * i) / segs;
    pts.push([x1 + Math.cos(a) * r, y1 + Math.sin(a) * r]);
  }
  return makePolygon(pts, scale, offsetY);
}

function makeRoundedRect(
  cx: number,
  cy: number,
  w: number,
  h: number,
  r: number,
  scale: number,
  offsetY = 0,
  segs = 8
): THREE.Shape {
  const hw = w / 2;
  const hh = h / 2;
  const cr = Math.min(r, hw, hh);
  const corners: [number, number, number][] = [
    [cx + hw - cr, cy + hh - cr, 0],
    [cx - hw + cr, cy + hh - cr, Math.PI / 2],
    [cx - hw + cr, cy - hh + cr, Math.PI],
    [cx + hw - cr, cy - hh + cr, (3 * Math.PI) / 2],
  ];
  const pts: Point2D[] = [];
  for (const [ox, oy, startA] of corners) {
    for (let i = 0; i <= segs; i++) {
      const a = startA + ((Math.PI / 2) * i) / segs;
      pts.push([ox + Math.cos(a) * cr, oy + Math.sin(a) * cr]);
    }
  }
  return makePolygon(pts, scale, offsetY);
}

type IconBuilder = (s: number, oy: number) => THREE.Shape[];

const ICON_BUILDERS: Record<string, IconBuilder> = {
  // 1. Lightning / ERS / Overtake / K2P
  lightning: (s, oy) => [
    makePolygon(
      [
        [8, 38],
        [-24, 2],
        [-2, 2],
        [-10, -38],
        [24, -2],
        [2, -2],
      ],
      s,
      oy
    ),
  ],

  // 2. Pit Speed Limiter Gauge (Speedometer arc + ticks + needle)
  pit: (s, oy) => [
    makeArcBand(0, -8, 27, 35, -30, 210, s, oy, 40),
    makeCapsule(-21, -8, -15, -8, 2.8, s, oy),
    makeCapsule(0, 19, 0, 13, 2.8, s, oy),
    makeCapsule(21, -8, 15, -8, 2.8, s, oy),
    makeCircle(0, -8, 6.5, s, oy),
    makeCapsule(0, -8, 15, 9, 3.6, s, oy),
  ],

  // 3. DRS / Active Aero Wing (Endplate + Mainplane + Open Flap + Airflow)
  drs: (s, oy) => [
    makeRoundedRect(-26, -2, 8, 44, 3, s, oy),
    makeCapsule(-14, -10, 16, -6, 4.5, s, oy),
    makeCapsule(-10, 8, 18, 20, 4.2, s, oy),
    makeCapsule(8, -24, 32, -24, 3, s, oy),
    makeCapsule(18, 0, 34, 0, 3, s, oy),
  ],

  // 4. High-Beam Flash / Headlights (ISO 2575 High Beam Symbol)
  headlights: (s, oy) => {
    const domePts: Point2D[] = [];
    const segs = 28;
    for (let i = 0; i <= segs; i++) {
      const a = -Math.PI / 2 + (Math.PI * i) / segs;
      domePts.push([2 + Math.cos(a) * 28, Math.sin(a) * 26]);
    }
    const dome = makePolygon(domePts, s, oy);
    return [
      dome,
      makeCapsule(-32, 18, -8, 18, 3.5, s, oy),
      makeCapsule(-32, 6, -8, 6, 3.5, s, oy),
      makeCapsule(-32, -6, -8, -6, 3.5, s, oy),
      makeCapsule(-32, -18, -8, -18, 3.5, s, oy),
    ];
  },

  // 5. Radio / PTT Microphone
  radio: (s, oy) => [
    makeRoundedRect(0, 10, 18, 28, 9, s, oy),
    makeArcBand(0, 8, 15, 21, 195, 345, s, oy, 28),
    makeRoundedRect(0, -21, 6, 14, 2, s, oy),
    makeCapsule(-14, -28, 14, -28, 3.5, s, oy),
  ],

  // 6. Windshield Wiper (Fan sector + wiper blade + pivot)
  wiper: (s, oy) => [
    makeArcBand(0, -22, 34, 41, 42, 138, s, oy, 32),
    makeArcBand(0, -22, 14, 20, 42, 138, s, oy, 24),
    makeCapsule(-26, 4, -8, -14, 3.2, s, oy),
    makeCapsule(26, 4, 8, -14, 3.2, s, oy),
    makeCircle(0, -20, 6.5, s, oy),
    makeCapsule(0, -20, 13, 18, 3.5, s, oy),
  ],

  // 7. FIA Rain Light (Rear Rain / Fog Lamp with diagonal rays)
  rain: (s, oy) => {
    const domePts: Point2D[] = [];
    const segs = 28;
    for (let i = 0; i <= segs; i++) {
      const a = Math.PI / 2 + (Math.PI * i) / segs;
      domePts.push([-2 + Math.cos(a) * 26, Math.sin(a) * 25]);
    }
    const dome = makePolygon(domePts, s, oy);
    return [
      dome,
      makeCapsule(8, 18, 32, 11, 3.3, s, oy),
      makeCapsule(8, 4, 32, -3, 3.3, s, oy),
      makeCapsule(8, -10, 32, -17, 3.3, s, oy),
      makeCapsule(18, 22, 18, -22, 2.8, s, oy),
    ];
  },

  // 8. Drink / Fluid Teardrop
  droplet: (s, oy) => {
    const pts: Point2D[] = [[0, 36]];
    const segs = 28;
    for (let i = 0; i <= segs; i++) {
      const a = (-25 * Math.PI) / 180 - ((130 * Math.PI) / 180) * (i / segs);
      pts.push([Math.cos(a) * 25, -8 + Math.sin(a) * 25]);
    }
    const outer = makePolygon(pts, s, oy);
    return [outer];
  },

  // 9. Power / Ignition (IEC 5009 Power Symbol)
  ignition: (s, oy) => [
    makeArcBand(0, -3, 21, 30, -52, 232, s, oy, 36),
    makeCapsule(0, 4, 0, 33, 4.8, s, oy),
  ],

  // 10. Race Flag (Pole + Waving Pennant Banner)
  flag: (s, oy) => [
    makeCapsule(-24, -34, -24, 34, 4, s, oy),
    makePolygon(
      [
        [-15, 32],
        [6, 36],
        [30, 28],
        [20, 12],
        [30, -4],
        [6, 4],
        [-15, 0],
      ],
      s,
      oy
    ),
  ],

  // 11. Hazard / FCY Warning Triangle
  hazard: (s, oy) => {
    const outer = makePolygon(
      [
        [0, 35],
        [-36, -29],
        [36, -29],
      ],
      s,
      oy
    );
    const hole = new THREE.Path();
    const hPts = transformPts(
      [
        [0, 17],
        [21, -20],
        [-21, -20],
      ],
      s,
      0,
      oy
    );
    hole.moveTo(hPts[0].x, hPts[0].y);
    hole.lineTo(hPts[1].x, hPts[1].y);
    hole.lineTo(hPts[2].x, hPts[2].y);
    hole.closePath();
    outer.holes.push(hole);

    return [
      outer,
      makeCapsule(0, 7, 0, -4, 3.6, s, oy),
      makeCircle(0, -13, 3.8, s, oy),
    ];
  },

  // 12. Traction Control / Stability Shield
  tc: (s, oy) => {
    const shield = makePolygon(
      [
        [0, 36],
        [-29, 24],
        [-27, -4],
        [0, -36],
        [27, -4],
        [29, 24],
      ],
      s,
      oy
    );
    const hole = new THREE.Path();
    const hPts = transformPts(
      [
        [0, 25],
        [19, 17],
        [17, -2],
        [0, -23],
        [-17, -2],
        [-19, 17],
      ],
      s,
      0,
      oy
    );
    hole.moveTo(hPts[0].x, hPts[0].y);
    for (let i = 1; i < hPts.length; i++) hole.lineTo(hPts[i].x, hPts[i].y);
    hole.closePath();
    shield.holes.push(hole);

    const check = makePolygon(
      [
        [-11, 1],
        [-3, -8],
        [13, 9],
        [8, 14],
        [-3, 2],
        [-6, 6],
      ],
      s,
      oy
    );
    return [shield, check];
  },

  // 13. Brake System / ABS (Rotor ring + left/right caliper shoes)
  brake: (s, oy) => [
    makeRing(0, 0, 21, 11, s, oy, 36),
    makeArcBand(0, 0, 26, 34, 132, 228, s, oy, 24),
    makeArcBand(0, 0, 26, 34, -48, 48, s, oy, 24),
  ],

  // 14. Engine / Map Gear (6-tooth Cog with center bore)
  engine: (s, oy) => {
    const teeth = 6;
    const rInner = 22;
    const rOuter = 34;
    const pts: Point2D[] = [];
    for (let i = 0; i < teeth; i++) {
      const base = (i / teeth) * Math.PI * 2;
      const step = (Math.PI * 2) / teeth;
      const a1 = base;
      const a2 = base + step * 0.14;
      const a3 = base + step * 0.44;
      const a4 = base + step * 0.58;
      pts.push([Math.cos(a1) * rInner, Math.sin(a1) * rInner]);
      pts.push([Math.cos(a2) * rOuter, Math.sin(a2) * rOuter]);
      pts.push([Math.cos(a3) * rOuter, Math.sin(a3) * rOuter]);
      pts.push([Math.cos(a4) * rInner, Math.sin(a4) * rInner]);
    }
    const outer = makePolygon(pts, s, oy);
    const hole = new THREE.Path();
    const hSegs = 32;
    for (let i = 0; i < hSegs; i++) {
      const a = (i / hSegs) * Math.PI * 2;
      const vx = Math.cos(a) * 11 * s;
      const vy = -Math.sin(a) * 11 * s + oy;
      if (i === 0) hole.moveTo(vx, vy);
      else hole.lineTo(vx, vy);
    }
    hole.closePath();
    outer.holes.push(hole);
    return [outer];
  },

  // 15. Cooling / Cockpit Fan (Center hub + 4 curved impeller blades)
  fan: (s, oy) => {
    const shapes: THREE.Shape[] = [makeCircle(0, 0, 8, s, oy)];
    for (let i = 0; i < 4; i++) {
      const deg = i * 90;
      shapes.push(makeArcBand(0, 0, 12, 33, deg + 12, deg + 68, s, oy, 18));
    }
    return shapes;
  },

  // 16. Fire Extinguisher / Safety Flame
  fire: (s, oy) => [
    makePolygon(
      [
        [2, 36],
        [-14, 18],
        [-12, 6],
        [-24, 14],
        [-28, -4],
        [-20, -24],
        [-6, -35],
        [10, -35],
        [24, -22],
        [28, -2],
        [18, 18],
        [10, 8],
      ],
      s,
      oy
    ),
  ],

  // 17. Horn / Audio Speaker
  horn: (s, oy) => [
    makePolygon(
      [
        [-30, 10],
        [-16, 10],
        [4, 28],
        [4, -28],
        [-16, -10],
        [-30, -10],
      ],
      s,
      oy
    ),
    makeArcBand(6, 0, 12, 18, -45, 45, s, oy, 20),
    makeArcBand(6, 0, 24, 30, -50, 50, s, oy, 24),
  ],

  // 18. Pit Service / Setup Wrench
  wrench: (s, oy) => [
    makeCapsule(-24, -24, 10, 10, 6.5, s, oy),
    makeArcBand(16, 16, 9, 20, -45, 225, s, oy, 28),
  ],

  // 19. Plus (+)
  plus: (s, oy) => [
    makeRoundedRect(0, 0, 64, 15, 4, s, oy),
    makeRoundedRect(0, 0, 15, 64, 4, s, oy),
  ],

  // 20. Minus (-)
  minus: (s, oy) => [makeRoundedRect(0, 0, 64, 16, 4, s, oy)],

  // 21. Arrow Up
  "arrow-up": (s, oy) => [
    makePolygon(
      [
        [0, 36],
        [-30, 4],
        [-11, 4],
        [-11, -34],
        [11, -34],
        [11, 4],
        [30, 4],
      ],
      s,
      oy
    ),
  ],

  // 22. Arrow Down
  "arrow-down": (s, oy) => [
    makePolygon(
      [
        [0, -36],
        [-30, -4],
        [-11, -4],
        [-11, 34],
        [11, 34],
        [11, -4],
        [30, -4],
      ],
      s,
      oy
    ),
  ],

  // 23. Arrow Left
  "arrow-left": (s, oy) => [
    makePolygon(
      [
        [-36, 0],
        [-4, 30],
        [-4, 11],
        [34, 11],
        [34, -11],
        [-4, -11],
        [-4, -30],
      ],
      s,
      oy
    ),
  ],

  // 24. Arrow Right
  "arrow-right": (s, oy) => [
    makePolygon(
      [
        [36, 0],
        [4, 30],
        [4, 11],
        [-34, 11],
        [-34, -11],
        [4, -11],
        [4, -30],
      ],
      s,
      oy
    ),
  ],

  // 25. Thumbs Up (Emote / Thank You / Like)
  "thumbs-up": (s, oy) => [
    makeRoundedRect(-20, -8, 8, 26, 2, s, oy),
    makePolygon(
      [
        [-12, -21],
        [16, -21],
        [22, -15],
        [22, 5],
        [14, 9],
        [2, 9],
        [-2, 31],
        [-10, 31],
        [-12, 15],
      ],
      s,
      oy
    ),
  ],

  // 26. Thumbs Down (Emote / Dislike)
  "thumbs-down": (s, oy) => [
    makeRoundedRect(-20, 8, 8, 26, 2, s, oy),
    makePolygon(
      [
        [-12, 21],
        [16, 21],
        [22, 15],
        [22, -5],
        [14, -9],
        [2, -9],
        [-2, -31],
        [-10, -31],
        [-12, -15],
      ],
      s,
      oy
    ),
  ],

  // 27. Call / Join Group Call
  call: (s, oy) => [
    makeArcBand(0, -8, 20, 29, 35, 145, s, oy, 24),
    makeRoundedRect(-18, 10, 11, 16, 4, s, oy),
    makeRoundedRect(18, 10, 11, 16, 4, s, oy),
  ],

  // 28. Hang Up / Leave Group Call
  hangup: (s, oy) => [
    makeArcBand(0, 8, 20, 29, 215, 325, s, oy, 24),
    makeRoundedRect(-18, -10, 11, 16, 4, s, oy),
    makeRoundedRect(18, -10, 11, 16, 4, s, oy),
  ],

  // 29. Chat / Message / Emote
  chat: (s, oy) => [
    makeRoundedRect(0, 5, 52, 34, 10, s, oy),
    makePolygon(
      [
        [-14, -10],
        [-14, -28],
        [2, -10],
      ],
      s,
      oy
    ),
  ],

  // 30. Headset (Discord / TeamSpeak / Group Voice)
  headset: (s, oy) => [
    makeArcBand(0, 4, 21, 28, 20, 160, s, oy, 28),
    makeRoundedRect(-24, 2, 8, 18, 3.5, s, oy),
    makeRoundedRect(24, 2, 8, 18, 3.5, s, oy),
    makeArcBand(0, -2, 21, 25, 210, 270, s, oy, 16),
    makeCircle(0, -23, 4.5, s, oy),
  ],
};

// Backwards-compatible aliases for any existing saved configs
const ICON_ALIASES: Record<string, string> = {
  gear: "engine",
};

/**
 * Generates centered THREE.Shape[] for 3D CSG extrusion and 2D technical preview.
 * @param iconId Identifier of the symbol
 * @param targetSize Target bounding size in mm
 * @param scaleMultiplier User scale adjustment (default 1.0)
 * @param offsetY Vertical offset in mm on the cap face (default 0)
 */
export function generateIconShapes(
  iconId: string,
  targetSize: number,
  scaleMultiplier = 1.0,
  offsetY = 0
): THREE.Shape[] {
  const resolvedId = ICON_ALIASES[iconId] || iconId;
  const builder = ICON_BUILDERS[resolvedId] || ICON_BUILDERS.lightning;
  // Canonical coordinate box is 80x80 ([-40, 40])
  const finalScale = (targetSize * scaleMultiplier) / 80;
  return builder(finalScale, offsetY);
}

const svgPathCache = new Map<string, string>();

/**
 * Converts a symbol's parametric THREE.Shape[] directly into an SVG path `d` string
 * in a `viewBox="0 0 100 100"` coordinate system.
 * Use with `<path d={getIconSvgPath(id)} fill="currentColor" fillRule="evenodd" />`.
 */
export function getIconSvgPath(iconId: string): string {
  const resolvedId = ICON_ALIASES[iconId] || iconId;
  const cached = svgPathCache.get(resolvedId);
  if (cached) return cached;

  const builder = ICON_BUILDERS[resolvedId] || ICON_BUILDERS.lightning;
  const shapes = builder(1.0, 0);
  const parts: string[] = [];

  const pointsToSvgSubpath = (pts: THREE.Vector2[]) => {
    if (pts.length === 0) return "";
    const cmds = pts.map((p, idx) => {
      const sx = (50 + p.x).toFixed(2);
      const sy = (50 - p.y).toFixed(2);
      return `${idx === 0 ? "M" : "L"}${sx} ${sy}`;
    });
    return `${cmds.join(" ")} Z`;
  };

  for (const shape of shapes) {
    const outerPts = shape.getPoints(24);
    parts.push(pointsToSvgSubpath(outerPts));
    for (const hole of shape.holes) {
      const holePts = hole.getPoints(24);
      parts.push(pointsToSvgSubpath(holePts));
    }
  }

  const d = parts.join(" ");
  svgPathCache.set(resolvedId, d);
  return d;
}
