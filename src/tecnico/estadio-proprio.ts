// Estádio público ou dividido (Maracajá do Flamingo e do Fluminante, San Ciro dos dois de Milão, os municipais...):
// o clube paga aluguel por jogo, não pode reformar nada (é do poder público) e a altura da grama é combinada com o outro
// clube. A saída é construir um estádio próprio: você escolhe o tamanho, o padrão, o gramado e o nome, a diretoria
// aprova (com confiança e uma entrada em caixa) e a obra anda por uma ou duas temporadas, pagando um pouco por semana.
// Quando fica pronto, o clube passa a mandar no estádio: sem aluguel, pode reformar e vender o nome.
import { clamp, RNG } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { mundo, infoClube } from "../mundo.js";
import { infoLiga } from "../ligas.js";

export type PadraoEstadio = "simples" | "moderno" | "arena";
export type GramadoTipo = "natural" | "hibrido" | "sintetico";
export const PADRAO_EST: Record<PadraoEstadio, { nome: string; texto: string; porLugar: number; conforto: number; semanas: number }> = {
  simples: { nome: "Simples", texto: "Concreto e arquibancada descoberta. Barato e rápido.", porLugar: 4200, conforto: 3, semanas: 0 },
  moderno: { nome: "Moderno", texto: "Cadeiras, cobertura e camarotes. O padrão de hoje.", porLugar: 6800, conforto: 4, semanas: 12 },
  arena: { nome: "Arena multiuso", texto: "Teto, telão, shows fora de temporada. Cara e demorada, mas a que mais rende.", porLugar: 10500, conforto: 5, semanas: 26 },
};
export const GRAMADO_EST: Record<GramadoTipo, { nome: string; texto: string; extra: number; qualidade: number }> = {
  natural: { nome: "Natural", texto: "Grama de verdade. Bom, mas sofre com chuva e shows.", extra: 0, qualidade: 4 },
  hibrido: { nome: "Híbrido", texto: "Grama natural com fibra sintética: o melhor gramado, mais caro.", extra: 0.04, qualidade: 5 },
  sintetico: { nome: "Sintético", texto: "Não estraga nunca e libera o estádio para shows. A bola corre diferente.", extra: -0.02, qualidade: 3 },
};
export const LUGARES_EST = [15000, 25000, 35000, 45000, 60000, 80000];
export interface ProjetoEstadio { nome: string; lugares: number; padrao: PadraoEstadio; gramado: GramadoTipo; /** a construtora banca 60% e fica com 30% da bilheteria por 10 temporadas */ parceria?: boolean }
export interface ObraEstadio extends ProjetoEstadio { custo: number; pago: number; semanas: number; feitas: number; pausada?: boolean }
export interface EstadioProprio extends ProjetoEstadio { desde: number; /** até quando a construtora parceira fica com parte da bilheteria */ parceiroAte?: number }
export const ANOS_PARCERIA = 10, PARTE_PARCEIRO = 0.3;

type SaveEst = {
  semente: string; clubeId: string; ligaId: string; temporada: number; semana: number;
  clube: { saldo: number; capacidade: number; gramado?: number; grama?: number; conforto?: number; torcida: number };
  diretoria: { confianca: number };
  estadioProprio?: EstadioProprio; obraEstadio?: ObraEstadio; gramaCombinada?: number;
};

/** De quem é o estádio onde o clube joga: próprio ou público, e com quem ele é dividido. */
export function situacaoEstadio(pacote: PacoteDados, s: SaveEst): { proprio: boolean; publico: boolean; divide: string[]; nome: string } {
  if (s.estadioProprio) return { proprio: true, publico: false, divide: [], nome: s.estadioProprio.nome };
  const info = infoClube(pacote, s.clubeId), nome = info?.estadio ?? "Estádio";
  const divide = Object.values(mundo(pacote).info).filter((i) => i.id !== s.clubeId && i.estadio === nome && i.pais === info?.pais && !i.id.startsWith("NAT")).map((i) => i.id);
  const publico = divide.length > 0 || /Municipal|Ol[ií]mpic|Maracaj/i.test(nome);
  return { proprio: false, publico, divide, nome };
}
/** Aluguel de um jogo em casa num estádio público: uma parte da bilheteria fica com quem administra. */
export const aluguelDoJogo = (pacote: PacoteDados, s: SaveEst, bilheteria: number) => {
  const e = s.estadioProprio;
  if (e) return e.parceiroAte !== undefined && e.parceiroAte >= s.temporada ? Math.round(bilheteria * PARTE_PARCEIRO) : 0;
  return situacaoEstadio(pacote, s).publico ? Math.round(bilheteria * 0.15) : 0;
};
/** O que a obra custa e quanto tempo leva. */
export function orcamentoEstadio(s: SaveEst, p: ProjetoEstadio): { custo: number; semanas: number; entrada: number; doClube: number } {
  const fL = clamp(infoLiga(s.ligaId).fLiga ?? 1, 0.35, 1.6);
  const custo = Math.round((p.lugares * PADRAO_EST[p.padrao].porLugar * fL * (1 + GRAMADO_EST[p.gramado].extra)) / 1e5) * 1e5;
  const semanas = Math.round(48 + p.lugares / 1500 + PADRAO_EST[p.padrao].semanas);
  const doClube = p.parceria ? Math.round(custo * 0.4 / 1e4) * 1e4 : custo;
  return { custo, semanas, doClube, entrada: Math.round(doClube * (p.parceria ? 0.25 : 0.25) / 1e4) * 1e4 };
}
/** Apresentar o projeto à diretoria: precisa de confiança e da entrada em caixa; o resto é pago semana a semana. */
export function iniciarEstadio(pacote: PacoteDados, s: SaveEst, p: ProjetoEstadio): { ok: boolean; msg: string } {
  if (s.estadioProprio) return { ok: false, msg: "O clube já tem estádio próprio." };
  if (s.obraEstadio) return { ok: false, msg: "O estádio novo já está sendo construído." };
  const nome = p.nome.trim();
  if (nome.length < 3) return { ok: false, msg: "Dê um nome ao estádio." };
  const o = orcamentoEstadio(s, p);
  if (s.diretoria.confianca < 60) return { ok: false, msg: `A diretoria só topa um projeto desse tamanho com confiança de 60 ou mais (hoje: ${Math.round(s.diretoria.confianca)}).` };
  if (s.clube.saldo < o.entrada) return { ok: false, msg: `A diretoria gostou, mas precisa da entrada em caixa: ${(o.entrada / 1e6).toFixed(1).replace(".", ",")} mi.` };
  s.clube.saldo -= o.entrada;
  s.obraEstadio = { ...p, nome, custo: o.doClube, pago: o.entrada, semanas: o.semanas, feitas: 0 };
  s.diretoria.confianca = clamp(s.diretoria.confianca - 4, 0, 100);
  return { ok: true, msg: `Projeto aprovado! A obra do ${nome} começa agora e leva ${o.semanas} semanas. O resto é pago um pouco por semana.` };
}
/** Uma semana de obra: paga a parcela (se não tiver dinheiro, a obra para) e avança. Devolve as notícias. */
export function semanaEstadio(s: SaveEst): { gasto: number; avisos: string[]; pronto?: string } {
  const o = s.obraEstadio, out: { gasto: number; avisos: string[]; pronto?: string } = { gasto: 0, avisos: [] };
  if (!o) return out;
  const parcela = Math.round((o.custo - o.pago) / Math.max(1, o.semanas - o.feitas));
  if (s.clube.saldo < parcela) {
    if (!o.pausada) out.avisos.push(`🏗️ A obra do ${o.nome} parou: falta dinheiro em caixa para a parcela da semana.`);
    o.pausada = true; return out;
  }
  if (o.pausada) out.avisos.push(`🏗️ A obra do ${o.nome} voltou a andar.`);
  o.pausada = false; s.clube.saldo -= parcela; o.pago += parcela; o.feitas++; out.gasto = parcela;
  const pct = Math.round((o.feitas / o.semanas) * 100);
  if ([25, 50, 75].some((m) => Math.round(((o.feitas - 1) / o.semanas) * 100) < m && pct >= m)) out.avisos.push(`🏗️ Obra do ${o.nome}: ${pct}% pronta.`);
  if (o.feitas >= o.semanas) {
    s.estadioProprio = { nome: o.nome, lugares: o.lugares, padrao: o.padrao, gramado: o.gramado, desde: s.temporada, ...(o.parceria ? { parceria: true, parceiroAte: s.temporada + ANOS_PARCERIA - 1 } : {}) };
    s.clube.capacidade = o.lugares; s.clube.conforto = PADRAO_EST[o.padrao].conforto; s.clube.gramado = GRAMADO_EST[o.gramado].qualidade;
    if (o.gramado === "sintetico") s.clube.grama = 22;
    s.clube.torcida = clamp(s.clube.torcida + 8, 0, 100); s.diretoria.confianca = clamp(s.diretoria.confianca + 8, 0, 100);
    s.obraEstadio = undefined; delete s.gramaCombinada;
    out.pronto = o.nome;
    out.avisos.push(`🏟️ O ${o.nome} está pronto! ${o.lugares.toLocaleString("pt-BR")} lugares, e agora o estádio é do clube: sem aluguel, com reformas liberadas e o nome à venda.`);
  }
  return out;
}
/** Altura da grama num estádio dividido: precisa combinar com o outro clube (uma proposta por mês). */
export function combinarGrama(pacote: PacoteDados, s: SaveEst, mm: number): { ok: boolean; msg: string } {
  const sit = situacaoEstadio(pacote, s), v = clamp(Math.round(mm), 20, 30);
  if (!sit.divide.length) { s.clube.grama = v; return { ok: true, msg: `Grama cortada em ${v} mm.` }; }
  const abs = s.temporada * 60 + s.semana;
  if (s.gramaCombinada !== undefined && abs - s.gramaCombinada < 4) return { ok: false, msg: `Você já discutiu a grama com o outro clube neste mês. Tente de novo em ${4 - (abs - s.gramaCombinada)} semanas.` };
  s.gramaCombinada = abs;
  const w = mundo(pacote), outro = sit.divide[0], nomeO = infoClube(pacote, outro)?.nome ?? "o outro clube";
  const minha = w.clube[s.clubeId]?.forca ?? 65, dele = w.clube[outro]?.forca ?? 65, atual = s.clube.grama ?? 25;
  const chance = clamp(0.5 + (minha - dele) / 40 - Math.abs(v - 25) * 0.05 + (Math.abs(v - 25) < Math.abs(atual - 25) ? 0.25 : 0), 0.1, 0.92);
  if (new RNG(`${s.semente}|grama|${abs}|${v}`).next() < chance) { s.clube.grama = v; return { ok: true, msg: `O ${nomeO} topou: a grama do ${sit.nome} fica em ${v} mm.` }; }
  return { ok: false, msg: `O ${nomeO} não topou mudar a grama do ${sit.nome} para ${v} mm. A altura continua em ${atual} mm.` };
}
