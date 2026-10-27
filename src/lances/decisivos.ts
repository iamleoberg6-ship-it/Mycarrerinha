// Lances de jogo grande: final, semifinal, clássico, briga por título. Pesam só quando o jogo é decisivo
// (contexto.decisiva) ou num clássico, e a disputa de pênaltis do mata-mata, que a tela abre depois do apito.
import { e, type Situacao } from "./base.js";

export const DECISIVOS: Situacao[] = [
  { id: "comecoDeFinal", titulo: ["Primeira bola da decisão", "Começo de jogo grande"],
    texto: ["Primeiros minutos. O estádio não para de cantar e a primeira bola do jogo chega em você. O coração está na boca.", "Começou a decisão. A bola vem limpa no seu pé e você sente as pernas pesadas de nervoso."],
    peso: (c) => (c.min <= 16 && (c.decisiva || c.classico) ? (c.decisiva ? 1.6 : 0.6) : 0), opcoes: [
      { id: "simples", rotulo: "Jogo simples, para entrar no jogo", teste: { PAS: 0.4, CALMA: 0.4, PROF: 0.2 }, dif: 0, niveis: [
        e("Passe curto, outro, mais um. O nervoso foi embora e você cresceu no jogo.", 0.3, { moral: 2 }),
        e("Tocou de lado com segurança. Entrou no jogo.", 0.15),
        e("Passe tímido, mas certo.", 0.02),
        e("O primeiro passe saiu torto. A arquibancada reclamou.", -0.15),
        e("Errou o primeiro passe e o {adv} quase abriu o placar no contra-ataque. Você demorou a se encontrar.", -0.35, { moral: -2 })] },
      { id: "arriscar", rotulo: "Arriscar logo de cara", teste: { DRI: 0.4, COM: 0.3, FIN: 0.3 }, dif: 14, niveis: [
        e("Arrancada, corte seco no {zag} e chute no ângulo. GOL no começo da decisão! O estádio veio abaixo.", 1.1, { golPro: true, meu: "gol", fama: 1.5, seguidores: 0.06, moral: 4 }),
        e("Partiu para cima, passou por dois e o {gol} salvou com a ponta dos dedos. Recado dado.", 0.35, { moral: 2 }),
        e("Tentou o drible e a zaga cortou.", -0.05),
        e("Perdeu a bola na primeira tentativa e o {adv} gostou do jogo.", -0.25),
        e("Perdeu a bola, o {adv} saiu rápido e abriu o placar. O técnico olhou feio.", -0.6, { golContra: true, relTecnico: -3, moral: -3 })] },
      { id: "tocarCraque", rotulo: "Procurar o meia mais experiente", teste: { VIS: 0.5, PAS: 0.5 }, dif: 4, niveis: [
        e("Tabela com o {meia}, que devolveu na medida. Você bateu cruzado: GOL!", 0.9, { golPro: true, meu: "gol", moral: 3 }),
        e("O {meia} segurou a bola, acalmou o time e te deu um tapinha no ombro.", 0.2),
        e("Tocou e o {meia} perdeu na sequência.", 0),
        e("O passe saiu atrasado e o {meia} levou o tranco.", -0.15),
        e("Passe interceptado na entrada da área. Susto.", -0.3)] },
    ] },
  { id: "segurarResultado", titulo: ["Segurar o resultado", "Reta final"],
    texto: ["Fim de jogo, vencendo por um. A torcida assobia pedindo o apito e a bola chega em você perto da bandeirinha.", "Os últimos minutos. Um gol de vantagem e o {adv} todo no ataque. A bola é sua."],
    peso: (c) => (c.min >= 78 && c.saldo === 1 ? (c.decisiva ? 1.6 : c.classico ? 0.8 : 0.35) : 0), opcoes: [
      { id: "bandeirinha", rotulo: "Levar para a bandeirinha e prender", teste: { FOR: 0.4, DRI: 0.3, CALMA: 0.3 }, dif: 8, niveis: [
        e("Dois minutos de bola presa no canto: lateral, falta, tiro de meta. O relógio correu e a torcida aplaudiu de pé.", 0.45, { relTecnico: 3, moral: 2 }),
        e("Ganhou um lateral e mais um minuto. Inteligente.", 0.2, { relTecnico: 1 }),
        e("Perdeu a bola, mas o time recompôs a tempo.", 0),
        e("Perdeu a bola na bandeirinha e o {adv} chegou com perigo. O {goleiro} salvou.", -0.25),
        e("Perdeu a bola no canto, o {adv} saiu em velocidade e o {ata} empatou. Silêncio no estádio.", -0.7, { golContra: true, moral: -5, relTecnico: -3 })] },
      { id: "matarJogo", rotulo: "Partir para o gol que mata o jogo", teste: { VEL: 0.3, DRI: 0.3, FIN: 0.4 }, dif: 16, niveis: [
        e("Arrancou sozinho, o {gol} saiu e você tocou por cima. GOL! Acabou o jogo!", 1.0, { golPro: true, meu: "gol", fama: 1.2, seguidores: 0.05, moral: 4 }),
        e("Chegou na cara, o {gol} defendeu, mas o tempo passou com a bola longe da sua área.", 0.25),
        e("A zaga travou o chute.", 0),
        e("Perdeu a bola tentando o drible e o técnico gritou para segurar.", -0.25, { relTecnico: -2 }),
        e("Perdeu a bola no ataque, o contra-ataque veio e o {adv} empatou no último lance.", -0.8, { golContra: true, moral: -6, relTecnico: -4 })] },
      { id: "cera", rotulo: "Cair e ganhar tempo", teste: { CALMA: 0.5, CARISMA: 0.5 }, dif: 10, niveis: [
        e("Caiu na hora certa, o jogo parou três minutos e o {adv} perdeu a cabeça.", 0.15, { relTecnico: 1 }),
        e("O massagista entrou e o relógio andou.", 0.05),
        e("O juiz mandou levantar e deu mais acréscimo.", -0.05),
        e("Amarelo por cera. A torcida adversária fez a festa.", -0.25, { amarelo: true }),
        e("Amarelo por cera e o juiz deu seis minutos de acréscimo. Até a sua torcida reclamou.", -0.4, { amarelo: true, moral: -2, noticia: "A cera de {nome} no fim do jogo virou assunto." })] },
    ] },
  { id: "torcidaHostil", titulo: ["Caldeirão", "Estádio contra você"],
    texto: ["Você vai cobrar o escanteio e chovem copos da arquibancada do {adv}. O estádio inteiro grita o seu nome, e não é elogio.", "Toda vez que você pega na bola, a torcida do {adv} vaia. Agora tem um rojão estourando atrás do gol."],
    peso: (c) => (!c.mandante && (c.decisiva || c.classico) ? 0.9 : 0), opcoes: [
      { id: "rapido", rotulo: "Ignorar e cobrar rápido", teste: { CALMA: 0.6, PAS: 0.4 }, dif: 6, niveis: [
        e("Cobrou rápido com a defesa ainda reclamando da torcida. O {comp} cabeceou: GOL! Silêncio no caldeirão.", 0.75, { golPro: true, meu: "assist", moral: 3 }),
        e("Cobrou rápido e o lance terminou em chute perigoso.", 0.25),
        e("Cobrança normal, a zaga afastou.", 0),
        e("A cabeça foi para a arquibancada e a cobrança também.", -0.2),
        e("Bateu com raiva, direto no tiro de meta. A torcida comemorou como gol.", -0.35, { moral: -2 })] },
      { id: "juiz", rotulo: "Pedir para o juiz parar o jogo", teste: { CARISMA: 0.6, CALMA: 0.4 }, dif: 4, niveis: [
        e("O juiz parou o jogo e o capitão do {adv} foi pedir calma à própria torcida. Você ganhou o respeito do estádio.", 0.25, { fama: 0.5 }),
        e("O jogo parou dois minutos e o clima esfriou.", 0.1),
        e("O juiz mandou seguir.", 0),
        e("O juiz achou que era cera e te advertiu.", -0.1),
        e("O juiz deu amarelo por reclamação. A arquibancada gritou ainda mais alto.", -0.25, { amarelo: true })] },
      { id: "beijo", rotulo: "Mandar um beijo para a arquibancada", teste: { CARISMA: 0.5, CALMA: 0.5 }, dif: 14, niveis: [
        e("Beijo, sorriso, cobrança na cabeça do {comp}. GOL! O vídeo vai rodar o mundo.", 0.8, { golPro: true, meu: "assist", fama: 1.5, seguidores: 0.1 }),
        e("Beijo e sorriso. O vídeo bombou nas redes.", 0.1, { fama: 0.8, seguidores: 0.06 }),
        e("O juiz não gostou e advertiu você.", -0.05, { seguidores: 0.02 }),
        e("Amarelo por provocação. A torcida ficou ainda mais furiosa.", -0.25, { amarelo: true, seguidores: 0.03 }),
        e("Confusão: amarelo, jogo parado e a polícia precisou entrar em campo.", -0.5, { amarelo: true, relTecnico: -4, noticia: "{nome} provoca a torcida rival e o jogo fica parado por confusão." })] },
    ] },
  { id: "vestiario", titulo: ["Intervalo", "Vestiário em silêncio"],
    texto: ["Intervalo, perdendo. No vestiário ninguém fala, o time está de cabeça baixa. Você olha em volta.", "Fim do primeiro tempo, atrás no placar. O técnico ainda não entrou no vestiário e o clima é de enterro."],
    peso: (c) => (c.min >= 38 && c.min <= 52 && c.saldo < 0 ? (c.decisiva ? 1.8 : c.classico ? 0.9 : 0.2) : 0), opcoes: [
      { id: "falar", rotulo: "Levantar e falar com o grupo", teste: { CARISMA: 0.7, PROF: 0.3 }, dif: 8, niveis: [
        e("Você levantou e falou o que precisava. O time voltou outro: logo no começo do segundo tempo, GOL!", 0.6, { golPro: true, moral: 5, relTecnico: 3 }),
        e("O grupo voltou mais ligado. Os veteranos te olharam diferente.", 0.3, { moral: 3, relTecnico: 1 }),
        e("Falou, alguns ouviram.", 0.05),
        e("Ninguém prestou muita atenção.", -0.1),
        e("O técnico entrou no meio da sua fala e não gostou de você tomando a palavra dele.", -0.3, { relTecnico: -4 })] },
      { id: "quieto", rotulo: "Ficar quieto e se concentrar", teste: { PROF: 0.6, CALMA: 0.4 }, dif: 0, niveis: [
        e("Fones, olhos fechados, a cabeça no segundo tempo. Voltou afiado.", 0.3, { moral: 2 }),
        e("Concentrado, voltou focado.", 0.2),
        e("Voltou do mesmo jeito que saiu.", 0.02),
        e("Ficou remoendo o primeiro tempo.", -0.1),
        e("A cabeça não saiu do erro do primeiro tempo e o segundo foi pior.", -0.3, { moral: -2 })] },
      { id: "cobrar", rotulo: "Cobrar os companheiros", teste: { CARISMA: 0.4, CALMA: 0.3, PROF: 0.3 }, dif: 14, niveis: [
        e("A cobrança acordou o time. GOL logo na volta!", 0.5, { golPro: true, moral: 3 }),
        e("O {capitao} concordou e o time voltou com sangue nos olhos.", 0.25, { moral: 2 }),
        e("Alguns concordaram, outros fecharam a cara.", 0),
        e("Bate-boca com o {capitao} no vestiário.", -0.3, { moral: -3 }),
        e("A discussão vazou: dedo na cara, gente separando. O técnico ficou furioso.", -0.5, { relTecnico: -4, moral: -5, noticia: "Clima pesado: {nome} discute com companheiros no intervalo." })] },
    ] },
];

/** A sua cobrança na disputa de pênaltis (níveis 0 e 1: gol; 2 a 4: perdeu). Não conta no placar do jogo. */
export const DISPUTA: Situacao = {
  id: "disputaPenaltis", momento: "comemoracao", titulo: ["Sua cobrança", "A bola é sua"],
  texto: ["Você pega a bola no meio de campo, caminha sozinho até a marca. O {gol} pula e abre os braços.", "O estádio em silêncio. Você ajeita a bola na marca. O {gol} tenta te encarar."],
  peso: () => 0, opcoes: [
    { id: "canto", rotulo: "No canto, rasteiro", teste: { FIN: 0.5, COM: 0.3, CALMA: 0.2 }, dif: -4, tracos: { frieza: 8 }, niveis: [
      e("Bola de um lado, {gol} do outro. GOL!", 0), e("O {gol} tocou, mas não segurou. GOL!", 0),
      e("O {gol} adivinhou o canto e defendeu.", 0), e("Na trave!", 0), e("Para fora. Você pôs as mãos no rosto.", 0)] },
    { id: "forte", rotulo: "Forte, no alto", teste: { FIN: 0.4, FOR: 0.4, CALMA: 0.2 }, dif: 0, niveis: [
      e("Na gaveta, sem chance. GOL!", 0), e("Forte, no meio, com o {gol} já caído. GOL!", 0),
      e("Forte demais, o {gol} espalmou para cima.", 0), e("No travessão!", 0), e("Por cima do gol. A torcida deles fez a festa.", 0)] },
    { id: "paradinha", rotulo: "Paradinha, esperando o goleiro", teste: { COM: 0.6, CALMA: 0.4 }, dif: 6, tracos: { frieza: 10 }, niveis: [
      e("Paradinha, o {gol} caiu antes e você tocou no outro canto. GOL!", 0), e("Esperou, o {gol} se mexeu e você colocou. GOL!", 0),
      e("O {gol} não caiu na paradinha e defendeu.", 0), e("Travou na paradinha e bateu fraco. Defendeu.", 0), e("Perdeu o tempo da corrida e chutou para fora.", 0)] },
    { id: "cavadinha", rotulo: "Cavadinha", teste: { COM: 0.7, CALMA: 0.3 }, dif: 12, tracos: { frieza: 12 }, niveis: [
      e("Cavadinha com o {gol} já no chão. Que coragem! GOL!", 0), e("Cavadinha devagar, entrou rente ao travessão. GOL!", 0),
      e("O {gol} ficou parado e segurou a cavadinha.", 0), e("Saiu fraca e o {gol} pegou fácil.", 0), e("Por cima do travessão. Uma cavadinha que vai ser lembrada para sempre, do jeito errado.", 0)] },
  ],
};
