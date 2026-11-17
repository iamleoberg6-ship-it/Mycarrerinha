// Guia para quem chega: um tour rápido na primeira vez (destaca cada parte da tela com um balão e "Próximo") e a
// ajuda "Como jogar", que abre a qualquer hora pelo botão "?". Serve aos dois modos (jogador e técnico).
// O tour só aparece uma vez por modo; a lembrança fica no aparelho (se o navegador não deixar guardar, ele só
// aparece de novo, nada quebra).

export interface PassoTour { alvo: string; titulo: string; texto: string }
export interface SecaoAjuda { titulo: string; itens: string[] }

const chave = (k: string) => `mycarrerinha:tour:${k}`;
export function tourFeito(k: string): boolean { try { return localStorage.getItem(chave(k)) === "1"; } catch { return false; } }
export function marcarTour(k: string, feito = true) { try { if (feito) localStorage.setItem(chave(k), "1"); else localStorage.removeItem(chave(k)); } catch { /* sem armazenamento: tudo bem */ } }

const CSS = `
.guia-fundo{position:fixed;inset:0;z-index:9000;pointer-events:auto}
.guia-luz{position:fixed;border-radius:14px;box-shadow:0 0 0 9999px rgba(4,10,7,.72),0 0 0 3px #E3B341;transition:all .25s ease;pointer-events:none;z-index:9001}
.guia-balao{position:fixed;left:12px;right:12px;max-width:420px;margin:0 auto;background:#14261C;color:#EDEBE3;border:1px solid #E3B341;border-radius:16px;padding:14px 16px 12px;box-shadow:0 12px 30px #000a;z-index:9002;font:15px/1.4 Barlow,system-ui,sans-serif}
.guia-balao h3{margin:0 0 4px;font:800 18px/1.15 'Big Shoulders Display',Barlow,sans-serif;letter-spacing:.02em;color:#E3B341}
.guia-balao p{margin:0}
.guia-balao .guia-pe{display:flex;align-items:center;gap:8px;margin-top:12px}
.guia-balao .guia-pe small{flex:1;color:#9FB3A6}
.guia-balao button{font:700 14px Barlow,sans-serif;border-radius:10px;padding:9px 14px;cursor:pointer;border:1px solid #E3B341}
.guia-balao .guia-prox{background:#E3B341;color:#14261C}
.guia-balao .guia-pular{background:transparent;color:#EDEBE3;border-color:#3B5446}
.botao-ajuda{margin-left:auto;width:32px;height:32px;border-radius:50%;border:1px solid currentColor;background:transparent;color:inherit;font:800 16px Barlow,sans-serif;cursor:pointer;opacity:.85;flex:none}
.marca .botao-ajuda+.engrenagem{margin-left:6px}
.ajuda-dlg{max-width:560px;width:calc(100% - 24px);max-height:86vh;border:1px solid #3B5446;border-radius:18px;padding:0;background:#10201A;color:#EDEBE3}
.ajuda-dlg::backdrop{background:rgba(0,0,0,.6)}
.ajuda-dlg .ajuda-in{padding:16px 18px 18px;overflow:auto;max-height:86vh;box-sizing:border-box}
.ajuda-dlg h2{margin:0 0 4px;font:800 24px/1.1 'Big Shoulders Display',Barlow,sans-serif;color:#E3B341}
.ajuda-dlg details{border-top:1px solid #24392D;padding:10px 0}
.ajuda-dlg summary{cursor:pointer;font-weight:800;font-size:16px;list-style:none;display:flex;justify-content:space-between}
.ajuda-dlg summary::after{content:"+";color:#E3B341}.ajuda-dlg details[open] summary::after{content:"−"}
.ajuda-dlg ul{margin:8px 0 0;padding-left:18px}.ajuda-dlg li{margin:5px 0;line-height:1.4}
.ajuda-dlg .ajuda-pe{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap}
.ajuda-dlg .ajuda-pe button{font:700 14px Barlow,sans-serif;border-radius:10px;padding:10px 14px;cursor:pointer;border:1px solid #E3B341;background:#E3B341;color:#14261C}
.ajuda-dlg .ajuda-pe button.sec{background:transparent;color:#EDEBE3;border-color:#3B5446}
`;
function garantirCss() {
  if (document.getElementById("guia-css")) return;
  const st = document.createElement("style"); st.id = "guia-css"; st.textContent = CSS; document.head.appendChild(st);
}
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** O botão "?" do cabeçalho. */
export const botaoAjuda = () => { if (typeof document !== "undefined") garantirCss(); return `<button class="botao-ajuda" data-ajuda aria-label="Como jogar" title="Como jogar">?</button>`; };

/** Mostra o tour passo a passo (só os passos cujo alvo existe na tela). `fim` roda quando acaba ou é pulado. */
export function tour(k: string, passos: PassoTour[], fim?: () => void) {
  garantirCss();
  const lista = passos.filter((p) => document.querySelector(p.alvo));
  if (!lista.length) return;
  document.querySelector(".guia-fundo")?.remove(); document.querySelector(".guia-luz")?.remove(); document.querySelector(".guia-balao")?.remove();
  const fundo = document.createElement("div"); fundo.className = "guia-fundo";
  const luz = document.createElement("div"); luz.className = "guia-luz";
  const balao = document.createElement("div"); balao.className = "guia-balao"; balao.setAttribute("role", "dialog"); balao.setAttribute("aria-live", "polite");
  document.body.append(fundo, luz, balao);
  let i = 0;
  const acabar = () => { fundo.remove(); luz.remove(); balao.remove(); window.removeEventListener("resize", mostrar); marcarTour(k); fim?.(); };
  function mostrar() {
    const p = lista[i], el = document.querySelector<HTMLElement>(p.alvo);
    if (!el) { if (++i < lista.length) mostrar(); else acabar(); return; }
    el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    const r = el.getBoundingClientRect(), m = 6;
    Object.assign(luz.style, { left: `${r.left - m}px`, top: `${r.top - m}px`, width: `${r.width + m * 2}px`, height: `${r.height + m * 2}px` });
    balao.innerHTML = `<h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p><div class="guia-pe"><small>${i + 1} de ${lista.length}</small><button class="guia-pular">Pular</button><button class="guia-prox">${i + 1 < lista.length ? "Próximo" : "Começar a jogar"}</button></div>`;
    // o balão vai embaixo do destaque se couber; senão, em cima
    const alto = balao.offsetHeight || 150, abaixo = r.bottom + m + 12;
    balao.style.top = abaixo + alto < window.innerHeight - 8 ? `${abaixo}px` : `${Math.max(8, r.top - m - 12 - alto)}px`;
    balao.querySelector<HTMLButtonElement>(".guia-prox")!.onclick = () => { if (++i < lista.length) mostrar(); else acabar(); };
    balao.querySelector<HTMLButtonElement>(".guia-pular")!.onclick = acabar;
    balao.querySelector<HTMLButtonElement>(".guia-prox")!.focus();
  }
  fundo.onclick = () => { if (++i < lista.length) mostrar(); else acabar(); };
  window.addEventListener("resize", mostrar);
  mostrar();
}

/** A ajuda "Como jogar": seções que abrem e fecham, e um botão para ver o tour de novo. */
export function abrirAjuda(titulo: string, intro: string, secoes: SecaoAjuda[], reverTour?: () => void) {
  garantirCss();
  let dlg = document.getElementById("ajuda-dlg") as HTMLDialogElement | null;
  if (!dlg) { dlg = document.createElement("dialog"); dlg.id = "ajuda-dlg"; dlg.className = "ajuda-dlg"; document.body.appendChild(dlg); }
  dlg.innerHTML = `<div class="ajuda-in"><h2>${esc(titulo)}</h2><p style="margin:0 0 10px;color:#9FB3A6">${esc(intro)}</p>
    ${secoes.map((s, k) => `<details${k === 0 ? " open" : ""}><summary>${esc(s.titulo)}</summary><ul>${s.itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></details>`).join("")}
    <div class="ajuda-pe">${reverTour ? `<button class="sec" data-rever-tour>Ver o tour de novo</button>` : ""}<button data-fechar-ajuda>Entendi</button></div></div>`;
  dlg.querySelector<HTMLButtonElement>("[data-fechar-ajuda]")!.onclick = () => dlg!.close();
  const rv = dlg.querySelector<HTMLButtonElement>("[data-rever-tour]"); if (rv && reverTour) rv.onclick = () => { dlg!.close(); reverTour(); };
  dlg.onclick = (ev) => { if (ev.target === dlg) dlg!.close(); };
  dlg.showModal();
}
