// Desenho isométrico dos cômodos no estilo do jogo: traço preto, faces em dois tons (luz vindo da esquerda).
// Eixos: x vai para a direita-baixo, y para a esquerda-baixo, z para cima. Unidade: um ladrilho de meio metro.
// As paredes de trás ficam em x=0 (parede da esquerda) e y=0 (parede da direita); a frente fica aberta.
import { FORMATO, ITENS, MORADIA, areaDoSlot, chave, type Comodo, type EstadoCasa, type Moradia, type Slot } from "../../src/casa";

const A = 14, B = 7, H = 15;
const TINTA = "#16110D";
const ALT_PAREDE = 5.6, ESP = 0.45;
type Pt = [number, number];
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
let caixaLimite: number[] | null = null;
const pt = (x: number, y: number, z = 0): Pt => {
  const p: Pt = [(x - y) * A, (x + y) * B - z * H];
  if (caixaLimite) { caixaLimite[0] = Math.min(caixaLimite[0], p[0]); caixaLimite[1] = Math.min(caixaLimite[1], p[1]); caixaLimite[2] = Math.max(caixaLimite[2], p[0]); caixaLimite[3] = Math.max(caixaLimite[3], p[1]); }
  return p;
};
const caminho = (ps: Pt[]) => `M${ps.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(" L")} Z`;
const poli = (ps: Pt[], fill: string, traco = 1.3, extra = "") =>
  `<path d="${caminho(ps)}" fill="${fill}"${traco ? ` stroke="${TINTA}" stroke-width="${traco}" stroke-linejoin="round"` : ""}${extra}/>`;

function mix(a: string, b: string, t: number): string {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
}
const claro = (c: string, t = 0.16) => mix(c, "#FFFFFF", t);
const escuro = (c: string, t = 0.24) => mix(c, "#000000", t);

/** Caixa no mundo: desenha só as três faces visíveis (frente-esquerda, frente-direita e topo). */
interface Caixa { x: number; y: number; z: number; w: number; d: number; h: number }
function caixa(b: Caixa, cor: string, traco = 1.3): string {
  const { x, y, z, w, d, h } = b;
  if (h <= 0.001) return poli([pt(x, y, z), pt(x + w, y, z), pt(x + w, y + d, z), pt(x, y + d, z)], cor, traco);
  return poli([pt(x, y + d, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x, y + d, z + h)], cor, traco) +
    poli([pt(x + w, y, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x + w, y, z + h)], escuro(cor, 0.22), traco) +
    poli([pt(x, y, z + h), pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x, y + d, z + h)], claro(cor, 0.14), traco);
}

// ------------------------------------------------------------------ montagem de um móvel em coordenadas locais
// Local: u na largura, v na profundidade (v=0 encostado na parede, v=D é a frente do móvel), z para cima.
type Face = "+y" | "-y" | "+x" | "-x";
interface Parte { b: Caixa; svg: string }
class Movel {
  partes: Parte[] = [];
  soltos: string[] = [];
  constructor(public ax: number, public ay: number, public W: number, public D: number, public face: Face) {}
  mundo(u: number, v: number): [number, number] {
    switch (this.face) {
      case "+y": return [this.ax + u, this.ay + v];
      case "-y": return [this.ax + this.W - u, this.ay + this.D - v];
      case "+x": return [this.ax + v, this.ay + u];
      case "-x": return [this.ax + this.D - v, this.ay + u];
    }
  }
  p3(u: number, v: number, z: number): Pt { const [x, y] = this.mundo(u, v); return pt(x, y, z); }
  get frenteVisivel() { return this.face === "+y" || this.face === "+x"; }
  /** Acrescenta uma caixa (u, v, z, largura, fundo, altura). Devolve a parte para pendurar detalhes. */
  cx(u: number, v: number, z: number, lw: number, ld: number, h: number, cor: string, traco = 1.3): Parte {
    const [x0, y0] = this.mundo(u, v), [x1, y1] = this.mundo(u + lw, v + ld);
    const b = { x: Math.min(x0, x1), y: Math.min(y0, y1), z, w: Math.abs(x1 - x0), d: Math.abs(y1 - y0), h };
    const p = { b, svg: caixa(b, cor, traco) };
    this.partes.push(p);
    return p;
  }
  /** Retângulo na face da frente de uma parte (só aparece se a frente estiver virada para quem olha). */
  frente(p: Parte, v: number, u0: number, u1: number, z0: number, z1: number, fill: string, traco = 1) {
    if (!this.frenteVisivel) return;
    p.svg += poli([this.p3(u0, v, z0), this.p3(u1, v, z0), this.p3(u1, v, z1), this.p3(u0, v, z1)], fill, traco);
  }
  topo(p: Parte, u0: number, u1: number, v0: number, v1: number, z: number, fill: string, traco = 1) {
    p.svg += poli([this.p3(u0, v0, z), this.p3(u1, v0, z), this.p3(u1, v1, z), this.p3(u0, v1, z)], fill, traco);
  }
  extra(p: Parte, svg: string) { p.svg += svg; }
  /** Ordena as partes de trás para a frente (uma caixa vem antes se está inteira atrás, à esquerda ou abaixo da outra). */
  render(): string {
    const n = this.partes.length, antes = (a: Caixa, b: Caixa) =>
      a.x + a.w <= b.x + 1e-6 || a.y + a.d <= b.y + 1e-6 || a.z + a.h <= b.z + 1e-6;
    const grau = new Array(n).fill(0), arestas: number[][] = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) {
      const a = this.partes[i].b, b = this.partes[j].b;
      if (antes(a, b) && !antes(b, a)) { arestas[i].push(j); grau[j]++; }
    }
    const fila = [...Array(n).keys()].filter((i) => grau[i] === 0), ordem: number[] = [];
    while (fila.length) {
      fila.sort((i, j) => i - j);
      const i = fila.shift()!; ordem.push(i);
      for (const j of arestas[i]) if (--grau[j] === 0) fila.push(j);
    }
    for (let i = 0; i < n; i++) if (!ordem.includes(i)) ordem.push(i);
    return ordem.map((i) => this.partes[i].svg).join("") + this.soltos.join("");
  }
}

const tela = (m: Movel, p: Parte, v: number, u0: number, u1: number, z0: number, z1: number) => {
  m.frente(p, v, u0, u1, z0, z1, "#1B2A3A");
  if (m.frenteVisivel) m.extra(p, poli([m.p3(u0 + (u1 - u0) * 0.55, v, z0 + 0.05), m.p3(u1 - 0.05, v, z0 + 0.05), m.p3(u1 - 0.05, v, z0 + (z1 - z0) * 0.5)], "#3E6E96", 0));
};
const travesseiro = (m: Movel, u: number, v: number, z: number, lw: number) => m.cx(u, v, z, lw, 0.7, 0.35, "#F4F1EA");

// ------------------------------------------------------------------ catálogo de desenhos
type Desenho = (m: Movel, nivel: number, cor: string) => void;
const MADEIRA = "#A87B50", MADEIRA_ESC = "#6B4A30", METAL = "#9BA4A8", PRETO = "#2A2A2A";

const DESENHOS: Record<string, Desenho> = {
  beliche(m) {
    const pe = (u: number, v: number) => m.cx(u, v, 0, 0.25, 0.25, 4.6, MADEIRA);
    pe(0, 0); pe(1.75, 0);
    m.cx(0.1, 0.1, 0.8, 1.8, 3.8, 0.35, MADEIRA_ESC); m.cx(0.15, 0.15, 1.15, 1.7, 3.7, 0.4, "#E6E1D3");
    travesseiro(m, 0.3, 0.3, 1.55, 1.3); m.cx(0.15, 1.6, 1.55, 1.7, 2.25, 0.12, "#2E7D4F");
    m.cx(0.1, 0.1, 3.1, 1.8, 3.8, 0.35, MADEIRA_ESC); m.cx(0.15, 0.15, 3.45, 1.7, 3.7, 0.4, "#E6E1D3");
    travesseiro(m, 0.3, 0.3, 3.85, 1.3); m.cx(0.15, 1.6, 3.85, 1.7, 2.25, 0.12, "#3A6EA5");
    pe(0, 3.75); pe(1.75, 3.75);
    const esc = m.cx(1.85, 2.4, 0, 0.12, 1.2, 3.4, MADEIRA);
    for (let z = 0.8; z < 3.4; z += 0.7) m.extra(esc, poli([m.p3(1.9, 2.4, z), m.p3(1.9, 3.6, z), m.p3(1.9, 3.6, z + 0.12), m.p3(1.9, 2.4, z + 0.12)], MADEIRA, 0.8));
  },
  cama(m, n, cor) {
    const larg = [0, 2.4, 3.4, 4][n], u0 = (4 - larg) / 2, comp = n === 3 ? 4.4 : 4.6;
    const cabe = m.cx(u0 - (n === 3 ? 0 : 0.05), 0, 0, larg + (n === 3 ? 0 : 0.1), 0.3, [0, 2.2, 2.7, 3.6][n], n === 3 ? "#8C7B6A" : n === 2 ? MADEIRA_ESC : MADEIRA);
    if (n === 3) m.frente(cabe, 0.3, u0 + 0.2, u0 + larg - 0.2, 1.4, 3.3, "#A08E7C");
    m.cx(u0, 0.3, 0, larg, comp - 0.3, 0.8, n === 1 ? MADEIRA : n === 2 ? MADEIRA_ESC : "#7A6A5A");
    m.cx(u0 + 0.05, 0.3, 0.8, larg - 0.1, comp - 0.35, 0.55, "#F2EFE8");
    const nt = n === 1 ? 1 : 2, lt = (larg - 0.4 - (nt - 1) * 0.2) / nt;
    for (let i = 0; i < nt; i++) travesseiro(m, u0 + 0.2 + i * (lt + 0.2), 0.45, 1.35, lt);
    const lenco = m.cx(u0 - 0.02, 1.5, 1.35, larg + 0.04, comp - 1.5 + 0.02, 0.14, cor);
    m.topo(lenco, u0, u0 + larg, 1.5, 1.95, 1.49, claro(cor, 0.35), 0.8);
    if (n === 3) m.cx(u0 + 0.3, 4.55, 0, larg - 0.6, 0.45, 0.9, "#8C7B6A");
  },
  armario(m, n, cor) {
    if (n === 1) {
      m.cx(0.1, 0.35, 0, 0.15, 0.15, 3.6, METAL); m.cx(2.75, 0.35, 0, 0.15, 0.15, 3.6, METAL);
      const cores = ["#C0392B", "#2E86C1", "#F4F1EA", "#27AE60", "#2C3E50", "#E67E22"];
      for (let i = 0; i < 6; i++) m.cx(0.35 + i * 0.4, 0.15, 1.3, 0.32, 0.55, 2.1, cores[i], 1);
      m.cx(0, 0.38, 3.5, 3, 0.1, 0.12, METAL);
      return;
    }
    const h = n === 2 ? 4.4 : 5, p = m.cx(0, 0, 0, 3, 1, h, cor);
    const portas = n === 2 ? 3 : 2;
    for (let i = 1; i < portas; i++) m.frente(p, 1, (3 * i) / portas - 0.01, (3 * i) / portas + 0.01, 0.15, h - 0.15, escuro(cor, 0.4), 0.8);
    for (let i = 0; i < portas; i++) {
      const u = (3 * (i + 1)) / portas - 0.25;
      m.frente(p, 1, u - 0.06, u, h * 0.42, h * 0.56, n === 3 ? "#E3B341" : "#D0D0D0", 0.8);
    }
    if (n === 3) m.frente(p, 1, 0.25, 1.25, 0.4, h - 0.4, "#B9C9D2", 1);
  },
  tv(m, n) {
    if (n === 1) {
      m.cx(0.3, 0, 0, 2.4, 0.9, 1.4, MADEIRA);
      const t = m.cx(0.6, 0.25, 1.4, 1.8, 0.25, 1.25, PRETO); tela(m, t, 0.5, 0.7, 2.3, 1.5, 2.55);
      return;
    }
    const r = m.cx(0, 0, 0, 3, 0.9, n === 2 ? 1.0 : 0.9, n === 2 ? "#E9E5DD" : "#2B2B2B");
    m.frente(r, 0.9, 0.1, 1.45, 0.15, 0.75, escuro(n === 2 ? "#E9E5DD" : "#2B2B2B", 0.12), 0.8);
    m.frente(r, 0.9, 1.55, 2.9, 0.15, 0.75, escuro(n === 2 ? "#E9E5DD" : "#2B2B2B", 0.12), 0.8);
    const z0 = n === 2 ? 1.3 : 1.25, lw = n === 2 ? 2.6 : 3, h = n === 2 ? 1.5 : 1.9;
    const t = m.cx((3 - lw) / 2, 0.1, z0, lw, 0.15, h, "#151515"); tela(m, t, 0.25, (3 - lw) / 2 + 0.08, (3 + lw) / 2 - 0.08, z0 + 0.08, z0 + h - 0.08);
    if (n === 3) m.cx(0.6, 0.35, 0.9, 1.8, 0.35, 0.28, "#3A3A3A");
  },
  videogame(m, n, cor) {
    if (n === 1) {
      m.cx(0.2, 0.2, 0, 0.7, 0.45, 0.3, PRETO);
      const pufe = m.cx(0.5, 0.8, 0, 1.2, 1.1, 0.85, cor); m.topo(pufe, 0.7, 1.5, 1.0, 1.7, 0.85, claro(cor, 0.25), 0.6);
      return;
    }
    if (n === 2) {
      m.cx(0.2, 0.1, 0, 0.7, 0.45, 0.35, "#F2F2F2");
      m.cx(0.7, 0.6, 0, 0.8, 0.8, 0.3, PRETO); m.cx(0.75, 0.6, 0.3, 0.7, 0.2, 0.15, PRETO);
      m.cx(0.55, 0.6, 0.45, 1.1, 0.9, 0.4, cor); m.cx(0.55, 1.35, 0.85, 1.1, 0.25, 2.1, cor);
      m.cx(0.45, 0.8, 0.85, 0.15, 0.5, 0.4, PRETO); m.cx(1.6, 0.8, 0.85, 0.15, 0.5, 0.4, PRETO);
      return;
    }
    m.cx(0, 0, 0, 2, 0.9, 1.5, "#2A2A2A");
    const mon = m.cx(0.15, 0.15, 1.5, 1.7, 0.15, 1.0, "#101010"); tela(m, mon, 0.3, 0.25, 1.75, 1.58, 2.42);
    m.frente(mon, 0.3, 0.15, 1.85, 1.45, 1.52, cor, 0);
    m.cx(0.5, 1.05, 0, 0.9, 0.85, 0.85, PRETO); m.cx(0.5, 1.7, 0.85, 0.9, 0.2, 1.8, cor);
  },
  sofa(m, n, cor) {
    const u0 = n === 1 ? 0.4 : 0, lw = n === 1 ? 3.2 : 4;
    m.cx(u0, 0, 0, lw, 0.6, 1.9, cor);
    m.cx(u0, 0, 0, 0.4, 2, 1.3, escuro(cor, 0.05)); m.cx(u0 + lw - 0.4, 0, 0, 0.4, 2, 1.3, escuro(cor, 0.05));
    m.cx(u0 + 0.4, 0.6, 0, lw - 0.8, 1.4, 0.75, cor);
    const nc = n === 1 ? 2 : 3, lc = (lw - 0.8) / nc;
    for (let i = 0; i < nc; i++) m.cx(u0 + 0.4 + i * lc + 0.03, 0.6, 0.75, lc - 0.06, 1.35, 0.25, claro(cor, 0.12), 1);
    if (n >= 2) { m.cx(u0 + 0.5, 0.45, 1.0, 0.7, 0.3, 0.7, n === 3 ? "#E3B341" : "#E6DCC8", 1); m.cx(u0 + lw - 1.2, 0.45, 1.0, 0.7, 0.3, 0.7, n === 3 ? "#E3B341" : "#E6DCC8", 1); }
  },
  mesa(m, n, cor) {
    const pernas = (h: number) => { for (const [u, v] of [[0.1, 0.1], [2.75, 0.1], [0.1, 1.6], [2.75, 1.6]]) m.cx(u, v, 0, 0.15, 0.15, h, escuro(cor, 0.2)); };
    pernas(1.45);
    m.cx(0, 0, 1.45, 3, 1.85, 0.15, cor);
    if (n === 1) { m.cx(0.3, 0.3, 1.6, 0.7, 0.5, 0.35, "#ECECEC"); m.cx(1.9, 0.2, 1.6, 0.25, 0.25, 0.9, "#E3B341"); }
    if (n === 2) { m.cx(0.9, 0.6, 1.6, 1.2, 0.8, 0.05, "#B9BEC2"); const sc = m.cx(0.9, 0.55, 1.65, 1.2, 0.06, 0.75, "#B9BEC2"); tela(m, sc, 0.61, 0.98, 2.02, 1.7, 2.33); }
    if (n === 3) for (const u of [0.15, 1.55]) { const sc = m.cx(u, 0.25, 1.6, 1.3, 0.12, 0.85, "#111111"); tela(m, sc, 0.37, u + 0.06, u + 1.24, 1.66, 2.38); }
  },
  planta(m, n, cor) {
    const pot = n === 3 ? "#C9A27A" : n === 2 ? "#E9E3D6" : "#C26D4A";
    const v = m.cx(0.2, 0.2, 0, 0.6, 0.6, n === 1 ? 0.5 : 0.8, pot);
    const [cx, cy] = m.p3(0.5, 0.5, n === 1 ? 0.8 : n === 2 ? 2.0 : 3.4);
    if (n === 1) m.extra(v, `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="6" ry="4.5" fill="${cor}" stroke="${TINTA}" stroke-width="1.2"/><path d="M${f1(cx - 3)} ${f1(cy)} q3 -4 6 0" stroke="${escuro(cor, 0.3)}" fill="none" stroke-width="1"/>`);
    if (n === 2) {
      const [bx, by] = m.p3(0.5, 0.5, 0.8);
      let folhas = `<path d="M${f1(bx)} ${f1(by)} L${f1(cx - 6)} ${f1(cy + 4)} M${f1(bx)} ${f1(by)} L${f1(cx + 7)} ${f1(cy + 2)} M${f1(bx)} ${f1(by)} L${f1(cx)} ${f1(cy - 6)}" stroke="#3B5E2B" stroke-width="1.4"/>`;
      for (const [dx, dy, r] of [[-8, 4, 0], [8, 2, 30], [0, -7, -20], [-4, -2, 50], [5, -4, -60]]) folhas += `<ellipse cx="${f1(cx + dx)}" cy="${f1(cy + dy)}" rx="7" ry="3.8" transform="rotate(${r} ${f1(cx + dx)} ${f1(cy + dy)})" fill="${cor}" stroke="${TINTA}" stroke-width="1.1"/>`;
      m.extra(v, folhas);
    }
    if (n === 3) {
      const [bx, by] = m.p3(0.5, 0.5, 0.8);
      m.extra(v, `<path d="M${f1(bx)} ${f1(by)} L${f1(cx)} ${f1(cy + 6)}" stroke="#6B4A30" stroke-width="3"/>` +
        [[0, 0, 12], [-9, 5, 8], [9, 4, 8], [0, -7, 8]].map(([dx, dy, r]) => `<circle cx="${f1(cx + dx)}" cy="${f1(cy + dy)}" r="${r}" fill="${cor}" stroke="${TINTA}" stroke-width="1.2"/>`).join("") +
        `<circle cx="${f1(cx - 3)}" cy="${f1(cy - 2)}" r="5" fill="${claro(cor, 0.2)}"/>`);
    }
  },
  luminaria(m, n, cor) {
    if (n === 1) {
      const cm = m.cx(0.05, 0.05, 0, 0.9, 0.9, 1.15, MADEIRA); m.frente(cm, 0.95, 0.15, 0.85, 0.55, 0.62, escuro(MADEIRA, 0.3), 0.6);
      m.cx(0.42, 0.42, 1.15, 0.16, 0.16, 0.5, "#DDD");
      const [x, y] = m.p3(0.5, 0.5, 1.95);
      m.extra(cm, `<path d="M${f1(x - 5)} ${f1(y - 5)} L${f1(x + 5)} ${f1(y - 5)} L${f1(x + 8)} ${f1(y + 5)} L${f1(x - 8)} ${f1(y + 5)} Z" fill="${cor}" stroke="${TINTA}" stroke-width="1.2"/>`);
      return;
    }
    const base = m.cx(0.25, 0.25, 0, 0.5, 0.5, 0.15, PRETO);
    if (n === 2) {
      m.cx(0.45, 0.45, 0.15, 0.1, 0.1, 3.3, PRETO);
      const [x, y] = m.p3(0.5, 0.5, 3.75);
      m.soltos.push(`<path d="M${f1(x - 6)} ${f1(y - 6)} L${f1(x + 6)} ${f1(y - 6)} L${f1(x + 9)} ${f1(y + 6)} L${f1(x - 9)} ${f1(y + 6)} Z" fill="${cor}" stroke="${TINTA}" stroke-width="1.2"/>`);
      return;
    }
    const [x0, y0] = m.p3(0.5, 0.5, 0.15), [x1, y1] = m.p3(0.5, 2.2, 3.4);
    m.extra(base, `<path d="M${f1(x0)} ${f1(y0)} C${f1(x0)} ${f1(y1 - 24)} ${f1(x1)} ${f1(y1 - 30)} ${f1(x1)} ${f1(y1 - 2)}" stroke="${TINTA}" stroke-width="3" fill="none"/><path d="M${f1(x0)} ${f1(y0)} C${f1(x0)} ${f1(y1 - 24)} ${f1(x1)} ${f1(y1 - 30)} ${f1(x1)} ${f1(y1 - 2)}" stroke="#C9A04A" stroke-width="1.4" fill="none"/>`);
    m.soltos.push(`<path d="M${f1(x1 - 8)} ${f1(y1 + 4)} A8 7 0 0 1 ${f1(x1 + 8)} ${f1(y1 + 4)} Z" fill="${cor}" stroke="${TINTA}" stroke-width="1.2"/>`);
  },
  geladeira(m, n, cor) {
    const lw = [0, 1.4, 1.8, 2][n], h = [0, 1.7, 3.9, 4.1][n], u0 = (2 - lw) / 2;
    const p = m.cx(u0, 0.2, 0, lw, 1.6, h, cor);
    if (n === 1) { m.frente(p, 1.8, u0 + lw - 0.25, u0 + lw - 0.15, 0.9, 1.4, "#888", 0.7); return; }
    m.frente(p, 1.8, u0 + 0.05, u0 + lw - 0.05, h * 0.62, h * 0.63, escuro(cor, 0.35), 0.6);
    if (n === 3) m.frente(p, 1.8, u0 + lw / 2 - 0.01, u0 + lw / 2 + 0.01, 0.1, h - 0.1, escuro(cor, 0.35), 0.6);
    m.frente(p, 1.8, u0 + lw / 2 - 0.2, u0 + lw / 2 - 0.13, h * 0.68, h * 0.85, "#6F7275", 0.6);
    if (n === 3) m.frente(p, 1.8, u0 + lw / 2 + 0.13, u0 + lw / 2 + 0.2, h * 0.68, h * 0.85, "#6F7275", 0.6);
  },
  fogao(m, n, cor) {
    if (n === 1) {
      const p = m.cx(0.3, 0.3, 0, 1.4, 1.3, 1.7, cor);
      for (const u of [0.65, 1.35]) { const [x, y] = m.p3(u, 0.95, 1.7); m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5" ry="2.6" fill="#2A2A2A" stroke="${TINTA}" stroke-width="0.8"/>`); }
      m.frente(p, 1.6, 0.45, 1.55, 0.25, 1.15, escuro(cor, 0.15), 0.8);
      return;
    }
    const bancada = n === 2 ? "#E6E1D6" : "#F4F2EE";
    const p = m.cx(0, n === 3 ? 0.2 : 0, 0, 2, n === 3 ? 1.6 : 1.4, 1.8, n === 2 ? "#5B6770" : "#3A3F44");
    m.topo(p, 0, 2, n === 3 ? 0.2 : 0, n === 3 ? 1.8 : 1.4, 1.8, bancada, 1);
    if (n === 2) {
      m.topo(p, 0.35, 1.65, 0.2, 1.1, 1.81, "#1C1C1C", 0.8);
      m.frente(p, 1.4, 0.3, 1.7, 0.25, 1.35, "#22272B", 0.8);
      m.frente(p, 1.4, 0.4, 1.6, 1.2, 1.26, "#BFC5C9", 0);
    } else {
      m.topo(p, 0.3, 1.1, 0.45, 1.2, 1.81, "#1C1C1C", 0.8);
      const [x, y] = m.p3(1.5, 1.0, 1.8);
      m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5" ry="2.5" fill="#B7D7E8" stroke="${TINTA}" stroke-width="0.8"/>`);
      const [lx, ly] = m.p3(1, 1, 4.8), [bx, by] = m.p3(1, 1, 3.6);
      m.soltos.push(`<path d="M${f1(lx)} ${f1(ly - 12)} L${f1(bx)} ${f1(by)}" stroke="${TINTA}" stroke-width="1.2"/><path d="M${f1(bx - 7)} ${f1(by)} L${f1(bx + 7)} ${f1(by)} L${f1(bx + 4)} ${f1(by + 5)} L${f1(bx - 4)} ${f1(by + 5)} Z" fill="#E3B341" stroke="${TINTA}" stroke-width="1.1"/>`);
    }
  },
  mesaJantar(m, n, cor) {
    const cadeira = (u: number, v: number, costas: "n" | "s" | "l" | "o") => {
      const c = n === 3 ? "#E9E3D6" : n === 2 ? MADEIRA_ESC : MADEIRA;
      m.cx(u, v, 0, 0.7, 0.7, 0.9, c, 1);
      if (costas === "n") m.cx(u, v, 0.9, 0.7, 0.12, 1.0, c, 1);
      if (costas === "s") m.cx(u, v + 0.58, 0.9, 0.7, 0.12, 1.0, c, 1);
      if (costas === "o") m.cx(u, v, 0.9, 0.12, 0.7, 1.0, c, 1);
      if (costas === "l") m.cx(u + 0.58, v, 0.9, 0.12, 0.7, 1.0, c, 1);
    };
    const nc = n === 1 ? 2 : 3, larg = 2.6, u0 = 0.7, passo = larg / nc;
    for (let i = 0; i < nc; i++) cadeira(u0 + i * passo + (passo - 0.7) / 2, 0, "n");
    if (n === 1) cadeira(0, 1.15, "o");
    if (n === 1) cadeira(3.3, 1.15, "l");
    for (const [u, v] of [[u0 + 0.1, 0.85], [u0 + larg - 0.25, 0.85], [u0 + 0.1, 2.0], [u0 + larg - 0.25, 2.0]]) m.cx(u, v, 0, 0.15, 0.15, 1.45, escuro(cor, 0.25));
    const tampo = m.cx(u0, 0.75, 1.45, larg, 1.5, 0.15, cor);
    if (n === 3) { const [x, y] = m.p3(2, 1.5, 1.6); m.extra(tampo, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="7" ry="3.5" fill="#C9A04A" stroke="${TINTA}" stroke-width="1"/><circle cx="${f1(x - 2)}" cy="${f1(y - 3)}" r="2.5" fill="#E74C3C"/><circle cx="${f1(x + 3)}" cy="${f1(y - 3)}" r="2.5" fill="#F39C12"/>`); }
    if (n === 2) { const [x, y] = m.p3(2, 1.5, 1.6); m.extra(tampo, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="5" ry="2.5" fill="#F4F1EA" stroke="${TINTA}" stroke-width="0.8"/>`); }
    for (let i = 0; i < nc; i++) cadeira(u0 + i * passo + (passo - 0.7) / 2, 2.3, "s");
  },
  som(m, n, cor) {
    if (n === 1) { const p = m.cx(0.6, 0.2, 0, 0.8, 0.6, 0.9, cor); const [x, y] = m.p3(1.0, 0.8, 0.45); if (m.frenteVisivel) m.extra(p, `<circle cx="${f1(x)}" cy="${f1(y)}" r="3" fill="#555" stroke="${TINTA}" stroke-width="0.8"/>`); return; }
    if (n === 2) { m.cx(0, 0, 0, 2, 0.9, 0.9, "#E9E5DD"); m.cx(0.2, 0.3, 0.9, 1.6, 0.35, 0.3, cor); return; }
    for (const u of [0, 1.3]) { const p = m.cx(u, 0.1, 0, 0.7, 0.8, 2.6, cor); for (const z of [0.7, 1.7]) { const [x, y] = m.p3(u + 0.35, 0.9, z); if (m.frenteVisivel) m.extra(p, `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="3.2" ry="4" fill="#555" stroke="${TINTA}" stroke-width="0.8"/>`); } }
  },
  esteira(m, n, cor) {
    if (n === 1) {
      m.cx(0.6, 0.6, 0, 0.8, 2.8, 0.25, cor);
      m.cx(0.85, 0.7, 0.25, 0.3, 0.3, 2.2, cor); m.cx(0.6, 0.6, 2.4, 0.8, 0.25, 0.15, PRETO);
      m.cx(0.85, 2.6, 0.25, 0.3, 0.3, 1.5, cor); m.cx(0.65, 2.45, 1.75, 0.7, 0.6, 0.2, PRETO);
      return;
    }
    m.cx(0.25, 0, 0, 0.15, 0.15, 3, cor); m.cx(1.6, 0, 0, 0.15, 0.15, 3, cor);
    const painel = m.cx(0.25, 0, 2.6, 1.5, 0.35, 0.45, PRETO); m.frente(painel, 0.35, 0.5, 1.5, 2.7, 2.95, "#2E86C1", 0.6);
    const base = m.cx(0.1, 0.3, 0, 1.8, 3.6, 0.45, n === 3 ? "#DDE3E6" : PRETO);
    m.topo(base, 0.35, 1.65, 0.6, 3.75, 0.46, "#3B3B3B", 0.8);
    if (n === 3) m.soltos.push(`<path d="${caminho([m.p3(0.1, 0.3, 0.45), m.p3(0.1, 3.9, 0.45), m.p3(0.1, 3.9, 2.0), m.p3(0.1, 0.3, 2.0)])}" fill="#BFE3F2" opacity="0.35" stroke="${TINTA}" stroke-width="1"/><path d="${caminho([m.p3(1.9, 0.3, 0.45), m.p3(1.9, 3.9, 0.45), m.p3(1.9, 3.9, 2.0), m.p3(1.9, 0.3, 2.0)])}" fill="#BFE3F2" opacity="0.35" stroke="${TINTA}" stroke-width="1"/>`);
  },
  pesos(m, n, cor) {
    if (n >= 2) {
      const h = n === 2 ? 4.2 : 4.6;
      m.cx(0.1, 0.1, 0, 0.2, 0.2, h, cor); m.cx(2.7, 0.1, 0, 0.2, 0.2, h, cor);
      m.cx(0.1, 0.1, h - 0.2, 2.8, 0.2, 0.2, cor);
      if (n === 3) { m.cx(0.1, 1.4, 0, 0.2, 0.2, h, cor); m.cx(2.7, 1.4, 0, 0.2, 0.2, h, cor); m.cx(-0.0, 0.7, 2.8, 3, 0.12, 0.12, "#BBB"); for (const u of [0.0, 2.8]) m.cx(u, 0.45, 2.4, 0.2, 0.6, 0.9, PRETO); }
      else m.cx(1.1, 0.15, 0.5, 0.8, 0.15, 2.4, PRETO);
    }
    m.cx(0.9, 0.7, 0, 0.2, 0.2, 0.7, "#555"); m.cx(1.9, 0.7, 0, 0.2, 0.2, 0.7, "#555");
    m.cx(0.75, 0.55, 0.7, 1.5, 1.4, 0.25, n === 1 ? cor : PRETO);
    for (const u of [0, 2.5]) { m.cx(u + 0.05, 1.5, 0, 0.18, 0.45, 0.4, PRETO, 1); m.cx(u + 0.15, 1.65, 0.12, 0.3, 0.15, 0.15, "#999", 1); m.cx(u + 0.27, 1.5, 0, 0.18, 0.45, 0.4, PRETO, 1); }
  },
  espreguicadeira(m, n, cor) {
    if (n === 3) {
      for (const [u, v] of [[0, 0], [1.85, 0], [0, 3.85], [1.85, 3.85]]) m.cx(u, v, 0, 0.15, 0.15, 3.4, MADEIRA);
      m.cx(0, 0, 0, 2, 4, 0.6, MADEIRA); m.cx(0.05, 0.05, 0.6, 1.9, 3.9, 0.4, cor);
      travesseiro(m, 0.2, 0.2, 1.0, 1.6);
      m.soltos.push(poli([m.p3(0, 0, 3.4), m.p3(2, 0, 3.4), m.p3(2, 4, 3.4), m.p3(0, 4, 3.4)], "#F4F1EA", 1.2, ' opacity="0.9"'));
      return;
    }
    const base = n === 1 ? "#D35400" : MADEIRA;
    for (const [u, v] of [[0.3, 0.3], [1.55, 0.3], [0.3, 3.5], [1.55, 3.5]]) m.cx(u, v, 0, 0.15, 0.15, 0.6, escuro(base, 0.2));
    m.cx(0.25, 1.4, 0.6, 1.5, 2.5, 0.2, n === 1 ? cor : base);
    for (let i = 0; i < 3; i++) m.cx(0.25, 0.3 + i * 0.37, 0.6 + i * 0.4, 1.5, 0.4, 0.42, n === 1 ? cor : base, 1);
    if (n === 2) m.cx(0.35, 1.6, 0.8, 1.3, 2.1, 0.15, "#F4F1EA", 1);
  },
  tapete(m, n, cor) {
    const p = m.cx(0.2, 0.2, 0.01, 3.6, 2.6, 0, cor, 1.1);
    if (n === 1) for (const v of [0.8, 1.5, 2.2]) m.topo(p, 0.2, 3.8, v, v + 0.18, 0.01, claro(cor, 0.4), 0);
    if (n === 2) m.topo(p, 0.6, 3.4, 0.55, 2.45, 0.01, claro(cor, 0.25), 0);
    if (n === 3) { m.topo(p, 0.45, 3.55, 0.45, 2.55, 0.01, "#C9A04A", 0.8); m.topo(p, 0.7, 3.3, 0.7, 2.3, 0.01, cor, 0.8); m.topo(p, 1.6, 2.4, 1.2, 1.8, 0.01, "#1F3A5F", 0.6); }
  },
  piscina(m, n, cor) {
    const borda = n === 1 ? "#E8E2D4" : n === 2 ? "#D9D2C4" : "#F2EFE9";
    const p = m.cx(0, 0, 0.01, 6, 5, 0, borda, 1.2);
    m.topo(p, 0.45, 5.55, 0.45, 4.55, 0.01, escuro(cor, 0.35), 1.2);
    m.topo(p, 0.45, 5.55, 0.95, 4.55, 0.01, cor, 0);
    m.topo(p, 0.95, 5.55, 0.95, 4.55, 0.01, cor, 0);
    const brilho = (u: number, v: number) => { const [x, y] = m.p3(u, v, 0.01); return `<path d="M${f1(x - 8)} ${f1(y)} q4 -3 8 0 q4 3 8 0" stroke="#FFFFFF" stroke-opacity="0.7" stroke-width="1.4" fill="none"/>`; };
    m.extra(p, brilho(2, 2) + brilho(4, 3.4) + brilho(3.2, 1.4));
    if (n >= 2) for (const u of [1.5, 3, 4.5]) { const [x, y] = m.p3(u, 0.95, 0.01); m.extra(p, `<circle cx="${f1(x)}" cy="${f1(y + 3)}" r="2" fill="#FFF6C8"/>`); }
    if (n === 3) {
      const hidro = m.cx(4.3, 3.3, 0, 1.6, 1.6, 0.7, "#E9E5DD"); m.topo(hidro, 4.5, 5.7, 3.5, 4.7, 0.71, "#7FD4F0", 0.8);
      const gelo = m.cx(0.1, 3.6, 0, 1.3, 1.3, 0.8, "#AAB7BF"); m.topo(gelo, 0.25, 1.25, 3.75, 4.75, 0.81, "#DDF3FB", 0.8);
    }
  },
  churrasqueira(m, n, cor) {
    if (n === 1) {
      for (const [u, v] of [[0.6, 0.6], [1.3, 0.6], [0.95, 1.3]]) m.cx(u, v, 0, 0.1, 0.1, 1.1, PRETO);
      const b = m.cx(0.5, 0.5, 1.1, 1.0, 1.0, 0, "#000", 0);
      const [x, y] = m.p3(1, 1, 1.4);
      m.extra(b, `<path d="M${f1(x - 10)} ${f1(y)} A10 7 0 0 0 ${f1(x + 10)} ${f1(y)} Z" fill="${cor}" stroke="${TINTA}" stroke-width="1.2"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="10" ry="4" fill="#5A5A5A" stroke="${TINTA}" stroke-width="1"/>`);
      return;
    }
    const corpo = m.cx(0, 0.2, 0, 2, 1.6, 2.0, cor);
    m.frente(corpo, 1.8, 0.4, 1.6, 0.9, 1.7, "#2A1A12", 1);
    m.frente(corpo, 1.8, 0.45, 1.55, 1.0, 1.08, "#E74C3C", 0);
    m.cx(0.4, 0.4, 2.0, 1.2, 1.0, n === 3 ? 0.6 : 1.4, n === 3 ? "#9EA7AA" : cor);
    m.cx(0.75, 0.6, n === 3 ? 2.6 : 3.4, 0.5, 0.5, n === 3 ? 2.4 : 1.6, n === 3 ? "#9EA7AA" : escuro(cor, 0.1));
  },
  estante(m, n, cor) {
    const h = 4.4, p = m.cx(0, 0, 0, 3, 1, h, cor);
    const prat = [0.2, 1.25, 2.3, 3.35];
    for (const z of prat) m.frente(p, 1, 0.12, 2.88, z, z + 0.9, escuro(cor, 0.45), 0.8);
    const coisas = ["#C0392B", "#2E86C1", "#F1C40F", "#27AE60", "#8E44AD", "#E67E22", "#ECF0F1"];
    if (!m.frenteVisivel) return;
    prat.forEach((z, i) => {
      if (n === 1 || (n === 2 && i % 2 === 1)) for (let k = 0; k < 7; k++) m.frente(p, 1, 0.25 + k * 0.36, 0.5 + k * 0.36, z, z + 0.6 + ((k * 7) % 3) * 0.08, coisas[(k + i) % 7], 0.6);
      else if (n === 2) for (let k = 0; k < 2; k++) { const u = 0.45 + k * 1.3; m.frente(p, 1, u, u + 0.9, z + 0.08, z + 0.8, coisas[(k * 3 + i) % 7], 0.7); }
      else for (let k = 0; k < 3; k++) { const [x, y] = m.p3(0.6 + k * 0.9, 1, z + 0.38); m.extra(p, `<circle cx="${f1(x)}" cy="${f1(y)}" r="5" fill="#F4F1EA" stroke="${TINTA}" stroke-width="1"/><path d="M${f1(x - 2)} ${f1(y - 2)} l2 -1 l2 1 l-1 2.5 h-2 Z" fill="${TINTA}"/>`); }
    });
  },
  trofeus(m, n, cor) {
    const h = n === 1 ? 2 : 4.6, p = m.cx(0, 0, 0, 4, 1, h, cor);
    if (n >= 2) { m.frente(p, 1, 0.15, 3.85, 0.9, h - 0.3, n === 3 ? "#1F1A14" : "#CFE6EE", 0.9); m.frente(p, 1, 0.15, 3.85, 2.6, 2.66, "#E8E8E8", 0); }
    const taca = (u: number, z: number, esc = 1) => {
      const [x, y] = m.p3(u, 0.6, z);
      return `<path d="M${f1(x - 4 * esc)} ${f1(y - 9 * esc)} h${f1(8 * esc)} q0 ${f1(6 * esc)} ${f1(-4 * esc)} ${f1(7 * esc)} q${f1(-4 * esc)} ${f1(-1 * esc)} ${f1(-4 * esc)} ${f1(-7 * esc)} Z M${f1(x - 1)} ${f1(y - 2 * esc)} h2 v${f1(2 * esc)} h${f1(2 * esc)} v2 h${f1(-6 * esc)} v-2 h${f1(2 * esc)} Z" fill="#E3B341" stroke="${TINTA}" stroke-width="1"/>`;
    };
    let t = "";
    if (n === 1) for (const u of [0.8, 2, 3.2]) t += taca(u, 2.05);
    else for (const z of [0.95, 2.7]) for (const u of n === 3 ? [0.6, 1.5, 2.5, 3.4] : [0.9, 2, 3.1]) t += taca(u, z, n === 3 && z > 2 ? 1.25 : 1);
    m.extra(p, t);
    if (n === 3) for (const u of [0.8, 2, 3.2]) { const [x, y] = m.p3(u, 1, h); m.extra(p, `<path d="M${f1(x)} ${f1(y)} l-6 22 h12 Z" fill="#FFF3B0" opacity="0.25"/>`); }
  },
  carro(m, n, cor) {
    const larg = n === 4 ? 3.5 : n === 3 ? 3.3 : 3.1, u0 = (4 - larg) / 2;
    const roda = (u: number, v: number) => m.cx(u < 2 ? u0 - 0.3 : u0 + larg, v, 0, 0.3, 1.1, n === 3 ? 1.15 : 0.9, "#1A1A1A", 1.1);
    const v0 = n === 1 ? 0.8 : 0.3, v1 = n === 1 ? 6.2 : 6.7;
    roda(u0 - 0.05, v0 + 0.7); roda(u0 + larg - 0.4, v0 + 0.7);
    const zb = n === 3 ? 0.55 : 0.35, hb = n === 3 ? 1.35 : n === 4 ? 0.8 : 1.0;
    const corpo = m.cx(u0, v0, zb, larg, v1 - v0, hb, cor);
    // cabine
    const [c0, c1, hc] = n === 1 ? [v0 + 1.2, v1 - 1.6, 1.0] : n === 2 ? [v0 + 1.6, v1 - 2.2, 0.95] : n === 3 ? [v0 + 0.7, v1 - 1.9, 1.2] : [v0 + 2.2, v1 - 2.6, 0.65];
    const cab = m.cx(u0 + 0.25, c0, zb + hb, larg - 0.5, c1 - c0, hc, cor);
    m.frente(cab, c1, u0 + 0.4, u0 + larg - 0.4, zb + hb + 0.1, zb + hb + hc - 0.12, "#2B3C4C", 1);
    m.topo(cab, u0 + 0.35, u0 + larg - 0.35, c0 + 0.15, c1 - 0.15, zb + hb + hc, claro(cor, 0.22), 0.8);
    m.frente(corpo, v1, u0 + 0.15, u0 + 0.75, zb + hb * 0.5, zb + hb * 0.78, "#FFF4C2", 0.8);
    m.frente(corpo, v1, u0 + larg - 0.75, u0 + larg - 0.15, zb + hb * 0.5, zb + hb * 0.78, "#FFF4C2", 0.8);
    m.frente(corpo, v1, u0 + 1.0, u0 + larg - 1.0, zb + 0.08, zb + hb * 0.4, "#1E1E1E", 0.8);
    if (n === 4) m.cx(u0 + 0.2, v0 + 0.05, zb + hb + 0.15, larg - 0.4, 0.4, 0.12, PRETO);
    if (n === 4) { m.cx(u0 + 0.5, v0 + 0.25, zb + hb, 0.12, 0.12, 0.17, PRETO); m.cx(u0 + larg - 0.62, v0 + 0.25, zb + hb, 0.12, 0.12, 0.17, PRETO); }
    roda(u0 - 0.05, v1 - 1.75); roda(u0 + larg - 0.4, v1 - 1.75);
  },
};

// ------------------------------------------------------------------ paredes, piso, janelas e quadros
interface Acab { piso: string; piso2: string; parede: string; rodape: string; painel?: string }
const ACABAMENTOS: Record<number, Acab> = {
  1: { piso: "#9EA19A", piso2: "#8F928B", parede: "#CFDCCB", rodape: "#2E7D4F" },
  2: { piso: "#B98E5F", piso2: "#A57D52", parede: "#E8DDC8", rodape: "#8A6A48" },
  3: { piso: "#D2B48C", piso2: "#C4A57D", parede: "#EEF0EC", rodape: "#FFFFFF" },
  4: { piso: "#DDD8CF", piso2: "#CFC9BF", parede: "#F3ECE1", rodape: "#BFB6A8" },
  5: { piso: "#EFEBE4", piso2: "#E2DCD2", parede: "#E9E1D3", rodape: "#6B4A33", painel: "#7A563B" },
};

/** Ponto numa parede: "esq" é o plano x=0 (corre em y), "dir" é o plano y=0 (corre em x). */
const naParede = (p: "esq" | "dir", t: number, z: number): Pt => (p === "esq" ? pt(0, t, z) : pt(t, 0, z));
const quadParede = (p: "esq" | "dir", t0: number, t1: number, z0: number, z1: number) => [naParede(p, t0, z0), naParede(p, t1, z0), naParede(p, t1, z1), naParede(p, t0, z1)];

let seq = 0;
function janela(p: "esq" | "dir", pos: number, larg: number, vista: Moradia["vista"]): string {
  const t0 = pos - larg / 2, t1 = pos + larg / 2, z0 = 1.7, z1 = 4.5, id = `jn${++seq}`;
  const q = quadParede(p, t0, t1, z0, z1);
  const P = (t: number, z: number) => naParede(p, t, z);
  const span = t1 - t0, at = (k: number) => t0 + k * span;
  let cena = poli(q, vista === "mar" ? "#BFE6F5" : "#CDE7F2", 0);
  if (vista === "ct") cena += poli([P(t0, z0), P(t1, z0), P(t1, 2.8), P(t0, 2.8)], "#6FB35A", 0) + `<path d="${caminho([P(at(0.3), 2.8), P(at(0.3), 3.4), P(at(0.7), 3.4), P(at(0.7), 2.8)])}" fill="none" stroke="#FFF" stroke-width="1.4"/>`;
  if (vista === "rua") for (const [a, b, h, c] of [[0, 0.45, 4.2, "#C8B49A"], [0.45, 1, 4.4, "#B9A385"]] as const) cena += poli([P(at(a), z0), P(at(b), z0), P(at(b), h), P(at(a), h)], c, 0.8) + poli([P(at(a + 0.1), 3.2), P(at(a + 0.25), 3.2), P(at(a + 0.25), 3.7), P(at(a + 0.1), 3.7)], "#6E8FA8", 0.6);
  if (vista === "cidade") for (const [a, b, h, c] of [[0, 0.22, 3.4, "#8FA3B3"], [0.22, 0.4, 4.1, "#7C93A6"], [0.4, 0.62, 3.0, "#9AAEBD"], [0.62, 0.8, 3.8, "#8299AC"], [0.8, 1, 3.3, "#93A8B8"]] as const) cena += poli([P(at(a), z0), P(at(b), z0), P(at(b), h), P(at(a), h)], c, 0.6);
  if (vista === "condominio") { cena += poli([P(t0, z0), P(t1, z0), P(t1, 2.4), P(t0, 2.4)], "#7DBB63", 0); for (const k of [0.2, 0.55, 0.85]) { const [x, y] = P(at(k), 2.9); cena += `<circle cx="${f1(x)}" cy="${f1(y)}" r="7" fill="#4E8F44" stroke="${TINTA}" stroke-width="0.8"/>`; } }
  if (vista === "mar") { cena += poli([P(t0, z0), P(t1, z0), P(t1, 2.9), P(t0, 2.9)], "#2E8BC0", 0); const [x, y] = P(at(0.75), 3.8); cena += `<circle cx="${f1(x)}" cy="${f1(y)}" r="5" fill="#FFE08A"/>`; }
  const cruz = `<path d="M${P((t0 + t1) / 2, z0).map(f1).join(" ")} L${P((t0 + t1) / 2, z1).map(f1).join(" ")} M${P(t0, 3.2).map(f1).join(" ")} L${P(t1, 3.2).map(f1).join(" ")}" stroke="#FFFFFF" stroke-width="2.4"/>`;
  return `<clipPath id="${id}"><path d="${caminho(q)}"/></clipPath><g clip-path="url(#${id})">${cena}</g>${cruz}${poli(q, "none", 2.6)}${poli(quadParede(p, t0 - 0.1, t1 + 0.1, z0 - 0.18, z0), "#F4F1EA", 1.1)}`;
}

function quadro(p: "esq" | "dir", pos: number, nivel: number, cor: string): string {
  const P = (t: number, z: number) => naParede(p, t, z);
  if (nivel === 1) {
    const t0 = pos - 0.7, t1 = pos + 0.7, z0 = 2.3, z1 = 4.2;
    const [cx, cy] = P(pos, 3.45);
    return poli(quadParede(p, t0, t1, z0, z1), cor, 1.2) + poli(quadParede(p, t0, t1, z0, z0 + 0.5), "#F4F1EA", 0.8) +
      `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="6" fill="#F4F1EA" stroke="${TINTA}" stroke-width="1"/><circle cx="${f1(cx)}" cy="${f1(cy)}" r="3" fill="${escuro(cor, 0.2)}"/>`;
  }
  const t0 = pos - 1.1, t1 = pos + 1.1, z0 = 2.4, z1 = 4.1;
  let dentro = poli(quadParede(p, t0 + 0.15, t1 - 0.15, z0 + 0.15, z1 - 0.15), nivel === 2 ? "#CFE6EE" : "#F4F1EA", 0.8);
  if (nivel === 2) dentro += poli([P(t0 + 0.15, z0 + 0.15), P(t1 - 0.15, z0 + 0.15), P(t1 - 0.15, 3.0), P(pos + 0.3, 3.5), P(pos - 0.4, 3.1), P(t0 + 0.15, 3.4)], "#6FA35A", 0.6);
  else dentro += poli(quadParede(p, t0 + 0.3, pos, z0 + 0.3, 3.4), "#C0392B", 0.6) + poli(quadParede(p, pos + 0.1, t1 - 0.3, 2.9, z1 - 0.3), cor, 0.6) + poli(quadParede(p, pos - 0.5, pos + 0.6, 3.5, z1 - 0.3), "#F1C40F", 0.6);
  return poli(quadParede(p, t0, t1, z0, z1), nivel === 2 ? "#E3B341" : "#1C1C1C", 1.3) + dentro;
}

function estrutura(c: Comodo, m: Moradia): string {
  const { w: W, d: D } = c, ac = ACABAMENTOS[m.acabamento];
  let s = "";
  const externo = c.ambiente === "externo", garagem = c.ambiente === "garagem";
  const piso = externo ? (m.id === "apartamento" ? "#B98E5F" : "#86B86A") : garagem ? "#A9ABA7" : ac.piso;
  const piso2 = externo ? (m.id === "apartamento" ? "#A57D52" : "#79AB5E") : garagem ? "#9C9E9A" : ac.piso2;
  // laje (borda de baixo dá o ar de maquete)
  s += poli([pt(0, D, 0), pt(W, D, 0), pt(W, D, -0.7), pt(0, D, -0.7)], escuro(piso, 0.35), 1.4);
  s += poli([pt(W, 0, 0), pt(W, D, 0), pt(W, D, -0.7), pt(W, 0, -0.7)], escuro(piso, 0.5), 1.4);
  s += poli([pt(0, 0, 0), pt(W, 0, 0), pt(W, D, 0), pt(0, D, 0)], piso, 1.4);
  // ladrilhos
  let linhas = "";
  const passo = m.acabamento >= 4 && !externo ? 2 : 1;
  if (externo && m.id !== "apartamento") {
    for (let i = 0; i < 18; i++) { const [x, y] = pt(((i * 37) % 97) / 97 * W, ((i * 53) % 89) / 89 * D); linhas += `<path d="M${f1(x)} ${f1(y)} l-2 -4 M${f1(x + 3)} ${f1(y)} l1 -4" stroke="${piso2}" stroke-width="1.2"/>`; }
  } else if (garagem) {
    for (const sl of c.slots) { const a = areaDoSlot(sl); linhas += `<path d="M${pt(a.x - 0.4, a.y).map(f1).join(" ")} L${pt(a.x - 0.4, a.y + a.d + 0.6).map(f1).join(" ")} M${pt(a.x + a.w + 0.4, a.y).map(f1).join(" ")} L${pt(a.x + a.w + 0.4, a.y + a.d + 0.6).map(f1).join(" ")}" stroke="#F1C40F" stroke-width="2"/>`; }
  } else {
    for (let x = passo; x < W; x += passo) linhas += `<path d="M${pt(x, 0).map(f1).join(" ")} L${pt(x, D).map(f1).join(" ")}" stroke="${piso2}" stroke-width="1"/>`;
    if (m.acabamento !== 2 && m.acabamento !== 3) for (let y = passo; y < D; y += passo) linhas += `<path d="M${pt(0, y).map(f1).join(" ")} L${pt(W, y).map(f1).join(" ")}" stroke="${piso2}" stroke-width="1"/>`;
    if (m.acabamento === 5) for (let i = 0; i < 6; i++) { const [x, y] = pt(((i * 31) % 17) / 17 * W, ((i * 13) % 11) / 11 * D); linhas += `<path d="M${f1(x)} ${f1(y)} q8 3 14 -1" stroke="#CFC6B8" stroke-width="0.9" fill="none"/>`; }
  }
  s += linhas;
  // paredes
  const hp = externo ? 1.6 : ALT_PAREDE;
  const corP = externo ? (m.id === "apartamento" ? "#EEF0EC" : "#C9B79C") : garagem ? "#C3C7C5" : ac.parede;
  s += poli([pt(0, 0, 0), pt(0, D, 0), pt(0, D, hp), pt(0, 0, hp)], escuro(corP, 0.1), 1.6);
  s += poli([pt(0, 0, 0), pt(W, 0, 0), pt(W, 0, hp), pt(0, 0, hp)], corP, 1.6);
  if (!externo) {
    if (ac.painel && !garagem) {
      s += poli([pt(0, 0, 0), pt(0, D, 0), pt(0, D, 2.2), pt(0, 0, 2.2)], escuro(ac.painel, 0.1), 1.2);
      s += poli([pt(0, 0, 0), pt(W, 0, 0), pt(W, 0, 2.2), pt(0, 0, 2.2)], ac.painel, 1.2);
      for (let t = 1.5; t < Math.max(W, D); t += 1.5) { if (t < D) s += `<path d="M${pt(0, t, 0.2).map(f1).join(" ")} L${pt(0, t, 2).map(f1).join(" ")}" stroke="${escuro(ac.painel, 0.35)}" stroke-width="1"/>`; if (t < W) s += `<path d="M${pt(t, 0, 0.2).map(f1).join(" ")} L${pt(t, 0, 2).map(f1).join(" ")}" stroke="${escuro(ac.painel, 0.35)}" stroke-width="1"/>`; }
    } else {
      s += poli([pt(0, 0, 0), pt(0, D, 0), pt(0, D, 0.35), pt(0, 0, 0.35)], escuro(ac.rodape, 0.1), 1);
      s += poli([pt(0, 0, 0), pt(W, 0, 0), pt(W, 0, 0.35), pt(0, 0, 0.35)], garagem ? "#9A9E9C" : ac.rodape, 1);
    }
    if (m.acabamento === 1 && !garagem) s += poli([pt(0, 0, 2.2), pt(0, D, 2.2), pt(0, D, 2.5), pt(0, 0, 2.5)], escuro("#2E7D4F", 0.1), 0.8) + poli([pt(0, 0, 2.2), pt(W, 0, 2.2), pt(W, 0, 2.5), pt(0, 0, 2.5)], "#2E7D4F", 0.8);
  } else {
    // mureta com vegetação ou parapeito de vidro
    if (m.id === "apartamento") {
      s += poli([pt(0, 0, hp), pt(0, D, hp), pt(0, D, hp + 1.5), pt(0, 0, hp + 1.5)], "#BFE3F2", 1.2, ' fill-opacity="0.45"') + poli([pt(0, 0, hp), pt(W, 0, hp), pt(W, 0, hp + 1.5), pt(0, 0, hp + 1.5)], "#BFE3F2", 1.2, ' fill-opacity="0.45"');
    } else {
      for (let t = 0.6; t < W; t += 1.3) { const [x, y] = pt(t, 0, hp + 0.4); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="#4E8F44" stroke="${TINTA}" stroke-width="1"/>`; }
      for (let t = 0.6; t < D; t += 1.3) { const [x, y] = pt(0, t, hp + 0.4); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="9" fill="#457F3C" stroke="${TINTA}" stroke-width="1"/>`; }
    }
  }
  // tampo das paredes e pontas
  s += poli([pt(-ESP, -ESP, hp), pt(0, 0, hp), pt(0, D, hp), pt(-ESP, D, hp)], "#3B3530", 1.2);
  s += poli([pt(-ESP, -ESP, hp), pt(W, -ESP, hp), pt(W, 0, hp), pt(0, 0, hp)], "#3B3530", 1.2);
  s += poli([pt(-ESP, D, -0.7), pt(0, D, -0.7), pt(0, D, hp), pt(-ESP, D, hp)], "#3B3530", 1.2);
  s += poli([pt(W, -ESP, -0.7), pt(W, 0, -0.7), pt(W, 0, hp), pt(W, -ESP, hp)], "#2C2723", 1.2);
  if (garagem) {
    const t0 = W / 2 - Math.min(5, W / 2 - 1), t1 = W / 2 + Math.min(5, W / 2 - 1);
    s += poli(quadParede("dir", t0, t1, 0, 3.8), "#8E9592", 1.4);
    for (let z = 0.5; z < 3.8; z += 0.5) s += `<path d="M${pt(t0, 0, z).map(f1).join(" ")} L${pt(t1, 0, z).map(f1).join(" ")}" stroke="#6F7673" stroke-width="1"/>`;
  }
  if (c.janela) s += janela(c.janela.parede, c.janela.pos, c.janela.largura, m.vista);
  return s;
}

function faceDoSlot(sl: Slot, c: Comodo): Face {
  const a = areaDoSlot(sl);
  if (sl.tipo === "carro") return "+y";
  if (sl.rot) return a.x === 0 || a.x + a.w / 2 <= c.w / 2 ? "+x" : "-x";
  return a.y === 0 || a.y + a.d / 2 <= c.d / 2 ? "+y" : "-y";
}

export interface OpcoesDesenho { selecionado?: string; marcarVazios?: boolean; brilho?: string }

/** SVG de um cômodo com os móveis instalados. Cada móvel fica num <g data-slot> clicável. */
export function svgComodo(e: EstadoCasa, comodoId: string, o: OpcoesDesenho = {}): string {
  const m = MORADIA[e.moradia], c = m.comodos.find((x) => x.id === comodoId)!;
  let s = estrutura(c, m);
  const parede: string[] = [], planos: string[] = [], moveis: { k: number; svg: string }[] = [], marcas: string[] = [];
  for (const sl of c.slots) {
    const k = chave(c.id, sl.id), id = e.instalados[k], it = id ? ITENS[id] : undefined;
    const sel = o.selecionado === sl.id, novo = o.brilho === sl.id;
    const cls = `class="slot${sel ? " sel" : ""}${novo ? " novo" : ""}" data-slot="${sl.id}"`;
    if (FORMATO[sl.tipo].parede) {
      const p = sl.parede!;
      if (it) parede.push(`<g ${cls}>${quadro(p, sl.x, it.nivel, it.cor)}</g>`);
      else if (o.marcarVazios) parede.push(`<g ${cls}>${poli(quadParede(p, sl.x - 1, sl.x + 1, 2.4, 4.1), "#E3B341", 0, ` fill-opacity="${sel ? 0.35 : 0.12}" stroke="#E3B341" stroke-width="1.6" stroke-dasharray="4 3"`)}</g>`);
      continue;
    }
    const a = areaDoSlot(sl);
    const chao = [pt(a.x, a.y), pt(a.x + a.w, a.y), pt(a.x + a.w, a.y + a.d), pt(a.x, a.y + a.d)];
    if (!it) {
      if (o.marcarVazios || sel) {
        const [cx, cy] = pt(a.x + a.w / 2, a.y + a.d / 2);
        marcas.push(`<g ${cls}>${poli(chao, "#E3B341", 0, ` fill-opacity="${sel ? 0.35 : 0.12}" stroke="#E3B341" stroke-width="1.6" stroke-dasharray="4 3"`)}<circle cx="${f1(cx)}" cy="${f1(cy)}" r="7" fill="#E3B341" stroke="${TINTA}" stroke-width="1.2"/><path d="M${f1(cx - 3.5)} ${f1(cy)} h7 M${f1(cx)} ${f1(cy - 3.5)} v7" stroke="${TINTA}" stroke-width="1.6"/></g>`);
      }
      continue;
    }
    const f = FORMATO[sl.tipo], face = faceDoSlot(sl, c);
    const mv = new Movel(a.x, a.y, f.w, f.d, face);
    DESENHOS[sl.tipo](mv, it.nivel, it.cor);
    const sombra = f.plano ? "" : poli([pt(a.x + 0.15, a.y + 0.15), pt(a.x + a.w + 0.25, a.y + 0.15), pt(a.x + a.w + 0.25, a.y + a.d + 0.25), pt(a.x + 0.15, a.y + a.d + 0.25)], "#000", 0, ' opacity="0.13"');
    const contorno = sel ? poli(chao, "none", 0, ' stroke="#E3B341" stroke-width="2.4"') : "";
    const svg = `<g ${cls}>${sombra}${contorno}${mv.render()}</g>`;
    if (f.plano) planos.push(svg); else moveis.push({ k: a.x + a.w / 2 + a.y + a.d / 2, svg });
  }
  moveis.sort((p, q) => p.k - q.k);
  s += parede.join("") + planos.join("") + marcas.join("") + moveis.map((x) => x.svg).join("");
  // enquadramento
  const hp = c.ambiente === "externo" ? 3.6 : ALT_PAREDE;
  const xs = [pt(-ESP, c.d)[0], pt(c.w, -ESP)[0]], ys = [pt(-ESP, -ESP, hp)[1], pt(c.w, c.d, -0.7)[1]];
  const pad = 14, vb = [xs[0] - pad, ys[0] - pad - (c.ambiente === "externo" ? 0 : 0), xs[1] - xs[0] + 2 * pad, ys[1] - ys[0] + 2 * pad];
  return `<svg viewBox="${vb.map(f1).join(" ")}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${c.nome} da ${m.nome}">${s}</svg>`;
}

/** Miniatura de um item para o catálogo: o móvel sozinho sobre um ladrilho. */
export function svgItem(itemId: string): string {
  const it = ITENS[itemId];
  const f = FORMATO[it.tipo];
  if (f.parede) {
    const s = quadro("dir", 1.4, it.nivel, it.cor);
    const xs = [pt(0, 0)[0] - 4, pt(2.8, 0)[0] + 4], ys = [pt(0, 0, 4.4)[1], pt(2.8, 0, 2.1)[1]];
    return `<svg viewBox="${f1(xs[0])} ${f1(ys[0] - 4)} ${f1(xs[1] - xs[0])} ${f1(ys[1] - ys[0] + 10)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
  }
  const mv = new Movel(0, 0, f.w, f.d, "+y");
  caixaLimite = [Infinity, Infinity, -Infinity, -Infinity];
  DESENHOS[it.tipo](mv, it.nivel, it.cor);
  const corpo = mv.render();
  const [x0, y0, x1, y1] = caixaLimite; caixaLimite = null;
  const pad = 10, lado = Math.max(x1 - x0, y1 - y0) + 2 * pad;
  return `<svg viewBox="${f1((x0 + x1) / 2 - lado / 2)} ${f1((y0 + y1) / 2 - lado / 2)} ${f1(lado)} ${f1(lado)}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${corpo}</svg>`;
}
