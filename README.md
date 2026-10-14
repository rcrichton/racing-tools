# Sim-Cap Studio

**Sim-Cap Studio** is a 100% client-side web application for designing and exporting custom 3D-printable, dual-color (multi-material / Bambu Lab AMS / Prusa MMU) sim racing steering wheel button caps.

All 2D rendering, 3D parametric CAD generation (smooth-bore hollow cup with chamfer), OpenType vector text, and binary STL exports execute directly in the browser via WebGL and Three.js.

---

## Features

### 1. Universal Wheel Sizing Presets & Fitment Tolerances
- **Fanatec**: Formula V2 / V2.5 / V3 & ClubSport Universal Hub (OD: `11.40mm`, ID: `9.70mm`, Height: `4.20mm`, Top Wall: `1.00mm`)
- **Moza Racing**: GS, FSR, KS, RS & CS V2 Wheels (OD: `12.00mm`, ID: `10.20mm`, Height: `4.50mm`, Top Wall: `1.00mm`)
- **Simucube / Ascher Racing**: F28 / F64 & Wireless Wheels (OD: `11.80mm`, ID: `10.00mm`, Height: `4.20mm`, Top Wall: `1.00mm`)
- **Logitech Pro / G-Series**: G Pro Racing Wheel & G29/G920/G923 (OD: `10.80mm`, ID: `9.10mm`, Height: `4.00mm`, Top Wall: `1.00mm`)
- **Custom**: Fully unlocked parametric millimeter sliders.
- **Fitment Quick-Modifiers**: `Tighter (-0.10mm)`, `Snug (-0.05mm)`, `Nominal (0.00mm)`, `Loose (+0.05mm)`, `Extra Loose (+0.10mm)`.

### 2. Smooth-Bore Cap CAD Geometry
- Low-profile hollow cylinder (cup) with subtle `0.25mm` top outer chamfer and smooth cylindrical inner bore (no internal cross-ribs or snap lips).
- `0.15mm` bottom inner lead-in chamfer for easy push-on installation on the wheel shaft.
- **Three Surface Relief Modes**:
  1. **Flush Dual-Color Inlay (`0.0mm`)**: Pocket cavity cut into the cap body so the separate inlay mesh sits flush for face-down textured PEI bed printing.
  2. **Raised Emboss (`+0.4mm` to `+0.8mm`)**: Text or symbol protrudes above the cap face.
  3. **Engraved Deboss (`-0.4mm`)**: Text or symbol cut into the top face.

### 3. High-Impact Text & Symbol Engine
- **Text Mode**: 1 to 4 characters (`PIT`, `BOX`, `DRS`, `OVTK`, `N`, `RAD`, `FLSH`, `MAP`, `+`, `-`, `TC`, `ABS`) with automatic font size scaling, font scale adjustment, and letter tracking.
- **Motorsport Typography**: Google Fonts (`Orbitron`, `Chakra Petch`, `JetBrains Mono`) parsed to vector geometry using OpenType.
- **Motorsport Icons**: Watertight vector paths for *Hybrid/Boost*, *Radio/Mic*, *Pit Limiter*, *Wipers*, *Headlights*, *Rain Light*, *Arrows*, *Plus*, *Minus*, *Flag*, and *Hazard*.
- **Concentric Outer Accent Ring**: Optional perimeter border ring sharing the inlay color.

### 4. Interactive 3D Viewport & 2D Preview
- `@react-three/fiber` 3D Canvas with OrbitControls, studio lighting, reticle, and millimeter grid.
- **Camera Presets**: `Angled (Iso)`, `Top (Face)`, and `Underside (Bore Inspection)`.
- **Explode View**: Animates the inlay vertically out of the body cavity to verify dual-material separation.
- **Cross-Section Inspection**: Half-cut plane along X=0 to inspect wall thickness and bore clearance.
- **2D Canvas Face Preview**: 1:1 scale reticle with calibrated millimeter annotations and zoom controls.

### 5. Multi-Material Dual-Color STL Export Pipeline
- Both `Cap_Body.stl` and `Cap_Inlay.stl` share the exact identical `(0,0,0)` world coordinate origin.
- Drag both files into Bambu Studio, OrcaSlicer, or PrusaSlicer and select *"Load as a single object with multiple parts"*; they auto-align with zero manual positioning.
- **Single Cap Export**: Downloads paired `Body.stl` and `Inlay.stl`.
- **Batch 12-Cap Export**: Generates and compresses all 12 paired caps (24 STL files) plus a printing guide into a single `.ZIP` file.

---

## Getting Started

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Vercel
```bash
npm run build
npm run start
```
Ready for zero-config deployment on Vercel.

---

## Recommended Slicer Settings (Bambu Studio / OrcaSlicer / PrusaSlicer)
- **Print Orientation**: Face-Down (top face with inlay rests on the build plate at Z=0).
- **Build Plate**: Textured PEI (provides a factory-grade matte finish on the button face).
- **Layer Height**: `0.20mm` (an inlay depth of `0.40mm` corresponds to 2 first layers).
- **Wall Generator**: Arachne (for crisp letter contours).
- **Infill**: 100% Solid.
- **Brim**: None needed on textured PEI.
