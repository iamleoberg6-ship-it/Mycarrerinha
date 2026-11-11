// Álbum de figurinhas (os dois modos): as artes das figurinhas, uma para cada tipo de momento, e o livro em si —
// capa, páginas por temporada com as figurinhas coladas e a legenda impressa embaixo, a página que vira de verdade
// (dobra em 3D, para frente e para trás, no toque ou arrastando o dedo) e a figurinha ampliada.
import type { Figurinha } from "../../src/figurinhas";
import { NOME_TIPO_FIG, NOME_RARIDADE } from "../../src/figurinhas";

export interface CtxFig {
  /** o retrato principal da figurinha, sem fundo (jogador de uniforme, técnico de terno, de roupa social...) */
  retrato(f: Figurinha): string;
  escudo(id: string): string;
  bandeira(cod: string): string;
  /** família: a companheira; filho: o retrato do filho; patrocínio: a logo da marca */
  parceira?(f: Figurinha): string | undefined;
  filho?(f: Figurinha): string | undefined;
  marca?(f: Figurinha): string | undefined;
  /** nome que vai na plaquinha */
  nome: string;
}
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const D = "'Big Shoulders Display','Arial Narrow',sans-serif";
let seq = 0;
/** Encaixa um svg (ou html) numa área da figurinha. */
function pos(html: string, x: number, y: number, w: number, h: number, ar = "xMidYMid meet"): string {
  if (!html) return "";
  const m = html.match(/^\s*<svg\b[^>]*>/);
  if (m) {
    const aberto = m[0].replace(/\s(width|height|x|y|preserveAspectRatio|style|class)="[^"]*"/g, "").replace("<svg", `<svg x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="${ar}"`);
    return aberto + html.slice(m[0].length);
  }
  return `<foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;overflow:hidden">${html.replace("<img ", '<img style="width:100%;height:100%;object-fit:cover" ')}</div></foreignObject>`;
}
function hexOk(c: string | undefined, d: string) { return c && /^#[0-9a-f]{6}$/i.test(c) ? c : d; }
function mix(a: string, b: string, t: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
const lum = (h: string) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function hashN(t: string) { let h = 2166136261; for (const c of t) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
/** Quebra um texto em até duas linhas de n letras. */
function duas(t: string, n: number): [string, string] {
  if (t.length <= n) return [t, ""];
  const cut = t.lastIndexOf(" ", n);
  const a = t.slice(0, cut > 4 ? cut : n), b = t.slice(a.length).trim();
  return [a, b.length > n ? b.slice(0, n - 1) + "…" : b];
}
/** Cores boas para a figurinha: fundo escuro o bastante e o contraste. */
function paleta(f: Figurinha) {
  const c1 = hexOk(f.cores[0], "#1D5F3A"), c2 = hexOk(f.cores[1], "#F2F2F2");
  const fundo = lum(c1) > 0.8 ? (lum(c2) > 0.8 ? "#1F2A44" : c2) : c1, outra = fundo === c1 ? c2 : c1;
  return { c1, c2, fundo, outra, escuro: mix(fundo, "#000000", 0.55), tinta: "#141A16", papel: "#FBF6E9" };
}
const borda = (f: Figurinha, id: string) => f.raridade === "lenda" ? `<rect x="3" y="3" width="154" height="224" rx="9" fill="none" stroke="url(#ou${id})" stroke-width="3"/>` : "";
const defsBase = (id: string) => `<clipPath id="ck${id}"><rect x="0" y="0" width="160" height="230" rx="11"/></clipPath>
  <linearGradient id="ou${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A6414"/><stop offset=".35" stop-color="#F6D77A"/><stop offset=".55" stop-color="#FFF4C8"/><stop offset=".75" stop-color="#E3B341"/><stop offset="1" stop-color="#7A5510"/></linearGradient>
  <linearGradient id="br${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
const brilho = (f: Figurinha, id: string) => f.raridade === "comum" ? "" : `<rect width="160" height="230" fill="url(#br${id})"/>`;
/** Plaquinha de baixo (papel): nome grande, subtítulo e, se houver, a linha de números. */
function placa(p: ReturnType<typeof paleta>, nome: string, sub: string, nums?: [string, string | number][]): string {
  const y = nums ? 164 : 184, h = 230 - y;
  const cells = nums ? nums.map(([r, v], i) => { const w = 144 / nums.length, x = 8 + i * w; return `<rect x="${x + 1}" y="203" width="${w - 2}" height="21" rx="4" fill="${p.fundo}"/><text x="${x + w / 2}" y="211" text-anchor="middle" font-family="sans-serif" font-size="5.6" letter-spacing=".6" fill="${lum(p.fundo) > 0.6 ? "#222" : "#fff"}" opacity=".8">${esc(r)}</text><text x="${x + w / 2}" y="221.5" text-anchor="middle" font-family="${D}" font-weight="900" font-size="11" fill="${lum(p.fundo) > 0.6 ? "#111" : "#fff"}">${esc(String(v))}</text>`; }).join("") : "";
  return `<rect x="0" y="${y}" width="160" height="${h}" fill="${p.papel}"/><rect x="0" y="${y}" width="160" height="3" fill="${p.outra === "#ffffff" || lum(p.outra) > 0.85 ? "#E3B341" : p.outra}"/>
    <text x="80" y="${y + 18}" text-anchor="middle" font-family="${D}" font-weight="900" font-size="${nome.length > 16 ? 12.5 : 15}" fill="${p.tinta}">${esc(nome.toUpperCase().slice(0, 22))}</text>
    <text x="80" y="${y + 29}" text-anchor="middle" font-family="sans-serif" font-size="7" letter-spacing=".4" fill="#5b5440">${esc(sub.slice(0, 40))}</text>${cells}`;
}
const chipAno = (t: string, x = 118, cor = "#0B1410") => `<rect x="${x}" y="8" width="${152 - x}" height="16" rx="8" fill="${cor}" opacity=".88"/><text x="${(x + 152) / 2}" y="19.5" text-anchor="middle" font-family="${D}" font-weight="900" font-size="11" fill="#fff">${esc(t)}</text>`;
const rotulo = (t: string, cor = "#0B1410") => `<rect x="8" y="8" width="${Math.min(100, 14 + t.length * 6.2)}" height="16" rx="8" fill="${cor}" opacity=".88"/><text x="${8 + Math.min(100, 14 + t.length * 6.2) / 2}" y="19.5" text-anchor="middle" font-family="${D}" font-weight="900" font-size="10" letter-spacing=".8" fill="#fff">${esc(t)}</text>`;

/** Desenho de troféu (taça dourada). */
const taca = (cx: number, y: number, s: number) => `<g transform="translate(${cx} ${y}) scale(${s})"><path d="M-26 0 H26 V8 C26 34 14 46 0 48 C-14 46 -26 34 -26 8 Z" fill="url(#tg)"/><path d="M-26 6 C-44 6 -44 30 -20 32 M26 6 C44 6 44 30 20 32" fill="none" stroke="#C9971F" stroke-width="5"/><rect x="-5" y="47" width="10" height="14" fill="#C9971F"/><rect x="-18" y="60" width="36" height="9" rx="2" fill="#E3B341"/><rect x="-24" y="68" width="48" height="10" rx="2" fill="#7A5510"/><path d="M-14 6 C-14 26 -8 36 0 40" stroke="#FFF4C8" stroke-width="4" fill="none" opacity=".7"/></g>`;
const bola = (cx: number, cy: number, r: number, ouro: boolean) => `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${ouro ? "url(#tg)" : "#fff"}" stroke="#2a1d05" stroke-width="1.5"/><path d="M${cx} ${cy - r * 0.38} l${r * 0.36} ${r * 0.26} l${-r * 0.14} ${r * 0.42} h${-r * 0.44} l${-r * 0.14} ${-r * 0.42} Z" fill="${ouro ? "#7A5510" : "#1b1b1b"}"/><path d="M${cx} ${cy - r * 0.38} V${cy - r} M${cx + r * 0.36} ${cy - r * 0.12} L${cx + r * 0.95} ${cy - r * 0.3} M${cx + r * 0.22} ${cy + r * 0.3} L${cx + r * 0.55} ${cy + r * 0.8} M${cx - r * 0.22} ${cy + r * 0.3} L${cx - r * 0.55} ${cy + r * 0.8} M${cx - r * 0.36} ${cy - r * 0.12} L${cx - r * 0.95} ${cy - r * 0.3}" stroke="${ouro ? "#7A5510" : "#1b1b1b"}" stroke-width="1.4"/></g>`;
const chuteira = (cx: number, cy: number, s: number) => `<g transform="translate(${cx} ${cy}) scale(${s}) rotate(-12)"><path d="M-30 -6 C-30 -16 -22 -20 -14 -18 L4 -12 C14 -8 22 -2 30 2 C34 4 34 10 30 12 L-28 12 C-32 12 -32 6 -30 -6 Z" fill="url(#tg)" stroke="#7A5510" stroke-width="1.5"/><path d="M-12 -14 L-4 -2 M-4 -12 L4 -1 M4 -9 L10 1" stroke="#7A5510" stroke-width="1.6"/>${[-22, -10, 4, 18].map((x) => `<rect x="${x}" y="12" width="5" height="5" rx="1" fill="#7A5510"/>`).join("")}</g>`;
const estrela = (cx: number, cy: number, r: number) => { const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`; }).join(" "); return `<polygon points="${pts}" fill="url(#tg)" stroke="#7A5510" stroke-width="1.5"/>`; };
const luva = (cx: number, cy: number, s: number) => `<g transform="translate(${cx} ${cy}) scale(${s})"><path d="M-16 18 V-6 C-16 -10 -10 -10 -10 -6 V-16 C-10 -21 -4 -21 -4 -16 V-20 C-4 -25 2 -25 2 -20 V-16 C2 -21 8 -21 8 -16 V-8 C8 -12 14 -12 14 -8 V8 C14 16 8 22 0 22 H-12 Z" fill="url(#tg)" stroke="#7A5510" stroke-width="1.5"/><rect x="-17" y="18" width="30" height="8" rx="2" fill="#7A5510"/></g>`;
const defsOuro = `<linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF1B8"/><stop offset=".4" stop-color="#F2C94C"/><stop offset=".7" stop-color="#D4A12A"/><stop offset="1" stop-color="#8A6414"/></linearGradient>`;
/** Raios (explosão de quadrinho) em duas cores. */
function raios(cx: number, cy: number, a: string, b: string, n = 18) {
  return Array.from({ length: n }, (_, i) => { const a0 = (i / n) * Math.PI * 2, a1 = ((i + 0.5) / n) * Math.PI * 2, R = 260; return `<path d="M${cx} ${cy} L${cx + Math.cos(a0) * R} ${cy + Math.sin(a0) * R} L${cx + Math.cos(a1) * R} ${cy + Math.sin(a1) * R} Z" fill="${i % 2 ? a : b}"/>`; }).join("");
}
function confete(seed: string, cores: string[], n = 34) {
  let h = hashN(seed);
  const r = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 1000) / 1000;
  return Array.from({ length: n }, () => `<rect x="${(r() * 160).toFixed(1)}" y="${(r() * 150).toFixed(1)}" width="${(2 + r() * 4).toFixed(1)}" height="${(1.5 + r() * 2.5).toFixed(1)}" fill="${cores[Math.floor(r() * cores.length)]}" transform="rotate(${Math.round(r() * 180)} ${(r() * 160).toFixed(1)} ${(r() * 150).toFixed(1)})" opacity=".9"/>`).join("");
}

// ------------------------------------------------------------------ artes
function artTemporada(f: Figurinha, c: CtxFig, id: string): string {
  const p = paleta(f), tecnico = f.tipo === "tecnico", x = f.extra ?? {};
  const fundo = tecnico
    ? `<rect width="160" height="230" fill="#1F5A36"/><rect width="160" height="230" fill="url(#lis${id})"/><g fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"><rect x="10" y="30" width="140" height="190"/><line x1="10" y1="125" x2="150" y2="125"/><circle cx="80" cy="125" r="20"/><rect x="45" y="30" width="70" height="26"/><rect x="45" y="194" width="70" height="26"/></g><g stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"><path d="M30 70 l8 8 m0 -8 l-8 8"/><circle cx="122" cy="88" r="5"/><path d="M38 80 Q70 60 116 86" stroke-dasharray="4 3"/></g><rect width="160" height="230" fill="${p.fundo}" opacity=".32"/>`
    : `<rect width="160" height="230" fill="url(#fd${id})"/><rect width="160" height="230" fill="url(#lis${id})"/><text x="150" y="150" text-anchor="end" font-family="${D}" font-weight="900" font-size="120" fill="${p.outra}" opacity=".16">${esc(f.numero || "")}</text>`;
  const nums: [string, string | number][] = tecnico
    ? [["JOGOS", x.j ?? f.jogos], ["V", x.v ?? 0], ["E", x.e ?? 0], ["D", x.d ?? 0]]
    : [["JOGOS", f.jogos], ["GOLS", f.gols], ["ASSIST.", f.assist], ["OVR", f.ovr]];
  const sub = tecnico ? `${f.clube} · ${x.pos ? `${x.pos}º lugar` : ""}${x.aprov !== undefined ? ` · ${x.aprov}%` : ""}` : `${f.clube} · ${f.posicao}${f.numero ? ` · camisa ${f.numero}` : ""}`;
  return `<defs><linearGradient id="fd${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(p.fundo, "#ffffff", 0.12)}"/><stop offset="1" stop-color="${p.escuro}"/></linearGradient>
    <pattern id="lis${id}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><rect width="7" height="14" fill="#fff" opacity=".06"/></pattern></defs>
    ${fundo}
    ${pos(c.retrato(f), 14, 26, 132, 158, "xMidYMax meet")}
    ${pos(c.escudo(f.clubeId), 8, 6, 28, 32)}
    ${chipAno(String(f.ano))}
    ${tecnico ? `<rect x="8" y="148" width="58" height="14" rx="7" fill="#0B1410" opacity=".85"/><text x="37" y="158" text-anchor="middle" font-family="${D}" font-weight="900" font-size="9" letter-spacing=".6" fill="#E3B341">TÉCNICO</text>` : ""}
    ${placa(p, c.nome, sub, nums)}`;
}
function artEscudo(f: Figurinha, c: CtxFig, id: string): string {
  const p = paleta(f), ouro = f.raridade === "lenda" || f.raridade === "brilhante";
  return `<defs><linearGradient id="fo${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ouro ? "#FFF1B8" : "#F4F6F8"}"/><stop offset=".3" stop-color="${ouro ? "#D4A12A" : "#AEB6BD"}"/><stop offset=".5" stop-color="${ouro ? "#FFF8DC" : "#FFFFFF"}"/><stop offset=".72" stop-color="${ouro ? "#C9971F" : "#8B949C"}"/><stop offset="1" stop-color="${ouro ? "#7A5510" : "#5D656C"}"/></linearGradient>
    <pattern id="gd${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1" height="8" fill="#fff" opacity=".35"/></pattern>
    <radialGradient id="rc${id}" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="${p.fundo}" stop-opacity=".55"/><stop offset="1" stop-color="${p.fundo}" stop-opacity="0"/></radialGradient></defs>
    <rect width="160" height="230" fill="url(#fo${id})"/><rect width="160" height="230" fill="url(#gd${id})"/><circle cx="80" cy="96" r="76" fill="url(#rc${id})"/>
    ${pos(c.escudo(f.clubeId), 26, 30, 108, 128)}
    ${rotulo("ESCUDO")}${chipAno(String(f.ano))}
    ${placa(p, f.clube, f.legenda)}`;
}
function artTitulo(f: Figurinha, c: CtxFig, id: string): string {
  const p = paleta(f), [l1, l2] = duas(f.legenda.replace(/^Campeão:?\s*/i, ""), 20);
  return `<defs><radialGradient id="rt${id}" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="${mix(p.fundo, "#ffffff", 0.18)}"/><stop offset="1" stop-color="#05090A"/></radialGradient></defs>
    <rect width="160" height="230" fill="url(#rt${id})"/>${confete(f.id, [p.c1, p.c2, "#F2C94C", "#ffffff"])}
    <circle cx="80" cy="70" r="52" fill="#F2C94C" opacity=".14"/>
    ${taca(80, 22, 1.05)}
    ${pos(c.retrato(f), 92, 70, 66, 80, "xMidYMax meet")}
    ${pos(c.escudo(f.clubeId), 8, 104, 30, 36)}
    <text x="80" y="160" text-anchor="middle" font-family="${D}" font-weight="900" font-size="24" letter-spacing="1" fill="#F6D77A" stroke="#2a1d05" stroke-width=".6">CAMPEÃO</text>
    ${chipAno(String(f.ano))}
    ${placa(p, l1, l2 || f.clube)}`;
}
function artPremio(f: Figurinha, c: CtxFig, id: string): string {
  const p = paleta(f), a = f.arte ?? "estrela", [l1, l2] = duas(f.legenda.replace(/\s*\d{4}$/, ""), 13);
  const icone = a === "bola" ? bola(80, 62, 34, true) : a === "chuteira" ? chuteira(80, 64, 1.5) : a === "luva" ? luva(80, 62, 1.6) : estrela(80, 62, 38);
  return `<defs><radialGradient id="rp${id}" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#3A2A08"/><stop offset="1" stop-color="#0A0804"/></radialGradient></defs>
    <rect width="160" height="230" fill="url(#rp${id})"/><g opacity=".22">${raios(80, 62, "#F2C94C", "transparent", 22)}</g>
    ${icone}
    ${pos(c.retrato(f), 0, 92, 80, 92, "xMidYMax meet")}
    <text x="118" y="122" text-anchor="middle" font-family="${D}" font-weight="900" font-size="12" fill="#F6D77A">${esc(l1.toUpperCase())}</text>
    ${l2 ? `<text x="118" y="136" text-anchor="middle" font-family="${D}" font-weight="900" font-size="12" fill="#F6D77A">${esc(l2.toUpperCase())}</text>` : ""}
    <text x="118" y="${l2 ? 152 : 138}" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#fff" opacity=".75">${f.ano}</text>
    ${rotulo("PRÊMIO", "#7A5510")}
    ${placa(p, c.nome, `${f.clube} · ${f.ano}`)}`;
}
function artSelecao(f: Figurinha, c: CtxFig, id: string): string {
  const p = paleta(f);
  return `<defs><linearGradient id="sd${id}" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient></defs>
    ${pos(c.bandeira(f.clubeId.slice(4)), -40, 0, 240, 190, "xMidYMid slice")}<rect width="160" height="190" fill="url(#sd${id})"/>
    ${pos(c.retrato(f), 14, 30, 132, 152, "xMidYMax meet")}
    <rect x="-10" y="132" width="180" height="20" fill="#0B1410" opacity=".85" transform="rotate(-6 80 142)"/><text x="80" y="146" text-anchor="middle" font-family="${D}" font-weight="900" font-size="14" letter-spacing="3" fill="#F6D77A" transform="rotate(-6 80 142)">CONVOCADO</text>
    ${chipAno(String(f.ano))}
    ${placa(p, c.nome, f.legenda)}`;
}
const PALAVRA: Partial<Record<Figurinha["tipo"], string>> = { hattrick: "HAT-TRICK", golaco: "GOLAÇO", capitao: "CAPITÃO", estreia: "ESTREIA", acesso: "ACESSO", marco: "MARCA" };
function artMomento(f: Figurinha, c: CtxFig, id: string): string {
  const p = paleta(f), x = f.extra ?? {};
  const marco = f.tipo === "marco", grande = marco ? String(x.n ?? "") : PALAVRA[f.tipo] ?? NOME_TIPO_FIG[f.tipo].toUpperCase();
  const unid = marco ? String(x.unidade ?? "").toUpperCase() : "";
  const braco = f.tipo === "capitao" ? `<g transform="translate(22 100) rotate(-14)"><rect x="0" y="0" width="34" height="18" rx="4" fill="#F2C94C" stroke="#2a1d05" stroke-width="1.4"/><text x="17" y="14" text-anchor="middle" font-family="${D}" font-weight="900" font-size="15" fill="#2a1d05">C</text></g>` : "";
  const bolaG = f.tipo === "golaco" || f.tipo === "hattrick" ? bola(28, 112, 14, false) + (f.tipo === "hattrick" ? bola(48, 124, 10, false) + bola(18, 134, 9, false) : "") : "";
  return `<rect width="160" height="230" fill="${p.escuro}"/><g opacity=".9">${raios(80, 96, p.fundo, mix(p.fundo, "#000000", 0.3), 20)}</g>
    <circle cx="80" cy="96" r="58" fill="#fff" opacity=".08"/>
    ${pos(c.retrato(f), 20, 40, 120, 144, "xMidYMax meet")}
    ${braco}${bolaG}
    <text x="80" y="${marco ? 66 : 50}" text-anchor="middle" font-family="${D}" font-weight="900" font-size="${marco ? 52 : grande.length > 8 ? 25 : 30}" fill="#fff" stroke="#0B1410" stroke-width="2.4" paint-order="stroke" letter-spacing="1">${esc(grande)}</text>
    ${marco ? `<text x="80" y="82" text-anchor="middle" font-family="${D}" font-weight="900" font-size="15" letter-spacing="3" fill="#F6D77A" stroke="#0B1410" stroke-width="1.6" paint-order="stroke">${esc(unid)}</text>` : ""}
    ${pos(c.escudo(f.clubeId), 8, 6, 26, 30)}${chipAno(String(f.ano))}
    ${placa(p, c.nome, f.legenda)}`;
}
function artVida(f: Figurinha, c: CtxFig, id: string): string {
  const filho = f.tipo === "filho", foto1 = filho ? c.filho?.(f) ?? c.retrato(f) : c.retrato(f), foto2 = filho ? undefined : c.parceira?.(f);
  const fitas = `<rect x="18" y="12" width="36" height="12" fill="#F3E3A0" opacity=".75" transform="rotate(-18 36 18)"/><rect x="106" y="12" width="36" height="12" fill="#F3E3A0" opacity=".75" transform="rotate(16 124 18)"/>`;
  const fotos = foto2 ? `${pos(foto2, 22, 30, 58, 118, "xMidYMax slice")}${pos(foto1, 80, 30, 58, 118, "xMidYMax slice")}` : pos(foto1, 22, 30, 116, 118, "xMidYMid slice");
  const [l1, l2] = duas(f.legenda, 24);
  return `<defs><pattern id="ct${id}" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#8a6a3a" opacity=".25"/><circle cx="4" cy="4" r=".6" fill="#8a6a3a" opacity=".18"/></pattern>
    <linearGradient id="ft${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${filho ? "#BFE3F2" : "#F6C9C2"}"/><stop offset="1" stop-color="${filho ? "#7FB6D9" : "#D98C8C"}"/></linearGradient></defs>
    <rect width="160" height="230" fill="#C9A672"/><rect width="160" height="230" fill="url(#ct${id})"/>
    <g transform="rotate(-2.5 80 110)"><rect x="12" y="20" width="136" height="186" rx="3" fill="#FFFDF7" stroke="#e7dfcc"/><rect x="22" y="30" width="116" height="118" fill="url(#ft${id})"/>${fotos}
    <text x="80" y="172" text-anchor="middle" font-family="'Segoe Script','Bradley Hand','Comic Sans MS',cursive" font-size="12" fill="#2b3a67">${esc(l1)}</text>
    ${l2 ? `<text x="80" y="188" text-anchor="middle" font-family="'Segoe Script','Bradley Hand','Comic Sans MS',cursive" font-size="12" fill="#2b3a67">${esc(l2)}</text>` : ""}
    <text x="130" y="200" text-anchor="end" font-family="'Segoe Script','Bradley Hand','Comic Sans MS',cursive" font-size="10" fill="#8a6a3a">${f.ano}</text></g>${fitas}
    ${filho ? `<text x="80" y="223" text-anchor="middle" font-family="${D}" font-weight="900" font-size="10" letter-spacing="2" fill="#3b2a12">BEM-VINDO(A) AO MUNDO</text>` : `<text x="80" y="223" text-anchor="middle" font-family="${D}" font-weight="900" font-size="10" letter-spacing="2" fill="#3b2a12">FAMÍLIA</text>`}`;
}
function artPatrocinio(f: Figurinha, c: CtxFig, id: string): string {
  const k = f.contrato!, p = paleta(f), logo = c.marca?.(f) ?? "";
  const curto = (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1).replace(".", ",")} mi` : v >= 1e3 ? `${Math.round(v / 1e3)} mil` : String(v);
  return `<defs><pattern id="pt${id}" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="10" fill="${p.c2}" opacity=".14"/></pattern></defs>
    <rect width="160" height="230" fill="${p.papel}"/><rect width="160" height="104" fill="${p.c1}"/><rect y="60" width="160" height="44" fill="url(#pt${id})"/>
    ${pos(logo, 14, 22, 132, 66)}
    ${pos(c.retrato(f), 92, 64, 66, 84, "xMidYMax meet")}
    ${rotulo("CONTRATO")}
    <text x="12" y="128" font-family="${D}" font-weight="900" font-size="22" fill="${p.tinta}">${esc(curto(k.mensal))}</text>
    <text x="12" y="140" font-family="sans-serif" font-size="7.5" letter-spacing="1.5" fill="${p.tinta}" opacity=".7">POR MÊS · ${k.meses} MESES</text>
    ${k.luvas ? `<text x="12" y="154" font-family="sans-serif" font-size="7.5" fill="${p.tinta}" opacity=".7">LUVAS ${esc(curto(k.luvas))}</text>` : ""}
    ${placa(p, c.nome, f.legenda)}`;
}
function artDespedida(f: Figurinha, c: CtxFig, id: string): string {
  const p = paleta(f), x = f.extra ?? {};
  return `<rect width="160" height="230" fill="#07090A"/><g opacity=".25">${raios(80, 70, "#E3B341", "transparent", 26)}</g>
    ${pos(c.retrato(f), 14, 26, 132, 150, "xMidYMax meet")}
    <text x="80" y="160" text-anchor="middle" font-family="${D}" font-weight="900" font-size="26" letter-spacing="2" fill="url(#ou${id})" stroke="#000" stroke-width=".6">OBRIGADO</text>
    ${chipAno(String(f.ano), 118, "#7A5510")}
    ${placa(p, c.nome, f.legenda, [["JOGOS", x.j ?? f.jogos], [x.tec ? "VITÓRIAS" : "GOLS", x.g ?? f.gols], ["TÍTULOS", x.t ?? 0]])}`;
}
/** A figurinha (svg 160×230). */
export function figurinhaArte(f: Figurinha, c: CtxFig): string {
  const id = `${f.id.replace(/[^a-zA-Z0-9]/g, "")}${++seq}`;
  const corpo = f.tipo === "temporada" || f.tipo === "tecnico" ? artTemporada(f, c, id) : f.tipo === "escudo" ? artEscudo(f, c, id) : f.tipo === "titulo" ? artTitulo(f, c, id)
    : f.tipo === "premio" ? artPremio(f, c, id) : f.tipo === "selecao" ? artSelecao(f, c, id) : f.tipo === "familia" || f.tipo === "filho" ? artVida(f, c, id)
    : f.tipo === "patrocinio" && f.contrato ? artPatrocinio(f, c, id) : f.tipo === "despedida" ? artDespedida(f, c, id) : artMomento(f, c, id);
  return `<svg viewBox="0 0 160 230" class="fig-svg" role="img" aria-label="${esc(NOME_TIPO_FIG[f.tipo])} ${f.ano}"><defs>${defsBase(id)}${defsOuro}</defs><g clip-path="url(#ck${id})">${corpo}${brilho(f, id)}</g>${borda(f, id)}</svg>`;
}

// ------------------------------------------------------------------ o livro
const ORDEM: Figurinha["tipo"][] = ["escudo", "temporada", "tecnico", "titulo", "premio", "selecao", "capitao", "estreia", "acesso", "marco", "hattrick", "golaco", "despedida", "familia", "filho", "patrocinio"];
export interface PaginaAlb { ano: number; parte: number; partes: number; fs: Figurinha[] }
/** Páginas: uma por temporada (mais de 4 figurinhas no ano viram outra página do mesmo ano). */
export function paginasAlbum(figs: Figurinha[]): PaginaAlb[] {
  const anos = [...new Set(figs.map((f) => f.ano))].sort((a, b) => a - b);
  return anos.flatMap((ano) => {
    const fs = figs.filter((f) => f.ano === ano).sort((a, b) => ORDEM.indexOf(a.tipo) - ORDEM.indexOf(b.tipo));
    const partes = Math.ceil(fs.length / 4);
    return Array.from({ length: partes }, (_, k) => ({ ano, parte: k + 1, partes, fs: fs.slice(k * 4, k * 4 + 4) }));
  });
}
/** Número da figurinha no álbum (ordem de chegada, como no álbum de banca). */
const numeroDe = (figs: Figurinha[], f: Figurinha) => {
  const ord = [...figs].sort((a, b) => a.ano - b.ano || ORDEM.indexOf(a.tipo) - ORDEM.indexOf(b.tipo));
  return ord.indexOf(f) + 1;
};
const CSS = `
.alb{position:relative;perspective:1600px;user-select:none;-webkit-user-select:none;touch-action:pan-y}
.alb-folha{position:relative;background:#FBF6E9;color:#0B1410;border-radius:4px 10px 10px 4px;box-shadow:0 10px 26px #0007,inset 10px 0 18px -10px #0005,inset 0 0 0 1px #d9ceb0;padding:14px 14px 12px 20px;min-height:560px;box-sizing:border-box;display:flex;flex-direction:column}
.alb-folha::before{content:"";position:absolute;left:0;top:0;bottom:0;width:10px;background:linear-gradient(90deg,#0003,#0000);border-radius:4px 0 0 4px}
.alb-cab{display:flex;align-items:center;gap:8px;border-bottom:2px solid #0B1410;padding-bottom:6px}
.alb-cab .m{font-family:'Big Shoulders Display',sans-serif;font-weight:900;letter-spacing:.14em;font-size:12px}
.alb-cab .a{margin-left:auto;font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:34px;line-height:.9}
.alb-cab .esc{display:flex;gap:4px}.alb-cab .esc svg{width:22px;height:26px}
.alb-sub{font-size:12px;color:#6b5a2c;margin:6px 0 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.alb-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 12px;flex:1;align-content:start}
.alb-grid.n1{grid-template-columns:minmax(0,62%);justify-content:center}
.alb-slot{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0}
.alb-slot button{all:unset;cursor:zoom-in;display:block;width:100%;border-radius:12px}
.alb-slot button:focus-visible{outline:3px solid #E3B341;outline-offset:2px}
.alb-slot .fig{width:100%;box-sizing:border-box}
.alb-slot .leg{font-size:10px;color:#5b5440;text-align:center;line-height:1.25;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.alb-slot .leg b{font-family:'Big Shoulders Display',sans-serif;font-weight:900;color:#0B1410;margin-right:4px}
.alb-rod{display:flex;align-items:center;justify-content:space-between;margin-top:12px;gap:8px}
.alb-rod span{font-size:12px;color:#5b5440;text-align:center;flex:1}
.alb-seta{width:42px;height:42px;border-radius:99px;border:0;background:#0B1410;color:#FBF6E9;font-size:22px;cursor:pointer}
.alb-seta:disabled{opacity:.25;cursor:default}
.alb-virando{position:absolute;inset:0;transform-style:preserve-3d;z-index:5;pointer-events:none}
.alb-virando>.lado{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.alb-virando>.verso{transform:rotateY(180deg)}
.alb-virando>.verso .alb-folha{background:linear-gradient(270deg,#e9dfc6,#FBF6E9 30%);}
.alb-virando.frente{transform-origin:left center;animation:albVira .7s cubic-bezier(.3,.1,.25,1) forwards}
.alb-virando.tras{transform-origin:left center;animation:albVolta .7s cubic-bezier(.3,.1,.25,1) forwards}
.alb-virando .sombra{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(90deg,#0000 40%,#0006);opacity:0;animation:albSombra .7s ease forwards;pointer-events:none}
@keyframes albVira{0%{transform:rotateY(0)}100%{transform:rotateY(-180deg)}}
@keyframes albVolta{0%{transform:rotateY(-180deg)}100%{transform:rotateY(0)}}
@keyframes albSombra{0%{opacity:0}50%{opacity:1}100%{opacity:0}}
@media (prefers-reduced-motion: reduce){.alb-virando{display:none}}
.alb-capa{min-height:560px;border-radius:6px 14px 14px 6px;background:radial-gradient(circle at 70% 20%,#2c5c43,#0B1410 70%);color:#E3B341;box-shadow:0 10px 26px #0007,inset 12px 0 18px -10px #000a;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px;padding:20px;box-sizing:border-box;border:3px solid #E3B341;outline:6px solid #0B1410}
.alb-capa .t{font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:46px;line-height:.9;letter-spacing:.04em}
.alb-capa .s{letter-spacing:.3em;font-size:11px;text-transform:uppercase;color:#cfe3d6}
.alb-capa .n{font-family:'Big Shoulders Display',sans-serif;font-weight:900;font-size:26px;color:#fff;margin-top:10px}
.alb-capa .mini{display:flex;gap:6px;margin:14px 0 6px;transform:rotate(-4deg)}.alb-capa .mini .fig{width:64px}
.alb-capa .q{font-size:12px;color:#cfe3d6}
.alb-capa button{margin-top:14px}
.alb-zoom{position:absolute;inset:-6px;z-index:9;background:#0B1410f2;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px;box-sizing:border-box;cursor:zoom-out}
.alb-zoom .fig{width:min(290px,78vw)}
.alb-zoom p{color:#E7EFE9;margin:0;text-align:center;font-size:13px}.alb-zoom .r{font-family:'Big Shoulders Display',sans-serif;font-weight:900;letter-spacing:.12em;color:#E3B341;font-size:12px}
.alb-topo{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px}
.alb-topo .ind{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none}.alb-topo .ind button{flex:none;border:1px solid #E3B34166;background:#0B1410;color:#E3B341;border-radius:99px;font-size:11px;padding:4px 8px;cursor:pointer}
.alb-topo .ind button.on{background:#E3B341;color:#0B1410}
.fig{position:relative;display:block;border-radius:13px;padding:3px;background:#c9cfcc}
.fig .fig-svg{display:block;width:100%;height:auto;border-radius:11px}
.fig.prata{background:linear-gradient(135deg,#f4f6f8,#9aa3ab 45%,#eef1f3 70%,#8b949c)}
.fig.brilhante{background:linear-gradient(120deg,#ff8acb,#ffd36b,#7cf0c5,#7cc3ff,#c39bff,#ff8acb);background-size:300% 300%;animation:holo 4s ease-in-out infinite}
.fig.lenda{background:linear-gradient(135deg,#2a1d05,#E3B341 30%,#fff1b8 50%,#E3B341 70%,#2a1d05);box-shadow:0 0 14px #E3B34199}
@keyframes holo{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@media (prefers-reduced-motion: reduce){.fig.brilhante{animation:none}}
`;
function injetarCss() { if (typeof document === "undefined" || document.getElementById("css-album")) return; const st = document.createElement("style"); st.id = "css-album"; st.textContent = CSS; document.head.appendChild(st); }

export interface OpcoesAlbum { figs: () => Figurinha[]; ctx: () => CtxFig; nome: () => string; fechar?: () => void; rodape?: () => string }
/** O álbum montado dentro de um elemento: capa, páginas que viram (setas, índice por ano, arrastar o dedo) e zoom. */
export class Album {
  private pag = -1; private ocupado = false; private x0?: number;
  constructor(private root: HTMLElement, private o: OpcoesAlbum) {
    injetarCss();
    root.addEventListener("click", (e) => this.clique(e));
    root.addEventListener("touchstart", (e) => { this.x0 = e.touches[0]?.clientX; }, { passive: true });
    root.addEventListener("touchend", (e) => { const x = e.changedTouches[0]?.clientX; if (this.x0 === undefined || x === undefined) return; const dx = x - this.x0; this.x0 = undefined; if (Math.abs(dx) > 55) this.ir(this.pag + (dx < 0 ? 1 : -1)); });
  }
  abrir(pag?: number) { const n = paginasAlbum(this.o.figs()).length; this.pag = pag === undefined ? n - 1 : pag; this.desenhar(); }
  private paginaHtml(i: number): string {
    const figs = this.o.figs(), ps = paginasAlbum(figs), c = this.o.ctx();
    if (i < 0) {
      const anos = ps.map((p) => p.ano), raras = figs.filter((f) => f.raridade === "brilhante" || f.raridade === "lenda").length;
      const mini = [...figs].sort((a, b) => ["comum", "prata", "brilhante", "lenda"].indexOf(b.raridade) - ["comum", "prata", "brilhante", "lenda"].indexOf(a.raridade)).slice(0, 3);
      return `<div class="alb-capa"><div class="s">Álbum oficial de figurinhas</div><div class="t">MY<br>CARREIRINHA</div><div class="n">${esc(this.o.nome())}</div>
        ${anos.length ? `<div class="s">${anos[0]}–${anos[anos.length - 1]}</div>` : ""}
        ${mini.length ? `<div class="mini">${mini.map((f) => `<span class="fig ${f.raridade}">${figurinhaArte(f, c)}</span>`).join("")}</div>` : ""}
        <div class="q">${figs.length} figurinhas · ${raras} brilhantes ou lendas · ${ps.length} ${ps.length === 1 ? "página" : "páginas"}</div>
        ${ps.length ? `<button class="botao" data-alb="0">Abrir o álbum ›</button>` : `<p class="q">A primeira figurinha chega no fim da primeira temporada.</p>`}</div>`;
    }
    const p = ps[i];
    if (!p) return "";
    const clubes = [...new Set(p.fs.filter((f) => !f.clubeId.startsWith("sel-") && !f.clubeId.startsWith("marca-")).map((f) => f.clubeId))];
    const nomes = [...new Set(p.fs.filter((f) => !f.clubeId.startsWith("sel-") && !f.clubeId.startsWith("marca-")).map((f) => f.clube))];
    return `<div class="alb-folha"><div class="alb-cab"><span class="m">MY CARREIRINHA</span><span class="esc">${clubes.slice(0, 3).map((id) => c.escudo(id)).join("")}</span><span class="a">${p.ano}</span></div>
      <div class="alb-sub">${esc(nomes.join(" · ") || "Seleção e momentos")}${p.partes > 1 ? ` · página ${p.parte} de ${p.partes} do ano` : ""}</div>
      <div class="alb-grid n${p.fs.length}">${p.fs.map((f, k) => `<div class="alb-slot"><button data-alb-zoom="${k}" aria-label="Ampliar ${esc(NOME_TIPO_FIG[f.tipo])}"><span class="fig ${f.raridade}">${figurinhaArte(f, c)}</span></button><span class="leg"><b>Nº ${numeroDe(figs, f)}</b>${esc(NOME_TIPO_FIG[f.tipo])}</span></div>`).join("")}</div>
      <div class="alb-rod"><button class="alb-seta" data-alb="${i - 1}" aria-label="Página anterior">‹</button><span>Página ${i + 1} de ${ps.length}</span><button class="alb-seta" data-alb="${i + 1}" ${i >= ps.length - 1 ? "disabled" : ""} aria-label="Próxima página">›</button></div></div>`;
  }
  private topo(): string {
    const ps = paginasAlbum(this.o.figs()), anos = [...new Set(ps.map((p) => p.ano))];
    const i = this.pag, anoAtual = ps[i]?.ano;
    return `<div class="alb-topo"><div class="ind"><button class="${i < 0 ? "on" : ""}" data-alb="-1">Capa</button>${anos.map((a) => `<button class="${a === anoAtual ? "on" : ""}" data-alb="${ps.findIndex((p) => p.ano === a)}">${a}</button>`).join("")}</div>${this.o.fechar ? `<button class="botao sec peq" data-alb-fechar>Fechar</button>` : ""}</div>`;
  }
  private desenhar(virando?: { de: number; para: number }) {
    const atual = this.paginaHtml(this.pag);
    let flip = "";
    if (virando) {
      const frente = virando.para > virando.de;
      // para frente: a folha atual (de cima) vira para a esquerda e mostra o verso; para trás: a anterior volta por cima
      flip = frente
        ? `<div class="alb-virando frente"><div class="lado">${this.paginaHtml(virando.de)}<div class="sombra"></div></div><div class="lado verso"><div class="alb-folha"></div></div></div>`
        : `<div class="alb-virando tras"><div class="lado">${atual}<div class="sombra"></div></div><div class="lado verso"><div class="alb-folha"></div></div></div>`;
    }
    const baixo = virando && virando.para < virando.de ? this.paginaHtml(virando.de) : atual;
    this.root.innerHTML = `${this.topo()}<div class="alb">${baixo}${flip}</div>${this.o.rodape?.() ?? ""}`;
    if (virando) {
      this.ocupado = true;
      const fim = () => { this.ocupado = false; this.desenhar(); };
      const el = this.root.querySelector(".alb-virando");
      if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) fim(); else { el.addEventListener("animationend", fim, { once: true }); setTimeout(() => { if (this.ocupado) fim(); }, 900); }
    }
  }
  ir(n: number) {
    const total = paginasAlbum(this.o.figs()).length;
    if (this.ocupado || n < -1 || n >= total || n === this.pag) return;
    const de = this.pag; this.pag = n;
    this.desenhar({ de, para: n });
  }
  private clique(e: Event) {
    const t = (e.target as Element).closest<HTMLElement>("[data-alb],[data-alb-zoom],[data-alb-fechar],.alb-zoom");
    if (!t || !this.root.contains(t)) return;
    if (t.classList.contains("alb-zoom")) { t.remove(); return; }
    if (t.dataset.albFechar !== undefined) { this.o.fechar?.(); return; }
    if (t.dataset.albZoom !== undefined) {
      const p = paginasAlbum(this.o.figs())[this.pag], f = p?.fs[+t.dataset.albZoom];
      if (!f) return;
      const z = document.createElement("div"); z.className = "alb-zoom";
      z.innerHTML = `<span class="fig ${f.raridade}">${figurinhaArte(f, this.o.ctx())}</span><p class="r">${esc(NOME_TIPO_FIG[f.tipo].toUpperCase())} · ${f.ano} · ${esc(NOME_RARIDADE[f.raridade].toUpperCase())}</p><p>${esc(f.legenda)}</p><p style="opacity:.6;font-size:12px">Toque para fechar</p>`;
      this.root.querySelector(".alb")?.appendChild(z);
      return;
    }
    if (t.dataset.alb !== undefined) this.ir(+t.dataset.alb);
  }
}
