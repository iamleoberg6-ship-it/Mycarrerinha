// Contratos, valor de mercado, salário e interesse dos clubes — seções "Contratos e transferências"
// e "Interesse dos clubes e ambientação" do documento de design.
import { SO_BASCOS } from "./evolucao.js";
import { RNG, clamp } from "./rng.js";
import type { Posicao } from "./atributos.js";
import type { Clube, Liga } from "./liga.js";
import { VAGAS_433 } from "./partida.js";
import { FAMILIA, perfilAgente, type TipoAgente } from "./agentes-banco.js";
export type { TipoAgente } from "./agentes-banco.js";

export const CAMBIO = 6.0; // R$ por euro, fixo no MVP

/** Ligas de cada país (divisões de cima e amadoras de fora, quando existem no jogo). */
export const LIGAS_DO_PAIS: Record<string, string[]> = {
  BRA: ["BRA1", "BRA2", "BRA3", ..."ABCDEFGH".split("").map((g) => `BRA4${g}`)],
  ARG: ["ARG1"], URU: ["URU1"], COL: ["COL1"], CHI: ["CHI1"], PAR: ["PAR1"], ECU: ["ECU1"],
  ENG: ["ENG1", "ENG2", "ENG3", "ENG4"], ESP: ["ESP1", "ESP2"], ITA: ["ITA1"], GER: ["GER1"], FRA: ["FRA1"], NED: ["NED1"],
  POR: ["POR1"], KSA: ["KSA1"], USA: ["USA1"], MEX: ["MEX1"], JPN: ["JPN1"], KOR: ["KOR1"], MAR: ["MAR1"], CRO: ["CRO1"], EGY: ["EGY1"], TUR: ["TUR1"],
  // quem nasceu em país sem liga própria joga nas ligas do país onde a família mora
  NGA: ["ENG1"], SEN: ["FRA1"], GHA: ["ENG1"],
};
/** Países que fazem fronteira (ou ficam bem perto): o agente de nível médio alcança essas ligas também. */
export const VIZINHOS: Record<string, string[]> = {
  BRA: ["ARG", "URU", "COL", "PAR"], ARG: ["BRA", "URU", "CHI", "PAR"], URU: ["ARG", "BRA"], PAR: ["ARG", "BRA"], CHI: ["ARG"], ECU: ["COL"], COL: ["BRA", "ECU"],
  POR: ["ESP"], ESP: ["POR", "FRA", "MAR"], FRA: ["ESP", "ITA", "GER", "NED"], ITA: ["FRA", "GER"], GER: ["FRA", "ITA", "NED"], NED: ["GER", "FRA"], ENG: ["FRA"],
  USA: ["MEX"], MEX: ["USA"], JPN: ["KOR"], KOR: ["JPN"], MAR: ["ESP", "FRA"], CRO: ["ITA", "GER"], EGY: ["KSA"], KSA: ["EGY"], TUR: ["GER"],
};
/** Países pequenos ou cercados por ligas maiores: o agente local (pai ou iniciante) só conhece os clubes regionais,
 *  e os grandes do próprio país só aparecem para o agente experiente. Brasil fica fora: o mercado local é grande o bastante. */
export const ALCANCE_REGIONAL = new Set(["POR", "URU", "PAR", "ECU", "CHI", "CRO", "MAR"]);

/** Ligas que o agente alcança. A família conhece só o país do jogador; o agente do banco, o mercado do próprio país
 *  (nível 1 e 2), mais os vizinhos (nível 3 e 4), e o mundo todo no nível 5. "todas" = o mundo inteiro. */
export function ligasDoAgente(t: TipoAgente, nacionalidade: string): string[] | "todas" {
  if (t === FAMILIA) return LIGAS_DO_PAIS[nacionalidade] ?? [];
  const p = perfilAgente(t), pais = p.pais ?? nacionalidade, casa = LIGAS_DO_PAIS[pais] ?? [];
  if (p.nivel >= 5) return "todas";
  if (p.nivel <= 2) return casa;
  const vizinhas = (VIZINHOS[pais] ?? []).flatMap((x) => LIGAS_DO_PAIS[x] ?? []);
  return [...new Set([...casa, ...vizinhas])];
}

/** O país cujo mercado o agente conhece: o do jogador (família) ou o do próprio agente. */
const paisDoAgente = (t: TipoAgente, nacionalidade: string) => t === FAMILIA ? nacionalidade : perfilAgente(t).pais ?? nacionalidade;

/** Só clubes regionais: agente de nível baixo de país pequeno não chega aos três maiores da liga de casa. */
export function alcanceSoRegional(t: TipoAgente, nacionalidade: string): boolean {
  if (t === FAMILIA) return ALCANCE_REGIONAL.has(nacionalidade);
  return perfilAgente(t).nivel <= 2 && ALCANCE_REGIONAL.has(paisDoAgente(t, nacionalidade));
}
/** Os três clubes mais fortes de uma liga (os "grandes" que o agente regional não alcança). */
const grandesDaLiga = (liga: Liga) => new Set([...liga.clubes].sort((a, b) => b.forca - a.forca).slice(0, 3).map((c) => c.id));
/** O agente consegue levar o jogador a este clube? */
export function clubeAlcancado(t: TipoAgente, nacionalidade: string, liga: Liga, clube: Clube): boolean {
  if (!alcanceSoRegional(t, nacionalidade)) return true;
  if (!(LIGAS_DO_PAIS[paisDoAgente(t, nacionalidade)] ?? []).includes(liga.id)) return true; // ligas vizinhas: o alcance regional não as corta
  return !grandesDaLiga(liga).has(clube.id);
}


export function fIdadeVM(idade: number): number {
  if (idade <= 21) return 1.5;
  if (idade <= 26) return 1.2;
  if (idade <= 29) return 1.0;
  if (idade <= 32) return 0.6;
  return 0.3;
}
export function fContrato(anosRestantes: number): number {
  if (anosRestantes >= 3) return 1.0;
  if (anosRestantes >= 2) return 0.85;
  if (anosRestantes >= 1) return 0.6;
  return 0.3;
}

/** Valor de mercado em euros. */
export function valorMercado(ovr: number, idade: number, anosContrato: number, fLiga: number): number {
  return 0.5e6 * Math.exp((ovr - 60) / 5) * fIdadeVM(idade) * fContrato(anosContrato) * fLiga;
}

/** Maior salário mensal (R$) que um clube de fClube 1,0 paga em cada liga. O Golfo paga muito acima de todo mundo. */
const TETO_LIGA: Record<string, number> = {
  ENG1: 5.5e6, ESP1: 4.2e6, ITA1: 3.2e6, GER1: 3.4e6, FRA1: 2.8e6, POR1: 0.9e6, NED1: 0.8e6, BRA1: 1.0e6, ARG1: 0.35e6,
  KSA1: 14e6, TUR1: 1.2e6, MEX1: 1.0e6, URU1: 0.15e6, COL1: 0.15e6, CHI1: 0.15e6, PAR1: 0.1e6, ECU1: 0.12e6, ENG2: 0.7e6, ENG3: 0.2e6, ENG4: 0.08e6, ESP2: 0.25e6, BRA2: 0.2e6, USA1: 1.6e6, BRA3: 0.06e6, BRA4: 0.025e6,
};
/** Teto salarial do clube: o que a folha aguenta pagar para um único jogador. */
export function tetoSalarial(clube: Clube, liga: Liga): number {
  return (TETO_LIGA[liga.id] ?? TETO_LIGA[liga.id.slice(0, 4)] ?? 0.5e6) * Math.pow(clube.fClube, 1.6);
}

/** Salário mensal em reais: valor de mercado, prestígio e agente, até o teto da folha do clube. */
export function salarioMensal(o: { ovr: number; idade: number; liga: Liga; clube: Clube; agente: TipoAgente; fama: number; formacao?: boolean }): number {
  const vm = valorMercado(o.ovr, o.idade, 3, o.liga.fLiga);
  const piso = o.formacao ? (o.liga.nivel >= 5 ? 1500 : 3000) : o.liga.id.startsWith("BRA4") ? 2500 : o.liga.id === "BRA3" ? 5000 : 8000;
  const base = Math.max(piso, (0.1 * vm * o.clube.fClube * CAMBIO * o.liga.fSalario) / 12);
  const pedido = base * (1 + perfilAgente(o.agente).bonus) * (1 + o.fama / 200);
  return Math.max(piso, Math.min(pedido, tetoSalarial(o.clube, o.liga)));
}

/** Posição do jogador na fila do elenco (0 = melhor). */
export function filaNaPosicao(clube: Clube, pos: Posicao, ovr: number): number {
  return clube.elenco.filter((j) => j.posicao === pos && j.ovr > ovr).length;
}

// ---------- Interesse dos clubes ----------

const LINGUA: Record<string, string> = { USA: "en", CAN: "en", MEX: "es", BRA: "pt", POR: "pt", ANG: "pt", ARG: "es", URU: "es", COL: "es", ESP: "es", CHI: "es", PAR: "es", ECU: "es", PER: "es", VEN: "es", BOL: "es", ENG: "en", FRA: "fr", ITA: "it", GER: "de", NED: "nl", KSA: "ar", NGA: "en", GHA: "en", SEN: "fr", JPN: "ja", KOR: "ko" };
const SUL_AMERICANOS = new Set(["BRA", "ARG", "URU", "COL", "CHI", "PAR", "ECU", "PER", "VEN", "BOL"]);
export const LINGUA_DA_LIGA: Record<string, string> = { EUR: "es", BRA: "pt", ARA: "ar", USA: "en" };

export interface PerfilMercado {
  ovr: number;
  pot: number;
  idade: number;
  posicao: Posicao;
  nacionalidade: string;
  fama: number;
  seguidores: number;
  pctTitular: number; // fração de jogos como titular nas últimas 19 rodadas
  ligaAtual: Liga;
  clubeAtual: Clube | null;
  anosContrato: number;
  agente: TipoAgente;
  continental: boolean;
  selecao: boolean;
  salarioAtual: number;
}

export interface Proposta {
  clube: Clube;
  liga: Liga;
  interesse: number;
  taxa: number; // euros
  orcamento: number;
  salario: number; // R$ por mês
  anos: number;
  titularProvavel: boolean;
}

const BONUS_LIGA_VIS: Record<number, number> = { 1: 30, 2: 20, 3: 10, 4: 5, 5: 0 };

export function seguidoresDaFama(fama: number): number {
  return 20000 * Math.exp(fama / 11);
}

export function componentesInteresse(p: PerfilMercado, clube: Clube, liga: Liga) {
  // Nível
  let nivel = clamp(1 - 0.1 * Math.max(0, clube.forca - p.ovr), 0, 1);
  if (p.idade <= 21 && p.pot > clube.forca) nivel = clamp(nivel + 0.2, 0, 1);
  // Necessidade
  const naPos = clube.elenco.filter((j) => j.posicao === p.posicao).sort((a, b) => b.ovr - a.ovr);
  const vagas = VAGAS_433[p.posicao];
  const piorTitular = naPos[vagas - 1];
  let necessidade = 0.2;
  if (!piorTitular || p.ovr > piorTitular.ovr) necessidade = 1;
  else if (piorTitular.idade >= 31) necessidade = 0.5;
  // Visibilidade
  const vis = clamp((p.fama + BONUS_LIGA_VIS[p.ligaAtual.nivel] + (p.continental ? 10 : 0) + (p.selecao ? 15 : 0) + 10 * Math.log10(Math.max(1, p.seguidores / 1e5))) / 100, 0, 1);
  // Afinidade cultural
  const compatriotas = clube.elenco.filter((j) => j.nacionalidade === p.nacionalidade).length;
  const linguaJog = LINGUA[p.nacionalidade];
  const mesmaLingua = LINGUA_DA_LIGA[liga.pais] === linguaJog || clube.elenco.some((j) => SUL_AMERICANOS.has(j.nacionalidade) && j.nacionalidade !== p.nacionalidade);
  const afinidade = clamp(0.3 + 0.2 * Math.min(2, compatriotas) + (mesmaLingua ? 0.2 : 0), 0, 1);
  // Custo-benefício
  const vm = valorMercado(p.ovr, p.idade, p.anosContrato, p.ligaAtual.fLiga);
  const orcamento = orcamentoTransferencias(clube, liga);
  const custo = clamp(1 - vm / orcamento, 0, 1);
  return { nivel, necessidade, vis, afinidade, custo, vm, orcamento, titular: necessidade === 1, compatriotas };
}

export function orcamentoTransferencias(clube: Clube, liga: Liga): number {
  return 3 * 0.5e6 * Math.exp((clube.forca - 60) / 5) * liga.fLiga * clube.fClube;
}

/** Filtros obrigatórios (regras de salto). */
export function passaFiltros(p: PerfilMercado, clube: Clube, liga: Liga, vm: number, orcamento: number, forcado = false): boolean {
  if (p.clubeAtual && clube.id === p.clubeAtual.id) return false;
  const nAtual = p.ligaAtual.nivel;
  const forcaMin = Math.min(...liga.clubes.map((c) => c.forca));
  if (liga.nivel < nAtual - 1 && p.ovr < forcaMin - (forcado ? 6 : 0)) return false; // subida de mais de 1 nível
  const altoSalario = liga.fSalario >= 2;
  if (!forcado && liga.nivel >= nAtual + 2 && !(p.idade >= 30 || p.pctTitular < 0.3 || altoSalario || !p.clubeAtual)) return false;
  if (p.ovr > clube.forca + 12) return false; // jogador fora de alcance
  if (p.clubeAtual && vm > orcamento) return false;
  return true;
}

/** forcado: o jogador pediu para ser negociado para esse mercado (ignora o alcance do agente e aceita interesse menor). */
export function gerarPropostas(rng: RNG, p: PerfilMercado, mundo: Liga[], fama: number, forcado = false): Proposta[] {
  const ag = perfilAgente(p.agente);
  const alcanca = ligasDoAgente(p.agente, p.nacionalidade);
  const candidatas: Proposta[] = [];
  for (const liga of mundo) {
    if (!forcado && alcanca !== "todas" && !alcanca.includes(liga.id)) continue;
    for (const clube of liga.clubes) {
      if (clube.id === SO_BASCOS) continue; // o Atlético Bilbau só contrata bascos
      if (!forcado && !clubeAlcancado(p.agente, p.nacionalidade, liga, clube)) continue;
      const c = componentesInteresse(p, clube, liga);
      if (!passaFiltros(p, clube, liga, c.vm, c.orcamento, forcado)) continue;
      // o Golfo vai atrás de jogador experiente e conhecido; o resto do interesse tem um pouco de acaso (olheiro, técnico, momento)
      const golfo = liga.fSalario >= 2 && p.ligaAtual.fSalario < 2 && p.idade >= 27 && p.ovr >= 70 ? 0.08 + (p.fama >= 55 ? 0.08 : 0) : 0; // quem já está no Golfo não ganha esse empurrão
      const I = 0.3 * c.nivel + 0.25 * c.necessidade + 0.15 * c.vis + 0.15 * c.afinidade + 0.15 * c.custo + golfo + rng.range(-0.08, 0.08);
      if (I < (forcado ? 0.45 : 0.58)) continue;
      const salario = salarioMensal({ ovr: p.ovr, idade: p.idade, liga, clube, agente: p.agente, fama });
      candidatas.push({ clube, liga, interesse: I, taxa: p.clubeAtual ? c.vm * rng.range(0.9, 1.3) * (1 + (I - 0.6)) : 0, orcamento: c.orcamento, salario, anos: rng.int(2, 5), titularProvavel: c.titular });
    }
  }
  const lambda = ag.alcance * (p.fama + 2 * Math.max(0, p.ovr - 55)) / 40;
  const n = forcado ? 1 : Math.max(p.clubeAtual ? 0 : 1, rng.poisson(lambda)); // agente livre sempre recebe ao menos a melhor sondagem
  return candidatas.sort((a, b) => b.interesse - a.interesse).slice(0, n);
}

/** O clube atual aceita vender? */
/** O clube atual aceita vender? Se a primeira oferta for baixa, o comprador sobe até o pedido uma vez (60%), se couber no orçamento. */
export function clubeAceitaVenda(rng: RNG, prop: Proposta, vm: number, importancia: number): boolean {
  const pedido = vm * importancia;
  if (prop.taxa >= pedido) return true;
  if (pedido <= prop.orcamento && rng.chance(0.6)) { prop.taxa = pedido; return true; }
  return false;
}

// ---------- Ambientação ----------
export function ambientacaoInicial(nacionalidade: string, liga: Liga, clube: Clube, profissionalismo: number): number {
  const lingua = LINGUA[nacionalidade];
  const mesmaLingua = LINGUA_DA_LIGA[liga.pais] === lingua ? 1 : 0;
  const mesmoContinente = liga.pais === "BRA" ? 1 : 0;
  const compatriotas = clube.elenco.filter((j) => j.nacionalidade === nacionalidade).length;
  return clamp(35 + 20 * mesmaLingua + 10 * mesmoContinente + 5 * Math.min(3, compatriotas) + profissionalismo / 2, 0, 100);
}
export function deltaAmbientacao(compatriotas: number, titular: boolean): number {
  return 2 + Math.min(3, compatriotas) + (titular ? 1 : 0);
}
export const fAmb = (amb: number) => 0.85 + (0.15 * amb) / 100;
