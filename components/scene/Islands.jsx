"use client";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ISLES, VOLCANO, isleHeight, heightAt, fbm, hash, W, Z } from "@/lib/world";
import { POS } from "@/lib/data";
import { getTextures } from "@/lib/textures";

const C = {
  sand: new THREE.Color("#e0c891"), grass: new THREE.Color("#6d8c45"), forest: new THREE.Color("#35502b"),
  rock: new THREE.Color("#6e5c4b"), stone: new THREE.Color("#8f86a0"), ash: new THREE.Color("#2a211d"),
  snow: new THREE.Color("#f1e8d6"), lava: new THREE.Color("#ff5a1f"), wet: new THREE.Color("#33433e"),
};
function colorFor(kind, h, x, z) {
  const n = fbm(x * .5, z * .5);
  if (h < .15) return C.wet.clone().lerp(C.sand, Math.max(0, (h + .6) / .75));
  if (h < .55) return C.sand.clone().lerp(C.grass, n * .4);
  if (kind === "vulcao") {
    if (h > 9) return C.ash.clone().lerp(C.lava, Math.max(0, (h - 9) / 3) * .55);
    return C.rock.clone().lerp(C.ash, Math.min(1, h / 8) + n * .2);
  }
  if (kind === "reino") return C.grass.clone().lerp(C.stone, Math.min(1, h / 5) * .7 + n * .2);
  if (h > 3.6) return C.rock.clone().lerp(C.snow, Math.min(1, (h - 3.6) / 1.2));
  return C.grass.clone().lerp(C.forest, Math.min(1, h / 3) * .8 + n * .25);
}

function Island({ s }) {
  const { geo, mat } = useMemo(() => {
    const sx = s.ax * 2.5, sz = s.az * 2.5 + (s.kind === "vulcao" ? 6 : 0);
    const seg = s.kind === "ilhota" ? 40 : 140;
    const geo = new THREE.PlaneGeometry(sx, sz, seg, seg).rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, cols = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + s.x, z = pos.getZ(i) + s.z, h = isleHeight(s, x, z);
      pos.setY(i, h);
      const c = colorFor(s.kind, h, x, z); cols.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();
    const T = getTextures(), rep = Math.max(sx, sz) / 5;
    const tex = (t) => { const c = t.clone(); c.repeat.set(rep, rep); c.needsUpdate = true; return c; };
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true, map: tex(T.terrainDetail), normalMap: tex(T.terrainNormal), normalScale: new THREE.Vector2(1.4, 1.4),
      roughnessMap: tex(T.terrainRough), roughness: 1, metalness: 0,
    });
    return { geo, mat };
  }, [s]);
  return (
    <group>
      <mesh geometry={geo} material={mat} position={[s.x, 0, s.z]} castShadow receiveShadow />
    </group>
  );
}

function Trees() {
  const ref = useRef(), ref2 = useRef();
  const list = useMemo(() => {
    const out = [];
    for (let i = 0; i < 2000 && out.length < 420; i++) {
      const x = -60 + hash(i, 1) * 120, z = -40 + hash(i, 7) * 80, h = heightAt(x, z);
      if (h < .7 || h > 3.8) continue;
      if (Math.hypot(x - VOLCANO.x, z - VOLCANO.z) < 9) continue;
      if (Object.values(POS).some(([px, py]) => Math.hypot(W(px) - x, Z(py) - z) < 2.2)) continue;
      if (Math.hypot(x - W(626), z - Z(400)) < 5) continue;
      out.push({ x, z, h, s: .5 + hash(i, 3) * .9, r: hash(i, 9) * 6 });
    }
    return out;
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    list.forEach((t, i) => {
      q.setFromEuler(new THREE.Euler(0, t.r, 0));
      m.compose(new THREE.Vector3(t.x, t.h + .9 * t.s, t.z), q, new THREE.Vector3(t.s, t.s, t.s));
      ref.current.setMatrixAt(i, m);
      ref.current.setColorAt(i, c.set(i % 3 ? "#2c4a2a" : "#456b3a"));
      m.compose(new THREE.Vector3(t.x, t.h + .25 * t.s, t.z), q, new THREE.Vector3(t.s, t.s, t.s));
      ref2.current.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true; ref.current.instanceColor.needsUpdate = true;
    ref2.current.instanceMatrix.needsUpdate = true;
  }, [list]);
  return (
    <group>
      <instancedMesh ref={ref} args={[null, null, list.length]} castShadow>
        <coneGeometry args={[.6, 1.9, 7]} />
        <meshStandardMaterial roughness={.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={ref2} args={[null, null, list.length]}>
        <cylinderGeometry args={[.08, .12, .5, 5]} />
        <meshStandardMaterial color="#4a3020" roughness={1} />
      </instancedMesh>
    </group>
  );
}

export default function Islands() {
  return (
    <group>
      {ISLES.map((s, i) => <Island key={i} s={s} />)}
      <Trees />
    </group>
  );
}
