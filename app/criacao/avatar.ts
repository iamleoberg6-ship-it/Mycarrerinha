// Avatar do jogador no estilo de arte do jogo (mistura de quadrinho e figurinha), montado por partes.
// Todo corte de cabelo, barba e orelha é calculado a partir do contorno do rosto escolhido.
import { fonteCamisa, attrFonte } from "../visual/fontes-camisa";
export type Rosto = "oval" | "redondo" | "quadrado" | "longo" | "coracao" | "largo" | "diamante" | "triangulo" | "retangular";
export type Cabelo =
  | "careca" | "raspado" | "curto" | "degrade" | "topete" | "franja" | "ondulado" | "cacheado"
  | "crespo" | "blackpower" | "trancas" | "dreads" | "moicano" | "coque" | "longo"
  | "mullet" | "undercut" | "flattop" | "risco";
export type Olho = "amendoado" | "redondo" | "estreito" | "caido" | "erguido" | "semdobra" | "encapuzado" | "grande" | "felino" | "sonolento";
export type Sobrancelha = "reta" | "arqueada" | "angulada" | "suave" | "corte";
export type Nariz = "reto" | "pequeno" | "fino" | "largo" | "achatado" | "arrebitado" | "aquilino" | "grande" | "batata" | "torto" | "botao" | "comprido";
export type RoupaSocial = "camiseta" | "moletom" | "polo" | "jaqueta" | "camisa" | "regata";
export type Barba =
  | "nenhuma" | "sombra" | "rala" | "bigode" | "bigodao" | "cavanhaque" | "cavanhaque_bigode"
  | "queixo" | "costeletas" | "curta" | "cheia" | "longa";
export type Boca = "sorriso" | "neutra" | "aberta" | "lado" | "cheia" | "fina" | "dentes";
export type Traje = "jogo" | "social";
export type AcessorioCabeca = "nenhum" | "faixa" | "bandana" | "oculos";
export type Piercing = "nenhum" | "nariz" | "sobrancelha" | "dois";
/** Óculos escuros de patrocinador: modelo e cores (a marca é que dá). */
export interface OculosSol { modelo: "aviador" | "esportivo" | "quadrado"; armacao: string; lente: string }
export type EstiloCamisa = "lisa" | "listrasV" | "listrasH" | "faixa" | "faixaH";
export interface Camisa { cor1: string; cor2: string; cor3?: string; estilo: EstiloCamisa; /** clube (id): escolhe a fonte do número */ fonte?: string }

export interface Aparencia {
  pele: number; rosto: Rosto; cabelo: Cabelo; corCabelo: number; olhos: number; formatoOlho: Olho;
  sobrancelha: number; formatoSobrancelha: Sobrancelha; nariz: Nariz; boca: Boca;
  sardas: boolean; pinta: boolean; brinco: boolean;
  roupaSocial: RoupaSocial; corSocial: number; barba: Barba; corrente: boolean;
  acessorio?: AcessorioCabeca; corAcessorio?: number; piercing?: Piercing; brinco2?: boolean;
  /** vem do patrocínio (não é escolhido na criação) */
  oculosSol?: OculosSol | null;
  /** fone de patrocinador pendurado no pescoço (só fora de campo) */
  fone?: { cor: string; detalhe: string } | null;
  /** boné e blusão de patrocinador (só fora de campo): cores e o símbolo da marca (SVG num quadro 40×40) */
  bonePatro?: { cor: string; aba: string; logo: string } | null;
  blusaoPatro?: { cor: string; detalhe: string; logo: string } | null;
}

export const PELES = ["#F8DCC4", "#F0C29E", "#E2A77D", "#C98C63", "#A66A43", "#8A5534", "#6B3F24", "#4A2A18"];
export const CORES_CABELO = ["#0F0D0B", "#2E1D14", "#4E311E", "#7A4E2A", "#A97C3C", "#D7B25E", "#9C4422", "#E9E4D8", "#2F6FD1", "#B8323C"];
export const NOMES_CABELO_COR = ["Preto", "Castanho escuro", "Castanho", "Castanho claro", "Loiro escuro", "Loiro", "Ruivo", "Platinado", "Tingido azul", "Tingido vermelho"];
export const CORES_OLHOS = ["#3B2416", "#6B4423", "#8A6A2E", "#4F6B3A", "#3E6A8C", "#1E1E1E"];
export const NOMES_OLHOS = ["Castanho escuro", "Castanho", "Mel", "Verde", "Azul", "Preto"];
export const ROSTOS: { id: Rosto; nome: string }[] = [
  { id: "oval", nome: "Oval" }, { id: "redondo", nome: "Redondo" }, { id: "quadrado", nome: "Quadrado" },
  { id: "longo", nome: "Alongado" }, { id: "coracao", nome: "Coração" }, { id: "largo", nome: "Mandíbula larga" },
  { id: "diamante", nome: "Diamante" }, { id: "triangulo", nome: "Triangular" }, { id: "retangular", nome: "Retangular" },
];
export const CABELOS: { id: Cabelo; nome: string }[] = [
  { id: "careca", nome: "Careca" }, { id: "raspado", nome: "Raspado" }, { id: "curto", nome: "Curto" }, { id: "degrade", nome: "Degradê" },
  { id: "topete", nome: "Topete" }, { id: "franja", nome: "Franja" }, { id: "ondulado", nome: "Ondulado" }, { id: "cacheado", nome: "Cacheado" },
  { id: "crespo", nome: "Crespo baixo" }, { id: "blackpower", nome: "Black power" }, { id: "trancas", nome: "Tranças" }, { id: "dreads", nome: "Dreads" },
  { id: "moicano", nome: "Moicano" }, { id: "coque", nome: "Coque" }, { id: "longo", nome: "Longo" },
  { id: "mullet", nome: "Mullet" }, { id: "undercut", nome: "Undercut" }, { id: "flattop", nome: "Flat top" }, { id: "risco", nome: "Social com risca" },
];
export const OLHOS: { id: Olho; nome: string }[] = [
  { id: "amendoado", nome: "Amendoado" }, { id: "redondo", nome: "Redondo" }, { id: "estreito", nome: "Estreito" },
  { id: "caido", nome: "Caído" }, { id: "erguido", nome: "Erguido" }, { id: "semdobra", nome: "Monopálpebra" },
  { id: "encapuzado", nome: "Pálpebra encapuzada" }, { id: "grande", nome: "Grandes" }, { id: "felino", nome: "Felino" },
  { id: "sonolento", nome: "Sonolento" },
];
export const SOBRANCELHAS: { id: Sobrancelha; nome: string }[] = [
  { id: "reta", nome: "Reta" }, { id: "arqueada", nome: "Arqueada" }, { id: "angulada", nome: "Angulada" },
  { id: "suave", nome: "Suave" }, { id: "corte", nome: "Com corte" },
];
export const NARIZES: { id: Nariz; nome: string }[] = [
  { id: "reto", nome: "Reto" }, { id: "pequeno", nome: "Pequeno" }, { id: "fino", nome: "Fino" }, { id: "largo", nome: "Largo" },
  { id: "achatado", nome: "Largo e baixo" }, { id: "arrebitado", nome: "Arrebitado" }, { id: "aquilino", nome: "Aquilino" }, { id: "grande", nome: "Grande" },
  { id: "batata", nome: "Batata" }, { id: "torto", nome: "De boxeador" }, { id: "botao", nome: "Botão" }, { id: "comprido", nome: "Comprido" },
];
export const ROUPAS_SOCIAIS: { id: RoupaSocial; nome: string }[] = [
  { id: "camiseta", nome: "Camiseta" }, { id: "moletom", nome: "Moletom" }, { id: "polo", nome: "Polo" },
  { id: "jaqueta", nome: "Jaqueta jeans" }, { id: "camisa", nome: "Camisa" }, { id: "regata", nome: "Regata" },
];
export const CORES_ROUPA = ["#F2F0EA", "#1D1F22", "#2E4A7A", "#7A2E3A", "#3E6B4A", "#C9A24D", "#8C8F94", "#E07A3F"];
export const NOMES_ROUPA = ["Branco", "Preto", "Azul-marinho", "Vinho", "Verde", "Mostarda", "Cinza", "Laranja"];
export const BOCAS: { id: Boca; nome: string }[] = [
  { id: "sorriso", nome: "Sorriso" }, { id: "aberta", nome: "Sorrisão" }, { id: "neutra", nome: "Séria" }, { id: "lado", nome: "De canto" },
  { id: "cheia", nome: "Lábios cheios" }, { id: "fina", nome: "Lábios finos" }, { id: "dentes", nome: "Mostrando os dentes" },
];
export const ACESSORIOS: { id: AcessorioCabeca; nome: string }[] = [
  { id: "nenhum", nome: "Nada" }, { id: "faixa", nome: "Faixa de cabelo" }, { id: "bandana", nome: "Bandana" }, { id: "oculos", nome: "Óculos de grau" },
];
export const PIERCINGS: { id: Piercing; nome: string }[] = [
  { id: "nenhum", nome: "Sem piercing" }, { id: "nariz", nome: "Argola no nariz" }, { id: "sobrancelha", nome: "Na sobrancelha" }, { id: "dois", nome: "Nariz e sobrancelha" },
];
export const BARBAS: { id: Barba; nome: string }[] = [
  { id: "nenhuma", nome: "Sem barba" }, { id: "sombra", nome: "Por fazer" }, { id: "rala", nome: "Rala" },
  { id: "bigode", nome: "Bigode" }, { id: "bigodao", nome: "Bigodão" }, { id: "cavanhaque", nome: "Cavanhaque" },
  { id: "cavanhaque_bigode", nome: "Cavanhaque com bigode" }, { id: "queixo", nome: "Contorno do queixo" },
  { id: "costeletas", nome: "Costeletas" }, { id: "curta", nome: "Curta" }, { id: "cheia", nome: "Cheia" }, { id: "longa", nome: "Longa" },
];

export const APARENCIA_PADRAO: Aparencia = {
  pele: 3, rosto: "oval", cabelo: "curto", corCabelo: 0, olhos: 0, formatoOlho: "amendoado", sobrancelha: 3,
  formatoSobrancelha: "reta", nariz: "reto", boca: "sorriso", sardas: false, pinta: false, brinco: false,
  roupaSocial: "moletom", corSocial: 1, barba: "nenhuma", corrente: false,
  acessorio: "nenhum", corAcessorio: 0, piercing: "nenhum", brinco2: false,
};
/** Aparência salva no formato do estilo de arte que foi desfeito (v: 2, tudo por índice) → formato deste boneco. */
export function aparenciaCompat(x: unknown): Aparencia {
  const a = (x ?? {}) as Record<string, unknown>;
  if (a.v !== 2) return { ...APARENCIA_PADRAO, ...(a as Partial<Aparencia>) };
  const n = (v: unknown, d: number) => (typeof v === "number" && isFinite(v) ? v : d);
  const CAB: Cabelo[] = ["curto", "franja", "crespo", "longo", "cacheado", "franja", "curto", "raspado", "careca"];
  const COR = [0, 1, 2, 3, 5, 7, 6, 7, 8, 9];
  const roupa = ["camiseta", "moletom", "polo", "jaqueta", "camisa", "regata"].includes(String(a.roupaSocial)) ? (a.roupaSocial as RoupaSocial) : a.roupaSocial === "social" ? "camisa" : APARENCIA_PADRAO.roupaSocial;
  return { ...APARENCIA_PADRAO, pele: Math.min(7, Math.round((n(a.tom, 3) * 7) / 6)), cabelo: CAB[n(a.cabelo, 2)] ?? "curto", corCabelo: COR[n(a.corCabelo, 0)] ?? 0, roupaSocial: roupa, corSocial: n(a.corSocial, 1) };
}
export const CAMISA_PADRAO: Camisa = { cor1: "#8C9A94", cor2: "#6F7C77", estilo: "lisa" };

export function escurecer(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `#${((1 << 24) | (c((n >> 16) & 255) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).slice(1)}`;
}
export const luminancia = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
const f1 = (n: number) => n.toFixed(1);

// ============================================================================================
// Estilo "mistura": traço preto grosso de quadrinho, sombras em dois tons e um pouco de hachura.
// Proporção de atleta: cabeça menor, pescoço forte, ombros largos. viewBox 0 0 300 360.
// As feições ficam em posições fixas (olhos y=141, nariz até y≈182, boca y≈195);
// cada formato de rosto muda só o contorno, e cabelo, barba e orelhas são calculados a partir dele.
// ============================================================================================

const TINTA = "#0A0A0A";
const TRACO = 2.8;
const LARG = 300, ALT = 360;

function mistura(a: string, b: string, t: number): string {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
}

type P = [number, number];
/** Curva suave (Catmull-Rom) passando por todos os pontos. */
function suave(pts: P[], fechado: boolean): string {
  const n = pts.length;
  const pt = (i: number): P => (fechado ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  const fim = fechado ? n : n - 1;
  for (let i = 0; i < fim; i++) {
    const p0 = pt(i - 1), p1 = pt(i), p2 = pt(i + 1), p3 = pt(i + 2);
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return fechado ? d + " Z" : d;
}

/** Contorno de cada formato: meia-largura em algumas alturas, topo e queixo. */
interface Forma { T: number; w100: number; w122: number; w150: number; w176: number; w199: number; Q: number; plano: number }
const FORMAS: Record<Rosto, Forma> = {
  oval: { T: 70, w100: 48, w122: 50, w150: 48, w176: 42, w199: 27, Q: 216, plano: 0 },
  redondo: { T: 72, w100: 52, w122: 54, w150: 53, w176: 47, w199: 32, Q: 212, plano: 0 },
  quadrado: { T: 71, w100: 50, w122: 51, w150: 51, w176: 50, w199: 38, Q: 214, plano: 14 },
  longo: { T: 64, w100: 45, w122: 46, w150: 45, w176: 40, w199: 28, Q: 222, plano: 0 },
  coracao: { T: 70, w100: 51, w122: 52, w150: 47, w176: 36, w199: 21, Q: 214, plano: 0 },
  largo: { T: 71, w100: 49, w122: 50, w150: 51, w176: 51, w199: 41, Q: 216, plano: 16 },
  diamante: { T: 70, w100: 42, w122: 51, w150: 52, w176: 40, w199: 24, Q: 217, plano: 0 },
  triangulo: { T: 73, w100: 44, w122: 47, w150: 50, w176: 51, w199: 40, Q: 214, plano: 17 },
  retangular: { T: 66, w100: 47, w122: 48, w150: 48, w176: 47, w199: 37, Q: 221, plano: 12 },
};

function contornoRosto(f: Forma): string {
  const esq: P[] = [[150 - 0.62 * f.w100, f.T + 7], [150 - f.w100, 100], [150 - f.w122, 122], [150 - f.w150, 150], [150 - f.w176, 176], [150 - f.w199, 199]];
  const queixo: P[] = f.plano ? [[150 - f.plano, f.Q - 1], [150 + f.plano, f.Q - 1]] : [[150, f.Q]];
  const dir = esq.map(([x, y]) => [300 - x, y] as P).reverse();
  return suave([[150, f.T], ...esq, ...queixo, ...dir], true);
}
/** Meia-largura do rosto numa altura y (interpolada). */
function largura(f: Forma, y: number): number {
  const tab: P[] = [[f.T, 0], [f.T + 7, 0.62 * f.w100], [100, f.w100], [122, f.w122], [150, f.w150], [176, f.w176], [199, f.w199], [f.Q, f.plano]];
  for (let i = 0; i < tab.length - 1; i++) {
    const [y0, w0] = tab[i], [y1, w1] = tab[i + 1];
    if (y >= y0 && y <= y1) return w0 + ((w1 - w0) * (y - y0)) / (y1 - y0);
  }
  return y < f.T ? 0 : f.plano;
}
/** Lado escuro do rosto (luz vindo da esquerda). */
function sombraRosto(f: Forma): string {
  const ys = [f.T, 90, 110, 130, 150, 170, 190, 205, f.Q];
  const pts = ys.map((y) => `${f1(150 + 0.42 * largura(f, y) + 8 * Math.sin(((y - f.T) / (f.Q - f.T)) * Math.PI))} ${y}`);
  return `M${pts.join(" L")} L260 ${f.Q} L260 ${f.T} Z`;
}

// ---------------------------------- cabelo ----------------------------------
interface CalotaOpts { volume?: number; testa?: number; tempora?: number; folga?: number }
/** Cabelo que acompanha o topo da cabeça: borda de fora acima do contorno, linha do cabelo na testa. */
function calotaPartes(f: Forma, o: CalotaOpts = {}): { borda: string; dentro: string } {
  const vol = o.volume ?? 6, testa = o.testa ?? f.T + 24, tY = o.tempora ?? 126, folga = o.folga ?? 3;
  const wT = largura(f, tY), w = f.w100;
  const fora: P[] = [[150 - wT - folga, tY], [150 - f.w100 - folga - 2, 98], [150 - 0.66 * f.w100 - 2, f.T + 3 - vol * 0.6], [150, f.T - 3 - vol],
    [150 + 0.66 * f.w100 + 2, f.T + 3 - vol * 0.6], [150 + f.w100 + folga + 2, 98], [150 + wT + folga, tY]];
  const borda = suave(fora, false);
  const linha: P[] = [[150 + wT - 2, tY], [150 + wT - 9, tY - 5], [150 + 0.62 * w, testa + 7], [150 + 0.36 * w, testa + 1], [150, testa + 2],
    [150 - 0.36 * w, testa + 1], [150 - 0.62 * w, testa + 7], [150 - wT + 9, tY - 5], [150 - wT + 2, tY]];
  return { borda, dentro: " L" + suave(linha, false).slice(1) + " Z" };
}
/** Cabelo que acompanha o topo da cabeça: borda de fora acima do contorno, linha do cabelo na testa. */
function calota(f: Forma, o: CalotaOpts = {}): string {
  const { borda, dentro } = calotaPartes(f, o);
  return borda + dentro;
}

let seq = 0;
const novoId = (p: string) => `${p}${++seq}`;
function recorte(d: string, conteudo: string): string {
  const id = novoId("rc");
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${conteudo}</g>`;
}
const contorno = (d: string, fill: string, extra = "") => `<path d="${d}" fill="${fill}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"${extra}/>`;

/** Massa de cabelo atrás da cabeça. */
function cabeloAtras(c: Cabelo, f: Forma, cor: string): string {
  const s = escurecer(cor, 0.72), T = f.T, w = f.w122;
  switch (c) {
    case "blackpower": {
      const r = w + 26, cy = T + 40;
      let borda = "";
      for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; borda += `<circle cx="${f1(150 + r * Math.cos(a))}" cy="${f1(cy + r * Math.sin(a))}" r="8"/>`; }
      return `<g fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}">${borda}</g><circle cx="150" cy="${cy}" r="${r}" fill="${cor}"/>`;
    }
    case "longo": {
      const d = `M${150 - w - 12} 140 C${150 - w - 16} ${T + 4} ${150 - 40} ${T - 16} 150 ${T - 16} C${150 + 40} ${T - 16} ${150 + w + 16} ${T + 4} ${150 + w + 12} 140 L${150 + w + 18} 252 Q150 262 ${150 - w - 18} 252 Z`;
      return contorno(d, cor) + recorte(d, [-0.7, -0.35, 0.35, 0.7].map((k) => `<path d="M${150 + k * (w + 12)} ${T + 20} Q${150 + k * (w + 20)} 180 ${150 + k * (w + 14)} 250" stroke="${s}" stroke-width="2" fill="none"/>`).join(""));
    }
    case "ondulado": {
      const d = `M${150 - w - 9} 132 C${150 - w - 13} ${T + 4} ${150 - 36} ${T - 12} 150 ${T - 12} C${150 + 36} ${T - 12} ${150 + w + 13} ${T + 4} ${150 + w + 9} 132 Q${150 + w + 16} 152 ${150 + w + 6} 172 L${150 - w - 6} 172 Q${150 - w - 16} 152 ${150 - w - 9} 132 Z`;
      return contorno(d, cor);
    }
    case "dreads": {
      const base = 262;
      const d = `M${150 - w - 16} 132 C${150 - w - 18} ${T - 2} ${150 - 42} ${T - 16} 150 ${T - 16} C${150 + 42} ${T - 16} ${150 + w + 18} ${T - 2} ${150 + w + 16} 132 L${150 + w + 20} ${base - 10} Q${150 + w + 14} ${base} ${150 + w} ${base} L${150 - w} ${base} Q${150 - w - 14} ${base} ${150 - w - 20} ${base - 10} Z`;
      let locs = "";
      for (let i = 0; i < 14; i++) { const x = 150 - w - 18 + (i * (2 * w + 36)) / 13; locs += `<path d="M${f1(x)} ${T - 20} Q${f1(x + (i % 2 ? 4 : -4))} 180 ${f1(x)} ${base + 6}" stroke="${i % 2 ? s : escurecer(cor, 0.86)}" stroke-width="7" fill="none"/><path d="M${f1(x)} ${T} L${f1(x)} ${base}" stroke="${TINTA}" stroke-width="0.8" stroke-dasharray="4 5" fill="none" opacity="0.45"/>`; }
      return contorno(d, cor) + recorte(d, locs);
    }
    case "coque": return contorno(`M150 ${T - 19} m-17 0 a17 15 0 1 0 34 0 a17 15 0 1 0 -34 0`, cor);
    case "mullet": {
      // nuca comprida: aparece dos dois lados do pescoço, abaixo das orelhas
      const d = `M${150 - w + 2} 150 C${150 - w - 6} 175 ${150 - w - 8} 205 ${150 - w + 2} 228 Q${150 - w + 12} 236 ${150 - 22} 232 L${150 + 22} 232 Q${150 + w - 12} 236 ${150 + w - 2} 228 C${150 + w + 8} 205 ${150 + w + 6} 175 ${150 + w - 2} 150 Z`;
      return contorno(d, cor) + recorte(d, [-1, 1].map((l) => `<path d="M${150 + l * (w - 2)} 172 Q${150 + l * (w + 4)} 205 ${150 + l * (w - 4)} 228 M${150 + l * (w - 10)} 190 Q${150 + l * (w - 4)} 212 ${150 + l * (w - 14)} 230" stroke="${s}" stroke-width="2" fill="none"/>`).join(""));
    }
    default: return "";
  }
}

/** Cabelo sobre a cabeça. Cor sólida, contorno preto; texturas recortadas pelo formato do cabelo. */
function fios(f: Forma, s: string): string {
  const w = f.w100, T = f.T;
  return [-0.7, -0.4, -0.1, 0.2, 0.5].map((k, i) => `<path d="M${f1(150 + k * w)} ${T + 22 + (i % 2) * 3} q${f1(4 + 0.06 * w)} -9 ${f1(10 + 0.1 * w)} -14" stroke="${s}" stroke-width="2" fill="none" stroke-linecap="round"/>`).join("");
}
function cabeloFrente(c: Cabelo, f: Forma, cor: string, pele: string): string {
  const s = escurecer(cor, 0.68), T = f.T, w = f.w122, cheia = calota(f);
  const brilho = luminancia(cor) < 0.3 ? mistura(cor, "#FFFFFF", 0.18) : mistura(cor, "#FFFFFF", 0.35);
  const reflexo = `<path d="M${150 - 0.5 * w} ${T + 4} Q${150 - 0.2 * w} ${T - 6} ${150 + 0.1 * w} ${T - 5}" stroke="${brilho}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  switch (c) {
    case "careca": return `<path d="M${150 - 0.55 * w} ${T + 18} Q${150 - 0.3 * w} ${T + 4} ${150 - 0.05 * w} ${T + 4}" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    case "raspado": {
      const d = calota(f, { volume: 1, folga: 1.5, testa: T + 26 });
      const cr = mistura(cor, pele, 0.5);
      let pts = "";
      for (let i = 0; i < 70; i++) pts += `<circle cx="${f1(150 - w + ((i * 37) % 97) / 97 * 2 * w)}" cy="${f1(T - 2 + ((i * 53) % 61) / 61 * 58)}" r="1" fill="${escurecer(cr, 0.75)}"/>`;
      return contorno(d, cr) + recorte(d, pts);
    }
    case "curto": return contorno(cheia, cor) + recorte(cheia, fios(f, s) + reflexo);
    case "degrade": {
      const lados = calota(f, { volume: 1, folga: 1.5, testa: T + 28 });
      const topo = calota({ ...f, w100: f.w100 - 12 }, { volume: 7, tempora: 104, testa: T + 24, folga: 2 });
      return contorno(lados, mistura(cor, pele, 0.55)) + recorte(lados, `<path d="${calota(f, { volume: 1, folga: 1.5, tempora: 112, testa: T + 26 })}" fill="${mistura(cor, pele, 0.25)}"/>`) + `<path d="${topo}" fill="${cor}"/>` + recorte(topo, fios(f, s) + reflexo) + `<path d="${calotaPartes({ ...f, w100: f.w100 - 12 }, { volume: 7, tempora: 104, testa: T + 22, folga: 2 }).borda}" fill="none" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linecap="round"/>`;
    }
    case "topete": {
      const d = calota(f, { volume: 17, testa: T + 22 });
      return contorno(d, cor) + recorte(d, `<path d="M${150 - 0.55 * w} ${T + 18} C${150 - 0.4 * w} ${T - 12} ${150 + 0.2 * w} ${T - 22} ${150 + 0.7 * w} ${T - 2}" stroke="${s}" stroke-width="2.4" fill="none"/><path d="M${150 - 0.2 * w} ${T + 20} C${150 - 0.05 * w} ${T} ${150 + 0.3 * w} ${T - 8} ${150 + 0.75 * w} ${T + 10}" stroke="${s}" stroke-width="2" fill="none"/>` + reflexo);
    }
    case "franja": {
      const n = 8, y0 = T + 34;
      let serra = `M${150 - w - 4} ${y0}`;
      for (let k = 0; k < n; k++) { const x0 = 150 - w + 2 + (k * (2 * w - 4)) / n, x1 = 150 - w + 2 + ((k + 1) * (2 * w - 4)) / n; serra += ` L${f1((x0 + x1) / 2)} ${T + 48 + (k % 2) * 4} L${f1(x1)} ${y0}`; }
      const preench = `${serra} L${150 + w + 6} ${T} L${150 - w - 6} ${T} Z`;
      const rosto = contornoRosto(f);
      return contorno(cheia, cor) + recorte(rosto, `<path d="${preench}" fill="${cor}"/><path d="${serra}" fill="none" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>`);
    }
    case "ondulado": return contorno(cheia, cor) + recorte(cheia, `<path d="M${150 - w} ${T + 12} Q${150 - 0.5 * w} ${T + 26} ${150 - 0.05 * w} ${T + 10} Q${150 + 0.4 * w} ${T - 4} ${150 + w} ${T + 12}" stroke="${s}" stroke-width="3" fill="none"/>${reflexo}`);
    case "cacheado": {
      let cachos = "";
      const rx = w + 4, ry = 54;
      for (let i = 0; i <= 13; i++) { const a = Math.PI * (0.04 + (0.92 * i) / 13); cachos += `<circle cx="${f1(150 - rx * Math.cos(a))}" cy="${f1(T + 50 - ry * Math.sin(a))}" r="11.5"/>`; }
      return `<g fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}">${cachos}</g>` + `<path d="${cheia}" fill="${cor}"/>` + recorte(cheia, Array.from({ length: 9 }, (_, i) => `<path d="M${150 - w + 10 + i * (2 * w - 20) / 8} ${T + 16} q5 -7 0 -12" stroke="${s}" stroke-width="2" fill="none"/>`).join(""));
    }
    case "crespo": {
      const d = calota(f, { volume: 5, testa: T + 22 });
      let cachos = "";
      for (let k = 0; k < 34; k++) { const x = 150 - w + ((k * 41) % 89) / 89 * 2 * w, y = T - 6 + ((k * 29) % 47) / 47 * 34; cachos += `<path d="M${f1(x)} ${f1(y)} a2.6 2.6 0 1 1 3.4 3" stroke="${s}" stroke-width="1.6" fill="none"/>`; }
      return contorno(d, cor) + recorte(d, cachos);
    }
    case "blackpower": return `<path d="${calota(f, { volume: 2, testa: T + 22 })}" fill="${cor}"/>`;
    case "trancas": {
      let linhas = "";
      for (const k of [-0.62, -0.38, -0.13, 0.13, 0.38, 0.62]) linhas += `<path d="M${150 + k * w} ${T + 30} Q${150 + k * w * 1.1} ${T + 8} ${150 + k * w * 1.25} ${T - 12}" stroke="${s}" stroke-width="3" fill="none" stroke-dasharray="4 2.5"/><path d="M${150 + (k + 0.12) * w} ${T + 28} Q${150 + (k + 0.12) * w * 1.1} ${T + 8} ${150 + (k + 0.12) * w * 1.25} ${T - 12}" stroke="${TINTA}" stroke-width="1" fill="none" opacity="0.6"/>`;
      return contorno(cheia, cor) + recorte(cheia, linhas);
    }
    case "dreads": {
      let raizes = "";
      for (const k of [-0.7, -0.35, 0, 0.35, 0.7]) raizes += `<path d="M${150 + k * w} ${T + 30} Q${150 + k * w * 1.1} ${T + 10} ${150 + k * w * 1.25} ${T - 12}" stroke="${s}" stroke-width="5" fill="none"/>`;
      return contorno(cheia, cor) + recorte(cheia, raizes);
    }
    case "moicano": {
      const lados = calota(f, { volume: 1, folga: 1.5, testa: T + 28 });
      const crista = `M${150 - 15} ${T + 28} L${150 - 13} ${T - 16} Q150 ${T - 32} ${150 + 13} ${T - 16} L${150 + 15} ${T + 28} Z`;
      return contorno(lados, mistura(cor, pele, 0.55)) + contorno(crista, cor);
    }
    case "coque": {
      const d = calota(f, { volume: 3, testa: T + 22 });
      return contorno(d, cor) + recorte(d, `<path d="M${150 - w} ${T + 26} Q${150 - 0.4 * w} ${T + 2} 150 ${T - 6} M${150 + w} ${T + 26} Q${150 + 0.4 * w} ${T + 2} 150 ${T - 6}" stroke="${s}" stroke-width="2" fill="none"/>`);
    }
    case "mullet": return contorno(cheia, cor) + recorte(cheia, fios(f, s) + reflexo);
    case "undercut": {
      // laterais raspadas e o topo comprido penteado para o lado
      const lados = calota(f, { volume: 1, folga: 1.5, testa: T + 28 });
      const topo = `M${150 - 0.78 * w} ${T + 22} C${150 - 0.9 * w} ${T - 6} ${150 - 0.4 * w} ${T - 22} ${150 + 0.15 * w} ${T - 20} C${150 + 0.6 * w} ${T - 18} ${150 + 0.95 * w} ${T - 4} ${150 + 0.92 * w} ${T + 16} C${150 + 0.7 * w} ${T + 6} ${150 + 0.2 * w} ${T + 10} ${150 - 0.2 * w} ${T + 26} C${150 - 0.45 * w} ${T + 18} ${150 - 0.62 * w} ${T + 18} ${150 - 0.78 * w} ${T + 22} Z`;
      return contorno(lados, mistura(cor, pele, 0.55)) + contorno(topo, cor) + recorte(topo, `<path d="M${150 - 0.6 * w} ${T + 12} C${150 - 0.3 * w} ${T - 10} ${150 + 0.3 * w} ${T - 12} ${150 + 0.8 * w} ${T + 6} M${150 - 0.3 * w} ${T + 18} C${150} ${T} ${150 + 0.4 * w} ${T - 2} ${150 + 0.85 * w} ${T + 12}" stroke="${s}" stroke-width="2.2" fill="none"/>` + reflexo);
    }
    case "flattop": {
      // degradê baixo e um bloco reto de crespo em cima
      const lados = calota(f, { volume: 1, folga: 1.5, testa: T + 26 });
      const L = 0.84 * w, topo = `M${150 - L} ${T + 26} L${150 - L - 1} ${T - 14} Q${150 - L + 1} ${T - 22} ${150 - L + 12} ${T - 22} L${150 + L - 12} ${T - 22} Q${150 + L - 1} ${T - 22} ${150 + L + 1} ${T - 14} L${150 + L} ${T + 26} Q${150 + 0.4 * w} ${T + 20} 150 ${T + 22} Q${150 - 0.4 * w} ${T + 20} ${150 - L} ${T + 26} Z`;
      let cachos = "";
      for (let k = 0; k < 40; k++) { const x = 150 - L + ((k * 41) % 89) / 89 * 2 * L, y = T - 18 + ((k * 29) % 47) / 47 * 40; cachos += `<path d="M${f1(x)} ${f1(y)} a2.6 2.6 0 1 1 3.4 3" stroke="${s}" stroke-width="1.5" fill="none"/>`; }
      return contorno(lados, mistura(cor, pele, 0.5)) + contorno(topo, cor) + recorte(topo, cachos);
    }
    case "risco": {
      // social penteado com a risca do lado esquerdo
      const d = calota(f, { volume: 9, testa: T + 22 }), rx = 150 - 0.42 * w;
      return contorno(d, cor) + recorte(d, `<path d="M${rx} ${T + 24} Q${rx - 1} ${T + 10} ${rx + 3} ${T + 2}" stroke="${mistura(cor, pele, 0.45)}" stroke-width="2.4" fill="none"/>` +
        [0.1, 0.35, 0.6].map((k) => `<path d="M${rx + 8} ${T + 18 - k * 8} Q${150 + k * w * 0.5} ${T - 14} ${150 + (0.6 + k * 0.4) * w} ${T + 8 + k * 6}" stroke="${s}" stroke-width="2" fill="none"/>`).join("") +
        `<path d="M${rx - 6} ${T + 16} Q${rx - 14} ${T + 6} ${150 - 0.8 * w} ${T + 18}" stroke="${s}" stroke-width="2" fill="none"/>` + reflexo);
    }
    case "longo": {
      const mecha = `M${150 - w + 3} ${T + 58} C${150 - w + 2} ${T + 30} ${150 - w + 18} ${T + 14} ${150 - 14} ${T + 12} C${150 - w + 28} ${T + 26} ${150 - w + 18} ${T + 40} ${150 - w + 17} ${T + 62} Z`;
      return contorno(cheia, cor) + recorte(cheia, reflexo) + contorno(mecha, cor);
    }
  }
}

// ---------------------------------- rosto ----------------------------------
const FORMA_OLHO: Record<Olho, string> = {
  amendoado: "M-11.5 0 Q0 -9 11.5 0 Q0 7.5 -11.5 0 Z",
  redondo: "M-10 0 A10 8.2 0 1 0 10 0 A10 8.2 0 1 0 -10 0 Z",
  estreito: "M-11.5 0 Q0 -6 11.5 0 Q0 4.5 -11.5 0 Z",
  caido: "M-11.5 2 Q-1 -9 11.5 -0.6 Q1 7 -11.5 2 Z",
  erguido: "M-11.5 -1.2 Q1 -9 11.5 2 Q0 7 -11.5 -1.2 Z",
  semdobra: "M-12 -1.4 Q-1 -6.6 11.5 0.8 Q0 4.6 -12 -1.4 Z",
  encapuzado: "M-11.5 0.6 Q0 -6 11.5 0.6 Q0 7 -11.5 0.6 Z",
  grande: "M-12.5 0.5 Q0 -11.5 12.5 0.5 Q0 9.5 -12.5 0.5 Z",
  felino: "M-13 -3.4 Q1 -8 11 1.2 Q-2 6 -13 -3.4 Z",
  sonolento: "M-11.5 0.4 Q0 -4.2 11.5 0.4 Q0 7 -11.5 0.4 Z",
};
const PALPEBRA: Record<Olho, string> = {
  amendoado: "M-11.5 0 Q0 -9 11.5 0", redondo: "M-10 0 A10 8.2 0 0 1 10 0", estreito: "M-11.5 0 Q0 -6 11.5 0",
  caido: "M-11.5 2 Q-1 -9 11.5 -0.6", erguido: "M-11.5 -1.2 Q1 -9 11.5 2", semdobra: "M-12 -1.4 Q-1 -6.6 11.5 0.8",
  encapuzado: "M-11.5 0.6 Q0 -6 11.5 0.6", grande: "M-12.5 0.5 Q0 -11.5 12.5 0.5", felino: "M-13 -3.4 Q1 -8 11 1.2",
  sonolento: "M-11.5 0.4 Q0 -4.2 11.5 0.4",
};
function olho(x: number, espelho: boolean, f: Olho, cor: string, pele: string, sombraPele: string): string {
  const id = novoId("ol");
  const vinco = f === "semdobra" ? "" : f === "felino"
    ? `<path d="M-13 -3.4 L-16.5 -6" stroke="${TINTA}" stroke-width="2.2" stroke-linecap="round"/><path d="M-8 -9.4 Q1 -12.5 9 -7.6" stroke="${TINTA}" stroke-width="1.1" fill="none" opacity="0.5"/>`
    : f === "sonolento"
    ? `<path d="M-12.5 -0.8 Q0 -8.5 12.5 -0.8" stroke="${sombraPele}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M-11 -5.6 Q0 -10.5 11 -5.6" stroke="${TINTA}" stroke-width="1.1" fill="none" opacity="0.6"/>`
    : f === "encapuzado"
    ? `<path d="M-13 -3.2 Q0 -11.5 13 -3" stroke="${sombraPele}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M-12 -3.6 Q0 -11.5 12 -3.4" stroke="${TINTA}" stroke-width="1.1" fill="none" opacity="0.7"/>`
    : `<path d="M-9 -8.4 Q0 -12.5 9 -8.4" stroke="${TINTA}" stroke-width="1.1" fill="none" opacity="0.55"/>`;
  return `<g transform="translate(${x} 141)${espelho ? " scale(-1 1)" : ""}">
    <clipPath id="${id}"><path d="${FORMA_OLHO[f]}"/></clipPath>
    <path d="${FORMA_OLHO[f]}" fill="#F4EFE6"/>
    <g clip-path="url(#${id})"><circle cx="0.8" cy="0.2" r="5.2" fill="${cor}"/><circle cx="0.8" cy="0.2" r="2.4" fill="#000"/><circle cx="2.4" cy="-1.6" r="1.3" fill="#fff"/>
      <path d="${PALPEBRA[f]}" stroke="${pele}" stroke-width="2" fill="none" opacity="0.4"/></g>
    <path d="${PALPEBRA[f]}" stroke="${TINTA}" stroke-width="${f === "semdobra" ? 3.2 : 2.6}" fill="none" stroke-linecap="round"/>
    ${vinco}</g>`;
}

function sobrancelhas(f: Sobrancelha, esp: number, cor: string, pele: string): string {
  const d: Record<Sobrancelha, string> = {
    reta: "M113 129 L141 125.5", arqueada: "M113 131 Q127 120 141 125.5", angulada: "M113 131 L132 122.5 L141 125.5",
    suave: "M113 129 Q127 124 141 126.5", corte: "M113 131 Q127 120 141 125.5",
  };
  const larg = 1.6 * esp + 1.5;
  const uma = (t: Sobrancelha) => `<path d="${d[t]}" stroke="${TINTA}" stroke-width="${larg + 2}" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="${d[t]}" stroke="${cor}" stroke-width="${larg}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  // corte: dois riscos raspados que atravessam a sobrancelha inteira. A máscara abre um vão de verdade: some o pelo e o
  // contorno, e a pele aparece no meio.
  if (f === "corte") {
    const xs = [123, 131.5], risco = (x: number, w: number, cor: string) => `<path d="M${x - 1.6} ${133 + larg / 2} L${x + 1.6} ${117 - larg / 2}" stroke="${cor}" stroke-width="${w}" stroke-linecap="butt"/>`;
    const mask = `<mask id="corteSobr" maskUnits="userSpaceOnUse" x="100" y="100" width="60" height="50"><rect x="100" y="100" width="60" height="50" fill="#fff"/>${xs.map((x) => risco(x, 3.8, "#000")).join("")}</mask>`;
    void pele;
    return `<defs>${mask}</defs><g mask="url(#corteSobr)">${uma(f)}</g><g transform="translate(300 0) scale(-1 1)">${uma("arqueada")}</g>`;
  }
  return `<g>${uma(f)}</g><g transform="translate(300 0) scale(-1 1)">${uma(f)}</g>`;
}

function nariz(n: Nariz, luz: string): string {
  const l = (d: string, w = 2.4) => `<path d="${d}" stroke="${TINTA}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const narinas = (x1: number, x2: number, y: number) => `<g fill="${TINTA}" opacity="0.75"><ellipse cx="${x1}" cy="${y}" rx="2.3" ry="1.3"/><ellipse cx="${x2}" cy="${y}" rx="2.3" ry="1.3"/></g>`;
  const ponta = (x: number, y: number) => `<ellipse cx="${x}" cy="${y}" rx="3.2" ry="2.2" fill="${luz}"/>`;
  switch (n) {
    case "fino": return ponta(149, 172) + l("M153 140 Q155.5 160 156.5 172") + l("M144 177 Q147.5 181 150 179.5 Q152.5 181 156 177", 2.2);
    case "pequeno": return ponta(149, 172) + l("M143 176 Q150 181.5 157 176");
    case "largo": return ponta(149, 173) + l("M157 145 Q161 162 164 172") + l("M135 177 Q140 185 150 181.5 Q160 185 165 177") + narinas(143, 157, 179.5);
    case "achatado": return ponta(149, 175) + l("M159 160 Q163 168 165 175") + l("M133 178 Q139 186 150 183 Q161 186 167 178") + narinas(142, 158, 181);
    case "arrebitado": return ponta(149, 170) + l("M155 144 Q157 161 158 169") + l("M141 175 Q146 181 150 177.5 Q154 181 159 175");
    case "aquilino": return ponta(152, 170) + l("M152 136 Q161 151 157 168 Q155 175 161 177") + l("M141 177 Q145 182 150 180");
    case "grande": return ponta(150, 175) + l("M157 136 Q165 160 166 176") + l("M136 178 Q142 187 151 183.5 Q160 187 166 178") + narinas(144, 158, 181);
    case "batata": return `<ellipse cx="150" cy="174" rx="8.5" ry="6.5" fill="${luz}" opacity="0.7"/>` + l("M155 142 Q158 156 158.5 165") + l("M141 172 Q137 181 145 182 Q150 185 155 182 Q163 181 159 172") + narinas(144.5, 155.5, 179.5);
    case "torto": return ponta(151, 172) + l("M154 140 Q149 151 155 159 Q160 165 159.5 172") + l("M141 177 Q145 182 150 180 Q155 182 159 177");
    case "botao": return `<circle cx="150" cy="174" r="4.2" fill="${luz}"/>` + l("M145 172 Q143 179 150 179.5 Q157 179 155 172", 2.2) + narinas(147, 153, 177.5).replace(/rx="2.3" ry="1.3"/g, 'rx="1.4" ry="0.9"');
    case "comprido": return ponta(150, 178) + l("M154.5 136 Q158.5 160 159 178") + l("M142 182 Q146 187.5 150.5 185.5 Q155 187.5 159 182") + narinas(145, 156, 184.2).replace(/rx="2.3" ry="1.3"/g, 'rx="1.8" ry="1"');
    default: return ponta(149, 172) + l("M156 140 Q160 160 162 172") + l("M141 177 Q145 182 150 180 Q155 182 159 177");
  }
}

interface GeoBoca { e: P; d: P; topo: number; base: number }
const GEO_BOCA: Record<Boca, GeoBoca> = {
  sorriso: { e: [134, 194], d: [166, 194], topo: 194, base: 203 },
  aberta: { e: [132, 192], d: [168, 192], topo: 192, base: 208 },
  neutra: { e: [136, 196], d: [164, 196], topo: 195.5, base: 201 },
  lado: { e: [136, 197], d: [166, 190], topo: 192.5, base: 201 },
  cheia: { e: [133, 195], d: [167, 195], topo: 189, base: 206 },
  fina: { e: [135, 195], d: [165, 195], topo: 195, base: 200 },
  dentes: { e: [133, 193], d: [167, 193], topo: 192, base: 204 },
};
function boca(b: Boca, pele: string): string {
  const labio = mistura(pele, "#7A2E2A", 0.35), labioLuz = mistura(pele, "#E8A090", 0.2);
  const linha = (d: string) => `<path d="${d}" stroke="${TINTA}" stroke-width="2.6" stroke-linecap="round" fill="none"/>`;
  switch (b) {
    case "aberta": {
      const forma = "M132 192 Q150 195 168 192 Q150 214 132 192 Z", id = novoId("bo");
      return `<clipPath id="${id}"><path d="${forma}"/></clipPath><path d="${forma}" fill="#3A1010"/>
        <g clip-path="url(#${id})"><rect x="128" y="186" width="44" height="13" fill="#F7F3EC"/><line x1="150" y1="193" x2="150" y2="198.5" stroke="#CFC6B6" stroke-width="1"/><ellipse cx="150" cy="210" rx="10" ry="5" fill="#B5474A"/></g>
        <path d="${forma}" fill="none" stroke="${TINTA}" stroke-width="2.6" stroke-linejoin="round"/>`;
    }
    case "fina": return `<path d="M138 197.2 Q150 200.5 162 197.2 Q150 198.8 138 197.2 Z" fill="${labio}"/>` + linha("M135 195 Q150 199 165 195");
    case "dentes": {
      const forma = "M133 193 Q150 196.5 167 193 Q160 205 150 205 Q140 205 133 193 Z", id = novoId("bo");
      return `<clipPath id="${id}"><path d="${forma}"/></clipPath><path d="${forma}" fill="#F7F3EC"/>
        <g clip-path="url(#${id})"><path d="M133 199.5 Q150 202 167 199.5" stroke="#CFC6B6" stroke-width="1.2" fill="none"/>${[143, 150, 157].map((x) => `<line x1="${x}" y1="195" x2="${x}" y2="204" stroke="#D8D0C2" stroke-width="0.9"/>`).join("")}</g>
        <path d="${forma}" fill="none" stroke="${TINTA}" stroke-width="2.6" stroke-linejoin="round"/>`;
    }
    case "neutra": return `<path d="M140 198 Q150 203 160 198 Q150 200 140 198 Z" fill="${labio}"/>` + linha("M136 196 L164 196");
    case "lado": return `<path d="M141 199 Q152 205 161 196 Q152 201 141 199 Z" fill="${labio}"/>` + linha("M136 197 Q153 199 166 190");
    case "cheia": return `<path d="M133 195 Q141 187 150 190 Q159 187 167 195 Q150 197 133 195 Z" fill="${mistura(labio, "#000", 0.15)}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M133 195 Q150 197 167 195 Q160 207 150 207 Q140 207 133 195 Z" fill="${labio}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><ellipse cx="146" cy="201" rx="5" ry="1.6" fill="${labioLuz}"/>`;
    default: return `<path d="M138 197 Q150 205 162 197 Q150 201 138 197 Z" fill="${labio}"/>` + linha("M134 194 Q150 201 166 194");
  }
}

// ---------------------------------- barba ----------------------------------
/** Barba feita a partir da boca: o bigode liga nas laterais, o recorte deixa só os lábios à mostra. */
function barba(b: Barba, f: Forma, rostoD: string, bocaId: Boca, nariz: Nariz, cor: string, pele: string): string {
  if (b === "nenhuma") return "";
  const g = GEO_BOCA[bocaId], [ex, ey] = g.e, [dx, dy] = g.d;
  const nb = nariz === "grande" || nariz === "achatado" ? 186 : nariz === "comprido" ? 189 : 183; // logo abaixo do nariz
  const furo = `M${ex - 2} ${ey} Q150 ${g.topo - 3} ${dx + 2} ${dy} Q150 ${g.base + 3} ${ex - 2} ${ey} Z`;
  const bigodeD = (grosso: boolean) => {
    const p = grosso ? 5 : 2, alto = grosso ? nb : nb + 1.5;
    return `M${ex - 2 - p} ${ey + (grosso ? 6 : 0)} L${ex - 1} ${ey - 1.5} Q150 ${Math.min(ey, dy, g.topo) - 2} ${dx + 1} ${dy - 1.5} L${dx + 2 + p} ${dy + (grosso ? 6 : 0)} C${dx + 2} ${alto + 5} ${dx - 8} ${alto} 150 ${alto + 0.5} C${ex + 8} ${alto} ${ex - 2} ${alto + 5} ${ex - 2 - p} ${ey + (grosso ? 6 : 0)} Z`;
  };
  const queixoD = `M${ex + 1} ${ey + 4} Q150 ${g.base + 4} ${dx - 1} ${dy + 4} C${dx + 1} ${f.Q - 12} ${dx - 4} ${f.Q + 2} 150 ${f.Q + 4} C${ex + 4} ${f.Q + 2} ${ex - 1} ${f.Q - 12} ${ex + 1} ${ey + 4} Z`;
  const wB = largura(f, 132);
  const regiao = `M${150 - wB - 14} 130 L${150 - wB + 9} 130 C${150 - wB + 12} 160 ${ex - 14} ${ey - 16} ${ex - 7} ${nb + 1} Q150 ${nb - 4} ${dx + 7} ${nb + 1} C${dx + 14} ${dy - 16} ${150 + wB - 12} 160 ${150 + wB - 9} 130 L${150 + wB + 14} 130 L${150 + wB + 14} 250 L${150 - wB - 14} 250 Z`;
  const mascara = novoId("bm"), clip = novoId("bc"), pts = novoId("bp");
  const defs = `<defs><mask id="${mascara}" maskUnits="userSpaceOnUse" x="0" y="0" width="${LARG}" height="${ALT}"><rect width="${LARG}" height="${ALT}" fill="#fff"/><path d="${furo}" fill="#000"/>${
    b === "queixo" ? `<path d="${rostoD}" transform="translate(150 140) scale(0.84 0.86) translate(-150 -140)" fill="#000"/>` : ""}</mask>
    <clipPath id="${clip}"><path d="${rostoD}"/></clipPath>
    <pattern id="${pts}" width="3.6" height="3.6" patternUnits="userSpaceOnUse"><circle cx="1.8" cy="1.8" r="0.8" fill="${TINTA}"/></pattern></defs>`;
  const dentro = (c: string) => `<g clip-path="url(#${clip})" mask="url(#${mascara})">${c}</g>`;
  const fora = (c: string) => `<g mask="url(#${mascara})">${c}</g>`;
  const p = (d: string, fill: string) => `<path d="${d}" fill="${fill}"/>`;
  const textura = (d: string, op: number) => `<path d="${d}" fill="url(#${pts})" opacity="${op}"/>`;
  const conector = `M${ex - 4} ${ey - 1.5} L${ex - 0.5} ${ey - 1.5} L${ex + 3} ${ey + 6} L${ex - 1} ${ey + 7} Z M${dx + 4} ${dy - 1.5} L${dx + 0.5} ${dy - 1.5} L${dx - 3} ${dy + 6} L${dx + 1} ${dy + 7} Z`;
  let corpo = "";
  switch (b) {
    case "sombra": corpo = dentro(p(regiao, mistura(cor, pele, 0.78)) + textura(regiao, 0.35)); break;
    case "rala": corpo = dentro(p(regiao, mistura(cor, pele, 0.55)) + textura(regiao, 0.5)); break;
    case "bigode": corpo = dentro(p(bigodeD(false), cor) + `<path d="${bigodeD(false)}" fill="none" stroke="${TINTA}" stroke-width="1.6"/>`); break;
    case "bigodao": corpo = dentro(p(bigodeD(true), cor) + `<path d="${bigodeD(true)}" fill="none" stroke="${TINTA}" stroke-width="1.8"/>`); break;
    case "cavanhaque": corpo = dentro(p(queixoD, cor) + `<path d="${queixoD}" fill="none" stroke="${TINTA}" stroke-width="1.6"/>`); break;
    case "cavanhaque_bigode": corpo = dentro(p(bigodeD(false), cor) + p(queixoD, cor) + p(conector, cor) + textura(queixoD, 0.3)); break;
    case "queixo": corpo = dentro(p(regiao, cor) + textura(regiao, 0.3)); break;
    case "costeletas": corpo = dentro(`<rect x="${150 - wB - 4}" y="118" width="17" height="56" rx="4" fill="${cor}"/><rect x="${150 + wB - 13}" y="118" width="17" height="56" rx="4" fill="${cor}"/>`); break;
    case "curta": corpo = dentro(p(regiao, mistura(cor, pele, 0.22)) + textura(regiao, 0.55)); break;
    case "cheia": corpo = dentro(p(regiao, cor) + textura(regiao, 0.35)); break;
    case "longa": {
      const ext = `M${150 - f.w176 + 6} 176 Q${150 - f.w176} ${f.Q + 22} 150 ${f.Q + 36} Q${150 + f.w176} ${f.Q + 22} ${150 + f.w176 - 6} 176 Z`;
      corpo = dentro(p(regiao, cor) + textura(regiao, 0.3)) + fora(p(ext, cor) + `<path d="M${150 - f.w176 + 8} ${f.Q - 4} Q${150 - f.w176 + 4} ${f.Q + 20} 150 ${f.Q + 34} Q${150 + f.w176 - 4} ${f.Q + 20} ${150 + f.w176 - 8} ${f.Q - 4}" fill="none" stroke="${TINTA}" stroke-width="${TRACO}"/><path d="M142 ${f.Q + 8} Q150 ${f.Q + 26} 158 ${f.Q + 8}" stroke="${escurecer(cor, 0.7)}" stroke-width="2" fill="none"/>`);
      break;
    }
  }
  return defs + corpo;
}

// ---------------------------------- corpo ----------------------------------
const TRONCO_V = "M0 360 L0 294 C10 270 40 256 76 248 C96 244 106 236 110 221 L150 273 L190 221 C194 236 204 244 224 248 C260 256 290 270 300 294 L300 360 Z";
const TRONCO_RETO = "M0 360 L0 294 C10 270 40 256 76 248 C98 243 112 236 118 225 C130 236 170 236 182 225 C188 236 202 243 224 248 C260 256 290 270 300 294 L300 360 Z";
const PESCOCO = "M124 186 L120 242 L180 242 L176 186 Z";
const PEITO = "M106 218 L150 286 L194 218 Z";
const GOLA_TRAS = "M110 221 C113 214 128 211 150 211 C172 211 187 214 190 221 L182 224 C179 219 168 217 150 217 C132 217 121 219 118 224 Z";
const GOLA_V = "M110 221 L150 273 L190 221 L182 224 L150 262 L118 224 Z";

function sombrasTronco(id: string): string {
  return `<path d="M0 300 C20 276 50 262 80 254 L60 360 L0 360 Z" fill="#000" opacity="0.22"/><path d="M300 300 C280 276 250 262 220 254 L240 360 L300 360 Z" fill="#000" opacity="0.34"/>
    <path d="M300 300 C280 276 250 262 220 254 L240 360 L300 360 Z" fill="url(#${id})" opacity="0.5"/>`;
}
function padraoCamisa(c: Camisa): string {
  switch (c.estilo) {
    case "listrasV": return Array.from({ length: 11 }, (_, i) => `<rect x="${-6 + i * 30}" y="210" width="15" height="150" fill="${c.cor2}"/>`).join("");
    case "listrasH": return Array.from({ length: 8 }, (_, i) => `<rect x="0" y="${246 + i * 18}" width="300" height="9" fill="${c.cor2}"/>`).join("");
    case "faixa": return `<path d="M54 250 L88 242 L300 352 L300 360 L258 360 Z" fill="${c.cor2}"/>`;
    case "faixaH": return `<rect x="0" y="326" width="300" height="12" fill="${c.cor2}"/>${c.cor3 ? `<rect x="0" y="338" width="300" height="12" fill="${c.cor3}"/>` : ""}`;
    default: return "";
  }
}

function uniforme(c: Camisa, numero: string | undefined, pele: string, sombraPele: string, hach: string): string {
  const id = novoId("tr");
  const golaCor = luminancia(c.cor1) > 0.8 ? c.cor2 : c.estilo === "lisa" ? escurecer(c.cor1, 0.55) : c.cor2;
  const friso = luminancia(golaCor) < 0.4 ? "#E9E2CF" : escurecer(golaCor, 0.6);
  const corNumero = luminancia(c.cor1) < 0.5 || c.estilo === "listrasV" ? "#F2E6C2" : escurecer(c.cor1, 0.4);
  return `<path d="${GOLA_TRAS}" fill="${golaCor}" stroke="${TINTA}" stroke-width="${TRACO * 0.8}" stroke-linejoin="round"/>
    <path d="${PESCOCO}" fill="${pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>
    <path d="${PEITO}" fill="${pele}"/>
    <path d="M124 192 Q150 228 176 192 L178 222 Q150 240 122 222 Z" fill="${sombraPele}"/>
    <clipPath id="${id}"><path d="${TRONCO_V}"/></clipPath>
    <path d="${TRONCO_V}" fill="${c.cor1}"/>
    <g clip-path="url(#${id})">${padraoCamisa(c)}${sombrasTronco(hach)}</g>
    <path d="${TRONCO_V}" fill="none" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>
    <path d="${GOLA_V}" fill="${golaCor}" stroke="${TINTA}" stroke-width="${TRACO * 0.8}" stroke-linejoin="round"/>
    <path d="M118 224 L150 262 L182 224" fill="none" stroke="${friso}" stroke-width="1.8" stroke-linejoin="round"/>
    ${numero ? `<text x="98" y="318" text-anchor="middle" ${attrFonte(fonteCamisa(c.fonte ?? `${c.cor1}${c.cor2}`), 32)} fill="${corNumero}" stroke="${TINTA}" stroke-width="1.4" paint-order="stroke">${numero}</text>` : ""}`;
}

function roupaSocial(tipo: RoupaSocial, corIdx: number, pele: string, sombraPele: string, hach: string): string {
  const c = CORES_ROUPA[corIdx], s = escurecer(c, 0.78), claro = luminancia(c) > 0.6;
  const detalhe = claro ? escurecer(c, 0.55) : mistura(c, "#FFFFFF", 0.45);
  const id = novoId("rs");
  const pescoco = `<path d="${PESCOCO}" fill="${pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/><path d="M124 192 Q150 228 176 192 L178 222 Q150 240 122 222 Z" fill="${sombraPele}"/>`;
  const corpo = (d: string, fill: string) => `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${fill}"/><g clip-path="url(#${id})">${sombrasTronco(hach)}</g><path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>`;
  switch (tipo) {
    case "regata": {
      const ombros = TRONCO_RETO;
      const regata = "M100 360 C104 316 96 282 108 250 L124 230 C134 242 166 242 176 230 L192 250 C204 282 196 316 200 360 Z";
      return pescoco + `<path d="${ombros}" fill="${pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/><path d="M0 300 C20 276 50 262 80 254 L60 360 L0 360 Z" fill="${sombraPele}" opacity="0.5"/><path d="M300 300 C280 276 250 262 220 254 L240 360 L300 360 Z" fill="${sombraPele}"/>` +
        corpo(regata, c) + `<path d="M124 232 C134 244 166 244 176 232" stroke="${s}" stroke-width="3" fill="none"/>`;
    }
    case "moletom": {
      const capuz = "M96 250 C92 218 116 202 150 202 C184 202 208 218 204 250 C190 238 172 232 150 232 C128 232 110 238 96 250 Z";
      return `<path d="${capuz}" fill="${s}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>` + pescoco + corpo(TRONCO_RETO, c) +
        `<path d="M118 226 C130 240 170 240 182 226" stroke="${s}" stroke-width="7" fill="none"/><path d="M118 226 C130 240 170 240 182 226" stroke="${TINTA}" stroke-width="1.6" fill="none"/>` +
        `<path d="M138 238 L136 276 M162 238 L164 276" stroke="${detalhe}" stroke-width="2.6" stroke-linecap="round"/><circle cx="136" cy="278" r="2.6" fill="${detalhe}"/><circle cx="164" cy="278" r="2.6" fill="${detalhe}"/>` +
        `<path d="M104 330 L196 330 L188 360 L112 360 Z" fill="${s}" stroke="${TINTA}" stroke-width="1.6"/>`;
    }
    case "polo":
      return pescoco + corpo(TRONCO_RETO, c) +
        `<path d="M116 224 L150 238 L136 258 L108 236 Z" fill="${s}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M184 224 L150 238 L164 258 L192 236 Z" fill="${s}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/>` +
        `<path d="M146 238 L146 280 L154 280 L154 238" fill="none" stroke="${TINTA}" stroke-width="1.4"/><circle cx="150" cy="252" r="2" fill="${detalhe}"/><circle cx="150" cy="266" r="2" fill="${detalhe}"/>`;
    case "jaqueta": {
      const jeans = "#4F6E9C", jeansS = "#3B5680";
      return pescoco + corpo(TRONCO_RETO, jeans) +
        `<path d="M122 228 L150 250 L178 228 L182 360 L118 360 Z" fill="${c}" stroke="${TINTA}" stroke-width="1.8"/>` +
        `<path d="M114 224 L140 262 L124 278 L96 238 Z" fill="${jeansS}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M186 224 L160 262 L176 278 L204 238 Z" fill="${jeansS}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/>` +
        `<path d="M72 296 L104 296 M196 296 L228 296" stroke="#E2B36A" stroke-width="1.6" stroke-dasharray="4 3"/><path d="M118 280 L118 360 M182 280 L182 360" stroke="${TINTA}" stroke-width="1.6"/>`;
    }
    case "camisa":
      return pescoco + corpo(TRONCO_RETO, c) +
        `<path d="M116 222 L150 242 L134 258 L108 232 Z" fill="${mistura(c, "#000", 0.06)}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/><path d="M184 222 L150 242 L166 258 L192 232 Z" fill="${mistura(c, "#000", 0.06)}" stroke="${TINTA}" stroke-width="1.8" stroke-linejoin="round"/>` +
        `<path d="M150 242 L150 360" stroke="${TINTA}" stroke-width="1.4"/>${[262, 286, 310, 334].map((y) => `<circle cx="154" cy="${y}" r="2" fill="${detalhe}"/>`).join("")}`;
    default:
      return pescoco + corpo(TRONCO_RETO, c) + `<path d="M118 226 C130 240 170 240 182 226" stroke="${s}" stroke-width="5" fill="none"/><path d="M118 226 C130 240 170 240 182 226" stroke="${TINTA}" stroke-width="1.4" fill="none"/>`;
  }
}

// ---------------------------------- acessórios ----------------------------------
const PRATA = "#D9DCE0";
/** Faixa de cabelo ou bandana, por cima do cabelo. */
function acessorioCabeca(tipo: AcessorioCabeca, f: Forma, cor: string): string {
  if (tipo === "faixa") {
    const y1 = f.T + 15, y2 = f.T + 27, w1 = largura(f, y1) + 4, w2 = largura(f, y2) + 4;
    const d = `M${f1(150 - w1)} ${y1} Q150 ${y1 - 7} ${f1(150 + w1)} ${y1} L${f1(150 + w2)} ${y2} Q150 ${y2 - 7} ${f1(150 - w2)} ${y2} Z`;
    const friso = luminancia(cor) > 0.6 ? escurecer(cor, 0.7) : mistura(cor, "#FFFFFF", 0.4);
    return contorno(d, cor) + `<path d="M${f1(150 - w1 + 3)} ${y1 + 5.5} Q150 ${y1 - 1.5} ${f1(150 + w1 - 3)} ${y1 + 5.5}" stroke="${friso}" stroke-width="1.6" fill="none"/>`;
  }
  if (tipo === "bandana") {
    const d = calota(f, { volume: 5, testa: f.T + 24, folga: 4 });
    const s = escurecer(cor, 0.72), detalhe = luminancia(cor) > 0.6 ? escurecer(cor, 0.55) : mistura(cor, "#FFFFFF", 0.55);
    let estampa = "";
    for (let i = 0; i < 16; i++) estampa += `<circle cx="${f1(150 - f.w100 + ((i * 37) % 97) / 97 * 2 * f.w100)}" cy="${f1(f.T - 6 + ((i * 53) % 61) / 61 * 30)}" r="${i % 3 ? 1.4 : 2.4}" fill="${detalhe}"/>`;
    const nx = 150 + f.w100 + 2, ny = f.T + 30;
    const no = `M${nx} ${ny} Q${nx + 12} ${ny + 2} ${nx + 16} ${ny + 14} Q${nx + 8} ${ny + 12} ${nx + 2} ${ny + 8} Z M${nx} ${ny + 2} Q${nx + 6} ${ny + 14} ${nx + 4} ${ny + 26} Q${nx - 2} ${ny + 18} ${nx - 4} ${ny + 6} Z`;
    return contorno(no, s) + contorno(d, cor) + recorte(d, estampa) + `<path d="${calotaPartes(f, { volume: 5, testa: f.T + 24, folga: 4 }).dentro.replace(/^ L/, "M").replace(/ Z$/, "")}" stroke="${s}" stroke-width="3" fill="none"/>`;
  }
  return "";
}
/** Cabelo alto não cabe embaixo do boné: vira um corte baixo da mesma cor (o comprido continua aparecendo atrás). */
const SOB_BONE: Partial<Record<Cabelo, Cabelo>> = { blackpower: "crespo", topete: "curto", moicano: "raspado", coque: "curto", flattop: "degrade", franja: "curto", undercut: "curto", risco: "degrade" };
/** Boné de patrocinador: copa em seis gomos, aba curva por cima da testa e o símbolo da marca na frente. */
function bonePatro(f: Forma, b: { cor: string; aba: string; logo: string }): string {
  const faixa = f.T + 30, w = f.w100 + 5, topo = f.T - 12;
  const copa = `M${f1(150 - w)} ${faixa} C${f1(150 - w)} ${topo + 6} ${f1(150 - w * 0.55)} ${topo} 150 ${topo} C${f1(150 + w * 0.55)} ${topo} ${f1(150 + w)} ${topo + 6} ${f1(150 + w)} ${faixa} Q150 ${faixa - 7} ${f1(150 - w)} ${faixa} Z`;
  const aba = `M${f1(150 - w - 4)} ${faixa - 1} Q150 ${faixa - 9} ${f1(150 + w + 4)} ${faixa - 1} Q${f1(150 + w * 0.72)} ${faixa + 15} 150 ${faixa + 17} Q${f1(150 - w * 0.72)} ${faixa + 15} ${f1(150 - w - 4)} ${faixa - 1} Z`;
  const gomos = `<path d="M150 ${topo} L150 ${faixa - 7} M${f1(150 - w * 0.5)} ${topo + 4} Q${f1(150 - w * 0.62)} ${faixa - 14} ${f1(150 - w * 0.66)} ${faixa - 4} M${f1(150 + w * 0.5)} ${topo + 4} Q${f1(150 + w * 0.62)} ${faixa - 14} ${f1(150 + w * 0.66)} ${faixa - 4}" stroke="${TINTA}" stroke-opacity=".35" stroke-width="1.3" fill="none"/>`;
  const luz = `<path d="M${f1(150 - w * 0.7)} ${topo + 14} Q${f1(150 - w * 0.4)} ${topo + 2} 140 ${topo + 2}" stroke="#fff" stroke-opacity=".25" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return contorno(copa, b.cor) + luz + gomos + `<g transform="translate(136 ${topo + 8}) scale(.7)">${b.logo}</g>` + contorno(aba, b.aba)
    + `<path d="M${f1(150 - w * 0.8)} ${faixa + 4} Q150 ${faixa + 11} ${f1(150 + w * 0.8)} ${faixa + 4}" stroke="${TINTA}" stroke-opacity=".3" stroke-width="1.2" fill="none"/><circle cx="150" cy="${topo + 1}" r="3.2" fill="${b.cor}" stroke="${TINTA}" stroke-width="1.4"/>`;
}
/** Blusão de patrocinador: moletom com capuz nas cores da marca e o símbolo no peito. */
function blusaoPatroSvg(b: { cor: string; detalhe: string; logo: string }, pele: string, sombraPele: string, hach: string): string {
  const s = escurecer(b.cor, 0.78), id = novoId("bl");
  const pescoco = `<path d="${PESCOCO}" fill="${pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/><path d="M124 192 Q150 228 176 192 L178 222 Q150 240 122 222 Z" fill="${sombraPele}"/>`;
  const capuz = "M96 250 C92 218 116 202 150 202 C184 202 208 218 204 250 C190 238 172 232 150 232 C128 232 110 238 96 250 Z";
  return `<path d="${capuz}" fill="${s}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>` + pescoco
    + `<clipPath id="${id}"><path d="${TRONCO_RETO}"/></clipPath><path d="${TRONCO_RETO}" fill="${b.cor}"/><g clip-path="url(#${id})">${sombrasTronco(hach)}<path d="M60 300 L240 300" stroke="${b.detalhe}" stroke-width="5" opacity=".9"/></g><path d="${TRONCO_RETO}" fill="none" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>`
    + `<path d="M118 226 C130 240 170 240 182 226" stroke="${s}" stroke-width="7" fill="none"/><path d="M118 226 C130 240 170 240 182 226" stroke="${TINTA}" stroke-width="1.6" fill="none"/>`
    + `<path d="M138 238 L136 270 M162 238 L164 270" stroke="${b.detalhe}" stroke-width="2.6" stroke-linecap="round"/>`
    + `<g transform="translate(170 256) scale(.85)">${b.logo}</g>`;
}
/** Óculos: de grau (aro fino, lente clara) ou escuros de patrocinador. */
function oculos(wO: number, sol: OculosSol | null | undefined): string {
  const haste = (cor: string, w: number) => `<path d="M114 137 L${f1(150 - wO + 1)} 135 M186 137 L${f1(150 + wO - 1)} 135" stroke="${cor}" stroke-width="${w}" stroke-linecap="round"/>`;
  if (!sol) {
    const aro = "#2B2B2B", lente = (x: number) => `<rect x="${x - 15}" y="130" width="30" height="22" rx="8" fill="#FFFFFF" fill-opacity="0.12" stroke="${aro}" stroke-width="2.4"/><path d="M${x - 9} 134 L${x - 4} 134" stroke="#FFFFFF" stroke-width="1.6" opacity="0.7" stroke-linecap="round"/>`;
    return haste(aro, 2.2) + lente(129) + lente(171) + `<path d="M144 139 Q150 134.5 156 139" stroke="${aro}" stroke-width="2.2" fill="none"/>`;
  }
  const id = novoId("ls");
  const grad = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${escurecer(sol.lente, 0.55)}"/><stop offset="1" stop-color="${sol.lente}"/></linearGradient></defs>`;
  const brilho = (x: number) => `<path d="M${x - 9} 135 L${x - 2} 133" stroke="#FFFFFF" stroke-width="2" opacity="0.55" stroke-linecap="round"/>`;
  if (sol.modelo === "esportivo") {
    const d = "M106 132 Q150 123 194 132 Q195 147 179 152 Q165 155 157 147 Q150 142 143 147 Q135 155 121 152 Q105 147 106 132 Z";
    return grad + haste(sol.armacao, 3) + `<path d="${d}" fill="url(#${id})" stroke="${TINTA}" stroke-width="2.4" stroke-linejoin="round"/><path d="M106 132 Q150 123 194 132" stroke="${sol.armacao}" stroke-width="4" fill="none"/>` + brilho(124) + brilho(166);
  }
  const lenteD = sol.modelo === "aviador" ? "M-15 -8 Q0 -11 15 -8 Q16 4 7 10 Q0 12 -8 9 Q-16 4 -15 -8 Z" : "M-16 -9 L16 -9 L14 6 Q13 10 9 10 L-10 10 Q-14 10 -15 6 Z";
  const lente = (x: number, esp: boolean) => `<path d="${lenteD}" transform="translate(${x} 140)${esp ? " scale(-1 1)" : ""}" fill="url(#${id})" stroke="${sol.modelo === "aviador" ? sol.armacao : TINTA}" stroke-width="${sol.modelo === "aviador" ? 2 : 3.2}" stroke-linejoin="round"/>`;
  const ponte = sol.modelo === "aviador" ? `<path d="M144 133 Q150 130 156 133 M141 131 L159 131" stroke="${sol.armacao}" stroke-width="1.8" fill="none"/>` : `<path d="M145 135 Q150 132 155 135" stroke="${TINTA}" stroke-width="3" fill="none"/>`;
  return grad + haste(sol.modelo === "aviador" ? sol.armacao : TINTA, sol.modelo === "aviador" ? 1.8 : 3) + lente(129, true) + lente(171, false) + ponte + brilho(129) + brilho(171);
}
function piercing(p: Piercing | undefined): string {
  const nariz = `<circle cx="157.5" cy="181" r="2.8" fill="none" stroke="${PRATA}" stroke-width="1.6"/><path d="M155.6 179 a2.8 2.8 0 0 1 4.4 1" stroke="${TINTA}" stroke-width="0.6" fill="none" opacity="0.5"/>`;
  const sobr = `<circle cx="182" cy="121.5" r="2" fill="${PRATA}" stroke="${TINTA}" stroke-width="0.9"/><circle cx="184" cy="133" r="2" fill="${PRATA}" stroke="${TINTA}" stroke-width="0.9"/>`;
  return p === "nariz" ? nariz : p === "sobrancelha" ? sobr : p === "dois" ? nariz + sobr : "";
}
/** Fone de patrocinador pendurado no pescoço. */
export function foneNoPescoco(cor: string, detalhe: string, y = 0): string {
  return `<g transform="translate(0 ${y})"><path d="M120 222 Q150 252 180 222" stroke="${TINTA}" stroke-width="7.5" fill="none" stroke-linecap="round"/><path d="M120 222 Q150 252 180 222" stroke="${cor}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="114" cy="226" rx="9" ry="12" fill="${cor}" stroke="${TINTA}" stroke-width="2.4"/><ellipse cx="186" cy="226" rx="9" ry="12" fill="${cor}" stroke="${TINTA}" stroke-width="2.4"/>
    <ellipse cx="114" cy="226" rx="4" ry="6" fill="${detalhe}"/><ellipse cx="186" cy="226" rx="4" ry="6" fill="${detalhe}"/></g>`;
}

// ---------------------------------- montagem ----------------------------------
export interface OpcoesFoto {
  aparencia: Aparencia | null; // null = silhueta (ainda sem aparência escolhida)
  camisa?: Camisa;
  numero?: string;
  cenario?: string; // cenário no sistema antigo de 200x220, ampliado para o quadro
  traje?: Traje;
  /** só a cabeça e o pescoço, sem fundo (para montar o corpo inteiro) */
  soCabeca?: boolean;
  /** desenho extra por cima do pescoço (tatuagem), nas coordenadas do quadro */
  pescoco?: string;
  /** fora de campo (corpo inteiro de roupa do dia a dia): óculos aparecem */
  fora?: boolean;
}

export function svgFoto(o: OpcoesFoto): string {
  const a = { ...APARENCIA_PADRAO, ...(o.aparencia ?? {}) };
  const silhueta = !o.aparencia;
  const f = FORMAS[a.rosto];
  const rostoD = contornoRosto(f);
  const pele = silhueta ? "#1E2E28" : PELES[a.pele];
  const sombraPele = silhueta ? "#18261F" : mistura(pele, "#2A1206", 0.28);
  const luzPele = silhueta ? pele : mistura(pele, "#FFF3E0", 0.22);
  const cor = silhueta ? "#14211C" : CORES_CABELO[a.corCabelo];
  const corSobr = silhueta ? cor : (a.corCabelo >= 7 ? CORES_CABELO[2] : cor);
  const hach = novoId("hc"), clipRosto = novoId("cr");
  const defs = `<defs><pattern id="${hach}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><line x1="0" y1="0" x2="0" y2="6" stroke="${TINTA}" stroke-width="1"/></pattern>
    <clipPath id="${clipRosto}"><path d="${rostoD}"/></clipPath></defs>`;
  const wO = largura(f, 146);
  const orelha = (lado: -1 | 1) => {
    const x = 150 + lado * (wO - 1);
    const d = `M${x} 128 C${x + lado * 13} 122 ${x + lado * 16} 142 ${x + lado * 11} 156 C${x + lado * 8} 166 ${x + lado * 2} 168 ${x - lado * 2} 163 Z`;
    return `<path d="${d}" fill="${lado === 1 ? sombraPele : pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/><path d="M${x + lado * 4} 136 C${x + lado * 10} 136 ${x + lado * 10} 150 ${x + lado * 5} 154" stroke="${TINTA}" stroke-width="1.4" fill="none"/>`;
  };
  const corpo = o.soCabeca
    ? `<path d="${PESCOCO}" fill="${pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/><path d="M124 192 Q150 228 176 192 L178 222 Q150 240 122 222 Z" fill="${sombraPele}"/>`
    : silhueta
    ? uniforme({ cor1: "#1E2E28", cor2: "#18261F", estilo: "lisa" }, undefined, pele, sombraPele, hach)
    : o.traje === "social" ? (a.blusaoPatro ? blusaoPatroSvg(a.blusaoPatro, pele, sombraPele, hach) : roupaSocial(a.roupaSocial, a.corSocial, pele, sombraPele, hach))
    : uniforme(o.camisa ?? CAMISA_PADRAO, o.numero, pele, sombraPele, hach);
  const detalhes = silhueta ? "" : [
    a.sardas ? [[118, 160], [125, 164], [132, 160], [168, 160], [175, 164], [182, 160], [121, 168], [179, 168]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${mistura(pele, "#5A2A12", 0.5)}"/>`).join("") : "",
    a.pinta ? `<circle cx="172" cy="186" r="2" fill="${mistura(pele, "#000", 0.6)}"/>` : "",
    a.brinco ? `<circle cx="${150 - wO - 6}" cy="166" r="3.4" fill="#E9E4D8" stroke="${TINTA}" stroke-width="1.4"/>` : "",
    a.brinco2 ? `<circle cx="${150 + wO + 6}" cy="166" r="3.4" fill="#E9E4D8" stroke="${TINTA}" stroke-width="1.4"/>` : "",
    piercing(a.piercing),
  ].join("");
  const fora = !silhueta && (o.fora || o.traje === "social");
  const comBone = fora && !!a.bonePatro, cabeloV: Cabelo = comBone ? SOB_BONE[a.cabelo] ?? a.cabelo : a.cabelo;
  const naCabeca = silhueta ? "" : comBone ? bonePatro(f, a.bonePatro!) : acessorioCabeca(a.acessorio ?? "nenhum", f, CORES_ROUPA[a.corAcessorio ?? 0] ?? CORES_ROUPA[0]);
  // escuros só fora de campo; de grau em tudo, menos no corpo inteiro de uniforme
  const oculosHtml = silhueta ? "" : fora && a.oculosSol ? oculos(wO, a.oculosSol) : a.acessorio === "oculos" && !(o.soCabeca && !o.fora) ? oculos(wO, null) : "";
  const fone = fora && !o.soCabeca && a.fone ? foneNoPescoco(a.fone.cor, a.fone.detalhe) : "";
  const rosto = silhueta ? "" : `
    ${sobrancelhas(a.formatoSobrancelha, a.sobrancelha, corSobr, pele)}
    ${olho(129, false, a.formatoOlho, CORES_OLHOS[a.olhos], pele, sombraPele)}${olho(171, true, a.formatoOlho, CORES_OLHOS[a.olhos], pele, sombraPele)}
    ${nariz(a.nariz, luzPele)}
    ${boca(a.boca, pele)}
    ${detalhes}`;
  const cenario = o.soCabeca ? "" : o.cenario ? `<g transform="scale(1.5 1.6364)">${o.cenario}</g>` : `<rect width="${LARG}" height="${ALT}" fill="#13261F"/>`;
  return `<svg viewBox="0 0 ${LARG} ${ALT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto de perfil do jogador">
  ${defs}${cenario}
  <g${silhueta ? ' opacity="0.94"' : ""}>
  ${cabeloAtras(cabeloV, f, cor)}
  ${corpo}
  ${silhueta ? "" : a.corrente && o.traje === "social" ? `<path d="M126 226 Q150 270 174 226" stroke="#D9B44A" stroke-width="2.6" fill="none"/><circle cx="150" cy="252" r="4" fill="#D9B44A" stroke="${TINTA}" stroke-width="1.2"/>` : ""}
  ${o.pescoco ?? ""}
  ${fone}
  ${orelha(-1)}${orelha(1)}
  <path d="${rostoD}" fill="${pele}"/>
  <g clip-path="url(#${clipRosto})">
    <path d="${sombraRosto(f)}" fill="${sombraPele}"/>
    <path d="${sombraRosto(f)}" fill="url(#${hach})" opacity="0.35"/>
    ${silhueta ? "" : `<path d="M${150 - 0.7 * f.w100} ${f.T + 30} Q${150 - 0.5 * f.w100} ${f.T + 18} ${150 - 0.15 * f.w100} ${f.T + 18} Q${150 - 0.45 * f.w100} ${f.T + 26} ${150 - 0.55 * f.w100} ${f.T + 46} Z" fill="${luzPele}"/>`}
    <path d="M${150 - f.w176 + 2} 176 Q150 ${f.Q + 6} ${150 + f.w176 - 2} 176 L${150 + f.w176} ${f.Q + 10} L${150 - f.w176} ${f.Q + 10} Z" fill="${sombraPele}" opacity="0.25"/>
  </g>
  ${silhueta ? "" : barba(a.barba, f, rostoD, a.boca, a.nariz, cor, pele)}
  <path d="${rostoD}" fill="none" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>
  ${cabeloFrente(cabeloV, f, cor, pele)}
  ${naCabeca}
  ${rosto}
  ${oculosHtml}
  ${silhueta ? `<text x="150" y="160" text-anchor="middle" font-family="'Big Shoulders Display','Arial Narrow',sans-serif" font-weight="900" font-size="52" fill="#3A5148">?</text>` : ""}
  </g>
</svg>`;
}
