// Imagens do jogo: anúncio de transferência e as miniaturas das notícias (placar, contratação, patrocínio,
// lesão, dinheiro, vida, polêmica, troféu).
const DISPLAY = "'Big Shoulders Display', 'Barlow', sans-serif", TEXTO = "'Barlow', sans-serif";
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const luz = (hex: string) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const TINTA = "#0A0A0A";
import { corpoEscudo } from "./escudos";

/** Escudo genérico com as cores do clube (nada de escudo real). */
export function escudoGrande(c1: string, c2: string, x: number, y: number, w: number, chave?: string, nome?: string): string {
  return `<g transform="translate(${x} ${y}) scale(${w / 26})">${corpoEscudo(chave ?? `${c1}${c2}`, c1, c2, nome, 1.4)}</g>`;
}

export interface DadosAnuncio { id?: string; clube: string; apelidoClube: string; cores: string[]; liga: string; jogador: string; numero: string; tipo: "transferencia" | "livre" | "emprestimo"; ate: number; taxa?: number; corpoSvg: string }
/** Anúncio oficial do reforço (360 × 480): cores do clube, o jogador de corpo inteiro com o uniforme novo. */
export function anuncioTransferencia(d: DadosAnuncio): string {
  const [c1, c2r] = d.cores, c2 = c2r ?? "#FFFFFF";
  const fundo = luz(c1) > 0.85 ? c2 : c1, detalhe = fundo === c1 ? c2 : c1;
  const tinta = luz(fundo) > 0.6 ? "#111111" : "#FFFFFF";
  const id = `an${d.clube.replace(/[^a-z0-9]/gi, "")}`;
  const corpo = d.corpoSvg.replace("<svg ", `<svg x="150" y="70" width="230" height="${Math.round(230 * 2.5)}" preserveAspectRatio="xMidYMin meet" `);
  const titulo = d.tipo === "emprestimo" ? "EMPRESTADO AO" : d.tipo === "livre" ? "CHEGOU AO" : "É DO";
  const linhas: string[] = [];
  for (const p of d.apelidoClube.toUpperCase().split(" ")) { const u = linhas.length - 1; if (u >= 0 && (linhas[u] + " " + p).length <= 12) linhas[u] += " " + p; else linhas.push(p); }
  const maior = Math.max(...linhas.map((l) => l.length)), tam = maior > 13 ? 26 : maior > 10 ? 32 : 40, nL = Math.min(3, linhas.length);
  return `<svg class="anuncio" viewBox="0 0 360 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(d.jogador)} ${titulo.toLowerCase()} ${esc(d.clube)}">
  <defs><clipPath id="${id}c"><rect width="360" height="480" rx="16"/></clipPath>
    <radialGradient id="${id}l" cx=".75" cy=".25" r=".7"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".35"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient></defs>
  <g clip-path="url(#${id}c)">
    <rect width="360" height="480" fill="${fundo}"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${-120 + i * 80} 480 L${40 + i * 80} 0" stroke="${detalhe}" stroke-opacity=".14" stroke-width="30"/>`).join("")}
    <rect width="360" height="480" fill="url(#${id}l)"/>
    ${[0, 1, 2, 3].map((i) => `<circle cx="${210 + i * 40}" cy="26" r="5" fill="#FFFFFF" opacity=".7"/>`).join("")}
    <g opacity=".18">${escudoGrande(c1, c2, 170, 120, 220, d.id, d.clube)}</g>
    <path d="M150 455 Q265 430 380 455 L380 480 L150 480 Z" fill="#000" opacity=".18"/>
    ${corpo}
    <rect x="0" y="0" width="360" height="480" fill="none"/>
    ${escudoGrande(c1, c2, 20, 22, 44, d.id, d.clube)}
    <text x="20" y="104" font-family="${DISPLAY}" font-weight="900" font-size="24" fill="${tinta}" opacity=".85">${titulo}</text>
    ${linhas.slice(0, 3).map((l, i) => `<text x="20" y="${104 + tam * (i + 1)}" font-family="${DISPLAY}" font-weight="900" font-size="${tam}" fill="${tinta}">${esc(l)}</text>`).join("")}
    <rect x="20" y="${120 + tam * nL}" width="60" height="5" fill="${detalhe}"/>
    <text x="20" y="${152 + tam * nL}" font-family="${TEXTO}" font-weight="700" font-size="15" fill="${tinta}" opacity=".9">${esc(d.liga)}</text>
    <rect x="0" y="404" width="360" height="76" fill="#0B0B0B" opacity=".78"/>
    <text x="20" y="440" font-family="${DISPLAY}" font-weight="900" font-size="30" fill="#FFFFFF">${esc(d.jogador.toUpperCase())}</text>
    <text x="20" y="464" font-family="${TEXTO}" font-weight="600" font-size="13" fill="#FFFFFF" opacity=".8">${d.tipo === "emprestimo" ? `Empréstimo até o fim de ${d.ate}` : `Contrato até ${d.ate}`}${d.taxa ? ` · € ${(d.taxa / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi` : d.tipo === "livre" ? " · sem custo" : ""}</text>
    <text x="340" y="452" text-anchor="end" font-family="${DISPLAY}" font-weight="900" font-size="44" fill="${luz(detalhe) > 0.3 ? detalhe : "#E3B341"}">${esc(d.numero)}</text>
  </g></svg>`;
}

/** Capa de videogame (paródia: IA Sports · IAFC + o ano da edição, um a mais que o da temporada), 360 × 480. */
/** Cada edição tem uma frase de capa diferente (a arte muda pouco: uniforme e aparência do jogador). */
const TAGLINE_CAPA = ["O JOGO DE FUTEBOL DO MUNDO TODO", "EDIÇÃO DE COLECIONADOR", "A CAPA DA TEMPORADA", "EDIÇÃO DO TORCEDOR"];
export function capaVideogame(d: { edicao: number; jogador: string; numero: string; cores: string[]; corpoSvg: string; edicaoDe?: string }): string {
  const [c1, c2r] = d.cores, c2 = c2r ?? "#FFFFFF", id = `capa${d.edicao}${d.jogador.replace(/[^a-z0-9]/gi, "")}`;
  const destaque = luz(c1) > 0.85 ? c2 : c1, ed = String(d.edicao % 100).padStart(2, "0");
  const corpo = d.corpoSvg.replace("<svg ", `<svg x="95" y="96" width="250" height="${Math.round(250 * 2.5)}" preserveAspectRatio="xMidYMin meet" `);
  return `<svg class="anuncio capa-game" viewBox="0 0 360 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Capa do IAFC ${ed} com ${esc(d.jogador)}">
  <defs><clipPath id="${id}c"><rect width="360" height="480" rx="14"/></clipPath>
    <linearGradient id="${id}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14171F"/><stop offset="1" stop-color="#05060A"/></linearGradient>
    <radialGradient id="${id}l" cx=".62" cy=".42" r=".6"><stop offset="0" stop-color="${destaque}" stop-opacity=".75"/><stop offset="1" stop-color="${destaque}" stop-opacity="0"/></radialGradient></defs>
  <g clip-path="url(#${id}c)">
    <rect width="360" height="480" fill="url(#${id}f)"/>
    <rect width="360" height="480" fill="url(#${id}l)"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${120 + i * 55} 480 L${300 + i * 55} 0" stroke="${i % 2 ? c2 : destaque}" stroke-opacity=".16" stroke-width="${10 + i * 4}"/>`).join("")}
    <text x="250" y="380" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="210" fill="#FFFFFF" opacity=".07">${esc(d.numero)}</text>
    ${corpo}
    <rect width="360" height="92" fill="#05060A" opacity=".82"/>
    <text x="20" y="30" font-family="${TEXTO}" font-weight="800" font-size="12" letter-spacing="3" fill="#FFFFFF" opacity=".75">IA SPORTS</text>
    <text x="18" y="78" font-family="${DISPLAY}" font-weight="900" font-size="54" fill="#FFFFFF">IAFC</text>
    <text x="146" y="78" font-family="${DISPLAY}" font-weight="900" font-size="54" fill="#E3B341">${ed}</text>
    ${d.edicaoDe ? `<text x="340" y="30" text-anchor="end" font-family="${TEXTO}" font-weight="700" font-size="11" fill="#FFFFFF" opacity=".7">EDIÇÃO ${esc(d.edicaoDe.toUpperCase())}</text>` : ""}
    <rect x="0" y="408" width="360" height="72" fill="#05060A" opacity=".85"/>
    <rect x="20" y="418" width="44" height="4" fill="#E3B341"/>
    <text x="20" y="452" font-family="${DISPLAY}" font-weight="900" font-size="32" fill="#FFFFFF">${esc(d.jogador.toUpperCase())}</text>
    <text x="20" y="470" font-family="${TEXTO}" font-weight="600" font-size="11" fill="#FFFFFF" opacity=".6">IA SPORTS · ${TAGLINE_CAPA[d.edicao % TAGLINE_CAPA.length]}</text>
    <rect x="300" y="420" width="40" height="40" rx="6" fill="none" stroke="#FFFFFF" stroke-opacity=".5"/><text x="320" y="446" text-anchor="middle" font-family="${TEXTO}" font-weight="800" font-size="11" fill="#FFFFFF" opacity=".75">L</text>
  </g></svg>`;
}

// ------------------------------------------------------------------ miniaturas das notícias (120 × 90)
export type ImgNoticia =
  | { k: "placar"; casa: [string, string]; fora: [string, string]; gc: number; gf: number; nomeCasa: string; nomeFora: string; idCasa?: string; idFora?: string }
  | { k: "transferencia"; cores: [string, string]; corpoSvg?: string }
  | { k: "patrocinio"; logoSvg: string; cor: string }
  | { k: "lesao" } | { k: "dinheiro" } | { k: "vida"; corpoSvg?: string } | { k: "polemica" } | { k: "trofeu"; cor?: string } | { k: "clube"; cores: [string, string]; id?: string; nome?: string }
  | { k: "rival"; cores: [string, string]; outro: [string, string] } | { k: "torcida"; cores: [string, string]; nivel: number };

const moldura = (conteudo: string, fundo: string) => `<svg class="mini-noticia" viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><clipPath id="mn"><rect width="120" height="90" rx="10"/></clipPath></defs><g clip-path="url(#mn)"><rect width="120" height="90" fill="${fundo}"/>${conteudo}</g></svg>`;
const sigla = (n: string) => n.replace(/^(CR|SE|SC|EC|FC|FBPA|FR|CA)\s+/i, "").replace(/\s+(FC|EC|SC|FBPA|FR)$/i, "").slice(0, 3).toUpperCase();
export function miniNoticia(img: ImgNoticia): string {
  switch (img.k) {
    case "placar": return moldura(`<rect width="60" height="90" fill="${img.casa[0]}" opacity=".9"/><rect x="60" width="60" height="90" fill="${img.fora[0]}" opacity=".9"/><rect y="56" width="120" height="34" fill="#0B0B0B" opacity=".8"/>
      ${escudoGrande(img.casa[0], img.casa[1], 18, 10, 24, img.idCasa, img.nomeCasa)}${escudoGrande(img.fora[0], img.fora[1], 78, 10, 24, img.idFora, img.nomeFora)}
      <text x="60" y="81" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="22" fill="#FFFFFF">${img.gc} × ${img.gf}</text>
      <text x="14" y="70" font-family="${TEXTO}" font-weight="700" font-size="9" fill="#FFFFFF" opacity=".75">${esc(sigla(img.nomeCasa))}</text><text x="106" y="70" text-anchor="end" font-family="${TEXTO}" font-weight="700" font-size="9" fill="#FFFFFF" opacity=".75">${esc(sigla(img.nomeFora))}</text>`, "#1B3229");
    case "transferencia": return moldura(`${[0, 1, 2, 3].map((i) => `<path d="M${-30 + i * 40} 90 L${10 + i * 40} 0" stroke="${img.cores[1]}" stroke-opacity=".2" stroke-width="14"/>`).join("")}${img.corpoSvg ? img.corpoSvg.replace("<svg ", '<svg x="50" y="4" width="70" height="170" preserveAspectRatio="xMidYMin meet" ') : ""}${escudoGrande(img.cores[0], img.cores[1], 10, 12, 30)}<text x="10" y="70" font-family="${DISPLAY}" font-weight="900" font-size="14" fill="${luz(img.cores[0]) > 0.6 ? "#111" : "#FFF"}">REFORÇO</text>`, img.cores[0]);
    case "clube": return moldura(`${escudoGrande(img.cores[0], img.cores[1], 42, 14, 36, img.id, img.nome)}`, "#1B3229");
    case "patrocinio": return moldura(`<g transform="translate(10 30)">${img.logoSvg.replace("<svg ", '<svg width="100" height="30" ')}</g>`, img.cor);
    case "lesao": return moldura(`<rect x="44" y="20" width="32" height="50" rx="6" fill="#F2F0EA" stroke="${TINTA}" stroke-width="2"/><path d="M60 32 V58 M47 45 H73" stroke="#C0392B" stroke-width="8"/>`, "#3A2A2A");
    case "dinheiro": return moldura(`${[0, 1, 2].map((i) => `<ellipse cx="${44 + i * 8}" cy="${62 - i * 9}" rx="22" ry="7" fill="#E3B341" stroke="${TINTA}" stroke-width="1.6"/>`).join("")}<rect x="66" y="30" width="34" height="22" rx="3" fill="#74D394" stroke="${TINTA}" stroke-width="1.6"/><text x="83" y="46" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="13" fill="#1B3229">R$</text>`, "#1E3A2C");
    case "vida": return moldura(img.corpoSvg ? img.corpoSvg.replace("<svg ", '<svg x="25" y="4" width="70" height="170" preserveAspectRatio="xMidYMin meet" ') : "", "#2A3550");
    case "polemica": return moldura(`<rect x="40" y="10" width="40" height="72" rx="8" fill="#1A1A1A"/><rect x="44" y="18" width="32" height="56" rx="4" fill="#F2F0EA"/><path d="M48 28 h24 v12 h-16 l-6 5 v-5 h-2 Z" fill="#E74C3C"/><path d="M48 50 h20 M48 56 h24 M48 62 h16" stroke="#8C8F94" stroke-width="2.4"/>`, "#4D2420");
    case "rival": {
      const boneco = (x: number, cor: string, det: string, vira: number) => `<g transform="translate(${x} 0) scale(${vira} 1)"><circle cx="0" cy="30" r="11" fill="#2A1D14"/><path d="M-18 90 V58 Q-18 44 0 44 Q18 44 18 58 V90 Z" fill="${cor}" stroke="${TINTA}" stroke-width="1.6"/><path d="M-6 44 L0 54 L6 44" fill="none" stroke="${det}" stroke-width="2"/></g>`;
      return moldura(`<rect width="60" height="90" fill="${img.cores[0]}" opacity=".55"/><rect x="60" width="60" height="90" fill="${img.outro[0]}" opacity=".55"/><path d="M60 0 L54 40 L66 48 L58 90" stroke="#FFD24A" stroke-width="3" fill="none"/>
        ${boneco(30, img.cores[0], img.cores[1], 1)}${boneco(90, img.outro[0], img.outro[1], -1)}<text x="60" y="34" text-anchor="middle" font-size="22">⚔️</text>`, "#2A0E12");
    }
    case "torcida": {
      const n = Math.max(0, Math.min(100, img.nivel)), cor = n >= 70 ? "#74D394" : n >= 40 ? "#E8D36A" : "#EC7D69";
      const cabecas = Array.from({ length: 14 }, (_, i) => `<circle cx="${6 + (i % 7) * 15 + (i >= 7 ? 7 : 0)}" cy="${i >= 7 ? 78 : 66}" r="7" fill="${i % 3 ? "#1A1A1A" : "#2E2620"}"/>`).join("");
      const bandeira = (x: number, c: string) => `<path d="M${x} 62 V22" stroke="${TINTA}" stroke-width="1.6"/><path d="M${x} 22 Q${x + 12} 18 ${x + 22} 24 Q${x + 12} 30 ${x} 34 Z" fill="${c}"/>`;
      return moldura(`${bandeira(16, img.cores[0])}${bandeira(52, img.cores[1])}${bandeira(80, img.cores[0])}${cabecas}
        <rect x="106" y="10" width="8" height="62" rx="4" fill="#ffffff22"/><rect x="106" y="${(10 + 62 * (1 - n / 100)).toFixed(1)}" width="8" height="${(62 * n / 100).toFixed(1)}" rx="4" fill="${cor}"/><circle cx="110" cy="78" r="7" fill="${cor}"/>`, "#14301F");
    }
    case "trofeu": return moldura(`<path d="M44 16 H76 V30 Q76 50 60 54 Q44 50 44 30 Z" fill="${img.cor ?? "#E3B341"}" stroke="${TINTA}" stroke-width="2"/><path d="M44 22 Q32 22 34 34 Q36 42 46 42 M76 22 Q88 22 86 34 Q84 42 74 42" fill="none" stroke="${TINTA}" stroke-width="2"/><rect x="56" y="54" width="8" height="12" fill="${img.cor ?? "#E3B341"}" stroke="${TINTA}" stroke-width="1.6"/><rect x="46" y="66" width="28" height="8" rx="2" fill="#5A3A20" stroke="${TINTA}" stroke-width="1.6"/>`, "#2B2416");
  }
}

/** Cenários dos documentários: cada filme tem o seu fundo. */
const CENARIO_DOC: ((c1: string, c2: string) => string)[] = [
  (c1, c2) => `<rect width="360" height="480" fill="#0A1224"/><circle cx="60" cy="90" r="90" fill="${c2}" opacity=".35"/><circle cx="300" cy="70" r="60" fill="#FFFFFF" opacity=".12"/>
    <path d="M0 300 Q180 250 360 300 L360 420 L0 420Z" fill="#14321F"/><rect x="0" y="300" width="360" height="130" fill="#1E5A34" opacity=".9"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${20 + i * 65}" cy="${40 + (i % 2) * 14}" r="5" fill="#FFF6D6" opacity=".9"/>`).join("")}
    <path d="M30 330 L330 330 L330 300 L30 300Z" fill="${c1}" opacity=".5"/>`,
  (c1, c2) => `<rect width="360" height="480" fill="#8FC9E8"/><circle cx="300" cy="120" r="40" fill="#FFD56B"/>
    <rect x="0" y="250" width="360" height="230" fill="#7A9A5C"/>
    ${[[20, 190], [110, 160], [200, 200], [280, 150]].map(([x, h]) => `<rect x="${x}" y="${300 - h / 2}" width="62" height="${h / 2}" fill="${x % 2 ? c1 : c2}"/><rect x="${x + 22}" y="${300 - h / 2 + 12}" width="18" height="16" fill="#FFF6D6"/>`).join("")}`,
  (c1, c2) => `<rect width="360" height="480" fill="#2A2F3A"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 46}" y="0" width="40" height="330" fill="#3B4252"/><rect x="${i * 46 + 16}" y="150" width="8" height="18" fill="${i % 2 ? c1 : c2}"/>`).join("")}
    <rect x="0" y="330" width="360" height="150" fill="#1C1F26"/><rect x="60" y="310" width="240" height="22" fill="#6B4E2E"/>`,
  (c1, c2) => `<rect width="360" height="480" fill="#F7B267"/><rect width="360" height="300" fill="#7FD3F7"/>
    <circle cx="90" cy="110" r="46" fill="#FFE08A"/>
    <rect x="0" y="300" width="360" height="60" fill="#1B7FB8"/><rect x="0" y="360" width="360" height="120" fill="#E8C98C"/>
    <path d="M0 330 Q90 316 180 330 T360 330" stroke="${c2}" stroke-width="6" fill="none" opacity=".6"/>`,
  (c1, c2) => `<rect width="360" height="480" fill="#0D1020"/>
    ${[[10, 170], [70, 220], [130, 140], [190, 260], [250, 190], [306, 150]].map(([x, h], i) => `<rect x="${x}" y="${330 - h}" width="50" height="${h + 160}" fill="${i % 2 ? c1 : "#161B33"}"/>${[0, 1, 2].map((k) => `<rect x="${x + 8}" y="${330 - h + 14 + k * 26}" width="8" height="8" fill="#FFD56B" opacity="${k % 2 ? 0.9 : 0.4}"/>`).join("")}`).join("")}
    <rect x="0" y="330" width="360" height="150" fill="#1A1D2B"/>`,
  (c1, c2) => `<rect width="360" height="480" fill="#3A4656"/>
    ${Array.from({ length: 26 }, (_, i) => `<path d="M${i * 16 - 40} 0 L${i * 16 + 20} 480" stroke="#FFFFFF" stroke-opacity=".18" stroke-width="1.2"/>`).join("")}
    <rect x="0" y="330" width="360" height="150" fill="#2B3440"/><rect x="0" y="330" width="360" height="8" fill="${c2}" opacity=".5"/>`,
];
export const CENARIOS_DOC = CENARIO_DOC.length;
/** Capa de documentário: o mesmo craque, outro fundo e outro título a cada filme. */
export function capaDocumentario(d: { titulo: string; jogador: string; ano: number; cenario: number; cores: string[]; corpoSvg: string }): string {
  const [c1, c2r] = d.cores, c2 = c2r ?? "#FFFFFF", id = `doc${d.ano}${d.cenario}${d.jogador.replace(/[^a-z0-9]/gi, "")}`;
  const corpo = d.corpoSvg.replace("<svg ", `<svg x="95" y="120" width="250" height="${Math.round(250 * 2.5)}" preserveAspectRatio="xMidYMin meet" `);
  return `<svg class="anuncio capa-doc" viewBox="0 0 360 480" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Documentário ${esc(d.titulo)} com ${esc(d.jogador)}">
  <defs><clipPath id="${id}c"><rect width="360" height="480" rx="14"/></clipPath></defs>
  <g clip-path="url(#${id}c)">
    ${CENARIO_DOC[d.cenario % CENARIO_DOC.length](c1, c2)}
    ${corpo}
    <rect width="360" height="84" fill="#05060A" opacity=".82"/>
    <text x="20" y="30" font-family="${TEXTO}" font-weight="800" font-size="11" letter-spacing="3" fill="#FFFFFF" opacity=".75">DOCUMENTÁRIO · ${d.ano}</text>
    <text x="20" y="66" font-family="${DISPLAY}" font-weight="900" font-size="28" fill="#FFFFFF">${esc(d.titulo.toUpperCase())}</text>
    <rect y="424" width="360" height="56" fill="#05060A" opacity=".85"/>
    <text x="20" y="460" font-family="${DISPLAY}" font-weight="900" font-size="28" fill="${c2}">${esc(d.jogador.toUpperCase())}</text>
  </g></svg>`;
}
