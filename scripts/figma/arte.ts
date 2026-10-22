// Arte do personagem em camadas para o Figma (e, depois, para o jogo).
// Todas as peças usam o mesmo quadro de 400 × 800 e o mesmo esqueleto, então empilhar instâncias no mesmo x,y monta o
// jogador. Cada peça tem as camadas "Cor" (preenchimento que se troca: pele, cabelo, cor do uniforme), "Cor 2"
// (detalhes), "Sombra" e "Luz" (pretas e brancas translúcidas, servem para qualquer cor) e "Traço" (contorno).
// Saída: data/figma/pecas/*.svg e data/figma/pecas.json (conjunto, propriedades de variante e arquivo).
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { MARCAS, MARCA } from "../../src/marcas.js";
import { logoSvg } from "../../app/jogo/poster.js";

type P = [number, number];
const TINTA = "#2A1A12", W = 400, H = 800, CX = 200;
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const pt = (p: P) => `${f1(p[0])} ${f1(p[1])}`;
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const espelho = (p: P): P => [2 * CX - p[0], p[1]];

/** Caminho suave (Catmull-Rom → Bézier) passando pelos pontos. */
function suave(pts: P[], fechado = true, tensao = 0.5): string {
  const n = pts.length, at = (i: number) => (fechado ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pt(pts[0])}`;
  for (let i = 0; i < (fechado ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2), k = tensao / 3;
    const c1: P = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k], c2: P = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d + (fechado ? " Z" : "");
}
/** Tubo (membro): contorno suave em volta de uma linha central com larguras (meia-largura) em cada ponto. */
function tubo(c: P[], w: number[]) {
  const esq: P[] = [], dir: P[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    esq.push([c[i][0] + nx * w[i], c[i][1] + ny * w[i]]); dir.push([c[i][0] - nx * w[i], c[i][1] - ny * w[i]]);
  }
  const fim = c[c.length - 1], ini = c[0], tf = [fim[0] - c[c.length - 2][0], fim[1] - c[c.length - 2][1]], Lf = Math.hypot(tf[0], tf[1]) || 1;
  const ponta: P = [fim[0] + (tf[0] / Lf) * w[w.length - 1] * 0.8, fim[1] + (tf[1] / Lf) * w[w.length - 1] * 0.8];
  const ti = [ini[0] - c[1][0], ini[1] - c[1][1]], Li = Math.hypot(ti[0], ti[1]) || 1;
  const base: P = [ini[0] + (ti[0] / Li) * w[0] * 0.6, ini[1] + (ti[1] / Li) * w[0] * 0.6];
  const d = suave([...esq, ponta, ...[...dir].reverse(), base]);
  return { d, esq, dir };
}
/** Sombra de um tubo: a faixa do lado direito (luz vem da esquerda, de cima). */
function sombraTubo(c: P[], w: number[], lado: 1 | -1, frac = 0.42) {
  const t = tubo(c, w), borda = lado === 1 ? t.dir : t.esq, outra = lado === 1 ? t.esq : t.dir;
  const meio = borda.map((p, i) => lerp(p, outra[i], frac));
  return suave([...borda, ...[...meio].reverse()]);
}
const luzTubo = (c: P[], w: number[], lado: 1 | -1) => {
  const t = tubo(c, w), borda = lado === 1 ? t.esq : t.dir, outra = lado === 1 ? t.dir : t.esq;
  const a = borda.map((p, i) => lerp(p, outra[i], 0.1)), b = borda.map((p, i) => lerp(p, outra[i], 0.24));
  return suave([...a.slice(1, -1), ...[...b.slice(1, -1)].reverse()]);
};

// ------------------------------------------------------------------ corpos
export type Sexo = "M" | "F";
export type Tipo = "esguio" | "magro" | "poucoAtletico" | "atletico" | "forte" | "troncudo" | "pesado";
export const TIPOS: Tipo[] = ["esguio", "magro", "poucoAtletico", "atletico", "forte", "troncudo", "pesado"];
export const NOME_TIPO: Record<Tipo, string> = { esguio: "Esguio", magro: "Magro", poucoAtletico: "Pouco atlético", atletico: "Atlético", forte: "Forte", troncudo: "Troncudo", pesado: "Pesado" };
interface Medidas { ombro: number; peito: number; cintura: number; quadril: number; braco: number; antebraco: number; coxa: number; panturrilha: number; pescoco: number; barriga: number; musculo: number; busto: number }
const BASE: Record<Tipo, Omit<Medidas, "busto">> = {
  esguio:        { ombro: 70, peito: 57, cintura: 45, quadril: 49, braco: 14.5, antebraco: 12.5, coxa: 23, panturrilha: 15.5, pescoco: 16, barriga: 0, musculo: 0.2 },
  magro:         { ombro: 76, peito: 63, cintura: 51, quadril: 54, braco: 16.5, antebraco: 14, coxa: 26, panturrilha: 17.5, pescoco: 18, barriga: 0, musculo: 0.35 },
  poucoAtletico: { ombro: 80, peito: 70, cintura: 64, quadril: 66, braco: 19, antebraco: 16, coxa: 30, panturrilha: 20, pescoco: 20, barriga: 9, musculo: 0.05 },
  atletico:      { ombro: 87, peito: 77, cintura: 57, quadril: 61, braco: 20.5, antebraco: 17.5, coxa: 30, panturrilha: 21, pescoco: 20, barriga: 0, musculo: 0.75 },
  forte:         { ombro: 96, peito: 87, cintura: 65, quadril: 67, braco: 25.5, antebraco: 20.5, coxa: 35, panturrilha: 24, pescoco: 24, barriga: 0, musculo: 1 },
  troncudo:      { ombro: 94, peito: 90, cintura: 79, quadril: 76, braco: 24.5, antebraco: 21, coxa: 36, panturrilha: 25, pescoco: 26, barriga: 7, musculo: 0.55 },
  pesado:        { ombro: 91, peito: 92, cintura: 93, quadril: 88, braco: 26, antebraco: 22, coxa: 39, panturrilha: 27, pescoco: 26, barriga: 22, musculo: 0.05 },
};
export function medidas(t: Tipo, s: Sexo): Medidas {
  const b = BASE[t];
  if (s === "M") return { ...b, busto: 0 };
  return { ...b, ombro: b.ombro - 13, peito: b.peito - 8, cintura: b.cintura - (t === "pesado" ? 4 : 9), quadril: b.quadril + 6, braco: b.braco - 3.5, antebraco: b.antebraco - 3, coxa: b.coxa + 1.5, panturrilha: b.panturrilha - 1, pescoco: b.pescoco - 4.5, musculo: b.musculo * 0.6, barriga: b.barriga * 0.8, busto: t === "pesado" ? 20 : t === "esguio" ? 9 : 13 };
}
interface Esq { m: Medidas; tronco: P[]; braco: (l: 1 | -1) => { c: P[]; w: number[] }; perna: (l: 1 | -1) => { c: P[]; w: number[] }; tornozelo: (l: 1 | -1) => P; punho: (l: 1 | -1) => P }
/** Esqueleto e contorno de cada corpo. */
export function esqueleto(t: Tipo, s: Sexo): Esq {
  const m = medidas(t, s);
  const esqTronco: P[] = [
    [CX - m.pescoco, 196], [CX - m.pescoco - (m.ombro - m.pescoco) * 0.55, 210], [CX - m.ombro, 228], [CX - m.ombro - 2, 250],
    [CX - m.peito, 280], [CX - m.peito + 3 + (s === "F" ? 4 : 0), 312], [CX - m.cintura - m.barriga * 0.25, 368], [CX - m.quadril - m.barriga * 0.1, 418], [CX - m.quadril + 2, 452], [CX - 4, 462],
  ];
  const tronco = [...esqTronco, ...[...esqTronco].reverse().map(espelho)];
  const braco = (l: 1 | -1) => {
    const sx = CX + l * (m.ombro - m.braco * 0.55), ex = CX + l * (m.ombro + 5), wx = CX + l * (m.ombro + 9);
    return { c: [[sx, 236], [sx + l * 4, 300], [ex, 378], [ex + l * 2, 428], [wx, 478]] as P[], w: [m.braco * 1.15, m.braco, m.braco * 0.78, m.antebraco, m.antebraco * 0.62] };
  };
  const perna = (l: 1 | -1) => {
    const x0 = CX + l * m.quadril * 0.5, xj = CX + l * m.quadril * 0.43, xt = CX + l * m.quadril * 0.41;
    return { c: [[x0, 440], [x0 - l * 1, 520], [xj, 596], [xj + l * 1, 655], [xt, 728]] as P[], w: [m.coxa, m.coxa * 0.86, m.coxa * 0.6, m.panturrilha, 8.5] };
  };
  return { m, tronco, braco, perna, tornozelo: (l) => perna(l).c[4], punho: (l) => braco(l).c[4] };
}

// ------------------------------------------------------------------ utilidades de desenho
const SOMBRA = `fill="#2B0F05" fill-opacity=".2"`, LUZ = `fill="#FFFFFF" fill-opacity=".18"`;
const tracoPath = (d: string, w = 3) => `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const linha = (d: string, w = 1.6, op = 0.4) => `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`;
const svg = (corpo: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${corpo}</svg>`;
interface Camadas { cor?: string; cor2?: string; sombra?: string; luz?: string; traco?: string; extra?: string }
/** Monta a peça com camadas nomeadas (o nome do grupo vira o nome da camada no Figma). */
function peca(base: string, c: Camadas, base2 = "#FFFFFF"): string {
  return svg([
    c.cor ? `<g id="Cor" fill="${base}">${c.cor}</g>` : "",
    c.cor2 ? `<g id="Cor 2" fill="${base2}">${c.cor2}</g>` : "",
    c.sombra ? `<g id="Sombra">${c.sombra}</g>` : "",
    c.luz ? `<g id="Luz">${c.luz}</g>` : "",
    c.extra ? `<g id="Detalhe">${c.extra}</g>` : "",
    c.traco ? `<g id="Traço">${c.traco}</g>` : "",
  ].join(""));
}
const PELE = "#C98A5C";

/** Mão: palma, polegar e linhas dos dedos. */
function mao(e: Esq, l: 1 | -1) {
  const [x, y] = e.punho(l), w = e.m.antebraco * 0.98;
  const d = `M${f1(x - w)} ${f1(y - 2)} C${f1(x - w - 2)} ${f1(y + 26)} ${f1(x - w * 0.6)} ${f1(y + 50)} ${f1(x)} ${f1(y + 52)} C${f1(x + w * 0.7)} ${f1(y + 50)} ${f1(x + w + 1)} ${f1(y + 28)} ${f1(x + w)} ${f1(y - 2)} Z`;
  const pol = l === 1 ? `M${f1(x - w + 1)} ${f1(y + 8)} Q${f1(x - w - 7)} ${f1(y + 22)} ${f1(x - w + 2)} ${f1(y + 32)}` : `M${f1(x + w - 1)} ${f1(y + 8)} Q${f1(x + w + 7)} ${f1(y + 22)} ${f1(x + w - 2)} ${f1(y + 32)}`;
  const dedos = [-0.35, 0.05, 0.42].map((k) => `M${f1(x + k * w)} ${f1(y + 34)} L${f1(x + k * w + l * 1)} ${f1(y + 47)}`).join(" ");
  return { d, pol, dedos };
}
/** Pé descalço (fica por baixo da chuteira/tênis). */
function pe(e: Esq, l: 1 | -1) {
  const [x, y] = e.tornozelo(l);
  return `M${f1(x - 10)} ${f1(y - 4)} C${f1(x - 12)} ${f1(y + 18)} ${f1(x - 14 + l * 4)} ${f1(y + 34)} ${f1(x + l * 6)} ${f1(y + 38)} C${f1(x + l * 26)} ${f1(y + 40)} ${f1(x + l * 30)} ${f1(y + 30)} ${f1(x + l * 18)} ${f1(y + 22)} C${f1(x + 12)} ${f1(y + 14)} ${f1(x + 10)} ${f1(y + 6)} ${f1(x + 10)} ${f1(y - 4)} Z`;
}

/** Corpo inteiro em pele (pescoço, tronco, braços, mãos, pernas e pés). */
export function corpo(t: Tipo, s: Sexo): string {
  const e = esqueleto(t, s), m = e.m;
  const pesc = `M${f1(CX - m.pescoco)} 150 L${f1(CX - m.pescoco)} 204 L${f1(CX + m.pescoco)} 204 L${f1(CX + m.pescoco)} 150 Z`;
  const tronco = suave(e.tronco);
  const lados = [-1, 1] as const;
  const pernas = lados.map((l) => e.perna(l)), bracos = lados.map((l) => e.braco(l)), maos = lados.map((l) => mao(e, l));
  const formas = [pesc, ...lados.map((l) => pe(e, l)), ...pernas.map((p) => tubo(p.c, p.w).d), tronco, ...bracos.map((b) => tubo(b.c, b.w).d), ...maos.map((h) => h.d)];
  const cor = formas.map((d) => `<path d="${d}"/>`).join("");
  // sombra: lado direito de cada parte, sob o queixo, sob o peito e entre as pernas
  const somTronco = suave([[CX + m.peito * 0.35, 230], [CX + m.ombro - 4, 234], [CX + m.peito - 1, 282], [CX + m.cintura + m.barriga * 0.25 - 1, 368], [CX + m.quadril - 1, 418], [CX + m.quadril * 0.5, 456], [CX + m.cintura * 0.45, 380], [CX + m.peito * 0.45, 300]]);
  const sombra = [
    `<path d="M${f1(CX - m.pescoco)} 150 L${f1(CX - m.pescoco)} 182 Q${CX} 196 ${f1(CX + m.pescoco)} 182 L${f1(CX + m.pescoco)} 150 Z" ${SOMBRA}/>`,
    `<path d="${somTronco}" ${SOMBRA}/>`,
    ...lados.map((l, i) => `<path d="${sombraTubo(bracos[i].c, bracos[i].w, l === 1 ? 1 : -1, l === 1 ? 0.45 : 0.25)}" ${SOMBRA}/>`),
    ...lados.map((l, i) => `<path d="${sombraTubo(pernas[i].c, pernas[i].w, l === 1 ? 1 : -1, l === 1 ? 0.45 : 0.22)}" ${SOMBRA}/>`),
    m.musculo > 0.4 ? `<path d="M${f1(CX - m.peito * 0.85)} 300 Q${f1(CX - m.peito * 0.4)} ${f1(318 + m.musculo * 4)} ${CX} 304 Q${f1(CX + m.peito * 0.4)} ${f1(318 + m.musculo * 4)} ${f1(CX + m.peito * 0.85)} 300 L${f1(CX + m.peito * 0.8)} 306 Q${f1(CX + m.peito * 0.4)} 324 ${CX} 310 Q${f1(CX - m.peito * 0.4)} 324 ${f1(CX - m.peito * 0.8)} 306 Z" ${SOMBRA}/>` : "",
    m.barriga > 5 ? `<path d="M${f1(CX - m.cintura * 0.9)} 404 Q${CX} ${f1(420 + m.barriga * 0.5)} ${f1(CX + m.cintura * 0.9)} 404 Q${CX} ${f1(412 + m.barriga * 0.6)} ${f1(CX - m.cintura * 0.9)} 404 Z" ${SOMBRA}/>` : "",
    m.busto ? `<path d="M${f1(CX - m.peito * 0.8)} ${f1(300 + m.busto * 0.6)} Q${f1(CX - m.peito * 0.4)} ${f1(316 + m.busto)} ${f1(CX - 4)} ${f1(300 + m.busto * 0.6)} Q${f1(CX - m.peito * 0.4)} ${f1(310 + m.busto)} ${f1(CX - m.peito * 0.8)} ${f1(300 + m.busto * 0.6)} Z M${f1(CX + 4)} ${f1(300 + m.busto * 0.6)} Q${f1(CX + m.peito * 0.4)} ${f1(316 + m.busto)} ${f1(CX + m.peito * 0.8)} ${f1(300 + m.busto * 0.6)} Q${f1(CX + m.peito * 0.4)} ${f1(310 + m.busto)} ${f1(CX + 4)} ${f1(300 + m.busto * 0.6)} Z" ${SOMBRA}/>` : "",
  ].join("");
  const luz = [
    ...lados.map((l, i) => `<path d="${luzTubo(bracos[i].c, bracos[i].w, l === 1 ? 1 : -1)}" ${LUZ}/>`),
    ...lados.map((l, i) => `<path d="${luzTubo(pernas[i].c, pernas[i].w, l === 1 ? 1 : -1)}" ${LUZ}/>`),
    `<path d="M${f1(CX - m.peito * 0.75)} 262 Q${f1(CX - m.peito * 0.45)} 252 ${f1(CX - m.peito * 0.2)} 262 Q${f1(CX - m.peito * 0.45)} 258 ${f1(CX - m.peito * 0.75)} 262 Z" ${LUZ}/>`,
  ].join("");
  // linhas de anatomia (clavícula, peitoral, abdômen, umbigo, joelho, cotovelo, dedos)
  const an: string[] = [
    `M${f1(CX - m.pescoco * 0.6)} 214 Q${f1(CX - m.ombro * 0.5)} 218 ${f1(CX - m.ombro * 0.8)} 226`, `M${f1(CX + m.pescoco * 0.6)} 214 Q${f1(CX + m.ombro * 0.5)} 218 ${f1(CX + m.ombro * 0.8)} 226`,
    `M${CX - 2} 382 q2 4 4 0`,
  ];
  if (m.musculo > 0.4 && !m.busto) an.push(`M${f1(CX - m.peito * 0.85)} 300 Q${f1(CX - m.peito * 0.4)} ${f1(318 + m.musculo * 4)} ${CX} 304 Q${f1(CX + m.peito * 0.4)} ${f1(318 + m.musculo * 4)} ${f1(CX + m.peito * 0.85)} 300`, `M${CX} 268 V300`);
  if (m.musculo >= 0.7) { an.push(`M${CX} 318 V372`); for (const y of [330, 348]) an.push(`M${f1(CX - m.cintura * 0.42)} ${y} Q${CX - 6} ${y + 3} ${CX - 2} ${y}`, `M${f1(CX + m.cintura * 0.42)} ${y} Q${CX + 6} ${y + 3} ${CX + 2} ${y}`); an.push(`M${f1(CX - m.cintura * 0.75)} 360 Q${f1(CX - m.cintura * 0.55)} 400 ${f1(CX - 10)} 432`, `M${f1(CX + m.cintura * 0.75)} 360 Q${f1(CX + m.cintura * 0.55)} 400 ${f1(CX + 10)} 432`); }
  if (m.busto) an.push(`M${f1(CX - m.peito * 0.8)} ${f1(300 + m.busto * 0.6)} Q${f1(CX - m.peito * 0.4)} ${f1(316 + m.busto)} ${f1(CX - 4)} ${f1(300 + m.busto * 0.6)}`, `M${f1(CX + 4)} ${f1(300 + m.busto * 0.6)} Q${f1(CX + m.peito * 0.4)} ${f1(316 + m.busto)} ${f1(CX + m.peito * 0.8)} ${f1(300 + m.busto * 0.6)}`);
  if (m.barriga > 5) an.push(`M${f1(CX - m.cintura * 0.9)} 404 Q${CX} ${f1(420 + m.barriga * 0.5)} ${f1(CX + m.cintura * 0.9)} 404`);
  for (const l of lados) {
    const p = e.perna(l), b = e.braco(l);
    an.push(`M${f1(p.c[2][0] - 9)} ${f1(p.c[2][1] + 2)} q9 6 18 0`, `M${f1(b.c[2][0] - l * 4)} ${f1(b.c[2][1] - 4)} q${l * 5} 5 ${l * 9} 2`);
    if (m.musculo > 0.5) an.push(`M${f1(b.c[0][0] + l * b.w[0] * 0.3)} ${f1(b.c[0][1] + 6)} Q${f1(b.c[1][0])} ${f1(b.c[1][1] - 10)} ${f1(b.c[1][0] - l * b.w[1] * 0.6)} ${f1(b.c[1][1] + 4)}`);
  }
  const traco = [...formas.map((d) => tracoPath(d)), ...maos.map((h) => tracoPath(h.pol, 2.4) + linha(h.dedos, 1.4, 0.45)), linha(an.join(" "))].join("");
  return peca(PELE, { cor, sombra, luz, traco });
}

// ------------------------------------------------------------------ uniforme
export type Caimento = "justo" | "largo";
/** Contorno da camisa (tronco + mangas) pelo corpo: justo cola, largo sobra e faz dobras. */
function camisaFormas(e: Esq, cai: Caimento, manga: "curta" | "longa" | "regata", barra = 452) {
  const m = e.m, f = cai === "justo" ? 3.5 : 12, fl = cai === "justo" ? 1 : 1.12;
  const lado: P[] = [
    [CX - m.pescoco - 4, 198], [CX - m.ombro * 0.62, 210], [CX - m.ombro - f * 0.6, 228], [CX - m.ombro - f, 252], [CX - (m.peito + f * 0.8), 282],
    [CX - (m.peito + f * 0.8) + (cai === "justo" ? 3 : 0), 314], [CX - (m.cintura + m.barriga * 0.28) * fl - f * 0.5, 370], [CX - (m.quadril + m.barriga * 0.1) * fl - f * 0.6, 420], [CX - m.quadril * fl - f * 0.6, barra],
  ];
  if (manga === "regata") { lado[2] = [CX - Math.max(m.pescoco + 14, m.ombro * 0.62), 214]; lado[3] = [CX - m.peito * 0.92, 254]; lado[4] = [CX - m.peito - f * 0.5, 292]; }
  const pts = [...lado, [CX, barra + 6] as P, ...[...lado].reverse().map(espelho)];
  const tronco = suave(pts);
  const mangas = manga === "regata" ? [] : ([-1, 1] as const).map((l) => {
    const b = e.braco(l), fim = manga === "curta" ? 0.55 : 1;
    const c = b.c.slice(0, manga === "curta" ? 3 : 5).map((p, i, arr) => (i === arr.length - 1 && manga === "curta" ? lerp(b.c[1], b.c[2], fim) : p));
    const w = b.w.slice(0, c.length).map((x, i) => x + f * (manga === "curta" ? 1.25 : 0.9) - i * (cai === "justo" ? 0 : 0.6));
    c[0] = [c[0][0] - l * 4, c[0][1] - 4];
    return { ...tubo(c, w), c, w, l };
  });
  return { tronco, mangas, f, barra };
}
export function camisaJogo(t: Tipo, s: Sexo, cai: Caimento, manga: "curta" | "longa"): string {
  const e = esqueleto(t, s), m = e.m, F = camisaFormas(e, cai, manga);
  const cor = [`<path d="${F.tronco}"/>`, ...F.mangas.map((x) => `<path d="${x.d}"/>`)].join("");
  // gola em V e punhos na cor 2; escudo genérico no peito esquerdo (do jogador)
  const gola = `M${f1(CX - m.pescoco - 4)} 198 L${CX} ${f1(236 + (s === "F" ? 4 : 0))} L${f1(CX + m.pescoco + 4)} 198 L${f1(CX + m.pescoco - 2)} 197 L${CX} 226 L${f1(CX - m.pescoco + 2)} 197 Z`;
  const punhos = F.mangas.map((x) => { const n = x.c.length - 1, a = x.esq[n], b = x.dir[n], a2 = x.esq[n - 1], b2 = x.dir[n - 1]; return `M${pt(a)} L${pt(b)} L${pt(lerp(b, b2, 0.16))} L${pt(lerp(a, a2, 0.16))} Z`; });
  const ex = CX + m.peito * 0.48, ey = 292;
  const escudo = `M${f1(ex - 9)} ${ey - 11} H${f1(ex + 9)} V${ey} Q${f1(ex + 9)} ${ey + 9} ${f1(ex)} ${ey + 13} Q${f1(ex - 9)} ${ey + 9} ${f1(ex - 9)} ${ey} Z`;
  const cor2 = [gola, ...punhos, escudo].map((d) => `<path d="${d}"/>`).join("");
  const somT = suave([[CX + m.peito * 0.3, 236], [CX + m.ombro + F.f * 0.6, 232], [CX + m.peito + F.f * 0.8, 284], [CX + (m.cintura + m.barriga * 0.28) + F.f * 0.5, 370], [CX + m.quadril + F.f * 0.6, F.barra], [CX + m.quadril * 0.45, F.barra + 2], [CX + m.cintura * 0.5, 380], [CX + m.peito * 0.48, 300]]);
  const sombra = [`<path d="${somT}" ${SOMBRA}/>`, ...F.mangas.map((x) => `<path d="${sombraTubo(x.c, x.w, x.l === 1 ? 1 : -1, x.l === 1 ? 0.45 : 0.22)}" ${SOMBRA}/>`),
    `<path d="M${f1(CX - m.pescoco - 2)} 200 Q${CX} 214 ${f1(CX + m.pescoco + 2)} 200 L${CX} 238 Z" fill="#2B0F05" fill-opacity=".32"/>`].join("");
  const luz = `<path d="M${f1(CX - m.peito * 0.85)} 262 Q${f1(CX - m.peito * 0.6)} 250 ${f1(CX - m.peito * 0.25)} 258 Q${f1(CX - m.peito * 0.55)} 262 ${f1(CX - m.peito * 0.8)} 300 Z" ${LUZ}/>`;
  const dobras = cai === "largo"
    ? `M${f1(CX - m.peito * 0.6)} 330 Q${f1(CX - m.peito * 0.4)} 360 ${f1(CX - m.cintura * 0.6)} 400 M${f1(CX + m.peito * 0.55)} 326 Q${f1(CX + m.peito * 0.35)} 360 ${f1(CX + m.cintura * 0.5)} 404 M${f1(CX - m.quadril * 0.6)} ${F.barra - 18} Q${CX} ${F.barra - 8} ${f1(CX + m.quadril * 0.6)} ${F.barra - 18}`
    : `M${f1(CX - m.peito * 0.7)} 304 Q${CX} 318 ${f1(CX + m.peito * 0.7)} 304`;
  const traco = [tracoPath(F.tronco), ...F.mangas.map((x) => tracoPath(x.d)), tracoPath(gola, 2.2), ...punhos.map((d) => tracoPath(d, 2)), tracoPath(escudo, 1.8), linha(dobras, 1.5, 0.35)].join("");
  return peca("#C8102E", { cor, cor2, sombra, luz, traco });
}
export function calcao(t: Tipo, s: Sexo, cai: Caimento): string {
  const e = esqueleto(t, s), m = e.m, f = cai === "justo" ? 4 : 9, fim = cai === "justo" ? 0.62 : 0.72;
  const pernas = ([-1, 1] as const).map((l) => { const p = e.perna(l); const c: P[] = [[p.c[0][0], 420], p.c[0], lerp(p.c[1], p.c[2], fim - 0.5)]; const w = [p.w[0] + f, p.w[0] + f, p.w[1] + f + 1]; return { ...tubo(c, w), c, w, l }; });
  const cint = `M${f1(CX - m.quadril - m.barriga * 0.1 - f)} 410 L${f1(CX + m.quadril + m.barriga * 0.1 + f)} 410 L${f1(CX + m.quadril + f)} 452 L${f1(CX - m.quadril - f)} 452 Z`;
  const cor = [cint, ...pernas.map((p) => p.d)].map((d) => `<path d="${d}"/>`).join("");
  const faixas = pernas.map((p) => { const b = p.l === 1 ? p.dir : p.esq, b2 = b.map((q) => [q[0] - p.l * 5, q[1]] as P); return suave([...b.slice(1), ...[...b2.slice(1)].reverse()]); });
  const cor2 = [`M${f1(CX - m.quadril - m.barriga * 0.1 - f)} 410 L${f1(CX + m.quadril + m.barriga * 0.1 + f)} 410 L${f1(CX + m.quadril + m.barriga * 0.1 + f)} 417 L${f1(CX - m.quadril - m.barriga * 0.1 - f)} 417 Z`, ...faixas].map((d) => `<path d="${d}"/>`).join("");
  const sombra = pernas.map((p) => `<path d="${sombraTubo(p.c, p.w, p.l === 1 ? 1 : -1, p.l === 1 ? 0.5 : 0.25)}" ${SOMBRA}/>`).join("") + `<path d="M${CX - 3} 452 L${CX} 476 L${CX + 3} 452 Z" ${SOMBRA}/>`;
  const traco = [cint, ...pernas.map((p) => p.d)].map((d) => tracoPath(d)).join("") + linha(`M${CX} 440 V476`, 1.5, 0.45);
  return peca("#FFFFFF", { cor, cor2, sombra, traco }, "#C8102E");
}
export function meiao(t: Tipo, s: Sexo): string {
  const e = esqueleto(t, s);
  const ps = ([-1, 1] as const).map((l) => { const p = e.perna(l); const c: P[] = [lerp(p.c[2], p.c[3], 0.25), p.c[3], lerp(p.c[3], p.c[4], 0.6), p.c[4]]; const w = [p.w[2] + 2.5, p.w[3] + 2.5, (p.w[3] + p.w[4]) / 2 + 2, p.w[4] + 2.5]; return { ...tubo(c, w), c, w, l }; });
  const cor = ps.map((p) => `<path d="${p.d}"/>`).join("");
  const cor2 = ps.map((p) => `<path d="M${pt(p.esq[0])} L${pt(p.dir[0])} L${pt(lerp(p.dir[0], p.dir[1], 0.3))} L${pt(lerp(p.esq[0], p.esq[1], 0.3))} Z"/>`).join("");
  const sombra = ps.map((p) => `<path d="${sombraTubo(p.c, p.w, p.l === 1 ? 1 : -1, p.l === 1 ? 0.45 : 0.22)}" ${SOMBRA}/>`).join("");
  return peca("#FFFFFF", { cor, cor2, sombra, traco: ps.map((p) => tracoPath(p.d)).join("") }, "#C8102E");
}
/** Calçado (chuteira com travas ou tênis). */
export function calcado(t: Tipo, s: Sexo, tipo: "chuteira" | "tenis"): string {
  const e = esqueleto(t, s), lados = [-1, 1] as const;
  const forma = (l: 1 | -1) => { const [x, y] = e.tornozelo(l); return { x, y, d: `M${f1(x - 13)} ${f1(y - 6)} C${f1(x - 15)} ${f1(y + 20)} ${f1(x - 16 + l * 3)} ${f1(y + 36)} ${f1(x + l * 4)} ${f1(y + 40)} L${f1(x + l * 30)} ${f1(y + 40)} C${f1(x + l * 38)} ${f1(y + 38)} ${f1(x + l * 36)} ${f1(y + 26)} ${f1(x + l * 22)} ${f1(y + 20)} C${f1(x + 14)} ${f1(y + 12)} ${f1(x + 13)} ${f1(y + 4)} ${f1(x + 13)} ${f1(y - 6)} Z` }; };
  const fs = lados.map(forma);
  const cor = fs.map((f) => `<path d="${f.d}"/>`).join("");
  const sola = (f: ReturnType<typeof forma>, l: number) => `M${f1(f.x - 15)} ${f1(f.y + 33)} L${f1(f.x + l * 36)} ${f1(f.y + 33)} L${f1(f.x + l * 34)} ${f1(f.y + 41)} L${f1(f.x - 14)} ${f1(f.y + 41)} Z`;
  const faixa = (f: ReturnType<typeof forma>, l: number) => `M${f1(f.x - l * 8)} ${f1(f.y + 30)} L${f1(f.x + l * 20)} ${f1(f.y + 18)} L${f1(f.x + l * 24)} ${f1(f.y + 23)} L${f1(f.x - l * 4)} ${f1(f.y + 34)} Z`;
  const cor2 = fs.map((f, i) => `<path d="${faixa(f, lados[i])}"/>`).join("");
  const travas = tipo === "chuteira" ? fs.map((f, i) => [-8, 6, 20].map((k) => `<rect x="${f1(f.x + lados[i] * k - 3)} " y="${f1(f.y + 40)}" width="6" height="6" rx="1.5" fill="#E8E8E8" stroke="${TINTA}" stroke-width="1.4"/>`).join("")).join("") : "";
  const extra = fs.map((f, i) => `<path d="${sola(f, lados[i])}" fill="${tipo === "chuteira" ? "#1B1B1B" : "#F2F0EA"}" stroke="${TINTA}" stroke-width="2"/>`).join("") + travas + (tipo === "tenis" ? fs.map((f) => linha(`M${f1(f.x - 6)} ${f1(f.y + 6)} l12 4 M${f1(f.x - 7)} ${f1(f.y + 13)} l13 4`, 1.6, 0.6)).join("") : "");
  const sombra = fs.map((f, i) => `<path d="M${f1(f.x)} ${f1(f.y - 6)} L${f1(f.x + 13)} ${f1(f.y - 6)} C${f1(f.x + 13)} ${f1(f.y + 4)} ${f1(f.x + 14)} ${f1(f.y + 12)} ${f1(f.x + lados[i] * 22)} ${f1(f.y + 20)} L${f1(f.x)} ${f1(f.y + 30)} Z" ${SOMBRA}/>`).join("");
  return peca(tipo === "chuteira" ? "#F2B705" : "#FFFFFF", { cor, cor2, sombra, extra, traco: fs.map((f) => tracoPath(f.d)).join("") }, tipo === "chuteira" ? "#1B1B1B" : "#C8102E");
}

// ------------------------------------------------------------------ casual
export function camiseta(t: Tipo, s: Sexo, peca_: "camiseta" | "regata" | "moletom"): string {
  const e = esqueleto(t, s), m = e.m;
  const cai: Caimento = peca_ === "moletom" ? "largo" : "justo";
  const F = camisaFormas(e, cai, peca_ === "regata" ? "regata" : peca_ === "moletom" ? "longa" : "curta", peca_ === "moletom" ? 448 : 446);
  const cor = [`<path d="${F.tronco}"/>`, ...F.mangas.map((x) => `<path d="${x.d}"/>`)].join("");
  const gola = peca_ === "regata" ? `M${f1(CX - Math.max(m.pescoco + 14, m.ombro * 0.62) + 3)} 214 Q${CX} 262 ${f1(CX + Math.max(m.pescoco + 14, m.ombro * 0.62) - 3)} 214` : `M${f1(CX - m.pescoco - 3)} 199 Q${CX} 222 ${f1(CX + m.pescoco + 3)} 199`;
  const extras: string[] = [], cor2: string[] = [];
  if (peca_ === "moletom") {
    // capuz atrás do pescoço, bolso canguru, punhos e barra canelados
    cor2.push(`M${f1(CX - m.pescoco - 16)} 200 C${f1(CX - m.pescoco - 20)} 180 ${f1(CX + m.pescoco + 20)} 180 ${f1(CX + m.pescoco + 16)} 200 Q${CX} 214 ${f1(CX - m.pescoco - 16)} 200 Z`);
    cor2.push(`M${f1(CX - m.cintura * 0.75)} 382 L${f1(CX + m.cintura * 0.75)} 382 L${f1(CX + m.cintura * 0.85)} 428 L${f1(CX - m.cintura * 0.85)} 428 Z`);
    cor2.push(`M${f1(CX - m.quadril * 1.12 - 7)} 432 L${f1(CX + m.quadril * 1.12 + 7)} 432 L${f1(CX + m.quadril * 1.12 + 6)} 450 L${f1(CX - m.quadril * 1.12 - 6)} 450 Z`);
    for (const x of F.mangas) { const n = x.c.length - 1; cor2.push(`M${pt(x.esq[n])} L${pt(x.dir[n])} L${pt(lerp(x.dir[n], x.dir[n - 1], 0.18))} L${pt(lerp(x.esq[n], x.esq[n - 1], 0.18))} Z`); }
    extras.push(linha(`M${CX - 7} 206 L${CX - 9} 250 M${CX + 7} 206 L${CX + 9} 250`, 2.4, 0.7));
  }
  const sombra = [`<path d="${suave([[CX + m.peito * 0.3, 236], [CX + m.ombro, 232], [CX + m.peito + F.f, 284], [CX + m.cintura + m.barriga * 0.3 + F.f, 370], [CX + m.quadril + F.f, F.barra], [CX + m.quadril * 0.45, F.barra + 2], [CX + m.cintura * 0.5, 380], [CX + m.peito * 0.48, 300]])}" ${SOMBRA}/>`,
    ...F.mangas.map((x) => `<path d="${sombraTubo(x.c, x.w, x.l === 1 ? 1 : -1, x.l === 1 ? 0.45 : 0.22)}" ${SOMBRA}/>`)].join("");
  const dobras = peca_ === "moletom" ? `M${f1(CX - m.peito * 0.6)} 330 Q${f1(CX - m.peito * 0.4)} 356 ${f1(CX - m.cintura * 0.55)} 378 M${f1(CX + m.peito * 0.55)} 326 Q${f1(CX + m.peito * 0.35)} 356 ${f1(CX + m.cintura * 0.5)} 378` : `M${f1(CX - m.peito * 0.6)} 340 Q${CX} 352 ${f1(CX + m.peito * 0.6)} 340`;
  const traco = [tracoPath(F.tronco), ...F.mangas.map((x) => tracoPath(x.d)), linha(gola, 2.4, 0.9), ...cor2.map((d) => tracoPath(d, 2)), linha(dobras, 1.5, 0.35), ...extras].join("");
  return peca(peca_ === "moletom" ? "#3E4A5C" : peca_ === "regata" ? "#1E1E22" : "#E9E4DA", { cor, cor2: cor2.map((d) => `<path d="${d}"/>`).join(""), sombra, traco }, peca_ === "moletom" ? "#2E3846" : "#FFFFFF");
}
export function bermudaCalca(t: Tipo, s: Sexo, tipo: "bermuda" | "calca"): string {
  const e = esqueleto(t, s), m = e.m, f = 6;
  const pernas = ([-1, 1] as const).map((l) => {
    const p = e.perna(l);
    const c: P[] = tipo === "bermuda" ? [[p.c[0][0], 420], p.c[0], p.c[1], lerp(p.c[1], p.c[2], 0.85)] : [[p.c[0][0], 420], p.c[0], p.c[1], p.c[2], p.c[3], [p.c[4][0], p.c[4][1] + 4]];
    const w = tipo === "bermuda" ? [p.w[0] + f, p.w[0] + f, p.w[1] + f, p.w[2] + f + 3] : [p.w[0] + f, p.w[0] + f, p.w[1] + f, p.w[2] + f, p.w[3] + 3, 13];
    return { ...tubo(c, w), c, w, l };
  });
  const cint = `M${f1(CX - m.quadril - m.barriga * 0.1 - f)} 408 L${f1(CX + m.quadril + m.barriga * 0.1 + f)} 408 L${f1(CX + m.quadril + f)} 452 L${f1(CX - m.quadril - f)} 452 Z`;
  const cor = [cint, ...pernas.map((p) => p.d)].map((d) => `<path d="${d}"/>`).join("");
  const sombra = pernas.map((p) => `<path d="${sombraTubo(p.c, p.w, p.l === 1 ? 1 : -1, p.l === 1 ? 0.48 : 0.24)}" ${SOMBRA}/>`).join("");
  const costura = linha(`M${CX} 420 V470 M${f1(CX - m.quadril - f + 4)} 420 Q${f1(CX - m.quadril * 0.6)} 430 ${f1(CX - m.quadril * 0.35)} 418 M${f1(CX + m.quadril + f - 4)} 420 Q${f1(CX + m.quadril * 0.6)} 430 ${f1(CX + m.quadril * 0.35)} 418`, 1.6, 0.5);
  return peca(tipo === "bermuda" ? "#4F6E9C" : "#2E3F5C", { cor, sombra, traco: [cint, ...pernas.map((p) => p.d)].map((d) => tracoPath(d)).join("") + costura });
}

// ------------------------------------------------------------------ cabeça
export type Rosto = "oval" | "redondo" | "quadrado" | "longo" | "coracao" | "diamante";
export const ROSTOS: Rosto[] = ["oval", "redondo", "quadrado", "longo", "coracao", "diamante"];
const NOME_ROSTO: Record<Rosto, string> = { oval: "Oval", redondo: "Redondo", quadrado: "Quadrado", longo: "Longo", coracao: "Coração", diamante: "Diamante" };
/** Contorno da cabeça: testa larga em cima, bochecha, mandíbula e queixo. */
function cabecaPath(r: Rosto, s: Sexo) {
  const k = s === "F" ? 0.94 : 1;
  const g = { oval: [45, 47, 38, 18, 168], redondo: [48, 50, 44, 24, 164], quadrado: [47, 48, 46, 30, 166], longo: [42, 43, 36, 17, 176], coracao: [48, 47, 34, 13, 168], diamante: [42, 50, 38, 15, 170] }[r];
  const [testa, boch, mand, queixo, yq] = g.map((v, i) => (i < 4 ? v * k : v));
  const pts: P[] = [[CX, 50], [CX + testa * 0.75, 56], [CX + testa, 84], [CX + boch, 118], [CX + mand, 142], [CX + queixo + 4, yq - 6], [CX, yq], [CX - queixo - 4, yq - 6], [CX - mand, 142], [CX - boch, 118], [CX - testa, 84], [CX - testa * 0.75, 56]];
  return { d: suave(pts), boch, mand, yq };
}
export function cabeca(r: Rosto, s: Sexo): string {
  const c = cabecaPath(r, s);
  const orelha = (l: 1 | -1) => { const x = CX + l * (c.boch - 3); return `M${f1(x)} 100 C${f1(x + l * 16)} 92 ${f1(x + l * 18)} 126 ${f1(x + l * 2)} 132 Z`; };
  const formas = [orelha(-1), orelha(1), c.d];
  const sombra = `<path d="${suave([[CX + 6, 50], [CX + c.boch * 0.75, 58], [CX + c.boch, 100], [CX + c.mand, 142], [CX + 10, c.yq], [CX + c.boch * 0.55, 130], [CX + c.boch * 0.6, 92]])}" ${SOMBRA}/>`
    + `<path d="${orelha(1)}" ${SOMBRA}/>`;
  const luz = `<path d="M${f1(CX - c.boch * 0.7)} 72 Q${f1(CX - c.boch * 0.45)} 60 ${f1(CX - c.boch * 0.1)} 64 Q${f1(CX - c.boch * 0.45)} 70 ${f1(CX - c.boch * 0.62)} 86 Z" ${LUZ}/><ellipse cx="${f1(CX - c.boch * 0.55)}" cy="128" rx="9" ry="5" fill="#E8604C" fill-opacity=".14"/><ellipse cx="${f1(CX + c.boch * 0.55)}" cy="128" rx="9" ry="5" fill="#E8604C" fill-opacity=".12"/>`;
  const detalhe = linha(`M${f1(CX - c.boch + 5)} 108 q-6 6 -2 14 M${f1(CX + c.boch - 5)} 108 q6 6 2 14`, 1.4, 0.4);
  return peca(PELE, { cor: formas.map((d) => `<path d="${d}"/>`).join(""), sombra, luz, traco: formas.map((d) => tracoPath(d)).join("") + detalhe });
}
export type Olho = "amendoado" | "redondo" | "caido" | "puxado" | "semDobra" | "grande";
export const OLHOS: Olho[] = ["amendoado", "redondo", "caido", "puxado", "semDobra", "grande"];
const NOME_OLHO: Record<Olho, string> = { amendoado: "Amendoado", redondo: "Redondo", caido: "Caído", puxado: "Puxado", semDobra: "Sem dobra", grande: "Grande" };
export function olhos(o: Olho): string {
  const um = (l: 1 | -1) => {
    const x = CX + l * 20, y = 112, w = o === "grande" ? 13 : 11.5, h = { amendoado: 6, redondo: 8, caido: 6, puxado: 5.5, semDobra: 4.5, grande: 8.5 }[o];
    const inc = o === "puxado" ? -3 : o === "caido" ? 3 : 0; // canto de fora sobe ou desce
    const fora: P = [x + l * w, y + inc], dentro: P = [x - l * w, y + 1];
    const branco = `M${pt(dentro)} Q${f1(x)} ${f1(y - h * 1.6)} ${pt(fora)} Q${f1(x)} ${f1(y + h * 1.2)} ${pt(dentro)} Z`;
    const ir = Math.min(h * 0.95, 6.8);
    return { branco, iris: `<circle cx="${f1(x + l * 1)}" cy="${f1(y + 0.5)}" r="${f1(ir)}"/>`, pupila: `<circle cx="${f1(x + l * 1)}" cy="${f1(y + 0.5)}" r="${f1(ir * 0.48)}" fill="#120A06"/><circle cx="${f1(x + l * 1 - 2)}" cy="${f1(y - 2)}" r="1.6" fill="#FFFFFF"/>`,
      palpebra: `M${pt(dentro)} Q${f1(x)} ${f1(y - h * 1.6)} ${pt(fora)}`, baixo: `M${f1(dentro[0] + l * 2)} ${f1(dentro[1] + 2)} Q${f1(x)} ${f1(y + h * 1.25)} ${f1(fora[0] - l * 2)} ${f1(fora[1] + 1)}`,
      dobra: o === "semDobra" ? "" : `M${f1(x - l * w * 0.7)} ${f1(y - h * 1.35)} Q${f1(x)} ${f1(y - h * 2.1)} ${f1(x + l * w * 0.85)} ${f1(y - h * 1.1 + inc)}` };
  };
  const os = [um(-1), um(1)];
  const corpo = `<defs>${os.map((x, i) => `<clipPath id="olho${i}"><path d="${x.branco}"/></clipPath>`).join("")}</defs>`
    + `<g id="Branco" fill="#FBF7F0">${os.map((x) => `<path d="${x.branco}"/>`).join("")}</g>`
    + os.map((x, i) => `<g clip-path="url(#olho${i})"><g id="Íris" fill="#5A3A22">${x.iris}</g>${x.pupila}</g>`).join("")
    + `<g id="Traço">${os.map((x) => tracoPath(x.palpebra, 3.2) + linha(x.baixo, 1.4, 0.5) + (x.dobra ? linha(x.dobra, 1.5, 0.5) : "")).join("")}</g>`;
  return svg(corpo);
}
export type Sobrancelha = "reta" | "arqueada" | "angulada" | "grossa" | "fina" | "corte";
export const SOBRANCELHAS: Sobrancelha[] = ["reta", "arqueada", "angulada", "grossa", "fina", "corte"];
export function sobrancelha(t: Sobrancelha): string {
  const d = { reta: "M-24 0 L4 -3", arqueada: "M-24 2 Q-10 -9 4 -3", angulada: "M-24 2 L-6 -7 L4 -3", grossa: "M-24 1 Q-10 -6 4 -3", fina: "M-23 1 Q-10 -7 3 -3", corte: "M-24 2 Q-10 -9 4 -3" }[t];
  const larg = t === "grossa" ? 7 : t === "fina" ? 3 : 5;
  const forma = (l: 1 | -1) => `<g transform="translate(${CX + l * 18} 96) scale(${-l} 1)"><path d="${d}" stroke="${TINTA}" stroke-width="${larg + 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#2B1B10" stroke-width="${larg}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  // o corte é um vão de verdade (máscara), no lado esquerdo do rosto
  const corte = t === "corte" ? `<defs><mask id="corte" maskUnits="userSpaceOnUse" x="150" y="70" width="100" height="50"><rect x="150" y="70" width="100" height="50" fill="#fff"/><path d="M174 104 L177.5 86 M181.5 104 L185 86" stroke="#000" stroke-width="3.6"/></mask></defs>` : "";
  return svg(`${corte}<g id="Cor" ${t === "corte" ? 'mask="url(#corte)"' : ""}>${forma(-1)}</g><g id="Cor (direita)">${forma(1)}</g>`);
}
export type Nariz = "reto" | "largo" | "arrebitado" | "aquilino";
export const NARIZES: Nariz[] = ["reto", "largo", "arrebitado", "aquilino"];
export function nariz(n: Nariz): string {
  const d = { reto: "M202 104 L206 134 Q201 138 195 135", largo: "M201 106 L205 132 Q208 138 200 139 Q190 139 191 133", arrebitado: "M201 108 Q205 128 207 132 Q202 137 195 133", aquilino: "M201 102 Q210 118 206 134 Q201 138 195 135" }[n];
  const narinas = n === "largo" ? `M189 133 q-3 -2 -2 -6 M211 133 q3 -2 2 -6` : `M193 134 q-2 -2 -1 -4 M207 134 q2 -2 1 -4`;
  return svg(`<g id="Sombra"><path d="M203 108 L207 132 L201 136 Z" fill="#2B0F05" fill-opacity=".16"/></g><g id="Traço">${tracoPath(d, 2.4)}${linha(narinas, 1.6, 0.6)}</g>`);
}
export type Boca = "neutra" | "sorriso" | "risada" | "seria" | "labios";
export const BOCAS: Boca[] = ["neutra", "sorriso", "risada", "seria", "labios"];
export function boca(b: Boca): string {
  const y = 150;
  switch (b) {
    case "neutra": return svg(`<g id="Traço">${tracoPath(`M188 ${y} Q200 ${y + 3} 212 ${y}`, 2.6)}${linha(`M194 ${y + 8} Q200 ${y + 10} 206 ${y + 8}`, 1.4, 0.4)}</g>`);
    case "sorriso": return svg(`<g id="Traço">${tracoPath(`M185 ${y - 2} Q200 ${y + 10} 215 ${y - 2}`, 2.6)}${linha(`M183 ${y - 4} q2 2 3 2 M217 ${y - 4} q-2 2 -3 2`, 1.6, 0.6)}</g>`);
    case "risada": return svg(`<g id="Boca" fill="#5A1E18"><path d="M184 ${y - 3} Q200 ${y + 20} 216 ${y - 3} Z"/></g><g id="Dentes" fill="#FBF7F0"><path d="M186 ${y - 2} L214 ${y - 2} L212 ${y + 3} L188 ${y + 3} Z"/></g><g id="Traço">${tracoPath(`M184 ${y - 3} Q200 ${y + 20} 216 ${y - 3} Z`, 2.6)}</g>`);
    case "seria": return svg(`<g id="Traço">${tracoPath(`M188 ${y + 1} Q200 ${y - 2} 212 ${y + 1}`, 2.6)}</g>`);
    case "labios": return svg(`<g id="Cor" fill="#B5655A"><path d="M186 ${y} Q193 ${y - 6} 200 ${y - 3} Q207 ${y - 6} 214 ${y} Q200 ${y + 11} 186 ${y} Z"/></g><g id="Luz"><path d="M195 ${y + 4} Q200 ${y + 6} 205 ${y + 4} Q200 ${y + 5} 195 ${y + 4} Z" ${LUZ}/></g><g id="Traço">${tracoPath(`M186 ${y} Q193 ${y - 6} 200 ${y - 3} Q207 ${y - 6} 214 ${y} Q200 ${y + 11} 186 ${y} Z`, 2.2)}${linha(`M186 ${y} Q200 ${y + 2} 214 ${y}`, 1.6, 0.7)}</g>`);
  }
}
export type Barba = "nenhuma" | "porFazer" | "cavanhaque" | "bigode" | "cheia";
export const BARBAS: Barba[] = ["porFazer", "cavanhaque", "bigode", "cheia"];
export function barba(b: Barba): string {
  const mand = 46;
  switch (b) {
    case "porFazer": return svg(`<g id="Cor" fill="#2B1B10" fill-opacity=".28"><path d="M${CX - mand} 128 Q${CX - mand + 2} 160 ${CX - 18} 166 Q${CX} 172 ${CX + 18} 166 Q${CX + mand - 2} 160 ${CX + mand} 128 Q${CX + 30} 150 ${CX + 14} 142 Q${CX} 138 ${CX - 14} 142 Q${CX - 30} 150 ${CX - mand} 128 Z"/></g>`);
    case "cavanhaque": return svg(`<g id="Cor" fill="#2B1B10"><path d="M188 143 Q200 139 212 143 L212 146 Q200 143 188 146 Z M190 158 Q200 156 210 158 Q209 172 200 174 Q191 172 190 158 Z"/></g><g id="Traço">${tracoPath("M190 158 Q200 156 210 158 Q209 172 200 174 Q191 172 190 158 Z", 2)}</g>`);
    case "bigode": return svg(`<g id="Cor" fill="#2B1B10"><path d="M184 146 Q192 138 200 142 Q208 138 216 146 Q208 146 200 145 Q192 146 184 146 Z"/></g><g id="Traço">${tracoPath("M184 146 Q192 138 200 142 Q208 138 216 146 Q208 146 200 145 Q192 146 184 146 Z", 2)}</g>`);
    case "cheia": return svg(`<g id="Cor" fill="#2B1B10"><path d="M${CX - mand} 118 Q${CX - mand - 2} 168 ${CX - 16} 178 Q${CX} 184 ${CX + 16} 178 Q${CX + mand + 2} 168 ${CX + mand} 118 Q${CX + 34} 142 ${CX + 18} 141 Q${CX + 12} 138 ${CX} 140 Q${CX - 12} 138 ${CX - 18} 141 Q${CX - 34} 142 ${CX - mand} 118 Z M188 152 Q200 160 212 152 Q200 156 188 152 Z" fill-rule="evenodd"/></g><g id="Sombra"><path d="M${CX + 8} 150 Q${CX + mand} 150 ${CX + mand} 120 Q${CX + mand} 168 ${CX + 14} 178 Z" ${SOMBRA}/></g><g id="Traço">${tracoPath(`M${CX - mand} 118 Q${CX - mand - 2} 168 ${CX - 16} 178 Q${CX} 184 ${CX + 16} 178 Q${CX + mand + 2} 168 ${CX + mand} 118`, 2.6)}${linha(`M${CX - 30} 158 q4 8 10 10 M${CX + 30} 158 q-4 8 -10 10 M${CX - 6} 170 q6 4 12 0`, 1.4, 0.45)}</g>`);
    default: return svg("");
  }
}

// ------------------------------------------------------------------ cabelo
export type Cabelo = "raspado" | "curto" | "degrade" | "topete" | "moicano" | "cacheadoCurto" | "blackPower" | "trancas" | "dreads" | "ondulado" | "lisoLongo" | "rabo" | "coque" | "chanel";
export const CABELOS: Cabelo[] = ["raspado", "curto", "degrade", "topete", "moicano", "cacheadoCurto", "blackPower", "trancas", "dreads", "ondulado", "lisoLongo", "rabo", "coque", "chanel"];
const NOME_CABELO: Record<Cabelo, string> = { raspado: "Raspado", curto: "Curto", degrade: "Degradê", topete: "Topete", moicano: "Moicano", cacheadoCurto: "Cacheado curto", blackPower: "Black power", trancas: "Tranças nagô", dreads: "Dreads", ondulado: "Ondulado médio", lisoLongo: "Liso longo", rabo: "Rabo de cavalo", coque: "Coque", chanel: "Chanel" };
/** Calota: a parte do cabelo que cobre o topo da cabeça, até a linha da testa. */
function calota(vol: number, testa: number, lados = 112): string {
  return suave([[CX - 49 - vol * 0.4, lados], [CX - 50 - vol * 0.6, 74], [CX - 34 - vol * 0.3, 46 - vol * 0.5], [CX, 38 - vol], [CX + 34 + vol * 0.3, 46 - vol * 0.5], [CX + 50 + vol * 0.6, 74], [CX + 49 + vol * 0.4, lados], [CX + 44, 92], [CX + 22, testa], [CX, testa + 2], [CX - 22, testa], [CX - 44, 92]]);
}
const fios = (ds: string[], op = 0.35) => linha(ds.join(" "), 1.5, op);
/** Cabelo: camada da frente (por cima da cabeça) e, para os longos, a de trás (atrás do corpo). */
export function cabelo(c: Cabelo, camada: "frente" | "atras"): string {
  const base = "#2B1B10", sombraTopo = (d: string) => `<path d="${d}" ${SOMBRA}/>`;
  const brilho = `<path d="M${CX - 30} 52 Q${CX - 10} 40 ${CX + 14} 46 Q${CX - 6} 48 ${CX - 26} 60 Z" fill="#FFFFFF" fill-opacity=".22"/>`;
  if (camada === "atras") {
    const d = { ondulado: `M${CX - 54} 80 C${CX - 72} 150 ${CX - 60} 200 ${CX - 40} 214 L${CX + 40} 214 C${CX + 60} 200 ${CX + 72} 150 ${CX + 54} 80 Z`,
      lisoLongo: `M${CX - 52} 76 C${CX - 62} 160 ${CX - 64} 250 ${CX - 50} 300 L${CX + 50} 300 C${CX + 64} 250 ${CX + 62} 160 ${CX + 52} 76 Z`,
      rabo: `M${CX + 30} 60 C${CX + 76} 70 ${CX + 74} 160 ${CX + 58} 240 C${CX + 50} 250 ${CX + 40} 236 ${CX + 46} 210 C${CX + 54} 150 ${CX + 50} 96 ${CX + 30} 80 Z`,
      chanel: `M${CX - 54} 80 C${CX - 64} 130 ${CX - 60} 160 ${CX - 50} 170 L${CX + 50} 170 C${CX + 60} 160 ${CX + 64} 130 ${CX + 54} 80 Z`,
      dreads: `M${CX - 54} 80 C${CX - 66} 150 ${CX - 60} 220 ${CX - 48} 250 L${CX + 48} 250 C${CX + 60} 220 ${CX + 66} 150 ${CX + 54} 80 Z`,
      blackPower: `M${CX - 72} 110 C${CX - 92} 40 ${CX - 30} -6 ${CX} -4 C${CX + 30} -6 ${CX + 92} 40 ${CX + 72} 110 C${CX + 60} 150 ${CX - 60} 150 ${CX - 72} 110 Z`,
    } as Partial<Record<Cabelo, string>>;
    const dd = d[c];
    if (!dd) return svg("");
    const linhasAtras = c === "dreads" ? fios(Array.from({ length: 9 }, (_, i) => `M${CX - 44 + i * 11} 150 L${CX - 46 + i * 11.5} 246`), 0.5) : c === "blackPower" ? "" : fios([`M${CX - 40} 140 Q${CX - 46} 200 ${CX - 40} 260`, `M${CX + 40} 140 Q${CX + 46} 200 ${CX + 40} 260`]);
    return peca(base, { cor: `<path d="${dd}"/>`, sombra: sombraTopo(dd.replace(/^M[^C]+/, `M${CX} 80`)), traco: tracoPath(dd) + linhasAtras });
  }
  let cor = "", extra = "", traco = "";
  switch (c) {
    case "raspado": return peca(base, { cor: `<path d="${calota(0, 66, 100)}" fill-opacity=".55"/>`, traco: linha(`M${CX - 44} 92 Q${CX} 60 ${CX + 44} 92`, 1.2, 0.25) });
    case "curto": cor = calota(6, 64); traco = fios([`M${CX - 30} 52 q10 6 14 16`, `M${CX - 8} 46 q8 8 10 18`, `M${CX + 14} 48 q8 8 6 18`, `M${CX + 32} 56 q4 8 2 14`]); break;
    case "degrade": cor = calota(9, 62, 96); extra = `<path d="M${CX - 50} 96 L${CX - 49} 116 L${CX - 43} 104 Z M${CX + 50} 96 L${CX + 49} 116 L${CX + 43} 104 Z" fill-opacity=".4"/>`; traco = fios([`M${CX - 46} 94 Q${CX - 40} 80 ${CX - 44} 70`, `M${CX + 46} 94 Q${CX + 40} 80 ${CX + 44} 70`, `M${CX - 20} 48 q10 6 14 14`, `M${CX + 6} 44 q8 8 8 16`]); break;
    case "topete": cor = suave([[CX - 49, 104], [CX - 50, 70], [CX - 40, 40], [CX - 10, 18], [CX + 30, 20], [CX + 50, 44], [CX + 52, 80], [CX + 49, 104], [CX + 42, 86], [CX + 20, 64], [CX - 10, 64], [CX - 42, 86]]); traco = fios([`M${CX - 30} 48 Q${CX} 22 ${CX + 30} 30`, `M${CX - 20} 58 Q${CX + 6} 34 ${CX + 36} 42`]); break;
    case "moicano": cor = suave([[CX - 14, 70], [CX - 18, 30], [CX - 6, 6], [CX + 10, 4], [CX + 20, 30], [CX + 16, 70], [CX, 64]]); extra = `<path d="${calota(0, 66, 100)}" fill-opacity=".35"/>`; traco = fios([`M${CX - 6} 60 L${CX - 4} 14`, `M${CX + 6} 60 L${CX + 8} 14`]); break;
    case "cacheadoCurto": { const cs = Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (0.95 + i * 0.11), r = 50; return [CX + Math.cos(a) * r * 1.02, 84 + Math.sin(a) * r * 0.9] as P; }); cor = calota(8, 64) ; extra = cs.map(([x, y]) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="11"/>`).join(""); traco = cs.map(([x, y]) => linha(`M${f1(x - 5)} ${f1(y)} q5 -6 10 0`, 1.6, 0.45)).join(""); break; }
    case "blackPower": cor = suave([[CX - 54, 100], [CX - 68, 56], [CX - 40, 12], [CX, 2], [CX + 40, 12], [CX + 68, 56], [CX + 54, 100], [CX + 44, 84], [CX, 70], [CX - 44, 84]]); traco = fios(Array.from({ length: 8 }, (_, i) => `M${CX - 50 + i * 14} ${30 + (i % 2) * 14} q5 -5 9 0`), 0.4); break;
    case "trancas": cor = calota(3, 62, 104); traco = fios(Array.from({ length: 7 }, (_, i) => `M${CX - 36 + i * 12} 64 Q${CX - 30 + i * 10} 44 ${CX - 20 + i * 7} 34`), 0.55) + fios(Array.from({ length: 7 }, (_, i) => `M${CX - 34 + i * 12} 56 l5 -2 M${CX - 30 + i * 11} 46 l5 -2`), 0.4); break;
    case "dreads": cor = calota(7, 62, 110); extra = Array.from({ length: 8 }, (_, i) => `<rect x="${CX - 58 + i * 15}" y="${i === 0 || i === 7 ? 80 : 64}" width="9" height="${i === 0 || i === 7 ? 70 : 30}" rx="4.5"/>`).join(""); traco = fios([`M${CX - 30} 52 q8 8 10 14`, `M${CX + 10} 48 q6 8 8 16`]); break;
    case "ondulado": cor = suave([[CX - 54, 128], [CX - 56, 72], [CX - 34, 38], [CX, 30], [CX + 34, 38], [CX + 56, 72], [CX + 54, 128], [CX + 46, 100], [CX + 30, 70], [CX + 6, 62], [CX - 18, 72], [CX - 44, 98]]); traco = fios([`M${CX - 40} 60 Q${CX - 24} 50 ${CX - 10} 64`, `M${CX + 2} 48 Q${CX + 22} 44 ${CX + 34} 62`, `M${CX - 50} 100 q-4 14 2 26`, `M${CX + 50} 100 q4 14 -2 26`]); break;
    case "lisoLongo": cor = suave([[CX - 54, 150], [CX - 54, 74], [CX - 32, 40], [CX, 34], [CX + 32, 40], [CX + 54, 74], [CX + 54, 150], [CX + 46, 108], [CX + 24, 70], [CX + 4, 60], [CX - 4, 72], [CX - 30, 74], [CX - 46, 108]]); traco = fios([`M${CX + 2} 40 Q${CX - 4} 52 ${CX} 62`, `M${CX - 40} 64 Q${CX - 48} 110 ${CX - 48} 150`, `M${CX + 40} 64 Q${CX + 48} 110 ${CX + 48} 150`]); break;
    case "rabo": cor = calota(4, 60, 104); traco = fios([`M${CX - 40} 70 Q${CX} 40 ${CX + 34} 54`, `M${CX - 30} 82 Q${CX + 4} 56 ${CX + 36} 64`]); extra = `<rect x="${CX + 30}" y="56" width="12" height="10" rx="4" fill="#C8102E"/>`; break;
    case "coque": cor = calota(4, 60, 104); extra = `<circle cx="${CX}" cy="22" r="20"/>`; traco = tracoPath(`M${CX - 20} 22 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0`) + fios([`M${CX - 40} 70 Q${CX} 44 ${CX + 40} 70`]); break;
    case "chanel": cor = suave([[CX - 56, 160], [CX - 56, 74], [CX - 32, 40], [CX, 34], [CX + 32, 40], [CX + 56, 74], [CX + 56, 160], [CX + 44, 160], [CX + 46, 96], [CX + 26, 76], [CX - 26, 76], [CX - 46, 96], [CX - 44, 160]]); traco = fios([`M${CX - 36} 76 L${CX - 30} 100`, `M${CX - 10} 76 L${CX - 8} 98`, `M${CX + 16} 76 L${CX + 14} 98`]); break;
  }
  const formas = cor ? `<path d="${cor}"/>` : "";
  return peca(base, { cor: formas + (extra.includes("fill=\"#C8102E\"") ? "" : extra), cor2: extra.includes("fill=\"#C8102E\"") ? extra : "", sombra: cor ? `<path d="${cor}" fill="#2B0F05" fill-opacity=".14" transform="translate(5 3)"/>` : "", luz: cor ? brilho : "", traco: (cor ? tracoPath(cor) : "") + (extra && !extra.includes("#C8102E") && c !== "raspado" && c !== "moicano" ? extra.replace(/<(circle|rect)/g, `<$1 fill="none" stroke="${TINTA}" stroke-width="2.4"`) : "") + traco });
}

// ------------------------------------------------------------------ acessórios
export type Acessorio = "argola" | "brilhante" | "corrente" | "crucifixo" | "oculosRedondo" | "oculosQuadrado" | "aviador" | "oculosEsportivo" | "boneCurvo" | "boneReto" | "boneTras" | "gorro" | "faixa" | "headphone" | "piercingNariz" | "bandana";
export const ACESSORIOS_CABECA: Acessorio[] = ["argola", "brilhante", "piercingNariz", "corrente", "crucifixo", "headphone", "oculosRedondo", "oculosQuadrado", "aviador", "oculosEsportivo", "boneCurvo", "boneReto", "boneTras", "gorro", "faixa", "bandana"];
const NOME_AC: Record<Acessorio, string> = { argola: "Brinco de argola", brilhante: "Brinco brilhante", piercingNariz: "Piercing no nariz", corrente: "Corrente", crucifixo: "Corrente com crucifixo", headphone: "Fone no pescoço", oculosRedondo: "Óculos redondo", oculosQuadrado: "Óculos quadrado", aviador: "Óculos escuros aviador", oculosEsportivo: "Óculos esportivo", boneCurvo: "Boné aba curva", boneReto: "Boné aba reta", boneTras: "Boné para trás", gorro: "Gorro", faixa: "Faixa de cabelo", bandana: "Bandana" };
const OURO = "#E3B341", PRATA = "#C9CCD1";
/** Boné (aba curva, reta ou para trás) com a frente para estampa. */
function bone(tipo: "curvo" | "reto" | "tras", c1: string, c2: string, frente = ""): string {
  const copa = `M${CX - 54} 78 C${CX - 56} 30 ${CX + 56} 30 ${CX + 54} 78 Z`;
  const aba = tipo === "curvo" ? `M${CX - 56} 76 Q${CX} 70 ${CX + 56} 76 Q${CX + 50} 96 ${CX} 94 Q${CX - 50} 96 ${CX - 56} 76 Z` : tipo === "reto" ? `M${CX - 60} 74 L${CX + 60} 74 L${CX + 62} 86 L${CX - 62} 86 Z` : `M${CX - 34} 74 Q${CX} 70 ${CX + 34} 74 L${CX + 30} 80 Q${CX} 78 ${CX - 30} 80 Z`;
  const botao = `<circle cx="${CX}" cy="38" r="4" fill="${c2}" stroke="${TINTA}" stroke-width="1.6"/>`;
  const gomos = linha(`M${CX} 38 Q${CX - 18} 52 ${CX - 30} 78 M${CX} 38 Q${CX + 18} 52 ${CX + 30} 78`, 1.4, 0.4);
  const regulagem = tipo === "tras" ? `<path d="M${CX - 14} 60 Q${CX} 52 ${CX + 14} 60 L${CX + 12} 72 L${CX - 12} 72 Z" fill="#00000033"/>` : "";
  return svg(`<g id="Cor" fill="${c1}"><path d="${copa}"/></g><g id="Cor 2" fill="${c2}"><path d="${aba}"/></g><g id="Sombra"><path d="M${CX + 10} 36 C${CX + 46} 40 ${CX + 56} 56 ${CX + 54} 78 L${CX + 18} 78 Z" ${SOMBRA}/>${tipo === "curvo" ? `<path d="M${CX - 50} 80 Q${CX} 76 ${CX + 50} 80 Q${CX} 86 ${CX - 50} 80 Z" fill="#000" fill-opacity=".25"/>` : ""}</g>${regulagem}${frente ? `<g id="Estampa">${frente}</g>` : ""}<g id="Traço">${tracoPath(copa)}${tracoPath(aba)}${gomos}</g>${botao}`);
}
export function acessorio(a: Acessorio): string {
  switch (a) {
    case "argola": return svg(`<g id="Cor" fill="none" stroke="${OURO}" stroke-width="3">${[-1, 1].map((l) => `<circle cx="${CX + l * 50}" cy="134" r="7"/>`).join("")}</g><g id="Traço" fill="none" stroke="${TINTA}" stroke-width="1" stroke-opacity=".6">${[-1, 1].map((l) => `<circle cx="${CX + l * 50}" cy="134" r="8.5"/>`).join("")}</g>`);
    case "brilhante": return svg(`<g id="Cor" fill="${PRATA}">${[-1, 1].map((l) => `<path d="M${CX + l * 50} 124 l4 5 l-4 5 l-4 -5 Z"/>`).join("")}</g><g id="Luz">${[-1, 1].map((l) => `<circle cx="${CX + l * 50 - 1}" cy="127" r="1.4" fill="#fff"/>`).join("")}</g>`);
    case "piercingNariz": return svg(`<g id="Cor" fill="none" stroke="${PRATA}" stroke-width="2.4"><path d="M207 131 a4 4 0 1 1 -1 6"/></g>`);
    case "corrente": return svg(`<g id="Cor" fill="none" stroke="${OURO}" stroke-width="3.4" stroke-dasharray="4 2"><path d="M178 202 Q200 252 222 202"/></g>`);
    case "crucifixo": return svg(`<g id="Cor" fill="none" stroke="${OURO}" stroke-width="2.6"><path d="M180 202 Q200 262 220 202"/></g><g id="Cor 2" fill="${OURO}"><path d="M197 256 h6 v6 h6 v6 h-6 v14 h-6 v-14 h-6 v-6 h6 Z"/></g><g id="Traço">${tracoPath("M197 256 h6 v6 h6 v6 h-6 v14 h-6 v-14 h-6 v-6 h6 Z", 1.4)}</g>`);
    case "headphone": return svg(`<g id="Cor" fill="#1E1E22"><path d="M160 196 Q200 238 240 196 L246 200 Q200 250 154 200 Z"/><rect x="140" y="186" width="24" height="30" rx="10"/><rect x="236" y="186" width="24" height="30" rx="10"/></g><g id="Cor 2" fill="#E1001A"><rect x="146" y="192" width="12" height="18" rx="5"/><rect x="242" y="192" width="12" height="18" rx="5"/></g><g id="Traço">${tracoPath("M160 196 Q200 238 240 196")}${tracoPath("M150 186 h14 a10 10 0 0 1 0 30 h-14 a10 10 0 0 1 0 -30 Z")}${tracoPath("M236 186 h14 a10 10 0 0 1 0 30 h-14 a10 10 0 0 1 0 -30 Z")}</g>`);
    case "oculosRedondo": case "oculosQuadrado": case "aviador": case "oculosEsportivo": {
      const lente = (l: 1 | -1) => a === "oculosRedondo" ? `<circle cx="${CX + l * 20}" cy="112" r="14"/>` : a === "oculosQuadrado" ? `<rect x="${CX + l * 20 - 15}" y="100" width="30" height="23" rx="5"/>` : a === "aviador" ? `<path d="M${CX + l * 6} 102 L${CX + l * 34} 100 Q${CX + l * 36} 122 ${CX + l * 22} 126 Q${CX + l * 6} 124 ${CX + l * 6} 102 Z"/>` : "";
      if (a === "oculosEsportivo") return svg(`<g id="Cor" fill="#1E2B5F"><path d="M${CX - 46} 104 Q${CX} 92 ${CX + 46} 104 L${CX + 42} 118 Q${CX + 22} 128 ${CX + 4} 118 L${CX} 114 L${CX - 4} 118 Q${CX - 22} 128 ${CX - 42} 118 Z"/></g><g id="Luz"><path d="M${CX - 38} 104 Q${CX - 20} 98 ${CX - 8} 104 L${CX - 30} 110 Z" fill="#fff" fill-opacity=".45"/></g><g id="Traço">${tracoPath(`M${CX - 46} 104 Q${CX} 92 ${CX + 46} 104 L${CX + 42} 118 Q${CX + 22} 128 ${CX + 4} 118 L${CX} 114 L${CX - 4} 118 Q${CX - 22} 128 ${CX - 42} 118 Z`, 2.4)}</g>`);
      const escuro = a === "aviador";
      return svg(`<g id="Lente" fill="${escuro ? "#2B3A33" : "#BFE3F2"}" fill-opacity="${escuro ? 0.92 : 0.25}">${lente(-1)}${lente(1)}</g><g id="Luz" fill="#fff" fill-opacity=".5">${[-1, 1].map((l) => `<path d="M${CX + l * 20 - 8} 106 l6 -3 l-8 12 Z"/>`).join("")}</g><g id="Cor" fill="none" stroke="${a === "aviador" ? OURO : TINTA}" stroke-width="${a === "aviador" ? 2.2 : 3}">${lente(-1)}${lente(1)}<path d="M${CX - 6} 108 Q${CX} 104 ${CX + 6} 108"/><path d="M${CX - 34} 108 L${CX - 48} 104 M${CX + 34} 108 L${CX + 48} 104"/></g>`);
    }
    case "boneCurvo": return bone("curvo", "#1E2B5F", "#1E2B5F");
    case "boneReto": return bone("reto", "#111111", "#C8102E");
    case "boneTras": return bone("tras", "#C8102E", "#C8102E");
    case "gorro": { const d = `M${CX - 54} 84 C${CX - 58} 22 ${CX + 58} 22 ${CX + 54} 84 Z`; return svg(`<g id="Cor" fill="#2E7D4F"><path d="${d}"/></g><g id="Cor 2" fill="#E9E4DA"><path d="M${CX - 56} 70 L${CX + 56} 70 L${CX + 56} 88 L${CX - 56} 88 Z"/><circle cx="${CX}" cy="22" r="12"/></g><g id="Sombra"><path d="M${CX + 12} 32 C${CX + 46} 40 ${CX + 56} 56 ${CX + 54} 84 L${CX + 18} 84 Z" ${SOMBRA}/></g><g id="Traço">${tracoPath(d)}${tracoPath(`M${CX - 56} 70 L${CX + 56} 70 L${CX + 56} 88 L${CX - 56} 88 Z`)}${linha(Array.from({ length: 10 }, (_, i) => `M${CX - 50 + i * 11} 72 V86`).join(" "), 1.2, 0.35)}${tracoPath(`M${CX - 12} 22 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0`)}</g>`); }
    case "faixa": return svg(`<g id="Cor" fill="#F2F0EA"><path d="M${CX - 52} 74 Q${CX} 56 ${CX + 52} 74 L${CX + 52} 86 Q${CX} 68 ${CX - 52} 86 Z"/></g><g id="Traço">${tracoPath(`M${CX - 52} 74 Q${CX} 56 ${CX + 52} 74 L${CX + 52} 86 Q${CX} 68 ${CX - 52} 86 Z`, 2.2)}</g>`);
    case "bandana": return svg(`<g id="Cor" fill="#C8102E"><path d="M${CX - 54} 82 C${CX - 56} 34 ${CX + 56} 34 ${CX + 54} 82 Q${CX} 70 ${CX - 54} 82 Z M${CX + 52} 76 L${CX + 72} 92 L${CX + 62} 98 L${CX + 50} 84 Z"/></g><g id="Detalhe" fill="#FFFFFF">${[[-30, 56], [0, 48], [28, 58], [-12, 68], [16, 70]].map(([x, y]) => `<circle cx="${CX + x}" cy="${y}" r="3"/>`).join("")}</g><g id="Traço">${tracoPath(`M${CX - 54} 82 C${CX - 56} 34 ${CX + 56} 34 ${CX + 54} 82 Q${CX} 70 ${CX - 54} 82 Z`)}</g>`);
  }
}
/** Acessórios de pulso: relógio, pulseira e munhequeira (dependem do corpo). */
export function pulso(t: Tipo, s: Sexo, item: "relogio" | "pulseira" | "munhequeira"): string {
  const e = esqueleto(t, s), b = e.braco(-1), w = b.w[4], [x, y] = e.punho(-1), y0 = y - 18;
  if (item === "relogio") return svg(`<g id="Cor" fill="#1E1E22"><rect x="${f1(x - w - 1)}" y="${y0}" width="${f1(2 * w + 2)}" height="10" rx="3"/></g><g id="Cor 2" fill="${PRATA}"><rect x="${f1(x - w * 0.7)}" y="${y0 - 3}" width="${f1(w * 1.4)}" height="16" rx="4"/></g><g id="Traço">${tracoPath(`M${f1(x - w * 0.7)} ${y0 - 3} h${f1(w * 1.4)} v16 h${f1(-w * 1.4)} Z`, 1.8)}</g>`);
  if (item === "pulseira") return svg(`<g id="Cor" fill="none" stroke="${OURO}" stroke-width="3"><path d="M${f1(x - w - 1)} ${y0 + 6} Q${f1(x)} ${y0 + 10} ${f1(x + w + 1)} ${y0 + 6}"/></g>`);
  return svg(`<g id="Cor" fill="#FFFFFF"><rect x="${f1(x - w - 1.5)}" y="${y0 - 8}" width="${f1(2 * w + 3)}" height="20" rx="4"/></g><g id="Cor 2" fill="#C8102E"><rect x="${f1(x - w - 1.5)}" y="${y0}" width="${f1(2 * w + 3)}" height="4"/></g><g id="Traço">${tracoPath(`M${f1(x - w - 1.5)} ${y0 - 8} h${f1(2 * w + 3)} v20 h${f1(-2 * w - 3)} Z`, 2)}</g>`);
}

// ------------------------------------------------------------------ patrocínio
export const MARCAS_VESTIR = ["kokakolla", "redboi", "monstrao", "naiki", "adidaz", "pumba", "nobanco", "gororo", "teslo", "macdonaldo"];
const logoSoltoMenor = (id: string, larg: number) => {
  const l = logoSvg(MARCA[id], 20), vb = +(l.match(/viewBox="0 0 ([\d.]+) 40"/)?.[1] ?? 160);
  return l.replace(/height="20"/, `width="${larg}" height="${f1((larg * 40) / vb)}"`).replace(/ class="logo-marca"| role="img"| aria-label="[^"]*"/g, "");
};
/** Boné do patrocinador: cores da marca e o logo na frente. */
export function bonePatrocinio(id: string): string {
  const m = MARCA[id], logo = logoSoltoMenor(id, 58).replace("<svg ", `<svg x="${CX - 29}" y="52" `);
  return bone("curvo", m.cores[0], m.cores[1] === "#FFFFFF" && m.cores[0] === "#FFFFFF" ? "#1A1A1A" : m.cores[1], logo);
}
/** Estampa do patrocinador no peito (vai por cima do moletom ou da camiseta). */
export function estampaPatrocinio(id: string): string {
  const logo = logoSoltoMenor(id, 92).replace("<svg ", `<svg x="${CX - 46}" y="296" `);
  return svg(`<g id="Estampa">${logo}</g>`);
}

// ------------------------------------------------------------------ catálogo
export interface Peca { conjunto: string; pagina: string; props: Record<string, string>; arquivo: string; svg: string }
export function catalogo(): Peca[] {
  const out: Peca[] = [], add = (pagina: string, conjunto: string, props: Record<string, string>, s: string) => out.push({ pagina, conjunto, props, arquivo: "", svg: s });
  const SX: Record<Sexo, string> = { M: "Masculino", F: "Feminino" };
  for (const s of ["M", "F"] as Sexo[]) for (const t of TIPOS) {
    add("Corpo", `Corpo · ${SX[s]}`, { Tipo: NOME_TIPO[t] }, corpo(t, s));
    for (const cai of ["justo", "largo"] as Caimento[]) for (const mg of ["curta", "longa"] as const) add("Uniforme", `Camisa de jogo · ${SX[s]}`, { Tipo: NOME_TIPO[t], Caimento: cai === "justo" ? "Justo" : "Largo", Manga: mg === "curta" ? "Curta" : "Longa" }, camisaJogo(t, s, cai, mg));
    for (const cai of ["justo", "largo"] as Caimento[]) add("Uniforme", `Calção · ${SX[s]}`, { Tipo: NOME_TIPO[t], Caimento: cai === "justo" ? "Justo" : "Largo" }, calcao(t, s, cai));
    add("Uniforme", `Meião · ${SX[s]}`, { Tipo: NOME_TIPO[t] }, meiao(t, s));
    add("Uniforme", `Chuteira · ${SX[s]}`, { Tipo: NOME_TIPO[t] }, calcado(t, s, "chuteira"));
    for (const p of ["camiseta", "regata", "moletom"] as const) add("Casual", `${p === "camiseta" ? "Camiseta" : p === "regata" ? "Regata" : "Moletom (blusão)"} · ${SX[s]}`, { Tipo: NOME_TIPO[t] }, camiseta(t, s, p));
    for (const p of ["bermuda", "calca"] as const) add("Casual", `${p === "bermuda" ? "Bermuda" : "Calça"} · ${SX[s]}`, { Tipo: NOME_TIPO[t] }, bermudaCalca(t, s, p));
    add("Casual", `Tênis · ${SX[s]}`, { Tipo: NOME_TIPO[t] }, calcado(t, s, "tenis"));
    for (const it of ["relogio", "pulseira", "munhequeira"] as const) add("Acessórios", `${it === "relogio" ? "Relógio" : it === "pulseira" ? "Pulseira" : "Munhequeira"} · ${SX[s]}`, { Tipo: NOME_TIPO[t] }, pulso(t, s, it));
  }
  for (const s of ["M", "F"] as Sexo[]) for (const r of ROSTOS) add("Cabeça", "Rosto", { Sexo: SX[s], Formato: NOME_ROSTO[r] }, cabeca(r, s));
  for (const o of OLHOS) add("Cabeça", "Olhos", { Formato: NOME_OLHO[o] }, olhos(o));
  for (const sb of SOBRANCELHAS) add("Cabeça", "Sobrancelha", { Formato: sb[0].toUpperCase() + sb.slice(1).replace("corte", "com corte") }, sobrancelha(sb));
  for (const n of NARIZES) add("Cabeça", "Nariz", { Formato: n[0].toUpperCase() + n.slice(1) }, nariz(n));
  for (const b of BOCAS) add("Cabeça", "Boca", { Expressão: { neutra: "Neutra", sorriso: "Sorriso", risada: "Risada", seria: "Séria", labios: "Lábios marcados" }[b] }, boca(b));
  for (const b of BARBAS) add("Cabeça", "Barba", { Estilo: { nenhuma: "Nenhuma", porFazer: "Por fazer", cavanhaque: "Cavanhaque", bigode: "Bigode", cheia: "Cheia" }[b] }, barba(b));
  for (const c of CABELOS) add("Cabelo", "Cabelo · Frente", { Estilo: NOME_CABELO[c] }, cabelo(c, "frente"));
  for (const c of ["ondulado", "lisoLongo", "rabo", "chanel", "dreads", "blackPower"] as Cabelo[]) add("Cabelo", "Cabelo · Atrás", { Estilo: NOME_CABELO[c] }, cabelo(c, "atras"));
  for (const a of ACESSORIOS_CABECA) add("Acessórios", a.startsWith("bone") || a === "gorro" || a === "faixa" || a === "bandana" ? "Cabeça · chapéus e faixas" : a.startsWith("oculos") || a === "aviador" ? "Óculos" : a === "corrente" || a === "crucifixo" || a === "headphone" ? "Pescoço" : "Brincos e piercings", { Item: NOME_AC[a] }, acessorio(a));
  for (const id of MARCAS_VESTIR) add("Patrocínio", "Boné do patrocinador", { Marca: MARCA[id].nome }, bonePatrocinio(id));
  for (const id of MARCAS_VESTIR) add("Patrocínio", "Estampa do patrocinador", { Marca: MARCA[id].nome }, estampaPatrocinio(id));
  out.forEach((p, i) => (p.arquivo = `p${String(i).padStart(3, "0")}.svg`));
  return out;
}

if (process.argv[2] && process.argv[1]?.endsWith("arte.ts")) {
  const dir = process.argv[2];
  rmSync(dir, { recursive: true, force: true }); mkdirSync(`${dir}/pecas`, { recursive: true });
  const cat = catalogo();
  for (const p of cat) writeFileSync(`${dir}/pecas/${p.arquivo}`, p.svg);
  writeFileSync(`${dir}/pecas.json`, JSON.stringify(cat.map(({ svg: _s, ...r }) => r), null, 1));
  console.log(`${cat.length} peças`, [...new Set(cat.map((p) => p.conjunto))].length, "conjuntos");
}
void MARCAS;
