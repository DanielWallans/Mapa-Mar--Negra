"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { route, intro } from "@/lib/world";
import { getTextures } from "@/lib/textures";

export default function Ship() {
  const ref = useRef(), flag = useRef(), sail = useRef();
  const { curve } = route();
  const { hull, sailGeo, woodMat } = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-1.6, 0); s.quadraticCurveTo(-1.8, -.7, -1, -.8); s.lineTo(1.2, -.8); s.quadraticCurveTo(2, -.5, 2.2, .3); s.lineTo(-1.6, 0);
    const hull = new THREE.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: true, bevelSize: .08, bevelThickness: .08, bevelSegments: 2 }).translate(0, 0, -.55);
    const sailGeo = new THREE.PlaneGeometry(1.9, 2, 10, 10);
    const n = getTextures().woodNormal.clone(); n.repeat.set(1, 1); n.needsUpdate = true;
    const woodMat = new THREE.MeshStandardMaterial({ color: "#5a3420", normalMap: n, roughness: .7 });
    return { hull, sailGeo, woodMat };
  }, []);
  const base = useMemo(() => sailGeo.attributes.position.array.slice(), [sailGeo]);
  const look = new THREE.Vector3();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, u = Math.min(.999, intro.ship);
    const p = curve.getPointAt(u), q = curve.getPointAt(Math.min(1, u + .003));
    // navega ao lado da rota (não em cima do selo)
    const dx = q.x - p.x, dz = q.z - p.z, l = Math.hypot(dx, dz) || 1;
    ref.current.position.set(p.x - dz / l * 2.4, p.y + .3 + Math.sin(t * 1.6) * .15, p.z + dx / l * 2.4);
    look.set(ref.current.position.x + dx, ref.current.position.y, ref.current.position.z + dz);
    ref.current.lookAt(look); ref.current.rotateY(-Math.PI / 2);
    ref.current.rotation.z += Math.sin(t * 1.3) * .06;
    flag.current.rotation.y = Math.sin(t * 4) * .5;
    // vela inflando com o vento
    const a = sailGeo.attributes.position.array;
    for (let i = 0; i < a.length; i += 3) { const x = base[i], y = base[i + 1]; a[i + 2] = Math.sin((x + .95) / 1.9 * Math.PI) * (.35 + Math.sin(t * 2 + y) * .08); }
    sailGeo.attributes.position.needsUpdate = true; sailGeo.computeVertexNormals();
  });
  return (
    <group ref={ref} scale={.95}>
      <mesh geometry={hull} material={woodMat} castShadow />
      <mesh position-y={1.8} material={woodMat}><cylinderGeometry args={[.06, .09, 3.8, 8]} /></mesh>
      <mesh ref={sail} geometry={sailGeo} position={[.1, 2.1, 0]} rotation-y={Math.PI / 2}>
        <meshStandardMaterial color="#efe1bd" side={THREE.DoubleSide} roughness={.9} />
      </mesh>
      <mesh ref={flag} position-y={3.6}><planeGeometry args={[.7, .4]} /><meshStandardMaterial color="#111" side={THREE.DoubleSide} /></mesh>
      <mesh position={[1.7, .6, 0]}><sphereGeometry args={[.12, 10, 8]} /><meshBasicMaterial color={[4, 2.6, 1]} toneMapped={false} /></mesh>
      <pointLight position={[1.7, .7, 0]} color="#ffc26a" intensity={8} distance={9} />
    </group>
  );
}
