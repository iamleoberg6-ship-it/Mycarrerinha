// A revista ISPN na tela: capa com a lista escolhida, o ano, e os 100 nomes (com o seu em dourado).
import { LISTAS_REVISTA, type EdicaoRevista, type ItemRevista, type ListaRevista } from "../../src/revista";

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export interface OpcoesRevista { lista: ListaRevista; anos: (number | "previa")[]; ano: number | "previa"; nomeClube: (id: string) => string; escudo: (id: string) => string;
  /** retrato do jogador (capa e pódio) */ foto?: (x: ItemRevista) => string }
const MESES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
/** A revista no estilo das revistas esportivas: capa preta com a faixa vermelha, o "100" gigante e o Nº 1 na foto. */
export function revistaHtml(ed: EdicaoRevista | undefined, o: OpcoesRevista): string {
  const info = LISTAS_REVISTA.find((x) => x.id === o.lista)!;
  const anos = o.anos.map((a) => `<button class="${a === o.ano ? "rv-on" : ""}" data-rvano="${a}">${a === "previa" ? "Prévia de agora" : a}</button>`).join("");
  const listas = LISTAS_REVISTA.map((l) => `<button class="${l.id === o.lista ? "rv-on" : ""}" data-rvlista="${l.id}">${esc(l.curto)}</button>`).join("");
  const l = ed?.listas[o.lista] ?? [], n1 = l[0], eu = l.findIndex((x) => x.eu);
  const quando = o.ano === "previa" ? "PRÉVIA · TEMPORADA EM ANDAMENTO" : `EDIÇÃO DE DEZEMBRO ${o.ano}`;
  const titulo = info.nome.replace("Os 100 melhores ", "").toUpperCase();
  const capa = `<div class="rv-capa" style="--cor:${info.capa}">
    <div class="rv-topo"><span class="rv-logo">ISPN</span><span class="rv-the">THE<br>MAGAZINE</span><span class="rv-data">${quando}<br>${MESES[11]} · R$ 19,90</span></div>
    ${n1 && o.foto ? `<div class="rv-foto">${o.foto(n1)}</div>` : ""}
    <div class="rv-cem"><b>100</b><span>OS MELHORES<br>${esc(titulo)}</span></div>
    ${n1 ? `<div class="rv-chamada"><small>Nº 1 DA LISTA</small><b>${esc(n1.nome.toUpperCase())}</b><span>${esc(o.nomeClube(n1.clubeId))} · ${n1.gols} gols · nota ${n1.nota.toFixed(2).replace(".", ",")}</span></div>` : ""}
    ${l[1] ? `<div class="rv-lado">+ ${esc(l[1].nome)}, ${esc(l[2]?.nome ?? "")} e os outros 97</div>` : ""}
  </div>`;
  const podio = l.length >= 3 ? `<div class="rv-podio">${[1, 0, 2].map((i) => { const x = l[i]; return `<div class="rv-pd rv-pd${i + 1}${x.eu ? " rv-eu-l" : ""}">${o.foto ? `<div class="rv-pf">${o.foto(x)}</div>` : o.escudo(x.clubeId)}<i>${i + 1}</i><b>${esc(x.nome)}</b><small>${esc(o.nomeClube(x.clubeId))}</small></div>`; }).join("")}</div>` : "";
  return `<style>${CSS}</style><div class="rv">${capa}
    <div class="rv-chips">${listas}</div><div class="rv-chips">${anos}</div>
    ${eu >= 0 ? `<p class="rv-eu">Você está em <b>${eu + 1}º</b> nesta lista.</p>` : ""}
    ${podio}
    ${l.length ? `<ol class="rv-lista">${l.slice(3).map((x, k) => { const i = k + 3; return `<li class="${x.eu ? "rv-eu-l" : ""}"><span class="rv-p">${i + 1}</span>${o.escudo(x.clubeId)}<div><b>${esc(x.nome)}</b><small>${esc(x.posicao)} · ${x.idade} anos · ${esc(o.nomeClube(x.clubeId))}</small><small>${x.jogos} j · ${x.gols} g · ${x.assist} a · nota ${x.nota.toFixed(2).replace(".", ",")}</small></div><span class="rv-pts">${x.pontos.toFixed(1).replace(".", ",")}</span></li>`; }).join("")}</ol>`
      : `<p class="sub">${ed ? "Ninguém nesta lista ainda." : "A primeira edição sai no fim da temporada. Veja a prévia de agora."}</p>`}</div>`;
}
const F = "'Big Shoulders Display','Oswald','Arial Narrow',sans-serif";
const CSS = `.rv-capa{position:relative;height:520px;border-radius:6px;background:#0A0A0A;color:#fff;overflow:hidden;margin-bottom:10px;box-shadow:0 10px 30px rgba(0,0,0,.45)}
.rv-capa::before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 0 48%,var(--cor) 48% 62%,transparent 62%),radial-gradient(120% 70% at 75% 40%,rgba(255,255,255,.12),transparent 60%);opacity:.95}
.rv-topo{position:absolute;top:0;left:0;right:0;display:flex;align-items:flex-start;gap:8px;padding:12px 14px;z-index:3}
.rv-logo{background:#E4002B;color:#fff;font:italic 900 46px/0.9 ${F};letter-spacing:-1px;padding:4px 10px 2px 8px;transform:skewX(-8deg)}
.rv-the{font:800 11px/1.05 ${F};letter-spacing:2px;margin-top:6px}.rv-data{margin-left:auto;text-align:right;font:700 9.5px/1.3 ${F};letter-spacing:1px;opacity:.8}
.rv-foto{position:absolute;right:-14%;top:96px;width:300px;height:330px;z-index:1;overflow:hidden;-webkit-mask-image:linear-gradient(#000 70%,transparent);mask-image:linear-gradient(#000 70%,transparent)}.rv-foto svg{width:100%;height:100%;display:block}
.rv-cem{position:absolute;left:12px;top:84px;z-index:2;text-shadow:0 4px 18px rgba(0,0,0,.6)}.rv-cem b{display:block;font:italic 900 128px/0.82 ${F};letter-spacing:-6px;color:#fff;-webkit-text-stroke:2px #E4002B}
.rv-cem span{display:block;font:italic 900 24px/0.95 ${F};text-transform:uppercase;margin-top:6px;max-width:150px}
.rv-chamada{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:40px 14px 14px;background:linear-gradient(transparent,rgba(0,0,0,.92) 45%)}.rv-chamada small{display:inline-block;background:#E4002B;font:800 10px ${F};letter-spacing:2px;padding:2px 6px}
.rv-chamada b{display:block;font:italic 900 34px/0.95 ${F};margin-top:4px}.rv-chamada span{font-size:12px;opacity:.85}
.rv-lado{position:absolute;left:14px;top:318px;z-index:2;max-width:44%;font:italic 800 14px/1.1 ${F};text-transform:uppercase;border-left:3px solid #E4002B;padding-left:6px}
.rv-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.rv-chips button{font:inherit;font-size:12.5px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04);color:inherit;cursor:pointer}.rv-chips .rv-on{background:#E4002B;color:#fff;border-color:#E4002B;font-weight:700}
.rv-eu{margin:6px 0;color:var(--ouro,#E3B341)}
.rv-podio{display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:8px;align-items:end;margin:10px 0}.rv-pd{position:relative;background:#111;border-radius:8px;overflow:hidden;padding-bottom:8px;text-align:center}.rv-pd1{border-top:4px solid #E4002B}
.rv-pf svg{width:100%;height:auto;display:block}.rv-pd i{position:absolute;top:4px;left:6px;font:italic 900 34px/1 ${F};color:#fff;-webkit-text-stroke:1.5px #E4002B}.rv-pd b{display:block;font:italic 800 15px/1.05 ${F};margin:6px 6px 0;text-transform:uppercase}.rv-pd small{display:block;font-size:11px;opacity:.7}
.rv-lista{list-style:none;padding:0;margin:8px 0 0}.rv-lista li{display:grid;grid-template-columns:42px 28px 1fr auto;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.08)}
.rv-lista li svg,.rv-lista li img{width:26px;height:26px}.rv-lista small{display:block;font-size:11.5px;opacity:.75}.rv-p{font:italic 900 24px/1 ${F};text-align:center;color:#E4002B}
.rv-pts{font-weight:700;font-size:13px;opacity:.85}.rv-eu-l{background:rgba(227,179,65,.12);border-radius:8px}.rv-eu-l b{color:var(--ouro,#E3B341)}`;
