// Treino de posição: o jogador pode aprender a jogar em outra posição. Quanto mais parecida a posição e mais os
// atributos combinam, mais rápido. O técnico às vezes sugere a mudança (e aí o treino rende mais).
import { ovr as ovrPos, type Atributos, type Posicao } from "./atributos.js";
import { clamp } from "./rng.js";

export const POSICOES: Posicao[] = ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"];
/** Afinidade entre posições (0 = nada a ver, 1 = quase a mesma coisa). */
const AFIN: Record<Posicao, Record<Posicao, number>> = {
  ZAG: { ZAG: 1, LAT: 0.55, VOL: 0.65, MEI: 0.25, PON: 0.15, ATA: 0.2 },
  LAT: { ZAG: 0.5, LAT: 1, VOL: 0.45, MEI: 0.4, PON: 0.6, ATA: 0.25 },
  VOL: { ZAG: 0.65, LAT: 0.45, VOL: 1, MEI: 0.7, PON: 0.3, ATA: 0.25 },
  MEI: { ZAG: 0.25, LAT: 0.4, VOL: 0.7, MEI: 1, PON: 0.7, ATA: 0.6 },
  PON: { ZAG: 0.15, LAT: 0.6, VOL: 0.3, MEI: 0.7, PON: 1, ATA: 0.8 },
  ATA: { ZAG: 0.25, LAT: 0.25, VOL: 0.25, MEI: 0.6, PON: 0.75, ATA: 1 },
};
export const afinidade = (de: Posicao, para: Posicao) => AFIN[de][para];

export type Familiaridade = Partial<Record<Posicao, number>>;
/** Familiaridade inicial: a posição natural é 100; as parecidas já vêm com alguma coisa. */
export function familiaridadeInicial(natural: Posicao): Familiaridade {
  return Object.fromEntries(POSICOES.map((p) => [p, p === natural ? 100 : Math.round(afinidade(natural, p) * 35)])) as Familiaridade;
}

/** Semanas de treino para chegar a 100% na posição nova (estimativa mostrada ao jogador). */
export function semanasParaAprender(at: Atributos, de: Posicao, para: Posicao, fam: number, sugerida = false): number {
  const ganho = ganhoSemanal(at, de, para, sugerida, 0);
  return Math.ceil((100 - fam) / ganho);
}
/** Quanto a familiaridade sobe numa semana de treino da posição. */
export function ganhoSemanal(at: Atributos, de: Posicao, para: Posicao, sugerida: boolean, treinosExtra: number): number {
  const af = afinidade(de, para), encaixe = clamp(1 + (ovrPos(at, para) - ovrPos(at, de)) / 12, 0.5, 1.4);
  return clamp(1 + 6.5 * af * af * encaixe, 0.6, 7.5) * (sugerida ? 1.3 : 1) * (1 + 0.12 * treinosExtra);
}
/** Penalidade de OVR jogando numa posição que ainda não domina. */
export const penalidade = (fam: number) => Math.max(0, (100 - fam) * 0.07);
/** Pode ser escalado na posição a partir de 70%. */
export const PODE_JOGAR = 70;

/** Melhor posição alternativa para o técnico sugerir (atributos combinam e a afinidade ajuda). */
export function sugestaoDoTecnico(at: Atributos, atual: Posicao, fam: Familiaridade): Posicao | undefined {
  const base = ovrPos(at, atual);
  const cands = POSICOES.filter((p) => p !== atual && (fam[p] ?? 0) < PODE_JOGAR && afinidade(atual, p) >= 0.45 && ovrPos(at, p) >= base - 1.5);
  return cands.sort((a, b) => ovrPos(at, b) - ovrPos(at, a))[0];
}
