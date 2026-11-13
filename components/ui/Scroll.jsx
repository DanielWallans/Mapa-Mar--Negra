"use client";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ILHAS, DIARIO, PREVISTO, CHEFES } from "@/lib/data";
import { estado } from "@/lib/world";
import DiceRoller from "./DiceRoller";

const ROMANOS = ["I", "II", "III", "IV"];
const ilhaDe = (d) => ILHAS.find((i) => d >= i.dias[0] && d <= i.dias[1]);
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: .5, ease: [.22, 1, .36, 1] } } };

function Conteudo({ dia }) {
  const st = estado(dia), ilha = ilhaDe(dia), dado = DIARIO[dia];
  let titulo, body;
  if (dado && st === "done") {
    titulo = dado.titulo;
    body = (
      <>
        {dado.texto.map((p, i) => <motion.p key={i} variants={item}>{p}</motion.p>)}
        {dado.citacao && <motion.p variants={item} className="quote">“{dado.citacao}”</motion.p>}
        {dado.codigo && <motion.div variants={item}><h3>Do caderno de código</h3><pre><code>{dado.codigo}</code></pre></motion.div>}
        {dado.dados && <motion.div variants={item}><DiceRoller lados={dado.dados} /></motion.div>}
        {dado.aprendi &&<motion.div variants={item}><h3>O que ficou</h3><ul>{dado.aprendi.map((a, i) => <li key={i}>{a}</li>)}</ul></motion.div>}
        {dado.monstro && <motion.div variants={item} className="monster"><b>{dado.monstro.nome}</b><span>{dado.monstro.desc}</span></motion.div>}
      </>
    );
  } else if (st === "now") {
    titulo = PREVISTO[dia] || "Navegando agora";
    body = (
      <>
        <motion.p variants={item}>O navio do capitão está aqui. Este pergaminho ainda está em branco: ele será escrito quando o dia {dia} terminar.</motion.p>
        <motion.p variants={item} className="quote">Algumas aventuras terminam em ouro. Outras terminam no fundo do mar.</motion.p>
      </>
    );
  } else {
    titulo = PREVISTO[dia] || "Rota prevista";
    body = (
      <>
        <motion.p variants={item}>Águas ainda não navegadas. A rota prevista para o dia {dia} é: <i>{PREVISTO[dia] || "a definir"}</i>.</motion.p>
        {CHEFES.includes(dia) && <motion.p variants={item}>Um chefe espera aqui: <b>{ilha.chefe}</b>.</motion.p>}
      </>
    );
  }
  return (
    <>
      <motion.div variants={item} className="eyebrow">Ilha {ROMANOS[ilha.id - 1]} · {ilha.nome} · Dia {dia}</motion.div>
      <motion.h2 variants={item} id="sTitle">{titulo}</motion.h2>
      <motion.div className="rule" variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: .8, ease: [.22, 1, .36, 1] } } }} />
      {body}
    </>
  );
}

export default function Scroll({ dia, dir, onClose, onNav }) {
  const ref = useRef();
  useEffect(() => {
    if (!dia) return;
    const k = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && dia > 1) onNav(dia - 1);
      if (e.key === "ArrowRight" && dia < 30) onNav(dia + 1);
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [dia, onClose, onNav]);
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0; }, [dia]);

  return (
    <AnimatePresence>
      {dia && (
        <motion.div className="scroll-back" onClick={(e) => e.target === e.currentTarget && onClose()}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .5 }}>
          <motion.div className="paper"
            initial={{ scaleY: .04, scaleX: .55, rotateX: 50, opacity: 0, y: 60 }}
            animate={{ scaleY: 1, scaleX: 1, rotateX: 0, opacity: 1, y: 0 }}
            exit={{ scaleY: .04, opacity: 0, y: 40, transition: { duration: .4, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: .35 }}>
            <div className="paper-bg" aria-hidden="true"><div className="paper-fill" /><div className="paper-curl" /></div>
            <article ref={ref} className="scroll" role="dialog" aria-modal="true" aria-labelledby="sTitle" tabIndex={-1}>
              <button className="close" type="button" aria-label="Fechar pergaminho" onClick={onClose}>×</button>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={dia} custom={dir}
                  initial="hidden" animate="show"
                  exit={{ opacity: 0, x: -30 * dir, transition: { duration: .2 } }}
                  variants={{ hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: .06, delayChildren: .5 } } }}>
                  <Conteudo dia={dia} />
                </motion.div>
              </AnimatePresence>
              <div className="nav">
                <button type="button" disabled={dia <= 1} onClick={() => onNav(dia - 1)}>← Dia anterior</button>
                <button type="button" disabled={dia >= 30} onClick={() => onNav(dia + 1)}>Próximo dia →</button>
              </div>
            </article>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
