// Álbum no modo técnico: o álbum do jogador continua (vem na transição) e o técnico ganha as figurinhas dele —
// uma por temporada (com jogos, vitórias, empates, derrotas, posição e aproveitamento), escudo do clube novo,
// títulos, técnico do ano, acesso e marcas da carreira (jogos e vitórias).
import { infoClube } from "../mundo.js";
import { infoLiga } from "../ligas.js";
import { figurinhaLivre, type Figurinha, type Raridade } from "../figurinhas.js";
import type { PacoteDados, LinhaTabela } from "../liga.js";
import type { SaveTecnico } from "./motor.js";
import { ANO_INICIAL_T } from "./motor.js";

export const albumT = (s: SaveTecnico): Figurinha[] => (s.album ??= []);
function baseT(pacote: PacoteDados, s: SaveTecnico, ano: number) {
  const info = infoClube(pacote, s.clubeId);
  return { ano, clubeId: s.clubeId, clube: info?.nome ?? "", cores: [info?.cores[0] ?? "#1D1F22", info?.cores[1] ?? "#FFFFFF"] as [string, string], numero: "", posicao: "TEC",
    ovr: Math.round(s.tecnico.reputacao), idade: s.tecnico.idade, jogos: 0, gols: 0, assist: 0, ap: { ...(s.tecnico.aparencia ?? {}) } };
}
/** Fim de temporada do técnico: as figurinhas do ano. */
export function figurinhasDoAnoT(pacote: PacoteDados, s: SaveTecnico, pos: number, linha: LinhaTabela | undefined, esperado: number, premios: string[]) {
  const t = s.temporada, ano = ANO_INICIAL_T + t, al = albumT(s), b = baseT(pacote, s, ano), li = infoLiga(s.ligaId);
  const j = linha?.j ?? 0, v = linha?.v ?? 0, e = linha?.e ?? 0, d = linha?.d ?? 0, aprov = j ? Math.round(((v * 3 + e) / (j * 3)) * 100) : 0;
  const st = (s.statsT ??= { j: 0, v: 0, e: 0, d: 0 }); st.j += j; st.v += v; st.e += e; st.d += d;
  const copas = (s.titulosCopa ?? []).filter((x) => x.t === t && x.clubeId === s.clubeId).map((x) => x.nome);
  const titulos = [...(pos === 1 ? [li.nome] : []), ...copas];
  const rar: Raridade = titulos.length >= 2 ? "lenda" : titulos.length ? "brilhante" : esperado - pos >= 3 ? "prata" : "comum";
  if (!al.some((f) => f.tipo === "escudo" && f.clubeId === s.clubeId && f.extra?.tec)) figurinhaLivre(al, { ...b, tipo: "escudo", raridade: "prata", legenda: `Primeira temporada como técnico · ${ano}`, extra: { tec: 1 }, chave: `t-${s.clubeId}` });
  figurinhaLivre(al, { ...b, tipo: "tecnico", raridade: rar, jogos: j, legenda: `${pos}º lugar na ${li.curto}${titulos.length ? ` · ${titulos.length === 1 ? "campeão" : `${titulos.length} títulos`}` : ""}`, extra: { j, v, e, d, pos, aprov }, chave: `${t}-${s.clubeId}` });
  for (const nome of titulos) figurinhaLivre(al, { ...b, tipo: "titulo", raridade: "brilhante", legenda: `Campeão: ${nome}`, chave: `t-${t}-${nome}` });
  if (premios.some((p) => /técnico do ano/i.test(p))) figurinhaLivre(al, { ...b, tipo: "premio", raridade: "brilhante", arte: "estrela", legenda: `Técnico do ano · ${li.curto}`, chave: `t-${t}-tec` });
  const marcas: [number, number, string, string][] = [[st.j, 100, "j", "jogos como técnico"], [st.j, 250, "j", "jogos como técnico"], [st.j, 500, "j", "jogos como técnico"], [st.v, 100, "v", "vitórias"], [st.v, 250, "v", "vitórias"]];
  for (const [tot, n, k, uni] of marcas) if (tot >= n) figurinhaLivre(al, { ...b, tipo: "marco", raridade: n >= 250 ? "lenda" : "brilhante", legenda: `${n} ${uni}`, extra: { n, unidade: uni.split(" ")[0] }, chave: `t-${k}-${n}` });
}
/** Acesso de divisão: figurinha de festa. */
export function figurinhaDeAcessoT(pacote: PacoteDados, s: SaveTecnico, ano: number, liga: string) {
  figurinhaLivre(albumT(s), { ...baseT(pacote, s, ano), tipo: "acesso", raridade: "brilhante", legenda: `Subiu para a ${liga}`, chave: `t-${ano}-${s.clubeId}` });
}
