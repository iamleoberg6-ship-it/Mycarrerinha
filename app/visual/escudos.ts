import { bandeiraSvg } from "../../src/bandeiras";
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
  // seleção: a bandeira do país no lugar do escudo
  if (chave.startsWith("NAT-")) return bandeiraSvg(chave.slice(4), "").replace("<svg ", '<svg x="2" y="2" width="26" height="30" ');
  // Marselha: só um M azul, sem escudo
  if (chave === "FR-OM") return `<text x="13" y="23" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="26" fill="${c2r ?? "#2FAEE0"}" stroke="#0A0A0A" stroke-width=".8" paint-order="stroke">M</text>`;
  // São Paulo: escudo branco com um triângulo invertido, cortado em faixas preta, branca e vermelha
  if (chave === "SPA") {
    const escudo = "M1 1 H25 V14 Q25 24 13 29 Q1 24 1 14 Z", tri = "M2 3 H24 L13 27 Z";
    return `<defs><clipPath id="escSPA"><path d="${tri}"/></clipPath></defs><path d="${escudo}" fill="#FFFFFF"/><g clip-path="url(#escSPA)"><rect x="0" y="3" width="26" height="8" fill="#0A0A0A"/><rect x="0" y="11" width="26" height="8" fill="#FFFFFF"/><rect x="0" y="19" width="26" height="9" fill="#C8102E"/></g><path d="${tri}" fill="none" stroke="${TINTA}" stroke-width=".8"/><path d="${escudo}" fill="none" stroke="${TINTA}" stroke-width="${borda}"/>`;
  }
  const MARINHO = "#0B1F4D", OURO = "#D4AF37", OURO_ESC = "#9C7A1E";
  // Real Madrigal: escudo branco com a faixa diagonal azul, contorno azul-marinho e a coroa dourada em cima
  if (chave === "ES-RMA") {
    const esc = "M4 9 H22 V17.5 Q22 25 13 28.8 Q4 25 4 17.5 Z";
    const coroa = `<path d="M5 8.6 L4.2 3.2 L8 5.6 L10.4 1.6 L13 4.6 L15.6 1.6 L18 5.6 L21.8 3.2 L21 8.6 Z" fill="${OURO}" stroke="${MARINHO}" stroke-width=".7" stroke-linejoin="round"/>`
      + `<rect x="5" y="7" width="16" height="1.6" fill="${OURO_ESC}"/>` + [[8, 4.9], [13, 3.8], [18, 4.9]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".75" fill="#C8102E"/>`).join("");
    return `<defs><clipPath id="escRMA"><path d="${esc}"/></clipPath></defs><path d="${esc}" fill="#FFFFFF"/><g clip-path="url(#escRMA)"><path d="M2 12 L6 9 L26 23 L22 27 Z" fill="#3A4FA0"/></g>`
      + `<text x="13" y="20" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="8" fill="${OURO}" stroke="${MARINHO}" stroke-width=".35" paint-order="stroke">RM</text>`
      + `<path d="${esc}" fill="none" stroke="${MARINHO}" stroke-width="${borda}" stroke-linejoin="round"/>${coroa}`;
  }
  // Arsenau: escudo vermelho com a silhueta de um canhão no meio, contorno azul-marinho
  if (chave === "EN-ARS") {
    const esc = "M1 1 H25 V14 Q25 24 13 29 Q1 24 1 14 Z";
    const canhao = `<g fill="#FFFFFF" stroke="${MARINHO}" stroke-width=".45" stroke-linejoin="round"><path d="M4.5 14.6 Q4.2 12.6 6 12.2 L21.6 10 Q23 9.9 23 11 L23 12.3 Q23 13.3 21.6 13.4 L6.4 16.4 Q4.8 16.6 4.5 14.6 Z"/><rect x="22.4" y="9.6" width="1.4" height="4.2" rx=".5"/><circle cx="9.6" cy="18.4" r="3.4"/><circle cx="9.6" cy="18.4" r="1" fill="${MARINHO}" stroke="none"/></g>`;
    return `<path d="${esc}" fill="#EF0107"/>${canhao}<path d="${esc}" fill="none" stroke="${MARINHO}" stroke-width="${borda}" stroke-linejoin="round"/>`;
  }
  // Paris São Germano: redondo azul-marinho, com a torre Eiffel dourada no meio e o anel branco
  if (chave === "FR-PSG") {
    const torre = `<g fill="#DA291C" stroke="#8E1A12" stroke-width=".3" stroke-linejoin="round"><path d="M13 3.6 L13.7 8 L14.6 12.5 L16.4 19 L19.4 25.6 H16.6 Q15.6 22.4 13 22.4 Q10.4 22.4 9.4 25.6 H6.6 L9.6 19 L11.4 12.5 L12.3 8 Z"/></g>`
      + `<rect x="10.8" y="12.2" width="4.4" height="1.1" fill="#8E1A12"/><rect x="9.2" y="18.6" width="7.6" height="1.2" fill="#8E1A12"/>`;
    return `<circle cx="13" cy="15" r="12.6" fill="${MARINHO}"/><circle cx="13" cy="15" r="11" fill="none" stroke="#FFFFFF" stroke-width=".9"/>${torre}<circle cx="13" cy="15" r="12.6" fill="none" stroke="${TINTA}" stroke-width="${borda * 0.8}"/>`;
  }
  const c2 = c2r && c2r.toLowerCase() !== c1.toLowerCase() ? c2r : c1.toLowerCase() === "#ffffff" ? "#0A0A0A" : "#FFFFFF";
  const { forma, desenho } = modeloEscudo(chave), d = FORMAS[forma], id = `escR${forma}`;
  // Corinthians: um filete vermelho por dentro do contorno (o detalhe da marca, sem mudar o formato)
  const DETALHE: Record<string, string> = { COR: "#D0102C", GRE: "#FFFFFF" };
  // Santos: coroa branca com contorno preto logo acima da letra
  const COROA = chave === "SAN" ? `<path d="M8.5 14.2 L8.5 10.6 L10.9 12.5 L13 9.6 L15.1 12.5 L17.5 10.6 L17.5 14.2 Z" fill="#FFFFFF" stroke="#0A0A0A" stroke-width=".6" stroke-linejoin="round"/>` : "";
  // Fluminense: um F branco no centro do escudo, com contorno escuro para aparecer em qualquer cor de fundo
  const LETRA_FLU = chave === "FLU" ? `<text x="13" y="21.5" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="17" fill="#FFFFFF" stroke="#0A0A0A" stroke-width=".7" paint-order="stroke">F</text>` : "";
  // Liverpool: "YNWA" em branco, fininho, no espaço vermelho acima da letra
  const YNWA = chave === "EN-LIV" ? `<text x="13" y="7.4" text-anchor="middle" font-family="Arial Narrow, Arial, sans-serif" font-weight="400" font-size="4.6" letter-spacing=".5" fill="#FFFFFF">YNWA</text>` : "";
  // Manchester Celeste: tudo azul, com três listras diagonais brancas
  const LISTRAS_MCI = (azul: string) => `<rect width="26" height="30" fill="${azul}"/><g transform="rotate(-45 13 15)" fill="#FFFFFF">${[9.2, 14.8, 20.4].map((y) => `<rect x="-10" y="${y}" width="50" height="2.6"/>`).join("")}</g>`;
  const detalhe = COROA + LETRA_FLU + YNWA + (DETALHE[chave] ? `<path d="${d}" transform="translate(13 15) scale(.9) translate(-13 -15)" fill="none" stroke="${DETALHE[chave]}" stroke-width="1.1"/>` : "");
  return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${c1}"/><g clip-path="url(#${id})">${chave === "EN-MCI" ? LISTRAS_MCI(c1) : DESENHOS[desenho](c1, c2, inicial(nome))}</g>${detalhe}<path d="${d}" fill="none" stroke="${TINTA}" stroke-width="${borda}" stroke-linejoin="round"/>`;
}
/** Escudo pequeno, como elemento solto na página. */
export function svgEscudo(chave: string, c1: string, c2?: string, nome?: string, cls = "escudo"): string {
  return `<svg class="${cls}" viewBox="0 0 26 30" aria-hidden="true">${corpoEscudo(chave, c1, c2, nome)}</svg>`;
}
