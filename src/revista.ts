// Revista ISPN: no fim de cada temporada, as listas dos 100 melhores do mundo, da Europa, das Américas e sub-21.
// A nota mistura o nível do jogador (overall), a temporada (nota média, gols e assistências por jogo, valendo menos em
// liga fraca), a vitrine da liga (as cinco grandes da Europa pesam mais; fora da Europa, menos) e os títulos do clube. O jogador do usuário entra com os números dele e ganha um troféu com a posição em cada lista.
import { candidatosDoAno, mundo, type Candidato } from "./mundo.js";
import { infoLiga } from "./ligas.js";
import type { PacoteDados } from "./liga.js";

export type ListaRevista = "mundo" | "europa" | "americas" | "sub21";
export const LISTAS_REVISTA: { id: ListaRevista; nome: string; curto: string; capa: string }[] = [
  { id: "mundo", nome: "Os 100 melhores do mundo", curto: "Mundo", capa: "#C8102E" }, { id: "europa", nome: "Os 100 melhores da Europa", curto: "Europa", capa: "#0B2F7A" },
  { id: "americas", nome: "Os 100 melhores das Américas", curto: "Américas", capa: "#0B7A3B" }, { id: "sub21", nome: "Os 100 melhores sub-21", curto: "Sub-21", capa: "#7A3BC8" },
];
export interface ItemRevista { nome: string; clubeId: string; posicao: string; idade: number; nacionalidade: string; pontos: number; nota: number; gols: number; assist: number; jogos: number; eu?: boolean }
export interface EdicaoRevista { ano: number; listas: Record<ListaRevista, ItemRevista[]> }
type Cand = Candidato & { eu?: boolean };

/** Pontos da revista: quem é bom e jogou bem, numa liga forte, num clube que ganhou. */
export function pontosRevista(c: Cand, campeoes: Set<string>): number {
  const li = infoLiga(c.ligaId), nivel = Math.min(4, li.nivel ?? 3), j = Math.max(1, c.jogos ?? 1);
  const producao = c.posicao === "GOL" || c.posicao === "ZAG" ? 0 : ((c.gols + c.assist * 0.7) / j) * (c.posicao === "ATA" ? 8 : 10);
  // número em liga fraca vale menos: a temporada pesa pelo nível da liga, e quem joga fora da Europa tem menos vitrine
  const peso = ({ 1: 1, 2: 0.78, 3: 0.65, 4: 0.5 } as Record<number, number>)[nivel] ?? 0.65;
  const vitrine = ({ 1: 4, 2: 2.5, 3: 0, 4: -3 } as Record<number, number>)[nivel] ?? 0;
  const foraDaEuropa = li.regiao === "EUR" ? 0 : -1.5;
  return +(c.ovr + ((c.nota - 6.5) * 9 + producao) * peso + vitrine + foraDaEuropa + (campeoes.has(c.clubeId) ? 2.5 * peso : 0)).toFixed(1);
}
/** Monta a edição do ano (com o jogador do usuário, se ele jogou o mínimo). */
export function montarRevista(pacote: PacoteDados, ano: number, extra: Cand[] = [], campeoes: string[] = [], feitas?: number): EdicaoRevista {
  const camp = new Set(campeoes);
  const todos: Cand[] = [...candidatosDoAno(pacote, 58, feitas), ...extra];
  const vistos = new Set<string>(), cands = todos.filter((c) => { const k = `${c.nome}|${c.clubeId}`; if (vistos.has(k)) return false; vistos.add(k); return true; });
  const item = (c: Cand): ItemRevista => ({ nome: c.nome, clubeId: c.clubeId, posicao: c.posicao, idade: c.idade ?? 0, nacionalidade: c.nacionalidade, pontos: pontosRevista(c, camp), nota: c.nota, gols: c.gols, assist: c.assist, jogos: c.jogos ?? 0, ...(c.eu ? { eu: true } : {}) });
  const ord = cands.map(item).sort((a, b) => b.pontos - a.pontos);
  const reg = (c: ItemRevista) => infoLiga(mundo(pacote).info[c.clubeId]?.ligaId ?? "").regiao;
  return { ano, listas: {
    mundo: ord.slice(0, 100),
    europa: ord.filter((c) => reg(c) === "EUR").slice(0, 100),
    americas: ord.filter((c) => ["BRA", "SUL", "NAM"].includes(reg(c))).slice(0, 100),
    sub21: ord.filter((c) => c.idade <= 21).slice(0, 100),
  } };
}
/** Posição do usuário em cada lista (1 a 100). */
export const minhasPosicoes = (e: EdicaoRevista) => (Object.keys(e.listas) as ListaRevista[]).map((id) => ({ id, pos: e.listas[id].findIndex((x) => x.eu) + 1 })).filter((x) => x.pos > 0);
/** Edição compacta para guardar no save (só os 100 de cada lista). */
export const compactar = (e: EdicaoRevista): EdicaoRevista => e;
