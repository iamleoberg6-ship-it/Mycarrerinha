// Imagens do jogo: anúncio de transferência e as miniaturas das notícias (placar, contratação, patrocínio,
// lesão, dinheiro, vida, polêmica, troféu).
const DISPLAY = "'Big Shoulders Display', 'Barlow', sans-serif", TEXTO = "'Barlow', sans-serif";
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const luz = (hex: string) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const TINTA = "#0A0A0A";

/** Escudo genérico com as cores do clube (nada de escudo real). */
export function escudoGrande(c1: string, c2: string, x: number, y: number, w: number): string {
  const h = w * 1.15, s = w / 26;
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M1 1 H25 V14 Q25 24 13 29 Q1 24 1 14 Z" fill="${c1}" stroke="${TINTA}" stroke-width="1.4"/><path d="M1 11 H25 V17 H1 Z" fill="${c2}"/><path d="M1 1 H25 V14 Q25 24 13 29 Q1 24 1 14 Z" fill="none" stroke="${TINTA}" stroke-width="1.4"/></g>${h ? "" : ""}`;
}

export interface DadosAnuncio { clube: string; apelidoClube: string; cores: string[]; liga: string; jogador: string; numero: string; tipo: "transferencia" | "livre" | "emprestimo"; ate: number; taxa?: number; corpoSvg: string }
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
    <g opacity=".18">${escudoGrande(c1, c2, 170, 120, 220)}</g>
    <path d="M150 455 Q265 430 380 455 L380 480 L150 480 Z" fill="#000" opacity=".18"/>
    ${corpo}
    <rect x="0" y="0" width="360" height="480" fill="none"/>
    ${escudoGrande(c1, c2, 20, 22, 44)}
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

// ------------------------------------------------------------------ miniaturas das notícias (120 × 90)
export type ImgNoticia =
  | { k: "placar"; casa: [string, string]; fora: [string, string]; gc: number; gf: number; nomeCasa: string; nomeFora: string }
  | { k: "transferencia"; cores: [string, string]; corpoSvg?: string }
  | { k: "patrocinio"; logoSvg: string; cor: string }
  | { k: "lesao" } | { k: "dinheiro" } | { k: "vida"; corpoSvg?: string } | { k: "polemica" } | { k: "trofeu"; cor?: string } | { k: "clube"; cores: [string, string] };

const moldura = (conteudo: string, fundo: string) => `<svg class="mini-noticia" viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><clipPath id="mn"><rect width="120" height="90" rx="10"/></clipPath></defs><g clip-path="url(#mn)"><rect width="120" height="90" fill="${fundo}"/>${conteudo}</g></svg>`;
const sigla = (n: string) => n.replace(/^(CR|SE|SC|EC|FC|FBPA|FR|CA)\s+/i, "").replace(/\s+(FC|EC|SC|FBPA|FR)$/i, "").slice(0, 3).toUpperCase();
export function miniNoticia(img: ImgNoticia): string {
  switch (img.k) {
    case "placar": return moldura(`<rect width="60" height="90" fill="${img.casa[0]}" opacity=".9"/><rect x="60" width="60" height="90" fill="${img.fora[0]}" opacity=".9"/><rect y="56" width="120" height="34" fill="#0B0B0B" opacity=".8"/>
      ${escudoGrande(img.casa[0], img.casa[1], 18, 10, 24)}${escudoGrande(img.fora[0], img.fora[1], 78, 10, 24)}
      <text x="60" y="81" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="22" fill="#FFFFFF">${img.gc} × ${img.gf}</text>
      <text x="14" y="70" font-family="${TEXTO}" font-weight="700" font-size="9" fill="#FFFFFF" opacity=".75">${esc(sigla(img.nomeCasa))}</text><text x="106" y="70" text-anchor="end" font-family="${TEXTO}" font-weight="700" font-size="9" fill="#FFFFFF" opacity=".75">${esc(sigla(img.nomeFora))}</text>`, "#1B3229");
    case "transferencia": return moldura(`${[0, 1, 2, 3].map((i) => `<path d="M${-30 + i * 40} 90 L${10 + i * 40} 0" stroke="${img.cores[1]}" stroke-opacity=".2" stroke-width="14"/>`).join("")}${img.corpoSvg ? img.corpoSvg.replace("<svg ", '<svg x="50" y="4" width="70" height="170" preserveAspectRatio="xMidYMin meet" ') : ""}${escudoGrande(img.cores[0], img.cores[1], 10, 12, 30)}<text x="10" y="70" font-family="${DISPLAY}" font-weight="900" font-size="14" fill="${luz(img.cores[0]) > 0.6 ? "#111" : "#FFF"}">REFORÇO</text>`, img.cores[0]);
    case "clube": return moldura(`${escudoGrande(img.cores[0], img.cores[1], 42, 14, 36)}`, "#1B3229");
    case "patrocinio": return moldura(`<g transform="translate(10 30)">${img.logoSvg.replace("<svg ", '<svg width="100" height="30" ')}</g>`, img.cor);
    case "lesao": return moldura(`<rect x="44" y="20" width="32" height="50" rx="6" fill="#F2F0EA" stroke="${TINTA}" stroke-width="2"/><path d="M60 32 V58 M47 45 H73" stroke="#C0392B" stroke-width="8"/>`, "#3A2A2A");
    case "dinheiro": return moldura(`${[0, 1, 2].map((i) => `<ellipse cx="${44 + i * 8}" cy="${62 - i * 9}" rx="22" ry="7" fill="#E3B341" stroke="${TINTA}" stroke-width="1.6"/>`).join("")}<rect x="66" y="30" width="34" height="22" rx="3" fill="#74D394" stroke="${TINTA}" stroke-width="1.6"/><text x="83" y="46" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="13" fill="#1B3229">R$</text>`, "#1E3A2C");
    case "vida": return moldura(img.corpoSvg ? img.corpoSvg.replace("<svg ", '<svg x="25" y="4" width="70" height="170" preserveAspectRatio="xMidYMin meet" ') : "", "#2A3550");
    case "polemica": return moldura(`<rect x="40" y="10" width="40" height="72" rx="8" fill="#1A1A1A"/><rect x="44" y="18" width="32" height="56" rx="4" fill="#F2F0EA"/><path d="M48 28 h24 v12 h-16 l-6 5 v-5 h-2 Z" fill="#E74C3C"/><path d="M48 50 h20 M48 56 h24 M48 62 h16" stroke="#8C8F94" stroke-width="2.4"/>`, "#4D2420");
    case "trofeu": return moldura(`<path d="M44 16 H76 V30 Q76 50 60 54 Q44 50 44 30 Z" fill="${img.cor ?? "#E3B341"}" stroke="${TINTA}" stroke-width="2"/><path d="M44 22 Q32 22 34 34 Q36 42 46 42 M76 22 Q88 22 86 34 Q84 42 74 42" fill="none" stroke="${TINTA}" stroke-width="2"/><rect x="56" y="54" width="8" height="12" fill="${img.cor ?? "#E3B341"}" stroke="${TINTA}" stroke-width="1.6"/><rect x="46" y="66" width="28" height="8" rx="2" fill="#5A3A20" stroke="${TINTA}" stroke-width="1.6"/>`, "#2B2416");
  }
}
