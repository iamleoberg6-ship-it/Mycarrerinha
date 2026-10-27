// Torcida de carne e osso: o apelido que a arquibancada dá, a música com o nome do jogador, as faixas no estádio,
// o protesto no CT quando a coisa vai mal e a recepção no aeroporto depois de título. Cada clube guarda a sua história.
import { RNG } from "./rng.js";
import { agendar, type EstadoAgenda, type OpcaoOcasiao, type EfeitoVida } from "./agenda.js";

const op = (id: string, rotulo: string, texto: string, ef: EfeitoVida, risco?: OpcaoOcasiao["risco"]): OpcaoOcasiao => ({ id, rotulo, texto, ef, ...(risco ? { risco } : {}) });

export interface TorcidaClube { clubeId: string; apelido?: string; musica?: { ano: number; versos: string[] }; faixas: { ano: number; texto: string }[]; protestos: number; aeroporto: number; ultimoProtesto?: number }
export type EstadoTorcida = Record<string, TorcidaClube>;

const APELIDOS: Record<string, string[]> = {
  ATA: ["Matador", "Pistoleiro", "Artilheiro do Povo", "Rei da Área", "Homem-Gol"], PON: ["Foguete", "Raio", "Bailarino", "Flecha", "Liso"],
  MEI: ["Maestro", "Professor", "Mágico", "Camisa 10 do Povo", "Gênio"], VOL: ["Cão de Guarda", "Xerife do Meio", "Pitbull", "Motor", "Carregador de Piano"],
  ZAG: ["Xerife", "Muralha", "Paredão", "Zagueiro-Raiz", "General"], LAT: ["Motorzinho", "Trem-Bala", "Flecha", "Incansável", "Corredor"], GOL: ["Paredão", "Santo", "Gato", "Muralha", "Goleirão"],
};
/** Versos de arquibancada (originais do jogo), com o nome e o apelido. */
const MUSICAS: ((n: string, a: string, c: string) => string[])[] = [
  (n, a) => ["Ô, ô, ô, ô", `o ${a} chegou`, `é ${n}, é ${n}`, "o terror do adversário!"],
  (n, _a, c) => [`Ninguém segura o ${n}`, `ele joga pelo ${c}`, "e a arquibancada canta", "de domingo a domingo!"],
  (n, a) => [`Lá vem ele, lá vem ele`, `é o ${a}, é o ${a}`, `${n} na bola`, "é festa no estádio!"],
  (n, _a, c) => [`${n}, ${n}`, "a camisa pesa e ele aguenta", `o ${c} tem dono`, "e o dono é ele!"],
];

export const torcidaDe = (t: EstadoTorcida, clubeId: string): TorcidaClube => (t[clubeId] ??= { clubeId, faixas: [], protestos: 0, aeroporto: 0 });

export interface CtxTorcida { ab: number; ano: number; clubeId: string; clube: string; torcida: number; jogosNoClube: number; apelido: string; posicao: string; fama: number;
  /** o jogo da semana: nota, gols, se foi clássico ou decisão e o adversário */
  jogo?: { nota: number; gols: number; grande: boolean; adv: string } }
export interface EfeitoTorcida { moral: number; avisos: string[]; noticias: { titulo: string; texto: string; tipo?: "clube" | "polemica" | "vida" }[]; marcos: string[] }

export function semanaTorcida(t: TorcidaClube, a: EstadoAgenda, rng: RNG, c: CtxTorcida): EfeitoTorcida {
  const e: EfeitoTorcida = { moral: 0, avisos: [], noticias: [], marcos: [] };
  // apelido: a arquibancada batiza quem conquista ela
  if (!t.apelido && c.torcida >= 68 && c.jogosNoClube >= 8 && rng.chance(0.25)) {
    t.apelido = rng.pick(APELIDOS[c.posicao] ?? APELIDOS.MEI);
    e.moral += 3;
    e.noticias.push({ titulo: `A torcida do ${c.clube} já tem um nome para ${c.apelido}`, texto: `Nas arquibancadas e nas redes, ${c.apelido} virou "${t.apelido}".`, tipo: "vida" });
    e.avisos.push(`A torcida te batizou: "${t.apelido}".`);
  }
  // música: só para ídolo de verdade
  if (!t.musica && c.torcida >= 80 && c.jogosNoClube >= 15 && rng.chance(0.2)) {
    t.musica = { ano: c.ano, versos: rng.pick(MUSICAS)(c.apelido, t.apelido ?? c.apelido, c.clube) };
    e.moral += 6;
    e.noticias.push({ titulo: `${c.apelido} ganha música da torcida`, texto: `A arquibancada do ${c.clube} estreou um canto só para ele: "${t.musica.versos.slice(0, 2).join(", ")}..."`, tipo: "vida" });
    e.marcos.push(`Ganha música da torcida do ${c.clube}`);
    e.avisos.push("A torcida criou uma música para você!");
  }
  // faixa no estádio depois de jogão em jogo grande
  if (c.jogo && c.jogo.grande && c.jogo.nota >= 7.8 && c.jogo.gols > 0 && rng.chance(0.55)) {
    const nome = t.apelido ?? c.apelido;
    const texto = rng.pick([`${nome}, o terror do ${c.jogo.adv}`, `Obrigado, ${nome}`, `${nome} é nosso`, `Aqui é ${c.clube}, aqui joga ${nome}`, `${nome}: o dono do clássico`]);
    t.faixas = [...t.faixas, { ano: c.ano, texto }].slice(-12);
    e.moral += 2;
    e.noticias.push({ titulo: `Faixa para ${c.apelido}`, texto: `No jogo contra o ${c.jogo.adv}, a torcida estendeu: "${texto}".`, tipo: "vida" });
  }
  // protesto no CT quando a relação azedou
  if (c.torcida <= 25 && (t.ultimoProtesto === undefined || c.ab - t.ultimoProtesto >= 10) && rng.chance(0.12)) {
    t.ultimoProtesto = c.ab; t.protestos++;
    agendar(a, c.ab, { origem: "torcida", chave: `protesto-${c.clubeId}`, titulo: "Protesto no CT", prazo: 2, texto: `Torcedores do ${c.clube} foram ao centro de treinamento com faixas contra alguns jogadores. O seu nome está nelas.`, opcoes: [
      op("conversar", "Conversar com a organizada", "Você ouviu, prometeu suor e ganhou um voto de confiança.", { torcida: 9, moral: -1 }, { chance: 0.25, texto: "A conversa esquentou. Teve empurra-empurra e ameaça.", ef: { moral: -7, pressao: 8, noticia: { titulo: "Tensão no CT", texto: `Torcedores cercaram ${c.apelido} na saída do treino.`, tipo: "polemica" } } }),
      op("desculpas", "Pedir desculpas nas redes", "Parte da torcida aceitou. Outra parte riu.", { torcida: 4, engajamento: 4 }),
      op("ignorar", "Ignorar e sair pelos fundos", "Você saiu pelo portão de trás. A foto vazou.", { torcida: -4, pressao: 5 }),
    ] }, 10);
  }
  // torcedor mirim
  if (c.fama >= 30 && c.torcida >= 55 && rng.chance(0.02)) agendar(a, c.ab, { origem: "torcida", chave: "torcedor-mirim", titulo: "Torcedor mirim no alambrado", texto: "Um menino de uns 8 anos chorava no alambrado com um cartaz: \"Me dá sua camisa?\"", opcoes: [
    op("camisa", "Dar a camisa e uma foto", "O vídeo do menino chorando abraçado com você rodou o país.", { torcida: 4, moral: 3, engajamento: 8, hype: 0.15 }),
    op("aceno", "Acenar de longe", "Ele acenou de volta. Já valeu.", { torcida: 1 }),
  ] }, 30);
  return e;
}

/** Título: festa no aeroporto (se a torcida gosta do jogador, o nome dele é o mais gritado). */
export function recepcaoAeroporto(t: TorcidaClube, c: { clube: string; apelido: string; torcida: number; titulo: string }): { titulo: string; texto: string } | undefined {
  t.aeroporto++;
  return { titulo: `Festa no aeroporto: ${c.clube} recebido por multidão`, texto: c.torcida >= 65 ? `Milhares de torcedores esperaram o time com o troféu ${c.titulo}. O nome mais gritado foi o de ${c.apelido}.` : `Milhares de torcedores receberam o time com o troféu ${c.titulo}.` };
}
