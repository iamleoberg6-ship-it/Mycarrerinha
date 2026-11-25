// Perfil das competições: a história de cada liga e de cada copa, desde o começo do jogo. Maiores campeões, campeões
// de cada ano, artilheiros e garçons (de cada temporada e de todos os tempos), quem mais jogou, recordes de uma temporada,
// os mais jovens (e o mais velho) a marcar, as campanhas recordes, a maior goleada e o maior público.
// As ligas saem da história do mundo (tabela final e números de cada jogador em cada temporada); as copas, do arquivo
// de cada edição (src/historico-copas.ts). O jogador do usuário entra com os números de verdade dele.
import { RNG, clamp } from "./rng.js";
import type { PacoteDados } from "./liga.js";
import { mundo, infoClube, linhasDoClube, statsDaLinha, statsDaLinhaAte, tabelaFinalDe, temporadasFechadas, temporadaDoMundo } from "./mundo.js";
import type { CopaArquivada, LinhaCopa } from "./historico-copas.js";

export interface Nome { nome: string; clubeId: string; valor: number; t?: number; idade?: number; eu?: boolean }
export interface CampeaoAno { t: number; clube: string; vice?: string; pts?: number; placar?: string }
export interface Recorde { titulo: string; texto: string; t?: number; clubeId?: string; eu?: boolean }
export interface PerfilCompeticao {
  nome: string; edicoes: number;
  campeoes: CampeaoAno[]; maiores: { clube: string; titulos: number; anos: number[] }[];
  artilheirosAno: Nome[]; artilheiros: Nome[]; assistentes: Nome[]; jogos: Nome[];
  golsTemp: Nome[]; assistTemp: Nome[]; recordes: Recorde[];
}

const top = <T extends { valor: number }>(l: T[], n: number) => [...l].sort((a, b) => b.valor - a.valor).slice(0, n);
const nomeC = (pacote: PacoteDados, id: string) => infoClube(pacote, id)?.nome ?? id;
const maioresDe = (campeoes: CampeaoAno[]) => {
  const m = new Map<string, number[]>();
  for (const c of campeoes) m.set(c.clube, [...(m.get(c.clube) ?? []), c.t]);
  return [...m].map(([clube, anos]) => ({ clube, titulos: anos.length, anos: anos.sort((a, b) => a - b) })).sort((a, b) => b.titulos - a.titulos || a.anos[0] - b.anos[0]);
};
/** Maior sequência de títulos seguidos. */
function sequencia(campeoes: CampeaoAno[]): { clube: string; n: number; de: number; ate: number } | undefined {
  const l = [...campeoes].sort((a, b) => a.t - b.t);
  let melhor: { clube: string; n: number; de: number; ate: number } | undefined, cur: typeof melhor;
  for (const c of l) {
    cur = cur && cur.clube === c.clube && cur.ate === c.t - 1 ? { ...cur, n: cur.n + 1, ate: c.t } : { clube: c.clube, n: 1, de: c.t, ate: c.t };
    if (!melhor || cur.n > melhor.n) melhor = cur;
  }
  return melhor;
}

/** Uma temporada do jogador do usuário numa liga (o mundo não guarda ele). */
export interface TemporadaEu { nome: string; t: number; clubeId: string; idade: number; j: number; g: number; a: number }

/** Perfil de uma liga. `feitas`: rodadas já jogadas da temporada em curso (entra nos números de todos os tempos). */
export function perfilDaLiga(pacote: PacoteDados, ligaId: string, eu: TemporadaEu[] = [], feitas = 0, nome?: string): PerfilCompeticao {
  const w = mundo(pacote), tAtual = temporadaDoMundo(pacote);
  const fechadas = temporadasFechadas(pacote).filter((t) => tabelaFinalDe(pacote, ligaId, t));
  const clubesEm = (t: number) => (t === tAtual ? (w.liga[ligaId]?.clubes ?? []).map((c) => c.id) : tabelaFinalDe(pacote, ligaId, t)?.o ?? []);
  const campeoes: CampeaoAno[] = fechadas.map((t) => { const tf = tabelaFinalDe(pacote, ligaId, t)!; return { t, clube: tf.o[0], ...(tf.o[1] ? { vice: tf.o[1] } : {}), ...(tf.pts ? { pts: tf.pts[0] } : {}) }; }).filter((c) => c.clube);
  // os números de cada jogador em cada temporada na liga
  const temps: { nome: string; clubeId: string; t: number; idade: number; j: number; g: number; a: number; eu?: boolean }[] = [];
  const anos = [...fechadas, ...(feitas > 0 ? [tAtual] : [])];
  for (const t of anos) for (const cid of clubesEm(t)) for (const { nome: n, x } of linhasDoClube(pacote, cid)) {
    if (x.t !== t) continue;
    const st = t === tAtual ? statsDaLinhaAte(pacote, n, x, feitas) : statsDaLinha(pacote, n, x);
    if (st && st.j > 0) temps.push({ nome: n, clubeId: cid, t, idade: x.idade, j: st.j, g: st.g, a: st.a });
  }
  for (const u of eu) if (u.j > 0 && clubesEm(u.t).includes(u.clubeId)) temps.push({ ...u, eu: true });
  // somas de todos os tempos
  const soma = new Map<string, { nome: string; clubeId: string; g: number; a: number; j: number; eu?: boolean }>();
  for (const x of temps) { const y = soma.get(x.nome) ?? { nome: x.nome, clubeId: x.clubeId, g: 0, a: 0, j: 0, ...(x.eu ? { eu: true } : {}) }; y.g += x.g; y.a += x.a; y.j += x.j; y.clubeId = x.clubeId; soma.set(x.nome, y); }
  const todos = [...soma.values()];
  // artilheiro de cada temporada
  const artilheirosAno: Nome[] = anos.map((t) => { const l = temps.filter((x) => x.t === t).sort((a, b) => b.g - a.g || a.j - b.j)[0]; return l && l.g > 0 ? { nome: l.nome, clubeId: l.clubeId, valor: l.g, t, ...(l.eu ? { eu: true } : {}) } : undefined; }).filter(Boolean).reverse() as Nome[];
  // recordes
  const recordes: Recorde[] = [];
  const mais = (titulo: string, l: typeof temps, f: (x: (typeof temps)[number]) => string) => { const x = l[0]; if (x) recordes.push({ titulo, texto: f(x), t: x.t, clubeId: x.clubeId, ...(x.eu ? { eu: true } : {}) }); };
  const gols = temps.filter((x) => x.g > 0);
  mais("Mais jovem a marcar", [...gols].sort((a, b) => a.idade - b.idade || a.t - b.t), (x) => `${x.nome}, aos ${x.idade} anos (${nomeC(pacote, x.clubeId)})`);
  mais("Mais velho a marcar", [...gols].sort((a, b) => b.idade - a.idade || a.t - b.t), (x) => `${x.nome}, aos ${x.idade} anos (${nomeC(pacote, x.clubeId)})`);
  mais("Mais jovem a jogar", [...temps].sort((a, b) => a.idade - b.idade || a.t - b.t), (x) => `${x.nome}, aos ${x.idade} anos (${nomeC(pacote, x.clubeId)})`);
  // campanhas (só temporadas fechadas, com pontos)
  const linhas = fechadas.flatMap((t) => { const tf = tabelaFinalDe(pacote, ligaId, t)!; return tf.pts ? tf.o.map((clube, i) => ({ t, clube, pos: i + 1, pts: tf.pts![i], gp: tf.gp![i], gc: tf.gc![i] })) : []; });
  const camp = linhas.filter((l) => l.pos === 1);
  const rec = (titulo: string, l: typeof linhas, f: (x: (typeof linhas)[number]) => string) => { if (l[0]) recordes.push({ titulo, texto: f(l[0]), t: l[0].t, clubeId: l[0].clube }); };
  rec("Campeão com mais pontos", [...camp].sort((a, b) => b.pts - a.pts), (x) => `${nomeC(pacote, x.clube)}, ${x.pts} pontos`);
  rec("Campeão com menos pontos", [...camp].sort((a, b) => a.pts - b.pts), (x) => `${nomeC(pacote, x.clube)}, ${x.pts} pontos`);
  rec("Melhor ataque numa temporada", [...linhas].sort((a, b) => b.gp - a.gp), (x) => `${nomeC(pacote, x.clube)}, ${x.gp} gols`);
  rec("Melhor defesa numa temporada", [...linhas].sort((a, b) => a.gc - b.gc), (x) => `${nomeC(pacote, x.clube)}, ${x.gc} gols sofridos`);
  rec("Pior campanha", [...linhas].sort((a, b) => a.pts - b.pts), (x) => `${nomeC(pacote, x.clube)}, ${x.pts} pontos`);
  const porAno = fechadas.map((t) => { const tf = tabelaFinalDe(pacote, ligaId, t)!, n = tf.o.length; return tf.gp ? { t, gols: tf.gp.reduce((a, b) => a + b, 0), jogos: n * (n - 1) } : undefined; }).filter(Boolean) as { t: number; gols: number; jogos: number }[];
  const golAno = [...porAno].sort((a, b) => b.gols / b.jogos - a.gols / a.jogos)[0];
  if (golAno) recordes.push({ titulo: "Temporada com mais gols", texto: `${golAno.gols} gols, ${(golAno.gols / golAno.jogos).toFixed(2).replace(".", ",")} por jogo`, t: golAno.t });
  const seq = sequencia(campeoes);
  if (seq && seq.n >= 2) recordes.push({ titulo: "Mais títulos seguidos", texto: `${nomeC(pacote, seq.clube)}, ${seq.n} seguidos`, t: seq.de, clubeId: seq.clube });
  // maior público: o estádio cheio de um clube grande num jogo grande (estimativa pela capacidade e pela força)
  let pub: { valor: number; t: number; clube: string } | undefined;
  for (const t of anos) for (const id of clubesEm(t)) {
    const i = w.info[id], f = w.clube[id]?.forca ?? 60;
    if (!i?.capacidade) continue;
    const v = Math.round(i.capacidade * clamp(0.62 + (f - 62) / 50, 0.3, 1) * new RNG(`publico-liga|${ligaId}|${t}|${id}`).range(0.94, 1) / 10) * 10;
    if (!pub || v > pub.valor) pub = { valor: v, t, clube: id };
  }
  if (pub) recordes.push({ titulo: "Maior público", texto: `${pub.valor.toLocaleString("pt-BR")} no ${w.info[pub.clube]?.estadio ?? "estádio"} (${nomeC(pacote, pub.clube)} em casa)`, t: pub.t, clubeId: pub.clube });
  const marca = (x: { eu?: boolean }) => (x.eu ? { eu: true } : {});
  return {
    nome: nome ?? ligaId, edicoes: fechadas.length,
    campeoes: [...campeoes].reverse(), maiores: maioresDe(campeoes),
    artilheirosAno,
    artilheiros: top(todos.map((x) => ({ nome: x.nome, clubeId: x.clubeId, valor: x.g, ...marca(x) })), 10).filter((x) => x.valor > 0),
    assistentes: top(todos.map((x) => ({ nome: x.nome, clubeId: x.clubeId, valor: x.a, ...marca(x) })), 10).filter((x) => x.valor > 0),
    jogos: top(todos.map((x) => ({ nome: x.nome, clubeId: x.clubeId, valor: x.j, ...marca(x) })), 10),
    golsTemp: top(temps.map((x) => ({ nome: x.nome, clubeId: x.clubeId, valor: x.g, t: x.t, ...marca(x) })), 5).filter((x) => x.valor > 0),
    assistTemp: top(temps.map((x) => ({ nome: x.nome, clubeId: x.clubeId, valor: x.a, t: x.t, ...marca(x) })), 5).filter((x) => x.valor > 0),
    recordes,
  };
}

/** Perfil de uma copa, a partir das edições arquivadas. */
export function perfilDaCopa(pacote: PacoteDados, nome: string, edicoes: CopaArquivada[]): PerfilCompeticao {
  const ed = [...edicoes].sort((a, b) => a.t - b.t);
  const placar = (e: CopaArquivada) => {
    if (!e.final?.length || !e.campeao) return undefined;
    const g: Record<string, number> = {};
    for (const j of e.final) { g[j.casa] = (g[j.casa] ?? 0) + j.gc; g[j.fora] = (g[j.fora] ?? 0) + j.gf; }
    const pen = e.final.at(-1)!.pen;
    return `${g[e.campeao] ?? 0} × ${g[e.vice ?? ""] ?? 0}${e.final.length > 1 ? " no agregado" : ""}${pen ? " (nos pênaltis)" : ""}`;
  };
  const campeoes: CampeaoAno[] = ed.filter((e) => e.campeao).map((e) => ({ t: e.t, clube: e.campeao!, ...(e.vice ? { vice: e.vice } : {}), ...(placar(e) ? { placar: placar(e) } : {}) }));
  const n = (l: LinhaCopa, t?: number): Nome => ({ nome: l[0], clubeId: l[1], valor: l[2], idade: l[3], ...(t !== undefined ? { t } : {}), ...(l[4] ? { eu: true } : {}) });
  const soma = (k: "art" | "ass") => { const m = new Map<string, Nome>(); for (const e of ed) for (const l of e[k]) { const x = m.get(l[0]) ?? { ...n(l), valor: 0 }; x.valor += l[2]; x.clubeId = l[1]; m.set(l[0], x); } return top([...m.values()], 10); };
  const recordes: Recorde[] = [];
  const reg = (titulo: string, l: (Recorde | undefined)[]) => { const x = l.filter(Boolean)[0]; if (x) recordes.push({ ...x, titulo }); };
  const nomeL = (l: LinhaCopa) => `${l[0]}, aos ${l[3]} anos (${nomeC(pacote, l[1])})`;
  reg("Mais jovem a marcar", [...ed].filter((e) => e.jovemGol).sort((a, b) => a.jovemGol![3] - b.jovemGol![3] || a.t - b.t).map((e) => ({ titulo: "", texto: nomeL(e.jovemGol!), t: e.t, clubeId: e.jovemGol![1], ...(e.jovemGol![4] ? { eu: true } : {}) })));
  reg("Mais jovem a jogar", [...ed].filter((e) => e.jovem).sort((a, b) => a.jovem![3] - b.jovem![3] || a.t - b.t).map((e) => ({ titulo: "", texto: nomeL(e.jovem!), t: e.t, clubeId: e.jovem![1], ...(e.jovem![4] ? { eu: true } : {}) })));
  const dif = (j: { gc: number; gf: number }) => Math.abs(j.gc - j.gf);
  reg("Maior goleada", [...ed].filter((e) => e.goleada).sort((a, b) => dif(b.goleada!) - dif(a.goleada!) || (b.goleada!.gc + b.goleada!.gf) - (a.goleada!.gc + a.goleada!.gf)).map((e) => ({ titulo: "", texto: `${nomeC(pacote, e.goleada!.casa)} ${e.goleada!.gc} × ${e.goleada!.gf} ${nomeC(pacote, e.goleada!.fora)}`, t: e.t })));
  reg("Maior público", [...ed].filter((e) => e.publico).sort((a, b) => b.publico!.valor - a.publico!.valor).map((e) => ({ titulo: "", texto: `${e.publico!.valor.toLocaleString("pt-BR")} no ${e.publico!.estadio} (${nomeC(pacote, e.publico!.casa)} × ${nomeC(pacote, e.publico!.fora)})`, t: e.t, clubeId: e.publico!.casa })));
  const golsEd = [...ed].filter((e) => e.jogos).sort((a, b) => b.gols / b.jogos - a.gols / a.jogos)[0];
  if (golsEd) recordes.push({ titulo: "Edição com mais gols", texto: `${golsEd.gols} gols em ${golsEd.jogos} jogos (${(golsEd.gols / golsEd.jogos).toFixed(2).replace(".", ",")} por jogo)`, t: golsEd.t });
  const seq = sequencia(campeoes);
  if (seq && seq.n >= 2) recordes.push({ titulo: "Mais títulos seguidos", texto: `${nomeC(pacote, seq.clube)}, ${seq.n} seguidos`, t: seq.de, clubeId: seq.clube });
  const temps = ed.flatMap((e) => e.art.map((l) => n(l, e.t)));
  return {
    nome, edicoes: ed.length, campeoes: [...campeoes].reverse(), maiores: maioresDe(campeoes),
    artilheirosAno: [...ed].reverse().filter((e) => e.art[0]).map((e) => n(e.art[0], e.t)),
    artilheiros: soma("art"), assistentes: soma("ass"), jogos: [],
    golsTemp: top(temps, 5), assistTemp: top(ed.flatMap((e) => e.ass.map((l) => n(l, e.t))), 5), recordes,
  };
}
