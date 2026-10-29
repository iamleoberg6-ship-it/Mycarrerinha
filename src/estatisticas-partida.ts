// Estatísticas da partida ao vivo: posse de bola, chutes, chutes no alvo e gol esperado (xG).
// Parte de fundo (posse por minuto e chutes sem gol) é sorteada antes do jogo; os gols e os chutes
// das suas decisões entram na hora, conforme acontecem. Só mostra: não muda placar nem nota.
import type { RNG } from "./rng.js";

/** Lado 0 = casa, 1 = fora. xg: chance de gol daquela finalização (0 a 1). alvo: foi no gol. */
export interface Chute { min: number; lado: 0 | 1; xg: number; alvo: boolean }
export interface EstatBase { /** posse de bola da casa, em % para cada minuto (0 a 90) */ posseCasa: number[]; chutes: Chute[] }

/** Forças em 0..1 (casa e fora): quem é melhor tem mais posse e mais chutes. */
export function estatisticaBase(rng: RNG, forca: [number, number]): EstatBase {
  const [fc, ff] = forca;
  const base = Math.min(0.7, Math.max(0.3, 0.5 + (fc - ff) * 0.5));
  const fase = rng.next() * 6;
  const posseCasa: number[] = [];
  for (let m = 0; m <= 90; m++) posseCasa.push(Math.round((base + Math.sin(m / 8 + fase) * 0.05) * 100));
  const chutes: Chute[] = [];
  for (const lado of [0, 1] as const) {
    const f = lado === 0 ? fc : ff;
    const n = Math.max(3, Math.min(18, Math.round(7 + (f - 0.5) * 8 + rng.normal(0, 2))));
    for (let i = 0; i < n; i++) {
      const xg = 0.02 + rng.next() ** 2 * 0.2;
      chutes.push({ min: rng.int(1, 90), lado, xg: +xg.toFixed(3), alvo: rng.chance(0.3 + xg) });
    }
  }
  return { posseCasa, chutes };
}

/** Gol esperado de um gol marcado: entre 0,10 e 0,55, variando pelo minuto e pelo lado. */
export const xgDoGol = (min: number, lado: 0 | 1) => +(0.1 + ((min * 31 + (lado ? 7 : 0)) % 45) / 100).toFixed(2);
/** Gol esperado de uma finalização sua que não virou gol: mais alto se foi no alvo. */
export const xgDoChute = (nivel: number) => +(nivel <= 1 ? 0.14 : nivel === 2 ? 0.09 : 0.04).toFixed(2);
