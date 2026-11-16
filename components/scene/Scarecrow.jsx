"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { espantalhoPos } from "@/lib/world";
import { DIAS_CONCLUIDOS } from "@/lib/data";
import { getTextures } from "@/lib/textures";

/* O Espantalho do Índice Zero, chefe da Fazenda dos Laços: costurado com
   velas de navios afundados, foice de âncora, coração de alga no peito e
   três corvos (Bico, Pena e Garra) voando em volta. */

function tex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}

const sackTex = () => tex(256, 128, (x, w, h) => {
  x.fillStyle = "#9c8052"; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w; i += 3) { x.fillStyle = `rgba(60,40,20,${.1 + Math.random() * .15})`; x.fillRect(i, 0, 1, h); }
  for (let j = 0; j < h; j += 3) { x.fillStyle = `rgba(230,200,150,${Math.random() * .12})`; x.fillRect(0, j, w, 1); }
  // rosto costurado (frente do saco em u≈0.25)
  x.strokeStyle = "#2a1a0e"; x.lineWidth = 3;
  x.beginPath(); x.moveTo(34, 88); for (let i = 0; i <= 6; i++) x.lineTo(34 + i * 10, 88 + (i % 2 ? 6 : -2)); x.stroke();
  for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(38 + i * 10, 80); x.lineTo(38 + i * 10, 96); x.stroke(); }
});

const ragTex = () => tex(256, 256, (x, w, h) => {
  const cols = ["#d8c9a3", "#b9a57c", "#8d7a5a", "#c7b38a", "#6f5f48"];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
    x.fillStyle = cols[(i * 3 + j * 7) % cols.length]; x.fillRect(i * 43, j * 43, 43, 43);
    x.strokeStyle = "rgba(40,25,12,.6)"; x.setLineDash([4, 4]); x.lineWidth = 2; x.strokeRect(i * 43 + 2, j * 43 + 2, 39, 39);
  }
  x.setLineDash([]);
  for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(50,30,15,${Math.random() * .12})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
});

function Crow({ i, r, h, speed }) {
  const ref = useRef(), wl = useRef(), wr = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + i * 2.1;
    ref.current.position.set(Math.cos(t) * r, h + Math.sin(t * 2) * .6, Math.sin(t) * r);
    ref.current.rotation.y = -t;
    const f = Math.sin(clock.elapsedTime * 12 + i) * .7;
    wl.current.rotation.x = f; wr.current.rotation.x = -f;
  });
  const black = <meshStandardMaterial color="#0f0d10" roughness={.5} />;
  return (
    <group ref={ref}>
      <mesh scale={[.22, .2, .45]}><sphereGeometry args={[1, 10, 8]} />{black}</mesh>
      <mesh position={[0, .08, .42]}><sphereGeometry args={[.13, 8, 6]} />{black}</mesh>
      <mesh position={[0, .07, .58]} rotation-x={Math.PI / 2}><coneGeometry args={[.05, .16, 5]} /><meshStandardMaterial color="#c9993f" /></mesh>
      <mesh position={[.05, .12, .5]}><sphereGeometry args={[.025, 6, 4]} /><meshBasicMaterial color={[3, .4, .3]} toneMapped={false} /></mesh>
      <group ref={wl} position={[.15, .05, 0]}><mesh position-x={.35} scale={[.4, .02, .18]}><boxGeometry />{black}</mesh></group>
      <group ref={wr} position={[-.15, .05, 0]}><mesh position-x={-.35} scale={[.4, .02, .18]}><boxGeometry />{black}</mesh></group>
    </group>
  );
}

export default function Scarecrow() {
  const done = DIAS_CONCLUIDOS >= 14;
  const [x, y, z] = espantalhoPos();
  const body = useRef(), heart = useRef(), heartL = useRef(), eyes = useRef(), coat = useRef();
  const M = useMemo(() => {
    const wn = getTextures().woodNormal.clone(); wn.needsUpdate = true;
    const rag = ragTex();
    return {
      wood: new THREE.MeshStandardMaterial({ color: "#5b3b22", normalMap: wn, roughness: .9 }),
      sack: new THREE.MeshStandardMaterial({ map: sackTex(), roughness: 1 }),
      rag: new THREE.MeshStandardMaterial({ map: rag, roughness: 1, side: THREE.DoubleSide }),
      straw: new THREE.MeshStandardMaterial({ color: "#c9a752", roughness: 1 }),
      iron: new THREE.MeshStandardMaterial({ color: "#3a3a40", metalness: .8, roughness: .35 }),
      coatGeo: new THREE.CylinderGeometry(.75, 1.45, 3, 18, 6, true),
    };
  }, []);
  // barra rasgada do casaco
  const coatBase = useMemo(() => {
    const p = M.coatGeo.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) < -1.4) { const a = Math.atan2(p.getZ(i), p.getX(i)); p.setY(i, p.getY(i) - (Math.sin(a * 9) * .5 + .5) * .5); }
    M.coatGeo.computeVertexNormals();
    return p.array.slice();
  }, [M]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    body.current.rotation.z = Math.sin(t * .8) * .04;
    body.current.rotation.y = Math.sin(t * .35) * .25;
    const beat = Math.pow(Math.max(0, Math.sin(t * 3.2)), 8);
    heart.current.scale.setScalar(.28 + beat * .07);
    heartL.current.intensity = (done ? 1 : 6) + beat * 10;
    eyes.current.children.forEach((e) => e.material.color.setRGB(4 + Math.sin(t * 5) * 1, 1.6, .3));
    const a = M.coatGeo.attributes.position.array;
    for (let i = 0; i < a.length; i += 3) {
      const k = Math.max(0, -coatBase[i + 1] - .3) / 1.5;
      a[i] = coatBase[i] + Math.sin(t * 2 + coatBase[i + 2] * 2) * .12 * k;
      a[i + 2] = coatBase[i + 2] + Math.cos(t * 1.7 + coatBase[i] * 2) * .1 * k;
    }
    M.coatGeo.attributes.position.needsUpdate = true;
  });

  return (
    <group position={[x, y - .2, z]} scale={done ? .9 : 1.15} rotation-y={.6}>
      {/* estaca e travessa */}
      <mesh position-y={3} material={M.wood} castShadow><cylinderGeometry args={[.14, .2, 6, 8]} /></mesh>
      <group ref={body}>
        <mesh position-y={4.55} rotation-z={Math.PI / 2} material={M.wood} castShadow><cylinderGeometry args={[.1, .1, 4.6, 8]} /></mesh>
        {/* casaco de velas costuradas */}
        <mesh ref={coat} geometry={M.coatGeo} material={M.rag} position-y={3.35} castShadow />
        {/* mangas e mãos de palha */}
        {[1, -1].map((s) => (
          <group key={s}>
            <mesh position={[s * 1.4, 4.5, 0]} rotation-z={Math.PI / 2} material={M.rag}><cylinderGeometry args={[.32, .45, 1.6, 10, 1, true]} /></mesh>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} position={[s * (2.35 + k * .04), 4.45 - k * .06, (k - 1.5) * .1]} rotation-z={s * (1.9 + k * .15)} material={M.straw}><coneGeometry args={[.05, .6, 4]} /></mesh>
            ))}
          </group>
        ))}
        {/* cabeça de saco, olhos acesos e chapéu */}
        <mesh position-y={5.55} scale={[.8, .88, .8]} rotation-y={-Math.PI / 2} material={M.sack} castShadow><sphereGeometry args={[1, 20, 16]} /></mesh>
        <group ref={eyes}>
          {[-.28, .28].map((ex) => <mesh key={ex} position={[ex, 5.68, .72]}><sphereGeometry args={[.11, 10, 8]} /><meshBasicMaterial toneMapped={false} /></mesh>)}
        </group>
        <mesh position-y={6.38} material={M.straw}><cylinderGeometry args={[1.45, 1.5, .08, 20]} /></mesh>
        <mesh position-y={6.85} rotation-z={.15} material={M.straw}><coneGeometry args={[.8, 1.1, 14]} /></mesh>
        <mesh position-y={6.48} material={M.rag}><cylinderGeometry args={[.82, .82, .16, 16, 1, true]} /></mesh>
        {/* coração de alga */}
        <mesh ref={heart} position={[.25, 4.15, .95]}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#2f8f4e" emissive="#1fa35a" emissiveIntensity={1.6} roughness={.4} /></mesh>
        <pointLight ref={heartL} position={[.25, 4.15, 1.5]} color="#4dff9a" distance={8} />
        {/* foice de âncora */}
        <group position={[2.45, 3, .3]} rotation-z={-.15}>
          <mesh material={M.wood}><cylinderGeometry args={[.07, .07, 5.6, 8]} /></mesh>
          <mesh position-y={2.9} rotation-x={Math.PI / 2} material={M.iron}><torusGeometry args={[.25, .06, 8, 16]} /></mesh>
          <mesh position={[-.7, 2.55, 0]} rotation-z={Math.PI} material={M.iron}><torusGeometry args={[.85, .08, 8, 24, Math.PI * .75]} /></mesh>
          <mesh position={[-1.5, 2.6, 0]} rotation-z={-.5} material={M.iron}><coneGeometry args={[.12, .45, 4]} /></mesh>
        </group>
      </group>
      {!done && [0, 1, 2].map((i) => <Crow key={i} i={i} r={2.6 + i * .5} h={6.2 + i * .5} speed={.7 + i * .12} />)}
    </group>
  );
}
