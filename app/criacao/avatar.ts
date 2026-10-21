// Avatar 2D montado por partes. Cabelo e orelhas usam as medidas de cada formato de rosto,
// então todo corte encaixa em todo rosto. A camisa pode ter o padrão do clube do coração.
export type Rosto = "oval" | "redondo" | "quadrado" | "longo" | "coracao" | "largo";
export type Cabelo =
  | "careca" | "raspado" | "curto" | "degrade" | "topete" | "franja" | "ondulado" | "cacheado"
  | "crespo" | "blackpower" | "trancas" | "dreads" | "moicano" | "coque" | "longo";
export type Olho = "amendoado" | "redondo" | "estreito" | "caido" | "erguido" | "semdobra" | "encapuzado";
export type Sobrancelha = "reta" | "arqueada" | "angulada" | "suave" | "corte";
export type Nariz = "reto" | "pequeno" | "fino" | "largo" | "achatado" | "arrebitado" | "aquilino" | "grande";
export type RoupaSocial = "camiseta" | "moletom" | "polo" | "jaqueta" | "camisa" | "regata";
export type Barba =
  | "nenhuma" | "sombra" | "rala" | "bigode" | "bigodao" | "cavanhaque" | "cavanhaque_bigode"
  | "queixo" | "costeletas" | "curta" | "cheia" | "longa";
export type Boca = "sorriso" | "neutra" | "aberta" | "lado" | "cheia";
export type Traje = "jogo" | "social";
export type EstiloCamisa = "lisa" | "listrasV" | "listrasH" | "faixa" | "faixaH";
export interface Camisa { cor1: string; cor2: string; cor3?: string; estilo: EstiloCamisa }

export interface Aparencia {
  pele: number; rosto: Rosto; cabelo: Cabelo; corCabelo: number; olhos: number; formatoOlho: Olho;
  sobrancelha: number; formatoSobrancelha: Sobrancelha; nariz: Nariz; boca: Boca;
  sardas: boolean; pinta: boolean; brinco: boolean;
  roupaSocial: RoupaSocial; corSocial: number; barba: Barba; corrente: boolean;
}

export const PELES = ["#F8DCC4", "#F0C29E", "#E2A77D", "#C98C63", "#A66A43", "#8A5534", "#6B3F24", "#4A2A18"];
export const CORES_CABELO = ["#0F0D0B", "#2E1D14", "#4E311E", "#7A4E2A", "#A97C3C", "#D7B25E", "#9C4422", "#E9E4D8", "#2F6FD1", "#B8323C"];
export const NOMES_CABELO_COR = ["Preto", "Castanho escuro", "Castanho", "Castanho claro", "Loiro escuro", "Loiro", "Ruivo", "Platinado", "Tingido azul", "Tingido vermelho"];
export const CORES_OLHOS = ["#3B2416", "#6B4423", "#8A6A2E", "#4F6B3A", "#3E6A8C", "#1E1E1E"];
export const NOMES_OLHOS = ["Castanho escuro", "Castanho", "Mel", "Verde", "Azul", "Preto"];
export const ROSTOS: { id: Rosto; nome: string }[] = [
  { id: "oval", nome: "Oval" }, { id: "redondo", nome: "Redondo" }, { id: "quadrado", nome: "Quadrado" },
  { id: "longo", nome: "Alongado" }, { id: "coracao", nome: "Coração" }, { id: "largo", nome: "Mandíbula larga" },
];
export const CABELOS: { id: Cabelo; nome: string }[] = [
  { id: "careca", nome: "Careca" }, { id: "raspado", nome: "Raspado" }, { id: "curto", nome: "Curto" }, { id: "degrade", nome: "Degradê" },
  { id: "topete", nome: "Topete" }, { id: "franja", nome: "Franja" }, { id: "ondulado", nome: "Ondulado" }, { id: "cacheado", nome: "Cacheado" },
  { id: "crespo", nome: "Crespo baixo" }, { id: "blackpower", nome: "Black power" }, { id: "trancas", nome: "Tranças" }, { id: "dreads", nome: "Dreads" },
  { id: "moicano", nome: "Moicano" }, { id: "coque", nome: "Coque" }, { id: "longo", nome: "Longo" },
];
export const OLHOS: { id: Olho; nome: string }[] = [
  { id: "amendoado", nome: "Amendoado" }, { id: "redondo", nome: "Redondo" }, { id: "estreito", nome: "Estreito" },
  { id: "caido", nome: "Caído" }, { id: "erguido", nome: "Erguido" }, { id: "semdobra", nome: "Monopálpebra" },
  { id: "encapuzado", nome: "Pálpebra encapuzada" },
];
export const SOBRANCELHAS: { id: Sobrancelha; nome: string }[] = [
  { id: "reta", nome: "Reta" }, { id: "arqueada", nome: "Arqueada" }, { id: "angulada", nome: "Angulada" },
  { id: "suave", nome: "Suave" }, { id: "corte", nome: "Com corte" },
];
export const NARIZES: { id: Nariz; nome: string }[] = [
  { id: "reto", nome: "Reto" }, { id: "pequeno", nome: "Pequeno" }, { id: "fino", nome: "Fino" }, { id: "largo", nome: "Largo" },
  { id: "achatado", nome: "Largo e baixo" }, { id: "arrebitado", nome: "Arrebitado" }, { id: "aquilino", nome: "Aquilino" }, { id: "grande", nome: "Grande" },
];
export const ROUPAS_SOCIAIS: { id: RoupaSocial; nome: string }[] = [
  { id: "camiseta", nome: "Camiseta" }, { id: "moletom", nome: "Moletom" }, { id: "polo", nome: "Polo" },
  { id: "jaqueta", nome: "Jaqueta jeans" }, { id: "camisa", nome: "Camisa" }, { id: "regata", nome: "Regata" },
];
export const CORES_ROUPA = ["#F2F0EA", "#1D1F22", "#2E4A7A", "#7A2E3A", "#3E6B4A", "#C9A24D", "#8C8F94", "#E07A3F"];
export const NOMES_ROUPA = ["Branco", "Preto", "Azul-marinho", "Vinho", "Verde", "Mostarda", "Cinza", "Laranja"];
export const BOCAS: { id: Boca; nome: string }[] = [
  { id: "sorriso", nome: "Sorriso" }, { id: "aberta", nome: "Sorrisão" }, { id: "neutra", nome: "Séria" }, { id: "lado", nome: "De canto" },
  { id: "cheia", nome: "Lábios cheios" },
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
};
export const CAMISA_PADRAO: Camisa = { cor1: "#8C9A94", cor2: "#6F7C77", estilo: "lisa" };

export function escurecer(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `#${((1 << 24) | (c((n >> 16) & 255) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).slice(1)}`;
}
const luminancia = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
const f1 = (n: number) => n.toFixed(1);

/** Medidas de cada formato: lados (L, R) na altura das têmporas, topo (T), centro vertical (cy). */
interface Medidas { L: number; R: number; T: number; cy: number; queixo: number; quina?: boolean }
const MEDIDAS: Record<Rosto, Medidas> = {
  oval: { L: 56, R: 144, T: 45, cy: 100, queixo: 155 },
  redondo: { L: 51, R: 149, T: 51, cy: 102, queixo: 153 },
  quadrado: { L: 56, R: 144, T: 46, cy: 100, queixo: 156, quina: true },
  longo: { L: 59, R: 141, T: 41, cy: 100, queixo: 159 },
  coracao: { L: 55, R: 145, T: 45, cy: 98, queixo: 156 },
  largo: { L: 54, R: 146, T: 45, cy: 100, queixo: 156, quina: true },
};

function formaCabeca(rosto: Rosto): string {
  const elipse = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  switch (rosto) {
    case "redondo": return elipse(100, 102, 49, 51);
    case "quadrado": return "M56 70 Q56 46 80 46 L120 46 Q144 46 144 70 L144 124 Q144 154 100 156 Q56 154 56 124 Z";
    case "longo": return elipse(100, 100, 41, 59);
    case "coracao": return "M55 90 C55 58 74 45 100 45 C126 45 145 58 145 90 C145 122 120 150 100 156 C80 150 55 122 55 90 Z";
    case "largo": return "M54 82 C54 56 76 45 100 45 C124 45 146 56 146 82 L146 120 C146 144 126 156 100 156 C74 156 54 144 54 120 Z";
    default: return elipse(100, 100, 44, 55);
  }
}

function cabeca(rosto: Rosto, fill: string): string {
  switch (rosto) {
    case "redondo": return `<ellipse cx="100" cy="102" rx="49" ry="51" fill="${fill}"/>`;
    case "quadrado": return `<path d="M56 70 Q56 46 80 46 L120 46 Q144 46 144 70 L144 124 Q144 154 100 156 Q56 154 56 124 Z" fill="${fill}"/>`;
    case "longo": return `<ellipse cx="100" cy="100" rx="41" ry="59" fill="${fill}"/>`;
    case "coracao": return `<path d="M55 90 C55 58 74 45 100 45 C126 45 145 58 145 90 C145 122 120 150 100 156 C80 150 55 122 55 90 Z" fill="${fill}"/>`;
    case "largo": return `<path d="M54 82 C54 56 76 45 100 45 C124 45 146 56 146 82 L146 120 C146 144 126 156 100 156 C74 156 54 144 54 120 Z" fill="${fill}"/>`;
    default: return `<ellipse cx="100" cy="100" rx="44" ry="55" fill="${fill}"/>`;
  }
}

/** Calota de cabelo que acompanha o topo da cabeça. */
function calota(m: Medidas, desce = 50, recuo = 16, sobe = 6): string {
  const w = m.R - m.L, cx = (m.L + m.R) / 2, T = m.T;
  const [ax, ay, bx] = m.quina ? [m.L - 4, T - 6, cx - w * 0.46] : [m.L - 2, T + 8, cx - w * 0.3];
  const c2 = m.quina ? cx + w * 0.46 : cx + w * 0.3;
  const dx = m.quina ? m.R + 4 : m.R + 2, dy = m.quina ? T - 6 : T + 8;
  return `M${m.L} ${T + desce} C${ax} ${ay} ${f1(bx)} ${T - sobe} ${cx} ${T - sobe} C${f1(c2)} ${T - sobe} ${dx} ${dy} ${m.R} ${T + desce} C${m.R - 6} ${T + 28} ${f1(cx + w * 0.27)} ${T + recuo} ${cx} ${T + recuo} C${f1(cx - w * 0.27)} ${T + recuo} ${m.L + 6} ${T + 28} ${m.L} ${T + desce} Z`;
}
const fina = (m: Medidas) => ({ ...m, L: m.L + 1, R: m.R - 1 });

/** Mistura duas cores: t=0 é a primeira, t=1 é a segunda. Usado para cabelo raspado (cor sólida, nunca transparência). */
function mistura(a: string, b: string, t: number): string {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const c = (s: number) => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
  return `#${((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1)}`;
}
let seqCabelo = 0;
/** Desenha `conteudo` recortado pelo formato `d`: nada sai do contorno do cabelo. */
function recortado(d: string, conteudo: string): string {
  const id = `cb${++seqCabelo}`;
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${conteudo}</g>`;
}

/** Massa de cabelo atrás da cabeça (aparece nas laterais e acima). Sempre uma forma sólida e contínua. */
function cabeloAtras(c: Cabelo, m: Medidas, cor: string): string {
  const cx = (m.L + m.R) / 2, w = m.R - m.L, T = m.T, sombra = escurecer(cor, 0.72);
  switch (c) {
    case "blackpower": {
      // volume redondo com borda crespa: círculos na borda, todos encostados no volume
      const r = w / 2 + 20, cy = T + 36;
      let borda = "";
      for (let i = 0; i < 22; i++) { const ang = (i / 22) * Math.PI * 2; borda += `<circle cx="${f1(cx + r * Math.cos(ang))}" cy="${f1(cy + r * Math.sin(ang))}" r="7" fill="${cor}"/>`; }
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${cor}"/>${borda}`;
    }
    case "longo": return `<path d="M${m.L - 8} ${T + 55} C${m.L - 12} ${T + 2} ${cx - 30} ${T - 14} ${cx} ${T - 14} C${cx + 30} ${T - 14} ${m.R + 12} ${T + 2} ${m.R + 8} ${T + 55} L${m.R + 12} 174 L${m.L - 12} 174 Z" fill="${cor}"/>`;
    case "ondulado": return `<path d="M${m.L - 6} ${T + 50} C${m.L - 10} ${T + 4} ${cx - 30} ${T - 10} ${cx} ${T - 10} C${cx + 30} ${T - 10} ${m.R + 10} ${T + 4} ${m.R + 6} ${T + 50} Q${m.R + 12} ${T + 66} ${m.R + 4} ${T + 80} L${m.L - 4} ${T + 80} Q${m.L - 12} ${T + 66} ${m.L - 6} ${T + 50} Z" fill="${cor}"/>`;
    case "dreads": {
      // massa única até a altura dos ombros; os dreads são desenhados DENTRO dela
      const base = T + 108;
      const massa = `M${m.L - 12} ${T + 40} C${m.L - 14} ${T - 2} ${cx - 34} ${T - 14} ${cx} ${T - 14} C${cx + 34} ${T - 14} ${m.R + 14} ${T - 2} ${m.R + 12} ${T + 40} L${m.R + 14} ${base - 8} Q${m.R + 10} ${base} ${m.R} ${base} L${m.L} ${base} Q${m.L - 10} ${base} ${m.L - 14} ${base - 8} Z`;
      let locs = "";
      for (let i = 0; i < 12; i++) {
        const x = m.L - 12 + (i * (w + 24)) / 11;
        locs += `<path d="M${f1(x)} ${T - 20} Q${f1(x + (i % 2 ? 3 : -3))} ${T + 50} ${f1(x)} ${base + 4}" stroke="${i % 2 ? sombra : escurecer(cor, 0.86)}" stroke-width="5" fill="none"/>`;
      }
      return `<path d="${massa}" fill="${cor}"/>${recortado(massa, locs)}`;
    }
    case "coque": return `<circle cx="${cx}" cy="${T - 7}" r="14" fill="${cor}"/><path d="M${cx - 12} ${T - 7} Q${cx} ${T - 15} ${cx + 12} ${T - 7}" stroke="${sombra}" stroke-width="2" fill="none"/>`;
    default: return "";
  }
}

/** Cabelo sobre a cabeça. Tudo em cor sólida; texturas ficam recortadas pelo formato do cabelo. */
function cabeloFrente(c: Cabelo, m: Medidas, cor: string, pele: string): string {
  const sombra = escurecer(cor, 0.7), cx = (m.L + m.R) / 2, w = m.R - m.L, T = m.T;
  const raspadoCor = mistura(cor, pele, 0.5);
  const cheia = calota(m);
  switch (c) {
    case "careca": return `<ellipse cx="${cx - 12}" cy="${T + 12}" rx="10" ry="5" fill="#FFFFFF" opacity="0.18"/>`;
    case "raspado": {
      const d = calota(fina(m), 44, 20, 1);
      let pontos = "";
      for (let i = 0; i < 40; i++) pontos += `<circle cx="${f1(m.L + ((i * 37) % 97) / 97 * w)}" cy="${f1(T - 2 + ((i * 53) % 61) / 61 * 46)}" r="0.9" fill="${escurecer(raspadoCor, 0.78)}"/>`;
      return `<path d="${d}" fill="${raspadoCor}"/>${recortado(d, pontos)}`;
    }
    case "curto": return `<path d="${cheia}" fill="${cor}"/>`;
    case "degrade": return `<path d="${calota(fina(m), 46, 22, 1)}" fill="${mistura(cor, pele, 0.55)}"/><path d="${calota(fina(m), 36, 20, 2)}" fill="${mistura(cor, pele, 0.28)}"/><path d="${calota({ ...m, L: m.L + 10, R: m.R - 10 }, 24, 14, 8)}" fill="${cor}"/>`;
    case "topete": return `<path d="${cheia}" fill="${cor}"/><path d="M${cx - 30} ${T + 14} C${cx - 22} ${T - 22} ${cx + 26} ${T - 24} ${cx + 34} ${T + 10} C${cx + 18} ${T + 2} ${cx - 12} ${T + 2} ${cx - 30} ${T + 14} Z" fill="${cor}"/>`;
    case "franja": {
      let franja = `M${m.L + 4} ${T + 30}`;
      const n = 7;
      for (let i = 0; i < n; i++) {
        const x0 = m.L + 4 + (i * (w - 8)) / n, x1 = m.L + 4 + ((i + 1) * (w - 8)) / n;
        franja += ` L${f1((x0 + x1) / 2)} ${T + 42 + (i % 2) * 3} L${f1(x1)} ${T + 28}`;
      }
      return `<path d="${cheia}" fill="${cor}"/><path d="${franja} L${m.R - 4} ${T + 10} L${m.L + 4} ${T + 10} Z" fill="${cor}"/>`;
    }
    case "ondulado": return `<path d="${cheia}" fill="${cor}"/>${recortado(cheia, `<path d="M${cx - 34} ${T + 10} Q${cx - 18} ${T + 22} ${cx - 2} ${T + 8} Q${cx + 14} ${T - 4} ${cx + 34} ${T + 10}" stroke="${sombra}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`)}`;
    case "cacheado": {
      let s = `<path d="${cheia}" fill="${cor}"/>`;
      const rx = w / 2 + 2, ry = 46;
      for (let i = 0; i <= 11; i++) { const a = Math.PI * (0.04 + (0.92 * i) / 11); s += `<circle cx="${f1(cx - rx * Math.cos(a))}" cy="${f1(T + 44 - ry * Math.sin(a))}" r="10" fill="${cor}"/>`; }
      return s;
    }
    case "crespo": {
      let s = `<path d="${calota(m, 46, 14, 4)}" fill="${cor}"/>`;
      const rx = w / 2 - 2, ry = 40;
      for (let i = 0; i <= 14; i++) { const a = Math.PI * (0.08 + (0.84 * i) / 14); s += `<circle cx="${f1(cx - rx * Math.cos(a))}" cy="${f1(T + 40 - ry * Math.sin(a))}" r="5.5" fill="${cor}"/>`; }
      return s;
    }
    case "blackpower": {
      // linha do cabelo sólida na testa, ligada ao volume de trás
      const d = calota(m, 46, 20, 2);
      return `<path d="${d}" fill="${cor}"/>`;
    }
    case "trancas": {
      // tranças nagô deitadas na cabeça, da testa para trás, recortadas pelo cabelo
      let linhas = "";
      for (const k of [-0.36, -0.22, -0.08, 0.08, 0.22, 0.36]) {
        const x = cx + k * w;
        linhas += `<path d="M${f1(x)} ${T + 22} Q${f1(x + k * 10)} ${T + 6} ${f1(x + k * 18)} ${T - 10}" stroke="${sombra}" stroke-width="2.4" fill="none" stroke-dasharray="3 2"/>`;
      }
      return `<path d="${cheia}" fill="${cor}"/>${recortado(cheia, linhas)}`;
    }
    case "dreads": {
      let raizes = "";
      for (const k of [-0.36, -0.18, 0, 0.18, 0.36]) raizes += `<path d="M${f1(cx + k * w)} ${T + 20} Q${f1(cx + k * w * 1.1)} ${T + 6} ${f1(cx + k * w * 1.2)} ${T - 8}" stroke="${sombra}" stroke-width="4" fill="none"/>`;
      return `<path d="${cheia}" fill="${cor}"/>${recortado(cheia, raizes)}`;
    }
    case "moicano": {
      const lados = calota(fina(m), 44, 20, 1);
      const crista = `M${cx - 13} ${T + 22} L${cx - 11} ${T - 14} Q${cx} ${T - 26} ${cx + 11} ${T - 14} L${cx + 13} ${T + 22} Z`;
      return `<path d="${lados}" fill="${mistura(cor, pele, 0.55)}"/><path d="${crista}" fill="${cor}"/>`;
    }
    case "coque": return `<path d="${calota(m, 44, 18, 3)}" fill="${cor}"/>${recortado(calota(m, 44, 18, 3), `<path d="M${cx - 30} ${T + 20} Q${cx - 14} ${T + 2} ${cx} ${T - 4} M${cx + 30} ${T + 20} Q${cx + 14} ${T + 2} ${cx} ${T - 4}" stroke="${sombra}" stroke-width="1.6" fill="none"/>`)}`;
    case "longo": return `<path d="${cheia}" fill="${cor}"/><path d="M${m.L + 2} ${T + 48} C${m.L + 2} ${T + 26} ${m.L + 14} ${T + 12} ${cx - 12} ${T + 10} C${m.L + 22} ${T + 22} ${m.L + 14} ${T + 34} ${m.L + 14} ${T + 52} Z" fill="${cor}"/>`;
  }
}

// Olho esquerdo desenhado em torno de (0,0); o direito é espelhado.
const FORMA_OLHO: Record<Olho, string> = {
  amendoado: "M-9 0 Q0 -7 9 0 Q0 6 -9 0 Z",
  redondo: "M-8 0 A8 6.6 0 1 0 8 0 A8 6.6 0 1 0 -8 0 Z",
  estreito: "M-9 0 Q0 -4.5 9 0 Q0 3.5 -9 0 Z",
  caido: "M-9 1.5 Q-1 -7 9 -0.5 Q1 5.5 -9 1.5 Z",
  erguido: "M-9 -1 Q1 -7 9 1.5 Q0 5.5 -9 -1 Z",
  semdobra: "M-9.5 -1.2 Q-1 -5.2 9 0.6 Q0 3.6 -9.5 -1.2 Z",
  encapuzado: "M-9 0.5 Q0 -4.8 9 0.5 Q0 5.5 -9 0.5 Z",
};
const PALPEBRA: Record<Olho, string> = {
  amendoado: "M-9 0 Q0 -7 9 0", redondo: "M-8 0 A8 6.6 0 0 1 8 0", estreito: "M-9 0 Q0 -4.5 9 0",
  caido: "M-9 1.5 Q-1 -7 9 -0.5", erguido: "M-9 -1 Q1 -7 9 1.5", semdobra: "M-9.5 -1.2 Q-1 -5.2 9 0.6",
  encapuzado: "M-9 0.5 Q0 -4.8 9 0.5",
};
function olho(x: number, espelhado: boolean, f: Olho, cor: string, id: string, pele: string): string {
  return `<g transform="translate(${x} 103)${espelhado ? " scale(-1 1)" : ""}"><clipPath id="${id}"><path d="${FORMA_OLHO[f]}"/></clipPath>
    <path d="${FORMA_OLHO[f]}" fill="#F7F3EC"/><g clip-path="url(#${id})"><circle cx="0.8" cy="0" r="4.3" fill="${cor}"/><circle cx="0.8" cy="0" r="1.9" fill="#0B0B0B"/><circle cx="2" cy="-1.4" r="1" fill="#FFFFFF" opacity="0.8"/></g>
    <path d="${PALPEBRA[f]}" stroke="#2A1A12" stroke-width="${f === "semdobra" ? 2 : 1.4}" fill="none" stroke-linecap="round"/>
    ${f === "encapuzado" ? `<path d="M-10 -2.6 Q0 -9 10 -2.4" stroke="${pele}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M-10 -2.6 Q0 -9 10 -2.4" stroke="#2A1A12" stroke-width="0.9" fill="none" opacity="0.45"/>` : ""}</g>`;
}

function sobrancelhas(f: Sobrancelha, esp: number, cor: string): string {
  const d: Record<Sobrancelha, string> = {
    reta: "M71 91 L93 89", arqueada: "M71 92 Q82 83 93 90", angulada: "M71 92 L86 86 L93 89", suave: "M71 90.5 Q82 87.5 93 90", corte: "M71 92 Q76 87.5 80 86.6",
  };
  const extra = f === "corte" ? `<path d="M84 86.6 Q89 87 93 90" stroke="${cor}" stroke-width="${esp}" stroke-linecap="round" fill="none"/>` : "";
  const uma = `<path d="${d[f]}" stroke="${cor}" stroke-width="${esp}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>${extra}`;
  return `<g>${uma}</g><g transform="translate(200 0) scale(-1 1)">${f === "corte" ? `<path d="${d.arqueada}" stroke="${cor}" stroke-width="${esp}" stroke-linecap="round" fill="none"/>` : uma}</g>`;
}

function nariz(n: Nariz, s: string): string {
  const linha = (d: string) => `<path d="${d}" stroke="${s}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  switch (n) {
    case "pequeno": return linha("M96 117 Q100 121 104 117");
    case "fino": return linha("M100.5 104 L100 117 Q98 120.5 100 121.5 Q102 122 103.5 120.5");
    case "achatado": return linha("M98 110 L97 117") + linha("M87 120 Q93 126 100 123.5 Q107 126 113 120") + `<g fill="${s}" opacity="0.6"><ellipse cx="95" cy="121.5" rx="2" ry="1.2"/><ellipse cx="105" cy="121.5" rx="2" ry="1.2"/></g>`;
    case "largo": return linha("M98 106 L97 116") + linha("M89 118 Q93 125 100 122.5 Q107 125 111 118");
    case "arrebitado": return linha("M100 106 Q97 115 95 119 Q100 123 105 119");
    case "aquilino": return linha("M101 104 Q105 113 99 121 Q103 124 107 121");
    case "grande": return linha("M101 100 Q93 119 96 124 Q102 128 110 122") + linha("M91 121 Q93 124.5 96.5 124.5");
    default: return linha("M100 108 Q95 121 99 123 Q103 124 106 121");
  }
}

/** Pontos da boca usados pela barba: cantos esquerdo/direito, topo e base no centro. */
interface GeoBoca { e: [number, number]; d: [number, number]; topo: number; base: number }
const GEO_BOCA: Record<Boca, GeoBoca> = {
  sorriso: { e: [88, 135], d: [112, 135], topo: 135, base: 139 },
  aberta: { e: [86, 133], d: [114, 133], topo: 133, base: 141 },
  neutra: { e: [89, 136], d: [111, 136], topo: 135, base: 137 },
  lado: { e: [89, 137], d: [112, 132], topo: 133.5, base: 137.5 },
  cheia: { e: [87, 135], d: [113, 135], topo: 131, base: 144 },
};

function boca(b: Boca, pele: string): string {
  const s = escurecer(pele, 0.55);
  switch (b) {
    case "aberta": return `<path d="M86 133 Q100 148 114 133 Z" fill="#5A1E1E"/><path d="M88 134 L112 134 L110 138 L90 138 Z" fill="#F7F3EC"/>`;
    case "neutra": return `<path d="M89 136 L111 136" stroke="${s}" stroke-width="3" stroke-linecap="round"/>`;
    case "lado": return `<path d="M89 137 Q101 139 112 132" stroke="${s}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    case "cheia": return `<path d="M87 135 Q93 130 100 132.5 Q107 130 113 135 Q100 138 87 135 Z" fill="${escurecer(pele, 0.72)}"/><path d="M87 135 Q100 138 113 135 Q107 144 100 144 Q93 144 87 135 Z" fill="${escurecer(pele, 0.8)}"/><path d="M87 135 Q100 138.5 113 135" stroke="${s}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    default: return `<path d="M88 135 Q100 142 112 135" stroke="${s}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  }
}

let seq = 0;
const TRONCO = "M28 222 C32 184 58 168 100 168 C142 168 168 184 172 222 Z";
function camisaSVG(c: Camisa): string {
  const id = `cam${++seq}`;
  let padrao = "";
  if (c.estilo === "listrasV") for (let x = 34; x < 172; x += 22) padrao += `<rect x="${x}" y="160" width="11" height="70" fill="${c.cor2}"/>`;
  if (c.estilo === "listrasH") for (let y = 172; y < 224; y += 14) padrao += `<rect x="20" y="${y}" width="160" height="7" fill="${c.cor2}"/>`;
  if (c.estilo === "faixa") padrao = `<path d="M40 178 L62 168 L172 224 L144 224 Z" fill="${c.cor2}"/>`;
  if (c.estilo === "faixaH") padrao = `<rect x="20" y="192" width="160" height="8" fill="${c.cor2}"/>${c.cor3 ? `<rect x="20" y="200" width="160" height="8" fill="${c.cor3}"/>` : ""}`;
  return `<clipPath id="${id}"><path d="${TRONCO}"/></clipPath><path d="${TRONCO}" fill="${c.cor1}"/><g clip-path="url(#${id})">${padrao}</g>`;
}

function roupaSocialSVG(tipo: RoupaSocial, corIdx: number, pele: string): string {
  const c = CORES_ROUPA[corIdx], s = escurecer(c, 0.78), claro = luminancia(c) > 0.6;
  const base = `<path d="${TRONCO}" fill="${c}"/>`;
  switch (tipo) {
    case "camiseta": return base + `<path d="M82 168 Q100 180 118 168" stroke="${s}" stroke-width="4" fill="none"/>`;
    case "moletom": return `<path d="M66 176 Q70 150 100 150 Q130 150 134 176 Q118 168 100 168 Q82 168 66 176 Z" fill="${s}"/>` + base +
      `<path d="M86 170 Q100 182 114 170" stroke="${s}" stroke-width="5" fill="none"/><line x1="94" y1="176" x2="93" y2="196" stroke="${claro ? "#555" : "#EEE"}" stroke-width="2"/><line x1="106" y1="176" x2="107" y2="196" stroke="${claro ? "#555" : "#EEE"}" stroke-width="2"/><path d="M72 206 L128 206 L124 222 L76 222 Z" fill="${s}" opacity="0.5"/>`;
    case "polo": return base + `<path d="M82 166 L100 176 L90 186 Z" fill="${s}"/><path d="M118 166 L100 176 L110 186 Z" fill="${s}"/><rect x="98" y="176" width="4" height="22" fill="${s}"/><circle cx="100" cy="184" r="1.4" fill="${claro ? "#666" : "#EEE"}"/><circle cx="100" cy="192" r="1.4" fill="${claro ? "#666" : "#EEE"}"/>`;
    case "jaqueta": return `<path d="${TRONCO}" fill="#4F6E9C"/><path d="M84 168 L100 222 L116 168 Q100 176 84 168 Z" fill="${c}"/><path d="M84 168 L100 222 M116 168 L100 222" stroke="#2F4A70" stroke-width="3"/><path d="M60 190 L76 190 M124 190 L140 190" stroke="#E2B36A" stroke-width="1.5" stroke-dasharray="3 2"/>`;
    case "regata": {
      const id = `rg${++seq}`;
      return `<clipPath id="${id}"><path d="${TRONCO}"/></clipPath><path d="${TRONCO}" fill="${escurecer(pele, 0.88)}"/><g clip-path="url(#${id})"><path d="M64 174 Q74 200 72 230 L128 230 Q126 200 136 174 Q126 169 117 169 Q110 186 100 186 Q90 186 83 169 Q74 169 64 174 Z" fill="${c}"/></g>`;
    }
    case "camisa": return base + `<path d="M84 166 L100 178 L92 188 L80 172 Z" fill="${escurecer(c, 0.9)}" stroke="${s}" stroke-width="1"/><path d="M116 166 L100 178 L108 188 L120 172 Z" fill="${escurecer(c, 0.9)}" stroke="${s}" stroke-width="1"/><line x1="100" y1="178" x2="100" y2="222" stroke="${s}" stroke-width="1.5"/>${[188, 198, 208].map((y) => `<circle cx="103" cy="${y}" r="1.4" fill="${s}"/>`).join("")}`;
  }
}

let seqBarba = 0;
/** Barba desenhada a partir da boca: o bigode acompanha os cantos da boca e um recorte em volta dos lábios
 *  garante que nenhum estilo cubra a boca. Tudo fica dentro do contorno do rosto (a longa desce pelo pescoço). */
function barba(b: Barba, m: Medidas, rosto: Rosto, bocaId: Boca, nariz: Nariz, cor: string, pele: string): string {
  if (b === "nenhuma") return "";
  const g = GEO_BOCA[bocaId], [ex, ey] = g.e, [dx, dy] = g.d, Q = m.queixo, cy = m.cy;
  const nb = nariz === "grande" ? 127 : 125; // base do nariz
  const id = `bb${++seqBarba}`;
  const furo = `M${ex - 1.5} ${ey} Q100 ${g.topo - 2.5} ${dx + 1.5} ${dy} Q100 ${g.base + 2.5} ${ex - 1.5} ${ey} Z`;
  // bigode: faixa entre a base do nariz e o lábio de cima, inclinada junto com a boca (sorriso de canto inclina o bigode)
  const labio = Math.min(ey, dy, g.topo) - 1.2;
  const bigode = (grosso: boolean) => {
    const ponta = grosso ? 3.5 : 1.5, alto = grosso ? nb + 3 : nb + 5;
    return `M${ex - 2 - ponta} ${ey - 1 + (grosso ? 3 : 0)} L${ex - 1} ${ey - 1.6} Q100 ${labio - 0.5} ${dx + 1} ${dy - 1.6} L${dx + 2 + ponta} ${dy - 1 + (grosso ? 3 : 0)} C${dx + 2} ${alto + 4} ${dx - 6} ${alto} 100 ${alto + 0.5} C${ex + 6} ${alto} ${ex - 2} ${alto + 4} ${ex - 2 - ponta} ${ey - 1 + (grosso ? 3 : 0)} Z`;
  };
  // cavanhaque: do lábio de baixo até a ponta do queixo (o contorno do rosto recorta embaixo)
  const queixo = `M${ex + 1} ${ey + 2.5} Q100 ${g.base + 3} ${dx - 1} ${dy + 2.5} C${dx} ${Q - 10} ${dx - 3} ${Q + 2} 100 ${Q + 4} C${ex + 3} ${Q + 2} ${ex} ${Q - 10} ${ex + 1} ${ey + 2.5} Z`;
  // região da barba cheia: abaixo da linha das bochechas, contornando o bigode
  const regiao = `M${m.L - 12} ${cy - 8} L${m.L + 7} ${cy - 8} C${m.L + 10} ${cy + 20} ${ex - 12} ${ey - 12} ${ex - 6} ${nb + 3} Q100 ${nb - 1} ${dx + 6} ${nb + 3} C${dx + 12} ${dy - 12} ${m.R - 10} ${cy + 20} ${m.R - 7} ${cy - 8} L${m.R + 12} ${cy - 8} L${m.R + 12} 180 L${m.L - 12} 180 Z`;
  const cabecaD = formaCabeca(rosto);
  const mascara = `<mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="220"><rect width="200" height="220" fill="#fff"/><path d="${furo}" fill="#000"/>${
    b === "queixo" ? `<path d="${cabecaD}" transform="translate(100 ${m.T}) scale(0.87) translate(-100 ${-m.T})" fill="#000"/>` : ""}</mask>`;
  const recorte = `<clipPath id="${id}c"><path d="${cabecaD}"/></clipPath>`;
  const dentro = (conteudo: string) => `<g clip-path="url(#${id}c)" mask="url(#${id}m)">${conteudo}</g>`;
  const fora = (conteudo: string) => `<g mask="url(#${id}m)">${conteudo}</g>`;
  const p = (d: string, fill: string) => `<path d="${d}" fill="${fill}"/>`;
  // ligação do bigode ao cavanhaque, contornando os cantos da boca
  const conector = `M${ex - 3.5} ${ey - 1} L${ex - 0.5} ${ey - 1} L${ex + 2} ${ey + 4} L${ex - 1} ${ey + 5} Z M${dx + 3.5} ${dy - 1} L${dx + 0.5} ${dy - 1} L${dx - 2} ${dy + 4} L${dx + 1} ${dy + 5} Z`;
  let corpo = "";
  switch (b) {
    case "sombra": corpo = dentro(p(regiao, mistura(cor, pele, 0.8))); break;
    case "rala": corpo = dentro(p(regiao, mistura(cor, pele, 0.6))); break;
    case "bigode": corpo = dentro(p(bigode(false), cor)); break;
    case "bigodao": corpo = dentro(p(bigode(true), cor)); break;
    case "cavanhaque": corpo = dentro(p(queixo, cor)); break;
    case "cavanhaque_bigode": corpo = dentro(p(bigode(false), cor) + p(queixo, cor) + p(conector, cor)); break;
    case "queixo": corpo = dentro(p(regiao, cor)); break;
    case "costeletas": corpo = dentro(`<rect x="${m.L - 2}" y="${cy - 10}" width="${10}" height="34" rx="3" fill="${cor}"/><rect x="${m.R - 8}" y="${cy - 10}" width="${10}" height="34" rx="3" fill="${cor}"/>`); break;
    case "curta": corpo = dentro(p(regiao, mistura(cor, pele, 0.28)) + p(bigode(false), mistura(cor, pele, 0.15))); break;
    case "cheia": corpo = dentro(p(regiao, cor)); break;
    case "longa":
      corpo = dentro(p(regiao, cor)) + fora(p(`M${m.L + 12} ${cy + 36} Q${m.L + 10} ${Q + 14} 100 ${Q + 24} Q${m.R - 10} ${Q + 14} ${m.R - 12} ${cy + 36} Z`, cor) +
        `<path d="M92 ${Q + 4} Q100 ${Q + 18} 108 ${Q + 4}" stroke="${escurecer(cor, 0.7)}" stroke-width="1.6" fill="none"/>`);
      break;
  }
  return `<defs>${mascara}${recorte}</defs>${corpo}`;
}

export interface OpcoesFoto {
  aparencia: Aparencia | null; // null = silhueta (ainda sem aparência escolhida)
  camisa?: Camisa;
  numero?: string;
  cenario?: string;
  traje?: "jogo" | "social";
}

export function svgFoto(o: OpcoesFoto): string {
  const a = { ...APARENCIA_PADRAO, ...(o.aparencia ?? {}) };
  const silhueta = !o.aparencia;
  const m = MEDIDAS[a.rosto];
  const pele = silhueta ? "#1E2E28" : PELES[a.pele];
  const sombraPele = silhueta ? "#1A2823" : escurecer(pele, 0.8);
  const cor = silhueta ? "#16241F" : CORES_CABELO[a.corCabelo];
  const corSobr = silhueta ? cor : (a.corCabelo >= 7 ? CORES_CABELO[2] : cor); // platinado/tingido: sobrancelha natural
  const camisa = silhueta ? { cor1: "#1E2E28", cor2: "#1E2E28", estilo: "lisa" as const } : (o.camisa ?? CAMISA_PADRAO);
  const corNumero = luminancia(camisa.cor1) < 0.45 ? "#F2E6C2" : escurecer(camisa.cor1, 0.55);
  const n = ++seq;
  const detalhes = silhueta ? "" : [
    a.sardas ? [[78, 116], [84, 119], [90, 116], [110, 116], [116, 119], [122, 116]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${escurecer(pele, 0.62)}"/>`).join("") : "",
    a.pinta ? `<circle cx="117" cy="128" r="1.6" fill="${escurecer(pele, 0.45)}"/>` : "",
    a.brinco ? `<circle cx="${m.L - 1}" cy="${m.cy + 18}" r="2.6" fill="#E9E4D8" stroke="#A9A39A" stroke-width="0.8"/>` : "",
  ].join("");
  const rosto = silhueta ? "" : `
  ${sobrancelhas(a.formatoSobrancelha, a.sobrancelha, corSobr)}
  ${olho(82, false, a.formatoOlho, CORES_OLHOS[a.olhos], `ol${n}`, pele)}${olho(118, true, a.formatoOlho, CORES_OLHOS[a.olhos], `or${n}`, pele)}
  ${nariz(a.nariz, sombraPele)}
  ${boca(a.boca, pele)}
  ${detalhes}`;
  return `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto de perfil do jogador">
  ${o.cenario ?? ""}
  <g${silhueta ? ' opacity="0.92"' : ""}>
  ${cabeloAtras(a.cabelo, m, cor)}
  <rect x="84" y="138" width="32" height="36" rx="10" fill="${sombraPele}"/>
  ${o.traje === "social" && !silhueta ? roupaSocialSVG(a.roupaSocial, a.corSocial, pele) : `${camisaSVG(camisa)}<path d="M84 168 L100 184 L116 168 Z" fill="${escurecer(camisa.cor1, 0.75)}"/>`}
  ${a.corrente && !silhueta ? `<path d="M86 170 Q100 196 114 170" stroke="#D9B44A" stroke-width="2" fill="none"/><circle cx="100" cy="190" r="2.6" fill="#D9B44A"/>` : ""}
  ${o.numero && !silhueta && o.traje !== "social" ? `<text x="100" y="214" text-anchor="middle" font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif" font-weight="800" font-size="22" fill="${corNumero}">${o.numero}</text>` : ""}
  <ellipse cx="${m.L}" cy="${m.cy + 6}" rx="8" ry="12" fill="${sombraPele}"/>
  <ellipse cx="${m.R}" cy="${m.cy + 6}" rx="8" ry="12" fill="${sombraPele}"/>
  ${cabeca(a.rosto, pele)}
  ${silhueta ? "" : barba(a.barba, m, a.rosto, a.boca, a.nariz, cor, pele)}
  ${cabeloFrente(a.cabelo, m, cor, pele)}
  ${rosto}
  ${silhueta ? `<text x="100" y="112" text-anchor="middle" font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif" font-weight="900" font-size="36" fill="#3A5148">?</text>` : ""}
  </g>
</svg>`;
}
