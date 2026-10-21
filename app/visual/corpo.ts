// O jogador de corpo inteiro, no mesmo traço da foto (contorno preto, sombra chapada à direita).
// A cabeça vem da foto (svgFoto com soCabeca); o resto é desenhado aqui: físico, uniforme do clube (manga curta ou
// longa, justo ou largo, meião alto ou baixo, chuteira do patrocinador), roupa do dia a dia e tatuagens.
import { svgFoto, PELES, CORES_ROUPA, escurecer, type Aparencia } from "../criacao/avatar";
import type { Visual, AreaTatuagem } from "../../src/visual";
import { tatuagemVisivel } from "../../src/visual";

const TINTA = "#0A0A0A", TRACO = 2.8, TINTA_TAT = "#1F2A36";
type P = [number, number];
let seq = 0;
const novoId = (p: string) => `${p}${(seq++).toString(36)}`;

function mistura(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const luz = (hex: string) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const f1 = (n: number) => Math.round(n * 10) / 10;

/** Caminho suave aberto passando pelos pontos (curvas quadráticas pelos pontos médios). */
function suave(pts: P[]): string {
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const m: P = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    d += ` Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(m[0])} ${f1(m[1])}`;
  }
  const u = pts[pts.length - 1];
  return d + ` L${f1(u[0])} ${f1(u[1])}`;
}
/** Membro (braço, perna, manga) como um tubo de largura variável pela linha central; pontas arredondadas. */
function membro(pts: [number, number, number][], pontaRedonda = true): string {
  const E: P[] = [], D: P[] = [];
  pts.forEach(([x, y, w], i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    E.push([x - dy * w / 2, y + dx * w / 2]); D.push([x + dy * w / 2, y - dx * w / 2]);
  });
  const fim = pts[pts.length - 1], ini = pts[0];
  const d1 = suave(E), d2 = suave([...D].reverse()).replace(/^M/, "L");
  const c = (p: [number, number, number], q: [number, number, number], k: number): P => {
    const dx = p[0] - q[0], dy = p[1] - q[1], n = Math.hypot(dx, dy) || 1;
    return [p[0] + (dx / n) * p[2] * k, p[1] + (dy / n) * p[2] * k];
  };
  const pf = c(fim, pts[pts.length - 2], 0.55), pi = c(ini, pts[1], 0.55);
  return `${d1} ${pontaRedonda ? `Q${f1(pf[0])} ${f1(pf[1])} ${f1(D[D.length - 1][0])} ${f1(D[D.length - 1][1])}` : `L${f1(D[D.length - 1][0])} ${f1(D[D.length - 1][1])}`} ${d2} ${pontaRedonda ? `Q${f1(pi[0])} ${f1(pi[1])} ${f1(E[0][0])} ${f1(E[0][1])}` : ""} Z`;
}
const contorno = (d: string, fill: string, extra = "") => `<path d="${d}" fill="${fill}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round" ${extra}/>`;
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const ang = (a: P, b: P) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

// ------------------------------------------------------------------ geometria do corpo
const FISICO = {
  magro: { ombro: 74, cintura: 50, braco: 26, perna: 32 },
  atletico: { ombro: 82, cintura: 54, braco: 31, perna: 37 },
  forte: { ombro: 90, cintura: 60, braco: 36, perna: 42 },
};
interface Geo { ombro: number; cintura: number; braco: number; perna: number; bracos: { S: P; E: P; W: P; lado: -1 | 1 }[]; pernas: { H: P; K: P; A: P; lado: -1 | 1 }[]; bainha: number; altura: number }
function geometria(v: Visual, alturaCm: number): Geo {
  const f = FISICO[v.fisico], extra = Math.max(-14, Math.min(14, (alturaCm - 178) * 0.8));
  const bracos = ([-1, 1] as const).map((lado) => ({ lado, S: [150 + lado * (f.ombro - f.braco * 0.42), 266] as P, E: [150 + lado * (f.ombro + 8), 358] as P, W: [150 + lado * (f.ombro + 11), 440] as P }));
  const pernas = ([-1, 1] as const).map((lado) => ({ lado, H: [150 + lado * 25, 462] as P, K: [150 + lado * 28, 586 + extra * 0.5] as P, A: [150 + lado * 29, 694 + extra] as P }));
  return { ...f, bracos, pernas, bainha: 436, altura: 740 + extra };
}

// ------------------------------------------------------------------ tatuagens
/** Desenho da tatuagem centrado em (0,0), cabendo em ~26 × 46 (comprido no sentido do membro, que é o eixo y). */
function desenhoTatuagem(id: string): string {
  const t = `fill="none" stroke="${TINTA_TAT}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;
  const est = (x: number, y: number, r: number) => `<path d="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; return `${i ? "L" : "M"}${f1(x + Math.cos(a) * rr)} ${f1(y + Math.sin(a) * rr)}`; }).join(" ")} Z" fill="${TINTA_TAT}" fill-opacity=".85"/>`;
  switch (id) {
    case "estrelas": return est(-4, -14, 6) + est(5, 0, 5) + est(-2, 13, 4);
    case "rosa": return `<path d="M0 6 Q-2 18 2 24" ${t}/><path d="M1 14 Q-9 12 -10 18 Q-3 20 1 14 Z" fill="#3E6B4A" stroke="${TINTA_TAT}" stroke-width="1"/><circle cx="0" cy="-2" r="9" fill="#B3263A" stroke="${TINTA_TAT}" stroke-width="1.4"/><path d="M-4 -3 Q0 -9 4 -3 Q0 2 -3 -1 M-6 1 Q0 6 6 0" ${t} stroke-width="1.1"/>`;
    case "terco": return Array.from({ length: 7 }, (_, i) => `<circle cx="${f1(Math.sin(i * 0.9) * 3)}" cy="${-20 + i * 5}" r="1.6" fill="${TINTA_TAT}"/>`).join("") + `<path d="M0 14 V26 M-4 18 H4" ${t} stroke-width="2"/>`;
    case "tribal": return `<path d="M-8 -22 Q6 -12 -2 0 Q-8 8 4 22 Q-4 14 -8 6 Q-10 -6 -2 -10 Q-6 -16 -8 -22 Z" fill="${TINTA_TAT}" fill-opacity=".88"/><path d="M6 -18 Q12 -8 6 0 Q10 -10 4 -16 Z" fill="${TINTA_TAT}" fill-opacity=".88"/>`;
    case "escrita": return `<text x="0" y="0" transform="rotate(90)" text-anchor="middle" dominant-baseline="middle" font-family="'Brush Script MT','Segoe Script',cursive" font-style="italic" font-size="11" fill="${TINTA_TAT}">Família</text>`;
    case "coroa": return `<path d="M-10 6 L-11 -8 L-5 -2 L0 -12 L5 -2 L11 -8 L10 6 Z" ${t} stroke-width="1.6"/><path d="M-10 10 H10" ${t} stroke-width="2"/><circle cx="0" cy="-14" r="1.4" fill="${TINTA_TAT}"/>`;
    case "asas": return `<path d="M-1 0 Q-10 -12 -16 -6 Q-12 -4 -14 2 Q-8 0 -9 6 Q-4 2 -1 0 Z M1 0 Q10 -12 16 -6 Q12 -4 14 2 Q8 0 9 6 Q4 2 1 0 Z" fill="${TINTA_TAT}" fill-opacity=".85"/>`;
    case "data": return `<text x="0" y="0" transform="rotate(90)" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-size="8.5" letter-spacing="1" fill="${TINTA_TAT}">XII·IV·MMX</text>`;
    case "bola": return `<circle r="9" ${t} stroke-width="1.6"/><path d="M0 -4 L4 -1 L2.5 4 L-2.5 4 L-4 -1 Z" fill="${TINTA_TAT}"/><path d="M0 -4 V-9 M4 -1 L8.5 -3 M2.5 4 L5 8 M-2.5 4 L-5 8 M-4 -1 L-8.5 -3" ${t} stroke-width="1"/>`;
    default: return "";
  }
}
/** Fechamento: padrão denso de ondas e flores que cobre o membro inteiro (recortado pelo próprio membro). */
function fechamento(d: string, x: number, y: number, h: number): string {
  const id = novoId("fc");
  const ondas = Array.from({ length: 9 }, (_, i) => `<path d="M${x - 30} ${y - h / 2 + i * (h / 8)} q10 -8 20 0 t20 0 t20 0" fill="none" stroke="${TINTA_TAT}" stroke-width="1.6" stroke-opacity=".8"/>`).join("");
  const flores = [[-6, -0.25], [7, 0.1], [-4, 0.35]].map(([dx, k]) => `<circle cx="${x + dx}" cy="${y + k * h}" r="6" fill="${TINTA_TAT}" fill-opacity=".75"/><circle cx="${x + dx}" cy="${y + k * h}" r="2.4" fill="#B3263A"/>`).join("");
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${ondas}${flores}</g>`;
}
/** Amostra do desenho num pedaço de pele (para o estúdio). */
export function previaTatuagem(id: string): string {
  const pele = "#C98C63";
  const desenho = id === "fechada" ? fechamento("M6 2 H30 V34 H6 Z", 18, 18, 36) : `<g transform="translate(18 18) scale(.7)">${desenhoTatuagem(id)}</g>`;
  return `<svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true"><rect x="2" y="2" width="32" height="32" rx="8" fill="${pele}"/>${desenho}</svg>`;
}
/** Tatuagem no pescoço, nas coordenadas da foto (vai por dentro da cabeça). */
export function tatuagemPescoco(id: string | undefined): string {
  if (!id || id === "fechada") return "";
  return `<g transform="translate(137 212) scale(0.62)">${desenhoTatuagem(id)}</g>`;
}

// ------------------------------------------------------------------ peças
export interface Kit { cor1: string; cor2: string; padrao: string; numero: string; chuteira?: [string, string] }
function padraoKit(k: Kit, g: Geo): string {
  const c2 = k.cor2, x0 = 150 - g.ombro - 40, x1 = 150 + g.ombro + 40;
  switch (k.padrao) {
    case "listrasV": return Array.from({ length: 12 }, (_, i) => `<rect x="${x0 + i * 22}" y="220" width="11" height="260" fill="${c2}"/>`).join("");
    case "listrasH": return Array.from({ length: 10 }, (_, i) => `<rect x="${x0}" y="${246 + i * 22}" width="${x1 - x0}" height="11" fill="${c2}"/>`).join("");
    case "faixa": return `<path d="M${150 - g.ombro + 6} 250 L${150 - g.ombro + 34} 244 L${150 + g.cintura + 30} 470 L${150 + g.cintura} 470 Z" fill="${c2}"/>`;
    case "faixaH": return `<rect x="${x0}" y="314" width="${x1 - x0}" height="26" fill="${c2}"/>`;
    default: return "";
  }
}
/** Camisa (tronco). largo = mais pano e bainha mais baixa. */
function troncoCamisa(g: Geo, largo: boolean): { d: string; bainha: number } {
  const o = g.ombro + (largo ? 8 : 0), c = g.cintura + (largo ? 14 : 2), b = g.bainha + (largo ? 18 : 0);
  const d = `M122 230 C108 236 ${150 - o + 14} 244 ${150 - o} 262 L${150 - o + 4} 306 C${150 - o + 8} 356 ${150 - c - 2} 392 ${150 - c} ${b} Q150 ${b + 6} ${150 + c} ${b} C${150 + c + 2} 392 ${150 + o - 8} 356 ${150 + o - 4} 306 L${150 + o} 262 C${150 + o - 14} 244 192 236 178 230 Q150 246 122 230 Z`;
  return { d, bainha: b };
}
function mangaPath(g: Geo, b: Geo["bracos"][0], longa: boolean, folga: number): string {
  const ombroTopo: P = [150 + b.lado * (g.ombro - 6), 258];
  if (!longa) {
    const fim = lerp(b.S, b.E, 0.64);
    return membro([[ombroTopo[0], ombroTopo[1] + 4, g.braco + 14 + folga], [b.S[0], b.S[1] + 8, g.braco + 10 + folga], [fim[0], fim[1], g.braco + 6 + folga]], false);
  }
  return membro([[ombroTopo[0], ombroTopo[1] + 4, g.braco + 14 + folga], [b.S[0], b.S[1] + 8, g.braco + 9 + folga], [b.E[0], b.E[1], g.braco * 0.86 + 7 + folga], [b.W[0], b.W[1] - 4, g.braco * 0.66 + 6 + folga]], false);
}
function bracoPath(g: Geo, b: Geo["bracos"][0]): string {
  return membro([[b.S[0], b.S[1], g.braco], [...lerp(b.S, b.E, 0.5), g.braco * 0.98] as [number, number, number], [b.E[0], b.E[1], g.braco * 0.8], [...lerp(b.E, b.W, 0.5), g.braco * 0.78] as [number, number, number], [b.W[0], b.W[1], g.braco * 0.6]]);
}
function antebracoPath(g: Geo, b: Geo["bracos"][0]): string {
  return membro([[b.E[0], b.E[1], g.braco * 0.8], [...lerp(b.E, b.W, 0.5), g.braco * 0.78] as [number, number, number], [b.W[0], b.W[1], g.braco * 0.6]]);
}
function mao(b: Geo["bracos"][0], g: Geo, pele: string, sombra: string): string {
  const [x, y] = [b.W[0] + b.lado * 1, b.W[1] + 16], r = g.braco * 0.42;
  return `<path d="M${f1(x - r)} ${f1(y - r * 0.6)} Q${f1(x - r * 1.1)} ${f1(y + r * 0.9)} ${f1(x)} ${f1(y + r * 1.15)} Q${f1(x + r * 1.1)} ${f1(y + r * 0.9)} ${f1(x + r)} ${f1(y - r * 0.6)} Q${x} ${f1(y - r * 1.2)} ${f1(x - r)} ${f1(y - r * 0.6)} Z" fill="${b.lado === 1 ? sombra : pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>
    <path d="M${f1(x - b.lado * r * 0.9)} ${f1(y - r * 0.1)} Q${f1(x - b.lado * r * 1.25)} ${f1(y + r * 0.5)} ${f1(x - b.lado * r * 0.5)} ${f1(y + r * 0.55)}" stroke="${TINTA}" stroke-width="1.4" fill="none"/>`;
}
function pernaPath(g: Geo, p: Geo["pernas"][0], ate = 1): string {
  const pts: [number, number, number][] = [[p.H[0], p.H[1], g.perna], [...lerp(p.H, p.K, 0.5), g.perna * 0.94] as [number, number, number], [p.K[0], p.K[1], g.perna * 0.74], [...lerp(p.K, p.A, 0.35), g.perna * 0.78] as [number, number, number], [p.A[0], p.A[1], g.perna * 0.5]];
  return membro(ate >= 1 ? pts : pts.slice(0, 3));
}
function meiaoPath(g: Geo, p: Geo["pernas"][0], baixo: boolean): string {
  const topo = lerp(p.K, p.A, baixo ? 0.42 : 0.08);
  return membro([[topo[0], topo[1], g.perna * 0.8 + 3], [...lerp(p.K, p.A, 0.45), g.perna * 0.8 + 3] as [number, number, number], [p.A[0], p.A[1] - 2, g.perna * 0.54 + 3]], false);
}
function calcado(p: Geo["pernas"][0], cor: string, detalhe: string, chuteira: boolean): string {
  const [x, y] = p.A, l = p.lado;
  const d = `M${x - 13 * l} ${y - 6} L${x + 12 * l} ${y - 6} L${x + 14 * l} ${y + 16} L${x - 24 * l} ${y + 18} Q${x - 34 * l} ${y + 17} ${x - 31 * l} ${y + 8} Q${x - 25 * l} ${y + 1} ${x - 13 * l} ${y - 6} Z`;
  return `${contorno(d, cor)}<path d="M${x + 8 * l} ${y + 2} Q${x - 6 * l} ${y + 10} ${x - 24 * l} ${y + 9}" stroke="${detalhe}" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M${x + 14 * l} ${y + 16} L${x - 24 * l} ${y + 18} Q${x - 34 * l} ${y + 17} ${x - 31 * l} ${y + 12}" stroke="${chuteira ? "#E9E4D8" : "#F2F0EA"}" stroke-width="${chuteira ? 2.4 : 4}" fill="none"/>
    ${chuteira ? [-18, -6, 6].map((dx) => `<rect x="${x + dx * l - 2}" y="${y + 17}" width="4" height="5" rx="1" fill="#2A2A2A"/>`).join("") : ""}`;
}
function shortsPath(g: Geo, largo: boolean, bainhaCamisa: number, baixo: number): string {
  const c = g.cintura + (largo ? 8 : 4), w = largo ? 12 : 6;
  return `M${150 - c} ${bainhaCamisa - 26} L${150 + c} ${bainhaCamisa - 26} L${150 + c + w} ${baixo} L${154} ${baixo - 2} L150 ${baixo - 30} L146 ${baixo - 2} L${150 - c - w} ${baixo} Z`;
}
function calcaPath(g: Geo, ate: "calca" | "bermuda", bainhaCamisa: number): string {
  return ([-1, 1] as const).map((l) => {
    const p = g.pernas[l === -1 ? 0 : 1], fim = ate === "calca" ? [p.A[0], p.A[1] - 4] as P : lerp(p.H, p.K, 0.72);
    return membro([[p.H[0], bainhaCamisa - 22, g.perna + 12], [...lerp(p.H, p.K, 0.5), g.perna + 6] as [number, number, number], ...(ate === "calca" ? [[p.K[0], p.K[1], g.perna * 0.8 + 6] as [number, number, number]] : []), [fim[0], fim[1], ate === "calca" ? g.perna * 0.62 + 6 : g.perna + 6]], false);
  }).join(" ") + ` M${150 - g.cintura - 8} ${bainhaCamisa - 26} L${150 + g.cintura + 8} ${bainhaCamisa - 26} L${150 + g.cintura + 10} ${bainhaCamisa + 16} L150 ${bainhaCamisa + 30} L${150 - g.cintura - 10} ${bainhaCamisa + 16} Z`;
}
function sombraLado(d: string, x: number): string {
  const id = novoId("sb");
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><rect x="${x}" y="0" width="300" height="800" fill="#000" opacity=".2" clip-path="url(#${id})"/>`;
}

// ------------------------------------------------------------------ montagem
export interface OpcoesCorpo { aparencia: Partial<Aparencia> | null; visual: Visual; alturaCm?: number; traje: "jogo" | "casual"; kit?: Kit; fundo?: string }
export function svgCorpo(o: OpcoesCorpo): string {
  const ap = o.aparencia ?? {}, v = o.visual, g = geometria(v, o.alturaCm ?? 178);
  const pele = PELES[ap.pele ?? 3], sombraPele = mistura(pele, "#2A1206", 0.28);
  const kit = o.kit ?? { cor1: "#C8102E", cor2: "#FFFFFF", padrao: "lisa", numero: "10" };
  const jogo = o.traje === "jogo";
  const largo = jogo ? v.caimento === "largo" : v.casual === "moletom";
  const corCasual = CORES_ROUPA[v.corCasual] ?? CORES_ROUPA[1];
  const camisaCor = jogo ? kit.cor1 : v.casual === "jaqueta" ? "#4F6E9C" : corCasual;
  const camisaCor2 = jogo ? kit.cor2 : escurecer(camisaCor, 0.78);
  const tat = v.tatuagens;
  const vis = (a: AreaTatuagem) => !!tat[a] && tatuagemVisivel(a, v, o.traje);
  const partes: string[] = [`<ellipse cx="150" cy="${g.pernas[0].A[1] + 22}" rx="${g.ombro + 16}" ry="9" fill="#000" opacity=".22"/>`];
  // pernas e calçados
  const pernaComprida = !jogo && v.perna === "calca";
  for (const p of g.pernas) {
    if (!pernaComprida) {
      const d = pernaPath(g, p);
      partes.push(contorno(d, p.lado === 1 ? sombraPele : pele));
      const area: AreaTatuagem = p.lado === -1 ? "pernaE" : "pernaD";
      if (vis(area)) {
        const c = lerp(p.H, p.K, 0.78);
        partes.push(tat[area] === "fechada" ? fechamento(pernaPath(g, p, 0), c[0], c[1], 70) : `<g transform="translate(${f1(c[0])} ${f1(c[1])}) rotate(${f1(ang(p.H, p.K) - 90)}) scale(.95)">${desenhoTatuagem(tat[area]!)}</g>`);
      }
      partes.push(`<path d="M${p.K[0] - 7} ${p.K[1] - 2} Q${p.K[0]} ${p.K[1] + 5} ${p.K[0] + 7} ${p.K[1] - 2}" stroke="${TINTA}" stroke-width="1.3" fill="none" opacity=".6"/>`);
    }
    if (jogo) {
      const md = meiaoPath(g, p, v.meiao === "baixo");
      partes.push(contorno(md, kit.cor1 === "#FFFFFF" || luz(kit.cor1) > 0.85 ? "#F2F0EA" : kit.cor1));
      const topo = lerp(p.K, p.A, v.meiao === "baixo" ? 0.46 : 0.12);
      partes.push(`<path d="M${topo[0] - g.perna * 0.42} ${topo[1] + 6} L${topo[0] + g.perna * 0.42} ${topo[1] + 6}" stroke="${kit.cor2}" stroke-width="5"/>`);
      if (p.lado === 1) partes.push(sombraLado(md, p.A[0]));
    }
    const [c1, c2] = jogo ? (kit.chuteira ?? ["#1A1A1A", "#E3B341"]) : v.casual === "social" ? ["#3B2416", "#3B2416"] : ["#F2F0EA", "#C8C4BA"];
    partes.push(calcado(p, c1, c2, jogo));
  }
  // bermuda/calça (casual) ou calção (jogo)
  const camisa = troncoCamisa(g, largo);
  if (jogo) {
    const sd = shortsPath(g, v.caimento === "largo", camisa.bainha, v.caimento === "largo" ? 532 : 516);
    const corShort = kit.padrao === "lisa" && luz(kit.cor1) > 0.85 ? kit.cor2 : luz(kit.cor2) > 0.85 && kit.padrao !== "lisa" ? kit.cor2 : kit.cor2;
    partes.push(contorno(sd, corShort), sombraLado(sd, 152));
    partes.push(`<text x="${150 - g.cintura + 8}" y="${v.caimento === "largo" ? 520 : 504}" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="15" fill="${luz(corShort) > 0.5 ? "#1A1A1A" : "#F2F0EA"}">${kit.numero}</text>`);
  } else {
    const cd = calcaPath(g, v.perna, camisa.bainha), corCalca = v.perna === "calca" ? (v.casual === "social" ? "#2B2F36" : v.casual === "moletom" ? "#7F8389" : "#2E3F5C") : (v.casual === "regata" ? "#4F6E9C" : "#B9A58A");
    partes.push(contorno(cd, corCalca), sombraLado(cd, 152));
  }
  // cabeça (com o pescoço e a tatuagem do pescoço)
  partes.push(svgFoto({ aparencia: { ...(ap as Aparencia) }, soCabeca: true, pescoco: vis("pescoco") ? tatuagemPescoco(tat.pescoco) : "" }).replace("<svg ", '<svg x="0" y="0" width="300" height="360" '));
  // braços (pele), tatuagens dos antebraços e mãos
  const regata = !jogo && v.casual === "regata";
  for (const b of g.bracos) {
    const d = bracoPath(g, b);
    partes.push(contorno(d, b.lado === 1 ? sombraPele : pele));
    const area: AreaTatuagem = b.lado === -1 ? "antebracoE" : "antebracoD";
    if (vis(area)) {
      const c = lerp(b.E, b.W, 0.45);
      partes.push(tat[area] === "fechada" ? fechamento(antebracoPath(g, b), c[0], c[1], 90) : `<g transform="translate(${f1(c[0])} ${f1(c[1])}) rotate(${f1(ang(b.E, b.W) - 90)}) scale(${f1(g.braco / 30)})">${desenhoTatuagem(tat[area]!)}</g>`);
    }
    partes.push(`<path d="M${b.E[0] - b.lado * 6} ${b.E[1] - 4} Q${b.E[0]} ${b.E[1] + 2} ${b.E[0] + b.lado * 4} ${b.E[1] - 6}" stroke="${TINTA}" stroke-width="1.2" fill="none" opacity=".5"/>`);
    partes.push(mao(b, g, pele, sombraPele));
  }
  // camisa: mangas e tronco
  const idK = novoId("kt");
  const longa = jogo ? v.manga === "longa" : ["moletom", "social", "jaqueta"].includes(v.casual);
  const folga = largo ? 6 : 0;
  const mangas = regata ? [] : g.bracos.map((b) => mangaPath(g, b, longa, folga));
  const corManga = jogo && kit.padrao === "centro" ? kit.cor2 : camisaCor;
  for (const [i, md] of mangas.entries()) {
    partes.push(`<clipPath id="${idK}m${i}"><path d="${md}"/></clipPath>`, contorno(md, corManga));
    if (jogo && kit.padrao !== "centro" && kit.padrao !== "lisa" && kit.padrao !== "faixa") partes.push(`<g clip-path="url(#${idK}m${i})">${padraoKit(kit, g)}</g>`);
    if (g.bracos[i].lado === 1) partes.push(sombraLado(md, g.bracos[i].S[0] - 4));
    const b = g.bracos[i], fim = longa ? [b.W[0], b.W[1] - 4] as P : lerp(b.S, b.E, 0.64);
    if (jogo || v.casual === "moletom") partes.push(`<path d="${membro([[...lerp(longa ? b.E : b.S, fim, 0.86), g.braco + (longa ? 4 : 8) + folga] as [number, number, number], [fim[0], fim[1], g.braco * (longa ? 0.66 : 0.9) + 6 + folga]], false)}" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="1.6"/>`);
  }
  const tronco = regata ? `M126 232 C120 250 ${150 - g.ombro + 18} 262 ${150 - g.ombro + 14} 300 C${150 - g.ombro + 14} 356 ${150 - g.cintura - 2} 392 ${150 - g.cintura} ${camisa.bainha} Q150 ${camisa.bainha + 6} ${150 + g.cintura} ${camisa.bainha} C${150 + g.cintura + 2} 392 ${150 + g.ombro - 14} 356 ${150 + g.ombro - 14} 300 C${150 + g.ombro - 18} 262 180 250 174 232 Q150 246 126 232 Z` : camisa.d;
  partes.push(`<clipPath id="${idK}t"><path d="${tronco}"/></clipPath>`, contorno(tronco, camisaCor));
  if (jogo) partes.push(`<g clip-path="url(#${idK}t)">${padraoKit(kit, g)}</g>`);
  partes.push(sombraLado(tronco, 150 + g.ombro * 0.36));
  // gola e detalhes
  if (jogo) {
    partes.push(`<path d="M122 230 L150 264 L178 230 L171 233 L150 254 L129 233 Z" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`);
    const ex = 150 + g.ombro * 0.42, ey = 296;
    partes.push(`<path d="M${ex - 9} ${ey - 10} H${ex + 9} V${ey} Q${ex + 9} ${ey + 8} ${ex} ${ey + 12} Q${ex - 9} ${ey + 8} ${ex - 9} ${ey} Z" fill="${kit.cor2}" stroke="${TINTA}" stroke-width="1.4"/><path d="M${ex - 9} ${ey - 3} H${ex + 9} V${ey + 2} H${ex - 9} Z" fill="${kit.cor1}" opacity=".9"/>`);
  } else if (v.casual === "social") {
    partes.push(`<path d="M124 228 L150 248 L138 262 L116 236 Z M176 228 L150 248 L162 262 L184 236 Z" fill="${mistura(camisaCor, "#000000", 0.08)}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M150 248 V${camisa.bainha}" stroke="${TINTA}" stroke-width="1.3"/>${[272, 300, 328, 356, 384].map((y) => `<circle cx="154" cy="${y}" r="2" fill="${escurecer(camisaCor, 0.6)}"/>`).join("")}`);
  } else if (v.casual === "jaqueta") {
    partes.push(`<path d="M128 236 L150 258 L172 236 L178 ${camisa.bainha} L122 ${camisa.bainha} Z" fill="${corCasual}" stroke="${TINTA}" stroke-width="1.8"/><path d="M120 232 L142 268 L128 282 L104 244 Z M180 232 L158 268 L172 282 L196 244 Z" fill="#3B5680" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M${150 - g.ombro + 18} 330 H${150 - g.ombro + 44} M${150 + g.ombro - 44} 330 H${150 + g.ombro - 18}" stroke="#E2B36A" stroke-width="1.6" stroke-dasharray="4 3"/>`);
  } else if (v.casual === "moletom") {
    partes.push(`<path d="M116 232 C112 216 130 208 150 208 C170 208 188 216 184 232 C172 226 128 226 116 232 Z" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="2"/><path d="M${150 - g.cintura + 8} 372 H${150 + g.cintura - 8} L${150 + g.cintura - 16} 412 H${150 - g.cintura + 16} Z" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="1.6"/><path d="M140 240 L139 272 M160 240 L161 272" stroke="${mistura(camisaCor, "#FFFFFF", 0.5)}" stroke-width="2.4" stroke-linecap="round"/>`);
  } else {
    partes.push(`<path d="M122 230 Q150 250 178 230" stroke="${camisaCor2}" stroke-width="5" fill="none"/><path d="M122 230 Q150 250 178 230" stroke="${TINTA}" stroke-width="1.4" fill="none"/>`);
  }
  const alt = g.altura;
  return `<svg viewBox="0 0 300 ${alt}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jogador de corpo inteiro">${o.fundo ?? ""}${partes.join("")}</svg>`;
}
