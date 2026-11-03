// Dados das cadeias de evento (texto, escolhas, marcas e consequências). O motor está em cadeias.ts.
import type { Cadeia } from "./cadeias.js";

export const CADEIAS: Record<string, Cadeia> = {
  "base-empresario": {
    id: "base-empresario",
    personagem: {
      nome: "Sérgio Lemos",
      bio: "Empresário da Mantovani Sports. Relógio dourado, fala rápido e promete clube na Europa em dois anos.",
    },
    fichaInicio: "Primeiro contato: {quando}, na porta de casa.",
    inicio: {
      titulo: "Um empresário na porta",
      texto: "Um homem de camisa polo e relógio dourado para na frente da sua casa. Diz que é empresário, que tem um contato num clube da Europa, e que \"em dois anos você está lá\". Ele pede dez minutos com seus pais.",
      origem: "contrato",
      opcoes: [
        { id: "ouvir", rotulo: "Chamar seus pais e ouvir junto", resultado: "Seus pais ouviram tudo na mesa da cozinha. Ele deixou um contrato de dez páginas.", proximo: "2a", efeitos: { moral: 2, fama: 1 } },
        { id: "sozinho", rotulo: "Conversar com ele sozinho, na porta mesmo", resultado: "Você conversou com ele na porta. Ele falou baixo e rápido, e não pediu nada escondido.", proximo: "2b", efeitos: { fama: 1 } },
        { id: "recusar", rotulo: "Agradecer e dizer que está focado no clube", resultado: "Você agradeceu e disse que está focado no clube. Ele entregou um cartão e foi embora.", marca: "recusou", efeitos: { moral: 1 } },
      ],
    },
    passos: {
      "2a": {
        titulo: "A mesa da cozinha",
        texto: "O contrato tem dez páginas. Seu pai põe os óculos e lê a primeira linha em voz alta. Seu irmão pergunta se dá para ver o clube no mapa. A pergunta que fica no ar: quem vai ganhar com isso?",
        origem: "contrato",
        prazo: 2,
        opcoes: [
          { id: "semana", rotulo: "Pedir uma semana, sem assinar nada", resultado: "Ele aceitou esperar, com cara de quem não gostou.", marca: "semana", ef: {} },
          { id: "revisado", rotulo: "Pedir para um parente que trabalha com direito dar uma olhada", resultado: "Um primo advogado leu tudo na mesma noite e encontrou três cláusulas estranhas.", marca: "revisado", ef: { moral: 1 } },
          { id: "pai", rotulo: "Deixar seu pai decidir sozinho, ele conhece gente", resultado: "Seu pai disse que resolve. Ninguém da casa perguntou como.", marca: "pai", ef: { moral: -1 } },
        ],
      },
      "2b": {
        titulo: "Uma oferta na porta",
        texto: "Ele fala baixo e rápido. Diz que o contrato sai \"amanhã\", que há uma vaga para quem assina já, e oferece um adiantamento de dois mil em dinheiro, \"para as despesas da mudança\". Ele não pede que você esconda nada, e isso faz parecer normal.",
        origem: "contrato",
        prazo: 2,
        opcoes: [
          { id: "cauteloso", rotulo: "Pedir recibo e um prazo por escrito", resultado: "Ele pareceu contrariado, mas anotou o prazo no próprio celular.", marca: "cauteloso", ef: { moral: 1 } },
          { id: "transparente", rotulo: "Recusar e contar para seus pais na mesma noite", resultado: "Seus pais ficaram sabendo antes do jantar. Ninguém comemorou, mas ninguém brigou.", marca: "transparente", ef: { moral: 2 } },
          { id: "adiantamento", rotulo: "Aceitar o dinheiro e prometer que assina na semana", resultado: "Os dois mil entraram na conta. Ele disse que o contrato chega na segunda.", marca: "adiantamento", ef: { dinheiro: 2000 } },
        ],
      },
    },
    consequencias: {
      positiva: {
        titulo: "Um empresário de verdade quer falar com você",
        texto: "Sérgio Lemos ligou de novo, dessa vez de um número com nome de agência. Disse que viu seu primeiro gol na base e que a proposta agora não tem adiantamento: comissão de 5% e clube da segunda divisão para começar.",
        ficha: "Voltou com proposta limpa: comissão de 5%.",
        semanas: 4,
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
        quando: "fama65",
      },
    },
    marcas: { revisado: "positiva", transparente: "positiva", cauteloso: "positiva", adiantamento: "negativa", pai: "neutra", semana: "neutra", recusou: "tardia" },
    fichaMarca: {
      revisado: "Contrato levado a um parente com experiência em direito.",
      transparente: "Recusou o adiantamento e contou tudo à família.",
      cauteloso: "Pediu recibo e prazo por escrito.",
      adiantamento: "Aceitou o adiantamento de R$ 2.000 e prometeu assinar na semana.",
      pai: "A família decidiu sozinha, sem assinar nada.",
      semana: "Pediu uma semana para pensar e não assinou nada.",
      recusou: "Recusou a abordagem na porta de casa.",
    },
  },
};
