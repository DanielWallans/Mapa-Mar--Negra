import * as THREE from "three";
import { POS, DIAS_CONCLUIDOS, CHEFES } from "./data";

export const W = (x) => (x - 600) / 10; // mapa (1200x800) -> mundo
export const Z = (y) => (y - 400) / 10;

export function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
export function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x, y, o = 4) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f); a *= .5; f *= 2.03; } return s; }

export const ISLES = [
  { cx: 240, cy: 628, rx: 190, ry: 92, ph: 1, h: 3.2, kind: "porto" },
  { cx: 268, cy: 258, rx: 175, ry: 128, ph: 2.4, h: 4.2, kind: "fazenda" },
  { cx: 626, cy: 418, rx: 175, ry: 128, ph: .7, h: 4.6, kind: "reino" },
  { cx: 966, cy: 268, rx: 150, ry: 168, ph: 3.3, h: 5.5, kind: "vulcao" },
  { cx: 452, cy: 112, rx: 46, ry: 26, ph: 5, h: 1.6, kind: "ilhota" },
  { cx: 760, cy: 640, rx: 70, ry: 34, ph: 4, h: 1.8, kind: "ilhota" },
  { cx: 1130, cy: 600, rx: 40, ry: 24, ph: 2, h: 1.4, kind: "ilhota" },
  { cx: 60, cy: 90, rx: 38, ry: 22, ph: 6, h: 1.4, kind: "ilhota" },
].map((s) => ({ ...s, x: W(s.cx), z: Z(s.cy), ax: s.rx / 10 * 1.05, az: s.ry / 10 * 1.05 }));

export const VOLCANO = { x: W(982), z: Z(128) - 1 };

export function isleHeight(s, x, z) {
  const dx = (x - s.x) / s.ax, dz = (z - s.z) / s.az;
  const ang = Math.atan2(dz, dx);
  const wob = 1 + .16 * (Math.sin(ang * 3 + s.ph) * .6 + Math.sin(ang * 5 + s.ph * 2) * .4);
  const d = Math.sqrt(dx * dx + dz * dz) / wob;
  if (d > 1.15) return -3;
  const t = Math.max(0, 1 - d);
  let h = Math.pow(t, .8) * s.h * (.55 + fbm(x * .18 + s.ph, z * .18) * .9) - .6 + (d > 1 ? -(d - 1) * 12 : 0);
  h += (fbm(x * .9, z * .9, 3) - .5) * .35 * t; // micro relevo
  if (s.kind === "vulcao") {
    const vd = Math.hypot(x - VOLCANO.x, z - VOLCANO.z);
    h += Math.max(0, 9 - vd * .9) * 1.25;
    if (vd < 2.2) h -= (2.2 - vd) * 1.6;
  }
  return h;
}
export function heightAt(x, z) { let h = -3; for (const s of ISLES) h = Math.max(h, isleHeight(s, x, z)); return h; }

export const estado = (d) => (d <= DIAS_CONCLUIDOS ? "done" : d === DIAS_CONCLUIDOS + 1 ? "now" : "locked");
export const isBoss = (d) => CHEFES.includes(d);
export const DIA_ATUAL = Math.min(30, DIAS_CONCLUIDOS + 1);

export function dayPoint(d) { const x = W(POS[d][0]), z = Z(POS[d][1]); return new THREE.Vector3(x, Math.max(.2, heightAt(x, z)) + .9, z); }

// curva da rota + posição (0..1) de cada dia nela
function buildRoute() {
  const pts = [];
  for (let d = 1; d <= 30; d++) {
    pts.push(dayPoint(d));
    if (d < 30) {
      const a = dayPoint(d), b = dayPoint(d + 1), m = a.clone().lerp(b, .5);
      m.y = Math.max(m.y, Math.max(.2, heightAt(m.x, m.z)) + .9) + a.distanceTo(b) * .08;
      pts.push(m);
    }
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const N = 3000, sp = [];
  for (let i = 0; i <= N; i++) sp.push(curve.getPointAt(i / N));
  const dayU = {};
  for (let d = 1; d <= 30; d++) {
    const p = dayPoint(d); let best = 0, bd = 1e9;
    sp.forEach((q, i) => { const dd = q.distanceToSquared(p); if (dd < bd) { bd = dd; best = i; } });
    dayU[d] = best / N;
  }
  return { curve, dayU };
}
let _route;
export const route = () => (_route ||= buildRoute());

// vistas da câmera: [posição, alvo]
export const VIEWS = [
  { pos: [-34, 78, 70], target: [0, 0, 2] },
  { pos: [W(250) - 8, 26, Z(630) + 30], target: [W(250), 0, Z(630)] },
  { pos: [W(268) + 8, 28, Z(258) + 32], target: [W(268), 1, Z(258)] },
  { pos: [W(626) - 12, 28, Z(418) + 32], target: [W(626), 1, Z(418)] },
  { pos: [W(960) - 22, 34, Z(250) + 34], target: [W(960), 3, Z(250)] },
];

// estado compartilhado da intro (animado por GSAP, lido nos useFrame)
export const intro = (globalThis.__mareIntro ||= { reveal: 0, prog: 0, ship: 0, seals: 0, instant: false });

// lugar do Espantalho na Fazenda dos Laços: terra firme, longe dos selos e do moinho
let _esp;
export function espantalhoPos() {
  if (_esp) return _esp;
  const cx = W(268), cz = Z(258); let best = null, bs = -1;
  for (let i = -14; i <= 14; i += .5) for (let j = -14; j <= 14; j += .5) {
    const x = cx + i, z = cz + j, h = heightAt(x, z);
    if (h < 1 || h > 3.2) continue;
    const ds = Math.min(...Object.values(POS).map(([px, py]) => Math.hypot(W(px) - x, Z(py) - z)), Math.hypot(W(356) - x, Z(214) - z));
    const sc = Math.min(ds, 7) * 10 - Math.hypot(i, j) * .4;
    if (sc > bs) { bs = sc; best = [x, h, z]; }
  }
  return (_esp = best || [cx, heightAt(cx, cz), cz]);
}

// rota marítima do navio: contorna as ilhas pela água (A* numa grade) e
// para no "atracadouro" de cada dia, o ponto de mar mais perto do selo.
let _sea;
export function seaRoute() {
  if (_sea) return _sea;
  const X0 = -80, Z0 = -60, C = 1, NX = 160, NZ = 120;
  const wx = (i) => X0 + i * C, wz = (j) => Z0 + j * C;
  const ok = new Uint8Array(NX * NZ);
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) {
    const x = wx(i), z = wz(j); let w = heightAt(x, z) < -.6;
    for (let a = 0; w && a < 8; a++) w = heightAt(x + Math.cos(a * .785) * 1.8, z + Math.sin(a * .785) * 1.8) < -.2;
    ok[j * NX + i] = w ? 1 : 0;
  }
  const cell = (x, z) => [Math.round((x - X0) / C), Math.round((z - Z0) / C)];
  const free = (x, z) => { const [i, j] = cell(x, z); return i >= 0 && j >= 0 && i < NX && j < NZ && ok[j * NX + i]; };
  const dock = (p) => { // célula de água mais próxima do selo
    const [ci, cj] = cell(p.x, p.z);
    for (let r = 0; r < 40; r++) { let best = null, bd = 1e9;
      for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) {
        if (i < 0 || j < 0 || i >= NX || j >= NZ || !ok[j * NX + i]) continue;
        const d = (i - ci) ** 2 + (j - cj) ** 2; if (d < bd) { bd = d; best = [i, j]; }
      }
      if (best) return best; }
    return [ci, cj];
  };
  const astar = (s, g) => {
    const key = (i, j) => j * NX + i, G = new Float32Array(NX * NZ).fill(1e9), from = new Int32Array(NX * NZ).fill(-1);
    const H = [], push = (n) => { H.push(n); let i = H.length - 1; while (i) { const p = (i - 1) >> 1; if (H[p][0] <= H[i][0]) break; [H[p], H[i]] = [H[i], H[p]]; i = p; } };
    const pop = () => { const top = H[0], last = H.pop(); if (H.length) { H[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < H.length && H[l][0] < H[m][0]) m = l; if (r < H.length && H[r][0] < H[m][0]) m = r; if (m === i) break; [H[m], H[i]] = [H[i], H[m]]; i = m; } } return top; };
    const closed = new Uint8Array(NX * NZ); push([0, s[0], s[1]]); G[key(...s)] = 0;
    const hh = (i, j) => Math.hypot(i - g[0], j - g[1]);
    while (H.length) {
      const [, i, j] = pop(); if (closed[key(i, j)]) continue; closed[key(i, j)] = 1;
      if (i === g[0] && j === g[1]) break;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue; const ni = i + di, nj = j + dj;
        if (ni < 0 || nj < 0 || ni >= NX || nj >= NZ || !ok[key(ni, nj)]) continue;
        const ng = G[key(i, j)] + Math.hypot(di, dj);
        if (ng < G[key(ni, nj)]) { G[key(ni, nj)] = ng; from[key(ni, nj)] = key(i, j); push([ng + hh(ni, nj), ni, nj]); }
      }
    }
    const out = []; let k = key(...g);
    while (k !== -1) { out.push(new THREE.Vector3(wx(k % NX), .15, wz(Math.floor(k / NX)))); k = from[k]; }
    return out.reverse();
  };
  const sight = (a, b) => { const n = Math.ceil(a.distanceTo(b) / .5); for (let t = 1; t < n; t++) { const p = a.clone().lerp(b, t / n); if (!free(p.x, p.z)) return false; } return true; };
  const pull = (pts) => { const out = [pts[0]]; let i = 0;
    while (i < pts.length - 1) { let k = pts.length - 1; while (k > i + 1 && !sight(pts[i], pts[k])) k--; out.push(pts[k]); i = k; }
    return out; };
  const docks = []; for (let d = 1; d <= 30; d++) docks.push(dock(dayPoint(d)));
  const pts = [], dockIdx = {};
  for (let d = 1; d <= 30; d++) {
    if (d === 1) { const [i, j] = docks[0]; pts.push(new THREE.Vector3(wx(i), .15, wz(j))); dockIdx[1] = 0; continue; }
    const seg = pull(astar(docks[d - 2], docks[d - 1]));
    for (let k = 1; k < seg.length; k++) {
      const a = pts[pts.length - 1], b = seg[k], L = a.distanceTo(b), n = Math.max(1, Math.floor(L / 4));
      for (let t = 1; t <= n; t++) pts.push(a.clone().lerp(b, t / n)); // pontos intermediários deixam a curva colada à rota
    }
    if (seg.length < 2) pts.push(pts[pts.length - 1].clone().add(new THREE.Vector3(.01, 0, .01)));
    dockIdx[d] = pts.length - 1;
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal", .3);
  // u de cada atracadouro (busca monotônica pelo ponto mais próximo)
  const N = 6000, sp = []; for (let i = 0; i <= N; i++) sp.push(curve.getPointAt(i / N));
  const dockU = {}; let from = 0;
  for (let d = 1; d <= 30; d++) {
    const p = pts[dockIdx[d]]; let best = from, bd = 1e9;
    for (let i = from; i <= N; i++) { const dd = sp[i].distanceToSquared(p); if (dd < bd) { bd = dd; best = i; } if (dd > bd + 900) break; }
    dockU[d] = best / N; from = best;
  }
  return (_sea = { curve, dockU });
}
