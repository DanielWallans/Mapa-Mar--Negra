/* ============================================================
   CENA 3D — Three.js
   Converte a carta 2D (viewBox 1200x800) num arquipélago 3D
   flutuando numa maré negra bioluminescente.
   ============================================================ */
(function () {
  const W = (x) => (x - 600) / 10; // mapa -> mundo
  const Z = (y) => (y - 400) / 10;

  // ---------- ruído simples ----------
  function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y) { let s = 0, a = .5, f = 1; for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, y * f); a *= .5; f *= 2.03; } return s; }

  // ---------- ilhas ----------
  const ISLES = [
    { cx: 240, cy: 628, rx: 190, ry: 92, ph: 1, h: 3.2, kind: "porto" },
    { cx: 268, cy: 258, rx: 175, ry: 128, ph: 2.4, h: 4.2, kind: "fazenda" },
    { cx: 626, cy: 418, rx: 175, ry: 128, ph: .7, h: 4.6, kind: "reino" },
    { cx: 966, cy: 268, rx: 150, ry: 168, ph: 3.3, h: 5.5, kind: "vulcao" },
    { cx: 452, cy: 112, rx: 46, ry: 26, ph: 5, h: 1.6, kind: "ilhota" },
    { cx: 760, cy: 640, rx: 70, ry: 34, ph: 4, h: 1.8, kind: "ilhota" },
    { cx: 1130, cy: 600, rx: 40, ry: 24, ph: 2, h: 1.4, kind: "ilhota" },
    { cx: 60, cy: 90, rx: 38, ry: 22, ph: 6, h: 1.4, kind: "ilhota" },
  ].map((s) => ({ ...s, x: W(s.cx), z: Z(s.cy), ax: s.rx / 10 * 1.05, az: s.ry / 10 * 1.05 }));
  const VOLCANO = { x: W(982), z: Z(128) - 1 };

  function isleHeight(s, x, z) {
    const dx = (x - s.x) / s.ax, dz = (z - s.z) / s.az;
    const ang = Math.atan2(dz, dx);
    const wob = 1 + .16 * (Math.sin(ang * 3 + s.ph) * .6 + Math.sin(ang * 5 + s.ph * 2) * .4);
    const d = Math.sqrt(dx * dx + dz * dz) / wob;
    if (d > 1.15) return -3;
    const t = Math.max(0, 1 - d);
    let h = Math.pow(t, .8) * s.h * (.55 + fbm(x * .18 + s.ph, z * .18) * .9) - .6 + (d > 1 ? -(d - 1) * 12 : 0);
    if (s.kind === "vulcao") {
      const vd = Math.hypot(x - VOLCANO.x, z - VOLCANO.z);
      h += Math.max(0, 9 - vd * .9) * 1.25;
      if (vd < 2.2) h -= (2.2 - vd) * 1.6; // cratera
    }
    return h;
  }
  function heightAt(x, z) { let h = -3; for (const s of ISLES) h = Math.max(h, isleHeight(s, x, z)); return h; }

  const C = {
    sand: new THREE.Color("#d9c48e"), grass: new THREE.Color("#6f8a4a"), forest: new THREE.Color("#3e5530"),
    rock: new THREE.Color("#6b5a4a"), stone: new THREE.Color("#8a7f95"), ash: new THREE.Color("#2c2420"),
    snow: new THREE.Color("#ece3d0"), lava: new THREE.Color("#ff5a1f"), wet: new THREE.Color("#3a4a44"),
  };
  function colorFor(kind, h, x, z) {
    const n = fbm(x * .5, z * .5);
    if (h < .15) return C.wet.clone().lerp(C.sand, Math.max(0, (h + .6) / .75));
    if (h < .55) return C.sand.clone().lerp(C.grass, n * .4);
    if (kind === "vulcao") {
      if (h > 9) return C.ash.clone().lerp(C.lava, Math.max(0, (h - 9) / 3) * .6);
      return C.rock.clone().lerp(C.ash, Math.min(1, h / 8) + n * .2);
    }
    if (kind === "reino") return C.grass.clone().lerp(C.stone, Math.min(1, h / 5) * .7 + n * .2);
    if (h > 3.6) return C.rock.clone().lerp(C.snow, Math.min(1, (h - 3.6) / 1.2));
    return C.grass.clone().lerp(C.forest, Math.min(1, h / 3) * .8 + n * .25);
  }

  // ---------- estado ----------
  let renderer, scene, camera, clock, oceanMat, routeMat, ship, raycaster, pointer;
  const markers = [];
  const labelAnchors = [];
  const animated = [];
  const cam = { target: new THREE.Vector3(0, 0, 0), radius: 105, theta: -0.35, phi: 0.95 };
  let curve, dayU = {};
  let hovered = null;
  const handlers = { hover: () => {}, click: () => {} };

  // ---------- oceano ----------
  function makeOcean() {
    const geo = new THREE.PlaneGeometry(400, 400, 220, 220);
    geo.rotateX(-Math.PI / 2);
    oceanMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() } },
      vertexShader: `
        uniform float uTime; varying float vH; varying vec3 vW;
        float wave(vec2 p, vec2 d, float f, float s){ return sin(dot(p,d)*f + uTime*s); }
        void main(){
          vec3 p = position;
          float h = wave(p.xz, vec2(1.,.3), .18, 1.1)*.45 + wave(p.xz, vec2(-.4,1.), .27, 1.6)*.28
                  + wave(p.xz, vec2(.7,-.7), .55, 2.3)*.12 + wave(p.xz, vec2(.2,.9), 1.1, 3.1)*.05;
          p.y += h; vH = h;
          vec4 w = modelMatrix * vec4(p,1.); vW = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: `
        uniform float uTime; uniform vec3 uCam; varying float vH; varying vec3 vW;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
        float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+1.),f.x), f.y); }
        void main(){
          vec3 deep = vec3(.012,.03,.045), mid = vec3(.03,.11,.14), crest = vec3(.25,.95,.82);
          vec3 col = mix(deep, mid, smoothstep(-.6,.7,vH));
          // veios bioluminescentes que derivam com a maré
          float n = n2(vW.xz*.12 + vec2(uTime*.05, uTime*.03)) * n2(vW.xz*.31 - uTime*.07);
          float vein = smoothstep(.42,.47,n) * (1. - smoothstep(.47,.52,n));
          col += crest * vein * .35;
          col += crest * smoothstep(.55,.85,vH) * .35;
          // brilho da lua
          vec3 V = normalize(uCam - vW);
          float moon = pow(max(0., dot(reflect(-V, vec3(0,1,0)), normalize(vec3(-.4,.35,-.8)))), 40.);
          col += vec3(.9,.85,.7) * moon * .6;
          float dist = length(vW.xz);
          col = mix(col, vec3(.01,.02,.035), smoothstep(70.,180.,dist));
          gl_FragColor = vec4(col, 1.);
        }`,
    });
    const m = new THREE.Mesh(geo, oceanMat);
    scene.add(m);
  }

  // ---------- terreno ----------
  function makeIslands() {
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .92, metalness: 0 });
    for (const s of ISLES) {
      const sx = s.ax * 2.5, sz = s.az * 2.5 + (s.kind === "vulcao" ? 6 : 0);
      const seg = s.kind === "ilhota" ? 28 : 90;
      const geo = new THREE.PlaneGeometry(sx, sz, seg, seg);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position, cols = [];
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i) + s.x, z = pos.getZ(i) + s.z;
        const h = isleHeight(s, x, z);
        pos.setY(i, h);
        const c = colorFor(s.kind, h, x, z).convertSRGBToLinear();
        cols.push(c.r, c.g, c.b);
      }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(s.x, 0, s.z);
      mesh.userData.isle = s;
      scene.add(mesh);
      // espuma ao redor da costa
      const foam = new THREE.Mesh(new THREE.RingGeometry(.96, 1.12, 64), new THREE.MeshBasicMaterial({ color: 0x8ff5e0, transparent: true, opacity: .18, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
      foam.rotation.x = -Math.PI / 2; foam.scale.set(s.ax, s.az, 1); foam.position.set(s.x, .35, s.z);
      scene.add(foam);
      animated.push((t) => { foam.material.opacity = .1 + Math.sin(t * 1.4 + s.ph) * .07; const k = 1 + Math.sin(t * .9 + s.ph) * .025; foam.scale.set(s.ax * k, s.az * k, 1); });
    }
  }

  // ---------- decoração ----------
  const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .8, ...o });
  function place(obj, x, z, lift = 0) { obj.position.set(x, heightAt(x, z) + lift, z); scene.add(obj); return obj; }

  function trees() {
    const g1 = new THREE.ConeGeometry(.55, 1.8, 6), m1 = std("#2f4a2a"), m2 = std("#41603a");
    let n = 0;
    for (let i = 0; i < 900 && n < 260; i++) {
      const x = -60 + hash(i, 1) * 120, z = -40 + hash(i, 7) * 80;
      const h = heightAt(x, z);
      if (h < .7 || h > 3.6) continue;
      if (Math.hypot(x - VOLCANO.x, z - VOLCANO.z) < 9) continue;
      let near = false; for (const k in POS) { if (Math.hypot(W(POS[k][0]) - x, Z(POS[k][1]) - z) < 2.2) { near = true; break; } }
      if (near) continue;
      const t = new THREE.Mesh(g1, n % 2 ? m1 : m2);
      const s = .6 + hash(i, 3) * .8; t.scale.set(s, s, s);
      place(t, x, z, .7 * s); n++;
    }
  }

  function lighthouse() {
    const g = new THREE.Group();
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(.5, .8, 4, 10), std("#e8dcc0"));
    tower.position.y = 2; g.add(tower);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(.62, .66, .5, 10), std("#8e1f22")); band.position.y = 2.6; g.add(band);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(.45, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffe9a8 })); lamp.position.y = 4.3; g.add(lamp);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(2.4, 22, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xfff1c0, transparent: true, opacity: .1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    beam.geometry.translate(0, -11, 0); beam.rotation.z = Math.PI / 2;
    const pivot = new THREE.Group(); pivot.position.y = 4.3; pivot.add(beam); g.add(pivot);
    const light = new THREE.PointLight(0xffd88a, 1.2, 18); light.position.y = 4.3; g.add(light);
    place(g, W(70), Z(610), -.2);
    animated.push((t) => { pivot.rotation.y = t * .8; });
  }

  function windmill() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.6, .9, 2.6, 8), std("#d9c9a4")); body.position.y = 1.3; g.add(body);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(.8, 1, 8), std("#7a3b27")); roof.position.y = 3.1; g.add(roof);
    const blades = new THREE.Group(); blades.position.set(0, 2.5, .8);
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.18, 2.6, .05), std("#efe3c6")); b.geometry.translate(0, 1.3, 0); b.rotation.z = i * Math.PI / 2; blades.add(b); }
    g.add(blades);
    place(g, W(356), Z(214));
    animated.push((t) => { blades.rotation.z = t * 1.2; });
    // campos
    for (let i = 0; i < 5; i++) {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), std(i % 2 ? "#b8a24e" : "#8f9a4e"));
      f.rotation.x = -Math.PI / 2; f.rotation.z = .3 * i;
      place(f, W(180 + i * 38), Z(360 - (i % 2) * 40), .08);
    }
  }

  function castle() {
    const g = new THREE.Group(), stone = std("#9e93a8"), roof = std("#4a2a55");
    const keep = new THREE.Mesh(new THREE.BoxGeometry(3, 3.4, 3), stone); keep.position.y = 1.7; g.add(keep);
    [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([x, z], i) => {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(.6, .7, 4.6, 8), stone); t.position.set(x, 2.3, z); g.add(t);
      const r = new THREE.Mesh(new THREE.ConeGeometry(.85, 1.6, 8), roof); r.position.set(x, 5.4, z); g.add(r);
    });
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3, 8), roof); spire.position.y = 4.9; g.add(spire);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .6), new THREE.MeshBasicMaterial({ color: 0xb8322f, side: THREE.DoubleSide }));
    flag.geometry.translate(.6, 0, 0); flag.position.y = 6.6; g.add(flag);
    const win = new THREE.PointLight(0xffb867, 1, 10); win.position.set(0, 2.4, 2); g.add(win);
    g.scale.setScalar(.85);
    place(g, W(626), Z(400), -.3);
    animated.push((t) => { flag.rotation.y = Math.sin(t * 3) * .4; win.intensity = .8 + Math.sin(t * 7) * .15 + Math.sin(t * 13) * .1; });
  }

  let lavaLight;
  function volcano() {
    const top = heightAt(VOLCANO.x, VOLCANO.z);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(2.1, 24), new THREE.MeshBasicMaterial({ color: 0xff6a24 }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(VOLCANO.x, top + .6, VOLCANO.z); scene.add(pool);
    lavaLight = new THREE.PointLight(0xff5a1f, 3, 40, 1.6); lavaLight.position.set(VOLCANO.x, top + 4, VOLCANO.z); scene.add(lavaLight);
    // brasas
    const N = 260, geo = new THREE.BufferGeometry(), p = new Float32Array(N * 3), seed = new Float32Array(N);
    for (let i = 0; i < N; i++) { seed[i] = Math.random(); }
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffa04a, size: .45, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(geo, mat); scene.add(pts);
    animated.push((t) => {
      for (let i = 0; i < N; i++) {
        const k = (t * .12 + seed[i]) % 1, a = seed[i] * 40;
        p[i * 3] = VOLCANO.x + Math.cos(a) * (1 + k * 4) + Math.sin(t + a) * k;
        p[i * 3 + 1] = top + k * 18;
        p[i * 3 + 2] = VOLCANO.z + Math.sin(a) * (1 + k * 4);
      }
      geo.attributes.position.needsUpdate = true;
      lavaLight.intensity = 2.6 + Math.sin(t * 5) * .5 + Math.sin(t * 11.3) * .3;
    });
    // fumaça
    const smokeTex = glowTexture("rgba(120,110,105,1)");
    for (let i = 0; i < 10; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: .25, depthWrite: false }));
      scene.add(s);
      animated.push((t) => { const k = (t * .05 + i / 10) % 1; s.position.set(VOLCANO.x + k * 8, top + 3 + k * 22, VOLCANO.z - k * 3); s.scale.setScalar(4 + k * 14); s.material.opacity = .32 * (1 - k); });
    }
  }

  function kraken() {
    const g = new THREE.Group(), mat = std("#5b2b3e", { roughness: .5 });
    const done = DIAS_CONCLUIDOS >= 7;
    const tents = [];
    for (let i = 0; i < 5; i++) {
      const pts = []; for (let j = 0; j <= 10; j++) pts.push(new THREE.Vector3(0, j * .7, 0));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, .35, 8), mat);
      const a = i / 5 * Math.PI * 2; tube.position.set(Math.cos(a) * 2.6, -1.5, Math.sin(a) * 2.6);
      const base = tube.geometry.attributes.position.array.slice();
      tents.push({ tube, base, a }); g.add(tube);
    }
    g.position.set(W(500), 0, Z(752));
    if (done) g.scale.setScalar(.6);
    scene.add(g);
    animated.push((t) => {
      for (const { tube, base, a } of tents) {
        const arr = tube.geometry.attributes.position.array;
        for (let i = 0; i < arr.length; i += 3) {
          const y = base[i + 1] + 1.5, k = Math.max(0, y) / 7;
          arr[i] = base[i] * (1 - k * .7) + Math.sin(t * 1.4 + y * .8 + a) * k * 1.6;
          arr[i + 2] = base[i + 2] * (1 - k * .7) + Math.cos(t * 1.1 + y * .6 + a) * k * 1.2;
        }
        tube.geometry.attributes.position.needsUpdate = true;
      }
      g.position.y = done ? -1 + Math.sin(t * .5) * .3 : Math.sin(t * .7) * .5;
    });
  }

  function glowTexture(color = "rgba(255,255,255,1)") {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  // ---------- céu ----------
  function sky() {
    scene.background = new THREE.Color("#04070c");
    scene.fog = new THREE.FogExp2("#05090f", .006);
    const N = 2500, p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * .45, r = 320;
      p[i * 3] = r * Math.sin(ph) * Math.cos(th); p[i * 3 + 1] = r * Math.cos(ph) * .6 + 20; p[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xe9e2cf, size: 1.1, sizeAttenuation: false, fog: false, transparent: true, opacity: .8 }));
    scene.add(stars);
    animated.push((t) => { stars.rotation.y = t * .004; stars.material.opacity = .65 + Math.sin(t * 2) * .1; });
    const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("rgba(255,244,214,1)"), fog: false, transparent: true, blending: THREE.AdditiveBlending }));
    moon.position.set(-120, 90, -230); moon.scale.setScalar(70); scene.add(moon);
    const core = new THREE.Mesh(new THREE.SphereGeometry(9, 32, 16), new THREE.MeshBasicMaterial({ color: 0xfff3d6, fog: false }));
    core.position.copy(moon.position); scene.add(core);

    // plâncton luminoso flutuando sobre a água
    const M = 1400, q = new Float32Array(M * 3), ph = new Float32Array(M);
    for (let i = 0; i < M; i++) { q[i * 3] = (Math.random() - .5) * 180; q[i * 3 + 1] = Math.random() * 6 + .3; q[i * 3 + 2] = (Math.random() - .5) * 130; ph[i] = Math.random() * 6.28; }
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(q, 3)); pg.setAttribute("aPh", new THREE.BufferAttribute(ph, 1));
    const pm = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `uniform float uTime; attribute float aPh; varying float vA;
        void main(){ vec3 p = position; p.y += sin(uTime*.8+aPh)*.6; p.x += sin(uTime*.3+aPh*2.)*.8;
          vA = .5+.5*sin(uTime*2.+aPh*3.); vec4 mv = modelViewMatrix*vec4(p,1.);
          gl_PointSize = (2.+vA*3.) * (60./-mv.z); gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard;
          gl_FragColor = vec4(vec3(.4,1.,.85), (1.-d*2.)*vA*.8); }`,
    });
    scene.add(new THREE.Points(pg, pm));
    animated.push((t) => { pm.uniforms.uTime.value = t; });
  }

  // ---------- rota ----------
  function dayPoint(d) { const x = W(POS[d][0]), z = Z(POS[d][1]); return new THREE.Vector3(x, Math.max(.2, heightAt(x, z)) + .9, z); }
  function makeRoute() {
    const pts = [];
    for (let d = 1; d <= 30; d++) {
      pts.push(dayPoint(d));
      if (d < 30) { // ponto intermediário: arco sobre a água entre ilhas
        const a = dayPoint(d), b = dayPoint(d + 1), m = a.clone().lerp(b, .5);
        m.y = Math.max(m.y, Math.max(.2, heightAt(m.x, m.z)) + .9) + a.distanceTo(b) * .08;
        pts.push(m);
      }
    }
    curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const samples = 3000, sp = [];
    for (let i = 0; i <= samples; i++) sp.push(curve.getPointAt(i / samples));
    for (let d = 1; d <= 30; d++) {
      const p = dayPoint(d); let best = 0, bd = 1e9;
      sp.forEach((q, i) => { const dd = q.distanceToSquared(p); if (dd < bd) { bd = dd; best = i; } });
      dayU[d] = best / samples;
    }
    routeMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uProg: { value: 0 }, uTime: { value: 0 }, uReveal: { value: 0 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform float uProg, uTime, uReveal; varying vec2 vUv;
        void main(){
          if (vUv.x > uReveal) discard;
          float dash = step(.45, fract(vUv.x*260. - (vUv.x < uProg ? uTime*1.5 : 0.)));
          vec3 done = mix(vec3(1.,.35,.2), vec3(1.,.8,.4), .5+.5*sin(vUv.x*80.-uTime*3.));
          vec3 col = vUv.x < uProg ? done * 1.6 : vec3(.85,.78,.6);
          float a = vUv.x < uProg ? dash : dash*.35;
          gl_FragColor = vec4(col, a);
        }`,
    });
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 1400, .14, 6), routeMat));
  }

  // ---------- selos dos dias ----------
  function numberTexture(n, fg, bg) {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d");
    x.fillStyle = bg; x.beginPath(); x.arc(64, 64, 64, 0, 7); x.fill();
    x.strokeStyle = "rgba(255,240,210,.45)"; x.lineWidth = 4; x.beginPath(); x.arc(64, 64, 52, 0, 7); x.stroke();
    x.fillStyle = fg; x.font = "500 56px 'IBM Plex Mono', monospace"; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText(String(n), 64, 68);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  function estado(d) { return d <= DIAS_CONCLUIDOS ? "done" : d === DIAS_CONCLUIDOS + 1 ? "now" : "locked"; }

  function makeMarkers() {
    const glow = glowTexture("rgba(255,140,90,1)"), glowGold = glowTexture("rgba(255,214,120,1)");
    for (let d = 1; d <= 30; d++) {
      const st = estado(d), boss = CHEFES.includes(d);
      const p = dayPoint(d);
      const g = new THREE.Group(); g.position.copy(p); g.userData = { dia: d, st };
      const r = boss ? 1.25 : .9;
      const bg = st === "done" ? "#9b2426" : st === "now" ? "#e8b85a" : "#d9c9a2";
      const fg = st === "done" ? "#f6e6cf" : "#2b1d12";
      const side = std(bg, { roughness: .35, metalness: .1 });
      const top = new THREE.MeshStandardMaterial({ map: numberTexture(d, fg, bg), roughness: .4, transparent: st === "locked", opacity: st === "locked" ? .7 : 1 });
      const seal = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.05, .35, boss ? 4 : 28), [side, top, side]);
      if (boss) { seal.rotation.y = Math.PI / 4; seal.scale.set(1.25, 1, 1.25); }
      seal.userData.dia = d;
      const holder = new THREE.Group(); holder.add(seal); g.add(holder);
      if (boss) {
        const crown = new THREE.Mesh(new THREE.TorusGeometry(r * 1.55, .07, 6, 40), new THREE.MeshBasicMaterial({ color: st === "locked" ? 0x8a7f6a : 0xffb35a }));
        crown.rotation.x = Math.PI / 2; g.add(crown);
        animated.push((t) => { crown.rotation.z = t * .6; });
      }
      if (st !== "locked") {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: st === "now" ? glowGold : glow, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: st === "now" ? .95 : .55 }));
        s.scale.setScalar(st === "now" ? 6 : 4); g.add(s);
        animated.push((t) => { s.material.opacity = (st === "now" ? .7 : .4) + Math.sin(t * 2 + d) * .15; });
      }
      if (st === "now") {
        const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.15, 48), new THREE.MeshBasicMaterial({ color: 0xffe29a, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
        ring.rotation.x = -Math.PI / 2; g.add(ring);
        animated.push((t) => { const k = (t * .6) % 1; ring.scale.setScalar(1 + k * 3); ring.material.opacity = 1 - k; });
        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(.08, .5, 30, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: .18, blending: THREE.AdditiveBlending, depthWrite: false }));
        beacon.position.y = 15; g.add(beacon);
      }
      holder.position.y = 0;
      const ph = d * .7;
      animated.push((t) => { holder.position.y = Math.sin(t * 1.3 + ph) * .18; holder.rotation.y = Math.sin(t * .5 + ph) * .2; });
      g.scale.setScalar(.001);
      scene.add(g);
      markers.push({ dia: d, group: g, holder, seal, boss });
    }
  }

  // ---------- navio ----------
  function makeShip() {
    ship = new THREE.Group();
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-1.6, 0); hullShape.quadraticCurveTo(-1.8, -.7, -1, -.8); hullShape.lineTo(1.2, -.8); hullShape.quadraticCurveTo(2, -.5, 2.1, .2); hullShape.lineTo(-1.6, 0);
    const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(hullShape, { depth: 1.1, bevelEnabled: false }), std("#4a2c18"));
    hull.geometry.translate(0, 0, -.55); ship.add(hull);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, 3.6, 6), std("#3a2414")); mast.position.y = 1.7; ship.add(mast);
    const sailG = new THREE.PlaneGeometry(1.8, 1.9, 6, 6);
    const sp = sailG.attributes.position; for (let i = 0; i < sp.count; i++) sp.setZ(i, Math.sin((sp.getX(i) + .9) / 1.8 * Math.PI) * .35);
    sailG.computeVertexNormals();
    const sail = new THREE.Mesh(sailG, std("#efe1bd", { side: THREE.DoubleSide })); sail.position.set(.1, 2, 0); sail.rotation.y = Math.PI / 2; ship.add(sail);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(.7, .4), new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide }));
    flag.geometry.translate(.35, 0, 0); flag.position.y = 3.5; ship.add(flag);
    const lantern = new THREE.PointLight(0xffc26a, 1.4, 8); lantern.position.set(1.6, .6, 0); ship.add(lantern);
    ship.userData = { u: 0 };
    ship.scale.setScalar(.9);
    scene.add(ship);
    animated.push((t) => {
      const u = ship.userData.u;
      const p = curve.getPointAt(Math.min(.999, u)), q = curve.getPointAt(Math.min(1, u + .002));
      ship.position.set(p.x, p.y + .5 + Math.sin(t * 1.6) * .15, p.z);
      ship.lookAt(q.x, ship.position.y, q.z); ship.rotateY(-Math.PI / 2);
      ship.rotation.z += Math.sin(t * 1.3) * .06; flag.rotation.y = Math.sin(t * 4) * .5;
    });
  }

  // ---------- câmera e interação ----------
  function updateCamera() {
    const { target: t, radius: r, theta, phi } = cam;
    camera.position.set(t.x + r * Math.sin(phi) * Math.sin(theta), t.y + r * Math.cos(phi), t.z + r * Math.sin(phi) * Math.cos(theta));
    camera.lookAt(t);
  }
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  function bindControls(canvas) {
    let drag = null, moved = 0;
    canvas.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, th: cam.theta, ph: cam.phi }; moved = 0; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", (e) => {
      pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      par.tx = pointer.x; par.ty = pointer.y;
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
        if (moved > 4) canvas.classList.add("dragging");
        cam.theta = drag.th - dx * .005; cam.phi = Math.min(1.35, Math.max(.25, drag.ph - dy * .004));
      } else pick(e);
    });
    canvas.addEventListener("pointerup", (e) => {
      canvas.classList.remove("dragging");
      if (drag && moved < 6) { pick(e); if (hovered) handlers.click(hovered.dia); }
      drag = null;
    });
    canvas.addEventListener("pointerleave", () => { setHover(null); });
    canvas.addEventListener("wheel", (e) => { e.preventDefault(); gsap.to(cam, { radius: Math.min(160, Math.max(18, cam.radius * (1 + Math.sign(e.deltaY) * .12))), duration: .6, ease: "power2.out" }); }, { passive: false });
  }
  function pick(e) {
    pointer.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(markers.map((m) => m.seal));
    const m = hits.length ? markers.find((k) => k.seal === hits[0].object) : null;
    setHover(m, e);
  }
  function setHover(m, e) {
    if (m !== hovered) {
      if (hovered) gsap.to(hovered.holder.scale, { x: 1, y: 1, z: 1, duration: .4, ease: "back.out(2)" });
      if (m) gsap.to(m.holder.scale, { x: 1.45, y: 1.45, z: 1.45, duration: .4, ease: "back.out(3)" });
      hovered = m;
      renderer.domElement.classList.toggle("hovering", !!m);
    }
    handlers.hover(m ? m.dia : null, e);
  }

  // ---------- rótulos ----------
  function addLabels() {
    const box = document.getElementById("labels");
    const L = [
      ["I", "Porto das Variáveis", 240, 560], ["II", "Fazenda dos Laços", 268, 140],
      ["III", "Reino dos Objetos", 626, 300], ["IV", "Castelo do Vulcão", 1060, 120],
    ];
    L.forEach(([n, nome, x, y], i) => {
      const el = document.createElement("div"); el.className = "label";
      el.innerHTML = `<small>Ilha ${n}</small><span>${nome}</span>`;
      box.appendChild(el);
      const wx = W(x), wz = Z(y);
      labelAnchors.push({ el, pos: new THREE.Vector3(wx, Math.max(1, heightAt(wx, wz)) + (i === 3 ? 4 : 5), wz) });
    });
  }
  const v3 = new THREE.Vector3();
  function updateLabels() {
    for (const a of labelAnchors) {
      v3.copy(a.pos).project(camera);
      const vis = v3.z < 1 && Math.abs(v3.x) < 1.2 && Math.abs(v3.y) < 1.2;
      const x = (v3.x * .5 + .5) * innerWidth, y = (-v3.y * .5 + .5) * innerHeight;
      a.el.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px)`;
      a.el.style.visibility = vis ? "visible" : "hidden";
    }
  }

  // ---------- loop ----------
  function loop() {
    const t = clock.getElapsedTime();
    oceanMat.uniforms.uTime.value = t; oceanMat.uniforms.uCam.value.copy(camera.position);
    routeMat.uniforms.uTime.value = t;
    for (const f of animated) f(t);
    par.x += (par.tx - par.x) * .04; par.y += (par.ty - par.y) * .04;
    const th = cam.theta, ph = cam.phi;
    cam.theta += par.x * .04; cam.phi -= par.y * .025;
    updateCamera();
    cam.theta = th; cam.phi = ph;
    updateLabels();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  function onResize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.fov = innerWidth < 700 ? 58 : 42;
    camera.updateProjectionMatrix();
  }

  // ---------- API ----------
  const VIEWS = [
    { target: [0, 0, 0], radius: 105, theta: -0.35, phi: 0.95 },
    { target: [W(250), 0, Z(630)], radius: 36, theta: -0.25, phi: 0.95 },
    { target: [W(268), 1, Z(258)], radius: 40, theta: 0.2, phi: 0.9 },
    { target: [W(626), 1, Z(418)], radius: 40, theta: -0.4, phi: 0.92 },
    { target: [W(960), 3, Z(250)], radius: 46, theta: -0.6, phi: 0.95 },
  ];

  window.MareScene = {
    init(canvas) {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 1000);
      clock = new THREE.Clock(); raycaster = new THREE.Raycaster(); pointer = new THREE.Vector2(9, 9);
      scene.add(new THREE.HemisphereLight(0x6a86a8, 0x1a1208, .75));
      const moonL = new THREE.DirectionalLight(0xcfd8ff, .9); moonL.position.set(-60, 80, -40); scene.add(moonL);
      const rim = new THREE.DirectionalLight(0x5ff0d6, .25); rim.position.set(50, 20, 60); scene.add(rim);
      sky(); makeOcean(); makeIslands(); trees(); lighthouse(); windmill(); castle(); volcano(); kraken();
      makeRoute(); makeMarkers(); makeShip(); addLabels();
      bindControls(canvas);
      onResize(); addEventListener("resize", onResize);
      cam.radius = 260; cam.phi = .25; cam.theta = -1.4; // começa alto, para a entrada
      loop();
    },
    on(evt, fn) { handlers[evt] = fn; },
    // animação de entrada: câmera desce do céu, rota se desenha, selos brotam, navio navega
    intro() {
      const tl = gsap.timeline();
      tl.to(cam, { radius: VIEWS[0].radius, phi: VIEWS[0].phi, theta: VIEWS[0].theta, duration: 4.2, ease: "power3.inOut" }, 0)
        .to(routeMat.uniforms.uReveal, { value: 1, duration: 3.2, ease: "power2.inOut" }, 1.4)
        .to(routeMat.uniforms.uProg, { value: dayU[Math.min(30, DIAS_CONCLUIDOS + 1)] || 0, duration: 2.6, ease: "power2.inOut" }, 2.4)
        .to(ship.userData, { u: dayU[Math.min(30, DIAS_CONCLUIDOS + 1)] || 0, duration: 3.4, ease: "power2.inOut" }, 2);
      markers.forEach((m) => {
        tl.to(m.group.scale, { x: 1, y: 1, z: 1, duration: .8, ease: "elastic.out(1,.5)" }, 1.6 + dayU[m.dia] * 3);
      });
      labelAnchors.forEach((a, i) => tl.to(a.el, { opacity: 1, duration: 1, ease: "power2.out" }, 3 + i * .25));
      return tl;
    },
    flyTo(i) {
      const v = VIEWS[i];
      gsap.to(cam.target, { x: v.target[0], y: v.target[1], z: v.target[2], duration: 2, ease: "power3.inOut" });
      gsap.to(cam, { radius: v.radius, theta: v.theta, phi: v.phi, duration: 2, ease: "power3.inOut" });
    },
    focusDay(d) {
      const p = dayPoint(d);
      gsap.to(cam.target, { x: p.x, y: p.y, z: p.z, duration: 1.4, ease: "power3.inOut" });
      gsap.to(cam, { radius: 20, phi: .85, duration: 1.4, ease: "power3.inOut" });
      const m = markers.find((k) => k.dia === d);
      if (m) gsap.fromTo(m.holder.rotation, { y: 0 }, { y: Math.PI * 2, duration: 1.2, ease: "power2.inOut" });
    },
    screenOf(d) { v3.copy(dayPoint(d)).project(camera); return { x: (v3.x * .5 + .5) * innerWidth, y: (-v3.y * .5 + .5) * innerHeight }; },
  };
})();
