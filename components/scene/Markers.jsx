"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { dayPoint, estado, isBoss, route, intro } from "@/lib/world";
import { sealTexture, glowTexture } from "@/lib/textures";

const COLORS = { done: ["#9b2426", "#f6e6cf"], now: ["#e8b85a", "#2b1d12"], locked: ["#d9c9a2", "#2b1d12"] };
let glowCache;
const glows = () => (glowCache ||= { red: glowTexture("rgba(255,120,80,1)"), gold: glowTexture("rgba(255,214,120,1)") });

function Seal({ dia, hovered, onHover, onSelect }) {
  const st = estado(dia), boss = isBoss(dia), p = useMemo(() => dayPoint(dia), [dia]);
  const u = route().dayU[dia];
  const root = useRef(), holder = useRef(), crown = useRef(), ring = useRef(), glow = useRef();
  const r = boss ? 1.25 : .9;
  const [bg, fg] = COLORS[st];
  const mats = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color: bg, roughness: .3, metalness: .05, emissive: st === "now" ? "#6a4a10" : "#000" });
    const top = new THREE.MeshStandardMaterial({ map: sealTexture(dia, fg, bg), roughness: .35, transparent: st === "locked", opacity: st === "locked" ? .75 : 1 });
    return [side, top, side];
  }, [dia, bg, fg, st]);
  const target = useRef(0);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const shown = intro.seals >= u ? 1 : 0;
    target.current = intro.instant ? shown : target.current + (shown - target.current) * Math.min(1, dt * 6);
    const k = target.current * (hovered ? 1.45 : 1);
    if (intro.instant) root.current.scale.setScalar(k);
    else root.current.scale.lerp(new THREE.Vector3(k, k, k), Math.min(1, dt * 10));
    holder.current.position.y = Math.sin(t * 1.3 + dia * .7) * .18;
    holder.current.rotation.y = Math.sin(t * .5 + dia) * .25;
    if (crown.current) crown.current.rotation.z = t * .6;
    if (ring.current) { const q = (t * .6) % 1; ring.current.scale.setScalar(1 + q * 3); ring.current.material.opacity = 1 - q; }
    if (glow.current) glow.current.material.opacity = (st === "now" ? .8 : .45) + Math.sin(t * 2 + dia) * .15;
  });
  return (
    <group ref={root} position={p} scale={0}>
      <group ref={holder}>
        <mesh
          material={mats} rotation-y={boss ? Math.PI / 4 : 0} scale={boss ? [1.25, 1, 1.25] : 1} castShadow
          onPointerOver={(e) => { e.stopPropagation(); onHover(dia, e.nativeEvent); }}
          onPointerMove={(e) => { e.stopPropagation(); onHover(dia, e.nativeEvent); }}
          onPointerOut={() => onHover(null)}
          onClick={(e) => { e.stopPropagation(); onSelect(dia); }}
        >
          <cylinderGeometry args={[r, r * 1.06, .38, boss ? 4 : 40]} />
        </mesh>
      </group>
      {boss && (
        <mesh ref={crown} rotation-x={Math.PI / 2}>
          <torusGeometry args={[r * 1.6, .07, 8, 64]} />
          <meshBasicMaterial color={st === "locked" ? "#8a7f6a" : [3, 1.6, .5]} toneMapped={false} />
        </mesh>
      )}
      {st !== "locked" && (
        <Billboard>
          <sprite ref={glow} scale={st === "now" ? 7 : 4.2}>
            <spriteMaterial map={st === "now" ? glows().gold : glows().red} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        </Billboard>
      )}
      {st === "now" && (
        <>
          <mesh ref={ring} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[1, 1.15, 64]} />
            <meshBasicMaterial color={[3, 2.4, 1.2]} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh position-y={16}>
            <cylinderGeometry args={[.06, .55, 32, 16, 1, true]} />
            <meshBasicMaterial color={[2, 1.5, .6]} transparent opacity={.2} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}

export default function Markers({ hovered, onHover, onSelect }) {
  return Array.from({ length: 30 }, (_, i) => (
    <Seal key={i + 1} dia={i + 1} hovered={hovered === i + 1} onHover={onHover} onSelect={onSelect} />
  ));
}
