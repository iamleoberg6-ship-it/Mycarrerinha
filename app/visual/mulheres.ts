// Retratos prontos das mulheres do app de namoro, no estilo de arte do jogo (traço de quadrinho, contorno escuro).
// Não é personalização: é um pacote fixo de mulheres (rosto, cabelo, maquiagem, brincos), sempre o mesmo para a mesma
// pessoa. A roupa acompanha a profissão (personal de top de academia, advogada de blazer, médica de jaleco...).
import { RNG } from "../../src/rng.js";

const TINTA = "#2A1A12", TRACO = 1.9;
let seq = 0;
const novoId = (p: string) => `${p}${++seq}`;
function mistura(a: string, b: string, t: number): string {
  const h = (x: string) => { const y = x.length === 4 ? `#${x[1]}${x[1]}${x[2]}${x[2]}${x[3]}${x[3]}` : x; return [1, 3, 5].map((i) => parseInt(y.slice(i, i + 2), 16)); };
  const [x, y] = [h(a), h(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

export const PELES_F = ["#F9DFCB", "#F2C9A6", "#E5AE86", "#CF9468", "#B2754C", "#8E5A38", "#6E4228", "#4E2E1C"];
export const CABELOS_F = ["#120E0B", "#2C1B12", "#4A2C1A", "#6E4325", "#A06A35", "#D6B067", "#EBD9A8", "#8E2F1A", "#B44A2A", "#5B2340"];
const OLHOS_F = ["#3B2416", "#5E3B1E", "#8A6A2E", "#4E7A43", "#3E6E99", "#6E8C9E"];
const BATONS = ["#B8323C", "#C4465A", "#9E3346", "#D46A6A", "#B5655B", "#7A2235", "#D9827B", "#E0567A"];
const ROUPAS = ["#111216", "#F2F0EA", "#B8323C", "#2E4A7A", "#3E6B4A", "#E07A9A", "#C9A24D", "#6E4AA0", "#1F8A8A", "#E07A3F"];
const FUNDOS: [string, string][] = [["#FF9A8B", "#FF6A88"], ["#7F7FD5", "#86A8E7"], ["#F6D365", "#FDA085"], ["#84FAB0", "#8FD3F4"], ["#A18CD1", "#FBC2EB"],
  ["#FAD0C4", "#FFD1FF"], ["#30CFD0", "#330867"], ["#F093FB", "#F5576C"], ["#4FACFE", "#00F2FE"], ["#43E97B", "#38F9D7"], ["#FA709A", "#FEE140"], ["#2B5876", "#4E4376"]];

export type CabeloF = "liso" | "ondulado" | "cacheado" | "blackpower" | "coque" | "rabo" | "chanel" | "trancas" | "franja" | "curtinho";
export type OlhoF = "amendoado" | "gatinho" | "redondo" | "semdobra";
export type BocaF = "sorriso" | "sorrisao" | "canto" | "beicinho";
export type RoupaF = "alcinha" | "ombro" | "academia" | "blazer" | "jaleco" | "couro" | "vestido" | "golaAlta" | "regata" | "camisa";
export type BrincoF = "nenhum" | "argola" | "ponto" | "pendente";
export interface Mulher {
  pele: number; cabelo: CabeloF; corCabelo: number; olho: OlhoF; corOlho: number; boca: BocaF; batom: number;
  rosto: number; brinco: BrincoF; colar: boolean; pinta: boolean; sardas: boolean; delineado: boolean; fundo: number; corRoupa: number;
}

/** Roupa que combina com a profissão (sorteada entre as opções dela). */
const ROUPA_PROF: Record<string, RoupaF[]> = {
  influencer: ["ombro", "alcinha", "vestido", "couro"], psicologa: ["golaAlta", "camisa", "blazer"], agente: ["blazer", "camisa"], modelo: ["ombro", "vestido", "alcinha", "couro"],
  medica: ["jaleco"], jornalista: ["blazer", "camisa", "golaAlta"], personal: ["academia"], nutricionista: ["regata", "academia", "camisa"], advogada: ["blazer", "camisa"],
  professora: ["golaAlta", "camisa", "regata"], estudante: ["regata", "couro", "alcinha", "ombro"], arquiteta: ["golaAlta", "blazer", "camisa"],
};

// ------------------------------------------------------------------ pacote fixo
const CABELOS_LISTA: CabeloF[] = ["liso", "ondulado", "cacheado", "blackpower", "coque", "rabo", "chanel", "trancas", "franja", "curtinho"];
/** O pacote: 60 mulheres prontas, sempre as mesmas (combinações escolhidas para ficarem bonitas juntas). */
export const PACOTE_MULHERES: Mulher[] = (() => {
  const r = new RNG("pacote-mulheres-v1"), out: Mulher[] = [];
  for (let i = 0; i < 60; i++) {
    const pele = i % PELES_F.length;
    // cabelo combina com a pele: crespo, cacheado e tranças mais comuns em pele escura; loiro e ruivo mais em pele clara
    const escura = pele >= 5, clara = pele <= 1;
    const cabelo: CabeloF = escura ? r.pick(["blackpower", "trancas", "cacheado", "liso", "coque", "rabo", "ondulado", "curtinho"]) : r.pick(CABELOS_LISTA.filter((c) => c !== "blackpower" && c !== "trancas"));
    const corCabelo = escura ? r.pick([0, 0, 1, 1, 2, 9, 4]) : clara ? r.pick([0, 2, 3, 4, 5, 6, 7, 8, 1]) : r.pick([0, 1, 1, 2, 3, 4, 8, 9]);
    out.push({
      pele, cabelo, corCabelo, olho: r.pick(pele <= 2 && i % 7 === 3 ? ["semdobra"] as OlhoF[] : ["amendoado", "gatinho", "redondo", "amendoado", "gatinho"]),
      corOlho: clara ? r.int(0, OLHOS_F.length - 1) : r.pick([0, 0, 1, 1, 2, 3]), boca: r.pick(["sorriso", "sorrisao", "canto", "beicinho", "sorriso"]),
      batom: r.int(0, BATONS.length - 1), rosto: r.int(0, 2), brinco: r.pick(["argola", "ponto", "pendente", "nenhum", "argola"]), colar: r.chance(0.55),
      pinta: r.chance(0.25), sardas: clara && r.chance(0.35), delineado: r.chance(0.6), fundo: i % FUNDOS.length, corRoupa: r.int(0, ROUPAS.length - 1),
    });
  }
  return out;
})();
const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** A mulher do pacote de um perfil do app (sempre a mesma para o mesmo perfil). */
export const mulherDoPerfil = (id: string) => PACOTE_MULHERES[hash(id) % PACOTE_MULHERES.length];
export const roupaDaProfissao = (id: string, profissao: string): RoupaF => { const l = ROUPA_PROF[profissao] ?? ["regata"]; return l[hash(`${id}|roupa`) % l.length]; };

// ------------------------------------------------------------------ desenho (300 × 360)
const ROSTOS = [
  "M150 70 C186 70 203 98 202 136 C201 170 182 198 150 210 C118 198 99 170 98 136 C97 98 114 70 150 70 Z", // oval
  "M150 70 C188 70 205 100 203 134 C201 164 186 190 150 210 C114 190 99 164 97 134 C95 100 112 70 150 70 Z", // coração
  "M150 72 C188 72 204 102 203 140 C202 172 184 200 150 208 C116 200 98 172 97 140 C96 102 112 72 150 72 Z", // redondo
];
const OMBROS = "M24 360 C28 304 78 268 128 250 L172 250 C222 268 272 304 276 360 Z";
const PESCOCO = "M134 190 L131 254 L169 254 L166 190 Z";

function cabeloAtras(c: CabeloF, cor: string, esc: string): string {
  const f = (d: string) => `<path d="${d}" fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>`;
  switch (c) {
    case "liso": return f("M90 128 C84 210 82 290 86 352 L214 352 C218 290 216 210 210 128 C204 40 96 40 90 128 Z") + `<path d="M120 200 L116 340 M180 200 L184 340" stroke="${esc}" stroke-width="3" opacity=".5"/>`;
    case "ondulado": return f("M90 124 C76 170 96 200 82 240 C70 280 94 300 84 350 L216 350 C206 300 230 280 218 240 C204 200 224 170 210 124 C202 40 98 40 90 124 Z");
    case "cacheado": return [[100, 120, 30], [200, 120, 30], [90, 170, 30], [210, 170, 30], [92, 222, 30], [208, 222, 30], [100, 270, 28], [200, 270, 28], [150, 80, 40], [112, 86, 30], [188, 86, 30]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}"/>`).join("") + `<path d="M80 160 L80 280 L220 280 L220 160 Z" fill="${cor}"/>`;
    case "blackpower": return `<circle cx="150" cy="126" r="86" fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<circle cx="${150 + 70 * Math.cos(i * 0.8)}" cy="${126 + 66 * Math.sin(i * 0.8)}" r="6" fill="${esc}" opacity=".35"/>`).join("");
    case "trancas": return f("M92 126 C84 210 86 290 90 352 L210 352 C214 290 216 210 208 126 C200 40 100 40 92 126 Z") + Array.from({ length: 9 }, (_, i) => `<path d="M${96 + i * 13.5} 150 L${96 + i * 13.5} 350" stroke="${esc}" stroke-width="2.2" stroke-dasharray="7 4" opacity=".75"/>`).join("");
    case "chanel": return f("M92 124 C86 160 88 196 92 214 L208 214 C212 196 214 160 208 124 C200 40 100 40 92 124 Z");
    case "rabo": return f("M196 110 C232 130 236 210 222 270 C214 300 200 310 196 300 C210 250 210 170 190 130 Z");
    case "coque": return `<circle cx="150" cy="56" r="26" fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}"/><path d="M134 56 Q150 44 166 56" stroke="${esc}" stroke-width="3" fill="none" opacity=".6"/>`;
    case "franja": return f("M90 126 C84 200 86 270 92 330 L208 330 C214 270 216 200 210 126 C204 40 96 40 90 126 Z");
    case "curtinho": return "";
  }
}
function cabeloFrente(c: CabeloF, cor: string, esc: string, luz: string): string {
  const f = (d: string) => `<path d="${d}" fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>`;
  const brilho = `<path d="M120 84 Q142 72 168 80" stroke="${luz}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>`;
  // risca lateral: o cabelo cai mais de um lado do rosto
  const risca = f("M96 150 C86 34 214 30 206 150 C200 112 188 92 166 86 C150 104 122 98 104 116 C100 126 97 138 96 150 Z");
  switch (c) {
    case "liso": return risca + f("M96 140 C92 200 98 260 106 300 L118 296 C110 250 108 190 112 150 Z") + f("M204 140 C208 200 202 260 194 300 L182 296 C190 250 192 190 188 150 Z") + brilho;
    case "ondulado": return risca + f("M96 140 C86 180 104 210 94 250 C88 280 104 300 108 312 L120 300 C112 270 118 240 112 210 C108 180 116 160 112 150 Z") + f("M204 140 C214 180 196 210 206 250 C212 280 196 300 192 312 L180 300 C188 270 182 240 188 210 C192 180 184 160 188 150 Z") + brilho;
    case "cacheado": return [[112, 92, 18], [134, 80, 18], [158, 78, 18], [182, 88, 18], [100, 116, 14], [200, 116, 14]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}"/>`).join("")
      + [[92, 150, 12], [208, 150, 12], [92, 186, 11], [208, 186, 11]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}"/>`).join("");
    case "blackpower": return f("M98 128 C100 72 124 56 150 56 C176 56 200 72 202 128 C190 104 172 96 150 96 C128 96 110 104 98 128 Z");
    case "trancas": return f("M96 140 C88 36 212 36 204 140 C196 108 176 92 150 94 C124 92 104 108 96 140 Z") + `<path d="M150 70 L150 94" stroke="${esc}" stroke-width="2"/>` + f("M100 140 C96 210 100 270 106 330 L118 330 C112 270 110 210 112 150 Z") + f("M200 140 C204 210 200 270 194 330 L182 330 C188 270 190 210 188 150 Z");
    case "chanel": return f("M96 150 C86 34 214 30 206 150 C204 176 206 200 208 214 L188 214 C190 190 190 160 186 130 C176 100 160 92 150 92 C128 98 112 110 112 140 C110 170 112 196 112 214 L92 214 C94 200 96 176 96 150 Z") + brilho;
    case "rabo": return f("M98 140 C90 38 210 38 202 140 C196 108 178 90 150 90 C122 90 104 108 98 140 Z") + `<path d="M150 72 L198 112" stroke="${esc}" stroke-width="2" opacity=".5"/>` + brilho;
    case "coque": return f("M98 140 C90 40 210 40 202 140 C196 108 178 90 150 90 C122 90 104 108 98 140 Z") + brilho;
    case "franja": return f("M96 150 C84 32 216 32 204 150 C202 132 198 120 192 114 C176 120 164 114 150 118 C136 114 122 120 108 114 C102 120 98 132 96 150 Z") + f("M96 140 C92 200 98 250 104 290 L116 288 C110 240 108 190 112 150 Z") + f("M204 140 C208 200 202 250 196 290 L184 288 C190 240 192 190 188 150 Z");
    case "curtinho": return f("M96 156 C82 36 216 30 206 150 C204 128 196 110 184 102 C170 116 140 112 120 104 C108 118 100 136 96 156 Z") + brilho;
  }
}
function roupa(r: RoupaF, cor: string, pele: string, sombra: string): string {
  const esc = mistura(cor, "#000", 0.25), clara = mistura(cor, "#fff", 0.2);
  const p = (d: string, fill = cor) => `<path d="${d}" fill="${fill}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>`;
  const base = `<path d="${OMBROS}" fill="${pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>`;
  const clav = `<path d="M118 272 Q132 280 144 276 M156 276 Q168 280 182 272" stroke="${sombra}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  switch (r) {
    case "alcinha": return base + clav + p("M66 360 C70 330 92 312 114 306 Q150 322 186 306 C208 312 230 330 234 360 Z") + `<path d="M118 306 L124 258 M182 306 L176 258" stroke="${TINTA}" stroke-width="4.5"/><path d="M118 306 L124 258 M182 306 L176 258" stroke="${cor}" stroke-width="2"/>`;
    case "ombro": return base + clav + p("M40 360 C42 330 50 312 60 300 L240 300 C250 312 258 330 260 360 Z") + `<path d="M60 300 Q150 316 240 300" stroke="${clara}" stroke-width="5" fill="none"/>` + `<path d="M70 312 Q80 306 90 312 Q100 318 110 312 Q120 306 130 312 Q140 318 150 312 Q160 306 170 312 Q180 318 190 312 Q200 306 210 312 Q220 318 230 312" stroke="${esc}" stroke-width="2" fill="none"/>`;
    case "academia": return base + clav + p("M60 360 C64 334 84 316 104 310 Q150 340 196 310 C216 316 236 334 240 360 Z") + `<path d="M104 310 L112 260 M196 310 L188 260" stroke="${TINTA}" stroke-width="9"/><path d="M104 310 L112 260 M196 310 L188 260" stroke="${cor}" stroke-width="6"/><path d="M80 350 L220 350" stroke="${clara}" stroke-width="5"/>`;
    case "blazer": return base + p("M118 262 Q150 300 182 262 L190 360 L110 360 Z", "#F2F0EA") + p("M30 360 C34 300 76 268 124 256 L150 330 L132 360 Z") + p("M270 360 C266 300 224 268 176 256 L150 330 L168 360 Z") + `<path d="M124 256 L140 300 L128 306 M176 256 L160 300 L172 306" stroke="${TINTA}" stroke-width="2" fill="none"/>`;
    case "jaleco": return base + p("M120 262 Q150 292 180 262 L186 360 L114 360 Z", "#7FA7C9") + p("M30 360 C34 300 76 268 122 258 L146 340 L136 360 Z", "#F7F7F4") + p("M270 360 C266 300 224 268 178 258 L154 340 L164 360 Z", "#F7F7F4") + `<rect x="196" y="318" width="34" height="5" rx="2" fill="#2E4A7A"/>`;
    case "couro": return base + clav + p("M80 360 C84 330 104 314 122 310 Q150 324 178 310 C196 314 216 330 220 360 Z") + p("M30 360 C34 300 72 270 112 262 L118 300 L104 360 Z", "#1B1B1F") + p("M270 360 C266 300 228 270 188 262 L182 300 L196 360 Z", "#1B1B1F") + `<path d="M112 262 L126 292 M188 262 L174 292" stroke="#3A3A42" stroke-width="3"/>`;
    case "vestido": return base + clav + p("M40 360 C44 316 80 288 112 280 L150 316 L188 280 C220 288 256 316 260 360 Z") + `<path d="M112 280 L150 316 L188 280" stroke="${clara}" stroke-width="3" fill="none"/>`;
    case "golaAlta": return `<path d="${OMBROS}" fill="${cor}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>` + p("M126 214 L124 264 Q150 274 176 264 L174 214 Q150 222 126 214 Z") + [228, 240, 252].map((y) => `<path d="M127 ${y} Q150 ${y + 8} 173 ${y}" stroke="${esc}" stroke-width="2" fill="none"/>`).join("");
    case "regata": return base + clav + p("M50 360 C54 326 84 304 108 298 Q150 314 192 298 C216 304 246 326 250 360 Z") + `<path d="M108 298 C112 280 116 268 120 260 M192 298 C188 280 184 268 180 260" stroke="${TINTA}" stroke-width="${TRACO}" fill="none"/>` + p("M108 298 C112 280 116 268 120 260 L130 262 Q150 300 170 262 L180 260 C184 268 188 280 192 298 Q150 314 108 298 Z");
    case "camisa": return base + p("M30 360 C34 300 76 268 124 256 L150 292 L176 256 C224 268 266 300 270 360 Z") + p("M124 256 L150 292 L136 300 L118 266 Z", clara) + p("M176 256 L150 292 L164 300 L182 266 Z", clara) + [312, 336].map((y) => `<circle cx="150" cy="${y}" r="2.4" fill="${esc}"/>`).join("");
  }
}
function olho(x: number, esp: boolean, f: OlhoF, cor: string, delineado: boolean, sombraOlho: string, pele: string, sedutor: boolean, blur: string): string {
  const id = novoId("of");
  const forma: Record<OlhoF, string> = {
    amendoado: "M-14 1 Q-3 -14 14 -3 Q4 10 -14 1 Z", gatinho: "M-14 2 Q-4 -13 15 -6 Q6 10 -14 2 Z",
    redondo: "M-13 1 Q-1 -16 13 -1 Q2 12 -13 1 Z", semdobra: "M-14 1 Q-2 -10 14 -2 Q4 8 -14 1 Z",
  };
  const lid: Record<OlhoF, string> = { amendoado: "M-15 1 Q-3 -15 15 -3", gatinho: "M-15 2 Q-4 -14 16 -6", redondo: "M-14 1 Q-1 -17 14 -1", semdobra: "M-15 1 Q-2 -11 15 -2" };
  const asa = delineado ? `<path d="M13 -4 Q18 -7 22 -11" stroke="#120A06" stroke-width="2.4" stroke-linecap="round" fill="none"/>` : "";
  const cilios = `<path d="M12 -5 Q17 -8 19 -12 M8 -8 Q12 -11 13 -15" stroke="#120A06" stroke-width="1.3" stroke-linecap="round" fill="none"/>`;
  const ig = novoId("ir");
  const palpebra = sedutor ? `<path d="M-16 -16 L18 -16 L18 -4 Q2 -8 -16 -3 Z" fill="${pele}"/>` : "";
  return `<g transform="translate(${x} 146) scale(${esp ? -1.3 : 1.3} 1.3)"><clipPath id="${id}"><path d="${forma[f]}"/></clipPath>
    <radialGradient id="${ig}" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${mistura(cor, "#fff", 0.45)}"/><stop offset=".6" stop-color="${cor}"/><stop offset="1" stop-color="${mistura(cor, "#000", 0.55)}"/></radialGradient>
    <path d="M-17 1 Q-3 -20 19 -6 Q2 -12 -17 1 Z" fill="${sombraOlho}" opacity=".55" filter="url(#${blur})"/>
    <path d="${forma[f]}" fill="#F6EEE6"/><g clip-path="url(#${id})"><path d="M-16 -12 L18 -12 L18 -2 Q0 -6 -16 -1 Z" fill="#000" opacity=".1"/><circle cx="-1" cy="-0.5" r="6.8" fill="url(#${ig})"/><circle cx="-1" cy="-0.5" r="3" fill="#0A0A0A"/><circle cx="1.6" cy="-3.2" r="2" fill="#fff"/><circle cx="-3.4" cy="2.2" r="0.9" fill="#fff" opacity=".8"/>${palpebra}</g>
    <path d="${lid[f]}" stroke="${TINTA}" stroke-width="3.2" fill="none" stroke-linecap="round"/>${asa}${cilios}
    <path d="M-12 3 Q0 7 12 0" stroke="${TINTA}" stroke-width="1.1" fill="none" opacity=".45"/>
</g>`;
}
function boca(b: BocaF, batom: string): string {
  const esc = mistura(batom, "#000", 0.3), luz = mistura(batom, "#fff", 0.55), gl = novoId("lb");
  const grad = `<linearGradient id="${gl}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mistura(batom, "#fff", 0.15)}"/><stop offset="1" stop-color="${mistura(batom, "#000", 0.2)}"/></linearGradient>`;
  const lab = (sup: string, inf: string) => `${grad}<path d="${inf}" fill="url(#${gl})" stroke="${mistura(batom, "#000", 0.5)}" stroke-width="1.2" stroke-linejoin="round"/><path d="${sup}" fill="${esc}" stroke="${mistura(batom, "#000", 0.5)}" stroke-width="1.2" stroke-linejoin="round"/>`;
  switch (b) {
    case "sorriso": return `<g transform="translate(150 186) scale(1.15)">${lab("M-15 0 Q-8 -6 -2 -3 Q0 -4 2 -3 Q8 -6 15 0 Q0 1 -15 0 Z", "M-15 0 Q0 2 15 0 Q8 9 0 9 Q-8 9 -15 0 Z")}<path d="M-4 5 Q0 6.5 5 5" stroke="${luz}" stroke-width="2" stroke-linecap="round"/></g>`;
    case "sorrisao": return `<g transform="translate(150 186) scale(0.95)"><path d="M-17 -1 Q0 3 17 -1 Q10 11 0 11 Q-10 11 -17 -1 Z" fill="#8A3A40" stroke="${TINTA}" stroke-width="1.8"/><path d="M-14 0 Q0 3 14 0 L13 4.5 Q0 7 -13 4.5 Z" fill="#FBF6EE"/>${lab("M-17 -1 Q-9 -7 -2 -4 Q0 -5 2 -4 Q9 -7 17 -1 Q0 2 -17 -1 Z", "M-17 -1 Q-10 11 0 11 Q10 11 17 -1 Q10 15 0 15 Q-10 15 -17 -1 Z")}</g>`;
    case "canto": return `<g transform="translate(150 186) scale(1.15)">${lab("M-14 1 Q-8 -5 -2 -3 Q0 -4 2 -3 Q9 -7 15 -3 Q0 1 -14 1 Z", "M-14 1 Q0 1 15 -3 Q8 8 0 8 Q-8 8 -14 1 Z")}<path d="M-3 4.5 Q1 5.5 5 4" stroke="${luz}" stroke-width="2" stroke-linecap="round"/></g>`;
    case "beicinho": return `<g transform="translate(150 186) scale(1.2)">${lab("M-12 0 Q-6 -7 -1 -4 Q0 -5 1 -4 Q6 -7 12 0 Q0 2 -12 0 Z", "M-12 0 Q0 2 12 0 Q7 11 0 11 Q-7 11 -12 0 Z")}<ellipse cx="0" cy="5.5" rx="5" ry="2" fill="${luz}" opacity=".8"/></g>`;
  }
}

/** O retrato pronto (300 × 360): fundo, cabelo, rosto maquiado, brincos, colar e a roupa da profissão. */
export function svgMulher(m: Mulher, roupaId: RoupaF): string {
  const peleBase = PELES_F[m.pele], sombra = mistura(peleBase, "#4A1A08", 0.24), luzPele = mistura(peleBase, "#FFF5E6", 0.3);
  const corBase = CABELOS_F[m.corCabelo], escCabelo = mistura(corBase, "#000", 0.35), luzCabelo = mistura(corBase, "#fff", 0.35);
  const [f1, f2] = FUNDOS[m.fundo], idf = novoId("fm"), idc = novoId("fc"), gp = novoId("gp"), gc = novoId("gc"), gn = novoId("gn"), bl = novoId("bl"), bl2 = novoId("bb");
  const pele = `url(#${gp})`, cor = `url(#${gc})`, h = hash(JSON.stringify(m)), sedutor = h % 2 === 0, inclina = [-4, -2, 0, 2, 4][h % 5];
  const rosto = ROSTOS[m.rosto];
  const corRoupa = ROUPAS[m.corRoupa], batom = BATONS[m.batom], sombraOlho = ["#8C5A7A", "#B07A55", "#6A5A8C", "#A8687A", "#7A6048"][m.batom % 5];
  const sobr = (esp: boolean) => `<g transform="${esp ? "translate(300 0) scale(-1 1)" : ""}"><path d="M110 122 Q122 108 142 116 Q124 112 110 122 Z" fill="${m.corCabelo >= 5 && m.corCabelo <= 6 ? CABELOS_F[3] : escCabelo}" stroke="${m.corCabelo >= 5 && m.corCabelo <= 6 ? CABELOS_F[3] : escCabelo}" stroke-width="1.4" stroke-linejoin="round" opacity=".92"/></g>`;
  const brinco = (x: number) => m.brinco === "argola" ? `<circle cx="${x}" cy="174" r="7" fill="none" stroke="#E3B341" stroke-width="2.6"/>` : m.brinco === "ponto" ? `<circle cx="${x}" cy="168" r="3" fill="#F4F4F4" stroke="${TINTA}" stroke-width="1"/>` : m.brinco === "pendente" ? `<path d="M${x} 166 L${x} 180" stroke="#E3B341" stroke-width="1.6"/><path d="M${x} 180 l-4 6 l4 6 l4 -6 Z" fill="#E3B341" stroke="${TINTA}" stroke-width="1"/>` : "";
  const colar = m.colar && roupaId !== "golaAlta" ? `<path d="M131 252 Q150 274 169 252" stroke="#E3B341" stroke-width="1.6" fill="none"/><circle cx="150" cy="266" r="3.2" fill="#E3B341" stroke="${TINTA}" stroke-width="1"/>` : "";
  return `<svg viewBox="30 30 240 288" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Foto do perfil">
  <defs><linearGradient id="${idf}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f1}"/><stop offset="1" stop-color="${f2}"/></linearGradient><clipPath id="${idc}"><path d="${rosto}"/></clipPath>
    <radialGradient id="${gp}" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="${luzPele}"/><stop offset=".55" stop-color="${peleBase}"/><stop offset="1" stop-color="${sombra}"/></radialGradient>
    <linearGradient id="${gn}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sombra}"/><stop offset=".5" stop-color="${peleBase}"/><stop offset="1" stop-color="${luzPele}"/></linearGradient>
    <linearGradient id="${gc}" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${luzCabelo}"/><stop offset=".35" stop-color="${corBase}"/><stop offset="1" stop-color="${escCabelo}"/></linearGradient>
    <filter id="${bl}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter><filter id="${bl2}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter></defs>
  <rect width="300" height="360" fill="url(#${idf})"/>
  <circle cx="240" cy="70" r="46" fill="#fff" opacity=".18"/><circle cx="56" cy="300" r="70" fill="#fff" opacity=".1"/>
  <g transform="rotate(${inclina} 150 240)">${cabeloAtras(m.cabelo, cor, escCabelo)}</g>
  <path d="${PESCOCO}" fill="url(#${gn})" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>
  ${roupa(roupaId, corRoupa, `url(#${gn})`, sombra)}${colar}
  <ellipse cx="150" cy="214" rx="18" ry="8" fill="${sombra}" opacity=".35" filter="url(#${bl2})"/>
  <g transform="rotate(${inclina} 150 240)">
  <path d="${rosto}" fill="${pele}" stroke="${TINTA}" stroke-width="${TRACO}" stroke-linejoin="round"/>
  <g clip-path="url(#${idc})"><path d="M106 150 Q112 182 136 202" stroke="${sombra}" stroke-width="10" fill="none" opacity=".45" filter="url(#${bl2})"/><path d="M194 150 Q188 182 164 202" stroke="${sombra}" stroke-width="10" fill="none" opacity=".45" filter="url(#${bl2})"/>
    <ellipse cx="150" cy="96" rx="22" ry="10" fill="#fff" opacity=".22" filter="url(#${bl2})"/></g>
  ${brinco(97)}${brinco(203)}
  <ellipse cx="117" cy="168" rx="13" ry="8" fill="#E8607A" opacity=".32" filter="url(#${bl})"/><ellipse cx="183" cy="168" rx="13" ry="8" fill="#E8607A" opacity=".32" filter="url(#${bl})"/>
  ${sobr(false)}${sobr(true)}
  ${olho(127, true, m.olho, OLHOS_F[m.corOlho], m.delineado, sombraOlho, luzPele, sedutor, bl)}${olho(173, false, m.olho, OLHOS_F[m.corOlho], m.delineado, sombraOlho, luzPele, sedutor, bl)}
  <path d="M146 150 Q143 164 142 168" stroke="${sombra}" stroke-width="4" fill="none" opacity=".5" filter="url(#${bl})"/>
  <path d="M144 169 Q150 173 156 169" stroke="${mistura(peleBase, "#000", 0.4)}" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="151" cy="163" rx="1.6" ry="3" fill="#fff" opacity=".55"/>
  ${boca(m.boca, batom)}<ellipse cx="146" cy="191" rx="4" ry="1.6" fill="#fff" opacity=".55" filter="url(#${bl})"/>
  ${m.pinta ? `<circle cx="174" cy="178" r="1.6" fill="${mistura(peleBase, "#000", 0.6)}"/>` : ""}
  ${m.sardas ? [[116, 158], [123, 162], [129, 158], [171, 158], [177, 162], [184, 158]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="${mistura(peleBase, "#5A2A12", 0.4)}"/>`).join("") : ""}
  ${cabeloFrente(m.cabelo, cor, escCabelo, luzCabelo)}
  </g>
</svg>`;
}
/** Retrato pronto de um perfil do app. */
export const fotoDoPerfil = (p: { id: string; profissao: string }) => svgMulher(mulherDoPerfil(p.id), roupaDaProfissao(p.id, p.profissao));
