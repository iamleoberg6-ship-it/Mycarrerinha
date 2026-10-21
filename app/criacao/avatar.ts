// Avatar 2D montado por partes. O cabelo é desenhado a partir das medidas de cada formato de cabeça,
// então todo corte encaixa em todo rosto. A camisa pode ter o padrão do clube do coração.
export type Rosto = "oval" | "redondo" | "quadrado";
export type Cabelo = "raspado" | "curto" | "topete" | "cacheado" | "blackpower" | "trancas" | "moicano" | "longo";
export type EstiloCamisa = "lisa" | "listrasV" | "listrasH" | "faixa" | "faixaH";
export interface Camisa { cor1: string; cor2: string; cor3?: string; estilo: EstiloCamisa }

export interface Aparencia {
  pele: number;
  rosto: Rosto;
  cabelo: Cabelo;
  corCabelo: number;
  olhos: number;
  sobrancelha: number;
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
export const APARENCIA_PADRAO: Aparencia = { pele: 2, rosto: "oval", cabelo: "curto", corCabelo: 0, olhos: 0, sobrancelha: 3 };
export const CAMISA_PADRAO: Camisa = { cor1: "#8C9A94", cor2: "#6F7C77", estilo: "lisa" };

export function escurecer(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `#${((1 << 24) | (c((n >> 16) & 255) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).slice(1)}`;
}
const luminancia = (hex: string) => { const n = parseInt(hex.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

/** Medidas de cada formato: lados (L, R), topo (T) e centro vertical do rosto (cy). */
interface Medidas { L: number; R: number; T: number; cy: number; quina?: boolean }
const MEDIDAS: Record<Rosto, Medidas> = {
  oval: { L: 56, R: 144, T: 45, cy: 100 },
  redondo: { L: 51, R: 149, T: 51, cy: 102 },
  quadrado: { L: 56, R: 144, T: 46, cy: 100, quina: true },
};

function cabeca(rosto: Rosto, fill: string): string {
  if (rosto === "redondo") return `<ellipse cx="100" cy="102" rx="49" ry="51" fill="${fill}"/>`;
  if (rosto === "quadrado") return `<path d="M56 70 Q56 46 80 46 L120 46 Q144 46 144 70 L144 124 Q144 154 100 156 Q56 154 56 124 Z" fill="${fill}"/>`;
  return `<ellipse cx="100" cy="100" rx="44" ry="55" fill="${fill}"/>`;
}

const f1 = (n: number) => n.toFixed(1);
/** Calota de cabelo que acompanha o contorno do topo da cabeça. */
function calota(m: Medidas, desce = 50, recuo = 16, sobe = 6): string {
  const w = m.R - m.L, cx = (m.L + m.R) / 2, T = m.T;
  // cabeça quadrada: as alças vão até os cantos para cobrir as quinas do topo
  const [ax, ay, bx] = m.quina ? [m.L - 4, T - 6, cx - w * 0.46] : [m.L - 2, T + 8, cx - w * 0.3];
  const [cx2] = m.quina ? [cx + w * 0.46] : [cx + w * 0.3];
  const dx = m.quina ? m.R + 4 : m.R + 2, dy = m.quina ? T - 6 : T + 8;
  return `M${m.L} ${T + desce} C${ax} ${ay} ${f1(bx)} ${T - sobe} ${cx} ${T - sobe} C${f1(cx2)} ${T - sobe} ${dx} ${dy} ${m.R} ${T + desce} C${m.R - 6} ${T + 28} ${f1(cx + w * 0.27)} ${T + recuo} ${cx} ${T + recuo} C${f1(cx - w * 0.27)} ${T + recuo} ${m.L + 6} ${T + 28} ${m.L} ${T + desce} Z`;
}

function cabeloAtras(c: Cabelo, m: Medidas, cor: string): string {
  const cx = (m.L + m.R) / 2, w = m.R - m.L, T = m.T;
  if (c === "blackpower") return `<circle cx="${cx}" cy="${T + 38}" r="${w / 2 + 22}" fill="${cor}"/>`;
  if (c === "longo") return `<path d="M${m.L - 8} ${T + 55} C${m.L - 12} ${T + 2} ${cx - 30} ${T - 14} ${cx} ${T - 14} C${cx + 30} ${T - 14} ${m.R + 12} ${T + 2} ${m.R + 8} ${T + 55} L${m.R + 12} 174 L${m.L - 12} 174 Z" fill="${cor}"/>`;
  return "";
}

function cabeloFrente(c: Cabelo, m: Medidas, cor: string): string {
  const sombra = escurecer(cor, 0.7), cx = (m.L + m.R) / 2, w = m.R - m.L, T = m.T;
  switch (c) {
    case "raspado":
      return `<path d="${calota({ ...m, L: m.L + 1, R: m.R - 1 }, 44, 20, 1)}" fill="${cor}" opacity="0.5"/>`;
    case "curto":
      return `<path d="${calota(m)}" fill="${cor}"/>`;
    case "topete":
      return `<path d="${calota(m)}" fill="${cor}"/><path d="M${cx - 30} ${T + 14} C${cx - 22} ${T - 22} ${cx + 26} ${T - 24} ${cx + 34} ${T + 10} C${cx + 18} ${T + 2} ${cx - 12} ${T + 2} ${cx - 30} ${T + 14} Z" fill="${cor}"/>`;
    case "cacheado": {
      let s = `<path d="${calota(m)}" fill="${cor}"/>`;
      const rx = w / 2 + 2, ry = 46;
      for (let i = 0; i <= 11; i++) {
        const a = Math.PI * (0.04 + (0.92 * i) / 11);
        s += `<circle cx="${f1(cx - rx * Math.cos(a))}" cy="${f1(T + 44 - ry * Math.sin(a))}" r="10" fill="${cor}"/>`;
      }
      return s;
    }
    case "blackpower":
      return `<path d="${calota(m, 40, 22, -2)}" fill="${sombra}" opacity="0.4"/>`;
    case "trancas": {
      let s = `<path d="${calota(m)}" fill="${cor}"/>`;
      for (const k of [-0.32, -0.16, 0, 0.16, 0.32]) {
        const x = cx + k * w;
        s += `<path d="M${f1(x)} ${T + 16} L${f1(x + k * 22)} ${T - 2}" stroke="${sombra}" stroke-width="3" stroke-linecap="round"/>`;
      }
      return s;
    }
    case "moicano":
      return `<path d="${calota({ ...m, L: m.L + 1, R: m.R - 1 }, 44, 20, 1)}" fill="${cor}" opacity="0.3"/><path d="M${cx - 10} ${T - 18} Q${cx} ${T - 26} ${cx + 10} ${T - 18} L${cx + 13} ${T + 22} L${cx - 13} ${T + 22} Z" fill="${cor}"/>`;
    case "longo":
      return `<path d="${calota(m)}" fill="${cor}"/><path d="M${m.L + 2} ${T + 48} C${m.L + 2} ${T + 26} ${m.L + 14} ${T + 12} ${cx - 12} ${T + 10} C${m.L + 22} ${T + 22} ${m.L + 14} ${T + 34} ${m.L + 14} ${T + 52} Z" fill="${cor}"/>`;
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

export interface OpcoesFoto {
  aparencia: Aparencia | null; // null = silhueta (ainda sem aparência escolhida)
  camisa?: Camisa;
  numero?: string;
  cenario?: string; // elementos SVG do fundo, no mesmo viewBox
}

export function svgFoto(o: OpcoesFoto): string {
  const a = o.aparencia ?? APARENCIA_PADRAO;
  const silhueta = !o.aparencia;
  const m = MEDIDAS[a.rosto];
  const pele = silhueta ? "#1E2E28" : PELES[a.pele];
  const sombraPele = silhueta ? "#1A2823" : escurecer(pele, 0.78);
  const cor = silhueta ? "#16241F" : CORES_CABELO[a.corCabelo];
  const camisa = silhueta ? { cor1: "#1E2E28", cor2: "#1E2E28", estilo: "lisa" as const } : (o.camisa ?? CAMISA_PADRAO);
  const corNumero = luminancia(camisa.cor1) < 0.45 ? "#F2E6C2" : escurecer(camisa.cor1, 0.55);
  const rosto = silhueta ? "" : `
  <path d="M71 91 Q82 ${f1(88 - a.sobrancelha * 0.4)} 93 90" stroke="${cor}" stroke-width="${a.sobrancelha}" stroke-linecap="round" fill="none"/>
  <path d="M107 90 Q118 ${f1(88 - a.sobrancelha * 0.4)} 129 91" stroke="${cor}" stroke-width="${a.sobrancelha}" stroke-linecap="round" fill="none"/>
  <ellipse cx="82" cy="103" rx="8.5" ry="5.5" fill="#F7F3EC"/><ellipse cx="118" cy="103" rx="8.5" ry="5.5" fill="#F7F3EC"/>
  <circle cx="83" cy="103" r="4.2" fill="${CORES_OLHOS[a.olhos]}"/><circle cx="119" cy="103" r="4.2" fill="${CORES_OLHOS[a.olhos]}"/>
  <circle cx="83" cy="103" r="1.8" fill="#0B0B0B"/><circle cx="119" cy="103" r="1.8" fill="#0B0B0B"/>
  <path d="M100 108 Q95 121 99 123 Q103 124 106 121" stroke="${sombraPele}" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <path d="M88 135 Q100 142 112 135" stroke="${escurecer(pele, 0.6)}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  return `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto de perfil do jogador">
  ${o.cenario ?? ""}
  <g${silhueta ? ' opacity="0.92"' : ""}>
  ${cabeloAtras(a.cabelo, m, cor)}
  <rect x="84" y="138" width="32" height="36" rx="10" fill="${sombraPele}"/>
  ${camisaSVG(camisa)}
  <path d="M84 168 L100 184 L116 168 Z" fill="${escurecer(camisa.cor1, 0.75)}"/>
  ${o.numero && !silhueta ? `<text x="100" y="214" text-anchor="middle" font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif" font-weight="800" font-size="22" fill="${corNumero}">${o.numero}</text>` : ""}
  <ellipse cx="${m.L}" cy="${m.cy + 6}" rx="8" ry="12" fill="${sombraPele}"/>
  <ellipse cx="${m.R}" cy="${m.cy + 6}" rx="8" ry="12" fill="${sombraPele}"/>
  ${cabeca(a.rosto, pele)}
  ${cabeloFrente(a.cabelo, m, cor)}
  ${rosto}
  ${silhueta ? `<text x="100" y="112" text-anchor="middle" font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif" font-weight="900" font-size="36" fill="#3A5148">?</text>` : ""}
  </g>
</svg>`;
}
