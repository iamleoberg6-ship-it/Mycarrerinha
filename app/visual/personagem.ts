// O personagem no estilo de arte do jogo: cabeça montada com as peças do kit de rostos (pele em degradê, sem
// contorno) e corpo vetorial no mesmo acabamento. Corpo e cabeça são peças únicas; o cabelo encaixa em qualquer rosto.
// Geometria do corpo: eixo x = 300, chão ≈ 905. Cabeça: sistema do documento do kit, encaixada pelo queixo.
// Mesma lógica de scripts/arte/pecas.py e scripts/arte/jogador.py (as folhas de aprovação saem de lá).
import PECAS from "./arte/pecas.json";
import type { Visual, AreaTatuagem, Fisico, RoupaCasual } from "../../src/visual";
import { tatuagemVisivel } from "../../src/visual";
import { MARCA } from "../../src/marcas";
import { simbolo } from "../jogo/poster";
import { desenhoTatuagem, fechamento } from "./corpo";

type P = [number, number];
const CX = 300;
const f1 = (n: number) => Math.round(n * 10) / 10;
let seq = 0;

// ------------------------------------------------------------------ aparência
export interface Aparencia {
  v: 2; rosto: number; cabelo: number; corCabelo: number; olhos: number; sobrancelha: number; nariz: number; boca: number; tom: number;
  roupaSocial: RoupaCasual; corSocial: number;
}
export const APARENCIA_PADRAO: Aparencia = { v: 2, rosto: 0, cabelo: 0, corCabelo: 0, olhos: 0, sobrancelha: 0, nariz: 0, boca: 0, tom: 3, roupaSocial: "camiseta", corSocial: 1 };

const TONS = PECAS.tons as unknown as Record<string, [string, string]>;
const CORES_CAB = PECAS.coresCabelo as unknown as Record<string, [string, string]>;
export const NOMES_TOM = Object.keys(TONS);
export const AMOSTRAS_TOM = NOMES_TOM.map((t) => mistura(TONS[t][0], TONS[t][1], 0.35));
export const NOMES_COR_CABELO = Object.keys(CORES_CAB);
export const AMOSTRAS_COR_CABELO = NOMES_COR_CABELO.map((c) => mistura(CORES_CAB[c][0], CORES_CAB[c][1], 0.45));
export const NOMES_ROSTO = ["Oval", "Fino", "Marcante", "Delicado", "Arredondado", "Quadrado", "Largo"];
export const NOMES_CABELO = ["Desfiado", "Franja repicada", "Crespo baixo", "Longo", "Cacheado", "Franja de lado", "Tigela", "Raspado", "Careca"];
export const NOMES_OLHOS = ["Castanhos", "Cinzentos", "Azuis", "Azul-claros", "Verde-oliva", "Violeta", "Verdes"];
export const NOMES_SOBRANCELHA = ["Reta", "Arqueada", "Grossa", "Fina", "Angulada", "Suave", "Cheia"];
export const NOMES_NARIZ = ["Reto", "Arredondado", "Largo", "Pequeno", "Fino", "Grande", "Arrebitado"];
export const NOMES_BOCA = ["Sorriso leve", "Sorriso", "Sorrisão", "Dentes à mostra", "Sorriso largo", "Sério", "Rindo"];
export const CORES_CASUAL = ["#F2F0EA", "#1D1F22", "#2E4A7A", "#7A2E3A", "#3E6B4A", "#C9A24D", "#8C8F94", "#E07A3F"];
export const NOMES_CASUAL_COR = ["Branco", "Preto", "Azul-marinho", "Vinho", "Verde", "Mostarda", "Cinza", "Laranja"];

/** Aceita aparências salvas no formato antigo (rosto/cabelo por nome, pele em 8 tons) e devolve o formato novo. */
export function aparenciaDe(x: unknown): Aparencia {
  const a = (x ?? {}) as Record<string, unknown>;
  if (a.v === 2) return { ...APARENCIA_PADRAO, ...(a as Partial<Aparencia>) } as Aparencia;
  const n = (v: unknown, d: number) => (typeof v === "number" && isFinite(v) ? v : d);
  const CAB: Record<string, number> = { careca: 8, raspado: 7, curto: 0, degrade: 0, moicano: 0, topete: 1, franja: 5, ondulado: 4, cacheado: 4, crespo: 2, blackpower: 2, trancas: 2, dreads: 2, coque: 3, longo: 3 };
  const COR = [0, 1, 2, 3, 4, 4, 6, 5, 8, 9];
  const ROUPA: Record<string, RoupaCasual> = { camiseta: "camiseta", moletom: "moletom", polo: "camiseta", jaqueta: "jaqueta", camisa: "social", regata: "regata" };
  return {
    ...APARENCIA_PADRAO,
    tom: Math.min(6, Math.round((n(a.pele, 3) * 6) / 7)),
    cabelo: CAB[String(a.cabelo)] ?? 0, corCabelo: COR[n(a.corCabelo, 0)] ?? 0,
    olhos: [0, 0, 4, 6, 2, 0][n(a.olhos, 0)] ?? 0,
    roupaSocial: ROUPA[String(a.roupaSocial)] ?? "camiseta", corSocial: n(a.corSocial, 1),
  };
}

// ------------------------------------------------------------------ cores
function hex(c: string): [number, number, number] { return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255) as [number, number, number]; }
function cor(r: number, g: number, b: number): string { return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, "0")).join(""); }
function hls(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, l, 0];
  const d = mx - mn, s = l <= 0.5 ? d / (mx + mn) : d / (2 - mx - mn);
  const rc = (mx - r) / d, gc = (mx - g) / d, bc = (mx - b) / d;
  let h = r === mx ? bc - gc : g === mx ? 2 + rc - bc : 4 + gc - rc;
  h = ((h / 6) % 1 + 1) % 1;
  return [h, l, s];
}
function mistura(a: string, b: string, t: number): string {
  const x = hex(a), y = hex(b);
  return cor(...(x.map((v, i) => v + (y[i] - v) * t) as [number, number, number]));
}
const ehPele = (h: number, l: number, s: number) => (h < 0.11 || h > 0.96) && s > 0.25 && l > 0.25 && l < 0.97;
const REF: [string, string] = TONS["padrão"];
const HEX = /#[0-9a-fA-F]{6}\b/g;

/** Leva as cores de pele (claro→escuro de ref) para o tom pedido. */
function recolorirPele(x: string, tom: string, ref: [string, string] | null = null): string {
  const r = ref ?? REF;
  if (tom === "padrão" && r === REF) return x;
  const [c0, c1] = TONS[tom].map(hex), [r0, r1] = r.map(hex);
  const l0 = hls(...r0)[1], l1 = hls(...r1)[1];
  const memo = new Map<string, string>();
  return x.replace(HEX, (m) => {
    const ja = memo.get(m); if (ja) return ja;
    const rgb = hex(m), [h, l, s] = hls(...rgb);
    let out = m;
    if (ehPele(h, l, s)) {
      const t = Math.max(-0.06, Math.min(1.4, (l0 - l) / (l0 - l1)));
      out = cor(...([0, 1, 2].map((i) => {
        const alvo = c0[i] + (c1[i] - c0[i]) * t, base = r0[i] + (r1[i] - r0[i]) * t;
        return alvo + (rgb[i] - base) * 0.6;
      }) as [number, number, number]));
    }
    memo.set(m, out);
    return out;
  });
}
/** Pinta o cabelo (escuro→claro de ref) com a cor pedida; texturas em imagem passam por um filtro de luminância. */
function recolorirCabelo(x: string, nomeCor: string, ref: [string, string], pref: string): string {
  const [d0, d1] = CORES_CAB[nomeCor].map(hex);
  const l0 = hls(...hex(ref[0]))[1], l1 = hls(...hex(ref[1]))[1];
  x = x.replace(HEX, (m) => {
    const l = hls(...hex(m))[1];
    if (l > 0.985) return m;
    const t = Math.max(0, Math.min(1, (l - l0) / Math.max(0.05, l1 - l0)));
    return cor(...([0, 1, 2].map((i) => d0[i] + (d1[i] - d0[i]) * t) as [number, number, number]));
  });
  if (x.includes("<image")) {
    const id = `${pref}fc`, tab = (i: number) => `${d0[i].toFixed(3)} ${d1[i].toFixed(3)}`;
    const filtro = `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".3 .59 .11 0 0 .3 .59 .11 0 0 .3 .59 .11 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="${tab(0)}"/><feFuncG type="table" tableValues="${tab(1)}"/><feFuncB type="table" tableValues="${tab(2)}"/></feComponentTransfer></filter>`;
    x = x.replace("<defs>", `<defs>${filtro}`).replace(/<image /g, `<image filter="url(#${id})" `);
  }
  return x;
}

// ------------------------------------------------------------------ cabeça
interface PecaCabelo { svg: string; tras: string | null; ref: [string, string] }
interface PecaRosto { svg: string; ref: [string, string] | null; queixo: number }
const P_ = PECAS as unknown as {
  rostos: PecaRosto[]; cabelos: PecaCabelo[]; olhos: { e: string; d: string }[];
  sobrancelhas: { e: string; d: string; ref: [string, string] }[]; narizes: string[]; bocas: string[];
};

/** Cabeça montada (conteúdo SVG no sistema do kit) e a altura do queixo. */
export function cabecaKit(ap: Aparencia, pref = `k${(seq++).toString(36)}`): { svg: string; queixo: number } {
  const tom = NOMES_TOM[ap.tom] ?? "padrão", corCab = NOMES_COR_CABELO[ap.corCabelo] ?? "preto";
  const r = P_.rostos[ap.rosto] ?? P_.rostos[0];
  const sem = ap.cabelo >= 7, cab = sem ? null : P_.cabelos[ap.cabelo] ?? P_.cabelos[0];
  const u = (s: string) => s.replace(/§/g, pref);
  const pele = (s: string, ref: [string, string] | null = null) => recolorirPele(u(s), tom, ref);
  const partes: string[] = [];
  if (cab?.tras) partes.push(recolorirCabelo(u(cab.tras), corCab, cab.ref, pref + "t"));
  // calota de pele atrás do rosto (testa alta não abre buraco); careca/raspado ganham o crânio inteiro
  const ry = sem ? 450 : 330, cy = sem ? 1450 : 1470;
  partes.push(pele(`<defs><linearGradient id="§calota" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd2bd"/><stop offset="1" stop-color="#ffc0a4"/></linearGradient></defs><ellipse cx="4818" cy="${cy}" rx="${sem ? 462 : 450}" ry="${ry}" fill="url(#§calota)"/>`));
  // base de pele no miolo do rosto: tapa os furos onde ficavam o nariz e a boca do molde (outras bocas/narizes não cobrem)
  partes.push(pele(`<defs><linearGradient id="§miolo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7ab8a"/><stop offset="1" stop-color="#ee9070"/></linearGradient></defs><ellipse cx="4818" cy="1930" rx="370" ry="310" fill="url(#§miolo)"/>`));
  const q = r.queixo - 2417;
  partes.push(`<defs><clipPath id="${pref}rec"><path d="M3000,300 H6600 V${2500 + q} H5176 L5176,${2540 + q} Q4806,${2660 + q} 4440,${2540 + q} L4440,${2500 + q} H3000 Z"/></clipPath></defs><g clip-path="url(#${pref}rec)">${pele(r.svg, r.ref)}</g>`);
  const o = P_.olhos[ap.olhos] ?? P_.olhos[0];
  partes.push(pele(o.e), pele(o.d), pele(P_.narizes[ap.nariz] ?? P_.narizes[0]), pele(P_.bocas[ap.boca] ?? P_.bocas[0]));
  const sb = P_.sobrancelhas[ap.sobrancelha] ?? P_.sobrancelhas[0];
  partes.push(recolorirCabelo(u(sb.e), corCab, sb.ref, pref + "se"), recolorirCabelo(u(sb.d), corCab, sb.ref, pref + "sd"));
  if (cab) partes.push(recolorirCabelo(u(cab.svg), corCab, cab.ref, pref + "c"));
  else if (ap.cabelo === 7) { // raspado: sombra do cabelo sobre o crânio
    const [d0, d1] = CORES_CAB[corCab];
    partes.push(`<defs><linearGradient id="${pref}rsp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${d0}"/><stop offset="1" stop-color="${mistura(d0, d1, 0.4)}"/></linearGradient></defs><path d="M4352,1560 C4330,1150 4560,1000 4818,1000 C5076,1000 5306,1150 5284,1560 C5262,1430 5200,1330 5120,1290 C5000,1250 4640,1250 4516,1290 C4436,1330 4374,1430 4352,1560 Z" fill="url(#${pref}rsp)" opacity=".72"/>`);
  }
  return { svg: partes.join(""), queixo: r.queixo };
}

/** Cabeça posicionada no corpo (queixo em y = 188). */
function cabecaNoCorpo(ap: Aparencia, pref?: string): string {
  const { svg, queixo } = cabecaKit(ap, pref);
  // grupo com transform (e não um <svg> aninhado: o CSS da página dimensiona qualquer <svg> e deslocaria a cabeça)
  const s = 0.088, x = CX - 4806.6 * s, y = 188 - (queixo - 12) * s;
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">${svg}</g>`;
}

// ------------------------------------------------------------------ geometria do corpo
function cr(p: P[], fechado = false): string {
  const n = p.length;
  let d = `M${f1(p[0][0])},${f1(p[0][1])}`;
  for (let i = 0; i < (fechado ? n : n - 1); i++) {
    const p0 = fechado || i > 0 ? p[(i - 1 + n) % n] : p[i], p1 = p[i], p2 = p[(i + 1) % n];
    const p3 = fechado || i + 2 < n ? p[(i + 2) % n] : p2;
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)},${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)},${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d + (fechado ? " Z" : "");
}
/** Lado direito (dx, y) de cima para baixo, começando e/ou terminando no eixo, espelhado num contorno fechado. */
function espelho(meio: P[]): P[] {
  const dir = meio.map(([x, y]) => [CX + x, y] as P);
  const esq = meio.slice(0, -1).reverse().map(([x, y]) => [CX - x, y] as P);
  return meio[0][0] === 0 ? [...dir, ...esq.slice(0, -1)] : [...dir, ...esq];
}
const lado = (pts: P[]): [P[], P[]] => [pts.map(([x, y]) => [CX + x, y] as P), pts.map(([x, y]) => [CX - x, y] as P)];
const faixa = (pts: P[], dx: number) => cr([...pts, ...[...pts].reverse().map(([x, y]) => [x - dx, y] as P)], true);

interface Tipo { ka: number; peito: number; cintura: number; quadril: number; kl: number; barriga: number; lc: number }
export const TIPOS: Record<Fisico, Tipo> = {
  esguio: { ka: 0.9, peito: 72, cintura: 58, quadril: 64, kl: 0.78, barriga: 0, lc: 48 },
  magro: { ka: 0.98, peito: 78, cintura: 62, quadril: 68, kl: 0.86, barriga: 0, lc: 50 },
  atletico: { ka: 1.3, peito: 86, cintura: 64, quadril: 72, kl: 1.0, barriga: 0, lc: 52 },
  forte: { ka: 1.55, peito: 96, cintura: 74, quadril: 80, kl: 1.12, barriga: 0, lc: 54 },
  troncudo: { ka: 1.45, peito: 106, cintura: 96, quadril: 92, kl: 1.14, barriga: 6, lc: 57 },
};
const BRACO: [number, number][] = [[244, 0], [266, 16], [300, 19.5], [336, 19], [372, 15.5], [388, 14.5], [412, 16], [448, 13.5], [474, 11]];

function braco(t: Tipo) {
  const k = t.ka, ac = t.peito + 19.5 * k + 5;
  const precisa = Math.max(t.cintura + t.barriga + 14, t.quadril + 20);
  const inc = Math.max(-0.02, (precisa + 22 - ac) / 174);
  const cx = (y: number) => ac + (y - 300) * inc;
  const fora = BRACO.slice(1).map(([y, r]) => [cx(y) + r * k, y] as P);
  const dentro = BRACO.slice(2).map(([y, r]) => [cx(y) - r * k, y] as P).reverse();
  return { fora, dentro, cx };
}
function corpoPts(t: Tipo): P[] {
  const { fora, dentro, cx } = braco(t), rw = BRACO[BRACO.length - 1][1] * t.ka, hx = cx(474);
  const mao: P[] = [[hx + rw + 2, 494], [hx + rw + 1, 516], [hx + 8, 534], [hx - 3, 541], [hx - 12, 535], [hx - 16, 520], [hx - 22, 506], [hx - 20, 494], [hx - rw, 478]];
  const axila = cx(300) - 19.5 * t.ka - 3;
  const tronco: P[] = [[axila, 300], [t.peito, 334], [t.cintura, 430], [t.quadril, 485], [t.quadril + 8, 540]];
  const { lc, kl } = t;
  const pernaFora: P[] = [[lc + 44 * kl, 610], [lc + 34 * kl, 668], [lc + 32 * kl, 698], [43 + 32 * kl, 736], [43 + 27 * kl, 784], [64, 848]];
  const pe: P[] = [[78, 880], [68, 896], [20, 898], [16, 870]];
  const pernaDentro: P[] = [[22, 848], [43 - 25 * kl, 784], [43 - 29 * kl, 736], [lc - 30 * kl, 698], [lc - 32 * kl, 682], [Math.max(6, lc - 40 * kl), 610], [4, 560]];
  const ombro: P[] = [[32, 170], [34, 206], [70, 216], [(70 + cx(244)) / 2, 226], [cx(244), 242]];
  return [...ombro, ...fora, ...mao, ...dentro, ...tronco, ...pernaFora, ...pe, ...pernaDentro, [0, 548]];
}
/** Camisa (uniforme ou casual): manga curta ou longa, justa ou larga. Devolve o contorno do lado direito e a bainha da manga. */
function camisaPts(t: Tipo, longa: boolean, largo: boolean): { pts: P[]; bainha: [P, P] } {
  const { fora, dentro, cx } = braco(t), k = t.ka, L = largo ? 7 : 0, b = t.barriga;
  const axila = cx(300) - 19.5 * k - 3;
  const topo: P[] = [[0, 214], [30, 204], [44, 206], [80, 216], [(80 + cx(244)) / 2 + 4, 226], [cx(244) + 6 + L * 0.4, 242]];
  let manga: P[], bainha: [P, P];
  if (!longa) {
    const mf: P[] = [[cx(266) + 16 * k + 3 + L * 0.6, 268], [cx(300) + 19.5 * k + 3 + L, 300], [cx(322) + 19.5 * k + 3 + L, 324]];
    const md: P = [cx(334) - 19.5 * k - 3 - L * 0.5, 334];
    manga = [...mf, md]; bainha = [md, mf[2]];
  } else {
    const mf = fora.map(([x, y]) => [x + 4 + L * 0.6, y] as P);
    const md = dentro.filter(([, y]) => y >= 330).map(([x, y]) => [x - 3 - L * 0.4, y] as P);
    const pulsoF: P = [cx(474) + 11 * k + 5, 480], pulsoD: P = [cx(474) - 11 * k - 4, 482];
    manga = [...mf.slice(0, -1), pulsoF, pulsoD, ...md.slice(1)]; bainha = [pulsoD, pulsoF];
  }
  const tronco: P[] = [[axila + 2, 318], [t.peito + 6 + L, 350], [t.cintura + 10 + b + L, 430], [t.quadril + 8 + b * 0.5 + L, 478], [t.quadril + 10 + L, 494 + L], [0, 498 + L]];
  return { pts: [...topo, ...manga, ...tronco], bainha };
}
function regataPts(t: Tipo): P[] {
  const { cx } = braco(t), axila = cx(300) - 19.5 * t.ka - 3, b = t.barriga;
  return [[0, 240], [22, 228], [34, 210], [56, 212], [62, 238], [(62 + axila) / 2 + 4, 286], [axila + 1, 314], [t.peito + 6, 350], [t.cintura + 10 + b, 430], [t.quadril + 8 + b * 0.5, 478], [t.quadril + 10, 494], [0, 498]];
}
const pernaContorno = (t: Tipo, folga: number, ate: number): { fora: P[]; dentro: P[] } => {
  const { lc, kl } = t, f = folga;
  const fora: P[] = [[t.quadril + 12 + f * 0.3, 472], [t.quadril + 15 + f * 0.3, 520], [lc + 44 * kl + f, 610], [lc + 34 * kl + f, 668], [lc + 32 * kl + f, 698], [43 + 32 * kl + f, 736], [43 + 27 * kl + f, 784], [66 + f * 0.6, 846]];
  const dentro: P[] = [[20 - f * 0.6, 846], [43 - 25 * kl - f, 784], [43 - 29 * kl - f, 736], [lc - 30 * kl - f, 698], [lc - 32 * kl - f, 682], [Math.max(3, lc - 40 * kl - f), 610], [3, 560]];
  return { fora: fora.filter(([, y]) => y <= ate), dentro: dentro.filter(([, y]) => y <= ate) };
};

// ------------------------------------------------------------------ calçados
interface Calcado { base: [string, string]; sola: string; detalhe: string; trava: string | null; logo: string }
function calcadoDe(jogo: boolean, kit: Kit | undefined, casual: RoupaCasual): Calcado {
  if (!jogo) return casual === "social"
    ? { base: ["#6b4128", "#3a2214"], sola: "#22140c", detalhe: "#8a5a3a", trava: null, logo: "" }
    : { base: ["#ffffff", "#dde2ea"], sola: "#c9ced8", detalhe: "#2e4a7a", trava: null, logo: `<path d="M26,40 C36,38 44,32 56,27 C50,35 42,41 30,45 Z" fill="#2e4a7a"/>` };
  const m = kit?.marca ? MARCA[kit.marca] : undefined;
  if (m) {
    const [c0, c1] = m.cores, base = c0, det = c1 === c0 ? m.cores[2] : c1;
    return { base: [base, mistura(base, "#000000", 0.35)], sola: det, detalhe: det, trava: det, logo: `<g transform="translate(29,25) scale(.62)">${simbolo(m.simbolo, det, base, m.nome[0])}</g>` };
  }
  const [a, b] = kit?.chuteira ?? ["#1A1A1A", "#E3B341"];
  return { base: [a, mistura(a, "#000000", 0.35)], sola: b, detalhe: b, trava: b, logo: `<path d="M26,42 C36,40 44,34 56,28 C50,36 42,42 30,46 Z" fill="${b}"/>` };
}
function pe(c: Calcado, gid: string): { defs: string; g: string } {
  const corpoPe = cr([[-22, 2], [20, 0], [28, 14], [44, 24], [58, 34], [61, 44], [50, 52], [10, 54], [-20, 52], [-28, 40], [-27, 20]], true);
  const sola = cr([[-27, 42], [10, 47], [50, 45], [61, 41], [59, 48], [50, 54], [10, 56], [-20, 54]], true);
  const travas = c.trava ? [-18, 0, 22, 44].map((x) => `<path d="M${x - 3},55 h6 l-1,5 h-4 Z" fill="${c.trava}"/>`).join("") : "";
  const cadarco = [0, 1, 2, 3].map((i) => `<path d="M${-6 + i * 5},${8 + i * 4} l8,-3" stroke="#fff" stroke-opacity=".75" stroke-width="1.3" stroke-linecap="round"/>`).join("");
  return {
    defs: `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.base[0]}"/><stop offset="1" stop-color="${c.base[1]}"/></linearGradient>`,
    g: `${travas}<path d="${corpoPe}" fill="url(#${gid})"/><path d="M-20,4 C-10,10 10,10 20,2 C10,-2 -10,-2 -20,4 Z" fill="#000" opacity=".35"/><path d="M-24,30 C-20,14 -10,8 0,8" stroke="#fff" stroke-opacity=".3" stroke-width="1.6" fill="none"/>${cadarco}${c.logo}<path d="${sola}" fill="${c.sola}"/>`,
  };
}

// ------------------------------------------------------------------ padrões do uniforme
function padraoKit(k: Kit, t: Tipo): string {
  const c2 = k.cor2, x0 = CX - 200, x1 = CX + 200;
  switch (k.padrao) {
    case "listrasV": return Array.from({ length: 16 }, (_, i) => `<rect x="${x0 + 8 + i * 26}" y="190" width="13" height="320" fill="${c2}"/>`).join("");
    case "listrasH": return Array.from({ length: 11 }, (_, i) => `<rect x="${x0}" y="${250 + i * 26}" width="${x1 - x0}" height="13" fill="${c2}"/>`).join("");
    case "faixa": return `<path d="M${CX - t.peito - 30} 232 L${CX - t.peito + 8} 222 L${CX + t.quadril + 40} 500 L${CX + t.quadril} 510 Z" fill="${c2}"/>`;
    case "faixaH": return `<rect x="${x0}" y="318" width="${x1 - x0}" height="36" fill="${c2}"/>`;
    default: return "";
  }
}

// ------------------------------------------------------------------ montagem
export interface Kit { cor1: string; cor2: string; padrao: string; numero: string; chuteira?: [string, string]; marca?: string }
export interface OpcoesCorpo { aparencia: unknown; visual: Visual; alturaCm?: number; traje: "jogo" | "casual"; kit?: Kit; fundo?: string }

const SOMBRA = "#e8714d", VINCO = "#d9714f";
const luz = (c: string) => { const [r, g, b] = hex(c); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };

/** Corpo vestido (sem a tag <svg>): defs + desenho, no sistema do corpo. */
function corpoVestido(ap: Aparencia, v: Visual, traje: "jogo" | "casual", kit: Kit | undefined): string {
  const k = `p${(seq++).toString(36)}`, tom = NOMES_TOM[ap.tom] ?? "padrão";
  const t = TIPOS[v.fisico] ?? TIPOS.atletico, { fora, dentro, cx } = braco(t), { lc, kl } = t;
  const jogo = traje === "jogo", casual = v.casual;
  const K = kit ?? { cor1: "#C8102E", cor2: "#FFFFFF", padrao: "lisa", numero: "10" };
  const claroDemais = (c: string) => luz(c) > 0.86;
  const vis = (a: AreaTatuagem) => !!v.tatuagens[a] && tatuagemVisivel(a, v, traje);
  const pele = (c: string) => recolorirPele(c, tom);
  const defs: string[] = [], g: string[] = [];

  // pele
  const corpo = cr(espelho([[0, 170], ...corpoPts(t)]), true);
  defs.push(`<linearGradient id="${k}pele" x1="0" y1="0" x2="0" y2="1">${["#ffc8b0", "#f7ab8a", "#ee9070"].map((c, i) => `<stop offset="${[0, 0.45, 1][i]}" stop-color="${pele(c)}"/>`).join("")}</linearGradient>`,
    `<linearGradient id="${k}pesc" x1="0" y1="0" x2="0" y2="1">${["#e8714d", "#ef9372", "#f6a989"].map((c, i) => `<stop offset="${[0, 0.5, 1][i]}" stop-color="${pele(c)}"/>`).join("")}</linearGradient>`,
    `<clipPath id="${k}cc"><path d="${corpo}"/></clipPath>`);
  g.push(`<ellipse cx="${CX}" cy="903" rx="${t.peito + 40}" ry="9" fill="#000" opacity=".2"/>`, `<path d="${corpo}" fill="url(#${k}pele)"/>`,
    `<path d="M${CX - 33},176 L${CX + 33},176 L${CX + 34},214 L${CX - 34},214 Z" fill="url(#${k}pesc)"/>`);
  const perna: P[] = [[lc + 44 * kl, 618], [lc + 34 * kl, 668], [lc + 32 * kl, 698]];
  const sombrasPele = [
    faixa(fora.slice(2).map(([x, y]) => [CX + x, y] as P), 11 * t.ka),
    faixa(dentro.slice(0, -1).reverse().map(([x, y]) => [CX - x, y] as P), -6),
    faixa(perna.map(([x, y]) => [CX + x, y] as P), 12 * kl),
    faixa([[CX - (lc - 40 * kl), 618], [CX - (lc - 30 * kl), 698]], -8),
    cr([[CX + cx(474) + 6, 498], [CX + cx(474) + 16, 494], [CX + cx(474) + 8, 532], [CX + cx(474) - 6, 540]], true),
  ];
  g.push(`<g clip-path="url(#${k}cc)" fill="${pele(SOMBRA)}" opacity=".42">${sombrasPele.map((d) => `<path d="${d}"/>`).join("")}</g>`);
  const cot = (s: number) => `M${f1(CX + s * (cx(388) + 10 * t.ka))},386 C${f1(CX + s * (cx(388) + 4))},391 ${f1(CX + s * (cx(388) - 4))},391 ${f1(CX + s * (cx(388) - 9 * t.ka))},387`;
  const joe = (s: number) => `M${f1(CX + s * (lc + 14 * kl))},688 C${f1(CX + s * (lc + 6))},695 ${f1(CX + s * (lc - 6))},695 ${f1(CX + s * (lc - 14 * kl))},688`;
  g.push(`<g fill="none" stroke="${pele(VINCO)}" stroke-opacity=".5" stroke-width="1.1" clip-path="url(#${k}cc)"><path d="${cot(1)}"/><path d="${cot(-1)}"/><path d="${joe(1)}"/><path d="${joe(-1)}"/></g>`);

  // tatuagens (E = lado esquerdo da tela)
  const tat = (a: AreaTatuagem, x: number, y: number, rot: number, esc: number, zona: string) => {
    const id = v.tatuagens[a]!;
    return id === "fechada" ? fechamento(zona, x, y, 110) : `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${f1(esc)})">${desenhoTatuagem(id)}</g>`;
  };
  for (const s of [-1, 1] as const) {
    const area: AreaTatuagem = s === -1 ? "antebracoE" : "antebracoD";
    if (vis(area)) {
      const zona = cr([...fora.filter(([, y]) => y >= 388).map(([x, y]) => [CX + s * x, y] as P), ...dentro.filter(([, y]) => y >= 388 && y <= 474).map(([x, y]) => [CX + s * x, y] as P)], true);
      g.push(`<g clip-path="url(#${k}cc)">${tat(area, CX + s * cx(428), 428, 0, 1.15 * t.ka, zona)}</g>`);
    }
    const areaP: AreaTatuagem = s === -1 ? "pernaE" : "pernaD";
    if (vis(areaP) && (jogo || v.perna === "bermuda")) {
      const y = jogo ? 650 : 676;
      const zona = cr([[CX + s * (lc + 44 * kl), 600], [CX + s * (lc + 34 * kl), 690], [CX + s * (lc - 30 * kl), 690], [CX + s * (lc - 40 * kl), 600]], true);
      g.push(`<g clip-path="url(#${k}cc)">${tat(areaP, CX + s * lc, y, 0, 1.2 * kl, zona)}</g>`);
    }
  }
  if (vis("pescoco") && v.tatuagens.pescoco !== "fechada") g.push(`<g transform="translate(${CX + 14} 196) scale(.55)">${desenhoTatuagem(v.tatuagens.pescoco!)}</g>`);

  // pernas: meião + chuteira (jogo) ou calça/bermuda + tênis (casual)
  const calc = calcadoDe(jogo, K, casual), p = pe(calc, `${k}pe`);
  defs.push(p.defs);
  const corMeiao = jogo ? (claroDemais(K.cor1) ? "#F2F0EA" : K.cor1) : "#F2F0EA";
  if (jogo || v.perna === "bermuda") {
    const topo = jogo ? (v.meiao === "baixo" ? 770 : 702) : 826;
    const MEIAO: P[] = [[lc + 32 * kl + 2, 704], [43 + 32 * kl + 2, 736], [43 + 27 * kl + 2, 784], [66, 850], [20, 850], [43 - 25 * kl - 2, 784], [43 - 29 * kl - 2, 736], [lc - 30 * kl - 2, 704]];
    const corte = (pts: P[]) => { // começa o meião na altura "topo"
      if (topo <= 704) return pts;
      const w = (y: number, lado2: 0 | 1) => { const a = lado2 ? [[704, lc - 30 * kl - 2], [736, 43 - 29 * kl - 2], [784, 43 - 25 * kl - 2], [850, 20]] : [[704, lc + 32 * kl + 2], [736, 43 + 32 * kl + 2], [784, 43 + 27 * kl + 2], [850, 66]];
        for (let i = 1; i < a.length; i++) if (y <= a[i][0]) return a[i - 1][1] + ((a[i][1] - a[i - 1][1]) * (y - a[i - 1][0])) / (a[i][0] - a[i - 1][0]);
        return a[a.length - 1][1]; };
      return [[w(topo, 0), topo], [w((topo + 850) / 2, 0), (topo + 850) / 2], [66, 850], [20, 850], [w((topo + 850) / 2, 1), (topo + 850) / 2], [w(topo, 1), topo]] as P[];
    };
    const [md, me] = lado(corte(MEIAO)).map((x) => cr(x, true));
    defs.push(`<linearGradient id="${k}mei" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${corMeiao}"/><stop offset="1" stop-color="${mistura(corMeiao, "#000000", 0.3)}"/></linearGradient><clipPath id="${k}mc"><path d="${md}"/><path d="${me}"/></clipPath>`);
    g.push(`<path d="${md}" fill="url(#${k}mei)"/><path d="${me}" fill="url(#${k}mei)"/>`);
    if (jogo) {
      const ty = topo + 14, faixaCor = claroDemais(K.cor1) ? K.cor1 === K.cor2 ? "#1A1A1A" : K.cor2 : K.cor2 === K.cor1 ? "#FFFFFF" : K.cor2;
      g.push(`<g clip-path="url(#${k}mc)"><g fill="none" stroke="${claroDemais(faixaCor) && claroDemais(corMeiao) ? "#C8102E" : faixaCor}" stroke-width="5" opacity=".92"><path d="M${CX + 4},${ty} C${CX + 40},${ty + 5} ${CX + 80},${ty + 5} ${CX + 110},${ty - 2}"/><path d="M${CX - 4},${ty} C${CX - 40},${ty + 5} ${CX - 80},${ty + 5} ${CX - 110},${ty - 2}"/></g>`
        + `<path d="${faixa(MEIAO.slice(0, 4).map(([x, y]) => [CX + x, y] as P), 9 * kl)}" fill="#000" opacity=".16"/></g>`);
    }
  }
  g.push(`<g transform="translate(${CX + 43},848)">${p.g}</g><g transform="translate(${CX - 43},848) scale(-1,1)">${p.g}</g>`);

  if (jogo) {
    // calção
    const calcPts: P[] = [[0, 474], [t.quadril + 10, 472], [t.quadril + 15, 520], [lc + 44 * kl + 10, 604], [lc + 44 * kl + 6, 620], [8, 620], [6, 574], [0, 564]];
    const calcao = cr(espelho(calcPts), true), corC = K.cor2, corC2 = mistura(corC, "#000000", claroDemais(corC) ? 0.18 : 0.3);
    const friso = luz(corC) > 0.5 ? (K.cor1 === corC ? "#1A1A1A" : K.cor1) : claroDemais(K.cor1) ? "#F2F0EA" : K.cor1;
    defs.push(`<linearGradient id="${k}cal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${corC}"/><stop offset="1" stop-color="${corC2}"/></linearGradient><clipPath id="${k}clc"><path d="${calcao}"/></clipPath>`);
    const hx1 = lc + 44 * kl + 6;
    g.push(`<path d="${calcao}" fill="url(#${k}cal)"/><g clip-path="url(#${k}clc)"><path d="${faixa(calcPts.slice(1, 5).map(([x, y]) => [CX + x, y] as P), 12)}" fill="#000" opacity=".09"/><path d="M${CX},562 L${CX},620" stroke="${corC2}" stroke-width="1.2"/>`
      + `<g fill="none" stroke="${friso}" stroke-width="4.5"><path d="M${CX + 8},616 C${CX + 38},619 ${CX + hx1 - 20},617 ${CX + hx1 + 6},612"/><path d="M${CX - 8},616 C${CX - 38},619 ${CX - hx1 + 20},617 ${CX - hx1 - 6},612"/></g></g>`);
  } else {
    // calça ou bermuda
    const calca = v.perna === "calca";
    const corP = calca ? (casual === "social" ? "#2B2F36" : casual === "moletom" ? "#7F8389" : "#2E3F5C") : (casual === "regata" ? "#4F6E9C" : "#B9A58A");
    const ate = calca ? 850 : 668;
    const { fora: pf, dentro: pd } = pernaContorno(t, calca ? 5 : 10, ate);
    const bainha: P[] = calca ? [] : [[lc + 34 * kl + 12, 668], [lc - 32 * kl - 10, 668]];
    const contornoP = calca ? [[0, 474], ...pf, ...pd, [0, 556]] as P[] : [[0, 474], ...pf, ...bainha, ...pd.filter(([, y]) => y <= 668), [0, 556]] as P[];
    const d = cr(espelho(contornoP), true), corP2 = mistura(corP, "#000000", 0.3);
    defs.push(`<linearGradient id="${k}cal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${corP}"/><stop offset="1" stop-color="${corP2}"/></linearGradient><clipPath id="${k}clc"><path d="${d}"/></clipPath>`);
    g.push(`<path d="${d}" fill="url(#${k}cal)"/><g clip-path="url(#${k}clc)"><path d="${faixa(pf.slice(1, calca ? 7 : 4).map(([x, y]) => [CX + x, y] as P), 14)}" fill="#000" opacity=".14"/>`
      + `<path d="M${CX},${calca ? 556 : 560} L${CX},500" stroke="${corP2}" stroke-width="1.4"/>`
      + (calca ? `<path d="M${CX - lc},620 C${CX - lc + 2},700 ${CX - 43},780 ${CX - 43},846" stroke="#fff" stroke-opacity=".12" stroke-width="3" fill="none"/>` : `<path d="M${CX - 100},660 H${CX + 100}" stroke="${corP2}" stroke-width="1.2" stroke-dasharray="3 3"/>`)
      + `</g>`);
  }

  // camisa
  const longa = jogo ? v.manga === "longa" : ["moletom", "social", "jaqueta"].includes(casual);
  const largo = jogo ? v.caimento === "largo" : ["moletom", "jaqueta"].includes(casual);
  const corCasual = CORES_CASUAL[v.corCasual] ?? CORES_CASUAL[1];
  const cor1 = jogo ? K.cor1 : casual === "jaqueta" ? "#4F6E9C" : corCasual;
  const cor1b = mistura(cor1, "#000000", claroDemais(cor1) ? 0.16 : 0.32);
  if (!jogo && casual === "regata") {
    const d = cr(espelho(regataPts(t)), true);
    const vies = mistura(cor1, luz(cor1) > 0.5 ? "#000000" : "#FFFFFF", 0.22);
    defs.push(`<linearGradient id="${k}cam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cor1}"/><stop offset="1" stop-color="${cor1b}"/></linearGradient><clipPath id="${k}ct"><path d="${d}"/></clipPath>`);
    g.push(`<path d="${d}" fill="url(#${k}cam)"/><g clip-path="url(#${k}ct)"><path d="${d}" fill="none" stroke="${vies}" stroke-width="6"/>`
      + `<path d="M${CX + 40},240 C${CX + 98},252 ${CX + t.peito - 2},320 ${CX + t.cintura},430 L${CX + t.quadril},492 L${CX + t.quadril - 34},492 C${CX + t.cintura - 24},380 ${CX + 62},300 ${CX + 40},240 Z" fill="#000" opacity=".14"/></g>`);
  } else {
    const { pts, bainha } = camisaPts(t, longa, largo);
    const d = cr(espelho(pts), true);
    const corManga = jogo && K.padrao === "centro" ? K.cor2 : cor1;
    defs.push(`<linearGradient id="${k}cam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cor1}"/><stop offset="1" stop-color="${cor1b}"/></linearGradient><clipPath id="${k}ct"><path d="${d}"/></clipPath>`);
    g.push(`<path d="${d}" fill="url(#${k}cam)"/>`);
    const dentroCam: string[] = [];
    if (jogo) dentroCam.push(padraoKit(K, t));
    if (corManga !== cor1) { // camisa "centro": mangas de outra cor
      const mangaZona = `M${CX + cx(244) - 30},230 L${CX + 220},230 L${CX + 220},${longa ? 500 : 340} L${CX + cx(334) - 24 * t.ka},${longa ? 500 : 340} Z`;
      dentroCam.push(`<path d="${mangaZona}" fill="${corManga}"/><path d="${mangaZona}" fill="${corManga}" transform="translate(${2 * CX},0) scale(-1,1)"/>`);
    }
    const kk = t.ka;
    dentroCam.push(`<g fill="#000" opacity=".16"><path d="${cr([[CX + 40, 240], [CX + 98, 250], [CX + t.peito - 2, 320], [CX + t.cintura, 430], [CX + t.quadril, 492], [CX + t.quadril - 34, 492], [CX + t.cintura - 24, 380], [CX + 54, 300]], true)}"/>`
      + (longa ? `<path d="${faixa(fora.slice(1).map(([x, y]) => [CX + x + 4, y] as P), 12 * kk)}"/>` : `<path d="${cr([[CX + cx(266), 262], [CX + cx(300) + 30 * kk, 300], [CX + cx(320) + 28 * kk, 326], [CX + cx(320) + 2, 328]], true)}"/>`)
      + `<path d="${cr([[CX - 60, 446], [CX - 20, 462], [CX + 10, 456], [CX - 10, 480], [CX - 60, 474]], true)}"/></g>`
      + `<g fill="#fff" opacity=".12"><path d="${cr([[CX - 116, 258], [CX - 94, 246], [CX - 70, 262], [CX - 90, 280], [CX - 112, 290]], true)}"/><path d="${cr([[CX - 66, 300], [CX - 22, 292], [CX - 30, 360], [CX - 70, 380]], true)}"/></g>`
      + `<g stroke="#fff" stroke-opacity=".26" stroke-width=".7" fill="none"><path d="M${CX - t.peito},262 C${CX - t.peito + 2},310 ${CX - t.peito + 6},370 ${CX - t.cintura},430"/><path d="M${CX + 20},300 C${CX + 26},360 ${CX + 30},420 ${CX + 30},470"/></g>`);
    // punho/bainha da manga
    const [[mx0, my0], [mx1, my1]] = bainha;
    const corPunho = jogo ? (K.cor2 === K.cor1 ? "#FFFFFF" : K.cor2) : cor1b;
    if (jogo || longa) dentroCam.push(`<g fill="none" stroke="${corPunho}" stroke-width="${longa ? 9 : 7}" opacity=".92"><path d="M${f1(CX + mx0 - 2)},${my0 + 3} L${f1(CX + mx1 + 4)},${my1 + 1}"/><path d="M${f1(CX - mx0 + 2)},${my0 + 3} L${f1(CX - mx1 - 4)},${my1 + 1}"/></g>`);
    if (!jogo && largo) dentroCam.push(`<path d="M${CX - t.quadril - 20},${492} H${CX + t.quadril + 20}" stroke="${cor1b}" stroke-width="12"/>`);
    g.push(`<g clip-path="url(#${k}ct)">${dentroCam.join("")}</g>`);
    // gola e detalhes
    const gola = cr(espelho([[0, 230], [20, 224], [34, 212], [44, 206], [38, 202], [24, 214], [0, 220]]), true);
    if (jogo) {
      const corGola = K.cor2 === K.cor1 ? "#FFFFFF" : K.cor2;
      g.push(`<path d="${gola}" fill="${corGola}"/>`);
      const ex = CX + t.peito * 0.5, ey = 290;
      g.push(`<path d="M${ex - 10},${ey - 12} H${ex + 10} V${ey} Q${ex + 10},${ey + 9} ${ex},${ey + 14} Q${ex - 10},${ey + 9} ${ex - 10},${ey} Z" fill="${K.cor2}" stroke="${mistura(K.cor1, "#000", 0.4)}" stroke-width="1"/><path d="M${ex - 10},${ey - 4} H${ex + 10} V${ey + 2} H${ex - 10} Z" fill="${K.cor1}" opacity=".9"/>`);
      const corNum = claroDemais(K.cor1) ? "#1A1A1A" : luz(K.cor1) > 0.55 ? "#1A1A1A" : "#FFFFFF";
      g.push(`<text x="${f1(CX - t.peito * 0.62)}" y="300" font-family="'Big Shoulders Display','Arial Black',sans-serif" font-weight="900" font-size="22" fill="${corNum}" opacity=".95">${K.numero}</text>`);
    } else if (casual === "camiseta") {
      g.push(`<path d="${gola}" fill="${cor1b}"/>`);
    } else if (casual === "moletom") {
      const capuz = `M${CX - 64},222 C${CX - 70},196 ${CX - 40},182 ${CX},182 C${CX + 40},182 ${CX + 70},196 ${CX + 64},222 C${CX + 40},212 ${CX - 40},212 ${CX - 64},222 Z`;
      g.push(`<path d="${capuz}" fill="${cor1b}"/><path d="M${CX - 50},214 C${CX - 30},208 ${CX + 30},208 ${CX + 50},214" stroke="${mistura(cor1b, "#000", 0.3)}" stroke-width="3" fill="none"/>`
        + `<path d="M${CX - t.cintura + 14},404 H${CX + t.cintura - 14} L${CX + t.cintura - 24},452 H${CX - t.cintura + 24} Z" fill="${cor1b}" opacity=".7"/>`
        + `<path d="M${CX - 12},222 L${CX - 14},262 M${CX + 12},222 L${CX + 14},262" stroke="${mistura(cor1, "#FFFFFF", 0.6)}" stroke-width="3" stroke-linecap="round"/>`);
    } else if (casual === "social") {
      g.push(`<path d="M${CX - 40},206 L${CX},232 L${CX - 16},252 L${CX - 48},220 Z M${CX + 40},206 L${CX},232 L${CX + 16},252 L${CX + 48},220 Z" fill="${mistura(cor1, "#000000", 0.08)}" stroke="${cor1b}" stroke-width="1.4" stroke-linejoin="round"/>`
        + `<path d="M${CX},232 V496" stroke="${cor1b}" stroke-width="1.4"/>` + [270, 310, 350, 390, 430, 470].map((y) => `<circle cx="${CX + 4}" cy="${y}" r="2.4" fill="${cor1b}"/>`).join(""));
    } else if (casual === "jaqueta") {
      const tee = `M${CX - 30},214 L${CX + 30},214 L${CX + 40},500 L${CX - 40},500 Z`;
      g.push(`<path d="${tee}" fill="#F2F0EA"/><path d="M${CX - 30},214 Q${CX},232 ${CX + 30},214" stroke="#d8d4c8" stroke-width="4" fill="none"/>`
        + `<path d="M${CX - 46},206 L${CX - 26},262 L${CX - 40},282 L${CX - 66},226 Z M${CX + 46},206 L${CX + 26},262 L${CX + 40},282 L${CX + 66},226 Z" fill="#3B5680"/>`
        + `<path d="M${CX - t.peito + 14},330 H${CX - t.peito + 46} M${CX + t.peito - 46},330 H${CX + t.peito - 14}" stroke="#E2B36A" stroke-width="1.8" stroke-dasharray="4 3"/>`
        + `<path d="M${CX - 40},270 L${CX - 40},498 M${CX + 40},270 L${CX + 40},498" stroke="#E2B36A" stroke-width="1.4" stroke-dasharray="4 3"/>`);
    }
  }
  g.push(cabecaNoCorpo(ap, `h${k}`));
  return `<defs>${defs.join("")}</defs>${g.join("")}`;
}

/** Jogador de corpo inteiro (substitui o boneco antigo; mesma assinatura). */
export function svgCorpo(o: OpcoesCorpo): string {
  const ap = aparenciaDe(o.aparencia);
  const e = Math.max(-0.06, Math.min(0.06, ((o.alturaCm ?? 178) - 178) / 300)); // altura mexe um pouco na escala
  const h = 920, w = 400;
  return `<svg viewBox="${CX - w / 2} 10 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="Jogador de corpo inteiro">${o.fundo ?? ""}`
    + `<g transform="translate(${CX} 905) scale(${1 + e}) translate(${-CX} -905)">${corpoVestido(ap, o.visual, o.traje, o.kit)}</g></svg>`;
}

/** Foto de perfil (busto): o mesmo personagem recortado nos ombros, com o cenário da história atrás. */
export interface OpcoesFoto {
  aparencia: unknown | null; camisa?: { cor1: string; cor2: string; estilo?: string }; numero?: string; cenario?: string;
  traje?: "jogo" | "social"; visual?: Partial<Visual>; marca?: string;
}
export function svgFoto(o: OpcoesFoto): string {
  const silhueta = !o.aparencia;
  const ap = aparenciaDe(o.aparencia ?? APARENCIA_PADRAO);
  const visual: Visual = { fisico: "atletico", manga: "curta", caimento: "justo", meiao: "alto", casual: ap.roupaSocial, corCasual: ap.corSocial, perna: "bermuda", tatuagens: {}, ...(o.visual ?? {}) } as Visual;
  const kit: Kit = { cor1: o.camisa?.cor1 ?? "#8C9A94", cor2: o.camisa?.cor2 ?? "#6F7C77", padrao: o.camisa?.estilo ?? "lisa", numero: o.numero ?? "", marca: o.marca };
  const id = `f${(seq++).toString(36)}`;
  const vx = CX - 122, vy = 14, vw = 244, vh = 293;
  const fundo = o.cenario ? `<g transform="translate(${vx} ${vy}) scale(${vw / 200} ${vh / 220})">${o.cenario}</g>` : `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="#13261F"/>`;
  const pessoa = corpoVestido(ap, visual, o.traje === "social" ? "casual" : "jogo", kit);
  const sil = silhueta ? `<defs><filter id="${id}s" filterUnits="userSpaceOnUse" x="0" y="0" width="600" height="1000"><feColorMatrix type="matrix" values="0 0 0 0 .12 0 0 0 0 .18 0 0 0 0 .16 0 0 0 .95 0"/></filter></defs>` : "";
  return `<svg viewBox="${vx} ${vy} ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="Foto de perfil do jogador">${sil}${fundo}`
    + `<g${silhueta ? ` filter="url(#${id}s)"` : ""}>${pessoa}</g>`
    + (silhueta ? `<text x="${CX}" y="130" text-anchor="middle" font-family="'Big Shoulders Display','Arial Narrow',sans-serif" font-weight="900" font-size="52" fill="#3A5148">?</text>` : "")
    + `</svg>`;
}
