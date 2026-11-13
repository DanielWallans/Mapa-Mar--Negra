"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sparkles, Cloud, Clouds, Html } from "@react-three/drei";
import * as THREE from "three";
import { W, Z, heightAt } from "@/lib/world";

export function Sky() {
  const stars = useRef();
  useFrame(({ clock }) => { stars.current.rotation.y = clock.elapsedTime * .004; });
  return (
    <>
      <color attach="background" args={["#04070c"]} />
      <fogExp2 attach="fog" args={["#06101a", .0065]} />
      <group ref={stars}><Stars radius={260} depth={60} count={6000} factor={6} saturation={0} fade speed={.6} /></group>
      {/* lua com halo */}
      <group position={[-120, 90, -230]}>
        <mesh><sphereGeometry args={[9, 48, 24]} /><meshBasicMaterial color={[3.2, 3, 2.6]} toneMapped={false} fog={false} /></mesh>
      </group>
      {/* plâncton luminoso sobre a água */}
      <Sparkles count={700} scale={[180, 6, 130]} position={[0, 3, 0]} size={3.2} speed={.35} opacity={.9} color="#6ff8dc" noise={1.5} />
      <Sparkles count={160} scale={[120, 10, 90]} position={[0, 8, 0]} size={5} speed={.2} opacity={.5} color="#ffd08a" />
      {/* névoa baixa à deriva */}
      <Clouds material={THREE.MeshLambertMaterial} limit={120}>
        <Cloud seed={1} segments={30} bounds={[60, 2, 30]} volume={22} color="#13283a" opacity={.35} speed={.08} position={[-30, 5, 34]} fade={60} />
        <Cloud seed={7} segments={30} bounds={[60, 2, 30]} volume={22} color="#102231" opacity={.3} speed={.06} position={[40, 6, -30]} fade={60} />
      </Clouds>
    </>
  );
}

export function Lights() {
  return (
    <>
      <hemisphereLight args={["#6a86a8", "#1a1208", .9]} />
      <directionalLight
        position={[-60, 80, -40]} intensity={1.6} color="#cfd8ff" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-left={-70} shadow-camera-right={70} shadow-camera-top={50} shadow-camera-bottom={-50} shadow-bias={-.0004}
      />
      <directionalLight position={[50, 20, 60]} intensity={.4} color="#5ff0d6" />
    </>
  );
}

const LABELS = [
  ["I", "Porto das Variáveis", 240, 560], ["II", "Fazenda dos Laços", 268, 140],
  ["III", "Reino dos Objetos", 626, 300], ["IV", "Castelo do Vulcão", 1060, 120],
];
export function IslandLabels({ visible }) {
  return LABELS.map(([n, nome, x, y], i) => {
    const wx = W(x), wz = Z(y);
    return (
      <Html key={n} position={[wx, Math.max(1, heightAt(wx, wz)) + (i === 3 ? 4 : 5), wz]} center zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <div className={`label ${visible ? "on" : ""}`} style={{ transitionDelay: `${i * .25}s` }}>
          <small>Ilha {n}</small><span>{nome}</span>
        </div>
      </Html>
    );
  });
}
