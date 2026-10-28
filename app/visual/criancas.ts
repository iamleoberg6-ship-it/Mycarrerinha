// Retrato dos filhos, no traço do jogo: bebê (0–1 ano) e criança (2–11) desenhados aqui, com cabeção e olhos grandes;
// adolescente e adulto viram o avatar normal (svgFoto) com as feições herdadas. A aparência sai do cruzamento dos traços
// do pai (o avatar do jogador) e da mãe (as fotos do app, anotadas à mão, ou o desenho do pacote em código).
import type { Aparencia, Cabelo } from "../criacao/avatar";
import { PELES, CORES_CABELO, CORES_OLHOS, CORES_ROUPA, APARENCIA_PADRAO, svgFoto, escurecer, luminancia } from "../criacao/avatar";
import type { GenesFilho, Textura, Tracos } from "../../src/genes";
import { PACOTE_MULHERES, CABELOS_F, mulherDoPerfil, svgMulher, type Mulher, type CabeloF } from "./mulheres";
import { FOTOS_IA } from "./fotos-ia";

// ------------------------------------------------------------------ traços dos pais
/** As 40 fotos do app (27 do pacote 1, 13 do pacote 2), olhadas uma a uma: pele, textura e cor do cabelo (a natural, não a tingida), olhos, sardas. */
const T = (pele: number, textura: Textura, corCabelo: number, olhos: number, sardas = false, olhoPuxado = false): Tracos => ({ pele, textura, corCabelo, olhos, sardas, olhoPuxado });
export const TRACOS_FOTOS: Tracos[] = [
  T(3, "ondulado", 1, 0), T(0, "liso", 5, 4), T(6, "crespo", 0, 0), T(1, "liso", 0, 3), T(2, "cacheado", 4, 1), T(0, "ondulado", 6, 3, true), T(6, "crespo", 0, 0),
  T(0, "liso", 0, 0, false, true), T(3, "ondulado", 3, 1), T(6, "liso", 0, 0), T(2, "liso", 3, 1), T(3, "ondulado", 1, 1), T(2, "ondulado", 5, 1), T(6, "crespo", 0, 0),
  T(0, "liso", 3, 4), T(3, "cacheado", 1, 1), T(4, "ondulado", 0, 0), T(0, "liso", 0, 0), T(5, "ondulado", 1, 0), T(3, "liso", 3, 1), T(1, "ondulado", 4, 1),
  T(4, "cacheado", 2, 1), T(3, "liso", 0, 0), T(7, "crespo", 0, 0), T(1, "ondulado", 6, 1), T(3, "liso", 0, 0), T(1, "ondulado", 5, 1),
  // pacote 2 (fotos 28 a 40)
  T(2, "ondulado", 2, 1), T(6, "crespo", 0, 0), T(1, "liso", 0, 0), T(4, "crespo", 0, 1, true), T(1, "ondulado", 6, 1),
  T(5, "crespo", 0, 0), T(3, "liso", 1, 0), T(3, "cacheado", 3, 1), T(6, "crespo", 0, 0), T(2, "ondulado", 2, 1),
  T(6, "crespo", 0, 0), T(0, "ondulado", 6, 4, true), T(3, "liso", 0, 0),
];
const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** Traços da mãe pelo id do perfil dela (a mesma foto que aparece no app). */
export function tracosDaMae(id: string): Tracos {
  if (FOTOS_IA.length && FOTOS_IA.length === TRACOS_FOTOS.length) return TRACOS_FOTOS[hash(id) % FOTOS_IA.length];
  const m = mulherDoPerfil(id) ?? PACOTE_MULHERES[0];
  const tex: Textura = m.cabelo === "ondulado" ? "ondulado" : m.cabelo === "cacheado" ? "cacheado" : m.cabelo === "blackpower" || m.cabelo === "trancas" ? "crespo" : "liso";
  const cor = [0, 1, 2, 3, 4, 5, 5, 6, 6, 1][m.corCabelo] ?? 1, olhos = [0, 1, 2, 3, 4, 4][m.corOlho] ?? 0;
  void CABELOS_F;
  return { pele: m.pele, textura: tex, corCabelo: cor, olhos, sardas: m.sardas, olhoPuxado: m.olho === "semdobra" };
}
const TEXTURA_DO_CORTE: Partial<Record<Cabelo, Textura>> = { ondulado: "ondulado", cacheado: "cacheado", crespo: "crespo", blackpower: "crespo", trancas: "crespo", dreads: "crespo" };
/** Traços do pai, pelo avatar do jogador. Corte curto não mostra a textura: em pele escura, vale crespo. */
export function tracosDoPai(a: Aparencia): Tracos {
  const tex = TEXTURA_DO_CORTE[a.cabelo] ?? (a.pele >= 5 && ["careca", "raspado", "curto", "degrade", "risco", "flattop"].includes(a.cabelo) ? "crespo" : "liso");
  const cor = [0, 1, 2, 3, 4, 5, 6, 3, 1, 1][a.corCabelo] ?? 1, olhos = [0, 1, 2, 3, 4, 0][a.olhos] ?? 0;
  return { pele: a.pele, textura: tex, corCabelo: cor, olhos, sardas: a.sardas, olhoPuxado: a.formatoOlho === "semdobra" };
}

// ------------------------------------------------------------------ desenho
const TINTA = "#2A1A12";
const corCab = (c: number) => (c === 6 ? "#9C4422" : CORES_CABELO[c] ?? CORES_CABELO[1]);
const PASTEIS_M = ["#F7C6D9", "#E9C9F2", "#FFD9B8", "#CDEBD8", "#FFF0B3"], PASTEIS_H = ["#BFDDF7", "#CDEBD8", "#FFE3A8", "#D9D4F7", "#C9EEF0"];
let seq = 0;

export type FaseFilho = "bebe" | "crianca" | "jovem";
export const faseDaIdade = (idade: number): FaseFilho => (idade <= 1 ? "bebe" : idade <= 11 ? "crianca" : "jovem");

/** Retrato do filho. `clube` = cores do clube do pai (a criança usa a camisa do time do pai). */
export function svgFilho(g: GenesFilho, idade: number, menina: boolean, semente: string, clube?: { cores: [string, string]; numero: string }): string {
  if (faseDaIdade(idade) === "jovem") return menina ? svgMulher(mulherDaFilha(g, idade, semente), (["regata", "camisa", "golaAlta", "ombro"] as const)[hash(semente) % 4]) : svgFoto({ aparencia: aparenciaDoFilho(g, idade, menina, semente), traje: "social" });
  const id = `fh${++seq}`, h = hash(semente), bebe = idade <= 1;
  const pele = PELES[g.pele] ?? PELES[3], sombra = escurecer(pele, 0.86), bochecha = luminancia(pele) > 0.5 ? "#F29A8A" : "#C76A5A";
  const cab = corCab(g.corCabelo), cabEsc = escurecer(cab, 0.78), olho = CORES_OLHOS[g.olhos] ?? CORES_OLHOS[0];
  const fundo = (menina ? PASTEIS_M : PASTEIS_H)[h % 5];
  // cabeça: bebê bem redondo; criança um pouco mais comprida
  const cx = 100, cy = bebe ? 112 : 104, rx = bebe ? 58 : 52, ry = bebe ? 56 : 58;
  const topo = cy - ry, ladoE = cx - rx, ladoD = cx + rx;
  // roupa: bebê de macacão; criança com a camisa do clube do pai (ou camiseta)
  const roupaCor = !bebe && clube ? clube.cores[0] : (menina ? PASTEIS_M : PASTEIS_H)[(h >>> 3) % 5];
  const roupaDet = !bebe && clube ? clube.cores[1] : "#FFFFFF";
  const ombros = bebe ? `M40 240 C44 200 70 180 100 178 C130 180 156 200 160 240 Z` : `M28 240 C32 196 62 172 100 170 C138 172 168 196 172 240 Z`;
  const roupa = `<path d="${ombros}" fill="${roupaCor}" stroke="${TINTA}" stroke-width="2"/>`
    + (bebe ? `<circle cx="100" cy="206" r="3" fill="#fff" stroke="${TINTA}" stroke-width="1"/><circle cx="100" cy="222" r="3" fill="#fff" stroke="${TINTA}" stroke-width="1"/>`
      : `<path d="M84 172 Q100 186 116 172" fill="none" stroke="${roupaDet}" stroke-width="5"/>${clube ? `<text x="100" y="226" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="26" fill="${roupaDet}" stroke="${TINTA}" stroke-width="1" paint-order="stroke">${clube.numero}</text>` : ""}`);
  const pescoco = `<path d="M88 ${cy + ry - 8} L88 ${bebe ? 182 : 176} Q100 ${bebe ? 188 : 182} 112 ${bebe ? 182 : 176} L112 ${cy + ry - 8} Z" fill="${sombra}"/>`;
  // cabelo de trás (meninas de cabelo comprido, cacho volumoso)
  let atras = "";
  if (!bebe && menina) {
    if (g.textura === "liso") atras = `<path d="M${ladoE - 4} ${cy - 10} Q${ladoE - 10} ${cy + 60} ${ladoE + 2} 196 L${ladoD - 2} 196 Q${ladoD + 10} ${cy + 60} ${ladoD + 4} ${cy - 10} Z" fill="${cab}" stroke="${TINTA}" stroke-width="2"/>`;
    else if (g.textura === "ondulado") atras = `<path d="M${ladoE - 4} ${cy - 10} Q${ladoE - 16} ${cy + 30} ${ladoE - 4} ${cy + 50} Q${ladoE - 14} ${cy + 70} ${ladoE + 4} 196 L${ladoD - 4} 196 Q${ladoD + 14} ${cy + 70} ${ladoD + 4} ${cy + 50} Q${ladoD + 16} ${cy + 30} ${ladoD + 4} ${cy - 10} Z" fill="${cab}" stroke="${TINTA}" stroke-width="2"/>`;
    else if (g.textura === "cacheado") atras = Array.from({ length: 14 }, (_, i) => { const lado = i % 2 ? 1 : -1, k = Math.floor(i / 2); return `<circle cx="${cx + lado * (rx + 2 - (k % 2) * 6)}" cy="${cy - 14 + k * 14}" r="13" fill="${cab}" stroke="${TINTA}" stroke-width="1.8"/>`; }).join("");
    else atras = [-1, 1].map((l) => `<circle cx="${cx + l * (rx + 6)}" cy="${topo + 22}" r="24" fill="${cab}" stroke="${TINTA}" stroke-width="2"/>${textura(cx + l * (rx + 6), topo + 22, 20, cabEsc)}`).join("");
  } else if (!bebe && g.textura === "crespo" && !menina) atras = "";
  const orelhas = [-1, 1].map((l) => `<ellipse cx="${cx + l * (rx - 2)}" cy="${cy + 6}" rx="9" ry="11" fill="${pele}" stroke="${TINTA}" stroke-width="2"/>`).join("");
  const cabeca = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${pele}" stroke="${TINTA}" stroke-width="2.2"/>`;
  // rosto: olhos grandes, bochecha rosada, boquinha
  const oy = cy + (bebe ? 8 : 4), dx = bebe ? 21 : 20, larg = g.olhoPuxado ? 9 : 10, alt = g.olhoPuxado ? 7 : (bebe ? 11 : 10);
  const olhoSvg = (x: number) => `<ellipse cx="${x}" cy="${oy}" rx="${larg}" ry="${alt}" fill="#fff" stroke="${TINTA}" stroke-width="1.8"/><circle cx="${x}" cy="${oy + 1}" r="${Math.min(larg, alt) - 2}" fill="${olho}"/><circle cx="${x}" cy="${oy + 1}" r="${Math.min(larg, alt) - 5.5}" fill="#120B07"/><circle cx="${x + 2.6}" cy="${oy - 2}" r="2.2" fill="#fff"/>`;
  const sobr = bebe ? "" : [-1, 1].map((l) => `<path d="M${cx + l * dx - 8} ${oy - 15} Q${cx + l * dx} ${oy - 20} ${cx + l * dx + 8} ${oy - 15}" fill="none" stroke="${escurecer(cab, 0.9)}" stroke-width="3" stroke-linecap="round"/>`).join("");
  const nariz = `<path d="M${cx - 4} ${oy + 18} Q${cx} ${oy + 21} ${cx + 4} ${oy + 18}" fill="none" stroke="${escurecer(pele, 0.62)}" stroke-width="2" stroke-linecap="round"/>`;
  const boca = bebe ? `<path d="M${cx - 8} ${oy + 30} Q${cx} ${oy + 39} ${cx + 8} ${oy + 30} Z" fill="#B8323C" stroke="${TINTA}" stroke-width="1.6" stroke-linejoin="round"/>`
    : `<path d="M${cx - 11} ${oy + 29} Q${cx} ${oy + 39} ${cx + 11} ${oy + 29}" fill="none" stroke="${TINTA}" stroke-width="2.2" stroke-linecap="round"/>`;
  const boch = [-1, 1].map((l) => `<ellipse cx="${cx + l * (dx + 10)}" cy="${oy + 22}" rx="9" ry="6" fill="${bochecha}" opacity=".45"/>`).join("") + (g.covinha ? `<path d="M${cx + 16} ${oy + 30} q2 2 0 4" fill="none" stroke="${escurecer(pele, 0.7)}" stroke-width="1.4"/>` : "");
  const sardas = g.sardas ? [-1, 1].map((l) => [0, 1, 2, 3].map((k) => `<circle cx="${cx + l * (dx + 4 + (k % 2) * 7)}" cy="${oy + 16 + Math.floor(k / 2) * 5}" r="1.3" fill="${escurecer(pele, 0.6)}"/>`).join("")).join("") : "";
  // cabelo da frente
  const frente = bebe ? cabeloBebe(g.textura, cab, cabEsc, cx, topo, menina) : cabeloCrianca(g.textura, cab, cabEsc, cx, cy, rx, ry, menina);
  const laco = bebe && menina ? `<path d="M${cx + 18} ${topo + 10} l-14 -9 l0 18 Z M${cx + 18} ${topo + 10} l14 -9 l0 18 Z" fill="#E0567A" stroke="${TINTA}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="${cx + 18}" cy="${topo + 10}" r="4" fill="#E0567A" stroke="${TINTA}" stroke-width="1.6"/>` : "";
  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${bebe ? "Bebê" : menina ? "Menina" : "Menino"}"><defs><clipPath id="${id}"><rect width="200" height="240" rx="14"/></clipPath></defs>
    <g clip-path="url(#${id})"><rect width="200" height="240" fill="${fundo}"/>${roupa}${pescoco}${atras}${orelhas}${cabeca}${boch}${sardas}${sobr}${olhoSvg(cx - dx)}${olhoSvg(cx + dx)}${nariz}${boca}${frente}${laco}</g></svg>`;
}
/** Pontinhos de textura (cacho e crespo). */
function textura(x: number, y: number, r: number, cor: string): string {
  return [[-0.4, -0.3], [0.3, -0.45], [0.1, 0.1], [-0.3, 0.4], [0.45, 0.3]].map(([a, b]) => `<path d="M${(x + a * r - 3).toFixed(1)} ${(y + b * r).toFixed(1)} q3 -3 6 0" fill="none" stroke="${cor}" stroke-width="1.4" stroke-linecap="round"/>`).join("");
}
function cabeloBebe(t: Textura, cab: string, esc: string, cx: number, topo: number, menina: boolean): string {
  if (t === "crespo" || t === "cacheado") return Array.from({ length: t === "crespo" ? 9 : 6 }, (_, i) => `<circle cx="${cx - 26 + i * (t === "crespo" ? 6.5 : 10)}" cy="${topo + 6 + (i % 2) * 4}" r="${t === "crespo" ? 6 : 7}" fill="${cab}" stroke="${TINTA}" stroke-width="1.4"/>`).join("") + (t === "cacheado" ? `<path d="M${cx - 4} ${topo + 4} q8 -14 0 -22" fill="none" stroke="${cab}" stroke-width="4" stroke-linecap="round"/>` : "");
  // fiapo de cabelo no topo
  return `<path d="M${cx - 22} ${topo + 8} Q${cx} ${topo - 6} ${cx + 22} ${topo + 8} Q${cx} ${topo + 2} ${cx - 22} ${topo + 8} Z" fill="${cab}" stroke="${TINTA}" stroke-width="1.4"/>
    <path d="M${cx} ${topo + 2} q${t === "ondulado" ? "-10 -10 -2 -20" : "6 -8 2 -16"}" fill="none" stroke="${cab}" stroke-width="3.4" stroke-linecap="round"/>${menina ? "" : `<path d="M${cx} ${topo + 2} q${t === "ondulado" ? "-10 -10 -2 -20" : "6 -8 2 -16"}" fill="none" stroke="${esc}" stroke-width="1" stroke-linecap="round" opacity=".6"/>`}`;
}
function cabeloCrianca(t: Textura, cab: string, esc: string, cx: number, cy: number, rx: number, ry: number, menina: boolean): string {
  const topo = cy - ry;
  // capacete de cabelo no topo da cabeça, com franja conforme a textura
  if (t === "crespo") {
    const alto = menina ? 6 : 10;
    return `<path d="M${cx - rx - 2} ${cy - 2} Q${cx - rx - 6} ${topo - alto} ${cx} ${topo - alto - 4} Q${cx + rx + 6} ${topo - alto} ${cx + rx + 2} ${cy - 2} Q${cx + rx - 6} ${topo + 18} ${cx} ${topo + 16} Q${cx - rx + 6} ${topo + 18} ${cx - rx - 2} ${cy - 2} Z" fill="${cab}" stroke="${TINTA}" stroke-width="2"/>${textura(cx - 18, topo + 2, 18, esc)}${textura(cx + 18, topo + 2, 18, esc)}`;
  }
  if (t === "cacheado") {
    return Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (0.95 + i * 0.1375), x = cx + Math.cos(a) * (rx - 4), y = cy - 6 + Math.sin(a) * (ry - 2); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13" fill="${cab}" stroke="${TINTA}" stroke-width="1.8"/>`; }).join("")
      + `<circle cx="${cx}" cy="${topo + 6}" r="14" fill="${cab}" stroke="${TINTA}" stroke-width="1.8"/>${textura(cx, topo + 6, 12, esc)}`;
  }
  const franja = t === "ondulado"
    ? `Q${cx + rx - 10} ${topo + 30} ${cx + 18} ${topo + 24} Q${cx + 6} ${topo + 34} ${cx - 4} ${topo + 24} Q${cx - 16} ${topo + 34} ${cx - 26} ${topo + 24} Q${cx - rx + 8} ${topo + 32} ${cx - rx + 2} ${cy - 4}`
    : menina ? `Q${cx + rx - 6} ${topo + 30} ${cx + 30} ${topo + 30} L${cx - 30} ${topo + 30} Q${cx - rx + 6} ${topo + 30} ${cx - rx + 2} ${cy - 4}`
    : `Q${cx + rx - 8} ${topo + 22} ${cx + 22} ${topo + 24} L${cx + 10} ${topo + 18} L${cx - 2} ${topo + 26} L${cx - 14} ${topo + 18} L${cx - 26} ${topo + 26} Q${cx - rx + 8} ${topo + 24} ${cx - rx + 2} ${cy - 4}`;
  const capacete = `<path d="M${cx - rx + 2} ${cy - 4} Q${cx - rx - 4} ${topo - 6} ${cx} ${topo - 8} Q${cx + rx + 4} ${topo - 6} ${cx + rx - 2} ${cy - 4} ${franja} Z" fill="${cab}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/>`;
  const brilho = `<path d="M${cx - 22} ${topo + 4} Q${cx - 8} ${topo - 4} ${cx + 8} ${topo}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>`;
  return capacete + brilho;
}

/** Adolescente e adulto: o avatar normal com as feições herdadas. */
export function aparenciaDoFilho(g: GenesFilho, idade: number, menina: boolean, semente: string): Aparencia {
  const h = hash(semente);
  const cabelo: Cabelo = menina
    ? ({ liso: "longo", ondulado: "longo", cacheado: "cacheado", crespo: h % 2 ? "blackpower" : "trancas" } as const)[g.textura]
    : ({ liso: h % 2 ? "curto" : "degrade", ondulado: "ondulado", cacheado: "cacheado", crespo: h % 2 ? "crespo" : "degrade" } as const)[g.textura];
  const corCabelo = g.corCabelo === 6 ? 6 : g.corCabelo;
  return {
    ...APARENCIA_PADRAO, pele: g.pele, cabelo, corCabelo, olhos: g.olhos, formatoOlho: g.olhoPuxado ? "semdobra" : (["amendoado", "redondo", "grande"] as const)[h % 3],
    sardas: g.sardas, boca: "sorriso", barba: menina || idade < 18 ? "nenhuma" : (["nenhuma", "sombra", "rala"] as const)[h % 3],
    brinco: menina, roupaSocial: (["camiseta", "moletom", "polo"] as const)[(h >>> 4) % 3], corSocial: (h >>> 6) % CORES_ROUPA.length,
  };
}

/** Filha adolescente ou adulta: o retrato no estilo das mulheres do jogo, com os traços herdados. */
function mulherDaFilha(g: GenesFilho, idade: number, semente: string): Mulher {
  const h = hash(semente);
  const cabelo: CabeloF = ({ liso: h % 3 === 0 ? "rabo" : h % 3 === 1 ? "liso" : "franja", ondulado: "ondulado", cacheado: "cacheado", crespo: h % 2 ? "blackpower" : "trancas" } as const)[g.textura];
  return {
    pele: g.pele, cabelo, corCabelo: [0, 1, 2, 3, 4, 5, 8][g.corCabelo] ?? 1, olho: g.olhoPuxado ? "semdobra" : (["amendoado", "redondo", "gatinho"] as const)[h % 3],
    corOlho: [0, 1, 2, 3, 4][g.olhos] ?? 0, boca: idade < 16 ? "sorriso" : (["sorriso", "sorrisao", "canto"] as const)[(h >>> 3) % 3], batom: idade < 16 ? 6 : (h >>> 5) % 8,
    rosto: (h >>> 7) % 3, brinco: idade < 16 ? "ponto" : (["argola", "ponto", "pendente"] as const)[(h >>> 9) % 3], colar: idade >= 16 && h % 2 === 0, pinta: false,
    sardas: g.sardas, delineado: idade >= 16, fundo: (h >>> 11) % 12, corRoupa: (h >>> 13) % 10,
  };
}
