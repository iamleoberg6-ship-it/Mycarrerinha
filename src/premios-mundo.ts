// Prêmios do ano no mundo: Bola de Ouro, The Best, Melhor da Europa, Rei da América, Melhor da Ásia, Melhor Africano,
// Troféu Kopa (sub-21), Troféu Yashin (goleiro), Chuteira de Ouro e a Seleção do Ano.
// Cada prêmio tem os seus votantes: pesos diferentes para a temporada individual, a fama (nível) e os títulos de cada
// competição, e um "humor" do júri (ruído próprio). Por isso, quase sempre o melhor do mundo também é o melhor da Europa,
// mas de vez em quando os votos se dividem e dão vencedores diferentes.
import { RNG } from "./rng.js";
import type { Candidato } from "./mundo.js";

export type IdPremio = "BOLA" | "BEST" | "UEFA" | "REI" | "ASIA" | "AFR" | "KOPA" | "YASHIN" | "CHUTEIRA";
export interface LinhaPremio { nome: string; clubeId: string; nacionalidade: string; posicao: string; pontos: number; gols: number; nota: number; eu?: boolean }
export interface PremioMundo { id: IdPremio; nome: string; ranking: LinhaPremio[] }
export interface PremiosDoAno { ano: number; premios: PremioMundo[]; selecao: LinhaPremio[] }

export interface ContextoPremios {
  semente: string; ano: number;
  /** campeão de cada liga */
  campeaoLiga: Record<string, string | undefined>;
  /** até onde o clube foi em cada copa ("campeao" para o campeão) */
  faseCopa: (copa: string, clubeId: string) => string | undefined;
  /** até onde a seleção do jogador foi na Copa do Mundo (só quem foi convocado) */
  faseCopaDoMundo: (x: Candidato) => string | undefined;
  regiaoLiga: (ligaId: string) => string;
  nivelLiga: (ligaId: string) => number;
  confederacao: (pais: string) => string;
}

interface Juri {
  id: IdPremio; nome: string; quantos: number;
  pool: (x: Candidato, ctx: ContextoPremios) => boolean;
  indiv: number; fama: number; liga: number; copas: Record<string, number>; humor: number;
  /** quanto vale a temporada fora da Europa para esse júri (os prêmios mundiais olham mais para lá) */
  foraEuropa?: number;
}
const TODAS = { UCL: 1, LIB: 0.5, ACL: 0.25, CON: 0.25, MUN: 0.45, INT: 0.15, COP: 1.1 };
const JURIS: Juri[] = [
  // jornalistas do mundo todo: temporada e títulos grandes
  { id: "BOLA", nome: "Bola de Ouro", quantos: 10, pool: () => true, indiv: 1, fama: 0.45, liga: 1, copas: TODAS, humor: 1.8, foraEuropa: 0.75 },
  // técnicos e capitães das seleções: pesa mais o nome e a Copa
  { id: "BEST", nome: "The Best da FIFA", quantos: 3, pool: () => true, indiv: 0.9, fama: 0.8, liga: 0.9, copas: { ...TODAS, UCL: 0.85, MUN: 0.6, COP: 1 }, humor: 2, foraEuropa: 0.75 },
  // jornalistas europeus e técnicos da Champions: só quem joga na Europa, e a Champions vale muito
  { id: "UEFA", nome: "Melhor da Europa", quantos: 3, pool: (x, c) => c.regiaoLiga(x.ligaId) === "EUR", indiv: 1.05, fama: 0.35, liga: 0.8, copas: { UCL: 1.5, COP: 0.45 }, humor: 1.6 },
  // jornalistas das Américas: quem joga no continente, Libertadora em primeiro
  { id: "REI", nome: "Rei da América", quantos: 3, pool: (x, c) => ["BRA", "SUL", "NAM"].includes(c.regiaoLiga(x.ligaId)), indiv: 1.1, fama: 0.35, liga: 1.1, copas: { LIB: 1.4, CON: 0.9, MUN: 0.7, INT: 0.3, COP: 0.3 }, humor: 1.6 },
  { id: "ASIA", nome: "Melhor da Ásia", quantos: 3, pool: (x, c) => c.regiaoLiga(x.ligaId) === "ARA", indiv: 1.1, fama: 0.4, liga: 1.1, copas: { ACL: 1.4, MUN: 0.6, INT: 0.3, COP: 0.3 }, humor: 1.6 },
  // africano de nascimento, jogue onde jogar
  { id: "AFR", nome: "Melhor Africano", quantos: 3, pool: (x, c) => c.confederacao(x.nacionalidade) === "CAF", indiv: 1, fama: 0.45, liga: 1, copas: { ...TODAS, COP: 0.8 }, humor: 1.8, foraEuropa: 0.75 },
  { id: "KOPA", nome: "Troféu Kopa (sub-21)", quantos: 3, pool: (x) => (x.idade ?? 99) <= 21, indiv: 1.1, fama: 0.3, liga: 0.8, copas: TODAS, humor: 1.5, foraEuropa: 0.75 },
  { id: "YASHIN", nome: "Troféu Yashin (goleiro)", quantos: 3, pool: (x) => x.posicao === "GOL", indiv: 1, fama: 0.4, liga: 1, copas: TODAS, humor: 1.2, foraEuropa: 0.75 },
];
const VALOR_FASE: Record<string, number> = { liga: 0.5, grupos: 0.5, turno: 0.4, derby: 0.5, desafio: 0.8, playoff: 0.8, oitavas: 1.2, quartas: 2, semi: 3.2, final: 4.8, campeao: 7.5 };
const PRESTIGIO: Record<number, number> = { 1: 1, 2: 0.78, 3: 0.6, 4: 0.45, 5: 0.3 };
const VAGAS: [string, number][] = [["GOL", 1], ["LAT", 2], ["ZAG", 2], ["VOL", 1], ["MEI", 2], ["PON", 2], ["ATA", 1]];

const linha = (x: Candidato, pontos: number): LinhaPremio => ({ nome: x.nome, clubeId: x.clubeId, nacionalidade: x.nacionalidade, posicao: x.posicao, pontos: Math.round(pontos * 10) / 10, gols: x.gols, nota: x.nota, ...(x.eu ? { eu: true } : {}) });

/** Pontos de um jogador para um júri: temporada (com o peso da liga), nome (nível) e títulos. */
function pontos(x: Candidato, j: Juri, ctx: ContextoPremios, rng: RNG): number {
  const prest = (PRESTIGIO[ctx.nivelLiga(x.ligaId)] ?? 0.3) * (ctx.regiaoLiga(x.ligaId) === "EUR" ? 1 : j.foraEuropa ?? 1);
  const goleiro = x.posicao === "GOL";
  const indiv = (x.nota - 6.5) * (goleiro ? 18 : 14) + (goleiro ? 0 : x.gols * 0.45 + x.assist * 0.25);
  let p = indiv * prest * j.indiv + (x.ovr - 78) * j.fama;
  if (ctx.campeaoLiga[x.ligaId] === x.clubeId) p += 4 * prest * j.liga;
  for (const [copa, peso] of Object.entries(j.copas)) {
    const f = copa === "COP" ? ctx.faseCopaDoMundo(x) : ctx.faseCopa(copa, x.clubeId);
    if (f) p += (VALOR_FASE[f] ?? 0) * peso;
  }
  return p + rng.normal(0, j.humor);
}

export function premiosDoAno(candidatos: Candidato[], ctx: ContextoPremios): PremiosDoAno {
  const premios: PremioMundo[] = [];
  let pontosBest: Map<Candidato, number> | undefined;
  for (const j of JURIS) {
    const rng = new RNG(`${ctx.semente}|premio|${j.id}|${ctx.ano}`);
    const lista = candidatos.filter((x) => j.pool(x, ctx)).map((x) => [x, pontos(x, j, ctx, rng)] as [Candidato, number]);
    if (j.id === "BEST") pontosBest = new Map(lista);
    const ranking = lista.sort((a, b) => b[1] - a[1]).slice(0, j.quantos).map(([x, p]) => linha(x, p));
    if (ranking.length) premios.push({ id: j.id, nome: j.nome, ranking });
  }
  // Chuteira de Ouro: gols nas ligas europeias, com peso pela força da liga (2 nas cinco grandes, 1,5 nas médias)
  const chut = candidatos.filter((x) => ctx.regiaoLiga(x.ligaId) === "EUR" && x.gols > 0)
    .map((x) => [x, x.gols * (ctx.nivelLiga(x.ligaId) === 1 ? 2 : ctx.nivelLiga(x.ligaId) <= 3 ? 1.5 : 1)] as [Candidato, number])
    .sort((a, b) => b[1] - a[1] || a[0].jogos! - b[0].jogos!).slice(0, 3).map(([x, p]) => linha(x, p));
  if (chut.length) premios.push({ id: "CHUTEIRA", nome: "Chuteira de Ouro", ranking: chut });
  // Seleção do Ano (votada pelos jogadores): os melhores por posição no voto do The Best, num 4-3-3
  const ord = [...(pontosBest ?? new Map())].sort((a, b) => b[1] - a[1]);
  const selecao = VAGAS.flatMap(([pos, k]) => ord.filter(([x]) => x.posicao === pos).slice(0, k).map(([x, p]) => linha(x, p)));
  return { ano: ctx.ano, premios, selecao };
}
