// Mercado da carreira jogável: janelas, propostas, negociação pelo agente, empréstimo, renovação
// e troca de agente. As fórmulas de interesse, valor e salário vêm de mercado.ts.
import { RNG, clamp } from "./rng.js";
import { paiExJogador } from "./familia.js";
import { efeitosNamoro } from "./namoro.js";
import { PAISES } from "./dna.js";
import { novosConsultores, iniciarNegociacao, responder, efeitoConsultores, custoConsultores, type Especialidade, type RespostaConsultor, type ResultadoConsultor } from "./consultores.js";
import { FAMILIA, agenteDoBanco, perfilAgente, comissaoDo, BANCO, nivelDoAgente, habilidadesDoAgente } from "./agentes-banco.js";
import { iniciarNegAgente, responderAgente, habilidadeDoAgente, COMISSAO_MAX, type RespostaAgente, type ResultadoAgente } from "./agentes.js";
import { VIZINHOS, alcanceSoRegional, CAMBIO, tetoSalarial, componentesInteresse, clubeAceitaVenda, gerarPropostas, salarioMensal, valorMercado, type PerfilMercado, type Proposta, type TipoAgente } from "./mercado.js";
import { novaTabela, registrar, rodadasDaLiga, type Clube, type Liga, type PacoteDados } from "./liga.js";
import { simularPlacar, pontuacaoTitular, VAGAS_433 } from "./partida.js";
import { mundo, infoClube } from "./mundo.js";
import { infoLiga } from "./ligas.js";
import { bonusJovem } from "./identidade.js";
import { saltoTransferencia } from "./vida.js";
import { alojamentosDoClube, imovelAtual, mudar, nomeImovel, IMOVEL } from "./casa.js";
import { fecharPassagemNoClube, alvoDeSeguidores, SEMANAS_PRE, SEMANAS_TEMPORADA, ANO_INICIAL, clubeCasa, ligaAtual, noticia, ovr, type Carreira, type Save } from "./jogo.js";
import { valorBrl, curtoEur } from "./moeda.js";

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
  /** empréstimo: parte do salário que o clube de destino paga (1 = integral; 0,5 = divisão) */ fracaoSalario?: number;
  /** empréstimo com cláusula de compra: valor (euros) que o clube de destino pode pagar no fim do empréstimo */ opcaoCompra?: number;
  negociada?: boolean;
  /** o seu clube não aceitou vender */ travada?: boolean;
  /** cláusulas: multa rescisória (€), % da venda futura para o jogador, bônus por gol e por título (R$) */
  multa?: number; pctVenda?: number; bonusGol?: number; bonusTitulo?: number;
  /** quantas vezes ainda dá para pedir algo antes de a diretoria encerrar a conversa, e o que já foi pedido */
  paciencia?: number; pedidos?: ItemNegociacao[];
  /** o clube comprador paga a multa (o seu clube não pode segurar) */
  pagaMulta?: boolean;
  /** renovação para blindar o jogador (oferecida antes do fim do contrato) */
  blindagem?: boolean;
}
export type ItemNegociacao = "salario" | "luvas" | "multa" | "venda" | "gols" | "titulo";
export const NOME_ITEM: Record<ItemNegociacao, [string, string]> = {
  salario: ["Mais salário", "O agente pede um aumento no salário mensal."],
  luvas: ["Mais luvas", "Um valor maior na assinatura."],
  multa: ["Multa mais baixa", "Fica mais fácil sair quando aparecer um clube grande."],
  venda: ["% da venda futura", "Quando o clube te vender, uma parte vai para você."],
  gols: ["Bônus por gol", "Um valor a cada gol na liga."],
  titulo: ["Bônus por título", "Um prêmio por cada taça levantada."],
};
/** As cláusulas do contrato em vigor. */
export interface ClausulasContrato { multa: number; pctVenda: number; bonusGol: number; bonusTitulo: number; desde: number; pedidoAumento?: number; blindadoEm?: number }
export interface Transferencia { temporada: number; semana: number; de: string; para: string; tipo: TipoProposta; taxa: number }
export interface DadosMercado {
  propostas: PropostaSave[];
  transferencias: Transferencia[];
  emprestimo?: { origem: string; ligaOrigem: string; ordemOrigem: string[]; ate: number; fracao?: number; destino?: string; opcaoCompra?: number };
  /** pediu para ser negociado */
  listaTransferencia?: boolean;
  pedidoEmprestimo?: boolean;
  /** para onde pediu para ser negociado */
  destinoSaida?: Destino;
  /** recusou a renovação nesta temporada */
  semRenovacao?: number;
  /** semana absoluta da última troca de agente */
  agenteDesde?: number;
  /** sem clube (agente livre): desde quando, de onde saiu, o último salário e até quando o agente está oferecendo o jogador */
  semClube?: { desde: number; ultimo: string; salario: number; oferecendoAte?: number };
  seq: number;
}
export const estaSemClube = (c: Carreira) => !!c.mercado?.semClube;
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
export interface InfoAgente { nome: string; quem: string; texto?: string; requisito?: { fama: number; ovr: number } }
const NOME_NIVEL = ["Família", "Agente de base", "Agente local", "Agente de clube", "Agente de elite", "Superagente"];
/** Nome, quem é e a frase de apresentação. A família não tem requisito. */
export function infoAgente(t: TipoAgente): InfoAgente {
  if (t === FAMILIA) return { nome: "Família", quem: "Seu pai cuida de tudo" };
  const a = agenteDoBanco(t);
  if (!a) return { nome: "Agente", quem: "Sem nome" };
  return { nome: NOME_NIVEL[a.nivel], quem: a.nome, texto: a.frase, requisito: perfilAgente(t).requisito };
}
/** Descrição do agente conforme o país dele: o que alcança e quanto cobra (referência). */
export function textoAgente(t: TipoAgente, nacionalidade: string): string {
  if (t === FAMILIA) {
    const pais = PAISES.find((x) => x.id === nacionalidade), local = pais?.local ?? "no país";
    const regional = alcanceSoRegional(t, nacionalidade);
    return `Não cobra nada, mas conhece ${regional ? "só os clubes regionais" : "só o futebol"} ${local}${regional ? ", sem os grandes" : ""}. Não conhece ninguém fora. Negocia mal.`;
  }
  const a = agenteDoBanco(t), p = perfilAgente(t);
  if (!a) return "";
  const nomePais = PAISES.find((x) => x.id === a.pais)?.nome ?? a.pais;
  const vizinhos = (VIZINHOS[a.pais] ?? []).map((v) => PAISES.find((x) => x.id === v)?.nome).filter(Boolean).join(", ");
  const alcance = a.nivel >= 5 ? "Fala com clubes do mundo inteiro." : a.nivel <= 2 ? `Abre portas ${alcanceSoRegional(t, nacionalidade) ? "só nos clubes regionais" : `no mercado de ${nomePais}`}.` : `Abre portas no mercado de ${nomePais}${vizinhos ? ` e nos vizinhos (${vizinhos})` : ""}.`;
  return `${a.frase} Pede ${Math.round(p.comissao * 100)}% de comissão, na referência. ${alcance}`;
}
/** Habilidade de negociação: o agente, o pai ex-jogador (quando é ele quem cuida), a namorada agente e os consultores. */
export const habilidadeAgente = (s: Save) => {
  const ef = efeitoConsultores(s.carreira.consultores);
  return habilidadeDoAgente(s.carreira.agente, s.carreira.comissaoAgente) + (s.carreira.agente === FAMILIA && paiExJogador(s.carreira.familia) ? 0.1 : 0) + efeitosNamoro(s.carreira.namoro).agente + 0.15 * ef.negociador + 0.1 * ef.networking + 0.05 * ef.juridico;
};
export function podeContratarAgente(s: Save, t: TipoAgente): { ok: boolean; msg: string } {
  const c = s.carreira, r = perfilAgente(t).requisito, m = mercadoDe(c);
  if (c.agente === t) return { ok: false, msg: "Já é o seu agente." };
  if (c.negAgente) return { ok: false, msg: "Já há uma conversa aberta com um agente." };
  if (t !== FAMILIA && !agenteDoBanco(t)) return { ok: false, msg: "Agente desconhecido." };
  if (r && c.fama < r.fama && ovr(s.jogador) < r.ovr) return { ok: false, msg: `Só aceita jogador com fama ${r.fama}+ ou nível ${r.ovr}+.` };
  if (m.agenteDesde !== undefined && semanaAbs(c) - m.agenteDesde < 10) return { ok: false, msg: `Trocou de agente há pouco. Espere mais ${10 - (semanaAbs(c) - m.agenteDesde)} semanas.` };
  return { ok: true, msg: "" };
}
/** Troca de agente. Com comissão negociada, ela passa a valer; a família não cobra. */
export function trocarAgente(s: Save, t: TipoAgente, comissao?: number): { ok: boolean; msg: string } {
  const ok = podeContratarAgente(s, t);
  if (!ok.ok) return ok;
  const c = s.carreira, antes = c.agente;
  c.agente = t; c.comissaoAgente = t === FAMILIA ? undefined : comissaoDo(t, comissao); c.negAgente = undefined;
  mercadoDe(c).agenteDesde = semanaAbs(c);
  if (antes === FAMILIA) c.moral = clamp(c.moral - 2, 0, 100);
  noticia(s, "clube", "Novo agente", t === FAMILIA ? `${s.jogador.apelido} volta a ser representado pela família.` : `${s.jogador.apelido} agora é representado por ${infoAgente(t).quem}.`);
  return { ok: true, msg: t === FAMILIA ? "A família volta a cuidar da sua carreira." : `${infoAgente(t).quem} é seu novo agente.` };
}
/** Abre a conversa de comissão com um agente do banco. */
export function agenteIniciar(s: Save, t: TipoAgente): { ok: boolean; msg: string } {
  const ok = podeContratarAgente(s, t);
  if (!ok.ok) return ok;
  s.carreira.negAgente = iniciarNegAgente(t, rngAcao(s, "agente", t, semanaAbs(s.carreira)));
  return { ok: true, msg: `${infoAgente(t).quem} pediu para conversar sobre a comissão.` };
}
/** Resposta do jogador na conversa com o agente. Ao fechar, o agente passa a representar o jogador. */
export function agenteResponder(s: Save, resp: RespostaAgente): ResultadoAgente {
  const c = s.carreira, n = c.negAgente;
  if (!n) return { status: "erro", msg: "Não há conversa aberta com um agente." };
  const r = responderAgente(n, resp);
  if (r.status === "fechou") {
    const com = r.comissao ?? n.pedido;
    if (com > COMISSAO_MAX + 1e-9) return { status: "continua", msg: "Esse agente não aceita comissão acima de 12%. Peça menos." };
    // a conversa em aberto impede a troca: fecha antes, e reabre se a troca for recusada (ex.: prazo)
    c.negAgente = undefined;
    const t = trocarAgente(s, n.id, com);
    if (!t.ok) { c.negAgente = n; return { status: "continua", msg: t.msg }; }
    return { ...r, msg: `${r.msg} ${infoAgente(n.id).quem} é seu novo agente.` };
  }
  if (r.status === "desistiu" || r.status === "recusou") c.negAgente = undefined;
  return r;
}

/** Consultores: abre a conversa com um especialista (contratação ou renovação). */
export function consultorIniciar(s: Save, esp: Especialidade): { ok: boolean; msg: string } {
  const c = s.carreira;
  c.consultores ??= novosConsultores();
  return iniciarNegociacao(c.consultores, esp, c.fama, c.salario, rngAcao(s, "consultor", esp, semanaAbs(c)));
}
/** Consultores: resposta do jogador na conversa aberta. Ao fechar, o consultor entra na equipe. */
export function consultorResponder(s: Save, resp: RespostaConsultor): ResultadoConsultor {
  const c = s.carreira;
  c.consultores ??= novosConsultores();
  const r = responder(c.consultores, resp, c.salario, c.agente, semanaAbs(c));
  if (r.status === "fechou") noticia(s, "clube", "Consultor contratado", r.msg);
  if (r.status === "desistiu" || r.status === "recusou") noticia(s, "clube", "Conversa encerrada", r.msg);
  return r;
}
// ------------------------------------------------------------------ papel no clube
export function papelNoClube(clube: Clube, s: Save): Papel {
  const j = s.jogador, meu = pontuacaoTitular(ovr(j), 6.5, 50, 0) + bonusJovem(clube.id, j.idade);
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
const ATACANTES = ["ATA", "PON", "MEI"];
/** Cláusulas padrão de uma proposta: multa de 2,5 vezes o valor de mercado, bônus por gol para quem ataca, bônus por título. */
export function comClausulas(pacote: PacoteDados, s: Save, p: PropostaSave): PropostaSave {
  if (p.tipo === "emprestimo") return p;
  const j = s.jogador, w = mundo(pacote), l = w.liga[p.ligaId];
  const vm = valorMercado(ovr(j), j.idade, Math.max(1, p.anos), l?.fLiga ?? 1);
  p.multa ??= Math.round(Math.max(vm * 2.5, p.taxa * 2.2, 1e6) / 1e5) * 1e5;
  p.pctVenda ??= 0;
  p.bonusGol ??= Math.round((p.salario * (ATACANTES.includes(j.posicao) ? 0.04 : 0.02)) / 100) * 100;
  p.bonusTitulo ??= Math.round((p.salario * 1.5) / 1000) * 1000;
  p.paciencia ??= 2 + (p.interesse >= 0.75 ? 1 : 0) + (s.carreira.fama >= 60 ? 1 : 0);
  p.pedidos ??= [];
  return p;
}
const nomeClube = (pacote: PacoteDados, id: string) => infoClube(pacote, id).nome;

/** Chamado no fim de cada semana: novas propostas na janela, renovação, empréstimo; propostas vencidas caem. */
export function semanaDoMercado(pacote: PacoteDados, s: Save, rng: RNG, eventos: string[]) {
  const c = s.carreira, j = s.jogador, m = mercadoDe(c), agora = semanaAbs(c), w = mundo(pacote);
  const caiu = m.propostas.filter((p) => p.expira <= agora);
  m.propostas = m.propostas.filter((p) => p.expira > agora);
  if (caiu.length) eventos.push(`${caiu.length === 1 ? "Uma proposta expirou" : `${caiu.length} propostas expiraram`}${m.semClube ? "" : " com o fim da janela"}.`);
  // agente livre: assina a qualquer momento (fora da janela também)
  if (m.semClube) { semanaSemClube(pacote, s, rng, eventos); return; }
  blindagem(pacote, s, rng, eventos);
  const jan = janelaAberta(c);
  if (!jan || j.idade < 18) return;  // na base, só o empréstimo (pedido ou sugerido) entra; o resto espera o contrato profissional
  const clube = w.clube[c.clubeId], l = ligaAtual(pacote, s);
  // 1. renovação: contrato acabando
  if (!c.formacao && c.anosContrato <= 1 && !m.emprestimo && m.semRenovacao !== c.temporada && !m.propostas.some((p) => p.tipo === "renovacao")) {
    const quer = ovr(j) >= clube.forca - 9 || j.idade <= 22;
    if (quer) {
      const mercado = salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama });
      const sal = Math.round(Math.min(tetoSalarial(clube, l), j.idade <= 30 ? Math.max(c.salario * 1.02, mercado) : Math.max(c.salario * 0.7, mercado)));
      const p = comClausulas(pacote, s, nova(m, { tipo: "renovacao", clubeId: c.clubeId, ligaId: l.id, salario: sal, anos: j.idade <= 24 ? 4 : j.idade <= 30 ? 3 : 2, taxa: 0, luvas: Math.round(sal * 1.5), papel: papelNoClube(clube, s), interesse: 0.8, expira: fimDaJanela(c) + SEMANAS_TEMPORADA / 2 }));
      m.propostas.push(p);
      eventos.push(`O ${clube.nome} quer renovar seu contrato: ${p.anos} anos.`);
      noticia(s, "clube", "Proposta de renovação", `O ${clube.nome} oferece ${p.anos} anos de contrato a ${j.apelido}.`);
    } else if (c.semana === jan.ini) {
      noticia(s, "clube", "Sem renovação à vista", `O ${clube.nome} não deve renovar com ${j.apelido}. O contrato termina no fim da temporada.`);
    }
  }
  // 2. empréstimo: garoto com poucos minutos
  const minutos = c.stats.jogos + (c.semana < 6 ? c.historico.at(-1)?.jogos ?? 0 : 0);
  if (!c.formacao && !m.emprestimo && j.idade <= 22 && j.pot - ovr(j) >= 4 && papelNoClube(clube, s) === "reserva" && minutos < (c.semana < 6 ? 12 : 6) && !m.propostas.some((p) => p.tipo === "emprestimo") && rng.chance(0.45)) {
    const destinos = w.ligas.filter((x) => x.nivel >= l.nivel && infoLiga(x.id).regiao === infoLiga(l.id).regiao || x.id === "BRA2").flatMap((x) => x.clubes)
      .filter((x) => x.id !== c.clubeId && papelNoClube(x, s) === "titular" && x.forca <= clube.forca);
    if (destinos.length) {
      const d = rng.pick(destinos.sort((a, b) => b.forca - a.forca).slice(0, 5));
      m.propostas.push(nova(m, { tipo: "emprestimo", clubeId: d.id, ligaId: d.ligaId, salario: c.salario, anos: 0, taxa: 0, luvas: 0, papel: "titular", interesse: 0.7, expira: fimDaJanela(c) }));
      eventos.push(`O ${clube.nome} sugere te emprestar ao ${d.nome} para ganhar minutos.`);
    }
  }
  // 2b. pediu para ser emprestado: clubes da liga e de baixo que precisam de um jogador do seu nível mandam proposta
  if (m.pedidoEmprestimo && !m.emprestimo && papelNoClube(clube, s) !== "titular" && !m.propostas.some((p) => p.tipo === "emprestimo") && rng.chance(0.5)) {
    const nivel = ovr(j), destinos = [...(l.clubes ?? []), ...(infoLiga(l.id).abaixo ? w.liga[infoLiga(l.id).abaixo!]?.clubes ?? [] : [])]
      .filter((x) => x.id !== c.clubeId && x.forca >= nivel - 12 && x.forca <= nivel + 6 && papelNoClube(x, s) === "titular");
    if (destinos.length) {
      const d = rng.pick(destinos.sort((a, b) => Math.abs(a.forca - nivel) - Math.abs(b.forca - nivel)).slice(0, 4));
      m.propostas.push(nova(m, { tipo: "emprestimo", clubeId: d.id, ligaId: d.ligaId, salario: c.salario, anos: 0, taxa: 0, luvas: 0, papel: "titular", interesse: 0.7, expira: fimDaJanela(c) }));
      eventos.push(`O ${d.nome} quer você emprestado por uma temporada.`);
    }
  }
  // 2c. salário alto e pouco usado: o clube empresta e o destino paga metade do salário
  const papelAtual = papelNoClube(clube, s);
  if (!m.emprestimo && (papelAtual === "reserva" || papelAtual === "rotacao") && !m.propostas.some((p) => p.tipo === "emprestimo") && rng.chance(0.3)) {
    const pago = salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama });
    if (c.salario >= pago * 1.4) {
      const nivel = ovr(j), destinos = [...l.clubes, ...(infoLiga(l.id).abaixo ? w.liga[infoLiga(l.id).abaixo!]?.clubes ?? [] : [])]
        .filter((x) => x.id !== c.clubeId && x.forca >= nivel - 10 && papelNoClube(x, s) !== "reserva");
      if (destinos.length) {
        const d = rng.pick(destinos.sort((a, b) => Math.abs(a.forca - nivel) - Math.abs(b.forca - nivel)).slice(0, 4));
        m.propostas.push(nova(m, { tipo: "emprestimo", clubeId: d.id, ligaId: d.ligaId, salario: c.salario, anos: 0, taxa: 0, luvas: 0, papel: papelNoClube(d, s), interesse: 0.6, expira: fimDaJanela(c), fracaoSalario: 0.5 }));
        eventos.push(`O ${d.nome} quer te emprestar e paga metade do seu salário.`);
      }
    }
  }
  // 2d. o clube não consegue te vender: oferece empréstimo com cláusula de compra para outro clube
  if (!m.emprestimo && papelAtual === "reserva" && j.idade >= 19 && !m.propostas.some((p) => p.tipo === "emprestimo") && rng.chance(0.25)) {
    const nivel = ovr(j), destinos = [...l.clubes, ...(infoLiga(l.id).abaixo ? w.liga[infoLiga(l.id).abaixo!]?.clubes ?? [] : [])]
      .filter((x) => x.id !== c.clubeId && x.forca >= nivel - 8 && papelNoClube(x, s) !== "reserva");
    if (destinos.length) {
      const d = rng.pick(destinos.sort((a, b) => Math.abs(a.forca - nivel) - Math.abs(b.forca - nivel)).slice(0, 4));
      const opcao = Math.round(valorMercado(nivel, j.idade, Math.max(1, c.anosContrato), l.fLiga) * 0.9);
      m.propostas.push(nova(m, { tipo: "emprestimo", clubeId: d.id, ligaId: d.ligaId, salario: c.salario, anos: 0, taxa: 0, luvas: 0, papel: papelNoClube(d, s), interesse: 0.6, expira: fimDaJanela(c), opcaoCompra: opcao }));
      eventos.push(`O ${d.nome} quer você por empréstimo, com opção de compra de ${curtoEur(opcao)}.`);
    }
  }
  // 3. propostas de outros clubes (quem acabou de chegar espera a próxima temporada)
  if (c.formacao) return;
  if (m.emprestimo || m.propostas.filter((p) => p.tipo !== "renovacao").length >= 4) return;
  if (m.transferencias.some((t) => t.temporada === c.temporada && t.tipo !== "emprestimo")) return;
  const perfil = perfilDe(pacote, s);
  const chance = 0.45 + (m.listaTransferencia ? 0.25 : 0);
  // pedido de saída com destino: o agente procura ativamente nesse mercado
  if (m.listaTransferencia && m.destinoSaida && m.destinoSaida !== "qualquer" && rng.chance(0.6)) {
    const ligas = ligasDoDestino(m.destinoSaida, j.nacionalidade);
    const alvo = ligas ? w.ligas.filter((x) => ligas.includes(x.id)) : w.ligas;
    const minSal = m.destinoSaida === "salario" ? c.salario * 1.25 : 0;
    const achou = gerarPropostas(rng, perfil, alvo, c.fama, true).filter((p) => p.clube.id !== c.clubeId && !m.propostas.some((x) => x.clubeId === p.clube.id) && p.salario >= minSal);
    if (!achou.length && m.destinoSaida === "salario") {
      const ricos = gerarPropostas(rng, perfil, w.ligas.filter((x) => x.fSalario >= 1.3), c.fama, true).filter((p) => p.clube.id !== c.clubeId && p.salario >= minSal);
      achou.push(...ricos);
    }
    if (achou.length) {
      const p = paraSave(pacote, s, achou[0]);
      m.propostas.push(p);
      eventos.push(`Pedido atendido: o ${achou[0].clube.nome} (${infoLiga(achou[0].liga.id).curto}) quer você.`);
      noticia(s, "clube", "Proposta na mesa", `Depois do pedido de ${j.apelido}, o ${achou[0].clube.nome} fez uma proposta.`);
    }
  }
  if (!rng.chance(chance)) return;
  const golfoNaMesa = m.propostas.some((x) => x.ligaId === "KSA1");
  const cand = gerarPropostas(rng, perfil, w.ligas, c.fama).filter((p) => !m.propostas.some((x) => x.clubeId === p.clube.id) && golfoQuer(p, s))
    .filter((p, i, arr) => p.liga.id !== "KSA1" || (!golfoNaMesa && arr.findIndex((x) => x.liga.id === "KSA1") === i)); // um clube do Golfo por vez
  for (const p of cand.slice(0, rng.chance(0.25) ? 2 : 1)) {
    const prop = paraSave(pacote, s, p);
    // clube rico que quer muito: paga a multa e acabou a conversa
    const mu = c.contrato?.multa;
    if (mu && prop.tipo === "transferencia" && prop.taxa >= mu * 0.6 && p.orcamento >= mu * 0.9 && rng.chance(0.35)) { prop.taxa = mu; prop.pagaMulta = true; }
    m.propostas.push(prop);
    eventos.push(`Proposta nova: o ${p.clube.nome} (${infoLiga(p.liga.id).curto}) quer você.`);
    noticia(s, "clube", "Proposta na mesa", `O ${p.clube.nome} fez uma proposta por ${j.apelido}${prop.taxa ? `: ${curtoEur(prop.taxa)} ao ${clube.nome}` : ""}.`);
  }
}

/** O Golfo compra jogador pronto: a partir dos 24 anos, ou estrela. */
const golfoQuer = (p: Proposta, s: Save) => p.liga.id !== "KSA1" || s.jogador.idade >= 24 || ovr(s.jogador) >= 76;

/** Um amigo do clube indicou você: o clube dele faz uma proposta (só com janela aberta). */
export function propostaPorIndicacao(pacote: PacoteDados, s: Save, clubeId: string): PropostaSave | undefined {
  const c = s.carreira, w = mundo(pacote), clube = w.clube[clubeId];
  if (!clube || clubeId === c.clubeId || clubeId === "ES-ATH" || !janelaAberta(c) || c.formacao || s.jogador.idade < 18) return undefined;
  const liga = w.liga[clube.ligaId], perfil = perfilDe(pacote, s), comp = componentesInteresse(perfil, clube, liga);
  const salario = salarioMensal({ ovr: ovr(s.jogador), idade: s.jogador.idade, liga, clube, agente: c.agente, fama: c.fama });
  const p = paraSave(pacote, s, { clube, liga, interesse: 0.7, taxa: perfil.clubeAtual ? comp.vm : 0, orcamento: comp.orcamento, salario, anos: 3, titularProvavel: comp.titular });
  mercadoDe(c).propostas.push(p);
  return p;
}
function paraSave(pacote: PacoteDados, s: Save, p: Proposta): PropostaSave {
  const m = mercadoDe(s.carreira), livre = !p.taxa;
  // para tirar o jogador de onde está, o clube tenta cobrir o salário atual, mas só até onde a folha aguenta
  // sem clube, a referência é o último salário (e quem está parado há tempo aceita menos)
  const sc = m.semClube, base = sc ? sc.salario * Math.max(0.6, 0.95 - (semanaAbs(s.carreira) - sc.desde) * 0.02) : s.carreira.salario;
  const salario = Math.round(Math.min(tetoSalarial(p.clube, p.liga), Math.max(p.salario, Math.min(p.salario * 1.3, base * (s.jogador.idade <= 30 ? 1.05 : 0.85)))));
  const luvas = Math.round(livre ? salario * (sc ? 1.5 : 3) : p.taxa * CAMBIO * 0.03);
  return comClausulas(pacote, s, nova(m, { tipo: livre ? "livre" : "transferencia", clubeId: p.clube.id, ligaId: p.liga.id, salario, anos: p.anos, taxa: Math.round(p.taxa), luvas, papel: papelNoClube(p.clube, s), interesse: p.interesse, expira: sc ? semanaAbs(s.carreira) + 3 : fimDaJanela(s.carreira) }));
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
  const rng = rngAcao(s, "negociar", id), chance = clamp(0.35 + habilidadeAgente(s) + (p.interesse - 0.6), 0.15, 0.85);
  const nome = p.tipo === "renovacao" ? `o ${nomeClube(pacote, p.clubeId)}` : `o ${nomeClube(pacote, p.clubeId)}`;
  if (rng.chance(chance)) {
    const f = 1.06 + habilidadeAgente(s) * 0.3 + efeitosNamoro(s.carreira.namoro).luvas * 0.2;
    p.salario = Math.round(Math.min(p.salario * f, Math.max(p.salario, tetoSalarial(mundo(pacote).clube[p.clubeId], mundo(pacote).liga[p.ligaId]) * 1.05))); p.luvas = Math.round(p.luvas * (f + 0.1));
    return { ok: true, msg: `Deu certo: ${nome} subiu o salário para ${valorBrl(p.salario)}.` };
  }
  if (p.tipo !== "renovacao" && rng.chance(0.4)) {
    m.propostas = m.propostas.filter((x) => x.id !== id);
    return { ok: false, msg: `${nome[0].toUpperCase() + nome.slice(1)} não gostou da pedida e desistiu.` };
  }
  return { ok: false, msg: `${nome[0].toUpperCase() + nome.slice(1)} manteve a proposta como estava.` };
}

/** Pede um item específico do contrato. Cada pedido gasta a paciência da diretoria; quando acaba, a conversa termina
 *  (e um clube de fora pode desistir). */
export function negociarItem(pacote: PacoteDados, s: Save, id: string, item: ItemNegociacao): R {
  const m = mercadoDe(s.carreira), p = m.propostas.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Proposta não encontrada." };
  if (p.tipo === "emprestimo") return { ok: false, msg: "Empréstimo não tem o que negociar." };
  comClausulas(pacote, s, p);
  if ((p.paciencia ?? 0) <= 0) return { ok: false, msg: "A diretoria encerrou a negociação: é pegar ou largar." };
  if (p.pedidos!.includes(item)) return { ok: false, msg: "Esse pedido já foi feito." };
  p.pedidos!.push(item); p.negociada = true;
  const hab = habilidadeAgente(s), dif: Record<ItemNegociacao, number> = { salario: 0, luvas: 0, multa: 0.08, venda: 0.12, gols: -0.06, titulo: -0.1 };
  const chance = clamp(0.35 + hab + (p.interesse - 0.6) + s.carreira.fama / 500 - dif[item], 0.12, 0.88);
  const nome = `o ${nomeClube(pacote, p.clubeId)}`, Nome = nome[0].toUpperCase() + nome.slice(1);
  if (rngAcao(s, "item", id, item).chance(chance)) {
    const teto = tetoSalarial(mundo(pacote).clube[p.clubeId], mundo(pacote).liga[p.ligaId]) * 1.05;
    switch (item) {
      case "salario": { const estrelaSal = s.carreira.agente === FAMILIA ? 1 : habilidadesDoAgente(s.carreira.agente).salario; p.salario = Math.round(Math.min(p.salario * (1.07 + estrelaSal * 0.02), Math.max(p.salario, teto))); }
        return { ok: true, msg: `${Nome} subiu o salário para ${valorBrl(p.salario)}.` };
      case "luvas": p.luvas = Math.round(Math.max(p.luvas * 1.4, p.salario)); return { ok: true, msg: `Luvas de ${valorBrl(p.luvas)}.` };
      case "multa": p.multa = Math.round((p.multa! * 0.55) / 1e5) * 1e5; return { ok: true, msg: `Multa rescisória baixou para ${curtoEur(p.multa)}.` };
      case "venda": p.pctVenda = Math.min(20, 10 + Math.round(hab * 20)); return { ok: true, msg: `${p.pctVenda}% de uma venda futura ficam com você.` };
      case "gols": p.bonusGol = Math.round(Math.max(p.bonusGol! * 2, p.salario * 0.04) / 100) * 100; return { ok: true, msg: `${valorBrl(p.bonusGol)} por gol na liga.` };
      case "titulo": p.bonusTitulo = Math.round((p.bonusTitulo! * 2) / 1000) * 1000; return { ok: true, msg: `${valorBrl(p.bonusTitulo)} por título.` };
    }
  }
  p.paciencia = (p.paciencia ?? 1) - 1;
  if (p.paciencia <= 0 && p.tipo !== "renovacao" && rngAcao(s, "desiste", id).chance(0.5)) {
    m.propostas = m.propostas.filter((x) => x.id !== id);
    return { ok: false, msg: `${Nome} cansou dos pedidos e desistiu.` };
  }
  return { ok: false, msg: `${Nome} não aceitou${p.paciencia <= 0 ? ". A paciência acabou: agora é pegar ou largar" : ""}.` };
}
/** Pedir aumento à diretoria (uma vez por temporada): quem está jogando bem ganha uma renovação melhor. */
export function pedirAumento(pacote: PacoteDados, s: Save, forma: number): R {
  const c = s.carreira, j = s.jogador, m = mercadoDe(c), w = mundo(pacote), clube = w.clube[c.clubeId];
  if (!clube || c.formacao || m.semClube || m.emprestimo || j.idade < 18) return { ok: false, msg: "Agora não dá para pedir aumento." };
  const k = (c.contrato ??= { multa: 0, pctVenda: 0, bonusGol: 0, bonusTitulo: 0, desde: c.temporada });
  if (k.pedidoAumento === c.temporada) return { ok: false, msg: "Você já pediu nesta temporada." };
  if (m.propostas.some((p) => p.tipo === "renovacao")) return { ok: false, msg: "Já tem uma renovação na mesa." };
  k.pedidoAumento = c.temporada;
  const l = ligaAtual(pacote, s), papel = papelNoClube(clube, s);
  const merece = papel === "titular" && forma >= 6.8 && (ovr(j) >= clube.forca - 2 || c.fama >= 55);
  if (!merece) {
    c.moral = clamp(c.moral - 2, 0, 100); c.relTecnico = clamp(c.relTecnico - 1, 0, 100);
    noticia(s, "clube", "Diretoria nega aumento", `${j.apelido} pediu aumento e ouviu um não. "Primeiro mostra em campo", disse um dirigente.`);
    return { ok: false, msg: "A diretoria disse não: primeiro mostrar em campo." };
  }
  const mercado = salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama });
  const sal = Math.round(Math.min(tetoSalarial(clube, l), Math.max(c.salario * 1.2, mercado)));
  const p = comClausulas(pacote, s, nova(m, { tipo: "renovacao", clubeId: c.clubeId, ligaId: l.id, salario: sal, anos: Math.max(c.anosContrato, j.idade <= 28 ? 4 : 2), taxa: 0, luvas: Math.round(sal), papel, interesse: 0.85, expira: semanaAbs(c) + 4, blindagem: true }));
  m.propostas.push(p);
  noticia(s, "clube", "Aumento a caminho", `O ${clube.nome} topou conversar: oferece novo contrato a ${j.apelido}.`);
  return { ok: true, msg: `A diretoria topou: proposta de ${valorBrl(sal)}/mês por ${p.anos} anos. Está na mesa.` };
}
/** Clube que quer segurar o craque: renovação antecipada, com salário maior e multa alta. */
function blindagem(pacote: PacoteDados, s: Save, rng: RNG, eventos: string[]) {
  const c = s.carreira, j = s.jogador, m = mercadoDe(c), w = mundo(pacote), clube = w.clube[c.clubeId];
  if (!clube || c.formacao || m.emprestimo || j.idade < 18 || c.anosContrato < 2 || c.fama < 45) return;
  if (c.contrato?.blindadoEm === c.temporada || m.propostas.some((p) => p.tipo === "renovacao")) return;
  const forma = c.formaUlt.length ? c.formaUlt.reduce((a, b) => a + b, 0) / c.formaUlt.length : 6.5;
  if (papelNoClube(clube, s) !== "titular" || forma < 7.1 || !rng.chance(m.propostas.length ? 0.2 : 0.04)) return;
  (c.contrato ??= { multa: 0, pctVenda: 0, bonusGol: 0, bonusTitulo: 0, desde: c.temporada }).blindadoEm = c.temporada;
  const l = ligaAtual(pacote, s), sal = Math.round(Math.min(tetoSalarial(clube, l), c.salario * 1.3));
  const p = comClausulas(pacote, s, nova(m, { tipo: "renovacao", clubeId: c.clubeId, ligaId: l.id, salario: sal, anos: c.anosContrato + 1, taxa: 0, luvas: sal * 2, papel: "titular", interesse: 0.9, expira: semanaAbs(c) + 4, blindagem: true }));
  p.multa = Math.round((p.multa! * 1.8) / 1e5) * 1e5;
  m.propostas.push(p);
  eventos.push(`O ${clube.nome} quer te blindar: renovação antecipada com multa alta.`);
  noticia(s, "clube", `${clube.nome} quer blindar ${j.apelido}`, `Com o assédio de outros clubes, a diretoria oferece renovação antecipada: salário maior e multa de ${curtoEur(p.multa)}.`);
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
export type Destino = "qualquer" | "casa" | "europa" | "golfo" | "salario";
export const NOME_DESTINO: Record<Destino, string> = { qualquer: "Qualquer clube", casa: "Voltar para casa", europa: "Europa", golfo: "Golfo", salario: "Ganhar mais" };
export const ONDE_DESTINO: Record<Destino, string> = { qualquer: "em qualquer lugar", casa: "no seu país", europa: "na Europa", golfo: "no Golfo", salario: "que paguem mais" };
const PAIS_LIGAS: Record<string, string[]> = { BRA: ["BRA1", "BRA2"], ARG: ["ARG1"], URU: ["ARG1", "BRA1"], ENG: ["ENG1", "ENG2", "ENG3", "ENG4"], ESP: ["ESP1", "ESP2"], ITA: ["ITA1"], GER: ["GER1"], FRA: ["FRA1"], POR: ["POR1"], NED: ["NED1"], KSA: ["KSA1"], JPN: ["JPN1"], TUR: ["TUR1"], MAR: ["MAR1"] };
/** Ligas que entram no pedido de saída. */
export function ligasDoDestino(d: Destino, nacionalidade: string): string[] | undefined {
  if (d === "qualquer" || d === "salario") return undefined;
  if (d === "golfo") return ["KSA1"];
  if (d === "europa") return ["ENG1", "ENG2", "ENG3", "ENG4", "ESP1", "ESP2", "ITA1", "GER1", "FRA1", "POR1", "NED1"];
  return PAIS_LIGAS[nacionalidade] ?? ["BRA1", "ARG1"];
}
/** Pedir para ser negociado. Com destino, a notícia vaza: pior com técnico, torcida e diretoria. */
export function pedirParaSair(s: Save, sim: boolean, destino: Destino = "qualquer"): R {
  const m = mercadoDe(s.carreira), c = s.carreira, j = s.jogador;
  if (!sim) { if (!m.listaTransferencia) return { ok: false, msg: "" }; m.listaTransferencia = false; m.destinoSaida = undefined; return { ok: true, msg: "Você tirou o pedido de saída." }; }
  const ja = m.listaTransferencia;
  m.listaTransferencia = true; m.destinoSaida = destino;
  const especifico = destino !== "qualquer";
  c.relTecnico = clamp(c.relTecnico - (ja ? 2 : 8) - (especifico ? 4 : 0), 0, 100);
  c.torcida = clamp((c.torcida ?? 50) - (especifico ? 15 : 8), 0, 100);
  c.moral = clamp(c.moral - (especifico ? 3 : 1), 0, 100);
  c.pressao = clamp(c.pressao + (especifico ? 10 : 5), 0, 100);
  const manchete: Record<Destino, [string, string]> = {
    qualquer: ["Quer sair", `${j.apelido} pediu à diretoria para ser negociado.`],
    casa: ["Saudade de casa", `Vazou: ${j.apelido} pediu para ser negociado com um clube do país dele. A torcida não gostou.`],
    europa: ["Sonho europeu", `Vazou: ${j.apelido} quer jogar na Europa e pediu para o clube ouvir propostas de lá. A torcida chamou de mercenário.`],
    golfo: ["De olho no Golfo", `Vazou: ${j.apelido} pediu para ser negociado com um clube do Golfo. Nas redes, a torcida não perdoou.`],
    salario: ["Quer ganhar mais", `Vazou: ${j.apelido} pediu para ser negociado com quem pagar mais. A diretoria ficou irritada.`],
  };
  noticia(s, "polemica", manchete[destino][0], manchete[destino][1]);
  return { ok: true, msg: especifico ? `Pedido feito: o agente vai atrás de clubes ${ONDE_DESTINO[destino]}. Vazou na imprensa: técnico e torcida não gostaram.` : "Pedido feito: o clube vai ouvir propostas. O técnico não gostou." };
}

/** Pedir para ser emprestado (ou tirar o pedido). Não escolhe o destino: os clubes que se interessarem mandam propostas na janela, e você aceita ou recusa. */
export function pedirEmprestimo(s: Save, sim: boolean): R {
  const c = s.carreira, m = mercadoDe(c);
  if (!sim) { if (!m.pedidoEmprestimo) return { ok: false, msg: "" }; m.pedidoEmprestimo = false; return { ok: true, msg: "Você tirou o pedido de empréstimo." }; }
  if (s.jogador.idade < 18) return { ok: false, msg: "Antes dos 18 anos ainda não dá para pedir empréstimo." };
  if (m.emprestimo) return { ok: false, msg: "Você já está emprestado." };
  m.pedidoEmprestimo = true;
  return { ok: true, msg: "Você pediu para ser emprestado. Os clubes que se interessarem mandam propostas na próxima janela." };
}
export function aceitar(pacote: PacoteDados, s: Save, id: string, forcar = false): R {
  const c = s.carreira, m = mercadoDe(c), p = m.propostas.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Proposta não encontrada." };
  const w = mundo(pacote), destino = w.clube[p.clubeId];
  const novoContrato = () => { comClausulas(pacote, s, p); c.contrato = { multa: p.multa ?? 0, pctVenda: p.pctVenda ?? 0, bonusGol: p.bonusGol ?? 0, bonusTitulo: p.bonusTitulo ?? 0, desde: c.temporada, pedidoAumento: c.contrato?.pedidoAumento, blindadoEm: c.contrato?.blindadoEm }; };
  if (p.tipo === "renovacao") {
    novoContrato();
    c.salario = p.salario; c.anosContrato = p.anos; c.relTecnico = clamp(c.relTecnico + 3, 0, 100);
    receberLuvas(s, p.luvas);
    m.propostas = m.propostas.filter((x) => x.id !== id);
    noticia(s, "clube", "Renovou", `${s.jogador.apelido} renova com o ${destino.nome} até ${ANO_INICIAL + c.temporada + p.anos}: ${valorBrl(p.salario)} por mês.`);
    return { ok: true, msg: `Contrato renovado por ${p.anos} anos.` };
  }
  if (p.tipo === "emprestimo") {
    const fracao = p.fracaoSalario ?? 1;
    m.emprestimo = { origem: c.clubeId, ligaOrigem: infoLiga(c.ligaId).id, ordemOrigem: c.ordem, ate: c.temporada, fracao, destino: p.clubeId, opcaoCompra: p.opcaoCompra };
    mudarDeClube(pacote, s, destino, "emprestimo", 0);
    if (fracao < 1) noticia(s, "clube", "Salário dividido", `O ${destino.nome} paga ${Math.round(fracao * 100)}% do salário de ${s.jogador.apelido}; o resto segue com o clube de origem.`);
    m.propostas = m.propostas.filter((x) => x.tipo === "renovacao");
    m.pedidoEmprestimo = false;
    return { ok: true, msg: `Emprestado ao ${destino.nome} até o fim da temporada.` };
  }
  if (p.tipo === "transferencia") {
    const origem = w.clube[c.clubeId];
    if (p.travada && !forcar && !p.pagaMulta) return { ok: false, msg: `O ${origem.nome} não liberou. Você pode forçar a saída.` };
    if (p.pagaMulta || (c.contrato?.multa && p.taxa >= c.contrato.multa)) {
      noticia(s, "clube", "Multa paga", `O ${destino.nome} depositou a multa rescisória de ${curtoEur(p.taxa)}. O ${origem.nome} não pôde fazer nada.`);
    } else if (!p.travada) {
      const vm = valorMercado(ovr(s.jogador), s.jogador.idade, c.anosContrato, w.liga[infoLiga(c.ligaId).id].fLiga);
      const importancia = (papelNoClube(origem, s) === "titular" ? 1.35 : 1.0) * (m.listaTransferencia ? 0.8 : 1) * (c.anosContrato >= 3 ? 1.1 : 1) * ((c.contrato?.multa ?? 0) > vm * 3 ? 1.15 : 1);
      const prop = { taxa: p.taxa, orcamento: p.taxa * 1.4 } as Proposta;
      if (!clubeAceitaVenda(rngAcao(s, "venda", id), prop, vm, importancia)) {
        p.travada = true;
        return { ok: false, msg: `O ${origem.nome} recusou vender por ${curtoEur(p.taxa)}. Você pode forçar a saída ou esperar outra proposta.` };
      }
      p.taxa = Math.round(prop.taxa);
    } else {
      // forçar a saída: desgaste com o clube e a torcida
      c.relTecnico = clamp(c.relTecnico - 15, 0, 100); c.moral = clamp(c.moral - 4, 0, 100); c.fama = clamp(c.fama + 1, 0, 100);
      noticia(s, "polemica", "Forçou a saída", `${s.jogador.apelido} bate o pé e força a ida para o ${destino.nome}. A torcida do ${origem.nome} não perdoou.`);
      if (!rngAcao(s, "forcar", id).chance(0.7)) { m.propostas = m.propostas.filter((x) => x.id !== id); return { ok: false, msg: `O ${origem.nome} segurou você. O clima ficou pesado.` }; }
    }
  }
  // % da venda: a parte do jogador sai na hora
  if (p.tipo === "transferencia" && p.taxa && c.contrato?.pctVenda) {
    const parte = Math.round(p.taxa * CAMBIO * c.contrato.pctVenda / 100);
    s.casa.saldo += parte;
    noticia(s, "dinheiro", "Parte da venda", `Pela cláusula do contrato, ${c.contrato.pctVenda}% da venda ficam com ${s.jogador.apelido}: ${valorBrl(parte)}.`);
  }
  novoContrato();
  c.salario = p.salario; c.anosContrato = p.anos; c.formacao = false;
  mudarDeClube(pacote, s, destino, p.tipo, p.taxa);
  receberLuvas(s, p.luvas);
  m.propostas = [];
  m.listaTransferencia = false; m.destinoSaida = undefined;
  return { ok: true, msg: `Você é jogador do ${destino.nome}!` };
}

function receberLuvas(s: Save, luvas: number) {
  if (!luvas) return;
  const liquido = Math.round(luvas * (1 - comissaoDo(s.carreira.agente, s.carreira.comissaoAgente)));
  s.casa.saldo += liquido;
  noticia(s, "dinheiro", "Luvas", `${valorBrl(liquido)} de luvas na conta${comissaoDo(s.carreira.agente, s.carreira.comissaoAgente) ? " (já descontada a comissão do agente)" : ""}.`);
}

/** Troca de clube no meio da carreira: liga, tabela, técnico novo, moradia. */
export function mudarDeClube(pacote: PacoteDados, s: Save, destino: Clube, tipo: TipoProposta, taxa: number, ordemFixa?: string[]) {
  const c = s.carreira, m = mercadoDe(c), w = mundo(pacote), de = c.clubeId, ligaDe = infoLiga(c.ligaId).id;
  const seg0 = c.seguidores;
  fecharPassagemNoClube(pacote, s); // meio de temporada: a passagem pelo clube antigo fica no histórico
  m.semClube = undefined; // assinou: acabou a fase sem clube
  c.seguidores = saltoTransferencia(c.seguidores, alvoDeSeguidores(pacote, s, destino.id));
  c.clubeId = destino.id; c.ligaId = destino.ligaId;
  if (destino.ligaId !== ligaDe) {
    const l = w.liga[destino.ligaId], rng = new RNG(`${s.semente}|tabela|${c.temporada}|${destino.ligaId}`);
    c.ordem = ordemFixa ?? embaralhar(rng, l.clubes.map((x) => x.id));
    c.tabela = tabelaAteAgora(rng, l, c);
  }
  c.relTecnico = clamp(45 + c.fama / 5, 0, 100); c.torcida = 50;
  if (!c.formacao || c.fase === "varzea" || c.fase === "colegial" || c.fase === "universidade") c.escolhaNumero = "chegada"; // clube novo: escolhe a camisa
  c.suspensao = 0;
  if (tipo !== "emprestimo") c.chegadaClube = c.temporada;
  m.transferencias.push({ temporada: c.temporada, semana: c.semana, de, para: destino.id, tipo, taxa });
  // moradia: quem mora no alojamento vai para o do novo clube; quem tem casa fica com ela
  const cc = clubeCasa(pacote, destino.id);
  s.casa.clube = cc;
  if (imovelAtual(s.casa).categoria === "alojamento") mudar(s.casa, alojamentosDoClube(cc)[0], "alugar", c.salario);
  const ano = ANO_INICIAL + c.temporada, ligaNome = infoLiga(destino.ligaId).curto;
  const titulo = tipo === "emprestimo" ? `Emprestado ao ${destino.nome}` : tipo === "livre" ? `${s.jogador.apelido} acerta com o ${destino.nome}` : `${s.jogador.apelido} é do ${destino.nome}`;
  noticia(s, "clube", titulo, `${tipo === "transferencia" ? `Negócio de ${curtoEur(taxa)}. ` : ""}${ligaNome}, ${ano}. ${tipo === "emprestimo" ? "Volta no fim da temporada." : `Contrato de ${c.anosContrato} anos, ${valorBrl(c.salario)} por mês.`}${imovelAtual(s.casa).categoria === "alojamento" ? ` Mora em: ${nomeImovel(s.casa, IMOVEL[s.casa.imovel])}.` : ""}`, { k: "transferencia", clube: destino.id, tipo, ate: tipo === "emprestimo" ? ano : ano + c.anosContrato, taxa });
  const dSeg = c.seguidores - seg0;
  if (Math.abs(dSeg) >= 1000) noticia(s, "vida", dSeg > 0 ? "Chuva de seguidores" : "Menos holofote", dSeg > 0 ? `A torcida do ${destino.nome} chegou junto: +${dSeg.toLocaleString("pt-BR")} seguidores na primeira semana.` : `Longe dos holofotes de antes, ${s.jogador.apelido} perdeu ${(-dSeg).toLocaleString("pt-BR")} seguidores.`);
}

function embaralhar(rng: RNG, ids: string[]): string[] {
  const o = [...ids];
  for (let i = o.length - 1; i > 0; i--) { const j = rng.int(0, i); [o[i], o[j]] = [o[j], o[i]]; }
  return o;
}
/** Tabela de uma liga nova com as rodadas que já aconteceram nesta temporada. */
function tabelaAteAgora(rng: RNG, l: Liga, c: Carreira) {
  const t = novaTabela(l), feitas = Math.max(0, Math.min(rodadasDaLiga(c.ordem.length).length, c.semana - SEMANAS_PRE));
  const rodadas = rodadasDaLiga(c.ordem.length);
  const forca = (id: string) => l.clubes.find((x) => x.id === id)?.forca ?? 50;
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
    // se o clube de origem subiu ou caiu de divisão enquanto você estava fora, a ordem antiga não vale mais
    mudarDeClube(pacote, s, w.clube[e.origem], "emprestimo", 0, w.info[e.origem]?.ligaId === e.ligaOrigem ? e.ordemOrigem : undefined);
    m.transferencias.pop();
    eventos.push(`Fim do empréstimo: de volta ao ${w.clube[e.origem].nome}.`);
    // cláusula de compra: o clube de destino pode oferecer em definitivo; a decisão final é sua
    const dest = e.destino ? w.clube[e.destino] : undefined;
    if (e.opcaoCompra && dest && ovr(s.jogador) >= dest.forca - 8 && new RNG(`${s.semente}|opcao|${c.temporada}`).chance(0.7)) {
      const liga = w.liga[dest.ligaId];
      const sal = Math.round(salarioMensal({ ovr: ovr(s.jogador), idade: s.jogador.idade, liga, clube: dest, agente: c.agente, fama: c.fama }));
      const expira = (c.temporada + 1) * SEMANAS_TEMPORADA + JANELAS[0].fim + 1;
      m.propostas.push(nova(m, { tipo: "transferencia", clubeId: dest.id, ligaId: dest.ligaId, salario: sal, anos: 3, taxa: e.opcaoCompra, luvas: 0, papel: papelNoClube(dest, s), interesse: 0.8, expira }));
      eventos.push(`O ${dest.nome} exerce a opção de compra: ${curtoEur(e.opcaoCompra)}. Você decide se assina.`);
      noticia(s, "clube", "Opção de compra", `O ${dest.nome} quer você em definitivo. A decisão é sua.`);
    }
  }
}

/** Contrato acabou sem renovação: vira jogador livre e assina com a melhor proposta (ou o clube oferece o mínimo). */
export function contratoVencido(pacote: PacoteDados, s: Save, eventos: string[]): boolean {
  const c = s.carreira, w = mundo(pacote);
  if (c.formacao || c.anosContrato > 0) return false;
  const perfil = { ...perfilDe(pacote, s), clubeAtual: null, anosContrato: 0 };
  const props = gerarPropostas(new RNG(`${s.semente}|livre|${c.temporada}`), perfil, w.ligas, c.fama).filter((p) => p.clube.id !== c.clubeId && golfoQuer(p, s));
  const origem = w.clube[c.clubeId], m = mercadoDe(c);
  // o contrato acabou: o jogador vira agente livre e escolhe entre as propostas (as que chegarem)
  if (m.semClube) return false;
  m.semClube = { desde: semanaAbs(c), ultimo: c.clubeId, salario: c.salario };
  c.salario = 0; c.anosContrato = 0;
  m.propostas = m.propostas.filter((p) => p.tipo !== "renovacao" && p.tipo !== "emprestimo");
  for (const p of props.sort((a, b) => b.interesse - a.interesse || b.salario - a.salario).slice(0, 3)) m.propostas.push(paraSave(pacote, s, p));
  eventos.push(`Fim de contrato com o ${origem.nome}: você está sem clube.${props.length ? ` ${Math.min(3, props.length)} ${props.length === 1 ? "proposta chegou" : "propostas chegaram"}.` : " Ainda sem propostas."}`);
  noticia(s, "clube", `${s.jogador.apelido} está sem clube`, `O contrato com o ${origem.nome} terminou e ${s.jogador.apelido} é agente livre: pode assinar com qualquer clube, sem taxa.`);
  return true;
}

/** Semana de quem está sem clube: propostas chegam (mais com o agente oferecendo, menos com o tempo parado), a moral cai. */
export function semanaSemClube(pacote: PacoteDados, s: Save, rng: RNG, eventos: string[]) {
  const c = s.carreira, m = mercadoDe(c), sc = m.semClube!, agora = semanaAbs(c), w = mundo(pacote);
  const parado = agora - sc.desde;
  if (parado >= 3) c.moral = Math.max(0, c.moral - 2);
  if (m.propostas.length >= 4) return;
  const oferecendo = (sc.oferecendoAte ?? -1) >= agora;
  const chance = Math.max(0.15, 0.55 - parado * 0.02) + (oferecendo ? 0.3 : 0);
  if (!rng.chance(chance)) return;
  const perfil = { ...perfilDe(pacote, s), clubeAtual: null, anosContrato: 0 };
  const props = gerarPropostas(rng, perfil, w.ligas, c.fama).filter((p) => golfoQuer(p, s) && !m.propostas.some((x) => x.clubeId === p.clube.id));
  const nova1 = props.sort((a, b) => b.interesse - a.interesse)[0];
  if (!nova1) return;
  const p = paraSave(pacote, s, nova1);
  m.propostas.push(p);
  eventos.push(`Proposta para quem está sem clube: ${nova1.clube.nome}.`);
  noticia(s, "clube", `${nova1.clube.nome} quer ${s.jogador.apelido}`, `O ${nova1.clube.nome} oferece ${p.anos} ${p.anos === 1 ? "ano" : "anos"} de contrato ao agente livre ${s.jogador.apelido}.`);
}
/** O agente sai oferecendo o jogador sem clube pelas próximas quatro semanas (mais propostas). */
export function oferecerJogador(s: Save): { ok: boolean; msg: string } {
  const c = s.carreira, sc = mercadoDe(c).semClube, agora = semanaAbs(c);
  if (!sc) return { ok: false, msg: "Você tem clube." };
  if ((sc.oferecendoAte ?? -1) >= agora) return { ok: false, msg: "O agente já está oferecendo você aos clubes." };
  sc.oferecendoAte = agora + 4;
  return { ok: true, msg: "O agente vai ligar para os clubes nas próximas quatro semanas." };
}

/** Política automática (testes e balanceamento): o que um jogador sensato faria com as propostas da semana. */
export function decidirAutomatico(pacote: PacoteDados, s: Save) {
  const c = s.carreira, m = mercadoDe(c), w = mundo(pacote);
  // agente: o melhor disponível
  for (const a of [...BANCO].sort((x, y) => y.nivel - x.nivel)) { if (nivelDoAgente(a.id) <= nivelDoAgente(c.agente)) continue; if (podeContratarAgente(s, a.id).ok) { trocarAgente(s, a.id, perfilAgente(a.id).comissao); break; } }
  for (const p of [...m.propostas]) {
    if (!m.propostas.includes(p)) continue;
    if (p.tipo === "renovacao") { if (!p.negociada) negociar(pacote, s, p.id); if (m.propostas.includes(p)) aceitar(pacote, s, p.id); continue; }
    if (p.tipo === "emprestimo") { aceitar(pacote, s, p.id); return; }
    const atual = w.clube[c.clubeId], novo = w.clube[p.clubeId], papelAtual = papelNoClube(atual, s);
    const nivelAtual = w.liga[infoLiga(c.ligaId).id].nivel, nivelNovo = w.liga[p.ligaId].nivel, idade = s.jogador.idade;
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
