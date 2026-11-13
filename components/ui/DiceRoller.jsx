"use client";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "motion/react";
import * as THREE from "three";

/* ============================================================
   Mesa de dados 3D: d20, d6 e d8 com faces numeradas.
   A rolagem gira, quica e assenta com a face sorteada
   virada para a câmera — igual a dado.nextInt(lados) + 1.
   ============================================================ */

const DICE = {
  20: { nome: "d20", cor: "#7a1d22", borda: "#f0c36a", tinta: "#f6e6cf", size: 1.15 },
  6: { nome: "d6", cor: "#efe1bd", borda: "#5a3420", tinta: "#2b1d12", size: .95 },
  8: { nome: "d8", cor: "#1f4e52", borda: "#9ffbe8", tinta: "#eafff9", size: 1.1 },
};

function numberTexture(n, color) {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = color; x.font = "700 70px Georgia, serif"; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(String(n), 64, 64);
  if (n === 6 || n === 9) x.fillRect(40, 102, 48, 6); // distingue 6 de 9
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// faces: { n (normal), up, center, value }
function buildDie(lados) {
  const s = DICE[lados].size;
  let geo, faces = [];
  if (lados === 6) {
    geo = new THREE.BoxGeometry(s * 1.3, s * 1.3, s * 1.3);
    const h = s * .65;
    // faces opostas somam 7
    const defs = [[1, [0, 0, 1], [0, 1, 0]], [6, [0, 0, -1], [0, 1, 0]], [2, [1, 0, 0], [0, 1, 0]], [5, [-1, 0, 0], [0, 1, 0]], [3, [0, 1, 0], [0, 0, -1]], [4, [0, -1, 0], [0, 0, 1]]];
    faces = defs.map(([value, n, up]) => {
      const N = new THREE.Vector3(...n);
      return { value, n: N, up: new THREE.Vector3(...up), center: N.clone().multiplyScalar(h), scale: s * .8 };
    });
  } else {
    geo = (lados === 20 ? new THREE.IcosahedronGeometry(s, 0) : new THREE.OctahedronGeometry(s, 0)).toNonIndexed();
    const p = geo.attributes.position, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    // numeração em que faces opostas somam lados + 1
    const raw = [];
    for (let i = 0; i < p.count; i += 3) {
      a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
      const center = a.clone().add(b).add(c).divideScalar(3);
      raw.push({ center, n: center.clone().normalize(), up: a.clone().sub(center).normalize() });
    }
    const used = new Array(raw.length).fill(false);
    let v = 1;
    raw.forEach((f, i) => {
      if (used[i]) return;
      let opp = -1, best = 1;
      raw.forEach((g, j) => { if (j !== i && !used[j]) { const d = f.n.dot(g.n); if (d < best) { best = d; opp = j; } } });
      used[i] = used[opp] = true;
      f.value = v; raw[opp].value = lados + 1 - v; v++;
    });
    faces = raw.map((f) => ({ ...f, center: f.center.multiplyScalar(1.01), scale: lados === 20 ? s * .5 : s * .62 }));
  }
  geo.computeVertexNormals();
  // orientação do rótulo e quaternion final de cada face (face -> câmera, número em pé)
  faces.forEach((f) => {
    const x = new THREE.Vector3().crossVectors(f.up, f.n).normalize();
    const up = new THREE.Vector3().crossVectors(f.n, x).normalize();
    const m = new THREE.Matrix4().makeBasis(x, up, f.n);
    f.labelQ = new THREE.Quaternion().setFromRotationMatrix(m);
    f.restQ = f.labelQ.clone().invert();
  });
  return { geo, faces };
}

const Die = forwardRef(function Die({ lados, x, onResult }, ref) {
  const { geo, faces } = useMemo(() => buildDie(lados), [lados]);
  const cfg = DICE[lados];
  const mats = useMemo(() => faces.map((f) => new THREE.MeshBasicMaterial({ map: numberTexture(f.value, cfg.tinta), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })), [faces, cfg]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 10), [geo]);
  const group = useRef(), glow = useRef();
  const st = useRef({ rolling: false, t: 0, dur: 1.6, axis: new THREE.Vector3(1, 0, 0), spin: 0, from: new THREE.Quaternion(), to: faces[0].restQ.clone(), value: 1, flash: 0 });
  const tmp = useMemo(() => new THREE.Quaternion(), []);

  useImperativeHandle(ref, () => ({
    roll(delay = 0) {
      const s = st.current;
      const face = faces[Math.floor(Math.random() * faces.length)]; // dado.nextInt(lados) + 1
      s.value = face.value;
      // gira um pouco em torno do eixo de visão para não parar sempre igual
      s.to = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (Math.random() - .5) * .5).multiply(face.restQ);
      s.from.copy(group.current.quaternion);
      s.axis.set(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize();
      s.spin = 14 + Math.random() * 10;
      s.t = -delay; s.dur = 1.4 + Math.random() * .5; s.rolling = true;
    },
  }), [faces]);

  useFrame((_, dt) => {
    const s = st.current, g = group.current;
    if (s.rolling) {
      s.t += dt;
      if (s.t < 0) return;
      const p = Math.min(1, s.t / s.dur);
      // giro que desacelera
      const ang = s.spin * (p - p * p * .5) * s.dur * .6;
      tmp.setFromAxisAngle(s.axis, ang).multiply(s.from);
      const settle = THREE.MathUtils.smoothstep(p, .55, 1);
      g.quaternion.slerpQuaternions(tmp, s.to, settle);
      // quiques
      const bounce = Math.abs(Math.cos(p * Math.PI * 3)) * Math.pow(1 - p, 2) * 1.8;
      g.position.y = bounce;
      const squash = 1 - Math.max(0, .12 - bounce) * .8;
      g.scale.set(1 / squash, squash, 1 / squash);
      if (p >= 1) { s.rolling = false; g.position.y = 0; g.scale.setScalar(1); s.flash = 1; onResult(lados, s.value); }
    }
    s.flash = Math.max(0, s.flash - dt * 1.5);
    glow.current.material.opacity = s.flash * .9;
    glow.current.scale.setScalar(2.4 + (1 - s.flash) * 1.2);
  });

  return (
    <group position={[x, 0, 0]}>
      <group ref={group} quaternion={faces[faces.length - 1].restQ}>
        <mesh geometry={geo} castShadow>
          <meshPhysicalMaterial color={cfg.cor} roughness={.25} metalness={.05} clearcoat={1} clearcoatRoughness={.15} flatShading />
        </mesh>
        <lineSegments geometry={edges}><lineBasicMaterial color={cfg.borda} transparent opacity={.75} /></lineSegments>
        {faces.map((f, i) => (
          <mesh key={i} position={f.center} quaternion={f.labelQ} material={mats[i]}>
            <planeGeometry args={[f.scale, f.scale]} />
          </mesh>
        ))}
      </group>
      <mesh ref={glow} position={[0, 0, -1]}>
        <circleGeometry args={[1, 48]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* sombra no pergaminho */}
      <mesh position={[0, -1.35, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#3b2410" transparent opacity={.22} depthWrite={false} />
      </mesh>
    </group>
  );
});

const MSG = (lados, v) => {
  if (lados === 20 && v === 20) return "CRÍTICO!";
  if (lados === 20 && v === 1) return "Falha crítica...";
  return null;
};

export default function DiceRoller({ lados = [20, 6, 8] }) {
  const refs = useRef({});
  const [res, setRes] = useState({});
  const [log, setLog] = useState([]);
  const [busy, setBusy] = useState(0);
  const vez = useRef(0);
  // primeira rolagem automática quando o pergaminho abre
  useEffect(() => { const t = setTimeout(() => rolar(lados), 1500); return () => clearTimeout(t); }, []); // eslint-disable-line

  const rodada = useRef({}); // dado -> id da rodada em que foi lançado
  const rolar = (list) => {
    vez.current += 1;
    const id = vez.current;
    setBusy((b) => b + list.length);
    setLog((g) => [{ id, dados: list, vals: {} }, ...g].slice(0, 3));
    list.forEach((l, i) => { rodada.current[l] = id; setRes((r) => ({ ...r, [l]: null })); refs.current[l]?.roll(i * .12); });
  };
  const onResult = (l, v) => {
    setBusy((b) => Math.max(0, b - 1));
    setRes((r) => ({ ...r, [l]: v }));
    const id = rodada.current[l];
    setLog((g) => g.map((e) => (e.id === id ? { ...e, vals: { ...e.vals, [l]: v } } : e)));
  };

  const spacing = 3.1, x0 = -spacing * (lados.length - 1) / 2;
  return (
    <div className="dice">
      <h3>Mesa de dados</h3>
      <div className="dice-stage">
        <Canvas shadows dpr={[1, 2]} resize={{ offsetSize: true }} camera={{ position: [0, .6, 7.4], fov: 38 }} gl={{ alpha: true, antialias: true }}>
          <ambientLight intensity={.9} />
          <directionalLight position={[3, 6, 5]} intensity={2.2} color="#fff2d6" castShadow />
          <pointLight position={[-4, 2, 3]} intensity={18} color="#ffb867" />
          {lados.map((l, i) => (
            <Die key={l} lados={l} x={x0 + i * spacing} onResult={onResult} ref={(r) => (refs.current[l] = r)} />
          ))}
        </Canvas>
        <div className="dice-results">
          {lados.map((l) => (
            <div key={l} className="dice-res">
              <span className="dice-name">{DICE[l].nome}</span>
              <AnimatePresence mode="popLayout">
                <motion.b key={res[l] ?? "—"} initial={{ y: -14, opacity: 0, scale: .6 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 10, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className={MSG(l, res[l]) ? (res[l] === 20 ? "crit" : "fail") : ""}>
                  {res[l] ?? "—"}
                </motion.b>
              </AnimatePresence>
              <button type="button" onClick={() => rolar([l])}>Rolar</button>
            </div>
          ))}
        </div>
      </div>
      <div className="dice-actions">
        <motion.button type="button" className="dice-all" whileHover={{ scale: 1.03 }} whileTap={{ scale: .95 }} onClick={() => rolar(lados)} disabled={busy > 0}>
          Rolar todos os dados
        </motion.button>
        <code>dado.nextInt(lados) + 1</code>
      </div>
      <ul className="dice-log" aria-live="polite">
        <AnimatePresence initial={false}>
          {log.map((l) => (
            <motion.li key={l.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <code>Rolagem {l.id}: {l.dados.map((d) => `d${d} ${l.vals[d] ?? "…"}`).join(" · ")}</code>
              {MSG(20, l.vals[20]) && <strong className={l.vals[20] === 20 ? "crit" : "fail"}> {MSG(20, l.vals[20])}</strong>}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
