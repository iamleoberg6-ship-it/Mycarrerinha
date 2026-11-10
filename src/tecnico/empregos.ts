// O mercado de técnicos: todos os clubes com o técnico atual, quem está estável, sob pressão ou balançando, e as vagas
// abertas no meio da temporada. Você pode se candidatar a uma vaga, declarar interesse na mídia por um clube cujo técnico
// balança (a sua diretoria não gosta) ou mandar o seu empresário sondar por baixo dos panos (pode vazar).
import { RNG, clamp } from "../rng.js";
import type { PacoteDados, LinhaTabela } from "../liga.js";
import { novaTabela, registrar, ordenar, rodadasDaLiga } from "../liga.js";
import { simularPlacar } from "../partida.js";
import { mundo, tecnicoDoClube, infoClube } from "../mundo.js";
import { infoLiga, LIGAS } from "../ligas.js";
import { licencaExigida } from "../licencas.js";
import type { Tecnico } from "../tecnicos.js";
import type { SaveTecnico } from "./motor.js";

export const LIGAS_EMPREGO = ["BRA1", "BRA2", "ENG1", "ESP1", "ITA1", "GER1", "FRA1", "POR1", "NED1", "ARG1", "MEX1", "USA1", "KSA1", "TUR1", "JPN1"];
export type StatusTecnico = "vaga" | "balancando" | "pressao" | "estavel";
export const NOME_STATUS: Record<StatusTecnico, string> = { vaga: "Sem técnico", balancando: "Balançando", pressao: "Sob pressão", estavel: "Estável" };
export interface SituacaoClube { /** a liga ainda não começou */ semJogos?: boolean; clubeId: string; tecnico?: Tecnico; saiu?: string; status: StatusTecnico; pressao: number; pos: number; esperado: number; n: number; exige: number; licenca: number; seu?: boolean }

const cache = new Map<string, LinhaTabela[]>();
/** Tabela da liga até agora (a sua é a de verdade; as outras, simuladas sempre do mesmo jeito). */
export function tabelaAgora(pacote: PacoteDados, s: SaveTecnico, ligaId: string): LinhaTabela[] {
  if (ligaId === s.ligaId) return ordenar(s.tabela);
  const l = mundo(pacote).liga[ligaId];
  if (!l) return [];
  const feitas = Math.max(0, s.semana - 2), k = `${s.semente}|${s.temporada}|${ligaId}|${feitas}`;
  const ja = cache.get(k); if (ja) return ja;
  const tab = novaTabela(l), rng = new RNG(`${s.semente}|empregos|${s.temporada}|${ligaId}`), rs = rodadasDaLiga(l.clubes.length);
  for (const r of rs.slice(0, Math.min(feitas, rs.length))) for (const [a, b] of r) { const [x, y] = simularPlacar(rng, l.clubes[a].forca, l.clubes[b].forca); registrar(tab[a], x, y); registrar(tab[b], y, x); }
  const out = ordenar(tab);
  if (cache.size > 60) cache.clear();
  cache.set(k, out);
  return out;
}
/** A situação do técnico de um clube: a campanha contra o esperado pela força, o tempo de casa e um pouco de humor do presidente. */
export function situacaoDoClube(pacote: PacoteDados, s: SaveTecnico, clubeId: string): SituacaoClube {
  const w = mundo(pacote), info = infoClube(pacote, clubeId), ligaId = info?.ligaId ?? s.ligaId, l = w.liga[ligaId], forca = w.clube[clubeId]?.forca ?? 60;
  const tab = tabelaAgora(pacote, s, ligaId), n = tab.length || l?.clubes.length || 20;
  const esperado = 1 + (l?.clubes ?? []).filter((c) => c.forca > forca).length;
  // sem rodada jogada, a tabela não diz nada: vale a posição esperada
  const jogou = tab.some((t) => t.j > 0);
  const pos = jogou ? Math.max(1, tab.findIndex((t) => t.clube === clubeId) + 1) : esperado;
  const exige = Math.round(clamp((forca - 62) * 3, 0, 95)), licenca = licencaExigida(forca), semJogos = !jogou;
  if (clubeId === s.clubeId) return { clubeId, status: s.diretoria.confianca < 30 ? "balancando" : s.diretoria.confianca < 50 ? "pressao" : "estavel", pressao: Math.round(100 - s.diretoria.confianca), pos, esperado, n, exige, licenca, seu: true, semJogos };
  const vaga = s.vagasT?.[clubeId];
  if (vaga) return { clubeId, saiu: vaga.saiu, status: "vaga", pressao: 100, pos, esperado, n, exige, licenca, semJogos };
  const tec = tecnicoDoClube(pacote, clubeId), feitas = Math.max(0, s.semana - 2);
  const humor = new RNG(`${s.semente}|humor|${clubeId}|${s.temporada}`).normal(0, 9);
  const anos = tec ? Math.max(0, s.temporada - tec.desde) : 0;
  const rebaixa = infoLiga(ligaId).rebaixados && pos > n - infoLiga(ligaId).rebaixados ? 18 : 0;
  // no começo da temporada quase ninguém balança: a campanha pesa conforme as rodadas passam
  const peso = clamp(feitas / 12, 0.25, 1);
  const pressao = Math.round(clamp(35 + ((pos - esperado) * 6 + rebaixa) * peso + humor + (anos >= 3 ? 6 : 0) - (pos === 1 ? 20 : 0) + (s.interesses?.[clubeId] !== undefined ? 8 : 0), 0, 99));
  return { clubeId, ...(tec ? { tecnico: tec } : {}), status: pressao >= 72 ? "balancando" : pressao >= 55 ? "pressao" : "estavel", pressao, pos, esperado, n, exige, licenca, semJogos };
}
export function listaEmpregos(pacote: PacoteDados, s: SaveTecnico, ligaId: string): SituacaoClube[] {
  const l = mundo(pacote).liga[ligaId];
  return (l?.clubes ?? []).map((c) => situacaoDoClube(pacote, s, c.id)).sort((a, b) => b.pressao - a.pressao);
}
/** Vagas abertas agora em todas as ligas do mercado. */
export const vagasAbertas = (s: SaveTecnico) => Object.keys(s.vagasT ?? {});
export const ligasDoMercado = (s: SaveTecnico) => [...new Set([s.ligaId, ...LIGAS_EMPREGO])].filter((id) => LIGAS.some((l) => l.id === id));

const semanaAbsE = (s: SaveTecnico) => s.temporada * 60 + s.semana;
/** Você cabe no clube? (reputação e licença, com a folga de quem tem nome) */
function cabe(s: SaveTecnico, sit: SituacaoClube, folga = 0): boolean {
  const lic = (s.tecnico.curso?.licenca ?? 2) + ((s.tecnico.prestigio ?? 0) >= 80 ? 2 : (s.tecnico.prestigio ?? 0) >= 60 ? 1 : 0);
  return sit.exige <= s.tecnico.reputacao + folga && sit.licenca <= lic;
}
/** Declarar interesse publicamente (entrevista) ou mandar o empresário sondar (discreto, mas pode vazar). */
export function declararInteresse(pacote: PacoteDados, s: SaveTecnico, clubeId: string, discreto: boolean): { ok: boolean; msg: string } {
  if (clubeId === s.clubeId) return { ok: false, msg: "Esse é o seu clube." };
  const nome = infoClube(pacote, clubeId)?.nome ?? clubeId;
  if (s.interesses?.[clubeId] !== undefined && semanaAbsE(s) - s.interesses[clubeId] < 6) return { ok: false, msg: `O ${nome} já sabe do seu interesse. Espere a resposta.` };
  (s.interesses ??= {})[clubeId] = semanaAbsE(s);
  const vaza = !discreto || new RNG(`${s.semente}|vaza|${clubeId}|${semanaAbsE(s)}`).chance(0.3);
  if (vaza) {
    s.diretoria.confianca = clamp(s.diretoria.confianca - (discreto ? 6 : 10), 0, 100);
    s.clube.torcida = clamp(s.clube.torcida - (discreto ? 3 : 6), 0, 100);
    for (const a of s.elenco) a.moral = clamp(a.moral - 2, 0, 100);
    return { ok: true, msg: discreto ? `Vazou: a imprensa descobriu que o seu empresário sondou o ${nome}. A diretoria e a torcida não gostaram.` : `Você disse na coletiva que sonha em treinar o ${nome}. A diretoria ficou irritada, a torcida chiou e o vestiário sentiu.` };
  }
  return { ok: true, msg: `O seu empresário conversou com a diretoria do ${nome} sem ninguém saber. Se o técnico de lá cair, você é lembrado.` };
}
/** Candidatar-se a uma vaga aberta: com o nome certo, o clube chama você para a reunião. */
export function candidatar(pacote: PacoteDados, s: SaveTecnico, clubeId: string): { ok: boolean; msg: string } {
  const sit = situacaoDoClube(pacote, s, clubeId), nome = infoClube(pacote, clubeId)?.nome ?? clubeId;
  if (sit.status !== "vaga") return { ok: false, msg: `O ${nome} tem técnico. Declare interesse e espere.` };
  if (s.ofertaEmprego) return { ok: false, msg: "Responda primeiro a proposta que você já tem." };
  if (!cabe(s, sit, 6)) return { ok: false, msg: `O ${nome} agradeceu, mas procura um nome mais forte (pede reputação ${sit.exige}${sit.licenca > (s.tecnico.curso?.licenca ?? 2) ? " e licença maior" : ""}).` };
  s.ofertaEmprego = { clubeId, expira: semanaAbsE(s) + 2, texto: `O ${nome} está sem técnico e quer resolver rápido.`, vaga: true };
  return { ok: true, msg: `O ${nome} chamou você para conversar. A proposta está na tela inicial.` };
}
/** A semana do mercado: técnicos caem no meio da temporada, vagas são preenchidas e quem demonstrou interesse é chamado. */
export function semanaEmpregos(pacote: PacoteDados, s: SaveTecnico, nota: (t: string) => void) {
  const ab = semanaAbsE(s), rng = new RNG(`${s.semente}|mercadoT|${ab}`);
  // vagas antigas são preenchidas por outro técnico
  for (const [id, v] of Object.entries(s.vagasT ?? {})) if (ab - v.desde >= 4 && s.ofertaEmprego?.clubeId !== id) { delete s.vagasT![id]; nota(`O ${infoClube(pacote, id)?.nome ?? id} anunciou o novo técnico.`); }
  if (s.semana < 8) return; // demissão em massa só depois de algumas rodadas
  for (const lid of ligasDoMercado(s)) for (const c of listaEmpregos(pacote, s, lid)) {
    if (c.seu || c.status === "vaga" || c.pressao < 72) continue;
    if (Object.keys(s.vagasT ?? {}).length >= 6) return;
    if (!rng.chance((c.pressao - 70) / 900 + (s.interesses?.[c.clubeId] !== undefined ? 0.05 : 0))) continue;
    (s.vagasT ??= {})[c.clubeId] = { desde: ab, saiu: c.tecnico?.nome ?? "o técnico" };
    const nome = infoClube(pacote, c.clubeId)?.nome ?? c.clubeId;
    nota(`${c.tecnico?.nome ?? "O técnico"} foi demitido do ${nome}. A vaga está aberta.`);
    // quem já tinha demonstrado interesse (e tem nome para o clube) recebe a ligação
    if (s.interesses?.[c.clubeId] !== undefined && !s.ofertaEmprego && cabe(s, c, 8)) {
      s.ofertaEmprego = { clubeId: c.clubeId, expira: ab + 2, texto: `Logo depois de demitir ${c.tecnico?.nome ?? "o técnico"}, o presidente ligou: lembrou do seu interesse.`, vaga: true };
      nota(`O ${nome} ligou para você! A proposta está na tela inicial.`);
    }
  }
}
export const LIGA_NOME = (id: string) => infoLiga(id).curto;
