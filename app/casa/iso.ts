// Desenho isométrico dos cômodos no estilo do jogo: traço preto, faces em dois tons (luz vindo da esquerda).
// Eixos: x vai para a direita-baixo, y para a esquerda-baixo, z para cima. Unidade: um ladrilho de meio metro.
// As paredes de trás ficam em x=0 (parede da esquerda) e y=0 (parede da direita); a frente fica aberta.
import {
  ESTILOS, ITENS, REVEST, TIPOS, acabamento, area, comodoDe, coresDoClube, imovelAtual, travado,
  type Acabamento, type Comodo, type EstadoCasa, type Imovel, type Item, type Reliquia, type Vista,
} from "../../src/casa";

export const A = 14, B = 7, H = 15;
const TINTA = "#16110D";
const ESP = 0.45;
type Pt = [number, number];
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
let limite: number[] | null = null;
const pt = (x: number, y: number, z = 0): Pt => {
  const p: Pt = [(x - y) * A, (x + y) * B - z * H];
  if (limite) { limite[0] = Math.min(limite[0], p[0]); limite[1] = Math.min(limite[1], p[1]); limite[2] = Math.max(limite[2], p[0]); limite[3] = Math.max(limite[3], p[1]); }
  return p;
};
/** Inverso da projeção no chão (z=0): da tela para o ladrilho. */
export const telaParaChao = (sx: number, sy: number) => ({ x: (sx / A + sy / B) / 2, y: (sy / B - sx / A) / 2 });
const caminho = (ps: Pt[]) => `M${ps.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L")} Z`;
const linha = (a: Pt, b: Pt, cor: string, w = 1, extra = "") => `<path d="M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])}" stroke="${cor}" stroke-width="${w}"${extra}/>`;
const poli = (ps: Pt[], fill: string, traco = 1.3, extra = "") =>
  `<path d="${caminho(ps)}" fill="${fill}"${traco ? ` stroke="${TINTA}" stroke-width="${traco}" stroke-linejoin="round"` : ""}${extra}/>`;

export function mix(a: string, b: string, t: number): string {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
}
const claro = (c: string, t = 0.16) => mix(c, "#FFFFFF", t);
const escuro = (c: string, t = 0.24) => mix(c, "#000000", t);
const lum = (c: string) => { const n = parseInt(c.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
const contraste = (c: string, t = 0.35) => (lum(c) > 0.5 ? escuro(c, t) : claro(c, t + 0.1));

interface Caixa { x: number; y: number; z: number; w: number; d: number; h: number }
function caixa(b: Caixa, cor: string, traco = 1.3): string {
  const { x, y, z, w, d, h } = b;
  if (h <= 0.001) return poli([pt(x, y, z), pt(x + w, y, z), pt(x + w, y + d, z), pt(x, y + d, z)], cor, traco);
  return poli([pt(x, y + d, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x, y + d, z + h)], cor, traco) +
    poli([pt(x + w, y, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x + w, y, z + h)], escuro(cor, 0.22), traco) +
    poli([pt(x, y, z + h), pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x, y + d, z + h)], claro(cor, 0.14), traco);
}

// ------------------------------------------------------------------ móvel em coordenadas locais
// Local: u na largura, v na profundidade (v=0 encostado atrás, v=D é a frente), z para cima.
type Face = "+y" | "+x" | "-y" | "-x";
const FACES: Face[] = ["+y", "+x", "-y", "-x"];
interface Parte { b: Caixa; svg: string }
class Movel {
  partes: Parte[] = [];
  soltos: string[] = [];
  constructor(public ax: number, public ay: number, public W: number, public D: number, public face: Face) {}
  mundo(u: number, v: number): [number, number] {
    switch (this.face) {
      case "+y": return [this.ax + u, this.ay + v];
      case "-y": return [this.ax + this.W - u, this.ay + this.D - v];
      case "+x": return [this.ax + v, this.ay + this.W - u];
      case "-x": return [this.ax + this.D - v, this.ay + u];
    }
  }
  p3(u: number, v: number, z: number): Pt { const [x, y] = this.mundo(u, v); return pt(x, y, z); }
  get frenteVisivel() { return this.face === "+y" || this.face === "+x"; }
  cx(u: number, v: number, z: number, lw: number, ld: number, h: number, cor: string, traco = 1.3): Parte {
    const [x0, y0] = this.mundo(u, v), [x1, y1] = this.mundo(u + lw, v + ld);
    const b = { x: Math.min(x0, x1), y: Math.min(y0, y1), z, w: Math.abs(x1 - x0), d: Math.abs(y1 - y0), h };
    const p = { b, svg: caixa(b, cor, traco) };
    this.partes.push(p);
    return p;
  }
  frente(p: Parte, v: number, u0: number, u1: number, z0: number, z1: number, fill: string, traco = 1) {
    if (!this.frenteVisivel) return;
    p.svg += poli([this.p3(u0, v, z0), this.p3(u1, v, z0), this.p3(u1, v, z1), this.p3(u0, v, z1)], fill, traco);
  }
  topo(p: Parte, u0: number, u1: number, v0: number, v1: number, z: number, fill: string, traco = 1) {
    p.svg += poli([this.p3(u0, v0, z), this.p3(u1, v0, z), this.p3(u1, v1, z), this.p3(u0, v1, z)], fill, traco);
  }
  extra(p: Parte, svg: string) { p.svg += svg; }
  render(): string {
    const n = this.partes.length, antes = (a: Caixa, b: Caixa) => a.x + a.w <= b.x + 1e-6 || a.y + a.d <= b.y + 1e-6 || a.z + a.h <= b.z + 1e-6;
    const grau = new Array(n).fill(0), arestas: number[][] = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) {
      const a = this.partes[i].b, b = this.partes[j].b;
      if (antes(a, b) && !antes(b, a)) { arestas[i].push(j); grau[j]++; }
    }
    const fila = [...Array(n).keys()].filter((i) => grau[i] === 0), ordem: number[] = [];
    while (fila.length) { fila.sort((i, j) => i - j); const i = fila.shift()!; ordem.push(i); for (const j of arestas[i]) if (--grau[j] === 0) fila.push(j); }
    for (let i = 0; i < n; i++) if (!ordem.includes(i)) ordem.push(i);
    return ordem.map((i) => this.partes[i].svg).join("") + this.soltos.join("");
  }
}

/** Cores de um móvel: a cor escolhida vai para o material principal; o resto vem do estilo. */
interface Pal { cor: string; cor2?: string; madeira: string; metal: string; tecido: string; detalhe: string; estilo: Item["estilo"]; rel?: Reliquia }
function paleta(it: Item, cor: number): Pal {
  const s = ESTILOS[it.estilo], c = it.cores[cor] ?? it.cores[0], de = TIPOS[it.tipo].corDe;
  return { cor: c, madeira: de === "madeira" ? c : s.madeira[0], metal: de === "metal" ? c : s.metal[0], tecido: de === "tecido" ? c : s.tecido[0], detalhe: s.detalhe, estilo: it.estilo };
}
const PRETO = "#262626", BRANCO = "#F4F1EA";
const tela = (m: Movel, p: Parte, v: number, u0: number, u1: number, z0: number, z1: number) => {
  m.frente(p, v, u0, u1, z0, z1, "#1B2A3A");
  if (m.frenteVisivel) m.extra(p, poli([m.p3(u0 + (u1 - u0) * 0.55, v, z0 + 0.05), m.p3(u1 - 0.05, v, z0 + 0.05), m.p3(u1 - 0.05, v, z0 + (z1 - z0) * 0.5)], "#3E6E96", 0));
};
const neon = (m: Movel, p: Parte, v: number, u0: number, u1: number, z: number, P: Pal) => { if (P.estilo === "gamer") m.frente(p, v, u0, u1, z, z + 0.1, P.detalhe, 0); };
const travesseiro = (m: Movel, u: number, v: number, z: number, lw: number) => m.cx(u, v, z, lw, 0.7, 0.35, BRANCO);
const pes = (m: Movel, P: Pal, u0: number, v0: number, lw: number, ld: number, h: number, g = 0.15) => {
  const c = P.estilo === "classico" ? P.detalhe : P.estilo === "moderno" ? P.metal : escuro(P.madeira, 0.15);
  for (const [u, v] of [[u0, v0], [u0 + lw - g, v0], [u0, v0 + ld - g], [u0 + lw - g, v0 + ld - g]]) m.cx(u, v, 0, g, g, h, c, 1);
};
const listras = (m: Movel, p: Parte, u0: number, u1: number, v0: number, v1: number, z: number, cores: string[]) => {
  const n = cores.length * 2, lv = (v1 - v0) / n;
  for (let i = 0; i < n; i += 2) m.topo(p, u0, u1, v0 + i * lv, v0 + (i + 1) * lv, z, cores[(i / 2) % cores.length], 0);
};
const CHITA = ["#D7263D", "#F2B705", "#1B98E0", "#2E7D4F"];

type Desenho = (m: Movel, f: number, P: Pal) => void;
const D: Record<string, Desenho> = {
  beliche(m, _f, P) {
    const pe = (u: number, v: number) => m.cx(u, v, 0, 0.25, 0.25, 4.6, P.madeira);
    pe(0, 0); pe(1.75, 0);
    for (const [z, cob] of [[0.8, P.cor2 ?? "#2E7D4F"], [3.1, P.cor]] as const) {
      m.cx(0.1, 0.1, z, 1.8, 3.8, 0.35, escuro(P.madeira, 0.25)); m.cx(0.15, 0.15, z + 0.35, 1.7, 3.7, 0.4, "#E6E1D3");
      travesseiro(m, 0.3, 0.3, z + 0.75, 1.3); m.cx(0.15, 1.6, z + 0.75, 1.7, 2.25, 0.12, cob);
    }
    pe(0, 3.75); pe(1.75, 3.75);
    m.cx(1.85, 2.4, 0, 0.12, 1.2, 3.4, P.madeira);
  },
  cama(m, f, P) {
    if (f === 4) { // colchão no chão
      m.cx(0.8, 0.3, 0, 2.4, 4.3, 0.45, "#E9E2CC");
      travesseiro(m, 1.0, 0.45, 0.45, 1.6);
      const l = m.cx(0.75, 1.9, 0.45, 2.5, 2.4, 0.1, P.cor); m.topo(l, 0.75, 3.25, 1.9, 2.3, 0.55, claro(P.cor, 0.3), 0.6);
      return;
    }
    const larg = [0, 2.4, 3.4, 4][f], u0 = (4 - larg) / 2, comp = f === 3 ? 4.4 : 4.6;
    const hc = { basico: 2.2, moderno: 1.8, rustico: 2.6, classico: 3.6, gamer: 2.4, brasileiro: 2.2 }[P.estilo];
    const corCab = P.estilo === "classico" ? P.cor : P.madeira;
    const cab = m.cx(u0 - 0.05, 0, 0, larg + 0.1, P.estilo === "rustico" ? 0.4 : 0.3, hc, corCab);
    if (P.estilo === "classico" && m.frenteVisivel) for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) { const [x, y] = m.p3(u0 + (i + 0.5) * larg / 3, 0.3, 1.8 + k * 0.9); m.extra(cab, `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.3" fill="${escuro(P.cor, 0.4)}"/>`); }
    neon(m, cab, 0.3, u0, u0 + larg, hc - 0.25, P);
    const zb = P.estilo === "moderno" ? 0.5 : 0.8;
    if (P.estilo === "moderno" && f === 3) m.cx(u0 + 0.4, 0.6, 0, larg - 0.8, comp - 1, 0.35, PRETO);
    else m.cx(u0, 0.3, 0, larg, comp - 0.3, zb, P.estilo === "rustico" ? P.madeira : escuro(P.madeira, 0.1));
    m.cx(u0 + 0.05, 0.3, zb, larg - 0.1, comp - 0.35, 0.55, "#F2EFE8");
    const nt = f === 1 ? 1 : 2, lt = (larg - 0.4 - (nt - 1) * 0.2) / nt;
    for (let i = 0; i < nt; i++) travesseiro(m, u0 + 0.2 + i * (lt + 0.2), 0.45, zb + 0.55, lt);
    const cobre = m.cx(u0 - 0.02, 1.5, zb + 0.55, larg + 0.04, comp - 1.5 + 0.02, 0.14, P.cor);
    if (P.estilo === "brasileiro") listras(m, cobre, u0, u0 + larg, 1.5, comp, zb + 0.69, CHITA);
    else m.topo(cobre, u0, u0 + larg, 1.5, 1.95, zb + 0.69, claro(P.cor, 0.35), 0.8);
    if (f === 3) m.cx(u0 + 0.3, 4.55, 0, larg - 0.6, 0.45, 0.9, P.estilo === "classico" ? P.cor : escuro(P.madeira, 0.1));
  },
  criado(m, f, P) {
    if (P.estilo === "brasileiro") { const b = m.cx(0.15, 0.15, 0, 0.7, 0.7, 1.0, P.madeira); m.topo(b, 0.25, 0.75, 0.25, 0.75, 1.0, claro(P.madeira, 0.2), 0.6); return; }
    if (f === 2) { const b = m.cx(0.05, 0, 1.0, 0.9, 0.8, 0.5, P.cor); m.frente(b, 0.8, 0.15, 0.85, 1.12, 1.38, escuro(P.cor, 0.15), 0.6); neon(m, b, 0.8, 0.05, 0.95, 1.0, P); return; }
    if (f === 3) pes(m, P, 0.1, 0.1, 0.8, 0.7, 0.4, 0.12);
    const z0 = f === 3 ? 0.4 : 0, h = f === 3 ? 0.8 : 1.15, b = m.cx(0.05, 0.05, z0, 0.9, 0.8, h, P.cor);
    m.frente(b, 0.85, 0.15, 0.85, z0 + 0.45, z0 + 0.52, escuro(P.cor, 0.3), 0.5);
    if (m.frenteVisivel) { const [x, y] = m.p3(0.5, 0.85, z0 + 0.7); m.extra(b, `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.4" fill="${P.estilo === "classico" ? P.detalhe : "#888"}"/>`); }
    const [lx, ly] = m.p3(0.5, 0.45, z0 + h + 0.5);
    m.soltos.push(`<path d="M${f1(lx - 4)} ${f1(ly - 4)} h8 l2.5 7 h-13 Z" fill="${P.estilo === "gamer" ? P.detalhe : "#F2D27A"}" stroke="${TINTA}" stroke-width="1"/>`);
  },
  armario(m, f, P) {
    if (f === 1) {
      m.cx(0.1, 0.35, 0, 0.15, 0.15, 3.6, P.metal); m.cx(2.75, 0.35, 0, 0.15, 0.15, 3.6, P.metal);
      const cores = ["#C0392B", "#2E86C1", BRANCO, "#27AE60", "#2C3E50", "#E67E22"];
      if (P.estilo === "brasileiro") m.cx(0.25, 0.15, 0.3, 2.5, 0.5, 3.1, P.tecido, 1);
      else for (let i = 0; i < 6; i++) m.cx(0.35 + i * 0.4, 0.15, 1.3, 0.32, 0.55, 2.1, cores[i], 1);
      m.cx(0, 0.38, 3.5, 3, 0.1, 0.12, P.metal);
      return;
    }
    const h = f === 2 ? 4.4 : 5, p = m.cx(0, 0, 0, 3, 1, h, P.cor), portas = f === 2 ? 3 : 2;
    for (let i = 1; i < portas; i++) m.frente(p, 1, (3 * i) / portas - 0.01, (3 * i) / portas + 0.01, 0.15, h - 0.15, escuro(P.cor, 0.4), 0.8);
    if (P.estilo === "rustico") for (const z of [0.6, h - 0.6]) m.frente(p, 1, 0.1, 2.9, z, z + 0.12, escuro(P.cor, 0.3), 0);
    for (let i = 0; i < portas; i++) { const u = (3 * (i + 1)) / portas - 0.25; m.frente(p, 1, u - 0.06, u, h * 0.42, h * 0.56, P.estilo === "classico" ? P.detalhe : "#D0D0D0", 0.8); }
    if (f === 3) m.frente(p, 1, 0.25, 1.25, 0.4, h - 0.4, "#B9C9D2", 1);
    neon(m, p, 1, 0, 3, h - 0.3, P);
  },
  comoda(m, f, P) {
    if (f === 2) { pes(m, P, 0.1, 0.1, 1.8, 0.8, 0.6, 0.1); const b = m.cx(0, 0, 0.6, 2, 1, 1.0, P.cor); m.frente(b, 1, 0.99, 1.01, 0.7, 1.5, escuro(P.cor, 0.4), 0.6); return; }
    if (P.estilo === "classico") pes(m, P, 0.1, 0.1, 1.8, 0.8, 0.4, 0.15);
    const z0 = P.estilo === "classico" ? 0.4 : 0, b = m.cx(0, 0, z0, 2, 1, 1.9, P.cor);
    for (let i = 0; i < 4; i++) { const z = z0 + 0.15 + i * 0.44; m.frente(b, 1, 0.12, 1.88, z, z + 0.36, claro(P.cor, 0.06), 0.6); m.frente(b, 1, 0.9, 1.1, z + 0.14, z + 0.22, P.estilo === "classico" ? P.detalhe : escuro(P.cor, 0.4), 0); }
  },
  rede(m, f, P) {
    const sup = P.estilo === "rustico" ? P.madeira : "#4A4A4A";
    m.cx(0, 0.8, 0, 0.3, 0.3, 2.6, sup); m.cx(3.7, 0.8, 0, 0.3, 0.3, 2.6, sup);
    m.cx(0, 0.75, 0, 4, 0.4, 0.2, sup);
    const [ax, ay] = m.p3(0.15, 0.95, 2.4), [bx, by] = m.p3(3.85, 0.95, 2.4), [cx, cy] = m.p3(2, 0.95, 0.9);
    const larg = f === 2 ? 9 : 6;
    m.soltos.push(`<path d="M${f1(ax)} ${f1(ay)} Q${f1(cx)} ${f1(cy + larg * 1.6)} ${f1(bx)} ${f1(by)} Q${f1(cx)} ${f1(cy + larg * 0.2)} ${f1(ax)} ${f1(ay)} Z" fill="${P.cor}" stroke="${TINTA}" stroke-width="1.3"/>` +
      `<path d="M${f1(ax + 6)} ${f1(ay + 2)} Q${f1(cx)} ${f1(cy + larg * 1.1)} ${f1(bx - 6)} ${f1(by + 2)}" stroke="${P.cor === CHITA[1] ? CHITA[0] : CHITA[1]}" stroke-width="1.6" fill="none"/>`);
  },
  sofa(m, f, P) {
    const u0 = f === 1 ? 0.4 : 0, lw = f === 1 ? 3.2 : 4, c = P.cor, ches = f === 3 && P.estilo === "classico";
    const zp = P.estilo === "moderno" ? 0.25 : 0;
    if (zp) pes(m, P, u0 + 0.2, 0.2, lw - 0.4, 1.6, zp, 0.12);
    const hb = ches ? 1.4 : P.estilo === "gamer" ? 2.3 : 1.9;
    const enc = m.cx(u0, 0, zp, lw, 0.6, hb, c);
    if (ches && m.frenteVisivel) for (let i = 0; i < 5; i++) { const [x, y] = m.p3(u0 + 0.4 + i * (lw - 0.8) / 4, 0.6, zp + 1.05); m.extra(enc, `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.1" fill="${escuro(c, 0.45)}"/>`); }
    const hBraco = ches ? hb : 1.3;
    m.cx(u0, 0, zp, 0.4, 2, hBraco, escuro(c, 0.05)); m.cx(u0 + lw - 0.4, 0, zp, 0.4, 2, hBraco, escuro(c, 0.05));
    m.cx(u0 + 0.4, 0.6, zp, lw - 0.8, 1.4, 0.75, c);
    const nc = f === 1 ? 2 : 3, lc = (lw - 0.8) / nc;
    for (let i = 0; i < nc; i++) m.cx(u0 + 0.4 + i * lc + 0.03, 0.6, zp + 0.75, lc - 0.06, 1.35, 0.25, claro(c, 0.12), 1);
    if (P.estilo === "brasileiro") m.cx(u0 + 0.4, 0.05, zp + hb, lw - 0.8, 0.5, 0.08, CHITA[1], 1);
    else if (f >= 2) { const alm = P.estilo === "classico" || P.estilo === "gamer" ? P.detalhe : "#E6DCC8"; m.cx(u0 + 0.5, 0.45, zp + 1.0, 0.7, 0.3, 0.7, alm, 1); m.cx(u0 + lw - 1.2, 0.45, zp + 1.0, 0.7, 0.3, 0.7, alm, 1); }
  },
  poltrona(m, f, P) {
    const c = P.cor;
    if (f === 2) {
      const [a, b] = [m.p3(0.2, 1.9, 0), m.p3(0.2, 0.1, 0.3)];
      m.cx(0.3, 0.6, 0.6, 1.4, 1.1, 0.15, P.madeira);
      m.cx(0.3, 0.4, 0.75, 1.4, 0.18, 1.7, P.madeira); m.cx(0.25, 0.7, 0.6, 0.1, 0.9, 0.7, P.madeira); m.cx(1.65, 0.7, 0.6, 0.1, 0.9, 0.7, P.madeira);
      m.soltos.push(`<path d="M${f1(a[0])} ${f1(a[1])} Q${f1((a[0] + b[0]) / 2)} ${f1(a[1] + 6)} ${f1(b[0])} ${f1(b[1])}" stroke="${escuro(P.madeira, 0.3)}" stroke-width="2.2" fill="none"/>`);
      m.cx(0.45, 0.65, 0.75, 1.1, 0.9, 0.12, c, 1);
      return;
    }
    if (f === 4) {
      m.cx(0.6, 0.6, 0, 0.8, 0.8, 0.25, PRETO); m.cx(0.92, 0.92, 0.25, 0.16, 0.16, 0.5, "#555");
      m.cx(0.35, 0.5, 0.75, 1.3, 1.1, 0.35, c); const enc = m.cx(0.4, 0.4, 1.1, 1.2, 0.25, 2.4, c); neon(m, enc, 0.65, 0.5, 1.5, 3.2, P);
      return;
    }
    if (f === 3) {
      m.cx(0.85, 0.85, 0, 0.3, 0.3, 0.8, P.metal);
      m.cx(0.25, 0.3, 0.8, 1.5, 1.4, 0.35, c); m.cx(0.25, 0.25, 1.15, 1.5, 0.3, 1.5, c); m.cx(0.25, 0.25, 1.15, 0.25, 1.2, 0.9, c); m.cx(1.5, 0.25, 1.15, 0.25, 1.2, 0.9, c);
      m.cx(0.5, 0.55, 1.15, 1.0, 1.0, 0.18, claro(c, 0.2), 1); return;
    }
    const zp = P.estilo === "classico" ? 0.35 : 0;
    if (zp) pes(m, P, 0.25, 0.25, 1.5, 1.4, zp, 0.12);
    m.cx(0.2, 0.15, zp, 1.6, 0.45, P.estilo === "classico" ? 2.2 : 1.9, c);
    m.cx(0.2, 0.15, zp, 0.35, 1.65, 1.25, escuro(c, 0.05)); m.cx(1.45, 0.15, zp, 0.35, 1.65, 1.25, escuro(c, 0.05));
    m.cx(0.55, 0.6, zp, 0.9, 1.2, 0.75, c); m.cx(0.57, 0.6, zp + 0.75, 0.86, 1.15, 0.22, claro(c, 0.12), 1);
  },
  mesaCentro(m, f, P) {
    if (f === 3) {
      if (P.estilo === "brasileiro") { const b = m.cx(0.3, 0.3, 0, 1.4, 1.4, 0.9, P.madeira); for (const z of [0.25, 0.55]) m.frente(b, 1.7, 0.3, 1.7, z, z + 0.14, escuro(P.madeira, 0.3), 0); return; }
      const b = m.cx(0.45, 0.45, 0, 1.1, 1.1, 0, "#000", 0), [x, y] = m.p3(1, 1, 0);
      m.extra(b, `<path d="M${f1(x - 12)} ${f1(y - 2)} L${f1(x - 12)} ${f1(y - 14)} A12 6 0 0 1 ${f1(x + 12)} ${f1(y - 14)} L${f1(x + 12)} ${f1(y - 2)} A12 6 0 0 1 ${f1(x - 12)} ${f1(y - 2)} Z" fill="${P.madeira}" stroke="${TINTA}" stroke-width="1.3"/><ellipse cx="${f1(x)}" cy="${f1(y - 14)}" rx="12" ry="6" fill="${claro(P.madeira, 0.3)}" stroke="${TINTA}" stroke-width="1.3"/><ellipse cx="${f1(x)}" cy="${f1(y - 14)}" rx="6" ry="3" fill="none" stroke="${escuro(P.madeira, 0.2)}" stroke-width="1"/>`);
      return;
    }
    if (f === 2) { pes(m, P, 0.3, 0.3, 1.4, 1.4, 0.75, 0.1); m.soltos.push(poli([m.p3(0.2, 0.2, 0.8), m.p3(1.8, 0.2, 0.8), m.p3(1.8, 1.8, 0.8), m.p3(0.2, 1.8, 0.8)], "#BFE3F2", 1.2, ' fill-opacity="0.55"')); return; }
    const marmore = P.estilo === "classico";
    pes(m, P, 0.25, 0.35, 1.5, 1.3, 0.6, 0.15);
    const t = m.cx(0.15, 0.25, 0.6, 1.7, 1.5, 0.2, marmore ? "#EFEBE4" : P.cor);
    const [x, y] = m.p3(1.1, 1.0, 0.8); m.extra(t, `<rect x="${f1(x - 3)}" y="${f1(y - 6)}" width="6" height="6" rx="1" fill="#C0392B" stroke="${TINTA}" stroke-width="0.8"/>`);
  },
  tv(m, f, P) {
    if (f === 1 || f === 4) {
      m.cx(0.3, 0, 0, 2.4, 0.9, 1.4, P.madeira);
      if (f === 4) { const t = m.cx(0.7, 0.05, 1.4, 1.6, 0.8, 1.3, "#5A5A5A"); m.frente(t, 0.85, 0.85, 1.95, 1.55, 2.5, "#3A4A3A", 0.8); const [x, y] = m.p3(1.3, 0.4, 2.7); m.soltos.push(`<path d="M${f1(x)} ${f1(y)} l-6 -9 M${f1(x)} ${f1(y)} l6 -10" stroke="${TINTA}" stroke-width="1.2"/>`); return; }
      const t = m.cx(0.6, 0.25, 1.4, 1.8, 0.25, 1.25, PRETO); tela(m, t, 0.5, 0.7, 2.3, 1.5, 2.55); return;
    }
    const suspenso = P.estilo === "moderno" && f === 2, zr = suspenso ? 0.6 : 0, hr = suspenso ? 0.6 : 1.0;
    const r = m.cx(0, 0, zr, 3, 0.9, hr, P.cor);
    m.frente(r, 0.9, 0.1, 1.45, zr + 0.12, zr + hr - 0.15, escuro(P.cor, 0.12), 0.8);
    m.frente(r, 0.9, 1.55, 2.9, zr + 0.12, zr + hr - 0.15, escuro(P.cor, 0.12), 0.8);
    neon(m, r, 0.9, 0, 3, zr + 0.02, P);
    const z0 = zr + hr + 0.3, lw = f === 2 ? 2.6 : 3, h = f === 2 ? 1.5 : 1.9;
    const t = m.cx((3 - lw) / 2, 0.1, z0, lw, 0.15, h, "#151515"); tela(m, t, 0.25, (3 - lw) / 2 + 0.08, (3 + lw) / 2 - 0.08, z0 + 0.08, z0 + h - 0.08);
    if (P.estilo === "gamer") m.frente(t, 0.25, (3 - lw) / 2, (3 + lw) / 2, z0 - 0.05, z0 + 0.02, P.detalhe, 0);
    if (f === 3 && P.estilo === "classico") m.cx(0.6, 0.35, hr, 1.8, 0.35, 0.25, "#3A3A3A");
  },
  som(m, f, P) {
    const alto = (p: Parte, u: number, v: number, z: number, r = 3) => { if (m.frenteVisivel) { const [x, y] = m.p3(u, v, z); m.extra(p, `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="#555" stroke="${TINTA}" stroke-width="0.8"/>`); } };
    if (f === 1) { const p = m.cx(0.6, 0.2, 0, 0.8, 0.6, 0.9, P.cor); alto(p, 1.0, 0.8, 0.45); return; }
    if (f === 4) {
      if (P.estilo === "brasileiro") { const p = m.cx(0.3, 0.1, 0, 1.4, 0.8, 0.9, P.madeira); m.frente(p, 0.9, 0.4, 1.0, 0.2, 0.7, "#D9C9A3", 0.8); alto(p, 1.35, 0.9, 0.45, 2); return; }
      pes(m, P, 0.2, 0.15, 1.6, 0.7, 0.9, 0.12); const p = m.cx(0.1, 0.05, 0.9, 1.8, 0.9, 0.5, ESTILOS.classico.madeira[0]); const [x, y] = m.p3(1, 0.5, 1.4); m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="8" ry="4" fill="#111" stroke="${TINTA}" stroke-width="0.8"/><circle cx="${f1(x)}" cy="${f1(y)}" r="1.6" fill="#C0392B"/>`); return;
    }
    if (f === 2) { m.cx(0, 0, 0, 2, 0.9, 0.9, P.estilo === "gamer" ? PRETO : "#E9E5DD"); const b = m.cx(0.2, 0.3, 0.9, 1.6, 0.35, 0.3, P.cor); neon(m, b, 0.65, 0.2, 1.8, 0.9, P); return; }
    for (const u of [0, 1.3]) { const p = m.cx(u, 0.1, 0, 0.7, 0.8, 2.6, P.estilo === "rustico" ? ESTILOS.rustico.madeira[0] : P.cor); for (const z of [0.7, 1.7]) alto(p, u + 0.35, 0.9, z, 3.2); }
  },
  estante(m, f, P) {
    const h = 4.4, p = m.cx(0, 0, 0, 3, 1, h, P.cor), prat = [0.2, 1.25, 2.3, 3.35];
    for (const z of prat) m.frente(p, 1, 0.12, 2.88, z, z + 0.9, escuro(P.cor, 0.45), 0.8);
    neon(m, p, 1, 0.12, 2.88, h - 0.12, P);
    if (!m.frenteVisivel) return;
    const coisas = ["#C0392B", "#2E86C1", "#F1C40F", "#27AE60", "#8E44AD", "#E67E22", "#ECF0F1"];
    prat.forEach((z, i) => {
      if (f === 1) for (let k = 0; k < 7; k++) m.frente(p, 1, 0.25 + k * 0.36, 0.5 + k * 0.36, z, z + 0.6 + ((k * 7) % 3) * 0.08, coisas[(k + i) % 7], 0.6);
      else if (f === 2) for (let k = 0; k < 2; k++) { const u = 0.45 + k * 1.3; m.frente(p, 1, u, u + 0.9, z + 0.08, z + 0.8, coisas[(k * 3 + i) % 7], 0.7); m.frente(p, 1, u + 0.38, u + 0.52, z + 0.55, z + 0.7, BRANCO, 0); }
      else for (let k = 0; k < 3; k++) { const [x, y] = m.p3(0.6 + k * 0.9, 1, z + 0.38); m.extra(p, `<circle cx="${f1(x)}" cy="${f1(y)}" r="5" fill="${BRANCO}" stroke="${TINTA}" stroke-width="1"/><path d="M${f1(x - 2)} ${f1(y - 2)} l2 -1 l2 1 l-1 2.5 h-2 Z" fill="${TINTA}"/>`); }
    });
  },
  luminaria(m, f, P) {
    const cupula = P.estilo === "gamer" ? P.detalhe : P.cor;
    if (f === 1) {
      const cm = m.cx(0.05, 0.05, 0, 0.9, 0.9, 1.15, P.madeira); m.frente(cm, 0.95, 0.15, 0.85, 0.55, 0.62, escuro(P.madeira, 0.3), 0.6);
      m.cx(0.42, 0.42, 1.15, 0.16, 0.16, 0.5, "#DDD");
      const [x, y] = m.p3(0.5, 0.5, 1.95);
      m.soltos.push(P.estilo === "brasileiro" ? `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="8" ry="6" fill="#D9B47A" stroke="${TINTA}" stroke-width="1.1"/><path d="M${f1(x - 7)} ${f1(y)} h14 M${f1(x - 6)} ${f1(y + 3)} h12" stroke="#A88452" stroke-width="0.8"/>`
        : `<path d="M${f1(x - 5)} ${f1(y - 5)} L${f1(x + 5)} ${f1(y - 5)} L${f1(x + 8)} ${f1(y + 5)} L${f1(x - 8)} ${f1(y + 5)} Z" fill="${cupula}" stroke="${TINTA}" stroke-width="1.2"/>`);
      return;
    }
    if (f === 2) {
      if (P.estilo === "rustico") { const b = m.p3(0.5, 0.5, 3.4); m.cx(0.4, 0.4, 0, 0.2, 0.2, 0, "#000", 0); m.soltos.push([m.p3(0.1, 0.1, 0), m.p3(0.9, 0.2, 0), m.p3(0.5, 0.9, 0)].map((p) => linha(p, b, ESTILOS.rustico.madeira[0], 2.4)).join("")); }
      else { m.cx(0.25, 0.25, 0, 0.5, 0.5, 0.15, PRETO); m.cx(0.45, 0.45, 0.15, 0.1, 0.1, 3.3, PRETO); }
      const [x, y] = m.p3(0.5, 0.5, 3.75);
      m.soltos.push(`<path d="M${f1(x - 6)} ${f1(y - 6)} L${f1(x + 6)} ${f1(y - 6)} L${f1(x + 9)} ${f1(y + 6)} L${f1(x - 9)} ${f1(y + 6)} Z" fill="${cupula}" stroke="${TINTA}" stroke-width="1.2"/>`);
      return;
    }
    const base = m.cx(0.25, 0.25, 0, 0.5, 0.5, 0.15, PRETO);
    const [x0, y0] = m.p3(0.5, 0.5, 0.15), [x1, y1] = m.p3(0.5, 0.5, 3.6), arco = P.estilo === "classico" ? P.detalhe : "#9BA4A8";
    const dx = 22;
    m.extra(base, `<path d="M${f1(x0)} ${f1(y0)} C${f1(x0)} ${f1(y1 - 10)} ${f1(x1 + dx)} ${f1(y1 - 16)} ${f1(x1 + dx)} ${f1(y1 + 6)}" stroke="${TINTA}" stroke-width="3" fill="none"/><path d="M${f1(x0)} ${f1(y0)} C${f1(x0)} ${f1(y1 - 10)} ${f1(x1 + dx)} ${f1(y1 - 16)} ${f1(x1 + dx)} ${f1(y1 + 6)}" stroke="${arco}" stroke-width="1.4" fill="none"/>`);
    m.soltos.push(`<path d="M${f1(x1 + dx - 8)} ${f1(y1 + 12)} A8 7 0 0 1 ${f1(x1 + dx + 8)} ${f1(y1 + 12)} Z" fill="${cupula}" stroke="${TINTA}" stroke-width="1.2"/>`);
  },
  geladeira(m, f, P) {
    const lw = [0, 1.4, 1.8, 2, 1.7][f], h = [0, 1.7, 3.9, 4.1, 3.4][f], u0 = (2 - lw) / 2, c = P.cor;
    const p = m.cx(u0, 0.2, 0, lw, 1.6, h, c);
    if (f === 4) { m.frente(p, 1.8, u0 + 0.05, u0 + lw - 0.05, h * 0.6, h * 0.62, escuro(c, 0.35), 0.6); m.frente(p, 1.8, u0 + lw - 0.35, u0 + lw - 0.22, h * 0.66, h * 0.86, "#E0E0E0", 0.6); m.frente(p, 1.8, u0 + lw - 0.35, u0 + lw - 0.22, h * 0.3, h * 0.5, "#E0E0E0", 0.6); return; }
    if (f === 1) { m.frente(p, 1.8, u0 + lw - 0.25, u0 + lw - 0.15, 0.9, 1.4, "#888", 0.7); if (P.estilo === "brasileiro") { m.frente(p, 1.8, u0 + 0.3, u0 + 0.6, 1.1, 1.4, "#2E7D4F", 0.6); m.frente(p, 1.8, u0 + 0.7, u0 + 0.9, 0.6, 0.85, "#D7263D", 0.6); } return; }
    m.frente(p, 1.8, u0 + 0.05, u0 + lw - 0.05, h * 0.62, h * 0.63, escuro(c, 0.35), 0.6);
    if (f === 3) m.frente(p, 1.8, u0 + lw / 2 - 0.01, u0 + lw / 2 + 0.01, 0.1, h - 0.1, escuro(c, 0.35), 0.6);
    const pux = P.estilo === "classico" ? P.detalhe : "#6F7275";
    m.frente(p, 1.8, u0 + lw / 2 - 0.2, u0 + lw / 2 - 0.13, h * 0.68, h * 0.85, pux, 0.6);
    if (f === 3) m.frente(p, 1.8, u0 + lw / 2 + 0.13, u0 + lw / 2 + 0.2, h * 0.68, h * 0.85, pux, 0.6);
  },
  fogao(m, f, P) {
    const c = P.cor;
    if (f === 1) {
      const corpo = P.estilo === "basico" ? "#EDEDED" : c, p = m.cx(0.3, 0.3, 0, 1.4, 1.3, 1.7, corpo);
      for (const u of [0.65, 1.35]) { const [x, y] = m.p3(u, 0.95, 1.7); m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5" ry="2.6" fill="#2A2A2A" stroke="${TINTA}" stroke-width="0.8"/>`); }
      m.frente(p, 1.6, 0.45, 1.55, 0.25, 1.15, escuro(corpo, 0.15), 0.8); return;
    }
    if (f === 4) {
      const tijolo = P.estilo === "rustico" ? "#3A3A3A" : "#B5603F";
      const p = m.cx(0, 0.2, 0, 2, 1.6, 1.7, tijolo);
      m.topo(p, 0.05, 1.95, 0.25, 1.75, 1.7, "#2A2A2A", 1);
      for (const u of [0.55, 1.4]) { const [x, y] = m.p3(u, 1.0, 1.7); m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5" ry="2.5" fill="#555" stroke="${TINTA}" stroke-width="0.8"/>`); }
      m.frente(p, 1.8, 0.3, 1.0, 0.25, 0.85, "#1A0F0A", 0.8); m.frente(p, 1.8, 0.4, 0.9, 0.3, 0.45, "#E67E22", 0);
      m.cx(1.45, 0.3, 1.7, 0.4, 0.4, 3.2, tijolo); return;
    }
    const bancada = P.estilo === "classico" ? "#EFEBE4" : "#E6E1D6";
    const p = m.cx(0, f === 3 ? 0.2 : 0, 0, 2, f === 3 ? 1.6 : 1.4, 1.8, f === 2 ? "#5B6770" : escuro(c, 0.3));
    m.topo(p, 0, 2, f === 3 ? 0.2 : 0, f === 3 ? 1.8 : 1.4, 1.8, bancada, 1);
    if (f === 2) { m.topo(p, 0.35, 1.65, 0.2, 1.1, 1.81, "#1C1C1C", 0.8); m.frente(p, 1.4, 0.3, 1.7, 0.25, 1.35, "#22272B", 0.8); m.frente(p, 1.4, 0.4, 1.6, 1.2, 1.26, "#BFC5C9", 0); }
    else {
      m.topo(p, 0.3, 1.1, 0.45, 1.2, 1.81, "#1C1C1C", 0.8);
      const [x, y] = m.p3(1.5, 1.0, 1.8); m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5" ry="2.5" fill="#B7D7E8" stroke="${TINTA}" stroke-width="0.8"/>`);
      const [lx, ly] = m.p3(1, 1, 4.8), [bx, by] = m.p3(1, 1, 3.6);
      m.soltos.push(`${linha([lx, ly - 12], [bx, by], TINTA, 1.2)}<path d="M${f1(bx - 7)} ${f1(by)} L${f1(bx + 7)} ${f1(by)} L${f1(bx + 4)} ${f1(by + 5)} L${f1(bx - 4)} ${f1(by + 5)} Z" fill="${P.estilo === "classico" ? P.detalhe : "#E3B341"}" stroke="${TINTA}" stroke-width="1.1"/>`);
    }
  },
  bancada(m, f, P) {
    const tampo = P.estilo === "classico" ? "#EFEBE4" : P.estilo === "moderno" ? "#F2F2F2" : P.estilo === "brasileiro" ? "#4A4A4A" : "#D9D4CB";
    const p = m.cx(0, 0, 0, 3, 1.5, 1.7, P.cor);
    for (const u of [0.1, 1.55]) m.frente(p, 1.5, u, u + 1.35, 0.15, 1.55, escuro(P.cor, 0.08), 0.7);
    const tp = m.cx(0, 0, 1.7, 3, 1.55, 0.15, tampo);
    m.topo(tp, 0.95, 2.05, 0.3, 1.1, 1.86, P.estilo === "rustico" ? "#B87333" : "#9AA3A8", 0.9);
    const [tx, ty] = m.p3(1.5, 0.15, 1.86); m.extra(tp, `<path d="M${f1(tx)} ${f1(ty)} v-10 q0 -3 4 -2" stroke="#C9CDD0" stroke-width="2" fill="none"/>`);
    if (P.estilo === "brasileiro") { const [x, y] = m.p3(2.6, 0.5, 1.85); m.soltos.push(`<path d="M${f1(x - 5)} ${f1(y)} q-2 -10 5 -14 q7 4 5 14 Z" fill="#C97B4A" stroke="${TINTA}" stroke-width="1"/><ellipse cx="${f1(x)}" cy="${f1(y - 14)}" rx="4" ry="2" fill="#A35E35" stroke="${TINTA}" stroke-width="0.8"/>`); }
    if (f === 2 && P.estilo !== "moderno") m.cx(0, 0, 3.6, 3, 0.8, 1.4, P.cor);
  },
  mesaJantar(m, f, P) {
    const cadC = P.estilo === "brasileiro" ? CHITA[0] : P.estilo === "classico" ? P.tecido : P.estilo === "moderno" ? "#E9E3D6" : escuro(P.madeira, 0.1);
    const cadeira = (u: number, v: number, costas: "n" | "s" | "l" | "o") => {
      m.cx(u, v, 0, 0.7, 0.7, 0.9, cadC, 1);
      if (costas === "n") m.cx(u, v, 0.9, 0.7, 0.12, 1.0, cadC, 1);
      if (costas === "s") m.cx(u, v + 0.58, 0.9, 0.7, 0.12, 1.0, cadC, 1);
      if (costas === "o") m.cx(u, v, 0.9, 0.12, 0.7, 1.0, cadC, 1);
      if (costas === "l") m.cx(u + 0.58, v, 0.9, 0.12, 0.7, 1.0, cadC, 1);
    };
    const nc = f === 1 ? 2 : 3, larg = 2.6, u0 = 0.7, passo = larg / nc;
    for (let i = 0; i < nc; i++) cadeira(u0 + i * passo + (passo - 0.7) / 2, 0, "n");
    if (f === 1) { cadeira(0, 1.15, "o"); cadeira(3.3, 1.15, "l"); }
    const vidro = P.estilo === "moderno";
    if (!vidro) for (const [u, v] of [[u0 + 0.1, 0.85], [u0 + larg - 0.25, 0.85], [u0 + 0.1, 2.0], [u0 + larg - 0.25, 2.0]]) m.cx(u, v, 0, 0.15, 0.15, 1.45, escuro(P.cor, 0.25));
    else m.cx(u0 + 1.1, 1.3, 0, 0.4, 0.4, 1.45, P.metal);
    const corT = f === 3 ? "#EDEAE4" : P.estilo === "brasileiro" ? "#E8C27A" : P.cor;
    const tampo = m.cx(u0, 0.75, 1.45, larg, 1.5, vidro ? 0.08 : 0.15, vidro ? "#BFE3F2" : corT);
    const [x, y] = m.p3(2, 1.5, 1.6);
    if (f === 3) m.extra(tampo, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="7" ry="3.5" fill="#C9A04A" stroke="${TINTA}" stroke-width="1"/><circle cx="${f1(x - 2)}" cy="${f1(y - 3)}" r="2.5" fill="#E74C3C"/><circle cx="${f1(x + 3)}" cy="${f1(y - 3)}" r="2.5" fill="#F39C12"/>`);
    else m.extra(tampo, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5" ry="2.5" fill="${BRANCO}" stroke="${TINTA}" stroke-width="0.8"/>`);
    for (let i = 0; i < nc; i++) cadeira(u0 + i * passo + (passo - 0.7) / 2, 2.3, "s");
  },
  vaso(m, f, P) {
    if (f === 2) { m.cx(0.1, 0, 0.6, 0.8, 0.3, 1.8, "#E8E8E8"); const b = m.cx(0.15, 0.3, 0.5, 0.7, 1.0, 0.55, BRANCO); m.topo(b, 0.25, 0.75, 0.45, 1.2, 1.06, P.estilo === "classico" ? P.detalhe : "#DDD", 0.8); return; }
    m.cx(0.1, 0, 0, 0.8, 0.45, 1.9, BRANCO);
    m.cx(0.25, 0.45, 0, 0.5, 0.6, 0.6, BRANCO);
    const b = m.cx(0.15, 0.45, 0.6, 0.7, 1.0, 0.2, BRANCO); m.topo(b, 0.25, 0.75, 0.55, 1.35, 0.81, "#D9D9D9", 0.8);
  },
  pia(m, f, P) {
    if (f === 1) {
      if (P.estilo === "rustico") { const p = m.cx(0.1, 0.05, 0, 1.8, 0.85, 1.7, "#9C9488"); m.topo(p, 0.4, 1.6, 0.2, 0.75, 1.71, "#6F675C", 0.8); }
      else { m.cx(0.75, 0.3, 0, 0.5, 0.4, 1.4, BRANCO); const p = m.cx(0.25, 0.05, 1.4, 1.5, 0.85, 0.35, BRANCO); m.topo(p, 0.45, 1.55, 0.2, 0.75, 1.76, "#D0D4D6", 0.8); }
    } else {
      const cb = P.estilo === "classico" ? "#EFEBE4" : P.cor, p = m.cx(0, 0, 0.8, 2, 0.95, 0.9, cb);
      m.frente(p, 0.95, 0.1, 1.9, 0.9, 1.6, escuro(cb, 0.08), 0.6);
      const [x, y] = m.p3(1, 0.5, 1.7); m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y - 3)}" rx="7" ry="3.5" fill="${BRANCO}" stroke="${TINTA}" stroke-width="1"/>`);
    }
    const [tx, ty] = m.p3(1, 0.12, 1.75); m.soltos.push(`<path d="M${f1(tx)} ${f1(ty)} v-7 q0 -2 3 -1" stroke="${P.estilo === "classico" ? P.detalhe : "#B9BEC2"}" stroke-width="1.8" fill="none"/>`);
    if (m.face === "+y" || m.face === "+x") m.soltos.push(`<path d="${caminho([m.p3(0.4, 0.02, 2.6), m.p3(1.6, 0.02, 2.6), m.p3(1.6, 0.02, 4.2), m.p3(0.4, 0.02, 4.2)])}" fill="#CFE6EE" stroke="${TINTA}" stroke-width="1.1"/>`);
  },
  chuveiro(m, f, P) {
    const c = f === 2 ? (P.estilo === "classico" ? P.detalhe : "#9BA4A8") : "#E6E6E6";
    const base = m.cx(0.05, 0.05, 0, 1.9, 1.9, 0.12, "#E9E5DD");
    m.topo(base, 0.9, 1.1, 0.9, 1.1, 0.13, "#888", 0);
    const [cx, cy] = m.p3(1, 0.15, 4.3), [bx, by] = m.p3(1, 0.05, 4.6);
    m.extra(base, `${linha([bx, by], [cx, cy], c, 2)}<ellipse cx="${f1(cx)}" cy="${f1(cy + 2)}" rx="${f === 2 ? 7 : 4}" ry="${f === 2 ? 3 : 2}" fill="${c}" stroke="${TINTA}" stroke-width="1"/>`);
    if (f === 1 && P.estilo === "brasileiro") m.soltos.push(poli([m.p3(0.05, 1.95, 0.4), m.p3(1.95, 1.95, 0.4), m.p3(1.95, 1.95, 4.4), m.p3(0.05, 1.95, 4.4)], CHITA[2], 1.2, ' fill-opacity="0.85"'));
    else m.soltos.push(poli([m.p3(0.05, 1.95, 0.12), m.p3(1.95, 1.95, 0.12), m.p3(1.95, 1.95, 4.6), m.p3(0.05, 1.95, 4.6)], "#CFEAF4", 1.2, ' fill-opacity="0.35"'));
  },
  banheira(m, f, P) {
    if (f === 2) pes(m, P, 0.15, 0.3, 1.7, 3.4, 0.35, 0.18);
    const z0 = f === 2 ? 0.35 : 0, c = f === 2 ? P.cor : BRANCO;
    const p = m.cx(0.05, 0.1, z0, 1.9, 3.8, 1.2, c);
    m.topo(p, 0.25, 1.75, 0.3, 3.7, z0 + 1.2, "#8FD0EA", 1);
    const [x, y] = m.p3(1, 0.3, z0 + 1.6); m.extra(p, `<path d="M${f1(x)} ${f1(y)} q0 -6 5 -6" stroke="${P.estilo === "classico" ? ESTILOS.classico.detalhe : "#B9BEC2"}" stroke-width="2" fill="none"/>`);
  },
  videogame(m, f, P) {
    if (f === 1) {
      m.cx(0.2, 0.2, 0, 0.7, 0.45, 0.3, P.estilo === "brasileiro" ? "#7A7A7A" : PRETO);
      const pufe = m.cx(0.5, 0.8, 0, 1.2, 1.1, 0.85, P.cor); m.topo(pufe, 0.7, 1.5, 1.0, 1.7, 0.85, claro(P.cor, 0.25), 0.6); return;
    }
    if (f === 2) {
      m.cx(0.2, 0.1, 0, 0.7, 0.45, 0.35, "#F2F2F2");
      m.cx(0.7, 0.6, 0, 0.8, 0.8, 0.3, PRETO); m.cx(0.55, 0.6, 0.45, 1.1, 0.9, 0.4, P.cor);
      const enc = m.cx(0.55, 1.35, 0.85, 1.1, 0.25, 2.1, P.cor); neon(m, enc, 1.6, 0.6, 1.6, 2.6, P);
      m.cx(0.45, 0.8, 0.85, 0.15, 0.5, 0.4, PRETO); m.cx(1.6, 0.8, 0.85, 0.15, 0.5, 0.4, PRETO); return;
    }
    m.cx(0, 0, 0, 2, 0.9, 1.5, "#2A2A2A");
    const mon = m.cx(0.15, 0.15, 1.5, 1.7, 0.15, 1.0, "#101010"); tela(m, mon, 0.3, 0.25, 1.75, 1.58, 2.42);
    m.frente(mon, 0.3, 0.15, 1.85, 1.45, 1.52, P.detalhe, 0);
    m.cx(0.5, 1.05, 0, 0.9, 0.85, 0.85, PRETO); m.cx(0.5, 1.7, 0.85, 0.9, 0.2, 1.8, P.cor);
  },
  sinuca(m, f, P) {
    const mad = P.estilo === "moderno" ? "#2B2B2B" : ESTILOS[P.estilo].madeira[0];
    for (const [u, v] of [[0.4, 0.5], [3.25, 0.5], [0.4, 5.15], [3.25, 5.15]]) m.cx(u, v, 0, 0.35, 0.35, 1.2, escuro(mad, 0.15));
    const t = m.cx(0.1, 0.2, 1.2, 3.8, 5.6, 0.45, mad);
    m.topo(t, 0.4, 3.6, 0.5, 5.5, 1.66, P.cor, 1);
    const bolas = ["#F1C40F", "#C0392B", "#2E86C1", "#111", "#27AE60", BRANCO];
    bolas.forEach((c, i) => { const [x, y] = m.p3(1.2 + (i % 3) * 0.5, 1.8 + Math.floor(i / 3) * 0.5 + (i === 5 ? 2 : 0), 1.66); m.extra(t, `<circle cx="${f1(x)}" cy="${f1(y - 1.5)}" r="2" fill="${c}" stroke="${TINTA}" stroke-width="0.6"/>`); });
    m.soltos.push(linha(m.p3(2.8, 2.5, 1.9), m.p3(3.4, 5.2, 2.1), "#D8B37A", 2));
    if (f === 2) for (const v of [1.5, 4]) { const [x, y] = m.p3(2, v, 5.2); m.soltos.push(`${linha([x, y - 18], [x, y], TINTA, 1)}<path d="M${f1(x - 9)} ${f1(y)} h18 l-3 5 h-12 Z" fill="${P.estilo === "classico" ? ESTILOS.classico.detalhe : "#2E7D4F"}" stroke="${TINTA}" stroke-width="1"/>`); }
  },
  pebolim(m, _f, P) {
    for (const [u, v] of [[0.2, 0.3], [1.6, 0.3], [0.2, 2.5], [1.6, 2.5]]) m.cx(u, v, 0, 0.2, 0.2, 1.2, escuro(P.cor, 0.2));
    const t = m.cx(0.1, 0.2, 1.2, 1.8, 2.6, 0.7, P.cor);
    m.topo(t, 0.25, 1.75, 0.35, 2.65, 1.9, "#3E9B4F", 1);
    for (let i = 0; i < 4; i++) { const v = 0.6 + i * 0.6; m.soltos.push(linha(m.p3(-0.3, v, 1.75), m.p3(2.2, v, 1.75), "#C9CDD0", 1.6)); }
  },
  fliperama(m, _f, P) {
    const p = m.cx(0.2, 0, 0, 1.6, 1, 4.2, P.cor);
    m.frente(p, 1, 0.35, 1.65, 2.2, 3.4, "#14202E", 1);
    m.frente(p, 1, 0.35, 1.65, 3.6, 4.0, P.estilo === "gamer" ? "#18E0C8" : "#F2B705", 0.8);
    m.cx(0.15, 0.95, 1.7, 1.7, 0.5, 0.25, escuro(P.cor, 0.2));
  },
  piano(m, f, P) {
    const c = P.cor;
    if (f === 1) {
      const p = m.cx(0, 0, 0, 3, 1.1, 3.4, c); m.frente(p, 1.1, 0.3, 2.7, 2.2, 3.1, escuro(c, 0.15), 0.6);
      const k = m.cx(0.1, 1.1, 1.6, 2.8, 0.6, 0.25, c); m.topo(k, 0.2, 2.8, 1.15, 1.6, 1.86, BRANCO, 0.8);
      m.cx(0.8, 2.1, 0, 1.4, 0.7, 1.2, c); return;
    }
    for (const [u, v] of [[0.3, 0.4], [2.45, 0.4], [1.3, 2.4]]) m.cx(u, v, 0, 0.25, 0.25, 1.6, escuro(c, 0.2));
    const corpo = m.cx(0, 0.2, 1.6, 3, 2.6, 0.7, c);
    m.cx(0.2, 2.8, 1.9, 2.6, 0.2, 0.15, BRANCO);
    m.extra(corpo, linha(m.p3(0.2, 0.4, 2.3), m.p3(2.4, 0.4, 4.4), TINTA, 1.2));
    m.soltos.push(poli([m.p3(0.2, 0.3, 2.3), m.p3(2.8, 0.3, 2.3), m.p3(2.8, 0.3, 4.3)], c, 1.2));
  },
  aquario(m, _f, P) {
    m.cx(0, 0, 0, 2, 1, 1.4, P.cor);
    const ag = m.cx(0.05, 0.05, 1.4, 1.9, 0.9, 1.4, "#5FB7D9");
    m.topo(ag, 0.05, 1.95, 0.05, 0.95, 2.8, "#A9DFF2", 0.8);
    m.frente(ag, 0.95, 0.05, 1.95, 1.4, 1.6, "#D8C8A0", 0);
    if (m.frenteVisivel) for (const [u, z, c] of [[0.5, 1.9, "#F39C12"], [1.3, 2.3, P.estilo === "classico" ? "#F1C40F" : "#E74C3C"], [0.9, 2.5, "#3498DB"]] as const) { const [x, y] = m.p3(u, 0.95, z); m.extra(ag, `<path d="M${f1(x)} ${f1(y)} q3 -2 6 0 q-3 2 -6 0 Z M${f1(x)} ${f1(y)} l-2 -2 v4 Z" fill="${c}" stroke="${TINTA}" stroke-width="0.5"/>`); }
  },
  esteira(m, f, P) {
    if (f === 1) {
      m.cx(0.6, 0.6, 0, 0.8, 2.8, 0.25, P.cor);
      m.cx(0.85, 0.7, 0.25, 0.3, 0.3, 2.2, P.cor); m.cx(0.6, 0.6, 2.4, 0.8, 0.25, 0.15, PRETO);
      m.cx(0.85, 2.6, 0.25, 0.3, 0.3, 1.5, P.cor); m.cx(0.65, 2.45, 1.75, 0.7, 0.6, 0.2, PRETO); return;
    }
    m.cx(0.25, 0, 0, 0.15, 0.15, 3, P.cor); m.cx(1.6, 0, 0, 0.15, 0.15, 3, P.cor);
    const painel = m.cx(0.25, 0, 2.6, 1.5, 0.35, 0.45, PRETO); m.frente(painel, 0.35, 0.5, 1.5, 2.7, 2.95, P.estilo === "gamer" ? P.detalhe : "#2E86C1", 0.6);
    const base = m.cx(0.1, 0.3, 0, 1.8, 3.6, 0.45, f === 3 ? "#DDE3E6" : PRETO);
    m.topo(base, 0.35, 1.65, 0.6, 3.75, 0.46, "#3B3B3B", 0.8);
    if (f === 3) m.soltos.push(poli([m.p3(0.1, 0.3, 0.45), m.p3(0.1, 3.9, 0.45), m.p3(0.1, 3.9, 2.0), m.p3(0.1, 0.3, 2.0)], "#BFE3F2", 1, ' fill-opacity="0.35"') + poli([m.p3(1.9, 0.3, 0.45), m.p3(1.9, 3.9, 0.45), m.p3(1.9, 3.9, 2.0), m.p3(1.9, 0.3, 2.0)], "#BFE3F2", 1, ' fill-opacity="0.35"'));
  },
  pesos(m, f, P) {
    const c = P.cor;
    if (P.estilo === "brasileiro") {
      m.cx(0.2, 0.6, 0, 2.6, 0.8, 0, "#000", 0);
      for (const u of [0.2, 2.2]) { const [x, y] = m.p3(u + 0.3, 1.0, 0); m.soltos.push(`<path d="M${f1(x - 7)} ${f1(y)} v-9 a7 3.5 0 0 1 14 0 v9 a7 3.5 0 0 1 -14 0 Z" fill="#9EA19A" stroke="${TINTA}" stroke-width="1.1"/><ellipse cx="${f1(x)}" cy="${f1(y - 9)}" rx="7" ry="3.5" fill="#B9B6AE" stroke="${TINTA}" stroke-width="1"/>`); }
      m.soltos.push(linha(m.p3(0.5, 1.0, 1.3), m.p3(2.5, 1.0, 1.3), "#7A6A5A", 3)); return;
    }
    if (f >= 2) {
      const h = f === 2 ? 4.2 : 4.6;
      m.cx(0.1, 0.1, 0, 0.2, 0.2, h, c); m.cx(2.7, 0.1, 0, 0.2, 0.2, h, c); m.cx(0.1, 0.1, h - 0.2, 2.8, 0.2, 0.2, c);
      if (f === 3) { m.cx(0.1, 1.4, 0, 0.2, 0.2, h, c); m.cx(2.7, 1.4, 0, 0.2, 0.2, h, c); m.cx(0, 0.7, 2.8, 3, 0.12, 0.12, "#BBB"); for (const u of [0.0, 2.8]) m.cx(u, 0.45, 2.4, 0.2, 0.6, 0.9, PRETO); }
      else m.cx(1.1, 0.15, 0.5, 0.8, 0.15, 2.4, PRETO);
    }
    m.cx(0.9, 0.7, 0, 0.2, 0.2, 0.7, "#555"); m.cx(1.9, 0.7, 0, 0.2, 0.2, 0.7, "#555");
    m.cx(0.75, 0.55, 0.7, 1.5, 1.4, 0.25, f === 1 ? c : PRETO);
    for (const u of [0, 2.5]) { m.cx(u + 0.05, 1.5, 0, 0.18, 0.45, 0.4, PRETO, 1); m.cx(u + 0.27, 1.5, 0, 0.18, 0.45, 0.4, PRETO, 1); }
  },
  maca(m, _f, P) {
    for (const [u, v] of [[0.3, 0.3], [1.55, 0.3], [0.3, 3.55], [1.55, 3.55]]) m.cx(u, v, 0, 0.15, 0.15, 1.4, "#9BA4A8", 1);
    const t = m.cx(0.2, 0.2, 1.4, 1.6, 3.6, 0.35, P.cor);
    m.topo(t, 0.4, 1.6, 0.3, 0.8, 1.76, escuro(P.cor, 0.15), 0.6);
    m.cx(0.3, 1.6, 1.75, 1.4, 1.2, 0.08, BRANCO, 0.8);
  },
  gelo(m, f, P) {
    if (f === 1) { const b = m.cx(0.4, 0.4, 0, 1.2, 1.2, 0, "#000", 0), [x, y] = m.p3(1, 1, 0); m.extra(b, `<path d="M${f1(x - 11)} ${f1(y)} v-18 a11 5.5 0 0 1 22 0 v18 a11 5.5 0 0 1 -22 0 Z" fill="#2E86C1" stroke="${TINTA}" stroke-width="1.2"/><ellipse cx="${f1(x)}" cy="${f1(y - 18)}" rx="11" ry="5.5" fill="#DDF3FB" stroke="${TINTA}" stroke-width="1.1"/><rect x="${f1(x - 4)}" y="${f1(y - 20)}" width="4" height="3" fill="#FFF" stroke="#9CC" stroke-width="0.5"/>`); return; }
    const p = m.cx(0.05, 0.05, 0, 1.9, 1.9, 1.4, P.cor);
    m.topo(p, 0.25, 1.75, 0.25, 1.75, 1.41, "#DDF3FB", 0.9);
  },
  tapete(m, f, P) {
    const c = P.cor, p = m.cx(0.2, 0.2, 0.01, 3.6, 2.6, 0, c, 1.1);
    if (f === 4) { for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) m.topo(p, 0.2 + i * 0.9, 1.1 + i * 0.9, 0.2 + k * 0.87, 1.07 + k * 0.87, 0.01, CHITA[(i + k) % 4], 0.4); return; }
    if (f === 1) for (const v of [0.8, 1.5, 2.2]) m.topo(p, 0.2, 3.8, v, v + 0.18, 0.01, contraste(c, 0.3), 0);
    if (f === 2) { if (P.estilo === "gamer") { const [x, y] = m.p3(2, 1.5, 0.01); m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="14" ry="7" fill="${BRANCO}" stroke="${TINTA}" stroke-width="1"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="7" ry="3.5" fill="${P.detalhe}"/>`); } else m.topo(p, 0.6, 3.4, 0.55, 2.45, 0.01, claro(c, 0.25), 0); }
    if (f === 3) { m.topo(p, 0.45, 3.55, 0.45, 2.55, 0.01, "#C9A04A", 0.8); m.topo(p, 0.7, 3.3, 0.7, 2.3, 0.01, c, 0.8); m.topo(p, 1.6, 2.4, 1.2, 1.8, 0.01, "#1F3A5F", 0.6); }
  },
  planta(m, f, P) {
    const pot = P.estilo === "brasileiro" ? "#B0703A" : f === 3 ? "#C9A27A" : f === 2 ? "#E9E3D6" : "#C26D4A";
    const folha = { basico: "#5E9C4E", moderno: "#2F7A45", rustico: "#6FAE4E", classico: "#6F8E4E", gamer: "#2F7A45", brasileiro: "#3F8A4A" }[P.estilo];
    const v = m.cx(0.2, 0.2, 0, 0.6, 0.6, f === 1 ? 0.5 : 0.8, pot);
    const [cx, cy] = m.p3(0.5, 0.5, f === 1 ? 0.8 : f === 2 ? 2.0 : 3.4);
    if (f === 1) { m.extra(v, `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="6" ry="4.5" fill="${folha}" stroke="${TINTA}" stroke-width="1.2"/>`); return; }
    const [bx, by] = m.p3(0.5, 0.5, 0.8);
    if (f === 2) {
      let s = "";
      for (const [dx, dy, r] of [[-8, 4, 0], [8, 2, 30], [0, -7, -20], [-4, -2, 50], [5, -4, -60]]) s += `${linha([bx, by], [cx + dx * 0.7, cy + dy * 0.7], "#3B5E2B", 1.2)}<ellipse cx="${f1(cx + dx)}" cy="${f1(cy + dy)}" rx="${P.estilo === "brasileiro" ? 9 : 7}" ry="${P.estilo === "brasileiro" ? 2.4 : 3.8}" transform="rotate(${r} ${f1(cx + dx)} ${f1(cy + dy)})" fill="${folha}" stroke="${TINTA}" stroke-width="1.1"/>`;
      m.extra(v, s); return;
    }
    if (P.estilo === "rustico") {
      let s = linha([bx, by], [cx, cy + 8], "#7A6A3A", 3);
      for (const [dx, dy, r] of [[-10, 0, -30], [10, -2, 30], [0, -10, 0]]) s += `<ellipse cx="${f1(cx + dx)}" cy="${f1(cy + dy)}" rx="12" ry="4" transform="rotate(${r} ${f1(cx + dx)} ${f1(cy + dy)})" fill="${folha}" stroke="${TINTA}" stroke-width="1.1"/>`;
      m.extra(v, s); return;
    }
    m.extra(v, linha([bx, by], [cx, cy + 6], "#6B4A30", 3) + [[0, 0, 12], [-9, 5, 8], [9, 4, 8], [0, -7, 8]].map(([dx, dy, r]) => `<circle cx="${f1(cx + dx)}" cy="${f1(cy + dy)}" r="${r}" fill="${folha}" stroke="${TINTA}" stroke-width="1.2"/>`).join("") + `<circle cx="${f1(cx - 3)}" cy="${f1(cy - 2)}" r="5" fill="${claro(folha, 0.2)}"/>`);
  },
  escultura(m, f, P) {
    const base = m.cx(0.15, 0.15, 0, 0.7, 0.7, 1.6, f === 3 ? "#EFEBE4" : f === 2 ? "#2B2B2B" : "#E9E5DD");
    const [x, y] = m.p3(0.5, 0.5, 1.6);
    if (f === 1) m.extra(base, `<circle cx="${f1(x)}" cy="${f1(y - 7)}" r="7" fill="#C49A6C" stroke="${TINTA}" stroke-width="1.2"/><path d="M${f1(x - 6)} ${f1(y - 9)} q6 3 12 0 M${f1(x)} ${f1(y - 14)} v14" stroke="#7A4A2A" stroke-width="0.9" fill="none"/>`);
    if (f === 2) m.extra(base, `<path d="M${f1(x - 6)} ${f1(y)} C${f1(x - 10)} ${f1(y - 20)} ${f1(x + 10)} ${f1(y - 14)} ${f1(x + 2)} ${f1(y - 28)} C${f1(x + 12)} ${f1(y - 18)} ${f1(x + 6)} ${f1(y - 6)} ${f1(x + 6)} ${f1(y)} Z" fill="${P.cor}" stroke="${TINTA}" stroke-width="1.2"/>`);
    if (f === 3) m.extra(base, `<path d="M${f1(x - 8)} ${f1(y)} q0 -8 8 -9 q8 1 8 9 Z" fill="#F4F1EA" stroke="${TINTA}" stroke-width="1.1"/><circle cx="${f1(x)}" cy="${f1(y - 14)}" r="6" fill="#F4F1EA" stroke="${TINTA}" stroke-width="1.1"/>`);
  },
  trofeus(m, f, P) {
    const h = f === 1 ? 2 : 4.6, p = m.cx(0, 0, 0, 4, 1, h, P.cor);
    if (f >= 2) { m.frente(p, 1, 0.15, 3.85, 0.9, h - 0.3, f === 3 ? "#1F1A14" : "#CFE6EE", 0.9); m.frente(p, 1, 0.15, 3.85, 2.6, 2.66, "#E8E8E8", 0); }
    if (!m.frenteVisivel) return;
    const taca = (u: number, z: number, e = 1) => { const [x, y] = m.p3(u, 0.6, z); return `<path d="M${f1(x - 4 * e)} ${f1(y - 9 * e)} h${f1(8 * e)} q0 ${f1(6 * e)} ${f1(-4 * e)} ${f1(7 * e)} q${f1(-4 * e)} ${f1(-1 * e)} ${f1(-4 * e)} ${f1(-7 * e)} Z M${f1(x - 1)} ${f1(y - 2 * e)} h2 v${f1(2 * e)} h${f1(2 * e)} v2 h${f1(-6 * e)} v-2 h${f1(2 * e)} Z" fill="#E3B341" stroke="${TINTA}" stroke-width="1"/>`; };
    let s = "";
    if (f === 1) for (const u of [0.8, 2, 3.2]) s += taca(u, 2.05);
    else for (const z of [0.95, 2.7]) for (const u of f === 3 ? [0.6, 1.5, 2.5, 3.4] : [0.9, 2, 3.1]) s += taca(u, z, f === 3 && z > 2 ? 1.25 : 1);
    m.extra(p, s);
    if (f === 3) for (const u of [0.8, 2, 3.2]) { const [x, y] = m.p3(u, 1, h); m.extra(p, `<path d="M${f1(x)} ${f1(y)} l-6 22 h12 Z" fill="#FFF3B0" opacity="0.25"/>`); }
  },
  piscina(m, f, P) {
    const borda = f === 2 ? "#3A3A3A" : f === 1 ? "#E8E2D4" : "#F2EFE9", agua = f === 2 ? "#2E9CCA" : P.estilo === "basico" ? "#4FB3D9" : "#1F8FBF";
    const p = m.cx(0, 0, 0.01, 6, 5, 0, borda, 1.2);
    m.topo(p, 0.45, 5.55, 0.45, 4.55, 0.01, escuro(agua, 0.35), 1.2);
    m.topo(p, 0.95, 5.55, 0.95, 4.55, 0.01, agua, 0);
    const brilho = (u: number, v: number) => { const [x, y] = m.p3(u, v, 0.01); return `<path d="M${f1(x - 8)} ${f1(y)} q4 -3 8 0 q4 3 8 0" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.4" fill="none"/>`; };
    m.extra(p, brilho(2, 2) + brilho(4, 3.4) + brilho(3.2, 1.4));
    if (f >= 2) for (const u of [1.5, 3, 4.5]) { const [x, y] = m.p3(u, 0.95, 0.01); m.extra(p, `<circle cx="${f1(x)}" cy="${f1(y + 3)}" r="2" fill="#FFF6C8"/>`); }
    if (f === 3) { const h = m.cx(4.3, 3.3, 0, 1.6, 1.6, 0.7, "#E9E5DD"); m.topo(h, 4.5, 5.7, 3.5, 4.7, 0.71, "#7FD4F0", 0.8); const g = m.cx(0.1, 3.6, 0, 1.3, 1.3, 0.8, "#AAB7BF"); m.topo(g, 0.25, 1.25, 3.75, 4.75, 0.81, "#DDF3FB", 0.8); }
  },
  espreguicadeira(m, f, P) {
    if (f === 3) {
      for (const [u, v] of [[0, 0], [1.85, 0], [0, 3.85], [1.85, 3.85]]) m.cx(u, v, 0, 0.15, 0.15, 3.4, P.madeira);
      m.cx(0, 0, 0, 2, 4, 0.6, P.madeira); m.cx(0.05, 0.05, 0.6, 1.9, 3.9, 0.4, P.cor); travesseiro(m, 0.2, 0.2, 1.0, 1.6);
      m.soltos.push(poli([m.p3(0, 0, 3.4), m.p3(2, 0, 3.4), m.p3(2, 4, 3.4), m.p3(0, 4, 3.4)], BRANCO, 1.2, ' opacity="0.9"')); return;
    }
    const base = f === 1 ? "#D35400" : P.estilo === "moderno" ? "#C9CDD0" : P.madeira;
    for (const [u, v] of [[0.3, 0.3], [1.55, 0.3], [0.3, 3.5], [1.55, 3.5]]) m.cx(u, v, 0, 0.15, 0.15, 0.6, escuro(base, 0.2));
    const assento = m.cx(0.25, 1.4, 0.6, 1.5, 2.5, 0.2, f === 1 ? P.cor : base);
    if (f === 1) listras(m, assento, 0.25, 1.75, 1.4, 3.9, 0.8, [P.cor, BRANCO]);
    for (let i = 0; i < 3; i++) m.cx(0.25, 0.3 + i * 0.37, 0.6 + i * 0.4, 1.5, 0.4, 0.42, f === 1 ? P.cor : base, 1);
    if (f === 2) m.cx(0.35, 1.6, 0.8, 1.3, 2.1, 0.15, P.cor, 1);
  },
  churrasqueira(m, f, P) {
    if (f === 1) {
      for (const [u, v] of [[0.6, 0.6], [1.3, 0.6], [0.95, 1.3]]) m.cx(u, v, 0, 0.1, 0.1, 1.1, PRETO);
      const b = m.cx(0.5, 0.5, 1.1, 1.0, 1.0, 0, "#000", 0); const [x, y] = m.p3(1, 1, 1.4);
      m.extra(b, `<path d="M${f1(x - 10)} ${f1(y)} A10 7 0 0 0 ${f1(x + 10)} ${f1(y)} Z" fill="${P.cor}" stroke="${TINTA}" stroke-width="1.2"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="10" ry="4" fill="#5A5A5A" stroke="${TINTA}" stroke-width="1"/>`); return;
    }
    const tij = P.estilo === "brasileiro" ? "#E8DCC4" : P.estilo === "rustico" ? "#B5603F" : "#7F8C8D";
    const corpo = m.cx(0, 0.2, 0, 2, 1.6, 2.0, tij);
    if (P.estilo === "rustico") for (let z = 0.3; z < 2; z += 0.35) m.frente(corpo, 1.8, 0, 2, z, z + 0.03, escuro(tij, 0.3), 0);
    m.frente(corpo, 1.8, 0.4, 1.6, 0.9, 1.7, "#2A1A12", 1); m.frente(corpo, 1.8, 0.45, 1.55, 1.0, 1.08, "#E74C3C", 0);
    m.cx(0.4, 0.4, 2.0, 1.2, 1.0, f === 3 ? 0.6 : 1.4, f === 3 ? "#9EA7AA" : tij);
    m.cx(0.75, 0.6, f === 3 ? 2.6 : 3.4, 0.5, 0.5, f === 3 ? 2.4 : 1.6, f === 3 ? "#9EA7AA" : escuro(tij, 0.1));
  },
  mesaExterna(m, f, P) {
    const corC = f === 1 ? BRANCO : P.estilo === "moderno" ? "#C9CDD0" : ESTILOS[P.estilo].madeira[0];
    const cadeira = (u: number, v: number, cost: "n" | "s" | "o" | "l") => {
      m.cx(u, v, 0, 0.7, 0.7, 0.85, corC, 1);
      if (cost === "n") m.cx(u, v, 0.85, 0.7, 0.12, 0.9, corC, 1); if (cost === "s") m.cx(u, v + 0.58, 0.85, 0.7, 0.12, 0.9, corC, 1);
      if (cost === "o") m.cx(u, v, 0.85, 0.12, 0.7, 0.9, corC, 1); if (cost === "l") m.cx(u + 0.58, v, 0.85, 0.12, 0.7, 0.9, corC, 1);
    };
    cadeira(1.15, 0, "n");
    m.cx(1.35, 1.35, 0, 0.3, 0.3, 1.4, corC);
    m.cx(0.75, 0.75, 1.4, 1.5, 1.5, 0.12, corC);
    cadeira(0, 1.15, "o"); cadeira(2.3, 1.15, "l"); cadeira(1.15, 2.3, "s");
    const [px, py] = m.p3(1.5, 1.5, 1.5), [tx, ty] = m.p3(1.5, 1.5, 4.6);
    const cores = f === 1 ? ["#D7263D", "#F2B705"] : [P.cor, claro(P.cor, 0.3)];
    m.soltos.push(`${linha([px, py], [tx, ty], "#555", 1.6)}<path d="M${f1(tx - 26)} ${f1(ty + 10)} Q${f1(tx)} ${f1(ty - 10)} ${f1(tx + 26)} ${f1(ty + 10)} Z" fill="${cores[0]}" stroke="${TINTA}" stroke-width="1.2"/><path d="M${f1(tx - 13)} ${f1(ty + 4)} Q${f1(tx)} ${f1(ty - 6)} ${f1(tx + 13)} ${f1(ty + 4)} L${f1(tx)} ${f1(ty - 4)} Z" fill="${cores[1]}" stroke="${TINTA}" stroke-width="0.8"/>`);
  },
  trave(m, f) {
    m.cx(0, 0.2, 0, 0.2, 0.2, 2.6, BRANCO); m.cx(5.8, 0.2, 0, 0.2, 0.2, 2.6, BRANCO); m.cx(0, 0.2, 2.6, 6, 0.2, 0.2, BRANCO);
    m.soltos.push(poli([m.p3(0.2, 0.3, 2.6), m.p3(5.8, 0.3, 2.6), m.p3(5.8, 1.8, 0), m.p3(0.2, 1.8, 0)], "#FFFFFF", 0.8, ' fill-opacity="0.18"'));
    for (let u = 0.8; u < 5.8; u += 0.6) m.soltos.push(linha(m.p3(u, 0.3, 2.6), m.p3(u, 1.8, 0), "#FFFFFF", 0.6, ' opacity="0.6"'));
    const [x, y] = m.p3(3, 1.6, 0); m.soltos.push(`<circle cx="${f1(x)}" cy="${f1(y - 4)}" r="4" fill="${BRANCO}" stroke="${TINTA}" stroke-width="1"/><path d="M${f1(x - 1.5)} ${f1(y - 5.5)} l1.5 -1 l1.5 1 l-0.5 2 h-2 Z" fill="${TINTA}"/>`);
    if (f === 2) for (const u of [1.2, 4.6]) { const [a, b] = m.p3(u, 0.3, 1.6); m.soltos.push(`<rect x="${f1(a - 4)}" y="${f1(b - 4)}" width="8" height="8" fill="none" stroke="#E74C3C" stroke-width="1.6"/>`); }
  },
  jacuzzi(m, _f, P) {
    const p = m.cx(0, 0, 0, 3, 3, 1.3, P.cor === "#2B2B2B" ? "#3A3A3A" : "#E9E5DD");
    const [x, y] = m.p3(1.5, 1.5, 1.3);
    m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="17" ry="8.5" fill="#7FD4F0" stroke="${TINTA}" stroke-width="1.1"/><circle cx="${f1(x - 5)}" cy="${f1(y - 1)}" r="1.6" fill="#FFF"/><circle cx="${f1(x + 4)}" cy="${f1(y + 2)}" r="1.3" fill="#FFF"/><circle cx="${f1(x + 1)}" cy="${f1(y - 3)}" r="1.1" fill="#FFF"/>`);
  },
  fogueira(m, f, P) {
    if (f === 1) {
      const b = m.cx(0.2, 0.2, 0, 1.6, 1.6, 0, "#000", 0), [x, y] = m.p3(1, 1, 0);
      let pedras = ""; for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; pedras += `<ellipse cx="${f1(x + 13 * Math.cos(a))}" cy="${f1(y + 6.5 * Math.sin(a))}" rx="4" ry="2.6" fill="#9C9488" stroke="${TINTA}" stroke-width="0.9"/>`; }
      m.extra(b, pedras + `<path d="M${f1(x - 6)} ${f1(y)} l12 -3 M${f1(x - 6)} ${f1(y - 3)} l12 3" stroke="#6B4A30" stroke-width="2.6"/><path d="M${f1(x - 5)} ${f1(y - 2)} q-1 -10 5 -16 q1 6 5 8 q1 4 -2 8 Z" fill="#F39C12" stroke="${TINTA}" stroke-width="1"/><path d="M${f1(x - 1)} ${f1(y - 3)} q0 -5 3 -8 q2 5 0 8 Z" fill="#F7DC6F"/>`);
      return;
    }
    const p = m.cx(0.1, 0.1, 0, 1.8, 1.8, 0.9, P.cor);
    m.topo(p, 0.3, 1.7, 0.3, 1.7, 0.91, "#2A2A2A", 0.8);
    const [fx, fy] = m.p3(1, 1, 0.9);
    m.extra(p, `<path d="M${f1(fx - 8)} ${f1(fy)} q2 -8 4 -6 q2 -6 4 -2 q2 -6 4 2 q2 -4 4 6 Z" fill="#F39C12" stroke="${TINTA}" stroke-width="0.9"/>`);
  },
  carro(m, f, P) {
    const c = P.cor;
    const larg = f === 4 ? 3.5 : f === 3 || f === 6 ? 3.3 : f === 5 ? 3.2 : 3.1, u0 = (4 - larg) / 2;
    const v0 = f === 1 ? 0.8 : 0.3, v1 = f === 1 ? 6.2 : 6.7, hr = f === 3 || f === 6 ? 1.15 : 0.9;
    const roda = (lado: number, v: number) => m.cx(lado ? u0 + larg : u0 - 0.3, v, 0, 0.3, 1.1, hr, "#1A1A1A", 1.1);
    roda(0, v0 + 0.7); roda(1, v0 + 0.7);
    if (f === 5) {
      const corpo = m.cx(u0, v0, 0.35, larg, v1 - v0, 2.5, c);
      m.frente(corpo, v1, u0, u0 + larg, 0.35, 1.5, BRANCO, 1);
      m.frente(corpo, v1, u0 + 0.3, u0 + larg - 0.3, 1.9, 2.6, "#2B3C4C", 1);
      m.topo(corpo, u0, u0 + larg, v0, v1, 2.85, BRANCO, 1.2);
      roda(0, v1 - 1.75); roda(1, v1 - 1.75); return;
    }
    const zb = f === 3 || f === 6 ? 0.55 : 0.35, hb = f === 3 ? 1.35 : f === 6 ? 1.1 : f === 4 ? 0.8 : 1.0;
    const corpo = m.cx(u0, v0, zb, larg, v1 - v0, hb, c);
    const [c0, c1, hc] = f === 1 ? [v0 + 1.2, v1 - 1.6, 1.0] : f === 2 ? [v0 + 1.6, v1 - 2.2, 0.95] : f === 3 ? [v0 + 0.7, v1 - 1.9, 1.2] : f === 6 ? [v0 + 2.8, v1 - 1.6, 1.15] : [v0 + 2.2, v1 - 2.6, 0.65];
    const cab = m.cx(u0 + 0.25, c0, zb + hb, larg - 0.5, c1 - c0, hc, c);
    m.frente(cab, c1, u0 + 0.4, u0 + larg - 0.4, zb + hb + 0.1, zb + hb + hc - 0.12, "#2B3C4C", 1);
    m.topo(cab, u0 + 0.35, u0 + larg - 0.35, c0 + 0.15, c1 - 0.15, zb + hb + hc, claro(c, 0.22), 0.8);
    if (f === 6) m.topo(corpo, u0 + 0.2, u0 + larg - 0.2, v0 + 0.2, c0 - 0.2, zb + hb, escuro(c, 0.35), 0.8);
    m.frente(corpo, v1, u0 + 0.15, u0 + 0.75, zb + hb * 0.5, zb + hb * 0.78, "#FFF4C2", 0.8);
    m.frente(corpo, v1, u0 + larg - 0.75, u0 + larg - 0.15, zb + hb * 0.5, zb + hb * 0.78, "#FFF4C2", 0.8);
    m.frente(corpo, v1, u0 + 1.0, u0 + larg - 1.0, zb + 0.08, zb + hb * 0.4, "#1E1E1E", 0.8);
    if (f === 4) { m.cx(u0 + 0.2, v0 + 0.05, zb + hb + 0.15, larg - 0.4, 0.4, 0.12, PRETO); m.cx(u0 + 0.5, v0 + 0.25, zb + hb, 0.12, 0.12, 0.17, PRETO); m.cx(u0 + larg - 0.62, v0 + 0.25, zb + hb, 0.12, 0.12, 0.17, PRETO); }
    roda(0, v1 - 1.75); roda(1, v1 - 1.75);
  },
  moto(m, f, P) {
    m.cx(0.85, 0.2, 0, 0.3, 1.0, 0.9, "#1A1A1A");
    m.cx(0.8, 0.9, 0.5, 0.4, 2.2, 0.7, P.cor);
    m.cx(0.75, 1.6, 1.2, 0.5, 1.0, 0.25, PRETO);
    if (f === 2) m.cx(0.8, 2.6, 1.0, 0.4, 0.8, 0.6, P.cor);
    m.cx(0.85, 2.8, 0, 0.3, 1.0, 0.9, "#1A1A1A");
    m.soltos.push(linha(m.p3(0.4, 3.2, 2.1), m.p3(1.6, 3.2, 2.1), "#555", 2));
  },
  mesa(m, f, P) {
    const c = P.cor;
    for (const [u, v] of [[0.1, 0.1], [2.75, 0.1], [0.1, 1.6], [2.75, 1.6]]) m.cx(u, v, 0, 0.15, 0.15, 1.45, P.estilo === "moderno" ? P.metal : escuro(c, 0.2));
    const t = m.cx(0, 0, 1.45, 3, 1.85, P.estilo === "rustico" ? 0.25 : 0.15, c);
    neon(m, t, 1.85, 0, 3, 1.45, P);
    if (f === 1) { m.cx(0.3, 0.3, 1.6, 0.7, 0.5, 0.35, "#ECECEC"); m.cx(1.9, 0.2, 1.6, 0.25, 0.25, 0.9, "#E3B341"); }
    if (f === 2) { m.cx(0.9, 0.6, 1.6, 1.2, 0.8, 0.05, "#B9BEC2"); const sc = m.cx(0.9, 0.55, 1.65, 1.2, 0.06, 0.75, "#B9BEC2"); tela(m, sc, 0.61, 0.98, 2.02, 1.7, 2.33); }
    if (f === 3) for (const u of [0.15, 1.55]) { const sc = m.cx(u, 0.25, 1.6, 1.3, 0.12, 0.85, "#111111"); tela(m, sc, 0.37, u + 0.06, u + 1.24, 1.66, 2.38); }
  },
  quadro() { /* desenhado na parede */ },
  camisaRel() { /* desenhada na parede */ },
  bolaRel(m, _f, P) {
    const ped = m.cx(0.18, 0.18, 0, 0.64, 0.64, 1.75, "#2B2B2B");
    m.frente(ped, 0.82, 0.28, 0.72, 0.55, 0.85, "#E3B341", 0.7);
    m.cx(0.12, 0.12, 1.75, 0.76, 0.76, 0.12, "#3A3A3A", 1);
    const [x, y] = m.p3(0.5, 0.5, 1.87);
    const r = P.rel, cores = r?.cores ?? ["#262626", "#262626"];
    m.extra(ped, bolaSvg(x, y - 8, 7, r?.modelo ?? "base", cores) +
      `<path d="M${f1(x - 10)} ${f1(y)} v-13 a10 10 0 0 1 20 0 v13 Z" fill="#CFE6EE" fill-opacity="0.22" stroke="${TINTA}" stroke-width="1"/>` +
      `<path d="M${f1(x - 6.5)} ${f1(y - 4)} v-9 a6.5 6.5 0 0 1 4 -6" stroke="#FFFFFF" stroke-opacity="0.75" stroke-width="1.3" fill="none"/>`);
  },
  trofeuRel(m, _f, P) {
    const ped = m.cx(0.2, 0.2, 0, 0.6, 0.6, 1.35, "#4A3426");
    m.frente(ped, 0.8, 0.28, 0.72, 0.45, 0.75, "#E3B341", 0.7);
    const [x, y] = m.p3(0.5, 0.5, 1.35);
    m.extra(ped, trofeuSvg(x, y, P.rel?.modelo ?? "taca", P.rel?.cores ?? ["#E3B341", "#9A7420"]));
  },
};

// ------------------------------------------------------------------ relíquias
/** Bola vista de frente: branca com os gomos da competição. */
function bolaSvg(x: number, y: number, r: number, modelo: string, cores: [string, string] | string[]): string {
  const id = `bl${++seqJanela}`, c1 = cores[0], c2 = cores[1];
  let dentro = "";
  if (modelo === "base") {
    // a clássica: pentágono no meio e pedaços nas bordas
    const pent = (cx: number, cy: number, rr: number) => `<path d="${Array.from({ length: 5 }, (_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return `${i ? "L" : "M"}${f1(cx + rr * Math.cos(a))} ${f1(cy + rr * Math.sin(a))}`; }).join(" ")} Z" fill="${c1}"/>`;
    dentro = pent(x, y, r * 0.38) + [0, 1, 2, 3, 4].map((i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return pent(x + r * 1.02 * Math.cos(a), y + r * 1.02 * Math.sin(a), r * 0.36); }).join("");
  } else {
    dentro = `<path d="M${f1(x - r)} ${f1(y - r * 0.2)} q${f1(r * 0.9)} ${f1(-r * 0.9)} ${f1(r * 2)} ${f1(-r * 0.3)}" stroke="${c1}" stroke-width="${f1(r * 0.42)}" fill="none"/>` +
      `<path d="M${f1(x - r)} ${f1(y + r * 0.5)} q${f1(r)} ${f1(r * 0.6)} ${f1(r * 2)} ${f1(-r * 0.2)}" stroke="${c2}" stroke-width="${f1(r * 0.36)}" fill="none"/>` +
      `<path d="M${f1(x - r * 0.2)} ${f1(y - r)} q${f1(-r * 0.3)} ${f1(r)} ${f1(r * 0.4)} ${f1(r * 2)}" stroke="${c1}" stroke-width="${f1(r * 0.18)}" fill="none" opacity="0.8"/>`;
  }
  return `<clipPath id="${id}"><circle cx="${f1(x)}" cy="${f1(y)}" r="${r}"/></clipPath><circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="#F7F5F0"/><g clip-path="url(#${id})">${dentro}</g>` +
    `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="none" stroke="${TINTA}" stroke-width="1.1"/><circle cx="${f1(x - r * 0.35)}" cy="${f1(y - r * 0.4)}" r="${f1(r * 0.22)}" fill="#FFFFFF" opacity="0.8"/>`;
}

/** Troféu em cima do pedestal; (x, y) é o centro do tampo. */
function trofeuSvg(x: number, y: number, modelo: string, cores: [string, string] | string[]): string {
  const m = cores[0], s = cores[1], lz = claro(m, 0.35), tr = `stroke="${TINTA}" stroke-width="1"`;
  const base = (w: number, h: number) => `<path d="M${f1(x - w)} ${f1(y)} h${f1(2 * w)} v${f1(-h)} h${f1(-2 * w)} Z" fill="#2B2B2B" ${tr}/>`;
  switch (modelo) {
    case "taca": return base(6, 4) +
      `<path d="M${f1(x - 2)} ${f1(y - 4)} h4 l-1 -6 h-2 Z" fill="${s}" ${tr}/>` +
      `<path d="M${f1(x - 8)} ${f1(y - 26)} h16 q0 12 -8 16 q-8 -4 -8 -16 Z" fill="${m}" ${tr}/>` +
      `<path d="M${f1(x - 8)} ${f1(y - 23)} q-6 0 -5 5 q1 4 6 3 M${f1(x + 8)} ${f1(y - 23)} q6 0 5 5 q-1 4 -6 3" stroke="${s}" stroke-width="2" fill="none"/>` +
      `<path d="M${f1(x - 4)} ${f1(y - 24)} q0 7 3 10" stroke="${lz}" stroke-width="1.6" fill="none"/>`;
    case "bola": return base(5, 4) + `<path d="M${f1(x - 2.5)} ${f1(y - 4)} h5 l-1 -4 h-3 Z" fill="${s}" ${tr}/>` +
      `<circle cx="${f1(x)}" cy="${f1(y - 16)}" r="8" fill="${m}" ${tr}/><path d="M${f1(x - 8)} ${f1(y - 16)} q8 -4 16 0 M${f1(x)} ${f1(y - 24)} q-4 8 0 16" stroke="${s}" stroke-width="1" fill="none"/><circle cx="${f1(x - 3)}" cy="${f1(y - 19)}" r="2" fill="${lz}"/>`;
    case "chuteira": return base(6, 4) +
      `<path d="M${f1(x - 7)} ${f1(y - 6)} h14 q2 -1 1 -4 q-5 -1 -8 -4 v-9 h-6 v10 q-2 3 -1 7 Z" fill="${m}" ${tr}/>` +
      `<path d="M${f1(x - 6)} ${f1(y - 6)} v-1 M${f1(x - 2)} ${f1(y - 6)} v-1 M${f1(x + 3)} ${f1(y - 6)} v-1" stroke="${TINTA}" stroke-width="1.6"/>` +
      `<path d="M${f1(x - 5)} ${f1(y - 21)} v8" stroke="${lz}" stroke-width="1.4"/>`;
    case "estrela": return base(5, 4) + `<path d="M${f1(x - 1)} ${f1(y - 4)} h2 v-10 h-2 Z" fill="${s}" ${tr}/>` +
      `<path d="M${f1(x)} ${f1(y - 27)} l2.8 6 6.6 0.7 -5 4.4 1.5 6.5 -5.9 -3.4 -5.9 3.4 1.5 -6.5 -5 -4.4 6.6 -0.7 Z" fill="${m}" ${tr}/>`;
    case "placa": return `<path d="M${f1(x - 7)} ${f1(y)} l2 -24 h10 l2 24 Z" fill="#5A3A26" ${tr}/>` +
      `<path d="M${f1(x - 3.5)} ${f1(y - 6)} l0.8 -14 h5.4 l0.8 14 Z" fill="${m}" ${tr}/><path d="M${f1(x - 1.5)} ${f1(y - 13)} h3 M${f1(x - 1.5)} ${f1(y - 10)} h3" stroke="${s}" stroke-width="1"/>`;
    case "prato": return base(4, 4) + `<path d="M${f1(x - 1)} ${f1(y - 4)} h2 v-4 h-2 Z" fill="${s}" ${tr}/>` +
      `<ellipse cx="${f1(x)}" cy="${f1(y - 17)}" rx="9" ry="9" fill="${m}" ${tr}/><ellipse cx="${f1(x)}" cy="${f1(y - 17)}" rx="6" ry="6" fill="none" stroke="${s}" stroke-width="1.2"/><circle cx="${f1(x - 3)}" cy="${f1(y - 20)}" r="1.8" fill="${lz}"/>`;
  }
  return base(5, 4);
}

/** Camisa emoldurada: padrão e cores do clube, com o seu número. */
function camisaQuadro(p: "esq" | "dir", pos: number, r: Reliquia | undefined): string {
  const P = (t: number, z: number) => naParede(p, t, z), c1 = r?.cores[0] ?? "#2E7D4F", c2 = r?.cores[1] ?? "#FFFFFF", sh = (c: string) => (p === "esq" ? escuro(c, 0.08) : c);
  const t0 = pos - 0.95, t1 = pos + 0.95, z0 = 2.2, z1 = 4.4;
  let sv = poli(quadParede(p, t0, t1, z0, z1), "#1C1C1C", 1.3) + poli(quadParede(p, t0 + 0.12, t1 - 0.12, z0 + 0.12, z1 - 0.12), sh("#2A2F38"), 0.8);
  const forma = [P(pos - 0.42, 2.5), P(pos + 0.42, 2.5), P(pos + 0.42, 3.4), P(pos + 0.72, 3.52), P(pos + 0.58, 3.95), P(pos + 0.2, 4.02), P(pos, 3.86), P(pos - 0.2, 4.02), P(pos - 0.58, 3.95), P(pos - 0.72, 3.52), P(pos - 0.42, 3.4)];
  const id = `cm${++seqJanela}`, Q = (a: number, b: number, za: number, zb: number) => poli(quadParede(p, a, b, za, zb), sh(c2), 0);
  let padrao = "";
  switch (r?.modelo) {
    case "listrasV": for (let t = pos - 0.66; t < pos + 0.72; t += 0.28) padrao += Q(t, t + 0.14, 2.4, 4.1); break;
    case "listrasH": for (let z = 2.55; z < 4.05; z += 0.3) padrao += Q(pos - 0.8, pos + 0.8, z, z + 0.15); break;
    case "faixa": padrao += poli([P(pos - 0.5, 3.95), P(pos - 0.2, 4.05), P(pos + 0.5, 2.85), P(pos + 0.5, 2.5), P(pos + 0.3, 2.5)], sh(c2), 0); break;
    case "faixaH": padrao += Q(pos - 0.8, pos + 0.8, 3.1, 3.4); break;
    default: padrao += Q(pos - 0.8, pos - 0.5, 3.4, 3.62) + Q(pos + 0.5, pos + 0.8, 3.4, 3.62);
  }
  sv += `<clipPath id="${id}"><path d="${caminho(forma)}"/></clipPath>${poli(forma, sh(c1), 0)}<g clip-path="url(#${id})">${padrao}</g>${poli(forma, "none", 1.1)}`;
  sv += poli([P(pos - 0.2, 4.02), P(pos, 3.86), P(pos + 0.2, 4.02), P(pos, 3.94)], sh(c2), 0.7);
  // número nas costas... ou no peito: plano da parede, lendo da esquerda para a direita
  if (r?.numero) {
    const [ox, oy] = P(pos, 3.05), k = 0.1, bx = p === "dir" ? A * k : A * k, by = p === "dir" ? B * k : -B * k;
    const tinta = lum(c1) > 0.55 ? "#1C1C1C" : "#FFFFFF", contorno = lum(c1) > 0.55 ? "#FFFFFF" : "#1C1C1C";
    sv += `<text transform="matrix(${f1(bx)} ${f1(by)} 0 ${f1(H * k)} ${f1(ox)} ${f1(oy)})" font-family="'Barlow Condensed', Arial Narrow, sans-serif" font-weight="800" font-size="5.2" text-anchor="middle" dominant-baseline="middle" fill="${tinta}" stroke="${contorno}" stroke-width="0.35" paint-order="stroke">${r.numero}</text>`;
  }
  sv += poli(quadParede(p, pos - 0.3, pos + 0.3, 2.28, 2.42), "#E3B341", 0.6);
  return sv;
}

// ------------------------------------------------------------------ quadros (na parede)
const naParede = (p: "esq" | "dir", t: number, z: number): Pt => (p === "esq" ? pt(0, t, z) : pt(t, 0, z));
const quadParede = (p: "esq" | "dir", t0: number, t1: number, z0: number, z1: number) => [naParede(p, t0, z0), naParede(p, t1, z0), naParede(p, t1, z1), naParede(p, t0, z1)];

function quadro(p: "esq" | "dir", pos: number, it: Item, cor: string): string {
  if (it.tipo === "camisaRel") return camisaQuadro(p, pos, it.rel);
  const P = (t: number, z: number) => naParede(p, t, z), f = it.forma;
  if (f === 1) {
    const t0 = pos - 0.7, t1 = pos + 0.7, z0 = 2.3, z1 = 4.2, [cx, cy] = P(pos, 3.45);
    const br = it.estilo === "brasileiro", fundo = br ? "#F2B705" : cor;
    return poli(quadParede(p, t0, t1, z0, z1), fundo, 1.2) + poli(quadParede(p, t0, t1, z0, z0 + 0.5), br ? "#2E7D4F" : BRANCO, 0.8) +
      `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="6" fill="${br ? "#1B98E0" : BRANCO}" stroke="${TINTA}" stroke-width="1"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="3" fill="${br ? BRANCO : escuro(fundo, 0.2)}"/>`;
  }
  const t0 = pos - 1.1, t1 = pos + 1.1, z0 = 2.4, z1 = 4.1;
  const moldura = f === 2 ? (it.estilo === "classico" ? "#C9A04A" : "#8A5A35") : f === 4 ? "#2B2B2B" : "#1C1C1C";
  let dentro = poli(quadParede(p, t0 + 0.15, t1 - 0.15, z0 + 0.15, z1 - 0.15), f === 2 ? "#CFE6EE" : f === 4 ? "#E9E5DD" : BRANCO, 0.8);
  if (f === 2) dentro += poli([P(t0 + 0.15, z0 + 0.15), P(t1 - 0.15, z0 + 0.15), P(t1 - 0.15, 3.0), P(pos + 0.3, 3.5), P(pos - 0.4, 3.1), P(t0 + 0.15, 3.4)], it.estilo === "classico" ? "#5E7A46" : "#6FA35A", 0.6);
  if (f === 3) dentro += poli(quadParede(p, t0 + 0.3, pos, z0 + 0.3, 3.4), "#C0392B", 0.6) + poli(quadParede(p, pos + 0.1, t1 - 0.3, 2.9, z1 - 0.3), cor, 0.6) + poli(quadParede(p, pos - 0.5, pos + 0.6, 3.5, z1 - 0.3), "#F1C40F", 0.6);
  if (f === 4) dentro += poli([P(pos - 0.5, 2.7), P(pos + 0.5, 2.7), P(pos + 0.5, 3.45), P(pos + 0.8, 3.35), P(pos + 0.7, 3.8), P(pos + 0.25, 3.9), P(pos, 3.75), P(pos - 0.25, 3.9), P(pos - 0.7, 3.8), P(pos - 0.8, 3.35), P(pos - 0.5, 3.45)], cor, 0.8);
  return poli(quadParede(p, t0, t1, z0, z1), moldura, 1.3) + dentro;
}

// ------------------------------------------------------------------ paredes, pisos e janelas
function desenhaParede(p: "esq" | "dir", L: number, hp: number, ac: Acabamento, clube?: [string, string]): string {
  const r = REVEST[ac.id], cor = clube && r.padrao === "faixa" ? mix(clube[0], "#FFFFFF", 0.84) : r.cores[ac.cor] ?? r.cores[0];
  const sombra = (c: string) => (p === "esq" ? escuro(c, 0.08) : c), base = sombra(cor);
  const Q = (t0: number, t1: number, z0: number, z1: number) => quadParede(p, t0, t1, z0, z1);
  const L2 = (t0: number, z0: number, t1: number, z1: number, c: string, w = 1) => linha(naParede(p, t0, z0), naParede(p, t1, z1), c, w);
  let s = "";
  if (r.padrao === "azulejo") {
    s += poli(Q(0, L, 0, hp), sombra(BRANCO), 1.6);
    for (let t = 0.6; t < L; t += 0.6) s += L2(t, 0, t, hp, "#D5D2CA", 0.8);
    for (let z = 0.6; z < hp; z += 0.6) s += L2(0, z, L, z, "#D5D2CA", 0.8);
    for (let t = 0.3; t < L; t += 0.6) for (let z = 0.3; z < hp; z += 0.6) s += poli([naParede(p, t, z - 0.18), naParede(p, t + 0.18, z), naParede(p, t, z + 0.18), naParede(p, t - 0.18, z)], sombra(cor), 0);
    return s;
  }
  s += poli(Q(0, L, 0, hp), base, 1.6);
  const det = sombra(contraste(cor, 0.12));
  switch (r.padrao) {
    case "descascada": for (let i = 0; i < L * 1.2; i++) { const [x, y] = naParede(p, ((i * 37) % 97) / 97 * L, 0.4 + ((i * 53) % 89) / 89 * (hp - 0.8)); s += i % 3 ? `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${3 + (i % 4)}" ry="${2 + (i % 3)}" fill="${escuro(cor, 0.16)}" opacity="0.55"/>` : `<path d="M${f1(x)} ${f1(y)} l5 -3 l4 2 l-2 4 l-6 1 Z" fill="${claro(cor, 0.35)}" stroke="${escuro(cor, 0.3)}" stroke-width="0.6"/>`; } break;
    case "faixa": s += poli(Q(0, L, 2.2, 2.6), sombra(clube ? clube[0] : "#2E7D4F"), 0.8); if (clube) s += poli(Q(0, L, 2.6, 2.75), sombra(clube[1].toUpperCase() === "#FFFFFF" ? "#FFFFFF" : clube[1]), 0.6); break;
    case "listras": for (let t = 0.3; t < L; t += 0.7) s += poli(Q(t, Math.min(L, t + 0.3), 0, hp), det, 0); break;
    case "floral": for (let t = 0.5, i = 0; t < L; t += 0.9, i++) for (let z = 0.5 + (i % 2) * 0.45; z < hp; z += 0.9) { const [x, y] = naParede(p, t, z); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.8" fill="${contraste(cor, 0.3)}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="0.7" fill="${lum(cor) > 0.5 ? "#C0392B" : "#F2D98A"}"/>`; } break;
    case "geometrico": { const g = lum(cor) < 0.3 ? "#C9A04A" : contraste(cor, 0.3); for (let t = 0; t < L; t += 0.8) for (let z = 0; z < hp - 0.1; z += 0.8) s += poli([naParede(p, t + 0.4, z), naParede(p, Math.min(L, t + 0.8), z + 0.4), naParede(p, t + 0.4, z + 0.8), naParede(p, t, z + 0.4)], "none", 0, ` stroke="${g}" stroke-width="0.8"`); break; }
    case "tijolinho": { const m2 = mix(cor, "#FFFFFF", 0.5); for (let z = 0.35, i = 0; z <= hp; z += 0.35, i++) { s += L2(0, z, L, z, m2, 0.9); for (let t = (i % 2) * 0.4 + 0.4; t < L; t += 0.8) s += L2(t, z - 0.35, t, z, m2, 0.9); } break; }
    case "concreto": for (let t = 0.75; t < L; t += 1.5) for (let z = 0.8; z < hp; z += 1.4) { const [x, y] = naParede(p, t, z); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.1" fill="${escuro(cor, 0.25)}"/>`; } break;
    case "ripado": for (let t = 0.25; t < L; t += 0.25) s += L2(t, 0, t, hp, escuro(cor, 0.35), 0.8); break;
    case "marmoreP": for (let t = 2; t < L; t += 2) s += L2(t, 0, t, hp, contraste(cor, 0.1), 0.8); for (let i = 0; i < L / 2; i++) { const [x, y] = naParede(p, i * 2 + 0.5, 1 + (i % 3)); s += `<path d="M${f1(x)} ${f1(y)} q8 6 6 14 q4 6 10 4" stroke="${contraste(cor, 0.2)}" fill="none" stroke-width="0.8"/>`; } break;
    case "boiserie": { const l = contraste(cor, 0.18); for (let t = 0.4; t + 1.6 <= L; t += 2) { s += poli(Q(t, t + 1.6, 0.6, 1.9), "none", 0, ` stroke="${l}" stroke-width="1.4"`); s += poli(Q(t, t + 1.6, 2.4, hp - 0.6), "none", 0, ` stroke="${l}" stroke-width="1.4"`); } s += L2(0, 2.15, L, 2.15, l, 1.6); break; }
  }
  if (r.padrao !== "ripado" && r.padrao !== "marmoreP" && r.padrao !== "tijolinho") s += poli(Q(0, L, 0, 0.35), sombra("#FFFFFF"), 1);
  return s;
}

function desenhaMuro(p: "esq" | "dir", L: number, ac: Acabamento): string {
  const r = REVEST[ac.id], cor = r.cores[ac.cor] ?? r.cores[0], Q = (t0: number, t1: number, z0: number, z1: number) => quadParede(p, t0, t1, z0, z1);
  const sombra = (c: string) => (p === "esq" ? escuro(c, 0.08) : c);
  if (r.padrao === "vidro") return poli(Q(0, L, 0, 0.5), sombra("#D9DCDA"), 1.4) + poli(Q(0, L, 0.5, 2.4), "#BFE3F2", 1.2, ' fill-opacity="0.4"') + linha(naParede(p, 0, 2.4), naParede(p, L, 2.4), "#9BA4A8", 2);
  if (r.padrao === "cerca") { let s = poli(Q(0, L, 0, 1.9), sombra(cor), 1.4); for (let t = 0.6; t < L; t += 1.2) { const [x, y] = naParede(p, t, 2.0); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="${sombra(claro(cor, 0.05))}" stroke="${TINTA}" stroke-width="1"/>`; } return s; }
  let s = poli(Q(0, L, 0, 1.8), sombra(cor), 1.4);
  if (r.padrao === "pedra") for (let z = 0.3, i = 0; z < 1.8; z += 0.45, i++) for (let t = (i % 2) * 0.5; t + 0.5 < L; t += 1) { const [x, y] = naParede(p, t + 0.5, z); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5.5" ry="3" fill="${sombra(claro(cor, 0.12))}" stroke="${escuro(cor, 0.3)}" stroke-width="0.7"/>`; }
  return s + poli(Q(0, L, 1.8, 2.0), sombra(claro(cor, 0.2)), 1);
}

function desenhaPiso(W: number, Dd: number, ac: Acabamento): string {
  const r = REVEST[ac.id], cor = r.cores[ac.cor] ?? r.cores[0], l2 = escuro(cor, 0.1);
  let s = poli([pt(0, 0), pt(W, 0), pt(W, Dd), pt(0, Dd)], cor, 1.4);
  const L = (x0: number, y0: number, x1: number, y1: number, cl = l2, w = 1) => linha(pt(x0, y0), pt(x1, y1), cl, w);
  const grade = (passo: number) => { for (let x = passo; x < W; x += passo) s += L(x, 0, x, Dd); for (let y = passo; y < Dd; y += passo) s += L(0, y, W, y); };
  const sem = (i: number, n: number) => ((i * 37 + n * 11) % 97) / 97;
  switch (r.padrao) {
    case "ceramica": grade(1); break;
    case "porcelanato": case "porcelanatoExt": grade(2); break;
    case "marmore": grade(2); for (let i = 0; i < (W * Dd) / 12; i++) { const [x, y] = pt(sem(i, 1) * W, sem(i, 5) * Dd); s += `<path d="M${f1(x)} ${f1(y)} q8 3 14 -1 q5 -2 9 1" stroke="${contraste(cor, 0.16)}" stroke-width="0.9" fill="none"/>`; } break;
    case "madeira": for (let y = 0.5; y < Dd; y += 0.5) s += L(0, y, W, y); for (let y = 0, i = 0; y < Dd; y += 0.5, i++) for (let x = 1 + (i % 3) * 0.7; x < W; x += 2.2) s += L(x, y, x, y + 0.5); break;
    case "deck": for (let x = 0.5; x < W; x += 0.5) s += L(x, 0, x, Dd, escuro(cor, 0.2)); break;
    case "taco": for (let x = 0; x < W; x++) for (let y = 0; y < Dd; y++) { if ((x + y) % 2) { s += L(x, y + 0.33, x + 1, y + 0.33); s += L(x, y + 0.66, x + 1, y + 0.66); } else { s += L(x + 0.33, y, x + 0.33, y + 1); s += L(x + 0.66, y, x + 0.66, y + 1); } } grade(1); break;
    case "hidraulico": grade(1); for (let x = 0; x < W; x++) for (let y = 0; y < Dd; y++) s += poli([pt(x + 0.5, y + 0.15), pt(x + 0.85, y + 0.5), pt(x + 0.5, y + 0.85), pt(x + 0.15, y + 0.5)], (x + y) % 2 ? BRANCO : contraste(cor, 0.3), 0); break;
    case "carpete": for (let i = 0; i < (W * Dd) / 2; i++) { const [x, y] = pt(sem(i, 2) * W, sem(i, 7) * Dd); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="0.8" fill="${contraste(cor, 0.12)}"/>`; } break;
    case "cimento": for (let i = 0; i < 6; i++) { const [x, y] = pt(sem(i, 3) * W, sem(i, 9) * Dd); s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="16" ry="6" fill="${escuro(cor, 0.06)}" opacity="0.7"/>`; } break;
    case "epoxi": for (let i = 0; i < 4; i++) { const [x, y] = pt(sem(i, 4) * W, sem(i, 2) * Dd); s += `<path d="M${f1(x)} ${f1(y)} l30 -10" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="3"/>`; } break;
    case "grama": for (let i = 0; i < (W * Dd) / 4; i++) { const [x, y] = pt(sem(i, 1) * W, sem(i, 3) * Dd); s += `<path d="M${f1(x)} ${f1(y)} l-2 -4 M${f1(x + 3)} ${f1(y)} l1 -4" stroke="${escuro(cor, 0.12)}" stroke-width="1.2"/>`; } break;
    case "pedraPiso": for (let x = 0, i = 0; x + 0.6 < W; x += 1.2, i++) for (let y = (i % 2) * 0.6; y + 0.6 < Dd; y += 1.2) { const [a, b] = pt(x + 0.6, y + 0.6); s += `<ellipse cx="${f1(a)}" cy="${f1(b)}" rx="11" ry="5.5" fill="${claro(cor, 0.08)}" stroke="${escuro(cor, 0.25)}" stroke-width="0.8"/>`; } break;
  }
  return s;
}

function janela(p: "esq" | "dir", pos: number, larg: number, vista: Vista, id: string, hp: number): string {
  const t0 = pos - larg / 2, t1 = pos + larg / 2, z0 = 1.7, z1 = Math.min(hp - 1, 4.5);
  const q = quadParede(p, t0, t1, z0, z1), P = (t: number, z: number) => naParede(p, t, z), span = t1 - t0, at = (k: number) => t0 + k * span;
  let cena = poli(q, vista === "mar" ? "#BFE6F5" : "#CDE7F2", 0);
  if (vista === "ct") cena += poli([P(t0, z0), P(t1, z0), P(t1, 2.8), P(t0, 2.8)], "#6FB35A", 0) + `<path d="${caminho([P(at(0.3), 2.8), P(at(0.3), 3.4), P(at(0.7), 3.4), P(at(0.7), 2.8)])}" fill="none" stroke="#FFF" stroke-width="1.4"/>`;
  if (vista === "rua") for (const [a, b, h, c] of [[0, 0.45, 4.2, "#C8B49A"], [0.45, 1, 4.4, "#B9A385"]] as const) cena += poli([P(at(a), z0), P(at(b), z0), P(at(b), h), P(at(a), h)], c, 0.8) + poli([P(at(a + 0.1), 3.2), P(at(a + 0.25), 3.2), P(at(a + 0.25), 3.7), P(at(a + 0.1), 3.7)], "#6E8FA8", 0.6);
  if (vista === "cidade") for (const [a, b, h, c] of [[0, 0.22, 3.4, "#8FA3B3"], [0.22, 0.4, 4.1, "#7C93A6"], [0.4, 0.62, 3.0, "#9AAEBD"], [0.62, 0.8, 3.8, "#8299AC"], [0.8, 1, 3.3, "#93A8B8"]] as const) cena += poli([P(at(a), z0), P(at(b), z0), P(at(b), h), P(at(a), h)], c, 0.6);
  if (vista === "condominio") { cena += poli([P(t0, z0), P(t1, z0), P(t1, 2.4), P(t0, 2.4)], "#7DBB63", 0); for (const k of [0.2, 0.55, 0.85]) { const [x, y] = P(at(k), 2.9); cena += `<circle cx="${f1(x)}" cy="${f1(y)}" r="7" fill="#4E8F44" stroke="${TINTA}" stroke-width="0.8"/>`; } }
  if (vista === "campo") { cena += poli([P(t0, z0), P(t1, z0), P(t1, 2.7), P(at(0.6), 3.1), P(t0, 2.6)], "#8CC56E", 0.6); const [x, y] = P(at(0.3), 3.7); cena += `<circle cx="${f1(x)}" cy="${f1(y)}" r="4" fill="#FFE08A"/>`; }
  if (vista === "mar") { cena += poli([P(t0, z0), P(t1, z0), P(t1, 2.9), P(t0, 2.9)], "#2E8BC0", 0); const [x, y] = P(at(0.75), 3.8); cena += `<circle cx="${f1(x)}" cy="${f1(y)}" r="5" fill="#FFE08A"/>`; }
  const cruz = linha(P((t0 + t1) / 2, z0), P((t0 + t1) / 2, z1), "#FFFFFF", 2.4) + linha(P(t0, 3.2), P(t1, 3.2), "#FFFFFF", 2.4);
  return `<clipPath id="${id}"><path d="${caminho(q)}"/></clipPath><g clip-path="url(#${id})">${cena}</g>${cruz}${poli(q, "none", 2.6)}${poli(quadParede(p, t0 - 0.1, t1 + 0.1, z0 - 0.18, z0), BRANCO, 1.1)}`;
}

export const alturaParede = (c: Comodo) => c.alturaParede ?? (c.ambiente === "externo" ? 2.4 : 5.6);

let seqJanela = 0;
/** Escudo do clube pintado na parede: forma de brasão com faixa diagonal e estrela. */
function escudo(p: "esq" | "dir", pos: number, cores: [string, string]): string {
  const P = (t: number, z: number) => naParede(p, t, z), s = p === "esq" ? escuro : (c: string) => c;
  const contorno = [P(pos - 1.1, 4.7), P(pos + 1.1, 4.7), P(pos + 1.1, 3.4), P(pos + 0.6, 2.75), P(pos, 2.45), P(pos - 0.6, 2.75), P(pos - 1.1, 3.4)];
  const id = `esc${++seqJanela}`;
  const faixa = poli([P(pos - 1.1, 4.0), P(pos - 0.3, 4.7), P(pos + 0.4, 4.7), P(pos + 1.1, 4.1), P(pos + 1.1, 3.3), P(pos - 1.1, 3.3)], s(cores[1], 0.08), 0);
  const [ex, ey] = P(pos, 4.05);
  return `<clipPath id="${id}"><path d="${caminho(contorno)}"/></clipPath>${poli(contorno, s(cores[0], 0.08), 0)}<g clip-path="url(#${id})">${faixa}</g>` +
    `<path d="M${f1(ex)} ${f1(ey - 6)} l1.8 4 4.2 0.4 -3.2 2.8 1 4.2 -3.8 -2.2 -3.8 2.2 1 -4.2 -3.2 -2.8 4.2 -0.4 Z" fill="${cores[0].toUpperCase() === "#FFFFFF" ? "#E3B341" : "#F6DC8A"}" stroke="${TINTA}" stroke-width="0.8"/>${poli(contorno, "none", 2)}`;
}

function estrutura(c: Comodo, m: Imovel, ac: { parede: Acabamento; piso: Acabamento }, clube?: [string, string]): string {
  const W = c.w, Dd = c.d, hp = alturaParede(c);
  const corPiso = REVEST[ac.piso.id].cores[ac.piso.cor] ?? "#999";
  let s = poli([pt(0, Dd, 0), pt(W, Dd, 0), pt(W, Dd, -0.7), pt(0, Dd, -0.7)], escuro(corPiso, 0.35), 1.4);
  s += poli([pt(W, 0, 0), pt(W, Dd, 0), pt(W, Dd, -0.7), pt(W, 0, -0.7)], escuro(corPiso, 0.5), 1.4);
  s += `<g data-chao="1">${desenhaPiso(W, Dd, ac.piso)}</g>`;
  if (c.ambiente === "externo") return s + `<g data-parede="esq">${desenhaMuro("esq", Dd, ac.parede)}</g><g data-parede="dir">${desenhaMuro("dir", W, ac.parede)}</g>`;
  s += `<g data-parede="esq">${desenhaParede("esq", Dd, hp, ac.parede, clube)}</g><g data-parede="dir">${desenhaParede("dir", W, hp, ac.parede, clube)}</g>`;
  s += poli([pt(-ESP, -ESP, hp), pt(0, 0, hp), pt(0, Dd, hp), pt(-ESP, Dd, hp)], "#3B3530", 1.2);
  s += poli([pt(-ESP, -ESP, hp), pt(W, -ESP, hp), pt(W, 0, hp), pt(0, 0, hp)], "#3B3530", 1.2);
  s += poli([pt(-ESP, Dd, -0.7), pt(0, Dd, -0.7), pt(0, Dd, hp), pt(-ESP, Dd, hp)], "#3B3530", 1.2);
  s += poli([pt(W, -ESP, -0.7), pt(W, 0, -0.7), pt(W, 0, hp), pt(W, -ESP, hp)], "#2C2723", 1.2);
  if (c.ambiente === "garagem") {
    const t0 = W / 2 - Math.min(5, W / 2 - 1), t1 = W / 2 + Math.min(5, W / 2 - 1);
    s += poli(quadParede("dir", t0, t1, 0, 3.8), "#8E9592", 1.4);
    for (let z = 0.5; z < 3.8; z += 0.5) s += linha(pt(t0, 0, z), pt(t1, 0, z), "#6F7673", 1);
  }
  for (const j of c.janelas) s += janela(j.parede, j.pos, j.largura, m.vista, `jn${++seqJanela}`, hp);
  if (c.escudo && clube) s += escudo(c.escudo.parede, c.escudo.pos, clube);
  return s;
}

const faceDe = (rot: number): Face => FACES[((rot % 4) + 4) % 4];

/** Desenho de um item numa posição do mundo, sem cômodo em volta. */
function desenharItem(item: string, cor: number, x: number, y: number, rot: number, clube?: [string, string]): string {
  const it = ITENS[item], t = TIPOS[it.tipo];
  const mv = new Movel(x, y, t.w, t.d, faceDe(rot));
  const P = paleta(it, cor);
  P.rel = it.rel;
  if (clube) { P.cor = clube[0]; P.cor2 = clube[1].toUpperCase() === "#FFFFFF" ? "#F4F1EA" : clube[1]; }
  D[it.tipo](mv, it.forma, P);
  return mv.render();
}

export interface OpcoesCena { selecionado?: string; brilho?: string; previa?: Partial<{ parede: Acabamento; piso: Acabamento }> }

/** SVG de um cômodo. Cada objeto fica num <g class="obj" data-uid>; o chão tem data-chao para receber toques. */
export function svgComodo(e: EstadoCasa, comodoId: string, o: OpcoesCena = {}): string {
  const m = imovelAtual(e), c = comodoDe(e, comodoId);
  const ac = { ...acabamento(e, comodoId), ...(o.previa ?? {}) };
  const clube = m.categoria === "alojamento" ? coresDoClube(e.clube) : undefined;
  let s = estrutura(c, m, ac, clube);
  const parede: string[] = [], planos: string[] = [], moveis: { k: number; svg: string }[] = [];
  for (const ob of e.objetos.filter((x) => x.comodo === comodoId)) {
    const it = ITENS[ob.item], t = TIPOS[it.tipo];
    const cls = `class="obj${o.selecionado === ob.uid ? " sel" : ""}${o.brilho === ob.uid ? " novo" : ""}${travado(e, ob) ? " fixo" : ""}" data-uid="${ob.uid}"`;
    if (t.camada === "parede") {
      const sel = o.selecionado === ob.uid ? poli(quadParede(ob.parede!, ob.x - t.w / 2 - 0.15, ob.x + t.w / 2 + 0.15, 2.2, 4.3), "none", 0, ' stroke="#E3B341" stroke-width="2.4"') : "";
      parede.push(`<g ${cls}>${quadro(ob.parede!, ob.x, it, clube && ob.incluso ? clube[0] : paleta(it, ob.cor).cor)}${sel}</g>`);
      continue;
    }
    const a = area(ob);
    const chao = [pt(a.x, a.y), pt(a.x + a.w, a.y), pt(a.x + a.w, a.y + a.d), pt(a.x, a.y + a.d)];
    const sombra = t.camada !== "chao" ? "" : poli([pt(a.x + 0.15, a.y + 0.15), pt(a.x + a.w + 0.25, a.y + 0.15), pt(a.x + a.w + 0.25, a.y + a.d + 0.25), pt(a.x + 0.15, a.y + a.d + 0.25)], "#000", 0, ' opacity="0.13"');
    const contorno = o.selecionado === ob.uid ? poli(chao, "#E3B341", 0, ' fill-opacity="0.18" stroke="#E3B341" stroke-width="2.4"') : "";
    const svg = `<g ${cls}>${sombra}${contorno}${desenharItem(ob.item, ob.cor, a.x, a.y, ob.rot, clube && ob.incluso && (it.tipo === "beliche" || it.tipo === "cama") ? clube : undefined)}</g>`;
    if (t.camada !== "chao") planos.push(svg); else moveis.push({ k: a.x + a.w / 2 + a.y + a.d / 2, svg });
  }
  moveis.sort((p, q) => p.k - q.k);
  s += parede.join("") + planos.join("") + moveis.map((x) => x.svg).join("") + `<g id="fantasma" pointer-events="none"></g>`;
  const hp = alturaParede(c), xs = [pt(-ESP, c.d)[0], pt(c.w, -ESP)[0]], ys = [pt(-ESP, -ESP, Math.max(hp, 3.6))[1], pt(c.w, c.d, -0.7)[1]];
  const pad = 14, vb = [xs[0] - pad, ys[0] - pad, xs[1] - xs[0] + 2 * pad, ys[1] - ys[0] + 2 * pad];
  return `<svg viewBox="${vb.map(f1).join(" ")}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${c.nome}">${s}</svg>`;
}

/** Contorno de onde o objeto vai cair enquanto é arrastado. */
export function svgFantasma(ob: { item: string; x: number; y: number; rot: number; parede?: "esq" | "dir"; cor: number }, valido: boolean): string {
  const t = TIPOS[ITENS[ob.item].tipo], cor = valido ? "#74D394" : "#EC7D69";
  if (t.camada === "parede") return poli(quadParede(ob.parede ?? "dir", ob.x - t.w / 2, ob.x + t.w / 2, 2.3, 4.2), cor, 0, ` fill-opacity="0.35" stroke="${cor}" stroke-width="2.4"`);
  const a = area(ob);
  return poli([pt(a.x, a.y), pt(a.x + a.w, a.y), pt(a.x + a.w, a.y + a.d), pt(a.x, a.y + a.d)], cor, 0, ` fill-opacity="0.3" stroke="${cor}" stroke-width="2.4"`) +
    `<g opacity="0.75">${desenharItem(ob.item, ob.cor, a.x, a.y, ob.rot)}</g>`;
}

/** Miniatura de um item para o catálogo. */
export function svgItem(itemId: string, cor = 0): string {
  const it = ITENS[itemId], t = TIPOS[it.tipo];
  limite = [Infinity, Infinity, -Infinity, -Infinity];
  const corpo = t.camada === "parede" ? quadro("dir", 1.4, it, paleta(it, cor).cor) : desenharItem(itemId, cor, 0, 0, 0);
  let [x0, y0, x1, y1] = limite; limite = null;
  if (it.tipo === "bolaRel" || it.tipo === "trofeuRel") y0 -= 30; // o que fica em cima do pedestal é desenhado fora da grade
  const pad = 10, lado = Math.max(x1 - x0, y1 - y0) + 2 * pad;
  return `<svg viewBox="${f1((x0 + x1) / 2 - lado / 2)} ${f1((y0 + y1) / 2 - lado / 2)} ${f1(lado)} ${f1(lado)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${corpo}</svg>`;
}

/** Amostra de revestimento: um canto com duas paredes e um pedaço de chão. */
export function svgRevestimento(lugar: "parede" | "piso", id: string, cor: number): string {
  const r = REVEST[id], externo = r.ambientes[0] === "externo";
  const parede: Acabamento = lugar === "parede" ? { id, cor } : { id: externo ? "muro" : "pintura", cor: 0 };
  const piso: Acabamento = lugar === "piso" ? { id, cor } : { id: externo ? "grama" : "ceramica", cor: 0 };
  const s = desenhaPiso(4, 4, piso) + (externo ? desenhaMuro("esq", 4, parede) + desenhaMuro("dir", 4, parede) : desenhaParede("esq", 4, 3.4, parede) + desenhaParede("dir", 4, 3.4, parede));
  return `<svg viewBox="-64 -58 128 122" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
}
