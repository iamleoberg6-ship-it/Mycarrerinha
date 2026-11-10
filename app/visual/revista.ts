// A revista ISPN na tela: capa com a lista escolhida, o ano, e os 100 nomes (com o seu em dourado).
import { LISTAS_REVISTA, type EdicaoRevista, type ListaRevista } from "../../src/revista";

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export interface OpcoesRevista { lista: ListaRevista; anos: (number | "previa")[]; ano: number | "previa"; nomeClube: (id: string) => string; escudo: (id: string) => string; bandeira?: (pais: string) => string }
export function revistaHtml(ed: EdicaoRevista | undefined, o: OpcoesRevista): string {
  const info = LISTAS_REVISTA.find((x) => x.id === o.lista)!;
  const anos = o.anos.map((a) => `<button class="${a === o.ano ? "rv-on" : ""}" data-rvano="${a}">${a === "previa" ? "Prévia de agora" : a}</button>`).join("");
  const listas = LISTAS_REVISTA.map((l) => `<button class="${l.id === o.lista ? "rv-on" : ""}" data-rvlista="${l.id}">${esc(l.curto)}</button>`).join("");
  const l = ed?.listas[o.lista] ?? [];
  const eu = l.findIndex((x) => x.eu);
  return `<style>${CSS}</style><div class="rv">
    <div class="rv-capa" style="--capa:${info.capa}"><span class="rv-marca">ISPN</span><span class="rv-sub">THE MAGAZINE</span><b>${esc(info.nome)}</b><small>${o.ano === "previa" ? "Prévia da temporada em andamento" : `Edição de ${o.ano}`}</small>
      ${l[0] ? `<div class="rv-n1">${o.escudo(l[0].clubeId)}<div><small>Nº 1</small><b>${esc(l[0].nome)}</b><span>${esc(o.nomeClube(l[0].clubeId))}</span></div></div>` : ""}</div>
    <div class="rv-chips">${listas}</div><div class="rv-chips">${anos}</div>
    ${eu >= 0 ? `<p class="rv-eu">Você está em <b>${eu + 1}º</b> nesta lista.</p>` : ""}
    ${l.length ? `<ol class="rv-lista">${l.map((x, i) => `<li class="${x.eu ? "rv-eu-l" : ""}${i < 3 ? " rv-top" : ""}"><span class="rv-p">${i + 1}</span>${o.escudo(x.clubeId)}<div><b>${esc(x.nome)}</b><small>${esc(x.posicao)} · ${x.idade} anos · ${esc(o.nomeClube(x.clubeId))}</small><small>${x.jogos} j · ${x.gols} g · ${x.assist} a · nota ${x.nota.toFixed(2).replace(".", ",")}</small></div><span class="rv-pts">${x.pontos.toFixed(1).replace(".", ",")}</span></li>`).join("")}</ol>`
      : `<p class="sub">${ed ? "Ninguém nesta lista ainda." : "A primeira edição sai no fim da temporada. Veja a prévia de agora."}</p>`}</div>`;
}
const CSS = `.rv-capa{position:relative;border-radius:16px;padding:16px 16px 14px;background:linear-gradient(160deg,var(--capa),#0B0F0D 120%);color:#fff;overflow:hidden;margin-bottom:10px}
.rv-marca{font:900 40px/1 'Big Shoulders Display','Arial Narrow',sans-serif;letter-spacing:2px;display:block}.rv-sub{font-size:10px;letter-spacing:4px;opacity:.75;display:block;margin-bottom:8px}
.rv-capa>b{display:block;font:800 22px/1.1 'Big Shoulders Display','Arial Narrow',sans-serif;text-transform:uppercase}.rv-capa>small{opacity:.8;font-size:12px}
.rv-n1{display:flex;gap:10px;align-items:center;margin-top:12px;background:rgba(0,0,0,.25);border-radius:12px;padding:8px}.rv-n1 svg,.rv-n1 img{width:34px;height:34px}.rv-n1 small{display:block;font-size:10px;opacity:.7;letter-spacing:2px}.rv-n1 b{display:block}.rv-n1 span{font-size:12px;opacity:.8}
.rv-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.rv-chips button{font:inherit;font-size:12.5px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04);color:inherit;cursor:pointer}.rv-chips .rv-on{background:var(--ouro,#E3B341);color:#12100A;border-color:var(--ouro,#E3B341);font-weight:700}
.rv-eu{margin:6px 0;color:var(--ouro,#E3B341)}.rv-lista{list-style:none;padding:0;margin:8px 0 0}.rv-lista li{display:grid;grid-template-columns:30px 28px 1fr auto;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.08)}
.rv-lista li svg,.rv-lista li img{width:26px;height:26px}.rv-lista small{display:block;font-size:11.5px;opacity:.75}.rv-p{font:800 18px 'Big Shoulders Display','Arial Narrow',sans-serif;text-align:center;opacity:.8}.rv-top .rv-p{color:var(--ouro,#E3B341);opacity:1}
.rv-pts{font-weight:700;font-size:13px;opacity:.85}.rv-eu-l{background:rgba(227,179,65,.12);border-radius:8px}.rv-eu-l b{color:var(--ouro,#E3B341)}`;
