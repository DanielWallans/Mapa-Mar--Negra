"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import * as THREE from "three";
import Ocean from "./Ocean";
import Islands from "./Islands";
import Decor from "./Decor";
import Route from "./Route";
import Markers from "./Markers";
import Ship from "./Ship";
import Sharks from "./Sharks";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import { Sky, Lights, IslandLabels } from "./Atmosphere";


export default function Experience({ view, focusDay, started, labels, hovered, onHover, onSelect }) {
  return (
    <Canvas
      className="scene"
      shadows
      dpr={[1, 2]}
      camera={{ fov: 42, near: .1, far: 1000, position: [-140, 260, 200] }}
      gl={{ antialias: false, powerPreference: "high-performance", toneMapping: THREE.NoToneMapping }}
      onPointerMissed={() => onHover(null)}
    >
      <Suspense fallback={null}>
        <Sky />
        <Lights />
        <Ocean />
        <Islands />
        <Decor />
        <Route />
        <Markers hovered={hovered} onHover={onHover} onSelect={onSelect} />
        <Ship />
        <Sharks />
        <IslandLabels visible={labels} />
        <CameraRig view={view} focusDay={focusDay} started={started} />
        <Effects />
        <Preload all />
      </Suspense>
      <AdaptiveDpr pixelated={false} />
    </Canvas>
  );
}
