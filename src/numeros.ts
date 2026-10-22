// Número da camisa. Ao chegar num clube e no começo de cada temporada o jogador escolhe o número entre os livres.
// Os números do elenco vêm dos elencos reais; quem não tem número ganha um fixo (preferência da posição, depois sorteio
// pelo nome). A cada virada de temporada de 2 a 4 jogadores deixam o clube (vendidos, emprestados, fim de contrato):
// saem do elenco e liberam a camisa.
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

/** Quem deixou o clube na virada da temporada (2 a 4 jogadores; nenhum na primeira). Mais velhos e reservas saem mais. */
export function saidasDoClube(semente: string, clube: Clube, temporada: number): string[] {
  if (temporada <= 0 || clube.elenco.length < 16) return [];
  const rng = new RNG(`${semente}|saidas|${clube.id}|${temporada}`), n = rng.int(2, 4);
  const peso = (j: Clube["elenco"][number]) => (j.idade >= 31 ? 3 : 1) * (j.ovr < clube.forca - 5 ? 2 : 1) * (j.ovr > clube.forca + 4 ? 1.5 : 1); // craque também é vendido
  const pool = [...clube.elenco], fora: string[] = [];
  while (fora.length < n && pool.length) {
    const total = pool.reduce((a, j) => a + peso(j), 0);
    let r = rng.next() * total, k = 0;
    for (; k < pool.length - 1; k++) { r -= peso(pool[k]); if (r <= 0) break; }
    fora.push(pool.splice(k, 1)[0].nome);
  }
  return fora;
}

/** As 99 camisas do clube: quem usa cada uma, as liberadas por quem saiu e a sua. */
export function gradeDeNumeros(clube: Clube | undefined, saidas: string[], meuNumero?: string): Camisa[] {
  const dono = new Map<number, { nome: string; posicao: string; saiu: boolean }>();
  if (clube) {
    const nums = numerosDoClube(clube);
    for (const j of clube.elenco) { const n = nums.get(j.nome); if (n) dono.set(n, { nome: j.nome, posicao: j.posicao, saiu: saidas.includes(j.nome) }); }
  }
  return Array.from({ length: 99 }, (_, i) => {
    const n = i + 1, d = dono.get(n), meu = String(n) === meuNumero;
    if (d && !d.saiu) return { numero: n, dono: d.nome, posicao: d.posicao, ...(meu ? { meu: false } : {}) };
    return { numero: n, ...(d?.saiu ? { liberado: true } : {}), ...(meu ? { meu: true } : {}) };
  });
}
export const numeroLivre = (g: Camisa[], n: number) => n >= 1 && n <= 99 && !g[n - 1]?.dono;
