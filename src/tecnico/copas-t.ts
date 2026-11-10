// As copas no modo técnico: estadual (no Brasil), copa nacional, Libertadora/Champions/Asiática/Concachampions,
// Intercontinental e Mundial de Clubes. As mesmas regras e o mesmo calendário do modo jogador (src/copas.ts): os jogos
// do seu clube são de verdade (com a sua escalação), o resto é simulado.
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { mundo } from "../mundo.js";
import {
  COPAS, classificados, novaCopa, rodarSemana, jogoDoClubeNaSemana, nomearCopaNacional, participantesNac, ehMundial, confederacao, regiaoNaCopa, ehEstadual,
  type CopaId, type EstadoCopa,
} from "../copas.js";
import { infoLiga } from "../ligas.js";
import type { SaveTecnico } from "./motor.js";

const CONTINENTAIS: CopaId[] = ["LIB", "UCL", "ACL", "CON"];
const ESTADUAIS: CopaId[] = ["PAU", "CAR", "MIN", "GAU", "PRN", "CAT", "BAI", "PER", "CEA", "GOI"];
/** Peso de cada copa (prêmio em dinheiro, reputação e o quanto a diretoria e a torcida comemoram). */
export const PESO_COPA: Partial<Record<CopaId, number>> = { MUN: 3, INT: 2.2, UCL: 2.6, LIB: 2.2, ACL: 1.4, CON: 1.4, NAC: 1.2 };
const peso = (id: CopaId) => PESO_COPA[id] ?? (ehEstadual(id) ? 0.6 : 1);

/** Campeões de cada temporada (para a Intercontinental e o Mundial). */
export type PalmaresT = Record<number, Partial<Record<CopaId, string>>>;

/** As copas da temporada do clube (montadas no começo dela pela tabela final da anterior). */
export function copasT(pacote: PacoteDados, s: SaveTecnico): Partial<Record<CopaId, EstadoCopa>> {
  const w = mundo(pacote), pais = w.info[s.clubeId]?.pais ?? "";
  if (pais) nomearCopaNacional(pais);
  if (s.copas && s.copasT === s.temporada) return s.copas;
  const t = s.temporada, forca = (id: string) => w.clube[id]?.forca ?? 60, paisDe = (id: string) => w.clube[id]?.pais ?? "";
  const real = s.tabelasReais[t - 1];
  const fonte = { ligas: w.liga, ...(real ? { tabelaReal: real } : {}), semente: s.semente, temporada: t, cidade: (id: string) => w.info[id]?.cidade ?? "" };
  const copas: Partial<Record<CopaId, EstadoCopa>> = {};
  // continentais: todas (os campeões alimentam a Intercontinental do ano seguinte)
  for (const id of CONTINENTAIS) { const cs = classificados(fonte, id); if (cs.length >= 8) copas[id] = novaCopa(id, t, cs, forca, paisDe, regiaoNaCopa, s.semente); }
  // estadual: só o do estado do clube
  if (pais === "BRA") for (const id of ESTADUAIS) { const cs = classificados(fonte, id); if (cs.includes(s.clubeId)) { copas[id] = novaCopa(id, t, cs, forca, paisDe, regiaoNaCopa, s.semente); break; } }
  // copa nacional do país
  if (pais) { const pn = participantesNac(w.liga, pais, (lid) => infoLiga(lid)); if (pn.length) copas.NAC = novaCopa("NAC", t, pn, forca, paisDe, regiaoNaCopa, s.semente); }
  // Intercontinental: campeões da temporada passada (Concachampions, Libertadora, Asiática, Champions)
  const p = s.palmaresT?.[t - 1] ?? {};
  const ints = [p.CON, p.LIB, p.ACL, p.UCL];
  if (ints.every(Boolean) && new Set(ints).size === 4) copas.INT = novaCopa("INT", t, ints as string[], forca, paisDe, regiaoNaCopa, s.semente);
  // Mundial de Clubes (a cada quatro anos, no fim da temporada)
  if (ehMundial(t)) { const ms = participantesMundialT(pacote, s); if (ms.length === 32) copas.MUN = novaCopa("MUN", t, ms, forca, paisDe, (id) => confederacao(paisDe(id) || w.info[id]?.pais || ""), s.semente); }
  // carreira que já estava rolando quando as copas chegaram: as semanas que passaram são simuladas
  for (const e of Object.values(copas)) for (let sem = 0; sem < s.semana && e; sem++) rodarSemana(e, sem, forca, new RNG(`${s.semente}|copaT-atraso|${e.id}|${t}|${sem}`));
  s.copas = copas; s.copasT = t;
  return copas;
}
/** Os 32 do Mundial: campeões continentais das quatro últimas temporadas e os mais fortes de cada continente. */
function participantesMundialT(pacote: PacoteDados, s: SaveTecnico): string[] {
  const w = mundo(pacote), t = s.temporada, pais = (id: string) => w.clube[id]?.pais ?? w.info[id]?.pais ?? "";
  const lista: string[] = [];
  const doContinente = (copa: CopaId, conf: string, n: number) => {
    const campeoes = [...new Set([t - 1, t - 2, t - 3, t - 4].map((x) => s.palmaresT?.[x]?.[copa]).filter(Boolean) as string[])];
    const resto = Object.values(w.clube).filter((c) => c.ligaId !== "SELECOES" && confederacao(c.pais) === conf).sort((a, b) => b.forca - a.forca).map((c) => c.id);
    const sel: string[] = [];
    for (const c of [...campeoes, ...resto]) { if (sel.length >= n) break; if (lista.includes(c) || sel.includes(c) || sel.filter((x) => pais(x) === pais(c)).length >= 3) continue; sel.push(c); }
    lista.push(...sel);
  };
  doContinente("UCL", "UEFA", 12); doContinente("LIB", "CONMEBOL", 7); doContinente("ACL", "AFC", 4); doContinente("CON", "CONCACAF", 4);
  lista.push(...Object.values(w.clube).filter((c) => c.ligaId === "CONV" && confederacao(c.pais) === "CAF").sort((a, b) => b.forca - a.forca).slice(0, 4).map((c) => c.id));
  lista.push(...Object.values(w.clube).filter((c) => c.ligaId === "CONV" && confederacao(c.pais) === "OFC").map((c) => c.id).slice(0, 1));
  // o seu clube, se for grande o bastante, recebe convite (como os do país-sede)
  if (!lista.includes(s.clubeId) && lista.length < 32 && (w.clube[s.clubeId]?.forca ?? 0) >= 78) lista.push(s.clubeId);
  const extra = Object.values(w.clube).filter((c) => c.ligaId !== "SELECOES" && c.ligaId !== "CONV" && !lista.includes(c.id)).sort((a, b) => b.forca - a.forca);
  while (lista.length < 32 && extra.length) lista.push(extra.shift()!.id);
  const forca = (id: string) => w.clube[id]?.forca ?? 60;
  return lista.slice(0, 32).sort((a, b) => forca(b) - forca(a));
}
/** Jogo de copa do clube nesta semana (ainda sem placar). */
export function jogoCopaT(pacote: PacoteDados, s: SaveTecnico) {
  const r = jogoDoClubeNaSemana(copasT(pacote, s), s.clubeId, s.semana);
  return r && r.jogo.gc === undefined ? r : undefined;
}
/** O clube ainda tem jogo de copa pela frente nesta temporada (a temporada só acaba depois). */
export const temCopaPendente = (s: SaveTecnico) => Object.values(s.copas ?? {}).some((e) => e && e.temporada === s.temporada && e.jogos.some((j) => j.gc === undefined && j.semana >= s.semana && (j.casa === s.clubeId || j.fora === s.clubeId)));

/** Roda a semana de todas as copas (com o placar do jogo do seu clube) e devolve os títulos e eliminações do seu clube. */
export function rodarCopasT(pacote: PacoteDados, s: SaveTecnico, meu?: { id: string; gc: number; gf: number }): { titulos: CopaId[]; caiu: CopaId[] } {
  const w = mundo(pacote), forca = (id: string) => w.clube[id]?.forca ?? 60, out = { titulos: [] as CopaId[], caiu: [] as CopaId[] };
  for (const e of Object.values(copasT(pacote, s))) {
    if (!e || e.fase === "fim") continue;
    const tinha = e.clubes.includes(s.clubeId) && vivo(e, s.clubeId);
    rodarSemana(e, s.semana, forca, new RNG(`${s.semente}|copaT|${e.id}|${s.temporada}|${s.semana}`), meu);
    if (e.fase === "fim" && e.campeao) (s.palmaresT ??= {})[s.temporada] = { ...(s.palmaresT?.[s.temporada] ?? {}), [e.id]: e.campeao };
    if (!tinha) continue;
    if (e.campeao === s.clubeId) out.titulos.push(e.id);
    else if (!vivo(e, s.clubeId)) out.caiu.push(e.id);
  }
  return out;
}
/** O clube ainda está vivo na copa (tem jogo marcado sem placar ou a fase dele ainda é a atual). */
function vivo(e: EstadoCopa, clube: string): boolean {
  if (e.fase === "fim") return e.campeao === clube;
  if (e.jogos.some((j) => j.gc === undefined && (j.casa === clube || j.fora === clube))) return true;
  return e.chegou[clube] === e.fase;
}
/** Fecha as copas no fim da temporada: simula o que falta (os campeões ficam no palmarés). */
export function fecharCopasT(pacote: PacoteDados, s: SaveTecnico) {
  const w = mundo(pacote), forca = (id: string) => w.clube[id]?.forca ?? 60;
  for (const e of Object.values(s.copas ?? {})) {
    if (!e || e.fase === "fim") continue;
    for (let sem = 0; sem <= 46 && e.fase !== "fim"; sem++) rodarSemana(e, sem, forca, new RNG(`${s.semente}|copaT-fim|${e.id}|${s.temporada}|${sem}`));
    if (e.campeao) (s.palmaresT ??= {})[s.temporada] = { ...(s.palmaresT?.[s.temporada] ?? {}), [e.id]: e.campeao };
  }
}
/** Recompensa por título (dinheiro, reputação, confiança e torcida). */
export function premioDeTitulo(s: SaveTecnico, id: CopaId): { dinheiro: number; texto: string } {
  const p = peso(id), dinheiro = Math.round(s.clube.tv * 1.6 * p);
  s.tecnico.reputacao = clamp(s.tecnico.reputacao + Math.round(3 * p), 0, 100);
  s.diretoria.confianca = clamp(s.diretoria.confianca + Math.round(6 * p), 0, 100);
  s.clube.torcida = clamp(s.clube.torcida + Math.round(5 * p), 0, 100);
  return { dinheiro, texto: `CAMPEÃO ${COPAS[id].prep === "do" ? "DO" : "DA"} ${COPAS[id].curto.toUpperCase()}!` };
}
/** Bônus por vitória num jogo de copa (a premiação por fase). */
export const bonusVitoriaCopa = (s: SaveTecnico, id: CopaId) => Math.round(s.clube.tv * 0.06 * peso(id));
