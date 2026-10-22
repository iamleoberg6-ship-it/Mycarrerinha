// Estilo novo do personagem (rascunho para aprovação).
// Regras: o corpo inteiro é UMA forma só (tronco, braços, mãos, pernas e pés unidos num contorno único); a cabeça é outra
// forma só (crânio, rosto e orelhas). O crânio é igual em todos os formatos de rosto — só muda da bochecha para baixo —,
// então o cabelo, desenhado a partir do próprio crânio, encaixa em qualquer rosto. Sombra e luz saem da própria
// silhueta (a forma menos ela mesma deslocada), sempre com a luz vindo do alto à esquerda.
import pc from "polygon-clipping";
import { svgPathProperties } from "svg-path-properties";

type P = [number, number];
type Poly = P[][]; // um polígono com buracos
type Multi = Poly[];
export const CX = 200, TINTA = "#23150E";
const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// ------------------------------------------------------------------ geometria
/** Caminho suave fechado passando pelos pontos (Catmull-Rom). */
export function suave(pts: P[], fechado = true, k = 0.5): string {
  const n = pts.length, at = (i: number) => (fechado ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < (fechado ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2), t = k / 3;
    d += ` C${f1(p1[0] + (p2[0] - p0[0]) * t)} ${f1(p1[1] + (p2[1] - p0[1]) * t)} ${f1(p2[0] - (p3[0] - p1[0]) * t)} ${f1(p2[1] - (p3[1] - p1[1]) * t)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + (fechado ? " Z" : "");
}
/** Amostra um caminho SVG fechado em pontos (para as operações de união e diferença). */
function amostra(d: string, passo = 2): Poly {
  const pr = new svgPathProperties(d), L = pr.getTotalLength(), n = Math.max(12, Math.ceil(L / passo));
  const pts: P[] = [];
  for (let i = 0; i < n; i++) { const p = pr.getPointAtLength((i / n) * L); pts.push([p.x, p.y]); }
  pts.push(pts[0]);
  return [pts];
}
const paraPath = (m: Multi) => m.map((poly) => poly.map((anel) => `M${anel.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(" L")} Z`).join(" ")).join(" ");
const uniao = (...ds: string[]): Multi => pc.union(amostra(ds[0]), ...ds.slice(1).map((d) => amostra(d))) as Multi;
const mover = (m: Multi, dx: number, dy: number): Multi => m.map((p) => p.map((a) => a.map(([x, y]) => [x + dx, y + dy] as P)));
/** Faixa de sombra do lado direito/baixo e de luz do lado esquerdo/cima, tiradas da própria forma. */
const sombraDe = (m: Multi, s = 11, dy = 3) => paraPath(pc.difference(m, mover(m, -s, -dy)) as Multi);
const luzDe = (m: Multi, s = 5) => paraPath(pc.intersection(pc.difference(m, mover(m, s, s * 0.6)) as Multi, [[[[0, 0], [CX - 4, 0], [CX - 4, 800], [0, 800], [0, 0]]]]) as Multi);
const recorte = (m: Multi, d: string) => paraPath(pc.intersection(m, amostra(d)) as Multi);

/** Contorno suave em volta de uma linha central (membro), com pontas arredondadas. */
function tubo(c: P[], w: number[]): string {
  const esq: P[] = [], dir: P[] = [];
  c.forEach((p, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    esq.push([p[0] - (dy / L) * w[i], p[1] + (dx / L) * w[i]]); dir.push([p[0] + (dy / L) * w[i], p[1] - (dx / L) * w[i]]);
  });
  const u = c.length - 1, tf: P = [c[u][0] - c[u - 1][0], c[u][1] - c[u - 1][1]], Lf = Math.hypot(...tf);
  const ti: P = [c[0][0] - c[1][0], c[0][1] - c[1][1]], Li = Math.hypot(...ti);
  const ponta: P = [c[u][0] + (tf[0] / Lf) * w[u] * 0.9, c[u][1] + (tf[1] / Lf) * w[u] * 0.9], base: P = [c[0][0] + (ti[0] / Li) * w[0] * 0.9, c[0][1] + (ti[1] / Li) * w[0] * 0.9];
  return suave([...esq, ponta, ...[...dir].reverse(), base]);
}

// ------------------------------------------------------------------ medidas
export type Tipo = "esguio" | "magro" | "poucoAtletico" | "atletico" | "forte" | "troncudo" | "pesado";
interface M { ombro: number; peito: number; cintura: number; quadril: number; braco: number; antebraco: number; coxa: number; panturrilha: number; pescoco: number; barriga: number; musculo: number }
const MED: Record<Tipo, M> = {
  esguio: { ombro: 64, peito: 52, cintura: 42, quadril: 45, braco: 13, antebraco: 11.5, coxa: 21, panturrilha: 14.5, pescoco: 15, barriga: 0, musculo: 0.2 },
  magro: { ombro: 70, peito: 58, cintura: 47, quadril: 50, braco: 15, antebraco: 13, coxa: 24, panturrilha: 16, pescoco: 17, barriga: 0, musculo: 0.35 },
  poucoAtletico: { ombro: 74, peito: 65, cintura: 60, quadril: 61, braco: 17.5, antebraco: 15, coxa: 28, panturrilha: 18.5, pescoco: 19, barriga: 8, musculo: 0.05 },
  atletico: { ombro: 80, peito: 70, cintura: 52, quadril: 56, braco: 19, antebraco: 16, coxa: 28, panturrilha: 19.5, pescoco: 19, barriga: 0, musculo: 0.75 },
  forte: { ombro: 88, peito: 80, cintura: 60, quadril: 62, braco: 23.5, antebraco: 19, coxa: 32, panturrilha: 22, pescoco: 22, barriga: 0, musculo: 1 },
  troncudo: { ombro: 86, peito: 82, cintura: 72, quadril: 70, braco: 22.5, antebraco: 19, coxa: 33, panturrilha: 23, pescoco: 24, barriga: 6, musculo: 0.55 },
  pesado: { ombro: 84, peito: 84, cintura: 85, quadril: 80, braco: 24, antebraco: 20, coxa: 36, panturrilha: 25, pescoco: 24, barriga: 20, musculo: 0.05 },
};
// esqueleto (cabeça grande, estilo de jogo): ombro 228, cintura 370, quadril 425, virilha 458, joelho 595, tornozelo 728
const Y = { pescoco: 180, ombro: 228, axila: 274, cintura: 370, quadril: 425, virilha: 458, joelho: 595, tornozelo: 728 };
function esq(t: Tipo) {
  const m = MED[t];
  const braco = (l: 1 | -1) => { const sx = CX + l * (m.ombro - m.braco * 0.62), ex = CX + l * (m.ombro + 3), wx = CX + l * (m.ombro + 6); return { c: [[sx, 238], [sx + l * 3, 300], [ex, 372], [ex + l * 1, 420], [wx, 470]] as P[], w: [m.braco * 1.12, m.braco, m.braco * 0.8, m.antebraco, m.antebraco * 0.66] }; };
  const perna = (l: 1 | -1) => { const x0 = CX + l * m.quadril * 0.5, xj = CX + l * m.quadril * 0.44, xt = CX + l * m.quadril * 0.42; return { c: [[x0, 430], [x0, 515], [xj, Y.joelho], [xj + l, 650], [xt, Y.tornozelo]] as P[], w: [m.coxa, m.coxa * 0.86, m.coxa * 0.6, m.panturrilha, 8.5] }; };
  return { m, braco, perna };
}
const mao = (t: Tipo, l: 1 | -1) => {
  const e = esq(t), [x, y] = e.braco(l).c[4], w = e.m.antebraco * 0.95;
  return suave([[x - w, y - 4], [x - w - 1, y + 18], [x - w * 0.55, y + 44], [x + l * 2, y + 50], [x + w * 0.65, y + 44], [x + w + 1, y + 18], [x + w, y - 4]]);
};
/** Espelha os pontos em torno de x0 quando o lado é o esquerdo (mantém a ordem para o contorno não se cruzar). */
const lado = (pts: P[], x0: number, l: 1 | -1): P[] => (l === 1 ? pts : pts.map(([x, y]) => [2 * x0 - x, y] as P).reverse());
const pe = (t: Tipo, l: 1 | -1) => { const [x, y] = esq(t).perna(l).c[4]; return suave(lado([[x - 9, y - 6], [x - 10, y + 24], [x + 2, y + 38], [x + 24, y + 40], [x + 30, y + 32], [x + 16, y + 18], [x + 9, y - 6]], x, l)); };
function troncoPts(t: Tipo, folga = 0, barra = Y.virilha + 4): P[] {
  const m = MED[t], f = folga;
  const lado: P[] = [[CX - m.pescoco - f * 0.3, 196], [CX - m.ombro * 0.6 - f * 0.4, 210], [CX - m.ombro - f * 0.5, 230], [CX - m.ombro - 2 - f, 254], [CX - m.peito - f, 284],
    [CX - m.peito + 2 - f, 316], [CX - m.cintura - m.barriga * 0.3 - f, Y.cintura], [CX - m.quadril - m.barriga * 0.1 - f, Y.quadril], [CX - m.quadril + 2 - f, barra]];
  return [...lado, [CX, barra + 6], ...[...lado].reverse().map(([x, y]) => [2 * CX - x, y] as P)];
}

// ------------------------------------------------------------------ peças
const g = (id: string, conteudo: string, attrs = "") => (conteudo ? `<g id="${id}" ${attrs}>${conteudo}</g>` : "");
const SOMBRA = `fill="#3A1405" fill-opacity=".22"`, LUZ = `fill="#FFFFFF" fill-opacity=".2"`;
const contorno = (d: string, w = 3.4) => `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const linha = (d: string, w = 1.8, op = 0.38) => `<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round"/>`;

/** Corpo: uma forma só. */
export function corpo(t: Tipo, pele = "#C98A5C"): string {
  const e = esq(t), m = e.m, L = [-1, 1] as const;
  const pescoco = `M${CX - m.pescoco} 160 L${CX - m.pescoco} 214 L${CX + m.pescoco} 214 L${CX + m.pescoco} 160 Z`;
  const forma = uniao(pescoco, suave(troncoPts(t)), ...L.map((l) => tubo(e.braco(l).c, e.braco(l).w)), ...L.map((l) => mao(t, l)), ...L.map((l) => tubo(e.perna(l).c, e.perna(l).w)), ...L.map((l) => pe(t, l)));
  const d = paraPath(forma);
  // detalhes por dentro da forma: clavícula, peito, abdômen, umbigo, joelhos, dedos, a linha que separa as pernas
  const an: string[] = [`M${CX - m.pescoco * 0.5} 214 Q${CX - m.ombro * 0.45} 220 ${CX - m.ombro * 0.78} 228`, `M${CX + m.pescoco * 0.5} 214 Q${CX + m.ombro * 0.45} 220 ${CX + m.ombro * 0.78} 228`, `M${CX - 2} 384 q2 4 4 0`, `M${CX} ${Y.virilha + 4} L${CX} ${Y.virilha + 24}`];
  if (m.musculo > 0.4) an.push(`M${CX - m.peito * 0.85} 300 Q${CX - m.peito * 0.42} ${316 + m.musculo * 4} ${CX} 302 Q${CX + m.peito * 0.42} ${316 + m.musculo * 4} ${CX + m.peito * 0.85} 300`);
  if (m.musculo >= 0.7) an.push(`M${CX} 318 V372`, ...[332, 350].flatMap((y) => [`M${CX - m.cintura * 0.45} ${y} Q${CX - 8} ${y + 3} ${CX - 3} ${y}`, `M${CX + m.cintura * 0.45} ${y} Q${CX + 8} ${y + 3} ${CX + 3} ${y}`]));
  if (m.barriga > 5) an.push(`M${CX - m.cintura * 0.88} 404 Q${CX} ${420 + m.barriga * 0.5} ${CX + m.cintura * 0.88} 404`);
  for (const l of L) {
    const p = e.perna(l), [mx, my] = e.braco(l).c[4];
    an.push(`M${p.c[2][0] - 8} ${p.c[2][1] + 2} q8 6 16 0`, `M${mx - 4} ${my + 34} l${l} 12 M${mx + 3} ${my + 36} l${l} 11`, `M${mx - l * m.antebraco * 0.9} ${my + 6} q${-l * 6} 12 ${l * 1} 22`);
  }
  // separação braço/tronco onde eles se encostam (o contorno é um só, essa linha só marca o volume)
  for (const l of L) an.push(`M${CX + l * (m.peito - 2)} 270 Q${CX + l * (m.peito + 1)} 300 ${CX + l * (m.peito - 1)} 330`);
  return [g("Cor", `<path d="${d}"/>`, `fill="${pele}"`), g("Sombra", `<path d="${sombraDe(forma)}" ${SOMBRA}/>` + `<path d="${recorte(forma, `M${CX - m.pescoco - 2} 160 H${CX + m.pescoco + 2} V196 Q${CX} 212 ${CX - m.pescoco - 2} 196 Z`)}" ${SOMBRA}/>`), g("Luz", `<path d="${luzDe(forma)}" ${LUZ}/>`), g("Traço", contorno(d) + linha(an.join(" ")))].join("");
}

// ------------------------------------------------------------------ cabeça
export type Rosto = "oval" | "redondo" | "quadrado" | "longo" | "coracao" | "diamante";
const HC: P = [CX, 106]; // centro do crânio
const RX = 56, RY = 64;
/** Ponto do crânio (igual em todos os rostos) no ângulo a (graus; 0 = direita, -90 = topo). */
const cranio = (a: number, r = 0): P => { const t = (a * Math.PI) / 180, n = 2.25, c = Math.cos(t), s = Math.sin(t); return [HC[0] + Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * (RX + r), HC[1] + Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * (RY + r)]; };
function cabecaPts(r: Rosto): P[] {
  const j = { oval: [54, 44, 18, 184], redondo: [56, 50, 24, 180], quadrado: [56, 52, 30, 182], longo: [52, 42, 17, 192], coracao: [55, 40, 12, 184], diamante: [58, 44, 15, 186] }[r];
  const [boch, mand, queixo, yq] = j;
  const topo: P[] = []; for (let a = -180; a <= 0; a += 15) topo.push(cranio(a));
  return [...topo, [CX + boch, 126], [CX + mand, 158], [CX + queixo + 6, yq - 8], [CX, yq], [CX - queixo - 6, yq - 8], [CX - mand, 158], [CX - boch, 126]];
}
export function cabeca(r: Rosto, pele = "#C98A5C"): string {
  const orelha = (l: 1 | -1) => suave([[CX + l * (RX - 6), 104], [CX + l * (RX + 10), 100], [CX + l * (RX + 13), 120], [CX + l * (RX + 4), 142], [CX + l * (RX - 6), 140]]);
  const forma = uniao(suave(cabecaPts(r)), orelha(-1), orelha(1)), d = paraPath(forma);
  const bochechas = [-1, 1].map((l) => `<ellipse cx="${CX + l * 30}" cy="146" rx="10" ry="6" fill="#E25B4A" fill-opacity=".16"/>`).join("");
  const det = linha(`M${CX - RX - 4} 112 q-4 8 0 16 M${CX + RX + 4} 112 q4 8 0 16`, 1.6, 0.45);
  return [g("Cor", `<path d="${d}"/>`, `fill="${pele}"`), g("Sombra", `<path d="${sombraDe(forma, 13, 4)}" ${SOMBRA}/>`), g("Luz", `<path d="${luzDe(forma, 6)}" ${LUZ}/>` + bochechas), g("Traço", contorno(d) + det)].join("");
}
export function olhos(iris = "#5A3A22"): string {
  return [-1, 1].map((l) => {
    const x = CX + l * 23, y = 124, w = 12.5, h = 7.5, fora: P = [x + l * w, y - 1], dentro: P = [x - l * w, y + 1];
    const branco = `M${f1(dentro[0])} ${f1(dentro[1])} Q${x} ${y - h * 1.7} ${f1(fora[0])} ${f1(fora[1])} Q${x} ${y + h * 1.25} ${f1(dentro[0])} ${f1(dentro[1])} Z`;
    return `<clipPath id="o${l}"><path d="${branco}"/></clipPath><path d="${branco}" fill="#FBF6EE"/><g clip-path="url(#o${l})"><circle cx="${x + l}" cy="${y + 1}" r="7.4" fill="${iris}"/><circle cx="${x + l}" cy="${y + 1}" r="3.6" fill="#120A06"/><circle cx="${x + l - 2.6}" cy="${y - 2.4}" r="2" fill="#fff"/></g>`
      + contorno(`M${f1(dentro[0])} ${f1(dentro[1])} Q${x} ${y - h * 1.7} ${f1(fora[0])} ${f1(fora[1])}`, 3.6) + linha(`M${f1(x - l * w * 0.7)} ${y - h * 1.5} Q${x} ${y - h * 2.2} ${f1(x + l * w * 0.9)} ${y - h * 1.2}`, 1.6, 0.45);
  }).join("");
}
export function sobrancelhas(cor: string, corte = false): string {
  const um = (l: 1 | -1) => { const d = `M${CX + l * 9} 104 Q${CX + l * 22} 96 ${CX + l * 36} 101`; return `<path d="${d}" stroke="${TINTA}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="${d}" stroke="${cor}" stroke-width="5.4" fill="none" stroke-linecap="round"/>`; };
  const mask = corte ? `<mask id="mc" maskUnits="userSpaceOnUse" x="150" y="80" width="100" height="40"><rect x="150" y="80" width="100" height="40" fill="#fff"/><path d="M171 110 L175 92 M178 110 L182 92" stroke="#000" stroke-width="3.6"/></mask>` : "";
  return `${mask}<g ${corte ? 'mask="url(#mc)"' : ""}>${um(-1)}</g>${um(1)}`;
}
export const nariz = () => contorno(`M${CX + 2} 122 L${CX + 6} 148 Q${CX + 1} 154 ${CX - 6} 150`, 2.8) + `<path d="M${CX + 3} 124 L${CX + 7} 148 L${CX} 152 Z" fill="#3A1405" fill-opacity=".14"/>`;
export const boca = () => contorno(`M${CX - 15} 166 Q${CX} 177 ${CX + 15} 166`, 3) + linha(`M${CX - 17} 164 q2 2 3 3 M${CX + 17} 164 q-2 2 -3 3 M${CX - 6} 177 Q${CX} 180 ${CX + 6} 177`, 1.6, 0.5);

// ------------------------------------------------------------------ cabelo (sobre o crânio)
/** Cabelo curto/degradê: calota que acompanha o crânio, com volume em cima e a linha da testa. */
export function cabelo(estilo: "degrade" | "curto" | "blackPower", cor: string): string {
  const vol = estilo === "blackPower" ? 26 : estilo === "curto" ? 8 : 10, desce = estilo === "degrade" ? -12 : -2;
  const cima: P[] = []; for (let a = -180 - desce; a <= desce; a += 10) cima.push(cranio(a, a > -150 && a < -30 ? vol : vol * (estilo === "degrade" ? 0.15 : 0.6)));
  const testa: P[] = [cranio(desce + 2, -2), [CX + RX * 0.62, 88], [CX + 20, 80], [CX - 6, 84], [CX - 30, 80], [CX - RX * 0.66, 90], cranio(-180 - desce - 2, -2)];
  const d = suave([...cima, ...testa]), forma = pc.union(amostra(d)) as Multi;
  const fios = estilo === "blackPower" ? [-60, -30, 0, 30, 60].map((dx) => `M${CX + dx - 6} ${54 - Math.abs(dx) * 0.2} q6 -6 12 0`).join(" ") : `M${CX - 34} 66 q10 6 14 16 M${CX - 6} 56 q8 8 10 20 M${CX + 18} 58 q8 8 6 18 M${CX + 38} 70 q4 6 2 12`;
  const lateral = estilo === "degrade" ? [-1, 1].map((l) => `<path d="${suave([cranio(l === 1 ? -8 : -172, 1), cranio(l === 1 ? 6 : -186, 1), [CX + l * (RX - 2), 120], [CX + l * (RX - 6), 104]])}" fill="${cor}" fill-opacity=".45"/>`).join("") : "";
  return [g("Cor", `<path d="${paraPath(forma)}"/>${lateral}`, `fill="${cor}"`), g("Sombra", `<path d="${sombraDe(forma, 12, 4)}" ${SOMBRA}/>`), g("Luz", `<path d="M${CX - 34} 58 Q${CX - 10} 44 ${CX + 14} 50 Q${CX - 8} 54 ${CX - 30} 68 Z" fill="#fff" fill-opacity=".25"/>`), g("Traço", contorno(paraPath(forma)) + linha(fios, 1.8, 0.4))].join("");
}

// ------------------------------------------------------------------ uniforme (cada peça também é uma forma só)
export function camisa(t: Tipo, c1: string, c2: string, largo = false): string {
  const e = esq(t), m = e.m, f = largo ? 10 : 3.5;
  const mangas = ([-1, 1] as const).map((l) => { const b = e.braco(l), c = [[b.c[0][0] - l * 2, b.c[0][1] + 8] as P, b.c[1], lerp(b.c[1], b.c[2], 0.6)], w = [b.w[0] * 0.9 + f, b.w[1] + f + 1, b.w[2] + f + 2]; return { c, w, d: tubo(c, w) }; });
  const forma = uniao(suave(troncoPts(t, f, 448)), ...mangas.map((x) => x.d)), d = paraPath(forma);
  const gola = `M${CX - m.pescoco - 4} 198 L${CX} 236 L${CX + m.pescoco + 4} 198 L${CX + m.pescoco - 2} 196 L${CX} 226 L${CX - m.pescoco + 2} 196 Z`;
  const punhos = mangas.map((x) => { const [a, b] = [x.c[1], x.c[2]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, w = x.w[2] + 0.5, ux = dx / L * 8, uy = dy / L * 8; return `M${f1(b[0] + nx * w)} ${f1(b[1] + ny * w)} L${f1(b[0] - nx * w)} ${f1(b[1] - ny * w)} L${f1(b[0] - nx * w - ux)} ${f1(b[1] - ny * w - uy)} L${f1(b[0] + nx * w - ux)} ${f1(b[1] + ny * w - uy)} Z`; });
  const ex = CX + m.peito * 0.48, ey = 292, escudo = `M${ex - 10} ${ey - 12} H${ex + 10} V${ey} Q${ex + 10} ${ey + 10} ${ex} ${ey + 14} Q${ex - 10} ${ey + 10} ${ex - 10} ${ey} Z`;
  const dobras = largo ? `M${CX - m.peito * 0.6} 330 Q${CX - m.peito * 0.4} 362 ${CX - m.cintura * 0.6} 404 M${CX + m.peito * 0.5} 326 Q${CX + m.peito * 0.3} 362 ${CX + m.cintura * 0.5} 406` : `M${CX - m.peito * 0.7} 306 Q${CX} 320 ${CX + m.peito * 0.7} 306 M${CX - m.cintura * 0.7} 420 Q${CX} 428 ${CX + m.cintura * 0.7} 420`;
  return [g("Cor", `<path d="${d}"/>`, `fill="${c1}"`), g("Cor 2", [gola, ...punhos, escudo].map((x) => `<path d="${x}"/>`).join(""), `fill="${c2}"`),
    g("Sombra", `<path d="${sombraDe(forma, 14, 3)}" ${SOMBRA}/><path d="M${CX - m.pescoco - 2} 199 Q${CX} 214 ${CX + m.pescoco + 2} 199 L${CX} 236 Z" fill="#3A1405" fill-opacity=".3"/>`), g("Luz", `<path d="${luzDe(forma, 6)}" ${LUZ}/>`),
    g("Traço", contorno(d) + contorno(gola, 2.4) + punhos.map((p) => contorno(p, 2.2)).join("") + contorno(escudo, 2) + linha(dobras, 1.7, 0.32))].join("");
}
export function calcao(t: Tipo, c1: string, c2: string): string {
  const e = esq(t), m = e.m, f = 5;
  const pernas = ([-1, 1] as const).map((l) => { const p = e.perna(l); return tubo([[p.c[0][0], 418], p.c[0], lerp(p.c[1], p.c[2], 0.15)], [p.w[0] + f, p.w[0] + f, p.w[1] + f + 1]); });
  const cint = `M${CX - m.quadril - m.barriga * 0.1 - f} 408 L${CX + m.quadril + m.barriga * 0.1 + f} 408 L${CX + m.quadril + f} 458 L${CX - m.quadril - f} 458 Z`;
  const forma = uniao(cint, ...pernas), d = paraPath(forma);
  const faixa = recorte(forma, `M0 400 H400 V418 H0 Z`) + " " + [-1, 1].map((l) => recorte(forma, `M${CX + l * (m.quadril + f + 2)} 400 L${CX + l * (m.quadril + f - 8)} 400 L${CX + l * (m.quadril * 0.98)} 560 L${CX + l * (m.quadril * 1.2)} 560 Z`)).join(" ");
  return [g("Cor", `<path d="${d}"/>`, `fill="${c1}"`), g("Cor 2", `<path d="${faixa}"/>`, `fill="${c2}"`), g("Sombra", `<path d="${sombraDe(forma, 12, 3)}" ${SOMBRA}/>`), g("Traço", contorno(d) + linha(`M${CX} 440 V${Y.virilha + 20}`, 1.8, 0.45))].join("");
}
export function meiao(t: Tipo, c1: string, c2: string): string {
  const e = esq(t), ps = ([-1, 1] as const).map((l) => { const p = e.perna(l); return tubo([lerp(p.c[2], p.c[3], 0.2), p.c[3], lerp(p.c[3], p.c[4], 0.6), p.c[4]], [p.w[2] + 2.5, p.w[3] + 2.5, (p.w[3] + p.w[4]) / 2 + 2, p.w[4] + 2.5]); });
  const forma = uniao(...ps), d = paraPath(forma), topo = recorte(forma, `M0 ${Y.joelho} H400 V${Y.joelho + 22} H0 Z`);
  return [g("Cor", `<path d="${d}"/>`, `fill="${c1}"`), g("Cor 2", `<path d="${topo}"/>`, `fill="${c2}"`), g("Sombra", `<path d="${sombraDe(forma, 9, 2)}" ${SOMBRA}/>`), g("Traço", contorno(d))].join("");
}
export function chuteira(t: Tipo, c1: string, c2: string): string {
  const e = esq(t), fs = ([-1, 1] as const).map((l) => { const [x, y] = e.perna(l).c[4]; return { l, x, y, d: suave(lado([[x - 12, y - 8], [x - 14, y + 22], [x + 2, y + 38], [x + 30, y + 40], [x + 36, y + 32], [x + 20, y + 16], [x + 12, y - 8]], x, l)) }; });
  const forma = uniao(...fs.map((f) => f.d)), d = paraPath(forma);
  const faixa = fs.map((f) => recorte(forma, `M${f.x - f.l * 6} ${f.y + 30} L${f.x + f.l * 22} ${f.y + 14} L${f.x + f.l * 26} ${f.y + 20} L${f.x - f.l * 2} ${f.y + 36} Z`)).join(" ");
  const sola = fs.map((f) => `<path d="M${f.x - f.l * 14} ${f.y + 34} L${f.x + f.l * 36} ${f.y + 34} L${f.x + f.l * 34} ${f.y + 42} L${f.x - f.l * 13} ${f.y + 42} Z" fill="#1A1A1A" stroke="${TINTA}" stroke-width="2.4" stroke-linejoin="round"/>` + [-6, 8, 22].map((k) => `<rect x="${f.x + f.l * k - 3}" y="${f.y + 41}" width="6" height="6" rx="1.5" fill="#E8E8E8" stroke="${TINTA}" stroke-width="1.4"/>`).join("")).join("");
  return [g("Cor", `<path d="${d}"/>`, `fill="${c1}"`), g("Cor 2", `<path d="${faixa}"/>`, `fill="${c2}"`), g("Sombra", `<path d="${sombraDe(forma, 9, 2)}" ${SOMBRA}/>`), g("Sola", sola), g("Traço", contorno(d))].join("");
}

/** Personagem montado (as camadas na ordem do jogo). */
export function modelo(o: { tipo: Tipo; rosto: Rosto; pele: string; cabelo: "degrade" | "curto" | "blackPower"; corCabelo: string; iris: string; c1: string; c2: string; calcao: string; largo?: boolean; corte?: boolean }): string {
  return [corpo(o.tipo, o.pele), meiao(o.tipo, o.c1, o.c2), chuteira(o.tipo, "#F2B705", "#1A1A1A"), calcao(o.tipo, o.calcao, o.c1), camisa(o.tipo, o.c1, o.c2, o.largo),
    cabeca(o.rosto, o.pele), olhos(o.iris), sobrancelhas(o.corCabelo, o.corte), nariz(), boca(), cabelo(o.cabelo, o.corCabelo)].join("");
}
