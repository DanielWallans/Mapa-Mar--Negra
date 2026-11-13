import * as THREE from "three";

/* Texturas procedurais geradas em canvas (sem baixar imagens):
   ruído de detalhe, normal maps, rugosidade, brilho radial e números dos selos. */

function canvas(size) { const c = document.createElement("canvas"); c.width = c.height = size; return c; }

// ruído tileável (value noise periódico)
function tileNoise(size, period, octaves, seed = 1) {
  const out = new Float32Array(size * size);
  const rnd = (x, y, p) => { x = ((x % p) + p) % p; y = ((y % p) + p) % p; const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); };
  let amp = 1, total = 0, p = period;
  for (let o = 0; o < octaves; o++) {
    for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
      const x = i / size * p, y = j / size * p, xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = rnd(xi, yi, p), b = rnd(xi + 1, yi, p), c = rnd(xi, yi + 1, p), d = rnd(xi + 1, yi + 1, p);
      out[j * size + i] += (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * amp;
    }
    total += amp; amp *= .5; p *= 2;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

function toTexture(c, srgb = false, repeat = 1) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function heightToNormal(h, size, strength) {
  const c = canvas(size), x = c.getContext("2d"), img = x.createImageData(size, size);
  const at = (i, j) => h[((j + size) % size) * size + ((i + size) % size)];
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const dx = (at(i + 1, j) - at(i - 1, j)) * strength, dy = (at(i, j + 1) - at(i, j - 1)) * strength;
    const l = Math.hypot(dx, dy, 1), k = (j * size + i) * 4;
    img.data[k] = (-dx / l * .5 + .5) * 255; img.data[k + 1] = (-dy / l * .5 + .5) * 255; img.data[k + 2] = (1 / l * .5 + .5) * 255; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return c;
}

function grayCanvas(h, size, lo, hi) {
  const c = canvas(size), x = c.getContext("2d"), img = x.createImageData(size, size);
  for (let i = 0; i < h.length; i++) { const v = (lo + (hi - lo) * h[i]) * 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  x.putImageData(img, 0, 0);
  return c;
}

let cache;
export function getTextures() {
  if (cache) return cache;
  const S = 256;
  const ground = tileNoise(S, 8, 5, 3);
  const grain = tileNoise(S, 32, 3, 7);
  const mix = ground.map((v, i) => v * .65 + grain[i] * .35);
  const water = tileNoise(S, 6, 5, 11);
  cache = {
    terrainDetail: toTexture(grayCanvas(mix, S, .62, 1.0), true),
    terrainNormal: toTexture(heightToNormal(mix, S, 6)),
    terrainRough: toTexture(grayCanvas(grain, S, .75, 1.0)),
    waterNormal: toTexture(heightToNormal(water, S, 4)),
    woodNormal: toTexture(heightToNormal(tileNoise(S, 4, 4, 21).map((v, i) => v * .3 + Math.sin((i % S) / S * 60 + v * 8) * .35 + .35), S, 3)),
  };
  return cache;
}

export function glowTexture(color = "rgba(255,255,255,1)") {
  const c = canvas(128), x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, color); g.addColorStop(.35, color.replace(/,\s*1\)$/, ",.35)")); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function sealTexture(n, fg, bg) {
  const c = canvas(256), x = c.getContext("2d");
  const g = x.createRadialGradient(100, 90, 10, 128, 128, 128);
  g.addColorStop(0, shade(bg, 30)); g.addColorStop(1, shade(bg, -25));
  x.fillStyle = g; x.beginPath(); x.arc(128, 128, 128, 0, 7); x.fill();
  // borda de cera irregular
  x.strokeStyle = "rgba(255,240,210,.35)"; x.lineWidth = 6; x.beginPath();
  for (let a = 0; a <= 6.3; a += .05) { const r = 100 + Math.sin(a * 9) * 3 + Math.sin(a * 23) * 2; x.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); }
  x.stroke();
  x.fillStyle = fg; x.font = "500 110px 'IBM Plex Mono', monospace"; x.textAlign = "center"; x.textBaseline = "middle";
  x.shadowColor = "rgba(0,0,0,.35)"; x.shadowOffsetY = 3; x.shadowBlur = 4;
  x.fillText(String(n), 128, 136);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${g},${b})`;
}
