// Avatar 2D montado por partes. Gera um SVG a partir das escolhas.
export type Rosto = "oval" | "redondo" | "quadrado";
export type Cabelo = "raspado" | "curto" | "topete" | "cacheado" | "blackpower" | "trancas" | "moicano" | "longo";

export interface Aparencia {
  pele: number; // índice em PELES
  rosto: Rosto;
  cabelo: Cabelo;
  corCabelo: number; // índice em CORES_CABELO
  olhos: number; // índice em CORES_OLHOS
  sobrancelha: number; // 2–5 (espessura)
  camisa: string; // cor da camisa
}

export const PELES = ["#F6D3B5", "#E8B48F", "#C98C63", "#A66A43", "#7A4A2C", "#4E2E1C"];
export const CORES_CABELO = ["#1C1712", "#4B2E1F", "#8A5A2B", "#C9A24D", "#9C4422", "#E9E4D8"];
export const NOMES_CABELO_COR = ["Preto", "Castanho escuro", "Castanho claro", "Loiro", "Ruivo", "Platinado"];
export const CORES_OLHOS = ["#3B2416", "#6B4423", "#4F6B3A", "#3E6A8C", "#2A2A2A"];
export const NOMES_OLHOS = ["Castanho escuro", "Mel", "Verde", "Azul", "Preto"];
export const ROSTOS: { id: Rosto; nome: string }[] = [
  { id: "oval", nome: "Oval" }, { id: "redondo", nome: "Redondo" }, { id: "quadrado", nome: "Quadrado" },
];
export const CABELOS: { id: Cabelo; nome: string }[] = [
  { id: "raspado", nome: "Raspado" }, { id: "curto", nome: "Curto" }, { id: "topete", nome: "Topete" },
  { id: "cacheado", nome: "Cacheado" }, { id: "blackpower", nome: "Black power" }, { id: "trancas", nome: "Tranças" },
  { id: "moicano", nome: "Moicano" }, { id: "longo", nome: "Longo" },
];

export const APARENCIA_PADRAO: Aparencia = { pele: 2, rosto: "oval", cabelo: "curto", corCabelo: 0, olhos: 0, sobrancelha: 3, camisa: "#E3B341" };

function escurecer(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function cabeca(rosto: Rosto, fill: string): string {
  if (rosto === "redondo") return `<ellipse cx="100" cy="102" rx="49" ry="51" fill="${fill}"/>`;
  if (rosto === "quadrado") return `<path d="M56 70 Q56 48 80 46 L120 46 Q144 48 144 70 L144 124 Q144 154 100 156 Q56 154 56 124 Z" fill="${fill}"/>`;
  return `<ellipse cx="100" cy="100" rx="44" ry="55" fill="${fill}"/>`;
}

const CAP = "M56 96 C54 56 76 40 100 40 C124 40 146 56 144 96 C138 74 124 62 100 62 C76 62 62 74 56 96 Z";
const CAP_RASPADO = "M58 90 C58 60 78 47 100 47 C122 47 142 60 142 90 C134 72 120 63 100 63 C80 63 66 72 58 90 Z";

function cabeloAtras(c: Cabelo, cor: string): string {
  if (c === "blackpower") return `<circle cx="100" cy="80" r="64" fill="${cor}"/>`;
  if (c === "longo") return `<path d="M46 100 C42 48 74 30 100 30 C126 30 158 48 154 100 L158 172 L42 172 Z" fill="${cor}"/>`;
  return "";
}

function cabeloFrente(c: Cabelo, cor: string): string {
  const sombra = escurecer(cor, 0.7);
  switch (c) {
    case "raspado":
      return `<path d="${CAP_RASPADO}" fill="${cor}" opacity="0.55"/>`;
    case "curto":
      return `<path d="${CAP}" fill="${cor}"/>`;
    case "topete":
      return `<path d="${CAP}" fill="${cor}"/><path d="M72 56 C80 26 124 24 132 52 C118 44 94 44 72 56 Z" fill="${cor}"/>`;
    case "cacheado": {
      let s = `<path d="${CAP}" fill="${cor}"/>`;
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI * (0.05 + (0.9 * i) / 10);
        const x = 100 - 48 * Math.cos(a), y = 82 - 40 * Math.sin(a);
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${cor}"/>`;
      }
      return s;
    }
    case "blackpower":
      return `<path d="M58 84 C66 66 82 60 100 60 C118 60 134 66 142 84 C134 76 118 72 100 72 C82 72 66 76 58 84 Z" fill="${sombra}" opacity="0.35"/>`;
    case "trancas": {
      let s = `<path d="${CAP}" fill="${cor}"/>`;
      for (const x of [72, 86, 100, 114, 128]) s += `<path d="M${x} 62 L${x + (x - 100) * 0.25} 42" stroke="${sombra}" stroke-width="3" stroke-linecap="round"/>`;
      return s;
    }
    case "moicano":
      return `<path d="${CAP_RASPADO}" fill="${cor}" opacity="0.35"/><path d="M90 26 Q100 20 110 26 L113 68 L87 68 Z" fill="${cor}"/>`;
    case "longo":
      return `<path d="${CAP}" fill="${cor}"/><path d="M58 92 C58 72 70 58 88 56 C76 66 70 78 70 96 Z" fill="${cor}"/>`;
  }
}

export function svgAvatar(a: Aparencia, numero?: string): string {
  const pele = PELES[a.pele], sombraPele = escurecer(pele, 0.78), cor = CORES_CABELO[a.corCabelo], olho = CORES_OLHOS[a.olhos];
  const camisaSombra = escurecer(a.camisa, 0.72);
  return `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar do jogador">
  ${cabeloAtras(a.cabelo, cor)}
  <rect x="84" y="138" width="32" height="36" rx="10" fill="${sombraPele}"/>
  <path d="M28 222 C32 184 58 168 100 168 C142 168 168 184 172 222 Z" fill="${a.camisa}"/>
  <path d="M82 168 L100 188 L118 168 Z" fill="${camisaSombra}"/>
  ${numero ? `<text x="100" y="212" text-anchor="middle" font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif" font-weight="800" font-size="22" fill="${parseInt(a.camisa.slice(1), 16) < 0x808080 ? "#E3B341" : camisaSombra}">${numero}</text>` : ""}
  <ellipse cx="56" cy="106" rx="8" ry="12" fill="${sombraPele}"/>
  <ellipse cx="144" cy="106" rx="8" ry="12" fill="${sombraPele}"/>
  ${cabeca(a.rosto, pele)}
  ${cabeloFrente(a.cabelo, cor)}
  <path d="M71 91 Q82 ${88 - a.sobrancelha * 0.4} 93 90" stroke="${cor}" stroke-width="${a.sobrancelha}" stroke-linecap="round" fill="none"/>
  <path d="M107 90 Q118 ${88 - a.sobrancelha * 0.4} 129 91" stroke="${cor}" stroke-width="${a.sobrancelha}" stroke-linecap="round" fill="none"/>
  <ellipse cx="82" cy="103" rx="8.5" ry="5.5" fill="#F7F3EC"/><ellipse cx="118" cy="103" rx="8.5" ry="5.5" fill="#F7F3EC"/>
  <circle cx="83" cy="103" r="4.2" fill="${olho}"/><circle cx="119" cy="103" r="4.2" fill="${olho}"/>
  <circle cx="83" cy="103" r="1.8" fill="#0B0B0B"/><circle cx="119" cy="103" r="1.8" fill="#0B0B0B"/>
  <path d="M100 108 Q95 121 99 123 Q103 124 106 121" stroke="${sombraPele}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M88 135 Q100 142 112 135" stroke="${escurecer(pele, 0.6)}" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`;
}
