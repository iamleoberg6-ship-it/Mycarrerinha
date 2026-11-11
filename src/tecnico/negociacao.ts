// A mesa de negociação do modo técnico. Comprar um jogador tem duas etapas: primeiro com o clube dono (valor à vista,
// parcelado, bônus por metas, porcentagem de revenda e até um jogador seu na troca), depois com o jogador e o empresário
// (salário, anos, luvas, multa rescisória, papel prometido no time e comissão). Cada clube tem um jeito (duro,
// negociador ou vendedor), um valor mínimo escondido e paciência: oferta baixa demais irrita, e a conversa acaba.
// Também dá para pegar emprestado (taxa, quanto do salário você paga, opção ou obrigação de compra), vender com
// parcelas e revenda, e emprestar os seus (inclusive os garotos da base), recebendo propostas de empréstimo.
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { mundo, infoClube } from "../mundo.js";
import { infoLiga } from "../ligas.js";
import { gerarAtributos } from "./modelo.js";
import type { Atleta, PosT } from "./modelo.js";
import { ovrDe, valorAtleta, atletaDoMundo } from "./modelo.js";
import type { SaveTecnico, Alvo } from "./motor.js";
import { _int, janelaT, folhaDe, semanaAbs, interesseDo, prepararMundo, ANO_INICIAL_T, agentesLivresT } from "./motor.js";
import { travaContratacao } from "./gestao.js";
import { valorBrl } from "../moeda.js";

export type Papel = "estrela" | "titular" | "rotacao" | "reserva" | "promessa";
export const NOME_PAPEL: Record<Papel, string> = { estrela: "Estrela do time", titular: "Titular", rotacao: "Rodízio", reserva: "Reserva", promessa: "Promessa (para o futuro)" };
const NIVEL_PAPEL: Record<Papel, number> = { estrela: 4, titular: 3, rotacao: 2, reserva: 1, promessa: 1 };
export type Perfil = "duro" | "negociador" | "vendedor";
export const NOME_PERFIL: Record<Perfil, string> = { duro: "Clube duro de negociar", negociador: "Clube negociador", vendedor: "Clube vendedor" };
const TEXTO_PERFIL: Record<Perfil, string> = {
  duro: "Pede caro, cede pouco e se irrita fácil com oferta baixa.",
  negociador: "Gosta de conversar: cede aos poucos e topa parcelas e bônus.",
  vendedor: "Precisa vender: cede rápido, ainda mais com dinheiro à vista.",
};

export interface PacoteTransf { avista: number; parcelado: number; parcelas: 0 | 2 | 3; bonus: number; revenda: number; troca?: string }
export interface PacoteEmp { taxa: number; salarioPct: number; opcao: number; obrigacao: boolean }
export interface PacoteContrato { salario: number; anos: number; luvas: number; multa: number; papel: Papel; comissao: number }
export interface LinhaNeg { quem: "voce" | "clube" | "jogador" | "info"; texto: string }
export interface Negociacao {
  id: string; nome: string; clubeId: string; tipo: "compra" | "emprestimo" | "livre"; fase: "clube" | "jogador" | "fechada" | "encerrada";
  perfil: Perfil; paciencia: number; rodadas: number; janela: string;
  /** o que o clube aceita no mínimo (não aparece na tela) */ reserva: number; pedido: number;
  contraClube?: PacoteTransf; contraEmp?: PacoteEmp; acordo?: PacoteTransf; acordoEmp?: PacoteEmp;
  jogador?: { quer: PacoteContrato; papelEsperado: Papel; minSalario: number; paciencia: number; comissaoMin: number; anosPref: number };
  rival?: string; log: LinhaNeg[];
}
/** Parcelas e bônus a pagar ou receber nas próximas temporadas. */
export interface Conta { tipo: "pagar" | "receber"; valor: number; t: number; texto: string; cond?: { nome: string; jogos: number } }
/** Proposta de empréstimo recebida por um jogador seu. */
export interface OfertaEmp { id: string; atletaId: string; clubeId: string; salarioPct: number; taxa: number; opcao: number; papel: Papel; expira: number; max: { salarioPct: number; taxa: number; titular: boolean }; rodadas: number }
export interface Emprestado { atleta: Atleta; clubeId: string; ate: number; papel: Papel; salarioPct: number; opcao: number; jogos: number; gols: number }

const chave = (nome: string, clubeId: string) => `${clubeId}|${nome}`;
const k1000 = (v: number) => Math.round(v / 1000) * 1000;
const perfilDo = (s: SaveTecnico, clubeId: string): Perfil => {
  const r = new RNG(`${s.semente}|perfil|${clubeId}`).next();
  return r < 0.3 ? "duro" : r < 0.75 ? "negociador" : "vendedor";
};
/** Anos de contrato que o jogador tem no clube dele (o mundo não guarda: a conta é sempre a mesma). */
export const contratoRestante = (s: SaveTecnico, nome: string, clubeId: string) => 1 + Math.floor(new RNG(`${s.semente}|contrato|${clubeId}|${nome}|${s.temporada}`).next() * 4);
/** Quanto o clube vende vale de verdade para ele (o mínimo): titular, garoto, rival e contrato longo encarecem. */
function reservaDe(s: SaveTecnico, a: Alvo, perfil: Perfil): number {
  const anos = contratoRestante(s, a.nome, a.clubeId);
  const f = (1 + (a.titular ? 0.25 : 0) + (a.ligaId === s.ligaId ? 0.1 : 0) + (a.idade <= 21 ? 0.12 : 0)) * (anos <= 1 ? 0.68 : anos === 2 ? 0.9 : 1.05) * (perfil === "duro" ? 1.12 : perfil === "vendedor" ? 0.9 : 1);
  return k1000(a.valor * f);
}
/** Quanto um pacote vale para quem vende: parcela vale menos que à vista, bônus é incerto, revenda vale mais em garoto. */
export function valorDoPacote(s: SaveTecnico, a: Alvo, p: PacoteTransf, perfil: Perfil): number {
  const desc = p.parcelas === 3 ? 0.86 : p.parcelas === 2 ? 0.92 : 1, vend = perfil === "vendedor";
  const troca = p.troca ? s.elenco.find((x) => x.id === p.troca) : undefined;
  const vTroca = troca ? valorAtleta(troca, infoLiga(a.ligaId).fLiga, s.temporada) * (Math.abs(ovrDe(troca) - a.ovr) <= 8 ? 0.85 : 0.6) : 0;
  return p.avista * (vend ? 1.06 : 1) + p.parcelado * desc * (vend ? 0.92 : 1) + p.bonus * 0.4 + (p.revenda / 100) * a.valor * (a.idade <= 23 ? 1.3 : 0.5) * 0.6 + vTroca;
}
const custoCaixa = (p: PacoteTransf) => p.avista;
export const totalPacote = (p: PacoteTransf) => p.avista + p.parcelado + p.bonus;

// ------------------------------------------------------------------ abrir a mesa
export function abrirNeg(pacote: PacoteDados, s: SaveTecnico, nome: string, clubeId: string, tipo: "compra" | "emprestimo"): Negociacao | { erro: string } {
  const a = _int.buscarAlvo(pacote, s, nome, clubeId);
  if (!a) return { erro: "Esse jogador não está mais nesse clube." };
  const k = chave(nome, clubeId), velha = s.negs?.[k];
  if (velha && velha.janela === _int.chaveJanela(s) && (velha.fase === "encerrada" || velha.tipo === tipo)) return velha;
  const perfil = perfilDo(s, clubeId), reserva = reservaDe(s, a, perfil), nomeC = infoClube(pacote, clubeId)?.nome ?? clubeId;
  const pedido = k1000(reserva * (perfil === "duro" ? 1.32 : perfil === "negociador" ? 1.22 : 1.1));
  const anos = contratoRestante(s, nome, clubeId);
  const n: Negociacao = { id: k, nome, clubeId, tipo, fase: "clube", perfil, paciencia: perfil === "duro" ? 3 : perfil === "negociador" ? 5 : 4, rodadas: 0, janela: _int.chaveJanela(s), reserva, pedido, log: [] };
  n.log.push({ quem: "info", texto: `${NOME_PERFIL[perfil]}: ${TEXTO_PERFIL[perfil]}` });
  n.log.push({ quem: "info", texto: anos <= 1 ? `O contrato de ${nome} acaba no fim da temporada: o ${nomeC} prefere vender agora a perder de graça.` : `${nome} tem ${anos} anos de contrato com o ${nomeC}.` });
  if (tipo === "compra") { n.contraClube = { avista: pedido, parcelado: 0, parcelas: 0, bonus: 0, revenda: 0 }; n.log.push({ quem: "clube", texto: `Para conversar, o ${nomeC} pede ${valorBrl(pedido)}.` }); }
  else {
    const emp = empInicial(a, perfil);
    n.contraEmp = emp; n.log.push({ quem: "clube", texto: a.titular ? `${nome} é titular aqui. Empréstimo, só pagando bem: ${textoEmp(emp)}.` : `Dá para conversar sobre empréstimo: ${textoEmp(emp)}.` });
  }
  (s.negs ??= {})[k] = n;
  return n;
}
const empInicial = (a: Alvo, perfil: Perfil): PacoteEmp => ({ taxa: k1000(a.valor * (a.titular ? 0.16 : 0.08) * (perfil === "duro" ? 1.3 : 1)), salarioPct: a.titular ? 100 : 80, opcao: k1000(a.valor * 1.3), obrigacao: false });
export const textoEmp = (e: PacoteEmp) => `taxa de ${valorBrl(e.taxa)}, você paga ${e.salarioPct}% do salário${e.opcao ? `, ${e.obrigacao ? "obrigação" : "opção"} de compra de ${valorBrl(e.opcao)}` : ", sem opção de compra"}`;
export const textoPac = (p: PacoteTransf, s?: SaveTecnico) => [
  `${valorBrl(p.avista)} à vista`, p.parcelado ? `${valorBrl(p.parcelado)} em ${p.parcelas} parcelas anuais` : "", p.bonus ? `${valorBrl(p.bonus)} em bônus por metas` : "",
  p.revenda ? `${p.revenda}% de uma venda futura` : "", p.troca ? `${s?.elenco.find((x) => x.id === p.troca)?.nome ?? "um jogador"} na troca` : "",
].filter(Boolean).join(" + ");

/** O papel que o jogador espera ter no seu time (pelo nível dele contra os da posição). */
function papelEsperado(s: SaveTecnico, ovr: number, pos: PosT, idade: number): Papel {
  const mesmos = s.elenco.filter((x) => x.pos === pos).map(ovrDe).sort((a, b) => b - a), melhor = Math.max(...s.elenco.map(ovrDe), 0);
  if (ovr >= melhor + 2) return "estrela";
  const acima = mesmos.filter((o) => o > ovr + 1).length, vagas = pos === "GOL" ? 1 : pos === "ATA" ? 1 : 2;
  if (acima < vagas) return "titular";
  if (idade <= 20) return "promessa";
  return acima < vagas + 2 ? "rotacao" : "reserva";
}
/** O que o jogador e o empresário pedem (com o mínimo escondido). */
function demandaJogador(pacote: PacoteDados, s: SaveTecnico, a: Alvo | { nome: string; pos: PosT; idade: number; ovr: number }, salBase: number, taxaTransf: number, livre: boolean) {
  const esp = papelEsperado(s, a.ovr, a.pos, a.idade), r = new RNG(`${s.semente}|jog|${a.nome}|${s.temporada}`);
  const anosPref = a.idade >= 31 ? 3 : a.idade >= 27 ? 4 : a.idade <= 21 ? 5 : 4;
  const quer: PacoteContrato = {
    salario: k1000(salBase * (esp === "estrela" ? 1.18 : esp === "titular" ? 1.08 : 1) * r.range(1.02, 1.12) / 10) * 10,
    anos: anosPref, luvas: k1000(salBase * (livre ? r.range(4, 8) : r.range(0, 2.5))), multa: k1000(Math.max(taxaTransf, salBase * 30) * (livre ? 2 : 2.5)),
    papel: esp, comissao: k1000(livre ? salBase * r.range(1.5, 3) : taxaTransf * r.range(0.05, 0.09)),
  };
  return { quer, papelEsperado: esp, minSalario: k1000(salBase * (esp === "estrela" ? 1.06 : 0.96) / 10) * 10, paciencia: 3, comissaoMin: k1000(quer.comissao * 0.7), anosPref };
}

// ------------------------------------------------------------------ etapa 1: o clube
export function proporClube(pacote: PacoteDados, s: SaveTecnico, id: string, p: PacoteTransf): { ok: boolean; msg: string } {
  const n = s.negs?.[id], a = n && _int.buscarAlvo(pacote, s, n.nome, n.clubeId);
  if (!n || !a || n.tipo !== "compra" || n.fase !== "clube") return { ok: false, msg: "Essa negociação não está aberta." };
  const jan = janelaT(s); if (!jan.aberta) return { ok: false, msg: jan.texto };
  const int = interesseDo(pacote, s, a); if (!int.topa) return { ok: false, msg: int.motivo };
  p = { ...p, avista: k1000(Math.max(0, p.avista)), parcelado: k1000(Math.max(0, p.parcelado)), bonus: k1000(Math.max(0, p.bonus)), parcelas: p.parcelado > 0 ? (p.parcelas || 2) : 0, revenda: clamp(Math.round(p.revenda), 0, 30) };
  if (s.clube.saldo < custoCaixa(p)) return { ok: false, msg: `O caixa não tem ${valorBrl(p.avista)} para pagar à vista.` };
  { const t = travaContratacao(s, custoCaixa(p)); if (t) return { ok: false, msg: t }; }
  if (p.troca && !s.elenco.some((x) => x.id === p.troca)) p.troca = undefined;
  const nomeC = infoClube(pacote, n.clubeId)?.nome ?? n.clubeId, v = valorDoPacote(s, a, p, n.perfil);
  // aceitar exatamente o que o clube pediu fecha a parte do clube (a palavra deles vale)
  const c0 = n.contraClube, ehOPedido = !!c0 && c0.avista === p.avista && c0.parcelado === p.parcelado && c0.bonus === p.bonus && c0.revenda === p.revenda && (c0.troca ?? "") === (p.troca ?? "");
  n.rodadas++; n.log.push({ quem: "voce", texto: `Você ofereceu ${textoPac(p, s)}.` });
  // às vezes aparece outro clube na disputa e o preço sobe
  if (!ehOPedido && !n.rival && n.rodadas === 2 && a.ovr >= 70 && new RNG(`${s.semente}|rival|${n.id}`).chance(0.3)) {
    const w = mundo(pacote), rivais = Object.values(w.clube).filter((c) => c.id !== s.clubeId && c.id !== n.clubeId && !c.id.startsWith("NAT-") && Math.abs(c.forca - a.ovr) < 6);
    const rv = rivais.length ? new RNG(`${s.semente}|rivalq|${n.id}`).pick(rivais) : undefined;
    if (rv) { n.rival = rv.id; n.reserva = k1000(n.reserva * 1.08); n.log.push({ quem: "info", texto: `O ${w.info[rv.id]?.nome ?? rv.id} também entrou na disputa por ${n.nome}. O preço subiu.` }); }
  }
  if (v >= n.reserva || ehOPedido) {
    n.fase = "jogador"; n.acordo = p;
    const d = demandaJogador(pacote, s, a, int.salario, p.avista + p.parcelado, false); n.jogador = d;
    n.log.push({ quem: "clube", texto: `Negócio fechado entre os clubes: ${textoPac(p, s)}. Agora é com ${n.nome} e o empresário.` });
    n.log.push({ quem: "jogador", texto: `O empresário pede ${valorBrl(d.quer.salario)}/mês por ${d.quer.anos} anos, ${valorBrl(d.quer.luvas)} de luvas e ${valorBrl(d.quer.comissao)} de comissão. ${n.nome} se vê como ${NOME_PAPEL[d.papelEsperado].toLowerCase()} no seu time.` });
    return { ok: true, msg: `O ${nomeC} aceitou. Falta acertar com o jogador.` };
  }
  const ofensa = v < n.reserva * 0.55;
  n.paciencia -= ofensa ? 2 : 1;
  if (n.paciencia <= 0) { n.fase = "encerrada"; n.log.push({ quem: "clube", texto: `O ${nomeC} encerrou a conversa por ${n.nome} nesta janela.` }); return { ok: false, msg: `O ${nomeC} cansou e encerrou a negociação.` }; }
  // contraproposta: o pedido anda na direção da sua oferta (quanto anda depende do jeito do clube)
  const cede = n.perfil === "duro" ? 0.22 : n.perfil === "negociador" ? 0.38 : 0.5;
  n.pedido = k1000(Math.max(n.reserva, n.pedido - (n.pedido - v) * cede));
  const falta = Math.max(0, n.pedido - v);
  const contra: PacoteTransf = { ...p, avista: k1000(p.avista + falta / (n.perfil === "vendedor" ? 1.06 : 1)) };
  // garoto: o clube às vezes prefere menos dinheiro e uma porcentagem maior de revenda
  let alt = "";
  if (a.idade <= 22 && p.revenda < 20 && n.perfil !== "duro") { const c2 = { ...contra, revenda: Math.min(30, p.revenda + 15) }; c2.avista = k1000(Math.max(p.avista, contra.avista - (15 / 100) * a.valor * 1.3 * 0.6)); alt = ` Ou ${textoPac(c2, s)}.`; }
  n.contraClube = contra;
  n.log.push({ quem: "clube", texto: `${ofensa ? "Oferta muito baixa. " : ""}O ${nomeC} pede ${textoPac(contra, s)}.${alt}` });
  return { ok: false, msg: ofensa ? `O ${nomeC} achou a oferta baixa demais e ficou irritado.` : `O ${nomeC} fez uma contraproposta.` };
}
/** Pegar emprestado: o clube olha a taxa, quanto do salário você paga e a opção de compra. */
export function proporEmprestimo(pacote: PacoteDados, s: SaveTecnico, id: string, e: PacoteEmp): { ok: boolean; msg: string } {
  const n = s.negs?.[id], a = n && _int.buscarAlvo(pacote, s, n.nome, n.clubeId);
  if (!n || !a || n.tipo !== "emprestimo" || n.fase !== "clube") return { ok: false, msg: "Essa negociação não está aberta." };
  const jan = janelaT(s); if (!jan.aberta) return { ok: false, msg: jan.texto };
  const int = interesseDo(pacote, s, a); if (!int.topa) return { ok: false, msg: int.motivo };
  e = { taxa: k1000(Math.max(0, e.taxa)), salarioPct: clamp(Math.round(e.salarioPct / 10) * 10, 0, 100), opcao: k1000(Math.max(0, e.opcao)), obrigacao: !!e.obrigacao && e.opcao > 0 };
  if (s.clube.saldo < e.taxa) return { ok: false, msg: "O caixa não tem dinheiro para a taxa." };
  const nomeC = infoClube(pacote, n.clubeId)?.nome ?? n.clubeId;
  n.rodadas++; n.log.push({ quem: "voce", texto: `Você ofereceu ${textoEmp(e)}.` });
  if (a.titular && a.idade > 23 && n.perfil === "duro") { n.fase = "encerrada"; n.log.push({ quem: "clube", texto: `O ${nomeC} não empresta titular. Só venda.` }); return { ok: false, msg: `O ${nomeC} não empresta titular.` }; }
  // quanto o pacote vale para o dono: taxa + salário que deixa de pagar + compra (obrigação vale quase inteira; opção, um pouco)
  const salAno = int.salario * 12, vCompra = e.opcao ? (e.opcao >= a.valor ? 1 : e.opcao / a.valor) * a.valor * (e.obrigacao ? 0.85 : 0.18) : 0;
  const v = e.taxa + salAno * (e.salarioPct / 100) * 0.5 + vCompra, quer = a.valor * (a.titular ? 0.22 : 0.12) + salAno * 0.4 * (n.perfil === "duro" ? 1.2 : 1);
  if (v >= quer && !(e.obrigacao && e.opcao < a.valor * 0.8)) {
    n.fase = "jogador"; n.acordoEmp = e;
    const d = demandaJogador(pacote, s, a, int.salario, 0, false);
    d.quer.salario = int.salario; d.quer.anos = 1; d.quer.luvas = 0; d.quer.multa = 0; d.quer.comissao = k1000(int.salario * 0.5); d.comissaoMin = k1000(int.salario * 0.3); d.minSalario = int.salario;
    n.jogador = d;
    n.log.push({ quem: "clube", texto: `O ${nomeC} topou o empréstimo: ${textoEmp(e)}. Falta o jogador aceitar.` });
    n.log.push({ quem: "jogador", texto: `${n.nome} quer saber o papel que vai ter: ele se vê como ${NOME_PAPEL[d.papelEsperado].toLowerCase()}. O empresário pede ${valorBrl(d.quer.comissao)}.` });
    return { ok: true, msg: `O ${nomeC} aceitou o empréstimo.` };
  }
  n.paciencia -= v < quer * 0.5 ? 2 : 1;
  if (n.paciencia <= 0) { n.fase = "encerrada"; n.log.push({ quem: "clube", texto: `O ${nomeC} encerrou a conversa.` }); return { ok: false, msg: `O ${nomeC} encerrou a conversa.` }; }
  const contra: PacoteEmp = { ...e, salarioPct: Math.max(e.salarioPct, a.titular ? 100 : 80), taxa: k1000(Math.max(e.taxa, quer - salAno * (Math.max(e.salarioPct, 80) / 100) * 0.5 - vCompra)) };
  if (e.obrigacao && e.opcao < a.valor * 0.8) contra.opcao = k1000(a.valor * 0.95);
  n.contraEmp = contra; n.log.push({ quem: "clube", texto: `O ${nomeC} pede ${textoEmp(contra)}.` });
  return { ok: false, msg: `O ${nomeC} fez uma contraproposta.` };
}
export function aceitarContraClube(pacote: PacoteDados, s: SaveTecnico, id: string) {
  const n = s.negs?.[id];
  if (!n) return { ok: false, msg: "Negociação não encontrada." };
  if (n.tipo === "emprestimo" && n.contraEmp) return proporEmprestimo(pacote, s, id, n.contraEmp);
  if (n.contraClube) { n.reserva = Math.min(n.reserva, n.pedido); return proporClube(pacote, s, id, n.contraClube); }
  return { ok: false, msg: "Não há contraproposta." };
}

// ------------------------------------------------------------------ etapa 2: o jogador
/** Abre a conversa direto com um agente livre (sem clube para pagar). */
export function abrirLivre(pacote: PacoteDados, s: SaveTecnico, nome: string): Negociacao | { erro: string } {
  const x = agentesLivresT(pacote, s).find((l) => l.nome === nome);
  if (!x) return { erro: "Esse jogador já acertou com outro clube." };
  const k = chave(nome, "livre"), velha = s.negs?.[k];
  if (velha && velha.janela === _int.chaveJanela(s)) return velha;
  const forca = mundo(pacote).clube[s.clubeId]?.forca ?? 65, limite = forca + 3 + s.tecnico.reputacao / 15;
  const n: Negociacao = { id: k, nome, clubeId: "livre", tipo: "livre", fase: "jogador", perfil: "negociador", paciencia: 3, rodadas: 0, janela: _int.chaveJanela(s), reserva: 0, pedido: 0, log: [] };
  if (x.ovr > limite) { n.fase = "encerrada"; n.log.push({ quem: "jogador", texto: `${nome} prefere esperar proposta de um clube maior.` }); }
  else {
    const d = demandaJogador(pacote, s, x, x.pedido, 0, true); n.jogador = d;
    n.log.push({ quem: "jogador", texto: `Sem clube, ${nome} quer luvas pela assinatura: o empresário pede ${valorBrl(d.quer.salario)}/mês por ${d.quer.anos} anos, ${valorBrl(d.quer.luvas)} de luvas e ${valorBrl(d.quer.comissao)} de comissão. Ele se vê como ${NOME_PAPEL[d.papelEsperado].toLowerCase()}.` });
  }
  (s.negs ??= {})[k] = n;
  return n;
}
/** Quanto o jogador precisa ganhar por mês para aceitar este contrato (papel, anos, luvas e multa mexem). */
function salarioNecessario(n: Negociacao, c: PacoteContrato): number {
  const d = n.jogador!, dif = NIVEL_PAPEL[c.papel] - NIVEL_PAPEL[d.papelEsperado];
  const fPapel = dif >= 1 ? 0.93 : dif === 0 ? 1 : dif === -1 ? 1.12 : 1.35;
  const fAnos = 1 + Math.max(0, d.anosPref - c.anos) * 0.03 - Math.max(0, c.anos - d.anosPref) * 0.01;
  const fMulta = c.multa > d.quer.multa * 1.5 ? 1.04 : c.multa < d.quer.multa * 0.7 ? 0.98 : 1;
  const luvasMes = c.luvas / Math.max(1, c.anos * 12) * 0.8, luvasFalta = Math.max(0, d.quer.luvas * 0.6 - c.luvas) / Math.max(1, c.anos * 12) * 1.5;
  return d.minSalario * fPapel * fAnos * fMulta - luvasMes + luvasFalta;
}
export function proporJogador(pacote: PacoteDados, s: SaveTecnico, id: string, c: PacoteContrato): { ok: boolean; msg: string } {
  const n = s.negs?.[id];
  if (!n || n.fase !== "jogador" || !n.jogador) return { ok: false, msg: "Essa conversa não está aberta." };
  const jan = janelaT(s); if (!jan.aberta && n.tipo !== "livre") return { ok: false, msg: jan.texto };
  c = { ...c, salario: Math.round(Math.max(0, c.salario) / 100) * 100, anos: clamp(Math.round(c.anos), 1, 5), luvas: k1000(Math.max(0, c.luvas)), multa: k1000(Math.max(0, c.multa)), comissao: k1000(Math.max(0, c.comissao)) };
  if (n.tipo === "emprestimo") { c.anos = 1; c.multa = 0; c.luvas = 0; }
  const salFolha = n.tipo === "emprestimo" ? c.salario * ((n.acordoEmp?.salarioPct ?? 100) / 100) : c.salario;
  if (folhaDe(s) + salFolha > s.clube.tetoFolha) return { ok: false, msg: `A diretoria barrou: ${valorBrl(c.salario)}/mês passa do teto da folha (${valorBrl(s.clube.tetoFolha)}).` };
  const caixa = (n.acordo?.avista ?? 0) + (n.acordoEmp?.taxa ?? 0) + c.luvas + c.comissao;
  if (s.clube.saldo < caixa) return { ok: false, msg: `O caixa não cobre tudo agora (${valorBrl(caixa)} entre clube, luvas e comissão).` };
  if (s.elenco.length >= 36) return { ok: false, msg: "O elenco está cheio (36). Venda, empreste ou dispense alguém antes." };
  const d = n.jogador; n.rodadas++;
  n.log.push({ quem: "voce", texto: `Você ofereceu ${valorBrl(c.salario)}/mês por ${c.anos} ${c.anos === 1 ? "ano" : "anos"}${c.luvas ? `, ${valorBrl(c.luvas)} de luvas` : ""}${c.multa ? `, multa de ${valorBrl(c.multa)}` : ""}, papel de ${NOME_PAPEL[c.papel].toLowerCase()} e ${valorBrl(c.comissao)} ao empresário.` });
  const precisa = salarioNecessario(n, c), comissaoOk = c.comissao >= d.comissaoMin;
  if (c.salario >= precisa * 0.98 && comissaoOk) return fechar(pacote, s, n, c);
  const longe = c.salario < precisa * 0.75;
  d.paciencia -= longe ? 2 : 1;
  if (d.paciencia <= 0) { n.fase = "encerrada"; n.log.push({ quem: "jogador", texto: `${n.nome} desistiu: "não sinto que o clube me quer de verdade".` }); return { ok: false, msg: `${n.nome} desistiu da negociação.` }; }
  const dif = NIVEL_PAPEL[c.papel] - NIVEL_PAPEL[d.papelEsperado];
  const motivo = !comissaoOk ? `O empresário não aceita menos de ${valorBrl(k1000(d.comissaoMin * 1.1))} de comissão. ` : "";
  const papelTxt = dif < 0 ? `${n.nome} não veio para ser ${NOME_PAPEL[c.papel].toLowerCase()}: quer ser ${NOME_PAPEL[d.papelEsperado].toLowerCase()} ou ganhar bem mais. ` : dif > 0 ? `${n.nome} gostou da promessa de ser ${NOME_PAPEL[c.papel].toLowerCase()}. ` : "";
  const pede = Math.round(precisa * 1.03 / 100) * 100;
  d.quer = { ...c, salario: pede, comissao: Math.max(c.comissao, k1000(d.comissaoMin * 1.1)) };
  n.log.push({ quem: "jogador", texto: `${papelTxt}${motivo}Com essas condições, ele pede ${valorBrl(pede)}/mês.` });
  return { ok: false, msg: `${n.nome} fez uma contraproposta.` };
}
export function aceitarContraJogador(pacote: PacoteDados, s: SaveTecnico, id: string) {
  const n = s.negs?.[id];
  if (!n?.jogador) return { ok: false, msg: "Negociação não encontrada." };
  return proporJogador(pacote, s, id, n.jogador.quer);
}
/** Fecha tudo: paga à vista, agenda parcelas e bônus, cria o atleta com contrato, multa e papel prometido. */
function fechar(pacote: PacoteDados, s: SaveTecnico, n: Negociacao, c: PacoteContrato): { ok: boolean; msg: string } {
  const nomeC = n.clubeId === "livre" ? "" : infoClube(pacote, n.clubeId)?.nome ?? n.clubeId;
  let at: Atleta;
  if (n.tipo === "livre") {
    const x = agentesLivresT(pacote, s).find((l) => l.nome === n.nome);
    if (!x) { n.fase = "encerrada"; return { ok: false, msg: "Ele acabou de acertar com outro clube." }; }
    const rng = new RNG(`${s.semente}|livre|${x.nome}`);
    at = { id: `${s.clubeId}|${x.nome}`, nome: x.nome, pos: x.pos, idade: x.idade, nac: x.nac, at: gerarAtributos(rng, x.pos, x.ovr), pot: x.pot, numero: 0, moral: 72, condicao: 85, lesao: 0, suspenso: 0, amarelos: 0,
      salario: c.salario, contratoAte: s.temporada + c.anos - 1, prof: rng.int(5, 20), temp: rng.int(1, 20), relacao: 55, notas: [], jogos: 0, gols: 0, assist: 0, amarelosT: 0, vermelhosT: 0, semJogar: 0, desde: s.temporada };
  } else {
    const npc = mundo(pacote).clube[n.clubeId]?.elenco.find((j) => j.nome === n.nome);
    if (!npc) { n.fase = "encerrada"; return { ok: false, msg: "Esse jogador não está mais nesse clube." }; }
    at = atletaDoMundo(npc, s.semente, s.clubeId, s.temporada, () => c.salario);
    at.salario = c.salario; at.contratoAte = s.temporada + c.anos - 1; at.moral = 76; at.condicao = 90; at.desde = s.temporada; at.numero = 0;
  }
  at.multa = c.multa || undefined; at.papel = c.papel;
  if (NIVEL_PAPEL[c.papel] >= 3) at.promessa = 3;
  // dinheiro: à vista agora; parcelas nas próximas temporadas; bônus se ele jogar 20 jogos na temporada
  const ac = n.acordo, emp = n.acordoEmp;
  let pago = c.luvas + c.comissao;
  if (ac) {
    pago += ac.avista;
    for (let i = 1; i <= ac.parcelas; i++) (s.contas ??= []).push({ tipo: "pagar", valor: k1000(ac.parcelado / ac.parcelas), t: s.temporada + i, texto: `Parcela ${i}/${ac.parcelas} de ${n.nome} ao ${nomeC}` });
    if (ac.bonus) (s.contas ??= []).push({ tipo: "pagar", valor: ac.bonus, t: s.temporada + 1, texto: `Bônus por metas de ${n.nome} ao ${nomeC}`, cond: { nome: n.nome, jogos: 20 } });
    if (ac.revenda) at.revenda = { clubeId: n.clubeId, pct: ac.revenda };
    if (ac.troca) { const tr = s.elenco.find((x) => x.id === ac.troca); if (tr) { _int.tirarDoElenco(s, tr.id); (s.transferencias ??= []).unshift({ t: s.temporada, nome: tr.nome, de: s.clubeId, para: n.clubeId, valor: 0, venda: true }); _int.noticia(s, "elenco", `${tr.nome} vai para o ${nomeC} como parte do negócio.`); } }
  }
  if (emp) { pago += emp.taxa; at.emprestadoDe = { clubeId: n.clubeId, ate: s.temporada, opcao: emp.opcao, obrigacao: emp.obrigacao, salarioPct: emp.salarioPct }; at.salario = Math.round(c.salario * emp.salarioPct / 100); at.contratoAte = s.temporada; }
  s.clube.saldo -= pago;
  if (ac?.avista || emp?.taxa) _int.gastar(s, n.tipo === "emprestimo" ? "Empréstimos" : "Contratações", (ac?.avista ?? 0) + (emp?.taxa ?? 0));
  if (c.luvas) _int.gastar(s, "Luvas", c.luvas);
  if (c.comissao) _int.gastar(s, "Comissões de empresários", c.comissao);
  s.elenco.push(at); _int.numerar(s);
  if (n.tipo !== "livre") (s.transferencias ??= []).unshift({ t: s.temporada, nome: n.nome, de: n.clubeId, para: s.clubeId, valor: (ac ? totalPacote(ac) : emp?.taxa ?? 0), venda: false });
  n.fase = "fechada"; n.log.push({ quem: "jogador", texto: `${n.nome} assinou!` });
  delete s.negs![n.id];
  _int.invalidar(); prepararMundo(pacote, s);
  const fim = ANO_INICIAL_T + at.contratoAte;
  const txt = n.tipo === "emprestimo" ? `${n.nome} chega emprestado pelo ${nomeC} até o fim da temporada${emp?.opcao ? ` (${emp.obrigacao ? "obrigação" : "opção"} de compra de ${valorBrl(emp.opcao)})` : ""}.`
    : n.tipo === "livre" ? `${n.nome} assina sem custo de transferência, até ${fim}${c.luvas ? `, com ${valorBrl(c.luvas)} de luvas` : ""}.`
    : `${n.nome} chega do ${nomeC}: ${textoPac(ac!, s)}. Contrato até ${fim}, ${valorBrl(c.salario)}/mês.`;
  _int.noticia(s, "elenco", txt);
  return { ok: true, msg: `Fechado! ${txt}` };
}
export function desistir(s: SaveTecnico, id: string) { const n = s.negs?.[id]; if (n) { n.fase = "encerrada"; n.log.push({ quem: "voce", texto: "Você desistiu do negócio." }); } }

// ------------------------------------------------------------------ vendas: proposta com parcelas, bônus e revenda
export interface PropostaVenda { id: string; atletaId: string; clubeId: string; avista: number; parcelado: number; parcelas: 0 | 2 | 3; bonus: number; revenda: number; expira: number; max: number; rodadas: number; leilao?: boolean }
export const valorVenda = (p: { avista: number; parcelado: number; parcelas: number; bonus: number }) => p.avista + p.parcelado * (p.parcelas === 3 ? 0.86 : p.parcelas === 2 ? 0.92 : 1) + p.bonus * 0.4;
/** Monta uma proposta de compra de outro clube (o máximo dele fica escondido). */
export function novaPropostaVenda(s: SaveTecnico, a: Atleta, clubeId: string, valor: number, rng: RNG, ab: number): PropostaVenda {
  const parcelado = rng.chance(0.4) ? k1000(valor * rng.range(0.2, 0.45)) : 0, bonus = rng.chance(0.35) ? k1000(valor * rng.range(0.05, 0.15)) : 0;
  return { id: `${ab}-${a.id}-${clubeId}`, atletaId: a.id, clubeId, avista: k1000(valor - parcelado), parcelado, parcelas: parcelado ? (rng.chance(0.5) ? 2 : 3) : 0, bonus, revenda: 0, expira: ab + 2, max: k1000(valor * rng.range(1.04, 1.32)), rodadas: 0 };
}
/** Sua contraproposta numa venda: pedir mais à vista, parcelas, bônus ou porcentagem de revenda. */
export function contraVenda(pacote: PacoteDados, s: SaveTecnico, id: string, q: { avista: number; parcelado: number; parcelas: 0 | 2 | 3; bonus: number; revenda: number }): { ok: boolean; msg: string } {
  const p = (s.propostasV ?? []).find((x) => x.id === id), a = p && s.elenco.find((x) => x.id === p.atletaId);
  if (!p || !a) return { ok: false, msg: "Essa proposta não vale mais." };
  const nomeC = infoClube(pacote, p.clubeId)?.nome ?? p.clubeId;
  q = { avista: k1000(q.avista), parcelado: k1000(q.parcelado), parcelas: q.parcelado > 0 ? (q.parcelas || 2) : 0, bonus: k1000(q.bonus), revenda: clamp(Math.round(q.revenda), 0, 30) };
  // para quem compra: parcela é mais fácil de pagar; revenda custa (mais em garoto)
  const custo = (x: typeof q) => x.avista + x.parcelado * (x.parcelas === 3 ? 0.84 : x.parcelas === 2 ? 0.9 : 1) + x.bonus * 0.45 + (x.revenda / 100) * valorAtleta(a, infoLiga(s.ligaId).fLiga, s.temporada) * (a.idade <= 23 ? 0.8 : 0.3);
  p.rodadas++;
  if (custo(q) <= p.max) { Object.assign(p, q); return aceitarVenda(pacote, s, id); }
  if (custo(q) > p.max * 1.45 || p.rodadas >= 3) { s.propostasV = s.propostasV!.filter((x) => x !== p); return { ok: false, msg: `O ${nomeC} achou o pedido fora da realidade e desistiu.` }; }
  // sobe até o máximo, mantendo o formato do seu pedido
  const fator = p.max / custo(q);
  p.avista = k1000(q.avista * fator); p.parcelado = k1000(q.parcelado * fator); p.parcelas = q.parcelas; p.bonus = k1000(q.bonus * fator); p.revenda = q.revenda;
  return { ok: true, msg: `O ${nomeC} não chega lá, mas melhorou: ${textoPac({ ...p, troca: undefined })}. Disse que é o limite.` };
}
/** Usar uma proposta melhor de outro clube para fazer este subir (leilão). */
export function leilao(pacote: PacoteDados, s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const p = (s.propostasV ?? []).find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Essa proposta não vale mais." };
  const outras = (s.propostasV ?? []).filter((x) => x.atletaId === p.atletaId && x !== p), melhor = outras.sort((a, b) => valorVenda(b) - valorVenda(a))[0];
  const nomeC = infoClube(pacote, p.clubeId)?.nome ?? p.clubeId;
  if (!melhor || valorVenda(melhor) <= valorVenda(p)) return { ok: false, msg: "Não há proposta melhor na mesa para usar." };
  if (p.leilao) return { ok: false, msg: `O ${nomeC} já cobriu uma vez.` };
  p.leilao = true;
  if (valorVenda(melhor) * 1.03 > p.max) { s.propostasV = s.propostasV!.filter((x) => x !== p); return { ok: false, msg: `O ${nomeC} não cobre a oferta do ${infoClube(pacote, melhor.clubeId)?.nome} e saiu da disputa.` }; }
  const alvo = Math.min(p.max, valorVenda(melhor) * 1.05), f = alvo / valorVenda(p);
  p.avista = k1000(p.avista * f); p.parcelado = k1000(p.parcelado * f); p.bonus = k1000(p.bonus * f);
  return { ok: true, msg: `O ${nomeC} cobriu a proposta do ${infoClube(pacote, melhor.clubeId)?.nome}: agora oferece ${textoPac({ ...p, troca: undefined })}.` };
}
export function aceitarVenda(pacote: PacoteDados, s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const p = (s.propostasV ?? []).find((x) => x.id === id), a = p && s.elenco.find((x) => x.id === p.atletaId);
  if (!p || !a) return { ok: false, msg: "Essa proposta não vale mais." };
  if (s.elenco.length <= 18) return { ok: false, msg: "O elenco ficaria curto demais (mínimo de 18)." };
  const nomeC = infoClube(pacote, p.clubeId)?.nome ?? p.clubeId, total = p.avista + p.parcelado;
  // revenda: se você comprou com cláusula, o clube antigo leva a parte dele
  const devido = a.revenda ? k1000(total * a.revenda.pct / 100) : 0;
  const liquido = Math.round(p.avista * 0.82) - devido;
  s.clube.saldo += liquido; _int.receber(s, "Vendas", p.avista); _int.gastar(s, "Agentes e impostos de venda", Math.round(p.avista * 0.18));
  if (devido) { _int.gastar(s, "Revenda a clubes antigos", devido); _int.noticia(s, "elenco", `O ${infoClube(pacote, a.revenda!.clubeId)?.nome} recebe ${a.revenda!.pct}% da venda de ${a.nome} (${valorBrl(devido)}).`); }
  for (let i = 1; i <= p.parcelas; i++) (s.contas ??= []).push({ tipo: "receber", valor: k1000(p.parcelado / p.parcelas * 0.82), t: s.temporada + i, texto: `Parcela ${i}/${p.parcelas} da venda de ${a.nome} pelo ${nomeC}` });
  if (p.bonus) (s.contas ??= []).push({ tipo: "receber", valor: p.bonus, t: s.temporada + 1, texto: `Bônus por metas de ${a.nome} pago pelo ${nomeC}`, cond: { nome: a.nome, jogos: -20 } });
  if (p.revenda) (s.revendas ??= []).push({ nome: a.nome, clubeId: p.clubeId, pct: p.revenda, t: s.temporada });
  s.propostasV = (s.propostasV ?? []).filter((x) => x.atletaId !== a.id);
  _int.tirarDoElenco(s, a.id); s.aVenda = (s.aVenda ?? []).filter((x) => x !== a.id); s.aEmprestimo = (s.aEmprestimo ?? []).filter((x) => x !== a.id);
  (s.transferencias ??= []).unshift({ t: s.temporada, nome: a.nome, de: s.clubeId, para: p.clubeId, valor: total, venda: true });
  if (ovrDe(a) >= (mundo(pacote).clube[s.clubeId]?.forca ?? 60) + 2) s.clube.torcida = clamp(s.clube.torcida - 4, 0, 100);
  _int.invalidar(); prepararMundo(pacote, s);
  _int.noticia(s, "elenco", `${a.nome} é vendido ao ${nomeC}: ${textoPac({ ...p, troca: undefined })}.`);
  return { ok: true, msg: `${a.nome} vendido ao ${nomeC}.` };
}
export function recusarVenda(pacote: PacoteDados, s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const p = (s.propostasV ?? []).find((x) => x.id === id), a = p && s.elenco.find((x) => x.id === p.atletaId);
  if (!p) return { ok: false, msg: "Essa proposta não vale mais." };
  s.propostasV = s.propostasV!.filter((x) => x !== p);
  if (a?.querSair) a.moral = clamp(a.moral - 8, 0, 100);
  return { ok: true, msg: `Você recusou a proposta do ${infoClube(pacote, p.clubeId)?.nome}.${a?.querSair ? ` ${a.nome} ficou chateado.` : ""}` };
}

// ------------------------------------------------------------------ empréstimos dos seus jogadores
export function alternarEmprestimo(s: SaveTecnico, id: string): string {
  const l = (s.aEmprestimo ??= []), i = l.indexOf(id), a = s.elenco.find((x) => x.id === id);
  if (i >= 0) { l.splice(i, 1); return `${a?.nome ?? "Jogador"} saiu da lista de empréstimo.`; }
  l.push(id);
  return `${a?.nome ?? "Jogador"} está disponível para empréstimo: as propostas aparecem durante a janela.`;
}
/** Propostas da semana: compra (com parcelas, bônus) e empréstimo (para quem está na lista ou é garoto sem espaço). */
export function propostasDaSemanaT(pacote: PacoteDados, s: SaveTecnico, eventos: string[]) {
  const ab = semanaAbs(s);
  s.propostasV = (s.propostasV ?? []).filter((p) => p.expira > ab && s.elenco.some((a) => a.id === p.atletaId));
  s.ofertasEmp = (s.ofertasEmp ?? []).filter((p) => p.expira > ab && s.elenco.some((a) => a.id === p.atletaId));
  if (!janelaT(s).aberta) return;
  const w = mundo(pacote), rng = _int.rngT(s, "propostas2"), fL = _int.fLigaDe(s), aVenda = new Set(s.aVenda ?? []), aEmp = new Set(s.aEmprestimo ?? []), meuF = w.clube[s.clubeId]?.forca ?? 60;
  const clubes = w.ligas.filter((l) => !infoLiga(l.id).amador).flatMap((l) => l.clubes).filter((c) => c.id !== s.clubeId);
  for (const a of [...s.elenco]) {
    if (a.emprestadoDe) continue;
    const o = ovrDe(a);
    // compra
    if (s.propostasV.length < 5 && !(a.desde === s.temporada && !aVenda.has(a.id))) {
      const ja = s.propostasV.filter((p) => p.atletaId === a.id).length;
      const p = (0.012 + (aVenda.has(a.id) ? 0.14 : 0) + (a.querSair ? 0.05 : 0) + (o >= meuF + 3 ? 0.02 : 0) + (a.idade <= 21 && a.pot >= o + 8 ? 0.015 : 0)) * (ja ? 0.5 : 1);
      if (ja < 3 && rng.chance(p)) {
        const cands = clubes.filter((c) => c.forca >= o - 5 && c.forca <= o + 9 && !s.propostasV!.some((x) => x.atletaId === a.id && x.clubeId === c.id));
        if (cands.length) {
          const c = rng.pick(cands), valor = valorAtleta(a, Math.max(fL, infoLiga(c.ligaId).fLiga), s.temporada) * rng.range(0.75, 1.2) * (aVenda.has(a.id) ? 0.9 : 1);
          s.propostasV.push(novaPropostaVenda(s, a, c.id, valor, rng, ab));
          eventos.push(`Proposta do ${w.info[c.id]?.nome ?? c.id} por ${a.nome}${ja ? " (já há outra na mesa)" : ""}.`);
        }
      }
    }
    // multa rescisória baixa: um clube maior pode pagar e levar o jogador sem você poder recusar
    if (a.multa && s.elenco.length > 18 && a.multa <= valorAtleta(a, fL, s.temporada) * 1.4 && rng.chance(0.012)) {
      const ricos = clubes.filter((c) => c.forca >= Math.max(o, meuF) + 3);
      if (ricos.length) {
        const c = rng.pick(ricos), pv: PropostaVenda = { id: `${ab}-m-${a.id}`, atletaId: a.id, clubeId: c.id, avista: a.multa, parcelado: 0, parcelas: 0, bonus: 0, revenda: 0, expira: ab + 1, max: a.multa, rodadas: 0 };
        s.propostasV.push(pv); const r = aceitarVenda(pacote, s, pv.id);
        if (r.ok) { eventos.push(`O ${w.info[c.id]?.nome ?? c.id} pagou a multa rescisória de ${a.nome} (${valorBrl(a.multa)}) e levou o jogador.`); continue; }
        s.propostasV = s.propostasV.filter((x) => x !== pv);
      }
    }
    // empréstimo: listado, ou garoto (até 21) que quase não joga
    const garotoSemEspaco = a.idade <= 21 && a.jogos <= Math.max(1, s.semana / 6) && s.semana > 6;
    if (s.ofertasEmp.length < 4 && !s.ofertasEmp.some((x) => x.atletaId === a.id) && (aEmp.has(a.id) || garotoSemEspaco) && rng.chance(aEmp.has(a.id) ? 0.3 : 0.035)) {
      const cands = clubes.filter((c) => c.forca >= o - 6 && c.forca <= o + 3);
      if (cands.length) {
        const c = rng.pick(cands), titular = c.forca <= o + 1, valor = valorAtleta(a, fL, s.temporada);
        const max = { salarioPct: clamp(Math.round(rng.range(0.5, 1.05) * 10) * 10, 30, 100), taxa: k1000(valor * rng.range(0, 0.08)), titular };
        s.ofertasEmp.push({ id: `${ab}-e-${a.id}`, atletaId: a.id, clubeId: c.id, salarioPct: Math.max(0, max.salarioPct - 20), taxa: k1000(max.taxa * 0.5), opcao: rng.chance(0.4) ? k1000(valor * rng.range(1.05, 1.4)) : 0, papel: titular ? "titular" : "rotacao", expira: ab + 2, max, rodadas: 0 });
        eventos.push(`O ${w.info[c.id]?.nome ?? c.id} quer ${a.nome} emprestado.`);
      }
    }
  }
}
/** Responder a proposta de empréstimo: aceitar, recusar ou pedir mais (salário pago, taxa, sem opção de compra, garantia de titular). */
export function responderEmp(pacote: PacoteDados, s: SaveTecnico, id: string, r: "aceitar" | "recusar" | "contra", q?: { salarioPct: number; taxa: number; semOpcao: boolean; titular: boolean }): { ok: boolean; msg: string } {
  const o = (s.ofertasEmp ?? []).find((x) => x.id === id), a = o && s.elenco.find((x) => x.id === o.atletaId);
  if (!o || !a) return { ok: false, msg: "Essa proposta não vale mais." };
  const nomeC = infoClube(pacote, o.clubeId)?.nome ?? o.clubeId, tirar = () => { s.ofertasEmp = s.ofertasEmp!.filter((x) => x !== o); };
  if (r === "recusar") { tirar(); return { ok: true, msg: `Você recusou o empréstimo de ${a.nome} ao ${nomeC}.` }; }
  if (r === "contra" && q) {
    o.rodadas++;
    const pede = { salarioPct: clamp(Math.round(q.salarioPct / 10) * 10, 0, 100), taxa: k1000(q.taxa) };
    const passa = pede.salarioPct > o.max.salarioPct || pede.taxa > o.max.taxa * 1.05 || (q.titular && !o.max.titular);
    if (!passa) { o.salarioPct = pede.salarioPct; o.taxa = pede.taxa; if (q.semOpcao) o.opcao = 0; if (q.titular) o.papel = "titular"; return responderEmp(pacote, s, id, "aceitar"); }
    if (o.rodadas >= 2) { tirar(); return { ok: false, msg: `O ${nomeC} desistiu do empréstimo.` }; }
    o.salarioPct = o.max.salarioPct; o.taxa = o.max.taxa; if (q.semOpcao && o.opcao) o.taxa = k1000(o.taxa * 0.8);
    if (q.semOpcao) o.opcao = 0;
    return { ok: true, msg: `O ${nomeC} chegou ao limite: paga ${o.salarioPct}% do salário e ${valorBrl(o.taxa)} de taxa${o.max.titular ? "" : ", mas não garante que ele seja titular"}.` };
  }
  if (s.elenco.length <= 18) return { ok: false, msg: "O elenco ficaria curto demais (mínimo de 18)." };
  tirar();
  s.clube.saldo += o.taxa; if (o.taxa) _int.receber(s, "Empréstimos", o.taxa);
  _int.tirarDoElenco(s, a.id); s.aEmprestimo = (s.aEmprestimo ?? []).filter((x) => x !== a.id); s.aVenda = (s.aVenda ?? []).filter((x) => x !== a.id);
  (s.emprestados ??= []).push({ atleta: a, clubeId: o.clubeId, ate: s.temporada, papel: o.papel, salarioPct: o.salarioPct, opcao: o.opcao, jogos: 0, gols: 0 });
  _int.invalidar(); prepararMundo(pacote, s);
  _int.noticia(s, "elenco", `${a.nome} vai emprestado ao ${nomeC} até o fim da temporada (${o.salarioPct}% do salário pago por lá${o.opcao ? `, opção de compra de ${valorBrl(o.opcao)}` : ""}).`);
  return { ok: true, msg: `${a.nome} emprestado ao ${nomeC}.` };
}
/** A semana dos emprestados: jogam (mais se titular), evoluem e você paga a parte do salário que ficou com você. */
export function semanaEmprestados(pacote: PacoteDados, s: SaveTecnico) {
  for (const e of s.emprestados ?? []) {
    const rng = _int.rngT(s, "emp", e.atleta.id), joga = rng.chance(e.papel === "titular" ? 0.85 : e.papel === "rotacao" ? 0.55 : 0.25);
    if (joga && s.semana >= 2) { e.jogos++; if (rng.chance(({ ATA: 0.35, PON: 0.22, MEI: 0.16, VOL: 0.06, LAT: 0.04, ZAG: 0.04, GOL: 0 } as Record<PosT, number>)[e.atleta.pos])) e.gols++; }
  }
}
/** Mês: a sua parte do salário dos emprestados. */
export const salarioEmprestados = (s: SaveTecnico) => (s.emprestados ?? []).reduce((x, e) => x + Math.round(e.atleta.salario * (1 - e.salarioPct / 100)), 0);
/** Virada de temporada: emprestados voltam (ou são comprados), contas vencem, bônus e revendas. */
export function viradaNegocios(pacote: PacoteDados, s: SaveTecnico, tAntes: number, evoluir: (a: Atleta, semanas: number, titular: boolean) => void) {
  const w = mundo(pacote), nota = (t: string) => _int.noticia(s, "elenco", t);
  // emprestados seus voltam (ou o clube exerce a opção)
  for (const e of s.emprestados ?? []) {
    if (e.ate > tAntes) continue;
    evoluir(e.atleta, 40, e.papel === "titular" && e.jogos >= 20);
    const nomeC = w.info[e.clubeId]?.nome ?? e.clubeId, foiBem = e.jogos >= 22;
    if (e.opcao && foiBem && new RNG(`${s.semente}|opc|${e.atleta.id}|${tAntes}`).chance(0.55)) {
      s.clube.saldo += Math.round(e.opcao * 0.82); _int.receber(s, "Vendas", e.opcao); _int.gastar(s, "Agentes e impostos de venda", Math.round(e.opcao * 0.18));
      (s.transferencias ??= []).unshift({ t: tAntes, nome: e.atleta.nome, de: s.clubeId, para: e.clubeId, valor: e.opcao, venda: true });
      nota(`O ${nomeC} exerceu a opção de compra: ${e.atleta.nome} fica lá por ${valorBrl(e.opcao)}.`);
    } else {
      e.atleta.moral = clamp(e.atleta.moral + (foiBem ? 6 : -2), 0, 100); e.atleta.condicao = 90;
      s.elenco.push(e.atleta);
      nota(`${e.atleta.nome} volta do empréstimo ao ${nomeC}: ${e.jogos} jogos e ${e.gols} gols por lá.`);
    }
  }
  s.emprestados = (s.emprestados ?? []).filter((e) => e.ate > tAntes);
  // quem você pegou emprestado: obrigação vira compra; opção vira decisão sua na pré-temporada
  for (const a of [...s.elenco]) {
    const ed = a.emprestadoDe;
    if (!ed || ed.ate > tAntes) continue;
    const nomeC = w.info[ed.clubeId]?.nome ?? ed.clubeId;
    if (ed.obrigacao && ed.opcao) {
      s.clube.saldo -= ed.opcao; _int.gastar(s, "Contratações", ed.opcao); a.emprestadoDe = undefined; a.contratoAte = tAntes + 3; a.salario = Math.round(a.salario * 100 / Math.max(1, ed.salarioPct));
      (s.transferencias ??= []).unshift({ t: tAntes, nome: a.nome, de: ed.clubeId, para: s.clubeId, valor: ed.opcao, venda: false });
      nota(`Obrigação de compra: ${a.nome} é comprado do ${nomeC} por ${valorBrl(ed.opcao)}.`);
    } else if (ed.opcao) { (s.opcoesCompra ??= []).push({ atletaId: a.id, clubeId: ed.clubeId, valor: ed.opcao, ate: tAntes + 1 }); nota(`Acabou o empréstimo de ${a.nome}: você tem até o fim da pré-temporada para exercer a opção de compra (${valorBrl(ed.opcao)}). Veja em Elenco → Propostas.`); ed.ate = tAntes + 1; }
    else { _int.tirarDoElenco(s, a.id); nota(`${a.nome} volta ao ${nomeC} ao fim do empréstimo.`); }
  }
  // contas da temporada nova: parcelas e bônus (o bônus só vale se a meta foi batida)
  const t = tAntes + 1;
  for (const c of (s.contas ?? []).filter((x) => x.t === t)) {
    if (c.cond) {
      const reg = (s.temporadasElenco ?? []).find((x) => x.t === tAntes && x.nome === c.cond!.nome), el = s.elenco.find((x) => x.nome === c.cond!.nome);
      const jogos = reg ? reg.j : el?.jogos ?? 0;
      const bateu = c.cond.jogos > 0 ? jogos >= c.cond.jogos : new RNG(`${s.semente}|bonusv|${c.texto}`).chance(0.55);
      if (!bateu) { nota(`${c.texto}: a meta não foi batida, nada a ${c.tipo === "pagar" ? "pagar" : "receber"}.`); continue; }
    }
    if (c.tipo === "pagar") { s.clube.saldo -= c.valor; _int.gastar(s, "Parcelas e bônus de compras", c.valor); }
    else { s.clube.saldo += c.valor; _int.receber(s, "Parcelas e bônus de vendas", c.valor); }
    nota(`${c.texto}: ${valorBrl(c.valor)}.`);
  }
  s.contas = (s.contas ?? []).filter((x) => x.t > t);
  // revenda a seu favor: se o jogador mudou de clube no mundo, você recebe a sua parte
  for (const r of s.revendas ?? []) {
    const onde = Object.values(w.clube).find((c) => c.elenco.some((j) => j.nome === r.nome));
    if (onde && onde.id !== r.clubeId) {
      const j = onde.elenco.find((x) => x.nome === r.nome)!, v = k1000(_int.valorNpc(j, infoLiga(onde.ligaId).fLiga) * r.pct / 100);
      s.clube.saldo += v; _int.receber(s, "Revendas", v); nota(`${r.nome} foi vendido pelo ${w.info[r.clubeId]?.nome} ao ${w.info[onde.id]?.nome}: você recebe ${r.pct}% (${valorBrl(v)}).`);
      r.pct = 0;
    }
  }
  s.revendas = (s.revendas ?? []).filter((r) => r.pct > 0 && tAntes - r.t < 6);
}
/** Exercer (ou não) a opção de compra de um emprestado. */
export function decidirOpcao(pacote: PacoteDados, s: SaveTecnico, atletaId: string, comprar: boolean): { ok: boolean; msg: string } {
  const o = (s.opcoesCompra ?? []).find((x) => x.atletaId === atletaId), a = s.elenco.find((x) => x.id === atletaId);
  if (!o || !a) return { ok: false, msg: "Essa opção não vale mais." };
  const nomeC = infoClube(pacote, o.clubeId)?.nome ?? o.clubeId;
  s.opcoesCompra = s.opcoesCompra!.filter((x) => x !== o);
  if (!comprar) { _int.tirarDoElenco(s, a.id); _int.invalidar(); prepararMundo(pacote, s); return { ok: true, msg: `${a.nome} volta ao ${nomeC}.` }; }
  if (s.clube.saldo < o.valor) { s.opcoesCompra.push(o); return { ok: false, msg: "O caixa não cobre a opção de compra." }; }
  const ed = a.emprestadoDe;
  s.clube.saldo -= o.valor; _int.gastar(s, "Contratações", o.valor);
  a.salario = ed ? Math.round(a.salario * 100 / Math.max(1, ed.salarioPct)) : a.salario; a.emprestadoDe = undefined; a.contratoAte = s.temporada + 3;
  (s.transferencias ??= []).unshift({ t: s.temporada, nome: a.nome, de: o.clubeId, para: s.clubeId, valor: o.valor, venda: false });
  _int.noticia(s, "elenco", `Você exerceu a opção: ${a.nome} é comprado do ${nomeC} por ${valorBrl(o.valor)}.`);
  return { ok: true, msg: `${a.nome} agora é seu, contrato até ${ANO_INICIAL_T + a.contratoAte}.` };
}
/** Pré-temporada acabou: opção não exercida, o jogador volta. */
export function vencerOpcoes(pacote: PacoteDados, s: SaveTecnico) {
  if (janelaT(s).aberta) return;
  for (const o of [...(s.opcoesCompra ?? [])]) if (o.ate <= s.temporada) decidirOpcao(pacote, s, o.atletaId, false);
}
