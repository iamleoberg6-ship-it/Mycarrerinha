// Dados das cadeias de evento (texto, escolhas, marcas e consequências). O motor está em cadeias.ts.
// Cada personagem tem um nome por país do clube: o nome é sorteado no começo do evento e segue até o fim.
// {pessoa} vira o nome do personagem; {quando} vira a semana da ficha.
import type { Cadeia, PessoaCadeia } from "./cadeias.js";

/** Um nome por país, com a mesma bio em todos (a bio é em português, como o resto do jogo). */
const pessoas = (bio: string, nomes: Record<string, string>): Record<string, PessoaCadeia> =>
  Object.fromEntries(Object.entries(nomes).map(([pais, nome]) => [pais, { nome, bio }]));
/** Empresário: a bio leva o nome da agência de cada país. */
const empresarios = (nomes: Record<string, [string, string]>): Record<string, PessoaCadeia> =>
  Object.fromEntries(Object.entries(nomes).map(([pais, [nome, agencia]]) => [pais, { nome, bio: `Empresário da ${agencia}. Relógio dourado, fala rápido e promete clube no exterior em dois anos.` }]));

export const CADEIAS: Record<string, Cadeia> = {
  // ------------------------------------------------------------ base
  "escola-prova": {
    id: "escola-prova", fases: ["base"],
    personagens: pessoas("Professor de matemática da escola do clube. Ensina com a régua na mão e não perdoa atraso.", { BRA: "Dona Vera Quintella", FRA: "Madame Colette Renard", ENG: "Mrs. Patricia Hollis", ESP: "Doña Carmen Ibáñez", ITA: "Professoressa Livia Greco", USA: "Ms. Dana Whitfield" }),
    fichaInicio: "Primeira conversa com {pessoa}: {quando}, no fim da aula.",
    inicio: {
      titulo: "Semana de provas",
      texto: "A escola do clube marcou as provas finais na mesma semana dos treinos. {pessoa} te chama no fim da aula e diz que a média está no limite.",
      origem: "familia",
      opcoes: [
        { id: "estudar", rotulo: "Estudar à noite e faltar à última parte do treino", resultado: "Você virou algumas noites com os cadernos. Cansado, mas com a matéria em dia.", marca: "estudou", efeitos: { moral: 3 } },
        { id: "treino", rotulo: "Priorizar o treino e deixar a prova para depois", resultado: "A prova ficou para depois. No treino, você foi o primeiro a chegar.", marca: "treino", efeitos: { relTecnico: 3, moral: -2 } },
        { id: "cola", rotulo: "Pedir a cola do colega de carteira", resultado: "O papel passou por baixo da carteira. Você nem olhou direito.", marca: "cola", efeitos: { moral: -2 } },
      ],
    },
    passos: {},
    consequencias: {
      bilhete: { titulo: "Um bilhete para o técnico", texto: "{pessoa} escreveu: \"Ele estuda mais do que todo mundo da turma.\" O técnico leu em voz alta na reunião da base.", ficha: "Bilhete de {pessoa} ao técnico: disciplina reconhecida." },
      recuperacao: { titulo: "Reprovado em matemática", texto: "O boletim saiu com a nota vermelha. {pessoa} pediu uma recuperação, que você não pode fazer por causa das viagens.", ficha: "Ficou de recuperação em matemática, sem tempo para fazer." },
      olhar: { titulo: "A cola foi pega", texto: "{pessoa} pegou o colega e você escapou. Não disse nada, mas olhou por tempo demais.", ficha: "Escapou da cola. {pessoa} ficou de olho." },
    },
    marcas: { estudou: "bilhete", treino: "recuperacao", cola: "olhar" },
    fichaMarca: { estudou: "Virou noites estudando para a prova.", treino: "Priorizou o treino e deixou a prova para depois.", cola: "Pediu a cola do colega de carteira." },
  },

  "base-saudade": {
    id: "base-saudade", fases: ["base"],
    personagens: pessoas("Colega de quarto da base, vindo de outra cidade do país.", { BRA: "Kauã Nogueira", FRA: "Théo Lambert", ENG: "Callum Reid", ESP: "Álvaro Ruiz", ITA: "Matteo Rinaldi", USA: "Tyler Brooks" }),
    fichaInicio: "Primeira noite difícil no alojamento: {quando}.",
    inicio: {
      titulo: "Saudade de casa",
      texto: "Terceira noite sem dormir. O quarto tem um cheiro diferente, o silêncio é de outra cidade e o celular já esquentou na mão. {pessoa} dorme como se nada tivesse acontecido.",
      origem: "familia",
      opcoes: [
        { id: "familia", rotulo: "Ligar para sua família e ficar na chamada até tarde", resultado: "A chamada durou até a madrugada. Ninguém desligou primeiro.", marca: "familia", efeitos: { moral: 4 } },
        { id: "sozinho", rotulo: "Ficar quieto no quarto, ouvindo música", resultado: "A música abafou o silêncio, mas não o cheiro estranho do quarto.", marca: "sozinho", efeitos: { moral: -2 } },
        { id: "amigo", rotulo: "Chamar o colega de quarto para conversar no corredor", resultado: "{pessoa} topou na hora. Falaram de casa até o café esfriar.", marca: "amigo", efeitos: { moral: 2 } },
      ],
    },
    passos: {},
    consequencias: {
      visita: { titulo: "Sua família planeja uma visita", texto: "Sua mãe ligou de novo e disse que ia pedir ao clube para visitar no fim de semana.", ficha: "Família planeja visita no fim do mês." },
      treinador: { titulo: "{pessoa} contou ao treinador", texto: "{pessoa} reparou que você andava calado e comentou no lugar errado. O treinador passou a te observar.", ficha: "O treinador sabe que você anda abatido." },
      parceiro: { titulo: "{pessoa} virou parceiro", texto: "{pessoa} passou a te levar para comer no restaurante da esquina nos domingos.", ficha: "{pessoa}, colega de quarto e companhia de todo domingo." },
    },
    marcas: { familia: "visita", sozinho: "treinador", amigo: "parceiro" },
    fichaMarca: { familia: "Ligou para casa e ficou na chamada até tarde.", sozinho: "Ficou quieto no quarto, ouvindo música.", amigo: "Chamou {pessoa} para conversar no corredor." },
  },

  "base-chuteira": {
    id: "base-chuteira", fases: ["base"],
    personagens: pessoas("Roupeiro do clube há mais de vinte anos. Vê a sola de longe.", { BRA: "Seu Bira", FRA: "Gérard Moreau", ENG: "Ron Walsh", ESP: "Paco Vidal", ITA: "Nando Pace", USA: "Earl Dawson" }),
    fichaInicio: "Chuteira furada no treino: {quando}.",
    inicio: {
      titulo: "Chuteira furada",
      texto: "No aquecimento, a sola da chuteira se abre. {pessoa} vê antes de você e balança a cabeça: \"Essa não aguenta mais um treino.\"",
      origem: "vestiario",
      opcoes: [
        { id: "clube", rotulo: "Pedir uma chuteira emprestada ao clube", resultado: "{pessoa} foi ao depósito e voltou com um par emprestado.", marca: "clube", efeitos: { relTecnico: 2 } },
        { id: "comprou", rotulo: "Comprar uma nova com o próprio dinheiro", resultado: "Pé firme no gramado. O mês vai ser de miojo.", marca: "comprou", valor: { chave: "chuteira", sinal: -1 }, efeitos: { moral: 2 } },
        { id: "velha", rotulo: "Jogar com a velha, colada com fita", resultado: "Aguentou duas semanas. No terceiro treino, abriu de novo.", marca: "velha", efeitos: { cansaco: 4 } },
      ],
    },
    passos: {},
    consequencias: {
      par: { titulo: "{pessoa} guardou um par", texto: "No dia seguinte ele apareceu com um par do seu número, usado mas em bom estado. \"Não vai contar para ninguém.\"", ficha: "Ganhou um par de chuteiras de {pessoa}." },
      reserva: { titulo: "Sem reserva até o fim do mês", texto: "A conta de luz chegou no mesmo dia. Você passou duas semanas comendo arroz com ovo.", ficha: "Ficou sem reserva depois da chuteira nova." },
      fita: { titulo: "O olheiro reparou na fita", texto: "Um olheiro de outro clube viu o jogo e comentou: \"O garoto joga bem com uma chuteira ruim.\"", ficha: "Um olheiro comentou sua chuteira." },
    },
    marcas: { clube: "par", comprou: "reserva", velha: "fita" },
    fichaMarca: { clube: "Pediu uma chuteira emprestada ao clube.", comprou: "Comprou chuteira nova com o próprio dinheiro.", velha: "Jogou com a chuteira velha, colada com fita." },
  },

  "base-olheiro": {
    id: "base-olheiro", fases: ["base"],
    personagens: pessoas("Olheiro de um clube da primeira divisão. Anota tudo na arquibancada.", { BRA: "Hugo Brenner", FRA: "Julien Marchal", ENG: "Graham Pryce", ESP: "Javier Ortega", ITA: "Stefano Galli", USA: "Mark Keller" }),
    fichaInicio: "Primeiro contato com o olheiro: {quando}, na arquibancada.",
    inicio: {
      titulo: "Olheiro na arquibancada",
      texto: "Um homem de jaqueta anota alguma coisa na arquibancada durante todo o jogo. No fim, ele desce e se apresenta: {pessoa}, olheiro de um clube da primeira divisão.",
      origem: "contrato",
      opcoes: [
        { id: "ouvir", rotulo: "Ir até ele e ouvir", resultado: "Ele tinha um caderno cheio de anotações com o seu nome.", proximo: "2a", efeitos: { fama: 1 } },
        { id: "ignorou", rotulo: "Acenar e seguir para o vestiário", resultado: "Você acenou e foi tomar banho. Ele anotou mais uma linha.", marca: "ignorou" },
        { id: "tecnico", rotulo: "Pedir para o técnico dar uma olhada no homem", resultado: "O técnico foi até a arquibancada e voltou sem dizer nada.", marca: "tecnico", efeitos: { relTecnico: 2 } },
      ],
    },
    passos: {
      "2a": {
        titulo: "A oferta", origem: "contrato", prazo: 2,
        texto: "{pessoa} diz que viu três jogos seus e quer que você faça um teste num clube grande, em duas semanas. Pede o contato da sua família e do seu empresário, se houver.",
        opcoes: [
          { id: "teste", rotulo: "Dar o contato da família e aceitar o teste", resultado: "A família foi ao telefone naquela noite.", marca: "teste", ef: { moral: 4 } },
          { id: "tecnico", rotulo: "Dizer que precisa falar com o técnico antes", resultado: "O técnico ouviu tudo e disse que ia pensar.", marca: "tecnico", ef: { relTecnico: 2 } },
          { id: "recusou", rotulo: "Recusar e pedir mais tempo", resultado: "{pessoa} disse que volta na semana que vem. Não voltou.", marca: "recusou", ef: { moral: -1 } },
        ],
      },
    },
    consequencias: {
      teste: { titulo: "Teste no clube grande", texto: "{pessoa} ligou com a data do teste. Você foi, e o treinador do time principal perguntou seu nome.", ficha: "Fez teste num clube da primeira divisão.", semanas: 2 },
      sumiu: { titulo: "O olheiro sumiu", texto: "{pessoa} não voltou. Depois se soube que ele foi atrás de outro garoto da região.", ficha: "{pessoa} sumiu sem explicação." },
      vaga: { titulo: "Outro garoto ficou com a vaga", texto: "Você recusou, e {pessoa} levou o garoto da lateral. Os jornais locais publicaram o nome dele, não o seu.", ficha: "Perdeu a chance com {pessoa}.", semanas: 2 },
    },
    marcas: { teste: "teste", tecnico: "sumiu", ignorou: "sumiu", recusou: "vaga" },
    fichaMarca: { ignorou: "Não deu atenção ao olheiro na arquibancada.", tecnico: "O técnico foi falar com o olheiro.", teste: "Aceitou o teste num clube grande.", recusou: "Pediu mais tempo ao olheiro." },
  },

  // ------------------------------------------------------------ início de carreira
  "base-empresario": {
    id: "base-empresario", fases: ["base"], unico: true,
    personagens: empresarios({ BRA: ["Sérgio Lemos", "Mantovani Sports"], FRA: ["Laurent Vautrin", "Vautrin Sport Management"], ENG: ["Nigel Ashcombe", "Ashcombe Sports"], ESP: ["Ramón Solís", "Grupo Solís Sport"], ITA: ["Fabio Ravelli", "Ravelli Sport"], USA: ["Gary Lindqvist", "Lindqvist Athlete Group"] }),
    fichaInicio: "Primeiro contato: {quando}, na porta de casa.",
    inicio: {
      titulo: "Um empresário na porta",
      texto: "Um homem de camisa polo e relógio dourado para na frente da sua casa. Diz que se chama {pessoa}, que é empresário, que tem um contato num clube do exterior, e que \"em dois anos você está lá\". Ele pede dez minutos com seus pais.",
      origem: "contrato",
      opcoes: [
        { id: "ouvir", rotulo: "Chamar seus pais e ouvir junto", resultado: "Seus pais ouviram tudo na mesa da cozinha. Ele deixou um contrato de dez páginas.", proximo: "2a", efeitos: { moral: 2, fama: 1 } },
        { id: "sozinho", rotulo: "Conversar com ele sozinho, na porta mesmo", resultado: "Você conversou com ele na porta. Ele falou baixo e rápido, e não pediu nada escondido.", proximo: "2b", efeitos: { fama: 1 } },
        { id: "recusar", rotulo: "Agradecer e dizer que está focado no clube", resultado: "Você agradeceu e disse que está focado no clube. Ele entregou um cartão e foi embora.", marca: "recusou", efeitos: { moral: 1 } },
      ],
    },
    passos: {
      "2a": {
        titulo: "A mesa da cozinha", origem: "contrato", prazo: 2,
        texto: "O contrato tem dez páginas. Seu pai põe os óculos e lê a primeira linha em voz alta. Seu irmão pergunta se dá para ver o clube no mapa. A pergunta que fica no ar: quem vai ganhar com isso?",
        opcoes: [
          { id: "semana", rotulo: "Pedir uma semana, sem assinar nada", resultado: "{pessoa} aceitou esperar, com cara de quem não gostou.", marca: "semana", ef: {} },
          { id: "revisado", rotulo: "Pedir para um parente que trabalha com direito dar uma olhada", resultado: "Um primo advogado leu tudo na mesma noite e encontrou três cláusulas estranhas.", marca: "revisado", ef: { moral: 1 } },
          { id: "pai", rotulo: "Deixar seu pai decidir sozinho, ele conhece gente", resultado: "Seu pai disse que resolve. Ninguém da casa perguntou como.", marca: "pai", ef: { moral: -1 } },
        ],
      },
      "2b": {
        titulo: "Uma oferta na porta", origem: "contrato", prazo: 2,
        texto: "{pessoa} fala baixo e rápido. Diz que o contrato sai \"amanhã\", que há uma vaga para quem assina já, e oferece um adiantamento \"para as despesas da mudança\". Ele não pede que você esconda nada, e isso faz parecer normal.",
        opcoes: [
          { id: "cauteloso", rotulo: "Pedir recibo e um prazo por escrito", resultado: "{pessoa} pareceu contrariado, mas anotou o prazo no próprio celular.", marca: "cauteloso", ef: { moral: 1 } },
          { id: "transparente", rotulo: "Recusar e contar para seus pais na mesma noite", resultado: "Seus pais ficaram sabendo antes do jantar. Ninguém comemorou, mas ninguém brigou.", marca: "transparente", ef: { moral: 2 } },
          { id: "adiantamento", rotulo: "Aceitar o dinheiro e prometer que assina na semana", resultado: "O adiantamento entrou na conta. {pessoa} disse que o contrato chega na segunda.", marca: "adiantamento", valor: { chave: "adiantamento", sinal: 1 } },
        ],
      },
    },
    consequencias: {
      positiva: {
        titulo: "Um empresário de verdade quer falar com você",
        texto: "{pessoa} ligou de novo, dessa vez de um número com nome de agência. Disse que viu seu primeiro gol na base e que a proposta agora não tem adiantamento: comissão de 5% e clube da segunda divisão para começar.",
        ficha: "Voltou com proposta limpa: comissão de 5%.", semanas: 4,
      },
      negativa: {
        titulo: "O clube do exterior não existe",
        texto: "A família descobriu que a agência não tem registro na federação. {pessoa} não atende mais. O adiantamento virou uma cobrança com juros, e seu pai ficou em silêncio no jantar.",
        ficha: "Sumiu depois do adiantamento. Sem registro na federação.",
      },
      neutra: {
        titulo: "Seu pai encontrou o homem certo",
        texto: "Seu pai ligou para um primo que trabalha com contratos esportivos. Não contou a história toda, só disse que quem se apresenta de relógio dourado precisa de um documento. Três semanas depois chegou uma carta de {pessoa}: a proposta foi retirada. Seu pai não fala sobre isso.",
        ficha: "Proposta retirada por carta. Motivo não informado.",
      },
      tardia: {
        titulo: "O empresário que você recusou quer falar",
        texto: "{pessoa} apareceu numa entrevista dizendo que \"o garoto da base foi o que mais me surpreendeu\". Você pode responder.",
        ficha: "Recusado na base. Reapareceu na fase estrela, na imprensa.", quando: "fama65",
      },
    },
    marcas: { revisado: "positiva", transparente: "positiva", cauteloso: "positiva", adiantamento: "negativa", pai: "neutra", semana: "neutra", recusou: "tardia" },
    fichaMarca: {
      revisado: "Contrato levado a um parente com experiência em direito.",
      transparente: "Recusou o adiantamento e contou tudo à família.",
      cauteloso: "Pediu recibo e prazo por escrito.",
      adiantamento: "Aceitou o adiantamento e prometeu assinar na semana.",
      pai: "A família decidiu sozinha, sem assinar nada.",
      semana: "Pediu uma semana para pensar e não assinou nada.",
      recusou: "Recusou a abordagem na porta de casa.",
    },
  },

  "primeiro-carro": {
    id: "primeiro-carro", fases: ["inicio"], unico: true, quando: (c) => c.salario >= 8000,
    personagens: pessoas("Vendedor da concessionária do bairro, conhece a família há anos.", { BRA: "Anselmo Prado", FRA: "Bruno Delorme", ENG: "Derek Holt", ESP: "Rafael Montero", ITA: "Enzo Marchetti", USA: "Rick Halloway" }),
    fichaInicio: "Oferta do carro: {quando}, pelo telefone.",
    inicio: {
      titulo: "O primeiro carro",
      texto: "Com o primeiro salário de profissional, {pessoa} liga e avisa que tem um carro em 48 parcelas, \"só pra você, de amigo\".",
      origem: "convite",
      opcoes: [
        { id: "popular", rotulo: "Um usado simples, pago à vista", resultado: "Pago à vista e sem juros. Seu pai dirigiu o primeiro carro dele assim também.", marca: "popular", efeitos: { sal: -1.5, moral: 4 } },
        { id: "financiar", rotulo: "Financiar o importado", resultado: "Todo mundo no CT reparou. A parcela também vai reparar em você todo mês.", marca: "financiar", efeitos: { sal: -4, moral: 6, fama: 2, pressao: 5 } },
        { id: "nada", rotulo: "Continuar sem carro", resultado: "Você agradeceu, mas segue de aplicativo. O motorista já conhece o seu caminho.", marca: "nada", efeitos: { moral: -1 } },
      ],
    },
    passos: {},
    consequencias: {
      parcela: { titulo: "A parcela apertou", texto: "No terceiro mês, {pessoa} ligou para lembrar que o carro era seu, mas a parcela também. O financiamento começou a pesar nas contas.", ficha: "Financiamento do importado pesa no mês." },
      familia: { titulo: "{pessoa} ligou para a sua família", texto: "Ele quer saber se você está bem, e sabe que sua família vai contar o que escutou.", ficha: "O vendedor falou com a família sobre o carro.", semanas: 4 },
    },
    marcas: { financiar: "parcela", popular: "familia" },
    fichaMarca: { popular: "Comprou um usado à vista.", financiar: "Financiou o carro importado em 48 parcelas.", nada: "Recusou o carro e seguiu de aplicativo." },
  },

  "festa-elenco": {
    id: "festa-elenco", fases: ["inicio", "estabelecido"],
    personagens: pessoas("Veterano do elenco e dono da festa de sábado.", { BRA: "Léo Varella", FRA: "Antoine Vasseur", ENG: "Danny Kerr", ESP: "Nacho Serrano", ITA: "Gianni Bellini", USA: "Chris Larkin" }),
    fichaInicio: "Convite para a festa do elenco: {quando}.",
    inicio: {
      titulo: "Convite para a festa",
      texto: "{pessoa} manda mensagem no grupo do elenco: \"Sábado tem festa na minha casa. Quem não vem paga a rodada no CT.\"",
      origem: "vestiario",
      opcoes: [
        { id: "festa", rotulo: "Ir e ficar até o fim", resultado: "Você ficou até o fim da festa. Voltou de madrugada, feliz e cansado.", marca: "festa", efeitos: { vidaNoturna: 6, moral: 3 } },
        { id: "curta", rotulo: "Ir por uma hora e voltar para casa", resultado: "Ficou uma hora, bebeu uma água e foi embora.", proximo: "2a", efeitos: { moral: 1 } },
        { id: "recusou", rotulo: "Recusar e dizer que vai descansar", resultado: "Você disse que ia descansar. {pessoa} respondeu com um emoji.", marca: "recusou" },
      ],
    },
    passos: {
      "2a": {
        titulo: "A saída", origem: "vestiario", prazo: 2,
        texto: "Você ficou uma hora. Na porta, um colega te puxa para o lado: \"Vai ter gente filmando amanhã. Quer que eu te mande o vídeo antes?\"",
        opcoes: [
          { id: "video", rotulo: "Pedir o vídeo para ver o que ficou", resultado: "Você viu o vídeo antes de todo mundo. Não gostou do que viu.", marca: "video", ef: { fama: 1 } },
          { id: "festa_curta", rotulo: "Dizer que não quer ver nada", resultado: "Você disse que não queria nada daquilo e saiu do grupo de fotos.", marca: "festa_curta", ef: { moral: 1 } },
        ],
      },
    },
    consequencias: {
      grupo: { titulo: "{pessoa} te colocou no grupo", texto: "Ele passou a te chamar para tudo. Na semana seguinte, o elenco sentou junto no café.", ficha: "Entrou no grupo de churrasco do elenco.", semanas: 2 },
      video: { titulo: "A festa virou vídeo", texto: "O vídeo de um colega circulou na internet, e você apareceu no fundo. O técnico mandou o elenco para casa cedo na semana.", ficha: "Apareceu num vídeo de festa; técnico cobrou." },
      notou: { titulo: "O elenco notou", texto: "Ninguém cobrou nada, mas {pessoa} passou a falar de você como \"o que não vai à festa\".", ficha: "Recusou a festa; o elenco notou.", semanas: 2 },
    },
    marcas: { festa: "video", video: "video", festa_curta: "grupo", recusou: "notou" },
    fichaMarca: { festa: "Ficou até o fim da festa do elenco.", recusou: "Recusou o convite para a festa.", video: "Pediu para ver o vídeo da festa.", festa_curta: "Ficou uma hora na festa e recusou o vídeo." },
  },

  "golpe-pix": {
    id: "golpe-pix", fases: ["inicio", "estabelecido"], unico: true, quando: (c) => c.saldo > 20000,
    personagens: pessoas("Consultor de renda extra. Fala muito de aplicativo e promete lucro garantido.", { BRA: "Thiago Duarte", FRA: "Yann Morel", ENG: "Liam Carver", ESP: "Iván Castell", ITA: "Davide Sorrentino", USA: "Brandon Pike" }),
    fichaInicio: "Primeira mensagem de {pessoa}: {quando}.",
    inicio: {
      titulo: "Investimento milagroso",
      texto: "Um conhecido do elenco mostra no celular os lucros de um investimento. {pessoa} chama no WhatsApp: \"Entra agora, o prazo fecha hoje à noite.\"",
      origem: "encrenca",
      opcoes: [
        { id: "pequeno", rotulo: "Investir uma parte pequena, só para testar", resultado: "Transferiu a parte pequena pelo aplicativo. O comprovante chegou em segundos.", proximo: "2a", valor: { chave: "investimentoPequeno", sinal: -1 } },
        { id: "tudo", rotulo: "Investir tudo o que tem no saldo", resultado: "Você transferiu tudo antes de dormir. Pela primeira vez, o saldo parecia pequeno.", marca: "tudo", valor: { chave: "investimentoTotal", sinal: -1 } },
        { id: "nao", rotulo: "Não investir e falar com a família", resultado: "Você mostrou a mensagem para a família. Ninguém precisou falar mais nada.", marca: "nao", efeitos: { moral: 2 } },
      ],
    },
    passos: {
      "2a": {
        titulo: "O primeiro retorno", origem: "encrenca", prazo: 2,
        texto: "Na primeira semana, a conta mostra 8% de lucro. {pessoa} manda um print e pede para você \"indicar um amigo\".",
        opcoes: [
          { id: "pequeno_saiu", rotulo: "Tirar o lucro e guardar", resultado: "Você sacou o lucro e guardou o restante. O saldo ficou mais bonito por uma semana.", marca: "pequeno_saiu", valor: { chave: "lucro", sinal: 1 } },
          { id: "pequeno_ficou", rotulo: "Deixar tudo rendendo", resultado: "Você deixou tudo rendendo. O print do lucro ficou guardado no celular.", marca: "pequeno_ficou" },
        ],
      },
    },
    consequencias: {
      plataforma: { titulo: "A plataforma saiu do ar", texto: "{pessoa} sumiu e o site não abre mais. Você perdeu o que tinha colocado em tudo.", ficha: "Perdeu o investimento total na plataforma de {pessoa}." },
      parte: { titulo: "Só a parte pequena foi embora", texto: "A parte pequena foi junto com o site, mas o prejuízo ficou no limite do que você podia perder.", ficha: "Perdeu a parte pequena do investimento.", semanas: 2 },
      familia: { titulo: "A família reconheceu que você não caiu", texto: "Os colegas que entraram perderam tudo, e sua família soube que você foi o único que avisou.", ficha: "Não entrou no golpe; a família sabe." },
    },
    marcas: { tudo: "plataforma", pequeno_ficou: "parte", nao: "familia" },
    fichaMarca: { tudo: "Investiu tudo na plataforma de {pessoa}.", pequeno: "Testou com uma parte pequena na plataforma.", pequeno_saiu: "Tirou o lucro da plataforma e guardou.", pequeno_ficou: "Deixou a parte pequena rendendo.", nao: "Não investiu e mostrou a mensagem à família." },
  },

  "treino-extra-veterano": {
    id: "treino-extra-veterano", fases: ["inicio"], unico: true,
    personagens: pessoas("Capitão do time principal, veterano de 34 anos que ensina quem vale a pena.", { BRA: "Marcão (Márcio Teixeira)", FRA: "Didier Roux", ENG: "Steve Bannister", ESP: "Tono Ferrer", ITA: "Massimo Ruggeri", USA: "Mike Dorsey" }),
    fichaInicio: "O capitão chamou para o treino extra: {quando}.",
    inicio: {
      titulo: "O capitão te chama",
      texto: "{pessoa} para você no fim do treino: \"Quer ficar meia hora a mais comigo? Só eu e você. Eu já fiz isso com todo mundo que vale alguma coisa.\"",
      origem: "vestiario",
      opcoes: [
        { id: "treino", rotulo: "Aceitar o treino extra", resultado: "Meia hora a mais, só vocês dois, com a bola no pé.", marca: "treino", efeitos: { cansaco: 8, relTecnico: 3 } },
        { id: "recusou", rotulo: "Agradecer e dizer que precisa descansar", resultado: "Você agradeceu e foi tomar banho. {pessoa} deu de ombros.", marca: "recusou", efeitos: { moral: -1 } },
        { id: "tecnico", rotulo: "Perguntar ao técnico se pode fazer", resultado: "O técnico disse que ia pensar, e você saiu sem resposta.", marca: "tecnico", efeitos: { relTecnico: 1 } },
      ],
    },
    passos: {},
    consequencias: {
      mentor: { titulo: "{pessoa} virou seu mentor", texto: "Ele passou a te mandar vídeos de treino e a te apresentar aos veteranos.", ficha: "{pessoa}, capitão, dá dicas no treino." },
      sumiu: { titulo: "O capitão não te chamou mais", texto: "{pessoa} passou a treinar sozinho e não fez mais convites. Você ficou de fora dos treinos com os titulares.", ficha: "Ficou de fora do treino extra do capitão." },
      agradeceu: { titulo: "O técnico agradeceu a pergunta", texto: "Ele disse que ia pensar, e depois marcou o treino com {pessoa} sem te avisar.", ficha: "O técnico acompanha seu treino com o capitão.", semanas: 4 },
    },
    marcas: { treino: "mentor", recusou: "sumiu", tecnico: "agradeceu" },
    fichaMarca: { treino: "Aceitou o treino extra com o capitão.", recusou: "Recusou o treino extra do capitão.", tecnico: "Perguntou ao técnico sobre o treino extra." },
  },
  // ------------------------------------------------------------ estabelecido
  "mae-casa": {
    id: "mae-casa", fases: ["inicio", "estabelecido"], unico: true, quando: (c) => c.salario >= 20000,
    personagens: pessoas("Corretor da imobiliária do bairro. Conhece cada rua e cada prazo de entrada.", { BRA: "Rosana Tavares", FRA: "Sandrine Lacroix", ENG: "Linda Ashby", ESP: "Marisa Lorente", ITA: "Carla Benedetti", USA: "Donna Mercer" }),
    fichaInicio: "Primeiro contato com {pessoa}: {quando}, por telefone.",
    inicio: {
      titulo: "A casa da mãe",
      texto: "Sua mãe mora de aluguel há vinte anos. {pessoa} te liga com uma casa a dois quarteirões dela e diz que a entrada ainda está aberta.",
      origem: "familia",
      opcoes: [
        { id: "comprar", rotulo: "Dar a casa para ela", resultado: "Ela chorou na entrega das chaves. Você também.", marca: "comprar", efeitos: { sal: -6, moral: 12 } },
        { id: "depois", rotulo: "Prometer para o ano que vem", resultado: "Ela disse que não tem pressa. Tem.", marca: "depois", efeitos: { moral: -2 } },
      ],
    },
    passos: {},
    consequencias: {
      chaves: { titulo: "Chaves na mão", texto: "{pessoa} entregou as chaves pessoalmente. Sua mãe chorou na porta.", ficha: "Deu a casa para a mãe. {pessoa} entregou as chaves.", semanas: 2 },
      prazo: { titulo: "A casa que passou", texto: "{pessoa} ligou avisando que a casa foi vendida para outra família.", ficha: "Perdeu a casa da mãe; {pessoa} avisou." },
    },
    marcas: { comprar: "chaves", depois: "prazo" },
    fichaMarca: { comprar: "Comprou a casa da mãe.", depois: "Prometeu comprar a casa da mãe para o ano que vem." },
  },

  "podcast": {
    id: "podcast", fases: ["inicio", "estabelecido"],
    personagens: pessoas("Apresentador do podcast de futebol mais ouvido do país. Não grava nada sem roteiro e sem corte.", { BRA: "Caio Frade", FRA: "Mathieu Sérieux", ENG: "Ollie Stone", ESP: "Dani Cortés", ITA: "Lorenzo Vitale", USA: "Josh Carver" }),
    fichaInicio: "Convite do podcast feito por {pessoa}: {quando}.",
    inicio: {
      titulo: "Convite para podcast",
      texto: "{pessoa} quer você no próximo episódio. \"Três horas de conversa, sem roteiro. Só eu, você e a infância.\"",
      origem: "convite",
      opcoes: [
        { id: "ir", rotulo: "Ir e falar de tudo", resultado: "Três horas de conversa e um corte viral sobre a infância.", marca: "ir", efeitos: { fama: 4, engajamento: 15 } },
        { id: "recusar", rotulo: "Recusar: foco no campo", resultado: "O assessor do clube agradeceu. Ninguém mais lembrou.", marca: "recusar", efeitos: { relTecnico: 2 } },
        { id: "condicao", rotulo: "Aceitar, mas com uma condição: nada sobre o técnico", resultado: "{pessoa} topou a condição e marcou a gravação.", proximo: "2a", efeitos: { fama: 1 } },
      ],
    },
    passos: {
      "2a": {
        titulo: "O corte", origem: "convite", prazo: 2,
        texto: "Duas semanas depois, {pessoa} manda o trecho editado. Uma frase sobre o técnico ficou de fora, mas outra, que você nem lembra de ter dito, foi para o começo do vídeo.",
        opcoes: [
          { id: "corte", rotulo: "Pedir para cortar a frase", resultado: "{pessoa} cortou a frase e mandou a versão nova no mesmo dia.", marca: "corte", ef: { relTecnico: 1 } },
          { id: "deixou", rotulo: "Deixar como está", resultado: "{pessoa} publicou o trecho sem mudar nada.", marca: "deixou", ef: { fama: 3 } },
        ],
      },
    },
    consequencias: {
      corte: { titulo: "Corte aceito", texto: "{pessoa} tirou a frase. O vídeo circulou com a parte boa.", ficha: "Pediu corte no podcast; o trecho saiu.", semanas: 2 },
      viral: { titulo: "Frase que viralizou", texto: "A frase saiu do contexto e virou manchete. O técnico comentou na entrevista coletiva.", ficha: "Frase no podcast virou manchete; técnico comentou." },
      recusa: { titulo: "Recusa elegante", texto: "{pessoa} agradeceu e disse que a porta fica aberta.", ficha: "Recusou o podcast; {pessoa} convidou de novo.", semanas: 2 },
    },
    marcas: { corte: "corte", deixou: "viral", recusar: "recusa", ir: "viral" },
    fichaMarca: { ir: "Foi ao podcast e falou de tudo.", recusar: "Recusou o convite do podcast.", corte: "Pediu corte da frase sobre o técnico.", deixou: "Deixou o trecho do podcast como estava." },
  },

  "tv-programa": {
    id: "tv-programa", fases: ["estabelecido", "estrela"],
    personagens: pessoas("Produtora do programa de auditório de domingo. Escolhe quem dança e quem fica na plateia.", { BRA: "Vanessa Lobo", FRA: "Clémence Aubert", ENG: "Sophie Trent", ESP: "Lucía Barrera", ITA: "Silvia Monti", USA: "Kelly Brandt" }),
    fichaInicio: "Convite da TV feito por {pessoa}: {quando}.",
    inicio: {
      titulo: "Convite da TV",
      texto: "{pessoa} liga e pergunta se você topa entrar no quadro de talentos do programa de domingo. \"Ninguém precisa saber dançar. Basta ter cara de quem topa.\"",
      origem: "convite",
      opcoes: [
        { id: "dancar", rotulo: "Ir e dançar no palco", resultado: "O Brasil inteiro viu você dançando mal. O Brasil inteiro adorou.", marca: "dancar", efeitos: { fama: 5, engajamento: 10, cansaco: 5 } },
        { id: "recusar", rotulo: "Recusar com educação", resultado: "Domingo em casa, com a família.", marca: "recusar", efeitos: { moral: 3 } },
      ],
    },
    passos: {},
    consequencias: {
      viu: { titulo: "O Brasil inteiro viu", texto: "O vídeo da dança virou meme e {pessoa} ligou para marcar outro quadro.", ficha: "Dançou no programa de domingo; {pessoa} quer outro quadro.", semanas: 2 },
      casa: { titulo: "Domingo em casa", texto: "{pessoa} mandou uma mensagem agradecendo e disse que o convite fica para a próxima temporada.", ficha: "Recusou o programa de domingo." },
    },
    marcas: { dancar: "viu", recusar: "casa" },
    fichaMarca: { dancar: "Dançou no programa de domingo.", recusar: "Recusou o convite do programa de domingo." },
  },

  "polemica-rede": {
    id: "polemica-rede", fases: ["estabelecido", "estrela"],
    personagens: pessoas("Torcedor rival que fez a piada e tem muitos seguidores na rede.", { BRA: "Jairo Maciel", FRA: "Bastien Roux", ENG: "Gaz Holloway", ESP: "Pepe Galván", ITA: "Ciro Mancini", USA: "Tanner Rhodes" }),
    fichaInicio: "A piada de {pessoa} começou a circular: {quando}.",
    inicio: {
      titulo: "Comentário que viralizou",
      texto: "{pessoa} postou uma piada sobre sua última partida. A piada tem mais de cem mil curtidas e a torcida rival já respondeu com o emoji de sempre.",
      origem: "rival",
      opcoes: [
        { id: "humor", rotulo: "Responder com humor", resultado: "Sua resposta foi a melhor do dia. Os dois lados riram.", marca: "humor", efeitos: { engajamento: 8, moral: 2 } },
        { id: "ignorar", rotulo: "Ignorar", resultado: "Você não respondeu. A piada perdeu graça sozinha.", marca: "ignorar" },
        { id: "ataque", rotulo: "Responder com ataque", resultado: "A resposta foi dura. Virou print em menos de uma hora.", proximo: "2a", efeitos: { fama: 2, relTecnico: -3 } },
      ],
    },
    passos: {
      "2a": {
        titulo: "A resposta do rival", origem: "rival", prazo: 2,
        texto: "{pessoa} respondeu à sua resposta, e agora a discussão está no jornal da cidade.",
        opcoes: [
          { id: "desculpa", rotulo: "Pedir desculpas em público", resultado: "Você pediu desculpas numa foto com a família.", marca: "desculpa", ef: { moral: -2 } },
          { id: "sair", rotulo: "Sair da rede e deixar esfriar", resultado: "Você saiu da rede por uma semana. A discussão morreu sem você.", marca: "sair", ef: {} },
        ],
      },
    },
    consequencias: {
      humor: { titulo: "Piada de volta", texto: "{pessoa} reconheceu a graça e marcou um amistoso de brincadeira com o seu clube.", ficha: "Respondeu com humor; {pessoa} entrou na brincadeira.", semanas: 2 },
      ignorar: { titulo: "Briga que esfriou", texto: "A discussão morreu sozinha, mas {pessoa} continuou comentando em outros posts.", ficha: "Ignorou a piada; {pessoa} seguiu provocando." },
      desculpa: { titulo: "Desculpa que pegou mal", texto: "{pessoa} tirou um print da desculpa e postou com a frase \"fim da discussão\".", ficha: "Pediu desculpa em público; {pessoa} zombou." },
    },
    marcas: { humor: "humor", ignorar: "ignorar", desculpa: "desculpa", sair: "ignorar" },
    fichaMarca: { humor: "Respondeu a piada com humor.", ignorar: "Ignorou a piada do rival.", desculpa: "Pediu desculpas em público.", sair: "Saiu da rede para a discussão esfriar." },
  },

  "lesao-amigo": {
    id: "lesao-amigo", fases: ["estabelecido", "estrela"],
    personagens: pessoas("Companheiro de elenco que rompeu o ligamento. Fica no quarto do CT sem prazo para voltar.", { BRA: "Rafa Monteiro", FRA: "Lucas Ferrand", ENG: "Jamie Pryor", ESP: "Dani Ruiz", ITA: "Alessio Conti", USA: "Jordan Price" }),
    fichaInicio: "Lesão de {pessoa}: {quando}, no treino de quinta.",
    inicio: {
      titulo: "Companheiro lesionado",
      texto: "{pessoa} rompeu o ligamento no treino de quinta. Ele está sozinho no quarto do CT, e o clube não tem prazo para voltar.",
      origem: "vestiario",
      opcoes: [
        { id: "visita", rotulo: "Visitar todo dia no hospital", resultado: "Você passou a semana toda no quarto dele, levando comida de casa.", marca: "visita", efeitos: { moral: 4, cansaco: 5 } },
        { id: "mensagem", rotulo: "Mandar mensagem e seguir a rotina", resultado: "A mensagem chegou às dez da noite, com emoji de coração.", marca: "mensagem", efeitos: { moral: -1 } },
        { id: "agente", rotulo: "Pedir para o agente cuidar da fisioterapia", resultado: "O agente ligou para a clínica no mesmo dia.", marca: "agente", efeitos: { moral: 2 } },
      ],
    },
    passos: {},
    consequencias: {
      volta: { titulo: "Volta do amigo", texto: "{pessoa} voltou ao treino e lembrou quem apareceu todo dia.", ficha: "Visitou {pessoa} todo dia durante a recuperação.", semanas: 4 },
      silencio: { titulo: "Silêncio no grupo", texto: "{pessoa} percebeu que ninguém perguntou mais.", ficha: "Não acompanhou a recuperação de {pessoa}." },
      fisio: { titulo: "Fisioterapia paga", texto: "O agente conseguiu a clínica, e {pessoa} agradeceu no grupo do elenco.", ficha: "O agente cuidou da fisioterapia de {pessoa}." },
    },
    marcas: { visita: "volta", mensagem: "silencio", agente: "fisio" },
    fichaMarca: { visita: "Visitou o companheiro lesionado.", mensagem: "Mandou mensagem e seguiu a rotina.", agente: "Pediu ao agente para cuidar da fisioterapia do companheiro." },
  },

  "instituto": {
    id: "instituto", fases: ["estabelecido", "estrela"], unico: true,
    personagens: pessoas("Ex-treinador do campinho onde você começou. Treinou você quando era criança.", { BRA: "Seu Nelson", FRA: "Jacques Fontaine", ENG: "Barry Nolan", ESP: "Don Manuel Ortiz", ITA: "Franco Basile", USA: "Ray Dillard" }),
    fichaInicio: "Pedido de {pessoa} sobre o campinho: {quando}.",
    inicio: {
      titulo: "Projeto social",
      texto: "O campinho onde você começou está abandonado. {pessoa}, que treinou você quando criança, pede que você ajude a reformar o espaço.",
      origem: "cidade",
      opcoes: [
        { id: "projeto", rotulo: "Montar um projeto no seu nome", resultado: "Você marcou a primeira reunião com os pais das crianças.", marca: "projeto", efeitos: { fama: 3, moral: 3 } },
        { id: "doacao", rotulo: "Doar uma parte do salário", resultado: "O dinheiro foi para as traves e a rede. {pessoa} chorou no telefone.", marca: "doacao", efeitos: { sal: -1 } },
        { id: "clube", rotulo: "Pedir ajuda ao clube", resultado: "O clube aceitou avaliar o pedido na reunião da diretoria.", marca: "clube", efeitos: { relTecnico: 2 } },
      ],
    },
    passos: {},
    consequencias: {
      reforma: { titulo: "Campinho reformado", texto: "{pessoa} enviou fotos da inauguração. As crianças usam as traves novas.", ficha: "Projeto no campinho de {pessoa} saiu do papel.", semanas: 4 },
      abandono: { titulo: "Ninguém cuidou", texto: "O projeto parou no segundo mês, e {pessoa} ficou com a chave do portão.", ficha: "O projeto do campinho parou." },
      apoio: { titulo: "Clube ajudou", texto: "O clube mandou material e um dia de treino com as crianças.", ficha: "O clube apoiou o campinho de {pessoa}." },
    },
    marcas: { projeto: "reforma", doacao: "reforma", clube: "apoio" },
    fichaMarca: { projeto: "Montou um projeto para o campinho.", doacao: "Doou uma parte do salário para o campinho.", clube: "Pediu ao clube apoio para o campinho." },
  },
  // ------------------------------------------------------------ estrela e veterano
  "videogame": {
    id: "videogame", fases: ["estabelecido", "estrela"], unico: true, quando: (c) => c.fama >= 50,
    personagens: pessoas("Diretor de marketing da produtora do jogo. Só fala em números de venda.", { BRA: "Bruno Veiga", FRA: "Hugo Martel", ENG: "Ryan Foss", ESP: "Álex Mora", ITA: "Marco Ferri", USA: "Tyler Ross" }),
    fichaInicio: "Proposta do jogo feita por {pessoa}: {quando}.",
    inicio: {
      titulo: "Capa de videogame regional",
      texto: "Um jogo de futebol quer você na capa da edição do seu país. {pessoa} explica que o contrato dá patrocínio por um ano.",
      origem: "convite",
      opcoes: [
        { id: "aceitar", rotulo: "Aceitar", resultado: "Seu rosto em todas as lojas. O sobrinho jogou com você o fim de semana inteiro.", marca: "aceitar", efeitos: { patrocinio: { pct: 0.1, piso: 30000, meses: 12 }, fama: 6, hype: 0.2 } },
        { id: "recusar", rotulo: "Recusar", resultado: "Dizem que capa de videogame dá azar.", marca: "recusar" },
      ],
    },
    passos: {},
    consequencias: {
      lojas: { titulo: "Seu rosto nas lojas", texto: "{pessoa} mandou as fotos da caixa. O sobrinho jogou com você o fim de semana inteiro.", ficha: "Capa de videogame: {pessoa} entregou as caixas.", semanas: 2 },
      recusa: { titulo: "Sem capa, sem azar", texto: "{pessoa} entendeu e disse que a porta fica aberta.", ficha: "Recusou a capa do videogame." },
    },
    marcas: { aceitar: "lojas", recusar: "recusa" },
    fichaMarca: { aceitar: "Aceitou ser a capa do videogame.", recusar: "Recusou a capa do videogame." },
  },

  "casamento-amigo": {
    id: "casamento-amigo", fases: ["estabelecido", "estrela", "veterano"], unico: true,
    personagens: pessoas("Seu amigo de infância. Conhece você antes do clube, da fama e das chuteiras.", { BRA: "Dudu Serra", FRA: "Florian Girard", ENG: "Kieran Moss", ESP: "Quique Llorente", ITA: "Simone Cava", USA: "Derek Lang" }),
    fichaInicio: "Convite de casamento de {pessoa}: {quando}.",
    inicio: {
      titulo: "Casamento do melhor amigo",
      texto: "{pessoa}, seu amigo de infância, casa no sábado, no interior. O clube joga no domingo.",
      origem: "familia",
      opcoes: [
        { id: "ir", rotulo: "Ir e voltar de madrugada", resultado: "Fez o discurso, chorou, voltou às 5 da manhã para a concentração.", marca: "ir", efeitos: { moral: 8, cansaco: 20 } },
        { id: "video", rotulo: "Mandar um vídeo", resultado: "{pessoa} entendeu. Disse que entendeu.", marca: "video", efeitos: { moral: -3 } },
      ],
    },
    passos: {},
    consequencias: {
      discurso: { titulo: "O discurso que todo mundo lembra", texto: "{pessoa} disse que nunca esquece a viagem de madrugada. A festa inteira repetiu a história.", ficha: "Foi ao casamento de {pessoa}, de madrugada.", semanas: 2 },
      magoa: { titulo: "Um vídeo no lugar da festa", texto: "{pessoa} não respondeu mais no grupo por um mês.", ficha: "Mandou vídeo para o casamento de {pessoa}; o amigo ficou magoado." },
    },
    marcas: { ir: "discurso", video: "magoa" },
    fichaMarca: { ir: "Foi ao casamento do amigo de infância.", video: "Mandou vídeo para o casamento do amigo." },
  },

  "gala": {
    id: "gala", fases: ["estrela"], quando: (c) => c.fama >= 85,
    personagens: pessoas("Produtora da gala de premiação. Confirma cada convidado pelo nome e pela cadeira.", { BRA: "Renata Maia", FRA: "Céline Duval", ENG: "Helen Marsh", ESP: "Patricia Soler", ITA: "Giulia Rossi", USA: "Amanda Vance" }),
    fichaInicio: "Indicação à gala confirmada por {pessoa}: {quando}.",
    inicio: {
      titulo: "Gala do prêmio de melhor do mundo",
      texto: "Você foi indicado ao prêmio de melhor jogador do mundo. {pessoa}, da produção, pede a confirmação até sexta. A cerimônia é em Paris, numa segunda-feira.",
      origem: "convite",
      opcoes: [
        { id: "ir", rotulo: "Ir de terno sob medida", resultado: "Não ganhou, mas a foto no tapete vermelho correu o mundo.", marca: "ir", efeitos: { fama: 5, hype: 0.3, moral: 5, cansaco: 10 }, valor: { chave: "gala", sinal: -1 } },
        { id: "ficar", rotulo: "Ficar treinando", resultado: "O técnico gostou. Os patrocinadores, não.", marca: "ficar", efeitos: { relTecnico: 5, fama: -2 } },
      ],
    },
    passos: {},
    consequencias: {
      tapete: { titulo: "A foto no tapete vermelho", texto: "Não ganhou, mas {pessoa} mandou a foto para o mundo inteiro.", ficha: "Foi à gala; {pessoa} publicou a foto no tapete.", semanas: 2 },
      patrocinio: { titulo: "Os patrocinadores não gostaram", texto: "{pessoa} disse que a marca preferia ver você na cerimônia.", ficha: "Ficou no treino na gala; {pessoa} cobrou os patrocinadores." },
    },
    marcas: { ir: "tapete", ficar: "patrocinio" },
    fichaMarca: { ir: "Foi à gala do melhor do mundo.", ficar: "Ficou treinando e não foi à gala." },
  },

  "marca-propria": {
    id: "marca-propria", fases: ["estrela", "veterano"], unico: true, quando: (c) => c.fama >= 65,
    personagens: pessoas("Consultora de marcas. Tem um plano de três anos pronto antes de você abrir a porta.", { BRA: "Lívia Prado", FRA: "Inès Bardot", ENG: "Charlotte Vane", ESP: "Sofía Benítez", ITA: "Chiara Lombardi", USA: "Megan Holt" }),
    fichaInicio: "Plano da marca apresentado por {pessoa}: {quando}.",
    inicio: {
      titulo: "Sua própria marca",
      texto: "Você pode lançar uma linha de roupas com seu apelido. {pessoa} tem um plano de três anos pronto.",
      origem: "convite",
      opcoes: [
        { id: "lancar", rotulo: "Lançar a coleção", resultado: "Esgotou em uma hora no primeiro lote. A marca agora está em Negócios, pronta para ganhar logo e peças.", marca: "lancar", efeitos: { sal: -4, fama: 3, engajamento: 10 } },
        { id: "nao", rotulo: "Deixar quieto", resultado: "Um time de marketing a menos para gerenciar.", marca: "nao" },
      ],
    },
    passos: {},
    consequencias: {
      esgotou: { titulo: "A coleção esgotou", texto: "No primeiro lote, a coleção acabou em uma hora. {pessoa} já pede a segunda linha.", ficha: "Coleção própria esgotou; {pessoa} pede a segunda linha." },
    },
    marcas: { lancar: "esgotou" },
    fichaMarca: { lancar: "Lançou a própria linha de roupas.", nao: "Deixou a marca própria quieta." },
  },

  "assedio": {
    id: "assedio", fases: ["estrela"],
    personagens: pessoas("Líder do grupo de fãs que acampou na porta. Organiza a fila e conhece os horários.", { BRA: "Tiago Brandão", FRA: "Dorian Pelletier", ENG: "Owen Pryce", ESP: "Rubén Ibarra", ITA: "Luca Serra", USA: "Caleb Nash" }),
    fichaInicio: "Primeiro encontro com {pessoa}: {quando}, na porta do condomínio.",
    inicio: {
      titulo: "Fãs na porta de casa",
      texto: "Tem fã acampado na frente do condomínio desde segunda. {pessoa} organizou o grupo e pede cinco minutos.",
      origem: "torcida",
      opcoes: [
        { id: "atender", rotulo: "Descer, tirar foto com todos", resultado: "Duas horas de fotos. Um garoto chorou abraçado em você.", marca: "atender", efeitos: { moral: 3, fama: 2, engajamento: 8, cansaco: 5 } },
        { id: "seguranca", rotulo: "Contratar mais segurança", resultado: "Carro blindado, horário trocado. A vida ficou mais estranha.", marca: "seguranca", efeitos: { sal: -0.5, moral: -2 } },
      ],
    },
    passos: {},
    consequencias: {
      grupo: { titulo: "O grupo virou fã-clube", texto: "{pessoa} passou a organizar a fila e a avisar quando você sai.", ficha: "Virou referência do grupo de fãs na porta de casa.", semanas: 2 },
      distancia: { titulo: "A rua ficou vazia", texto: "Com o novo segurança, {pessoa} foi o único que não voltou à porta.", ficha: "Trocou a rotina por segurança; {pessoa} sentiu." },
    },
    marcas: { atender: "grupo", seguranca: "distancia" },
    fichaMarca: { atender: "Desceu e tirou foto com os fãs.", seguranca: "Contratou mais segurança para a porta de casa." },
  },

  "selecao-convocacao": {
    id: "selecao-convocacao", fases: ["estrela"], quando: (c) => c.fama >= 75,
    personagens: pessoas("Assessor da seleção. Liga para confirmar apresentação, horário e quarto de hotel.", { BRA: "Henrique Sá", FRA: "Thierry Lamy", ENG: "Martin Hale", ESP: "Jordi Font", ITA: "Andrea Fabbri", USA: "Scott Keane" }),
    fichaInicio: "Convocação confirmada por {pessoa}: {quando}.",
    inicio: {
      titulo: "A seleção chamou",
      texto: "Seu nome saiu na convocação. {pessoa} liga para confirmar a apresentação e diz que o jogo de eliminatória é daqui a duas semanas.",
      origem: "convite",
      opcoes: [
        { id: "comemorar", rotulo: "Comemorar com a família", resultado: "Seu pai emoldurou o recorte do jornal.", marca: "comemorar", efeitos: { moral: 10, fama: 5, hype: 0.25, cansaco: 10 } },
      ],
    },
    passos: {},
    consequencias: {
      recorte: { titulo: "O recorte da convocação", texto: "{pessoa} mandou o recorte da convocação com um bilhete de parabéns.", ficha: "Convocado para a seleção; {pessoa} mandou o recorte.", semanas: 2 },
    },
    marcas: { comemorar: "recorte" },
    fichaMarca: { comemorar: "Comemorou a convocação com a família." },
  },

  "leilao": {
    id: "leilao", fases: ["estrela", "veterano"],
    personagens: pessoas("Organizadora do leilão do hospital infantil. Não aceita lance sem recibo.", { BRA: "Lúcia Mendes", FRA: "Nathalie Brun", ENG: "Joanne Pike", ESP: "Elena Roca", ITA: "Paola Gentile", USA: "Lauren Hayes" }),
    fichaInicio: "Pedido do leilão feito por {pessoa}: {quando}.",
    inicio: {
      titulo: "Leilão beneficente",
      texto: "Um hospital infantil pede uma camisa autografada para leilão. {pessoa} coordena o evento e pergunta se você pode doar também o valor que ela atingir.",
      origem: "cidade",
      opcoes: [
        { id: "doar", rotulo: "Doar a camisa e dobrar o valor", resultado: "A camisa saiu por uma fortuna. Você dobrou o valor.", marca: "doar", efeitos: { sal: -1, moral: 8, fama: 3 } },
        { id: "camisa", rotulo: "Só a camisa", resultado: "Ajudou bastante. O hospital mandou uma carta escrita pelas crianças.", marca: "camisa", efeitos: { moral: 4, fama: 1 } },
      ],
    },
    passos: {},
    consequencias: {
      ala: { titulo: "A ala nova do hospital", texto: "{pessoa} mandou as fotos da ala nova. Ela leva o nome da sua mãe.", ficha: "Doou a camisa e dobrou o valor; a ala nova ganhou o nome da mãe.", semanas: 3 },
      carta: { titulo: "Carta das crianças", texto: "O hospital mandou uma carta escrita pelas crianças. {pessoa} leu no sábado.", ficha: "O hospital agradeceu a camisa com uma carta das crianças.", semanas: 2 },
    },
    marcas: { doar: "ala", camisa: "carta" },
    fichaMarca: { doar: "Doou a camisa autografada e dobrou o valor.", camisa: "Doou a camisa autografada." },
  },

  "mentor": {
    id: "mentor", fases: ["veterano"],
    personagens: pessoas("Garoto de 17 anos que subiu da base e joga na sua posição. Pergunta tudo depois do treino.", { BRA: "Davi Lacerda", FRA: "Nolan Benoît", ENG: "Riley Bennett", ESP: "Adrián Campos", ITA: "Samuele Ferrante", USA: "Jaylen Foster" }),
    fichaInicio: "Primeira conversa com {pessoa}: {quando}, depois do treino.",
    inicio: {
      titulo: "O garoto da base",
      texto: "{pessoa} tem 17 anos, subiu agora e joga na sua posição. Ele te pede conselho depois do treino.",
      origem: "vestiario",
      opcoes: [
        { id: "ensinar", rotulo: "Ser o mentor dele", resultado: "Você passou a tarde mostrando como se posicionar.", marca: "ensinar", efeitos: { moral: 5, relTecnico: 5 } },
        { id: "disputar", rotulo: "Disputar a vaga sem dó", resultado: "Ele é bom, mas a camisa ainda é sua.", marca: "disputar", efeitos: { moral: 1, pressao: 3 } },
      ],
    },
    passos: {},
    consequencias: {
      discipulo: { titulo: "Ele lembra de quem ensinou", texto: "{pessoa} mandou uma mensagem depois do primeiro jogo como titular: \"Foi você que me ensinou.\"", ficha: "Ensinou {pessoa}, que virou titular." },
      rival: { titulo: "Ele quer sua vaga", texto: "{pessoa} treina mais que todo mundo, e o técnico já comenta a disputa.", ficha: "Disputa de vaga com {pessoa}." },
    },
    marcas: { ensinar: "discipulo", disputar: "rival" },
    fichaMarca: { ensinar: "Virou mentor do garoto da base.", disputar: "Disputou a vaga com o garoto da base." },
  },

  "comentarista": {
    id: "comentarista", fases: ["veterano"], unico: true,
    personagens: pessoas("Produtor da emissora de esportes. Liga cedo e quer resposta na semana.", { BRA: "Rodrigo Bastos", FRA: "Vincent Lasalle", ENG: "Tony Garrow", ESP: "Miguel Lozano", ITA: "Alberto Rizzi", USA: "Chad Morrow" }),
    fichaInicio: "Convite da emissora feito por {pessoa}: {quando}.",
    inicio: {
      titulo: "Convite para comentarista",
      texto: "Uma emissora quer você comentando jogos da Copa nas férias. {pessoa} quer resposta em uma semana.",
      origem: "convite",
      opcoes: [
        { id: "aceitar", rotulo: "Aceitar o trabalho de férias", resultado: "Você é bom nisso. A emissora já fala em contrato depois que pendurar as chuteiras.", marca: "aceitar", valor: { chave: "comentario", sinal: 1 }, efeitos: { fama: 3, cansaco: 10 } },
        { id: "descansar", rotulo: "Descansar nas férias", resultado: "Corpo de veterano precisa de férias de verdade.", marca: "descansar", efeitos: { cansaco: -15, moral: 2 } },
      ],
    },
    passos: {},
    consequencias: {
      contrato: { titulo: "A emissora fala em contrato", texto: "Você foi bem nos jogos de férias. {pessoa} já sugeriu um contrato para depois da carreira.", ficha: "Comentou jogos da Copa; {pessoa} quer contrato depois da carreira." },
      descanso: { titulo: "Férias de verdade", texto: "{pessoa} entendeu e disse que a proposta fica de pé.", ficha: "Recusou comentar nas férias; {pessoa} deixou a proposta de pé.", semanas: 2 },
    },
    marcas: { aceitar: "contrato", descansar: "descanso" },
    fichaMarca: { aceitar: "Aceitou comentar os jogos da Copa.", descansar: "Recusou comentar e foi descansar." },
  },

  "corpo": {
    id: "corpo", fases: ["veterano"],
    personagens: pessoas("Fisioterapeuta do clube há quinze anos. Não promete milagre, mas sabe onde dói.", { BRA: "Gustavo Prates", FRA: "Pascal Morin", ENG: "Dan Whitlock", ESP: "Iñaki Peralta", ITA: "Fabrizio Neri", USA: "Glenn Harper" }),
    fichaInicio: "Avaliação do joelho por {pessoa}: {quando}.",
    inicio: {
      titulo: "O corpo reclama",
      texto: "O joelho dói de manhã. {pessoa} sugere um tratamento caro com câmara hiperbárica.",
      origem: "vestiario",
      opcoes: [
        { id: "tratar", rotulo: "Fazer o tratamento", resultado: "Duas semanas de câmara. O joelho ficou mais leve a cada sessão.", marca: "tratar", efeitos: { sal: -0.5, cansaco: -20, evolucao: 0.01 } },
        { id: "seguir", rotulo: "Seguir com gelo e analgésico", resultado: "Funciona. Por enquanto.", marca: "seguir", efeitos: { moral: -2 } },
      ],
    },
    passos: {},
    consequencias: {
      joelho: { titulo: "O joelho ficou quase novo", texto: "{pessoa} disse que o joelho parece de 28 anos de novo. Quase.", ficha: "Fez o tratamento da câmara com {pessoa}.", semanas: 2 },
      dor: { titulo: "A dor voltou", texto: "{pessoa} avisou que a dor volta na próxima temporada se o gelo não bastar.", ficha: "Seguiu com gelo e analgésico; {pessoa} avisou da dor." },
    },
    marcas: { tratar: "joelho", seguir: "dor" },
    fichaMarca: { tratar: "Fez o tratamento com câmara hiperbárica.", seguir: "Seguiu com gelo e analgésico no joelho." },
  },

  "despedida-cidade": {
    id: "despedida-cidade", fases: ["veterano"], unico: true, quando: (c) => c.fama >= 50,
    personagens: pessoas("Vereador que organiza a homenagem da cidade natal. Fala de você no discurso antes de ouvir sua resposta.", { BRA: "Nilo Freitas", FRA: "Hervé Lacaze", ENG: "Alan Price", ESP: "Ramiro Ortega", ITA: "Piero Bianchi", USA: "Rick Dalton" }),
    fichaInicio: "Homenagem da cidade proposta por {pessoa}: {quando}.",
    inicio: {
      titulo: "Homenagem da cidade natal",
      texto: "A câmara da sua cidade quer te dar o título de cidadão ilustre e batizar uma rua. {pessoa} espera você na cerimônia.",
      origem: "cidade",
      opcoes: [
        { id: "ir", rotulo: "Ir à cerimônia", resultado: "A rua da sua infância agora tem seu nome. Seu pai não parava de tirar foto da placa.", marca: "ir", efeitos: { moral: 10, fama: 2 } },
      ],
    },
    passos: {},
    consequencias: {
      rua: { titulo: "A rua da sua infância", texto: "A cerimônia teve discurso de {pessoa} e placa com o seu nome.", ficha: "Virou cidadão ilustre; {pessoa} batizou uma rua." },
    },
    marcas: { ir: "rua" },
    fichaMarca: { ir: "Foi à homenagem da cidade natal." },
  },

  "futuro": {
    id: "futuro", fases: ["veterano"], unico: true,
    personagens: pessoas("Seu agente há anos. Sabe quanto cada opção custa antes de você perguntar.", { BRA: "Mauro Caldas", FRA: "Serge Kerbrat", ENG: "Phil Dacre", ESP: "Ricardo Llopis", ITA: "Dario Fiore", USA: "Gordon Cole" }),
    fichaInicio: "Conversa sobre o futuro com {pessoa}: {quando}.",
    inicio: {
      titulo: "E depois?",
      texto: "{pessoa} pergunta o que você quer fazer quando parar: técnico, dirigente, empresário ou praia.",
      origem: "contrato",
      opcoes: [
        { id: "tecnico", rotulo: "Começar o curso de treinador", resultado: "Licença de treinador nas férias. Você começa a ver o jogo com outros olhos.", marca: "tecnico", valor: { chave: "curso", sinal: -1 }, efeitos: { relTecnico: 6, evolucao: 0.01 } },
        { id: "empresa", rotulo: "Montar uma empresa de gestão de carreira", resultado: "Três garotos da base já assinaram com você.", marca: "empresa", efeitos: { sal: -2, moral: 3 } },
        { id: "praia", rotulo: "Praia, e não se fala mais nisso", resultado: "{pessoa} riu. Você não.", marca: "praia", efeitos: { moral: 4 } },
      ],
    },
    passos: {},
    consequencias: {
      curso: { titulo: "Curso de treinador", texto: "Você começou o curso nas férias. {pessoa} já tem vagas de estágio na base.", ficha: "Começou o curso de treinador; {pessoa} arrumou estágio." },
      agencia: { titulo: "Três garotos da base", texto: "Os três garotos assinaram com a sua empresa. {pessoa} cuida da papelada.", ficha: "Montou empresa de gestão; três garotos assinaram." },
    },
    marcas: { tecnico: "curso", empresa: "agencia" },
    fichaMarca: { tecnico: "Começou o curso de treinador.", empresa: "Montou empresa de gestão de carreira.", praia: "Decidiu curtir a praia depois da carreira." },
  },

  "documentario": {
    id: "documentario", fases: ["estrela"], unico: true, quando: (c) => c.fama >= 70,
    personagens: pessoas("Diretor do documentário da plataforma. Quer a câmara no vestiário e na cozinha.", { BRA: "Felipe Amaral", FRA: "Adrien Morvan", ENG: "Simon Ryle", ESP: "Andrés Quiroga", ITA: "Nicola Ferraro", USA: "Ethan Burke" }),
    fichaInicio: "Proposta da plataforma feita por {pessoa}: {quando}.",
    inicio: {
      titulo: "Documentário sobre você",
      texto: "Uma plataforma de streaming quer filmar sua temporada inteira para uma série. {pessoa} é o diretor e pede uma resposta até sexta.",
      origem: "convite",
      opcoes: [
        { id: "aceitar", rotulo: "Abrir as portas", resultado: "Câmera no vestiário, na cozinha e no carro.", marca: "aceitar", efeitos: { patrocinio: { pct: 0.2, piso: 200000, meses: 6 }, fama: 6, hype: 0.35, pressao: 10, relTecnico: -3 } },
        { id: "recusar", rotulo: "Manter a vida privada", resultado: "Sua casa continua sendo sua casa.", marca: "recusar", efeitos: { moral: 3 } },
      ],
    },
    passos: {},
    consequencias: {
      serie: { titulo: "A série estreou", texto: "A série estreou em 190 países. {pessoa} já fala em segunda temporada.", ficha: "Aceitou o documentário; {pessoa} quer segunda temporada.", semanas: 3 },
      privacidade: { titulo: "Vida privada", texto: "{pessoa} respeitou a decisão e disse que a casa segue sendo sua.", ficha: "Recusou o documentário; {pessoa} respeitou.", semanas: 2 },
    },
    marcas: { aceitar: "serie", recusar: "privacidade" },
    fichaMarca: { aceitar: "Aceitou o documentário sobre a temporada.", recusar: "Recusou o documentário e manteve a vida privada." },
  },
};

// Nomes dos grupos de países (ver GRUPO_DO_PAIS em cadeias.ts). O empresário leva a agência no nome.
const NOMES_GRUPOS: Record<string, Record<string, string | [string, string]>> = {
 "escola-prova": {
  "POR": "Dona Graça Almeida",
  "LATAM": "Profesora Mariela Ortiz",
  "GER": "Frau Ingrid Vogel",
  "NED": "Mevrouw Anneke de Ruiter",
  "TUR": "Öğretmen Nermin Kaya",
  "CRO": "Profesorica Vesna Horvat",
  "MAR": "Mme Naima El Idrissi",
  "KSA": "Ustaza Noura Al-Harbi",
  "IRN": "Khanum Farzaneh Mousavi",
  "NGA": "Mrs. Adaeze Okafor",
  "JPN": "Hayashi Keiko",
  "KOR": "Kim Mi-sook"
 },
 "base-saudade": {
  "POR": "Tiago Figueiredo",
  "LATAM": "Emiliano Rojas",
  "GER": "Jonas Brandt",
  "NED": "Daan Visser",
  "TUR": "Emre Yıldız",
  "CRO": "Luka Marić",
  "MAR": "Youssef Benali",
  "KSA": "Faisal Al-Otaibi",
  "IRN": "Arash Rahimi",
  "NGA": "Chidi Eze",
  "JPN": "Mori Kenta",
  "KOR": "Park Min-jun"
 },
 "base-chuteira": {
  "POR": "Sr. Albano",
  "LATAM": "Don Ramiro",
  "GER": "Kurt Lehmann",
  "NED": "Piet Hoekstra",
  "TUR": "Ahmet Abi",
  "CRO": "Stjepan Vuk",
  "MAR": "Hajj Mustapha",
  "KSA": "Abu Saeed",
  "IRN": "Amu Hassan",
  "NGA": "Baba Musa",
  "JPN": "Tanaka Shigeru",
  "KOR": "Ajeossi Byung-ho"
 },
 "base-olheiro": {
  "POR": "Rui Bettencourt",
  "LATAM": "Alejandro Sosa",
  "GER": "Dieter Kessler",
  "NED": "Ruud Bakker",
  "TUR": "Kerem Altun",
  "CRO": "Darko Vuković",
  "MAR": "Karim Bennis",
  "KSA": "Talal Al-Qahtani",
  "IRN": "Behrouz Sadeghi",
  "NGA": "Emeka Nwosu",
  "JPN": "Ito Ryosuke",
  "KOR": "Lee Sang-woo"
 },
 "primeiro-carro": {
  "POR": "Vítor Sampaio",
  "LATAM": "Gustavo Parra",
  "GER": "Markus Herzog",
  "NED": "Wim van Dijk",
  "TUR": "Burak Tekin",
  "CRO": "Ivica Babić",
  "MAR": "Hamid Ouazzani",
  "KSA": "Saud Al-Shehri",
  "IRN": "Reza Karimi",
  "NGA": "Tunde Adeyemi",
  "JPN": "Matsuda Hiroshi",
  "KOR": "Jung Ho-sik"
 },
 "festa-elenco": {
  "POR": "Zé Pedro Lopes",
  "LATAM": "Chino Benítez",
  "GER": "Lukas Krüger",
  "NED": "Bram Smit",
  "TUR": "Okan Demir",
  "CRO": "Mate Jurić",
  "MAR": "Adil Chraibi",
  "KSA": "Hamad Al-Dossari",
  "IRN": "Pouya Ahmadi",
  "NGA": "Kunle Balogun",
  "JPN": "Takahashi Shin",
  "KOR": "Choi Dong-hyun"
 },
 "golpe-pix": {
  "POR": "Rodrigo Esteves",
  "LATAM": "Facundo Miranda",
  "GER": "Florian Schulz",
  "NED": "Joris Mulder",
  "TUR": "Serkan Aydın",
  "CRO": "Dario Kovač",
  "MAR": "Rachid Tazi",
  "KSA": "Badr Al-Mutairi",
  "IRN": "Kaveh Tehrani",
  "NGA": "Ifeanyi Obi",
  "JPN": "Nakamura Daisuke",
  "KOR": "Han Seung-jae"
 },
 "treino-extra-veterano": {
  "POR": "Mário Pacheco",
  "LATAM": "Hernán Suárez",
  "GER": "Stefan Roth",
  "NED": "Frank Bosch",
  "TUR": "Hakan Yılmaz",
  "CRO": "Ante Radić",
  "MAR": "Mehdi Lahlou",
  "KSA": "Nawaf Al-Subaie",
  "IRN": "Hossein Moradi",
  "NGA": "Segun Adebayo",
  "JPN": "Ueda Kenji",
  "KOR": "Kang Tae-min"
 },
 "mae-casa": {
  "POR": "Sílvia Morgado",
  "LATAM": "Verónica Castillo",
  "GER": "Birgit Hahn",
  "NED": "Marieke Jansen",
  "TUR": "Ayşe Kılıç",
  "CRO": "Ana Perić",
  "MAR": "Soukaina Benjelloun",
  "KSA": "Reem Al-Zahrani",
  "IRN": "Mina Hosseini",
  "NGA": "Ngozi Chukwu",
  "JPN": "Yamamoto Emi",
  "KOR": "Seo Ji-yeon"
 },
 "podcast": {
  "POR": "Diogo Sardinha",
  "LATAM": "Matías Quiroga",
  "GER": "Tobias Richter",
  "NED": "Sven Koopman",
  "TUR": "Cem Ertürk",
  "CRO": "Igor Lovrić",
  "MAR": "Anas Berrada",
  "KSA": "Yazeed Al-Shammari",
  "IRN": "Siamak Azari",
  "NGA": "Femi Ajayi",
  "JPN": "Okada Shun",
  "KOR": "Yoon Tae-hwan"
 },
 "tv-programa": {
  "POR": "Inês Carvalhal",
  "LATAM": "Lorena Vega",
  "GER": "Sabine Möller",
  "NED": "Lotte Verhoeven",
  "TUR": "Zeynep Arslan",
  "CRO": "Petra Novak",
  "MAR": "Nadia Lamrani",
  "KSA": "Lujain Al-Ghamdi",
  "IRN": "Shirin Moghadam",
  "NGA": "Bisi Afolabi",
  "JPN": "Fujita Mariko",
  "KOR": "Jang Hye-jin"
 },
 "polemica-rede": {
  "POR": "Jorge Sobral",
  "LATAM": "Kevin Lozano",
  "GER": "Marco Bauer",
  "NED": "Jeroen Blom",
  "TUR": "Tolga Önal",
  "CRO": "Zoran Pavić",
  "MAR": "Otmane Hajji",
  "KSA": "Sultan Al-Zahrani",
  "IRN": "Ali Shahbazi",
  "NGA": "Sunday Okon",
  "JPN": "Kobayashi Taku",
  "KOR": "Oh Jin-ho"
 },
 "lesao-amigo": {
  "POR": "Miguel Fontes",
  "LATAM": "Lautaro Ibáñez",
  "GER": "Niklas Vogt",
  "NED": "Thijs Meijer",
  "TUR": "Yusuf Acar",
  "CRO": "Filip Radović",
  "MAR": "Omar Ziani",
  "KSA": "Khaled Al-Anazi",
  "IRN": "Amir Rezaei",
  "NGA": "Tobi Akin",
  "JPN": "Maeda Ren",
  "KOR": "Shin Dong-woo"
 },
 "instituto": {
  "POR": "Sr. Armindo",
  "LATAM": "Don Eusebio Caballero",
  "GER": "Opa Heinz",
  "NED": "Oom Henk",
  "TUR": "Amca Rıza",
  "CRO": "Deda Josip",
  "MAR": "Si Abdelkader",
  "KSA": "Abu Fahd",
  "IRN": "Agha Mehdi",
  "NGA": "Papa Olu",
  "JPN": "Ogawa Ichiro",
  "KOR": "Gang Man-su"
 },
 "videogame": {
  "POR": "Duarte Lemos",
  "LATAM": "Sebastián Acosta",
  "GER": "Patrick Lindner",
  "NED": "Maarten Hof",
  "TUR": "Murat Bozkurt",
  "CRO": "Tomislav Đurić",
  "MAR": "Sofiane Kettani",
  "KSA": "Fahad Al-Ruwaili",
  "IRN": "Navid Jafari",
  "NGA": "Chukwuma Eze",
  "JPN": "Iwasaki Hayato",
  "KOR": "Seo Hyun-woo"
 },
 "casamento-amigo": {
  "POR": "Nuno Teixeira",
  "LATAM": "Sergio Villalba",
  "GER": "Dennis Wolf",
  "NED": "Rick van Zanten",
  "TUR": "Eren Kaplan",
  "CRO": "Marin Tomić",
  "MAR": "Hicham Sabri",
  "KSA": "Mishaal Al-Enezi",
  "IRN": "Farhad Nouri",
  "NGA": "Obinna Chidi",
  "JPN": "Sasaki Yuta",
  "KOR": "Lim Jae-hyuk"
 },
 "gala": {
  "POR": "Beatriz Galvão",
  "LATAM": "Carolina Benavides",
  "GER": "Verena Koch",
  "NED": "Anouk Veldhuis",
  "TUR": "Selin Erdem",
  "CRO": "Lucija Vuković",
  "MAR": "Imane Ouahbi",
  "KSA": "Hessa Al-Mutairi",
  "IRN": "Parisa Ghanbari",
  "NGA": "Amara Nnaji",
  "JPN": "Kawai Nanami",
  "KOR": "Ryu Seo-yeon"
 },
 "marca-propria": {
  "POR": "Leonor Santos",
  "LATAM": "Valentina Ríos",
  "GER": "Julia Brenner",
  "NED": "Fenna de Boer",
  "TUR": "Defne Aksoy",
  "CRO": "Mia Kralj",
  "MAR": "Khadija Berrada",
  "KSA": "Lama Al-Otaibi",
  "IRN": "Sara Ebrahimi",
  "NGA": "Ada Okeke",
  "JPN": "Mizuno Ayaka",
  "KOR": "Baek Ha-yoon"
 },
 "assedio": {
  "POR": "Rúben Cardoso",
  "LATAM": "Gonzalo Reyes",
  "GER": "Moritz Kaiser",
  "NED": "Stijn Dekker",
  "TUR": "Furkan Güneş",
  "CRO": "Dominik Babić",
  "MAR": "Yassine Tahiri",
  "KSA": "Turki Al-Harbi",
  "IRN": "Vahid Shokri",
  "NGA": "Ola Fashola",
  "JPN": "Nishimura Kaito",
  "KOR": "Kwon Min-seok"
 },
 "selecao-convocacao": {
  "POR": "Pedro Vilela",
  "LATAM": "Ignacio Herrera",
  "GER": "Christoph Ziegler",
  "NED": "Erik Brouwer",
  "TUR": "Mert Özkan",
  "CRO": "Krešimir Lukić",
  "MAR": "Brahim Chaoui",
  "KSA": "Waleed Al-Dosari",
  "IRN": "Ramin Farahani",
  "NGA": "Kayode Lawal",
  "JPN": "Murakami Hideki",
  "KOR": "Yoo Ji-hoon"
 },
 "leilao": {
  "POR": "Helena Brito",
  "LATAM": "Mercedes Lobo",
  "GER": "Ursula Winkler",
  "NED": "Esther Mulder",
  "TUR": "Gül Tuncer",
  "CRO": "Snježana Kovač",
  "MAR": "Zineb Lahlou",
  "KSA": "Moudhi Al-Shamrani",
  "IRN": "Azar Hosseini",
  "NGA": "Funke Ogunleye",
  "JPN": "Takeda Sayuri",
  "KOR": "Shim Eun-ji"
 },
 "mentor": {
  "POR": "Gonçalo Brandão",
  "LATAM": "Tomás Aguirre",
  "GER": "Leon Hartmann",
  "NED": "Lars Bakker",
  "TUR": "Eymen Şahin",
  "CRO": "Nikola Perić",
  "MAR": "Ayoub Tahiri",
  "KSA": "Rayan Al-Otaibi",
  "IRN": "Parsa Nazari",
  "NGA": "Chinedu Okafor",
  "JPN": "Takahashi Sota",
  "KOR": "Ha Jun-seo"
 },
 "comentarista": {
  "POR": "Filipe Meneses",
  "LATAM": "Rolando Peña",
  "GER": "Oliver Strauss",
  "NED": "Mark de Groot",
  "TUR": "Burhan Yalçın",
  "CRO": "Mirko Šimunić",
  "MAR": "Hassan Benkirane",
  "KSA": "Majed Al-Hussaini",
  "IRN": "Kamran Hashemi",
  "NGA": "Olu Adekunle",
  "JPN": "Nagano Makoto",
  "KOR": "Jeon Tae-ho"
 },
 "corpo": {
  "POR": "Ricardo Abreu",
  "LATAM": "Osvaldo Quintana",
  "GER": "Andreas Frick",
  "NED": "Hans Bijl",
  "TUR": "Murat Aslan",
  "CRO": "Vedran Zorić",
  "MAR": "Mourad Chaoui",
  "KSA": "Tariq Al-Mansour",
  "IRN": "Bijan Rostami",
  "NGA": "Ifeoma Nwankwo",
  "JPN": "Kuroda Hiroshi",
  "KOR": "Ahn Seong-bae"
 },
 "despedida-cidade": {
  "POR": "Armando Rebelo",
  "LATAM": "Gerardo Molina",
  "GER": "Werner Klein",
  "NED": "Gerrit Vos",
  "TUR": "Halil Demirci",
  "CRO": "Ante Barić",
  "MAR": "Mohamed Alaoui",
  "KSA": "Abdulaziz Al-Mutairi",
  "IRN": "Mohsen Karimi",
  "NGA": "Tunde Akinola",
  "JPN": "Shigi Nobuo",
  "KOR": "Gu Chang-ho"
 },
 "futuro": {
  "POR": "Jorge Moreira",
  "LATAM": "Ariel Mansilla",
  "GER": "Bernd Ackermann",
  "NED": "Pieter Groen",
  "TUR": "Ertuğrul Bayram",
  "CRO": "Tomo Lukić",
  "MAR": "Driss Benslimane",
  "KSA": "Sultan Al-Harthi",
  "IRN": "Majid Bahrami",
  "NGA": "Seun Ajayi",
  "JPN": "Komatsu Ichiro",
  "KOR": "Nam Gi-tae"
 },
 "documentario": {
  "POR": "Francisco Lopes",
  "LATAM": "Joaquín Ferrer",
  "GER": "Henning Roth",
  "NED": "Dirk Smeets",
  "TUR": "Cenk Ergin",
  "CRO": "Robert Tadić",
  "MAR": "Walid Benkirane",
  "KSA": "Yousef Al-Khalidi",
  "IRN": "Pejman Kazemi",
  "NGA": "Emeka Anyanwu",
  "JPN": "Nishioka Ren",
  "KOR": "Lee Ji-ho"
 },
 "base-empresario": {
  "POR": [
   "Rui Melo",
   "Melo Sports Management"
  ],
  "LATAM": [
   "Ricardo Almada",
   "Almada Sports"
  ],
  "GER": [
   "Stefan Krauss",
   "Krauss Sportmanagement"
  ],
  "NED": [
   "Bert Smulders",
   "Smulders Sports"
  ],
  "TUR": [
   "Kemal Sönmez",
   "Sönmez Sports"
  ],
  "CRO": [
   "Ivan Sertić",
   "Sertić Sport"
  ],
  "MAR": [
   "Karim Idrissi",
   "Idrissi Sports"
  ],
  "KSA": [
   "Fahad Al-Shalan",
   "Al-Shalan Sports"
  ],
  "IRN": [
   "Amir Hosseinzadeh",
   "Hosseinzadeh Sport"
  ],
  "NGA": [
   "Chike Nwachukwu",
   "Nwachukwu Sports"
  ],
  "JPN": [
   "Hiroshi Ito",
   "Ito Sports Agency"
  ],
  "KOR": [
   "Park Jun-seok",
   "Park Sports"
  ]
 }
};
for (const [id, grupos] of Object.entries(NOMES_GRUPOS)) {
  const cad = CADEIAS[id];
  const bio = Object.values(cad.personagens)[0].bio;
  for (const [grupo, nome] of Object.entries(grupos)) {
    cad.personagens[grupo] = Array.isArray(nome)
      ? { nome: nome[0], bio: `Empresário da ${nome[1]}. Relógio dourado, fala rápido e promete clube no exterior em dois anos.` }
      : { nome, bio };
  }
}
