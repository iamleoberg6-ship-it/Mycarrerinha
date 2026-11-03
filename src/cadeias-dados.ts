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
};
