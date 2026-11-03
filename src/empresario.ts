// Protótipo do evento "Um empresário na porta" (base). A escolha do primeiro passo abre a mesa da cozinha (2A)
// ou a conversa na porta (2B) na agenda; cada caminho deixa uma marca no save, e a marca decide a consequência,
// que chega como painel na Semana com o botão Ver ficha. O personagem tem nome e ficha: Sérgio Lemos.
import type { Ocasiao } from "./agenda.js";

export type MarcaEmpresario = "revisado" | "transparente" | "cauteloso" | "adiantamento" | "pai" | "semana";
export type ConsequenciaEmpresario = "positiva" | "negativa" | "neutra" | "tardia";

export interface EstadoEmpresario {
  marca?: MarcaEmpresario;
  recusou?: boolean;
  /** consequência agendada: aparece quando a semana chega em `quando` (a tardia espera a fama de estrela) */
  agendada?: { cons: ConsequenciaEmpresario; quando: number };
  /** painel aberto na Semana, até o jogador tocar em Ok */
  painel?: ConsequenciaEmpresario;
  feitas: ConsequenciaEmpresario[];
  /** linhas da ficha de Sérgio Lemos, na ordem em que aconteceram */
  ficha: string[];
}
export const novoEmpresario = (): EstadoEmpresario => ({ feitas: [], ficha: [] });

export const EMPRESARIO = {
  nome: "Sérgio Lemos",
  bio: "Empresário da Mantovani Sports. Relógio dourado, fala rápido e promete clube na Europa em dois anos.",
};

export const CONSEQUENCIAS: Record<ConsequenciaEmpresario, { titulo: string; texto: string; ficha: string }> = {
  positiva: {
    titulo: "Um empresário de verdade quer falar com você",
    texto: "Sérgio Lemos ligou de novo, dessa vez de um número com nome de agência. Disse que viu seu primeiro gol na base e que a proposta agora não tem adiantamento: comissão de 5% e clube da segunda divisão para começar.",
    ficha: "Voltou com proposta limpa: comissão de 5%.",
  },
  negativa: {
    titulo: "O clube da Europa não existe",
    texto: "A família descobriu que a Mantovani Sports não tem registro na federação. Sérgio não atende mais. Os dois mil do adiantamento viraram uma cobrança com juros, e seu pai ficou em silêncio no jantar.",
    ficha: "Sumiu depois do adiantamento. Sem registro na federação.",
  },
  neutra: {
    titulo: "Seu pai encontrou o homem certo",
    texto: "Seu pai ligou para um primo que trabalha com contratos esportivos. Não contou a história toda, só disse que quem se apresenta de relógio dourado precisa de um documento. Três semanas depois chegou uma carta de Sérgio: a proposta foi retirada. Seu pai não fala sobre isso.",
    ficha: "Proposta retirada por carta. Motivo não informado.",
  },
  tardia: {
    titulo: "O empresário que você recusou quer falar",
    texto: "Sérgio Lemos apareceu numa entrevista dizendo que \"o garoto da base foi o que mais me surpreendeu\". Você pode responder.",
    ficha: "Recusado na base. Reapareceu na fase estrela, na imprensa.",
  },
};

/** Primeiro passo: a abordagem na porta de casa. */
export function passoEmpresario(e: EstadoEmpresario, escolha: "ouvir" | "sozinho" | "recusar", quando: string) {
  e.ficha.push(`Primeiro contato: ${quando}, na porta de casa.`);
  if (escolha === "recusar") e.recusou = true;
}

/** Marca do segundo passo (2A ou 2B). Cada marca agenda a consequência dela. */
export function marcaEmpresario(e: EstadoEmpresario, marca: MarcaEmpresario, ab: number) {
  e.marca = marca;
  const cons: ConsequenciaEmpresario = marca === "revisado" || marca === "transparente" || marca === "cauteloso" ? "positiva"
    : marca === "adiantamento" ? "negativa" : "neutra";
  e.agendada = { cons, quando: ab + (cons === "positiva" ? 4 : 3) };
  const linha: Record<MarcaEmpresario, string> = {
    revisado: "Contrato levado a um parente com experiência em direito.",
    transparente: "Recusou o adiantamento e contou tudo à família.",
    cauteloso: "Pediu recibo e prazo por escrito.",
    adiantamento: "Aceitou o adiantamento de R$ 2.000 e prometeu assinar na semana.",
    pai: "A família decidiu sozinha, sem assinar nada.",
    semana: "Pediu uma semana para pensar e não assinou nada.",
  };
  e.ficha.push(linha[marca]);
}

/** Chamado a cada semana. Devolve a consequência que abriu um painel agora, se houver. */
export function semanaEmpresario(e: EstadoEmpresario, ab: number, fama: number): ConsequenciaEmpresario | undefined {
  if (!e.agendada || e.painel) return undefined;
  const a = e.agendada;
  const pronta = a.cons === "tardia" ? fama >= 65 : ab >= a.quando;
  if (!pronta) return undefined;
  e.painel = a.cons;
  e.feitas.push(a.cons);
  e.ficha.push(CONSEQUENCIAS[a.cons].ficha);
  e.agendada = undefined;
  return a.cons;
}

/** Recusa no primeiro passo: a consequência tardia fica esperando a fama de estrela. */
export function agendarRecusa(e: EstadoEmpresario) {
  if (!e.recusou || e.feitas.includes("tardia")) return;
  e.agendada = { cons: "tardia", quando: Number.MAX_SAFE_INTEGER };
}

/** Segundo passo, mesa da cozinha: contrato de dez páginas. Primeira opção = o que acontece se o jogador não responde. */
export const PASSO_2A: Omit<Ocasiao, "uid" | "expira"> & { prazo?: number } = {
  origem: "contrato", chave: "empresario-2a", titulo: "A mesa da cozinha",
  texto: "O contrato tem dez páginas. Seu pai põe os óculos e lê a primeira linha em voz alta. Seu irmão pergunta se dá para ver o clube no mapa. A pergunta que fica no ar: quem vai ganhar com isso?",
  prazo: 2,
  opcoes: [
    { id: "semana", rotulo: "Pedir uma semana, sem assinar nada", texto: "Ele aceitou esperar, com cara de quem não gostou.", ef: { gatilho: "empresario:marca:semana" } },
    { id: "revisado", rotulo: "Pedir para um parente que trabalha com direito dar uma olhada", texto: "Um primo advogado leu tudo na mesma noite e encontrou três cláusulas estranhas.", ef: { moral: 1, gatilho: "empresario:marca:revisado" } },
    { id: "pai", rotulo: "Deixar seu pai decidir sozinho, ele conhece gente", texto: "Seu pai disse que resolve. Ninguém da casa perguntou como.", ef: { moral: -1, gatilho: "empresario:marca:pai" } },
  ],
};

/** Segundo passo, conversa na porta: o adiantamento. Primeira opção = a mais prudente, se o jogador não responde. */
export const PASSO_2B: Omit<Ocasiao, "uid" | "expira"> & { prazo?: number } = {
  origem: "contrato", chave: "empresario-2b", titulo: "Uma oferta na porta",
  texto: "Ele fala baixo e rápido. Diz que o contrato sai \"amanhã\", que há uma vaga para quem assina já, e oferece um adiantamento de dois mil em dinheiro, \"para as despesas da mudança\". Ele não pede que você esconda nada, e isso faz parecer normal.",
  prazo: 2,
  opcoes: [
    { id: "cauteloso", rotulo: "Pedir recibo e um prazo por escrito", texto: "Ele pareceu contrariado, mas anotou o prazo no próprio celular.", ef: { moral: 1, gatilho: "empresario:marca:cauteloso" } },
    { id: "transparente", rotulo: "Recusar e contar para seus pais na mesma noite", texto: "Seus pais ficaram sabendo antes do jantar. Ninguém comemorou, mas ninguém brigou.", ef: { moral: 2, gatilho: "empresario:marca:transparente" } },
    { id: "adiantamento", rotulo: "Aceitar o dinheiro e prometer que assina na semana", texto: "Os dois mil entraram na conta. Ele disse que o contrato chega na segunda.", ef: { dinheiro: 2000, gatilho: "empresario:marca:adiantamento" } },
  ],
};
