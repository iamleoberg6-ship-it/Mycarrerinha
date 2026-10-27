// Rival pessoal: um jogador de verdade do mundo, da mesma geração e da mesma faixa do campo, que a imprensa passa a
// comparar com o jogador. Os duelos (quando os clubes se enfrentam) ficam no placar particular; a temperatura sobe
// com provocações, entrevistas e duelos, e cai com o tempo.
import { RNG, clamp } from "./rng.js";
import { agendar, type EstadoAgenda, type OpcaoOcasiao, type EfeitoVida } from "./agenda.js";

const op = (id: string, rotulo: string, texto: string, ef: EfeitoVida, risco?: OpcaoOcasiao["risco"]): OpcaoOcasiao => ({ id, rotulo, texto, ef, ...(risco ? { risco } : {}) });
const primeiro = (n: string) => n.split(" ")[0];

export interface Duelo { ano: number; adv: string; meu: number; dele: number; golsEu: number; golsEle: number; venceu: "eu" | "ele" | "empate" }
export interface Rival {
  nome: string; clubeId: string; posicao: string; desde: number; idade: number;
  /** 0 a 100: o quanto a imprensa e as redes estão em cima da rivalidade */
  temp: number;
  placar: { eu: number; ele: number; empate: number }; duelos: Duelo[];
  /** temporadas comparadas: gols de cada um no fim do ano */
  anos: { ano: number; golsEu: number; golsEle: number; clubeEle: string }[];
  fim?: { ano: number; motivo: string };
  /** semanas seguidas em ligas diferentes (muito tempo longe e a rivalidade morre) */
  longe?: number;
}
export interface Candidato { nome: string; clubeId: string; ovr: number; posicao: string; idade: number; fama: number }
const GRUPO: Record<string, string> = { ATA: "ataque", PON: "ataque", MEI: "meio", VOL: "meio", ZAG: "defesa", LAT: "defesa", GOL: "gol" };

/** Escolhe o rival: mesma geração (±3 anos), mesma faixa do campo, nível parecido, de outro clube. Prefere a mesma liga. */
export function escolherRival(cands: Candidato[], eu: { idade: number; posicao: string; ovr: number; clubeId: string; ligaDe: (id: string) => string | undefined; ligaId: string }, excluir: string[] = []): Candidato | undefined {
  const g = GRUPO[eu.posicao];
  const pool = cands.filter((x) => x.clubeId !== eu.clubeId && !excluir.includes(x.nome) && Math.abs(x.idade - eu.idade) <= 3 && GRUPO[x.posicao] === g && x.ovr >= eu.ovr - 6 && x.ovr <= eu.ovr + 10);
  const nota = (x: Candidato) => -Math.abs(x.ovr - (eu.ovr + 2)) + (eu.ligaDe(x.clubeId) === eu.ligaId ? 6 : 0) + (x.posicao === eu.posicao ? 3 : 0) + x.fama / 25;
  return pool.sort((a, b) => nota(b) - nota(a))[0];
}
export function novoRival(c: Candidato, ano: number): Rival {
  return { nome: c.nome, clubeId: c.clubeId, posicao: c.posicao, desde: ano, idade: c.idade, temp: 40, placar: { eu: 0, ele: 0, empate: 0 }, duelos: [], anos: [] };
}

/** Um duelo: quando o clube do jogador encara o do rival (e os dois jogam). */
export function registrarDuelo(r: Rival, d: Omit<Duelo, "venceu">): Duelo {
  const venceu: Duelo["venceu"] = d.meu - d.dele >= 0.4 ? "eu" : d.dele - d.meu >= 0.4 ? "ele" : "empate";
  const x = { ...d, venceu };
  r.duelos = [...r.duelos, x].slice(-30);
  if (venceu === "eu") r.placar.eu++; else if (venceu === "ele") r.placar.ele++; else r.placar.empate++;
  r.temp = clamp(r.temp + 10, 0, 100);
  return x;
}

export interface CtxRival { ab: number; ano: number; apelido: string; fama: number; nomeClubeEle: string; temperamento: number }
/** A semana da rivalidade: esfria um pouco e, de vez em quando, uma provocação ou uma pergunta da imprensa. */
export function semanaRival(r: Rival, a: EstadoAgenda, rng: RNG, c: CtxRival) {
  r.temp = clamp(r.temp - 0.8, 5, 100);
  const chance = 0.015 + r.temp / 1400 + c.temperamento / 2000;
  if (!rng.chance(chance)) return;
  const ele = primeiro(r.nome);
  if (rng.chance(0.55)) agendar(a, c.ab, { origem: "rival", chave: "rival-provoca", titulo: `${ele} provoca nas redes`, texto: `${r.nome} (${c.nomeClubeEle}) postou um vídeo imitando a sua comemoração. Os seguidores dos dois foram à loucura.`, opcoes: [
    op("meme", "Responder com meme", "A resposta foi a mais curtida da semana. A rivalidade pegou fogo.", { engajamento: 10, hype: 0.25, gatilho: "rival:temp:15" }, { chance: 0.25, texto: "O meme passou do ponto e virou polêmica.", ef: { imprensa: -6, torcida: -2, hype: 0.2, gatilho: "rival:temp:20", noticia: { titulo: `${c.apelido} × ${ele}: briga nas redes`, texto: "A troca de provocações saiu do controle e virou assunto na TV.", tipo: "polemica" } } }),
    op("classe", "Resposta elegante", `"Respeito o ${ele}. Em campo a gente resolve." A imprensa elogiou.`, { imprensa: 5, fama: 0.5, gatilho: "rival:temp:5" }),
    op("ignorar", "Ignorar", "Silêncio. A rivalidade esfriou um pouco.", { gatilho: "rival:temp:-10" }),
  ] }, 16);
  else agendar(a, c.ab, { origem: "rival", chave: "rival-entrevista", titulo: `"Quem é melhor: você ou ${ele}?"`, texto: `Na zona mista, o repórter fez a pergunta que todo mundo queria ouvir.`, opcoes: [
    op("eu", "\"Eu, claro\"", "Manchete garantida. Agora tem que provar.", { fama: 1, hype: 0.2, pressao: 4, gatilho: "rival:temp:12" }),
    op("respeito", "\"Ele é craque, eu respeito\"", "Humildade que a torcida gostou de ver.", { imprensa: 4, torcida: 1, gatilho: "rival:temp:-4" }),
    op("campo", "\"Deixo para o campo\"", "Resposta de jogador cascudo.", { imprensa: 2 }),
  ] }, 20);
}

/** Fim de temporada: compara os gols do ano. */
export function anoDoRival(r: Rival, ano: number, golsEu: number, golsEle: number, clubeEle: string) {
  r.anos = [...r.anos.filter((x) => x.ano !== ano), { ano, golsEu, golsEle, clubeEle }].slice(-25);
}
