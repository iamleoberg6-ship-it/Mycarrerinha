// Narração da partida: quem é quem em campo (nomes do elenco), como saiu cada gol e os lances
// de ambiente entre as decisões. Só texto: não muda placar nem nota.
import type { RNG } from "./rng.js";
import type { Clube, JogadorNPC } from "./liga.js";
import type { Posicao } from "./atributos.js";
import { preencher } from "./lances/base.js";
import { vidaDe } from "./vida-npc.js";
import type { Ligacao } from "./relacoes-npc.js";

/** Jeitos de cada jogador do elenco, pelo nome curto (o que a narração usa). */
export type Tracos = Map<string, string[]>;
export function tracosDoElenco(elenco: { nome: string; idade: number }[]): Tracos {
  const m: Tracos = new Map();
  for (const j of elenco) m.set(nomeCurto(j.nome), vidaDe(j.nome, j.idade).jeito);
  return m;
}

type Elenco = Record<Posicao | "GOL", string[]>;

const SUFIXOS = new Set(["Júnior", "Junior", "Jr.", "Filho", "Neto", "Sobrinho", "Segundo"]);
/** Nome de narração: o último nome, ou os dois últimos quando termina em Júnior/Filho/Neto. */
const PARTICULAS = new Set(["de", "van", "von", "da", "do", "dos", "das", "di", "del", "der"]);
export const nomeCurto = (n: string) => {
  const p = n.trim().split(/\s+/);
  if (p.length > 1 && SUFIXOS.has(p[p.length - 1])) return p.slice(-2).join(" ");
  if (p.length > 2 && PARTICULAS.has(p[p.length - 2])) return p.slice(-2).join(" ");
  return p[p.length - 1];
};

/** Elenco por posição, do melhor para o pior. Na base, só os mais novos (quando há gente suficiente). */
export function elencoDe(clube: Clube, base: boolean): Elenco {
  const todos = clube.elenco;
  const novos = todos.filter((j) => j.idade <= 21);
  const lista = base && novos.length >= 11 ? novos : todos;
  const el: Elenco = { GOL: [], ZAG: [], LAT: [], VOL: [], MEI: [], PON: [], ATA: [] };
  const porPos = (l: JogadorNPC[]) => { const r: Partial<Elenco> = {}; for (const j of [...l].sort((a, b) => b.ovr - a.ovr)) (r[j.posicao as keyof Elenco] ??= []).push(nomeCurto(j.nome)); return r; };
  const daLista = porPos(lista), deTodos = porPos(todos);
  // posição sem ninguém entre os novos: usa o elenco inteiro; sem ninguém no elenco: um nome de camisa
  for (const k of Object.keys(el) as (keyof Elenco)[]) el[k] = daLista[k]?.length ? daLista[k]! : deTodos[k]?.length ? deTodos[k]! : [`Camisa ${({ GOL: 1, ZAG: 4, LAT: 2, VOL: 5, MEI: 10, PON: 7, ATA: 9 } as Record<string, number>)[k]}`];
  return el;
}

/** Os nomes que os textos usam ({gol}, {comp}...). Varia um pouco de jogo para jogo, como uma escalação. */
export function nomesDaPartida(rng: RNG, meu: Elenco, adv: Elenco, x: { nome: string; meu: string; adv: string; estadio: string; posJogador: Posicao; /** craques de quem você já tem a camisa: o {craque} sai dos outros */ jaTenho?: Set<string>; /** jeitos do elenco (quem lidera, quem tem pavio, quem gosta de aparecer) */ tracos?: Tracos }): Record<string, string> {
  const umDos = (l: string[], n = 2) => l[Math.floor(rng.next() * Math.min(n, l.length))];
  const meusAta = x.posJogador === "ATA" ? meu.ATA.slice(0, 3) : meu.ATA;
  const advLinha = [...adv.ATA, ...adv.MEI, ...adv.PON].slice(0, 5);
  // o craque da troca de camisa é alguém de quem você ainda não tem a camisa (senão sobra a mesma cara de sempre)
  const livres = [...adv.ATA, ...adv.MEI, ...adv.PON, ...adv.VOL, ...adv.ZAG, ...adv.LAT].filter((n) => !x.jaTenho?.has(n));
  const craqueLivre = livres.slice(0, 5).length ? livres.slice(0, 5) : advLinha;
  // personalidade: o líder assume a braçadeira com mais frequência, quem tem pavio toma cartão, quem gosta de aparecer comemora
  const tem = (n: string, t: string) => (x.tracos?.get(n) ?? []).some((j) => j.startsWith(t));
  const achar = (l: string[], t: string) => l.find((n) => tem(n, t));
  const lider = achar([...meu.ZAG, ...meu.VOL, ...meu.MEI].slice(0, 8), "Líder");
  const pavio = achar([...meu.ZAG, ...meu.VOL, ...meu.MEI, ...meu.ATA, ...meu.PON, ...adv.ZAG, ...adv.VOL, ...adv.MEI, ...adv.ATA, ...adv.PON].slice(0, 40), "Pavio curto");
  const brinca = achar([...meu.ATA, ...meu.PON, ...meu.MEI].slice(0, 10), "Brincalhão") ?? achar([...meu.ATA, ...meu.PON, ...meu.MEI].slice(0, 10), "Gosta de aparecer");
  const capitaoBase = [...meu.ZAG.slice(0, 1), ...meu.VOL.slice(0, 1), ...meu.MEI.slice(0, 1)][Math.floor(rng.next() * 3)] ?? meu.ZAG[0];
  return {
    nome: x.nome, meu: x.meu, adv: x.adv, estadio: x.estadio, pavio: pavio ?? "", brinca: brinca ?? "",
    gol: adv.GOL[0], zag: umDos(adv.ZAG), lat: umDos(adv.LAT), vol: umDos(adv.VOL), ata: adv.ATA[0], craque: umDos(craqueLivre, 2),
    comp: umDos(meusAta), meia: umDos(meu.MEI), ponta: umDos(meu.PON), capitao: lider && rng.chance(0.7) ? lider : capitaoBase,
    goleiro: meu.GOL[0], zagMeu: umDos(meu.ZAG), batedor: meu.MEI[0],
  };
}

const sorteia = (rng: RNG, pesos: [Posicao, number][], el: Elenco) => {
  const tot = pesos.reduce((a, [, p]) => a + p, 0); let r = rng.next() * tot;
  for (const [pos, p] of pesos) { r -= p; if (r <= 0) return umDe(rng, el[pos], 3); }
  return el.ATA[0];
};
const umDe = (rng: RNG, l: string[], n: number) => l[Math.floor(rng.next() * Math.min(n, l.length))];
const ARTILHEIROS: [Posicao, number][] = [["ATA", 5], ["PON", 2.5], ["MEI", 2], ["VOL", 0.6], ["ZAG", 0.7], ["LAT", 0.4]];

const GOL_MEU = [
  "{nome} recebe de {meia} e bate cruzado.", "{nome} sobe mais que o {zag} e cabeceia no canto.", "{nome} aproveita o rebote do {gol}.",
  "{nome} arranca e finaliza na saída do {gol}.", "Chute de fora da área de {nome}, sem chance para o {gol}.", "{nome} completa o cruzamento do {ponta}.",
  "{nome} cobra o pênalti com categoria.", "{nome} tabela com o {comp} e toca por cima do {gol}.", "{nome} rouba a bola do {vol} e bate de primeira.",
  "Falta cobrada por {nome} no canto do {gol}.", "{nome} dribla o {zag} e bate no ângulo.", "{nome} empurra para a rede depois de bate-rebate na área.",
  "{nome} tira o zagueiro do lance com um toque de letra e marca.", "{nome} pega a sobra fora da área e manda no ângulo.", "{nome} domina no peito, gira e chuta sem deixar o {gol} reagir.",
  "{nome} recebe de costas, gira e bate rasteiro.",
  "{nome} aproveita o erro do {zag} na saída de bola.",
  "Bola viva na área, {nome} chega primeiro e empurra para o fundo.",
  "{nome} recebe o passe em profundidade e vence o {gol} no um contra um.",
  "{nome} sai da marcação do {vol} e finaliza de primeira, no ângulo.",
  "Cobrança de falta curta: {nome} acerta o ângulo de fora da área.",
  "{nome} emenda de primeira um cruzamento rasteiro do {lat}.",
  "Contra-ataque puxado por {nome}, que mata o goleiro na saída.",
  "{nome} domina em velocidade e chuta de fora, sem chance para o {gol}.",
  "{nome} recebe nas costas do {zag} e encobre o {gol}.",
  "Escanteio curto, {nome} aparece livre e bate de canhota.",
  "{nome} aparece de trás na área e completa o passe do {meia}.",
  "{nome} tira o {zag} do lance com um toque de letra e marca.",
  "{nome} pega a sobra fora da área e manda no ângulo.",
  "{nome} domina no peito, gira e chuta sem deixar o {gol} reagir.",
];
const GOL_ASSIST = [
  "{nome} cruza na medida e {X} cabeceia para o gol.", "{nome} enfia para {X}, que toca na saída do {gol}.", "Escanteio de {nome} e cabeçada de {X}.",
  "{nome} vai à linha de fundo e rola para {X} bater de primeira.", "{nome} dá um passe de calcanhar e {X} chuta no canto.", "Lançamento de {nome} e {X} mata no peito e marca.",
  "{nome} vê {X} livre na área e inventa um passe por baixo da perna.", "Uma tabela rápida entre {nome} e {X} e a bola morre no fundo da rede.",
  "{nome} cruza rasteiro e {X} só empurra.",
  "Triangulação entre {nome}, {meia} e {X}, que finaliza sem chance.",
  "{nome} lança por cima da defesa e {X} chega sozinho.",
  "{nome} faz o passe de lado e {X} bate sem deixar a bola cair.",
  "{nome} vira o jogo para o outro lado e {X} marca na pequena área.",
  "Toque curto de {nome} e {X} emenda de primeira.",
  "{nome} acha {X} entre dois zagueiros, e o gol sai.",
  "{nome} serve {X} no contra-ataque e a bola entra no canto.",
  "{nome} cobra escanteio na cabeça de {X}, que desvia para o gol.",
  "Passe de letra de {nome} e {X} bate cruzado.",
  "{nome} arrasta a marcação pela ponta e devolve para {X} na área.",
  "Chutaço de {X} depois de um passe rasteiro de {nome}, no ângulo.",
];
const GOL_TIME = [
  "{X} de cabeça, depois de escanteio.", "{X} bate de fora da área.", "{X} completa o cruzamento de {Y}.", "Pênalti convertido por {X}.",
  "{X} aproveita falha do {zag}.", "Contra-ataque rápido e {X} finaliza.", "{X} faz de cabeça no segundo pau.", "Gol contra do {zag}, tentando cortar o cruzamento.",
  "{X} dribla o goleiro e toca para o gol vazio.", "Cobrança de falta de {X} no ângulo.", "{X} chuta, a bola desvia no {zag} e entra.",
  "{X} recebe nas costas do {zag} e encobre o goleiro.", "Pressão no meio, a bola sobra para {X} e ele não perdoa.",
  "{X} aparece na segunda trave e marca de cabeça.",
  "{X} recebe de {Y} e chuta no canto, sem chance.",
  "Toque de {Y} para {X}, que bate de primeira.",
  "{X} domina na entrada da área e dispara no ângulo.",
  "{X} cobra o lateral rápido, a defesa dorme e ele marca.",
  "{X} força a falta e bate com precisão.",
  "Chute cruzado de {X}, a bola bate na trave e entra.",
  "{X} faz o gol depois de uma tabela com {Y}.",
  "{X} cabeceia no travessão e a bola cai nos pés dele para o gol.",
  "{X} arranca pela esquerda e tira do {gol}.",
  "Bola alçada na área, {X} sobe mais alto que todo mundo.",
  "Gol de {X}, numa bola que sobrou depois de uma falha do {zag}.",
  "{X} recebe nas costas do {zag}, vira e chuta forte.",
  "Pressão no meio, a bola sobra para {X} e ele não perdoa.",
];
const GOL_ADV = [
  "{X} de cabeça, depois de escanteio.", "{X} bate de fora da área e o {goleiro} não alcança.", "{X} completa o cruzamento.", "Pênalti convertido por {X}.",
  "{X} aproveita falha do {zagMeu}.", "Contra-ataque rápido e {X} finaliza.", "O {goleiro} solta e {X} empurra para a rede.", "Gol contra do {zagMeu}, tentando cortar.",
  "{X} passa pelo {zagMeu} e bate cruzado.", "Falta de {X} no canto do {goleiro}.",
  "{X} sobe sozinho na segunda trave e cabeceia firme.", "Erro de passe do {zagMeu} e {X} entra na área sem marcação.",
  "{X} recebe livre na área e tira o {goleiro} no canto.",
  "{X} aparece nas costas da zaga e marca.",
  "Cruzamento preciso e {X} empurra de cabeça.",
  "{X} aproveita a bobeira do {zagMeu} e entra sozinho.",
  "{X} chuta da entrada da área e o {goleiro} não vê a bola.",
  "Passe em profundidade e {X} chega antes do {goleiro}.",
  "{X} faz o gol de cabeça no segundo pau.",
  "Falta batida por {X} no ângulo, sem chance.",
  "{X} dribla o {zagMeu} e chuta rasteiro.",
  "Rebote no meio da área e {X} marca.",
  "{X} recebe de costas, gira e bate forte.",
  "Vacilo do {goleiro} e {X} aproveita.",
  "{X} sobe sozinho na segunda trave e cabeceia firme.",
  "Erro de passe do {zagMeu} e {X} entra na área sem marcação.",
];

/** Escolhe um modelo de frase, deixando de fora os usados em jogos recentes quando há alternativa. */
const escolherModelo = (rng: RNG, lista: string[], recentes?: Recentes) => rng.pick(variarPor(lista, (t) => t, recentes));

/** Texto de cada gol do placar: quem fez e como (e o modelo usado, para variar nos próximos jogos). */
export function narrarGol(rng: RNG, meuTime: boolean, meu: "gol" | "assist" | undefined, nomes: Record<string, string>, elMeu: Elenco, elAdv: Elenco, recentes?: Recentes): { texto: string; modelo: string } {
  // quem falha muda de gol para gol
  const zag = umDe(rng, [...elAdv.ZAG.slice(0, 3), ...elAdv.LAT.slice(0, 2)], 5), zagMeu = umDe(rng, [...elMeu.ZAG.slice(0, 3), ...elMeu.LAT.slice(0, 2)], 5);
  if (meuTime) {
    const X = sorteia(rng, ARTILHEIROS, elMeu), Y = umDe(rng, [...elMeu.PON, ...elMeu.LAT], 4);
    const lista = meu === "gol" ? GOL_MEU : meu === "assist" ? GOL_ASSIST : GOL_TIME;
    const modelo = escolherModelo(rng, lista, recentes);
    let texto = preencher(modelo, { ...nomes, zag, X, Y });
    if (meu === "gol" && nomes.brinca && rng.chance(0.4)) texto += " " + preencher("{brinca} corre até a torcida e comemora com todo mundo.", nomes);
    return { texto, modelo };
  }
  const modelo = escolherModelo(rng, GOL_ADV, recentes);
  return { texto: preencher(modelo, { ...nomes, zagMeu, X: sorteia(rng, ARTILHEIROS, elAdv) }), modelo };
}

export interface LinhaNarracao { min: number; texto: string; /** o modelo de frase usado (para não repetir nos próximos jogos) */ modelo?: string; cls?: "meu" | "contra" | "aviso"; /** lance do próprio jogador (some se ele sair de campo antes) */ jogador?: boolean }
interface Modelo { t: string; cls?: LinhaNarracao["cls"]; peso?: number; quando?: (c: CtxNarracao) => boolean }
export interface CtxNarracao { mandante: boolean; classico: boolean; chuva: boolean; base: boolean; pos: Posicao; nota: number; entrada: number; saida: number; /** como foi a última partida, para a torcida lembrar */ eco?: { resultado: "vitoria" | "derrota" | "empate"; nota: number } }

const AMBIENTE: Modelo[] = [
  { t: "{comp} chuta e o {gol} defende firme." }, { t: "Bola na trave! O {comp} quase marca para o {meu}.", cls: "meu" }, { t: "{meia} arrisca de longe, por cima do gol." },
  { t: "{ponta} cruza e ninguém completa." }, { t: "Grande defesa do {gol} em chute de {m1}." }, { t: "{m1} cabeceia e a bola passa raspando a trave." },
  { t: "{ata} cabeceia por cima.", cls: "contra" }, { t: "Grande defesa do {goleiro}!", cls: "meu" }, { t: "{craque} acerta a trave do {meu}!", cls: "contra" },
  { t: "{a1} chuta cruzado e a bola sai pela linha de fundo." }, { t: "{craque} tenta de longe. Fácil para o {goleiro}." }, { t: "{zagMeu} salva em cima da linha!", cls: "meu" },
  { t: "Amarelo para {vol} por falta dura." }, { t: "Amarelo para {m1}, que chegou atrasado." }, { t: "Amarelo para {a1} por reclamação." },
  { t: "O VAR checa um possível pênalti para o {meu}. Lance normal, segue o jogo.", cls: "aviso" }, { t: "O VAR revisa um impedimento. Tudo certo, segue.", cls: "aviso" },
  { t: "Gol anulado do {adv}! O {a1} estava impedido.", cls: "meu", peso: 0.4 }, { t: "O juiz marca impedimento do {comp}. Lance apertado." },
  { t: "{a1} sente a coxa e recebe atendimento." }, { t: "{m1} leva uma pancada e o jogo fica parado." }, { t: "Substituição no {adv}: sai {a1}, entra {a2}." },
  { t: "O técnico do {adv} reclama muito com o quarto árbitro." }, { t: "O {meu} troca passes e a torcida grita \"olé\".", quando: (c) => c.mandante, peso: 0.6 },
  { t: "A torcida do {meu} canta sem parar.", quando: (c) => c.mandante }, { t: "Mosaico bonito na arquibancada do {estadio}.", quando: (c) => c.mandante && !c.base, peso: 0.4 },
  { t: "A torcida do {adv} pressiona a cada lance.", quando: (c) => !c.mandante }, { t: "Vaias para o {meu} na saída de bola.", quando: (c) => !c.mandante, peso: 0.6 },
  { t: "A chuva aperta. A bola começa a parar no gramado.", quando: (c) => c.chuva, peso: 2 }, { t: "Raio no horizonte. O juiz olha para o céu.", quando: (c) => c.chuva, peso: 0.6 },
  { t: "Parada técnica para hidratação. Calor forte.", quando: (c) => !c.chuva, peso: 0.4 },
  { t: "Clima quente: empurra-empurra entre {vol} e {meia}.", quando: (c) => c.classico, peso: 2 }, { t: "Rojões na torcida do {adv}. O jogo fica parado.", quando: (c) => c.classico, peso: 0.8 },
  { t: "Poucos torcedores nas arquibancadas do jogo da base.", quando: (c) => c.base, peso: 0.6 }, { t: "Olheiros na tribuna anotam alguma coisa.", quando: (c) => c.base, peso: 0.6 },
  // raros
  { t: "Um cachorro invade o campo e o jogo para por dois minutos. A torcida aplaude quando ele sai.", peso: 0.05 },
  { t: "O juiz sente a panturrilha e é substituído pelo quarto árbitro.", peso: 0.05 }, { t: "Uma segunda bola entra no campo e o lance é parado.", peso: 0.08 },
  { t: "Um balão de festa cai na área e o {goleiro} tira com a mão. Risos no estádio.", peso: 0.05 },
  { t: "{ponta} faz o drible mais bonito da tarde e a torcida aplaude de pé." },
  { t: "{vol} tenta o lançamento longo, e a bola sai pela linha de fundo." },
  { t: "O {goleiro} sai do gol e afasta de cabeça no meio da área." },
  { t: "{meia} pede a bola no pé, mas o marcador não dá espaço." },
  { t: "Escanteio para o {meu}, mas a cabeçada sai fraca." },
  { t: "Escanteio para o {adv}, e a defesa afasta de primeira." },
  { t: "Um chute forte de {a2} desvia no {zagMeu} e vai para escanteio." },
  { t: "{m1} faz falta perto da área e o juiz manda a barreira recuar." },
  { t: "O {adv} troca três passes e pede a bola para {a1}." },
  { t: "O {meu} tenta o contra-ataque, mas a jogada termina em impedimento." },
  { t: "{craque} fica com a bola na intermediária e espera a marcação." },
  { t: "Os dois times se estranham perto da bandeirinha. O juiz separa." },
  { t: "{lat} sobe pela lateral e cruza na segunda trave, sem ninguém para completar." },
  { t: "Pancada de {zag} em {a1} e o juiz só dá advertência." },
  { t: "O {goleiro} reclama com a zaga por um toque de costas." },
  { t: "O narrador repete o nome de {m1} três vezes em um minuto." },
  { t: "Chuveirinho na área do {adv}, e o {goleiro} sai bem." },
  { t: "Vaias quando {a1} cai no chão. O árbitro não marca nada." },
  { t: "{craque} cai na área, mas o juiz manda seguir." },
  { t: "Torcedores atrás do gol do {adv} seguram uma faixa enorme." },
  { t: "Bola rebatida no peito de {zagMeu} quase vira gol contra." },
  { t: "Um chute de {m1} batido sem força, e o {goleiro} segura fácil." },
  { t: "Os dois times disputam a bola no meio, e o lance vira um empurra-empurra." },
  { t: "O VAR confirma o cartão e o jogo segue." },
  { t: "Clima tenso no banco do {adv} depois de um lance com {a1}." },
  { t: "{ata} abre os braços pedindo falta e o juiz não marca." },
  { t: "A bola sobra na entrada da área e ninguém chega para finalizar." },
  { t: "O {meu} recupera a bola alto no campo e a torcida explode." },
  { t: "{a1} tenta a bicicleta e a bola passa longe do gol." },
  { t: "Gritos de \"ôôô\" quando {ponta} dá uma finta no meio da rua." },
  { t: "A torcida visitante canta o nome de {a1}." },
  { t: "Torcedor da casa levanta a camisa do {meu} na arquibancada." },
  { t: "{vol} dá um carrinho e fica com a bola, mas o árbitro manda seguir." },
  { t: "Repetição da jogada no telão: o {goleiro} fez mesmo uma defesa e tanto." },
  { t: "Um chute cruzado de {m1} passa rente à trave e o estádio suspira." },
  { t: "Um torcedor invade o campo com uma camisa do {meu}, e a segurança leva embora.", peso: 0.05 },
  { t: "Um pombo pousa na área e o {goleiro} espanta com a mão.", peso: 0.05 },
  { t: "Uma pipa presa nos fios bate na área e o jogo para por um minuto.", peso: 0.05 },
];
const DO_JOGADOR: Record<"bom" | "ruim" | "neutro", Modelo[]> = {
  bom: [
    { t: "{nome} dá um drible desconcertante e a torcida aplaude." }, { t: "{nome} acerta um lançamento de 40 metros." }, { t: "Desarme limpo de {nome} no meio-campo." },
    { t: "{nome} chama a marcação e abre espaço para o {comp}." }, { t: "{nome} ganha todas pelo alto.", quando: (c) => c.pos === "ZAG" || c.pos === "VOL" },
    { t: "{nome} corta um cruzamento perigoso.", quando: (c) => c.pos === "ZAG" || c.pos === "LAT" }, { t: "{nome} passa por dois e sofre a falta.", quando: (c) => c.pos !== "ZAG" },
    { t: "O narrador elogia: \"{nome} está jogando muito!\"" },
  { t: "{nome} recebe de costas, gira e sai da marcação." },
  { t: "{nome} segura a bola no canto e ganha a falta." },
  { t: "{nome} acerta o passe para o {ponta} na correria." },
  { t: "{nome} marca bem a sua linha e não deixa o {a1} girar." },
  { t: "{nome} sobe mais alto e afasta o perigo." },
  { t: "{nome} sai jogando com calma e a torcida elogia." },
  { t: "{nome} faz uma troca de passes rápida e abre o jogo." },
  { t: "{nome} vê o buraco na defesa e manda o passe certo." },
  ],
  ruim: [
    { t: "{nome} erra um passe fácil." }, { t: "{nome} perde a bola no ataque e o técnico reclama." }, { t: "{nome} é driblado pelo {a1}." },
    { t: "{nome} chuta muito longe do gol.", quando: (c) => c.pos !== "ZAG" }, { t: "{nome} fura o cabeceio.", quando: (c) => c.pos === "ZAG" || c.pos === "ATA" },
    { t: "A torcida reclama de {nome}." },
  { t: "{nome} dá um passe de presente para o adversário." },
  { t: "{nome} chega atrasado na dividida e o juiz mostra o amarelo." },
  { t: "{nome} não acompanha o {a1} e vê o lance acontecer." },
  { t: "{nome} chuta por cima com a bola livre na área." },
  { t: "{nome} toca de calcanhar no lugar errado, e o {adv} sai em contra-ataque." },
  { t: "O técnico faz sinal para {nome} marcar mais de perto." },
  ],
  neutro: [
    { t: "{nome} pede a bola, mas não recebe." }, { t: "{nome} toca de lado, sem risco." }, { t: "{nome} cobra o lateral rápido." },
    { t: "{nome} faz uma falta no meio-campo, sem cartão." }, { t: "{nome} ajeita a meia e volta para o posicionamento." },
  { t: "{nome} cobra o tiro de meta com calma." },
  { t: "{nome} conversa com o {meia} sobre a marcação." },
  { t: "{nome} recua para ajudar a defesa." },
  { t: "{nome} mostra o braço pedindo a bola, sem resposta." },
  { t: "{nome} pega a bola na intermediária e espera a jogada." },
  { t: "{nome} sai para beber água e volta logo em seguida." },
  { t: "{nome} reclama baixinho com o {zagMeu} e volta ao lugar." },
  ],
};

/** Frases usadas nos últimos jogos, da mais antiga para a mais nova. */
export type Recentes = string[];
/** Entre as candidatas: as que não apareceram nos jogos recentes; se todas apareceram, as que faz mais tempo. */
function variarPor<T>(lista: T[], chave: (x: T) => string, recentes?: Recentes): T[] {
  if (!recentes?.length) return lista;
  const novos = lista.filter((x) => !recentes.includes(chave(x)));
  if (novos.length) return novos;
  const idx = (x: T) => recentes.lastIndexOf(chave(x));
  const menor = Math.min(...lista.map(idx));
  return lista.filter((x) => idx(x) === menor);
}
function escolher(rng: RNG, lista: Modelo[], c: CtxNarracao, recentes?: Recentes): Modelo {
  const ok = variarPor(lista.filter((m) => !m.quando || m.quando(c)), (m) => m.t, recentes);
  const tot = ok.reduce((a, m) => a + (m.peso ?? 1), 0); let r = rng.next() * tot;
  for (const m of ok) { r -= m.peso ?? 1; if (r <= 0) return m; }
  return ok[0];
}

/** Abertura do jogo e lances de ambiente espalhados pelos 90 minutos. */
export function narrarPartida(rng: RNG, c: CtxNarracao, nomes: Record<string, string>, elMeu: Elenco, elAdv: Elenco, ligacoes: Ligacao[] = [], recentes?: Recentes): { abertura: string; linhas: LinhaNarracao[] } {
  const extras = () => ({ ...nomes, m1: umDe(rng, [...elMeu.MEI, ...elMeu.PON, ...elMeu.ATA, ...elMeu.VOL], 8), a1: umDe(rng, [...elAdv.ATA, ...elAdv.MEI, ...elAdv.PON, ...elAdv.VOL], 8), a2: umDe(rng, [...elAdv.PON, ...elAdv.MEI, ...elAdv.ATA].reverse(), 5) });
  const abertura = preencher(rng.pick(c.base ? ["Bola rolando no CT.", "Começa o jogo da base.", "Bola rolando na base.", "Começa a partida no CT, com a molecada.", "Bola no chão do CT e os pais gritam da grade."] :
    c.classico ? ["É clássico! Bola rolando no {estadio}.", "Começa o clássico. O {estadio} está lotado e barulhento.", "Clássico no {estadio}: a tensão já se vê nas arquibancadas.", "Apita o juiz e começa o clássico, com o {estadio} em pé."] :
    ["Bola rolando no {estadio}.", "Começa o jogo no {estadio}.", "O juiz apita e a bola rola no {estadio}.", "A bola rola no {estadio} debaixo de aplausos.", "Começa o jogo. O {estadio} está cheio para ver o {meu}.", "Apita o juiz e começa a partida no {estadio}.", "O {estadio} canta o hino e a bola rola."]), nomes) + (c.chuva ? " Chove forte." : "");
  const linhas: LinhaNarracao[] = [];
  const usados = new Set<string>();
  const n = rng.int(5, 8);
  for (let i = 0; i < n; i++) {
    const m = escolher(rng, AMBIENTE, c, recentes);
    if (usados.has(m.t)) continue; usados.add(m.t);
    linhas.push({ min: rng.int(3, 88), texto: preencher(m.t, extras()), cls: m.cls, modelo: m.t });
  }
  // memória da torcida: o que aconteceu na rodada anterior ainda aparece nas arquibancadas
  if (c.eco && rng.chance(0.7)) {
    const e = c.eco;
    const pool = e.resultado === "derrota" ? ["A torcida ainda cobra a derrota da última rodada, e a cobrança vem em coro.", "Na arquibancada, a faixa da última derrota ainda está pendurada.", "Um grupo de torcedores grita o placar da última rodada, sem parar."]
      : e.resultado === "vitoria" && e.nota >= 8 ? ["A torcida canta alto o nome de quem brilhou na última vitória.", "Desde o aquecimento, a arquibancada lembra a atuação da rodada passada.", "Cartaz de 'Craque da última rodada' tremula na curva."]
      : e.resultado === "vitoria" ? ["A torcida comemora a vitória da última rodada e pede a mesma atitude.", "Ainda se ouve o coro da última vitória nas arquibancadas."]
      : ["A torcida quer ver mais do que o empate da última rodada.", "Arquibancada cobra mais brilho depois do empate da rodada passada."];
    const t = rng.pick(pool);
    if (!usados.has(t)) { usados.add(t); linhas.push({ min: rng.int(1, 12), texto: t, cls: e.resultado === "derrota" ? "aviso" : undefined, modelo: t }); }
  }
  // personalidade: quem tem pavio curto leva amarelo; um par de companheiros que se conhece do clube aparece junto
  if (nomes.pavio && rng.chance(0.5)) {
    const t = rng.pick(["Amarelo para {pavio}, depois de reclamar com o árbitro.", "{pavio} discute com o juiz e recebe o cartão."]);
    const min = rng.int(20, 80);
    if (!usados.has(t)) { usados.add(t); linhas.push({ min, texto: preencher(t, extras()), cls: "contra", modelo: t }); }
  }
  const ladoDo = (n: string) => elMeu.MEI.includes(n) || elMeu.ATA.includes(n) || elMeu.PON.includes(n) || elMeu.VOL.includes(n) || elMeu.ZAG.includes(n) || elMeu.LAT.includes(n) ? "meu" : elAdv.ATA.includes(n) || elAdv.MEI.includes(n) || elAdv.PON.includes(n) || elAdv.VOL.includes(n) || elAdv.ZAG.includes(n) || elAdv.LAT.includes(n) ? "adv" : "";
  const pares = ligacoes.filter((l) => ladoDo(l.a) && ladoDo(l.a) === ladoDo(l.b));
  if (pares.length && rng.chance(0.5)) {
    const p = rng.pick(pares);
    const t = p.tipo === "amizade" ? "{a} e {b}, amigos desde o {clube}, trocam passes e sorrisos em campo." : "{a} e {b} trocam empurrões depois de uma dividida; já se estranhavam desde o {clube}.";
    const min = rng.int(15, 85);
    linhas.push({ min, texto: preencher(t, { ...extras(), a: p.a, b: p.b, clube: p.clube }), cls: p.tipo === "rivalidade" ? "aviso" : undefined });
  }
  // lances do jogador, conforme a atuação (a nota do simulador antes das decisões)
  const emCampo = Math.min(90, c.saida) - c.entrada;
  if (emCampo > 0) {
    const k = emCampo > 45 ? rng.int(2, 3) : 1;
    for (let i = 0; i < k; i++) {
      const tipo = c.nota >= 7 ? (rng.chance(0.75) ? "bom" : "neutro") : c.nota <= 5.8 ? (rng.chance(0.7) ? "ruim" : "neutro") : rng.pick(["bom", "neutro", "ruim"] as const);
      const m = escolher(rng, DO_JOGADOR[tipo], c, recentes);
      if (usados.has(m.t)) continue; usados.add(m.t);
      linhas.push({ min: rng.int(c.entrada + 2, Math.min(89, c.saida - 1)), texto: preencher(m.t, extras()), cls: tipo === "bom" ? "meu" : undefined, jogador: true, modelo: m.t });
    }
  }
  return { abertura, linhas: linhas.filter((l) => l.min !== 45).sort((a, b) => a.min - b.min) };
}
