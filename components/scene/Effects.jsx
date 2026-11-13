"use client";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration, ToneMapping, SMAA } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode, KernelSize } from "postprocessing";
import * as THREE from "three";

const ca = new THREE.Vector2(.0006, .0008);

export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <SMAA />
      <Bloom luminanceThreshold={.85} luminanceSmoothing={.25} intensity={1.3} kernelSize={KernelSize.HUGE} />
      <ChromaticAberration offset={ca} radialModulation modulationOffset={.4} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={.25} darkness={.75} />
      <Noise opacity={.05} blendFunction={BlendFunction.OVERLAY} />
    </EffectComposer>
  );
}
