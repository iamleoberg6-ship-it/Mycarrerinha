// Plano da diretoria para vários anos (inspirado na "visão do clube" do FM): de 3 a 5 temporadas, com metas de campanha,
// títulos, base, finanças e jeito de jogar. A cada fim de temporada a diretoria avalia: meta cumprida dá confiança, meta
// que falhou tira. Quando o plano acaba, vem um novo, conforme o tamanho que o clube tem agora.
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { mundo } from "../mundo.js";
import { infoLiga } from "../ligas.js";
import type { SaveTecnico } from "./motor.js";

export type TipoMeta = "posicao" | "acesso" | "titulo" | "continental" | "base" | "financas" | "jovens";
export interface MetaDir { tipo: TipoMeta; texto: string; alvo: number; ate: number; status: "andamento" | "cumprida" | "falhou"; progresso: number }
export interface PlanoDir { inicio: number; fim: number; metas: MetaDir[]; avaliacoes: { t: number; texto: string; delta: number }[]; saldoInicio: number }

/** Monta um plano novo conforme o tamanho do clube na liga. */
export function novoPlano(pacote: PacoteDados, s: SaveTecnico): PlanoDir {
  const w = mundo(pacote), li = infoLiga(s.ligaId), l = w.liga[s.ligaId], meu = w.clube[s.clubeId];
  const rank = l ? 1 + l.clubes.filter((c) => c.forca > (meu?.forca ?? 0)).length : 10, n = l?.clubes.length ?? 20;
  const rng = new RNG(`${s.semente}|plano|${s.clubeId}|${s.temporada}`), anos = rank <= 3 ? 3 : rank <= n / 2 ? 4 : 5, t0 = s.temporada, fim = t0 + anos - 1;
  const metas: MetaDir[] = [];
  const m = (tipo: TipoMeta, texto: string, alvo: number, ate: number): MetaDir => ({ tipo, texto, alvo, ate, status: "andamento", progresso: 0 });
  if (rank <= 3) {
    metas.push(m("titulo", `Ganhar ${anos >= 3 ? "2 títulos" : "1 título"} até ${2026 + fim}`, 2, fim));
    metas.push(m("continental", `Classificar para copa continental em todas as temporadas`, anos, fim));
  } else if (li.divisao > 1 || rank > n - 4) {
    if (li.acima) metas.push(m("acesso", `Subir de divisão até ${2026 + Math.min(fim, t0 + 2)}`, 1, Math.min(fim, t0 + 2)));
    else metas.push(m("posicao", `Terminar na primeira metade da tabela até ${2026 + fim}`, Math.ceil(n / 2), fim));
  } else {
    metas.push(m("posicao", `Chegar entre os ${Math.max(4, rank - 3)} primeiros até ${2026 + fim}`, Math.max(4, rank - 3), fim));
    metas.push(m("continental", `Classificar para copa continental ao menos uma vez`, 1, fim));
  }
  metas.push(m("base", `Subir ${rank <= 3 ? 2 : 4} garotos da base para o profissional`, rank <= 3 ? 2 : 4, fim));
  metas.push(m("financas", `Terminar cada temporada sem prejuízo no caixa`, anos, fim));
  if (rng.chance(0.6)) metas.push(m("jovens", `Dar minutos a jogadores de até 23 anos (ao menos 4 com 10 jogos por temporada)`, 4, fim));
  return { inicio: t0, fim, metas, avaliacoes: [], saldoInicio: s.clube.saldo };
}
export function planoDe(pacote: PacoteDados, s: SaveTecnico): PlanoDir {
  if (!s.planoDir || s.planoDir.fim < s.temporada) s.planoDir = novoPlano(pacote, s);
  return s.planoDir;
}
/** Fim de temporada: avalia cada meta e devolve o efeito na confiança da diretoria. */
export function avaliarPlano(pacote: PacoteDados, s: SaveTecnico, t: number, r: { pos: number; vaga: boolean; subiu: boolean; titulos: number }): { delta: number; avisos: string[] } {
  const p = planoDe(pacote, s), av: string[] = [];
  let delta = 0;
  const saldoOk = s.clube.saldo >= p.saldoInicio * 0.97;
  for (const m of p.metas) {
    if (m.status !== "andamento") continue;
    if (m.tipo === "posicao" && r.pos <= m.alvo) m.status = "cumprida";
    if (m.tipo === "acesso" && r.subiu) m.status = "cumprida";
    if (m.tipo === "titulo") { m.progresso += r.titulos; if (m.progresso >= m.alvo) m.status = "cumprida"; }
    if (m.tipo === "continental") { m.progresso += r.vaga ? 1 : 0; if (m.alvo === 1 && m.progresso >= 1) m.status = "cumprida"; else if (m.alvo > 1 && !r.vaga) m.status = "falhou"; else if (m.progresso >= m.alvo) m.status = "cumprida"; }
    if (m.tipo === "base") { m.progresso += s.elenco.filter((a) => a.base && a.desde === t).length; if (m.progresso >= m.alvo) m.status = "cumprida"; }
    if (m.tipo === "financas") { if (!saldoOk) m.status = "falhou"; else { m.progresso++; if (m.progresso >= m.alvo) m.status = "cumprida"; } }
    if (m.tipo === "jovens") { const n = s.elenco.filter((a) => a.idade <= 23 && a.jogos >= 10).length; if (n < m.alvo) { m.progresso = Math.max(m.progresso, n); if (t >= m.ate) m.status = "falhou"; } else { m.status = "cumprida"; m.progresso = n; } }
    if (m.status === "andamento" && t >= m.ate) m.status = "falhou";
    if (m.status === "cumprida") { delta += 5; av.push(`Plano da diretoria: meta cumprida (${m.texto.toLowerCase()}).`); }
    if (m.status === "falhou") { delta -= 6; av.push(`Plano da diretoria: meta não cumprida (${m.texto.toLowerCase()}).`); }
  }
  p.saldoInicio = s.clube.saldo;
  const andamento = p.metas.filter((m) => m.status === "andamento").length;
  p.avaliacoes.unshift({ t, delta, texto: delta > 0 ? "A diretoria gostou do rumo do projeto." : delta < 0 ? "A diretoria está preocupada com o projeto." : andamento ? "O projeto segue no caminho." : "Plano encerrado." });
  if (t >= p.fim) av.push(`O plano de ${2026 + p.inicio} a ${2026 + p.fim} terminou: ${p.metas.filter((m) => m.status === "cumprida").length} de ${p.metas.length} metas cumpridas. A diretoria vai apresentar um novo.`);
  return { delta: clamp(delta, -18, 15), avisos: av };
}
