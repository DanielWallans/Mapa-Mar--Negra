"use client";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTextures } from "@/lib/textures";
import { heightAt } from "@/lib/world";

/* Mar animado: ondulação em várias direções + ondas que rolam em
   direção às ilhas e quebram em espuma na praia. A distância até a
   costa é pré-calculada numa textura (mapa de distância). */

const SIZE = 420, MAXD = 24;

function shoreTexture() {
  const N = 384, cell = SIZE / N, land = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const x = -SIZE / 2 + (i + .5) * cell, z = -SIZE / 2 + (j + .5) * cell;
    land[j * N + i] = Math.abs(x) < 110 && Math.abs(z) < 90 && heightAt(x, z) > 0 ? 0 : 1e9;
  }
  // distância chanfrada (2 passadas)
  const D = land, a = 1, b = Math.SQRT2;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let v = D[j * N + i];
    if (i > 0) v = Math.min(v, D[j * N + i - 1] + a);
    if (j > 0) { v = Math.min(v, D[(j - 1) * N + i] + a); if (i > 0) v = Math.min(v, D[(j - 1) * N + i - 1] + b); if (i < N - 1) v = Math.min(v, D[(j - 1) * N + i + 1] + b); }
    D[j * N + i] = v;
  }
  for (let j = N - 1; j >= 0; j--) for (let i = N - 1; i >= 0; i--) {
    let v = D[j * N + i];
    if (i < N - 1) v = Math.min(v, D[j * N + i + 1] + a);
    if (j < N - 1) { v = Math.min(v, D[(j + 1) * N + i] + a); if (i < N - 1) v = Math.min(v, D[(j + 1) * N + i + 1] + b); if (i > 0) v = Math.min(v, D[(j + 1) * N + i - 1] + b); }
    D[j * N + i] = v;
  }
  const data = new Uint8Array(N * N * 4);
  for (let k = 0; k < N * N; k++) { const v = Math.min(255, (D[k] * cell / MAXD) * 255); data[k * 4] = data[k * 4 + 1] = data[k * 4 + 2] = v; data[k * 4 + 3] = 255; }
  const t = new THREE.DataTexture(data, N, N);
  t.magFilter = t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
  return t;
}

const common = /* glsl */ `
  uniform float uTime; uniform sampler2D uShore;
  float shoreD(vec2 xz){ return texture2D(uShore, (xz + ${(SIZE / 2).toFixed(1)}) / ${SIZE.toFixed(1)}).r * ${MAXD.toFixed(1)}; }
  float h21(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
  float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+1.),f.x), f.y); }
  // onda que viaja em direção à costa (fase cresce com o tempo, crista anda para d menor)
  float surf(float d, vec2 xz){ return sin(d*1.15 + uTime*2.4 + n2(xz*.15)*4.); }
`;

const vertex = /* glsl */ `
  ${common}
  varying float vH; varying vec3 vW; varying float vD;
  float wave(vec2 p, vec2 d, float f, float s){ return sin(dot(p,d)*f + uTime*s); }
  void main(){
    vec3 p = position;
    float d = shoreD(p.xz);
    float h = wave(p.xz, vec2(1.,.3), .14, 1.3)*.55 + wave(p.xz, vec2(-.4,1.), .23, 1.9)*.32
            + wave(p.xz, vec2(.7,-.7), .5, 2.7)*.15 + wave(p.xz, vec2(.2,.9), 1.1, 3.6)*.06;
    float near = 1. - smoothstep(1., ${MAXD.toFixed(1)} * .7, d);
    h = mix(h, h*.35, 1.-smoothstep(0.,4.,d));           // mar acalma na beira
    h += pow(surf(d, p.xz)*.5+.5, 3.) * .7 * near;         // ondulação que chega à ilha
    p.y += h; vH = h; vD = d;
    vec4 w = modelMatrix * vec4(p,1.); vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }`;

const fragment = /* glsl */ `
  ${common}
  uniform vec3 uCam; uniform sampler2D uNormal;
  varying float vH; varying vec3 vW; varying float vD;
  void main(){
    vec3 n1 = texture2D(uNormal, vW.xz*.05 + vec2(uTime*.035, uTime*.022)).xyz*2.-1.;
    vec3 n2v = texture2D(uNormal, vW.xz*.13 - vec2(uTime*.05, -uTime*.03)).xyz*2.-1.;
    vec3 n3 = texture2D(uNormal, vW.xz*.32 + vec2(-uTime*.09, uTime*.07)).xyz*2.-1.;
    vec3 N = normalize(vec3(n1.x+n2v.x+n3.x*.6, 2.4, n1.y+n2v.y+n3.y*.6));
    vec3 V = normalize(uCam - vW);
    float fres = pow(1. - max(dot(N, V), 0.), 4.);

    float d = shoreD(vW.xz);
    vec3 deep = vec3(.006,.02,.034), mid = vec3(.02,.085,.115), shallow = vec3(.03,.15,.17);
    vec3 col = mix(deep, mid, smoothstep(-.6,.8,vH));
    col = mix(shallow, col, smoothstep(0., 5., d));       // água rasa turquesa perto da ilha
    col = mix(col, vec3(.05,.12,.2), fres*.7);

    // linhas de onda rolando até a praia
    float s = surf(d, vW.xz);
    float wob = n2(vW.xz*.6 + uTime*.3);
    float line = smoothstep(.9, .985, s) * (1. - smoothstep(1., 10., d)) * (.55 + wob*.6);
    // arrebentação: espuma que avança e recua na beira
    float wash = .9 + .6*sin(uTime*1.6 + n2(vW.xz*.2)*6.);
    float edge = (1. - smoothstep(0., wash*.7, d)) * (.6 + .4*n2(vW.xz*1.5 - uTime*.8));
    col += vec3(.8,.93,.95) * (line*.28 + edge*.55);

    // cristas iluminadas
    col += vec3(.3,1.,.86) * smoothstep(.7,1.1,vH) * .06;

    // reflexo da lua
    vec3 L = normalize(vec3(-.45,.35,-.82));
    float spec = pow(max(dot(reflect(-V, N), L), 0.), 220.);
    float sheen = pow(max(dot(reflect(-V, N), L), 0.), 18.);
    col += vec3(1.,.95,.8) * (spec*4. + sheen*.05);
    float glint = pow(n2(vW.xz*6. + N.xz*4. + uTime*1.5), 18.);
    col += vec3(.9,.95,1.) * glint * .5 * (1.-smoothstep(40.,120.,length(vW.xz)));

    col = mix(col, vec3(.012,.022,.035), smoothstep(80.,190.,length(vW.xz)));
    gl_FragColor = vec4(col, 1.);
  }`;

export default function Ocean() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uNormal: { value: getTextures().waterNormal }, uShore: { value: shoreTexture() } },
    vertexShader: vertex, fragmentShader: fragment,
  }), []);
  const geo = useMemo(() => new THREE.PlaneGeometry(SIZE, SIZE, 300, 300).rotateX(-Math.PI / 2), []);
  useFrame(({ clock, camera }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uCam.value.copy(camera.position);
  });
  return <mesh geometry={geo} material={mat} />;
}
