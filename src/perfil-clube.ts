// Perfil do clube: títulos da liga por temporada, elenco atual, time de todos os tempos (o melhor de cada posição
// em cada temporada, pela nota média, somado ao longo da história do clube) e os dados do clube (cidade, estádio, técnico).
import { mundo, infoClube, linhasDoClube, statsDaLinha, tecnicoDoClube, campeoesDoClube } from "./mundo.js";
import { VAGAS_433 } from "./partida.js";
import { infoLiga } from "./ligas.js";
import type { PacoteDados } from "./liga.js";
import { RNG } from "./rng.js";

export const MIN_JOGOS_TEMPORADA = 10;

export interface TituloLiga { liga: string; nome: string; curto: string; anos: number[] }

/** Campeonatos ganhos pelo clube, por liga (só títulos conquistados, nunca os que apenas disputou). */
export function titulosDoClube(pacote: PacoteDados, clubeId: string): { total: number; ligas: TituloLiga[] } {
  const porLiga = new Map<string, number[]>();
  for (const x of campeoesDoClube(pacote, clubeId)) porLiga.set(x.liga, [...(porLiga.get(x.liga) ?? []), x.t]);
  const ligas = [...porLiga].map(([liga, anos]) => ({ liga, nome: infoLiga(liga).nome, curto: infoLiga(liga).curto, anos: anos.sort((a, b) => a - b) }))
    .sort((a, b) => b.anos.length - a.anos.length || a.nome.localeCompare(b.nome));
  return { total: ligas.reduce((a, l) => a + l.anos.length, 0), ligas };
}

export interface TitularHistorico { nome: string; posicao: string; vezes: number; nota: number; temporadas: number; melhorAno: number; melhorNota: number }

/** O melhor de cada posição em cada temporada (mín. de jogos), contado ao longo da história; o time sai dos que mais vezes foram o melhor. */
export function timeDeTodosOsTempos(pacote: PacoteDados, clubeId: string): TitularHistorico[] {
  const porTempo = new Map<string, { nome: string; posicao: string; nota: number }[]>();
  const notas = new Map<string, { soma: number; n: number; temporadas: number }>();
  const melhorTemp = new Map<string, { t: number; nota: number }>();
  for (const { nome, x } of linhasDoClube(pacote, clubeId)) {
    const st = statsDaLinha(pacote, nome, x);
    if (!st || st.j < MIN_JOGOS_TEMPORADA) continue;
    const chave = `${x.t}|${x.posicao}`, lista = porTempo.get(chave) ?? [];
    lista.push({ nome, posicao: x.posicao, nota: st.n });
    porTempo.set(chave, lista);
    const acu = notas.get(nome) ?? { soma: 0, n: 0, temporadas: 0 };
    acu.soma += st.n; acu.n++; acu.temporadas++;
    notas.set(nome, acu);
    const mt = melhorTemp.get(nome);
    if (!mt || st.n > mt.nota) melhorTemp.set(nome, { t: x.t, nota: st.n });
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
    const mt = melhorTemp.get(nome)!;
    return { nome, posicao: v.posicao, vezes: v.vezes, nota: +(a.soma / a.n).toFixed(2), temporadas: a.temporadas, melhorAno: mt.t, melhorNota: +mt.nota.toFixed(2) };
  });
  // o XI: por posição, quem mais foi o melhor da posição (desempate pela nota média); goleiro é um só
  const xi: TitularHistorico[] = [];
  for (const [pos, n] of [["GOL", 1], ...Object.entries(VAGAS_433)] as [string, number][]) {
    xi.push(...todos.filter((t) => t.posicao === pos).sort((a, b) => b.vezes - a.vezes || b.nota - a.nota).slice(0, n));
  }
  // vaga sem jogador da posição (clube com pouca história nela): quem sobrou no clube, pelo mesmo critério, ocupa a vaga
  const sobra = todos.filter((t) => !xi.includes(t)).sort((a, b) => b.vezes - a.vezes || b.nota - a.nota);
  for (const [pos, n] of [["GOL", 1], ...Object.entries(VAGAS_433)] as [string, number][]) {
    const falta = n - xi.filter((t) => t.posicao === pos).length;
    for (let i = 0; i < falta && sobra.length; i++) xi.push(sobra.shift()!);
  }
  // clube com pouca história (nem os sobras bastam): o elenco atual completa as vagas, pelo overall, com nota e títulos zerados
  if (xi.length < 11) {
    const ja = new Set(xi.map((t) => t.nome));
    const ano = Math.max(0, ...linhasDoClube(pacote, clubeId).map(({ x }) => x.t));
    const elenco = plantelDoClube(pacote, clubeId).filter((j) => !ja.has(j.nome)).sort((a, b) => b.ovr - a.ovr);
    for (const [pos, n] of [["GOL", 1], ...Object.entries(VAGAS_433)] as [string, number][]) {
      const falta = n - xi.filter((t) => t.posicao === pos).length;
      for (let i = 0; i < falta; i++) {
        const j = elenco.find((x) => x.posicao === pos) ?? elenco[0];
        if (!j) break;
        elenco.splice(elenco.indexOf(j), 1);
        xi.push({ nome: j.nome, posicao: j.posicao, vezes: 0, nota: 0, temporadas: 0, melhorAno: ano, melhorNota: 0 });
      }
    }
  }
  return xi;
}

/** Recordes do clube na história: maiores artilheiros e assistentes, o melhor de uma temporada e goleiros que mais seguraram o zero. */
export interface RecordeNome { nome: string; valor: number; ano?: number }
export interface RecordesDoClube { golsTemp: RecordeNome[]; assistTemp: RecordeNome[]; artilheiros: RecordeNome[]; assistentes: RecordeNome[]; semGol: RecordeNome[] }
const cacheRecordes = new Map<string, RecordesDoClube>();
const topo = (m: Map<string, number>, ano?: Map<string, number>) => [...m].map(([nome, valor]) => ({ nome, valor, ...(ano ? { ano: ano.get(nome) } : {}) })).sort((a, b) => b.valor - a.valor).slice(0, 5);
export function recordesHistoricosDoClube(pacote: PacoteDados, clubeId: string): RecordesDoClube {
  const ja = cacheRecordes.get(clubeId);
  if (ja) return ja;
  const temp: RecordeNome[] = [], assistTemp: RecordeNome[] = [];
  const gols = new Map<string, number>(), assist = new Map<string, number>(), sg = new Map<string, number>();
  for (const { nome, x } of linhasDoClube(pacote, clubeId)) {
    const st = statsDaLinha(pacote, nome, x);
    if (!st || st.j < MIN_JOGOS_TEMPORADA) continue;
    temp.push({ nome, valor: st.g, ano: x.t }); assistTemp.push({ nome, valor: st.a, ano: x.t });
    gols.set(nome, (gols.get(nome) ?? 0) + st.g); assist.set(nome, (assist.get(nome) ?? 0) + st.a);
    if (x.posicao === "GOL") {
      // jogos sem sofrer gol: a simulação não guarda o zero a zero, então é uma estimativa pelo jogo e pela qualidade do goleiro
      const rng = new RNG(`semgol|${x.t}|${clubeId}|${nome}`);
      const f = rng.range(0.22, 0.42) + Math.min(0.18, Math.max(0, (x.ovr - 60) / 120));
      sg.set(nome, (sg.get(nome) ?? 0) + Math.round(st.j * f));
    }
  }
  const r: RecordesDoClube = {
    golsTemp: temp.sort((a, b) => b.valor - a.valor).slice(0, 5),
    assistTemp: assistTemp.sort((a, b) => b.valor - a.valor).slice(0, 5),
    artilheiros: topo(gols), assistentes: topo(assist), semGol: topo(sg),
  };
  cacheRecordes.set(clubeId, r);
  return r;
}

/** Elenco atual do clube (o do momento da simulação). */
export function plantelDoClube(pacote: PacoteDados, clubeId: string) {
  const c = mundo(pacote).clube[clubeId];
  return c ? [...c.elenco].sort((a, b) => b.ovr - a.ovr) : [];
}

export { tecnicoDoClube, infoClube };
