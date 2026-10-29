// Eventos fora de campo que acompanham a fase da carreira: na base, a escola e a família; no começo, o primeiro
// carro e o empresário; já estabelecido, patrocínio e televisão; como estrela, documentário, gala e marca própria;
// veterano, despedida, mentor e o que fazer depois. Um por vez, com decisão.
import { RNG, clamp } from "./rng.js";

export type Fase = "base" | "inicio" | "estabelecido" | "estrela" | "veterano";
export interface CtxEvento {
  /** nacionalidade do jogador (código do país) */
  pais?: string;
  fase: Fase[]; idade: number; fama: number; salario: number; saldo: number; exterior: boolean; golfo: boolean; titular: boolean;
  nome: string; clube: string; cidade: string; liga: string; temporada: number; seguidores: number;
  /** família: pai com mais idade, irmão mais novo que joga, irmão profissional, proposta na mesa */
  paiVelho?: boolean; irmaoJoga?: boolean; irmaoPro?: boolean; proposta?: boolean;
}
export interface EfeitoEvento {
  /** dinheiro em R$ (negativo = gasto) ou em salários do jogador (sal) */
  dinheiro?: number; sal?: number;
  moral?: number; fama?: number; relTecnico?: number; engajamento?: number; hype?: number; pressao?: number; vidaNoturna?: number; cansaco?: number;
  /** bônus permanente de evolução (0,02 = +2%) */
  evolucao?: number;
  /** patrocínio: fração do salário por mês, por N meses (piso em reais para quem ganha pouco) */
  patrocinio?: { pct: number; piso: number; meses: number };
  /** família: relação com pai e mãe, com o irmão do evento; potencial do irmão mais novo; o irmão larga o futebol */
  pais?: number; irmao?: number; irmaoPot?: number; irmaoPara?: boolean;
}
export interface OpcaoEvento { id: string; rotulo: string; resultado: string; efeitos: EfeitoEvento; risco?: { chance: number; resultado: string; efeitos: EfeitoEvento } }
export interface EventoVida {
  id: string; fases: Fase[]; titulo: string; texto: string; opcoes: OpcaoEvento[];
  /** só uma vez na carreira */
  unico?: boolean; quando?: (c: CtxEvento) => boolean;
}

const ev = (id: string, fases: Fase[], titulo: string, texto: string, opcoes: OpcaoEvento[], extra: Partial<EventoVida> = {}): EventoVida => ({ id, fases, titulo, texto, opcoes, ...extra });
const op = (id: string, rotulo: string, resultado: string, efeitos: EfeitoEvento, risco?: OpcaoEvento["risco"]): OpcaoEvento => ({ id, rotulo, resultado, efeitos, risco });

export const EVENTOS: EventoVida[] = [
  // ------------------------------------------------------------ base
  ev("escola-prova", ["base"], "Semana de provas", "A escola do clube marcou as provas finais na mesma semana dos treinos em dois períodos.", [
    op("estudar", "Virar a noite estudando", "Passou em tudo. A mãe mandou print do boletim para a família inteira.", { moral: 4, cansaco: 15 }),
    op("treino", "Priorizar o treino", "Treinou forte, mas a recuperação ficou para janeiro. O coordenador da base não gostou.", { relTecnico: 3, moral: -3 }),
  ]),
  ev("base-saudade", ["base"], "Saudade de casa", "Faz dois meses que você não vê a família. O alojamento está quieto no domingo.", [
    op("visitar", "Pegar o ônibus e ir visitar", "Doze horas de estrada, um almoço de domingo e a cabeça no lugar.", { moral: 8, cansaco: 10, dinheiro: -400 }),
    op("ligar", "Fazer chamada de vídeo e ficar", "A avó chorou na chamada. Você chorou depois, sozinho.", { moral: 2 }),
  ]),
  ev("base-chuteira", ["base"], "Chuteira furada", "A chuteira abriu na sola no meio do treino. A nova custa metade da sua ajuda de custo.", [
    op("comprar", "Comprar a nova", "Pé firme no gramado. O mês vai ser de miojo.", { dinheiro: -600, moral: 2 }),
    op("colar", "Colar com cola de sapateiro", "Aguentou duas semanas. No terceiro treino, abriu de novo.", { moral: -2 }, { chance: 0.3, resultado: "A sola soltou num pique e você torceu o tornozelo.", efeitos: { moral: -4, cansaco: 20 } }),
  ]),
  ev("base-olheiro", ["base"], "Olheiro na arquibancada", "Dizem que tem gente de um clube grande vendo o jogo da base no sábado.", [
    op("show", "Jogar para aparecer", "Você tentou tudo sozinho. O olheiro anotou seu nome, o técnico anotou outra coisa.", { fama: 2, relTecnico: -3 }),
    op("time", "Jogar pelo time", "Jogo simples e correto. O técnico da base elogiou na frente de todos.", { relTecnico: 4, moral: 2 }),
  ]),
  ev("base-empresario", ["base"], "Um empresário na porta", "Um empresário com relógio dourado quer conversar com seus pais. Promete clube na Europa em dois anos.", [
    op("ouvir", "Ouvir a proposta com a família", "Muita promessa e um contrato de dez páginas. Seu pai pediu tempo para pensar.", { moral: 2, fama: 1 }),
    op("recusar", "Agradecer e recusar", "Ele saiu batendo a porta do carro. Seu pai disse que fez bem.", { moral: 1 }),
  ], { unico: true }),
  // ------------------------------------------------------------ início de carreira
  ev("primeiro-carro", ["inicio"], "O primeiro carro", "Com o primeiro salário de profissional, a concessionária do bairro oferece um carro em 48 parcelas.", [
    op("popular", "Um popular usado", "Simples e pago à vista. Seu pai dirigiu primeiro.", { sal: -1.5, moral: 4 }),
    op("financiar", "Financiar o importado", "Todo mundo no CT reparou. A parcela também vai reparar em você todo mês.", { sal: -4, moral: 6, fama: 2, pressao: 5 }),
    op("nada", "Continuar de aplicativo", "O dinheiro fica guardado. O motorista do aplicativo já te conhece.", { moral: -1 }),
  ], { unico: true, quando: (c) => c.salario >= 8000 }),
  ev("festa-elenco", ["inicio", "estabelecido"], "Convite para a festa", "Os mais velhos do elenco vão a uma festa depois do jogo. Te chamaram.", [
    op("ir", "Ir com o grupo", "Você virou parte da turma. Voltou às 4 da manhã.", { moral: 5, vidaNoturna: 6, cansaco: 15, relTecnico: -1 }, { chance: 0.2, resultado: "Alguém filmou a mesa. O vídeo chegou na diretoria.", efeitos: { relTecnico: -6, fama: 2, pressao: 6 } }),
    op("casa", "Agradecer e ir para casa", "Sono de atleta. No dia seguinte, ninguém lembrava que você não foi.", { cansaco: -5 }),
  ]),
  ev("mae-casa", ["inicio", "estabelecido"], "A casa da mãe", "Sua mãe mora de aluguel há vinte anos. Você pode dar a entrada numa casa para ela.", [
    op("comprar", "Dar a casa", "Ela chorou na entrega das chaves. Você também.", { sal: -6, moral: 12 }),
    op("depois", "Prometer para o ano que vem", "Ela disse que não tem pressa. Tem.", { moral: -2 }),
  ], { unico: true, quando: (c) => c.salario >= 20000 }),
  ev("podcast", ["inicio", "estabelecido"], "Convite para podcast", "Um podcast de futebol com milhões de visualizações quer você no próximo episódio.", [
    op("ir", "Ir e falar de tudo", "Três horas de conversa e um corte viral sobre a infância.", { fama: 4, engajamento: 15, hype: 0.15 }, { chance: 0.25, resultado: "Uma frase sobre o técnico saiu de contexto e virou manchete.", efeitos: { relTecnico: -8, pressao: 8 } }),
    op("recusar", "Recusar: foco no campo", "O assessor do clube agradeceu. Ninguém mais lembrou.", { relTecnico: 2 }),
  ]),
  ev("faculdade", ["inicio", "estabelecido"], "Faculdade à distância", "Um curso de Administração à distância encaixa na sua rotina, se você abrir mão de algumas folgas.", [
    op("matricular", "Fazer a matrícula", "Aula gravada à noite, prova no sábado. Cansa, mas a cabeça agradece.", { dinheiro: -1200, cansaco: 5, moral: 3, evolucao: 0.01 }),
    op("depois", "Deixar para depois da carreira", "O futebol primeiro. O curso continua lá.", {}),
  ], { unico: true }),
  ev("treino-extra-veterano", ["inicio"], "O capitão te chama", "O capitão do time oferece ficar depois do treino para te ensinar a se posicionar.", [
    op("ficar", "Ficar todos os dias", "Um mês de aulas no campo vazio. Você joga diferente.", { evolucao: 0.02, relTecnico: 3, cansaco: 10 }),
    op("ir", "Agradecer e ir descansar", "Ele entendeu. Chamou outro garoto.", {}),
  ], { unico: true }),
  ev("golpe-pix", ["inicio", "estabelecido"], "Investimento milagroso", "Um conhecido do bairro oferece um investimento que 'rende 10% ao mês, garantido'.", [
    op("investir", "Colocar um dinheiro", "O site saiu do ar três semanas depois. O conhecido também.", { sal: -2, moral: -6 }),
    op("recusar", "Recusar e contar para o agente", "O agente riu: é o golpe mais velho do mundo.", { moral: 1 }),
  ], { unico: true, quando: (c) => c.saldo > 20000 }),
  // ------------------------------------------------------------ estabelecido
  ev("tv-programa", ["estabelecido", "estrela"], "Convite da TV", "Um programa de auditório de domingo quer você no quadro de talentos.", [
    op("ir", "Ir e dançar no palco", "O Brasil inteiro viu você dançando mal. O Brasil inteiro adorou.", { fama: 5, hype: 0.2, engajamento: 10, cansaco: 5 }),
    op("recusar", "Recusar com educação", "Domingo em casa, com a família.", { moral: 3 }),
  ]),
  ev("instituto", ["estabelecido", "estrela"], "Projeto social", "O campinho onde você começou está abandonado. Dá para reformar e montar uma escolinha.", [
    op("fazer", "Bancar a reforma", "Cem crianças com uniforme novo. A foto do primeiro treino rodou o país.", { sal: -3, moral: 8, fama: 4, hype: 0.1 }),
    op("ajudar", "Doar material esportivo", "Bolas, coletes e chuteiras. Um começo.", { sal: -0.5, moral: 3, fama: 1 }),
    op("nao", "Não agora", "O campinho continua lá, esperando.", {}),
  ], { unico: true }),
  ev("polemica-rede", ["estabelecido", "estrela"], "Comentário que viralizou", "Um torcedor rival fez piada com sua família nas redes. Todo mundo espera sua resposta.", [
    op("responder", "Responder à altura", "A resposta foi genial e cruel. Engajamento recorde, nota de repúdio do clube.", { engajamento: 15, hype: 0.25, relTecnico: -5, pressao: 6 }),
    op("ignorar", "Ignorar", "Em dois dias ninguém lembrava. Você dormiu bem.", { moral: 1 }),
    op("gol", "Responder em campo", "Você guardou o print. A resposta vem no domingo.", { moral: 3, pressao: 3 }),
  ]),
  ev("videogame", ["estabelecido", "estrela"], "Capa de videogame regional", "Um jogo de futebol quer você na capa da edição do seu país.", [
    op("aceitar", "Aceitar", "Seu rosto em todas as lojas. O sobrinho jogou com você o fim de semana inteiro.", { patrocinio: { pct: 0.1, piso: 30000, meses: 12 }, fama: 6, hype: 0.2 }),
    op("recusar", "Recusar", "Dizem que capa de videogame dá azar.", {}),
  ], { unico: true, quando: (c) => c.fama >= 50 }),
  ev("casamento-amigo", ["estabelecido", "estrela", "veterano"], "Casamento do melhor amigo", "Seu amigo de infância casa no sábado, no interior. O clube joga no domingo.", [
    op("ir", "Ir e voltar de madrugada", "Fez o discurso, chorou, voltou às 5 da manhã para a concentração.", { moral: 8, cansaco: 20 }),
    op("video", "Mandar um vídeo", "Ele entendeu. Disse que entendeu.", { moral: -3 }),
  ], { unico: true }),
  ev("lesao-amigo", ["estabelecido", "estrela"], "Companheiro lesionado", "Seu parceiro de quarto rompeu o ligamento e está mal. Você pode passar as folgas com ele na fisioterapia.", [
    op("acompanhar", "Acompanhar a recuperação", "O elenco reparou. O capitão disse que é isso que faz um grupo.", { moral: 4, relTecnico: 4, cansaco: 5 }),
    op("mensagem", "Mandar mensagem e seguir a vida", "Ele respondeu com um joinha.", {}),
  ]),
  ev("exterior-adaptacao", ["inicio", "estabelecido", "estrela"], "Saudade de comida de casa", "Faz meses que você não come arroz e feijão de verdade. Tem um restaurante brasileiro a uma hora daqui.", [
    op("ir", "Ir toda semana", "O dono virou amigo. A saudade diminuiu.", { moral: 6, dinheiro: -1500 }),
    op("aula", "Fazer aula do idioma no lugar", "Ainda erra os verbos, mas já pede café sem apontar.", { relTecnico: 4, moral: 1 }),
  ], { quando: (c) => c.exterior }),
  ev("golfo-calor", ["estabelecido", "estrela", "veterano"], "Calor de 45 graus", "Treino às 22h, jogo à meia-noite. A família está entediada no condomínio.", [
    op("viagem", "Levar a família para viajar na folga", "Dubai, deserto, parque aquático. Todo mundo voltou feliz.", { sal: -0.3, moral: 7 }),
    op("aguentar", "Aguentar a rotina", "O dinheiro na conta compensa. Quase sempre.", { moral: -3 }),
  ], { quando: (c) => c.golfo }),
  // ------------------------------------------------------------ estrela
  ev("documentario", ["estrela"], "Documentário sobre você", "Uma plataforma de streaming quer filmar sua temporada inteira para uma série.", [
    op("aceitar", "Abrir as portas", "Câmera no vestiário, na cozinha e no carro. A série estreou em 190 países.", { patrocinio: { pct: 0.2, piso: 200000, meses: 6 }, fama: 6, hype: 0.35, pressao: 10, relTecnico: -3 }),
    op("recusar", "Manter a vida privada", "Sua casa continua sendo sua casa.", { moral: 3 }),
  ], { unico: true, quando: (c) => c.fama >= 70 }),
  ev("gala", ["estrela"], "Gala do prêmio de melhor do mundo", "Você foi indicado ao prêmio de melhor jogador do mundo. A cerimônia é em Paris, numa segunda-feira.", [
    op("ir", "Ir de terno sob medida", "Não ganhou, mas a foto no tapete vermelho correu o mundo.", { fama: 5, hype: 0.3, moral: 5, cansaco: 10, dinheiro: -80000 }),
    op("ficar", "Ficar treinando", "O técnico gostou. Os patrocinadores, não.", { relTecnico: 5, fama: -2 }),
  ], { quando: (c) => c.fama >= 85 }),
  ev("marca-propria", ["estrela", "veterano"], "Sua própria marca", "Você pode lançar uma linha de roupas com seu apelido.", [
    op("lancar", "Lançar a coleção", "Esgotou em uma hora no primeiro lote. Depois, as vendas se estabilizaram.", { sal: -4, patrocinio: { pct: 0.12, piso: 100000, meses: 24 }, fama: 3, engajamento: 10 }),
    op("nao", "Deixar quieto", "Um time de marketing a menos para gerenciar.", {}),
  ], { unico: true, quando: (c) => c.fama >= 65 }),
  ev("assedio", ["estrela"], "Fãs na porta de casa", "Tem fã acampado na frente do condomínio desde segunda.", [
    op("atender", "Descer, tirar foto com todos", "Duas horas de fotos. Um garoto chorou abraçado em você.", { moral: 3, fama: 2, engajamento: 8, cansaco: 5 }),
    op("seguranca", "Contratar mais segurança", "Carro blindado, horário trocado. A vida ficou mais estranha.", { sal: -0.5, moral: -2 }),
  ]),
  ev("selecao-convocacao", ["estrela"], "A seleção chamou", "Seu nome saiu na convocação. Jogo de eliminatória daqui a duas semanas.", [
    op("comemorar", "Comemorar com a família", "Seu pai emoldurou o recorte do jornal.", { moral: 10, fama: 5, hype: 0.25, cansaco: 10 }),
  ], { quando: (c) => c.fama >= 75 }),
  ev("leilao", ["estrela", "veterano"], "Leilão beneficente", "Um hospital infantil pede uma camisa autografada para leilão. Você pode doar também o valor que ela atingir.", [
    op("doar", "Doar a camisa e dobrar o valor", "A camisa saiu por uma fortuna. Você dobrou. A ala nova leva o nome da sua mãe.", { sal: -1, moral: 8, fama: 3 }),
    op("camisa", "Só a camisa", "Ajudou bastante. O hospital mandou uma carta escrita pelas crianças.", { moral: 4, fama: 1 }),
  ]),
  // ------------------------------------------------------------ veterano
  ev("mentor", ["veterano"], "O garoto da base", "Um garoto de 17 anos que subiu agora joga na sua posição. Ele te pede conselho.", [
    op("ensinar", "Ser o mentor dele", "Ele vai jogar no seu lugar um dia. E vai lembrar de quem ensinou.", { moral: 5, relTecnico: 5 }),
    op("disputar", "Disputar a vaga sem dó", "Ele é bom, mas a camisa ainda é sua.", { moral: 1, pressao: 3 }),
  ]),
  ev("comentarista", ["veterano"], "Convite para comentarista", "Uma emissora quer você comentando jogos da Copa nas férias.", [
    op("aceitar", "Aceitar o trabalho de férias", "Você é bom nisso. A emissora já fala em contrato depois que pendurar as chuteiras.", { dinheiro: 150000, fama: 3, cansaco: 10 }),
    op("descansar", "Descansar nas férias", "Corpo de veterano precisa de férias de verdade.", { cansaco: -15, moral: 2 }),
  ], { unico: true }),
  ev("corpo", ["veterano"], "O corpo reclama", "O joelho dói de manhã. O fisioterapeuta sugere um tratamento caro com câmara hiperbárica.", [
    op("tratar", "Fazer o tratamento", "Duas semanas e o joelho parece de 28 anos de novo. Quase.", { sal: -0.5, cansaco: -20, evolucao: 0.01 }),
    op("seguir", "Seguir com gelo e analgésico", "Funciona. Por enquanto.", { moral: -2 }),
  ]),
  ev("despedida-cidade", ["veterano"], "Homenagem da cidade natal", "A câmara da sua cidade quer te dar o título de cidadão ilustre e batizar uma rua.", [
    op("ir", "Ir à cerimônia", "A rua da sua infância agora tem seu nome. Seu pai não parava de tirar foto da placa.", { moral: 10, fama: 2 }),
  ], { unico: true, quando: (c) => c.fama >= 50 }),
  ev("futuro", ["veterano"], "E depois?", "O agente pergunta o que você quer fazer quando parar: técnico, dirigente, empresário ou praia.", [
    op("tecnico", "Começar o curso de treinador", "Licença de treinador nas férias. Você começa a ver o jogo com outros olhos.", { dinheiro: -30000, relTecnico: 6, evolucao: 0.01 }),
    op("empresa", "Montar uma empresa de gestão de carreira", "Três garotos da base já assinaram com você.", { sal: -2, moral: 3 }),
    op("praia", "Praia, e não se fala mais nisso", "O agente riu. Você não.", { moral: 4 }),
  ], { unico: true }),
];

// ------------------------------------------------------------ fora de campo por nacionalidade
// Costumes do país de origem: aparecem só para quem nasceu lá (o campo `pais` do contexto).
const NACIONAIS: EventoVida[] = [
  ev("jp-onsen", ["estabelecido", "estrela"], "Água quente com o time", "No Japão, o time inteiro costuma ir a um onsen depois de uma fase difícil. Os mais velhos insistem.", [
    op("ir", "Ir com o grupo", "Silêncio, água quente e uma conversa que o treinador nunca ouviria. O elenco voltou mais unido.", { moral: 6, cansaco: -8, dinheiro: -800 }),
    op("nao", "Ficar no hotel", "Você preferiu o descanso sozinho. Ninguém brigou, mas percebeu.", { cansaco: -4, engajamento: -2 }),
  ], { quando: (c) => c.pais === "JPN" }),
  ev("kr-soju", ["estabelecido", "estrela"], "Brinde depois da vitória", "Depois de uma vitória grande, os veteranos da Coreia do Sul pedem um brinde. Eles sabem quando você já bebeu o suficiente.", [
    op("brindar", "Brindar com os veteranos", "Três copos e uma história que você vai contar por anos. Fama de quem sabe respeitar.", { moral: 5, fama: 2, relTecnico: 2 }),
    op("recusar", "Pedir água", "Você ficou sóbrio e os veteranos respeitaram. A conversa foi sobre o próximo jogo.", { moral: 1, relTecnico: 1 }),
  ], { quando: (c) => c.pais === "KOR" }),
  ev("ma-cha", ["inicio", "estabelecido", "estrela"], "Chá de menta para a vizinhança", "Em Marrocos, quem chega do estrangeiro recebe a vizinhança para o chá de menta. A casa inteira espera a sua visita.", [
    op("receber", "Receber todo mundo", "Chá até tarde, bolo de mel e a rua inteira na sala. A casa virou ponto de encontro.", { moral: 6, dinheiro: -1200, fama: 1 }),
    op("pouco", "Receber só a família", "Uma visita curta e um pedido de desculpas por não ter tempo. A mãe não gostou.", { moral: -2, pais: -3 }),
  ], { quando: (c) => c.pais === "MAR" }),
  ev("ma-eid", ["inicio", "estabelecido", "estrela"], "Festa de fim de Ramadã", "A festa de Eid cai na semana de folga. A família quer você na mesa principal, com a cidade inteira.", [
    op("ficar", "Largar tudo e ir", "A mesa mais cheia da sua vida. Sua avó pediu para você contar a história da estreia de novo.", { moral: 8, cansaco: -5, dinheiro: -900 }),
    op("treinar", "Treinar na folga", "O técnico elogiou a dedicação. Sua família entendeu, mas ficou um pouco longe da festa.", { relTecnico: 3, pais: -2 }),
  ], { quando: (c) => c.pais === "MAR" }),
  ev("hr-dalmacia", ["estabelecido", "estrela"], "Verão na costa", "Na Croácia, o verão é de barco e de jantar à beira-mar. Um amigo de infância ligou com o barco pronto.", [
    op("barco", "Ir de barco por uma semana", "Mar, sal e nenhum celular por dias. Você voltou com o corpo descansado.", { moral: 7, cansaco: -12, dinheiro: -1500 }),
    op("ficar", "Ficar treinando", "O treino rendeu, mas a equipe percebeu que você estava cansado de si mesmo.", { relTecnico: 3, moral: -3 }),
  ], { quando: (c) => c.pais === "CRO" }),
  ev("hr-avo", ["base", "inicio"], "A avó e o peixe", "Na Croácia, a avó cozinha peixe para o neto que joga longe. Ela quer saber se você está comendo direito.", [
    op("comer", "Comer tudo que ela fez", "Três pratos e uma bronca carinhosa. Você voltou ao CT com a energia de quem foi cuidado.", { moral: 5, cansaco: -4 }),
    op("dieta", "Dizer que está de dieta", "Ela se ofendeu e mandou um pote para o seu quarto mesmo assim.", { moral: 1, pais: 2 }),
  ], { quando: (c) => c.pais === "CRO" }),
  ev("pt-fado", ["inicio", "estabelecido", "estrela"], "Noite de fado no bairro", "Em Portugal, a rua se junta para ouvir fado. Um vizinho pediu para você cantar uma música e a roda inteira te encara.", [
    op("cantar", "Cantar, mesmo sem saber a letra", "Os vizinhos cantaram junto no refrão. O vídeo rodou o bairro e a torcida gostou.", { fama: 3, moral: 4, engajamento: 2 }),
    op("ouvir", "Ouvir e aplaudir", "Você ficou no canto, aplaudindo. A noite foi boa, e ninguém te cobrou nada.", { moral: 3 }),
  ], { quando: (c) => c.pais === "POR" }),
  ev("pt-pastel", ["base", "inicio"], "Pastel de nata e saudade", "Você recebeu uma caixa de pastéis de nata da sua tia, que mora em Portugal. Ela mandou um bilhete pedindo que você descanse.", [
    op("dividir", "Dividir com o time", "O vestiário inteiro comeu em dois minutos. Virou tradição de quinta-feira.", { moral: 5, relTecnico: 1 }),
    op("guardar", "Guardar para você", "Você comeu um por dia, em silêncio, como ela gosta.", { moral: 3 }),
  ], { quando: (c) => c.pais === "POR" }),
  ev("usa-tailgate", ["base", "inicio", "estabelecido"], "Churrasco antes do jogo", "Nos Estados Unidos, a torcida faz churrasco no estacionamento antes do jogo. Um grupo de amigos pediu que você passasse por lá.", [
    op("passar", "Passar e ficar um pouco", "Hambúrguer, cerveja de lata e uma foto com todo mundo de camisa. A torcida lembrou do seu nome.", { fama: 2, moral: 4, dinheiro: -300 }),
    op("direto", "Ir direto ao vestiário", "Foco total no jogo. Os amigos entenderam, mas ficaram com a ideia de que você mudou.", { relTecnico: 2 }),
  ], { quando: (c) => c.pais === "USA" }),
  ev("usa-thanksgiving", ["estabelecido", "estrela"], "Ação de Graças", "Na quinta de Ação de Graças, a família liga do Estados Unidos e pergunta quando vai ser a próxima viagem.", [
    op("visitar", "Viajar para a festa", "Peru assado, jogo de futebol americano na TV e a casa inteira junta. Você voltou a tempo do treino.", { moral: 7, pais: 3, dinheiro: -1000 }),
    op("ligar", "Fazer chamada de vídeo", "A mesa inteira te mostrou para os primos. Foi bom, mas você sentiu a falta do cheiro da casa.", { moral: 3, pais: 1 }),
  ], { quando: (c) => c.pais === "USA" }),
  ev("mx-mariachi", ["inicio", "estabelecido", "estrela"], "Serenata na porta de casa", "No México, os tios combinaram uma serenata de mariachi na porta da sua casa. A vizinhança está na calçada.", [
    op("cantar", "Descer e cantar junto", "Um dos tios chorou no refrão final. Você ganhou um sombrero de presente e uma torcida na rua.", { moral: 7, fama: 2, dinheiro: -500 }),
    op("janela", "Ficar na janela e acenar", "Os tios gritaram seu nome e a rua inteira riu. Foi uma noite diferente.", { moral: 4 }),
  ], { quando: (c) => c.pais === "MEX" }),
  ev("co-cumbia", ["base", "inicio", "estabelecido", "estrela"], "Festa de bairro com cumbia", "Na Colômbia, o bairro faz festa na rua no sábado, e a cumbia não para. Te chamaram para dançar na frente de todo mundo.", [
    op("dancar", "Dançar até cansar", "Você mostrou ritmo fora do campo também. O bairro não esqueceu.", { moral: 6, cansaco: 6, fama: 1 }),
    op("sentar", "Ficar sentado com a família", "A avó te deu café e disse que você ainda vai ser maior do que ela imagina.", { moral: 3, pais: 2 }),
  ], { quando: (c) => c.pais === "COL" }),
];
EVENTOS.push(...NACIONAIS);
// família (pai, mãe e irmãos sorteados no começo da carreira)
const TODAS: Fase[] = ["base", "inicio", "estabelecido", "estrela", "veterano"];
EVENTOS.push(
  ev("aniversario-mae", TODAS, "Aniversário da sua mãe", "Hoje é aniversário da sua mãe, e o treino do {clube} é à tarde.", [
    op("festa", "Fazer uma festa surpresa", "A casa encheu de tia, primo e vizinho. Sua mãe chorou no parabéns.", { sal: -0.3, moral: 5, pais: 8 }),
    op("flores", "Ligar cedo e mandar flores", "Ela mandou foto das flores para o grupo da família inteira.", { dinheiro: -400, moral: 2, pais: 4 }),
    op("esquecer", "Deixar para depois", "Ela não reclamou. Seu pai reclamou por ela.", { moral: -3, pais: -10 }),
  ]),
  ev("pai-saude", TODAS, "Seu pai no hospital", "Seu pai passou mal e ficou internado. Os médicos pedem exames caros.", [
    op("melhor", "Pagar o melhor hospital", "Ele saiu em uma semana, mandando você voltar a treinar.", { sal: -1.5, moral: 2, pais: 12 }),
    op("plano", "Pagar um plano de saúde", "Tratamento bom, sem luxo. Ele já está em casa.", { dinheiro: -8000, pais: 6 }),
    op("publico", "Deixar com o hospital público", "Demorou, mas ele está bem. A família comentou.", { moral: -3, pais: -8 }),
  ], { quando: (c) => !!c.paiVelho }),
  ev("irmao-largar", TODAS, "Seu irmão quer largar o futebol", "Seu irmão mais novo cansou de ser cobrado e diz que quer largar a bola para estudar.", [
    op("convencer", "Convencer a continuar", "Ele voltou para o treino. Sem muita vontade, mas voltou.", { irmao: -4 }),
    op("escolinha", "Pagar uma escolinha particular", "Treinador novo, chuteira nova. O brilho nos olhos voltou.", { dinheiro: -6000, irmao: 8, irmaoPot: 3 }),
    op("apoiar", "Apoiar a decisão dele", "Ele vai fazer cursinho. Disse que você é o melhor irmão do mundo.", { irmao: 10, irmaoPara: true }),
  ], { quando: (c) => !!c.irmaoJoga }),
  ev("pai-transferencia", ["inicio", "estabelecido", "estrela", "veterano"], "Seu pai quer opinar", "Tem proposta na mesa e seu pai ligou: quer conversar antes de você decidir.", [
    op("ouvir", "Ouvir o pai com calma", "Ele falou da cidade, do clube e da sua mãe. Você ficou mais tranquilo.", { pais: 6, moral: 2 }),
    op("sozinho", "Decidir sozinho", "A carreira é sua. Ele entendeu, mas ficou magoado.", { pais: -5 }),
  ], { quando: (c) => !!c.proposta }),
  ev("visita-exterior", ["inicio", "estabelecido", "estrela", "veterano"], "Saudade de casa", "A família quer vir passar as férias com você em {cidade}.", [
    op("pagar", "Pagar as passagens de todo mundo", "Duas semanas de casa cheia e comida de mãe.", { sal: -0.5, moral: 6, pais: 10 }),
    op("adiar", "Pedir para virem no ano que vem", "Sua mãe disse que tudo bem. Não estava tudo bem.", { pais: -6, moral: -2 }),
  ], { quando: (c) => c.exterior }),
  ev("irmao-ajuda", TODAS, "Seu irmão precisa de ajuda", "Seu irmão se machucou e o clube dele não paga a fisioterapia.", [
    op("pagar", "Pagar a fisioterapia", "Ele voltou a jogar em dois meses e postou agradecendo.", { dinheiro: -12000, irmao: 10 }),
    op("fisio", "Pedir ajuda ao fisioterapeuta do seu clube", "Seu fisio atendeu ele de graça nas folgas.", { irmao: 6, relTecnico: -1 }),
  ], { quando: (c) => !!c.irmaoPro }),
);
export const EVENTO: Record<string, EventoVida> = Object.fromEntries(EVENTOS.map((e) => [e.id, e]));

export function fasesDe(c: Omit<CtxEvento, "fase">, formacao: boolean): Fase[] {
  if (formacao) return ["base"];
  const f: Fase[] = [];
  if (c.idade >= 32) f.push("veterano");
  if (c.fama >= 65) f.push("estrela");
  else if (c.fama >= 35 || c.idade >= 24) f.push("estabelecido");
  else f.push("inicio");
  return f;
}

export function sortearEvento(rng: RNG, ctx: CtxEvento, vistos: Record<string, number>): EventoVida | undefined {
  const pool = EVENTOS.filter((e) => e.fases.some((f) => ctx.fase.includes(f)) && (!e.quando || e.quando(ctx))
    && !(e.unico && vistos[e.id] !== undefined) && !(vistos[e.id] !== undefined && ctx.temporada - vistos[e.id] < 3));
  return pool.length ? rng.pick(pool) : undefined;
}

export const preencher = (t: string, c: CtxEvento) => t.replaceAll("{clube}", c.clube).replaceAll("{cidade}", c.cidade).replaceAll("{nome}", c.nome);
export const dinheiroDoEfeito = (e: EfeitoEvento, salario: number) => Math.round((e.dinheiro ?? 0) + (e.sal ?? 0) * Math.max(3000, salario));
export const patrocinioDoEfeito = (e: EfeitoEvento, salario: number) => (e.patrocinio ? Math.round(Math.max(e.patrocinio.piso, e.patrocinio.pct * salario)) : 0);
export const limitar = (x: number) => clamp(x, 0, 100);
