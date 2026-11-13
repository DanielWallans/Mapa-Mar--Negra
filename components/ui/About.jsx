"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { DIAS_CONCLUIDOS } from "@/lib/data";

/* Pergaminho "Sobre este diário": explica que o mapa é o diário
   de alguém aprendendo Java do zero, um dia de cada vez. */

const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: .5, ease: [.22, 1, .36, 1] } } };

const PASSOS = [
  ["Cada dia é um selo", "Um selo de cera no mapa marca um dia de estudo. Clique nele para ler o que aconteceu naquele dia."],
  ["Cada ilha é uma etapa", "Variáveis, laços, objetos e o desafio final. Uma ilha por fase do aprendizado, do básico ao avançado."],
  ["Cada bug vira um monstro", "Os erros que apareceram no caminho estão registrados no pergaminho do dia, com o nome que ganharam."],
  ["Cada ilha tem um chefe", "No fim de cada etapa há uma prova: o chefe só cai quando o conteúdo da ilha foi entendido."],
];

export default function About({ open, onClose }) {
  const [ok, setOk] = useState(false);
  useEffect(() => setOk(true), []);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open, onClose]);

  if (!ok) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="scroll-back" onClick={(e) => e.target === e.currentTarget && onClose()}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .5 }}>
          <motion.div className="paper"
            initial={{ scaleY: .04, scaleX: .55, rotateX: 50, opacity: 0, y: 60 }}
            animate={{ scaleY: 1, scaleX: 1, rotateX: 0, opacity: 1, y: 0 }}
            exit={{ scaleY: .04, opacity: 0, y: 40, transition: { duration: .4, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 120, damping: 18, delay: .2 }}>
            <div className="paper-bg" aria-hidden="true"><div className="paper-fill" /><div className="paper-curl" /></div>
            <article className="scroll" role="dialog" aria-modal="true" aria-labelledby="aboutTitle">
              <button className="close" type="button" aria-label="Fechar" onClick={onClose}>×</button>
              <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: .07, delayChildren: .45 } } }}>
                <motion.div variants={item} className="eyebrow">Sobre este mapa</motion.div>
                <motion.h2 variants={item} id="aboutTitle">O diário de quem está aprendendo Java</motion.h2>
                <motion.div className="rule" variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: .8 } } }} />
                <motion.p variants={item}>
                  Este mapa é um <b>diário</b>. Ele registra a jornada de uma pessoa que decidiu aprender <b>Java do básico</b>: sem
                  pular etapas, começando pela instalação, pelo primeiro <code>System.out.println</code> e pelas primeiras variáveis.
                </motion.p>
                <motion.p variants={item}>
                  A meta é <b>30 dias</b>, cerca de 20 minutos por dia. Em vez de anotar o progresso numa planilha, cada dia virou um
                  ponto numa carta náutica, e o estudo virou uma viagem de navio entre ilhas.
                </motion.p>
                <motion.p variants={item} className="quote">Ninguém nasce sabendo navegar. Aprende-se uma onda de cada vez.</motion.p>
                <motion.h3 variants={item}>Como ler o diário</motion.h3>
                <motion.ul variants={item} className="about-steps">
                  {PASSOS.map(([t, d]) => <li key={t}><b>{t}.</b> {d}</li>)}
                </motion.ul>
                <motion.p variants={item}>
                  Até agora foram <b>{DIAS_CONCLUIDOS} de 30 dias</b>. O navio fica parado no dia atual, e as águas à frente
                  ainda não foram navegadas: o diário vai sendo escrito conforme o aprendizado avança.
                </motion.p>
                <motion.p variants={item}>
                  Quer a história completa? O <b>Diário de Bordo Java</b>, no botão no canto do mapa, conta tudo em detalhes.
                </motion.p>
                <motion.div variants={item} className="nav">
                  <button type="button" onClick={onClose}>Zarpar →</button>
                </motion.div>
              </motion.div>
            </article>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
