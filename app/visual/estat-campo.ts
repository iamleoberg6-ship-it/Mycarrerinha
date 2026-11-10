// Tela de estatísticas completas da partida (modo jogador e técnico): comparação dos times, o campinho com as
// finalizações, o mapa de calor, os passes e os desarmes de cada jogador, e a tabela com os números de todo mundo.
// Sem JavaScript: as abas e a escolha do jogador são botões de rádio + CSS (funciona dentro de qualquer modal).
import { GX, GY, type EstatCompleta, type Ponto } from "../../src/estatisticas-completas";

let seq = 0;
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const L = 105, A = 68;
/** Ponto do time no campinho (o time 0 ataca para a direita, o 1 para a esquerda). */
const px = (p: Ponto, time: 0 | 1) => ({ x: ((time === 0 ? p.x : 100 - p.x) / 100) * L, y: ((time === 0 ? p.y : 100 - p.y) / 100) * A });
const f1 = (n: number) => n.toFixed(1);
function campo(conteudo: string): string {
  return `<svg viewBox="-2 -2 ${L + 4} ${A + 4}" class="ec-campo" role="img" aria-label="Campo"><rect x="-2" y="-2" width="${L + 4}" height="${A + 4}" fill="#2F6B3A"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${i * 15}" y="0" width="7.5" height="${A}" fill="#2A6134"/>`).join("")}
    <g fill="none" stroke="rgba(255,255,255,.7)" stroke-width=".4"><rect x="0" y="0" width="${L}" height="${A}"/><line x1="${L / 2}" y1="0" x2="${L / 2}" y2="${A}"/><circle cx="${L / 2}" cy="${A / 2}" r="9.15"/>
    <rect x="0" y="${A / 2 - 20.16}" width="16.5" height="40.32"/><rect x="${L - 16.5}" y="${A / 2 - 20.16}" width="16.5" height="40.32"/><rect x="0" y="${A / 2 - 9.16}" width="5.5" height="18.32"/><rect x="${L - 5.5}" y="${A / 2 - 9.16}" width="5.5" height="18.32"/>
    <rect x="-1.5" y="${A / 2 - 3.66}" width="1.5" height="7.32"/><rect x="${L}" y="${A / 2 - 3.66}" width="1.5" height="7.32"/></g>${conteudo}</svg>`;
}
const COR_RES = { gol: "#F5C400", defesa: "#4FA3E0", fora: "#E06A5A", bloqueado: "#B9B9B9" } as const;
const NOME_RES = { gol: "Gol", defesa: "Defendida", fora: "Para fora", bloqueado: "Bloqueada" } as const;

/** nomes: [casa, fora]; meu: o time do usuário (destaque); titulo opcional. */
export function estatCompletaHtml(e: EstatCompleta, nomes: [string, string], meu: 0 | 1): string {
  const id = `ec${++seq}`, [a, b] = e.times;
  const barra = (rot: string, x: number, y: number, dec = 0, pct = false) => {
    const tot = x + y || 1, w = (x / tot) * 100, fmt = (n: number) => `${n.toFixed(dec).replace(".", ",")}${pct ? "%" : ""}`;
    return `<div class="ec-lin"><b>${fmt(x)}</b><span>${rot}</span><b>${fmt(y)}</b><i class="ec-bar"><s style="width:${f1(w)}%"></s></i></div>`;
  };
  const pc = (t: typeof a) => (t.passes ? Math.round((t.passesCertos / t.passes) * 100) : 0);
  const comparacao = `<div class="ec-times"><b class="${meu === 0 ? "ec-eu" : ""}">${esc(nomes[0])}</b><b class="${meu === 1 ? "ec-eu" : ""}">${esc(nomes[1])}</b></div>
    ${barra("Posse de bola", a.posse, b.posse, 0, true)}${barra("Finalizações", a.finalizacoes, b.finalizacoes)}${barra("No alvo", a.noAlvo, b.noAlvo)}${barra("Bloqueadas", a.bloqueadas, b.bloqueadas)}
    ${barra("Gol esperado (xG)", a.xg, b.xg, 2)}${barra("Passes", a.passes, b.passes)}${barra("Passes certos", a.passesCertos, b.passesCertos)}${barra("Acerto de passe", pc(a), pc(b), 0, true)}
    ${barra("Desarmes", a.desarmes, b.desarmes)}${barra("Interceptações", a.interceptacoes, b.interceptacoes)}${barra("Defesas do goleiro", a.defesas, b.defesas)}
    ${barra("Faltas", a.faltas, b.faltas)}${barra("Cartões amarelos", a.amarelos, b.amarelos)}${barra("Cartões vermelhos", a.vermelhos, b.vermelhos)}${barra("Escanteios", a.escanteios, b.escanteios)}${barra("Impedimentos", a.impedimentos, b.impedimentos)}`;
  // finalizações dos dois times no mesmo campo
  const tiros = e.finalizacoes.map((f) => { const p = px(f, f.time), r = 0.9 + f.xg * 2.4; return `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="${f1(r)}" fill="${COR_RES[f.resultado]}" fill-opacity="${f.resultado === "gol" ? 1 : 0.8}" stroke="${f.time === meu ? "#fff" : "#111"}" stroke-width="${f.resultado === "gol" ? 0.6 : 0.3}"><title>${f.min}' ${esc(f.autor ?? "")} · ${NOME_RES[f.resultado]} · xG ${f.xg.toFixed(2)}</title></circle>`; }).join("");
  const legenda = `<div class="ec-leg">${(Object.keys(COR_RES) as (keyof typeof COR_RES)[]).map((k) => `<span><i style="background:${COR_RES[k]}"></i>${NOME_RES[k]}</span>`).join("")}<span>Bolinha maior = chance mais clara · contorno branco = ${esc(nomes[meu])}</span></div>
    <div class="ec-leg"><span>⟵ ${esc(nomes[1])} ataca</span><span style="margin-left:auto">${esc(nomes[0])} ataca ⟶</span></div>`;
  // jogadores do time do usuário que entraram em campo (o rapaz do modo jogador primeiro)
  const lista = e.jogadores.filter((j) => j.time === meu && !j.generico && j.min > 0).sort((x, y) => Number(!!y.eu) - Number(!!x.eu) || ordemPos(x.pos) - ordemPos(y.pos));
  const mapaJog = (j: (typeof lista)[number], k: number) => {
    const cw = L / GX, ch = A / GY;
    const calor = j.calor.map((v, i) => { if (v < 0.05) return ""; const gx = i % GX, gy = Math.floor(i / GX), x = j.time === 0 ? gx : GX - 1 - gx, y = j.time === 0 ? gy : GY - 1 - gy; return `<rect x="${f1(x * cw)}" y="${f1(y * ch)}" width="${f1(cw)}" height="${f1(ch)}" fill="hsl(${Math.round(60 - v * 60)} 95% 52%)" fill-opacity="${f1(0.15 + v * 0.65)}" rx="1.5"/>`; }).join("");
    const passes = j.mapaPasses.map((p) => { const d = px(p.de, j.time), q = px(p.para, j.time); return `<line x1="${f1(d.x)}" y1="${f1(d.y)}" x2="${f1(q.x)}" y2="${f1(q.y)}" stroke="${p.certo ? "#7CF0A0" : "#FF6B5B"}" stroke-width=".55" stroke-opacity=".85" marker-end="url(#${id}-s${p.certo ? "c" : "e"})"/>`; }).join("");
    const des = j.mapaDesarmes.map((p, i) => { const q = px(p, j.time); return i < j.desarmes ? `<path d="M${f1(q.x - 1.2)} ${f1(q.y - 1.2)} L${f1(q.x + 1.2)} ${f1(q.y + 1.2)} M${f1(q.x + 1.2)} ${f1(q.y - 1.2)} L${f1(q.x - 1.2)} ${f1(q.y + 1.2)}" stroke="#FFD34D" stroke-width=".7"/>` : `<circle cx="${f1(q.x)}" cy="${f1(q.y)}" r="1.1" fill="none" stroke="#7CC7FF" stroke-width=".6"/>`; }).join("");
    return `<div class="ec-m ec-v2 ec-p${k}">${campo(calor)}<p class="ec-cap">Mapa de calor de ${esc(j.nome)}: onde ele mais ficou (vermelho = muito, amarelo = pouco).</p></div>
      <div class="ec-m ec-v3 ec-p${k}">${campo(`<defs><marker id="${id}-sc" viewBox="0 0 4 4" refX="3" refY="2" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0L4 2L0 4z" fill="#7CF0A0"/></marker><marker id="${id}-se" viewBox="0 0 4 4" refX="3" refY="2" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0L4 2L0 4z" fill="#FF6B5B"/></marker></defs>${passes}`)}<p class="ec-cap">${esc(j.nome)}: ${j.passesCertos} passes certos (verde) e ${j.passes - j.passesCertos} errados (vermelho) de ${j.passes}${j.passes > 40 ? " · mostrando 40" : ""}.</p></div>
      <div class="ec-m ec-v4 ec-p${k}">${campo(des)}<p class="ec-cap">${esc(j.nome)}: ${j.desarmes} desarmes (X amarelo) e ${j.interceptacoes} interceptações (círculo azul).</p></div>`;
  };
  const vistas = [["1", "Finalizações"], ["2", "Mapa de calor"], ["3", "Passes"], ["4", "Desarmes"]];
  const regras = [
    `.${id} .ec-v1{display:none}`, `#${id}-v1:checked~.ec-mapas .ec-v1{display:block}`, `#${id}-v1:checked~.ec-jog{display:none}`,
    ...vistas.map(([v]) => `#${id}-v${v}:checked~.ec-abas label[for=${id}-v${v}]{background:var(--ouro,#E3B341);color:#12100A;border-color:var(--ouro,#E3B341)}`),
    ...lista.map((_, k) => `#${id}-p${k}:checked~.ec-jog label[for=${id}-p${k}]{background:var(--ouro,#E3B341);color:#12100A;border-color:var(--ouro,#E3B341)}`),
    ...lista.flatMap((_, k) => ["2", "3", "4"].map((v) => `#${id}-v${v}:checked~#${id}-p${k}:checked~.ec-mapas .ec-v${v}.ec-p${k}{display:block}`)),
  ];
  const tabela = `<div class="ec-tab"><table><thead><tr><th style="text-align:left">Jogador</th><th>Min</th><th>Nota</th><th>G</th><th>A</th><th>Passes</th><th>%</th><th>Fin.</th><th>Alvo</th><th>Des.</th><th>Int.</th><th>Drib.</th><th>Faltas</th><th>Def.</th></tr></thead><tbody>
    ${lista.map((j) => `<tr${j.eu ? ' class="ec-eu"' : ""}><td style="text-align:left"><small>${esc(j.pos)}</small> ${esc(j.nome)}</td><td>${j.min}</td><td><b>${j.nota.toFixed(1).replace(".", ",")}</b></td><td>${j.gols || ""}</td><td>${j.assist || ""}</td><td>${j.passesCertos}/${j.passes}</td><td>${j.passes ? Math.round((j.passesCertos / j.passes) * 100) : 0}</td><td>${j.finalizacoes}</td><td>${j.noAlvo}</td><td>${j.desarmes}</td><td>${j.interceptacoes}</td><td>${j.dribles}</td><td>${j.faltas}</td><td>${j.defesas || ""}</td></tr>`).join("")}</tbody></table></div>`;
  return `<div class="ec ${id}"><style>${CSS}${regras.join("")}</style>
    <p class="rotulo">Estatísticas da partida</p>${comparacao}
    <p class="rotulo" style="margin-top:14px">No campo</p>
    ${vistas.map(([v], i) => `<input type="radio" class="ec-r" name="${id}-v" id="${id}-v${v}"${i === 0 ? " checked" : ""}>`).join("")}
    ${lista.map((_, k) => `<input type="radio" class="ec-r" name="${id}-p" id="${id}-p${k}"${k === 0 ? " checked" : ""}>`).join("")}
    <div class="ec-abas">${vistas.map(([v, n]) => `<label for="${id}-v${v}">${n}</label>`).join("")}</div>
    <div class="ec-jog">${lista.map((j, k) => `<label for="${id}-p${k}">${esc(j.nome.split(" ").slice(-1)[0])}<small>${esc(j.pos)}</small></label>`).join("")}</div>
    <div class="ec-mapas"><div class="ec-m ec-v1">${campo(tiros)}${legenda}</div>${lista.map(mapaJog).join("")}</div>
    <p class="rotulo" style="margin-top:14px">Jogador por jogador · ${esc(nomes[meu])}</p>${tabela}</div>`;
}
const ordemPos = (p: string) => { const o = ["GOL", "LD", "LAT", "ZAG", "LE", "VOL", "MC", "MEI", "MO", "PD", "PE", "PON", "SA", "ATA"]; const i = o.indexOf(p); return i < 0 ? 50 : i; };
const CSS = `.ec{margin-top:14px}.ec .ec-r{position:absolute;opacity:0;pointer-events:none}.ec-times{display:flex;justify-content:space-between;font-size:13px;margin:6px 0}.ec-times .ec-eu{color:var(--ouro,#E3B341)}
.ec-lin{display:grid;grid-template-columns:52px 1fr 52px;align-items:center;font-size:13px;margin:5px 0;row-gap:2px}.ec-lin span{text-align:center;opacity:.8}.ec-lin b:last-of-type{text-align:right}
.ec-bar{grid-column:1/4;height:5px;border-radius:3px;background:rgba(255,255,255,.14);overflow:hidden;display:block}.ec-bar s{display:block;height:100%;background:var(--ouro,#E3B341)}
.ec-abas,.ec-jog{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.ec-abas label,.ec-jog label{font-size:12.5px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.18);cursor:pointer;background:rgba(255,255,255,.04)}
.ec-jog label small{opacity:.6;margin-left:4px;font-size:10px}.ec-m{display:none}.ec-campo{width:100%;height:auto;display:block;border-radius:10px}
.ec-leg{display:flex;flex-wrap:wrap;gap:10px;font-size:11.5px;opacity:.85;margin:6px 0}.ec-leg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:4px;vertical-align:-1px}.ec-cap{font-size:12px;opacity:.8;margin:6px 0}
.ec-tab{overflow-x:auto;-webkit-overflow-scrolling:touch}.ec-tab table{border-collapse:collapse;font-size:12px;min-width:640px;width:100%}.ec-tab th,.ec-tab td{padding:6px 5px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08);white-space:nowrap}.ec-tab tr.ec-eu td{color:var(--ouro,#E3B341)}`;
