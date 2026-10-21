// Lances de decisão dentro do jogo. Cada situação testa atributos, traços e temperamento
// contra o nível do adversário, com um sorteio por cima: o resultado sai em cinco níveis,
// do lance perfeito ao desastre. A chance nunca aparece na tela.
import { RNG, clamp } from "./rng.js";
import type { Atributo, Atributos, Posicao } from "./atributos.js";
import type { PersonalidadeDNA, TracoId } from "./dna.js";

export type Nivel = 0 | 1 | 2 | 3 | 4; // 0 ótimo · 1 bom · 2 neutro · 3 ruim · 4 desastre
export interface Efeito {
  texto: string; nota: number;
  golPro?: boolean; golContra?: boolean; meu?: "gol" | "assist";
  amarelo?: boolean; vermelho?: boolean; lesao?: number; fama?: number; moral?: number; relTecnico?: number; seguidores?: number; noticia?: string;
}
type Teste = Partial<Record<Atributo | "CALMA" | "CARISMA" | "PROF", number>>;
export interface OpcaoLance { id: string; rotulo: string; teste: Teste; dif: number; tracos?: Partial<Record<TracoId, number>>; niveis: [Efeito, Efeito, Efeito, Efeito, Efeito] }
export interface Contexto { pos: Posicao; min: number; saldo: number; base: boolean; jaFezGol: boolean }
export interface Situacao { id: string; titulo: string; texto: string; peso: (c: Contexto) => number; opcoes: OpcaoLance[] }

const e = (texto: string, nota: number, x: Partial<Efeito> = {}): Efeito => ({ texto, nota, ...x });
const P = (m: Partial<Record<Posicao, number>>) => (c: Contexto) => m[c.pos] ?? 0;

export const SITUACOES: Situacao[] = [
  { id: "caraACara", titulo: "Cara a cara com o goleiro", texto: "A bola sobra na entrada da pequena área. Só tem o goleiro na sua frente.",
    peso: P({ ATA: 3, PON: 1.6, MEI: 1 }), opcoes: [
      { id: "colocado", rotulo: "Bater colocado", teste: { FIN: 0.65, COM: 0.35 }, dif: 6, tracos: { frieza: 6 }, niveis: [
        e("No cantinho, o goleiro nem se mexeu. GOL!", 0.6, { golPro: true, meu: "gol" }), e("Rasteiro, no canto. GOL!", 0.4, { golPro: true, meu: "gol" }),
        e("O goleiro se esticou todo e espalmou.", -0.1), e("Saiu fraco, nas mãos do goleiro.", -0.3), e("Pegou mal na bola e ela foi para a lateral. A torcida não perdoou.", -0.6, { moral: -3 })] },
      { id: "forte", rotulo: "Encher o pé", teste: { FIN: 0.5, FOR: 0.5 }, dif: 9, tracos: { chute_longe: 4 }, niveis: [
        e("Bomba no ângulo. GOLAÇO!", 0.7, { golPro: true, meu: "gol", fama: 0.3 }), e("Forte, no meio do gol, e entrou. GOL!", 0.4, { golPro: true, meu: "gol" }),
        e("O goleiro espalmou para escanteio.", -0.05), e("Por cima do travessão.", -0.3), e("Foi parar na arquibancada.", -0.6, { moral: -3 })] },
      { id: "driblar", rotulo: "Driblar o goleiro", teste: { DRI: 0.55, COM: 0.3, VEL: 0.15 }, dif: 13, tracos: { ginga: 7, drible_curto: 5 }, niveis: [
        e("Deixou o goleiro sentado e tocou para o gol vazio. Golaço de vídeo!", 0.9, { golPro: true, meu: "gol", fama: 0.6, seguidores: 0.03 }), e("Driblou e empurrou para a rede. GOL!", 0.5, { golPro: true, meu: "gol" }),
        e("O goleiro abafou na hora certa.", -0.2), e("Levou demais e o zagueiro voltou a tempo.", -0.4), e("Tropeçou na bola sozinho. Vai rodar nas redes, mas não do jeito bom.", -0.8, { moral: -4, seguidores: 0.01 })] },
      { id: "rolar", rotulo: "Rolar para o companheiro", teste: { PAS: 0.5, VIS: 0.5 }, dif: 2, niveis: [
        e("Rolou na medida, o companheiro só empurrou. Assistência sua!", 0.5, { golPro: true, meu: "assist", relTecnico: 1 }), e("Passou, e o companheiro bateu em cima do goleiro. Boa jogada.", 0.1),
        e("O passe saiu atrás e a jogada morreu.", -0.1), e("O zagueiro cortou o passe.", -0.25), e("Passou para ninguém. O técnico abriu os braços no banco.", -0.5, { relTecnico: -2 })] },
    ] },
  { id: "chuteFora", titulo: "Bola ajeitada na intermediária", texto: "A bola sobra limpa a uns 25 metros do gol. O meio está fechado.",
    peso: P({ MEI: 1.6, VOL: 1.3, PON: 1, ATA: 0.6, LAT: 0.5 }), opcoes: [
      { id: "chutar", rotulo: "Arriscar de fora", teste: { FIN: 0.7, FOR: 0.3 }, dif: 18, tracos: { chute_longe: 12 }, niveis: [
        e("De fora da área, no ângulo! Golaço!", 0.9, { golPro: true, meu: "gol", fama: 0.6 }), e("O goleiro soltou e alguém do seu time pegou o rebote. Gol, nasceu do seu chute!", 0.3, { golPro: true }),
        e("Raspou a trave. A torcida fez \"uuuh\".", 0.05), e("Foi longe do gol.", -0.2), e("Pegou mal e a bola foi para a lateral. Contra-ataque deles.", -0.4)] },
      { id: "tocar", rotulo: "Tocar e manter a posse", teste: { PAS: 0.6, COM: 0.4 }, dif: -4, niveis: [
        e("Tocou, se apresentou de novo e virou o jogo. Lance de quem entende.", 0.3, { relTecnico: 2 }), e("Posse mantida, time respirando.", 0.15, { relTecnico: 1 }),
        e("Passe simples, nada de mais.", 0), e("O passe saiu nas costas do companheiro.", -0.2), e("Entregou a bola no pé do adversário.", -0.35)] },
      { id: "conduzir", rotulo: "Conduzir e puxar a marcação", teste: { DRI: 0.6, FOR: 0.2, VEL: 0.2 }, dif: 8, tracos: { drible_curto: 4 }, niveis: [
        e("Passou por dois e sofreu a falta na entrada da área.", 0.45), e("Ganhou terreno e abriu espaço para o lateral.", 0.2),
        e("Foi travado, mas o time recuperou.", -0.05), e("Perdeu a bola na condução.", -0.25), e("Perdeu a bola e o contra-ataque terminou em gol deles.", -0.6, { golContra: true })] },
    ] },
  { id: "umContraUm", titulo: "Um contra um pelo lado", texto: "Você recebe aberto, com o marcador vindo sozinho.",
    peso: P({ PON: 2.4, LAT: 1.3, ATA: 0.7, MEI: 0.6 }), opcoes: [
      { id: "fundo", rotulo: "Partir para a linha de fundo e cruzar", teste: { VEL: 0.35, DRI: 0.3, CRU: 0.35 }, dif: 8, tracos: { velocista: 6, ginga: 3 }, niveis: [
        e("Passou fácil e cruzou na cabeça do centroavante. Assistência sua!", 0.6, { golPro: true, meu: "assist" }), e("Ganhou na corrida e cruzou. A zaga afastou para escanteio.", 0.15),
        e("O lateral acompanhou e a bola saiu.", -0.05), e("Cruzou direto para o goleiro.", -0.2), e("Perdeu a bola e o lateral deles saiu jogando livre.", -0.35)] },
      { id: "dentro", rotulo: "Cortar para dentro e finalizar", teste: { DRI: 0.5, FIN: 0.5 }, dif: 14, tracos: { drible_curto: 5, chute_longe: 4 }, niveis: [
        e("Cortou e bateu de chapa no ângulo. GOL!", 0.8, { golPro: true, meu: "gol", fama: 0.4 }), e("Cortou e bateu firme. O goleiro fez grande defesa.", 0.2),
        e("O chute travou na defesa.", -0.1), e("Bateu sem ângulo, por cima.", -0.25), e("Perdeu a bola no drible e tomou o contra-ataque.", -0.45)] },
      { id: "tabela", rotulo: "Tabelar com o meia", teste: { PAS: 0.5, VIS: 0.3, VEL: 0.2 }, dif: 4, niveis: [
        e("Tabela perfeita e você entrou na área livre. GOL!", 0.6, { golPro: true, meu: "gol" }), e("A tabela funcionou e o time chegou com perigo.", 0.15),
        e("O marcador cortou a devolução.", -0.05), e("O passe saiu forte demais.", -0.2), e("Errou o passe e o contra-ataque pegou a defesa aberta.", -0.4)] },
    ] },
  { id: "contraDefesa", titulo: "Contra-ataque do adversário", texto: "Eles roubaram a bola e vêm três contra dois. O atacante parte para cima de você.",
    peso: P({ ZAG: 2.6, VOL: 2.2, LAT: 1.8, MEI: 0.4 }), opcoes: [
      { id: "bote", rotulo: "Dar o bote", teste: { MAR: 0.55, FOR: 0.25, VEL: 0.2 }, dif: 6, niveis: [
        e("Bote limpo e já saiu jogando. A torcida levantou.", 0.6, { relTecnico: 2 }), e("Desarmou na hora certa.", 0.35),
        e("Mandou a bola para lateral.", 0.05), e("Ele passou, mas o goleiro salvou.", -0.3), e("Passou por você como se não estivesse lá. Gol deles.", -0.7, { golContra: true, moral: -3 })] },
      { id: "acompanhar", rotulo: "Acompanhar e fechar o ângulo", teste: { POS: 0.55, VEL: 0.45 }, dif: 2, niveis: [
        e("Fechou tudo, o chute saiu fraco e o goleiro pegou.", 0.45), e("Acompanhou bem e forçou o passe para trás.", 0.25),
        e("Ele chutou de longe, por cima.", 0), e("Ele achou o espaço, mas a trave salvou.", -0.25), e("Ele achou o espaço e bateu cruzado. Gol deles.", -0.55, { golContra: true })] },
      { id: "falta", rotulo: "Fazer a falta tática", teste: { CALMA: 0.5, POS: 0.5 }, dif: -6, niveis: [
        e("Falta inteligente no meio-campo, sem cartão. Ataque parado.", 0.15), e("Falta e cartão amarelo. Ataque parado.", -0.05, { amarelo: true }),
        e("Falta, amarelo, e a cobrança deu trabalho ao goleiro.", -0.15, { amarelo: true }), e("Chegou atrasado: amarelo e falta perigosa.", -0.3, { amarelo: true }), e("Entrada por trás. Cartão vermelho direto.", -1.2, { vermelho: true, relTecnico: -6, moral: -5 })] },
    ] },
  { id: "bolaAerea", titulo: "Cruzamento na sua área", texto: "O ponta deles cruza alto. O centroavante adversário está colado em você.",
    peso: P({ ZAG: 2.2, VOL: 1, LAT: 0.8 }), opcoes: [
      { id: "subir", rotulo: "Subir com o atacante", teste: { CAB: 0.5, FOR: 0.3, POS: 0.2 }, dif: 6, tracos: { cabeceador: 8 }, niveis: [
        e("Ganhou de cabeça e ainda achou o volante. Lance de xerife.", 0.5, { relTecnico: 1 }), e("Ganhou no alto e afastou.", 0.3),
        e("Os dois subiram juntos e a bola sobrou para fora.", 0), e("Ele ganhou, mas cabeceou por cima.", -0.25), e("Ele subiu mais e cabeceou no canto. Gol deles.", -0.6, { golContra: true })] },
      { id: "cortar", rotulo: "Antecipar e cortar de primeira", teste: { POS: 0.6, VEL: 0.2, CAB: 0.2 }, dif: 9, niveis: [
        e("Antecipou e cortou para longe.", 0.45), e("Cortou para escanteio.", 0.2),
        e("Raspou e a bola passou pela área sem ninguém.", 0), e("Furou o corte, mas o goleiro segurou.", -0.3), e("Furou o corte e a bola sobrou para o atacante. Gol deles.", -0.7, { golContra: true, moral: -3 })] },
      { id: "goleiro", rotulo: "Deixar para o goleiro sair", teste: { COM: 0.5, POS: 0.5 }, dif: 2, niveis: [
        e("Gritou \"deixa!\", protegeu e o goleiro saiu seguro.", 0.25), e("O goleiro saiu bem.", 0.1),
        e("O goleiro socou para longe.", 0), e("O goleiro saiu mal e foi um bate-rebate.", -0.25), e("Desencontro com o goleiro e a bola entrou. Gol deles.", -0.6, { golContra: true, relTecnico: -2 })] },
    ] },
  { id: "saidaPressao", titulo: "Pressão na saída de bola", texto: "Você recebe de costas, perto da sua área, com dois adversários chegando.",
    peso: P({ ZAG: 1.8, VOL: 1.8, LAT: 1.2, MEI: 0.8 }), opcoes: [
      { id: "curto", rotulo: "Girar e tocar curto", teste: { COM: 0.45, PAS: 0.35, DRI: 0.2 }, dif: 8, niveis: [
        e("Girou no espaço de um lençol e saiu jogando. A arquibancada aplaudiu.", 0.5, { relTecnico: 2 }), e("Tocou de primeira e quebrou a pressão.", 0.3),
        e("Tocou para o lado, sem risco.", 0.05), e("O passe saiu curto, mas o volante salvou.", -0.25), e("Perdeu a bola na frente da área. Gol deles.", -0.8, { golContra: true, moral: -4 })] },
      { id: "chutao", rotulo: "Dar um chutão", teste: { FOR: 0.6, CALMA: 0.4 }, dif: -12, niveis: [
        e("Chutão que virou lançamento para o centroavante.", 0.2), e("Afastou o perigo.", 0.05),
        e("Rifou a bola, mas o perigo passou.", -0.05), e("A bola voltou rápido e a pressão continuou.", -0.15), e("Chutou no adversário e a bola voltou para a área.", -0.4)] },
      { id: "driblar", rotulo: "Driblar o primeiro", teste: { DRI: 0.6, COM: 0.4 }, dif: 15, tracos: { ginga: 5, drible_curto: 5 }, niveis: [
        e("Chapéu no atacante dentro da própria área! Ousadia que a torcida adora.", 0.5, { fama: 0.5, seguidores: 0.02 }), e("Passou pelo primeiro e saiu jogando.", 0.25),
        e("Escapou, mas teve que recuar para o goleiro.", -0.05), e("Perdeu a bola, mas o zagueiro cobriu.", -0.35), e("Perdeu a bola tentando o drible. Gol deles e cara feia do técnico.", -1.0, { golContra: true, relTecnico: -4, moral: -4 })] },
    ] },
  { id: "dividida", titulo: "Bola dividida no meio", texto: "Bola quicando entre você e o volante adversário, que vem com tudo.",
    peso: P({ VOL: 2, MEI: 1.2, ZAG: 0.8, LAT: 0.6, ATA: 0.5, PON: 0.4 }), opcoes: [
      { id: "forte", rotulo: "Entrar forte", teste: { FOR: 0.6, MAR: 0.4 }, dif: 4, niveis: [
        e("Ganhou a dividida e o time saiu no contra-ataque.", 0.45, { relTecnico: 1 }), e("Ganhou a bola no corpo.", 0.25),
        e("Os dois caíram e o juiz deu bola ao chão.", 0), e("Chegou atrasado e levou amarelo.", -0.25, { amarelo: true }), e("Choque feio. Você saiu mancando.", -0.4, { lesao: 2, moral: -3 })] },
      { id: "esperar", rotulo: "Esperar e antecipar o passe", teste: { POS: 0.5, VIS: 0.3, VEL: 0.2 }, dif: 6, niveis: [
        e("Leu a jogada e roubou a bola limpa.", 0.4), e("Interceptou o passe seguinte.", 0.2),
        e("Ele ficou com a bola, mas o time recompôs.", -0.05), e("Ele passou e o time teve que recuar.", -0.15), e("Ficou parado e ele achou um passe que terminou em gol deles.", -0.5, { golContra: true })] },
      { id: "tirar", rotulo: "Tirar o pé", teste: { CALMA: 1 }, dif: -10, niveis: [
        e("Tirou o pé e se posicionou bem. O técnico gostou do juízo.", 0.05), e("Recompôs no lugar certo.", 0),
        e("Ele ficou com a bola.", -0.1), e("A torcida vaiou o recuo.", -0.2, { moral: -2 }), e("Ele avançou livre e o time levou um sufoco.", -0.3)] },
    ] },
  { id: "recompor", titulo: "Perderam a bola no ataque", texto: "O time perdeu a bola e o adversário vai puxar o contra-ataque. Você está lá na frente.",
    peso: P({ ATA: 1.2, PON: 1.5, MEI: 1.2, LAT: 0.8 }), opcoes: [
      { id: "voltar", rotulo: "Voltar correndo para marcar", teste: { RES: 0.5, VEL: 0.3, PROF: 0.2 }, dif: 2, niveis: [
        e("Voltou 60 metros e roubou a bola na área. O técnico vibrou no banco.", 0.45, { relTecnico: 3 }), e("Chegou junto e travou o passe.", 0.25, { relTecnico: 2 }),
        e("Ajudou a fechar o espaço.", 0.05, { relTecnico: 1 }), e("Voltou, mas chegou sem fôlego.", -0.1), e("Chegou atrasado e fez pênalti.", -0.6, { golContra: true, amarelo: true })] },
      { id: "esperar", rotulo: "Ficar na frente esperando a sobra", teste: { POS: 0.5, VIS: 0.5 }, dif: 10, niveis: [
        e("O time recuperou e a bola veio para você livre. Saiu na cara e marcou!", 0.6, { golPro: true, meu: "gol" }), e("A bola sobrou e você puxou um contra-ataque perigoso.", 0.15),
        e("O time segurou o ataque deles.", -0.05, { relTecnico: -1 }), e("Eles atacaram com um a mais e chutaram com perigo.", -0.2, { relTecnico: -2 }), e("Eles fizeram o gol com um homem a mais, e o técnico olhou para você.", -0.5, { golContra: true, relTecnico: -4 })] },
    ] },
  { id: "faltaPerigosa", titulo: "Falta na entrada da área", texto: "Falta frontal, a 22 metros. O batedor oficial olha para você.",
    peso: (c) => (c.pos === "ZAG" || c.pos === "LAT" ? 0.2 : c.pos === "VOL" ? 0.4 : 0.7), opcoes: [
      { id: "barreira", rotulo: "Pedir a bola e bater por cima da barreira", teste: { FIN: 0.5, COM: 0.3, PAS: 0.2 }, dif: 22, tracos: { chute_longe: 8, frieza: 4 }, niveis: [
        e("Por cima da barreira, no ângulo. Golaço de falta!", 1.0, { golPro: true, meu: "gol", fama: 1, seguidores: 0.04 }), e("No canto, o goleiro espalmou.", 0.15),
        e("Na barreira.", -0.1), e("Por cima do gol, longe.", -0.3), e("Isolou. O batedor oficial balançou a cabeça.", -0.5, { relTecnico: -2 })] },
      { id: "rasteiro", rotulo: "Bater forte e rasteiro", teste: { FIN: 0.5, FOR: 0.5 }, dif: 20, tracos: { chute_longe: 6 }, niveis: [
        e("Por baixo da barreira que pulou. GOL!", 0.8, { golPro: true, meu: "gol", fama: 0.6 }), e("O goleiro soltou e quase saiu o rebote.", 0.15),
        e("Bateu na barreira.", -0.1), e("Foi fraco, nas mãos do goleiro.", -0.25), e("Acertou a barreira e o contra-ataque quase virou gol.", -0.4)] },
      { id: "deixar", rotulo: "Deixar para o batedor oficial", teste: { PROF: 1 }, dif: 0, niveis: [
        e("O batedor oficial colocou no ângulo. Você abraçou primeiro.", 0.05, { golPro: true, relTecnico: 1 }), e("Ele bateu bem, o goleiro defendeu.", 0, { relTecnico: 1 }),
        e("Na barreira.", 0), e("Por cima.", 0), e("Ele isolou. Alguém na torcida gritou seu nome.", 0)] },
    ] },
  { id: "penalti", titulo: "Pênalti!", texto: "Derrubaram você na área. O capitão te entrega a bola.",
    peso: (c) => (c.pos === "ZAG" || c.pos === "VOL" ? 0.08 : 0.25), opcoes: [
      { id: "canto", rotulo: "Bater no canto", teste: { FIN: 0.5, COM: 0.5 }, dif: -2, tracos: { frieza: 8 }, niveis: [
        e("Bola de um lado, goleiro do outro. GOL!", 0.6, { golPro: true, meu: "gol" }), e("O goleiro tocou, mas entrou. GOL!", 0.5, { golPro: true, meu: "gol" }),
        e("O goleiro foi no canto certo e defendeu.", -0.4), e("Na trave!", -0.5, { moral: -3 }), e("Para fora. O estádio inteiro botou a mão na cabeça.", -0.8, { moral: -6 })] },
      { id: "cavadinha", rotulo: "Cavadinha", teste: { COM: 0.8, FIN: 0.2 }, dif: 10, tracos: { frieza: 10 }, niveis: [
        e("Cavadinha com o goleiro já no chão. Ousadia que vai rodar o país!", 1.0, { golPro: true, meu: "gol", fama: 1.5, seguidores: 0.08 }), e("Cavadinha, devagar, e entrou. GOL!", 0.6, { golPro: true, meu: "gol", fama: 0.5 }),
        e("O goleiro ficou parado e segurou. Vai ter meme.", -0.7, { moral: -5, seguidores: 0.01 }), e("Saiu fraca e o goleiro pegou fácil. O técnico ficou furioso.", -0.9, { relTecnico: -5, moral: -5 }), e("Por cima do travessão. Você virou piada no programa de domingo.", -1.1, { relTecnico: -6, moral: -7, noticia: "A cavadinha que deu errado virou meme." })] },
      { id: "devolver", rotulo: "Devolver para o capitão", teste: { PROF: 1 }, dif: 0, niveis: [
        e("O capitão bateu e fez. Ele agradeceu a humildade.", 0.05, { golPro: true, relTecnico: 1 }), e("O capitão converteu.", 0, { golPro: true }),
        e("O capitão converteu.", 0, { golPro: true }), e("O capitão perdeu. Ninguém te culpa.", 0), e("O capitão perdeu, e a torcida queria você na bola.", -0.1)] },
    ] },
  { id: "provocacao", titulo: "Provocação", texto: "O zagueiro deles pisa no seu pé quando o juiz não está olhando e diz alguma coisa no seu ouvido.",
    peso: () => 0.6, opcoes: [
      { id: "ignorar", rotulo: "Ignorar e jogar", teste: { CALMA: 0.7, COM: 0.3 }, dif: 0, niveis: [
        e("Você sorriu e no lance seguinte deu um drible nele. Ele saiu de cabeça quente.", 0.35), e("Seguiu o jogo, concentrado.", 0.15),
        e("Ficou incomodado por uns minutos.", -0.05), e("Perdeu a concentração e errou dois passes seguidos.", -0.25), e("Ficou remoendo e sumiu do jogo.", -0.4)] },
      { id: "revidar", rotulo: "Revidar", teste: { CALMA: 1 }, dif: 12, niveis: [
        e("Um empurrão de leve. O juiz deu amarelo para os dois.", -0.1, { amarelo: true }), e("Bate-boca e amarelo para você.", -0.2, { amarelo: true }),
        e("Empurrão no peito: amarelo e confusão.", -0.3, { amarelo: true }), e("Confusão generalizada. Amarelo e o técnico te chamou na beira do campo.", -0.4, { amarelo: true, relTecnico: -3 }), e("Cotovelada. Cartão vermelho direto.", -1.5, { vermelho: true, relTecnico: -8, moral: -6, noticia: "Expulso por revidar uma provocação." })] },
      { id: "cavar", rotulo: "Provocar de volta e cavar o cartão dele", teste: { COM: 0.4, DRI: 0.3, CARISMA: 0.3 }, dif: 14, niveis: [
        e("Ele caiu na sua e levou o segundo amarelo. Expulso! Seu time joga com um a mais.", 0.45, { fama: 0.5 }), e("Ele fez falta em você e levou amarelo.", 0.25),
        e("O juiz não caiu em nada.", -0.05), e("O juiz percebeu a malandragem e advertiu você.", -0.15), e("O juiz deu amarelo para você por simulação.", -0.3, { amarelo: true })] },
    ] },
  { id: "juiz", titulo: "O juiz errou", texto: "Você foi puxado dentro da área e o juiz mandou seguir.",
    peso: P({ ATA: 0.8, PON: 0.8, MEI: 0.5, VOL: 0.3, ZAG: 0.2, LAT: 0.3 }), opcoes: [
      { id: "seguir", rotulo: "Levantar e seguir no lance", teste: { CALMA: 0.6, PROF: 0.4 }, dif: -4, niveis: [
        e("Levantou rápido e ainda recuperou a bola. O técnico aplaudiu.", 0.25, { relTecnico: 2 }), e("Seguiu o jogo.", 0.05, { relTecnico: 1 }),
        e("Seguiu o jogo, resmungando.", 0), e("Ficou reclamando com os companheiros.", -0.1), e("Perdeu a cabeça por uns minutos.", -0.2)] },
      { id: "reclamar", rotulo: "Reclamar com o juiz", teste: { CALMA: 0.6, CARISMA: 0.4 }, dif: 8, niveis: [
        e("Reclamou com educação e o juiz chamou o VAR. Pênalti marcado e convertido!", 0.35, { golPro: true }), e("O juiz ouviu e prometeu ficar de olho.", 0.05),
        e("O juiz mandou você se afastar.", -0.05), e("Reclamou demais e levou amarelo.", -0.25, { amarelo: true }), e("Foi para cima do juiz. Vermelho direto.", -1.5, { vermelho: true, relTecnico: -8, moral: -6, noticia: "Expulso por reclamação." })] },
    ] },
  { id: "segurar", titulo: "Fim de jogo, vencendo", texto: "Minutos finais, seu time está na frente. A bola vem para você perto da bandeirinha.",
    peso: (c) => (c.min >= 78 && c.saldo > 0 ? 3 : 0), opcoes: [
      { id: "canto", rotulo: "Segurar a bola no canto", teste: { FOR: 0.5, DRI: 0.3, COM: 0.2 }, dif: 4, niveis: [
        e("Prendeu a bola no canto por um minuto inteiro e cavou um escanteio. Experiente.", 0.4, { relTecnico: 2 }), e("Segurou bem e ganhou tempo.", 0.2, { relTecnico: 1 }),
        e("Perdeu, mas gastou tempo.", 0), e("Perdeu rápido e eles foram para cima.", -0.2), e("Perdeu, eles atacaram e empataram no fim.", -0.6, { golContra: true, moral: -4 })] },
      { id: "matar", rotulo: "Buscar o gol para matar o jogo", teste: { FIN: 0.4, DRI: 0.3, VEL: 0.3 }, dif: 12, niveis: [
        e("Saiu na cara e fechou o placar. GOL!", 0.6, { golPro: true, meu: "gol" }), e("Chutou com perigo e o goleiro mandou para escanteio.", 0.15),
        e("O chute saiu fraco.", -0.05), e("Perdeu a bola tentando.", -0.2, { relTecnico: -1 }), e("Perdeu a bola e o contra-ataque deles empatou.", -0.7, { golContra: true, relTecnico: -3 })] },
      { id: "cair", rotulo: "Cair no chão e gastar o tempo", teste: { CALMA: 0.5, COM: 0.5 }, dif: 6, niveis: [
        e("Ficou no chão o suficiente para o relógio andar. Malandragem.", 0.05), e("Gastou um minuto.", 0),
        e("A torcida adversária vaiou, mas o tempo passou.", -0.05, { fama: 0.2 }), e("O juiz deu amarelo por cera.", -0.15, { amarelo: true }), e("Amarelo por cera e virou assunto no pós-jogo.", -0.3, { amarelo: true, noticia: "A cera no fim do jogo virou assunto." })] },
    ] },
  { id: "ultimoAtaque", titulo: "Último ataque", texto: "Acréscimos. Seu time precisa de um gol e a bola chega até você.",
    peso: (c) => (c.min >= 84 && c.saldo <= 0 ? 3 : 0), opcoes: [
      { id: "chutar", rotulo: "Chutar de onde estiver", teste: { FIN: 0.7, FOR: 0.3 }, dif: 18, tracos: { chute_longe: 8 }, niveis: [
        e("No último lance, um chute que entrou no ângulo! GOL!", 1.0, { golPro: true, meu: "gol", fama: 1.5, moral: 6 }), e("O goleiro espalmou no susto.", 0.1),
        e("Foi por cima.", -0.05), e("Foi longe.", -0.15), e("Pegou mal. Fim de jogo.", -0.3)] },
      { id: "area", rotulo: "Levantar na área", teste: { CRU: 0.6, VIS: 0.4 }, dif: 10, niveis: [
        e("Na cabeça do zagueiro que subiu: GOL no último minuto! Assistência sua!", 0.8, { golPro: true, meu: "assist", moral: 5 }), e("A bola passou por todo mundo, quase.", 0.1),
        e("A zaga afastou.", 0), e("O goleiro saiu e ficou com ela.", -0.1), e("O cruzamento saiu pela linha de fundo. Fim.", -0.2)] },
      { id: "jogada", rotulo: "Tentar a jogada individual", teste: { DRI: 0.6, VEL: 0.2, COM: 0.2 }, dif: 15, tracos: { ginga: 6 }, niveis: [
        e("Passou por dois e sofreu pênalti. Convertido no último minuto!", 0.7, { golPro: true, moral: 5 }), e("Passou por um e chutou cruzado, rente à trave.", 0.15),
        e("Foi travado.", -0.05), e("Perdeu a bola.", -0.15), e("Perdeu a bola e eles ainda fizeram mais um.", -0.4, { golContra: true })] },
    ] },
  { id: "escanteioAtaque", titulo: "Escanteio a favor", texto: "O camisa 10 vai bater. Você está na área.",
    peso: P({ ZAG: 1.6, ATA: 1.2, VOL: 0.8, MEI: 0.3 }), opcoes: [
      { id: "subir", rotulo: "Atacar a primeira trave", teste: { CAB: 0.7, FOR: 0.3 }, dif: 14, tracos: { cabeceador: 12, bicicleta: 4 }, niveis: [
        e("Subiu mais que todo mundo. Cabeçada no canto, GOL!", 0.7, { golPro: true, meu: "gol" }), e("Cabeçada firme, o goleiro fez milagre.", 0.15),
        e("Os zagueiros te seguraram.", 0), e("Cabeceou por cima.", -0.1), e("Errou o tempo da bola e ela passou sem ninguém.", -0.15)] },
      { id: "sobra", rotulo: "Ficar na sobra", teste: { POS: 0.5, FIN: 0.5 }, dif: 12, niveis: [
        e("A bola sobrou e você bateu de primeira. GOL!", 0.6, { golPro: true, meu: "gol" }), e("Pegou a sobra e chutou para defesa do goleiro.", 0.1),
        e("A defesa afastou.", 0), e("A sobra foi do adversário.", -0.05), e("A sobra foi deles e o contra-ataque pegou o time desarrumado.", -0.35)] },
      { id: "bicicleta", rotulo: "Tentar a bicicleta", teste: { DRI: 0.3, FIN: 0.4, FOR: 0.3 }, dif: 28, tracos: { bicicleta: 18 }, niveis: [
        e("BICICLETA! Gol de placa, desses que entram para a história do clube!", 1.3, { golPro: true, meu: "gol", fama: 3, seguidores: 0.15, noticia: "Gol de bicicleta: o lance mais visto da rodada." }), e("Pegou bonito, a bola raspou o travessão.", 0.25, { seguidores: 0.01 }),
        e("Pegou mal, mas a ideia foi bonita.", -0.05), e("Furou e caiu de costas.", -0.25), e("Acertou o rosto do zagueiro. Amarelo.", -0.4, { amarelo: true })] },
    ] },
];

export const COMEMORACAO: Situacao = {
  id: "comemoracao", titulo: "GOL! Como você comemora?", texto: "O estádio está gritando seu nome.", peso: () => 0, opcoes: [
    { id: "torcida", rotulo: "Correr para a torcida", teste: { CARISMA: 1 }, dif: -20, niveis: [
      e("Você se jogou no alambrado e a torcida te abraçou.", 0, { moral: 4, fama: 0.4 }), e("Comemorou com a torcida.", 0, { moral: 3, fama: 0.2 }), e("Comemorou com a torcida.", 0, { moral: 3 }), e("Comemorou com a torcida.", 0, { moral: 2 }), e("Comemorou com a torcida.", 0, { moral: 2 })] },
    { id: "familia", rotulo: "Homenagem à família", teste: { CARISMA: 1 }, dif: -20, niveis: [
      e("Apontou para o céu e mostrou a camiseta com a foto da família. A foto rodou o país.", 0, { moral: 5, fama: 0.6, seguidores: 0.03 }), e("Homenagem à família. Sua mãe chorou na arquibancada.", 0, { moral: 5, fama: 0.3 }),
      e("Homenagem à família.", 0, { moral: 4 }), e("Homenagem à família.", 0, { moral: 4 }), e("Homenagem à família.", 0, { moral: 4 })] },
    { id: "danca", rotulo: "Dancinha ensaiada", teste: { CARISMA: 0.7, COM: 0.3 }, dif: 0, niveis: [
      e("A dancinha viralizou. Milhares de vídeos imitando você.", 0, { fama: 1.2, seguidores: 0.12, moral: 3 }), e("A dancinha pegou bem nas redes.", 0, { fama: 0.6, seguidores: 0.05, moral: 2 }),
      e("Dancinha simpática.", 0, { seguidores: 0.02, moral: 1 }), e("A dancinha saiu meio sem graça.", 0, { seguidores: 0.005 }), e("A dancinha virou meme, e não do jeito que você queria.", 0, { moral: -2, seguidores: 0.02 })] },
    { id: "provocar", rotulo: "Mandar a torcida rival calar a boca", teste: { CALMA: 1 }, dif: 10, niveis: [
      e("Gesto de silêncio para a torcida rival. Virou capa de jornal.", 0, { fama: 1.5, seguidores: 0.05, relTecnico: -1 }), e("Provocou a torcida rival. Polêmica nas redes.", 0, { fama: 1, relTecnico: -2, noticia: "A comemoração provocando a torcida rival dividiu opiniões." }),
      e("Provocou e levou amarelo.", -0.1, { amarelo: true, fama: 0.6, relTecnico: -2 }), e("Amarelo e confusão com os jogadores rivais.", -0.2, { amarelo: true, relTecnico: -3, noticia: "A provocação depois do gol terminou em confusão." }), e("Confusão generalizada e cartão vermelho.", -1.2, { vermelho: true, relTecnico: -6, noticia: "Expulso por provocar a torcida depois do gol." })] },
  ],
};
export const SITUACAO: Record<string, Situacao> = Object.fromEntries([...SITUACOES, COMEMORACAO].map((s) => [s.id, s]));

/** Habilidade numa opção: média ponderada de atributos e da personalidade (em escala de atributo). */
export function habilidade(at: Atributos, pers: PersonalidadeDNA, tracos: TracoId[], op: OpcaoLance): number {
  const valor = (k: string) => k === "CALMA" ? 95 - 4 * pers.temperamento : k === "CARISMA" ? 15 + 4 * pers.carisma : k === "PROF" ? 15 + 4 * pers.profissionalismo : at[k as Atributo];
  const peso = Object.values(op.teste).reduce((a, b) => a + (b ?? 0), 0) || 1;
  const base = Object.entries(op.teste).reduce((s, [k, w]) => s + valor(k) * (w ?? 0), 0) / peso;
  return base + Object.entries(op.tracos ?? {}).reduce((s, [t, v]) => s + (tracos.includes(t as TracoId) ? (v ?? 0) : 0), 0);
}

/** Margem = habilidade − (nível do adversário + dificuldade) + sorte. Quanto maior, melhor o nível do resultado. */
/** Testes de personalidade (calma, carisma, profissionalismo) não dependem do adversário: a referência é 50. */
function referencia(adversario: number, op: OpcaoLance): number {
  const tot = Object.values(op.teste).reduce((a, b) => a + (b ?? 0), 0) || 1;
  const pers = Object.entries(op.teste).filter(([k]) => k === "CALMA" || k === "CARISMA" || k === "PROF").reduce((a, [, w]) => a + (w ?? 0), 0) / tot;
  return adversario * (1 - pers) + 50 * pers;
}
export function sortearNivel(rng: RNG, hab: number, adversario: number, op: OpcaoLance): Nivel {
  const margem = hab - (referencia(adversario, op) + op.dif) + rng.normal(0, 10);
  return margem >= 12 ? 0 : margem >= 3 ? 1 : margem >= -7 ? 2 : margem >= -16 ? 3 : 4;
}
/** Valor esperado da nota para uma opção (usado só pela política automática). */
export function notaEsperada(hab: number, adversario: number, op: OpcaoLance): number {
  const pts = [-30, -20, -10, 0, 10, 20, 30];
  return pts.reduce((s, z) => {
    const m = hab - (referencia(adversario, op) + op.dif) + z;
    const n = m >= 12 ? 0 : m >= 3 ? 1 : m >= -7 ? 2 : m >= -16 ? 3 : 4;
    const ef = op.niveis[n];
    return s + ef.nota + (ef.golPro ? 0.5 : 0) - (ef.golContra ? 0.7 : 0) - (ef.vermelho ? 2 : 0);
  }, 0) / pts.length;
}

/** Escolhe a situação do lance pelo contexto (posição, minuto e placar). */
export function escolherSituacao(rng: RNG, c: Contexto, usadas: string[]): Situacao {
  const lista = SITUACOES.filter((s) => !usadas.includes(s.id)).map((s) => ({ s, p: s.peso(c) * (s.id === "penalti" && usadas.includes("penalti") ? 0 : 1) })).filter((x) => x.p > 0);
  const total = lista.reduce((a, x) => a + x.p, 0);
  let r = rng.next() * total;
  for (const x of lista) { r -= x.p; if (r <= 0) return x.s; }
  return lista[0]?.s ?? SITUACOES[0];
}
export const nivelClamp = (n: number): Nivel => clamp(Math.round(n), 0, 4) as Nivel;
