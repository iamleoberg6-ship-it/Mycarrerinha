// Mercado da carreira jogável: janelas, propostas, negociação pelo agente, empréstimo, renovação
// e troca de agente. As fórmulas de interesse, valor e salário vêm de mercado.ts.
import { RNG, clamp } from "./rng.js";
import { AGENTES, CAMBIO, clubeAceitaVenda, gerarPropostas, salarioMensal, valorMercado, type PerfilMercado, type Proposta, type TipoAgente } from "./mercado.js";
import { novaTabela, registrar, tabelaTurnoReturno, type Clube, type Liga, type PacoteDados } from "./liga.js";
import { simularPlacar, pontuacaoTitular, VAGAS_433 } from "./partida.js";
import { mundo, infoClube, LIGA_INFO } from "./mundo.js";
import { alojamentosDoClube, imovelAtual, mudar, nomeImovel, IMOVEL } from "./casa.js";
import { SEMANAS_PRE, SEMANAS_TEMPORADA, ANO_INICIAL, clubeCasa, ligaAtual, noticia, ovr, type Carreira, type Save } from "./jogo.js";

// ------------------------------------------------------------------ tipos
export type TipoProposta = "transferencia" | "emprestimo" | "renovacao" | "livre";
export type Papel = "titular" | "rotacao" | "reserva";
export interface PropostaSave {
  id: string; tipo: TipoProposta; clubeId: string; ligaId: string;
  /** R$ por mês */ salario: number; anos: number;
  /** euros (transferência) */ taxa: number;
  /** R$, pagas na assinatura */ luvas: number;
  papel: Papel; interesse: number;
  /** semana absoluta em que a proposta cai */ expira: number;
  negociada?: boolean;
  /** o seu clube não aceitou vender */ travada?: boolean;
}
export interface Transferencia { temporada: number; semana: number; de: string; para: string; tipo: TipoProposta; taxa: number }
export interface DadosMercado {
  propostas: PropostaSave[];
  transferencias: Transferencia[];
  emprestimo?: { origem: string; ligaOrigem: string; ordemOrigem: string[]; ate: number };
  /** pediu para ser negociado */
  listaTransferencia?: boolean;
  /** recusou a renovação nesta temporada */
  semRenovacao?: number;
  /** semana absoluta da última troca de agente */
  agenteDesde?: number;
  seq: number;
}
export const mercadoDe = (c: Carreira): DadosMercado => (c.mercado ??= { propostas: [], transferencias: [], seq: 0 });

// ------------------------------------------------------------------ calendário do mercado
export const JANELAS = [{ ini: 0, fim: 3, nome: "janela de pré-temporada" }, { ini: 20, fim: 23, nome: "janela do meio do ano" }];
export const semanaAbs = (c: Carreira) => c.temporada * SEMANAS_TEMPORADA + c.semana;
export const janelaAberta = (c: Carreira) => JANELAS.find((j) => c.semana >= j.ini && c.semana <= j.fim);
export function proximaJanela(c: Carreira): string {
  const j = JANELAS.find((x) => x.ini > c.semana);
  return j ? `${j.nome} (semana ${j.ini + 1})` : `${JANELAS[0].nome} de ${ANO_INICIAL + c.temporada + 1}`;
}
const fimDaJanela = (c: Carreira) => c.temporada * SEMANAS_TEMPORADA + (janelaAberta(c)?.fim ?? c.semana) + 1;

// ------------------------------------------------------------------ agentes
export interface InfoAgente { nome: string; quem: string; texto: string; requisito?: { fama: number; ovr: number } }
export const AGENTE_INFO: Record<TipoAgente, InfoAgente> = {
  pai: { nome: "Família", quem: "Seu pai cuida de tudo", texto: "Não cobra nada, mas não conhece ninguém fora do Brasil e negocia mal." },
  iniciante: { nome: "Agente iniciante", quem: "Rodrigo Prates", texto: "Cobra 5% do salário. Contatos só no Brasil, negociação razoável." },
  experiente: { nome: "Agente experiente", quem: "Márcia Valente", texto: "Cobra 8%. Abre portas na Europa Média e no Golfo, consegue salários melhores.", requisito: { fama: 12, ovr: 64 } },
  top: { nome: "Superagente", quem: "Vítor Alencar", texto: "Cobra 10%. Fala com qualquer clube do mundo e arranca os melhores contratos.", requisito: { fama: 30, ovr: 72 } },
};
const HABILIDADE_AGENTE: Record<TipoAgente, number> = { pai: 0, iniciante: 0.1, experiente: 0.2, top: 0.3 };
export function podeContratarAgente(s: Save, t: TipoAgente): { ok: boolean; msg: string } {
  const c = s.carreira, r = AGENTE_INFO[t].requisito, m = mercadoDe(c);
  if (c.agente === t) return { ok: false, msg: "Já é o seu agente." };
  if (r && c.fama < r.fama && ovr(s.jogador) < r.ovr) return { ok: false, msg: `Só aceita jogador com fama ${r.fama}+ ou nível ${r.ovr}+.` };
  if (m.agenteDesde !== undefined && semanaAbs(c) - m.agenteDesde < 10) return { ok: false, msg: `Trocou de agente há pouco. Espere mais ${10 - (semanaAbs(c) - m.agenteDesde)} semanas.` };
  return { ok: true, msg: "" };
}
export function trocarAgente(s: Save, t: TipoAgente): { ok: boolean; msg: string } {
  const ok = podeContratarAgente(s, t);
  if (!ok.ok) return ok;
  const c = s.carreira, antes = c.agente;
  c.agente = t; mercadoDe(c).agenteDesde = semanaAbs(c);
  if (antes === "pai") c.moral = clamp(c.moral - 2, 0, 100);
  noticia(s, "clube", "Novo agente", t === "pai" ? `${s.jogador.apelido} volta a ser representado pela família.` : `${s.jogador.apelido} agora é representado por ${AGENTE_INFO[t].quem}.`);
  return { ok: true, msg: t === "pai" ? "A família volta a cuidar da sua carreira." : `${AGENTE_INFO[t].quem} é seu novo agente.` };
}

// ------------------------------------------------------------------ papel no clube
export function papelNoClube(clube: Clube, s: Save): Papel {
  const j = s.jogador, meu = pontuacaoTitular(ovr(j), 6.5, 50, 0);
  const rank = clube.elenco.filter((x) => x.posicao === j.posicao && pontuacaoTitular(x.ovr, 6.5, 50, 0) > meu).length;
  const vagas = VAGAS_433[j.posicao];
  return rank < vagas ? "titular" : rank <= vagas + 1 ? "rotacao" : "reserva";
}
export const NOME_PAPEL: Record<Papel, string> = { titular: "Titular", rotacao: "Rotação", reserva: "Reserva" };

// ------------------------------------------------------------------ geração semanal
function perfilDe(pacote: PacoteDados, s: Save): PerfilMercado {
  const c = s.carreira, j = s.jogador, l = ligaAtual(pacote, s);
  const jogos = c.stats.jogos + (c.historico.at(-1)?.jogos ?? 0), tit = c.stats.titular;
  return {
    ovr: ovr(j), pot: j.pot, idade: j.idade, posicao: j.posicao, nacionalidade: j.nacionalidade, fama: c.fama + (mercadoDe(c).listaTransferencia ? 8 : 0),
    seguidores: c.seguidores, pctTitular: jogos ? Math.min(1, (tit + (c.historico.at(-1)?.jogos ?? 0) * 0.6) / Math.max(1, jogos)) : 0,
    ligaAtual: l, clubeAtual: l.clubes.find((x) => x.id === c.clubeId) ?? null, anosContrato: c.anosContrato, agente: c.agente, continental: false, selecao: false, salarioAtual: c.salario,
  };
}
const nova = (m: DadosMercado, p: Omit<PropostaSave, "id">): PropostaSave => ({ id: `p${++m.seq}`, ...p });
const nomeClube = (pacote: PacoteDados, id: string) => infoClube(pacote, id).nome;

/** Chamado no fim de cada semana: novas propostas na janela, renovação, empréstimo; propostas vencidas caem. */
export function semanaDoMercado(pacote: PacoteDados, s: Save, rng: RNG, eventos: string[]) {
  const c = s.carreira, j = s.jogador, m = mercadoDe(c), agora = semanaAbs(c), w = mundo(pacote);
  const caiu = m.propostas.filter((p) => p.expira <= agora);
  m.propostas = m.propostas.filter((p) => p.expira > agora);
  if (caiu.length) eventos.push(`${caiu.length === 1 ? "Uma proposta expirou" : `${caiu.length} propostas expiraram`} com o fim da janela.`);
  const jan = janelaAberta(c);
  if (!jan || c.formacao || j.idade < 18) return;
  const clube = w.clube[c.clubeId], l = ligaAtual(pacote, s);
  // 1. renovação: contrato acabando
  if (c.anosContrato <= 1 && !m.emprestimo && m.semRenovacao !== c.temporada && !m.propostas.some((p) => p.tipo === "renovacao")) {
    const quer = ovr(j) >= clube.forca - 9 || j.idade <= 22;
    if (quer) {
      const sal = Math.round(Math.max(c.salario * 1.02, salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama })));
      const p = nova(m, { tipo: "renovacao", clubeId: c.clubeId, ligaId: l.id, salario: sal, anos: j.idade <= 24 ? 4 : j.idade <= 30 ? 3 : 2, taxa: 0, luvas: Math.round(sal * 1.5), papel: papelNoClube(clube, s), interesse: 0.8, expira: fimDaJanela(c) + SEMANAS_TEMPORADA / 2 });
      m.propostas.push(p);
      eventos.push(`O ${clube.nome} quer renovar seu contrato: ${p.anos} anos.`);
      noticia(s, "clube", "Proposta de renovação", `O ${clube.nome} oferece ${p.anos} anos de contrato a ${j.apelido}.`);
    } else if (c.semana === jan.ini) {
      noticia(s, "clube", "Sem renovação à vista", `O ${clube.nome} não deve renovar com ${j.apelido}. O contrato termina no fim da temporada.`);
    }
  }
  // 2. empréstimo: garoto com poucos minutos
  const minutos = c.stats.jogos + (c.semana < 6 ? c.historico.at(-1)?.jogos ?? 0 : 0);
  if (!m.emprestimo && j.idade <= 22 && papelNoClube(clube, s) === "reserva" && minutos < (c.semana < 6 ? 12 : 6) && !m.propostas.some((p) => p.tipo === "emprestimo") && rng.chance(0.45)) {
    const destinos = w.ligas.filter((x) => x.nivel >= l.nivel && LIGA_INFO[x.id].regiao === LIGA_INFO[l.id].regiao || x.id === "BRA2").flatMap((x) => x.clubes)
      .filter((x) => x.id !== c.clubeId && papelNoClube(x, s) === "titular" && x.forca <= clube.forca);
    if (destinos.length) {
      const d = rng.pick(destinos.sort((a, b) => b.forca - a.forca).slice(0, 5));
      m.propostas.push(nova(m, { tipo: "emprestimo", clubeId: d.id, ligaId: d.ligaId, salario: c.salario, anos: 0, taxa: 0, luvas: 0, papel: "titular", interesse: 0.7, expira: fimDaJanela(c) }));
      eventos.push(`O ${clube.nome} sugere te emprestar ao ${d.nome} para ganhar minutos.`);
    }
  }
  // 3. propostas de outros clubes (quem acabou de chegar espera a próxima temporada)
  if (m.emprestimo || m.propostas.filter((p) => p.tipo !== "renovacao").length >= 4) return;
  if (m.transferencias.some((t) => t.temporada === c.temporada && t.tipo !== "emprestimo")) return;
  const perfil = perfilDe(pacote, s);
  const chance = 0.45 + (m.listaTransferencia ? 0.25 : 0);
  if (!rng.chance(chance)) return;
  const cand = gerarPropostas(rng, perfil, w.ligas, c.fama).filter((p) => !m.propostas.some((x) => x.clubeId === p.clube.id) && golfoQuer(p, s));
  for (const p of cand.slice(0, rng.chance(0.25) ? 2 : 1)) {
    const prop = paraSave(pacote, s, p);
    m.propostas.push(prop);
    eventos.push(`Proposta nova: o ${p.clube.nome} (${LIGA_INFO[p.liga.id].curto}) quer você.`);
    noticia(s, "clube", "Proposta na mesa", `O ${p.clube.nome} fez uma proposta por ${j.apelido}${prop.taxa ? `: € ${(prop.taxa / 1e6).toFixed(1)} mi ao ${clube.nome}` : ""}.`);
  }
}

/** O Golfo compra jogador pronto: a partir dos 24 anos, ou estrela. */
const golfoQuer = (p: Proposta, s: Save) => p.liga.id !== "ARA1" || s.jogador.idade >= 24 || ovr(s.jogador) >= 76;

function paraSave(pacote: PacoteDados, s: Save, p: Proposta): PropostaSave {
  const m = mercadoDe(s.carreira), livre = !p.taxa;
  const salario = Math.round(Math.max(p.salario, s.carreira.salario));
  const luvas = Math.round(livre ? salario * 3 : p.taxa * CAMBIO * 0.03);
  return nova(m, { tipo: livre ? "livre" : "transferencia", clubeId: p.clube.id, ligaId: p.liga.id, salario, anos: p.anos, taxa: Math.round(p.taxa), luvas, papel: papelNoClube(p.clube, s), interesse: p.interesse, expira: fimDaJanela(s.carreira) });
}

// ------------------------------------------------------------------ ações do jogador
type R = { ok: boolean; msg: string };
const rngAcao = (s: Save, ...x: (string | number)[]) => new RNG(`${s.semente}|mercado|${semanaAbs(s.carreira)}|${x.join("|")}`);

/** O agente tenta melhorar a proposta (uma vez). Pode dar certo, não mudar nada ou o clube desistir. */
export function negociar(pacote: PacoteDados, s: Save, id: string): R {
  const m = mercadoDe(s.carreira), p = m.propostas.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Proposta não encontrada." };
  if (p.negociada) return { ok: false, msg: "Essa já foi negociada." };
  if (p.tipo === "emprestimo") return { ok: false, msg: "Empréstimo não tem o que negociar." };
  p.negociada = true;
  const rng = rngAcao(s, "negociar", id), chance = clamp(0.35 + HABILIDADE_AGENTE[s.carreira.agente] + (p.interesse - 0.6), 0.15, 0.85);
  const nome = p.tipo === "renovacao" ? `o ${nomeClube(pacote, p.clubeId)}` : `o ${nomeClube(pacote, p.clubeId)}`;
  if (rng.chance(chance)) {
    const f = 1.06 + HABILIDADE_AGENTE[s.carreira.agente] * 0.3;
    p.salario = Math.round(p.salario * f); p.luvas = Math.round(p.luvas * (f + 0.1));
    return { ok: true, msg: `Deu certo: ${nome} subiu o salário para R$ ${p.salario.toLocaleString("pt-BR")}.` };
  }
  if (p.tipo !== "renovacao" && rng.chance(0.4)) {
    m.propostas = m.propostas.filter((x) => x.id !== id);
    return { ok: false, msg: `${nome[0].toUpperCase() + nome.slice(1)} não gostou da pedida e desistiu.` };
  }
  return { ok: false, msg: `${nome[0].toUpperCase() + nome.slice(1)} manteve a proposta como estava.` };
}

export function recusar(pacote: PacoteDados, s: Save, id: string): R {
  const m = mercadoDe(s.carreira), p = m.propostas.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Proposta não encontrada." };
  m.propostas = m.propostas.filter((x) => x.id !== id);
  if (p.tipo === "renovacao") {
    m.semRenovacao = s.carreira.temporada;
    noticia(s, "clube", "Renovação recusada", `${s.jogador.apelido} recusou renovar com o ${nomeClube(pacote, p.clubeId)}.`);
    return { ok: true, msg: "Você recusou a renovação. Se nada mudar, sai de graça no fim do contrato." };
  }
  if (p.tipo === "emprestimo") s.carreira.relTecnico = clamp(s.carreira.relTecnico + 1, 0, 100);
  return { ok: true, msg: "Proposta recusada." };
}

/** Pedir para ser negociado: mais propostas e o clube libera mais fácil, mas o técnico não gosta. */
export function pedirParaSair(s: Save, sim: boolean): R {
  const m = mercadoDe(s.carreira);
  if (m.listaTransferencia === sim) return { ok: false, msg: "" };
  m.listaTransferencia = sim;
  if (sim) { s.carreira.relTecnico = clamp(s.carreira.relTecnico - 8, 0, 100); noticia(s, "polemica", "Quer sair", `${s.jogador.apelido} pediu à diretoria para ser negociado.`); return { ok: true, msg: "Pedido feito: o clube vai ouvir propostas. O técnico não gostou." }; }
  return { ok: true, msg: "Você tirou o pedido de saída." };
}

export function aceitar(pacote: PacoteDados, s: Save, id: string, forcar = false): R {
  const c = s.carreira, m = mercadoDe(c), p = m.propostas.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Proposta não encontrada." };
  const w = mundo(pacote), destino = w.clube[p.clubeId];
  if (p.tipo === "renovacao") {
    c.salario = p.salario; c.anosContrato = p.anos; c.relTecnico = clamp(c.relTecnico + 3, 0, 100);
    receberLuvas(s, p.luvas);
    m.propostas = m.propostas.filter((x) => x.id !== id);
    noticia(s, "clube", "Renovou", `${s.jogador.apelido} renova com o ${destino.nome} até ${ANO_INICIAL + c.temporada + p.anos}: R$ ${p.salario.toLocaleString("pt-BR")} por mês.`);
    return { ok: true, msg: `Contrato renovado por ${p.anos} anos.` };
  }
  if (p.tipo === "emprestimo") {
    m.emprestimo = { origem: c.clubeId, ligaOrigem: c.ligaId ?? "BRA1", ordemOrigem: c.ordem, ate: c.temporada };
    mudarDeClube(pacote, s, destino, "emprestimo", 0);
    m.propostas = m.propostas.filter((x) => x.tipo === "renovacao");
    return { ok: true, msg: `Emprestado ao ${destino.nome} até o fim da temporada.` };
  }
  if (p.tipo === "transferencia") {
    const origem = w.clube[c.clubeId];
    if (p.travada && !forcar) return { ok: false, msg: `O ${origem.nome} não liberou. Você pode forçar a saída.` };
    if (!p.travada) {
      const importancia = (papelNoClube(origem, s) === "titular" ? 1.35 : 1.0) * (m.listaTransferencia ? 0.8 : 1) * (c.anosContrato >= 3 ? 1.1 : 1);
      const vm = valorMercado(ovr(s.jogador), s.jogador.idade, c.anosContrato, w.liga[c.ligaId ?? "BRA1"].fLiga);
      const prop = { taxa: p.taxa, orcamento: p.taxa * 1.4 } as Proposta;
      if (!clubeAceitaVenda(rngAcao(s, "venda", id), prop, vm, importancia)) {
        p.travada = true;
        return { ok: false, msg: `O ${origem.nome} recusou vender por € ${(p.taxa / 1e6).toFixed(1)} mi. Você pode forçar a saída ou esperar outra proposta.` };
      }
      p.taxa = Math.round(prop.taxa);
    } else {
      // forçar a saída: desgaste com o clube e a torcida
      c.relTecnico = clamp(c.relTecnico - 15, 0, 100); c.moral = clamp(c.moral - 4, 0, 100); c.fama = clamp(c.fama + 1, 0, 100);
      noticia(s, "polemica", "Forçou a saída", `${s.jogador.apelido} bate o pé e força a ida para o ${destino.nome}. A torcida do ${origem.nome} não perdoou.`);
      if (!rngAcao(s, "forcar", id).chance(0.7)) { m.propostas = m.propostas.filter((x) => x.id !== id); return { ok: false, msg: `O ${origem.nome} segurou você. O clima ficou pesado.` }; }
    }
  }
  c.salario = p.salario; c.anosContrato = p.anos; c.formacao = false;
  mudarDeClube(pacote, s, destino, p.tipo, p.taxa);
  receberLuvas(s, p.luvas);
  m.propostas = [];
  m.listaTransferencia = false;
  return { ok: true, msg: `Você é jogador do ${destino.nome}!` };
}

function receberLuvas(s: Save, luvas: number) {
  if (!luvas) return;
  const liquido = Math.round(luvas * (1 - AGENTES[s.carreira.agente].comissao));
  s.casa.saldo += liquido;
  noticia(s, "dinheiro", "Luvas", `R$ ${liquido.toLocaleString("pt-BR")} de luvas na conta${AGENTES[s.carreira.agente].comissao ? " (já descontada a comissão do agente)" : ""}.`);
}

/** Troca de clube no meio da carreira: liga, tabela, técnico novo, moradia. */
export function mudarDeClube(pacote: PacoteDados, s: Save, destino: Clube, tipo: TipoProposta, taxa: number, ordemFixa?: string[]) {
  const c = s.carreira, m = mercadoDe(c), w = mundo(pacote), de = c.clubeId, ligaDe = c.ligaId ?? "BRA1";
  c.clubeId = destino.id; c.ligaId = destino.ligaId;
  if (destino.ligaId !== ligaDe) {
    const l = w.liga[destino.ligaId], rng = new RNG(`${s.semente}|tabela|${c.temporada}|${destino.ligaId}`);
    c.ordem = ordemFixa ?? embaralhar(rng, l.clubes.map((x) => x.id));
    c.tabela = tabelaAteAgora(rng, l, c);
  }
  c.relTecnico = clamp(45 + c.fama / 5, 0, 100);
  c.suspensao = 0;
  if (tipo !== "emprestimo") c.chegadaClube = c.temporada;
  m.transferencias.push({ temporada: c.temporada, semana: c.semana, de, para: destino.id, tipo, taxa });
  // moradia: quem mora no alojamento vai para o do novo clube; quem tem casa fica com ela
  const cc = clubeCasa(pacote, destino.id);
  s.casa.clube = cc;
  if (imovelAtual(s.casa).categoria === "alojamento") mudar(s.casa, alojamentosDoClube(cc)[0], "alugar", c.salario);
  const ano = ANO_INICIAL + c.temporada, ligaNome = LIGA_INFO[destino.ligaId].curto;
  const titulo = tipo === "emprestimo" ? `Emprestado ao ${destino.nome}` : tipo === "livre" ? `${s.jogador.apelido} acerta com o ${destino.nome}` : `${s.jogador.apelido} é do ${destino.nome}`;
  noticia(s, "clube", titulo, `${tipo === "transferencia" ? `Negócio de € ${(taxa / 1e6).toFixed(1)} mi. ` : ""}${ligaNome}, ${ano}. ${tipo === "emprestimo" ? "Volta no fim da temporada." : `Contrato de ${c.anosContrato} anos, R$ ${c.salario.toLocaleString("pt-BR")} por mês.`}${imovelAtual(s.casa).categoria === "alojamento" ? ` Mora em: ${nomeImovel(s.casa, IMOVEL[s.casa.imovel])}.` : ""}`);
}

function embaralhar(rng: RNG, ids: string[]): string[] {
  const o = [...ids];
  for (let i = o.length - 1; i > 0; i--) { const j = rng.int(0, i); [o[i], o[j]] = [o[j], o[i]]; }
  return o;
}
/** Tabela de uma liga nova com as rodadas que já aconteceram nesta temporada. */
function tabelaAteAgora(rng: RNG, l: Liga, c: Carreira) {
  const t = novaTabela(l), feitas = Math.max(0, Math.min(2 * (c.ordem.length - 1), c.semana - SEMANAS_PRE));
  const rodadas = tabelaTurnoReturno(c.ordem.length);
  const forca = (id: string) => l.clubes.find((x) => x.id === id)!.forca;
  for (let r = 0; r < feitas; r++) for (const [a, b] of rodadas[r]) {
    const casa = c.ordem[a], fora = c.ordem[b], [gc, gf] = simularPlacar(rng, forca(casa), forca(fora));
    registrar(t.find((x) => x.clube === casa)!, gc, gf); registrar(t.find((x) => x.clube === fora)!, gf, gc);
  }
  return t;
}

/** Fim da temporada: o empréstimo acaba; contrato vencido vira passe livre (o agente procura clube). */
export function fimDaTemporadaNoMercado(pacote: PacoteDados, s: Save, eventos: string[]) {
  const c = s.carreira, m = mercadoDe(c), w = mundo(pacote);
  m.propostas = [];
  if (m.emprestimo && m.emprestimo.ate < c.temporada) {
    const e = m.emprestimo;
    m.emprestimo = undefined;
    mudarDeClube(pacote, s, w.clube[e.origem], "emprestimo", 0, e.ordemOrigem);
    m.transferencias.pop();
    eventos.push(`Fim do empréstimo: de volta ao ${w.clube[e.origem].nome}.`);
  }
}

/** Contrato acabou sem renovação: vira jogador livre e assina com a melhor proposta (ou o clube oferece o mínimo). */
export function contratoVencido(pacote: PacoteDados, s: Save, eventos: string[]): boolean {
  const c = s.carreira, w = mundo(pacote);
  if (c.formacao || c.anosContrato > 0) return false;
  const perfil = { ...perfilDe(pacote, s), clubeAtual: null, anosContrato: 0 };
  const props = gerarPropostas(new RNG(`${s.semente}|livre|${c.temporada}`), perfil, w.ligas, c.fama).filter((p) => p.clube.id !== c.clubeId && golfoQuer(p, s));
  const origem = w.clube[c.clubeId];
  if (!props.length) {
    c.anosContrato = 1; c.salario = Math.round(c.salario * 0.85);
    eventos.push(`Sem propostas, você ficou no ${origem.nome} com contrato de 1 ano e salário menor.`);
    noticia(s, "clube", "Contrato curto", `Sem mercado, ${s.jogador.apelido} fica no ${origem.nome} por mais um ano.`);
    return true;
  }
  const melhor = props.sort((a, b) => b.interesse - a.interesse || b.salario - a.salario)[0];
  const p = paraSave(pacote, s, melhor);
  c.salario = p.salario; c.anosContrato = p.anos;
  mudarDeClube(pacote, s, melhor.clube, "livre", 0);
  receberLuvas(s, p.luvas);
  eventos.push(`Contrato encerrado: de graça, você assinou com o ${melhor.clube.nome}.`);
  return true;
}

/** Política automática (testes e balanceamento): o que um jogador sensato faria com as propostas da semana. */
export function decidirAutomatico(pacote: PacoteDados, s: Save) {
  const c = s.carreira, m = mercadoDe(c), w = mundo(pacote);
  // agente: o melhor disponível
  for (const t of ["top", "experiente", "iniciante"] as TipoAgente[]) { if (t === c.agente) break; if (podeContratarAgente(s, t).ok) { trocarAgente(s, t); break; } }
  for (const p of [...m.propostas]) {
    if (!m.propostas.includes(p)) continue;
    if (p.tipo === "renovacao") { if (!p.negociada) negociar(pacote, s, p.id); if (m.propostas.includes(p)) aceitar(pacote, s, p.id); continue; }
    if (p.tipo === "emprestimo") { aceitar(pacote, s, p.id); return; }
    const atual = w.clube[c.clubeId], novo = w.clube[p.clubeId], papelAtual = papelNoClube(atual, s);
    const nivelAtual = w.liga[c.ligaId ?? "BRA1"].nivel, nivelNovo = w.liga[p.ligaId].nivel, idade = s.jogador.idade;
    const sobeDeLiga = nivelNovo < nivelAtual && p.papel !== "reserva";
    const melhora = sobeDeLiga || (p.papel === "titular" && papelAtual !== "titular" && nivelNovo <= nivelAtual + 1) || (novo.forca >= atual.forca + 3 && p.papel !== "reserva" && nivelNovo <= nivelAtual)
      || (idade >= 28 && p.salario >= c.salario * 2 && p.papel !== "reserva");
    if (!melhora) { recusar(pacote, s, p.id); continue; }
    if (!p.negociada) negociar(pacote, s, p.id);
    if (!m.propostas.includes(p)) continue;
    const r = aceitar(pacote, s, p.id);
    if (r.ok) return;
    recusar(pacote, s, p.id);
  }
}
