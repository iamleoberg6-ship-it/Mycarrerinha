// Camisa vista de costas, para o armário de camisas do perfil: cores e padrão do clube, nome e número.
// Mesmo acabamento do personagem (degradê suave, sem contorno grosso). Apagada = a que ainda falta.
import { fonteCamisa, attrFonte } from "./fontes-camisa";
let seq = 0;
const f1 = (n: number) => Math.round(n * 10) / 10;

function hex(c: string): [number, number, number] { return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) || 0) as [number, number, number]; }
function mistura(a: string, b: string, t: number) {
  const x = hex(a), y = hex(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const luz = (c: string) => { const [r, g, b] = hex(c); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

const CORPO = "M30 8 C36 12 44 12 50 8 L66 13 L79 33 L68 41 L63 33 L63 92 C49 95 31 95 17 92 L17 33 L12 41 L1 33 L14 13 Z";

function padrao(modelo: string, c2: string): string {
  switch (modelo) {
    case "listrasV": return Array.from({ length: 6 }, (_, i) => `<rect x="${8 + i * 12}" y="0" width="6" height="100" fill="${c2}"/>`).join("");
    case "listrasH": return Array.from({ length: 7 }, (_, i) => `<rect x="0" y="${22 + i * 11}" width="80" height="5.5" fill="${c2}"/>`).join("");
    case "faixa": return `<path d="M10 12 L24 8 L70 92 L56 96 Z" fill="${c2}"/>`;
    case "faixaH": return `<rect x="0" y="44" width="80" height="14" fill="${c2}"/>`;
    case "metade": return `<rect x="40" y="0" width="40" height="100" fill="${c2}"/>`;
    case "centro": return `<rect x="0" y="0" width="22" height="100" fill="${c2}"/><rect x="58" y="0" width="22" height="100" fill="${c2}"/>`;
    default: return "";
  }
}

export interface DadosCamisa { cores: [string, string]; modelo: string; numero?: string; /** clube (id ou nome): escolhe a fonte de nome e número */ chave?: string }

/** SVG (viewBox 0 0 80 104) da camisa pendurada, de costas, com nome e número. */
export function camisaCostas(c: DadosCamisa, nome: string, apagada = false): string {
  const id = `cm${(seq++).toString(36)}`;
  if (apagada) {
    return `<svg viewBox="0 0 80 104" aria-hidden="true"><path d="M40 2 V7" stroke="#4a5a52" stroke-width="2"/><path d="${CORPO}" fill="#1c2d26" stroke="#3a4c44" stroke-width="1.4" stroke-dasharray="3 3"/>`
      + `<text x="40" y="62" text-anchor="middle" font-family="'Big Shoulders Display',sans-serif" font-weight="900" font-size="26" fill="#3a4c44">?</text></svg>`;
  }
  const [a, b0] = c.cores, b = b0 && b0.toLowerCase() !== a.toLowerCase() ? b0 : luz(a) > 0.6 ? "#1A1A1A" : "#FFFFFF";
  // nome e número com a cor que mais contrasta com a cor principal
  const tinta = c.modelo === "listrasV" || c.modelo === "listrasH" || c.modelo === "centro"
    ? (luz(a) > 0.55 && luz(b) > 0.55 ? "#1A1A1A" : "#FFFFFF")
    : luz(a) > 0.55 ? (luz(b) < 0.45 ? b : "#1A1A1A") : (luz(b) > 0.55 ? b : "#FFFFFF");
  const borda = luz(tinta) > 0.5 ? mistura(a, "#000000", 0.55) : mistura(a, "#FFFFFF", 0.6);
  const sobrenome = (nome.trim().split(/\s+/).pop() ?? "").toUpperCase().slice(0, 11);
  const fonte = fonteCamisa(c.chave ?? `${c.cores.join("")}${c.modelo}`);
  const fs = Math.min(9, 40 / Math.max(1, sobrenome.length * 0.66 * fonte.escala));
  return `<svg viewBox="0 0 80 104" aria-hidden="true"><defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
    <clipPath id="${id}c"><path d="${CORPO}"/></clipPath></defs>
    <path d="M40 1 C44 1 45 5 41 7 L40 8 M33 9 L40 5 L47 9" stroke="#9aa5a0" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="${CORPO}" fill="${a}"/>
    <g clip-path="url(#${id}c)">${padrao(c.modelo, b)}
      <rect width="80" height="104" fill="url(#${id}g)"/><rect width="80" height="104" fill="url(#${id}l)"/>
      <path d="M1.5 34 L12 41.5 M68 41.5 L78.5 34" stroke="${b}" stroke-width="3" fill="none" opacity=".9"/>
      <path d="M30 8 C36 12 44 12 50 8" stroke="${b}" stroke-width="3.2" fill="none"/>
      <path d="M17 33 C20 50 19 70 17 92 M63 33 C60 50 61 70 63 92" stroke="#000" stroke-opacity=".12" stroke-width="1.2" fill="none"/>
    </g>
    ${sobrenome ? `<text ${attrFonte(fonte, fs, true)} x="40" y="35" text-anchor="middle" fill="${tinta}" stroke="${borda}" stroke-width=".5" paint-order="stroke">${sobrenome}</text>` : ""}
    ${c.numero ? `<text x="40" y="${f1(sobrenome ? 74 : 70)}" text-anchor="middle" ${attrFonte(fonte, c.numero.length > 2 ? 24 : 32)} fill="${tinta}" stroke="${borda}" stroke-width="1" paint-order="stroke">${c.numero}</text>` : ""}
  </svg>`;
}
