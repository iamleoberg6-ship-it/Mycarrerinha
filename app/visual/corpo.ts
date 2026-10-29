// O jogador de corpo inteiro, no mesmo traço da foto (contorno preto, sombra chapada à direita).
// A cabeça vem da foto (svgFoto com soCabeca); o resto é desenhado aqui: físico, uniforme do clube (manga curta ou
// longa, justo ou largo, meião alto ou baixo, chuteira do patrocinador), roupa do dia a dia e tatuagens.
import { fonteCamisa, attrFonte } from "./fontes-camisa";
import { svgFoto, foneNoPescoco, PELES, CORES_ROUPA, escurecer, luminancia, type Aparencia } from "../criacao/avatar";
import type { Visual, AreaTatuagem } from "../../src/visual";
import { tatuagemVisivel } from "../../src/visual";
import { corpoEscudo } from "./escudos";

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
// Proporção de figurinha: cabeça grande, corpo atlético em V. Tudo em torno do eixo x = 150.
const FISICO = {
  magro: { ombro: 80, peito: 66, cintura: 54, quadril: 58, braco: 29, antebraco: 25, coxa: 44, panturrilha: 32 },
  atletico: { ombro: 88, peito: 74, cintura: 58, quadril: 62, braco: 34, antebraco: 29, coxa: 50, panturrilha: 36 },
  forte: { ombro: 96, peito: 82, cintura: 64, quadril: 66, braco: 40, antebraco: 33, coxa: 56, panturrilha: 40 },
};
type F = (typeof FISICO)["atletico"];
interface Braco { J: P; E: P; W: P; lado: -1 | 1 }
interface Perna { H: P; K: P; A: P; lado: -1 | 1 }
interface Geo extends F { bracos: Braco[]; pernas: Perna[]; bainha: number; altura: number }
function geometria(v: Visual, alturaCm: number): Geo {
  const f = FISICO[v.fisico] ?? FISICO.atletico, e = Math.max(-14, Math.min(14, (alturaCm - 178) * 0.8));
  const bracos = ([-1, 1] as const).map((lado) => ({ lado, J: [150 + lado * (f.ombro - f.braco * 0.5), 274] as P, E: [150 + lado * (f.ombro - f.braco * 0.28 + 7), 370] as P, W: [150 + lado * (f.ombro - f.braco * 0.2 + 10), 452] as P }));
  const pernas = ([-1, 1] as const).map((lado) => ({ lado, H: [150 + lado * (f.quadril * 0.5 + 2), 458] as P, K: [150 + lado * (f.quadril * 0.5 + 4), 590 + e * 0.5] as P, A: [150 + lado * (f.quadril * 0.5 + 6), 694 + e] as P }));
  return { ...f, bracos, pernas, bainha: 452, altura: 742 + e };
}
/** Pontos da perna (linha central + largura), da virilha ao tornozelo. */
function pontosPerna(g: Geo, p: Perna, folga = 0): [number, number, number][] {
  const L = (a: P, b: P, t: number, w: number) => [...lerp(a, b, t), w + folga] as [number, number, number];
  return [[p.H[0], p.H[1], g.coxa + folga], L(p.H, p.K, 0.45, g.coxa * 0.94), L(p.H, p.K, 0.85, g.coxa * 0.72), [p.K[0], p.K[1], g.coxa * 0.64 + folga], L(p.K, p.A, 0.3, g.panturrilha), L(p.K, p.A, 0.72, g.panturrilha * 0.72), [p.A[0], p.A[1], g.panturrilha * 0.52 + folga]];
}
/** Largura da perna num ponto t (0 = virilha, 1 = tornozelo) — para meião e calça acompanharem a perna. */
function larguraPerna(g: Geo, t: number): number {
  const pts: [number, number][] = [[0, g.coxa], [0.25, g.coxa * 0.94], [0.47, g.coxa * 0.72], [0.53, g.coxa * 0.64], [0.68, g.panturrilha], [0.87, g.panturrilha * 0.72], [1, g.panturrilha * 0.52]];
  for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [t0, w0] = pts[i - 1], [t1, w1] = pts[i]; return w0 + ((w1 - w0) * (t - t0)) / (t1 - t0); }
  return pts[pts.length - 1][1];
}
const pontoPerna = (p: Perna, t: number): P => (t <= 0.53 ? lerp(p.H, p.K, t / 0.53) : lerp(p.K, p.A, (t - 0.53) / 0.47));

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
    case "leao": return `<path d="${Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8, r = i % 2 ? 9 : 13; return `${i ? "L" : "M"}${f1(Math.cos(a) * r)} ${f1(Math.sin(a) * r)}`; }).join(" ")} Z" fill="${TINTA_TAT}" fill-opacity=".8"/><circle r="7" fill="#C98C63" stroke="${TINTA_TAT}" stroke-width="1.2"/><circle cx="-2.6" cy="-1.5" r="1" fill="${TINTA_TAT}"/><circle cx="2.6" cy="-1.5" r="1" fill="${TINTA_TAT}"/><path d="M-2 2 L0 4 L2 2 M0 4 V5.5" ${t} stroke-width="1.1"/>`;
    case "cruz": return `<path d="M0 -15 V15 M-7 -6 H7" ${t} stroke-width="2.6"/><path d="M-9 -12 L-12 -15 M9 -12 L12 -15 M-11 0 L-15 0 M11 0 L15 0" ${t} stroke-width="1"/>`;
    case "mae": return `<text x="0" y="-4" transform="rotate(90)" text-anchor="middle" dominant-baseline="middle" font-family="'Brush Script MT','Segoe Script',cursive" font-style="italic" font-size="12" fill="${TINTA_TAT}">Mãe</text><path d="M0 16 C-6 11 -5 7 -2.4 7 C-1 7 0 8.4 0 9.4 C0 8.4 1 7 2.4 7 C5 7 6 11 0 16 Z" fill="#B3263A" stroke="${TINTA_TAT}" stroke-width="1"/>`;
    case "mandala": return `<circle r="11" ${t} stroke-width="1.3"/><circle r="6.5" ${t} stroke-width="1.2"/><circle r="2" fill="${TINTA_TAT}"/>${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<circle cx="${f1(Math.cos(a) * 8.8)}" cy="${f1(Math.sin(a) * 8.8)}" r="1" fill="${TINTA_TAT}"/><path d="M${f1(Math.cos(a) * 11)} ${f1(Math.sin(a) * 11)} L${f1(Math.cos(a) * 14)} ${f1(Math.sin(a) * 14)}" ${t} stroke-width="1"/>`; }).join("")}`;
    case "relogio": return `<circle cy="-8" r="9" fill="#FFFFFF" fill-opacity=".15" stroke="${TINTA_TAT}" stroke-width="1.5"/><path d="M0 -8 V-14 M0 -8 L4 -6" ${t} stroke-width="1.3"/><path d="M0 4 Q-2 14 1 22" ${t}/><circle cy="6" r="5" fill="#B3263A" stroke="${TINTA_TAT}" stroke-width="1.1"/>`;
    case "trofeu": return `<path d="M-8 -14 H8 V-6 Q8 4 0 5 Q-8 4 -8 -6 Z" fill="${TINTA_TAT}" fill-opacity=".85"/><path d="M-8 -11 Q-14 -11 -12 -4 Q-10 0 -7 -1 M8 -11 Q14 -11 12 -4 Q10 0 7 -1" ${t} stroke-width="1.3"/><path d="M0 5 V11 M-6 12 H6 M-7 15 H7" ${t} stroke-width="2"/>`;
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
export interface Kit { numeroCor?: string; cor1: string; cor2: string; /** três faixas (tresFaixasH), de cima para baixo */ faixas?: string[]; /** escudo do clube no peito: o mesmo das listas (cores das listas, quando o uniforme usa outras) */ escudo?: { chave: string; nome?: string; cores?: [string, string] }; /** cor do calção, quando o uniforme real não usa a cor 2 */ calcao?: string; /** cor da meia, quando o uniforme real não usa a cor 1 */ meiao?: string; padrao: string; numero: string; /** clube (id): fonte do número */ fonte?: string; chuteira?: [string, string]; marcaChuteira?: { simbolo: string; cor: string } }
/** A marca na lateral da chuteira (ou do tênis): o símbolo da marca de material esportivo. */
function marcaNoCalcado(x: number, y: number, l: number, simbolo: string, cor: string): string {
  const t = (d: string, w = 2.2) => `<path d="${d}" stroke="${cor}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const cx = x - 4 * l, cy = y + 9;
  switch (simbolo) {
    case "chama": return t(`M${cx - 9 * l} ${cy + 4} Q${cx} ${cy + 6} ${cx + 8 * l} ${cy - 4} Q${cx + 2 * l} ${cy + 2} ${cx - 9 * l} ${cy + 4}`, 2.4);
    case "pontos": return [0, 1, 2].map((i) => t(`M${cx - 6 * l + i * 4.5 * l} ${cy + 6} L${cx - 2 * l + i * 4.5 * l} ${cy - 4}`, 2.2)).join("");
    case "raio": return t(`M${cx - 8 * l} ${cy + 5} Q${cx - 2 * l} ${cy - 5} ${cx + 8 * l} ${cy - 3}`, 3);
    case "guardaChuva": return `<path d="M${cx - 7 * l} ${cy} L${cx - 3.5 * l} ${cy - 4} L${cx} ${cy} L${cx - 3.5 * l} ${cy + 4} Z M${cx} ${cy} L${cx + 3.5 * l} ${cy - 4} L${cx + 7 * l} ${cy} L${cx + 3.5 * l} ${cy + 4} Z" fill="${cor}"/>`;
    case "balanca": return `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="Arial Black, sans-serif" font-weight="900" font-size="12" fill="${cor}">N</text>`;
    case "onda": return t(`M${cx - 9 * l} ${cy + 2} Q${cx - 4 * l} ${cy - 5} ${cx} ${cy + 1} T${cx + 9 * l} ${cy}`, 2.4);
    case "estrela": return `<path d="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 2.3 : 5.2; return `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`; }).join(" ")}Z" fill="${cor}"/>`;
    case "escudo": return `<path d="M${cx - 4} ${cy - 5} H${cx + 4} V${cy} Q${cx + 4} ${cy + 4} ${cx} ${cy + 6} Q${cx - 4} ${cy + 4} ${cx - 4} ${cy} Z" fill="${cor}"/>`;
    case "letra": return t(`M${cx - 6 * l} ${cy + 5} L${cx} ${cy - 5} L${cx + 6 * l} ${cy + 5}`, 2.6);
    case "asa": return [0, 1].map((i) => t(`M${cx - 7 * l + i * 6 * l} ${cy + 5} L${cx - 3 * l + i * 6 * l} ${cy - 3} L${cx + 1 * l + i * 6 * l} ${cy + 5}`, 2)).join("");
    case "garra": return [0, 1, 2].map((i) => t(`M${cx - 5 * l + i * 4 * l} ${cy - 5} Q${cx - 7 * l + i * 4 * l} ${cy} ${cx - 4 * l + i * 4 * l} ${cy + 6}`, 1.8)).join("");
    default: return "";
  }
}
function padraoKit(k: Kit, g: Geo): string {
  const c2 = k.cor2, x0 = 150 - g.ombro - 60, x1 = 150 + g.ombro + 60;
  switch (k.padrao) {
    case "listrasV": return Array.from({ length: 14 }, (_, i) => `<rect x="${x0 + i * 22}" y="220" width="11" height="280" fill="${c2}"/>`).join("");
    case "listrasH": return Array.from({ length: 11 }, (_, i) => `<rect x="${x0}" y="${250 + i * 22}" width="${x1 - x0}" height="11" fill="${c2}"/>`).join("");
    // metade: o lado direito na cor 2 (Dragão Goiano: vermelho e preto divididos ao meio)
    case "metade": return `<rect x="150" y="220" width="${x1 - 150}" height="280" fill="${c2}"/>`;
    // três faixas, cada uma numa cor (Quadricolor do Vale)
    case "tresFaixasH": return (k.faixas ?? [c2]).map((cor, i) => `<rect x="${x0}" y="${316 + i * 22}" width="${x1 - x0}" height="14" fill="${cor}"/>`).join("");
    // duas listras na cor 2 atravessando o meio do uniforme (Coritibano: branco com listras verdes)
    case "duasFaixasH": return `<rect x="${x0}" y="326" width="${x1 - x0}" height="14" fill="${c2}"/><rect x="${x0}" y="350" width="${x1 - x0}" height="14" fill="${c2}"/>`;
    // listras grossas: faixas largas na cor 2 sobre a cor 1 (Fortaleza: azul com vermelho)
    case "listrasHG": return Array.from({ length: 5 }, (_, i) => `<rect x="${x0}" y="${236 + i * 56}" width="${x1 - x0}" height="28" fill="${c2}"/>`).join("");
    case "diagonais": return [0, 1, 2].map((i) => `<path d="M${x0} ${262 + i * 70 + 60} L${x1} ${262 + i * 70 - 40} L${x1} ${262 + i * 70 - 16} L${x0} ${262 + i * 70 + 84} Z" fill="${c2}"/>`).join("");
    case "faixa": return `<path d="M${150 - g.ombro + 4} 252 L${150 - g.ombro + 34} 246 L${150 + g.quadril + 34} 480 L${150 + g.quadril + 4} 480 Z" fill="${c2}"/>`;
    case "faixaH": return `<rect x="${x0}" y="318" width="${x1 - x0}" height="28" fill="${c2}"/>`;
    default: return "";
  }
}
/** Tronco da camisa: ombros caídos, peito largo e cintura mais fina; larga = mais pano e bainha mais baixa. */
function troncoCamisa(g: Geo, largo: boolean): { d: string; bainha: number } {
  const k = largo ? 8 : 0, o = g.ombro + k * 0.5, pe = g.peito + k, ci = g.cintura + k + (largo ? 6 : 0), q = g.quadril + k, b = g.bainha + (largo ? 16 : 0);
  const lado = (s: -1 | 1) => ({ ombro: [150 + s * (o - 6), 256], axila: [150 + s * pe, 316], cint: [150 + s * (ci + 2), 410], bainha: [150 + s * (q - 2), b] });
  const E = lado(-1), D = lado(1);
  const d = `M124 231 C112 238 ${150 - o + 30} 242 ${E.ombro[0]} ${E.ombro[1]} Q${150 - o - 4} 270 ${E.axila[0]} ${E.axila[1]} C${E.axila[0] + 2} 352 ${E.cint[0] - 2} 380 ${E.cint[0]} ${E.cint[1]} Q${E.bainha[0] + 2} ${b - 24} ${E.bainha[0]} ${b} Q150 ${b + 7} ${D.bainha[0]} ${b} Q${D.bainha[0] - 2} ${b - 24} ${D.cint[0]} ${D.cint[1]} C${D.cint[0] + 2} 380 ${D.axila[0] - 2} 352 ${D.axila[0]} ${D.axila[1]} Q${150 + o + 4} 270 ${D.ombro[0]} ${D.ombro[1]} C${150 + o - 30} 242 188 238 176 231 Q150 247 124 231 Z`;
  return { d, bainha: b };
}
/** Regata: alças largas sobre os ombros, cava funda e o corpo com a mesma largura da camiseta (cobre o tronco todo). */
function regataPath(g: Geo, largo: boolean): string {
  const k = largo ? 8 : 0, o = g.ombro + k * 0.5, pe = g.peito + k, ci = g.cintura + k + (largo ? 6 : 0), q = g.quadril + k, b = g.bainha + (largo ? 16 : 0);
  // alça larga (uns 3 dedos) e cava mais rasa: a regata segura o ombro em vez de virar um fio
  const lado = (s: -1 | 1) => ({ golaF: [150 + s * 19, 235], golaO: [150 + s * 24, 238], cava: [150 + s * Math.max(42, o - 20), 246], axila: [150 + s * (pe - 1), 310], cint: [150 + s * (ci + 2), 410], bainha: [150 + s * (q - 2), b] });
  const E = lado(-1), D = lado(1);
  return `M${E.golaF[0]} ${E.golaF[1]} L${E.golaO[0]} ${E.golaO[1]} L${E.cava[0]} ${E.cava[1]} C${E.cava[0] - 2} 280 ${E.axila[0] + 10} 296 ${E.axila[0]} ${E.axila[1]}`
    + ` C${E.axila[0] + 2} 352 ${E.cint[0] - 2} 380 ${E.cint[0]} ${E.cint[1]} Q${E.bainha[0] + 2} ${b - 24} ${E.bainha[0]} ${b} Q150 ${b + 7} ${D.bainha[0]} ${b} Q${D.bainha[0] - 2} ${b - 24} ${D.cint[0]} ${D.cint[1]}`
    + ` C${D.cint[0] + 2} 380 ${D.axila[0] - 2} 352 ${D.axila[0]} ${D.axila[1]} C${D.axila[0] - 10} 296 ${D.cava[0] + 2} 280 ${D.cava[0]} ${D.cava[1]} L${D.golaO[0]} ${D.golaO[1]} L${D.golaF[0]} ${D.golaF[1]}`
    + ` Q150 268 ${E.golaF[0]} ${E.golaF[1]} Z`;
}
/** Normal de um segmento apontando para fora do corpo. */
function normalFora(a: P, b: P, lado: -1 | 1): P {
  const dx = b[0] - a[0], dy = b[1] - a[1], n = Math.hypot(dx, dy) || 1;
  let nx = -dy / n, ny = dx / n;
  if (Math.sign(nx) !== lado) { nx = -nx; ny = -ny; }
  return [nx, ny];
}
const mais = (p: P, n: P, k: number): P => [p[0] + n[0] * k, p[1] + n[1] * k];
/** Manga: nasce no ombro e segue o braço; curta termina no meio do braço, longa no punho. */
function mangaPath(g: Geo, b: Braco, longa: boolean, folga: number): { d: string; punho: [P, P] } {
  const n1 = normalFora(b.J, b.E, b.lado), n2 = normalFora(b.E, b.W, b.lado);
  const topo: P = [150 + b.lado * (g.ombro - 14), 249], ombro: P = [150 + b.lado * (g.ombro + 2), 262], axila: P = [150 + b.lado * (g.peito - 2), 318];
  const wJ = g.braco / 2 + 6 + folga;
  if (!longa) {
    const M = lerp(b.J, b.E, 0.6), wM = g.braco / 2 + 4 + folga;
    const fo = mais(M, n1, wM), fi = mais(M, n1, -wM);
    return { d: `M${f1(topo[0])} ${topo[1]} Q${f1(ombro[0] + b.lado * 4)} ${f1(ombro[1] - 6)} ${f1(mais(b.J, n1, wJ)[0])} ${f1(mais(b.J, n1, wJ)[1])} L${f1(fo[0])} ${f1(fo[1])} L${f1(fi[0])} ${f1(fi[1])} L${f1(axila[0])} ${axila[1]} Z`, punho: [fo, fi] };
  }
  const wE = g.antebraco / 2 + 5 + folga, wW = g.antebraco * 0.36 + 5 + folga;
  const eo = mais(b.E, n1, wE), ei = mais(b.E, n1, -wE), wo = mais(b.W, n2, wW), wi = mais(b.W, n2, -wW);
  return { d: `M${f1(topo[0])} ${topo[1]} Q${f1(ombro[0] + b.lado * 4)} ${f1(ombro[1] - 6)} ${f1(mais(b.J, n1, wJ)[0])} ${f1(mais(b.J, n1, wJ)[1])} Q${f1(eo[0] + b.lado * 2)} ${f1(eo[1])} ${f1(wo[0])} ${f1(wo[1])} L${f1(wi[0])} ${f1(wi[1])} Q${f1(ei[0])} ${f1(ei[1])} ${f1(axila[0])} ${axila[1]} Z`, punho: [wo, wi] };
}
function bracoPath(g: Geo, b: Braco): string {
  return membro([[b.J[0], b.J[1] - 6, g.braco * 1.05], [...lerp(b.J, b.E, 0.45), g.braco] as [number, number, number], [b.E[0], b.E[1], g.antebraco * 0.98], [...lerp(b.E, b.W, 0.35), g.antebraco] as [number, number, number], [b.W[0], b.W[1], g.antebraco * 0.7]]);
}
function antebracoPath(g: Geo, b: Braco): string {
  return membro([[b.E[0], b.E[1], g.antebraco * 0.98], [...lerp(b.E, b.W, 0.35), g.antebraco] as [number, number, number], [b.W[0], b.W[1], g.antebraco * 0.7]]);
}
/** Mão relaxada ao lado do corpo, com o polegar para dentro. */
function mao(b: Braco, g: Geo, pele: string, sombra: string): string {
  const a = ang(b.E, b.W) - 90, hw = g.antebraco * 0.42, L = g.antebraco * 1.25, dentro = -b.lado;
  const corpo = `M${f1(-hw)} 0 C${f1(-hw - 3)} ${f1(L * 0.45)} ${f1(-hw + 1)} ${f1(L * 0.9)} 0 ${f1(L)} C${f1(hw - 1)} ${f1(L * 0.9)} ${f1(hw + 3)} ${f1(L * 0.45)} ${f1(hw)} 0 Z`;
  const polegar = `M${f1(dentro * hw * 0.85)} ${f1(L * 0.12)} Q${f1(dentro * (hw + 8))} ${f1(L * 0.4)} ${f1(dentro * hw * 0.45)} ${f1(L * 0.62)}`;
  return `<g transform="translate(${f1(b.W[0])} ${f1(b.W[1] - 2)}) rotate(${f1(a)})"><path d="${corpo}" fill="${b.lado === 1 ? sombra : pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>
    <path d="${polegar}" fill="${b.lado === 1 ? sombra : pele}" stroke="${TINTA}" stroke-width="2" stroke-linecap="round"/>
    <path d="M${f1(-hw * 0.3)} ${f1(L * 0.62)} V${f1(L * 0.9)} M${f1(hw * 0.25)} ${f1(L * 0.62)} V${f1(L * 0.92)}" stroke="${TINTA}" stroke-width="1.1" opacity=".45"/></g>`;
}
function pernaPath(g: Geo, p: Perna, ate = 1): string {
  const pts = pontosPerna(g, p);
  return membro(ate >= 1 ? pts : pts.slice(0, 4));
}
/** Tubo que cobre a perna entre t0 e t1 (meião, calça), acompanhando a largura. */
function tuboPerna(g: Geo, p: Perna, t0: number, t1: number, folga: number, ponta = false): string {
  const ts = [t0, ...[0.25, 0.47, 0.53, 0.68, 0.87].filter((t) => t > t0 && t < t1), t1];
  return membro(ts.map((t) => [...pontoPerna(p, t), larguraPerna(g, t) + folga] as [number, number, number]), ponta);
}
function calcado(p: Perna, cor: string, detalhe: string, chuteira: boolean, marca?: { simbolo: string; cor: string }): string {
  const [x, y] = p.A, l = -p.lado;
  // visto de frente: o pé aponta para baixo e um pouco para fora
  const d = `M${x - 12 * l} ${y - 8} L${x + 13 * l} ${y - 8} Q${x + 17 * l} ${y + 8} ${x + 15 * l} ${y + 20} Q${x + 8 * l} ${y + 26} ${x - 6 * l} ${y + 25} L${x - 20 * l} ${y + 24} Q${x - 31 * l} ${y + 22} ${x - 28 * l} ${y + 13} Q${x - 22 * l} ${y + 3} ${x - 12 * l} ${y - 8} Z`;
  return `${contorno(d, cor)}<path d="M${x + 11 * l} ${y - 2} Q${x - 2 * l} ${y + 12} ${x - 22 * l} ${y + 14}" stroke="${detalhe}" stroke-width="3.6" fill="none" stroke-linecap="round"/>
    <path d="M${x + 15 * l} ${y + 20} Q${x + 8 * l} ${y + 26} ${x - 6 * l} ${y + 25} L${x - 20 * l} ${y + 24} Q${x - 31 * l} ${y + 22} ${x - 29 * l} ${y + 17}" stroke="${chuteira ? "#E9E4D8" : "#F7F5EF"}" stroke-width="${chuteira ? 2.6 : 5}" fill="none"/>
    ${chuteira ? [-18, -6, 6].map((dx) => `<rect x="${x + dx * l - 2}" y="${y + 24}" width="4.5" height="5" rx="1.2" fill="#2A2A2A"/>`).join("") : `<path d="M${x - 2 * l} ${y - 4} L${x + 8 * l} ${y + 2} M${x - 6 * l} ${y} L${x + 4 * l} ${y + 6}" stroke="${detalhe}" stroke-width="1.4"/>`}${marca ? marcaNoCalcado(x, y, l, marca.simbolo, marca.cor) : ""}`;
}
function shortsPath(g: Geo, largo: boolean, bainhaCamisa: number): { d: string; barra: number } {
  const q = g.quadril + (largo ? 10 : 4), barra = largo ? 540 : 524, cintura = bainhaCamisa - 30, abre = largo ? 14 : 8;
  return { barra, d: `M${150 - q} ${cintura} Q${150 - q - abre * 0.4} ${barra - 40} ${150 - q - abre} ${barra} Q${150 - q * 0.5} ${barra + 6} ${148} ${barra + 2} L150 ${barra - 30} L152 ${barra + 2} Q${150 + q * 0.5} ${barra + 6} ${150 + q + abre} ${barra} Q${150 + q + abre * 0.4} ${barra - 40} ${150 + q} ${cintura} Z` };
}
let gradSeq = 0;
/** Sombra suave do lado direito da peça (degradê, sem corte duro no meio). */
function sombraLado(d: string, x0: number, x1: number, forca = 0.28): string {
  const id = `sl${(gradSeq++).toString(36)}`;
  return `<defs><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${f1(x0)}" y1="0" x2="${f1(x1)}" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${forca}"/></linearGradient><clipPath id="${id}c"><path d="${d}"/></clipPath></defs><rect x="0" y="0" width="300" height="800" fill="url(#${id}g)" clip-path="url(#${id}c)"/>`;
}
/** Estampa de camisa florida: folhas e flores grandes, na cor de fundo da camisa. */
function florida(fundo: string, x: number, y: number, w: number, h: number): string {
  const folha = mistura(fundo, luminancia(fundo) > 0.5 ? "#2E6B3E" : "#7BC47F", 0.55), flor = luminancia(fundo) > 0.5 ? "#D9483B" : "#F2C14E";
  let out = "";
  for (let i = 0; i < 14; i++) {
    const cx = x + ((i * 37) % 97) / 97 * w, cy = y + ((i * 53) % 89) / 89 * h;
    out += i % 2
      ? `<path d="M${f1(cx)} ${f1(cy)} q8 -10 18 -4 q-8 10 -18 4 Z" fill="${folha}" stroke="${TINTA}" stroke-width=".8"/>`
      : `<g transform="translate(${f1(cx)} ${f1(cy)})">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="3.4" ry="6" transform="rotate(${a}) translate(0 -5)" fill="${flor}" stroke="${TINTA}" stroke-width=".7"/>`).join("")}<circle r="2" fill="#FFF4C2"/></g>`;
  }
  return out;
}
// ------------------------------------------------------------------ montagem
export interface OpcoesCorpo { aparencia: Partial<Aparencia> | null; visual: Visual; alturaCm?: number; traje: "jogo" | "casual"; kit?: Kit; fundo?: string;
  /** relógio de patrocinador (fora de campo, pulso esquerdo) */
  relogio?: { pulseira: string; mostrador: string } | null }
export function svgCorpo(o: OpcoesCorpo): string {
  // blusão de patrocinador: fora de campo vira o moletom, nas cores da marca, com o símbolo no peito
  const blusao = o.traje === "casual" ? o.aparencia?.blusaoPatro ?? null : null;
  const ap = o.aparencia ?? {}, v = blusao ? { ...o.visual, casual: "moletom" as const } : o.visual, g = geometria(v, o.alturaCm ?? 178);
  const pele = PELES[ap.pele ?? 3], sombraPele = mistura(pele, "#2A1206", 0.28);
  const kit = o.kit ?? { cor1: "#C8102E", cor2: "#FFFFFF", padrao: "lisa", numero: "10" };
  const jogo = o.traje === "jogo";
  const largo = jogo ? v.caimento === "largo" : v.casual === "moletom";
  const corCasual = blusao ? blusao.cor : CORES_ROUPA[v.corCasual] ?? CORES_ROUPA[1];
  const camisaCor = jogo ? kit.cor1 : v.casual === "jaqueta" ? "#4F6E9C" : corCasual;
  const camisaCor2 = jogo ? kit.cor2 : escurecer(camisaCor, 0.78);
  const claroDemais = (c: string) => luz(c) > 0.86;
  const tat = v.tatuagens;
  const vis = (a: AreaTatuagem) => !!tat[a] && tatuagemVisivel(a, v, o.traje);
  const partes: string[] = [`<ellipse cx="150" cy="${g.pernas[0].A[1] + 26}" rx="${g.ombro + 10}" ry="9" fill="#000" opacity=".22"/>`];
  const camisa = troncoCamisa(g, largo);
  const pernaComprida = !jogo && v.perna === "calca";

  // 1. pernas, meiões e calçados
  for (const p of g.pernas) {
    if (!pernaComprida) {
      const d = pernaPath(g, p);
      partes.push(contorno(d, pele), sombraLado(d, p.H[0] - g.coxa * 0.1, p.H[0] + g.coxa * 0.55, p.lado === 1 ? 0.34 : 0.18));
      const area: AreaTatuagem = p.lado === -1 ? "pernaE" : "pernaD";
      if (vis(area)) {
        const c = pontoPerna(p, 0.38);
        partes.push(tat[area] === "fechada" ? fechamento(pernaPath(g, p, 0), c[0], c[1], 90) : `<g transform="translate(${f1(c[0])} ${f1(c[1])}) rotate(${f1(ang(p.H, p.K) - 90)}) scale(${f1(g.coxa / 40)})">${desenhoTatuagem(tat[area]!)}</g>`);
      }
      // joelho
      partes.push(`<path d="M${f1(p.K[0] - 8)} ${f1(p.K[1] + 2)} Q${f1(p.K[0])} ${f1(p.K[1] + 8)} ${f1(p.K[0] + 8)} ${f1(p.K[1] + 2)}" stroke="${TINTA}" stroke-width="1.3" fill="none" opacity=".45"/>`);
    }
    if (jogo) {
      const t0 = v.meiao === "baixo" ? 0.76 : 0.58;
      const md = tuboPerna(g, p, t0, 1, 5);
      const corMeiao = kit.meiao ?? (claroDemais(kit.cor1) ? "#F2F0EA" : kit.cor1);
      partes.push(contorno(md, corMeiao), sombraLado(md, p.A[0] - 6, p.A[0] + g.panturrilha * 0.6, p.lado === 1 ? 0.3 : 0.15));
      const topo = pontoPerna(p, t0 + 0.035), w = larguraPerna(g, t0 + 0.035) / 2 + 2;
      partes.push(`<path d="M${f1(topo[0] - w)} ${f1(topo[1])} L${f1(topo[0] + w)} ${f1(topo[1])}" stroke="${kit.cor2}" stroke-width="5"/>`);
    }
    // chuteira da marca em campo; fora de campo, o tênis também é da marca (menos com roupa social)
    const daMarca = !!kit.marcaChuteira && (jogo || v.casual !== "social");
    const [c1, c2] = jogo ? (kit.chuteira ?? ["#1A1A1A", "#E3B341"]) : v.casual === "social" ? ["#3B2416", "#5A3A26"] : daMarca && kit.chuteira ? [kit.chuteira[0], kit.chuteira[1]] : ["#F7F5EF", "#C8C4BA"];
    partes.push(calcado(p, c1, c2, jogo, daMarca ? kit.marcaChuteira : undefined));
  }

  // 2. calção (jogo) ou bermuda/calça (dia a dia)
  if (jogo) {
    const sh = shortsPath(g, v.caimento === "largo", camisa.bainha);
    const corShort = kit.calcao ?? kit.cor2;
    const listra = luz(corShort) > 0.5 ? kit.cor1 === corShort ? "#1A1A1A" : kit.cor1 : claroDemais(kit.cor1) ? "#F2F0EA" : kit.cor1;
    partes.push(`<clipPath id="shc${gradSeq}"><path d="${sh.d}"/></clipPath>`, contorno(sh.d, corShort));
    const q = g.quadril + (v.caimento === "largo" ? 10 : 4), ab = v.caimento === "largo" ? 14 : 8;
    partes.push(`<g clip-path="url(#shc${gradSeq})"><path d="M${150 - q + 6} ${camisa.bainha - 30} L${150 - q - ab + 8} ${sh.barra + 10} M${150 + q - 6} ${camisa.bainha - 30} L${150 + q + ab - 8} ${sh.barra + 10}" stroke="${listra}" stroke-width="6"/></g>`);
    partes.push(sombraLado(sh.d, 150, 150 + g.quadril + 12, 0.3));
    partes.push(`<path d="M150 ${sh.barra - 30} L150 ${camisa.bainha}" stroke="${TINTA}" stroke-width="1.2" opacity=".35"/>`);
    partes.push(`<text x="${150 - g.quadril * 0.55}" y="${sh.barra - 10}" text-anchor="middle" ${attrFonte(fonteCamisa(kit.fonte ?? `${kit.cor1}${kit.cor2}`), 15)} fill="${kit.numeroCor ?? (luz(corShort) > 0.5 ? "#1A1A1A" : "#F2F0EA")}">${kit.numero}</text>`);
  } else {
    const t1 = v.perna === "calca" ? 0.97 : 0.4, corCalca = v.perna === "calca" ? (v.casual === "social" ? "#2B2F36" : v.casual === "moletom" ? "#7F8389" : "#2E3F5C") : (v.casual === "regata" ? "#4F6E9C" : "#B9A58A");
    const pernas = g.pernas.map((p) => tuboPerna(g, p, 0, t1, v.perna === "calca" ? 8 : 12)).join(" ");
    const pelve = `M${150 - g.quadril + 2} ${camisa.bainha - 30} L${150 + g.quadril - 2} ${camisa.bainha - 30} L${150 + g.quadril + 2} ${camisa.bainha + 22} L150 ${camisa.bainha + 40} L${150 - g.quadril - 2} ${camisa.bainha + 22} Z`;
    const d = `${pernas} ${pelve}`;
    partes.push(`<path d="${d}" fill="${corCalca}"/>`, sombraLado(d, 150, 150 + g.quadril + 20, 0.3));
    for (const p of g.pernas) partes.push(`<path d="${tuboPerna(g, p, 0, t1, v.perna === "calca" ? 8 : 12)}" fill="none" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>`);
    partes.push(`<path d="${pelve}" fill="${corCalca}"/><path d="M150 ${camisa.bainha} L150 ${camisa.bainha + 38}" stroke="${TINTA}" stroke-width="1.4" opacity=".5"/>`);
  }

  // capuz do moletom: deitado atrás do pescoço (o pescoço passa na frente; só as laterais aparecem)
  if (!jogo && v.casual === "moletom") partes.push(`<path d="M108 240 C102 216 124 202 150 202 C176 202 198 216 192 240 Z" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="2.4" stroke-linejoin="round"/><path d="M118 232 C118 218 134 210 150 210 C166 210 182 218 182 232" fill="none" stroke="${TINTA}" stroke-width="1.2" opacity=".45"/>`);
  // 3. cabeça (com pescoço e tatuagem do pescoço)
  partes.push(svgFoto({ aparencia: { ...(ap as Aparencia) }, soCabeca: true, fora: !jogo, pescoco: vis("pescoco") ? tatuagemPescoco(tat.pescoco) : "" }).replace("<svg ", '<svg x="0" y="0" width="300" height="360" '));

  // 4. braços, tatuagens dos antebraços e mãos
  const regata = !jogo && v.casual === "regata";
  for (const b of g.bracos) {
    const d = bracoPath(g, b);
    partes.push(contorno(d, pele), sombraLado(d, b.E[0] - g.braco * 0.1, b.E[0] + g.braco * 0.55, b.lado === 1 ? 0.34 : 0.18));
    const area: AreaTatuagem = b.lado === -1 ? "antebracoE" : "antebracoD";
    if (vis(area)) {
      const c = lerp(b.E, b.W, 0.45);
      partes.push(tat[area] === "fechada" ? fechamento(antebracoPath(g, b), c[0], c[1], 90) : `<g transform="translate(${f1(c[0])} ${f1(c[1])}) rotate(${f1(ang(b.E, b.W) - 90)}) scale(${f1(g.antebraco / 28)})">${desenhoTatuagem(tat[area]!)}</g>`);
    }
    partes.push(`<path d="M${f1(b.E[0] - b.lado * 7)} ${f1(b.E[1] - 2)} Q${f1(b.E[0])} ${f1(b.E[1] + 4)} ${f1(b.E[0] + b.lado * 5)} ${f1(b.E[1] - 5)}" stroke="${TINTA}" stroke-width="1.2" fill="none" opacity=".45"/>`);
    partes.push(mao(b, g, pele, sombraPele));
  }

  // regata: ombros e peito de pele por cima do começo dos braços (liga braço e tronco), antes da regata
  if (regata) {
    const ombros = troncoCamisa(g, false).d;
    partes.push(contorno(ombros, pele), sombraLado(ombros, 150 + g.peito * 0.15, 150 + g.ombro, 0.3));
    for (const b of g.bracos) partes.push(`<path d="M${f1(150 + b.lado * (g.peito - 4))} 300 Q${f1(150 + b.lado * (g.peito - 2))} 322 ${f1(150 + b.lado * (g.peito - 8))} 336" stroke="${TINTA}" stroke-width="1.3" fill="none" opacity=".45"/>`);
  }
  // 5. camisa: mangas e tronco
  const idK = `kt${gradSeq++}`;
  const longa = jogo ? v.manga === "longa" : ["moletom", "social", "jaqueta", "agasalho"].includes(v.casual);
  const folga = largo ? 5 : 0;
  const corManga = jogo && kit.padrao === "centro" ? kit.cor2 : camisaCor;
  if (!regata) g.bracos.forEach((b, i) => {
    const m = mangaPath(g, b, longa, folga);
    partes.push(`<clipPath id="${idK}m${i}"><path d="${m.d}"/></clipPath>`, contorno(m.d, corManga));
    if (jogo && ["listrasV", "listrasH", "listrasHG"].includes(kit.padrao)) partes.push(`<g clip-path="url(#${idK}m${i})">${padraoKit(kit, g)}</g>`);
    partes.push(sombraLado(m.d, b.J[0] - b.lado * 8, b.J[0] + g.braco * 0.7, b.lado === 1 ? 0.32 : 0.14));
    // punho/barra da manga
    if (!jogo && v.casual === "agasalho") partes.push(`<g clip-path="url(#${idK}m${i})"><path d="M${f1(b.J[0] + b.lado * 4)} 250 L${f1(b.E[0] + b.lado * (g.antebraco / 2 + 2))} ${f1(b.E[1])} L${f1(b.W[0] + b.lado * (g.antebraco * 0.36 + 2))} ${f1(b.W[1])}" stroke="#F2F0EA" stroke-width="3.2" fill="none"/><path d="M${f1(b.J[0] + b.lado * 10)} 252 L${f1(b.E[0] + b.lado * (g.antebraco / 2 + 7))} ${f1(b.E[1])} L${f1(b.W[0] + b.lado * (g.antebraco * 0.36 + 7))} ${f1(b.W[1])}" stroke="#F2F0EA" stroke-width="3.2" fill="none"/></g>`);
    if (!jogo && v.casual === "florida") partes.push(`<g clip-path="url(#${idK}m${i})">${florida(camisaCor, b.J[0] - 30, 240, 70, 100)}</g>`);
    if (jogo || ["moletom", "social", "agasalho"].includes(v.casual)) {
      const [fo, fi] = m.punho, n = normalFora(longa ? b.E : b.J, longa ? b.W : b.E, b.lado);
      const dx = (longa ? b.W[0] - b.E[0] : b.E[0] - b.J[0]), dy = (longa ? b.W[1] - b.E[1] : b.E[1] - b.J[1]), L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, k = longa ? 9 : 6;
      void n;
      partes.push(`<path d="M${f1(fo[0])} ${f1(fo[1])} L${f1(fi[0])} ${f1(fi[1])} L${f1(fi[0] - ux * k)} ${f1(fi[1] - uy * k)} L${f1(fo[0] - ux * k)} ${f1(fo[1] - uy * k)} Z" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="1.6" stroke-linejoin="round"/>`);
    }
  });
  // munhequeira (em campo) e relógio de patrocinador (fora)
  const pulso = (b: Braco, conteudo: (hw: number) => string) => {
    const c = lerp(b.E, b.W, 0.86), hw = g.antebraco * 0.4 + 3.5;
    return `<g transform="translate(${f1(c[0])} ${f1(c[1])}) rotate(${f1(ang(b.E, b.W) - 90)})">${conteudo(hw)}</g>`;
  };
  if (jogo && v.munhequeira && v.munhequeira !== "nenhuma") {
    const cm = (v.corMunhequeira ?? -1) < 0 ? kit.cor2 : CORES_ROUPA[v.corMunhequeira!] ?? "#F2F0EA";
    for (const b of g.bracos) if (v.munhequeira === "duas" || b.lado === 1)
      partes.push(pulso(b, (hw) => `<rect x="${f1(-hw)}" y="-7" width="${f1(hw * 2)}" height="14" rx="3" fill="${cm}" stroke="${TINTA}" stroke-width="2"/><path d="M${f1(-hw + 1)} -2.5 H${f1(hw - 1)} M${f1(-hw + 1)} 2.5 H${f1(hw - 1)}" stroke="${escurecer(cm, 0.7)}" stroke-width="1"/>`));
  }
  if (!jogo && o.relogio) {
    const b = g.bracos[0], r = o.relogio;
    partes.push(pulso(b, (hw) => `<rect x="${f1(-hw + 1)}" y="-4" width="${f1(hw * 2 - 2)}" height="8" rx="2" fill="${r.pulseira}" stroke="${TINTA}" stroke-width="1.6"/><circle cx="0" cy="0" r="6.4" fill="${r.mostrador}" stroke="${TINTA}" stroke-width="2"/><path d="M0 0 V-3.6 M0 0 L2.6 1" stroke="${TINTA}" stroke-width="1" stroke-linecap="round"/>`));
  }
  const tronco = regata ? regataPath(g, largo) : camisa.d;
  partes.push(`<clipPath id="${idK}t"><path d="${tronco}"/></clipPath>`, contorno(tronco, camisaCor));
  if (jogo) partes.push(`<g clip-path="url(#${idK}t)">${padraoKit(kit, g)}</g>`);
  if (!jogo && v.casual === "florida") partes.push(`<g clip-path="url(#${idK}t)">${florida(camisaCor, 150 - g.ombro, 230, g.ombro * 2, camisa.bainha - 230)}</g>`);
  partes.push(sombraLado(tronco, 150 + g.peito * 0.15, 150 + g.ombro, 0.3));
  if (regata) {
    // viés: gola e cavas com acabamento, recortado pelo próprio tecido
    const vies = mistura(camisaCor, luminancia(camisaCor) > 0.5 ? "#000000" : "#FFFFFF", 0.25), o = g.ombro, pe = g.peito;
    const cx = Math.max(42, o - 20), cava = (l: number) => `M${150 + l * cx} 246 C${150 + l * (cx - 2)} 280 ${150 + l * (pe - 11)} 296 ${150 + l * (pe - 1)} 310`;
    partes.push(`<g clip-path="url(#${idK}t)" fill="none" stroke="${vies}" stroke-width="4"><path d="M131 235 Q150 268 169 235"/><path d="${cava(-1)}"/><path d="${cava(1)}"/></g>`);
  }
  // dobras do tecido
  partes.push(`<path d="M${150 - g.peito + 8} 330 Q${150 - g.peito + 20} 344 ${150 - g.cintura + 4} 352 M${150 + g.peito - 8} 330 Q${150 + g.peito - 20} 344 ${150 + g.cintura - 4} 352 M${150 - g.cintura + 6} ${camisa.bainha - 14} Q150 ${camisa.bainha - 4} ${150 + g.cintura - 6} ${camisa.bainha - 14}" stroke="${TINTA}" stroke-width="1.2" fill="none" opacity="${largo ? 0.35 : 0.22}"/>`);
  // gola e detalhes
  if (jogo) {
    partes.push(`<path d="M123 230 L150 264 L177 230 L170 233 L150 255 L130 233 Z" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`);
    const ex = 150 + g.peito * 0.48, ey = 300;
    if (kit.escudo) partes.push(`<g transform="translate(${f1(ex - 18.2)} ${f1(ey - 21)}) scale(1.4)">${corpoEscudo(kit.escudo.chave, kit.escudo.cores?.[0] ?? kit.cor1, kit.escudo.cores?.[1] ?? kit.cor2, kit.escudo.nome)}</g>`);
    else partes.push(`<path d="M${ex - 9} ${ey - 10} H${ex + 9} V${ey} Q${ex + 9} ${ey + 8} ${ex} ${ey + 12} Q${ex - 9} ${ey + 8} ${ex - 9} ${ey} Z" fill="${kit.cor2}" stroke="${TINTA}" stroke-width="1.4"/><path d="M${ex - 9} ${ey - 3} H${ex + 9} V${ey + 2} H${ex - 9} Z" fill="${kit.cor1}" opacity=".9"/>`);
  } else if (v.casual === "social") {
    partes.push(`<path d="M124 228 L150 248 L138 262 L116 236 Z M176 228 L150 248 L162 262 L184 236 Z" fill="${mistura(camisaCor, "#000000", 0.08)}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M150 248 V${camisa.bainha}" stroke="${TINTA}" stroke-width="1.3"/>${[272, 302, 332, 362, 392, 422].map((y) => `<circle cx="154" cy="${y}" r="2" fill="${escurecer(camisaCor, 0.6)}"/>`).join("")}`);
  } else if (v.casual === "jaqueta") {
    partes.push(`<path d="M130 236 L150 258 L170 236 L176 ${camisa.bainha} L124 ${camisa.bainha} Z" fill="${corCasual}" stroke="${TINTA}" stroke-width="1.8"/><path d="M120 232 L142 270 L128 284 L104 246 Z M180 232 L158 270 L172 284 L196 246 Z" fill="#3B5680" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M${150 - g.peito + 14} 336 H${150 - g.peito + 42} M${150 + g.peito - 42} 336 H${150 + g.peito - 14}" stroke="#E2B36A" stroke-width="1.6" stroke-dasharray="4 3"/>`);
  } else if (v.casual === "polo") {
    partes.push(`<path d="M122 226 L150 240 L138 256 L112 236 Z M178 226 L150 240 L162 256 L188 236 Z" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M146 240 V286 H154 V240" fill="none" stroke="${TINTA}" stroke-width="1.3"/><circle cx="150" cy="256" r="2" fill="${escurecer(camisaCor, 0.55)}"/><circle cx="150" cy="272" r="2" fill="${escurecer(camisaCor, 0.55)}"/>`);
  } else if (v.casual === "florida") {
    partes.push(`<path d="M124 228 L150 262 L136 270 L114 236 Z M176 228 L150 262 L164 270 L186 236 Z" fill="${camisaCor}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M134 236 L150 262 L166 236 Q150 246 134 236 Z" fill="${pele}"/><path d="M150 262 V${camisa.bainha}" stroke="${TINTA}" stroke-width="1.3"/>`);
  } else if (v.casual === "agasalho") {
    partes.push(`<path d="M122 222 Q150 234 178 222 L180 236 Q150 250 120 236 Z" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M150 244 V${camisa.bainha}" stroke="${TINTA}" stroke-width="2.2"/><path d="M150 244 V${camisa.bainha}" stroke="#C0C3C8" stroke-width="0.9" stroke-dasharray="2 2"/><rect x="147" y="252" width="6" height="10" rx="1.5" fill="#C0C3C8" stroke="${TINTA}" stroke-width="1.2"/><path d="M${150 - g.peito + 12} 300 H${150 - g.peito + 30}" stroke="#F2F0EA" stroke-width="3"/>`);
  } else if (v.casual === "moletom") {
    partes.push(`<path d="M123 230 Q150 250 177 230" stroke="${camisaCor2}" stroke-width="6" fill="none"/><path d="M123 230 Q150 250 177 230" stroke="${TINTA}" stroke-width="1.4" fill="none"/><path d="M${150 - g.cintura + 10} 380 H${150 + g.cintura - 10} L${150 + g.cintura - 18} 420 H${150 - g.cintura + 18} Z" fill="${camisaCor2}" stroke="${TINTA}" stroke-width="1.6"/><path d="M140 240 L139 274 M160 240 L161 274" stroke="${mistura(camisaCor, "#FFFFFF", 0.5)}" stroke-width="2.4" stroke-linecap="round"/>`);
  } else {
    partes.push(`<path d="M123 230 Q150 250 177 230" stroke="${camisaCor2}" stroke-width="5" fill="none"/><path d="M123 230 Q150 250 177 230" stroke="${TINTA}" stroke-width="1.4" fill="none"/>`);
  }
  if (blusao) partes.push(`<path d="M${150 - g.peito + 6} 330 H${150 + g.peito - 6}" stroke="${blusao.detalhe}" stroke-width="5" opacity=".9"/><g transform="translate(${150 + g.peito * 0.3 - 14} 258) scale(.75)">${blusao.logo}</g>`);
  if (!jogo && ap.fone) partes.push(foneNoPescoco(ap.fone.cor, ap.fone.detalhe, 6));
  return `<svg viewBox="0 0 300 ${g.altura}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jogador de corpo inteiro">${o.fundo ?? ""}${partes.join("")}</svg>`;
}
