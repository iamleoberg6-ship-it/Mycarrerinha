// Narração da partida no modo técnico: os mesmos tipos de lance do modo jogador (cara a cara, cabeçada, chute de fora,
// bola parada, contra-ataque...), contados em terceira pessoa com os nomes do seu elenco e do adversário. O técnico não
// escolhe nada: os jogadores decidem, e a narração conta o que aconteceu.
import type { RNG } from "../rng.js";

export type TipoGol = "caraACara" | "cabeca" | "fora" | "rebote" | "contra" | "jogada" | "falta" | "penalti" | "escanteio";
const T = <K extends string>(m: Record<K, string[]>) => m;

/** Gol do seu time: {autor} marca; {passe} quando teve assistência; {gol} é o goleiro deles; {zag} um zagueiro deles. */
const GOL_MEU = T<TipoGol>({
  caraACara: [
    "{passe} enfia entre os zagueiros, {autor} sai sozinho e toca na saída do {gol}. GOL!",
    "{autor} recebe de {passe} na cara do {gol} e bate no cantinho. GOL!",
    "O {zag} escorrega, {autor} fica livre e tira do {gol} com categoria. GOL!",
    "{autor} dribla o {gol} e empurra para o gol vazio. GOL!",
  ],
  cabeca: [
    "{passe} cruza na medida e {autor} sobe mais que todo mundo. GOL de cabeça!",
    "Cruzamento de {passe}, {autor} se antecipa ao {zag} e testa no canto. GOL!",
    "{autor} aparece no meio da área e cabeceia firme, sem chance para o {gol}. GOL!",
  ],
  fora: [
    "{autor} ajeita de fora da área e solta a bomba no ângulo. GOLAÇO!",
    "A bola sobra para {autor} a 25 metros: chute colocado, no cantinho. GOLAÇO!",
    "{passe} rola para trás e {autor} enche o pé de primeira. O {gol} só viu passar. GOL!",
  ],
  rebote: [
    "O {gol} espalma o primeiro chute e {autor}, atento, empurra o rebote. GOL!",
    "Bola na trave, volta na pequena área e {autor} só completa. GOL!",
    "Bate-rebate na área e {autor} é o mais rápido. GOL!",
  ],
  contra: [
    "Roubada no meio, {passe} lança e {autor} arranca no contra-ataque. Bate cruzado. GOL!",
    "Contra-ataque fulminante: {passe} acha {autor} nas costas da defesa. GOL!",
    "{autor} puxa o contra-ataque sozinho, deixa o {zag} para trás e finaliza. GOL!",
  ],
  jogada: [
    "Troca de passes envolvente, {passe} acha {autor} na área e ele não perdoa. GOL!",
    "{passe} dribla dois pela ponta e rola para {autor} completar. GOL!",
    "Tabela rápida entre {passe} e {autor}, que bate rasteiro. GOL!",
  ],
  falta: [
    "Falta na entrada da área. {autor} bate por cima da barreira, no ângulo. GOLAÇO de falta!",
    "{autor} cobra a falta com efeito e a bola entra no canto do {gol}. GOL!",
  ],
  penalti: [
    "Pênalti! {autor} bate deslocando o {gol}. GOL!",
    "{autor} cobra o pênalti no ângulo, sem chance. GOL!",
    "Pênalti marcado. {autor} espera o {gol} cair e toca no meio. GOL!",
  ],
  escanteio: [
    "Escanteio de {passe}, {autor} sobe no primeiro pau e desvia. GOL!",
    "Na bola parada, {passe} cobra fechado e {autor} cabeceia para dentro. GOL!",
  ],
});
/** Gol do adversário: {autor} é deles; {meuGol} é o seu goleiro; {meuZag} um zagueiro seu. */
const GOL_ADV = [
  "{autor} recebe nas costas da zaga e bate na saída do {meuGol}. Gol deles.",
  "Cruzamento na área, {autor} ganha do {meuZag} pelo alto. Gol deles.",
  "{autor} arrisca de fora e a bola desvia no meio do caminho. Gol deles.",
  "Bobeira na saída de bola, {autor} rouba e não perdoa. Gol deles.",
  "{autor} aproveita o rebote do {meuGol}. Gol deles.",
  "Contra-ataque rápido e {autor} finaliza cruzado. Gol deles.",
  "Pênalti para eles. {autor} bate e o {meuGol} pula para o outro lado. Gol deles.",
];
/** Chance perdida do seu time: {quem} finaliza; {gol} é o goleiro deles. */
const CHANCE_MEU = [
  "{quem} bate da entrada da área e a bola explode na trave!",
  "{quem} cabeceia firme, mas o {gol} faz uma defesaça.",
  "{quem} sai cara a cara e o {gol} fecha o ângulo. Que chance!",
  "{quem} arrisca de longe. Por cima do travessão.",
  "Bate-rebate na área, {quem} chuta e o zagueiro tira em cima da linha.",
  "{quem} recebe em impedimento. O bandeira levanta.",
  "{quem} tenta o drible na área e é desarmado na hora do chute.",
  "Escanteio, {quem} sobe sozinho e cabeceia para fora, raspando a trave.",
  "{quem} chuta cruzado e a bola passa lambendo o pé da trave.",
  "Falta perigosa: {quem} bate na barreira.",
];
/** Chance do adversário: {autor} é deles; {meuGol} é o seu goleiro; {meuZag} um zagueiro seu. */
const CHANCE_ADV = [
  "{autor} bate forte e o {meuGol} espalma para escanteio. Defesa importante.",
  "{autor} sai na cara do gol, mas o {meuZag} chega no carrinho e salva!",
  "Chute de {autor} de fora da área, rente à trave. Susto.",
  "{autor} cabeceia no travessão! Por pouco.",
  "O {meuGol} sai bem do gol e abafa a finalização de {autor}.",
  "{autor} recebe livre na área e manda por cima. Alívio.",
  "{autor} tenta o chute colocado e o {meuGol} pega firme.",
];
const AMARELO = ["{quem} chega atrasado na dividida e leva amarelo.", "{quem} puxa a camisa no contra-ataque deles. Amarelo.", "{quem} reclama demais com o árbitro e leva amarelo.", "Carrinho por trás de {quem}: amarelo."];
const DIRETO = ["{quem} entra com a sola e o árbitro não hesita: vermelho direto!", "{quem} dá uma cotovelada na disputa pelo alto. Vermelho direto!", "Último homem, {quem} derruba o atacante deles. Expulso!"];
const SEGUNDO = ["{quem}, já amarelado, faz falta para parar o contra-ataque. Segundo amarelo e expulsão!", "{quem} chega atrasado de novo. Segundo amarelo, está fora do jogo."];
const LESAO = ["{quem} sente a coxa após um pique e pede para sair.", "{quem} cai depois de uma dividida forte e o médico entra em campo.", "{quem} torce o tornozelo na disputa e não consegue continuar."];

const fill = (t: string, n: Record<string, string>) => t.replace(/\{(\w+)\}/g, (m, k: string) => n[k] ?? m);
/** Tipo do gol pelo jeito que saiu (bola parada já vem marcada; cabeceio pesa para quem cabeceia bem). */
export function tipoDoGol(rng: RNG, comPasse: boolean, cabeceio: number, contra: boolean): TipoGol {
  const op: [TipoGol, number][] = [["caraACara", 3], ["cabeca", 1 + Math.max(0, cabeceio - 60) / 12], ["fora", 1.3], ["rebote", 1.2], ["contra", contra ? 2.4 : 0.8], ["jogada", comPasse ? 2.2 : 0.4], ["escanteio", comPasse ? 0.8 : 0]];
  const tot = op.reduce((a, [, p]) => a + p, 0); let r = rng.next() * tot;
  for (const [t, p] of op) { r -= p; if (r <= 0) return t; }
  return "caraACara";
}
export function narrarGolMeu(rng: RNG, tipo: TipoGol, n: { autor: string; passe?: string; gol: string; zag: string }): string {
  const l = GOL_MEU[tipo].filter((t) => n.passe || !t.includes("{passe}"));
  return fill(rng.pick(l.length ? l : GOL_MEU.caraACara.filter((t) => !t.includes("{passe}"))), { ...n, passe: n.passe ?? "" });
}
export const narrarGolAdv = (rng: RNG, n: { autor: string; meuGol: string; meuZag: string }) => fill(rng.pick(GOL_ADV), n);
export const narrarChanceMeu = (rng: RNG, n: { quem: string; gol: string }) => fill(rng.pick(CHANCE_MEU), n);
export const narrarChanceAdv = (rng: RNG, n: { autor: string; meuGol: string; meuZag: string }) => fill(rng.pick(CHANCE_ADV), n);
export const narrarCartao = (rng: RNG, quem: string, tipo: "amarelo" | "segundo" | "direto") => fill(rng.pick(tipo === "direto" ? DIRETO : tipo === "segundo" ? SEGUNDO : AMARELO), { quem });
export const narrarLesao = (rng: RNG, quem: string) => fill(rng.pick(LESAO), { quem });
