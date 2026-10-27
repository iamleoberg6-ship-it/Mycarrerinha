// Peças visuais reaproveitadas pelas telas (menos texto, mais leitura de relance): medidor de nota em anel, blocos
// de variação com ícone, cartões de acontecimento por categoria, ícones de efeito.
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

/** Cor da nota (vermelho → amarelo → verde → dourado). */
export const corNota = (n: number) => (n >= 8.5 ? "#E3B341" : n >= 7.2 ? "#74D394" : n >= 6.2 ? "#E8D36A" : n > 0 ? "#EC7D69" : "#55665E");
/** Anel com a nota no meio. */
export function anelNota(nota: number, tam = 84, rotulo = "Nota"): string {
  const r = 34, c = 2 * Math.PI * r, frac = Math.max(0, Math.min(1, (nota - 3) / 7)), cor = corNota(nota);
  return `<svg class="anel-nota" viewBox="0 0 84 84" width="${tam}" height="${tam}" role="img" aria-label="${rotulo} ${nota.toFixed(1)}"><circle cx="42" cy="42" r="${r}" fill="none" stroke="#ffffff1a" stroke-width="8"/>
    <circle cx="42" cy="42" r="${r}" fill="none" stroke="${cor}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(c * frac).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 42 42)"/>
    <text x="42" y="47" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="24" fill="${cor}">${nota > 0 ? nota.toFixed(1) : "–"}</text><text x="42" y="62" text-anchor="middle" font-size="8.5" fill="#A3B6AD" font-family="Barlow,sans-serif" letter-spacing="1">${rotulo.toUpperCase()}</text></svg>`;
}
/** Ícones repetidos (⚽⚽ para dois gols). */
export const repetir = (icone: string, n: number, max = 6) => n <= 0 ? "" : n > max ? `${icone}×${n}` : icone.repeat(n);

/** Bloco de variação: ícone, valor atual e a mudança da semana. */
export function blocoDelta(icone: string, nome: string, antes: number, depois: number, fmt: (v: number) => string = (v) => String(Math.round(v)), invertido = false): string {
  const d = depois - antes, bom = invertido ? d < 0 : d > 0, zero = Math.abs(d) < (Math.abs(antes) > 1000 ? 1 : 0.5);
  return `<div class="bloco-delta${zero ? "" : bom ? " pos" : " neg"}"><span class="bd-ico">${icone}</span><b>${fmt(depois)}</b><small>${esc(nome)}</small>${zero ? `<i>=</i>` : `<i>${d > 0 ? "▲" : "▼"} ${fmt(Math.abs(d))}</i>`}</div>`;
}

/** Categoria de uma linha de evento (para virar um cartão com ícone e cor). */
interface Cat { ico: string; tom: "bom" | "ruim" | "neutro" | "ouro"; }
const REGRAS: [RegExp, Cat][] = [
  [/^👍/, { ico: "👍", tom: "bom" }], [/^👎/, { ico: "👎", tom: "ruim" }],
  [/CAMPEÃO|campeão|Campeão/, { ico: "🏆", tom: "ouro" }],
  [/Melhor em campo|Seleção da|Seleção do mês|Craque|Figurinha/, { ico: "⭐", tom: "ouro" }],
  [/Lesão|lesão|machuc|gripe|Gripe/, { ico: "🩹", tom: "ruim" }],
  [/vermelho|Expulso/, { ico: "🟥", tom: "ruim" }], [/amarelo/, { ico: "🟨", tom: "neutro" }],
  [/Saiu de campo|substituído/, { ico: "🔁", tom: "neutro" }],
  [/Proposta|proposta|quer você|quer te/, { ico: "✉️", tom: "ouro" }],
  [/patrocínio|Patrocínio|Bônus|bônus|R\$/, { ico: "💰", tom: "bom" }],
  [/Na agenda/, { ico: "📅", tom: "neutro" }], [/Duelo|rival/, { ico: "⚔️", tom: "neutro" }],
  [/[Tt]écnico|geladeira/, { ico: "📋", tom: "neutro" }], [/[Tt]orcida|música|apelido|faixa/i, { ico: "📣", tom: "bom" }],
  [/capitão|braçadeira/i, { ico: "🅒", tom: "ouro" }], [/convocad|seleção/i, { ico: "🇧🇷", tom: "ouro" }],
  [/[Gg]ol/, { ico: "⚽", tom: "bom" }], [/[Ee]ntrevista|imprensa/, { ico: "🎤", tom: "neutro" }],
  [/[Nn]asceu|grávida|namoro|casamento|Casamento/, { ico: "❤️", tom: "bom" }],
  [/[Ff]orma|[Dd]omina|posição/, { ico: "📈", tom: "bom" }], [/Polêmica|polêmica/, { ico: "🔥", tom: "ruim" }],
  [/[Cc]idade|[Vv]ida nova/, { ico: "🏙️", tom: "neutro" }],
];
export function catEvento(t: string): Cat { return REGRAS.find(([r]) => r.test(t))?.[1] ?? { ico: "•", tom: "neutro" }; }
/** Lista de eventos da semana como cartões (tira o emoji do começo, que vira o ícone). */
export function cartoesEventos(eventos: string[]): string {
  return `<div class="cartoes-ev">${eventos.map((e) => { const c = catEvento(e), txt = e.replace(/^(👍|👎)\s*/, ""); return `<div class="cev ${c.tom}"><span class="cev-ico">${c.ico}</span><span>${esc(txt)}</span></div>`; }).join("")}</div>`;
}

/** Efeitos de uma escolha em ícones (moral, fama, torcida, técnico, dinheiro...). */
const ICO_EF: [string, string, string][] = [["moral", "❤️", "moral"], ["fama", "⭐", "fama"], ["torcida", "📣", "torcida"], ["relTecnico", "📋", "técnico"], ["dinheiro", "💰", "dinheiro"],
  ["cansaco", "🔋", "cansaço"], ["engajamento", "📱", "redes"], ["hype", "📱", "redes"], ["imprensa", "🎤", "imprensa"], ["pressao", "😰", "pressão"], ["adaptacao", "🧭", "adaptação"],
  ["evolucao", "📈", "evolução"], ["vidaNoturna", "🌙", "balada"], ["desgaste", "🦴", "corpo"], ["impacto", "💛", "fundação"], ["lesao", "🩹", "lesão"]];
export function iconesEfeito(ef: Record<string, unknown> | undefined, risco = false): string {
  if (!ef) return "";
  const out: string[] = [];
  for (const [k, ico, nome] of ICO_EF) {
    const v = ef[k];
    if (typeof v !== "number" || v === 0) continue;
    // cansaço, pressão, balada, desgaste e lesão subindo é ruim
    const ruimSubir = ["cansaco", "pressao", "vidaNoturna", "desgaste", "lesao"].includes(k), bom = ruimSubir ? v < 0 : v > 0;
    if (out.some((x) => x.includes(`title="${nome}`))) continue;
    out.push(`<span class="ief ${bom ? "pos" : "neg"}" title="${nome} ${v > 0 ? "+" : ""}${typeof v === "number" ? Math.round(v * 100) / 100 : ""}">${ico}${v > 0 ? "▲" : "▼"}</span>`);
  }
  if (ef.familiar || ef.filho || ef.parca || ef.gatilho === "par" ) out.push(`<span class="ief pos" title="relação">👥▲</span>`);
  return out.length || risco ? `<span class="iefs">${out.join("")}${risco ? `<span class="ief risco" title="tem risco">🎲</span>` : ""}</span>` : "";
}
