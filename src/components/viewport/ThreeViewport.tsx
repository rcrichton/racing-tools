"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { useCapStore } from "@/store/useCapStore";
import { buildCapGeometry, CapGeometryResult } from "@/lib/cad/buildCapGeometry";

// Camera controller that smoothly transitions to presets
function CameraRig({ view }: { view: "angled" | "top" | "underside" }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(14, 16, 20));

  useEffect(() => {
    if (view === "angled") {
      targetPos.current.set(13, 15, 18);
    } else if (view === "top") {
      targetPos.current.set(0, 22, 0.001);
    } else if (view === "underside") {
      targetPos.current.set(0, -18, 12);
    }
  }, [view]);

  useFrame((_, delta) => {
    camera.position.lerp(targetPos.current, Math.min(1, delta * 6));
  });

  return null;
}

// 3D Scene holding the Cap Body, Inlay, Grid, and Lighting
function SceneContent() {
  const cap = useCapStore((state) => state.getActiveCap());
  const { cameraView, explodeOffset, isWireframe, isCrossSection } =
    useCapStore();

  const [cadResult, setCadResult] = useState<CapGeometryResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Cross-section clipping plane cutting along X=0
  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);

  const { gl } = useThree();
  useEffect(() => {
    gl.localClippingEnabled = isCrossSection;
  }, [gl, isCrossSection]);

  // Rebuild geometry whenever cap parameters change
  useEffect(() => {
    let active = true;
    setIsCalculating(true);

    buildCapGeometry(cap)
      .then((res) => {
        if (active) {
          setCadResult(res);
          setIsCalculating(false);
        }
      })
      .catch((err) => {
        console.error("Failed to build cap geometry:", err);
        if (active) setIsCalculating(false);
      });

    return () => {
      active = false;
    };
  }, [cap]);

  return (
    <>
      <CameraRig view={cameraView} />
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={60}
        maxPolarAngle={cameraView === "top" ? Math.PI / 4 : Math.PI - 0.05}
        target={[0, (cap.capHeight || 4.2) / 2, 0]}
      />

      {/* Studio Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[15, 25, 20]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-15, 10, -15]} intensity={0.9} color="#94A3B8" />
      <directionalLight position={[0, -20, 0]} intensity={0.6} color="#64748B" />
      <pointLight position={[0, 15, 0]} intensity={1.0} distance={30} />

      {/* Millimeter Engineering Grid */}
      <Grid
        position={[0, -0.01, 0]}
        args={[50, 50]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#262D40"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#3B4560"
        fadeDistance={45}
        fadeStrength={1.2}
      />

      {/* Center Origin Axis Reticle */}
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[cap.outerDiameter / 2, cap.outerDiameter / 2 + 0.1, 48]} />
          <meshBasicMaterial color="#FF6600" opacity={0.3} transparent />
        </mesh>
      </group>

      {/* 3D Cap Models */}
      {cadResult && (
        <group>
          {/* Filament 1: Cap Body */}
          <mesh
            geometry={cadResult.bodyGeometry}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color={cap.bodyColor}
              roughness={0.45}
              metalness={0.05}
              wireframe={isWireframe}
              clippingPlanes={isCrossSection ? [clipPlane] : []}
              clipShadows={true}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Filament 2: Text / Symbol / Ring Inlay */}
          {cadResult.inlayGeometry && (
            <mesh
              geometry={cadResult.inlayGeometry}
              position={[0, explodeOffset, 0]}
              castShadow
            >
              <meshStandardMaterial
                color={cap.inlayColor}
                roughness={0.35}
                metalness={0.08}
                wireframe={isWireframe}
                clippingPlanes={isCrossSection ? [clipPlane] : []}
                clipShadows={true}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      )}

      {/* Subtle calculating spinner indicator in 3D */}
      {isCalculating && (
        <mesh position={[0, cap.capHeight + 3, 0]}>
          <ringGeometry args={[1.5, 1.8, 24]} />
          <meshBasicMaterial color="#FF9900" side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
}

export const ThreeViewport: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#090A0F] text-slate-500 font-mono text-xs">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-3" />
        <span>Initializing 3D CAD Engine...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#090A0F] overflow-hidden select-none">
      <Canvas
        camera={{ position: [14, 16, 20], fov: 42 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          localClippingEnabled: true,
        }}
        shadows
      >
        <SceneContent />
      </Canvas>
    </div>
  );
};
