// Estatísticas imaginadas dos outros jogadores: jogos, gols, assistências e nota de cada temporada de liga.
// Não saem das partidas (só a do jogador é jogada de verdade): são sorteadas pelo OVR, pela posição, por ser
// titular ou reserva e pela força do time na liga. As rodadas em que cada um jogou, marcou e deu passe também são
// sorteadas, então a artilharia cresce rodada a rodada durante a temporada.
import type { RNG } from "./rng.js";
import { clamp } from "./rng.js";
import type { JogadorNPC } from "./liga.js";

export interface StatsNPC { j: number; g: number; a: number; n: number; jr?: number[]; gr?: number[]; ar?: number[] }

const GOLS90: Record<string, number> = { ATA: 0.42, PON: 0.26, MEI: 0.16, VOL: 0.05, ZAG: 0.05, LAT: 0.03, GOL: 0 };
const ASSIST90: Record<string, number> = { PON: 0.22, MEI: 0.24, ATA: 0.14, LAT: 0.1, VOL: 0.08, ZAG: 0.03, GOL: 0.005 };

const poisson = (rng: RNG, l: number) => { let k = 0, p = Math.exp(-l), s = p; const u = rng.next(); while (u > s && k < 6) { k++; p *= l / k; s += p; } return k; };

/** Temporada inteira de um jogador: `rank` é a posição dele na fila da posição no clube (0 = melhor), `vagas` os titulares. */
export function gerarStats(rng: RNG, x: JogadorNPC, rank: number, vagas: number, forca: number, mediaLiga: number, n: number): StatsNPC {
  const titular = rank < vagas, primeiroReserva = rank === vagas;
  let frac = titular ? rng.range(0.72, 0.94) : primeiroReserva ? rng.range(0.3, 0.6) : rng.range(0.03, 0.28);
  if (x.posicao === "GOL" && !titular) frac *= 0.25;
  if (titular && rng.chance(0.15)) frac *= rng.range(0.5, 0.8); // lesão
  const jogos = Math.round(n * frac), minutos = titular ? 82 : primeiroReserva ? 50 : 28;
  const todas = Array.from({ length: n }, (_, i) => i);
  for (let i = 0; i < jogos; i++) { const k = i + Math.floor(rng.next() * (n - i)); [todas[i], todas[k]] = [todas[k], todas[i]]; }
  const rodadas = todas.slice(0, jogos).sort((a, b) => a - b);
  const q = Math.max(0.4, 1 + (x.ovr - forca) / 25), fT = Math.max(0.5, 1 + (forca - mediaLiga) / 20), m = minutos / 90;
  const gr: number[] = [], ar: number[] = [];
  for (const r of rodadas) {
    for (let k = poisson(rng, (GOLS90[x.posicao] ?? 0.1) * m * q * fT); k > 0; k--) gr.push(r);
    for (let k = poisson(rng, (ASSIST90[x.posicao] ?? 0.1) * m * q * fT); k > 0; k--) ar.push(r);
  }
  const nota = jogos ? clamp(6.45 + (x.ovr - forca) * 0.04 + (forca - mediaLiga) * 0.02 + (gr.length / jogos) * 0.8 + (ar.length / jogos) * 0.4 + rng.normal(0, 0.15), 5.6, 8.3) : 0;
  return { j: jogos, g: gr.length, a: ar.length, n: +nota.toFixed(2), jr: rodadas, gr, ar };
}

/** Até a rodada `feitas` (quantas rodadas já foram jogadas). */
export function statsAte(s: StatsNPC, feitas: number, total: number): { j: number; g: number; a: number; n: number } {
  if (feitas >= total || !s.jr) return { j: s.j, g: s.g, a: s.a, n: s.n };
  const ate = (l: number[] = []) => l.filter((r) => r < feitas).length;
  return { j: ate(s.jr), g: ate(s.gr), a: ate(s.ar), n: s.n };
}
