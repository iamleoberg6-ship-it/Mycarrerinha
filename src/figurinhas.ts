// Álbum de figurinhas da carreira: uma figurinha por temporada (com o clube, o número, o nível e os números do ano)
// e figurinhas especiais nos grandes momentos (estreia na seleção, braçadeira de capitão, título, prêmio).
// A raridade sai do que o jogador fez: comum, prata, brilhante e lenda.
export type Raridade = "comum" | "prata" | "brilhante" | "lenda";
export const NOME_RARIDADE: Record<Raridade, string> = { comum: "Comum", prata: "Prata", brilhante: "Brilhante", lenda: "Lenda" };
export type TipoFigurinha = "temporada" | "selecao" | "capitao" | "titulo" | "premio" | "estreia" | "patrocinio" | "familia" | "golaco";
export const NOME_TIPO_FIG: Record<TipoFigurinha, string> = { temporada: "Temporada", selecao: "Seleção", capitao: "Capitão", titulo: "Campeão", premio: "Prêmio", estreia: "Estreia", patrocinio: "Patrocínio", familia: "Família", golaco: "Golaço" };
export interface Figurinha {
  id: string; ano: number; tipo: TipoFigurinha; raridade: Raridade;
  clubeId: string; clube: string; cores: [string, string]; numero: string; posicao: string;
  ovr: number; idade: number; jogos: number; gols: number; assist: number;
  /** texto do verso: o que a figurinha celebra */
  legenda: string;
  /** aparência do jogador naquele ano (cabelo, barba, acessórios mudam com o tempo) */
  ap: Record<string, unknown>;
  /** figurinha de patrocínio: o contrato assinado (valor e duração) */
  contrato?: { marca: string; tipo: string; mensal: number; meses: number; luvas: number };
}
export interface DadosTemporadaFig { ano: number; ovr: number; idade: number; jogos: number; gols: number; assist: number; titulo: boolean; premios: string[]; selecao: boolean; capitao: boolean; clubeId: string; clube: string; cores: [string, string]; numero: string; posicao: string; ap: Record<string, unknown> }

const PREMIO_LENDA = /Bola de Ouro|Melhor do Mundo|Melhor da Europa|Rei da América|Chuteira de Ouro/;
export function raridadeDaTemporada(d: DadosTemporadaFig): Raridade {
  if (d.premios.some((p) => PREMIO_LENDA.test(p))) return "lenda";
  if (d.titulo || d.ovr >= 82 || d.selecao || d.gols >= 25) return "brilhante";
  if (d.ovr >= 72 || d.gols >= 12 || d.capitao) return "prata";
  return "comum";
}
/** A figurinha do ano (não repete o mesmo ano e clube). */
export function figurinhaDaTemporada(album: Figurinha[], d: DadosTemporadaFig): Figurinha | undefined {
  const id = `t-${d.ano}-${d.clubeId}`;
  // toda temporada tem o escudo do clube em que o jogador esteve, mesmo sem jogo (base, várzea, colégio)
  if (album.some((f) => f.id === id)) return undefined;
  const r = raridadeDaTemporada(d);
  const destaque = d.premios.find((p) => PREMIO_LENDA.test(p)) ?? (d.titulo ? "Campeão da liga" : d.gols >= 12 ? `${d.gols} gols na temporada` : d.capitao ? "Capitão do time" : `${d.jogos} jogos`);
  const f: Figurinha = { id, ano: d.ano, tipo: "temporada", raridade: r, clubeId: d.clubeId, clube: d.clube, cores: d.cores, numero: d.numero, posicao: d.posicao, ovr: Math.round(d.ovr), idade: d.idade, jogos: d.jogos, gols: d.gols, assist: d.assist, legenda: destaque, ap: d.ap };
  album.push(f);
  return f;
}
/** Momento da carreira (patrocínio, família, golaço): uma figurinha por chave, por isso pode haver várias no mesmo ano. */
export function figurinhaDeMomento(album: Figurinha[], tipo: Exclude<TipoFigurinha, "temporada">, base: Omit<Figurinha, "id" | "tipo" | "raridade" | "legenda">, chave: string, legenda: string, raridade: Raridade = "prata"): Figurinha | undefined {
  const id = `${tipo}-${chave}`;
  if (album.some((f) => f.id === id)) return undefined;
  const f: Figurinha = { ...base, id, tipo, raridade, legenda };
  album.push(f);
  return f;
}
/** Figurinha especial (uma de cada tipo por ano). */
export function figurinhaEspecial(album: Figurinha[], tipo: Exclude<TipoFigurinha, "temporada">, base: Omit<Figurinha, "id" | "tipo" | "raridade" | "legenda">, legenda: string, raridade: Raridade = "brilhante"): Figurinha | undefined {
  const id = `${tipo}-${base.ano}-${base.clubeId}`;
  if (album.some((f) => f.id === id)) return undefined;
  const f: Figurinha = { ...base, id, tipo, raridade, legenda };
  album.push(f);
  return f;
}
