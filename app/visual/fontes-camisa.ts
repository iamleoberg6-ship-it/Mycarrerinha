// Fonte de nome e número de camisa de cada clube: sorteada pelo id (ou nome) do clube, sempre a mesma para o mesmo time.
// Só muda a letra: cores e padrão continuam os do clube. Todas são fontes de cara esportiva (bloco, condensada, slab, college).
export interface FonteCamisa { familia: string; peso: number; /** ajuste de tamanho (fontes largas ficam menores) */ escala: number; /** espaçamento entre letras do nome */ esp: number; italico?: boolean }
const F = (familia: string, peso: number, escala = 1, esp = 0.5, italico = false): FonteCamisa => ({ familia: `'${familia}','Arial Black',sans-serif`, peso, escala, esp, italico });
export const FONTES_CAMISA: FonteCamisa[] = [
  F("Big Shoulders Display", 900),
  F("Graduate", 400, 1.0, 0.3),
  F("Teko", 700, 1.18, 0.6),
  F("Saira Condensed", 800, 1.05),
  F("Oswald", 700, 0.95),
  F("Bebas Neue", 400, 1.12, 0.8),
  F("Archivo Black", 400, 0.8, 0.2),
  F("Russo One", 400, 0.85, 0.3),
  F("Squada One", 400, 1.08, 0.6),
  F("Staatliches", 400, 1.02, 0.7),
  F("Alfa Slab One", 400, 0.8, 0.2),
  F("Chakra Petch", 700, 0.9, 0.4),
  F("Racing Sans One", 400, 0.9, 0.3, true),
  F("Anton", 400, 1.0, 0.5),
  F("Bungee", 400, 0.78, 0.2),
  F("Saira Stencil One", 400, 0.95, 0.4),
];
/** Fonte do clube (pela chave: id ou nome). Sem chave, a clássica. */
export function fonteCamisa(chave?: string): FonteCamisa {
  if (!chave) return FONTES_CAMISA[0];
  let h = 2166136261;
  for (const ch of chave) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return FONTES_CAMISA[h % FONTES_CAMISA.length];
}
/** Atributos SVG de <text> com a fonte do clube, para um tamanho base. */
export function attrFonte(f: FonteCamisa, tamanho: number, comEspaco = false): string {
  return `font-family="${f.familia}" font-weight="${f.peso}" font-size="${(tamanho * f.escala).toFixed(1)}"${f.italico ? ` font-style="italic"` : ""}${comEspaco ? ` letter-spacing="${f.esp}"` : ""}`;
}
