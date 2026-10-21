// Partidas e desempenho — seção "Partidas e desempenho" do documento de design.
import { RNG, clamp } from "./rng.js";
import type { Posicao } from "./atributos.js";

export const CALIB_PARTIDA = {
  baseCasa: 1.3,
  bonusMando: 0.2,
  baseFora: 1.02,
  escala: 15, // e^((F_casa − F_fora)/escala)
  lesaoBase: 0.05,
};

export function lambdas(fCasa: number, fFora: number) {
  const c = CALIB_PARTIDA;
  return {
    casa: c.baseCasa * Math.exp((fCasa - fFora) / c.escala) + c.bonusMando,
    fora: c.baseFora * Math.exp((fFora - fCasa) / c.escala),
  };
}

export function simularPlacar(rng: RNG, fCasa: number, fFora: number): [number, number] {
  const l = lambdas(fCasa, fFora);
  return [rng.poisson(l.casa), rng.poisson(l.fora)];
}

export const SHARE_GOL: Record<Posicao, number> = { ATA: 0.3, PON: 0.16, MEI: 0.11, VOL: 0.05, ZAG: 0.035, LAT: 0.03 };
export const SHARE_ASSIST: Record<Posicao, number> = { ATA: 0.11, PON: 0.17, MEI: 0.18, VOL: 0.08, ZAG: 0.02, LAT: 0.12 };

export interface DesempenhoInput {
  posicao: Posicao;
  ovrEfetivo: number;
  fin: number;
  passeOuCruz: number;
  minutos: number;
  golsTime: number;
  golsSofridos: number;
  fAdv: number;
}

export interface Desempenho {
  gols: number;
  assistencias: number;
  nota: number;
}

export function desempenhoJogador(rng: RNG, d: DesempenhoInput): Desempenho {
  let gols = 0, assistencias = 0;
  const frac = d.minutos / 90;
  const pGol = clamp(SHARE_GOL[d.posicao] * (d.fin / 70) ** 1.5 * frac, 0, 0.9);
  const pAss = clamp(SHARE_ASSIST[d.posicao] * (d.passeOuCruz / 70) ** 1.5 * frac, 0, 0.9);
  for (let g = 0; g < d.golsTime; g++) {
    if (rng.chance(pGol)) gols++;
    else if (rng.chance(pAss / (1 - pGol))) assistencias++;
  }
  const resultado = d.golsTime > d.golsSofridos ? 0.3 : d.golsTime < d.golsSofridos ? -0.3 : 0;
  const defensor = d.posicao === "ZAG" || d.posicao === "LAT" || d.posicao === "VOL";
  let nota = 6.0 + 0.03 * (d.ovrEfetivo - d.fAdv) + 1.0 * gols + 0.6 * assistencias + resultado + rng.normal(0, 0.5);
  if (defensor && d.golsSofridos === 0) nota += 0.4;
  if (d.minutos < 45) nota = 6.0 + (nota - 6.0) * 0.5; // reserva que entrou tem nota mais neutra
  return { gols, assistencias, nota: Math.round(clamp(nota, 3, 10) * 10) / 10 };
}

export type GravidadeLesao = "leve" | "media" | "grave";

export function sortearLesao(rng: RNG, cansaco: number, intensidadeAlta: boolean, idade: number, reducao = 0): { semanas: number; tipo: GravidadeLesao } | null {
  const p = CALIB_PARTIDA.lesaoBase * (1 + cansaco / 100) * (intensidadeAlta ? 1.3 : 1) * (idade >= 31 ? 1.2 : 1) * (1 - reducao);
  if (!rng.chance(p)) return null;
  const r = rng.next();
  if (r < 0.7) return { semanas: rng.int(1, 2), tipo: "leve" };
  if (r < 0.95) return { semanas: rng.int(3, 6), tipo: "media" };
  return { semanas: rng.int(9, 26), tipo: "grave" };
}

/** Pontuação para disputar a titularidade. */
export function pontuacaoTitular(ovr: number, forma: number, relacaoTecnico: number, cansaco: number, entrosamento = 0): number {
  return ovr + 2 * (forma - 6.5) + 0.1 * relacaoTecnico - 0.2 * cansaco + 0.05 * entrosamento;
}

export const VAGAS_433: Record<Posicao, number> = { ZAG: 2, LAT: 2, VOL: 1, MEI: 2, PON: 2, ATA: 1 };
