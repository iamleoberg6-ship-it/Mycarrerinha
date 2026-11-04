// Estádio desenhado a partir dos dados do clube: a capacidade decide o tamanho e quantos anéis de arquibancada ele tem,
// as cores do clube pintam as cadeiras, os grandes ganham cobertura, e o nome vai no muro. Visto de cima, em ângulo.
export type FormatoEstadio = "oval" | "redondo" | "quadrado" | "retangular";
export interface DadosEstadio { nome: string; capacidade: number; cores: string[]; /** obra de ampliação em andamento: aparece um guindaste */ obra?: boolean; formato?: FormatoEstadio;
  /** cores das cadeiras de cada anel, de dentro para fora (estádio com cor própria, de nenhum clube) */ coresAneis?: string[] }

// ------------------------------------------------------------------ estádios divididos por mais de um clube
/** Estádio dividido: as cadeiras têm a cor do próprio estádio (nunca a de um dos clubes) e o formato é um só. */
const ESTADIO_PROPRIO: Record<string, { coresAneis: string[]; formato: FormatoEstadio }> = {
  "Estádio Maracajá": { coresAneis: ["#F2C200", "#1E8A45"], formato: "oval" },
  "San Ciro": { coresAneis: ["#B5282F", "#1C4C9C"], formato: "retangular" },
  "Olímpico de Roma": { coresAneis: ["#2C6FB7", "#8FB8E0"], formato: "oval" },
  "Olímpico Universitário": { coresAneis: ["#9A8F7E", "#C8BFAE"], formato: "oval" },
  "Atanasio": { coresAneis: ["#8E949B", "#B9BEC4"], formato: "oval" },
  "El Campín": { coresAneis: ["#8E949B", "#B9BEC4"], formato: "retangular" },
  "Azadi": { coresAneis: ["#8E949B", "#B9BEC4"], formato: "oval" },
};
const NEUTRO = ["#8E949B", "#B9BEC4"];
interface InfoEstadio { id: string; nome: string; estadio: string; capacidade: number; cores: string[]; pais: string; cidade: string }
let cacheDivididos: { fonte: unknown; mapa: Map<string, InfoEstadio[]> } | undefined;
const chaveEst = (i: InfoEstadio) => `${i.estadio}|${i.cidade}`;
/** O estádio de um clube como deve ser desenhado: se é dividido, o mesmo para todos os donos, com cor própria. */
export function aparenciaDoEstadio(info: InfoEstadio, todos: Record<string, InfoEstadio>): { dados: Omit<DadosEstadio, "obra">; divideCom: string[] } {
  if (!cacheDivididos || cacheDivididos.fonte !== todos) {
    const mapa = new Map<string, InfoEstadio[]>();
    for (const i of Object.values(todos)) if (i.estadio && !i.id.startsWith("NAT-")) mapa.set(chaveEst(i), [...(mapa.get(chaveEst(i)) ?? []), i]);
    cacheDivididos = { fonte: todos, mapa };
  }
  const donos = (info.estadio ? cacheDivididos.mapa.get(chaveEst(info)) : undefined) ?? [info];
  if (donos.length < 2) return { dados: { nome: info.estadio || `Estádio do ${info.nome}`, capacidade: info.capacidade, cores: info.cores, formato: formatoDoEstadio(info.id, info.pais, info.capacidade) }, divideCom: [] };
  const base = [...donos].sort((a, b) => b.capacidade - a.capacidade || a.id.localeCompare(b.id))[0], proprio = ESTADIO_PROPRIO[info.estadio];
  return {
    dados: { nome: info.estadio, capacidade: base.capacidade, cores: proprio?.coresAneis ?? NEUTRO, coresAneis: proprio?.coresAneis ?? NEUTRO, formato: proprio?.formato ?? formatoDoEstadio(base.id, base.pais, base.capacidade) },
    divideCom: donos.filter((x) => x.id !== info.id).map((x) => x.nome),
  };
}
/** Os estádios conhecidos têm o formato de verdade. */
const FORMATO_CLUBE: Record<string, FormatoEstadio> = {
  SAN: "quadrado", "EN-MUN": "quadrado", "EN-LIV": "quadrado", "DE-BVB": "quadrado", "EN-CHE": "quadrado", "EN-NEW": "quadrado", "SC-CEL": "quadrado", "SC-RAN": "quadrado",
  VAS: "quadrado", SPT: "quadrado", RBB: "quadrado", "IT-JUV": "quadrado", "DE-S04": "quadrado", "EN-TOT": "quadrado", "AR-BOC": "quadrado", "EN-AVL": "quadrado",
  PAL: "retangular", COR: "retangular", CAP: "retangular", GRE: "retangular", BOT: "retangular", "EN-MCI": "retangular", "NL-AJA": "retangular", "ES-RMA": "retangular",
  "ES-ATM": "retangular", "FR-PSG": "retangular", "PT-FCP": "retangular", "IT-MIL": "retangular", "IT-INT": "retangular", "NL-PSV": "retangular",
  FLA: "oval", FLU: "oval", CRU: "oval", "ES-BAR": "oval", "AR-RIV": "oval", "IT-ROM": "oval", INT: "oval", FOR: "oval", CEA: "oval", "EN-ARS": "oval", BAH: "oval",
  SPA: "redondo", "DE-FCB": "redondo", "PT-SLB": "redondo",
};
/** Os outros seguem o jeito do país: Inglaterra, Alemanha, Holanda e Escócia têm estádios quadrados; Itália e Argentina, ovais com pista. */
export function formatoDoEstadio(clubeId: string, pais: string, capacidade: number): FormatoEstadio {
  if (FORMATO_CLUBE[clubeId]) return FORMATO_CLUBE[clubeId];
  let h = 2166136261; for (const ch of clubeId) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const r = (h % 100) / 100;
  if (["ENG", "SCO", "GER", "NED", "BEL", "AUT", "SUI", "DEN", "NOR", "SWE"].includes(pais)) return r < 0.6 ? "quadrado" : "retangular";
  if (["ITA", "ARG", "URU", "CHI", "PAR", "PER", "COL", "ECU", "MEX"].includes(pais)) return r < 0.6 ? "oval" : r < 0.8 ? "retangular" : "redondo";
  if (["ESP", "POR", "FRA", "USA", "CAN", "JPN", "KOR", "CHN"].includes(pais)) return r < 0.6 ? "retangular" : r < 0.85 ? "quadrado" : "oval";
  if (capacidade < 25000) return r < 0.6 ? "quadrado" : "retangular";
  return r < 0.4 ? "oval" : r < 0.75 ? "retangular" : r < 0.88 ? "quadrado" : "redondo";
}

const f = (n: number) => Math.round(n * 10) / 10;
function mistura(a: string, b: string, t: number): string {
  const p = (h: string) => { const x = h.replace("#", ""); const v = x.length === 3 ? x.split("").map((c) => c + c).join("") : x; return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)); };
  const [r1, g1, b1] = p(a), [r2, g2, b2] = p(b);
  return `#${[r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}
const luz = (h: string) => { const x = h.replace("#", ""); const n = parseInt(x.length === 3 ? x.split("").map((c) => c + c).join("") : x, 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };

/** Anéis de arquibancada pela capacidade: estádio pequeno é um anel baixo; gigante, três anéis e cobertura. */
function aneis(cap: number): { largura: number; altura: number }[] {
  if (cap < 12000) return [{ largura: 20, altura: 9 }];
  if (cap < 30000) return [{ largura: 32, altura: 16 }];
  if (cap < 50000) return [{ largura: 30, altura: 15 }, { largura: 22, altura: 16 }];
  if (cap < 70000) return [{ largura: 30, altura: 15 }, { largura: 24, altura: 17 }, { largura: 16, altura: 13 }];
  return [{ largura: 32, altura: 16 }, { largura: 26, altura: 18 }, { largura: 20, altura: 16 }];
}

export function svgEstadio(d: DadosEstadio, largura = 400): string {
  const W = 400, H = 300, cx = 200, cy = 160, k = 0.62, hz = 0.6;
  const c1 = d.cores[0] ?? "#2E7D4F", c2 = d.cores[1] ?? "#FFFFFF";
  // cadeira escura demais some no desenho: clareia um pouco; branca demais vira cinza claro
  const assento = luz(c1) < 0.18 ? mistura(c1, "#FFFFFF", 0.22) : luz(c1) > 0.92 ? mistura(c1, "#9AA3AD", 0.35) : c1;
  const faixa = d.coresAneis ? "#E9EDF1" : luz(c2) > 0.92 ? "#FFFFFF" : c2;
  const tiers = aneis(d.capacidade), grande = d.capacidade >= 40000;
  // formato: uma superelipse (expoente 2 = oval/redondo; maior = mais quadrado), vista de cima com a altura z subindo na tela
  const formato = d.formato ?? "oval", expo = formato === "quadrado" ? 7 : formato === "retangular" ? 3.4 : 2;
  const ponto = (A: number, B: number, z: number, t: number): [number, number] => {
    const c = Math.cos(t), sn = Math.sin(t), e = 2 / expo;
    return [cx + A * Math.sign(c) * Math.pow(Math.abs(c), e), cy + B * k * Math.sign(sn) * Math.pow(Math.abs(sn), e) - z * hz];
  };
  const N = 120, angs = (a: number, b: number) => Array.from({ length: N / 2 + 1 }, (_, i) => a + ((b - a) * i) / (N / 2));
  const linha = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${f(x)} ${f(y)}`).join("");
  const elipse = (A: number, B: number, z: number) => linha(Array.from({ length: N }, (_, i) => ponto(A, B, z, (2 * Math.PI * i) / N))) + "Z";
  const metadeFrente = (A: number, B: number, zTopo: number, zBase: number) =>
    linha([...angs(Math.PI, 0).map((t) => ponto(A, B, zTopo, t)), ...angs(0, Math.PI).map((t) => ponto(A, B, zBase, t))]) + "Z";
  // planta: raio interno da arquibancada (em volta do campo) e cada anel para fora e para cima
  const A0 = formato === "redondo" ? 90 : formato === "quadrado" ? 94 : 100, B0 = formato === "redondo" ? 92 : formato === "quadrado" ? 68 : 72;
  const camadas: { Ai: number; Bi: number; zi: number; Ao: number; Bo: number; zo: number }[] = [];
  let Ai = A0, Bi = B0, zi = 1;
  for (const t of tiers) { const Ao = Ai + t.largura, Bo = Bi + t.largura, zo = zi + t.altura; camadas.push({ Ai, Bi, zi, Ao, Bo, zo }); Ai = Ao; Bi = Bo; zi = zo + 2; }
  const ext = camadas[camadas.length - 1], topo = ext.zo + (grande ? 5 : 2);
  const partes: string[] = [];
  partes.push(`<defs><linearGradient id="estSombra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient>
    <linearGradient id="estMuro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D5D8DC"/><stop offset="1" stop-color="#8E949B"/></linearGradient>
    <pattern id="estGrama" width="16" height="400" patternUnits="userSpaceOnUse"><rect width="8" height="400" fill="#2F8A4A"/><rect x="8" width="8" height="400" fill="#287A41"/></pattern></defs>`);
  // chão em volta e sombra
  partes.push(`<ellipse cx="${cx}" cy="${f(cy + 6)}" rx="${f(ext.Ao + 30)}" ry="${f((ext.Bo + 30) * k + 6)}" fill="#1B3A2C"/><path d="${elipse(ext.Ao + 4, ext.Bo + 4, -4)}" transform="translate(6 0)" fill="#000" opacity=".28"/>`);
  // refletores de trás (atrás do estádio)
  const refletor = (x: number, yBase: number, alto: number) => `<path d="M${f(x)} ${f(yBase)} V${f(yBase - alto)}" stroke="#5B636B" stroke-width="2.4"/><rect x="${f(x - 7)}" y="${f(yBase - alto - 6)}" width="14" height="7" rx="1.5" fill="#E9EEF2" stroke="#5B636B" stroke-width="1"/><ellipse cx="${f(x)}" cy="${f(yBase - alto - 2)}" rx="14" ry="6" fill="#FFF6C8" opacity=".25"/>`;
  const posRef = [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const, alturaRef = topo * hz + 22;
  const canto = (sx: number, sy: number) => { const [x, y] = ponto(ext.Ao * 1.02, ext.Bo * 1.02, 0, Math.atan2(sy, sx)); return [x, y] as const; };
  for (const [sx, sy] of posRef.filter(([, y]) => y < 0)) { const [x, y] = canto(sx, sy); partes.push(refletor(x, y - 2, alturaRef)); }
  // campo: o chão de dentro do estádio e o gramado, desenhados antes da arquibancada (ela cobre a borda, como de verdade)
  partes.push(`<path d="${elipse(A0, B0, 0)}" fill="#245E37"/><g transform="translate(${cx} ${cy}) scale(1 ${k})"><rect x="-64" y="-42" width="128" height="84" fill="url(#estGrama)"/>
    <g fill="none" stroke="#fff" stroke-width="2" opacity=".85"><rect x="-64" y="-42" width="128" height="84"/><path d="M0 -42 V42"/><circle r="10"/><rect x="-64" y="-17" width="18" height="34"/><rect x="46" y="-17" width="18" height="34"/></g></g>`);
  // muro externo (só a frente aparece)
  partes.push(`<path d="${metadeFrente(ext.Ao, ext.Bo, topo, 0)}" fill="url(#estMuro)" stroke="#5E656C" stroke-width="1"/>`);
  for (let i = 1; i <= 9; i++) { const [x, y] = ponto(ext.Ao, ext.Bo, 0, Math.PI * (1 - i / 10)); partes.push(`<path d="M${f(x)} ${f(y - topo + 2)} V${f(y - 1)}" stroke="#6F767D" stroke-width="1.2" opacity=".55"/>`); }
  // arquibancadas: de fora para dentro, cada anel com fileiras e uma faixa com a segunda cor
  [...camadas].reverse().forEach((c, idx) => {
    const tom = d.coresAneis ? mistura(d.coresAneis[(camadas.length - 1 - idx) % d.coresAneis.length], "#000000", idx * 0.06) : mistura(assento, "#000000", idx * 0.08);
    partes.push(`<path d="${elipse(c.Ao, c.Bo, c.zo)} ${elipse(c.Ai, c.Bi, c.zi)}" fill="${tom}" fill-rule="evenodd" stroke="#20262B" stroke-width="1"/>`);
    for (let r = 1; r <= 3; r++) { const t = r / 4, A = c.Ai + (c.Ao - c.Ai) * t, B = c.Bi + (c.Bo - c.Bi) * t, z = c.zi + (c.zo - c.zi) * t; partes.push(`<path d="${elipse(A, B, z)}" fill="none" stroke="${r === 2 ? faixa : "#000"}" stroke-width="${r === 2 ? 2.4 : 0.8}" opacity="${r === 2 ? 0.75 : 0.25}"/>`); }
    partes.push(`<path d="${elipse(c.Ao, c.Bo, c.zo)} ${elipse(c.Ai, c.Bi, c.zi)}" fill="url(#estSombra)" fill-rule="evenodd"/>`);
  });
  // cobertura dos grandes: um anel claro por cima da parte de fora
  if (grande) partes.push(`<path d="${elipse(ext.Ao + 3, ext.Bo + 3, topo)} ${elipse(ext.Ao - 18, ext.Bo - 18, topo - 1)}" fill="#EEF1F4" fill-rule="evenodd" stroke="#A9B0B7" stroke-width="1" opacity=".93"/>`);
  // refletores da frente e guindaste da obra
  for (const [sx, sy] of posRef.filter(([, y]) => y > 0)) { const [x, y] = canto(sx, sy); partes.push(refletor(x, y + 2, alturaRef + 6)); }
  if (d.obra) {
    const x = cx + ext.Ao * 0.55, y = cy - ext.Bo * k * 0.6;
    partes.push(`<g stroke="#E3A21A" stroke-width="2.4" fill="none"><path d="M${f(x)} ${f(y)} V${f(y - 92)} M${f(x - 18)} ${f(y - 86)} H${f(x + 70)} M${f(x)} ${f(y - 92)} L${f(x + 70)} ${f(y - 86)} M${f(x)} ${f(y - 92)} L${f(x - 18)} ${f(y - 86)}"/><path d="M${f(x + 54)} ${f(y - 86)} V${f(y - 50)}" stroke-width="1.2"/></g><rect x="${f(x + 48)}" y="${f(y - 50)}" width="12" height="8" fill="#5B636B"/>`);
  }
  // placa com nome e capacidade
  const nome = d.nome.length > 34 ? d.nome.slice(0, 33) + "…" : d.nome;
  partes.push(`<g transform="translate(${cx} ${H - 16})"><rect x="-150" y="-13" width="300" height="24" rx="12" fill="#0C1A17" opacity=".82"/><text y="4" text-anchor="middle" font-family="Barlow, system-ui, sans-serif" font-size="12.5" font-weight="700" fill="#EDF2EB">${nome.replace(/&/g, "&amp;").replace(/</g, "&lt;")} · ${d.capacidade.toLocaleString("pt-BR")} lugares</text></g>`);
  return `<svg class="estadio" viewBox="0 0 ${W} ${H}" width="${largura}" role="img" aria-label="${d.nome.replace(/"/g, "")}, ${d.capacidade} lugares" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="#14281F"/>${partes.join("")}</svg>`;
}
