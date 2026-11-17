// Gols e assistências da liga no modo técnico, todos saindo dos mesmos jogos: o placar de cada jogo dos outros times vira
// gols com autor, minuto e assistência (escolhidos no onze provável de cada clube, pela posição e pelo nível). Esses mesmos
// lances aparecem nos "outros jogos" ao vivo, no resumo da rodada e somam na artilharia e nas assistências da liga. Os gols
// do adversário no seu jogo também entram (o autor e o passe vêm do lance narrado).
import type { RNG } from "../rng.js";
import type { PacoteDados, JogadorNPC } from "../liga.js";
import { mundo } from "../mundo.js";
import { onzeProvavel } from "../relacoes.js";
import { simularPlacar, SHARE_GOL, SHARE_ASSIST } from "../partida.js";
import { rodadasDaLiga } from "../liga.js";
import type { SaveTecnico, EventoPartida } from "./motor.js";

/** Um gol: minuto, se foi do time da casa, autor e quem deu o passe ("" = sem assistência). */
export type GolLiga = [number, boolean, string, string];
export interface JogoNpc { casa: string; fora: string; gc: number; gf: number; gols: GolLiga[] }
export interface ArtLiga { t: number; ligaId: string; /** chave: clube|nome (nomes iguais em clubes diferentes não se misturam) */ x: Record<string, { n: string; c: string; j: number; g: number; a: number }> }

const pesoGol = (j: JogadorNPC) => (j.posicao === "GOL" ? 0.002 : (SHARE_GOL[j.posicao as keyof typeof SHARE_GOL] ?? 0.05) * Math.pow(Math.max(40, j.ovr) / 70, 1.6));
const pesoAss = (j: JogadorNPC) => (j.posicao === "GOL" ? 0.01 : (SHARE_ASSIST[j.posicao as keyof typeof SHARE_ASSIST] ?? 0.05) * Math.pow(Math.max(40, j.ovr) / 70, 1.5));
function sortear<T>(rng: RNG, l: T[], p: (x: T) => number): T | undefined {
  const t = l.reduce((a, x) => a + p(x), 0); if (t <= 0 || !l.length) return undefined;
  let r = rng.next() * t; for (const x of l) { r -= p(x); if (r <= 0) return x; } return l[l.length - 1];
}
/** Autor e passe de um gol de um clube do mundo. */
export function autorNpc(rng: RNG, onze: JogadorNPC[]): [string, string] {
  const autor = sortear(rng, onze, pesoGol);
  if (!autor) return ["", ""];
  const passe = rng.chance(0.72) ? sortear(rng, onze.filter((j) => j !== autor), pesoAss) : undefined;
  return [autor.nome, passe?.nome ?? ""];
}
/** Os jogos dos outros times na rodada `r` (placar igual ao que vai para a tabela, com os gols detalhados). */
export function jogosNpcDaRodada(pacote: PacoteDados, s: SaveTecnico, r: number, rngPlacar: RNG, rngGols: RNG): JogoNpc[] {
  const w = mundo(pacote), rodadas = rodadasDaLiga(s.ordem.length), out: JogoNpc[] = [];
  if (r < 0 || r >= rodadas.length) return out;
  for (const [ia, ib] of rodadas[r]) {
    const casa = s.ordem[ia], fora = s.ordem[ib];
    if (casa === s.clubeId || fora === s.clubeId) continue;
    const [gc, gf] = simularPlacar(rngPlacar, w.clube[casa]?.forca ?? 60, w.clube[fora]?.forca ?? 60);
    const oc = onzeProvavel(w.clube[casa]?.elenco ?? []), of = onzeProvavel(w.clube[fora]?.elenco ?? []);
    const gols: GolLiga[] = [];
    for (let k = 0; k < gc; k++) { const [a, p] = autorNpc(rngGols, oc); gols.push([rngGols.int(1, 90), true, a, p]); }
    for (let k = 0; k < gf; k++) { const [a, p] = autorNpc(rngGols, of); gols.push([rngGols.int(1, 90), false, a, p]); }
    gols.sort((a, b) => a[0] - b[0]);
    out.push({ casa, fora, gc, gf, gols });
  }
  return out;
}
/** Soma os jogos da rodada na artilharia e nas assistências da liga (jogos para o onze provável dos dois times). */
export function registrarRodada(pacote: PacoteDados, s: SaveTecnico, jogos: JogoNpc[], meu?: { adv: string; eventos: EventoPartida[] }) {
  if (!s.artLiga || s.artLiga.t !== s.temporada || s.artLiga.ligaId !== s.ligaId || Object.values(s.artLiga.x).some((v) => !v.n)) s.artLiga = { t: s.temporada, ligaId: s.ligaId, x: {} };
  const x = s.artLiga.x, w = mundo(pacote);
  const linha = (nome: string, c: string) => (x[`${c}|${nome}`] ??= { n: nome, c, j: 0, g: 0, a: 0 });
  const jogou = (clube: string) => { for (const j of onzeProvavel(w.clube[clube]?.elenco ?? [])) linha(j.nome, clube).j++; };
  for (const g of jogos) {
    jogou(g.casa); jogou(g.fora);
    for (const [, casa, autor, passe] of g.gols) { const c = casa ? g.casa : g.fora; if (autor) linha(autor, c).g++; if (passe) linha(passe, c).a++; }
  }
  if (meu) {
    jogou(meu.adv);
    for (const e of meu.eventos) if (e.tipo === "gol" && !e.meu) { if (e.autor) linha(e.autor, meu.adv).g++; if (e.assist) linha(e.assist, meu.adv).a++; }
  }
}
