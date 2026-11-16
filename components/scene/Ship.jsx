"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { route, intro, heightAt } from "@/lib/world";
import { getTextures, glowTexture } from "@/lib/textures";

/* Galeão pirata procedural: casco em loft com tábuas pintadas em canvas,
   castelo de popa, três mastros com velas que inflam, bujarrona, canhões,
   lanternas e bandeira negra. Navega pela rota com curva e balanço suaves. */

const L = 2.7; // meio comprimento do casco (x: popa -L, proa +L)

function cnv(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

function planks() {
  return cnv(512, 256, (x, w, h) => {
    const rows = 14, rh = h / rows;
    for (let r = 0; r < rows; r++) {
      const base = 52 + ((r * 37) % 3) * 6;
      x.fillStyle = `rgb(${base + 34},${base},${base - 26})`; x.fillRect(0, r * rh, w, rh);
      for (let k = 0; k < 40; k++) { // veios
        x.strokeStyle = `rgba(20,10,4,${.08 + Math.random() * .12})`; x.lineWidth = 1;
        const y = r * rh + Math.random() * rh; x.beginPath(); x.moveTo(0, y);
        for (let i = 0; i <= w; i += 32) x.lineTo(i, y + Math.sin(i * .02 + k) * 1.5); x.stroke();
      }
      x.fillStyle = "rgba(10,5,2,.7)"; x.fillRect(0, r * rh, w, 1.5);
      const off = (r % 2) * 96; // emendas desencontradas
      for (let i = off; i < w; i += 192) { x.fillRect(i, r * rh, 1.5, rh); x.fillStyle = "rgba(200,170,110,.35)"; x.fillRect(i + 5, r * rh + rh / 2 - 1, 2, 2); x.fillStyle = "rgba(10,5,2,.7)"; }
    }
    // faixa de acabamento dourado e vermelho no topo do casco
    x.fillStyle = "#7c1d1a"; x.fillRect(0, 0, w, rh * 1.6);
    x.fillStyle = "#c9993f"; x.fillRect(0, rh * 1.6, w, 3); x.fillRect(0, rh * .2, w, 2);
  });
}

function canvasSail(skull) {
  return cnv(256, 256, (x, w, h) => {
    x.fillStyle = "#e9dcb8"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(110,85,45,${Math.random() * .08})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    x.strokeStyle = "rgba(120,95,55,.45)"; x.lineWidth = 1.5; // costuras verticais
    for (let i = 32; i < w; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    x.fillStyle = "rgba(150,120,70,.25)"; x.fillRect(150, 170, 40, 34); x.strokeRect(150, 170, 40, 34); // remendo
    const g = x.createLinearGradient(0, h, 0, h * .6); g.addColorStop(0, "rgba(60,40,20,.35)"); g.addColorStop(1, "rgba(60,40,20,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    if (skull) {
      x.fillStyle = "#1c1410"; x.strokeStyle = "#1c1410"; x.lineCap = "round"; x.lineWidth = 16;
      x.beginPath(); x.moveTo(70, 170); x.lineTo(186, 222); x.moveTo(186, 170); x.lineTo(70, 222); x.stroke();
      x.beginPath(); x.arc(128, 112, 46, 0, 7); x.fill(); x.fillRect(102, 140, 52, 32);
      x.fillStyle = "#e9dcb8"; x.beginPath(); x.arc(110, 110, 12, 0, 7); x.arc(146, 110, 12, 0, 7); x.fill();
      x.fillRect(112, 156, 6, 14); x.fillRect(125, 156, 6, 14); x.fillRect(138, 156, 6, 14);
    }
  });
}

function flagTex() {
  return cnv(128, 80, (x, w, h) => {
    x.fillStyle = "#0d0b0a"; x.fillRect(0, 0, w, h);
    x.fillStyle = "#e9dfc8"; x.strokeStyle = "#e9dfc8"; x.lineWidth = 7; x.lineCap = "round";
    x.beginPath(); x.moveTo(40, 50); x.lineTo(88, 72); x.moveTo(88, 50); x.lineTo(40, 72); x.stroke();
    x.beginPath(); x.arc(64, 34, 17, 0, 7); x.fill(); x.fillRect(55, 42, 18, 12);
    x.fillStyle = "#0d0b0a"; x.beginPath(); x.arc(58, 33, 4.5, 0, 7); x.arc(70, 33, 4.5, 0, 7); x.fill();
  });
}

// casco por secções transversais (loft)
function hullGeometry() {
  const NU = 40, NV = 14, pos = [], uv = [], idx = [];
  for (let i = 0; i <= NU; i++) {
    const u = i / NU, x = -L + u * 2 * L;
    const bow = Math.max(0, (u - .62) / .38), stern = Math.max(0, (.14 - u) / .14);
    const half = .95 * Math.pow(1 - bow * bow, .55) * (1 - stern * .32) + .02;
    const top = .55 + bow * bow * .55 + stern * .5;          // tosado: proa e popa sobem
    const depth = 1.0 * (1 - bow * .55) * (1 - stern * .25);
    for (let j = 0; j <= NV; j++) {
      const v = j / NV, a = v * Math.PI;                       // de bombordo à quilha a estibordo
      const z = Math.cos(a) * half * (1 - Math.pow(Math.sin(a), 6) * .45);
      const y = top - Math.pow(Math.sin(a), .8) * (depth + top);
      pos.push(x, y, z); uv.push(u * 3, v);
    }
  }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const a = i * (NV + 1) + j, b = a + NV + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function deckGeometry() {
  const s = new THREE.Shape(), N = 30;
  const half = (u) => { const bow = Math.max(0, (u - .62) / .38), st = Math.max(0, (.14 - u) / .14); return .93 * Math.pow(1 - bow * bow, .55) * (1 - st * .32); };
  for (let i = 0; i <= N; i++) { const u = i / N; s[i ? "lineTo" : "moveTo"](-L + u * 2 * L, half(u)); }
  for (let i = N; i >= 0; i--) { const u = i / N; s.lineTo(-L + u * 2 * L, -half(u)); }
  return new THREE.ShapeGeometry(s).rotateX(Math.PI / 2);
}

function Sail({ w, h, y, x, tex, belly = .4, phase = 0, geoRef }) {
  return (
    <mesh ref={geoRef} position={[x, y, 0]} rotation-y={Math.PI / 2} castShadow userData={{ w, h, belly, phase }}>
      <planeGeometry args={[w, h, 10, 8]} />
      <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={.95} />
    </mesh>
  );
}

export default function Ship() {
  const ref = useRef(), body = useRef(), flag = useRef(), wake = useRef();
  const sails = useRef([]);
  const { curve } = route();
  const M = useMemo(() => {
    const T = getTextures();
    const wn = T.woodNormal.clone(); wn.repeat.set(3, 1); wn.needsUpdate = true;
    const pl = planks(); pl.repeat.set(1, 1);
    const sail = canvasSail(false), skull = canvasSail(true);
    return {
      hull: hullGeometry(), deck: deckGeometry(), sail, skull, flag: flagTex(),
      hullMat: new THREE.MeshStandardMaterial({ map: pl, normalMap: wn, normalScale: new THREE.Vector2(.8, .8), roughness: .75, side: THREE.DoubleSide }),
      deckMat: new THREE.MeshStandardMaterial({ map: pl, color: "#c9a37a", roughness: .85 }),
      wood: new THREE.MeshStandardMaterial({ color: "#4a2c18", normalMap: wn, roughness: .7 }),
      gold: new THREE.MeshStandardMaterial({ color: "#c9993f", metalness: .7, roughness: .35 }),
      iron: new THREE.MeshStandardMaterial({ color: "#1d1d20", metalness: .6, roughness: .45 }),
      wakeTex: glowTexture("rgba(220,240,245,1)"),
    };
  }, []);

  const rig = useMemo(() => {
    const pts = [
      [[-2.9, .9, 0], [-1.6, 4.4, 0]], [[-1.6, 4.4, 0], [.4, 5.4, 0]], [[.4, 5.4, 0], [3.9, 1.3, 0]],
      [[-1.6, 4.4, 0], [-1.9, .7, .9]], [[-1.6, 4.4, 0], [-1.9, .7, -.9]],
      [[.4, 5.4, 0], [0, .65, .95]], [[.4, 5.4, 0], [0, .65, -.95]],
      [[2, 4.1, 0], [1.8, .7, .85]], [[2, 4.1, 0], [1.8, .7, -.85]],
    ].flat().map((p) => new THREE.Vector3(...p));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const st = useRef({ yaw: null, dir: 1, prevU: null, speed: 0 });
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), q: new THREE.Vector3() }), []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, s = st.current, u = Math.min(.998, Math.max(.001, intro.ship));
    dt = Math.min(dt, .05);
    if (s.prevU === null) s.prevU = u;
    const du = u - s.prevU; s.prevU = u;
    if (Math.abs(du) > 1e-5) s.dir = du > 0 ? 1 : -1;
    s.speed += (Math.min(1, Math.abs(du) / dt * 40) - s.speed) * Math.min(1, dt * 2);

    const p = curve.getPointAt(u, tmp.p), q = curve.getPointAt(Math.min(1, u + .004), tmp.q);
    const dx = q.x - p.x, dz = q.z - p.z, l = Math.hypot(dx, dz) || 1;
    // navega ao lado da rota (não em cima do selo)
    // fica sempre na água: testa os dois bordos, afastando até achar mar
    const nx = -dz / l, nz = dx / l;
    let ox = nx * 2.6, oz = nz * 2.6;
    found: for (const d of [2.6, 4, 5.5, 7, 9, 11]) for (const sg of [s.side || 1, -(s.side || 1)]) {
      if (heightAt(p.x + nx * d * sg, p.z + nz * d * sg) < -.3) { ox = nx * d * sg; oz = nz * d * sg; s.side = sg; break found; }
    }
    if (!s.pos) s.pos = new THREE.Vector3(p.x + ox, .15, p.z + oz);
    s.pos.x += (p.x + ox - s.pos.x) * Math.min(1, dt * 3); s.pos.z += (p.z + oz - s.pos.z) * Math.min(1, dt * 3);
    ref.current.position.copy(s.pos);
    // rumo com giro suave (vira de bordo ao voltar)
    const target = Math.atan2(-dz * s.dir, dx * s.dir);
    if (s.yaw === null) s.yaw = target;
    let diff = target - s.yaw; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    s.yaw += diff * Math.min(1, dt * 2.2);
    ref.current.rotation.set(0, s.yaw, 0);

    // balanço: arfagem, jogo e inclinação na curva
    body.current.position.y = Math.sin(t * 1.4) * .14 + Math.sin(t * 2.3) * .05;
    body.current.rotation.x = Math.sin(t * 1.1) * .05 + diff * .25;
    body.current.rotation.z = Math.sin(t * 1.4 + 1) * .035 - s.speed * .03;

    // velas inflam mais quando o navio anda
    for (const m of sails.current) {
      if (!m) continue;
      const g = m.geometry, a = g.attributes.position.array, { w, h, belly, phase } = m.userData;
      g.userData.base ||= a.slice();
      const b = g.userData.base, k = belly * (.75 + s.speed * .5);
      for (let i = 0; i < a.length; i += 3) {
        const x = b[i] / w + .5, y = b[i + 1] / h + .5;
        a[i + 2] = Math.sin(x * Math.PI) * Math.sin((y * .85 + .15) * Math.PI) * (k + Math.sin(t * 2.2 + y * 3 + phase) * .05);
      }
      g.attributes.position.needsUpdate = true; g.computeVertexNormals();
    }
    // bandeira tremulando
    const fg = flag.current.geometry, fa = fg.attributes.position.array;
    fg.userData.base ||= fa.slice();
    for (let i = 0; i < fa.length; i += 3) { const x = fg.userData.base[i] + .4; fa[i + 2] = Math.sin(x * 6 - t * 7) * x * .18; }
    fg.attributes.position.needsUpdate = true; fg.computeVertexNormals();
    // esteira
    wake.current.material.opacity = .12 + s.speed * .35;
    wake.current.scale.set(4 + s.speed * 3 + Math.sin(t * 3) * .2, 1.6, 1);
  });

  const reg = (i) => (m) => (sails.current[i] = m);
  const lantern = (x, y, z) => (
    <group position={[x, y, z]}>
      <mesh><sphereGeometry args={[.11, 10, 8]} /><meshBasicMaterial color={[4, 2.6, 1]} toneMapped={false} /></mesh>
      <mesh position-y={.13} material={M.iron}><coneGeometry args={[.11, .12, 6]} /></mesh>
    </group>
  );

  return (
    <group ref={ref} scale={.82}>
      <mesh ref={wake} rotation-x={-Math.PI / 2} position={[-3.6, .05, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={M.wakeTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={body}>
        <mesh geometry={M.hull} material={M.hullMat} castShadow />
        <mesh geometry={M.deck} material={M.deckMat} position-y={.42} receiveShadow />
        {/* castelo de popa */}
        <mesh position={[-2.05, .85, 0]} material={M.hullMat} castShadow><boxGeometry args={[1.25, .9, 1.45]} /></mesh>
        <mesh position={[-2.05, 1.32, 0]} material={M.deckMat}><boxGeometry args={[1.35, .06, 1.55]} /></mesh>
        <mesh position={[-2.69, .9, 0]} material={M.gold}><boxGeometry args={[.05, .5, 1.1]} /></mesh>
        {[-.36, 0, .36].map((z) => (
          <mesh key={z} position={[-2.72, .9, z]}><planeGeometry args={[.22, .26]} /><meshBasicMaterial color={[2.6, 1.6, .6]} toneMapped={false} side={THREE.DoubleSide} /></mesh>
        ))}
        {/* amurada */}
        {[1, -1].map((sd) => (
          <group key={sd}>
            {Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[-1.3 + i * .42, .62, sd * .9]} material={M.wood}><boxGeometry args={[.05, .35, .05]} /></mesh>)}
            <mesh position={[.4, .8, sd * .9]} material={M.wood}><boxGeometry args={[3.6, .06, .07]} /></mesh>
            {/* canhões */}
            {[-.8, .2, 1.2].map((x) => (
              <group key={x} position={[x, .2, sd * .93]}>
                <mesh material={M.iron}><boxGeometry args={[.26, .22, .02]} /></mesh>
                <mesh rotation-x={Math.PI / 2} position-z={sd * .14} material={M.iron}><cylinderGeometry args={[.06, .08, .34, 10]} /></mesh>
              </group>
            ))}
          </group>
        ))}
        {/* figura de proa e gurupés */}
        <mesh position={[3.25, .95, 0]} rotation-z={-1.2} material={M.wood}><cylinderGeometry args={[.05, .08, 1.6, 8]} /></mesh>
        <mesh position={[2.72, .62, 0]} material={M.gold}><sphereGeometry args={[.13, 10, 8]} /></mesh>
        {/* mastros e vergas */}
        {[[-1.6, 4.4], [.4, 5.4], [2, 4.1]].map(([x, h]) => (
          <group key={x}>
            <mesh position={[x, h / 2 + .3, 0]} material={M.wood} castShadow><cylinderGeometry args={[.06, .1, h, 8]} /></mesh>
            <mesh position={[x, h * .55 + .3, 0]} rotation-x={Math.PI / 2} material={M.wood}><cylinderGeometry args={[.035, .035, h * .55, 6]} /></mesh>
            <mesh position={[x, h * .88 + .3, 0]} rotation-x={Math.PI / 2} material={M.wood}><cylinderGeometry args={[.03, .03, h * .4, 6]} /></mesh>
            <mesh position={[x, h * .72, 0]} material={M.wood}><cylinderGeometry args={[.22, .2, .08, 10]} /></mesh>
          </group>
        ))}
        <Sail geoRef={reg(0)} x={-1.5} y={2.15} w={1.9} h={1.5} tex={M.sail} phase={0} />
        <Sail geoRef={reg(1)} x={-1.5} y={3.55} w={1.4} h={1.05} tex={M.sail} phase={1} />
        <Sail geoRef={reg(2)} x={.5} y={2.45} w={2.55} h={1.95} tex={M.skull} belly={.5} phase={2} />
        <Sail geoRef={reg(3)} x={.5} y={4.25} w={1.85} h={1.3} tex={M.sail} phase={3} />
        <Sail geoRef={reg(4)} x={2.1} y={2.15} w={1.75} h={1.35} tex={M.sail} phase={4} />
        <Sail geoRef={reg(5)} x={2.1} y={3.4} w={1.3} h={.95} tex={M.sail} phase={5} />
        {/* bujarrona */}
        <mesh position={[3, 2.2, 0]} rotation-y={Math.PI / 2}>
          <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(0, -1.15), new THREE.Vector2(0, 1.75), new THREE.Vector2(1.05, -1.15)])]} />
          <meshStandardMaterial map={M.sail} side={THREE.DoubleSide} roughness={.95} />
        </mesh>
        <lineSegments geometry={rig}><lineBasicMaterial color="#1a120c" transparent opacity={.8} /></lineSegments>
        {/* bandeira negra */}
        <mesh ref={flag} position={[.4 - .4, 5.85, 0]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[.8, .5, 12, 4]} />
          <meshStandardMaterial map={M.flag} side={THREE.DoubleSide} roughness={.9} />
        </mesh>
        {lantern(-2.85, 1.55, .5)}{lantern(-2.85, 1.55, -.5)}{lantern(2.7, 1.1, 0)}
        <pointLight position={[-3, 1.6, 0]} color="#ffc26a" intensity={7} distance={8} />
        <pointLight position={[2.9, 1.1, 0]} color="#ffc26a" intensity={5} distance={7} />
      </group>
    </group>
  );
}
