"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { heightAt } from "@/lib/world";

/* Alguns tubarões circulando em águas abertas: barbatana fora d'água,
   corpo escuro logo abaixo da superfície, cauda balançando e rastro de espuma. */

const RX = 9, RZ = 6;
function rotas(n) {
  const cand = [];
  for (let x = -66; x <= 66; x += 4) for (let z = -46; z <= 46; z += 4) {
    let ok = true;
    for (let a = 0; a < 6.3 && ok; a += .25) if (heightAt(x + Math.cos(a) * (RX + 2), z + Math.sin(a) * (RZ + 2)) > -2) ok = false;
    if (ok) cand.push([x, z]);
  }
  cand.sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
  const out = [];
  for (const c of cand) {
    if (out.every((o) => Math.hypot(o[0] - c[0], o[1] - c[1]) > 26)) out.push(c);
    if (out.length === n) break;
  }
  return out;
}

const skin = new THREE.MeshStandardMaterial({ color: "#3d4a52", roughness: .55, metalness: .1 });
const belly = new THREE.MeshStandardMaterial({ color: "#8d9aa0", roughness: .6 });

function Shark({ cx, cz, speed, phase, dir }) {
  const root = useRef(), tail = useRef(), wake = useRef();
  const p = useMemo(() => new THREE.Vector3(), []), q = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed * dir + phase;
    // trajetória em "8" suave, mais natural que um círculo perfeito
    const f = (u) => p.set(cx + Math.sin(u) * RX, 0, cz + Math.sin(u) * Math.cos(u) * RZ * 1.4);
    f(t); q.copy(p); f(t + .02 * dir);
    const g = root.current;
    g.position.set(q.x, -.55 + Math.sin(clock.elapsedTime * 1.7 + phase) * .08, q.z);
    g.lookAt(p.x, g.position.y, p.z);
    tail.current.rotation.y = Math.sin(clock.elapsedTime * 7 + phase) * .45;
    g.rotation.z = Math.sin(clock.elapsedTime * 3.5 + phase) * .06;
    wake.current.material.opacity = .25 + Math.sin(clock.elapsedTime * 5 + phase) * .08;
  });
  return (
    <group ref={root} scale={1.5}>
      {/* corpo */}
      <mesh material={skin} scale={[.55, .5, 2.2]} castShadow><sphereGeometry args={[1, 20, 14]} /></mesh>
      <mesh material={belly} position={[0, -.12, 0]} scale={[.5, .4, 2]}><sphereGeometry args={[1, 16, 10]} /></mesh>
      {/* barbatana dorsal (fica fora d'água) */}
      <mesh material={skin} position={[0, .95, -.1]} rotation={[-.35, 0, 0]} scale={[.12, 1, .7]}><coneGeometry args={[1, 1.4, 4]} /></mesh>
      {/* nadadeiras peitorais */}
      <mesh material={skin} position={[.6, -.2, .5]} rotation={[0, 0, -1.1]} scale={[.08, .7, .45]}><coneGeometry args={[1, 1.2, 4]} /></mesh>
      <mesh material={skin} position={[-.6, -.2, .5]} rotation={[0, 0, 1.1]} scale={[.08, .7, .45]}><coneGeometry args={[1, 1.2, 4]} /></mesh>
      {/* cauda */}
      <group ref={tail} position={[0, 0, -2]}>
        <mesh material={skin} position={[0, .45, -.5]} rotation={[-.7, 0, 0]} scale={[.08, .9, .4]}><coneGeometry args={[1, 1.3, 4]} /></mesh>
        <mesh material={skin} position={[0, -.3, -.4]} rotation={[-2.3, 0, 0]} scale={[.08, .6, .35]}><coneGeometry args={[1, 1, 4]} /></mesh>
      </group>
      {/* rastro de espuma em volta da barbatana */}
      <mesh ref={wake} position={[0, .36, -.6]} rotation-x={-Math.PI / 2} scale={[.7, 2.2, 1]}>
        <ringGeometry args={[.6, 1, 32]} />
        <meshBasicMaterial color="#cfeff0" transparent opacity={.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Sharks() {
  const list = useMemo(() => rotas(4).map(([cx, cz], i) => ({ cx, cz, speed: .16 + i * .03, phase: i * 1.9, dir: i % 2 ? -1 : 1 })), []);
  return <group>{list.map((s, i) => <Shark key={i} {...s} />)}</group>;
}
