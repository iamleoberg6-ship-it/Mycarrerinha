// Atributos detalhados, além dos doze de sempre: bola parada (falta e pênalti) e os mentais (liderança, determinação,
// decisão, concentração, trabalho em equipe e agressividade). Não entram no OVR; pesam nos lances, nas funções e no
// dia a dia (capitania, evolução, cartões, entrosamento). Quem ainda não tem (saves antigos) ganha na primeira leitura,
// tirados dos atributos e da personalidade, sempre os mesmos para o mesmo jogador.
import { RNG, clamp } from "./rng.js";
import type { Atributos } from "./atributos.js";

export const EXTRAS = ["FAL", "PEN", "LID", "DET", "DEC", "CON", "EQU", "AGR"] as const;
export type Extra = (typeof EXTRAS)[number];
export type Extras = Record<Extra, number>;
export const NOME_EXTRA: Record<Extra, string> = {
  FAL: "Cobrança de falta", PEN: "Pênalti", LID: "Liderança", DET: "Determinação", DEC: "Tomada de decisão", CON: "Concentração", EQU: "Trabalho em equipe", AGR: "Agressividade",
};
export const GRUPO_EXTRA: Record<Extra, "bola" | "mental"> = { FAL: "bola", PEN: "bola", LID: "mental", DET: "mental", DEC: "mental", CON: "mental", EQU: "mental", AGR: "mental" };
export const DICA_EXTRA: Record<Extra, string> = {
  FAL: "Faltas perto da área viram gol.", PEN: "Frieza e técnica na marca da cal.", LID: "Puxa o grupo; conta para a braçadeira.", DET: "Evolui mais no treino e não desiste.",
  DEC: "Escolhe a jogada certa; ajuda em qualquer função.", CON: "Erra menos nos 90 minutos.", EQU: "Ajuda o time a se entrosar.", AGR: "Ganha dividida, mas leva mais cartão.",
};

/** Os detalhados de um jogador: da técnica (falta, pênalti), da leitura de jogo e da personalidade (1 a 20). */
export function extrasIniciais(chave: string, at: Atributos, p: { profissionalismo?: number; temperamento?: number; carisma?: number; ambicao?: number } = {}, idade = 22): Extras {
  const r = new RNG(`${chave}|extras`), ru = (sd = 6) => r.normal(0, sd);
  const prof = p.profissionalismo ?? 10, temp = p.temperamento ?? 10, car = p.carisma ?? 10, amb = p.ambicao ?? 10, maduro = clamp((idade - 18) * 1.2, 0, 14);
  const ex: Extras = {
    FAL: 0.4 * at.PAS + 0.35 * at.FIN + 0.25 * at.COM - 6 + ru(9),
    PEN: 0.5 * at.FIN + 0.5 * at.COM - 3 + ru(7),
    LID: 28 + 1.6 * car + 0.8 * prof + maduro + ru(7),
    DET: 26 + 1.7 * prof + 0.9 * amb + ru(6),
    DEC: 0.45 * at.VIS + 0.35 * at.COM + 0.2 * at.POS + maduro * 0.4 + ru(5),
    CON: 0.4 * at.POS + 0.3 * at.COM + 0.3 * at.MAR + ru(6),
    EQU: 0.35 * at.PAS + 0.25 * at.RES + 18 + 1.2 * prof + ru(6),
    AGR: 22 + 2.2 * temp + 0.3 * at.FOR + ru(7),
  };
  for (const k of EXTRAS) ex[k] = Math.round(clamp(ex[k], 15, 95));
  return ex;
}
/** Uma semana a mais: mentais amadurecem até os 30; a bola parada cresce com o treino técnico. */
export function evoluirExtras(ex: Extras, idade: number, jogou: boolean, focoTecnico: boolean, det: number): Extras {
  const n = { ...ex }, ritmo = (idade <= 23 ? 1 : idade <= 29 ? 0.6 : 0.2) * (0.8 + det / 250);
  for (const k of EXTRAS) {
    const teto = 92, g = k === "FAL" || k === "PEN" ? (focoTecnico ? 0.05 : 0.02) : k === "LID" || k === "DEC" || k === "CON" ? (jogou ? 0.045 : 0.025) : k === "AGR" ? 0 : 0.03;
    n[k] = clamp(n[k] + g * ritmo * Math.max(0, 1 - n[k] / teto), 1, 99);
  }
  return n;
}
