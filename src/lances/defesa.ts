// Lances de defesa: desarme, bola aérea, cobertura, saída de bola.
import { e, P, type Situacao } from "./base.js";

export const DEFESA: Situacao[] = [
  { id: "contraDefesa", titulo: ["Contra-ataque do adversário", "Eles saem em velocidade"],
    texto: ["Eles roubaram a bola e vêm três contra dois. O {ata} parte para cima de você.", "Escanteio seu mal batido e o {adv} sai em velocidade. Só você e o {zagMeu} estão atrás."],
    peso: P({ ZAG: 2.6, VOL: 2.2, LAT: 1.8, MEI: 0.4 }), opcoes: [
      { id: "bote", rotulo: "Dar o bote", teste: { MAR: 0.55, FOR: 0.25, VEL: 0.2 }, dif: 6, niveis: [
        e(["Bote limpo e já saiu jogando. A torcida levantou.", "Tirou a bola do {ata} como quem pega doce de criança."], 0.6, { relTecnico: 2 }),
        e("Desarmou na hora certa.", 0.35),
        e("Mandou a bola para a lateral.", 0.05),
        e("O {ata} passou, mas o {goleiro} salvou.", -0.3),
        e(["O {ata} passou por você como se não estivesse lá. Gol deles.", "Deu o bote no vento. O {ata} tocou na saída do {goleiro}. Gol deles."], -0.7, { golContra: true, moral: -3 })] },
      { id: "acompanhar", rotulo: "Acompanhar e fechar o ângulo", teste: { POS: 0.55, VEL: 0.45 }, dif: 2, niveis: [
        e("Fechou tudo, o chute saiu fraco e o {goleiro} pegou.", 0.45),
        e("Acompanhou bem e forçou o passe para trás.", 0.25),
        e("O {ata} chutou de longe, por cima.", 0),
        e("O {ata} achou o espaço, mas a trave salvou.", -0.25),
        e("O {ata} achou o espaço e bateu cruzado. Gol deles.", -0.55, { golContra: true })] },
      { id: "falta", rotulo: "Fazer a falta tática", teste: { CALMA: 0.5, POS: 0.5 }, dif: -6, niveis: [
        e("Falta inteligente no meio-campo, sem cartão. Ataque parado.", 0.15),
        e("Falta e cartão amarelo. Ataque parado.", -0.05, { amarelo: true }),
        e("Falta, amarelo, e a cobrança deu trabalho ao {goleiro}.", -0.15, { amarelo: true }),
        e("Chegou atrasado: amarelo e falta perigosa.", -0.3, { amarelo: true }),
        e("Entrada por trás. Cartão vermelho direto.", -1.2, { vermelho: true, relTecnico: -6, moral: -5 })] },
    ] },
  { id: "bolaAerea", titulo: ["Cruzamento na sua área", "Bola alçada na área"],
    texto: ["O ponta deles cruza alto. O {ata} está colado em você.", "Falta lateral para eles. A bola vai ser levantada na área e o {ata} te empurra."],
    peso: P({ ZAG: 2.2, VOL: 1, LAT: 0.8 }), opcoes: [
      { id: "subir", rotulo: "Subir com o atacante", teste: { CAB: 0.5, FOR: 0.3, POS: 0.2 }, dif: 6, tracos: { cabeceador: 8 }, niveis: [
        e("Ganhou de cabeça e ainda achou o volante. Lance de xerife.", 0.5, { relTecnico: 1 }),
        e("Ganhou no alto e afastou.", 0.3),
        e("Os dois subiram juntos e a bola sobrou para fora.", 0),
        e("O {ata} ganhou, mas cabeceou por cima.", -0.25),
        e("O {ata} subiu mais e cabeceou no canto. Gol deles.", -0.6, { golContra: true })] },
      { id: "cortar", rotulo: "Antecipar e cortar de primeira", teste: { POS: 0.6, VEL: 0.2, CAB: 0.2 }, dif: 9, niveis: [
        e("Antecipou e cortou para longe.", 0.45),
        e("Cortou para escanteio.", 0.2),
        e("Raspou e a bola passou pela área sem ninguém.", 0),
        e("Furou o corte, mas o {goleiro} segurou.", -0.3),
        e("Furou o corte e a bola sobrou para o {ata}. Gol deles.", -0.7, { golContra: true, moral: -3 })] },
      { id: "goleiro", rotulo: "Deixar para o goleiro sair", teste: { COM: 0.5, POS: 0.5 }, dif: 2, niveis: [
        e("Gritou \"deixa!\", protegeu e o {goleiro} saiu seguro.", 0.25),
        e("O {goleiro} saiu bem.", 0.1),
        e("O {goleiro} socou para longe.", 0),
        e("O {goleiro} saiu mal e foi um bate-rebate.", -0.25),
        e("Desencontro com o {goleiro} e a bola entrou. Gol deles.", -0.6, { golContra: true, relTecnico: -2 })] },
    ] },
  { id: "saidaPressao", titulo: ["Pressão na saída de bola", "Marcação alta"],
    texto: ["Você recebe de costas, perto da sua área, com dois adversários chegando.", "O {goleiro} toca curto para você e o {ata} vem correndo para pressionar."],
    peso: P({ ZAG: 1.8, VOL: 1.8, LAT: 1.2, MEI: 0.8 }), opcoes: [
      { id: "curto", rotulo: "Girar e tocar curto", teste: { COM: 0.45, PAS: 0.35, DRI: 0.2 }, dif: 8, niveis: [
        e("Girou no espaço de um lenço e saiu jogando. A arquibancada aplaudiu.", 0.5, { relTecnico: 2 }),
        e("Tocou de primeira e quebrou a pressão.", 0.3),
        e("Tocou para o lado, sem risco.", 0.05),
        e("O passe saiu curto, mas o volante salvou.", -0.25),
        e("Perdeu a bola na frente da área. Gol deles.", -0.8, { golContra: true, moral: -4 })] },
      { id: "chutao", rotulo: "Dar um chutão", teste: { FOR: 0.6, CALMA: 0.4 }, dif: -12, niveis: [
        e("Chutão que virou lançamento para o {comp}.", 0.2),
        e("Afastou o perigo.", 0.05),
        e("Rifou a bola, mas o perigo passou.", -0.05),
        e("A bola voltou rápido e a pressão continuou.", -0.15),
        e("Chutou no {ata} e a bola voltou para a área.", -0.4)] },
      { id: "driblar", rotulo: "Driblar o primeiro", teste: { DRI: 0.6, COM: 0.4 }, dif: 15, tracos: { ginga: 5, drible_curto: 5 }, niveis: [
        e("Chapéu no {ata} dentro da própria área! Ousadia que a torcida adora.", 0.5, { fama: 0.5, seguidores: 0.02 }),
        e("Passou pelo primeiro e saiu jogando.", 0.25),
        e("Escapou, mas teve que recuar para o {goleiro}.", -0.05),
        e("Perdeu a bola, mas o {zagMeu} cobriu.", -0.35),
        e("Perdeu a bola tentando o drible. Gol deles e cara feia do técnico.", -1.0, { golContra: true, relTecnico: -4, moral: -4 })] },
      { id: "goleiro", rotulo: "Recuar para o goleiro", teste: { PAS: 0.5, CALMA: 0.5 }, dif: -6, quando: (c) => c.pos === "ZAG" || c.pos === "VOL", niveis: [
        e("Recuou e o {goleiro} lançou direto para o ataque. Jogada limpa.", 0.15),
        e("Recuo seguro.", 0.05),
        e("O {goleiro} teve que dar um chutão.", 0),
        e("Recuo fraco, o {goleiro} saiu correndo e afastou por pouco.", -0.3),
        e("Recuo curto, o {ata} se antecipou e tocou para o gol vazio.", -0.9, { golContra: true, moral: -5 })] },
    ] },
  { id: "dividida", titulo: ["Bola dividida no meio", "Dividida"],
    texto: ["Bola quicando entre você e o {vol}, que vem com tudo.", "A bola sobra no meio-campo, a mesma distância entre você e o {vol}."],
    peso: P({ VOL: 2, MEI: 1.2, ZAG: 0.8, LAT: 0.6, ATA: 0.5, PON: 0.4 }), opcoes: [
      { id: "forte", rotulo: "Entrar forte", teste: { FOR: 0.6, MAR: 0.4 }, dif: 4, niveis: [
        e("Ganhou a dividida e o time saiu no contra-ataque.", 0.45, { relTecnico: 1 }),
        e("Ganhou a bola no corpo.", 0.25),
        e("Os dois caíram e o juiz deu bola ao chão.", 0),
        e("Chegou atrasado e levou amarelo.", -0.25, { amarelo: true }),
        e("Choque feio. Você saiu mancando.", -0.4, { lesao: 2, moral: -3 })] },
      { id: "esperar", rotulo: "Esperar e antecipar o passe", teste: { POS: 0.5, VIS: 0.3, VEL: 0.2 }, dif: 6, niveis: [
        e("Leu a jogada e roubou a bola limpa.", 0.4),
        e("Interceptou o passe seguinte.", 0.2),
        e("O {vol} ficou com a bola, mas o time recompôs.", -0.05),
        e("O {vol} passou e o time teve que recuar.", -0.15),
        e("Ficou parado e o {vol} achou um passe que terminou em gol deles.", -0.5, { golContra: true })] },
      { id: "tirar", rotulo: "Tirar o pé", teste: { CALMA: 1 }, dif: -10, niveis: [
        e("Tirou o pé e se posicionou bem. O técnico gostou do juízo.", 0.05),
        e("Recompôs no lugar certo.", 0),
        e("O {vol} ficou com a bola.", -0.1),
        e("A torcida vaiou o recuo.", -0.2, { moral: -2 }),
        e("O {vol} avançou livre e o time levou um sufoco.", -0.3)] },
    ] },
  { id: "recompor", titulo: ["Perderam a bola no ataque", "Transição defensiva"],
    texto: ["O time perdeu a bola e o adversário vai puxar o contra-ataque. Você está lá na frente.", "O {meia} errou o passe e o {adv} vai sair jogando. Você está longe da defesa."],
    peso: P({ ATA: 1.2, PON: 1.5, MEI: 1.2, LAT: 0.8 }), opcoes: [
      { id: "voltar", rotulo: "Voltar correndo para marcar", teste: { RES: 0.5, VEL: 0.3, PROF: 0.2 }, dif: 2, niveis: [
        e("Voltou 60 metros e roubou a bola na área. O técnico vibrou no banco.", 0.45, { relTecnico: 3 }),
        e("Chegou junto e travou o passe.", 0.25, { relTecnico: 2 }),
        e("Ajudou a fechar o espaço.", 0.05, { relTecnico: 1 }),
        e("Voltou, mas chegou sem fôlego.", -0.1),
        e("Chegou atrasado e fez pênalti.", -0.6, { golContra: true, amarelo: true })] },
      { id: "esperar", rotulo: "Ficar na frente esperando a sobra", teste: { POS: 0.5, VIS: 0.5 }, dif: 10, niveis: [
        e("O time recuperou e a bola veio para você livre. Saiu na cara e marcou!", 0.6, { golPro: true, meu: "gol" }),
        e("A bola sobrou e você puxou um contra-ataque perigoso.", 0.15),
        e("O time segurou o ataque deles.", -0.05, { relTecnico: -1 }),
        e("Eles atacaram com um a mais e chutaram com perigo.", -0.2, { relTecnico: -2 }),
        e("Eles fizeram o gol com um homem a mais, e o técnico olhou para você.", -0.5, { golContra: true, relTecnico: -4 })] },
      { id: "pressionar", rotulo: "Pressionar quem está com a bola", teste: { RES: 0.4, MAR: 0.3, VEL: 0.3 }, dif: 6, niveis: [
        e("Pressionou o {vol} e roubou a bola na entrada da área deles. O {comp} fez! Assistência sua.", 0.6, { golPro: true, meu: "assist", relTecnico: 2 }),
        e("A pressão forçou o chutão. Bola recuperada.", 0.25, { relTecnico: 1 }),
        e("O {vol} se livrou da pressão.", 0),
        e("Foi driblado e ficou para trás.", -0.15),
        e("Fez falta por trás na pressão. Amarelo.", -0.25, { amarelo: true })] },
    ] },
  { id: "penaltiRisco", titulo: ["Atacante dentro da área", "Perigo na área"],
    texto: ["O {ata} recebe dentro da sua área, de costas, e gira para cima de você.", "O {craque} invade a área em velocidade. Você é o último antes do {goleiro}."],
    peso: P({ ZAG: 1.8, LAT: 1.2, VOL: 1 }), opcoes: [
      { id: "carrinho", rotulo: "Carrinho", teste: { MAR: 0.6, VEL: 0.2, CALMA: 0.2 }, dif: 14, niveis: [
        e("Carrinho perfeito, só na bola. O estádio aplaudiu como se fosse gol.", 0.6, { relTecnico: 2, fama: 0.3 }),
        e("Carrinho limpo, para escanteio.", 0.3),
        e("Tocou na bola, mas o juiz foi ao VAR. Lance normal.", 0),
        e("Pegou o pé dele. Pênalti! O {goleiro} defendeu.", -0.35, { amarelo: true }),
        e("Pênalti e amarelo. O {ata} bateu e fez.", -0.7, { golContra: true, amarelo: true, moral: -3 })] },
      { id: "empurrar", rotulo: "Ficar em pé e empurrar para fora", teste: { POS: 0.5, FOR: 0.3, CALMA: 0.2 }, dif: 6, niveis: [
        e("Conduziu o {ata} até a linha de fundo e tomou a bola.", 0.45, { relTecnico: 1 }),
        e("Ficou em pé e o chute saiu sem ângulo.", 0.25),
        e("O {ata} cruzou e a zaga afastou.", 0),
        e("O {ata} girou e chutou rasteiro, o {goleiro} defendeu.", -0.2),
        e("Ele girou nas suas costas e bateu no canto. Gol deles.", -0.55, { golContra: true })] },
      { id: "segurar", rotulo: "Segurar pela camisa", teste: { CALMA: 0.6, COM: 0.4 }, dif: 10, niveis: [
        e("Segurou de leve e ele perdeu o tempo. Ninguém viu.", 0.15),
        e("O juiz não viu.", 0.05),
        e("O juiz viu e marcou falta fora da área.", -0.1, { amarelo: true }),
        e("O VAR pegou: pênalti. O {goleiro} pulou certo e defendeu.", -0.3, { amarelo: true }),
        e("O VAR pegou: pênalti e gol deles.", -0.6, { golContra: true, amarelo: true })] },
    ] },
  { id: "ultimoHomem", titulo: ["Você é o último homem", "Só você e o goleiro"],
    texto: ["Bola nas costas da zaga. O {ata} vai sair na cara do gol e você é o último.", "Erro no meio-campo e o {craque} dispara sozinho. Só você pode alcançar."],
    peso: P({ ZAG: 1.4, VOL: 0.6, LAT: 0.5 }), opcoes: [
      { id: "correr", rotulo: "Correr e tentar o desarme", teste: { VEL: 0.5, MAR: 0.5 }, dif: 10, tracos: { velocista: 8 }, niveis: [
        e("Alcançou e tirou a bola no último segundo. Salvou o time.", 0.6, { relTecnico: 3, fama: 0.4 }),
        e("Chegou junto e atrapalhou o chute.", 0.25),
        e("Ele chutou e o {goleiro} defendeu.", 0),
        e("Não alcançou, mas a bola foi para fora.", -0.1),
        e("Não alcançou. Gol deles.", -0.4, { golContra: true })] },
      { id: "derrubar", rotulo: "Derrubar antes da área", teste: { CALMA: 1 }, dif: 6, niveis: [
        e("Falta fora da área. O juiz deu só amarelo, achou que tinha cobertura.", -0.1, { amarelo: true }),
        e("Falta e amarelo. A cobrança passou perto.", -0.15, { amarelo: true }),
        e("O juiz pensou, consultou o VAR e deu amarelo.", -0.15, { amarelo: true }),
        e("Último homem: cartão vermelho.", -0.9, { vermelho: true, relTecnico: -2 }),
        e("Vermelho direto, e a falta ainda virou gol.", -1.3, { vermelho: true, golContra: true, relTecnico: -3 })] },
      { id: "goleiro", rotulo: "Confiar no goleiro", teste: { POS: 0.5, PROF: 0.5 }, dif: 4, niveis: [
        e("Fechou o lado e o {goleiro} fechou o outro. Defesa dele.", 0.3),
        e("O {goleiro} saiu bem e abafou.", 0.15),
        e("Ele chutou para fora.", 0.05),
        e("Ele driblou o {goleiro}, mas a bola saiu.", -0.1),
        e("Ele tocou por cima do {goleiro}. Gol deles.", -0.45, { golContra: true })] },
    ] },
  { id: "salvarLinha", titulo: ["Bola indo para o gol", "Em cima da linha"],
    texto: ["O {goleiro} saiu errado e o {ata} chutou para o gol vazio. Você está na pequena área.", "Bate-rebate na sua área e a bola rola devagar em direção ao gol."],
    peso: P({ ZAG: 1.2, LAT: 1, VOL: 0.8 }), opcoes: [
      { id: "carrinho", rotulo: "Se jogar de carrinho", teste: { VEL: 0.5, POS: 0.5 }, dif: 10, niveis: [
        e("Salvou em cima da linha! Comemorado como gol.", 0.7, { relTecnico: 3, fama: 0.5 }),
        e("Tirou de carrinho para escanteio.", 0.4),
        e("Desviou e a bola bateu na trave e saiu.", 0.2),
        e("Chegou um centímetro atrasado. Gol deles.", -0.2, { golContra: true }),
        e("Tocou na bola e ela entrou mesmo assim. Gol contra.", -0.7, { golContra: true, moral: -4 })] },
      { id: "cabeca", rotulo: "Tirar de cabeça", teste: { CAB: 0.5, POS: 0.3, COM: 0.2 }, dif: 12, tracos: { cabeceador: 6 }, niveis: [
        e("Tirou de cabeça em cima da linha. Que zagueiro!", 0.6, { relTecnico: 2, fama: 0.4 }),
        e("Afastou de cabeça para o meio-campo.", 0.35),
        e("Desviou para escanteio.", 0.15),
        e("Não alcançou. Gol deles.", -0.2, { golContra: true }),
        e("Usou o braço sem querer. Pênalti e vermelho.", -1.3, { golContra: true, vermelho: true })] },
    ] },
  { id: "marcarCraque", titulo: ["Marcação no craque deles", "Missão do técnico"],
    texto: ["O técnico pede que você grude no {craque}, o melhor jogador deles.", "O {craque} está fazendo o que quer no jogo. O técnico olha para você e aponta para ele."],
    peso: P({ VOL: 1.6, LAT: 1, ZAG: 0.8, MEI: 0.4 }), opcoes: [
      { id: "grudar", rotulo: "Marcar colado o jogo todo", teste: { MAR: 0.4, RES: 0.4, PROF: 0.2 }, dif: 6, niveis: [
        e("O {craque} não tocou na bola até o fim. Atuação de marcador.", 0.6, { relTecnico: 4, fama: 0.3 }),
        e("Anulou o {craque} na maior parte do tempo.", 0.35, { relTecnico: 2 }),
        e("Cumpriu a função, sem brilho.", 0.05, { relTecnico: 1 }),
        e("O {craque} escapou duas vezes e criou chances.", -0.2),
        e("O {craque} te deu um drible desmoralizante e fez o gol.", -0.6, { golContra: true, moral: -3 })] },
      { id: "intimidar", rotulo: "Chegar forte no primeiro lance", teste: { FOR: 0.5, CALMA: 0.5 }, dif: 8, niveis: [
        e("Chegada forte e limpa. O {craque} sumiu do jogo depois disso.", 0.35, { relTecnico: 2 }),
        e("O recado foi dado, sem cartão.", 0.2),
        e("Falta, sem cartão.", 0),
        e("Amarelo logo cedo. Vai ter que marcar com cuidado.", -0.2, { amarelo: true }),
        e("Entrada violenta. Vermelho direto e o {craque} saiu de maca.", -1.4, { vermelho: true, relTecnico: -6, noticia: "Entrada de {nome} no {craque} revolta a torcida do {adv}." })] },
      { id: "zona", rotulo: "Marcar por zona e fechar os espaços", teste: { POS: 0.6, VIS: 0.4 }, dif: 6, niveis: [
        e("Fechou os espaços e o {craque} teve que buscar o jogo lá atrás.", 0.4, { relTecnico: 2 }),
        e("Boa leitura de jogo.", 0.2),
        e("O {craque} achou espaço de vez em quando.", -0.05),
        e("O técnico gritou que não era isso que ele tinha pedido.", -0.2, { relTecnico: -3 }),
        e("O {craque} achou o espaço que você deixou e fez o gol.", -0.5, { golContra: true, relTecnico: -3 })] },
    ] },
  { id: "pontaVeloz", titulo: ["O ponta deles disparou", "Corrida pelo seu lado"],
    texto: ["O ponta deles recebe em velocidade no seu lado do campo.", "Bola longa para o ponta deles. Você vai ter que correr."],
    peso: P({ LAT: 2.4, ZAG: 0.4, VOL: 0.3 }), opcoes: [
      { id: "correr", rotulo: "Acompanhar na corrida", teste: { VEL: 0.6, MAR: 0.4 }, dif: 8, tracos: { velocista: 8 }, niveis: [
        e("Acompanhou e tomou a bola na linha de fundo.", 0.45, { relTecnico: 1 }),
        e("Acompanhou e forçou o cruzamento ruim.", 0.25),
        e("Ele cruzou e a zaga afastou.", 0),
        e("Ele te deixou para trás e cruzou com perigo.", -0.25),
        e("Ele te deixou para trás e cruzou para o {ata}. Gol deles.", -0.6, { golContra: true })] },
      { id: "fechar", rotulo: "Fechar a diagonal para dentro", teste: { POS: 0.6, MAR: 0.4 }, dif: 4, niveis: [
        e("Fechou o meio e ele ficou sem opção.", 0.35),
        e("Forçou o cruzamento de longe.", 0.2),
        e("Ele cruzou da intermediária, sem perigo.", 0.05),
        e("Ele foi para fora e cruzou com tempo.", -0.15),
        e("Ele cortou para dentro mesmo assim e bateu no ângulo. Gol deles.", -0.55, { golContra: true })] },
    ] },
];
