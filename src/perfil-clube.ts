// Perfil do clube: títulos da liga por temporada, elenco atual, time de todos os tempos (o melhor de cada posição
// em cada temporada, pela nota média, somado ao longo da história do clube) e os dados do clube (cidade, estádio, técnico).
import { mundo, infoClube, linhasDoClube, statsDaLinha, tecnicoDoClube } from "./mundo.js";
import { VAGAS_433 } from "./partida.js";
import { infoLiga } from "./ligas.js";
import type { PacoteDados } from "./liga.js";

export const MIN_JOGOS_TEMPORADA = 10;

/** Anos em que o clube foi campeão da liga (rank 1 na temporada). */
export function titulosDoClube(pacote: PacoteDados, clubeId: string): { anos: number[]; liga: string } {
  const anos = new Set<number>();
  for (const { x } of linhasDoClube(pacote, clubeId)) if (x.liga && x.liga[0] === 1) anos.add(x.t);
  const liga = infoClube(pacote, clubeId)?.ligaId ?? "";
  return { anos: [...anos].sort((a, b) => a - b), liga: liga ? infoLiga(liga).curto : "" };
}

export interface TitularHistorico { nome: string; posicao: string; vezes: number; nota: number; temporadas: number }

/** O melhor de cada posição em cada temporada (mín. de jogos), contado ao longo da história; o time sai dos que mais vezes foram o melhor. */
export function timeDeTodosOsTempos(pacote: PacoteDados, clubeId: string): TitularHistorico[] {
  const porTempo = new Map<string, { nome: string; posicao: string; nota: number }[]>();
  const notas = new Map<string, { soma: number; n: number; temporadas: number }>();
  for (const { nome, x } of linhasDoClube(pacote, clubeId)) {
    const st = statsDaLinha(pacote, nome, x);
    if (!st || st.j < MIN_JOGOS_TEMPORADA) continue;
    const chave = `${x.t}|${x.posicao}`, lista = porTempo.get(chave) ?? [];
    lista.push({ nome, posicao: x.posicao, nota: st.n });
    porTempo.set(chave, lista);
    const acu = notas.get(nome) ?? { soma: 0, n: 0, temporadas: 0 };
    acu.soma += st.n; acu.n++; acu.temporadas++;
    notas.set(nome, acu);
  }
  const vezes = new Map<string, { posicao: string; vezes: number }>();
  for (const lista of porTempo.values()) {
    const melhor = lista.sort((a, b) => b.nota - a.nota)[0];
    const v = vezes.get(melhor.nome) ?? { posicao: melhor.posicao, vezes: 0 };
    v.vezes++;
    vezes.set(melhor.nome, v);
  }
  const todos: TitularHistorico[] = [...vezes].map(([nome, v]) => {
    const a = notas.get(nome)!;
    return { nome, posicao: v.posicao, vezes: v.vezes, nota: +(a.soma / a.n).toFixed(2), temporadas: a.temporadas };
  });
  // o XI: por posição, quem mais foi o melhor da posição (desempate pela nota média); goleiro é um só
  const xi: TitularHistorico[] = [];
  for (const [pos, n] of [["GOL", 1], ...Object.entries(VAGAS_433)] as [string, number][]) {
    xi.push(...todos.filter((t) => t.posicao === pos).sort((a, b) => b.vezes - a.vezes || b.nota - a.nota).slice(0, n));
  }
  return xi;
}

/** Elenco atual do clube (o do momento da simulação). */
export function plantelDoClube(pacote: PacoteDados, clubeId: string) {
  const c = mundo(pacote).clube[clubeId];
  return c ? [...c.elenco].sort((a, b) => b.ovr - a.ovr) : [];
}

export { tecnicoDoClube, infoClube };
