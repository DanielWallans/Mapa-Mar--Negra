"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, animate } from "motion/react";
import { ILHAS, DIARIO, PREVISTO, DIAS_CONCLUIDOS } from "@/lib/data";
import { estado, isBoss } from "@/lib/world";
import { BookIcon, CompassIcon, ScrollIcon } from "./Icons";
import About from "./About";

const ROMANOS = ["I", "II", "III", "IV"];
const ease = [.22, 1, .36, 1];

export function TopBar({ show }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!show) return;
    const c = animate(0, DIAS_CONCLUIDOS, { duration: 2, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [show]);
  const C = 2 * Math.PI * 27;
  const [go, setGo] = useState(false);
  const [about, setAbout] = useState(false);
  // na primeira visita, o pergaminho "Sobre" abre sozinho depois da intro
  useEffect(() => {
    if (!show) return;
    let visto = true;
    try { visto = !!localStorage.getItem("mare-sobre"); localStorage.setItem("mare-sobre", "1"); } catch {}
    if (visto) return;
    const t = setTimeout(() => setAbout(true), 1800);
    return () => clearTimeout(t);
  }, [show]);
  const btn = { pointerEvents: "auto", display: "inline-flex", alignItems: "center", gap: 7, marginTop: 8, padding: "4px 12px", border: "1px solid #e0a94a", color: "#e0a94a", fontSize: 13, borderRadius: 4, background: "rgba(16,13,10,.6)", cursor: "pointer", font: "inherit" };
  return (
    <header className="hud-top">
      <AnimatePresence>
        {go && (
          <motion.div key="voyage" initial={{ clipPath: "circle(0% at 12% 8%)" }} animate={{ clipPath: "circle(150% at 12% 8%)" }} transition={{ duration: .9, ease: [.7, 0, .3, 1] }}
            style={{ position: "fixed", inset: 0, zIndex: 9999, background: "radial-gradient(circle at 50% 45%, #2a2117, #0c0a08 70%)", display: "grid", placeItems: "center", color: "#e9dfc8", pointerEvents: "auto" }}>
            <div style={{ textAlign: "center" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }} style={{ color: "#e0a94a", lineHeight: 0, display: "inline-block" }}><CompassIcon width={76} height={76} strokeWidth={1.1} /></motion.div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .5 }} style={{ fontFamily: "var(--f-display)", fontSize: 30, marginTop: 18 }}>Abrindo o Diário de Bordo…</motion.div>
              <div style={{ width: 220, height: 3, background: "#2a241b", margin: "18px auto 0", overflow: "hidden" }}>
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: .4, duration: 1.4, ease: "easeInOut" }} style={{ height: "100%", background: "#e0a94a" }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className="brand" initial={{ opacity: 0, y: -24 }} animate={show ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease }}>
        <h1>Maré Negra</h1>
        <div className="sub">Carta náutica · Java, ilha por ilha</div>
        <a className="diario-link" href="/diario/index.html" onClick={(e) => { e.preventDefault(); setGo(true); setTimeout(() => (location.href = "/diario/index.html"), 1900); }} style={btn}><BookIcon /> Diário de Bordo Java</a>
        <button type="button" onClick={() => setAbout(true)} style={{ ...btn, marginLeft: 8 }}><ScrollIcon /> Sobre este diário</button>
      </motion.div>
      <motion.div className="progress" aria-live="polite" initial={{ opacity: 0, x: 30 }} animate={show ? { opacity: 1, x: 0 } : {}} transition={{ duration: 1, delay: .2, ease }}>
        <svg viewBox="0 0 64 64" className="ring" aria-hidden="true">
          <circle cx="32" cy="32" r="27" className="ring-bg" />
          <motion.circle cx="32" cy="32" r="27" className="ring-fg" strokeDasharray={C}
            initial={{ strokeDashoffset: C }} animate={show ? { strokeDashoffset: C * (1 - DIAS_CONCLUIDOS / 30) } : {}} transition={{ duration: 2, ease }} />
        </svg>
        <div><b>{n} / 30</b><span>dias navegados</span></div>
      </motion.div>
      <About open={about} onClose={() => setAbout(false)} />
    </header>
  );
}

export function IsleNav({ show, view, setView }) {
  const items = [{ id: 0, small: "Visão geral", nome: "Mar aberto" }, ...ILHAS.map((i) => ({ id: i.id, small: `Ilha ${ROMANOS[i.id - 1]} · dias ${i.dias[0]}–${i.dias[1]}`, nome: i.nome }))];
  return (
    <nav className="hud-bottom" aria-label="Ilhas">
      {items.map((it, k) => (
        <motion.button key={it.id} type="button" className={`isle-btn ${view === it.id ? "active" : ""}`}
          initial={{ opacity: 0, y: 30 }} animate={show ? { opacity: 1, y: 0 } : {}} transition={{ delay: .3 + k * .08, type: "spring", stiffness: 260, damping: 18 }}
          whileHover={{ y: -3 }} whileTap={{ scale: .96 }} onClick={() => setView(it.id)}>
          {view === it.id && <motion.span layoutId="isle-active" className="isle-active" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
          <small>{it.small}</small>{it.nome}
        </motion.button>
      ))}
    </nav>
  );
}

export function Ledger({ view, onSelect }) {
  const ilha = ILHAS[view - 1];
  return (
    <AnimatePresence mode="wait">
      {ilha && (
        <motion.aside key={view} className="ledger" aria-label="Dias da ilha"
          initial={{ opacity: 0, x: 40, filter: "blur(8px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: 40, filter: "blur(8px)" }}
          transition={{ duration: .5, ease, delay: .3 }}>
          <div className="ledger-title"><small>Ilha {ROMANOS[view - 1]} · chefe: {ilha.chefe}</small>{ilha.nome}</div>
          <div className="chips">
            {Array.from({ length: ilha.dias[1] - ilha.dias[0] + 1 }, (_, i) => ilha.dias[0] + i).map((d, i) => {
              const st = estado(d);
              return (
                <motion.button key={d} type="button" className={`chip ${st}${isBoss(d) ? " boss" : ""}`}
                  title={st === "locked" ? `Dia ${d}: ${PREVISTO[d] || "rota prevista"}` : `Dia ${d}: ${DIARIO[d]?.titulo || "navegando agora"}`}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .5 + i * .045, type: "spring", stiffness: 400, damping: 14 }}
                  whileHover={{ scale: 1.15 }} onClick={() => onSelect(d)}>
                  <span>{d}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function Tooltip({ tip }) {
  return (
    <AnimatePresence>
      {tip && (
        <motion.div className="tip" style={{ left: tip.x, top: tip.y }}
          initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .9 }} transition={{ duration: .15 }}>
          <b>{tip.label}</b>{tip.nome}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
