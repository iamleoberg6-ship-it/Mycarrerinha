// Tipos e utilidades dos lances. Os textos aceitam variantes (lista) e marcadores
// como {gol} (goleiro adversário) ou {comp} (seu centroavante), trocados por nomes do elenco.
import type { RNG } from "../rng.js";
import type { Atributo, Posicao } from "../atributos.js";
import type { TracoId } from "../dna.js";

export type Nivel = 0 | 1 | 2 | 3 | 4; // 0 ótimo · 1 bom · 2 neutro · 3 ruim · 4 desastre
export type Txt = string | string[];

export interface Efeito {
  texto: string; nota: number;
  golPro?: boolean; golContra?: boolean; meu?: "gol" | "assist";
  amarelo?: boolean; vermelho?: boolean; sai?: boolean; lesao?: number; fama?: number; moral?: number; relTecnico?: number; seguidores?: number; noticia?: string;
  /** relação com a namorada/esposa */
  relPar?: number;
}
export interface EfeitoDef extends Omit<Efeito, "texto" | "noticia"> { texto: Txt; noticia?: Txt }
export type Teste = Partial<Record<Atributo | "CALMA" | "CARISMA" | "PROF", number>>;
export type Momento = "jogo" | "comemoracao" | "pos";

/** Tudo o que pesa na escolha do lance. */
export interface Contexto {
  pos: Posicao; min: number; saldo: number; base: boolean; jaFezGol: boolean;
  classico: boolean; mandante: boolean;
  /** jogo que vale muito: final, semifinal, mata-mata de volta, briga direta na reta final */
  decisiva?: boolean;
  /** tem namorada ou esposa na arquibancada */
  namorada?: boolean; reta: boolean; briga: "titulo" | "rebaixamento" | ""; fama: number;
  estreia: boolean; chuva: boolean; idade: number; relTecnico: number; moral: number; jogosPro: number;
  /** só no pós-jogo */
  resultado?: "v" | "e" | "d"; gols?: number; expulso?: boolean; nota?: number;
}
export const contextoPadrao = (x: Partial<Contexto> = {}): Contexto => ({
  pos: "ATA", min: 30, saldo: 0, base: false, jaFezGol: false, classico: false, mandante: true, reta: false, briga: "", fama: 10,
  estreia: false, chuva: false, idade: 20, relTecnico: 50, moral: 60, jogosPro: 0, ...x,
});

export interface OpcaoLance {
  id: string; rotulo: string; teste: Teste; dif: number; tracos?: Partial<Record<TracoId, number>>;
  niveis: [EfeitoDef, EfeitoDef, EfeitoDef, EfeitoDef, EfeitoDef];
  /** a opção só aparece neste contexto */
  quando?: (c: Contexto) => boolean;
}
export interface Situacao {
  id: string; titulo: Txt; texto: Txt; peso: (c: Contexto) => number; opcoes: OpcaoLance[];
  /** quantas opções aparecem (sorteadas entre as válidas); padrão: todas */
  mostrar?: number;
  momento?: Momento;
  /** lance raro: não ganha bônus de novidade, aparece de vez em quando */
  rara?: boolean;
}

export const e = (texto: Txt, nota: number, x: Partial<Omit<EfeitoDef, "texto" | "nota">> = {}): EfeitoDef => ({ texto, nota, ...x });
/** Peso por posição. */
export const P = (m: Partial<Record<Posicao, number>>) => (c: Contexto) => m[c.pos] ?? 0;
export const variante = (rng: RNG, t: Txt): string => (Array.isArray(t) ? rng.pick(t) : t);
export const preencher = (t: string, nomes: Record<string, string>): string => t.replace(/\{(\w+)\}/g, (m, k: string) => nomes[k] ?? m);
export const texto = (rng: RNG, t: Txt, nomes: Record<string, string>) => preencher(variante(rng, t), nomes);
