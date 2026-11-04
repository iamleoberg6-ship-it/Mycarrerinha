// Nome do patrocinador escrito no peito (quadro 100×44): a primeira palavra pequena em cima quando o nome tem duas
// (Fly / Emiratez), senão uma linha só. Letra escura ganha filete branco para aparecer sobre faixas e listras.
const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
export function nomeNoPeito(nome: string, cor: string): string {
  const filete = cor.toUpperCase() !== "#FFFFFF" ? ` stroke="#FFFFFF" stroke-width="1.6" paint-order="stroke" stroke-linejoin="round"` : "";
  const fonte = `font-family="Barlow, 'Arial Narrow', sans-serif" font-style="italic" font-weight="800" text-anchor="middle" fill="${cor}"${filete}`;
  const [a, ...b] = nome.split(" ");
  if (b.length) return `<text x="50" y="13" font-size="15" ${fonte}>${esc(a)}</text><text x="50" y="38" font-size="${Math.min(27, 190 / Math.max(5, b.join(" ").length))}" letter-spacing="-.5" ${fonte}>${esc(b.join(" "))}</text>`;
  return `<text x="50" y="30" font-size="${Math.min(27, 180 / Math.max(5, nome.length))}" ${fonte}>${esc(a)}</text>`;
}
