// Mais variedade de situações: pressão, condução, cruzamento, marcação, contra-ataque, fim de jogo e bola aérea.
// Cada uma oferece caminhos com atributos diferentes, para a partida não repetir sempre a mesma pergunta.
import { e, P, type Situacao } from "./base.js";

export const VARIEDADE: Situacao[] = [
  { id: "v_pressaoAlta", titulo: ["Pressão na saída de bola", "Pressionar o armador", "Subir para roubar"],
    texto: ["O {meia} adversário recebe de costas, sem opção de passe. Subir a marcação pode ser a hora certa.", "O time adversário sai jogando curto. Se você pressionar agora, a bola pode ser sua."],
    peso: P({ VOL: 2.5, MEI: 2, ATA: 1.5, ZAG: 1 }), opcoes: [
      { id: "subir", rotulo: "Subir para pressionar", teste: { VEL: 0.4, FOR: 0.3, CALMA: 0.3 }, dif: 8, niveis: [
        e(["Subiu forte, roubou a bola e o time saiu em velocidade. Virou ataque rápido!", "Pressão no momento certo: o adversário errou o passe e a bola ficou com você."], 0.6, { relTecnico: 2, moral: 2 }),
        e("Subiu e ganhou a bola de volta, mas sem sair em velocidade.", 0.25),
        e("Subiu, mas o adversário passou pelas suas costas.", -0.25),
        e("Subiu tarde e o adversário ganhou metros.", -0.4),
        e(["Pressionou sem cobertura e deixou o espaço vazio. Gol do adversário.", "Subiu e a defesa ficou exposta. Contra-ataque limpo."], -0.8, { golContra: true, moral: -3 })] },
      { id: "fechar", rotulo: "Fechar o espaço e esperar", teste: { VIS: 0.5, CALMA: 0.5 }, dif: 4, niveis: [
        e("Fechou o espaço e forçou o passe para o lado. Os companheiros chegaram bem.", 0.3, { relTecnico: 1 }),
        e("Fechou o espaço e a jogada foi para o lado sem perigo.", 0.1),
        e("Ficou esperando e o adversário ganhou o tempo que queria.", -0.15),
        e("Esperou demais e o passe saiu longo para o ponta.", -0.3),
        e("Não fechou nada e a jogada chegou de frente para o gol.", -0.6, { moral: -2 })] },
    ] },
  { id: "v_conducaoMeio", titulo: ["Condução pelo meio-campo", "Carregar a bola pelo centro", "Avançar com a bola"],
    texto: ["A linha de meio-campo está aberta. Você pode carregar a bola alguns metros antes de decidir.", "Há espaço à sua frente, mas o {vol} adversário vem no seu encalço."],
    peso: P({ MEI: 3, VOL: 2, ZAG: 1.2 }), opcoes: [
      { id: "carregar", rotulo: "Carregar a bola", teste: { VEL: 0.4, DRI: 0.3, CALMA: 0.3 }, dif: 9, niveis: [
        e(["Carregou a bola até a intermediária. A defesa recuou e o time respirou de vez.", "Avançou com a bola e puxou o adversário. Espaço aberto para o ponta!"], 0.45, { relTecnico: 1, fama: 0.2 }),
        e("Carregou um pouco e depois tocou simples para o lado.", 0.15),
        e("Carregou demais e o {vol} tomou a bola.", -0.4),
        e("A condução foi lenta e o adversário fechou tudo.", -0.3),
        e("Perdeu a bola no meio do caminho e virou contra-ataque.", -0.7, { moral: -3 })] },
      { id: "passar", rotulo: "Tocar e receber de volta", teste: { PAS: 0.5, CALMA: 0.5 }, dif: 5, niveis: [
        e("Tocou e recebeu de volta no espaço, já com a defesa desmontada.", 0.3, { relTecnico: 1 }),
        e("Tocou e recebeu de volta, sem grande ganho.", 0.1),
        e("O toque de volta saiu fraco e o adversário cortou.", -0.25),
        e("Errou o toque e perdeu a posição no meio.", -0.4),
        e("Tocou para o nada e o time parou.", -0.5)] },
    ] },
  { id: "v_cruzamentoPlanejado", titulo: ["Cruzar na área lotada", "Bola rasteira na pequena área", "Cruzamento de fundo"],
    texto: ["Você está na linha de fundo. Há gente na pequena área, mas o {gol} adversário está fora do lugar.", "O {lat} está na sua frente, e a área tem um companheiro livre no segundo pau."],
    peso: P({ LAT: 3, PON: 2.5, MEI: 1.5 }), opcoes: [
      { id: "rasteiro", rotulo: "Cruzar rasteiro", teste: { CRU: 0.5, PAS: 0.3, CALMA: 0.2 }, dif: 8, niveis: [
        e(["Cruzamento rasteiro e preciso. O {comp} só empurrou para o fundo da rede. GOL!", "Bola rasteira na pequena área, o {comp} tocou sem tempo para o goleiro. GOL!"], 0.85, { golPro: true, meu: "assist", fama: 0.3 }),
        e("Cruzou rasteiro, mas o {zag} chegou antes.", 0.2),
        e("Cruzou rasteiro demais e a bola saiu pela linha de fundo.", -0.25),
        e("O cruzamento foi fraco e o {gol} saiu para pegar.", -0.2),
        e("Cruzou para longe de todo mundo. Nada aconteceu.", -0.5, { moral: -2 })] },
      { id: "alto", rotulo: "Cruzar alto", teste: { CRU: 0.4, FOR: 0.3, VIS: 0.3 }, dif: 10, tracos: { cabeceador: 3 }, niveis: [
        e(["Cruzamento alto. O {comp} subiu sozinho e cabeceou no canto. GOL!", "Bola alta no meio da área, o {comp} ganhou do {zag} no alto. GOL!"], 0.8, { golPro: true, meu: "assist" }),
        e("Cruzou alto e o {gol} agarrou.", 0.25),
        e("Cruzou alto demais e o {zag} afastou de cabeça.", -0.3),
        e("O cruzamento saiu para fora sem perigo.", -0.35),
        e("Cruzou na direção do {zag}. Ele devolveu para o contra-ataque.", -0.7, { moral: -2 })] },
    ] },
  { id: "v_faltaPerigosa", titulo: ["Falta perigosa", "Falta a 25 metros", "Cobrança de falta"],
    texto: ["Falta em zona de perigo. A barreira está montada, e o {batedor} parece pronto.", "Falta frontal, a 25 metros. Você pode chutar direto ou tentar um toque por cima da barreira."],
    peso: P({ MEI: 2.5, ATA: 2, PON: 1.5 }), opcoes: [
      { id: "chutar", rotulo: "Bater no canto", teste: { FIN: 0.5, FOR: 0.25, CALMA: 0.25 }, dif: 11, tracos: { chute_longe: 3 }, niveis: [
        e(["Bateu no canto da barreira. O {gol} não viu. GOL!", "Chute colocado, no ângulo. A torcida explodiu. GOL!"], 0.9, { golPro: true, fama: 0.5, seguidores: 0.05 }),
        e("Chute forte, mas o {gol} deu um jeito de desviar.", 0.3),
        e("Chutou na barreira. O time perdeu o escanteio.", -0.2),
        e("Chute alto demais e a bola saiu pelo alto.", -0.35),
        e("Chutou para a barreira com toda força. Sem perigo.", -0.5, { moral: -2 })] },
      { id: "tocar", rotulo: "Tocar para o companheiro", teste: { PAS: 0.6, CALMA: 0.4 }, dif: 5, niveis: [
        e("Tocou para o {meia}, que emendou de primeira. Gol!", 0.85, { golPro: true, meu: "assist" }),
        e("Tocou para o companheiro, e a jogada ficou perigosa.", 0.3),
        e("Tocou curto demais e a barreira avançou.", -0.25),
        e("Tocou para o lado errado e o ataque morreu.", -0.4),
        e("Tocou na barreira e a bola voltou para o adversário.", -0.55, { moral: -2 })] },
    ] },
  { id: "v_marcacaoIndividual", titulo: ["Marcação individual", "Seguir o atacante", "Colar no adversário"],
    texto: ["O {ata} adversário recebe a bola de costas. Você está colado nele, mas a jogada ainda está aberta.", "O {comp} adversário sai do seu lado e faz a diagonal. Você precisa escolher: acompanhar ou ficar no lugar."],
    peso: P({ ZAG: 3, LAT: 2, VOL: 1.5 }), opcoes: [
      { id: "acompanhar", rotulo: "Acompanhar a diagonal", teste: { VEL: 0.4, VIS: 0.3, CALMA: 0.3 }, dif: 8, niveis: [
        e(["Acompanhou a diagonal e cortou o passe bem na hora. Desarme limpo!", "Ficou colado no atacante, que não teve espaço para girar. Bola recuperada."], 0.5, { relTecnico: 2, moral: 2 }),
        e("Acompanhou e chegou junto, mas sem tirar a bola.", 0.2),
        e("Acompanhou tarde, e o atacante ganhou metros.", -0.3),
        e("Perdeu a diagonal de vista e o passe chegou no atacante livre.", -0.6, { moral: -2 }),
        e(["Ficou para trás e o atacante saiu sozinho na área.", "Acompanhou com a perna errada e o adversário passou."], -0.8, { golContra: true, moral: -3 })] },
      { id: "ficar", rotulo: "Manter a posição", teste: { VIS: 0.6, CALMA: 0.4 }, dif: 4, niveis: [
        e("Manteve a posição e o passe da diagonal foi interceptado pelo companheiro.", 0.35, { relTecnico: 1 }),
        e("Manteve a posição e a jogada morreu.", 0.1),
        e("Manteve a posição, mas o atacante girou e chutou perto.", -0.25),
        e("Ficou parado e o atacante recebeu livre.", -0.5),
        e("Não fez nada e o adversário marcou.", -0.75, { golContra: true, moral: -3 })] },
    ] },
  { id: "v_contraAtaqueSuperioridade", titulo: ["Contra-ataque com superioridade", "Dois contra um", "Três contra dois"],
    texto: ["Você tem dois companheiros correndo com você e só um defensor à frente. A decisão é rápida.", "Recuperou a bola e o campo está aberto. Você tem três atacantes no meio da defesa."],
    peso: P({ MEI: 2.5, ATA: 2.5, PON: 2, VOL: 1 }), rara: true, opcoes: [
      { id: "tocar", rotulo: "Tocar para o companheiro livre", teste: { PAS: 0.4, VIS: 0.4, CALMA: 0.2 }, dif: 7, niveis: [
        e(["Passe no tempo exato. O companheiro chegou sozinho e bateu sem goleiro. GOL!", "Tocou para o lado livre, o {comp} ficou cara a cara com o {gol}. GOL!"], 0.9, { golPro: true, meu: "assist", fama: 0.3, relTecnico: 1 }),
        e("Tocou certo, mas o defensor fechou a passagem.", 0.25),
        e("Tocou tarde e o defensor chegou a tempo.", -0.2),
        e("Passe para o lado errado. Perdeu o contra-ataque.", -0.45),
        e("Passe fraco e o adversário pegou a bola de volta.", -0.7, { moral: -2 })] },
      { id: "chutar", rotulo: "Chutar de longe", teste: { FIN: 0.5, CALMA: 0.5 }, dif: 9, tracos: { chute_longe: 3 }, niveis: [
        e(["Chute de fora da área, sem goleiro. Entrou no meio do gol. GOL!", "Chutou de longe no contra-ataque e o goleiro nem chegou perto. GOL!"], 0.85, { golPro: true, fama: 0.4 }),
        e("Chutou forte, o goleiro defendeu no canto.", 0.25),
        e("Chutou por cima do gol.", -0.3),
        e("Chutou fraco e o goleiro pegou fácil.", -0.4),
        e("Chutou na torcida. A chance foi perdida.", -0.6, { moral: -2 })] },
    ] },
  { id: "v_foraDeCampo", titulo: ["Perder tempo no fim", "Segurar o resultado", "Esfriar o jogo"],
    texto: ["O placar está a seu favor e faltam poucos minutos. Você pode acelerar o ritmo ou deixar a bola rolar devagar.", "A torcida está pedindo mais ataque, mas o time precisa segurar a vantagem. A decisão é sua."],
    peso: P({ MEI: 2, VOL: 2.5, ZAG: 2, LAT: 1.5 }), opcoes: [
      { id: "esfriar", rotulo: "Esfriar o jogo", teste: { CALMA: 0.7, VIS: 0.3 }, dif: 3, niveis: [
        e("Esfriou o jogo e segurou a pressão até o apito final. Vitória garantida.", 0.3, { moral: 2, relTecnico: 1 }),
        e("Segurou o ritmo e o time respirou. Sem sustos.", 0.15),
        e("Esfriou demais e o adversário pressionou.", -0.1),
        e("Perdeu a bola na tentativa de esfriar e o adversário chegou.", -0.4),
        e("Esfriou tanto que o adversário empatou nos acréscimos.", -0.75, { golContra: true, moral: -3 })] },
      { id: "acelerar", rotulo: "Acelerar e buscar o terceiro gol", teste: { VEL: 0.5, PAS: 0.5 }, dif: 7, niveis: [
        e("Acelerou e fez o terceiro gol. Jogo decidido!", 0.9, { golPro: true, relTecnico: 2, fama: 0.3 }),
        e("Acelerou, criou uma boa chance e o gol não saiu.", 0.25),
        e("Acelerou demais e perdeu a bola na frente.", -0.3),
        e("A pressa deixou o time exposto. O adversário chegou.", -0.5),
        e("Acelerou e levou o contra-ataque. O empate veio logo depois.", -0.9, { golContra: true, moral: -4 })] },
    ] },
  { id: "v_bolaAerea", titulo: ["Disputa de bola aérea", "Bola alta na área", "Subir de cabeça"],
    texto: ["A bola vem alta na sua direção. O {zag} adversário também quer subir.", "Escanteio ou lançamento alto: a bola cai no meio da área com dois jogadores disputando."],
    peso: P({ ZAG: 2.5, ATA: 2, VOL: 1.5, LAT: 1 }), opcoes: [
      { id: "cabecear", rotulo: "Subir e cabecear", teste: { FOR: 0.4, CAB: 0.3, CALMA: 0.3 }, dif: 9, tracos: { cabeceador: 3 }, niveis: [
        e(["Subiu mais alto e cabeceou para o fundo da rede. GOL!", "Subiu no momento certo e encostou de cabeça. O goleiro nem viu. GOL!"], 0.85, { golPro: true, fama: 0.3 }),
        e("Cabeceou forte, mas o goleiro espalmou.", 0.25),
        e("Cabeceou fraco e a bola foi para o lado.", -0.25),
        e("Cabeceou para o próprio goleiro.", -0.4),
        e("Subiu e não encostou. O adversário ganhou a bola.", -0.6, { moral: -2 })] },
      { id: "deixar", rotulo: "Deixar a bola passar", teste: { VIS: 0.6, CALMA: 0.4 }, dif: 4, niveis: [
        e("Deixou a bola passar e o companheiro de trás chegou livre.", 0.25, { relTecnico: 1 }),
        e("Deixou passar e a bola foi para o lado.", 0.05),
        e("Deixou passar e o adversário pegou no segundo tempo.", -0.2),
        e("Deixou passar e a bola ficou com o adversário na frente.", -0.45),
        e("Deixou passar, e a bola caiu para o adversário livre.", -0.7, { golContra: true, moral: -3 })] },
    ] },
];
