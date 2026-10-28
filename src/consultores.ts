// Consultores: especialistas que o jogador contrata além do agente principal. A negociação é uma conversa
// (proposta, contraproposta, aceitar, recusar), com preço de reserva oculto e piso. Ver claude/conceito-mercado-agentes.md.
// Fase 1: Negociador, Networking e Jurídico; modelos percentual e fixo; teto de 15% do salário para a equipe toda.
import { RNG } from "./rng.js";
import { comissaoDo, type TipoAgente } from "./agentes-banco.js";

export type Especialidade = "negociador" | "networking" | "juridico";
/** Especialidades disponíveis nesta fase. As outras (imagem, preparador, mental, imprensa, financeiro, exterior) entram depois. */
export const ESPECIALIDADES: Especialidade[] = ["negociador", "networking", "juridico"];
export const NOME_ESP: Record<Especialidade, string> = { negociador: "Negociador", networking: "Networking", juridico: "Jurídico" };
export const NOME_DEGRAU = ["Iniciante", "Júnior", "Sênior", "Estrela", "Lendário"];
/** Valor de tabela por mês, em fração do salário, por degrau. */
const TAXA = [0.01, 0.02, 0.04, 0.06, 0.08];
/** Pedido de abertura: 20% acima da tabela. */
const ABERTURA = 1.2;
export const TETO_SALARIO = 0.15;
/** Abaixo desta fração da tabela, o consultor nem conversa. */
export const PISO = 0.4;
/** Desconto (fração da tabela) a partir do qual o consultor pode largar o contrato e a reputação de barganha sobe. */
const DESCONTO_FORTE = 0.4;
export const MAX_RODADAS = 4;
export const DURACAO_SEMANAS = 52;

/** Oferta: "percentual" é fração do salário; "fixo" é reais por mês. */
export interface Oferta { modelo: "percentual" | "fixo"; valor: number }
export interface Consultor { esp: Especialidade; degrau: number; oferta: Oferta; desconto: number; desde: number; ate: number }
export interface Negociacao { esp: Especialidade; degrau: number; rodada: number; pedido: Oferta; reserva: number; tabela: number }
export interface DadosConsultores { lista: Consultor[]; negociacao?: Negociacao; reputacao: number }
export type RespostaConsultor = { tipo: "aceitar" } | { tipo: "recusar" } | { tipo: "contrapor"; oferta: Oferta };
export interface ResultadoConsultor { status: "fechou" | "recusou" | "continua" | "desistiu" | "erro"; msg: string }

export const novosConsultores = (): DadosConsultores => ({ lista: [], reputacao: 0 });
export const degrauDaFama = (fama: number) => fama >= 75 ? 4 : fama >= 55 ? 3 : fama >= 35 ? 2 : fama >= 20 ? 1 : 0;
/** Vagas: 2 no começo; 3ª com fama 25, 4ª com fama 45, 5ª com fama 70 (ultra famoso). */
export const vagas = (fama: number) => 2 + (fama >= 25 ? 1 : 0) + (fama >= 45 ? 1 : 0) + (fama >= 70 ? 1 : 0);
export const tabelaMes = (degrau: number, salario: number) => Math.round(TAXA[degrau] * salario);
export const valorOferta = (o: Oferta, salario: number) => Math.round(o.modelo === "percentual" ? o.valor * salario : o.valor);
export const descontoDe = (o: Oferta, tabela: number, salario: number) => Math.min(1, Math.max(0, 1 - valorOferta(o, salario) / tabela));
/** Eficácia do consultor: sobe com o degrau e cai com o desconto (quem paga pouco se dedica menos). */
export const eficacia = (degrau: number, desconto: number) => (0.5 + 0.1 * degrau) * (1 - 0.5 * desconto);
export const custoConsultores = (lista: Consultor[], salario: number) => lista.reduce((a, c) => a + valorOferta(c.oferta, salario), 0);
/** Cabe no teto da equipe toda (consultores + comissão do agente principal sobre o salário)? */
export const cabeNoTeto = (lista: Consultor[], nova: Oferta, salario: number, agente: TipoAgente) =>
  comissaoDo(agente) * salario + custoConsultores(lista, salario) + valorOferta(nova, salario) <= TETO_SALARIO * salario + 0.5;
/** Efeito de cada especialidade (soma das eficácias). Usado pela habilidade de negociação. */
export function efeitoConsultores(d: DadosConsultores | undefined): Record<Especialidade, number> {
  const r: Record<Especialidade, number> = { negociador: 0, networking: 0, juridico: 0 };
  for (const c of d?.lista ?? []) r[c.esp] += eficacia(c.degrau, c.desconto);
  return r;
}

const reais = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
export const pedidoTexto = (o: Oferta) => o.modelo === "percentual" ? `${(o.valor * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% do salário` : `${reais(o.valor)} por mês`;

/** Abre a conversa com um consultor da especialidade. A reserva é sorteada e fica oculta. */
export function iniciarNegociacao(d: DadosConsultores, esp: Especialidade, fama: number, salario: number, rng: RNG): { ok: boolean; msg: string } {
  if (d.negociacao) return { ok: false, msg: "Você já tem uma conversa aberta." };
  if (d.lista.some((c) => c.esp === esp)) return { ok: false, msg: `Você já tem um ${NOME_ESP[esp]}.` };
  if (d.lista.length >= vagas(fama)) return { ok: false, msg: "Não há vaga livre na equipe. Suba de fama para ganhar mais." };
  const degrau = degrauDaFama(fama), tabela = tabelaMes(degrau, salario);
  const frac = 0.5 + 0.3 * rng.next() + Math.min(0.1, fama / 1000) + Math.min(0.2, d.reputacao * 0.02);
  d.negociacao = { esp, degrau, rodada: 1, pedido: { modelo: "percentual", valor: Math.round(TAXA[degrau] * ABERTURA * 10000) / 10000 }, reserva: tabela * frac, tabela };
  return { ok: true, msg: `${NOME_ESP[esp]} (${NOME_DEGRAU[degrau]}) pediu para conversar.` };
}

/** Resposta do jogador na conversa: aceita o pedido do consultor, recusa, ou contrapropõe. */
export function responder(d: DadosConsultores, resp: RespostaConsultor, salario: number, agente: TipoAgente, semana: number): ResultadoConsultor {
  const n = d.negociacao;
  if (!n) return { status: "erro", msg: "Não há conversa aberta." };
  const encerrar = (status: ResultadoConsultor["status"], msg: string): ResultadoConsultor => { delete d.negociacao; return { status, msg }; };
  if (resp.tipo === "recusar") return encerrar("recusou", `${NOME_ESP[n.esp]} foi embora. Sem acordo.`);
  const oferta = resp.tipo === "aceitar" ? n.pedido : resp.oferta;
  const v = valorOferta(oferta, salario);
  if (resp.tipo === "contrapor" && v < PISO * n.tabela) {
    d.reputacao = Math.min(10, d.reputacao + 1);
    return encerrar("desistiu", "Esse valor nem dá para conversar. Até mais.");
  }
  if (!cabeNoTeto(d.lista, oferta, salario, agente)) {
    return { status: "continua", msg: "Sua equipe já está no limite de 15% do salário. Para caber, a proposta precisa ser menor." };
  }
  if (resp.tipo === "aceitar" || v >= n.reserva) {
    const desconto = descontoDe(oferta, n.tabela, salario);
    d.lista.push({ esp: n.esp, degrau: n.degrau, oferta, desconto, desde: semana, ate: semana + DURACAO_SEMANAS });
    if (desconto > DESCONTO_FORTE) d.reputacao = Math.min(10, d.reputacao + 1);
    delete d.negociacao;
    return { status: "fechou", msg: `${NOME_ESP[n.esp]} aceitou: ${pedidoTexto(oferta)}.` };
  }
  n.rodada++;
  if (n.rodada > MAX_RODADAS) {
    d.reputacao = Math.min(10, d.reputacao + 1);
    return encerrar("desistiu", "Não consigo fechar nesse nível. Tenho outros clientes. Até mais.");
  }
  const alvo = (v + valorOferta(n.pedido, salario)) / 2;
  n.pedido = oferta.modelo === "percentual" ? { modelo: "percentual", valor: Math.round((alvo / salario) * 10000) / 10000 } : { modelo: "fixo", valor: Math.round(alvo) };
  const perto = v >= 0.8 * n.reserva;
  return { status: "continua", msg: `${perto ? "Estamos perto." : "Ainda está longe do que eu aceito."} Meu pedido agora é ${pedidoTexto(n.pedido)}.` };
}

/** Passa a semana: contrato vence (é preciso negociar de novo) e consultor com desconto forte pode largar. */
export function tickConsultores(d: DadosConsultores, semana: number, rng: RNG): string[] {
  const notas: string[] = [];
  d.lista = d.lista.filter((c) => {
    if (semana >= c.ate) { notas.push(`O contrato do ${NOME_ESP[c.esp]} terminou. Para renovar, abra uma nova conversa.`); return false; }
    if (c.desconto > DESCONTO_FORTE && rng.chance(0.01)) { notas.push(`O ${NOME_ESP[c.esp]} largou o contrato: o valor pago estava baixo demais para ele.`); return false; }
    return true;
  });
  return notas;
}
