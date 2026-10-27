// Identidade visual de cada competição: cores, tipografia, um padrão de fundo e um selo próprio. Inspirada no clima
// visual das competições de verdade (o azul-noite estrelado da Champions, o roxo com verde-neon da Premier, o preto
// com dourado da Libertadores, o verde e amarelo do Brasileirão...), mas com selos e marcas desenhados aqui: nada de
// logo real. Usada no placar da partida, na tabela, nas copas e nos cartões da semana.
import { COPAS, type CopaId } from "../../src/copas";
import { infoLiga } from "../../src/ligas";

export type Padrao = "estrelas" | "raios" | "diagonais" | "pontos" | "grade" | "ondas" | "chevrons" | "hexagonos" | "listras" | "losangos" | "circulos" | "nenhum";
export type Selo = "estrelaAnel" | "coroa" | "letra" | "taca" | "globo" | "hexagono" | "escudoEstrela" | "raio" | "bola" | "sol" | "escudoDiagonal" | "louros";
export interface Identidade {
  id: string; nome: string; sigla: string;
  fundo: string; fundo2: string; acento: string; acento2: string; texto: string;
  /** família tipográfica (Google Fonts carregadas no template) e se o nome vai em caixa alta */
  fonte: string; caixaAlta: boolean; espaco: number;
  padrao: Padrao; selo: Selo; letra?: string;
}
const F = {
  geometrica: "'Montserrat', 'Barlow', sans-serif", condensada: "'Oswald', 'Arial Narrow', sans-serif", display: "'Bebas Neue', 'Big Shoulders Display', sans-serif",
  saira: "'Saira Condensed', 'Arial Narrow', sans-serif", pesada: "'Archivo Black', 'Arial Black', sans-serif", varsity: "'Teko', 'Arial Narrow', sans-serif", padrao: "'Big Shoulders Display', 'Arial Narrow', sans-serif",
};
type Base = Omit<Identidade, "id" | "nome" | "sigla"> & { sigla?: string };
const ID: Record<string, Base> = {
  // copas de clubes
  UCL: { fundo: "#06123F", fundo2: "#0B2A86", acento: "#E6ECF7", acento2: "#3FC8F4", texto: "#FFFFFF", fonte: F.geometrica, caixaAlta: true, espaco: 0.14, padrao: "estrelas", selo: "estrelaAnel", sigla: "CL" },
  LIB: { fundo: "#0B0B0B", fundo2: "#2A2214", acento: "#D9B45A", acento2: "#8C6A1F", texto: "#F6EEDB", fonte: F.condensada, caixaAlta: true, espaco: 0.1, padrao: "raios", selo: "taca", sigla: "LIB" },
  ACL: { fundo: "#012E33", fundo2: "#06535A", acento: "#E3B341", acento2: "#5BD4C8", texto: "#FFFFFF", fonte: F.geometrica, caixaAlta: true, espaco: 0.12, padrao: "estrelas", selo: "estrelaAnel", sigla: "ACL" },
  CON: { fundo: "#081E52", fundo2: "#12307D", acento: "#FFFFFF", acento2: "#E2263C", texto: "#FFFFFF", fonte: F.saira, caixaAlta: true, espaco: 0.1, padrao: "diagonais", selo: "escudoEstrela", sigla: "CC" },
  INT: { fundo: "#0D1A33", fundo2: "#1D3360", acento: "#D4AF5A", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.display, caixaAlta: true, espaco: 0.12, padrao: "raios", selo: "globo", sigla: "IC" },
  MUN: { fundo: "#0E0E0E", fundo2: "#2B2410", acento: "#E2BC5C", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.display, caixaAlta: true, espaco: 0.14, padrao: "raios", selo: "globo", sigla: "MC" },
  // seleções
  SEL: { fundo: "#0A3B24", fundo2: "#0E5A35", acento: "#F5C400", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.saira, caixaAlta: true, espaco: 0.1, padrao: "listras", selo: "escudoEstrela", sigla: "SEL" },
  COP: { fundo: "#3D0B1A", fundo2: "#6B1A2C", acento: "#E2BC5C", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.pesada, caixaAlta: true, espaco: 0.06, padrao: "raios", selo: "taca", sigla: "WC" },
  EUR: { fundo: "#0A2A7A", fundo2: "#1747B8", acento: "#FFFFFF", acento2: "#F5C400", texto: "#FFFFFF", fonte: F.geometrica, caixaAlta: true, espaco: 0.1, padrao: "pontos", selo: "estrelaAnel", sigla: "EURO" },
  AME: { fundo: "#0B1C45", fundo2: "#14306E", acento: "#E2263C", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.condensada, caixaAlta: true, espaco: 0.08, padrao: "ondas", selo: "sol", sigla: "CA" },
  AFR: { fundo: "#0A3A22", fundo2: "#0F5A33", acento: "#F5C400", acento2: "#E2263C", texto: "#FFFFFF", fonte: F.condensada, caixaAlta: true, espaco: 0.08, padrao: "losangos", selo: "sol", sigla: "CAN" },
  ASI: { fundo: "#350914", fundo2: "#5C1426", acento: "#D4AF5A", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.geometrica, caixaAlta: true, espaco: 0.1, padrao: "ondas", selo: "estrelaAnel", sigla: "AC" },
  FIN: { fundo: "#101010", fundo2: "#242424", acento: "#E2BC5C", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.display, caixaAlta: true, espaco: 0.16, padrao: "raios", selo: "louros", sigla: "FIN" },
  // ligas
  BRA1: { fundo: "#053A22", fundo2: "#0A6B3A", acento: "#FFD400", acento2: "#2FD3C5", texto: "#FFFFFF", fonte: F.saira, caixaAlta: true, espaco: 0.06, padrao: "ondas", selo: "escudoEstrela", sigla: "SÉRIE A" },
  BRA2: { fundo: "#0C2550", fundo2: "#163C80", acento: "#F7BE16", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.saira, caixaAlta: true, espaco: 0.06, padrao: "chevrons", selo: "escudoEstrela", sigla: "SÉRIE B" },
  BRA3: { fundo: "#123D25", fundo2: "#1E5C38", acento: "#FFFFFF", acento2: "#F7BE16", texto: "#FFFFFF", fonte: F.saira, caixaAlta: true, espaco: 0.06, padrao: "diagonais", selo: "escudoEstrela", sigla: "SÉRIE C" },
  BRA4: { fundo: "#1E2A36", fundo2: "#2E4152", acento: "#A6E05A", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.saira, caixaAlta: true, espaco: 0.06, padrao: "grade", selo: "escudoEstrela", sigla: "SÉRIE D" },
  ENG1: { fundo: "#2D0033", fundo2: "#4B0A55", acento: "#00FF85", acento2: "#E90052", texto: "#FFFFFF", fonte: F.geometrica, caixaAlta: false, espaco: 0, padrao: "diagonais", selo: "coroa", sigla: "PL" },
  ENG2: { fundo: "#0A1F3C", fundo2: "#123766", acento: "#29B8E8", acento2: "#F2C200", texto: "#FFFFFF", fonte: F.condensada, caixaAlta: true, espaco: 0.08, padrao: "chevrons", selo: "coroa", sigla: "CH" },
  ESP1: { fundo: "#141414", fundo2: "#2A2A2A", acento: "#FF4B44", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.pesada, caixaAlta: true, espaco: 0.02, padrao: "pontos", selo: "letra", letra: "L", sigla: "LL" },
  ESP2: { fundo: "#062A36", fundo2: "#0B4556", acento: "#24D6B8", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.pesada, caixaAlta: true, espaco: 0.02, padrao: "pontos", selo: "letra", letra: "2", sigla: "LL2" },
  ITA1: { fundo: "#081A4F", fundo2: "#0F2F80", acento: "#5BB8FF", acento2: "#E3B341", texto: "#FFFFFF", fonte: F.saira, caixaAlta: true, espaco: 0.08, padrao: "listras", selo: "letra", letra: "Á", sigla: "SA" },
  GER1: { fundo: "#7A0009", fundo2: "#C8051A", acento: "#FFFFFF", acento2: "#141414", texto: "#FFFFFF", fonte: F.condensada, caixaAlta: true, espaco: 0.08, padrao: "grade", selo: "bola", sigla: "BL" },
  FRA1: { fundo: "#06122B", fundo2: "#0E2350", acento: "#DAE025", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.display, caixaAlta: true, espaco: 0.08, padrao: "hexagonos", selo: "hexagono", letra: "1", sigla: "L1" },
  POR1: { fundo: "#0C1640", fundo2: "#18286B", acento: "#22D1D1", acento2: "#FF5D8F", texto: "#FFFFFF", fonte: F.geometrica, caixaAlta: true, espaco: 0.08, padrao: "ondas", selo: "escudoDiagonal", sigla: "LP" },
  NED1: { fundo: "#14184A", fundo2: "#22296E", acento: "#FF7A1A", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.geometrica, caixaAlta: true, espaco: 0.08, padrao: "circulos", selo: "bola", sigla: "ED" },
  KSA1: { fundo: "#08352B", fundo2: "#0E5544", acento: "#D4AF5A", acento2: "#9A7BE0", texto: "#FFFFFF", fonte: F.geometrica, caixaAlta: true, espaco: 0.1, padrao: "losangos", selo: "estrelaAnel", sigla: "GOLFO" },
  ARG1: { fundo: "#0D2643", fundo2: "#163A63", acento: "#7CC4F2", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.condensada, caixaAlta: true, espaco: 0.08, padrao: "listras", selo: "sol", sigla: "LPF" },
  USA1: { fundo: "#0F0F0F", fundo2: "#262626", acento: "#FFFFFF", acento2: "#E03A3E", texto: "#FFFFFF", fonte: F.display, caixaAlta: true, espaco: 0.1, padrao: "diagonais", selo: "escudoDiagonal", sigla: "MLS" },
  MEX1: { fundo: "#06261A", fundo2: "#0C4430", acento: "#16D17F", acento2: "#E2263C", texto: "#FFFFFF", fonte: F.condensada, caixaAlta: true, espaco: 0.08, padrao: "chevrons", selo: "escudoDiagonal", sigla: "MX" },
  TUR1: { fundo: "#5E0710", fundo2: "#9A0F1D", acento: "#FFFFFF", acento2: "#F5C400", texto: "#FFFFFF", fonte: F.condensada, caixaAlta: true, espaco: 0.08, padrao: "pontos", selo: "estrelaAnel", sigla: "SL" },
  // fases amadoras
  VAR: { fundo: "#2E2618", fundo2: "#4A3C22", acento: "#F0D58C", acento2: "#FFFFFF", texto: "#FFF7E6", fonte: F.padrao, caixaAlta: true, espaco: 0.08, padrao: "pontos", selo: "bola", sigla: "VÁRZEA" },
  "USA-HS": { fundo: "#0E1E45", fundo2: "#1A3270", acento: "#E8344A", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.varsity, caixaAlta: true, espaco: 0.06, padrao: "listras", selo: "letra", letra: "HS", sigla: "HS" },
  "USA-NCAA": { fundo: "#3A0A0F", fundo2: "#651620", acento: "#F2C200", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.varsity, caixaAlta: true, espaco: 0.06, padrao: "listras", selo: "letra", letra: "U", sigla: "NCAA" },
  BASE: { fundo: "#17302A", fundo2: "#22463C", acento: "#9BE3C4", acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.saira, caixaAlta: true, espaco: 0.1, padrao: "grade", selo: "bola", sigla: "BASE" },
};
const escurecer = (hex: string, f: number) => { const n = parseInt(hex.slice(1), 16), c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f))); return `#${((1 << 24) | (c((n >> 16) & 255) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).slice(1)}`; };
const luz = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

/** Identidade da competição: id de liga (BRA1, ENG1...), de copa (UCL, LIB, PAU...) ou "BASE". */
export function identidade(id: string): Identidade {
  const copa = COPAS[id as CopaId];
  if (copa?.uf) {
    // estaduais: as cores do estado, em tom de noite, e o nome curto
    const [a, b] = copa.cores, fundo = luz(a) > 0.6 ? "#1B1B1B" : escurecer(a, 0.45);
    return { id, nome: copa.nome, sigla: copa.curto.toUpperCase(), fundo, fundo2: luz(a) > 0.6 ? "#333333" : escurecer(a, 0.75), acento: luz(b) < 0.25 ? "#FFFFFF" : b, acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.condensada, caixaAlta: true, espaco: 0.08, padrao: "listras", selo: "escudoEstrela" };
  }
  const chave = id.startsWith("BRA4") ? "BRA4" : id.startsWith("VAR-") ? "VAR" : id;
  const b = ID[chave];
  const li = infoLiga(id);
  const nome = copa?.nome ?? (id === "BASE" ? "Categorias de base" : li.nome);
  if (b) return { id, nome, sigla: b.sigla ?? id, ...b };
  // ligas sem identidade própria: as cores da bola da liga
  const [c1, c2] = li.bolas?.[0] ?? ["#1F3A5F", "#E3B341"], fundo = luz(c1) > 0.6 ? escurecer(c2, 0.4) : escurecer(c1, 0.5);
  return { id, nome, sigla: li.curto.toUpperCase(), fundo, fundo2: escurecer(fundo, 1.5), acento: luz(c2) < 0.2 ? "#FFFFFF" : c2, acento2: "#FFFFFF", texto: "#FFFFFF", fonte: F.condensada, caixaAlta: true, espaco: 0.08, padrao: "diagonais", selo: "escudoEstrela" };
}

// ------------------------------------------------------------------ padrões de fundo (SVG em data URI)
function padraoSvg(p: Padrao, cor: string): string {
  const c = cor;
  // url(&quot;...&quot;) porque o valor vai dentro de um style="..." no HTML
  const svg = (w: number, h: number, corpo: string) => `url(&quot;data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${corpo}</svg>`)}&quot;)`;
  const est = (x: number, y: number, r: number, o: number) => `<path d='${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; return `${i ? "L" : "M"}${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`; }).join(" ")}Z' fill='${c}' opacity='${o}'/>`;
  switch (p) {
    case "estrelas": return svg(120, 90, est(14, 18, 4, 0.5) + est(70, 10, 2.5, 0.35) + est(100, 48, 3.5, 0.45) + est(40, 62, 2.2, 0.3) + est(88, 82, 2, 0.3) + est(8, 74, 3, 0.4));
    case "raios": return svg(200, 200, Array.from({ length: 12 }, (_, i) => `<path d='M100 -10 L${100 + Math.cos((i / 12) * Math.PI * 2) * 300} ${-10 + Math.abs(Math.sin((i / 12) * Math.PI * 2)) * 300} L${100 + Math.cos((i / 12 + 0.025) * Math.PI * 2) * 300} ${-10 + Math.abs(Math.sin((i / 12 + 0.025) * Math.PI * 2)) * 300} Z' fill='${c}' opacity='.09'/>`).join(""));
    case "diagonais": return svg(60, 60, `<path d='M-10 70 L70 -10' stroke='${c}' stroke-width='9' opacity='.12'/><path d='M20 70 L70 20' stroke='${c}' stroke-width='3' opacity='.1'/>`);
    case "pontos": return svg(16, 16, `<circle cx='4' cy='4' r='1.6' fill='${c}' opacity='.22'/><circle cx='12' cy='12' r='1' fill='${c}' opacity='.16'/>`);
    case "grade": return svg(28, 28, `<path d='M28 0 V28 M0 28 H28' stroke='${c}' stroke-width='1' opacity='.16'/>`);
    case "ondas": return svg(80, 30, `<path d='M0 15 Q20 3 40 15 T80 15' fill='none' stroke='${c}' stroke-width='2.5' opacity='.16'/><path d='M0 27 Q20 15 40 27 T80 27' fill='none' stroke='${c}' stroke-width='1.2' opacity='.12'/>`);
    case "chevrons": return svg(40, 24, `<path d='M0 4 L20 16 L40 4' fill='none' stroke='${c}' stroke-width='3' opacity='.14'/>`);
    case "hexagonos": return svg(42, 48, `<path d='M21 2 L39 12.5 V35.5 L21 46 L3 35.5 V12.5 Z' fill='none' stroke='${c}' stroke-width='1.4' opacity='.2'/>`);
    case "listras": return svg(24, 24, `<rect x='0' y='0' width='9' height='24' fill='${c}' opacity='.07'/>`);
    case "losangos": return svg(36, 36, `<path d='M18 2 L34 18 L18 34 L2 18 Z' fill='none' stroke='${c}' stroke-width='1.4' opacity='.2'/><circle cx='18' cy='18' r='2' fill='${c}' opacity='.22'/>`);
    case "circulos": return svg(56, 56, `<circle cx='28' cy='28' r='20' fill='none' stroke='${c}' stroke-width='2' opacity='.14'/><circle cx='28' cy='28' r='9' fill='none' stroke='${c}' stroke-width='1.4' opacity='.12'/>`);
    default: return "none";
  }
}

// ------------------------------------------------------------------ selos (desenhados aqui; nada de logo real)
export function seloSvg(idt: Identidade, tam = 28): string {
  const a = idt.acento, b = idt.acento2, f = idt.fundo;
  const est = (x: number, y: number, r: number, cor: string) => `<path d="${Array.from({ length: 10 }, (_, i) => { const t = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r; return `${i ? "L" : "M"}${(x + Math.cos(t) * rr).toFixed(1)} ${(y + Math.sin(t) * rr).toFixed(1)}`; }).join(" ")}Z" fill="${cor}"/>`;
  let corpo = "";
  switch (idt.selo) {
    case "estrelaAnel": corpo = `<circle cx="20" cy="20" r="17" fill="${f}" stroke="${a}" stroke-width="2.2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const t = (i / 8) * Math.PI * 2 - Math.PI / 2; return est(20 + Math.cos(t) * 10.5, 20 + Math.sin(t) * 10.5, 3.2, i % 2 ? b : a); }).join("")}<circle cx="20" cy="20" r="3.4" fill="${a}"/>`; break;
    case "coroa": corpo = `<rect x="3" y="3" width="34" height="34" rx="10" fill="${a}"/><path d="M10 27 L9 14 L15 19 L20 11 L25 19 L31 14 L30 27 Z" fill="${f}"/><rect x="10" y="28.5" width="20" height="3.5" rx="1.5" fill="${f}"/><circle cx="20" cy="9.5" r="2" fill="${b}"/>`; break;
    case "letra": corpo = `<rect x="3" y="3" width="34" height="34" rx="8" fill="${a}"/><text x="20" y="${(idt.letra ?? "").length > 1 ? 26 : 29}" text-anchor="middle" font-family="${idt.fonte.replace(/"/g, "'")}" font-weight="900" font-size="${(idt.letra ?? "").length > 1 ? 16 : 24}" fill="${f}">${idt.letra ?? idt.sigla[0]}</text>`; break;
    case "taca": corpo = `<circle cx="20" cy="20" r="18" fill="${f}" stroke="${a}" stroke-width="1.6"/><path d="M13 10 H27 V16 Q27 24 20 25 Q13 24 13 16 Z" fill="${a}"/><path d="M13 12 Q8 12 9 17 Q10 20 13 19 M27 12 Q32 12 31 17 Q30 20 27 19" fill="none" stroke="${a}" stroke-width="1.8"/><rect x="18.5" y="25" width="3" height="4" fill="${a}"/><rect x="14" y="29" width="12" height="3.2" rx="1" fill="${a}"/>`; break;
    case "globo": corpo = `<circle cx="20" cy="20" r="17" fill="${f}" stroke="${a}" stroke-width="2"/><circle cx="20" cy="20" r="11" fill="none" stroke="${a}" stroke-width="1.6"/><ellipse cx="20" cy="20" rx="5" ry="11" fill="none" stroke="${a}" stroke-width="1.4"/><path d="M9 20 H31 M11 14 H29 M11 26 H29" stroke="${a}" stroke-width="1.2"/>${est(20, 5, 2.6, b)}`; break;
    case "hexagono": corpo = `<path d="M20 2 L36 11 V29 L20 38 L4 29 V11 Z" fill="${a}"/><text x="20" y="28" text-anchor="middle" font-family="${idt.fonte.replace(/"/g, "'")}" font-weight="900" font-size="22" fill="${f}">${idt.letra ?? "1"}</text>`; break;
    case "escudoEstrela": corpo = `<path d="M5 4 H35 V19 Q35 31 20 37 Q5 31 5 19 Z" fill="${f}" stroke="${a}" stroke-width="2.2"/><path d="M5 13 H35" stroke="${a}" stroke-width="1.4" opacity=".6"/>${est(20, 23, 7.5, a)}`; break;
    case "escudoDiagonal": corpo = `<path d="M5 4 H35 V19 Q35 31 20 37 Q5 31 5 19 Z" fill="${f}" stroke="${a}" stroke-width="2"/><clipPath id="sd${idt.id}"><path d="M5 4 H35 V19 Q35 31 20 37 Q5 31 5 19 Z"/></clipPath><path d="M0 34 L40 4 L40 12 L0 42 Z" fill="${a}" clip-path="url(#sd${idt.id})"/>${est(13, 13, 3, b)}`; break;
    case "bola": corpo = `<circle cx="20" cy="20" r="17" fill="${a}"/><path d="M20 12 L27 17 L24.5 25.5 L15.5 25.5 L13 17 Z" fill="${f}"/><path d="M20 12 V4 M27 17 L34 14 M24.5 25.5 L29 32 M15.5 25.5 L11 32 M13 17 L6 14" stroke="${f}" stroke-width="2"/>`; break;
    case "sol": corpo = `<circle cx="20" cy="20" r="18" fill="${f}"/>${Array.from({ length: 16 }, (_, i) => { const t = (i / 16) * Math.PI * 2; return `<path d="M${(20 + Math.cos(t) * 9).toFixed(1)} ${(20 + Math.sin(t) * 9).toFixed(1)} L${(20 + Math.cos(t) * (i % 2 ? 14 : 16.5)).toFixed(1)} ${(20 + Math.sin(t) * (i % 2 ? 14 : 16.5)).toFixed(1)}" stroke="${a}" stroke-width="2" stroke-linecap="round"/>`; }).join("")}<circle cx="20" cy="20" r="7.5" fill="${a}"/><circle cx="20" cy="20" r="3" fill="${b}"/>`; break;
    case "raio": corpo = `<rect x="3" y="3" width="34" height="34" rx="17" fill="${a}"/><path d="M23 6 L12 22 H19 L16 34 L28 17 H21 Z" fill="${f}"/>`; break;
    case "louros": corpo = `<circle cx="20" cy="20" r="18" fill="${f}"/><path d="M12 30 Q6 20 12 9 M28 30 Q34 20 28 9" fill="none" stroke="${a}" stroke-width="1.8"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="${10.5 - (i === 1 || i === 2 ? 1.5 : 0)}" cy="${12 + i * 5}" rx="2.6" ry="1.4" fill="${a}" transform="rotate(-35 ${10.5} ${12 + i * 5})"/><ellipse cx="${29.5 + (i === 1 || i === 2 ? 1.5 : 0)}" cy="${12 + i * 5}" rx="2.6" ry="1.4" fill="${a}" transform="rotate(35 ${29.5} ${12 + i * 5})"/>`).join("")}${est(20, 19, 6, a)}`; break;
  }
  return `<svg class="selo-comp-svg" viewBox="0 0 40 40" width="${tam}" height="${tam}" aria-hidden="true">${corpo}</svg>`;
}

/** Variáveis CSS da identidade (vão no style do elemento com a classe "ident"). */
export function estiloIdent(idt: Identidade): string {
  return `--i-fundo:${idt.fundo};--i-fundo2:${idt.fundo2};--i-acento:${idt.acento};--i-acento2:${idt.acento2};--i-texto:${idt.texto};--i-fonte:${idt.fonte.replace(/"/g, "'")};--i-caixa:${idt.caixaAlta ? "uppercase" : "none"};--i-espaco:${idt.espaco}em;--i-padrao:${padraoSvg(idt.padrao, idt.acento)}`;
}
/** Faixa pequena com o selo e o nome (cartões da semana, resumo, notícias). */
export function faixaComp(id: string, texto: string): string {
  const idt = identidade(id);
  return `<span class="faixa-comp ident" style="${estiloIdent(idt)}">${seloSvg(idt, 18)}<span>${texto}</span></span>`;
}
/** Cabeçalho grande da competição (tabela, copa). */
export function bannerComp(id: string, titulo: string, sub = ""): string {
  const idt = identidade(id);
  return `<div class="banner-comp ident" style="${estiloIdent(idt)}">${seloSvg(idt, 44)}<div><b>${titulo}</b>${sub ? `<small>${sub}</small>` : ""}</div><span class="banner-sigla">${idt.sigla}</span></div>`;
}
