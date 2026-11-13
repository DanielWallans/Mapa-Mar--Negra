"use client";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { route, intro } from "@/lib/world";

export default function Route() {
  const { curve } = route();
  const geo = useMemo(() => new THREE.TubeGeometry(curve, 1600, .2, 8), [curve]);
  const mat = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    uniforms: { uProg: { value: 0 }, uTime: { value: 0 }, uReveal: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: /* glsl */ `
      uniform float uProg; uniform float uTime; uniform float uReveal; varying vec2 vUv;
      void main(){
        if (vUv.x > uReveal) discard;
        float isDone = step(vUv.x, uProg);
        float dash = step(.42, fract(vUv.x*240. - isDone*uTime*1.5));
        vec3 hot = mix(vec3(1.,.3,.15), vec3(1.,.82,.4), .5+.5*sin(vUv.x*90.-uTime*3.));
        vec3 col = mix(vec3(.75,.68,.52), hot*1.5, isDone);
        col += isDone * smoothstep(uProg-.012, uProg, vUv.x) * vec3(2.,1.4,.6);
        float a = dash * mix(.45, 1., isDone);
        if (a < .01) discard;
        gl_FragColor = vec4(col, a);
      }`,
  }), []);
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uProg.value = intro.prog;
    mat.uniforms.uReveal.value = intro.reveal;
  });
  return <mesh geometry={geo} material={mat} renderOrder={2} />;
}
