/* ============================================================
   UI — GSAP: abertura, HUD, navegação por ilhas, pergaminho
   ============================================================ */
(function () {
  const $ = (id) => document.getElementById(id);
  const ROMANOS = ["I", "II", "III", "IV"];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const estado = (d) => (d <= DIAS_CONCLUIDOS ? "done" : d === DIAS_CONCLUIDOS + 1 ? "now" : "locked");
  const ilhaDe = (d) => ILHAS.find((i) => d >= i.dias[0] && d <= i.dias[1]);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---------- abertura ----------
  const title = $("introTitle");
  title.innerHTML = [...title.textContent].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : c}</span>`).join("");

  MareScene.init($("scene"));

  const intro = gsap.timeline();
  intro.from(".intro-eyebrow", { opacity: 0, y: 10, duration: .8, ease: "power2.out" })
    .from("#introTitle .ch", { opacity: 0, y: 60, rotateX: -90, filter: "blur(12px)", stagger: .06, duration: 1, ease: "power4.out" }, .2)
    .to("#introBar", { width: "100%", duration: 1.4, ease: "power2.inOut" }, .4)
    .to("#introTitle .ch", { opacity: 0, y: -40, filter: "blur(10px)", stagger: .03, duration: .6, ease: "power2.in" }, 2.1)
    .to(".intro", { opacity: 0, duration: .9, ease: "power2.inOut", onComplete: () => $("intro").remove() }, 2.4)
    .add(() => {
      const tl = MareScene.intro();
      if (reduce) tl.progress(1);
    }, 2.3)
    .from(".brand > *", { opacity: 0, y: -20, stagger: .12, duration: .9, ease: "power3.out" }, 4.2)
    .from(".progress", { opacity: 0, x: 30, duration: .9, ease: "power3.out" }, 4.4)
    .from(".hud-bottom .isle-btn", { opacity: 0, y: 30, stagger: .08, duration: .7, ease: "back.out(2)" }, 4.6)
    .to("#ringFg", { strokeDashoffset: 169.6 * (1 - DIAS_CONCLUIDOS / 30), duration: 2, ease: "power2.out" }, 4.6)
    .to("#hint", { opacity: .8, duration: 1 }, 6)
    .to("#hint", { opacity: 0, duration: 1 }, 11);
  const counter = { v: 0 };
  intro.to(counter, { v: DIAS_CONCLUIDOS, duration: 2, ease: "power2.out", onUpdate: () => ($("pNum").textContent = `${Math.round(counter.v)} / 30`) }, 4.6);
  if (reduce) intro.progress(1);

  // ---------- botões de ilha ----------
  const isleBox = $("isleBtns");
  ILHAS.forEach((ilha) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "isle-btn"; b.dataset.isle = ilha.id;
    b.innerHTML = `<small>Ilha ${ROMANOS[ilha.id - 1]} · dias ${ilha.dias[0]}–${ilha.dias[1]}</small>${ilha.nome}`;
    isleBox.appendChild(b);
  });
  const allIsleBtns = document.querySelectorAll(".isle-btn");
  let currentIsle = 0;
  function goIsle(i) {
    currentIsle = i;
    allIsleBtns.forEach((b) => b.classList.toggle("active", +b.dataset.isle === i));
    MareScene.flyTo(i);
    const led = $("ledger");
    if (!i) { gsap.to(led, { autoAlpha: 0, x: 30, duration: .4 }); return; }
    const ilha = ILHAS[i - 1];
    $("ledgerTitle").innerHTML = `<small>Ilha ${ROMANOS[i - 1]} · chefe: ${esc(ilha.chefe)}</small>${esc(ilha.nome)}`;
    const chips = $("chips"); chips.innerHTML = "";
    for (let d = ilha.dias[0]; d <= ilha.dias[1]; d++) {
      const c = document.createElement("button");
      const st = estado(d);
      c.type = "button"; c.className = `chip ${st}${CHEFES.includes(d) ? " boss" : ""}`;
      c.innerHTML = `<span>${d}</span>`; c.dataset.dia = d;
      c.title = st === "locked" ? `Dia ${d}: ${PREVISTO[d] || "rota prevista"}` : `Dia ${d}: ${DIARIO[d] ? DIARIO[d].titulo : "navegando agora"}`;
      c.addEventListener("click", () => abrir(d));
      chips.appendChild(c);
    }
    gsap.fromTo(led, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: .7, ease: "power3.out", delay: .5 });
    gsap.from("#chips .chip", { scale: 0, opacity: 0, stagger: .04, duration: .5, ease: "back.out(3)", delay: .7 });
  }
  allIsleBtns.forEach((b) => b.addEventListener("click", () => goIsle(+b.dataset.isle)));
  document.querySelector('.isle-btn[data-isle="0"]').classList.add("active");

  // ---------- tooltip ----------
  const tip = $("tip");
  MareScene.on("hover", (d, e) => {
    if (!d || !e) { tip.hidden = true; return; }
    const st = estado(d);
    const nome = st === "locked" ? PREVISTO[d] || "Rota prevista" : DIARIO[d] ? DIARIO[d].titulo : "Navegando agora";
    const rot = st === "locked" ? `Dia ${d} · ainda não navegado` : st === "now" ? `Dia ${d} · navegando agora` : `Dia ${d} · ${ilhaDe(d).nome}`;
    tip.innerHTML = `<b>${rot}</b>${esc(nome)}`;
    tip.style.left = `${Math.min(Math.max(e.clientX, 130), innerWidth - 130)}px`;
    tip.style.top = `${e.clientY}px`;
    if (tip.hidden) { tip.hidden = false; gsap.fromTo(tip, { opacity: 0, scale: .9 }, { opacity: 1, scale: 1, duration: .25, ease: "power2.out" }); }
  });
  MareScene.on("click", (d) => abrir(d));

  // ---------- pergaminho ----------
  const back = $("back"), scroll = $("scroll"), paper = $("paper");
  let aberto = null, lastFocus = null;
  function conteudo(dia) {
    const st = estado(dia), ilha = ilhaDe(dia), dado = DIARIO[dia];
    $("sEyebrow").textContent = `Ilha ${ROMANOS[ilha.id - 1]} · ${ilha.nome} · Dia ${dia}`;
    let html = "";
    if (dado && st === "done") {
      $("sTitle").textContent = dado.titulo;
      html += dado.texto.map((p) => `<p>${esc(p)}</p>`).join("");
      if (dado.citacao) html += `<p class="quote">“${esc(dado.citacao)}”</p>`;
      if (dado.codigo) html += `<h3>Do caderno de código</h3><pre><code>${esc(dado.codigo)}</code></pre>`;
      if (dado.aprendi) html += `<h3>O que ficou</h3><ul>${dado.aprendi.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>`;
      if (dado.monstro) html += `<div class="monster"><b>${esc(dado.monstro.nome)}</b><span>${esc(dado.monstro.desc)}</span></div>`;
    } else if (st === "now") {
      $("sTitle").textContent = PREVISTO[dia] || "Navegando agora";
      html += `<p>O navio do capitão está aqui. Este pergaminho ainda está em branco: ele será escrito quando o dia ${dia} terminar.</p>`;
      html += `<p class="quote">Algumas aventuras terminam em ouro. Outras terminam no fundo do mar.</p>`;
    } else {
      $("sTitle").textContent = PREVISTO[dia] || "Rota prevista";
      html += `<p>Águas ainda não navegadas. A rota prevista para o dia ${dia} é: <i>${esc(PREVISTO[dia] || "a definir")}</i>.</p>`;
      if (CHEFES.includes(dia)) html += `<p>Um chefe espera aqui: <b>${esc(ilha.chefe)}</b>.</p>`;
    }
    $("sBody").innerHTML = html;
    $("prev").disabled = dia <= 1; $("next").disabled = dia >= 30;
  }
  function revealText() {
    gsap.fromTo(["#sEyebrow", "#sTitle", ".rule", "#sBody > *", ".nav"],
      { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: .05, duration: .55, ease: "power2.out", delay: .15 });
  }
  function abrir(dia, troca = false) {
    dia = Number(dia);
    MareScene.focusDay(dia);
    tip.hidden = true;
    if (troca && aberto) {
      const dir = dia > aberto ? 1 : -1;
      gsap.to("#sEyebrow, #sTitle, #sBody, .rule", { opacity: 0, x: -30 * dir, duration: .2, ease: "power2.in", onComplete: () => {
        conteudo(dia); scroll.scrollTop = 0;
        gsap.set("#sEyebrow, #sTitle, #sBody, .rule", { x: 0, opacity: 1 });
        gsap.fromTo(["#sEyebrow", "#sTitle", ".rule", "#sBody > *"], { opacity: 0, x: 30 * dir }, { opacity: 1, x: 0, stagger: .04, duration: .45, ease: "power3.out" });
      } });
    } else {
      conteudo(dia);
      lastFocus = document.activeElement;
      back.hidden = false; scroll.scrollTop = 0;
      gsap.fromTo(back, { opacity: 0 }, { opacity: 1, duration: .5, delay: .5 });
      gsap.fromTo(paper, { scaleY: .05, scaleX: .6, opacity: 0, rotateX: 40 },
        { scaleY: 1, scaleX: 1, opacity: 1, rotateX: 0, duration: .9, ease: "expo.out", delay: .6, onComplete: () => scroll.focus() });
      gsap.set(["#sEyebrow", "#sTitle", ".rule", "#sBody > *", ".nav"], { opacity: 0 });
      gsap.delayedCall(.75, revealText);
    }
    aberto = dia;
    if (location.hash !== `#dia-${dia}`) history.replaceState(null, "", `#dia-${dia}`);
  }
  function fechar() {
    gsap.to(paper, { scaleY: .05, opacity: 0, duration: .45, ease: "power3.in" });
    gsap.to(back, { opacity: 0, duration: .45, onComplete: () => { back.hidden = true; } });
    aberto = null;
    history.replaceState(null, "", location.pathname + location.search);
    MareScene.flyTo(currentIsle);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $("close").addEventListener("click", fechar);
  back.addEventListener("click", (e) => { if (e.target === back) fechar(); });
  $("prev").addEventListener("click", () => abrir(aberto - 1, true));
  $("next").addEventListener("click", () => abrir(aberto + 1, true));
  document.addEventListener("keydown", (e) => {
    if (back.hidden) return;
    if (e.key === "Escape") fechar();
    if (e.key === "ArrowLeft" && aberto > 1) abrir(aberto - 1, true);
    if (e.key === "ArrowRight" && aberto < 30) abrir(aberto + 1, true);
  });
  const m = location.hash.match(/^#dia-(\d{1,2})$/);
  if (m && +m[1] >= 1 && +m[1] <= 30) gsap.delayedCall(6.5, () => abrir(+m[1]));
})();
