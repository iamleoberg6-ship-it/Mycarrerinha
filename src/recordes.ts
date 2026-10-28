// Recordes históricos: maiores artilheiros e quem mais jogou por cada clube e por cada seleção, e o recorde de gols
// numa temporada de cada liga. A história de antes do jogo é imaginada (sempre igual para o mesmo clube: o tamanho
// do clube decide o tamanho dos números); o jogador do usuário entra na lista com os números dele.
import { RNG } from "./rng.js";
import { gerarNome } from "./nomes.js";

export interface Lenda { nome: string; valor: number; eu?: boolean }
export interface Recordes { gols: Lenda[]; jogos: Lenda[] }

/** Lendas reais dos recordes de gols (números oficiais, só partidas oficiais). Entram na lista do clube. */
const LENDAS_REAIS: Record<string, Lenda[]> = {
  SAN: [{ nome: "Pelé", valor: 643 }],
  "ES-BAR": [{ nome: "Lionel Messi", valor: 672 }],
};
const cacheClube = new Map<string, Recordes>();
/** Os 5 maiores artilheiros e os 5 que mais jogaram na história do clube (antes do jogador). */
export function recordesDoClube(clubeId: string, forca: number, pais: string): Recordes {
  const ja = cacheClube.get(clubeId);
  if (ja) return ja;
  const rng = new RNG(`recordes|${clubeId}`), usados = new Set<string>();
  const topG = Math.max(60, Math.round((90 + (forca - 55) * 9) * rng.range(0.85, 1.15)));
  const topJ = Math.round((topG * 1.1 + 280) * rng.range(0.9, 1.12));
  const nome = () => gerarNome(rng, rng.chance(0.85) ? pais : "BRA", usados);
  const r = {
    gols: [1, 0.82, 0.7, 0.62, 0.56].map((f) => ({ nome: nome(), valor: Math.round(topG * f * rng.range(0.97, 1.03)) })).sort((a, b) => b.valor - a.valor),
    jogos: [1, 0.9, 0.84, 0.78, 0.74].map((f) => ({ nome: nome(), valor: Math.round(topJ * f * rng.range(0.98, 1.02)) })).sort((a, b) => b.valor - a.valor),
  };
  const lendas = LENDAS_REAIS[clubeId];
  if (lendas) r.gols = [...lendas, ...r.gols].sort((a, b) => b.valor - a.valor).slice(0, 5);
  cacheClube.set(clubeId, r);
  return r;
}
const cacheSel = new Map<string, Recordes>();
/** Artilheiros e recordistas de jogos da seleção (seleção forte, números maiores). */
export function recordesDaSelecao(pais: string, forca: number): Recordes {
  const ja = cacheSel.get(pais);
  if (ja) return ja;
  const rng = new RNG(`recordes|NAT|${pais}`), usados = new Set<string>();
  const topG = Math.max(18, Math.round((25 + (forca - 62) * 2.5) * rng.range(0.88, 1.12)));
  const topJ = Math.round((105 + (forca - 62) * 2.6) * rng.range(0.9, 1.1));
  const r = {
    gols: [1, 0.86, 0.75, 0.66, 0.6].map((f) => ({ nome: gerarNome(rng, pais, usados), valor: Math.round(topG * f) })).sort((a, b) => b.valor - a.valor),
    jogos: [1, 0.92, 0.86, 0.8, 0.76].map((f) => ({ nome: gerarNome(rng, pais, usados), valor: Math.round(topJ * f) })).sort((a, b) => b.valor - a.valor),
  };
  cacheSel.set(pais, r);
  return r;
}
/** Recorde de gols numa temporada da liga (quem e quantos). */
export function recordeDaLiga(ligaId: string, pais: string, rodadas: number): Lenda {
  const rng = new RNG(`recordes|liga|${ligaId}`);
  return { nome: gerarNome(rng, pais, new Set()), valor: Math.round(rodadas * rng.range(0.82, 0.98)) };
}
/** A lista com o jogador dentro (se ele tiver número para isso), e a posição dele (1 = recordista; 0 = fora do top). */
export function comJogador(lista: Lenda[], nome: string, valor: number): { lista: Lenda[]; pos: number } {
  if (valor <= 0) return { lista, pos: 0 };
  const l = [...lista, { nome, valor, eu: true }].sort((a, b) => b.valor - a.valor || Number(!!a.eu) - Number(!!b.eu));
  const i = l.findIndex((x) => x.eu);
  return i < lista.length ? { lista: l.slice(0, lista.length), pos: i + 1 } : { lista, pos: 0 };
}
