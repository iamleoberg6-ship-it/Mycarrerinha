import { bandeiraSvg } from "../../src/bandeiras";
import { emblemaTouros } from "./peito";
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
  // Atlético das Minas: só o galo, preto com detalhes brancos e filete branco (aparece em fundo claro e escuro)
  if (chave === "CAM") {
    // galo de perfil, virado para a esquerda: peito estufado, crista alta, rabo em foice e as pernas firmes
    const corpo = "M4.4 7 L6.2 6 C6.4 4.6 7.4 4 8.4 4 C9.8 4 10.8 5 10.8 6.6 C10.8 8.4 11.6 9.6 13.4 10.2 C15 10.6 16.4 10 17.4 8.6 C18 6 19.4 3.4 22.2 2.2 C21 4 21.2 5.6 22 6.6 C22.6 5 23.8 4.2 25 4.4 C23.8 5.6 24.2 7.8 24.6 9.6 C25 12.6 23.4 15.6 20.6 17.2 C19 19.4 16.4 20.6 13.8 20.6 C9.2 20.6 5 18.4 4.4 14.6 C4 12.2 5 10.2 6.2 8.8 L6.4 7.6 Z";
    const crista = "M6.6 4.6 L6.2 2.6 L7.6 3.4 L8.2 1.6 L9.2 3.1 L10.3 2 L10.5 3.8 L10.9 4.8 Z", barbela = "M6.3 7.7 C5.2 8.1 5.2 10.1 6.4 10.1 C7.1 9.5 7.1 8.4 6.7 7.8 Z";
    const pernas = "M11.8 20 L11.2 25.4 L8.8 26.1 M11.2 25.4 L12.7 26.4 M15.3 20 L15.8 25.4 L13.8 26.2 M15.8 25.4 L17.5 26.2 M11.5 22.8 L10.4 22.4 M15.6 22.8 L16.8 22.4";
    const formas = (cor: string, w: number) => `<path d="${corpo}" fill="${cor}" stroke="${cor}" stroke-width="${w}" stroke-linejoin="round"/><path d="${crista}" fill="${cor}" stroke="${cor}" stroke-width="${w}" stroke-linejoin="round"/><path d="${barbela}" fill="${cor}" stroke="${cor}" stroke-width="${w}"/><path d="${pernas}" fill="none" stroke="${cor}" stroke-width="${1.1 + w * 0.6}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const detalhes = `<path d="M10.4 13.2 C12.6 11.6 16.2 12.2 17.8 14.4 C15.6 16.6 12.4 17 10.4 13.2 Z M12 14.2 C13.6 13.6 15 13.8 16 14.6" fill="none" stroke="#FFFFFF" stroke-width=".5" stroke-linejoin="round"/>`
      + `<path d="M18.6 9.8 C20 7.2 21.4 5.6 23.4 4.9 M19.6 12.2 C21.4 10.8 23 10 24.4 10.1 M19.4 14.6 C21 14 22.6 13.6 23.8 13.8" fill="none" stroke="#FFFFFF" stroke-width=".45" stroke-linecap="round"/>`
      + `<circle cx="8.5" cy="5.6" r=".6" fill="#FFFFFF"/>`;
    return `<g transform="translate(-1 1.4)">${formas("#FFFFFF", 1.3)}${formas("#0A0A0A", 0)}${detalhes}</g>`;
  }
  // Palmeiras: bola verde com um P branco em letra antiga (com serifa), como nos escudos de clube de antigamente
  const ANTIGA = "Georgia, 'Times New Roman', Times, serif";
  if (chave === "PAL") {
    return `<circle cx="13" cy="15" r="12.4" fill="#006437"/><circle cx="13" cy="15" r="10.7" fill="none" stroke="#FFFFFF" stroke-width=".8"/>`
      + `<text x="13.4" y="22" text-anchor="middle" font-family="${ANTIGA}" font-weight="700" font-size="20" fill="#FFFFFF">P</text>`
      + `<circle cx="13" cy="15" r="12.4" fill="none" stroke="${TINTA}" stroke-width="${borda * 0.8}"/>`;
  }
  // Inter: bola vermelha com o S, o C e o I entrelaçados (um por cima do outro), em letra antiga branca
  if (chave === "INT") {
    const l = (t: string, x: number, y: number, tam: number) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${ANTIGA}" font-weight="700" font-size="${tam}" fill="#FFFFFF" stroke="#E30613" stroke-width=".5" paint-order="stroke">${t}</text>`;
    return `<circle cx="13" cy="15" r="12.4" fill="#E30613"/><circle cx="13" cy="15" r="10.7" fill="none" stroke="#FFFFFF" stroke-width=".8"/>`
      + l("S", 8.8, 20.6, 15) + l("I", 17.8, 20.4, 15) + l("C", 13.4, 20.8, 16)
      + `<circle cx="13" cy="15" r="12.4" fill="none" stroke="${TINTA}" stroke-width="${borda * 0.8}"/>`;
  }
  // Bayern: bola vermelha por fora e, dentro, uma bola menor com losangos azul-claro e brancos (a bandeira da Baviera)
  if (chave === "DE-FCB") {
    const losangos = `<g transform="translate(13 15) rotate(45)" fill="#2E9BDA"><rect x="-19.2" y="-19.2" width="3.2" height="3.2"/><rect x="-19.2" y="-12.8" width="3.2" height="3.2"/><rect x="-19.2" y="-6.4" width="3.2" height="3.2"/><rect x="-19.2" y="0.0" width="3.2" height="3.2"/><rect x="-19.2" y="6.4" width="3.2" height="3.2"/><rect x="-19.2" y="12.8" width="3.2" height="3.2"/><rect x="-19.2" y="19.2" width="3.2" height="3.2"/><rect x="-16.0" y="-16.0" width="3.2" height="3.2"/><rect x="-16.0" y="-9.6" width="3.2" height="3.2"/><rect x="-16.0" y="-3.2" width="3.2" height="3.2"/><rect x="-16.0" y="3.2" width="3.2" height="3.2"/><rect x="-16.0" y="9.6" width="3.2" height="3.2"/><rect x="-16.0" y="16.0" width="3.2" height="3.2"/><rect x="-12.8" y="-19.2" width="3.2" height="3.2"/><rect x="-12.8" y="-12.8" width="3.2" height="3.2"/><rect x="-12.8" y="-6.4" width="3.2" height="3.2"/><rect x="-12.8" y="0.0" width="3.2" height="3.2"/><rect x="-12.8" y="6.4" width="3.2" height="3.2"/><rect x="-12.8" y="12.8" width="3.2" height="3.2"/><rect x="-12.8" y="19.2" width="3.2" height="3.2"/><rect x="-9.6" y="-16.0" width="3.2" height="3.2"/><rect x="-9.6" y="-9.6" width="3.2" height="3.2"/><rect x="-9.6" y="-3.2" width="3.2" height="3.2"/><rect x="-9.6" y="3.2" width="3.2" height="3.2"/><rect x="-9.6" y="9.6" width="3.2" height="3.2"/><rect x="-9.6" y="16.0" width="3.2" height="3.2"/><rect x="-6.4" y="-19.2" width="3.2" height="3.2"/><rect x="-6.4" y="-12.8" width="3.2" height="3.2"/><rect x="-6.4" y="-6.4" width="3.2" height="3.2"/><rect x="-6.4" y="0.0" width="3.2" height="3.2"/><rect x="-6.4" y="6.4" width="3.2" height="3.2"/><rect x="-6.4" y="12.8" width="3.2" height="3.2"/><rect x="-6.4" y="19.2" width="3.2" height="3.2"/><rect x="-3.2" y="-16.0" width="3.2" height="3.2"/><rect x="-3.2" y="-9.6" width="3.2" height="3.2"/><rect x="-3.2" y="-3.2" width="3.2" height="3.2"/><rect x="-3.2" y="3.2" width="3.2" height="3.2"/><rect x="-3.2" y="9.6" width="3.2" height="3.2"/><rect x="-3.2" y="16.0" width="3.2" height="3.2"/><rect x="0.0" y="-19.2" width="3.2" height="3.2"/><rect x="0.0" y="-12.8" width="3.2" height="3.2"/><rect x="0.0" y="-6.4" width="3.2" height="3.2"/><rect x="0.0" y="0.0" width="3.2" height="3.2"/><rect x="0.0" y="6.4" width="3.2" height="3.2"/><rect x="0.0" y="12.8" width="3.2" height="3.2"/><rect x="0.0" y="19.2" width="3.2" height="3.2"/><rect x="3.2" y="-16.0" width="3.2" height="3.2"/><rect x="3.2" y="-9.6" width="3.2" height="3.2"/><rect x="3.2" y="-3.2" width="3.2" height="3.2"/><rect x="3.2" y="3.2" width="3.2" height="3.2"/><rect x="3.2" y="9.6" width="3.2" height="3.2"/><rect x="3.2" y="16.0" width="3.2" height="3.2"/><rect x="6.4" y="-19.2" width="3.2" height="3.2"/><rect x="6.4" y="-12.8" width="3.2" height="3.2"/><rect x="6.4" y="-6.4" width="3.2" height="3.2"/><rect x="6.4" y="0.0" width="3.2" height="3.2"/><rect x="6.4" y="6.4" width="3.2" height="3.2"/><rect x="6.4" y="12.8" width="3.2" height="3.2"/><rect x="6.4" y="19.2" width="3.2" height="3.2"/><rect x="9.6" y="-16.0" width="3.2" height="3.2"/><rect x="9.6" y="-9.6" width="3.2" height="3.2"/><rect x="9.6" y="-3.2" width="3.2" height="3.2"/><rect x="9.6" y="3.2" width="3.2" height="3.2"/><rect x="9.6" y="9.6" width="3.2" height="3.2"/><rect x="9.6" y="16.0" width="3.2" height="3.2"/><rect x="12.8" y="-19.2" width="3.2" height="3.2"/><rect x="12.8" y="-12.8" width="3.2" height="3.2"/><rect x="12.8" y="-6.4" width="3.2" height="3.2"/><rect x="12.8" y="0.0" width="3.2" height="3.2"/><rect x="12.8" y="6.4" width="3.2" height="3.2"/><rect x="12.8" y="12.8" width="3.2" height="3.2"/><rect x="12.8" y="19.2" width="3.2" height="3.2"/><rect x="16.0" y="-16.0" width="3.2" height="3.2"/><rect x="16.0" y="-9.6" width="3.2" height="3.2"/><rect x="16.0" y="-3.2" width="3.2" height="3.2"/><rect x="16.0" y="3.2" width="3.2" height="3.2"/><rect x="16.0" y="9.6" width="3.2" height="3.2"/><rect x="16.0" y="16.0" width="3.2" height="3.2"/><rect x="19.2" y="-19.2" width="3.2" height="3.2"/><rect x="19.2" y="-12.8" width="3.2" height="3.2"/><rect x="19.2" y="-6.4" width="3.2" height="3.2"/><rect x="19.2" y="0.0" width="3.2" height="3.2"/><rect x="19.2" y="6.4" width="3.2" height="3.2"/><rect x="19.2" y="12.8" width="3.2" height="3.2"/><rect x="19.2" y="19.2" width="3.2" height="3.2"/></g>`;
    return `<defs><clipPath id="cFCB"><circle cx="13" cy="15" r="7.6"/></clipPath></defs><circle cx="13" cy="15" r="12.4" fill="#DC052D"/><circle cx="13" cy="15" r="10.9" fill="none" stroke="#FFFFFF" stroke-width=".7"/>`
      + `<g clip-path="url(#cFCB)"><rect x="0" y="0" width="26" height="30" fill="#FFFFFF"/>${losangos}</g><circle cx="13" cy="15" r="7.6" fill="none" stroke="#FFFFFF" stroke-width="1"/>`
      + `<circle cx="13" cy="15" r="12.4" fill="none" stroke="${TINTA}" stroke-width="${borda * 0.8}"/>`;
  }
  // Dortmund: bola amarela com o 09 preto dentro
  if (chave === "DE-BVB") {
    return `<circle cx="13" cy="15" r="12.4" fill="#FDE100"/><circle cx="13" cy="15" r="10.8" fill="none" stroke="#0A0A0A" stroke-width="1"/>`
      + `<text x="13" y="20.6" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="15" letter-spacing="-.4" fill="#0A0A0A">09</text>`
      + `<circle cx="13" cy="15" r="12.4" fill="none" stroke="${TINTA}" stroke-width="${borda * 0.8}"/>`;
  }
  // Tigre do Carvão (Criciúma): um triângulo de base larga partido ao meio, com um vão entre as duas metades; amarelo com contorno preto
  if (chave === "CRI") return `<g fill="#FDD100" stroke="#0A0A0A" stroke-width="1.1" stroke-linejoin="round"><path d="M12.2 4.6 L1.2 26 H12.2 Z"/><path d="M13.8 4.6 L24.8 26 H13.8 Z"/></g>`;
  // Benfica: a águia de asas abertas em cima, segurando o escudo meio vermelho, meio branco, com SLB pequenino em dourado
  if (chave === "PT-SLB") {
    const esc = "M6 9.6 H20 V17.6 Q20 25 13 28.6 Q6 25 6 17.6 Z", OURO2 = "#D9A93A";
    const asa = "M12.2 7.2 C9.4 3.4 5.4 2.2 1 3.6 L3 4.9 L1.2 6 L3.8 6.9 L2.4 8.2 L5.6 8.5 L4.8 10 C7.8 9.8 10.4 9.2 12.2 8.6 Z";
    const aguia = `<g fill="${OURO2}" stroke="#5A3E0E" stroke-width=".4" stroke-linejoin="round"><path d="${asa}"/><path d="${asa}" transform="translate(26 0) scale(-1 1)"/>`
      + `<ellipse cx="13" cy="7.6" rx="1.9" ry="3"/><circle cx="13" cy="3.7" r="1.5"/><path d="M11.7 3.9 L10.4 4.6 L11.8 4.7 Z"/><path d="M11.4 10 L10.6 11.2 M14.6 10 L15.4 11.2" fill="none" stroke-width=".7" stroke-linecap="round"/></g><circle cx="12.6" cy="3.4" r=".3" fill="#0A0A0A"/>`;
    return `<defs><clipPath id="cBEN"><path d="${esc}"/></clipPath></defs><path d="${esc}" fill="#FFFFFF"/><g clip-path="url(#cBEN)"><rect x="0" y="0" width="13" height="30" fill="#E30613"/></g>`
      + `<text x="13" y="20.2" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="3.4" letter-spacing=".2" fill="${OURO2}" stroke="#5A3E0E" stroke-width=".25" paint-order="stroke">SLB</text>`
      + `<path d="${esc}" fill="none" stroke="${TINTA}" stroke-width="${borda * 0.8}" stroke-linejoin="round"/>${aguia}`;
  }
  // Juventus: um J grande no formato de escudo, cortado no meio por um fio vazio (parece um J duplo)
  if (chave === "IT-JUV") {
    const j = "M5.4 4.6 H17.6 V18 Q17.6 25.6 11.6 25.6 Q6 25.6 5.6 20";
    return `<defs><mask id="mJUV" maskUnits="userSpaceOnUse" x="-2" y="-2" width="30" height="34"><rect x="-2" y="-2" width="30" height="34" fill="#FFF"/><path d="${j}" fill="none" stroke="#000" stroke-width=".8"/></mask></defs>`
      + `<g mask="url(#mJUV)" fill="none" stroke-linejoin="miter"><path d="${j}" stroke="#FFFFFF" stroke-width="8.2"/><path d="${j}" stroke="#0A0A0A" stroke-width="6.6"/></g>`;
  }
  // Nápoles: uma bola azul com um N branco dentro
  if (chave === "IT-NAP") {
    const az = c1.toLowerCase() === "#ffffff" ? (c2r ?? "#12A0D7") : c1;
    return `<circle cx="13" cy="15" r="12.4" fill="${az}"/><circle cx="13" cy="15" r="10.6" fill="none" stroke="#FFFFFF" stroke-width="1"/>`
      + `<text x="13" y="21.4" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF">N</text>`
      + `<circle cx="13" cy="15" r="12.4" fill="none" stroke="${TINTA}" stroke-width="${borda * 0.8}"/>`;
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
  if (chave === "BOT") c1 = "#0A0A0A";
  if (chave === "CRU") c1 = "#0B3D91"; // todo azul
  if (chave === "FR-PFC") c1 = "#1B2A5B"; // todo azul-marinho // escudo preto, sempre (a estrela branca vai no centro)
  const c2 = c2r && c2r.toLowerCase() !== c1.toLowerCase() ? c2r : c1.toLowerCase() === "#ffffff" ? "#0A0A0A" : "#FFFFFF";
  const { forma, desenho } = modeloEscudo(chave), d = FORMAS[forma], id = `escR${forma}`;
  // Corinthians: um filete vermelho por dentro do contorno (o detalhe da marca, sem mudar o formato)
  const DETALHE: Record<string, string> = { COR: "#D0102C", GRE: "#FFFFFF", SPT: "#FFD200" };
  // Santos: coroa branca com contorno preto logo acima da letra
  const COROA = chave === "SAN" ? `<path d="M8.5 14.2 L8.5 10.6 L10.9 12.5 L13 9.6 L15.1 12.5 L17.5 10.6 L17.5 14.2 Z" fill="#FFFFFF" stroke="#0A0A0A" stroke-width=".6" stroke-linejoin="round"/>` : "";
  // Fluminense: o escudo dividido ao meio (uma cor de cada lado) e um F branco no centro, com contorno escuro para aparecer em qualquer cor de fundo
  const LETRA_FLU = chave === "FLU" ? `<text x="13" y="21.5" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="17" fill="#FFFFFF" stroke="#0A0A0A" stroke-width=".7" paint-order="stroke">F</text>` : "";
  // Liverpool: "YNWA" em branco, fininho, no espaço vermelho acima da letra
  const YNWA = chave === "EN-LIV" ? `<text x="13" y="7.4" text-anchor="middle" font-family="Arial Narrow, Arial, sans-serif" font-weight="400" font-size="4.6" letter-spacing=".5" fill="#FFFFFF">YNWA</text>` : "";
  // Manchester Celeste: tudo azul, com três listras diagonais brancas
  const LISTRAS_MCI = (azul: string) => `<rect width="26" height="30" fill="${azul}"/><g transform="rotate(-45 13 15)" fill="#FFFFFF">${[9.2, 14.8, 20.4].map((y) => `<rect x="-10" y="${y}" width="50" height="2.6"/>`).join("")}</g>`;
  // Lyon Leonês: a silhueta de um leão azul-marinho no centro do escudo (filete branco para aparecer no azul)
  // Tottenhão: escudo nas cores do clube com um galo azul-marinho em cima de uma bola
  const GALO = chave === "EN-TOT" ? (() => {
    const m = "#132257";
    const galo = "M7.2 6.2 C7.6 5 9 4.6 10 5.2 L10.6 4 L11.2 5 L11.9 3.9 L12.2 5.4 C12.8 6 12.9 7 12.4 7.8 C13.6 8.6 15.6 8.8 17.2 8 C17.6 6 18.6 4.2 20.4 3.4 C19.6 5 19.8 6.4 20.6 7.4 C21.2 5.6 22.4 4.8 23.4 4.8 C22.2 6.2 22.4 8.6 21.4 10.6 C20.6 12.6 18.6 14 16 14.4 L15.6 16.4 L16.8 17.2 L13.8 17.2 L14.4 14.4 L12.6 14.2 L12.4 16.4 L13.4 17.2 L10.6 17.2 L11.2 14 C9.4 13.2 8.4 11.6 8.4 9.8 C8.4 9 8.6 8.4 8.8 8 L6.2 7.4 Z";
    const bola = `<circle cx="13.2" cy="22.2" r="4.8" fill="${m}"/><path d="M13.2 20.4 L14.9 21.6 L14.3 23.6 L12.1 23.6 L11.5 21.6 Z" fill="#FFFFFF"/><path d="M13.2 20.4 V17.6 M14.9 21.6 L17.6 20.6 M14.3 23.6 L15.8 26 M12.1 23.6 L10.6 26 M11.5 21.6 L8.8 20.6" stroke="#FFFFFF" stroke-width=".5"/>`;
    return `<g transform="translate(-1.6 .6)">${bola.replace(/13\.2/g, "14.8")}</g><g transform="translate(0 .8)"><path d="${galo}" fill="${m}"/><circle cx="9.7" cy="6.5" r=".5" fill="#FFFFFF"/></g>`;
  })() : "";
  // Leão do Pici: o escudo dividido ao meio, metade azul e metade vermelha (desenho "meio a meio")
  // (Sport Leão: o mesmo leão em amarelo vivo, com filete preto, e um filete amarelo por dentro do contorno)
  const leao = (corpo: string, rosto: string, filete: string, olho: string) => `<g transform="translate(3.4 7.4) scale(.76)" stroke="${filete}" stroke-width=".8" stroke-linejoin="round" fill="${corpo}"><path d="M21.6 8.6 C23.6 8.2 24.4 6.6 24 4.6" fill="none" stroke="${corpo}" stroke-width="1.3" stroke-linecap="round"/><circle cx="24" cy="4.2" r="1.3"/><path d="M9 6.6 C13 5.6 18 5.8 21 7.2 C22.4 8 22.6 10 22 11.6 L21.6 13 L22 19.6 L19.8 19.6 L19.2 14.4 L18.2 14.6 L17.6 19.6 L15.4 19.6 L15.4 14.4 L12 14.2 L11.4 19.6 L9.2 19.6 L9.2 14 L8.4 19.6 L6.2 19.6 L6.6 12.6 Z"/><path d="M7.20 2.00 L9.08 3.67 L11.58 3.82 L11.73 6.32 L13.40 8.20 L11.73 10.08 L11.58 12.58 L9.08 12.73 L7.20 14.40 L5.32 12.73 L2.82 12.58 L2.67 10.08 L1.00 8.20 L2.67 6.32 L2.82 3.82 L5.32 3.67 Z"/><path d="M2.2 8.8 C2.2 6.6 3.8 5.4 5.8 5.6 C7.6 5.8 8.8 7.2 8.6 9.2 C8.4 11.2 6.8 12.2 5 12 C4 11.9 3.4 11.4 3 10.8 L1.4 10.6 C1 10.4 .9 9.9 1.2 9.6 Z" fill="${rosto}"/><circle cx="4.6" cy="8.2" r=".55" fill="${olho}" stroke="none"/><path d="M1.6 10 L2.6 10.2" stroke="${olho}" stroke-width=".5"/></g>`;
  const LEAO = chave === "FR-LYO" ? leao("#0B1F4D", "#132C66", "#FFFFFF", "#FFFFFF") : chave === "SPT" ? leao("#FFD200", "#F2B705", "#0A0A0A", "#0A0A0A") : "";
  // Barça: o escudo listrado azul e grená embaixo; em cima, dividido ao meio: a cruz vermelha num lado e as listras da Catalunha no outro
  const CATALUNHA = chave === "ES-BAR" ? `<rect x="0" y="0" width="13" height="14" fill="#FFFFFF"/><rect x="6" y="0" width="2.4" height="14" fill="#DA121A"/><rect x="0" y="6.2" width="13" height="2.4" fill="#DA121A"/>`
    + `<rect x="13" y="0" width="13" height="14" fill="#FCDD09"/>${[1, 3, 5, 7].map((k) => `<rect x="${(13 + k * 13 / 9).toFixed(2)}" y="0" width="${(13 / 9).toFixed(2)}" height="14" fill="#DA121A"/>`).join("")}`
    + `<path d="M0 14 H26 M13 0 V14" stroke="${TINTA}" stroke-width=".9"/>` : "";
  // Botafogo: o mesmo formato, todo preto, só com a estrela solitária branca no centro (sem letra)
  const ESTRELA = chave === "BOT" ? `<path d="M13.00 8.20 L14.70 13.05 L19.85 13.18 L15.76 16.30 L17.23 21.22 L13.00 18.30 L8.77 21.22 L10.24 16.30 L6.15 13.18 L11.30 13.05 Z" fill="#FFFFFF" stroke-linejoin="round"/>` : "";
  // Cruzeiro: o escudo todo azul, com 4 estrelas brancas nas pontas do Cruzeiro do Sul (ligando os pontos, sai a cruz)
  const CRUZEIRO = chave === "CRU" ? `<path d="M13.00 3.00 L13.66 4.89 L15.66 4.93 L14.07 6.15 L14.65 8.07 L13.00 6.92 L11.35 8.07 L11.93 6.15 L10.34 4.93 L12.34 4.89 Z M13.40 17.60 L14.11 19.63 L16.25 19.67 L14.54 20.97 L15.16 23.03 L13.40 21.80 L11.64 23.03 L12.26 20.97 L10.55 19.67 L12.69 19.63 Z M7.40 10.30 L7.99 11.99 L9.78 12.03 L8.35 13.11 L8.87 14.82 L7.40 13.80 L5.93 14.82 L6.45 13.11 L5.02 12.03 L6.81 11.99 Z M18.60 9.80 L19.16 11.42 L20.88 11.46 L19.51 12.50 L20.01 14.14 L18.60 13.16 L17.19 14.14 L17.69 12.50 L16.32 11.46 L18.04 11.42 Z" fill="#FFFFFF"/>` : "";
  // Vasco: a cruz vermelha (de pontas largas) no meio da faixa diagonal
  const CRUZ_VAS = chave === "VAS" ? `<g transform="translate(13 14.4) rotate(-41)"><path d="M-1 -1 L-1.6 -4.4 H1.6 L1 -1 L4.4 -1.6 V1.6 L1 1 L1.6 4.4 H-1.6 L-1 1 L-4.4 1.6 V-1.6 Z" fill="#D0102C" stroke="#7A0A18" stroke-width=".25" stroke-linejoin="round"/></g>` : "";
  // Atlético de Madri: dividido ao meio; embaixo listrado de vermelho e branco, em cima uma árvore azul-marinho
  const ARVORE = chave === "ES-ATM" ? `<rect x="0" y="0" width="26" height="30" fill="#FFFFFF"/>${[0, 2, 4, 6, 8, 10, 12].map((k) => `<rect x="${(k * 26 / 13).toFixed(2)}" y="14" width="${(26 / 13).toFixed(2)}" height="16" fill="#CB3524"/>`).join("")}`
    + `<rect x="0" y="0" width="26" height="14" fill="#FFFFFF"/><g fill="#1B2A5C"><path d="M12.3 13.8 L12.5 9.6 L10.8 8.4 L11.1 8 L12.6 8.9 L12.7 7.6 H13.3 L13.4 8.9 L14.9 8 L15.2 8.4 L13.5 9.6 L13.7 13.8 Z"/><ellipse cx="13" cy="7.2" rx="3.6" ry="2.6"/><circle cx="9.9" cy="8.4" r="1.9"/><circle cx="16.1" cy="8.4" r="1.9"/><circle cx="11.2" cy="6" r="1.7"/><circle cx="14.8" cy="6" r="1.7"/></g>`
    + `<path d="M0 14 H26" stroke="${TINTA}" stroke-width=".9"/>` : "";
  // Galatasaray: dividido ao meio (uma cor de cada lado) com um G branco no centro
  const LETRA_GAL = chave === "TR-GAL" ? `<text x="13" y="21.5" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="17" fill="#FFFFFF" stroke="#0A0A0A" stroke-width=".7" paint-order="stroke">G</text>` : "";
  // Paris FC: todo azul-marinho com a torre Eiffel (a mesma do Paris São Germano) em branco
  const TORRE_PFC = chave === "FR-PFC" ? `<g fill="#FFFFFF"><path d="M13 3.6 L13.7 8 L14.6 12.5 L16.4 19 L19.4 25.6 H16.6 Q15.6 22.4 13 22.4 Q10.4 22.4 9.4 25.6 H6.6 L9.6 19 L11.4 12.5 L12.3 8 Z"/></g><rect x="10.8" y="12.2" width="4.4" height="1.1" fill="#1B2A5B"/><rect x="9.2" y="18.6" width="7.6" height="1.2" fill="#1B2A5B"/>` : "";
  // Sporting Lisboeta: listrado na horizontal com as cores do clube e só a cabeça do leão amarela no centro
  const LEAO_SCP = chave === "PT-SCP" ? `<g fill="#E8A20C" stroke="#0A0A0A" stroke-width=".45"><circle cx="18.20" cy="15.20" r="2"/><circle cx="17.50" cy="17.80" r="2"/><circle cx="15.60" cy="19.70" r="2"/><circle cx="13.00" cy="20.40" r="2"/><circle cx="10.40" cy="19.70" r="2"/><circle cx="8.50" cy="17.80" r="2"/><circle cx="7.80" cy="15.20" r="2"/><circle cx="8.50" cy="12.60" r="2"/><circle cx="10.40" cy="10.70" r="2"/><circle cx="13.00" cy="10.00" r="2"/><circle cx="15.60" cy="10.70" r="2"/><circle cx="17.50" cy="12.60" r="2"/></g><circle cx="13" cy="15.2" r="5.4" fill="#E8A20C"/>`
    + `<circle cx="10.4" cy="12.1" r="1.1" fill="#FFD43B" stroke="#0A0A0A" stroke-width=".4"/><circle cx="15.6" cy="12.1" r="1.1" fill="#FFD43B" stroke="#0A0A0A" stroke-width=".4"/>`
    + `<ellipse cx="13" cy="15.6" rx="3.7" ry="4" fill="#FFD43B" stroke="#0A0A0A" stroke-width=".45"/><ellipse cx="13" cy="17.6" rx="2" ry="1.4" fill="#FFF3C4"/>`
    + `<path d="M10.8 14.4 Q11.5 13.9 12.1 14.4 M13.9 14.4 Q14.5 13.9 15.2 14.4" fill="none" stroke="#0A0A0A" stroke-width=".55" stroke-linecap="round"/><path d="M12.2 16.6 H13.8 L13 17.5 Z" fill="#0A0A0A"/>`
    + `<path d="M13 17.5 V18.2 M12 18.5 Q13 19.1 14 18.5" fill="none" stroke="#0A0A0A" stroke-width=".38" stroke-linecap="round"/>` : "";
  // Atalanta (Bérgamo): a cabeça de uma mulher de perfil, toda branca, no centro do escudo
  const MULHER_ATA = chave === "IT-ATA" ? `<path d="M11.4 8.6 C12.6 7.6 15.6 7.4 17.2 8.8 C18.8 8.6 20.2 9.8 19.8 11.4 C19.6 12.6 18.4 13 17.6 12.8 C17.8 14.6 17.4 16.4 16.4 17.6 L16.8 21.4 L12 21.4 L12.4 19 C11.6 18.8 10.8 18.6 10.6 17.8 L10.4 17.2 L9.8 16.9 L10.3 16.5 L9.8 16.1 L10.2 15.6 L9.2 14.4 L10.2 13.2 C10.2 11.2 10.4 9.6 11.4 8.6 Z" fill="#FFFFFF" stroke="#0A0A0A" stroke-width=".5" stroke-linejoin="round"/>` : "";
  // clubes da Red Boi: os dois touros com o sol no meio do escudo, numa placa clara para aparecer em qualquer cor
  const RED_BOI = ["RBB", "DE-RBL", "US-NYR", "AT-SAL"].includes(chave) ? `<ellipse cx="13" cy="15.2" rx="11" ry="6.8" fill="#FFFFFF" stroke="${TINTA}" stroke-width=".5"/><g transform="translate(2.5 10.2) scale(.21)">${emblemaTouros("#E1001A", "#F2C200")}</g>` : "";
  // Leverkusen: o 04 branco no centro do escudo (no lugar da letra)
  const NUM_B04 = chave === "DE-B04" ? `<text x="13" y="20.6" text-anchor="middle" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" stroke="#0A0A0A" stroke-width=".7" paint-order="stroke">04</text>` : "";
  const detalhe = NUM_B04 + RED_BOI + MULHER_ATA + LEAO_SCP + TORRE_PFC + LETRA_GAL + CRUZ_VAS + CRUZEIRO + ESTRELA + COROA + LETRA_FLU + YNWA + LEAO + GALO + (DETALHE[chave] ? `<path d="${d}" transform="translate(13 15) scale(.9) translate(-13 -15)" fill="none" stroke="${DETALHE[chave]}" stroke-width="1.1"/>` : "");
  return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><path d="${d}" fill="${c1}"/><g clip-path="url(#${id})">${chave === "EN-MCI" ? LISTRAS_MCI(c1) : chave === "FOR" || chave === "FLU" || chave === "TR-GAL" ? DESENHOS[3](c1, c2, "") : chave === "EN-TOT" || chave === "BOT" || chave === "CRU" || chave === "FR-PFC" ? "" : chave === "PT-SCP" ? [0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<rect x="0" y="${(k * 30 / 8).toFixed(2)}" width="26" height="${(30 / 8).toFixed(2)}" fill="${k % 2 ? c2 : c1}"/>`).join("") : DESENHOS[desenho](c1, c2, RED_BOI || NUM_B04 ? "" : inicial(nome))}${CATALUNHA}${ARVORE}</g>${detalhe}<path d="${d}" fill="none" stroke="${chave === "FOR" ? "#FFFFFF" : TINTA}" stroke-width="${borda}" stroke-linejoin="round"/>`;
}
/** Escudo pequeno, como elemento solto na página. */
export function svgEscudo(chave: string, c1: string, c2?: string, nome?: string, cls = "escudo"): string {
  return `<svg class="${cls}" viewBox="0 0 26 30" aria-hidden="true">${corpoEscudo(chave, c1, c2, nome)}</svg>`;
}
