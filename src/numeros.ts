// Número da camisa. Ao chegar num clube e no começo de cada temporada o jogador escolhe o número entre os livres.
// Os números do elenco vêm dos elencos reais; quem não tem número ganha um fixo (preferência da posição, depois sorteio
// pelo nome). Na virada da temporada o mundo muda (src/evolucao.ts): quem sai libera a camisa e quem chega pega uma livre.
import { RNG } from "./rng.js";
import type { Clube } from "./liga.js";

export interface Camisa { numero: number; dono?: string; posicao?: string; liberado?: boolean; meu?: boolean }

const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** Números preferidos de quem não tem número oficial, por posição. */
const PREF: Record<string, number[]> = {
  GOL: [1, 12, 23, 31, 40, 25, 13], ZAG: [3, 4, 2, 5, 6, 14, 15, 24, 33, 44], LAT: [2, 6, 13, 16, 22, 21, 26, 36],
  VOL: [5, 8, 15, 18, 25, 28, 35], MEI: [10, 8, 20, 23, 27, 30, 17], PON: [7, 11, 17, 19, 47, 77, 37], ATA: [9, 19, 29, 39, 99, 90, 21],
};

const cache = new Map<Clube, Map<string, number>>();
/** Número de cada jogador do elenco (nome → número), fixo para o clube e sem repetição. */
export function numerosDoClube(clube: Clube): Map<string, number> {
  const ja = cache.get(clube);
  if (ja) return ja;
  const porNome = new Map<string, number>(), usados = new Set<number>(), sem: Clube["elenco"] = [];
  for (const j of clube.elenco) {
    if (j.numero && j.numero >= 1 && j.numero <= 99 && !usados.has(j.numero)) { porNome.set(j.nome, j.numero); usados.add(j.numero); } else sem.push(j);
  }
  for (const j of [...sem].sort((a, b) => b.ovr - a.ovr)) { // os melhores escolhem primeiro
    let n = (PREF[j.posicao] ?? []).find((x) => !usados.has(x));
    for (let t = 0; n === undefined && t < 300; t++) { const x = 2 + (hash(`${j.nome}|${t}`) % 98); if (!usados.has(x)) n = x; }
    if (n !== undefined) { porNome.set(j.nome, n); usados.add(n); }
  }
  cache.set(clube, porNome);
  return porNome;
}

/** O mundo mudou (temporada nova): os números são refeitos a partir do elenco atual. */
export const limparNumeros = () => cache.clear();
/** Número livre para quem chega ao clube: o preferido da posição, senão um sorteado. */
export function numeroParaChegada(clube: Clube, posicao: string, nome: string, evitar: number[] = []): number {
  const usados = new Set([...numerosDoClube(clube).values(), ...evitar]);
  const n = (PREF[posicao] ?? []).find((x) => !usados.has(x));
  if (n !== undefined) return n;
  for (let t = 0; t < 300; t++) { const x = 2 + (hash(`${nome}|${t}`) % 98); if (!usados.has(x)) return x; }
  return 99;
}

/** As 99 camisas do clube: quem usa cada uma, as liberadas por quem saiu e a sua. */
export function gradeDeNumeros(clube: Clube | undefined, saidas: { nome: string; numero?: number; posicao: string }[], meuNumero?: string): Camisa[] {
  const dono = new Map<number, { nome: string; posicao: string; saiu: boolean }>();
  // quem saiu na virada da temporada libera a camisa (se ninguém que chegou já pegou)
  for (const x of saidas) if (x.numero) dono.set(x.numero, { nome: x.nome, posicao: x.posicao, saiu: true });
  if (clube) {
    const nums = numerosDoClube(clube);
    for (const j of clube.elenco) { const n = nums.get(j.nome); if (n) dono.set(n, { nome: j.nome, posicao: j.posicao, saiu: false }); }
  }
  return Array.from({ length: 99 }, (_, i) => {
    const n = i + 1, d = dono.get(n), meu = String(n) === meuNumero;
    if (d && !d.saiu) return { numero: n, dono: d.nome, posicao: d.posicao, ...(meu ? { meu: false } : {}) };
    return { numero: n, ...(d?.saiu ? { liberado: true } : {}), ...(meu ? { meu: true } : {}) };
  });
}
export const numeroLivre = (g: Camisa[], n: number) => n >= 1 && n <= 99 && !g[n - 1]?.dono;
