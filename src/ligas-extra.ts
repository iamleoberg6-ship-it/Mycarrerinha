// Ligas novas (Uruguai, Colômbia, Chile, Paraguai, Equador, Turquia e México): clubes em paródia de data/ligas-extra.json,
// elencos gerados (nomes do país, alguns estrangeiros dos vizinhos), sempre iguais. Os clubes que eram convidados das
// copas desses países passam a jogar a liga com o mesmo id.
import { RNG, clamp } from "./rng.js";
import type { Clube, JogadorNPC } from "./liga.js";
import { TODOS_CONVIDADOS } from "./convidados.js";
import { gerarNome } from "./nomes.js";
import dados from "../data/ligas-extra.json";

export interface ClubeExtra { id: string; nome: string; apelido: string; cidade: string; estadio: string; capacidade: number; cores: string[]; padrao: string; forca: number; pais: string }
type Linha = { convidado: string } | Omit<ClubeExtra, "pais">;
const PAIS_DA_LIGA: Record<string, string> = { URU1: "URU", COL1: "COL", CHI1: "CHI", PAR1: "PAR", ECU1: "ECU", TUR1: "TUR", MEX1: "MEX" };
/** de onde vêm os estrangeiros de cada país (e quanto do elenco eles são) */
const DE_FORA: Record<string, [number, string[]]> = {
  URU: [0.08, ["ARG", "PAR", "COL"]], COL: [0.08, ["VEN", "ARG", "ECU"]], CHI: [0.15, ["ARG", "URU", "COL", "VEN"]], PAR: [0.1, ["ARG", "URU", "COL"]],
  ECU: [0.12, ["COL", "ARG", "URU"]], TUR: [0.4, ["BRA", "POR", "FRA", "SEN", "NGA", "NED", "SRB", "BEL", "CRO"]], MEX: [0.35, ["ARG", "COL", "URU", "CHI", "ECU", "USA", "BRA", "PAR"]],
};
export const PAISES_COM_LIGA_NOVA = new Set(Object.values(PAIS_DA_LIGA));

/** Os clubes de cada liga nova (com os ex-convidados no lugar). */
export const CLUBES_EXTRA: Record<string, ClubeExtra[]> = Object.fromEntries(Object.entries((dados as { ligas: Record<string, Linha[]> }).ligas).map(([lid, l]) => [lid, l.map((x): ClubeExtra => {
  if ("convidado" in x) { const c = TODOS_CONVIDADOS.find((k) => k.id === x.convidado)!; return { id: c.id, nome: c.nome, apelido: c.apelido, cidade: c.cidade, estadio: c.estadio, capacidade: 40000, cores: c.cores, padrao: c.padrao, forca: c.forca, pais: c.pais }; }
  return { ...x, pais: PAIS_DA_LIGA[lid] };
})]));

/** Clube de jogo com elenco gerado (24 jogadores, sempre os mesmos). `usados`: nomes que já existem no mundo. */
export function clubeExtra(c: ClubeExtra, ligaId: string, usados: Set<string>): Clube {
  const rng = new RNG(`liga-extra|${c.id}`), [fatia, vizinhos] = DE_FORA[c.pais] ?? [0.1, []];
  const comp: [JogadorNPC["posicao"], number][] = [["GOL", 3], ["ZAG", 4], ["LAT", 4], ["VOL", 3], ["MEI", 4], ["PON", 3], ["ATA", 3]];
  const elenco: JogadorNPC[] = [];
  for (const [pos, n] of comp) for (let i = 0; i < n; i++) {
    const nac = vizinhos.length && rng.chance(fatia) ? rng.pick(vizinhos) : c.pais;
    const titular = i < (pos === "GOL" || pos === "VOL" || pos === "ATA" ? 1 : 2);
    const idade = titular ? rng.int(21, 33) : rng.chance(0.35) ? rng.int(18, 21) : rng.int(22, 34);
    elenco.push({ nome: gerarNome(rng, nac, usados), posicao: pos, ovr: clamp(Math.round(c.forca + (titular ? 1.5 : idade <= 21 ? -7 : -4.5) + rng.normal(0, 2)), 42, 90), idade, nacionalidade: nac });
  }
  return { id: c.id, nome: c.nome, ligaId, forca: c.forca, fClube: c.pais === "TUR" || c.pais === "MEX" ? 0.9 : 0.6, elenco, pais: c.pais };
}
