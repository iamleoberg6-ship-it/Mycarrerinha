// Escolhas de passe e de condução: a jogada que o jogador decide no meio da partida.
// Cada situação oferece caminhos diferentes (curto, filtrado, lançamento, segurar), e o resultado depende de
// visão, passe, calma e do contexto. Ficam aqui para a partida ter muitas escolhas de jogo, não só finalizações.
import { e, P, type Situacao } from "./base.js";

export const PASSES: Situacao[] = [
  { id: "tabelaNaFrente", titulo: ["Tabela na frente da área", "Toque de primeira na meia-lua", "Parede no meio da linha"],
    texto: ["Você recebe de costas, de frente para a marcação do {zag}. O {meia} pede a bola de volta.", "{meia} abre o corpo para você. Dá para tocar de primeira e sair no meio dos volantes."],
    peso: P({ MEI: 3, ATA: 2, PON: 1.5, VOL: 1 }), opcoes: [
      { id: "devolver", rotulo: "Devolver de primeira", teste: { PAS: 0.5, CALMA: 0.5 }, dif: 6, tracos: { frieza: 3 }, niveis: [
        e(["Toque sutil, o {meia} recebeu na frente e já virou para o gol. Tabela perfeita!", "Devolveu de primeira e o {comp} entrou livre pela linha. Assistência de parede!"], 0.6, { golPro: true, meu: "assist", relTecnico: 1 }),
        e("Tabela limpa e a jogada segue no meio. Bom trabalho.", 0.25),
        e("Devolveu longe demais e o {meia} precisou parar a bola.", -0.05),
        e("O {zag} interceptou a devolução.", -0.3),
        e(["Errou o toque e a bola saiu pela linha de fundo.", "Tocou antes da hora e o {meia} ficou sem apoio."], -0.6, { moral: -2 })] },
      { id: "girar", rotulo: "Girar e buscar o espaço", teste: { DRI: 0.5, VEL: 0.3, COM: 0.2 }, dif: 9, tracos: { ginga: 5 }, niveis: [
        e(["Girou em cima do {zag} e abriu o caminho. Chegou no pé do {comp} com espaço de sobra.", "Virou o corpo, passou pelo {vol} e a defesa inteira ficou para trás."], 0.5, { relTecnico: 1, fama: 0.3 }),
        e("Girou, ganhou metros e a jogada foi para a ala.", 0.2),
        e("Girou para o lado errado. Perdeu o tempo da jogada.", -0.2),
        e("O {vol} tomou a bola no giro.", -0.4),
        e("Girou demais e caiu sem contato. Falta a favor, mas o público vaiou.", -0.5, { moral: -2 })] },
      { id: "segurar", rotulo: "Segurar e esperar o apoio", teste: { CALMA: 0.6, VIS: 0.4 }, dif: 4, niveis: [
        e("Segurou a bola sob pressão e o time inteiro subiu. Você deu tempo ao jogo.", 0.3, { moral: 2, relTecnico: 2 }),
        e("Segurou, e o apoio chegou a tempo.", 0.15),
        e("Segurou demais e perdeu a bola por pouco.", -0.2),
        e("Esperou tanto que o {zag} cortou.", -0.4),
        e(["Segurou na frente do {zag} e a bola foi roubada na cara do gol.", "Ficou parado e levou o desarme sem nem reagir."], -0.7, { moral: -3 })] },
    ] },
  { id: "lancamentoCostas", titulo: ["Lançamento nas costas da zaga", "Bola em profundidade", "Lançar para quem corre"],
    texto: ["A linha do {zag} está alta. O {ata} faz a diagonal, e só um lançamento preciso pode pegá-lo.", "O {comp} aponta para o espaço entre os zagueiros. É agora ou nunca."],
    peso: P({ MEI: 3, VOL: 2.5, LAT: 1.2, ZAG: 1.5 }), opcoes: [
      { id: "lancar", rotulo: "Lançar com força", teste: { PAS: 0.6, VIS: 0.4 }, dif: 10, tracos: { chute_longe: 3 }, niveis: [
        e(["Lançamento milimétrico. O {comp} entrou sozinho e deu o toque por cima do {gol}. GOL!", "Bola nas costas da defesa, na medida. O {comp} só empurrou. GOL!"], 0.9, { golPro: true, meu: "assist", fama: 0.4, relTecnico: 1 }),
        e("Lançou na medida, mas o {gol} saiu e cortou.", 0.35),
        e("Lançou forte demais e a bola saiu pela linha de fundo.", -0.25),
        e("Lançamento curto. O {zag} voltou a tempo.", -0.4),
        e("Lançou para o nada e o {zag} ficou com a bola.", -0.6, { moral: -2 })] },
      { id: "passeSeguro", rotulo: "Passe de segurança para trás", teste: { CALMA: 0.7, PAS: 0.3 }, dif: 2, niveis: [
        e("Preferiu o passe seguro, e o time reorganizou sem correr risco.", 0.1, { moral: 1 }),
        e("Passe seguro e sem risco. Jogada morna.", 0.05),
        e("Passe seguro demais, o adversário pressionou de novo.", -0.1),
        e("O passe saiu tão fraco que o {ata} parou de esperar.", -0.2),
        e("Recuou sem olhar e o {zag} cortou para escanteio.", -0.3)] },
    ] },
  { id: "inversao", titulo: ["Inversão de jogo", "Virar o jogo para o outro lado", "Trocar de lado a jogada"],
    texto: ["A marcação está toda para o lado direito. Do outro lado, o {ponta} está livre na linha.", "O campo está fechado de um lado e aberto do outro. Você tem a visão do jogo inteiro."],
    peso: P({ MEI: 3, VOL: 2, ZAG: 1.4, LAT: 1 }), opcoes: [
      { id: "trocar", rotulo: "Inverter em diagonal", teste: { VIS: 0.5, PAS: 0.5 }, dif: 7, niveis: [
        e(["Diagonal perfeita para o {ponta}, que já cruzou na área. Jogada de mestre.", "Trocou de lado, a defesa virou e o {ponta} ficou livre na meia-lua."], 0.5, { relTecnico: 2, moral: 2 }),
        e("Trocou de lado, mas a jogada demorou para chegar.", 0.2),
        e("A bola chegou no pé do {lat}, que não estava preparado.", -0.1),
        e("A diagonal foi longa e o {lat} adversário cortou.", -0.3),
        e("Inverteu para o lado que já estava marcado. Perdeu a bola.", -0.6, { moral: -2 })] },
      { id: "curta", rotulo: "Manter o jogo curto", teste: { CALMA: 0.5, PAS: 0.5 }, dif: 3, niveis: [
        e("Manteve o jogo curto, e a defesa adversária foi se cansando de correr atrás.", 0.25),
        e("Jogo curto, sem perigo, mas o time respirou.", 0.1),
        e("Passe curto demais, e a bola voltou para o adversário.", -0.2),
        e("O toque foi bobo e a jogada morreu no meio.", -0.3),
        e("Trocou passes sem direção até o adversário fechar tudo.", -0.4)] },
    ] },
  { id: "passeFiltrado", titulo: ["Passe filtrado pelo meio", "Brecha entre os zagueiros", "Passe por dentro"],
    texto: ["Há uma brecha exatamente entre os dois zagueiros. Um passe rasteiro pode colocar o {comp} na cara do gol.", "O {zag} está de costas para a bola. Só precisa de um toque por dentro."],
    peso: P({ MEI: 3, ATA: 1.5, VOL: 1.2 }), opcoes: [
      { id: "filtrado", rotulo: "Filtrar por dentro", teste: { PAS: 0.55, VIS: 0.45 }, dif: 11, niveis: [
        e(["Passou no meio dos zagueiros e o {comp} só precisou tocar. GOL!", "Filtrou com precisão e a bola caiu na frente do {comp}. GOL!"], 0.85, { golPro: true, meu: "assist", fama: 0.3, relTecnico: 1 }),
        e("Filtrou e o {gol} saiu para cortar.", 0.3),
        e("Passou na medida, mas o {comp} estava impedido.", -0.2),
        e("Passou forte e a bola escapou do {comp}.", -0.4),
        e("O passe foi cortado pelo {zag}, que nem precisou correr.", -0.6, { moral: -2 })] },
      { id: "lado", rotulo: "Tocar para o lado", teste: { CALMA: 0.6, PAS: 0.4 }, dif: 3, niveis: [
        e("Tocou para o lado, e a jogada voltou ao meio com o {ponta} livre.", 0.2),
        e("Tocou para o lado e a pressão ficou menor.", 0.05),
        e("Tocou para o lado e o adversário fechou o espaço.", -0.15),
        e("O toque lateral foi lento e perdeu a vantagem.", -0.3),
        e("Desviou para o lado errado e cedeu o escanteio.", -0.45)] },
    ] },
  { id: "bolaParadaCurta", titulo: ["Escanteio curto", "Falta cobrada no pé do companheiro", "Cobrança de bola parada"],
    texto: ["Escanteio favorável, mas a área está cheia. Há a opção de tocar curto para o {meia} antes de cruzar.", "Falta na intermediária. A barreira está montada, mas o {batedor} pede a bola."],
    peso: P({ MEI: 2.5, ATA: 1.5, PON: 1.8, LAT: 1.2, VOL: 1 }), opcoes: [
      { id: "curto", rotulo: "Tocar curto e cruzar depois", teste: { PAS: 0.5, VIS: 0.3, CALMA: 0.2 }, dif: 8, niveis: [
        e(["Tocou curto, o {meia} cruzou na cabeça do {comp}. GOL!", "Jogada ensaiada na perfeição. O cruzamento saiu e o {comp} cabeceou no canto. GOL!"], 0.8, { golPro: true, meu: "assist", fama: 0.4 }),
        e("Jogada ensaiada, mas o cruzamento saiu forte demais.", 0.2),
        e("Tocou curto demais e o escanteio virou contra-ataque.", -0.3),
        e("O cruzamento saiu para o goleiro sem perigo.", -0.2),
        e("A jogada travou e o {zag} afastou com facilidade.", -0.5, { moral: -2 })] },
      { id: "direto", rotulo: "Bater direto para a área", teste: { CRU: 0.6, FOR: 0.4 }, dif: 9, tracos: { chute_longe: 2 }, niveis: [
        e(["Cruzou no segundo pau. O {comp} subiu mais alto que todo mundo. GOL!", "Bola direto na área, a defesa se atrapalhou e o {comp} empurrou. GOL!"], 0.7, { golPro: true, meu: "assist" }),
        e("Cruzamento na medida, mas o {gol} saiu para socar.", 0.25),
        e("Cruzou forte demais e a bola saiu pela linha de fundo.", -0.25),
        e("Cruzou na primeira linha e o {zag} afastou de cabeça.", -0.35),
        e("Cruzou para o nada. A torcida reclamou.", -0.6, { moral: -2 })] },
    ] },
  { id: "passeEspaco", titulo: ["Passe para o espaço vazio", "Bola para o companheiro que corre", "Lançar no corredor"],
    texto: ["O {ponta} arranca pelo corredor com a marcação atrás. Um passe no espaço vazio resolve a jogada.", "O {comp} corre na diagonal sem ninguém perto. Basta acertar o ritmo."],
    peso: P({ PON: 3, MEI: 2, LAT: 1.4, ATA: 1.2 }), opcoes: [
      { id: "acelerar", rotulo: "Acelerar o passe", teste: { PAS: 0.5, VEL: 0.3, VIS: 0.2 }, dif: 8, niveis: [
        e(["Passe no ritmo exato. O {ponta} entrou na área e bateu cruzado. GOL!", "Passe no espaço, o {ponta} chegou antes do {lat}. GOL!"], 0.8, { golPro: true, meu: "assist", fama: 0.3, relTecnico: 1 }),
        e("Passe bonito, mas o {ponta} chegou um passo atrás e o {lat} recuperou.", 0.2),
        e("Passe forte demais e o {ponta} não alcançou.", -0.3),
        e("Passe fraco, e o {lat} ficou com a bola.", -0.4),
        e("Errou o destino do passe e a bola foi para a torcida.", -0.6, { moral: -2 })] },
      { id: "esperar", rotulo: "Esperar o companheiro chegar", teste: { CALMA: 0.6, VIS: 0.4 }, dif: 3, niveis: [
        e("Esperou o companheiro chegar e o adversário não teve tempo de voltar.", 0.25),
        e("Esperou, e a jogada foi para o meio com perigo.", 0.1),
        e("Esperou demais e o adversário fechou.", -0.15),
        e("A espera deixou o {ponta} marcado.", -0.35),
        e("Esperou tanto que a bola sumiu no meio da pressão.", -0.5)] },
    ] },
  { id: "toqueCalcanhar", titulo: ["Toque de calcanhar", "Calcanhar para o companheiro", "Brincadeira no meio do campo"],
    texto: ["A bola chega de costas. Dá para virar com um toque de calcanhar, mas o risco é grande.", "Você recebe de costas e o {vol} está na sua frente. Um calcanhar pode surpreender o campo inteiro."],
    peso: P({ MEI: 2, ATA: 1.8, PON: 1.2 }), rara: true, opcoes: [
      { id: "calcanhar", rotulo: "Tentar o calcanhar", teste: { DRI: 0.5, COM: 0.3, CALMA: 0.2 }, dif: 12, tracos: { ginga: 7 }, niveis: [
        e(["Toque de calcanhar sem olhar. O {comp} recebeu livre e a torcida veio abaixo!", "Calcanhar perfeito, o {comp} passou pela defesa como se nada tivesse. GOL!"], 0.9, { golPro: true, meu: "assist", fama: 1.2, seguidores: 0.05 }),
        e("Calcanhar ousado, e a jogada foi para o lado certo.", 0.3, { fama: 0.4 }),
        e("Calcanhar que não deu certo. A bola ficou no meio do caminho.", -0.2),
        e("Tentou o calcanhar e o {vol} roubou a bola.", -0.5),
        e("Calcanhar errado e o ataque morreu na saída. Vídeo de todo mundo rindo.", -0.8, { moral: -4, fama: -0.4 })] },
      { id: "simples", rotulo: "Tocar simples", teste: { PAS: 0.6, CALMA: 0.4 }, dif: 2, niveis: [
        e("Tocou simples e a jogada seguiu sem erro.", 0.15),
        e("Tocou simples e o time saiu bem da pressão.", 0.1),
        e("Tocou simples, mas sem direção.", -0.05),
        e("Tocou para o lado errado.", -0.25),
        e("O toque simples foi interceptado.", -0.4)] },
    ] },
];
