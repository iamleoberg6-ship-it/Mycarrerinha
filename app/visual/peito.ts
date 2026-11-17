// Nome do patrocinador escrito no peito (quadro 100×44): a primeira palavra pequena em cima quando o nome tem duas
// (Fly / Emiratez), senão uma linha só. Letra escura ganha filete branco para aparecer sobre faixas e listras.
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
export interface FonteNome { familia: string; italico: boolean; peso: number }
export function nomeNoPeito(nome: string, cor: string, filete?: string | null, f?: FonteNome): string {
  const borda = filete === undefined ? (cor.toUpperCase() !== "#FFFFFF" ? "#FFFFFF" : null) : filete;
  const fil = borda ? ` stroke="${borda}" stroke-width="${filete ? 2.4 : 1.6}" paint-order="stroke" stroke-linejoin="round"` : "";
  const fonte = `font-family="${f?.familia ?? "Barlow, 'Arial Narrow', sans-serif"}" font-style="${f && !f.italico ? "normal" : "italic"}" font-weight="${f?.peso ?? 800}" text-anchor="middle" fill="${cor}"${fil}`;
  const [a, ...b] = nome.split(" ");
  if (b.length) return `<text x="50" y="13" font-size="15" ${fonte}>${esc(a)}</text><text x="50" y="38" font-size="${Math.min(27, 190 / Math.max(5, b.join(" ").length))}" letter-spacing="-.5" ${fonte}>${esc(b.join(" "))}</text>`;
  return `<text x="50" y="30" font-size="${Math.min(27, 180 / Math.max(5, nome.length))}" ${fonte}>${esc(a)}</text>`;
}
/** O nome da marca deitado, para a manga (quadro de 40×12, o texto ocupa a largura toda). */
export function nomeNaManga(nome: string, cor: string, filete?: string | null, f?: FonteNome): string {
  const fil = filete ? ` stroke="${filete}" stroke-width="1.4" paint-order="stroke" stroke-linejoin="round"` : "";
  return `<text x="20" y="9.4" text-anchor="middle" font-family="${f?.familia ?? "Barlow, 'Arial Narrow', sans-serif"}" font-style="${f && !f.italico ? "normal" : "italic"}" font-weight="${f?.peso ?? 800}" font-size="10" textLength="${Math.min(38, 6 + nome.length * 4)}" lengthAdjust="spacingAndGlyphs" fill="${cor}"${fil}>${esc(nome)}</text>`;
}

// ---- contraste dos patrocínios: a marca tem que aparecer em qualquer camisa (branca, listrada, com faixa) ----
const rgb = (c: string) => { const h = /^#[0-9a-f]{6}$/i.test(c) ? c : /^#[0-9a-f]{3}$/i.test(c) ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}` : "#808080"; return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); };
const lum = (c: string) => { const [r, g, b] = rgb(c).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
/** Contraste entre duas cores (1 = nenhum, 21 = preto no branco). */
export const contrasteCores = (a: string, b: string) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export type ParteCamisa = "peito" | "alto" | "manga";
/** As cores do tecido atrás de cada lugar da camisa: o meio do peito (master), o alto do peito (fornecedor) e a manga. */
export function coresAtras(padrao: string, cor1: string, cor2: string, faixas: string[] | undefined, parte: ParteCamisa): string[] {
  const l = [cor1];
  if (parte === "manga") return padrao === "centro" ? [cor2] : ["listrasV", "listrasH", "listrasHG"].includes(padrao) ? [cor1, cor2] : l;
  if (!padrao || padrao === "lisa" || padrao === "centro") return l;
  if (parte === "alto" && ["faixaH", "tresFaixasH", "duasFaixasH", "metade", "faixaV"].includes(padrao)) return l;
  if (["tresFaixasH", "duasFaixasH", "duasFaixasV"].includes(padrao)) return [...l, ...(faixas?.length ? faixas : [cor2])];
  return [cor1, cor2];
}
/** A cor da marca que aparece sobre todas as cores de trás (tenta a preferida, depois branco, preto e as cores da marca).
 *  Se nenhuma dá contraste com todas (listras preto e branco, por exemplo), escolhe a melhor e devolve um filete em volta. */
export function corQueAparece(fundos: string[], preferidas: (string | undefined)[]): { cor: string; filete?: string } {
  const cands = [...new Set([...preferidas, "#FFFFFF", "#111111"].filter((c): c is string => !!c && /^#[0-9a-f]{3,6}$/i.test(c)))];
  const nota = (c: string) => Math.min(...fundos.map((f) => contrasteCores(c, f)));
  const boa = cands.find((c) => nota(c) >= 3);
  if (boa) return { cor: boa };
  const melhor = [...cands].sort((a, b) => nota(b) - nota(a))[0] ?? "#111111";
  return { cor: melhor, filete: lum(melhor) > 0.3 ? "#111111" : "#FFFFFF" };
}
/** Um símbolo de marca com um contorno em volta (para aparecer sobre listras de duas cores). */
export const comFilete = (svg: string, filete?: string) => (filete ? `<g stroke="${filete}" stroke-width="5" stroke-linejoin="round" fill="${filete}">${svg.replace(/fill="[^"]*"/g, `fill="${filete}"`).replace(/stroke="(?!none)[^"]*"/g, `stroke="${filete}"`)}</g>${svg}` : svg);

/** Emblema da Red Boi: dois touros investindo um contra o outro, com o sol amarelo atrás (100×50). */
export function emblemaTouros(vermelho: string, sol: string): string {
  const touro = `<path d="M3 33 Q4 25 13 23 Q22 20 31 21 Q37 21 41 25 L47 31 Q49 35 45 35 L41 33 Q40 36 38 38 L35 38 L35 34 L25 35 L22 42 L18 42 L19 35 Q12 36 9 34 L7 41 L3 41 L4 35 Q2 35 3 33 Z" fill="${vermelho}"/><path d="M40 24 Q42 17 48 16 Q44 19 43 24 Z" fill="${vermelho}"/><path d="M4 26 Q-1 22 1 17" stroke="${vermelho}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  return `<circle cx="50" cy="22" r="13" fill="${sol}"/><g>${touro}</g><g transform="translate(100 0) scale(-1 1)">${touro}</g>`;
}
