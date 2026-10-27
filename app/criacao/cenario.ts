// Fundo da foto de perfil, montado em camadas conforme a história: país (paisagem), família (casa) e formação (chão).
// Mesmo viewBox do avatar: 0 0 200 220. O jogador fica no centro; o cenário aparece pelas bordas e acima dos ombros.
import type { PaisId, FamiliaId, FormacaoId } from "../../src/dna.js";

const ceu = (c1: string, c2: string, id: string) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="200" height="220" fill="url(#${id})"/>`;
const sol = (x: number, y: number, r: number, c = "#FFD66B") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const nuvem = (x: number, y: number, s = 1, c = "#FFFFFF", o = 0.85) =>
  `<g opacity="${o}" fill="${c}"><ellipse cx="${x}" cy="${y}" rx="${16 * s}" ry="${6 * s}"/><ellipse cx="${x - 8 * s}" cy="${y - 4 * s}" rx="${9 * s}" ry="${7 * s}"/><ellipse cx="${x + 7 * s}" cy="${y - 5 * s}" rx="${10 * s}" ry="${8 * s}"/></g>`;
const casinha = (x: number, y: number, w: number, h: number, cor: string, teto: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cor}"/><rect x="${x - 1}" y="${y - 3}" width="${w + 2}" height="3" fill="${teto}"/><rect x="${x + w * 0.3}" y="${y + h * 0.3}" width="${w * 0.25}" height="${h * 0.3}" fill="#2B2B2B" opacity="0.35"/>`;
const palmeira = (x: number, y: number, s = 1) =>
  `<path d="M${x} ${y} Q${x + 3 * s} ${y - 30 * s} ${x - 2 * s} ${y - 58 * s}" stroke="#6B4A2B" stroke-width="${3 * s}" fill="none"/><g fill="#2E7D4F"><path d="M${x - 2 * s} ${y - 58 * s} q-20 2 -26 14 q14 -10 26 -14z"/><path d="M${x - 2 * s} ${y - 58 * s} q20 -2 28 10 q-14 -8 -28 -10z"/><path d="M${x - 2 * s} ${y - 58 * s} q-8 -16 -22 -16 q14 4 22 16z"/><path d="M${x - 2 * s} ${y - 58 * s} q10 -14 24 -12 q-14 2 -24 12z"/></g>`;
const pinheiro = (x: number, y: number, h: number, c = "#1F4D3A") => `<path d="M${x} ${y - h} L${x + h * 0.32} ${y} L${x - h * 0.32} ${y} Z" fill="${c}"/>`;
const cipreste = (x: number, y: number, h: number) => `<ellipse cx="${x}" cy="${y - h / 2}" rx="${h * 0.12}" ry="${h / 2}" fill="#2F4A2A"/>`;

/** Paisagem do país: céu, horizonte e um elemento reconhecível. */
export function camadaPais(p: PaisId): string {
  switch (p) {
    case "BRA":
      return ceu("#5FB3E8", "#BFE6F7", "gBRA") + sol(160, 34, 14) + nuvem(48, 36) +
        `<path d="M0 120 Q40 70 90 96 Q130 66 200 104 L200 220 L0 220 Z" fill="#3E9A5A"/>` +
        [[12, 104, "#F2C14E"], [26, 98, "#E76F51"], [40, 92, "#5FA8D3"], [150, 92, "#F4A261"], [166, 98, "#E9C46A"], [180, 104, "#8AB17D"], [20, 114, "#E5E5E5"], [172, 112, "#E76F51"]]
          .map(([x, y, c]) => casinha(x as number, y as number, 11, 9, c as string, "#7A4A2C")).join("");
    case "ARG":
      return ceu("#8FCBF0", "#DDF0FB", "gARG") + sol(36, 30, 11, "#F7D774") + nuvem(150, 34) +
        `<rect x="0" y="118" width="200" height="102" fill="#7B8C7A"/>` +
        [[0, 82, 26, "#D94F3D"], [26, 92, 22, "#F2C14E"], [148, 88, 24, "#3D8BC4"], [172, 80, 28, "#5DAA68"]]
          .map(([x, y, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${120 - (y as number)}" fill="${c}"/><rect x="${x}" y="${(y as number) - 4}" width="${w}" height="4" fill="#5C3B29"/><rect x="${(x as number) + 6}" y="${(y as number) + 8}" width="6" height="8" fill="#FFF3D6"/>`).join("");
    case "URU":
      return ceu("#86C5EC", "#D7EEF9", "gURU") + sol(158, 30, 12) + nuvem(60, 30, 0.9) +
        `<rect x="0" y="104" width="200" height="22" fill="#2F7FB5"/><path d="M0 126 L200 126 L200 220 L0 220 Z" fill="#CBB892"/><rect x="0" y="124" width="200" height="3" fill="#E9E1CF"/>` +
        `<rect x="18" y="62" width="9" height="44" fill="#F7F7F2"/><rect x="18" y="72" width="9" height="6" fill="#D94F3D"/><rect x="18" y="88" width="9" height="6" fill="#D94F3D"/><path d="M16 62 L22.5 52 L29 62 Z" fill="#D94F3D"/>`;
    case "ESP":
      return ceu("#3F9BE0", "#A8D8F6", "gESP") + sol(166, 28, 13) +
        `<path d="M0 112 Q60 84 110 100 Q150 86 200 98 L200 220 L0 220 Z" fill="#D9B77E"/>` +
        [[8, 96], [26, 92], [154, 88], [172, 92], [186, 98]].map(([x, y]) => `<rect x="${x}" y="${y}" width="14" height="12" fill="#FAFAF5"/><path d="M${x - 1} ${y} L${x + 7} ${y - 6} L${x + 15} ${y} Z" fill="#D9703C"/>`).join("");
    case "NED":
      return ceu("#9CC7E6", "#E2F0F8", "gNED") + nuvem(140, 28, 1.1) + nuvem(40, 40, 0.8) +
        `<rect x="0" y="116" width="200" height="104" fill="#6FAE5A"/>` +
        [0, 1, 2, 3].map((i) => `<rect x="0" y="${126 + i * 12}" width="200" height="5" fill="${["#E63946", "#F4D35E", "#F28482", "#F7F7F2"][i]}"/>`).join("") +
        `<path d="M28 118 L32 70 L40 70 L44 118 Z" fill="#7A5236"/><g transform="translate(36 72)" stroke="#3D2B1F" stroke-width="3"><line x1="-22" y1="-22" x2="22" y2="22"/><line x1="22" y1="-22" x2="-22" y2="22"/></g>`;
    case "GER":
      return ceu("#8EA9BD", "#D3DEE6", "gGER") + nuvem(150, 32, 1.1, "#F2F4F6") +
        `<path d="M0 118 Q60 92 120 108 Q160 96 200 104 L200 220 L0 220 Z" fill="#4F7A52"/>` +
        pinheiro(12, 120, 46) + pinheiro(30, 116, 38) + pinheiro(172, 116, 44) + pinheiro(190, 120, 36) +
        `<rect x="146" y="98" width="20" height="18" fill="#F2EBDD"/><path d="M144 98 L156 86 L168 98 Z" fill="#7C3B2B"/><path d="M146 98 L166 116 M166 98 L146 116" stroke="#4A3527" stroke-width="2"/>`;
    case "ITA":
      return ceu("#F3B97A", "#F9E1B8", "gITA") + sol(150, 44, 16, "#FFE3A3") +
        `<path d="M0 112 Q50 86 100 104 Q150 84 200 100 L200 220 L0 220 Z" fill="#C89B5A"/><path d="M0 132 Q70 108 200 130 L200 220 L0 220 Z" fill="#A9813F"/>` +
        cipreste(18, 118, 48) + cipreste(32, 112, 40) + cipreste(176, 112, 44) +
        `<rect x="186" y="68" width="10" height="44" fill="#E3C79A"/><path d="M185 68 L191 60 L197 68 Z" fill="#B5643B"/>`;
    case "ENG":
      return ceu("#8F9AA3", "#C9D0D5", "gENG") + nuvem(50, 30, 1.3, "#E1E5E8", 0.95) + nuvem(150, 24, 1.4, "#D5DADD", 0.95) +
        `<rect x="0" y="116" width="200" height="104" fill="#5E7F5A"/>` +
        [0, 1].map((i) => `<rect x="${i * 160}" y="84" width="40" height="32" fill="#9A4B36"/><path d="M${i * 160} 84 L${i * 160 + 20} 72 L${i * 160 + 40} 84 Z" fill="#4C4F57"/><rect x="${i * 160 + 6}" y="66" width="5" height="12" fill="#6E3828"/><rect x="${i * 160 + 6}" y="92" width="8" height="10" fill="#F6E7B9"/><rect x="${i * 160 + 24}" y="92" width="8" height="10" fill="#F6E7B9"/>`).join("") +
        Array.from({ length: 14 }, (_, i) => `<line x1="${8 + i * 14}" y1="${40 + (i % 3) * 8}" x2="${4 + i * 14}" y2="${50 + (i % 3) * 8}" stroke="#E8EEF2" stroke-width="1" opacity="0.6"/>`).join("");
    case "FRA":
      return ceu("#A9CBEA", "#E6F0F8", "gFRA") + nuvem(100, 28, 1) +
        `<rect x="0" y="118" width="200" height="102" fill="#8E9C88"/>` +
        [[0, 76], [30, 84], [148, 80], [176, 76]].map(([x, y]) => `<rect x="${x}" y="${y}" width="28" height="${120 - y}" fill="#EFE3CB"/><path d="M${x} ${y} L${x + 4} ${y - 10} L${x + 24} ${y - 10} L${x + 28} ${y} Z" fill="#6F7F95"/>${[0, 1, 2].map((i) => `<rect x="${x + 4 + i * 8}" y="${y + 8}" width="5" height="9" fill="#3E4A5C" opacity="0.6"/>`).join("")}`).join("");
    case "NGA":
      return ceu("#F2A65A", "#F9D9A6", "gNGA") + sol(40, 40, 14, "#FFE6A6") +
        `<rect x="0" y="118" width="200" height="102" fill="#C9783B"/>` + palmeira(22, 120, 1) + palmeira(180, 122, 0.9) +
        `<rect x="140" y="98" width="26" height="20" fill="#D8A86A"/><rect x="138" y="94" width="30" height="4" fill="#8A5A2B"/>`;
    case "SEN":
      return ceu("#E8794B", "#F6C48E", "gSEN") + sol(100, 92, 22, "#FFD08A") +
        `<rect x="0" y="108" width="200" height="16" fill="#3E6E8E"/><rect x="0" y="124" width="200" height="96" fill="#E2B878"/>` +
        `<path d="M168 124 L168 92 Q156 84 150 70 M168 92 Q182 82 190 70 M168 100 Q176 92 186 90" stroke="#4A3020" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="168" cy="72" rx="26" ry="12" fill="#5E7B3A"/>` +
        `<path d="M10 118 L44 118 L40 124 L14 124 Z" fill="#2E86AB"/><rect x="10" y="116" width="34" height="2" fill="#F2C14E"/>`;
    case "GHA":
      return ceu("#6EC1E4", "#CDEBF6", "gGHA") + sol(162, 30, 12) + nuvem(54, 32) +
        `<rect x="0" y="106" width="200" height="18" fill="#2A8FBD"/><rect x="0" y="124" width="200" height="96" fill="#E7C98E"/>` +
        palmeira(18, 126, 1.05) + palmeiras2() + `<path d="M150 120 L190 120 L184 126 L156 126 Z" fill="#E63946"/><rect x="152" y="118" width="36" height="2" fill="#F4D35E"/><rect x="152" y="116" width="36" height="2" fill="#2A9D8F"/>`;
    case "JPN":
      return ceu("#BBD7EE", "#EEF5FA", "gJPN") +
        `<path d="M40 112 L100 46 L160 112 Z" fill="#6D86A3"/><path d="M84 64 L100 46 L116 64 L108 62 L100 68 L92 62 Z" fill="#F7FAFC"/>` +
        `<rect x="0" y="112" width="200" height="108" fill="#7FA86E"/>` +
        `<rect x="170" y="80" width="4" height="34" fill="#5A3B2A"/><g fill="#F4B6C2"><circle cx="168" cy="78" r="12"/><circle cx="182" cy="72" r="11"/><circle cx="190" cy="84" r="10"/><circle cx="160" cy="88" r="9"/></g>` +
        `<rect x="10" y="86" width="30" height="4" fill="#C8102E"/><rect x="14" y="92" width="22" height="3" fill="#C8102E"/><rect x="15" y="88" width="3" height="26" fill="#C8102E"/><rect x="32" y="88" width="3" height="26" fill="#C8102E"/>`;
    case "KOR":
      return ceu("#A9C8E6", "#E4EEF7", "gKOR") +
        `<path d="M0 104 L40 70 L80 100 L120 64 L170 98 L200 80 L200 120 L0 120 Z" fill="#7E95B3"/><path d="M0 112 L50 90 L100 110 L150 88 L200 108 L200 124 L0 124 Z" fill="#5E7697"/>` +
        `<rect x="0" y="120" width="200" height="100" fill="#7A9A72"/>` +
        [[6, 70, 14], [22, 84, 12], [160, 66, 14], [176, 78, 12], [188, 88, 10]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${122 - y}" fill="#C9D3DE"/>${[0, 1, 2, 3].map((i) => `<rect x="${x + 3}" y="${y + 6 + i * 10}" width="${w - 6}" height="3" fill="#8DA2BA"/>`).join("")}`).join("");
    case "POR":
      return ceu("#7FB8E6", "#D9ECF8", "gPOR") + sol(40, 34, 12) +
        `<rect x="0" y="136" width="200" height="84" fill="#3F8FC4"/><path d="M0 132 Q60 118 120 132 T200 130 L200 140 L0 140 Z" fill="#E8D6B0"/>` +
        [[30, 100, "#E08A4B"], [48, 92, "#F2C9A0"], [70, 104, "#D5703A"], [126, 96, "#F2E1C6"], [146, 104, "#E08A4B"], [166, 90, "#F2C9A0"]]
          .map(([x, y, c]) => casinha(x as number, y as number, 18, 22, c as string, "#A34A2A")).join("");
    case "USA":
      return ceu("#6EB5E8", "#CFE8F8", "gUSA") + sol(160, 32, 12) +
        `<rect x="0" y="120" width="200" height="100" fill="#4E8F4A"/>` +
        `<rect x="34" y="92" width="132" height="22" fill="#9AA3AE"/><rect x="34" y="92" width="132" height="3" fill="#C9D0D8"/>` +
        [40, 52, 64, 76, 88, 100, 112, 124, 136, 148].map((x) => `<rect x="${x}" y="98" width="2" height="16" fill="#6B737D"/>`).join("") +
        `<path d="M70 150 L130 150 L130 176 L70 176 Z" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".85"/><rect x="0" y="176" width="200" height="44" fill="#3E7A3A"/>`;
    case "MEX":
      return ceu("#F3B77A", "#FBE3C0", "gMEX") + sol(150, 40, 16, "#FFD27A") +
        `<path d="M0 118 L40 92 L90 112 L140 86 L200 110 L200 220 L0 220 Z" fill="#C8875A"/>` +
        `<path d="M0 140 L60 124 L120 140 L200 126 L200 220 L0 220 Z" fill="#A86B43"/>` +
        [[24, 138], [170, 130]].map(([x, y]) => `<rect x="${x - 3}" y="${y - 22}" width="6" height="22" fill="#4F8A4A"/><rect x="${x - 10}" y="${y - 12}" width="7" height="5" fill="#4F8A4A"/><rect x="${x - 10}" y="${y - 17}" width="3" height="10" fill="#4F8A4A"/>`).join("");
    case "COL":
      return ceu("#8CC9EA", "#D2ECF8", "gCOL") + nuvem(60, 36, 0.9) +
        `<path d="M0 124 L46 58 L86 116 L130 46 L200 124 L200 220 L0 220 Z" fill="#4D7C5B"/>` +
        `<path d="M118 84 L130 46 L144 84 Z" fill="#F4F7FA"/>` +
        `<rect x="0" y="150" width="200" height="70" fill="#7DA85E"/>` + palmeira(160, 150, 0.9) + palmeira(34, 156, 0.8);
    case "MAR":
      return ceu("#F2B98A", "#FCE9D3", "gMAR") + sol(40, 36, 11, "#FFD27A") +
        `<rect x="0" y="130" width="200" height="90" fill="#D9C29A"/>` +
        [[18, 100, "#F4F1EA"], [44, 92, "#F4F1EA"], [132, 96, "#F4F1EA"], [158, 88, "#F4F1EA"]]
          .map(([x, y, c]) => casinha(x as number, y as number, 20, 30, c as string, "#2E6DB4")).join("") +
        `<rect x="104" y="60" width="12" height="70" fill="#F4F1EA"/><path d="M104 60 Q110 46 116 60 Z" fill="#2E6DB4"/>`;
    case "CRO":
      return ceu("#9FD0EE", "#E6F4FB", "gCRO") + sol(160, 30, 11, "#FFE08A") +
        `<path d="M0 118 Q70 92 130 116 Q170 104 200 112 L200 220 L0 220 Z" fill="#6E9A5C"/>` +
        `<rect x="0" y="176" width="200" height="44" fill="#3B7FB8"/>` +
        [[20, 106, "#D9513C"], [44, 98, "#F2EFE8"], [112, 100, "#D9513C"], [140, 92, "#F2EFE8"]]
          .map(([x, y, c]) => casinha(x as number, y as number, 18, 20, c as string, "#7A2E22")).join("") + pinheiro(180, 116, 30);
  }
}
function palmeiras2() { return palmeira(36, 128, 0.8); }

/** Casa da família, no canto esquerdo da foto. */
export function camadaFamilia(f: FamiliaId): string {
  if (f === "humilde")
    return `<g><rect x="2" y="128" width="40" height="34" fill="#B5654A"/>${[0, 1, 2, 3].map((i) => `<line x1="2" y1="${136 + i * 7}" x2="42" y2="${136 + i * 7}" stroke="#8F4A35" stroke-width="1"/>`).join("")}<path d="M0 128 L44 128 L42 122 L2 122 Z" fill="#9AA3A8"/><rect x="10" y="140" width="10" height="22" fill="#3B5F7A"/><rect x="26" y="138" width="10" height="9" fill="#F2D27A"/><line x1="0" y1="118" x2="60" y2="112" stroke="#2B2B2B" stroke-width="0.8"/></g>`;
  if (f === "media")
    return `<g><rect x="2" y="124" width="44" height="38" fill="#F1E3C6"/><path d="M-2 124 L24 104 L50 124 Z" fill="#B5543A"/><rect x="10" y="138" width="10" height="24" fill="#6B4A2B"/><rect x="28" y="134" width="12" height="10" fill="#9CC9E6"/><g stroke="#FFFFFF" stroke-width="2"><line x1="0" y1="156" x2="56" y2="156"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<line x1="${2 + i * 8}" y1="150" x2="${2 + i * 8}" y2="162"/>`).join("")}</g></g>`;
  return `<g><rect x="0" y="112" width="58" height="50" fill="#F5F5F2"/><rect x="0" y="108" width="62" height="5" fill="#3A3F44"/><rect x="4" y="118" width="24" height="18" fill="#7FB8DA"/><rect x="32" y="118" width="20" height="18" fill="#7FB8DA"/><rect x="4" y="142" width="48" height="16" fill="#7FB8DA" opacity="0.8"/><rect x="0" y="160" width="62" height="6" fill="#4FB3D9"/></g>` + palmeira(58, 164, 0.7);
}

/** Chão da formação, na faixa de baixo, com a bola. */
export function camadaFormacao(f: FormacaoId): string {
  const bola = `<g transform="translate(176 200)"><circle r="9" fill="#FFFFFF"/><path d="M0 -4 L4 -1 L2.5 4 L-2.5 4 L-4 -1 Z" fill="#1B1B1B"/></g>`;
  switch (f) {
    case "rua":
      return `<rect x="0" y="176" width="200" height="44" fill="#4D4F52"/><rect x="0" y="174" width="200" height="3" fill="#8A8D90"/><line x1="0" y1="198" x2="200" y2="198" stroke="#E8D36A" stroke-width="2" stroke-dasharray="10 8"/><g fill="#3D7DD8"><ellipse cx="12" cy="206" rx="7" ry="3"/><ellipse cx="32" cy="206" rx="7" ry="3"/></g>` + bola;
    case "futsal":
      return `<rect x="0" y="176" width="200" height="44" fill="#C46A35"/><path d="M0 196 Q100 178 200 196" stroke="#FFFFFF" stroke-width="2" fill="none"/><line x1="0" y1="180" x2="200" y2="180" stroke="#FFFFFF" stroke-width="2"/><rect x="0" y="150" width="200" height="26" fill="#2D4A63"/><rect x="0" y="150" width="200" height="3" fill="#1E3346"/>` + bola;
    case "praia":
      return `<rect x="0" y="176" width="200" height="44" fill="#EBD39C"/><path d="M0 182 Q50 176 100 182 T200 182" stroke="#F6E6BF" stroke-width="3" fill="none"/><line x1="8" y1="200" x2="8" y2="168" stroke="#FFFFFF" stroke-width="2"/><line x1="192" y1="200" x2="192" y2="168" stroke="#FFFFFF" stroke-width="2"/>` + bola;
    case "escolinha":
      return `<rect x="0" y="176" width="200" height="44" fill="#A8743F"/><g fill="#6E9E4F"><ellipse cx="30" cy="180" rx="16" ry="3"/><ellipse cx="164" cy="184" rx="18" ry="3"/></g><g stroke="#FFFFFF" stroke-width="2.5" fill="none"><path d="M4 196 L4 166 L30 166 L30 196"/></g>` + bola;
    case "academia":
      return `<rect x="0" y="176" width="200" height="44" fill="#4C9A4E"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 44}" y="176" width="22" height="44" fill="#57A859"/>`).join("")}<g fill="#F28C28"><path d="M14 210 L20 194 L26 210 Z"/><path d="M36 214 L42 198 L48 214 Z"/></g>` + bola;
    case "base_grande":
      return `<rect x="0" y="150" width="200" height="22" fill="#1D3557"/><text x="6" y="165" font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif" font-weight="800" font-size="11" fill="#F1FAEE">CT</text><text x="194" y="165" text-anchor="end" font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif" font-weight="800" font-size="11" fill="#F1FAEE">SUB-17</text><rect x="0" y="172" width="200" height="48" fill="#3F8F45"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 44}" y="172" width="22" height="48" fill="#4AA151"/>`).join("")}<line x1="0" y1="178" x2="200" y2="178" stroke="#FFFFFF" stroke-width="2"/>` + bola;
  }
}

export function cenarioCompleto(p?: PaisId | null, f?: FamiliaId | null, fo?: FormacaoId | null): string {
  if (!p) return `<rect width="200" height="220" fill="#13261F"/>`;
  return camadaPais(p) + (f ? camadaFamilia(f) : "") + (fo ? camadaFormacao(fo) : "");
}
