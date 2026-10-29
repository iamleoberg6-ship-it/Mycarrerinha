// Mais lances de decisão: meio-campo, defesa, pontas, goleiro, pressão da torcida, vestiário e a
// convivência com os companheiros (ligada ao histórico do elenco). Mesmo formato dos outros arquivos de lances.
import { e, P, type Situacao } from "./base.js";

export const NOVOS: Situacao[] = [
  { id: "rouboNoMeio", titulo: ["Roubo no meio-campo", "A bola é sua no meio"],
    texto: ["O {meia} do {adv} perde a bola bem na sua frente. Dá para roubar agora ou fechar o espaço.", "Sobra a bola na intermediária, com um adversário em pé de dar o bote."],
    peso: P({ VOL: 2.4, MEI: 2, LAT: 0.6 }), opcoes: [
      { id: "pressionar", rotulo: "Pressionar e roubar", teste: { MAR: 0.5, FOR: 0.3, VEL: 0.2 }, dif: 7, niveis: [
        e(["Roubou limpo e saiu jogando. A torcida explodiu.", "Desarme perfeito e a bola foi direto para o ataque."], 0.5, { moral: 2, relTecnico: 1 }),
        e("Roubou e tocou de primeira para o lado certo.", 0.25),
        e(["Chegou junto, mas a bola ficou com o {adv}.", "O {meia} passou por você com facilidade."], -0.1),
        e("Falta feia para cima do adversário. Tiro livre e amarelo para você.", -0.35, { amarelo: true }),
        e("Carrinho atrasado. Você viu o cartão vermelho e o {adv} cobrou no meio do gramado.", -1.2, { vermelho: true, moral: -4, relTecnico: -2 })] },
      { id: "fechar", rotulo: "Recuar e fechar o espaço", teste: { POS: 0.5, VIS: 0.3, CALMA: 0.2 }, dif: 3, niveis: [
        e(["Fechou a linha de passe e o {meia} voltou sem saída.", "Você leu o lance e a bola ficou presa no pé do {meia}."], 0.4, { relTecnico: 1 }),
        e("Fechou bem e o adversário cruzou para a lateral.", 0.15),
        e("O adversário girou e você ficou para trás, mas a bola não chegou.", -0.1),
        e("Ficou no meio do caminho e o passe saiu limpo.", -0.3),
        e("Dormiu no lance e o {meia} saiu em velocidade. Quase gol.", -0.8, { moral: -3, relTecnico: -1 })] },
    ] },
  { id: "contraAtaqueDois", titulo: ["Dois contra um", "Contra-ataque pela frente"],
    texto: ["Dois atacantes do {adv} vêm em sua direção, e só um zagueiro para cobrir. Você tem a bola.", "A bola chega no seu pé, com dois companheiros do {adv} na sua frente."],
    peso: P({ ZAG: 2, VOL: 1.6, MEI: 1.2 }), opcoes: [
      { id: "segurar", rotulo: "Segurar e esperar o apoio", teste: { POS: 0.4, CALMA: 0.4, MAR: 0.2 }, dif: 4, niveis: [
        e(["Segurou com calma e os companheiros chegaram. O ataque morreu.", "Esperou o apoio, deu tempo e o ataque do {adv} parou."], 0.35, { moral: 2 }),
        e("Segurou a bola e a defesa se organizou a tempo.", 0.15),
        e("Esperou demais e um dos atacantes ganhou o passe.", -0.2),
        e("Perdeu a bola na tentativa de segurar. O {adv} saiu em velocidade.", -0.5),
        e("A bola escapou e o {adv} entrou na área com dois contra um.", -1, { golContra: true, moral: -4 })] },
      { id: "passar", rotulo: "Passar para o companheiro livre", teste: { PAS: 0.5, VIS: 0.5 }, dif: 6, niveis: [
        e(["Passe na medida, o {comp} recebeu livre e bateu. GOL!", "Tocou para o {comp}, que chutou sem chance para o {gol}. Assistência sua!"], 0.7, { golPro: true, meu: "assist", relTecnico: 1 }),
        e("O companheiro dominou bem, mas chutou para fora.", 0.1),
        e("O passe saiu um pouco forte e a bola passou pela linha de fundo.", -0.2),
        e("Interceptado. O {zag} do {adv} não deixou passar.", -0.5),
        e("Passe errado para o adversário. Ele saiu correndo para o gol vazio. Que vacilo.", -1, { golContra: true, moral: -5 })] },
      { id: "partir", rotulo: "Partir para cima com a bola", teste: { DRI: 0.4, VEL: 0.4, FOR: 0.2 }, dif: 10, niveis: [
        e(["Passou pelo primeiro, pelo segundo e tocou no canto. GOL!", "Partiu como um foguete e deixou os dois para trás. GOL!"], 0.8, { golPro: true, meu: "gol", fama: 0.4, seguidores: 0.02 }),
        e("Ganhou o espaço e o chute saiu forte, mas defendido.", 0.3),
        e("Driblou um e o outro roubou a bola.", -0.3),
        e("Foi longe demais e perdeu o controle. O árbitro marcou falta a favor do {adv}.", -0.5),
        e(["Tropeçou no meio do caminho e o {adv} saiu com a bola.", "Caiu sozinho. A torcida gritou."], -0.9, { moral: -4 })] },
    ] },
  { id: "cruzamentoPonta", titulo: ["Pela ponta direita", "Espaço na ponta"],
    texto: ["Você tem a bola na ponta, com a lateral aberta. A área está cheia de gente.", "A ponta está livre, e a área tem dois companheiros e dois zagueiros."],
    peso: P({ PON: 2.6, LAT: 1.6 }), opcoes: [
      { id: "rasteiro", rotulo: "Cruzar rasteiro na pequena área", teste: { CRU: 0.6, VEL: 0.2, VIS: 0.2 }, dif: 5, niveis: [
        e(["Rasteiro, na medida, o {comp} só empurrou. GOL! Assistência sua!", "O cruzamento saiu perfeito e o {comp} completou no canto. Assistência!"], 0.6, { golPro: true, meu: "assist", relTecnico: 1 }),
        e("Cruzou rasteiro, mas o {zag} cortou para escanteio.", 0.15),
        e("O cruzamento saiu forte e passou por todo mundo.", -0.2),
        e("Cruzou na defesa do {adv}. A bola voltou para você sem perigo.", -0.25),
        e("O cruzamento foi para a arquibancada. O torcedor respondeu com vaias.", -0.5, { moral: -2 })] },
      { id: "entrar", rotulo: "Entrar driblando na área", teste: { DRI: 0.5, VEL: 0.3, RES: 0.2 }, dif: 11, niveis: [
        e(["Entrou driblando, deixou o {zag} para trás e tocou para o gol. GOL!", "Passou pelo {lat} e bateu cruzado. GOL!"], 0.7, { golPro: true, meu: "gol", fama: 0.3 }),
        e("Entrou na área, mas a finalização foi para o {gol}.", 0.2),
        e("O {zag} tomou a bola no momento certo.", -0.2),
        e("Escorregou no gramado molhado e a jogada morreu.", -0.6, { moral: -2 }),
        e("Levou a falta do {lat}. O juiz marcou e você ficou no chão.", -0.4, { lesao: 1 })] },
    ] },
  { id: "goleiroFora", titulo: ["O {gol} saiu da meta", "Goleiro adiantado"],
    texto: ["O {gol} saiu muito à frente do gol. A bola está no seu pé, a uns 30 metros.", "O goleiro do {adv} está fora da área. O gol está vazio, e você tem espaço para chutar."],
    peso: P({ ATA: 1.8, PON: 1.4, MEI: 1.6 }), opcoes: [
      { id: "longe", rotulo: "Chutar de longe", teste: { FIN: 0.5, FOR: 0.3, COM: 0.2 }, dif: 8, tracos: { chute_longe: 6 }, niveis: [
        e(["Chutou de longe, e a bola entrou no gol vazio. GOLAÇO!", "Bomba de fora da área, a bola morreu no fundo da rede!"], 0.8, { golPro: true, meu: "gol", fama: 0.5, seguidores: 0.03 }),
        e("Chutou forte e a bola foi rente à trave.", 0.2),
        e("O chute saiu alto, por cima do gol.", -0.2),
        e("Chutou fraco e o {gol} voltou para pegar.", -0.4),
        e("Chutou para fora sem olhar. O {gol} riu.", -0.7, { moral: -3 })] },
      { id: "encobrir", rotulo: "Encobrir o goleiro", teste: { FIN: 0.4, CALMA: 0.4, DRI: 0.2 }, dif: 10, tracos: { frieza: 5 }, niveis: [
        e(["Encobriu o goleiro com categoria. GOL!", "Por cima do goleiro, a bola caiu no fundo da rede. Que frieza!"], 0.9, { golPro: true, meu: "gol", fama: 0.5, moral: 3 }),
        e("Encobriu, mas a bola passou ao lado da trave.", 0.25),
        e("Demorou demais para decidir e o {gol} voltou a tempo.", -0.2),
        e("A bola subiu demais e foi para a arquibancada.", -0.5),
        e("O {gol} recuou e pegou tudo. Você ficou sem chão.", -0.8, { moral: -3 })] },
      { id: "dar", rotulo: "Tocar para o companheiro vazio", teste: { VIS: 0.5, PAS: 0.5 }, dif: 4, niveis: [
        e(["Tocou para o {comp}, que empurrou para o gol vazio. GOL! Assistência sua!", "Passe de primeira e o {comp} só completou. Assistência!"], 0.6, { golPro: true, meu: "assist", relTecnico: 1 }),
        e("O companheiro dominou e chutou fraco. O {gol} se recuperou.", 0.15),
        e("O passe saiu longo e o companheiro não alcançou.", -0.2),
        e("Passe interceptado pelo {zag}.", -0.5),
        e("Passe errado. O {gol} se levantou e salvou o time.", -0.7, { moral: -2 })] },
    ] },
  { id: "zagueiroNaArea", titulo: ["Zagueiro na área", "Marcação na área"],
    texto: ["O {zag} do {adv} está colado em você dentro da área. A bola sobra, e você precisa decidir.", "Você subiu para cabecear e o {zag} segurou sua camisa. A bola está viva."],
    peso: P({ ZAG: 2.6, VOL: 0.6 }), opcoes: [
      { id: "cabecear", rotulo: "Subir e cabecear", teste: { CAB: 0.6, FOR: 0.2, MAR: 0.2 }, dif: 6, tracos: { cabeceador: 6 }, niveis: [
        e(["Subiu mais alto que todo mundo e cabeceou no canto. GOL!", "Cabeçada firme, no ângulo. GOL!"], 0.7, { golPro: true, meu: "gol", fama: 0.4 }),
        e("Cabeceou no travessão. Quase!", 0.25),
        e("Cabeçada fraca e o {gol} agarrou.", -0.1),
        e("Cabeçou para fora pela linha de fundo.", -0.3),
        e("Você foi para cima com força demais e o juiz deu cartão amarelo.", -0.4, { amarelo: true })] },
      { id: "desviar", rotulo: "Desviar de cabeça para o meio", teste: { CAB: 0.4, PAS: 0.3, VIS: 0.3 }, dif: 3, niveis: [
        e(["Desviou de cabeça para o {comp}, que bateu de primeira. GOL!", "O desvio caiu na frente do {comp}, que chutou forte. GOL!"], 0.5, { golPro: true, meu: "assist", relTecnico: 1 }),
        e("Desviou para o meio, mas o {gol} segurou.", 0.1),
        e("O desvio foi para o meio do gol, sem força.", -0.1),
        e("A bola caiu nos pés do {adv}. Você ficou sem ação.", -0.4),
        e("A cabeçada desviou no seu próprio {zagMeu}. Gol contra.", -1, { golContra: true, moral: -4 })] },
    ] },
  { id: "lateralSobe", titulo: ["Lateral na subida", "Subida pela lateral"],
    texto: ["Você tem espaço para subir pela lateral. O ponta quer a bola no pé e a defesa do {adv} está recuada.", "A lateral está aberta, e você pode ir até a linha de fundo."],
    peso: P({ LAT: 3 }), opcoes: [
      { id: "subir", rotulo: "Subir com a bola", teste: { VEL: 0.4, RES: 0.3, DRI: 0.3 }, dif: 6, niveis: [
        e(["Subiu até a linha de fundo e cruzou para o gol. GOL!", "Chegou na linha e a bola foi parar no fundo da rede, após desvio."], 0.6, { golPro: true, meu: "assist", relTecnico: 1 }),
        e("Chegou na linha e cruzou, mas o {zag} cortou.", 0.2),
        e("Subiu demais e deixou o espaço para o contra-ataque.", -0.3),
        e("Perdeu a bola no meio da subida. Contra-ataque do {adv}.", -0.6),
        e("Foi driblado e o {adv} saiu sozinho para o gol.", -1, { golContra: true, moral: -3 })] },
      { id: "tocar", rotulo: "Tabelar com o ponta", teste: { PAS: 0.5, VIS: 0.5 }, dif: 3, niveis: [
        e(["Tabelou com o {ponta}, que tocou para o gol. GOL! Assistência sua!", "Tabela certinha e a bola entrou pelo canto. Assistência sua!"], 0.6, { golPro: true, meu: "assist", relTecnico: 1 }),
        e("A tabela deu certo, e o {ponta} chutou para fora.", 0.15),
        e("O {ponta} não esperou e a tabela não funcionou.", -0.2),
        e("Tabelou para o adversário. Que mancada.", -0.6),
        e("Errou o toque e o {adv} saiu em velocidade.", -0.8, { moral: -2 })] },
    ] },
  { id: "volanteSobrecarregado", titulo: ["Pressão no meio", "Sem saída no meio"],
    texto: ["Você recebeu a bola de costas, cercado por dois adversários. Não há saída fácil.", "A bola chega no seu pé com dois marcadores em volta. O {meia} pede o passe."],
    peso: P({ VOL: 2.6, MEI: 1.6 }), opcoes: [
      { id: "simples", rotulo: "Passe curto e simples", teste: { PAS: 0.5, CALMA: 0.5 }, dif: 2, niveis: [
        e("Tocou simples, e o time respirou.", 0.2, { relTecnico: 1 }),
        e("Passe curto, sem risco. A jogada seguiu.", 0.1),
        e("O passe foi um pouco atrasado, mas ninguém ficou com a bola.", -0.1),
        e("O passe foi interceptado. O {adv} saiu com a bola.", -0.5),
        e("Passe errado no meio. Contra-ataque do {adv}.", -0.8, { moral: -2, relTecnico: -1 })] },
      { id: "girar", rotulo: "Girar e sair do aperto", teste: { DRI: 0.5, VEL: 0.3, CALMA: 0.2 }, dif: 9, niveis: [
        e(["Girou por dentro e saiu limpo, cheio de confiança. A torcida aplaude.", "Passou pelos dois como se fossem cones!"], 0.6, { moral: 3, fama: 0.2 }),
        e("Saiu do aperto, mas perdeu um passe logo depois.", 0.1),
        e("O giro não deu certo, e a bola ficou com o {adv}.", -0.3),
        e("Caiu no meio do giro. Falta a favor do {adv}.", -0.5),
        e("Tomou a bola e a torcida vaiou. O {adv} saiu em contra-ataque.", -0.9, { moral: -3 })] },
    ] },
  { id: "pedidoDaTorcida", titulo: ["A torcida pede o chute", "Grito da arquibancada"],
    texto: ["A torcida grita o seu nome e pede o chute de longe. Você está no meio-campo com a bola.", "O estádio inteiro pede para você arriscar. A bola chega no seu pé, a uns 25 metros."],
    peso: P({ ATA: 1.2, PON: 1.2, MEI: 1.8 }), opcoes: [
      { id: "atender", rotulo: "Atender o pedido e chutar", teste: { FIN: 0.4, FOR: 0.3, COM: 0.3 }, dif: 10, tracos: { chute_longe: 5 }, niveis: [
        e(["A bola entrou no ângulo. O estádio veio abaixo!", "Golaço de longe! A torcida delirou."], 0.8, { golPro: true, meu: "gol", fama: 0.8, seguidores: 0.04 }),
        e("Bateu forte e a bola foi rente ao poste.", 0.2, { fama: 0.2 }),
        e("Chutou alto, e a torcida gritou \"oh\".", -0.2, { fama: -0.3 }),
        e("Chutou fraco, e a bola foi nas mãos do {gol}.", -0.4),
        e("Chutou para a arquibancada. A torcida riu e vaiou.", -0.7, { fama: -1, moral: -3 })] },
      { id: "passar", rotulo: "Ignorar e passar para o lado", teste: { CALMA: 0.5, PROF: 0.5 }, dif: 3, niveis: [
        e("Ignorou a pressão, tocou para o lado e o time ganhou tempo.", 0.2, { relTecnico: 2 }),
        e("Tocou certo. O estádio reclamou, mas o jogo seguiu.", 0.1, { fama: -0.2 }),
        e("Passou de lado sem perigo. Vaias discretas.", -0.1, { fama: -0.5 }),
        e("O passe saiu torto e a torcida vaiou alto.", -0.4, { fama: -1, moral: -2 }),
        e("Passou para o adversário e o estádio inteiro gemeu.", -0.7, { fama: -2, moral: -3 })] },
    ] },
  { id: "amigoDoElenco", titulo: ["O amigo pede a bola", "Clima de amizade no campo"],
    texto: ["O {meia}, que já jogou com você antes, pede a bola no meio. Ele está livre e sorri para você.", "Você vê o {meia} livre pela esquerda, com a mesma cara de quem já conhece a sua jogada."],
    peso: (c) => (c.base ? 0 : 1.1), opcoes: [
      { id: "tabelar", rotulo: "Tabelar com ele", teste: { PAS: 0.5, VIS: 0.3, CARISMA: 0.2 }, dif: 3, niveis: [
        e(["Tabela perfeita! Vocês dois se entendem sem falar. GOL!", "O {meia} devolveu no pé e a jogada terminou no gol. Assistência!"], 0.6, { golPro: true, meu: "assist", relTecnico: 1, moral: 2 }),
        e("A tabela deu certo e o {meia} chutou para fora.", 0.15, { moral: 1 }),
        e("Tocou um pouco forte e o {meia} não alcançou.", -0.2),
        e("Errou o toque. O {meia} fez careta.", -0.4, { moral: -1 }),
        e("Passe atrapalhado e o {adv} roubou.", -0.7, { moral: -2 })] },
      { id: "chamar", rotulo: "Mandar ele jogar sozinho", teste: { CARISMA: 0.5, COM: 0.5 }, dif: 5, niveis: [
        e("Ele arrancou e chutou no canto. Você sorriu de volta. GOL!", 0.5, { golPro: true, meu: "gol", moral: 2 }),
        e("Ele tentou o drible, e a jogada deu certo pela metade.", 0.1),
        e("Ele hesitou e a bola ficou com o {adv}.", -0.2),
        e("Ele errou o drible. Ficou um clima chato no grupo.", -0.5, { moral: -2 }),
        e("Ele não entendeu o seu comando e perdeu a bola no meio. Você ficou bravo.", -0.7, { moral: -3, relTecnico: -1 })] },
    ] },
  { id: "capitaoChama", titulo: ["O capitão chama você", "Conversa de capitão"],
    texto: ["O capitão do time vem até você antes de um escanteio. Ele quer que você decida a jogada.", "Antes da bola rolar, o capitão diz que o time precisa de você no meio."],
    peso: (c) => (c.base || c.estreia ? 0 : 1), opcoes: [
      { id: "ouvir", rotulo: "Ouvir e seguir o capitão", teste: { CARISMA: 0.4, PROF: 0.4, CALMA: 0.2 }, dif: 2, niveis: [
        e("Seguiu a orientação e a jogada deu certo. O capitão bateu no seu ombro.", 0.3, { relTecnico: 2, moral: 2 }),
        e("Seguiu o plano. Sem brilho, mas sem erro.", 0.1, { relTecnico: 1 }),
        e("Seguiu o plano, mas a execução não saiu como queria.", -0.1),
        e("Foi fora da marcação e a jogada falhou.", -0.4, { relTecnico: -1 }),
        e("Ignorou o capitão e o time não sabia o que fazer.", -0.7, { relTecnico: -2, moral: -3 })] },
      { id: "decidir", rotulo: "Decidir sozinho", teste: { COM: 0.5, FIN: 0.3, CARISMA: 0.2 }, dif: 6, niveis: [
        e("Decidiu sozinho e a jogada saiu perfeita. GOL! O capitão riu e te deu um abraço.", 0.6, { golPro: true, meu: "gol", relTecnico: 1, moral: 2 }),
        e("Decidiu sozinho e a bola foi para o gol, mas parou no {gol}.", 0.2),
        e("Decidiu sozinho e não deu certo. O capitão cobrou atenção.", -0.3, { relTecnico: -1 }),
        e("Decidiu sozinho e o time ficou perdido. O capitão reclamou.", -0.6, { relTecnico: -2, moral: -2 }),
        e("Ninguém entendeu sua decisão. O capitão gritou no meio do campo.", -0.9, { relTecnico: -3, moral: -3 })] },
    ] },
  { id: "juizContra", titulo: ["Falta marcada contra você", "O juiz marca contra você"],
    texto: ["O juiz marcou falta contra você, numa jogada que você acha que foi normal. A torcida reclama.", "Falta a favor do {adv}, na sua opinião, injusta. O árbitro já está com o cartão na mão."],
    peso: P({ ZAG: 1.2, VOL: 1.2, LAT: 1, MEI: 0.8, PON: 0.6, ATA: 0.5 }), opcoes: [
      { id: "protestar", rotulo: "Protestar com o árbitro", teste: { COM: 0.5, CALMA: 0.5 }, dif: 6, niveis: [
        e("O juiz ouviu e voltou atrás. A torcida aplaudiu.", 0.1, { fama: 0.2 }),
        e("Protestou e o juiz manteve a decisão, sem cartão.", -0.05),
        e("O juiz deu amarelo pelo protesto.", -0.3, { amarelo: true }),
        e("O juiz deu amarelo pelo protesto e você reclamou de novo.", -0.6, { amarelo: true, moral: -2 }),
        e("Protestou demais. Expulso!", -1.2, { vermelho: true, moral: -4, relTecnico: -2 })] },
      { id: "aceitar", rotulo: "Aceitar e voltar para o jogo", teste: { CALMA: 0.5, PROF: 0.5 }, dif: 2, niveis: [
        e("Aceitou sem reclamar e voltou focado. O time gostou da postura.", 0.2, { relTecnico: 2, moral: 2 }),
        e("Aceitou a falta e voltou ao posicionamento.", 0.05, { relTecnico: 1 }),
        e("Aceitou a falta, mas ficou com cara feia o resto do jogo.", -0.05),
        e("Aceitou, mas o gesto de raiva apareceu nas câmeras.", -0.3, { fama: -0.5 }),
        e("Aceitou e depois xingou alto. O árbitro escutou.", -0.5, { amarelo: true, fama: -1 })] },
    ] },
  { id: "chuvaCampo", titulo: ["Gramado escorregadio", "A bola não para no pé"], rara: true,
    texto: ["A chuva encharcou o gramado. A bola desliza demais, e cada toque é uma aposta.", "Com a chuva, a bola pula de um jeito estranho no chão molhado. Você precisa decidir a jogada."],
    peso: (c) => (c.chuva ? 2 : 0), opcoes: [
      { id: "controlar", rotulo: "Controlar com cuidado", teste: { DRI: 0.4, CALMA: 0.4, PAS: 0.2 }, dif: 4, niveis: [
        e("Controlou a bola na chuva, com calma. O passe saiu limpo.", 0.3, { relTecnico: 1 }),
        e("Controlou e tocou simples. Sem brilho, mas seguro.", 0.1),
        e("A bola passou por baixo do pé, mas ninguém pegou.", -0.1),
        e("Escorregou e perdeu a bola na jogada.", -0.5, { moral: -2 }),
        e("Caiu com força no gramado molhado. Você ficou no chão.", -0.6, { lesao: 1 })] },
      { id: "chutar", rotulo: "Chutar sem pensar", teste: { FIN: 0.4, FOR: 0.4, COM: 0.2 }, dif: 8, niveis: [
        e(["Chutou sem pensar e a bola entrou. GOL na chuva!", "Foi no gol com força, e a bola deslizou para dentro. GOL!"], 0.6, { golPro: true, meu: "gol", fama: 0.4 }),
        e("Chutou forte, mas a bola foi para cima do gol.", 0.1),
        e("A bola escorregou na hora do chute e foi para longe.", -0.3),
        e("Chutou fraco e o {gol} pegou sem esforço.", -0.4),
        e("Chutou e escorregou. A torcida riu.", -0.7, { moral: -3 })] },
    ] },
  { id: "pancadaDeLado", titulo: ["Pancada no quadril", "Dividida dura"],
    texto: ["Você levou uma pancada forte no quadril numa dividida. Está de pé, mas com dor.", "A dividida foi dura, e você sente o joelho. Os médicos pedem para você ficar."],
    peso: P({ ZAG: 1.4, VOL: 1.4, MEI: 1, ATA: 1, PON: 1, LAT: 1 }), opcoes: [
      { id: "seguir", rotulo: "Seguir jogando", teste: { RES: 0.5, CARISMA: 0.3, PROF: 0.2 }, dif: 6, niveis: [
        e("Ficou de pé, respirou fundo e seguiu. A torcida gritou seu nome.", 0.3, { moral: 2, fama: 0.2 }),
        e("Seguiu jogando com a dor, sem fazer caretas.", 0.1),
        e("Sentiu a dor e saiu do ritmo.", -0.2),
        e("A dor aumentou e você se machucou de vez.", -0.6, { lesao: 2 }),
        e("Forçou demais. A lesão piorou e você saiu de maca.", -1, { lesao: 4, moral: -4 })] },
      { id: "pedir", rotulo: "Pedir substituição", teste: { PROF: 0.5, CALMA: 0.5 }, dif: 0, niveis: [
        e("Pediu a saída com calma e o médico fez uma avaliação rápida. Nada grave.", 0.05, { relTecnico: 1 }),
        e("Pediu a saída e saiu sem problemas.", 0, { relTecnico: 1 }),
        e("Pediu a saída e a torcida reclamou.", -0.1, { fama: -0.5 }),
        e("Pediu a saída e o técnico não gostou da troca.", -0.3, { relTecnico: -2 }),
        e("Pediu a saída e a dor era pior do que ele imaginava. Lesão leve.", -0.4, { lesao: 1, moral: -1 })] },
    ] },
  { id: "provocacaoTorcida", titulo: ["Provocação da arquibancada", "O torcedor provoca"],
    texto: ["Um torcedor do {adv} grita provocações perto da linha de fundo. Você escuta tudo.", "O torcedor atrás do gol chama o seu nome com ironia e faz gestos. O árbitro olha para você."],
    peso: (c) => (c.mandante ? 0.5 : 1.2), opcoes: [
      { id: "ignorar", rotulo: "Ignorar e seguir o jogo", teste: { CALMA: 0.6, PROF: 0.4 }, dif: 2, niveis: [
        e("Ignorou tudo e fez o gol que calou a torcida. GOL!", 0.5, { golPro: true, meu: "gol", fama: 0.4, moral: 2 }),
        e("Ignorou e seguiu com a cabeça no jogo.", 0.1, { fama: 0.2 }),
        e("Ignorou, mas a torcida continuou provocando.", -0.05),
        e("Ficou mexido e errou o passe seguinte.", -0.3, { moral: -2 }),
        e("Respondeu com gesto para a torcida. Saiu nas redes sociais.", -0.5, { fama: -1, noticia: "Gesto de {nome} para a torcida repercute nas redes." })] },
      { id: "responder", rotulo: "Responder com um gesto", teste: { CARISMA: 0.5, COM: 0.5 }, dif: 4, niveis: [
        e("Respondeu com um sorriso e a torcida virou sua fã. Que carisma.", 0.2, { fama: 0.8, moral: 2 }),
        e("Respondeu com um aceno e a torcida aplaudiu.", 0.1, { fama: 0.3 }),
        e("Respondeu com um gesto. Algumas vaias, sem grandes consequências.", -0.2, { fama: -0.5 }),
        e("O gesto virou assunto. A torcida se dividiu.", -0.4, { fama: -1, moral: -2 }),
        e("O gesto foi visto pelo árbitro. Amarelo.", -0.7, { amarelo: true, fama: -2 })] },
    ] },
];
