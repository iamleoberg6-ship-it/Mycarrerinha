// Escudos genéricos (nada de escudo real): cada clube ganha, de forma fixa, um formato e um desenho interno,
// sorteados pelo id do clube, sempre com as cores dele. Desenhados num quadro de 26 × 30.
const TINTA = "#0A0A0A";
const hash = (t: string) => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/** Formatos do contorno. */
const FORMAS: string[] = [
  "M1 1 H25 V14 Q25 24 13 29 Q1 24 1 14 Z", // escudo clássico
  "M13 1.5 A12 12 0 1 1 12.99 1.5 Z", // redondo
  "M2 2 H24 V12 L13 29 L2 12 Z", // pontudo
  "M2 2 H24 V18 Q24 26.5 13 29 Q2 26.5 2 18 Z", // base arredondada
  "M13 1 L25 7.5 V21.5 L13 29 L1 21.5 V7.5 Z", // hexágono
  "M2 2 H24 V23 L13 29 L2 23 Z", // retângulo com ponta
  "M13 1.5 C21 1.5 25 7.5 25 15.5 C25 23.5 20 28.5 13 28.5 C6 28.5 1 23.5 1 15.5 C1 7.5 5 1.5 13 1.5 Z", // oval
  "M1 4 Q7 1 13 4 Q19 1 25 4 V15 Q25 24 13 29 Q1 24 1 15 Z", // topo ondulado
  "M4 1 H22 L25 4 V16 Q25 24 13 29 Q1 24 1 16 V4 Z", // cantos cortados
];
/** Desenhos internos (recortados pelo formato). c1 = cor principal, c2 = segunda cor. */
const DESENHOS: ((c1: string, c2: string, letra: string) => string)[] = [
  (_a, b) => `<rect x="0" y="12" width="26" height="5" fill="${b}"/>`, // faixa horizontal
  (_a, b) => `<rect x="5" y="0" width="4" height="30" fill="${b}"/><rect x="17" y="0" width="4" height="30" fill="${b}"/>`, // listras verticais
  (_a, b) => `<path d="M-2 4 L6 -2 L28 22 L20 30 Z" fill="${b}"/>`, // faixa diagonal
  (_a, b) => `<rect x="13" y="0" width="13" height="30" fill="${b}"/>`, // meio a meio
  (_a, b) => `<path d="M0 8 L13 18 L26 8 V14 L13 24 L0 14 Z" fill="${b}"/>`, // chevron
  (_a, b) => `<rect x="11" y="0" width="4" height="30" fill="${b}"/><rect x="0" y="11" width="26" height="4" fill="${b}"/>`, // cruz
  (_a, b) => `<rect x="13" y="0" width="13" height="15" fill="${b}"/><rect x="0" y="15" width="13" height="15" fill="${b}"/>`, // quartelado
  (_a, b, l) => `<circle cx="13" cy="15.5" r="7" fill="${b}"/><text x="13" y="19" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="10" fill="${TINTA}" opacity=".85">${l}</text>`, // círculo com a inicial
  (_a, b) => `<rect x="0" y="0" width="26" height="9" fill="${b}"/><path d="M13 12 L14.6 16.2 L19 16.4 L15.6 19.2 L16.8 23.5 L13 21 L9.2 23.5 L10.4 19.2 L7 16.4 L11.4 16.2 Z" fill="${b}"/>`, // topo e estrela
  (_a, b) => `${[0, 1, 2, 3, 4].map((i) => `<rect x="0" y="${3 + i * 6}" width="26" height="3" fill="${b}"/>`).join("")}`, // listras horizontais
  (_a, b, l) => `<path d="M0 0 H26 V10 H0 Z" fill="${b}"/><text x="13" y="24" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="12" fill="${b}">${l}</text>`, // faixa no topo e a inicial
  (_a, b) => `<path d="M13 0 L26 15 L13 30 L0 15 Z" fill="${b}"/>`, // losango
];
export const N_FORMAS = FORMAS.length, N_DESENHOS = DESENHOS.length;
/** O modelo do clube: formato e desenho (fixos para o mesmo id). */
export function modeloEscudo(chave: string): { forma: number; desenho: number } {
  const h = hash(`escudo|${chave}`);
  return { forma: h % FORMAS.length, desenho: Math.floor(h / FORMAS.length) % DESENHOS.length };
}
const inicial = (nome?: string) => {
  const p = (nome ?? "").replace(/^(CR|SC|EC|SE|FC|AC|CA|AA|CD|RC|GE|AD|SA|EC)\s+/i, "").trim();
  return (p[0] ?? "").toUpperCase().replace(/[^A-ZÀ-Ú]/g, "");
};
/** O desenho do escudo no quadro 26 × 30 (sem o <svg>): contorno, desenho interno recortado e a borda. */
export function corpoEscudo(chave: string, c1: string, c2r?: string, nome?: string, borda = 1.6): string {
  const c2 = c2r && c2r.toLowerCase() !== c1.toLowerCase() ? c2r : c1.toLowerCase() === "#ffffff" ? "#0A0A0A" : "#FFFFFF";
  const { forma, desenho } = modeloEscudo(chave), d = FORMAS[forma], id = `escR${forma}`;
  // Corinthians: um filete vermelho por dentro do contorno (o detalhe da marca, sem mudar o formato)
  const DETALHE: Record<string, string> = { COR: "#D0102C", GRE: "#FFFFFF" };
  const detalhe = DETALHE[chave] ? `<path d="${d}" transform="translate(13 15) scale(.9) translate(-13 -15)" fill="none" stroke="${DETALHE[chave]}" stroke-width="1.1"/>` : "";
  return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${c1}"/><g clip-path="url(#${id})">${DESENHOS[desenho](c1, c2, inicial(nome))}</g>${detalhe}<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${borda}" stroke-linejoin="round"/>`;
}
/** Escudo pequeno, como elemento solto na página. */
export function svgEscudo(chave: string, c1: string, c2?: string, nome?: string, cls = "escudo"): string {
  return `<svg class="${cls}" viewBox="0 0 26 30" aria-hidden="true">${corpoEscudo(chave, c1, c2, nome)}</svg>`;
}
