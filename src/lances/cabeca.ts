// Lances de cabeça, bola parada e contexto: provocação, juiz, companheiros, clima, clássico, momentos raros.
import { e, P, type Situacao } from "./base.js";

export const CABECA: Situacao[] = [
  { id: "faltaPerigosa", titulo: ["Falta na entrada da área", "Falta perigosa"],
    texto: ["Falta frontal, a 22 metros. O {batedor} olha para você.", "Falta na meia-lua. A barreira do {adv} se arma e o {batedor} faz sinal para você."],
    peso: (c) => (c.pos === "ZAG" || c.pos === "LAT" ? 0.2 : c.pos === "VOL" ? 0.4 : 0.7), opcoes: [
      { id: "barreira", rotulo: "Pedir a bola e bater por cima da barreira", teste: { FIN: 0.5, COM: 0.3, PAS: 0.2 }, dif: 22, tracos: { chute_longe: 8, frieza: 4 }, niveis: [
        e(["Por cima da barreira, no ângulo. Golaço de falta!", "A bola subiu, passou a barreira e caiu na gaveta. Golaço de falta!"], 1.0, { golPro: true, meu: "gol", fama: 1, seguidores: 0.04 }),
        e("No canto, o {gol} espalmou.", 0.15),
        e("Na barreira.", -0.1),
        e("Por cima do gol, longe.", -0.3),
        e("Isolou. O {batedor} balançou a cabeça.", -0.5, { relTecnico: -2 })] },
      { id: "rasteiro", rotulo: "Bater forte e rasteiro", teste: { FIN: 0.5, FOR: 0.5 }, dif: 20, tracos: { chute_longe: 6 }, niveis: [
        e("Por baixo da barreira que pulou. GOL!", 0.8, { golPro: true, meu: "gol", fama: 0.6 }),
        e("O {gol} soltou e quase saiu o rebote.", 0.15),
        e("Bateu na barreira.", -0.1),
        e("Foi fraco, nas mãos do {gol}.", -0.25),
        e("Acertou a barreira e o contra-ataque quase virou gol.", -0.4)] },
      { id: "deixar", rotulo: "Deixar para o batedor oficial", teste: { PROF: 1 }, dif: 0, niveis: [
        e("O {batedor} colocou no ângulo. Você abraçou primeiro.", 0.05, { golPro: true, relTecnico: 1 }),
        e("O {batedor} bateu bem, o {gol} defendeu.", 0, { relTecnico: 1 }),
        e("Na barreira.", 0), e("Por cima.", 0), e("O {batedor} isolou. Alguém na torcida gritou seu nome.", 0)] },
      { id: "ensaiada", rotulo: "Combinar uma jogada ensaiada", teste: { PAS: 0.4, VIS: 0.4, PROF: 0.2 }, dif: 10, niveis: [
        e("Você rolou e o {batedor} bateu de primeira, com a barreira desmontada. GOL! Assistência sua.", 0.5, { golPro: true, meu: "assist", relTecnico: 2 }),
        e("A jogada enganou a barreira, mas o chute saiu nas mãos do {gol}.", 0.1),
        e("A barreira não caiu na jogada.", -0.05),
        e("Ninguém entendeu o combinado e a bola ficou com eles.", -0.2),
        e("Perderam a bola na jogada ensaiada e levaram o contra-ataque.", -0.4)] },
    ] },
  { id: "penalti", titulo: ["Pênalti!", "Pênalti a favor"],
    texto: ["Derrubaram você na área. O capitão te entrega a bola.", "O {zag} pôs a mão na bola dentro da área. O {capitao} te dá a bola."],
    peso: (c) => (c.pos === "ZAG" || c.pos === "VOL" ? 0.08 : 0.25), opcoes: [
      { id: "canto", rotulo: "Bater no canto", teste: { FIN: 0.5, COM: 0.5 }, dif: -2, tracos: { frieza: 8 }, niveis: [
        e(["Bola de um lado, {gol} do outro. GOL!", "Deslocou o {gol}. GOL!"], 0.6, { golPro: true, meu: "gol" }),
        e("O {gol} tocou, mas entrou. GOL!", 0.5, { golPro: true, meu: "gol" }),
        e("O {gol} foi no canto certo e defendeu.", -0.4),
        e("Na trave!", -0.5, { moral: -3 }),
        e("Para fora. O estádio inteiro botou a mão na cabeça.", -0.8, { moral: -6 })] },
      { id: "forte", rotulo: "Encher o pé no meio", teste: { FIN: 0.4, FOR: 0.4, COM: 0.2 }, dif: 0, niveis: [
        e("Chute no meio enquanto o {gol} pulava. GOL!", 0.6, { golPro: true, meu: "gol" }),
        e("Forte, no alto. GOL!", 0.5, { golPro: true, meu: "gol" }),
        e("O {gol} ficou parado e a bola bateu nele.", -0.45),
        e("No travessão!", -0.5, { moral: -3 }),
        e("Por cima. O {gol} ainda deu tchau.", -0.8, { moral: -6 })] },
      { id: "cavadinha", rotulo: "Cavadinha", teste: { COM: 0.8, FIN: 0.2 }, dif: 10, tracos: { frieza: 10 }, niveis: [
        e("Cavadinha com o {gol} já no chão. Ousadia que vai rodar o país!", 1.0, { golPro: true, meu: "gol", fama: 1.5, seguidores: 0.08 }),
        e("Cavadinha, devagar, e entrou. GOL!", 0.6, { golPro: true, meu: "gol", fama: 0.5 }),
        e("O {gol} ficou parado e segurou. Vai ter meme.", -0.7, { moral: -5, seguidores: 0.01 }),
        e("Saiu fraca e o {gol} pegou fácil. O técnico ficou furioso.", -0.9, { relTecnico: -5, moral: -5 }),
        e("Por cima do travessão. Você virou piada no programa de domingo.", -1.1, { relTecnico: -6, moral: -7, noticia: "A cavadinha de {nome} que deu errado virou meme." })] },
      { id: "devolver", rotulo: "Devolver para o capitão", teste: { PROF: 1 }, dif: 0, niveis: [
        e("O {capitao} bateu e fez. Ele agradeceu a humildade.", 0.05, { golPro: true, relTecnico: 1 }),
        e("O {capitao} converteu.", 0, { golPro: true }),
        e("O {capitao} converteu.", 0, { golPro: true }),
        e("O {capitao} perdeu. Ninguém te culpa.", 0),
        e("O {capitao} perdeu, e a torcida queria você na bola.", -0.1)] },
    ] },
  { id: "provocacao", titulo: ["Provocação", "Catimba"],
    texto: ["O {zag} pisa no seu pé quando o juiz não está olhando e diz alguma coisa no seu ouvido.", "Toda vez que você recebe, o {vol} dá um tapinha na sua nuca e ri.", "O {craque} passa por você e diz: \"volta para a base, moleque\"."],
    peso: (c) => 0.5 + (c.idade <= 19 ? 0.2 : 0) + (c.classico ? 0.4 : 0), opcoes: [
      { id: "ignorar", rotulo: "Ignorar e jogar", teste: { CALMA: 0.7, COM: 0.3 }, dif: 0, niveis: [
        e("Você sorriu e no lance seguinte deu um drible nele. Ele saiu de cabeça quente.", 0.35),
        e("Seguiu o jogo, concentrado.", 0.15),
        e("Ficou incomodado por uns minutos.", -0.05),
        e("Perdeu a concentração e errou dois passes seguidos.", -0.25),
        e("Ficou remoendo e sumiu do jogo.", -0.4)] },
      { id: "revidar", rotulo: "Revidar", teste: { CALMA: 1 }, dif: 12, niveis: [
        e("Um empurrão de leve. O juiz deu amarelo para os dois.", -0.1, { amarelo: true }),
        e("Bate-boca e amarelo para você.", -0.2, { amarelo: true }),
        e("Empurrão no peito: amarelo e confusão.", -0.3, { amarelo: true }),
        e("Confusão generalizada. Amarelo e o técnico te chamou na beira do campo.", -0.4, { amarelo: true, relTecnico: -3 }),
        e("Cotovelada. Cartão vermelho direto.", -1.5, { vermelho: true, relTecnico: -8, moral: -6, noticia: "{nome} é expulso por revidar uma provocação." })] },
      { id: "cavar", rotulo: "Provocar de volta e cavar o cartão dele", teste: { COM: 0.4, DRI: 0.3, CARISMA: 0.3 }, dif: 14, niveis: [
        e("Ele caiu na sua e levou o segundo amarelo. Expulso! Seu time joga com um a mais.", 0.45, { fama: 0.5 }),
        e("Ele fez falta em você e levou amarelo.", 0.25),
        e("O juiz não caiu em nada.", -0.05),
        e("O juiz percebeu a malandragem e advertiu você.", -0.15),
        e("O juiz deu amarelo para você por simulação.", -0.3, { amarelo: true })] },
      { id: "juiz", rotulo: "Avisar o juiz", teste: { CALMA: 0.5, CARISMA: 0.5 }, dif: 4, niveis: [
        e("O juiz chamou o capitão deles e advertiu. A catimba acabou.", 0.2),
        e("O juiz prometeu ficar de olho.", 0.1),
        e("O juiz fez que não ouviu.", 0),
        e("Os adversários começaram a te chamar de chorão.", -0.1, { moral: -2 }),
        e("Reclamou tanto que levou amarelo.", -0.25, { amarelo: true })] },
    ] },
  { id: "juiz", titulo: ["O juiz errou", "Lance polêmico"],
    texto: ["Você foi puxado dentro da área e o juiz mandou seguir.", "Você foi derrubado na área e o juiz deu cartão para você por simulação."],
    peso: P({ ATA: 0.8, PON: 0.8, MEI: 0.5, VOL: 0.3, ZAG: 0.2, LAT: 0.3 }), opcoes: [
      { id: "seguir", rotulo: "Levantar e seguir no lance", teste: { CALMA: 0.6, PROF: 0.4 }, dif: -4, niveis: [
        e("Levantou rápido e ainda recuperou a bola. O técnico aplaudiu.", 0.25, { relTecnico: 2 }),
        e("Seguiu o jogo.", 0.05, { relTecnico: 1 }),
        e("Seguiu o jogo, resmungando.", 0),
        e("Ficou reclamando com os companheiros.", -0.1),
        e("Perdeu a cabeça por uns minutos.", -0.2)] },
      { id: "reclamar", rotulo: "Reclamar com o juiz", teste: { CALMA: 0.6, CARISMA: 0.4 }, dif: 8, niveis: [
        e("Reclamou com educação e o juiz chamou o VAR. Pênalti marcado e convertido!", 0.35, { golPro: true }),
        e("O juiz ouviu e prometeu ficar de olho.", 0.05),
        e("O juiz mandou você se afastar.", -0.05),
        e("Reclamou demais e levou amarelo.", -0.25, { amarelo: true }),
        e("Foi para cima do juiz. Vermelho direto.", -1.5, { vermelho: true, relTecnico: -8, moral: -6, noticia: "{nome} é expulso por reclamação." })] },
      { id: "capitao", rotulo: "Pedir para o capitão conversar", teste: { CARISMA: 0.5, PROF: 0.5 }, dif: 2, niveis: [
        e("O {capitao} conversou e o juiz revisou no VAR: pênalti! O {batedor} fez.", 0.3, { golPro: true }),
        e("O {capitao} conversou e o juiz passou a marcar tudo a seu favor.", 0.1),
        e("Nada mudou.", 0),
        e("O {capitao} levou amarelo por reclamação no seu lugar.", -0.05),
        e("O {capitao} reclamou que você deixou a briga para ele.", -0.15, { relTecnico: -1 })] },
    ] },
  { id: "segurar", titulo: ["Fim de jogo, vencendo", "Segurando o resultado"],
    texto: ["Minutos finais, seu time está na frente. A bola vem para você perto da bandeirinha.", "Acréscimos, vocês vencem por um gol e o {adv} está todo no ataque."],
    peso: (c) => (c.min >= 78 && c.saldo > 0 ? 3 : 0), opcoes: [
      { id: "canto", rotulo: "Segurar a bola no canto", teste: { FOR: 0.5, DRI: 0.3, COM: 0.2 }, dif: 4, niveis: [
        e("Prendeu a bola no canto por um minuto inteiro e cavou um escanteio. Experiente.", 0.4, { relTecnico: 2 }),
        e("Segurou bem e ganhou tempo.", 0.2, { relTecnico: 1 }),
        e("Perdeu, mas gastou tempo.", 0),
        e("Perdeu rápido e eles foram para cima.", -0.2),
        e("Perdeu, eles atacaram e empataram no fim.", -0.6, { golContra: true, moral: -4 })] },
      { id: "matar", rotulo: "Buscar o gol para matar o jogo", teste: { FIN: 0.4, DRI: 0.3, VEL: 0.3 }, dif: 12, niveis: [
        e("Saiu na cara e fechou o placar. GOL!", 0.6, { golPro: true, meu: "gol" }),
        e("Chutou com perigo e o {gol} mandou para escanteio.", 0.15),
        e("O chute saiu fraco.", -0.05),
        e("Perdeu a bola tentando.", -0.2, { relTecnico: -1 }),
        e("Perdeu a bola e o contra-ataque deles empatou.", -0.7, { golContra: true, relTecnico: -3 })] },
      { id: "cair", rotulo: "Cair no chão e gastar o tempo", teste: { CALMA: 0.5, COM: 0.5 }, dif: 6, niveis: [
        e("Ficou no chão o suficiente para o relógio andar. Malandragem.", 0.05),
        e("Gastou um minuto.", 0),
        e("A torcida adversária vaiou, mas o tempo passou.", -0.05, { fama: 0.2 }),
        e("O juiz deu amarelo por cera.", -0.15, { amarelo: true }),
        e("Amarelo por cera e virou assunto no pós-jogo.", -0.3, { amarelo: true, noticia: "A cera de {nome} no fim do jogo virou assunto." })] },
    ] },
  { id: "ultimoAtaque", titulo: ["Último ataque", "Abafa no fim"],
    texto: ["Acréscimos. Seu time precisa de um gol e a bola chega até você.", "Último minuto. Até o {goleiro} subiu para a área. A bola sobra no seu pé."],
    peso: (c) => (c.min >= 84 && c.saldo <= 0 ? 3 : 0), opcoes: [
      { id: "chutar", rotulo: "Chutar de onde estiver", teste: { FIN: 0.7, FOR: 0.3 }, dif: 18, tracos: { chute_longe: 8 }, niveis: [
        e("No último lance, um chute que entrou no ângulo! GOL!", 1.0, { golPro: true, meu: "gol", fama: 1.5, moral: 6 }),
        e("O {gol} espalmou no susto.", 0.1),
        e("Foi por cima.", -0.05),
        e("Foi longe.", -0.15),
        e("Pegou mal. Fim de jogo.", -0.3)] },
      { id: "area", rotulo: "Levantar na área", teste: { CRU: 0.6, VIS: 0.4 }, dif: 10, niveis: [
        e("Na cabeça do {zagMeu}, que subiu: GOL no último minuto! Assistência sua!", 0.8, { golPro: true, meu: "assist", moral: 5 }),
        e("A bola passou por todo mundo, quase.", 0.1),
        e("A zaga afastou.", 0),
        e("O {gol} saiu e ficou com ela.", -0.1),
        e("O cruzamento saiu pela linha de fundo. Fim.", -0.2)] },
      { id: "jogada", rotulo: "Tentar a jogada individual", teste: { DRI: 0.6, VEL: 0.2, COM: 0.2 }, dif: 15, tracos: { ginga: 6 }, niveis: [
        e("Passou por dois e sofreu pênalti. Convertido no último minuto!", 0.7, { golPro: true, moral: 5 }),
        e("Passou por um e chutou cruzado, rente à trave.", 0.15),
        e("Foi travado.", -0.05),
        e("Perdeu a bola.", -0.15),
        e("Perdeu a bola e eles ainda fizeram mais um.", -0.4, { golContra: true })] },
    ] },
  { id: "discussao", titulo: ["Discussão com companheiro", "Clima quente no time"],
    texto: ["O {comp} grita com você por não ter passado a bola no lance anterior.", "O {meia} reclama de braços abertos que você não voltou para marcar."],
    peso: () => 0.45, opcoes: [
      { id: "desculpa", rotulo: "Pedir desculpa e seguir", teste: { CALMA: 0.5, PROF: 0.5 }, dif: -4, niveis: [
        e("Pediu desculpa e no lance seguinte deu um passe para ele. O vestiário vai lembrar disso.", 0.2, { relTecnico: 2, moral: 2 }),
        e("Fez sinal de positivo e o assunto morreu.", 0.05, { relTecnico: 1 }),
        e("Seguiu o jogo.", 0),
        e("Ele continuou reclamando e você ficou mexido.", -0.1, { moral: -2 }),
        e("Ele não aceitou e os dois ficaram se evitando no resto do jogo.", -0.2, { moral: -3 })] },
      { id: "responder", rotulo: "Responder na mesma moeda", teste: { CALMA: 0.6, CARISMA: 0.4 }, dif: 8, niveis: [
        e("Respondeu firme e ganhou respeito. Os dois riram depois.", 0.1, { moral: 2 }),
        e("Bate-boca rápido, o capitão separou.", -0.05),
        e("A torcida viu a discussão e vaiou.", -0.15),
        e("O técnico te chamou na beira do campo e mandou parar.", -0.25, { relTecnico: -3 }),
        e("Empurrão entre companheiros. As câmeras pegaram tudo.", -0.5, { relTecnico: -5, moral: -4, noticia: "{nome} e {comp} discutem em campo; clima esquenta no {meu}." })] },
      { id: "capitao", rotulo: "Chamar o capitão para resolver", teste: { CARISMA: 0.5, PROF: 0.5 }, dif: 0, niveis: [
        e("O {capitao} juntou os dois e o time voltou focado.", 0.15, { relTecnico: 2 }),
        e("O {capitao} acalmou os ânimos.", 0.05, { relTecnico: 1 }),
        e("O {capitao} deu de ombros.", 0),
        e("O {capitao} deu razão para o outro.", -0.1, { moral: -2 }),
        e("O {capitao} brigou com os dois.", -0.15, { moral: -2 })] },
    ] },
  { id: "vaias", titulo: ["A torcida pegou no seu pé", "Vaias"],
    texto: ["Depois de um passe errado, uma parte da torcida começa a te vaiar a cada toque na bola.", "A torcida do {adv} canta seu nome com xingamentos a cada vez que você pega na bola."],
    peso: (c) => (c.moral < 45 ? 0.8 : 0.25) + (c.fama > 40 ? 0.4 : 0) + (c.classico ? 0.3 : 0), opcoes: [
      { id: "pedir", rotulo: "Pedir a bola e se esconder menos", teste: { COM: 0.5, CALMA: 0.3, PAS: 0.2 }, dif: 6, niveis: [
        e("Pediu todas as bolas e acertou tudo. No fim, a vaia virou aplauso.", 0.5, { moral: 5, fama: 0.4 }),
        e("Se apresentou e jogou bem. As vaias diminuíram.", 0.25, { moral: 2 }),
        e("Jogou o normal.", 0),
        e("Pediu a bola e errou de novo. As vaias aumentaram.", -0.25, { moral: -3 }),
        e("Errou tudo o que tentou. Saiu cabisbaixo.", -0.45, { moral: -6 })] },
      { id: "simples", rotulo: "Jogar simples até a poeira baixar", teste: { CALMA: 0.6, PAS: 0.4 }, dif: -2, niveis: [
        e("Jogou simples, sem erro. A torcida esqueceu.", 0.2, { moral: 1 }),
        e("Tocou de lado e o jogo seguiu.", 0.1),
        e("Desapareceu um pouco do jogo.", -0.05),
        e("O técnico achou que você se escondeu.", -0.15, { relTecnico: -2 }),
        e("Se escondeu tanto que o técnico te substituiu.", -0.3, { relTecnico: -3, moral: -3, sai: true })] },
      { id: "responder", rotulo: "Mandar beijo para a arquibancada", teste: { CARISMA: 0.6, CALMA: 0.4 }, dif: 10, niveis: [
        e("Mandou beijo e caprichou no drible seguinte. Virou ídolo de quem gosta de atrevimento.", 0.2, { fama: 1, seguidores: 0.05 }),
        e("O gesto caiu bem nas redes.", 0.05, { fama: 0.5, seguidores: 0.02 }),
        e("A vaia ficou mais alta.", -0.1, { fama: 0.3 }),
        e("O gesto virou polêmica.", -0.15, { fama: 0.4, noticia: "O gesto de {nome} para a torcida dividiu opiniões." }),
        e("Amarelo por provocar a torcida e briga nas redes a semana inteira.", -0.35, { amarelo: true, moral: -3, noticia: "{nome} leva amarelo por provocar a torcida." })] },
    ] },
  { id: "instrucao", titulo: ["Instrução do técnico", "Mudança no meio do jogo"],
    texto: ["O técnico grita da beira do campo para você jogar mais preso, ajudando na marcação.", "O técnico manda você trocar de lado com o {ponta} e abrir o campo."],
    peso: () => 0.45, opcoes: [
      { id: "obedecer", rotulo: "Cumprir à risca", teste: { PROF: 0.6, POS: 0.4 }, dif: 0, niveis: [
        e("Cumpriu a função com perfeição. O técnico te elogiou na coletiva.", 0.3, { relTecnico: 4 }),
        e("Fez o que foi pedido.", 0.15, { relTecnico: 2 }),
        e("Fez o que pôde fora da sua posição.", 0, { relTecnico: 1 }),
        e("Ficou perdido na nova função.", -0.15),
        e("Ficou tão perdido que o time sofreu pelo seu lado.", -0.35, { relTecnico: -1 })] },
      { id: "argumentar", rotulo: "Argumentar com o técnico", teste: { CARISMA: 0.5, CALMA: 0.3, VIS: 0.2 }, dif: 10, niveis: [
        e("Explicou o que via em campo e o técnico deixou. Você estava certo.", 0.25, { relTecnico: 2 }),
        e("O técnico ouviu e ajustou um pouco.", 0.1),
        e("O técnico fez sinal para você calar a boca e cumprir.", -0.05, { relTecnico: -1 }),
        e("A discussão chamou a atenção das câmeras.", -0.15, { relTecnico: -3 }),
        e("O técnico te tirou na hora. Discussão feia na beira do campo.", -0.4, { relTecnico: -7, moral: -4, sai: true, noticia: "{nome} discute com o técnico e é substituído." })] },
      { id: "ignorar", rotulo: "Fazer que não ouviu", teste: { COM: 0.5, DRI: 0.5 }, dif: 14, niveis: [
        e("Ignorou, fez a jogada do seu jeito e deu certo. O técnico riu de nervoso.", 0.3, { relTecnico: -1 }),
        e("Seguiu no seu jeito e o jogo não mudou.", 0, { relTecnico: -2 }),
        e("O técnico gritou mais alto.", -0.05, { relTecnico: -3 }),
        e("O técnico perdeu a paciência.", -0.15, { relTecnico: -5 }),
        e("Substituído na hora, e o técnico nem te cumprimentou.", -0.35, { relTecnico: -8, moral: -3, sai: true })] },
    ] },
  { id: "dor", titulo: ["Sentiu a coxa", "Dor muscular"],
    texto: ["Numa arrancada, você sente uma fisgada na parte de trás da coxa.", "Depois de uma pancada, o tornozelo começa a doer a cada passo."],
    peso: (c) => (c.min > 25 ? 0.35 : 0), opcoes: [
      { id: "pedir", rotulo: "Pedir substituição", teste: { PROF: 1 }, dif: -10, niveis: [
        e("Saiu com cuidado. O departamento médico disse que foi só um susto.", 0, { relTecnico: 1, sai: true }),
        e("Saiu. Nada sério.", 0, { sai: true }),
        e("Saiu. Uma semana de tratamento.", 0, { lesao: 1, sai: true }),
        e("Saiu. Uma semana de tratamento.", 0, { lesao: 1, sai: true }),
        e("Saiu na hora certa: lesão leve, poderia ter sido pior.", 0, { lesao: 2, sai: true })] },
      { id: "continuar", rotulo: "Continuar jogando", teste: { RES: 0.6, FOR: 0.4 }, dif: 10, niveis: [
        e("A dor passou com o jogo e você ainda foi bem. Raça.", 0.2, { relTecnico: 1, moral: 2 }),
        e("Aguentou até o fim mancando, sem comprometer.", 0),
        e("Jogou no sacrifício e rendeu pouco.", -0.25),
        e("Teve que sair dez minutos depois. A lesão piorou.", -0.2, { lesao: 2, sai: true }),
        e("Forçou e a lesão rompeu. Saiu de maca.", -0.3, { lesao: 5, sai: true, moral: -5, noticia: "{nome} força e sai de maca; desfalque de semanas." })] },
      { id: "spray", rotulo: "Pedir atendimento e voltar", teste: { RES: 0.5, PROF: 0.5 }, dif: 4, niveis: [
        e("Gelo, spray, e voltou inteiro.", 0.05),
        e("Voltou e terminou o jogo.", 0),
        e("Voltou, mas o médico vai te segurar na semana.", -0.05, { lesao: 1 }),
        e("Voltou e saiu de novo pouco depois.", -0.15, { lesao: 2, sai: true }),
        e("Voltou, piorou e vai ficar fora um tempo.", -0.25, { lesao: 4, sai: true })] },
    ] },
  { id: "fairPlay", titulo: ["Adversário caído", "Jogador no chão"],
    texto: ["O {vol} está caído no meio-campo, com a mão na perna. A bola está no seu pé e o time deles reclama.", "Um adversário está no chão segurando o joelho. Você está com a bola, livre, perto da área deles."],
    peso: () => 0.35, opcoes: [
      { id: "fora", rotulo: "Jogar a bola para fora", teste: { PROF: 0.6, CARISMA: 0.4 }, dif: -10, niveis: [
        e("Bola para fora e o estádio inteiro aplaudiu. Os adversários vieram te cumprimentar.", 0.1, { fama: 0.5, seguidores: 0.01 }),
        e("Fair play reconhecido pelos dois lados.", 0.05, { fama: 0.2 }),
        e("Jogou para fora, como manda o costume.", 0),
        e("Jogou para fora. Era cera dele.", 0),
        e("Jogou para fora e eles devolveram com a bola no seu goleiro. Tudo certo.", 0)] },
      { id: "seguir", rotulo: "Seguir a jogada", teste: { FIN: 0.4, DRI: 0.3, CALMA: 0.3 }, dif: 10, niveis: [
        e("Seguiu e o lance virou gol. Ele estava fazendo cera, o juiz confirmou.", 0.4, { golPro: true, meu: "gol" }),
        e("Seguiu, chutou e o juiz parou para o atendimento depois.", 0.05),
        e("O juiz parou o jogo antes.", 0),
        e("A torcida adversária te vaiou até o fim.", -0.1, { fama: 0.2 }),
        e("Seguiu e fez o gol enquanto ele estava machucado de verdade. Polêmica nacional.", 0.1, { golPro: true, meu: "gol", moral: -3, noticia: "Gol de {nome} com adversário caído gera polêmica." })] },
    ] },
  { id: "briga", titulo: ["Confusão generalizada", "Empurra-empurra"],
    texto: ["Uma entrada dura no {comp} e os dois times se encontram no meio do campo.", "Briga perto da área: o {zag} empurrou o {meia} e todo mundo correu para lá."],
    peso: (c) => 0.15 + (c.classico ? 0.5 : 0) + (c.min > 70 ? 0.1 : 0), opcoes: [
      { id: "separar", rotulo: "Entrar para separar", teste: { CALMA: 0.6, FOR: 0.4 }, dif: 0, niveis: [
        e("Abraçou o {comp} e tirou ele da confusão antes do vermelho. O técnico agradeceu depois.", 0.15, { relTecnico: 3 }),
        e("Ajudou a acalmar.", 0.05, { relTecnico: 1 }),
        e("Ninguém te ouviu.", 0),
        e("Levou um empurrão e o juiz te deu amarelo junto com todo mundo.", -0.15, { amarelo: true }),
        e("Tentou separar, levou um soco, revidou. Vermelho.", -1.2, { vermelho: true, relTecnico: -4, noticia: "Briga generalizada termina com {nome} expulso." })] },
      { id: "longe", rotulo: "Ficar longe", teste: { CALMA: 1 }, dif: -15, niveis: [
        e("Ficou longe e ainda pegou água para o time. Cabeça boa.", 0.05),
        e("Ficou longe.", 0),
        e("Ficou longe. Alguns companheiros acharam que você não defendeu o grupo.", 0, { moral: -1 }),
        e("Ficou longe e virou piada no vestiário.", -0.05, { moral: -2 }),
        e("O {comp} cobrou você no vestiário.", -0.05, { moral: -3 })] },
      { id: "entrar", rotulo: "Defender o companheiro", teste: { CALMA: 0.7, FOR: 0.3 }, dif: 14, niveis: [
        e("Peitou e saiu sem cartão. O grupo vai lembrar.", 0, { moral: 3 }),
        e("Amarelo, mas o grupo sentiu o apoio.", -0.15, { amarelo: true, moral: 2 }),
        e("Amarelo e o técnico não gostou.", -0.2, { amarelo: true, relTecnico: -2 }),
        e("Amarelo e muita reclamação.", -0.25, { amarelo: true, relTecnico: -3 }),
        e("Vermelho direto. O time ficou com um a menos.", -1.3, { vermelho: true, relTecnico: -6, noticia: "{nome} é expulso na confusão." })] },
    ] },
  { id: "chuva", titulo: ["Campo encharcado", "Chuva forte"],
    texto: ["O temporal transformou o gramado num lago. A bola para nas poças. Você recebe perto da área.", "Chove muito. A bola escorrega e quica estranho. Você vai em direção ao gol."],
    peso: (c) => (c.chuva ? 2.2 : 0), opcoes: [
      { id: "chutar", rotulo: "Chutar rasteiro para o goleiro soltar", teste: { FIN: 0.6, FOR: 0.4 }, dif: 10, niveis: [
        e("A bola quicou na frente do {gol} e entrou. GOL!", 0.7, { golPro: true, meu: "gol" }),
        e("O {gol} soltou e o {comp} quase pegou o rebote.", 0.15),
        e("O chute morreu numa poça.", -0.05),
        e("Escorregou na hora de bater.", -0.15),
        e("Escorregou, caiu e a bola ficou com eles.", -0.25)] },
      { id: "levantar", rotulo: "Levantar a bola por cima da água", teste: { PAS: 0.5, VIS: 0.3, COM: 0.2 }, dif: 8, niveis: [
        e("Cavou por cima da poça para o {comp}, que bateu de primeira. GOL! Assistência sua.", 0.6, { golPro: true, meu: "assist" }),
        e("A bola chegou no {comp}, mas ele dominou mal.", 0.1),
        e("A bola caiu na poça e parou.", -0.05),
        e("Levantou demais.", -0.15),
        e("A bola parou na água e o adversário saiu jogando.", -0.25)] },
      { id: "conduzir", rotulo: "Conduzir pelo lado seco", teste: { DRI: 0.6, VEL: 0.2, COM: 0.2 }, dif: 12, niveis: [
        e("Achou o único pedaço seco do campo e driblou até o gol. GOL!", 0.8, { golPro: true, meu: "gol", fama: 0.4 }),
        e("Conduziu bem e sofreu falta.", 0.2),
        e("Foi parado pela marcação.", -0.05),
        e("A bola ficou na poça e você seguiu sem ela.", -0.2, { seguidores: 0.005 }),
        e("Escorregou feio e torceu o tornozelo.", -0.3, { lesao: 2 })] },
    ] },
  { id: "estreia", titulo: ["Estreia", "Primeiro jogo no profissional"],
    texto: ["Primeiro jogo como profissional. As pernas tremem. A primeira bola chega para você.", "Estreia no {estadio}. O narrador fala seu nome pela primeira vez. Primeira bola no seu pé."],
    peso: (c) => (c.estreia ? 6 : 0), opcoes: [
      { id: "simples", rotulo: "Tocar simples para ganhar confiança", teste: { CALMA: 0.5, PAS: 0.5 }, dif: -6, niveis: [
        e("Toque simples, depois outro, e o jogo ficou fácil. Estreia segura.", 0.3, { moral: 4, relTecnico: 2 }),
        e("Começou bem, sem inventar.", 0.15, { moral: 3 }),
        e("Ficou nervoso, mas não comprometeu.", 0, { moral: 1 }),
        e("Errou os primeiros passes.", -0.15, { moral: -2 }),
        e("O nervosismo tomou conta. Estreia para esquecer.", -0.35, { moral: -4 })] },
      { id: "ousar", rotulo: "Partir para cima no primeiro lance", teste: { DRI: 0.5, COM: 0.3, CARISMA: 0.2 }, dif: 10, niveis: [
        e("Driblou dois no primeiro toque. A torcida já sabe seu nome.", 0.45, { fama: 1, moral: 5, seguidores: 0.08 }),
        e("Bom primeiro lance. A torcida gostou.", 0.2, { fama: 0.4, moral: 3 }),
        e("Perdeu a bola, mas mostrou personalidade.", -0.05, { moral: 1 }),
        e("Perdeu a bola e ficou tímido o resto do jogo.", -0.2, { moral: -2 }),
        e("Perdeu a bola e o contra-ataque virou gol. Estreia amarga.", -0.5, { golContra: true, moral: -5 })] },
    ] },
  { id: "responsabilidade", titulo: ["O time está travado", "Chamar a responsabilidade"],
    texto: ["O jogo é decisivo e o time está nervoso. Ninguém quer a bola.", "A torcida está apreensiva e o time erra passe atrás de passe. Você olha para os companheiros."],
    peso: (c) => (c.briga ? 1.4 : c.reta ? 0.5 : 0) + (c.saldo < 0 ? 0.3 : 0), opcoes: [
      { id: "chamar", rotulo: "Pedir a bola e liderar", teste: { CARISMA: 0.3, COM: 0.4, DRI: 0.3 }, dif: 8, tracos: { lider_nato: 10 }, niveis: [
        e("Pediu todas, acertou todas e o time cresceu junto. Saiu o gol do {comp} logo depois. Assistência sua!", 0.7, { golPro: true, meu: "assist", fama: 0.8, relTecnico: 3 }),
        e("Assumiu o jogo e o time se acalmou.", 0.35, { relTecnico: 2, moral: 2 }),
        e("Tentou, mas o time seguiu travado.", 0),
        e("Pediu e errou. A pressão aumentou.", -0.2, { moral: -2 }),
        e("Pediu a bola e perdeu num lance que virou gol deles.", -0.6, { golContra: true, moral: -5 })] },
      { id: "falar", rotulo: "Juntar o time numa parada", teste: { CARISMA: 0.7, PROF: 0.3 }, dif: 6, tracos: { lider_nato: 12 }, niveis: [
        e("Juntou todo mundo numa parada para atendimento e falou firme. O time voltou outro.", 0.3, { relTecnico: 3, moral: 3 }),
        e("Algumas palavras e o time acordou.", 0.15, { relTecnico: 1 }),
        e("Ninguém prestou muita atenção.", 0),
        e("Os veteranos não gostaram de ouvir o garoto.", -0.05, { moral: -2 }),
        e("O {capitao} te mandou cuidar da sua vida.", -0.1, { moral: -3 })] },
      { id: "esperar", rotulo: "Fazer a sua parte e esperar", teste: { PROF: 0.6, POS: 0.4 }, dif: 0, niveis: [
        e("Jogou o seu e o jogo destravou sozinho.", 0.15),
        e("Fez a sua parte.", 0.05),
        e("Passou despercebido.", 0),
        e("A torcida esperava mais de você.", -0.1, { moral: -1 }),
        e("O técnico disse depois que faltou personalidade.", -0.15, { relTecnico: -2 })] },
    ] },
  { id: "golAnulado", titulo: ["Gol em revisão", "O VAR chamou"],
    texto: ["Você empurrou para a rede, mas o juiz põe a mão no ouvido. O VAR vai revisar um possível impedimento.", "Você marcou, mas o {zag} jura que houve falta no lance. O juiz vai ao monitor."],
    peso: (c) => (c.pos === "ATA" || c.pos === "PON" ? 0.35 : 0.1), opcoes: [
      { id: "comemorar", rotulo: "Comemorar mesmo assim", teste: { CARISMA: 0.5, COM: 0.5 }, dif: 6, niveis: [
        e("Gol confirmado! Você já estava na grade abraçando a torcida.", 0.5, { golPro: true, meu: "gol", moral: 3 }),
        e("Gol confirmado.", 0.4, { golPro: true, meu: "gol" }),
        e("Gol anulado por centímetros. Comemorou à toa.", -0.05, { moral: -2 }),
        e("Gol anulado e o vídeo da sua comemoração virou meme.", -0.1, { moral: -3, seguidores: 0.01 }),
        e("Anulado, você reclamou demais e levou amarelo.", -0.3, { amarelo: true, moral: -3 })] },
      { id: "esperar", rotulo: "Esperar em silêncio", teste: { CALMA: 1 }, dif: -4, niveis: [
        e("Gol confirmado! Explosão no estádio.", 0.4, { golPro: true, meu: "gol" }),
        e("Gol confirmado.", 0.4, { golPro: true, meu: "gol" }),
        e("Anulado. Impedimento por um ombro.", -0.05),
        e("Anulado. Falta no início da jogada.", -0.05),
        e("Anulado e o time perdeu a concentração.", -0.15, { moral: -2 })] },
    ] },
  // ---- raros
  { id: "torcedor", rara: true, titulo: "Invasão de campo", texto: ["Um torcedor pula o alambrado, desvia dos seguranças e corre na sua direção pedindo uma selfie.", "Um menino invade o campo, chorando, e corre para te abraçar."],
    peso: (c) => 0.06 + c.fama / 600, opcoes: [
      { id: "abracar", rotulo: "Abraçar e tirar a foto", teste: { CARISMA: 1 }, dif: -10, niveis: [
        e("A foto rodou o país. Gesto mais bonito da rodada.", 0, { fama: 1.5, seguidores: 0.1, moral: 4, noticia: "O abraço de {nome} no torcedor que invadiu o campo emocionou o país." }),
        e("Abraço e selfie. Os seguranças levaram ele sorrindo.", 0, { fama: 0.8, seguidores: 0.04, moral: 3 }),
        e("Abraçou e entregou para os seguranças.", 0, { fama: 0.3, seguidores: 0.01 }),
        e("O juiz reclamou da demora.", 0, { fama: 0.2 }),
        e("O juiz achou que você incentivou e deu amarelo.", -0.1, { amarelo: true, fama: 0.5 })] },
      { id: "seguranca", rotulo: "Chamar os seguranças", teste: { PROF: 1 }, dif: -10, niveis: [
        e("Os seguranças levaram ele com cuidado. Você acenou.", 0), e("Os seguranças tiraram ele.", 0), e("Os seguranças tiraram ele.", 0),
        e("Nas redes, acharam você frio.", 0, { seguidores: -0.005 }), e("O vídeo do torcedor sendo levado virou crítica a você.", 0, { moral: -2 })] },
    ] },
  { id: "bracadeira", rara: true, titulo: "A braçadeira", texto: "O {capitao} é substituído e, saindo de campo, coloca a braçadeira de capitão no seu braço.",
    peso: (c) => (c.base ? 0.05 : 0.08) + (c.relTecnico > 70 ? 0.08 : 0), opcoes: [
      { id: "aceitar", rotulo: "Assumir e organizar o time", teste: { CARISMA: 0.6, PROF: 0.4 }, dif: 4, tracos: { lider_nato: 12 }, niveis: [
        e("Capitão por meia hora, e o time jogou como nunca. Os mais velhos começaram a te ouvir.", 0.4, { relTecnico: 5, fama: 0.6, moral: 5 }),
        e("Organizou o time com segurança.", 0.2, { relTecnico: 3, moral: 3 }),
        e("Usou a braçadeira sem mudar muita coisa.", 0.05, { moral: 2 }),
        e("Ficou tímido com a responsabilidade.", -0.05),
        e("Discutiu com o juiz como capitão e levou amarelo.", -0.2, { amarelo: true })] },
      { id: "passar", rotulo: "Passar para um veterano", teste: { PROF: 0.6, CARISMA: 0.4 }, dif: -4, niveis: [
        e("Passou a braçadeira para o mais velho. Respeito que o grupo notou.", 0.1, { relTecnico: 2, moral: 2 }),
        e("Passou para o veterano.", 0.05, { relTecnico: 1 }),
        e("Passou para o veterano.", 0), e("O técnico queria você com ela.", 0, { relTecnico: -1 }), e("O {capitao} ficou chateado depois.", 0, { moral: -1 })] },
    ] },
  { id: "apagao", rara: true, titulo: "Apagão no estádio", texto: ["Os refletores do {estadio} se apagam. Vinte minutos de jogo parado, todo mundo esfriando.", "Queda de energia. O jogo fica parado, e o técnico reúne todos à beira do campo."],
    peso: () => 0.05, opcoes: [
      { id: "aquecer", rotulo: "Manter o corpo aquecido", teste: { PROF: 0.6, RES: 0.4 }, dif: -4, niveis: [
        e("Ficou correndo na lateral. Voltou mais ligado que todo mundo.", 0.3, { relTecnico: 2 }),
        e("Voltou bem.", 0.1), e("Voltou frio, como todos.", 0), e("Sentiu a coxa na volta.", -0.1), e("Esfriou e sentiu uma fisgada.", -0.2, { lesao: 1 })] },
      { id: "torcida", rotulo: "Puxar a lanterna do celular com a torcida", teste: { CARISMA: 1 }, dif: -4, niveis: [
        e("O estádio inteiro acendeu as lanternas. Imagem que rodou o mundo.", 0, { fama: 1.5, seguidores: 0.1 }),
        e("A torcida acompanhou. Momento bonito.", 0, { fama: 0.6, seguidores: 0.04 }),
        e("Uma parte da torcida acompanhou.", 0, { fama: 0.2, seguidores: 0.01 }),
        e("O técnico pediu para você focar.", 0, { relTecnico: -1 }),
        e("Voltou frio e errou o primeiro lance.", -0.1)] },
    ] },
  { id: "classico", titulo: ["Clássico", "Clima de clássico"],
    texto: ["Clássico contra o {adv}. A torcida rival atrás do gol joga copos e canta contra você.", "É clássico. Cada dividida vale como um gol para as duas torcidas. A bola sobra para você perto da torcida deles."],
    peso: (c) => (c.classico ? 1.6 : 0), opcoes: [
      { id: "jogo", rotulo: "Jogar com raça e cabeça fria", teste: { CALMA: 0.4, FOR: 0.3, MAR: 0.3 }, dif: 6, niveis: [
        e("Ganhou todas as divididas sem cartão. A torcida já te trata como herói do clássico.", 0.5, { fama: 1, moral: 4 }),
        e("Raça e inteligência. Atuação de clássico.", 0.3, { fama: 0.4, moral: 2 }),
        e("Jogo pegado, sem nada de mais.", 0),
        e("Amarelo numa dividida mais forte.", -0.2, { amarelo: true }),
        e("Perdeu a cabeça com a torcida rival e levou vermelho.", -1.3, { vermelho: true, relTecnico: -6, noticia: "{nome} perde a cabeça no clássico e é expulso." })] },
      { id: "show", rotulo: "Partir para cima da torcida rival com drible", teste: { DRI: 0.6, COM: 0.4 }, dif: 14, tracos: { ginga: 8 }, niveis: [
        e("Driblou três na frente da torcida deles e cruzou para o gol do {comp}. Lance de ídolo!", 0.8, { golPro: true, meu: "assist", fama: 1.5, seguidores: 0.06 }),
        e("Drible humilhante na frente da torcida rival. Os seus foram à loucura.", 0.3, { fama: 0.8, seguidores: 0.04 }),
        e("Não passou, mas a torcida gostou da ousadia.", 0, { fama: 0.2 }),
        e("Perdeu a bola e a torcida rival comemorou como gol.", -0.2, { moral: -2 }),
        e("Perdeu a bola e o contra-ataque terminou em gol deles.", -0.5, { golContra: true, moral: -4 })] },
    ] },
  // ---- fases da carreira
  { id: "marcacaoDupla", titulo: ["Marcação dupla", "Dois em cima de você"],
    texto: ["Você virou o perigo do time. O técnico deles colocou o {vol} e o {zag} só para te marcar.", "Toda bola que chega em você vem com dois adversários junto."],
    peso: (c) => (c.fama >= 45 && c.pos !== "ZAG" ? 1.1 : 0), opcoes: [
      { id: "atrair", rotulo: "Atrair os dois e soltar a bola", teste: { PAS: 0.5, VIS: 0.5 }, dif: 4, niveis: [
        e("Atraiu os dois e achou o {comp} sozinho. Gol, assistência sua!", 0.6, { golPro: true, meu: "assist", relTecnico: 2 }),
        e("Liberou espaço para os companheiros o jogo inteiro.", 0.3, { relTecnico: 2 }),
        e("Tocou de lado, sem risco.", 0.05), e("O passe foi cortado.", -0.15), e("Perdeu a bola entre os dois.", -0.3)] },
      { id: "encarar", rotulo: "Encarar os dois", teste: { DRI: 0.7, FOR: 0.3 }, dif: 18, tracos: { ginga: 8, drible_curto: 8 }, niveis: [
        e("Passou pelos dois de uma vez e bateu no canto. GOL! Lance de quem é diferente.", 1.0, { golPro: true, meu: "gol", fama: 1.2, seguidores: 0.05 }),
        e("Passou pelos dois e sofreu falta perigosa.", 0.35, { fama: 0.3 }),
        e("Passou pelo primeiro, o segundo travou.", -0.05), e("Desarmado.", -0.2),
        e("Desarmado, contra-ataque e gol deles.", -0.5, { golContra: true })] },
      { id: "mover", rotulo: "Sair da zona e jogar sem a bola", teste: { POS: 0.5, VIS: 0.3, RES: 0.2 }, dif: 6, niveis: [
        e("Arrastou a marcação para fora e o time fez a festa pelo meio.", 0.35, { relTecnico: 3 }),
        e("Movimentação inteligente.", 0.2, { relTecnico: 1 }), e("Ficou longe do jogo.", -0.05), e("Sumiu do jogo.", -0.2), e("A torcida perguntou onde você estava.", -0.3, { moral: -2 })] },
    ] },
  { id: "veterano", titulo: ["O garoto deles", "Novato atrevido"],
    texto: ["Um garoto de 18 anos do {adv} te dá uma caneta e debocha: \"o tempo passa, hein?\"", "O menino que acabou de subir no {adv} corre para cima de você em toda jogada."],
    peso: (c) => (c.idade >= 30 && !c.base ? 1 : 0), opcoes: [
      { id: "experiencia", rotulo: "Usar a experiência", teste: { POS: 0.4, CALMA: 0.4, VIS: 0.2 }, dif: 0, niveis: [
        e("Esperou o momento certo e tomou a bola dele sem esforço. A experiência venceu.", 0.4, { moral: 3, relTecnico: 1 }),
        e("Controlou o garoto com o posicionamento.", 0.25), e("Duelo equilibrado.", 0),
        e("O garoto foi melhor hoje.", -0.2, { moral: -2 }), e("O garoto te deixou na saudade e virou assunto: \"a renovação chegou\".", -0.4, { moral: -4, noticia: "Garoto do {adv} brilha em cima do veterano {nome}." })] },
      { id: "conselho", rotulo: "No fim, dar um conselho a ele", teste: { CARISMA: 0.6, PROF: 0.4 }, dif: -4, niveis: [
        e("Abraçou o garoto no fim e deu um conselho. A foto virou símbolo de respeito.", 0.05, { fama: 0.8, seguidores: 0.03, moral: 2 }),
        e("Conversaram no fim. Ele agradeceu.", 0, { fama: 0.3, moral: 1 }), e("Cumprimentou no fim.", 0), e("Ele nem ouviu.", 0), e("Ele riu da sua cara.", 0, { moral: -1 })] },
      { id: "pancada", rotulo: "Mostrar quem manda na primeira dividida", teste: { FOR: 0.5, CALMA: 0.5 }, dif: 8, niveis: [
        e("Chegada forte e limpa. O garoto entendeu o recado.", 0.2), e("Recado dado, sem cartão.", 0.1), e("Falta.", -0.05),
        e("Amarelo. O garoto riu.", -0.25, { amarelo: true }), e("Vermelho. O garoto ganhou o duelo sem tocar na bola.", -1.2, { vermelho: true, relTecnico: -5 })] },
    ] },
  { id: "pernasPesadas", titulo: "As pernas pesam", texto: ["Fim de jogo, você está no limite. O {ata} parte em velocidade.", "Os últimos minutos cobram a conta. A bola vem e você mal sente as pernas."],
    peso: (c) => (c.min >= 72 && (c.idade >= 31 || c.moral < 35) ? 0.9 : 0), opcoes: [
      { id: "raça", rotulo: "Ir no limite", teste: { RES: 0.7, PROF: 0.3 }, dif: 6, niveis: [
        e("Foi buscar forças sabe-se lá onde e salvou o lance. Aplausos de pé.", 0.4, { moral: 3, fama: 0.4 }),
        e("Aguentou.", 0.15), e("Chegou atrasado, mas sem dano.", 0), e("Câimbra. Ficou no chão alguns minutos.", -0.15), e("Sentiu a posterior.", -0.25, { lesao: 2, sai: true })] },
      { id: "pedir", rotulo: "Pedir para sair", teste: { PROF: 1 }, dif: -10, niveis: [
        e("O técnico entendeu. Saiu aplaudido.", 0, { sai: true, relTecnico: 1 }), e("Saiu.", 0, { sai: true }), e("Saiu.", 0, { sai: true }),
        e("Saiu. O técnico achou cedo.", -0.05, { sai: true, relTecnico: -1 }), e("Saiu e a torcida vaiou a troca.", -0.05, { sai: true, moral: -1 })] },
    ] },
];
