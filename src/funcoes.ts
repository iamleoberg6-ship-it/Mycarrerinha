// Funções por posição: o jeito de cada um jogar (centroavante fixo, falso 9, velocista, oportunista...). Cada função
// pede atributos diferentes (o encaixe) e muda o que o jogador entrega ao time: mais gol, mais passe, mais marcação.
// Serve aos dois modos: o técnico escolhe a função de cada titular; na carreira de jogador, o técnico define a sua.
import type { Atributo, Atributos } from "./atributos.js";
import type { Extra, Extras } from "./detalhes.js";

export type PosF = "GOL" | "ZAG" | "LAT" | "VOL" | "MEI" | "PON" | "ATA";
export interface Funcao {
  id: string; pos: PosF; nome: string; desc: string;
  /** atributos que a função pede (o encaixe é a média ponderada) */
  pesos: Partial<Record<Atributo | Extra, number>>;
  /** o que ela muda no time (fração; 0,02 = +2%) */
  efeito: { ataque?: number; meio?: number; defesa?: number };
  /** quanto muda a chance de ele marcar e de dar o passe (1 = normal) */
  gol?: number; assist?: number;
  /** combina com time que joga no contra-ataque */
  contra?: boolean;
}
const F = (pos: PosF, id: string, nome: string, desc: string, pesos: Funcao["pesos"], efeito: Funcao["efeito"], extra: Partial<Funcao> = {}): Funcao => ({ id: `${pos}-${id}`, pos, nome, desc, pesos, efeito, ...extra });

export const FUNCOES: Funcao[] = [
  F("GOL", "classico", "Goleiro clássico", "Fica no gol, sai pouco: reflexo e colocação.", { VEL: 3, POS: 3, COM: 2, CON: 2 }, { defesa: 0.01 }),
  F("GOL", "libero", "Goleiro-líbero", "Joga adiantado e sai jogando com os pés.", { PAS: 3, VEL: 2, DEC: 2, COM: 2 }, { meio: 0.012, defesa: -0.004 }),
  F("ZAG", "marcador", "Zagueiro de marcação", "Cola no atacante, ganha pelo alto e no corpo.", { MAR: 3, CAB: 3, FOR: 2, AGR: 1 }, { defesa: 0.012 }),
  F("ZAG", "construtor", "Zagueiro construtor", "Sai jogando e inverte o jogo.", { PAS: 3, VIS: 2, COM: 2, DEC: 2 }, { meio: 0.012, defesa: -0.004 }),
  F("ZAG", "cobertura", "Zagueiro de cobertura", "Rápido, corrige a linha e cobre as costas dos laterais.", { VEL: 3, POS: 3, CON: 2 }, { defesa: 0.008 }),
  F("LAT", "defensivo", "Lateral defensivo", "Segura o ponta e quase não passa do meio.", { MAR: 3, POS: 2, RES: 2, CON: 1 }, { defesa: 0.01, ataque: -0.004 }),
  F("LAT", "ala", "Ala ofensivo", "Vai à linha de fundo o jogo todo e cruza muito.", { VEL: 3, CRU: 3, RES: 3 }, { ataque: 0.012, defesa: -0.006 }, { assist: 1.4 }),
  F("LAT", "invertido", "Lateral invertido", "Fecha por dentro e vira mais um no meio.", { PAS: 3, VIS: 2, DEC: 2, POS: 1 }, { meio: 0.012 }),
  F("VOL", "contencao", "Volante de contenção", "O cão de guarda na frente da zaga.", { MAR: 3, FOR: 2, POS: 2, AGR: 2 }, { defesa: 0.014, meio: -0.002 }),
  F("VOL", "regista", "Regista", "O cérebro recuado: dita o ritmo com passes longos.", { PAS: 3, VIS: 3, DEC: 2, COM: 1 }, { meio: 0.015, defesa: -0.004 }, { assist: 1.3 }),
  F("VOL", "box", "Volante box-to-box", "Corre de área a área: marca e chega para finalizar.", { RES: 3, PAS: 2, DET: 2, FIN: 1 }, { meio: 0.008, ataque: 0.004, defesa: 0.004 }, { gol: 1.3 }),
  F("MEI", "armador", "Armador", "O camisa 10 clássico: último passe e visão.", { PAS: 3, VIS: 3, DEC: 2, DRI: 1 }, { meio: 0.01, ataque: 0.006 }, { assist: 1.5, gol: 0.8 }),
  F("MEI", "chegador", "Meia que chega na área", "Aparece como elemento surpresa para finalizar.", { FIN: 3, POS: 2, DRI: 2, DET: 1 }, { ataque: 0.012 }, { gol: 1.5, assist: 0.9 }),
  F("MEI", "condutor", "Meia de condução", "Carrega a bola, puxa marcação e acelera o jogo.", { DRI: 3, VEL: 2, RES: 2 }, { meio: 0.008, ataque: 0.006 }),
  F("PON", "aberto", "Ponta aberto", "Colado na linha: dribla para fora e cruza.", { VEL: 3, DRI: 2, CRU: 3 }, { ataque: 0.01 }, { assist: 1.4, gol: 0.85 }),
  F("PON", "invertido", "Ponta invertido", "Corta para dentro no pé bom e chuta.", { DRI: 3, FIN: 3, DEC: 1 }, { ataque: 0.012 }, { gol: 1.45, assist: 0.85 }),
  F("PON", "trabalhador", "Ponta que recompõe", "Ataca e volta para marcar o lateral.", { RES: 3, MAR: 2, EQU: 2, VEL: 1 }, { defesa: 0.008, ataque: 0.002 }),
  F("ATA", "fixo", "Centroavante fixo", "Homem de área: segura o zagueiro, cabeceia e empurra para dentro.", { FIN: 3, CAB: 3, FOR: 2 }, { ataque: 0.01 }, { gol: 1.35, assist: 0.7 }),
  F("ATA", "falso9", "Falso 9", "Sai da área para armar e abre espaço para quem chega.", { PAS: 3, VIS: 3, DRI: 2, DEC: 1 }, { meio: 0.012, ataque: 0.004 }, { gol: 0.75, assist: 1.6 }),
  F("ATA", "velocista", "Atacante de velocidade", "Ataca o espaço nas costas da zaga.", { VEL: 3, FIN: 2, DRI: 2 }, { ataque: 0.01 }, { gol: 1.15, contra: true }),
  F("ATA", "oportunista", "Oportunista", "Some do jogo e aparece na hora do gol.", { POS: 3, FIN: 3, CON: 2, COM: 1 }, { ataque: 0.008, meio: -0.004 }, { gol: 1.55, assist: 0.6 }),
  F("ATA", "movel", "Atacante móvel", "Se movimenta o tempo todo, sai da área e puxa marcadores.", { RES: 3, DRI: 2, EQU: 2, POS: 1 }, { ataque: 0.008, meio: 0.006 }, { gol: 1.05, assist: 1.15 }),
  F("ATA", "segundo", "Segundo atacante", "Joga um pouco atrás, entre o meio e o centroavante.", { PAS: 2, DRI: 3, FIN: 2, VIS: 1 }, { ataque: 0.008, meio: 0.006 }, { gol: 1.1, assist: 1.3 }),
];
export const FUNCAO: Record<string, Funcao> = Object.fromEntries(FUNCOES.map((f) => [f.id, f]));
export const funcoesDa = (pos: string) => FUNCOES.filter((f) => f.pos === pos);

/** Quanto o jogador encaixa na função (escala de atributo, 1 a 99). */
export function encaixe(at: Atributos, ex: Extras | undefined, f: Funcao): number {
  let s = 0, w = 0;
  for (const [k, p] of Object.entries(f.pesos)) { const v = (at as Record<string, number>)[k] ?? (ex as Record<string, number> | undefined)?.[k] ?? 55; s += v * (p ?? 0); w += p ?? 0; }
  return w ? s / w : 55;
}
/** A função em que ele rende mais na posição. */
export function melhorFuncao(at: Atributos, ex: Extras | undefined, pos: string): Funcao | undefined {
  return funcoesDa(pos).sort((a, b) => encaixe(at, ex, b) - encaixe(at, ex, a))[0];
}
/** Estrelas de encaixe (1 a 5) comparando com o OVR dele: acima do nível dele é ótimo, bem abaixo é ruim. */
export const estrelasEncaixe = (enc: number, ovr: number) => Math.max(1, Math.min(5, Math.round(3 + (enc - ovr) / 4)));
