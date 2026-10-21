// Contratos, valor de mercado, salário e interesse dos clubes — seções "Contratos e transferências"
// e "Interesse dos clubes e ambientação" do documento de design.
import { RNG, clamp } from "./rng.js";
import type { Posicao } from "./atributos.js";
import type { Clube, Liga } from "./liga.js";
import { VAGAS_433 } from "./partida.js";

export const CAMBIO = 6.0; // R$ por euro, fixo no MVP

export type TipoAgente = "pai" | "iniciante" | "experiente" | "top";
export const AGENTES: Record<TipoAgente, { comissao: number; bonus: number; alcance: number; ligas: string[] | "todas" }> = {
  pai: { comissao: 0, bonus: -0.1, alcance: 1.0, ligas: ["BRA1", "BRA2"] },
  iniciante: { comissao: 0.05, bonus: 0, alcance: 1.0, ligas: ["BRA1", "BRA2"] },
  experiente: { comissao: 0.08, bonus: 0.1, alcance: 1.5, ligas: ["BRA1", "BRA2", "EUR2", "ARA1"] },
  top: { comissao: 0.1, bonus: 0.2, alcance: 2.0, ligas: "todas" },
};

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

/** Salário mensal em reais. */
export function salarioMensal(o: { ovr: number; idade: number; liga: Liga; clube: Clube; agente: TipoAgente; fama: number; formacao?: boolean }): number {
  const vm = valorMercado(o.ovr, o.idade, 3, o.liga.fLiga);
  const piso = o.formacao ? 3000 : 8000;
  const base = Math.max(piso, (0.1 * vm * o.clube.fClube * CAMBIO * o.liga.fSalario) / 12);
  return base * (1 + AGENTES[o.agente].bonus) * (1 + o.fama / 200);
}

/** Posição do jogador na fila do elenco (0 = melhor). */
export function filaNaPosicao(clube: Clube, pos: Posicao, ovr: number): number {
  return clube.elenco.filter((j) => j.posicao === pos && j.ovr > ovr).length;
}

// ---------- Interesse dos clubes ----------

const LINGUA: Record<string, string> = { BRA: "pt", POR: "pt", ANG: "pt", ARG: "es", URU: "es", COL: "es", ESP: "es", CHI: "es", PAR: "es", ECU: "es", PER: "es", VEN: "es", BOL: "es", ENG: "en", FRA: "fr", ITA: "it", GER: "de", NED: "nl", KSA: "ar", NGA: "en", GHA: "en", SEN: "fr", JPN: "ja", KOR: "ko" };
const SUL_AMERICANOS = new Set(["BRA", "ARG", "URU", "COL", "CHI", "PAR", "ECU", "PER", "VEN", "BOL"]);
export const LINGUA_DA_LIGA: Record<string, string> = { EUR: "es", BRA: "pt", ARA: "ar" };

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
export function passaFiltros(p: PerfilMercado, clube: Clube, liga: Liga, vm: number, orcamento: number): boolean {
  if (p.clubeAtual && clube.id === p.clubeAtual.id) return false;
  const nAtual = p.ligaAtual.nivel;
  const forcaMin = Math.min(...liga.clubes.map((c) => c.forca));
  if (liga.nivel < nAtual - 1 && p.ovr < forcaMin) return false; // subida de mais de 1 nível
  const altoSalario = liga.fSalario >= 2;
  if (liga.nivel >= nAtual + 2 && !(p.idade >= 30 || p.pctTitular < 0.3 || altoSalario || !p.clubeAtual)) return false;
  if (p.ovr > clube.forca + 12) return false; // jogador fora de alcance
  if (p.clubeAtual && vm > orcamento) return false;
  return true;
}

export function gerarPropostas(rng: RNG, p: PerfilMercado, mundo: Liga[], fama: number): Proposta[] {
  const ag = AGENTES[p.agente];
  const candidatas: Proposta[] = [];
  for (const liga of mundo) {
    if (ag.ligas !== "todas" && !ag.ligas.includes(liga.id)) continue;
    for (const clube of liga.clubes) {
      const c = componentesInteresse(p, clube, liga);
      if (!passaFiltros(p, clube, liga, c.vm, c.orcamento)) continue;
      const I = 0.3 * c.nivel + 0.25 * c.necessidade + 0.15 * c.vis + 0.15 * c.afinidade + 0.15 * c.custo;
      if (I < 0.6) continue;
      const salario = salarioMensal({ ovr: p.ovr, idade: p.idade, liga, clube, agente: p.agente, fama });
      candidatas.push({ clube, liga, interesse: I, taxa: p.clubeAtual ? c.vm * rng.range(0.9, 1.3) * (1 + (I - 0.6)) : 0, orcamento: c.orcamento, salario, anos: rng.int(2, 5), titularProvavel: c.titular });
    }
  }
  const lambda = ag.alcance * (p.fama + 2 * Math.max(0, p.ovr - 55)) / 40;
  const n = Math.max(p.clubeAtual ? 0 : 1, rng.poisson(lambda)); // agente livre sempre recebe ao menos a melhor sondagem
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
