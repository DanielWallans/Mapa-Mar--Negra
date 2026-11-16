"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Clouds, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { W, Z, heightAt, VOLCANO } from "@/lib/world";
import { DIAS_CONCLUIDOS } from "@/lib/data";
import { getTextures } from "@/lib/textures";

const at = (x, z, lift = 0) => [x, heightAt(x, z) + lift, z];

function useStone(color) {
  return useMemo(() => {
    const T = getTextures(), n = T.terrainNormal.clone(); n.repeat.set(2, 2); n.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color, normalMap: n, normalScale: new THREE.Vector2(1.2, 1.2), roughness: .85 });
  }, [color]);
}

function Lighthouse() {
  const pivot = useRef();
  const white = useStone("#e8dcc0");
  useFrame(({ clock }) => { pivot.current.rotation.y = clock.elapsedTime * .8; });
  return (
    <group position={at(W(70), Z(610), -.2)}>
      <mesh position-y={2} material={white} castShadow><cylinderGeometry args={[.5, .85, 4, 16]} /></mesh>
      <mesh position-y={2.6}><cylinderGeometry args={[.62, .68, .5, 16]} /><meshStandardMaterial color="#8e1f22" /></mesh>
      <mesh position-y={4.3}><sphereGeometry args={[.45, 16, 12]} /><meshBasicMaterial color={[4, 3.4, 2]} toneMapped={false} /></mesh>
      <group ref={pivot} position-y={4.3}>
        <mesh rotation-z={Math.PI / 2} position-x={11}>
          <coneGeometry args={[2.6, 22, 32, 1, true]} />
          <meshBasicMaterial color="#fff1c0" transparent opacity={.08} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <pointLight position-y={4.3} color="#ffd88a" intensity={30} distance={22} />
    </group>
  );
}

function Windmill() {
  const blades = useRef();
  useFrame(({ clock }) => { blades.current.rotation.z = clock.elapsedTime * 1.2; });
  const wood = useStone("#d9c9a4");
  return (
    <group position={at(W(356), Z(214))}>
      <mesh position-y={1.3} material={wood} castShadow><cylinderGeometry args={[.6, .9, 2.6, 10]} /></mesh>
      <mesh position-y={3.1}><coneGeometry args={[.85, 1.1, 10]} /><meshStandardMaterial color="#7a3b27" roughness={.8} /></mesh>
      <group ref={blades} position={[0, 2.5, .8]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation-z={i * Math.PI / 2}>
            <boxGeometry args={[.5, 2.7, .04]} />
            <meshStandardMaterial color="#efe3c6" />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 1.4, 1]} color="#ffb867" intensity={6} distance={6} />
    </group>
  );
}

function Castle() {
  const flag = useRef(), win = useRef();
  const stone = useStone("#a59bb0");
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flag.current.rotation.y = Math.sin(t * 3) * .4;
    win.current.intensity = 14 + Math.sin(t * 7) * 3 + Math.sin(t * 13) * 2;
  });
  const roof = <meshStandardMaterial color="#4a2a55" roughness={.6} />;
  return (
    <group position={at(W(626), Z(400), -.3)} scale={.85}>
      <mesh position-y={1.7} material={stone} castShadow><boxGeometry args={[3, 3.4, 3]} /></mesh>
      {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <mesh position-y={2.3} material={stone} castShadow><cylinderGeometry args={[.6, .7, 4.6, 12]} /></mesh>
          <mesh position-y={5.4}><coneGeometry args={[.85, 1.6, 12]} />{roof}</mesh>
        </group>
      ))}
      <mesh position-y={4.9}><coneGeometry args={[1.2, 3, 12]} />{roof}</mesh>
      {[-.7, 0, .7].map((x) => (
        <mesh key={x} position={[x, 2.2, 1.51]}><planeGeometry args={[.3, .55]} /><meshBasicMaterial color={[3, 1.8, .6]} toneMapped={false} /></mesh>
      ))}
      <mesh ref={flag} position-y={6.6}><planeGeometry args={[1.2, .6]} /><meshStandardMaterial color="#b8322f" side={THREE.DoubleSide} /></mesh>
      <pointLight ref={win} position={[0, 2.4, 2.2]} color="#ffb867" distance={12} />
    </group>
  );
}

function Volcano() {
  const top = heightAt(VOLCANO.x, VOLCANO.z);
  const light = useRef(), lava = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    light.current.intensity = 260 + Math.sin(t * 5) * 50 + Math.sin(t * 11.3) * 30;
    lava.current.color.setRGB(5 + Math.sin(t * 2) * 1, 1.4 + Math.sin(t * 3) * .3, .3);
  });
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[VOLCANO.x, top + .6, VOLCANO.z]}>
        <circleGeometry args={[2.1, 32]} />
        <meshBasicMaterial ref={lava} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[VOLCANO.x, top + 4, VOLCANO.z]} color="#ff5a1f" distance={45} decay={1.6} />
      <Sparkles position={[VOLCANO.x, top + 8, VOLCANO.z]} count={140} scale={[6, 16, 6]} size={6} speed={1.6} color="#ffa04a" noise={2} />
      <Clouds material={THREE.MeshLambertMaterial} limit={60}>
        <Cloud seed={4} segments={18} bounds={[4, 5, 3]} volume={6} color="#3d3633" opacity={.55} speed={.25} position={[VOLCANO.x + 3, top + 12, VOLCANO.z - 2]} />
        <Cloud seed={9} segments={12} bounds={[6, 3, 4]} volume={8} color="#2c2726" opacity={.35} speed={.15} position={[VOLCANO.x + 9, top + 20, VOLCANO.z - 5]} />
      </Clouds>
    </group>
  );
}

export function Kraken({ at, vivo } = {}) {
  const done = !vivo && DIAS_CONCLUIDOS >= 7;
  const group = useRef();
  const tents = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const pts = []; for (let j = 0; j <= 12; j++) pts.push(new THREE.Vector3(0, j * .65, 0));
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, .38, 10);
    // afina a ponta
    const p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) { const y = p.getY(k), f = 1 - y / 8.5; p.setX(k, p.getX(k) * f); p.setZ(k, p.getZ(k) * f); }
    const a = i / 6 * Math.PI * 2;
    return { geo, base: p.array.slice(), a, pos: [Math.cos(a) * 2.6, -1.5, Math.sin(a) * 2.6] };
  }), []);
  const mat = useMemo(() => {
    const n = getTextures().terrainNormal.clone(); n.repeat.set(1, 4); n.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: "#6a2c46", normalMap: n, roughness: .35, emissive: "#2a0818" });
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (const { geo, base, a } of tents) {
      const arr = geo.attributes.position.array;
      for (let i = 0; i < arr.length; i += 3) {
        const y = base[i + 1], k = y / 7.8;
        arr[i] = base[i] + Math.sin(t * 1.4 + y * .8 + a) * k * 1.8;
        arr[i + 2] = base[i + 2] + Math.cos(t * 1.1 + y * .6 + a) * k * 1.3;
      }
      geo.attributes.position.needsUpdate = true;
      geo.computeVertexNormals();
    }
    group.current.position.y = done ? -1.2 + Math.sin(t * .5) * .3 : Math.sin(t * .7) * .5;
  });
  return (
    <group ref={group} position={at || [W(500), 0, Z(752)]} scale={done ? .65 : 1}>
      {tents.map((t, i) => <mesh key={i} geometry={t.geo} material={mat} position={t.pos} />)}
      {/* cabeça (manto) e olhos */}
      <mesh position={[0, 1.4, 0]} scale={[2.1, 2.9, 2.1]} rotation-x={-.25} material={mat} castShadow><sphereGeometry args={[1, 32, 24]} /></mesh>
      {[-.85, .85].map((x) => (
        <group key={x} position={[x, 1.9, 1.62]}>
          <mesh><sphereGeometry args={[.42, 16, 12]} /><meshStandardMaterial color="#f2d36b" emissive="#ffb21f" emissiveIntensity={done ? .3 : 1.6} /></mesh>
          <mesh position-z={.33} scale={[.12, .34, .1]}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial color="#0a0406" /></mesh>
        </group>
      ))}
      <pointLight position={[0, 2, 0]} color="#ff3a6a" intensity={done ? 4 : 12} distance={10} />
    </group>
  );
}

export default function Decor() {
  return (<><Lighthouse /><Windmill /><Castle /><Volcano /><Kraken /></>);
}
