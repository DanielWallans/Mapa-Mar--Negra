"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Intro({ onReveal, onDone }) {
  const root = useRef();
  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(".intro-eyebrow", { opacity: 0, y: 10, duration: .8, ease: "power2.out" })
      .from(".intro-title .ch", { opacity: 0, y: 70, rotateX: -90, filter: "blur(14px)", stagger: .06, duration: 1.1, ease: "power4.out" }, .2)
      .to(".intro-bar span", { width: "100%", duration: 1.5, ease: "power2.inOut" }, .4)
      .to(".intro-title .ch", { opacity: 0, y: -40, filter: "blur(10px)", stagger: .03, duration: .6, ease: "power2.in" }, 2.2)
      .add(() => setTimeout(onReveal, 0), 2.4) // fora do contexto do useGSAP (que é revertido ao desmontar)
      .to(root.current, { opacity: 0, duration: 1, ease: "power2.inOut", onComplete: onDone }, 2.5);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || location.search.includes("skip")) tl.progress(1);
  }, { scope: root });
  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-inner">
        <div className="intro-eyebrow">Carta náutica de um capitão aprendendo Java</div>
        <h1 className="intro-title">{[..."Maré Negra"].map((c, i) => <span key={i} className="ch">{c === " " ? " " : c}</span>)}</h1>
        <div className="intro-bar"><span /></div>
      </div>
    </div>
  );
}
