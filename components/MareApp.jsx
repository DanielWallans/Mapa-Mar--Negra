"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { DIARIO, PREVISTO, ILHAS } from "@/lib/data";
import { estado, intro, route, DIA_ATUAL } from "@/lib/world";
import Intro from "./ui/Intro";
import { TopBar, IsleNav, Ledger, Tooltip } from "./ui/Hud";
import Scroll from "./ui/Scroll";

const Experience = dynamic(() => import("./scene/Experience"), { ssr: false });
const ilhaDe = (d) => ILHAS.find((i) => d >= i.dias[0] && d <= i.dias[1]);

export default function MareApp() {
  const [introOn, setIntroOn] = useState(true);
  const [started, setStarted] = useState(false);
  const [hudOn, setHudOn] = useState(false);
  const [labels, setLabels] = useState(false);
  const [view, setView] = useState(0);
  const [dia, setDia] = useState(null);
  const [dir, setDir] = useState(1);
  const [hovered, setHovered] = useState(null);
  const [tip, setTip] = useState(null);
  const [hint, setHint] = useState(false);

  // timeline 3D da entrada (GSAP anima o estado lido pelos useFrame)
  const reveal = useCallback(() => {
    setStarted(true);
    const { dayU } = route();
    const u = dayU[DIA_ATUAL] || 0;
    const tl = gsap.timeline();
    tl.to(intro, { reveal: 1, duration: 3.2, ease: "power2.inOut" }, .6)
      .to(intro, { seals: 1, duration: 3.2, ease: "power1.inOut" }, .8)
      .to(intro, { prog: u, duration: 2.8, ease: "power2.inOut" }, 1.6)
      .to(intro, { ship: u, duration: 3.6, ease: "power2.inOut" }, 1.2)
      .add(() => setLabels(true), 2.2)
      .add(() => setHudOn(true), 2.4)
      .add(() => setHint(true), 3.6)
      .add(() => setHint(false), 9);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || location.search.includes("skip")) { intro.instant = true; tl.progress(1); }
  }, []);

  // o navio navega suavemente até o ponto que está sendo visto (nunca além do dia atual)
  useEffect(() => {
    if (!hudOn) return;
    const { dayU } = route();
    const alvoDia = dia ? Math.min(dia, DIA_ATUAL) : view ? Math.min(ILHAS[view - 1].dias[1], DIA_ATUAL) : DIA_ATUAL;
    const u = dayU[Math.max(1, alvoDia)] || 0;
    if (Math.abs(u - intro.ship) < 1e-4) return;
    const dur = Math.min(6, 1.6 + Math.abs(u - intro.ship) * 14);
    const tw = gsap.to(intro, { ship: u, duration: dur, ease: "sine.inOut", overwrite: true });
    return () => tw.kill();
  }, [view, dia, hudOn]);

  const onHover = useCallback((d, e) => {
    setHovered(d);
    document.body.style.cursor = d ? "pointer" : "";
    if (!d || !e) return setTip(null);
    const st = estado(d);
    const nome = st === "locked" ? PREVISTO[d] || "Rota prevista" : DIARIO[d]?.titulo || "Navegando agora";
    const label = st === "locked" ? `Dia ${d} · ainda não navegado` : st === "now" ? `Dia ${d} · navegando agora` : `Dia ${d} · ${ilhaDe(d).nome}`;
    setTip({ x: Math.min(Math.max(e.clientX, 130), innerWidth - 130), y: e.clientY, label, nome });
  }, []);

  const lastDia = useRef(null);
  const abrir = useCallback((d) => {
    setDir(lastDia.current && d < lastDia.current ? -1 : 1);
    lastDia.current = d;
    setDia(d); setTip(null); setHovered(null); document.body.style.cursor = "";
    history.replaceState(null, "", `#dia-${d}`);
  }, []);
  const fechar = useCallback(() => {
    setDia(null); lastDia.current = null;
    history.replaceState(null, "", location.pathname + location.search);
  }, []);

  useEffect(() => {
    const m = location.hash.match(/^#dia-(\d{1,2})$/);
    if (m && +m[1] >= 1 && +m[1] <= 30) { const t = setTimeout(() => abrir(+m[1]), 6500); return () => clearTimeout(t); }
  }, [abrir]);

  return (
    <>
      <Experience view={view} focusDay={dia} started={started} labels={labels} hovered={hovered} onHover={onHover} onSelect={abrir} />
      <div className="grain" aria-hidden="true" />
      <TopBar show={hudOn} />
      <IsleNav show={hudOn} view={view} setView={(v) => { setView(v); setDia(null); }} />
      <Ledger view={view} onSelect={abrir} />
      <Tooltip tip={tip} />
      <div className={`hint ${hint ? "on" : ""}`}>Arraste para girar · role para aproximar · clique num selo</div>
      <Scroll dia={dia} dir={dir} onClose={fechar} onNav={abrir} />
      {introOn && <Intro onReveal={reveal} onDone={() => setIntroOn(false)} />}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="torn" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency=".03 .04" numOctaves="4" seed="9" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="24" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </>
  );
}
