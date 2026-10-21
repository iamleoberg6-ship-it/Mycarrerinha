// Lances de ataque: finalização, passe, drible, bola parada.
import { e, P, type Situacao } from "./base.js";

export const ATAQUE: Situacao[] = [
  { id: "caraACara", titulo: ["Cara a cara com o goleiro", "Só o goleiro pela frente", "Na cara do {gol}"],
    texto: ["A bola sobra na entrada da pequena área. Só tem o {gol} na sua frente.", "{meia} enfia a bola entre os zagueiros e você sai sozinho.", "O {zag} escorrega e você fica livre, frente a frente com o {gol}."],
    peso: P({ ATA: 3, PON: 1.6, MEI: 1 }), opcoes: [
      { id: "colocado", rotulo: "Bater colocado", teste: { FIN: 0.65, COM: 0.35 }, dif: 6, tracos: { frieza: 6 }, niveis: [
        e(["No cantinho, o {gol} nem se mexeu. GOL!", "Tirou do goleiro com categoria. GOL!", "Colocou no pé da trave, onde o {gol} não chega. GOL!"], 0.6, { golPro: true, meu: "gol" }),
        e(["Rasteiro, no canto. GOL!", "Bateu cruzado e a bola beijou a trave antes de entrar. GOL!"], 0.4, { golPro: true, meu: "gol" }),
        e(["O {gol} se esticou todo e espalmou.", "Defesaça do {gol} com a ponta dos dedos.", "Bateu bem, mas o {gol} adivinhou o canto."], -0.1),
        e(["Saiu fraco, nas mãos do {gol}.", "Demorou para bater e o {zag} travou."], -0.3),
        e(["Pegou mal na bola e ela foi para a lateral. A torcida não perdoou.", "Furou. A bola passou por baixo do pé."], -0.6, { moral: -3 })] },
      { id: "forte", rotulo: "Encher o pé", teste: { FIN: 0.5, FOR: 0.5 }, dif: 9, tracos: { chute_longe: 4 }, niveis: [
        e(["Bomba no ângulo. GOLAÇO!", "Estufou a rede! O {gol} só viu passar. GOL!"], 0.7, { golPro: true, meu: "gol", fama: 0.3 }),
        e(["Forte, no meio do gol, e entrou. GOL!", "Bateu de bico, sem pensar, e entrou. GOL!"], 0.4, { golPro: true, meu: "gol" }),
        e(["O {gol} espalmou para escanteio.", "Explodiu no peito do {gol}."], -0.05),
        e(["Por cima do travessão.", "Na rede, mas pelo lado de fora."], -0.3),
        e(["Foi parar na arquibancada.", "Isolou. A bola ainda está subindo."], -0.6, { moral: -3 })] },
      { id: "driblar", rotulo: "Driblar o goleiro", teste: { DRI: 0.55, COM: 0.3, VEL: 0.15 }, dif: 13, tracos: { ginga: 7, drible_curto: 5 }, niveis: [
        e(["Deixou o {gol} sentado e tocou para o gol vazio. Golaço de vídeo!", "Corte seco, o {gol} passou direto. Gol com o gol vazio!"], 0.9, { golPro: true, meu: "gol", fama: 0.6, seguidores: 0.03 }),
        e("Driblou e empurrou para a rede. GOL!", 0.5, { golPro: true, meu: "gol" }),
        e(["O {gol} abafou na hora certa.", "O {gol} se jogou nos seus pés e ficou com a bola."], -0.2),
        e("Levou demais e o {zag} voltou a tempo.", -0.4),
        e(["Tropeçou na bola sozinho. Vai rodar nas redes, mas não do jeito bom.", "Tentou o drible e a bola ficou presa no pé. O {gol} agradeceu."], -0.8, { moral: -4, seguidores: 0.01 })] },
      { id: "rolar", rotulo: "Rolar para o companheiro", teste: { PAS: 0.5, VIS: 0.5 }, dif: 2, niveis: [
        e(["Rolou na medida, o {comp} só empurrou. Assistência sua!", "Viu o {comp} chegando e tocou de lado. Gol dele, assistência sua!"], 0.5, { golPro: true, meu: "assist", relTecnico: 1 }),
        e("Passou, e o {comp} bateu em cima do {gol}. Boa jogada.", 0.1),
        e("O passe saiu atrás e a jogada morreu.", -0.1),
        e("O {zag} cortou o passe.", -0.25),
        e("Passou para ninguém. O técnico abriu os braços no banco.", -0.5, { relTecnico: -2 })] },
    ] },
  { id: "chuteFora", titulo: ["Bola ajeitada na intermediária", "Espaço na entrada da área"],
    texto: ["A bola sobra limpa a uns 25 metros do gol. O meio está fechado.", "O {vol} recua demais e você domina de frente para o gol, a uns 25 metros."],
    peso: P({ MEI: 1.6, VOL: 1.3, PON: 1, ATA: 0.6, LAT: 0.5 }), opcoes: [
      { id: "chutar", rotulo: "Arriscar de fora", teste: { FIN: 0.7, FOR: 0.3 }, dif: 18, tracos: { chute_longe: 12 }, niveis: [
        e(["De fora da área, no ângulo! Golaço!", "Chute de três dedos que fez a curva e entrou. Golaço!"], 0.9, { golPro: true, meu: "gol", fama: 0.6 }),
        e("O {gol} soltou e o {comp} pegou o rebote. Gol, nasceu do seu chute!", 0.3, { golPro: true }),
        e(["Raspou a trave. A torcida fez \"uuuh\".", "Explodiu no travessão!"], 0.05),
        e("Foi longe do gol.", -0.2),
        e("Pegou mal e a bola foi para a lateral. Contra-ataque deles.", -0.4)] },
      { id: "tocar", rotulo: "Tocar e manter a posse", teste: { PAS: 0.6, COM: 0.4 }, dif: -4, niveis: [
        e("Tocou, se apresentou de novo e virou o jogo. Lance de quem entende.", 0.3, { relTecnico: 2 }),
        e("Posse mantida, time respirando.", 0.15, { relTecnico: 1 }),
        e("Passe simples, nada de mais.", 0),
        e("O passe saiu nas costas do {meia}.", -0.2),
        e("Entregou a bola no pé do {vol}.", -0.35)] },
      { id: "conduzir", rotulo: "Conduzir e puxar a marcação", teste: { DRI: 0.6, FOR: 0.2, VEL: 0.2 }, dif: 8, tracos: { drible_curto: 4 }, niveis: [
        e("Passou por dois e sofreu a falta na entrada da área.", 0.45),
        e("Ganhou terreno e abriu espaço para o lateral.", 0.2),
        e("Foi travado, mas o time recuperou.", -0.05),
        e("Perdeu a bola na condução.", -0.25),
        e("Perdeu a bola e o contra-ataque terminou em gol deles.", -0.6, { golContra: true })] },
    ] },
  { id: "umContraUm", titulo: ["Um contra um pelo lado", "Mano a mano com o lateral"],
    texto: ["Você recebe aberto, com o {lat} vindo sozinho.", "Bola na ponta, o {lat} de frente para você e a área cheia."],
    peso: P({ PON: 2.4, LAT: 1.3, ATA: 0.7, MEI: 0.6 }), opcoes: [
      { id: "fundo", rotulo: "Partir para a linha de fundo e cruzar", teste: { VEL: 0.35, DRI: 0.3, CRU: 0.35 }, dif: 8, tracos: { velocista: 6, ginga: 3 }, niveis: [
        e(["Passou fácil e cruzou na cabeça do {comp}. Assistência sua!", "Deixou o {lat} para trás e cruzou rasteiro. O {comp} só empurrou!"], 0.6, { golPro: true, meu: "assist" }),
        e("Ganhou na corrida e cruzou. A zaga afastou para escanteio.", 0.15),
        e("O {lat} acompanhou e a bola saiu.", -0.05),
        e("Cruzou direto para o {gol}.", -0.2),
        e("Perdeu a bola e o {lat} saiu jogando livre.", -0.35)] },
      { id: "dentro", rotulo: "Cortar para dentro e finalizar", teste: { DRI: 0.5, FIN: 0.5 }, dif: 14, tracos: { drible_curto: 5, chute_longe: 4 }, niveis: [
        e(["Cortou e bateu de chapa no ângulo. GOL!", "Puxou para o pé bom e colocou no segundo pau. GOL!"], 0.8, { golPro: true, meu: "gol", fama: 0.4 }),
        e("Cortou e bateu firme. O {gol} fez grande defesa.", 0.2),
        e("O chute travou na defesa.", -0.1),
        e("Bateu sem ângulo, por cima.", -0.25),
        e("Perdeu a bola no drible e tomou o contra-ataque.", -0.45)] },
      { id: "tabela", rotulo: "Tabelar com o meia", teste: { PAS: 0.5, VIS: 0.3, VEL: 0.2 }, dif: 4, niveis: [
        e("Tabela perfeita com o {meia} e você entrou na área livre. GOL!", 0.6, { golPro: true, meu: "gol" }),
        e("A tabela funcionou e o time chegou com perigo.", 0.15),
        e("O {lat} cortou a devolução.", -0.05),
        e("O passe saiu forte demais.", -0.2),
        e("Errou o passe e o contra-ataque pegou a defesa aberta.", -0.4)] },
      { id: "caneta", rotulo: "Tentar a caneta", teste: { DRI: 0.7, COM: 0.3 }, dif: 16, tracos: { ginga: 8 }, quando: (c) => c.saldo >= 0, niveis: [
        e("Caneta no {lat}! O estádio inteiro gritou \"olé\" e o cruzamento ainda achou o {comp}. Assistência!", 0.7, { golPro: true, meu: "assist", fama: 0.6, seguidores: 0.04 }),
        e("Caneta limpa e a torcida foi ao delírio. A jogada parou no escanteio.", 0.3, { fama: 0.3, seguidores: 0.02 }),
        e("A bola bateu na canela dele e saiu pela lateral.", -0.05),
        e("O {lat} fechou as pernas e ficou com a bola.", -0.25),
        e("Errou a caneta, levou o contra-ataque e o {lat} ainda debochou.", -0.5, { moral: -3 })] },
    ] },
  { id: "escanteioAtaque", titulo: ["Escanteio a favor", "Bola na área"],
    texto: ["O {batedor} vai bater o escanteio. Você está na área.", "Escanteio. A área está cheia e o {zag} está colado em você."],
    peso: P({ ZAG: 1.6, ATA: 1.2, VOL: 0.8, MEI: 0.3 }), opcoes: [
      { id: "subir", rotulo: "Atacar a primeira trave", teste: { CAB: 0.7, FOR: 0.3 }, dif: 14, tracos: { cabeceador: 12, bicicleta: 4 }, niveis: [
        e(["Subiu mais que todo mundo. Cabeçada no canto, GOL!", "Desviou de cabeça na primeira trave e a bola morreu no canto. GOL!"], 0.7, { golPro: true, meu: "gol" }),
        e("Cabeçada firme, o {gol} fez milagre.", 0.15),
        e("O {zag} te segurou pela camisa.", 0),
        e("Cabeceou por cima.", -0.1),
        e("Errou o tempo da bola e ela passou sem ninguém.", -0.15)] },
      { id: "sobra", rotulo: "Ficar na sobra", teste: { POS: 0.5, FIN: 0.5 }, dif: 12, niveis: [
        e("A bola sobrou e você bateu de primeira. GOL!", 0.6, { golPro: true, meu: "gol" }),
        e("Pegou a sobra e chutou para defesa do {gol}.", 0.1),
        e("A defesa afastou.", 0),
        e("A sobra foi do adversário.", -0.05),
        e("A sobra foi deles e o contra-ataque pegou o time desarrumado.", -0.35)] },
      { id: "bicicleta", rotulo: "Tentar a bicicleta", teste: { DRI: 0.3, FIN: 0.4, FOR: 0.3 }, dif: 28, tracos: { bicicleta: 18 }, niveis: [
        e("BICICLETA! Gol de placa, desses que entram para a história do clube!", 1.3, { golPro: true, meu: "gol", fama: 3, seguidores: 0.15, noticia: "Gol de bicicleta de {nome}: o lance mais visto da rodada." }),
        e("Pegou bonito, a bola raspou o travessão.", 0.25, { seguidores: 0.01 }),
        e("Pegou mal, mas a ideia foi bonita.", -0.05),
        e("Furou e caiu de costas.", -0.25),
        e("Acertou o rosto do {zag}. Amarelo.", -0.4, { amarelo: true })] },
      { id: "bloqueio", rotulo: "Fazer o bloqueio para o zagueiro", teste: { FOR: 0.6, POS: 0.4 }, dif: 4, niveis: [
        e("Bloqueou o {zag} e o {zagMeu} subiu livre. GOL! Jogada ensaiada.", 0.35, { golPro: true, relTecnico: 2 }),
        e("O bloqueio abriu espaço, a cabeçada saiu perto.", 0.1, { relTecnico: 1 }),
        e("Nada feito, a zaga afastou.", 0),
        e("O juiz marcou falta de ataque no seu bloqueio.", -0.1),
        e("Empurrão no bloqueio, falta e amarelo.", -0.3, { amarelo: true })] },
    ] },
  { id: "cabecada", titulo: ["Cruzamento na área", "A bola vem pelo alto"],
    texto: ["O {ponta} vai à linha de fundo e levanta. Você está entre os dois zagueiros.", "Cruzamento da direita, a bola viaja em direção à marca do pênalti."],
    peso: P({ ATA: 2.4, PON: 0.6, MEI: 0.5, ZAG: 0.3 }), opcoes: [
      { id: "cabecear", rotulo: "Cabecear para baixo", teste: { CAB: 0.7, POS: 0.3 }, dif: 10, tracos: { cabeceador: 12 }, niveis: [
        e(["Testada para o chão, a bola quicou e enganou o {gol}. GOL!", "Cabeçada no contrapé do {gol}. GOL!"], 0.7, { golPro: true, meu: "gol" }),
        e("Cabeceou firme e o {gol} defendeu no reflexo.", 0.15),
        e("O {zag} chegou junto e atrapalhou.", -0.05),
        e("Cabeceou fraco, nas mãos do {gol}.", -0.2),
        e("Pulou antes da hora e a bola passou por trás de você.", -0.35)] },
      { id: "peixinho", rotulo: "Mergulhar de peixinho", teste: { CAB: 0.4, VEL: 0.3, COM: 0.3 }, dif: 16, tracos: { cabeceador: 8 }, niveis: [
        e("Peixinho! Voou entre os zagueiros e a bola entrou no canto. Que gol!", 0.9, { golPro: true, meu: "gol", fama: 0.8, seguidores: 0.04 }),
        e("Peixinho bonito, a bola passou rente à trave.", 0.15),
        e("Chegou um segundo atrasado.", -0.05),
        e("Bateu de cara no gramado.", -0.2),
        e("Mergulhou na chuteira do {zag}. Saiu tonto de campo para atendimento.", -0.4, { lesao: 1, moral: -2 })] },
      { id: "ajeitar", rotulo: "Escorar para quem vem de trás", teste: { CAB: 0.4, VIS: 0.4, PAS: 0.2 }, dif: 6, niveis: [
        e("Escorou de cabeça e o {meia} chegou batendo. GOL! Assistência sua.", 0.5, { golPro: true, meu: "assist" }),
        e("Escorou bem e a finalização saiu perto.", 0.15),
        e("A bola sobrou para o adversário.", -0.05),
        e("Escorou para ninguém.", -0.15),
        e("Escorou nos pés do {vol}, que puxou o contra-ataque.", -0.3)] },
    ] },
  { id: "rebote", titulo: ["Rebote na área", "Bola viva na pequena área"],
    texto: ["O {comp} chuta, o {gol} solta e a bola fica viva perto de você.", "Bate-rebate na área. A bola espirra na sua direção."],
    peso: P({ ATA: 2.2, PON: 1, MEI: 0.8, ZAG: 0.4 }), opcoes: [
      { id: "primeira", rotulo: "Bater de primeira", teste: { FIN: 0.6, POS: 0.2, COM: 0.2 }, dif: 6, niveis: [
        e(["De primeira, sem deixar o {gol} levantar. GOL!", "Oportunismo puro: chegou antes de todo mundo. GOL!"], 0.6, { golPro: true, meu: "gol" }),
        e("Bateu de primeira, o {zag} salvou em cima da linha.", 0.1),
        e("Pegou torto, a bola subiu.", -0.1),
        e("Chutou em cima do {gol}, que ainda estava no chão.", -0.25),
        e("Furou o chute na frente do gol vazio. A torcida não acreditou.", -0.7, { moral: -4, seguidores: 0.01 })] },
      { id: "dominar", rotulo: "Dominar e escolher o canto", teste: { COM: 0.6, DRI: 0.2, FIN: 0.2 }, dif: 12, tracos: { frieza: 8 }, niveis: [
        e("Dominou com calma enquanto todos se jogavam e tocou no canto. GOL!", 0.7, { golPro: true, meu: "gol" }),
        e("Dominou e bateu, o {gol} se recuperou e defendeu.", 0.05),
        e("Na hora de dominar, já tinha gente em cima.", -0.1),
        e("O domínio espirrou e a zaga afastou.", -0.25),
        e("Demorou tanto que o {zag} tirou a bola do seu pé.", -0.4)] },
    ] },
  { id: "lancamento", titulo: ["Lançamento nas costas da zaga", "Bola longa"],
    texto: ["O {zagMeu} dá um lançamento de 50 metros. A bola cai nas costas do {zag}.", "Lançamento longo. Você e o {zag} correm lado a lado."],
    peso: P({ ATA: 1.8, PON: 1.8, LAT: 0.5, MEI: 0.4 }), opcoes: [
      { id: "corrida", rotulo: "Ganhar na corrida e finalizar", teste: { VEL: 0.5, FIN: 0.3, COM: 0.2 }, dif: 10, tracos: { velocista: 10 }, niveis: [
        e(["Deixou o {zag} para trás e tocou na saída do {gol}. GOL!", "Arrancada que levantou o estádio. GOL!"], 0.7, { golPro: true, meu: "gol", fama: 0.3 }),
        e("Ganhou a corrida e bateu, o {gol} espalmou.", 0.15),
        e("O {zag} chegou junto e você bateu travado.", -0.05),
        e("Bandeira levantada. Impedimento.", -0.1),
        e("A bola correu mais que você e foi pela linha de fundo.", -0.2)] },
      { id: "matar", rotulo: "Matar no peito e esperar o time", teste: { COM: 0.5, FOR: 0.3, PAS: 0.2 }, dif: 6, niveis: [
        e("Matou no peito, segurou o {zag} e serviu o {meia}, que bateu no canto. GOL! Assistência sua.", 0.5, { golPro: true, meu: "assist" }),
        e("Domínio de craque. O time subiu e o ataque continuou.", 0.2, { relTecnico: 1 }),
        e("Segurou, mas teve que tocar para trás.", 0),
        e("O domínio fugiu e o {zag} ficou com ela.", -0.2),
        e("Perdeu a bola de bobeira e o contra-ataque pegou o time subindo.", -0.4)] },
      { id: "cobertura", rotulo: "Encobrir o goleiro adiantado", teste: { FIN: 0.4, COM: 0.4, VIS: 0.2 }, dif: 18, tracos: { frieza: 6, chute_longe: 4 }, niveis: [
        e("O {gol} saiu e você deu um toquinho por cima. Gol de cobertura, golaço!", 1.0, { golPro: true, meu: "gol", fama: 1, seguidores: 0.05 }),
        e("A cobertura saiu boa, mas o {gol} voltou e tirou com a ponta dos dedos.", 0.15),
        e("Bateu por cima do {gol} e por cima do gol também.", -0.1),
        e("Saiu curta, nas mãos do {gol}.", -0.25),
        e("Pegou mal e a bola foi parar no meio da torcida.", -0.35)] },
    ] },
  { id: "contraAtaque", titulo: ["Contra-ataque dois contra um", "Saída em velocidade"],
    texto: ["O time rouba a bola e você puxa o contra-ataque. O {comp} vem pelo outro lado e só o {zag} está na volta.", "Bola roubada no meio, campo aberto. Dois de vocês contra um zagueiro."],
    peso: P({ MEI: 1.6, PON: 1.8, ATA: 1.2, VOL: 0.6, LAT: 0.6 }), opcoes: [
      { id: "passar", rotulo: "Esperar o zagueiro vir e passar", teste: { PAS: 0.4, VIS: 0.4, COM: 0.2 }, dif: 4, niveis: [
        e("Atraiu o {zag} e rolou na hora certa. O {comp} fez. Assistência sua!", 0.55, { golPro: true, meu: "assist" }),
        e("O passe saiu bom, mas o {comp} demorou e o chute foi travado.", 0.1),
        e("O {zag} não mordeu e cortou o passe.", -0.05),
        e("Passou cedo demais e o {comp} ficou impedido.", -0.15),
        e("O passe saiu forte, para a lateral. A torcida xingou.", -0.3)] },
      { id: "chutar", rotulo: "Ir para cima e chutar", teste: { FIN: 0.5, DRI: 0.3, VEL: 0.2 }, dif: 10, niveis: [
        e("Usou o {comp} como isca e bateu no canto. GOL!", 0.6, { golPro: true, meu: "gol" }),
        e("Bateu forte, o {gol} fez a defesa.", 0.1),
        e("Chutou travado.", -0.1),
        e("Chutou mal e o {comp} reclamou que estava livre.", -0.25, { relTecnico: -1 }),
        e("Fominha: o {comp} estava sozinho e você chutou para fora. O banco inteiro levantou as mãos.", -0.5, { relTecnico: -3, moral: -2 })] },
      { id: "falta", rotulo: "Cavar a falta do último homem", teste: { DRI: 0.5, CARISMA: 0.2, COM: 0.3 }, dif: 10, niveis: [
        e("O {zag} te derrubou de último homem: vermelho para ele!", 0.4, { fama: 0.3 }),
        e("Falta e amarelo para o {zag}. Contra-ataque parado, mas com falta perigosa.", 0.15),
        e("O juiz mandou seguir e o lance se perdeu.", -0.1),
        e("O juiz viu a simulação e não marcou nada.", -0.2),
        e("Amarelo para você por simulação.", -0.35, { amarelo: true })] },
    ] },
  { id: "enfiada", titulo: ["Passe em profundidade", "A defesa deu espaço"],
    texto: ["Você recebe no meio, de frente. O {comp} faz a diagonal entre os zagueiros.", "O {vol} subiu e deixou um buraco. Você vê o {comp} pedindo a bola na frente."],
    peso: P({ MEI: 2.6, VOL: 1, PON: 0.6, ATA: 0.4 }), opcoes: [
      { id: "enfiar", rotulo: "Enfiar a bola", teste: { PAS: 0.5, VIS: 0.5 }, dif: 10, niveis: [
        e(["Passe de quem enxerga o jogo de cima. O {comp} saiu na cara e fez. Assistência sua!", "Enfiada milimétrica entre os zagueiros. Gol do {comp}, assistência sua!"], 0.6, { golPro: true, meu: "assist", relTecnico: 1 }),
        e("Boa enfiada, o {comp} chutou para defesa do {gol}.", 0.2),
        e("O {zag} leu e cortou.", -0.05),
        e("O passe saiu longo e o {gol} ficou com a bola.", -0.15),
        e("Passe interceptado e contra-ataque perigoso.", -0.35)] },
      { id: "lancar", rotulo: "Inverter o jogo no ponta", teste: { PAS: 0.6, FOR: 0.2, VIS: 0.2 }, dif: 6, niveis: [
        e("Inversão de 40 metros no pé do {ponta}, que cortou e bateu. GOL! Assistência sua.", 0.5, { golPro: true, meu: "assist" }),
        e("Virada de jogo perfeita. O ataque ganhou o lado fraco.", 0.2, { relTecnico: 1 }),
        e("O {ponta} dominou mal.", -0.05),
        e("O lançamento saiu pela lateral.", -0.2),
        e("O {lat} antecipou e saiu no contra-ataque.", -0.3)] },
      { id: "chutar", rotulo: "Chutar de média distância", teste: { FIN: 0.7, FOR: 0.3 }, dif: 16, tracos: { chute_longe: 10 }, niveis: [
        e("Ninguém esperava o chute. Bola no canto. GOL!", 0.8, { golPro: true, meu: "gol", fama: 0.5 }),
        e("O {gol} espalmou no susto.", 0.1),
        e("Desviou na zaga e saiu.", -0.05),
        e("Por cima.", -0.15),
        e("O {comp} estava livre e você chutou longe. Ele reclamou com os braços.", -0.35, { relTecnico: -1 })] },
    ] },
  { id: "batedorEscanteio", titulo: ["Você vai bater o escanteio", "Escanteio com você na bola"],
    texto: ["O {batedor} saiu machucado e o escanteio fica com você.", "Escanteio pela esquerda. O técnico grita para você bater."],
    peso: P({ MEI: 1.2, PON: 1, LAT: 0.5 }), opcoes: [
      { id: "fechado", rotulo: "Bater fechado, na primeira trave", teste: { CRU: 0.8, VIS: 0.2 }, dif: 10, niveis: [
        e("Na cabeça do {zagMeu}, que desviou. GOL! Assistência sua.", 0.5, { golPro: true, meu: "assist" }),
        e("A bola fez a curva e o {gol} teve que socar.", 0.15),
        e("A zaga cortou.", 0),
        e("Bateu direto na barreira humana da primeira trave.", -0.1),
        e("A bola saiu pela linha de fundo sem passar por ninguém.", -0.25)] },
      { id: "curto", rotulo: "Cobrar curto e ensaiado", teste: { PAS: 0.5, VIS: 0.3, PROF: 0.2 }, dif: 4, niveis: [
        e("Jogada ensaiada no treino: tabela, cruzamento rasteiro, GOL! Assistência sua.", 0.45, { golPro: true, meu: "assist", relTecnico: 2 }),
        e("A jogada ensaiada abriu espaço e saiu um chute perigoso.", 0.15, { relTecnico: 1 }),
        e("A marcação acompanhou e a bola voltou para trás.", 0),
        e("Errou o passe curto. A torcida vaiou.", -0.15),
        e("Perdeu a bola e o contra-ataque pegou todo mundo na área.", -0.4)] },
      { id: "olimpico", rotulo: "Tentar o gol olímpico", teste: { CRU: 0.6, FIN: 0.4 }, dif: 30, tracos: { chute_longe: 6 }, niveis: [
        e("GOL OLÍMPICO! A bola fez a curva e entrou direto. O {gol} ficou olhando!", 1.2, { golPro: true, meu: "gol", fama: 2.5, seguidores: 0.12, noticia: "Gol olímpico de {nome}: lance raro no {estadio}." }),
        e("Fez a curva e o {gol} tirou de cima da linha.", 0.15),
        e("Bateu no travessão por cima.", 0),
        e("Fácil para o {gol}.", -0.15),
        e("Bateu fraco e o técnico perguntou o que era aquilo.", -0.3, { relTecnico: -2 })] },
    ] },
  { id: "cavarPenalti", titulo: ["Contato na área", "Disputa dentro da área"],
    texto: ["Você entra na área e o {zag} encosta no seu braço.", "O {zag} chega por trás e toca de leve na sua perna dentro da área."],
    peso: P({ ATA: 1.2, PON: 1.2, MEI: 0.6 }), opcoes: [
      { id: "seguir", rotulo: "Aguentar e seguir na jogada", teste: { FOR: 0.5, DRI: 0.3, PROF: 0.2 }, dif: 10, niveis: [
        e("Aguentou o tranco, ficou de pé e tocou na saída do {gol}. GOL!", 0.7, { golPro: true, meu: "gol", relTecnico: 1 }),
        e("Ficou de pé e cruzou, a zaga cortou.", 0.15),
        e("Perdeu o equilíbrio e a bola.", -0.05),
        e("O {zag} ficou com a bola.", -0.15),
        e("Caiu sozinho depois e ninguém entendeu nada.", -0.3)] },
      { id: "cair", rotulo: "Se jogar", teste: { CARISMA: 0.4, COM: 0.3, DRI: 0.3 }, dif: 14, niveis: [
        e("O juiz marcou pênalti. O {batedor} converteu.", 0.2, { golPro: true, noticia: "Torcida rival reclama do pênalti cavado por {nome}." }),
        e("O juiz foi ao VAR e confirmou o pênalti. O {batedor} bateu e fez.", 0.15, { golPro: true }),
        e("O juiz mandou seguir.", -0.1),
        e("O VAR chamou e o juiz desmarcou. A torcida vaiou você.", -0.25, { moral: -2 }),
        e("Amarelo por simulação e todo mundo viu o replay.", -0.5, { amarelo: true, fama: -0.3, noticia: "Simulação de {nome} rende amarelo e críticas." })] },
    ] },
  { id: "showboat", titulo: ["Goleada", "Jogo resolvido"],
    texto: ["O jogo está decidido e a torcida pede \"olé\". A bola chega no seu pé perto da área.", "Vocês vencem com folga. O {vol} está te encarando, irritado."],
    peso: (c) => (c.saldo >= 3 ? 2.5 : 0), opcoes: [
      { id: "firula", rotulo: "Dar um chapéu", teste: { DRI: 0.7, COM: 0.3 }, dif: 14, tracos: { ginga: 10 }, niveis: [
        e("Chapéu no {vol} e a arquibancada veio abaixo. O lance vai rodar a semana inteira.", 0.4, { fama: 0.8, seguidores: 0.06 }),
        e("Chapéu bonito. A torcida aplaudiu de pé.", 0.2, { fama: 0.3, seguidores: 0.02 }),
        e("Não deu certo, mas ninguém ligou.", 0),
        e("O {vol} se irritou e te deu uma pancada.", -0.1, { moral: -1 }),
        e("Pancada do {vol}, você revidou e os dois levaram amarelo. O técnico não gostou.", -0.3, { amarelo: true, relTecnico: -3 })] },
      { id: "simples", rotulo: "Jogar simples e respeitar o adversário", teste: { PROF: 0.6, PAS: 0.4 }, dif: -6, niveis: [
        e("Tocou de lado e ainda deu um passe para o sexto gol. Respeito e eficiência.", 0.3, { golPro: true, meu: "assist", relTecnico: 2 }),
        e("Tocou de lado. Os adversários agradeceram no fim do jogo.", 0.1, { relTecnico: 1 }),
        e("Jogo burocrático até o apito.", 0),
        e("A torcida queria show e vaiou de leve.", -0.05),
        e("Errou um passe bobo e tomou um gol de honra.", -0.2, { golContra: true })] },
      { id: "golaco", rotulo: "Procurar o gol de placa", teste: { DRI: 0.4, FIN: 0.4, COM: 0.2 }, dif: 16, niveis: [
        e("Driblou três e o {gol}. Gol de placa para fechar a goleada!", 1.0, { golPro: true, meu: "gol", fama: 1.2, seguidores: 0.06 }),
        e("Driblou dois e bateu. O {gol} fez a defesa da vida dele.", 0.2),
        e("Foi desarmado no terceiro drible.", -0.05),
        e("Perdeu e o técnico pediu para você parar de enfeitar.", -0.2, { relTecnico: -2 }),
        e("Perdeu a bola e eles fizeram o gol de honra no contra-ataque.", -0.35, { golContra: true, relTecnico: -2 })] },
    ] },
  { id: "chuteMeioCampo", rara: true, titulo: "O goleiro está adiantado", texto: ["Você domina no meio-campo e vê o {gol} lá na entrada da área.", "O {gol} subiu para jogar com os pés e está longe do gol. A bola está no seu pé, no círculo central."],
    peso: P({ MEI: 0.12, VOL: 0.1, ATA: 0.1, PON: 0.08 }), opcoes: [
      { id: "chutar", rotulo: "Chutar do meio de campo", teste: { FOR: 0.4, FIN: 0.4, VIS: 0.2 }, dif: 26, tracos: { chute_longe: 14 }, niveis: [
        e("Do meio de campo! A bola caiu dentro do gol com o {gol} correndo para trás. GOL HISTÓRICO!", 1.5, { golPro: true, meu: "gol", fama: 4, seguidores: 0.2, noticia: "{nome} marca do meio de campo: o gol mais falado do país." }),
        e("Do meio de campo, no travessão! O estádio inteiro ficou de pé.", 0.3, { seguidores: 0.03 }),
        e("Passou perto do ângulo.", 0.05),
        e("O {gol} voltou a tempo e encaixou.", -0.1),
        e("Saiu fraco e o adversário contra-atacou com o time aberto.", -0.35)] },
      { id: "tocar", rotulo: "Ignorar e tocar curto", teste: { PAS: 1 }, dif: -10, niveis: [
        e("Tocou curto, o time trabalhou e chegou ao gol.", 0.2, { golPro: true }), e("Jogada segura.", 0.05), e("Jogada segura.", 0),
        e("O técnico gritou do banco: \"chuta!\".", -0.05), e("No replay, todo mundo viu que estava aberto.", -0.1)] },
    ] },
];
