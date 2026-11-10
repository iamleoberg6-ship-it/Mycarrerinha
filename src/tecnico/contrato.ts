// Contrato do técnico: a entrevista com o presidente do clube que quer você e a negociação de salário, tempo de
// contrato e multa rescisória (o que o clube paga se demitir antes do fim). O clube tem um teto escondido que sobe com a
// entrevista, a sua reputação e o seu nome de ex-jogador; passou do teto, ele faz uma contraproposta; na segunda vez, desiste.
import { clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { mundo, infoClube } from "../mundo.js";
import { infoLiga } from "../ligas.js";
import type { SaveTecnico } from "./motor.js";

export interface Contrato { salario: number; /** última temporada do contrato */ ate: number; multa: number }
export type Perfil = "grande" | "medio" | "pequeno";
export interface PerguntaEntrevista { id: string; texto: string; opcoes: { id: string; texto: string; nota: Record<Perfil, number> }[] }
export const ENTREVISTA: PerguntaEntrevista[] = [
  { id: "projeto", texto: "Qual é o seu projeto para o clube?", opcoes: [
    { id: "titulos", texto: "Brigar por títulos desde o primeiro dia.", nota: { grande: 2, medio: 1, pequeno: 0 } },
    { id: "base", texto: "Montar um time forte com a garotada da base.", nota: { grande: 0, medio: 2, pequeno: 1 } },
    { id: "crescer", texto: "Organizar a casa e crescer aos poucos.", nota: { grande: 0, medio: 1, pequeno: 2 } }] },
  { id: "estilo", texto: "Como o seu time vai jogar?", opcoes: [
    { id: "ofensivo", texto: "Ofensivo, com a bola no pé e pressão alta.", nota: { grande: 2, medio: 1, pequeno: 0 } },
    { id: "compacto", texto: "Compacto, difícil de ser batido.", nota: { grande: 0, medio: 1, pequeno: 2 } },
    { id: "adapta", texto: "Depende do adversário: cada jogo é um jogo.", nota: { grande: 1, medio: 2, pequeno: 1 } }] },
  { id: "dinheiro", texto: "E o orçamento para contratações?", opcoes: [
    { id: "caro", texto: "Vou precisar de reforços de peso.", nota: { grande: 2, medio: 0, pequeno: 0 } },
    { id: "vender", texto: "Vender bem para reinvestir no elenco.", nota: { grande: 0, medio: 2, pequeno: 1 } },
    { id: "pouco", texto: "Trabalho com o que o clube puder dar.", nota: { grande: 0, medio: 1, pequeno: 2 } }] },
];
export const perfilDoClube = (forca: number): Perfil => (forca >= 80 ? "grande" : forca >= 70 ? "medio" : "pequeno");
export const NOME_PERFIL: Record<Perfil, string> = { grande: "clube grande, que exige títulos", medio: "clube de meio de tabela, que quer crescer", pequeno: "clube pequeno, que precisa de estabilidade" };

/** Salário que o clube oferece de cara (pelo tamanho do clube, da liga e o seu nome). */
export function salarioOferecido(pacote: PacoteDados, s: SaveTecnico, clubeId: string): number {
  const w = mundo(pacote), forca = w.clube[clubeId]?.forca ?? 65, li = infoLiga(infoClube(pacote, clubeId)?.ligaId ?? s.ligaId);
  const v = (14_000 + s.tecnico.reputacao * 2_200 + Math.max(0, forca - 60) * 2_800) * Math.max(0.35, li.fLiga) * (1 + (s.tecnico.prestigio ?? 0) / 400);
  return Math.round(v / 1000) * 1000;
}
export interface Negociacao { clubeId: string; respostas: Record<string, string>; nota?: number; oferta: { salario: number; anos: number; multaMeses: number }; teto?: { salario: number; multaMeses: number }; recusou?: boolean }
/** Começa a conversa com o presidente: a proposta inicial do clube (as respostas da entrevista vêm depois). */
export function abrirNegociacao(pacote: PacoteDados, s: SaveTecnico, clubeId: string): Negociacao {
  s.negociacaoT = { clubeId, respostas: {}, oferta: { salario: salarioOferecido(pacote, s, clubeId), anos: 2, multaMeses: 6 } };
  return s.negociacaoT;
}
/** Responde a entrevista: a nota (0 a 6) define o quanto o clube estica no salário e na multa. */
export function responderEntrevista(pacote: PacoteDados, s: SaveTecnico, respostas: Record<string, string>): { nota: number; texto: string } {
  const n = s.negociacaoT!, forca = mundo(pacote).clube[n.clubeId]?.forca ?? 65, perfil = perfilDoClube(forca);
  const nota = ENTREVISTA.reduce((a, q) => a + (q.opcoes.find((o) => o.id === respostas[q.id])?.nota[perfil] ?? 0), 0);
  n.respostas = respostas; n.nota = nota;
  const fama = (s.tecnico.prestigio ?? 0) >= 80 ? 0.12 : (s.tecnico.prestigio ?? 0) >= 60 ? 0.06 : 0;
  n.teto = { salario: Math.round(n.oferta.salario * (1.02 + nota * 0.045 + fama + s.tecnico.reputacao / 1000) / 1000) * 1000, multaMeses: 3 + nota * 2 + (fama ? 3 : 0) };
  n.oferta.multaMeses = Math.min(n.oferta.multaMeses, n.teto.multaMeses);
  // a primeira oferta já melhora um pouco com uma boa entrevista
  n.oferta.salario = Math.round(n.oferta.salario * (1 + nota * 0.01) / 1000) * 1000;
  const texto = nota >= 5 ? "O presidente saiu encantado: \"É exatamente o que a gente procura.\"" : nota >= 3 ? "Boa conversa. O presidente gostou, mas ficou com o pé atrás em alguns pontos." : "O presidente ficou desconfiado: \"Não sei se você entendeu o nosso clube.\"";
  return { nota, texto };
}
/** Você pede salário, anos e multa: dentro do teto o clube assina; fora, contraproposta; na segunda recusa, desiste. */
export function negociarContrato(pacote: PacoteDados, s: SaveTecnico, pedido: { salario: number; anos: number; multaMeses: number }): { ok: boolean; msg: string; fechou?: Contrato; desistiu?: boolean } {
  const n = s.negociacaoT;
  if (!n || !n.teto) return { ok: false, msg: "Responda a entrevista primeiro." };
  const nome = infoClube(pacote, n.clubeId)?.nome ?? "O clube";
  const anos = clamp(Math.round(pedido.anos), 1, 4), multaMeses = clamp(Math.round(pedido.multaMeses), 0, 24), salario = Math.max(1000, Math.round(pedido.salario));
  // contrato longo com multa alta assusta mais que só um dos dois
  const multaOk = multaMeses <= n.teto.multaMeses - (anos >= 4 ? 2 : 0), salarioOk = salario <= n.teto.salario;
  if (salarioOk && multaOk) {
    const inicio = s.semana < 2 ? s.temporada : s.temporada + 1; // assume agora (pré-temporada) ou na próxima
    const c: Contrato = { salario, ate: inicio + anos - 1, multa: salario * multaMeses };
    s.negociacaoT = undefined;
    return { ok: true, msg: `Assinado: ${nome} paga ${salario.toLocaleString("pt-BR")} por mês, por ${anos} ${anos === 1 ? "temporada" : "temporadas"}, com multa de ${multaMeses} salários.`, fechou: c };
  }
  if (n.recusou) { s.negociacaoT = undefined; s.ofertaEmprego = undefined; return { ok: false, msg: `${nome} encerrou a conversa: "Não dá para chegar nesses números."`, desistiu: true }; }
  n.recusou = true;
  n.oferta = { salario: salarioOk ? salario : n.teto.salario, anos, multaMeses: multaOk ? multaMeses : Math.max(0, n.teto.multaMeses - (anos >= 4 ? 2 : 0)) };
  const faltou = [!salarioOk ? "o salário" : "", !multaOk ? "a multa" : ""].filter(Boolean).join(" e ");
  return { ok: false, msg: `${nome} não aceita ${faltou}. Última proposta: ${n.oferta.salario.toLocaleString("pt-BR")} por mês e multa de ${n.oferta.multaMeses} salários. Se pedir mais, eles desistem.` };
}
/** Contrato de quem começa a carreira (o clube que você escolheu na tela inicial). */
export const contratoInicial = (salario: number, temporada: number): Contrato => ({ salario, ate: temporada + 1, multa: salario * 6 });
