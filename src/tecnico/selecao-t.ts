// Técnico de seleção (junto com o clube, como já aconteceu no futebol de verdade): a federação faz a proposta pela sua
// reputação, você convoca 23 jogadores do país (do mundo inteiro e do seu elenco), escolhe a formação, o estilo e quem
// é titular, e joga as datas FIFA (eliminatórias ou amistosos), a Copa do Mundo, o torneio continental e a Finalíssima.
// A federação cobra uma meta pelo tamanho da seleção; com resultado ruim, demite. O contrato vai até a próxima Copa.
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { forcaDoElenco } from "../liga.js";
import { mundo, selecaoDe, todasSelecoes, idSelecao, temSelecao, infoClube } from "../mundo.js";
import {
  novaCopa, rodarSemana, confederacao, ehCopaDoMundo, ehTorneioContinental, ehFinalissima, TORNEIO_DA_CONF, COPAS, NOME_FASE,
  type CopaId, type EstadoCopa, type TorneioId,
} from "../copas.js";
import { participantesCopa, participantesTorneio } from "../selecoes-copas.js";
import { figurinhaLivre } from "../figurinhas.js";
import type { PosT } from "./modelo.js";
import { ovrDe } from "./modelo.js";
import type { SaveTecnico } from "./motor.js";
import { ANO_INICIAL_T } from "./motor.js";

export type Formacao = "4-3-3" | "4-4-2" | "4-2-3-1" | "3-5-2";
export const FORMACOES_SEL: Record<Formacao, Partial<Record<PosT, number>>> = {
  "4-3-3": { GOL: 1, ZAG: 2, LAT: 2, VOL: 1, MEI: 2, PON: 2, ATA: 1 },
  "4-4-2": { GOL: 1, ZAG: 2, LAT: 2, VOL: 2, MEI: 2, ATA: 2 },
  "4-2-3-1": { GOL: 1, ZAG: 2, LAT: 2, VOL: 2, MEI: 1, PON: 2, ATA: 1 },
  "3-5-2": { GOL: 1, ZAG: 3, LAT: 2, VOL: 1, MEI: 2, ATA: 2 },
};
export type Estilo = "ofensivo" | "equilibrado" | "defensivo";
export const POS_ORDEM: PosT[] = ["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"];
const COTA: Record<PosT, number> = { GOL: 3, ZAG: 4, LAT: 3, VOL: 3, MEI: 3, PON: 3, ATA: 3 };

export interface Candidato { chave: string; nome: string; clubeId: string; pos: PosT; ovr: number; idade: number; /** id no seu elenco, se for do seu clube */ meu?: string }
export interface JogoSel { t: number; semana: number; copa: CopaId; fase: string; casa: string; fora: string; gc: number; gf: number; penaltis?: string; gols: string[] }
export interface SelecaoT {
  pais: string; id: string; desde: number; ate: number; salario: number; confianca: number;
  convocados: string[]; titulares: string[]; formacao: Formacao; estilo: Estilo; entrosamento: number; ultimoOnze?: string[];
  stats: { j: number; v: number; e: number; d: number; gp: number; gc: number };
  jog: Record<string, { nome: string; pos: PosT; j: number; g: number; a: number }>;
  jogos: JogoSel[]; copas?: Partial<Record<CopaId, EstadoCopa>>; copasT?: number;
  /** pontos das eliminatórias no ciclo (vale a vaga na Copa) */ elim: { p: number; j: number };
  titulos: { t: number; id: CopaId; nome: string }[]; avaliadas: string[]; avisos?: string[];
}
export interface OfertaSel { pais: string; salario: number; texto: string; expira: number }
const semanaAbs = (s: SaveTecnico) => s.temporada * 60 + s.semana;
const forcaNat = (pacote: PacoteDados, pais: string) => selecaoDe(pacote, pais)?.forca ?? 70;
const nomePais = (pacote: PacoteDados, pais: string) => infoClube(pacote, idSelecao(pais))?.nome ?? pais;
const SEM_ART = new Set(["GHA", "HON", "POR", "CMR"]), PLURAL = new Set(["USA", "UAE"]);
/** Artigo do país: "o Brasil", "a Argentina", "os Estados Unidos", "Portugal". */
export function artigo(pacote: PacoteDados, pais: string): { o: string; de: string; em: string; fem: boolean } {
  const n = nomePais(pacote, pais);
  if (SEM_ART.has(pais)) return { o: n, de: `de ${n}`, em: `em ${n}`, fem: false };
  if (PLURAL.has(pais)) return { o: `os ${n}`, de: `dos ${n}`, em: `nos ${n}`, fem: false };
  const fem = /a$/.test(n) || /^(Costa|Coreia|Arábia|Nova|África)/.test(n);
  return fem ? { o: `a ${n}`, de: `da ${n}`, em: `na ${n}`, fem } : { o: `o ${n}`, de: `do ${n}`, em: `no ${n}`, fem };
}
/** Reputação que a federação pede (a seleção forte quer nome). */
export const exigenciaSel = (forca: number) => Math.round(clamp((forca - 55) * 2.3, 25, 92));
export const salarioSel = (forca: number) => Math.round((60000 + Math.pow(Math.max(0, forca - 60), 2) * 1300) / 1000) * 1000;
/** Próxima temporada de Copa do Mundo (o contrato vai até ela). */
export function proximaCopa(t: number) { let x = t; while (!ehCopaDoMundo(x)) x++; return x; }

// ------------------------------------------------------------------ elenco possível
/** Todos os jogadores do país que dá para convocar: os do mundo (menos o seu clube, que vem do seu elenco de verdade) e os do seu elenco. */
export function poolSel(pacote: PacoteDados, s: SaveTecnico, pais: string): Candidato[] {
  const w = mundo(pacote), out: Candidato[] = [], vistos = new Set<string>();
  for (const l of [...w.ligas, w.liga.CONV].filter(Boolean)) for (const c of l.clubes) {
    if (c.id === s.clubeId) continue;
    for (const j of c.elenco) if (j.nacionalidade === pais && j.idade >= 17) { const k = `${j.nome}|${c.id}`; if (!vistos.has(k)) { vistos.add(k); out.push({ chave: k, nome: j.nome, clubeId: c.id, pos: j.posicao as PosT, ovr: j.ovr, idade: j.idade }); } }
  }
  for (const a of s.elenco) if (a.nac === pais) out.push({ chave: `${a.nome}|${s.clubeId}`, nome: a.nome, clubeId: s.clubeId, pos: a.pos, ovr: ovrDe(a), idade: a.idade, meu: a.id });
  // país com pouca gente no mundo do jogo: entram os da seleção (completada com nomes do país)
  const sel = selecaoDe(pacote, pais);
  for (const j of sel?.elenco ?? []) if (!out.some((x) => x.nome === j.nome)) out.push({ chave: `${j.nome}|${idSelecao(pais)}`, nome: j.nome, clubeId: idSelecao(pais), pos: j.posicao as PosT, ovr: j.ovr, idade: j.idade });
  return out.sort((a, b) => b.ovr - a.ovr);
}
/** Os 23 melhores pela cota de cada posição (3 goleiros, 4 zagueiros...), mais o melhor que sobrou. */
export function convocarMelhores(pool: Candidato[]): string[] {
  const l: string[] = [], quer = { ...COTA };
  for (const c of pool) if (quer[c.pos] > 0) { l.push(c.chave); quer[c.pos]--; }
  const extra = pool.find((c) => c.pos !== "GOL" && !l.includes(c.chave));
  if (extra) l.push(extra.chave);
  return l;
}
export const convocadosDe = (pacote: PacoteDados, s: SaveTecnico): Candidato[] => {
  const sel = s.selecao!, pool = poolSel(pacote, s, sel.pais), m = new Map(pool.map((c) => [c.chave, c]));
  return sel.convocados.map((k) => m.get(k)).filter((c): c is Candidato => !!c);
};
/** O time titular: primeiro quem você marcou como titular (na posição dele), depois os melhores; vaga sem gente da posição vai a improvisado. */
export function onzeSel(conv: Candidato[], sel: Pick<SelecaoT, "formacao" | "titulares">): { c: Candidato; vaga: PosT; improvisado: boolean }[] {
  const vagas = FORMACOES_SEL[sel.formacao], usados = new Set<string>(), xi: { c: Candidato; vaga: PosT; improvisado: boolean }[] = [];
  const disp = conv.filter((c) => !(c.meu && false));
  for (const p of POS_ORDEM) {
    const n = vagas[p] ?? 0;
    const ordem = disp.filter((c) => c.pos === p && !usados.has(c.chave)).sort((a, b) => Number(sel.titulares.includes(b.chave)) - Number(sel.titulares.includes(a.chave)) || b.ovr - a.ovr);
    for (const c of ordem.slice(0, n)) { usados.add(c.chave); xi.push({ c, vaga: p, improvisado: false }); }
  }
  for (const p of POS_ORDEM) {
    const falta = (vagas[p] ?? 0) - xi.filter((x) => x.vaga === p).length;
    for (let i = 0; i < falta; i++) {
      const c = disp.filter((x) => !usados.has(x.chave) && x.pos !== "GOL" && p !== "GOL").sort((a, b) => b.ovr - a.ovr)[0] ?? disp.find((x) => !usados.has(x.chave));
      if (c) { usados.add(c.chave); xi.push({ c, vaga: p, improvisado: true }); }
    }
  }
  return xi;
}
/** Força do seu time em campo (na régua das seleções do mundo), sem o estilo. */
export function forcaMinhaSel(pacote: PacoteDados, s: SaveTecnico): { forca: number; onze: ReturnType<typeof onzeSel>; base: number } {
  const sel = s.selecao!, conv = convocadosDe(pacote, s), xi = onzeSel(conv, sel);
  const media = (l: ReturnType<typeof onzeSel>) => { const n = l.map((x) => x.c.ovr - (x.improvisado ? 9 : 0)); return n.length ? n.reduce((a, b) => a + b, 0) / n.length - (11 - n.length) * 3 : 50; };
  // a régua é a mesma das outras seleções (os melhores da lista); perde quem escala pior do que o melhor time possível com a lista
  const base = forcaDoElenco(conv.map((c) => ({ posicao: c.pos, ovr: c.ovr })));
  const ideal = Math.max(...(Object.keys(FORMACOES_SEL) as Formacao[]).map((f) => media(onzeSel(conv, { formacao: f, titulares: [] }))));
  const ent = (sel.entrosamento - 50) / 20, rep = (s.tecnico.reputacao - 50) / 40;
  return { forca: base + (media(xi) - ideal) + ent + rep, onze: xi, base };
}
/** O estilo pesa contra quem você enfrenta: ofensivo rende contra time mais fraco, defensivo segura o mais forte. */
export function bonusEstilo(estilo: Estilo, fMe: number, fAdv: number): number {
  if (estilo === "ofensivo") return fMe >= fAdv ? 1.2 : -0.8;
  if (estilo === "defensivo") return fMe < fAdv ? 1.2 : -0.8;
  return 0;
}

// ------------------------------------------------------------------ calendário
/** As competições da seleção na temporada (montadas no começo dela, ou quando você assume). */
export function copasSel(pacote: PacoteDados, s: SaveTecnico): Partial<Record<CopaId, EstadoCopa>> {
  const sel = s.selecao!;
  if (sel.copas && sel.copasT === s.temporada) return sel.copas;
  const t = s.temporada, w = mundo(pacote), meu = sel.id, conf = confederacao(sel.pais);
  const forca = (id: string) => w.clube[id]?.forca ?? 65, paisDe = (id: string) => w.clube[id]?.pais ?? "", confDe = (id: string) => confederacao(paisDe(id));
  const copas: Partial<Record<CopaId, EstadoCopa>> = {};
  // datas FIFA: eliminatórias nos anos sem Copa, amistosos no ano dela
  const elim = !ehCopaDoMundo(t), rs = new RNG(`${s.semente}|datasT|${t}|${sel.pais}`);
  const cand = todasSelecoes(pacote).filter((x) => x.pais !== sel.pais && (!elim || confederacao(x.pais) === conf));
  const advs = rs.shuffle([...cand].sort((a, b) => Math.abs(a.forca - forca(meu)) - Math.abs(b.forca - forca(meu))).slice(0, 8)).slice(0, 3).map((x) => x.id);
  if (advs.length === 3) { const e = novaCopa("SEL", t, [meu, ...advs], forca, paisDe, () => "", s.semente); for (const j of e.jogos) j.fase = elim ? "eliminatorias" : "amistoso"; copas.SEL = e; }
  // Copa do Mundo: a vaga sai das eliminatórias do ciclo
  if (ehCopaDoMundo(t)) {
    let ps = participantesCopa(pacote, t);
    const ppj = sel.elim.j ? sel.elim.p / sel.elim.j : -1, dentro = ps.includes(meu);
    if (ppj >= 0 && ppj < 1.1 && dentro) { const sub = todasSelecoes(pacote).filter((x) => confederacao(x.pais) === conf && !ps.includes(x.id)).sort((a, b) => b.forca - a.forca)[0]; ps = ps.map((x) => (x === meu ? sub?.id ?? x : x)); }
    if (ppj >= 1.5 && !dentro) { const fora = ps.filter((x) => confDe(x) === conf).sort((a, b) => forca(a) - forca(b))[0] ?? ps[ps.length - 1]; ps = ps.map((x) => (x === fora ? meu : x)); }
    if (ps.includes(meu)) copas.COP = novaCopa("COP", t, ps.sort((a, b) => forca(b) - forca(a)), forca, paisDe, confDe, s.semente);
    else if (!sel.avaliadas.includes(`${t}-fora`)) {
      // fora da Copa: a federação não perdoa (menos para seleção pequena, que já não era favorita)
      sel.avaliadas.push(`${t}-fora`);
      const pequena = (w.clube[meu]?.forca ?? 70) < 76;
      sel.confianca = clamp(sel.confianca - (pequena ? 12 : 30), 0, 100);
      (sel.avisos ??= []).push(`Sem vaga na Copa do Mundo: ${artigo(pacote, sel.pais).o} ficou fora pelas eliminatórias (${sel.elim.p} pontos em ${sel.elim.j} jogos). A federação está furiosa.`);
    }
  }
  // torneio continental (Eurocopa, Copa América...)
  const tid = TORNEIO_DA_CONF[conf] as TorneioId | undefined;
  if (tid && ehTorneioContinental(t)) { const ps = participantesTorneio(pacote, tid, t); if (ps.includes(meu)) copas[tid] = novaCopa(tid, t, ps, forca, paisDe, confDe, s.semente); }
  // Finalíssima: campeão da Eurocopa contra o da Copa América (se você ganhou um deles)
  if (ehFinalissima(t)) { const ult = sel.titulos.filter((x) => x.t === t - 1 && (x.id === "EUR" || x.id === "AME")); if (ult.length) { const outro = todasSelecoes(pacote).filter((x) => confederacao(x.pais) !== conf && (confederacao(x.pais) === "UEFA" || confederacao(x.pais) === "CONMEBOL")).sort((a, b) => b.forca - a.forca)[0]; if (outro) copas.FIN = novaCopa("FIN", t, [meu, outro.id], forca, paisDe, confDe, s.semente); } }
  // assumiu com a temporada andando: as semanas que passaram são simuladas
  for (const e of Object.values(copas)) for (let sem = 0; sem < s.semana && e; sem++) rodarSemana(e, sem, forca, new RNG(`${s.semente}|selT-atraso|${e.id}|${t}|${sem}`));
  sel.copas = copas; sel.copasT = t;
  return copas;
}
/** O próximo jogo da seleção (para a tela inicial). */
export function proximoJogoSel(pacote: PacoteDados, s: SaveTecnico) {
  if (!s.selecao) return undefined;
  const id = s.selecao.id, js = Object.values(copasSel(pacote, s)).flatMap((e) => (e?.jogos ?? []).filter((j) => j.gc === undefined && (j.casa === id || j.fora === id)).map((j) => ({ e: e!, j })));
  return js.sort((a, b) => a.j.semana - b.j.semana)[0];
}
export const selPendente = (s: SaveTecnico) => !!s.selecao?.copas && s.selecao.copasT === s.temporada && Object.values(s.selecao.copas).some((e) => e && e.fase !== "fim" && e.jogos.some((j) => j.gc === undefined && (j.casa === s.selecao!.id || j.fora === s.selecao!.id)));

// ------------------------------------------------------------------ a semana
const PESO_GOL: Record<PosT, number> = { ATA: 5, PON: 3.4, MEI: 2.4, VOL: 0.9, LAT: 0.6, ZAG: 0.6, GOL: 0 };
const PESO_ASS: Record<PosT, number> = { ATA: 1.6, PON: 3, MEI: 3.4, VOL: 1.2, LAT: 1.6, ZAG: 0.3, GOL: 0.05 };
const FASE_NUM: Record<string, number> = { liga: 0, grupos: 0, "16avos": 0.5, oitavas: 1, quartas: 2, semi: 3, final: 4 };
const META_TXT = ["passar da fase de grupos", "chegar às oitavas", "chegar às quartas", "chegar à semifinal", "chegar à final", "ser campeão"];
/** A meta da federação num torneio, pela força da seleção entre os participantes. */
export function metaNoTorneio(pacote: PacoteDados, e: EstadoCopa, meu: string): number {
  const w = mundo(pacote), ord = [...e.clubes].sort((a, b) => (w.clube[b]?.forca ?? 0) - (w.clube[a]?.forca ?? 0)), f = (ord.indexOf(meu) + 1) / e.clubes.length;
  return f <= 0.07 ? 4 : f <= 0.13 ? 3 : f <= 0.26 ? 2 : f <= 0.5 ? 1 : 0;
}
export const textoMeta = (n: number) => META_TXT[clamp(n, 0, 5)];

export function semanaSelecao(pacote: PacoteDados, s: SaveTecnico, nota: (t: string) => void) {
  const sel = s.selecao;
  if (!sel) return;
  const w = mundo(pacote), copas = copasSel(pacote, s), meu = sel.id;
  for (const t of sel.avisos ?? []) nota(t);
  sel.avisos = undefined;
  // aviso na semana anterior à data FIFA
  const prox = proximoJogoSel(pacote, s);
  if (prox && prox.j.semana === s.semana + 1) nota(`Convocação ${artigo(pacote, sel.pais).de}: o jogo contra ${infoClube(pacote, prox.j.casa === meu ? prox.j.fora : prox.j.casa)?.nome ?? "o adversário"} é na semana que vem. Confira a lista em Liga → Seleção.`);
  const meus = Object.values(copas).flatMap((e) => (e?.jogos ?? []).filter((j) => j.semana === s.semana && j.gc === undefined && (j.casa === meu || j.fora === meu)).map((j) => ({ e: e!, j })));
  // a lista precisa estar completa no dia do jogo
  if (meus.length && sel.convocados.length < 23) { sel.convocados = convocarMelhores(poolSel(pacote, s, sel.pais)); nota("A lista estava incompleta: o seu auxiliar completou a convocação com os melhores disponíveis."); }
  const fm = meus.length ? forcaMinhaSel(pacote, s) : undefined;
  for (const e of Object.values(copas)) {
    if (!e || e.fase === "fim") continue;
    const jm = meus.find((x) => x.e === e)?.j, adv = jm ? (jm.casa === meu ? jm.fora : jm.casa) : "", fAdv = w.clube[adv]?.forca ?? 65;
    const fMe = fm ? fm.forca + bonusEstilo(sel.estilo, fm.forca, fAdv) : 0;
    const forca = (id: string) => (id === meu && fm ? fMe : w.clube[id]?.forca ?? 65);
    const antesFim = e.fase;
    rodarSemana(e, s.semana, forca, new RNG(`${s.semente}|selT|${e.id}|${s.temporada}|${s.semana}`));
    if (jm && fm) registrarJogo(pacote, s, e, jm, fm.onze, fMe, fAdv, nota);
    if (antesFim !== "fim" && e.fase === "fim" && e.clubes.includes(meu)) fimDoTorneio(pacote, s, e, nota);
    else if (e.id !== "SEL" && e.clubes.includes(meu) && e.fase !== "fim" && !vivo(e, meu) && !sel.avaliadas.includes(`${s.temporada}-${e.id}`)) fimDoTorneio(pacote, s, e, nota);
  }
  // entrosamento: repetir a base sobe, mexer muito derruba
  if (fm) {
    const onze = fm.onze.map((x) => x.c.chave), rep = sel.ultimoOnze ? onze.filter((k) => sel.ultimoOnze!.includes(k)).length : 0;
    sel.entrosamento = clamp(sel.entrosamento + (rep >= 8 ? 6 : rep >= 6 ? 2 : -5), 25, 90); sel.ultimoOnze = onze;
  }
  if (sel.confianca < 18 && s.selecao) {
    nota(`A federação demitiu você ${artigo(pacote, sel.pais).de}. Os resultados não convenceram.`);
    s.tecnico.reputacao = clamp(s.tecnico.reputacao - 4, 0, 100); s.selecao = undefined;
  }
}
const vivo = (e: EstadoCopa, id: string) => {
  if (e.fase === "fim") return false;
  const jg = e.jogos.filter((j) => j.casa === id || j.fora === id);
  if (jg.some((j) => j.gc === undefined)) return true;
  return e.fase === "grupos" || e.fase === "liga";
};
function registrarJogo(pacote: PacoteDados, s: SaveTecnico, e: EstadoCopa, j: EstadoCopa["jogos"][number], onze: ReturnType<typeof onzeSel>, fMe: number, fAdv: number, nota: (t: string) => void) {
  const sel = s.selecao!, meu = sel.id, casa = j.casa === meu, gm = casa ? j.gc! : j.gf!, gs = casa ? j.gf! : j.gc!;
  const rng = new RNG(`${s.semente}|selGols|${s.temporada}|${s.semana}|${e.id}`), gols: string[] = [];
  const sorteia = (pesos: Record<PosT, number>, sem?: string) => { const l = onze.filter((x) => x.c.chave !== sem), tot = l.reduce((a, x) => a + pesos[x.vaga] * Math.max(1, x.c.ovr - 55), 0); let r = rng.next() * tot; for (const x of l) { r -= pesos[x.vaga] * Math.max(1, x.c.ovr - 55); if (r <= 0) return x; } return l[0]; };
  for (const x of onze) { const st = (sel.jog[x.c.chave] ??= { nome: x.c.nome, pos: x.c.pos, j: 0, g: 0, a: 0 }); st.j++; }
  for (let i = 0; i < gm; i++) {
    const autor = sorteia(PESO_GOL); if (!autor) break;
    sel.jog[autor.c.chave].g++; gols.push(autor.c.nome);
    if (rng.chance(0.72)) { const as = sorteia(PESO_ASS, autor.c.chave); if (as) sel.jog[as.c.chave].a++; }
  }
  const st = sel.stats; st.j++; st.gp += gm; st.gc += gs;
  const venceu = gm > gs || (gm === gs && j.penaltis === meu), perdeu = gm < gs || (gm === gs && j.penaltis !== undefined && j.penaltis !== meu);
  if (gm > gs) st.v++; else if (gm < gs) st.d++; else st.e++;
  if (e.id === "SEL" && j.fase === "eliminatorias") { sel.elim.j++; sel.elim.p += gm > gs ? 3 : gm === gs ? 1 : 0; }
  // a federação compara com o esperado (amistoso pesa pouco; torneio pesa mais)
  const esp = 1 / (1 + Math.exp(-(fMe - fAdv) / 6)), r = venceu ? 1 : perdeu ? 0 : 0.5, peso = j.amistoso || j.fase === "amistoso" ? 0.5 : e.id === "SEL" ? 1.2 : 1.5;
  sel.confianca = clamp(sel.confianca + (r - esp) * 10 * peso, 0, 100);
  // os jogadores do seu clube voltam cansados (e às vezes machucados)
  for (const x of onze) if (x.c.meu) { const a = s.elenco.find((y) => y.id === x.c.meu); if (a) { a.condicao = clamp(a.condicao - 12, 0, 100); if (rng.chance(0.03)) { a.lesao = Math.max(a.lesao, rng.int(1, 3)); a.lesaoTipo = "lesão na seleção"; nota(`${a.nome} voltou da seleção machucado.`); } } }
  const adv = infoClube(pacote, casa ? j.fora : j.casa)?.nome ?? "";
  sel.jogos.unshift({ t: s.temporada, semana: s.semana, copa: e.id, fase: j.fase, casa: j.casa, fora: j.fora, gc: j.gc!, gf: j.gf!, ...(j.penaltis ? { penaltis: j.penaltis } : {}), gols });
  sel.jogos = sel.jogos.slice(0, 30);
  const nome = nomePais(pacote, sel.pais), comp = e.id === "SEL" ? NOME_FASE[j.fase] ?? "Data FIFA" : COPAS[e.id].curto;
  nota(`${comp}: ${nome} ${gm} × ${gs} ${adv}${j.penaltis ? ` (${j.penaltis === meu ? "vitória" : "derrota"} nos pênaltis)` : ""}${gols.length ? ` · gols: ${resumo(gols)}` : ""}.`);
}
const resumo = (g: string[]) => [...new Set(g)].map((n) => { const k = g.filter((x) => x === n).length; return k > 1 ? `${n} (${k})` : n; }).join(", ");
/** Fim de torneio (ou eliminação): compara com a meta, título vira troféu e figurinha. */
function fimDoTorneio(pacote: PacoteDados, s: SaveTecnico, e: EstadoCopa, nota: (t: string) => void) {
  const sel = s.selecao!, meu = sel.id, chave = `${s.temporada}-${e.id}`;
  if (sel.avaliadas.includes(chave)) return;
  sel.avaliadas.push(chave);
  if (e.id === "SEL") return;
  const nome = nomePais(pacote, sel.pais), info = COPAS[e.id], campeao = e.campeao === meu;
  const chegou = campeao ? 5 : FASE_NUM[e.chegou[meu] ?? "grupos"] ?? 0, meta = e.id === "FIN" ? 5 : metaNoTorneio(pacote, e, meu), peso = e.id === "COP" ? 1.6 : e.id === "FIN" ? 0.7 : 1;
  if (campeao) {
    sel.titulos.push({ t: s.temporada, id: e.id, nome: info.nome });
    (s.titulosCopa ??= []).push({ t: s.temporada, id: e.id, nome: info.nome, clubeId: meu });
    s.tecnico.reputacao = clamp(s.tecnico.reputacao + Math.round(10 * peso), 0, 100); sel.confianca = clamp(sel.confianca + 25 * peso, 0, 100);
    nota(`🏆 ${nome.toUpperCase()} ${artigo(pacote, sel.pais).fem ? "CAMPEÃ" : "CAMPEÃO"} ${info.prep.toUpperCase()} ${info.nome.toUpperCase()}! Você entra para a história do futebol do país.`);
    const c = infoClube(pacote, meu);
    figurinhaLivre((s.album ??= []), { ano: ANO_INICIAL_T + s.temporada, clubeId: `sel-${sel.pais}`, clube: nome, cores: [c?.cores[0] ?? "#0B7A3B", c?.cores[1] ?? "#F5C400"], numero: "", posicao: "TEC", ovr: Math.round(s.tecnico.reputacao), idade: s.tecnico.idade, jogos: 0, gols: 0, assist: 0, ap: { ...(s.tecnico.aparencia ?? {}) }, tipo: "titulo", raridade: e.id === "COP" ? "lenda" : "brilhante", legenda: `Campeão: ${info.nome}`, chave: `sel-${s.temporada}-${e.id}` });
    return;
  }
  const dif = chegou - meta;
  sel.confianca = clamp(sel.confianca + (dif >= 0 ? 10 + dif * 5 : dif * 8) * peso, 0, 100);
  s.tecnico.reputacao = clamp(s.tecnico.reputacao + Math.round((dif >= 0 ? 2 + dif : dif * 1.5) * peso), 0, 100);
  nota(`${info.nome}: ${artigo(pacote, sel.pais).o} ${chegou >= 4 ? "foi vice" : `caiu ${e.chegou[meu] === "grupos" || !e.chegou[meu] ? "na fase de grupos" : `nas ${NOME_FASE[e.chegou[meu]]?.toLowerCase() ?? "fases finais"}`}`}. A meta era ${textoMeta(meta)}${dif >= 0 ? ": cumprida." : ": a federação ficou insatisfeita."}`);
}

// ------------------------------------------------------------------ emprego
export function novaSelecao(pacote: PacoteDados, s: SaveTecnico, pais: string, salario: number): SelecaoT {
  const sel: SelecaoT = {
    pais, id: idSelecao(pais), desde: s.temporada, ate: proximaCopa(s.semana >= 40 ? s.temporada + 1 : s.temporada), salario, confianca: 60,
    convocados: [], titulares: [], formacao: "4-3-3", estilo: "equilibrado", entrosamento: 45,
    stats: { j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }, jog: {}, jogos: [], elim: { p: 0, j: 0 }, titulos: [], avaliadas: [],
  };
  if (sel.ate === s.temporada && s.semana >= 30) sel.ate = proximaCopa(s.temporada + 1);
  return sel;
}
export function aceitarSelecao(pacote: PacoteDados, s: SaveTecnico): { ok: boolean; msg: string } {
  const of = s.ofertaSel;
  if (!of) return { ok: false, msg: "Não tem proposta." };
  s.selecao = novaSelecao(pacote, s, of.pais, of.salario);
  s.selecao.convocados = convocarMelhores(poolSel(pacote, s, of.pais));
  s.ofertaSel = undefined;
  s.diretoria.confianca = clamp(s.diretoria.confianca - 3, 0, 100);
  s.tecnico.reputacao = clamp(s.tecnico.reputacao + 3, 0, 100);
  const nome = nomePais(pacote, of.pais), c = infoClube(pacote, idSelecao(of.pais));
  figurinhaLivre((s.album ??= []), { ano: ANO_INICIAL_T + s.temporada, clubeId: `sel-${of.pais}`, clube: nome, cores: [c?.cores[0] ?? "#0B7A3B", c?.cores[1] ?? "#F5C400"], numero: "", posicao: "TEC", ovr: Math.round(s.tecnico.reputacao), idade: s.tecnico.idade, jogos: 0, gols: 0, assist: 0, ap: { ...(s.tecnico.aparencia ?? {}) }, tipo: "selecao", raridade: "brilhante", legenda: `Técnico da seleção · ${nome}`, chave: `tec-${of.pais}-${s.temporada}` });
  return { ok: true, msg: `Você é o novo técnico ${artigo(pacote, of.pais).de}! Contrato até a Copa de ${ANO_INICIAL_T + s.selecao.ate}. A diretoria do clube aceitou dividir você, mas não gostou muito.` };
}
export function deixarSelecao(pacote: PacoteDados, s: SaveTecnico): { ok: boolean; msg: string } {
  if (!s.selecao) return { ok: false, msg: "Você não treina seleção." };
  const em = artigo(pacote, s.selecao.pais).em;
  s.selecao = undefined;
  s.diretoria.confianca = clamp(s.diretoria.confianca + 2, 0, 100);
  return { ok: true, msg: `Você entregou o cargo ${em}. A diretoria do clube gostou de ter você só para ela.` };
}
/** Lista das seleções para a página de empregos: força, exigência e se você caberia. */
export function listaSelecoes(pacote: PacoteDados, s: SaveTecnico) {
  return todasSelecoes(pacote).map((c) => ({ pais: c.pais, id: c.id, nome: c.nome, forca: c.forca, exige: exigenciaSel(c.forca), salario: salarioSel(c.forca), cabe: s.tecnico.reputacao + (s.tecnico.prestigio ?? 0) / 10 >= exigenciaSel(c.forca), interesse: s.interesseSel === c.pais }))
    .sort((a, b) => b.forca - a.forca);
}
export function declararInteresseSel(pacote: PacoteDados, s: SaveTecnico, pais: string): { ok: boolean; msg: string } {
  if (s.selecao) return { ok: false, msg: "Você já treina uma seleção." };
  s.interesseSel = pais;
  return { ok: true, msg: `O seu empresário avisou a federação ${temSelecao(pais) ? artigo(pacote, pais).de : ""} que você topa. Se o cargo abrir e você tiver nome, ela liga.` };
}
/** Virada de temporada: contrato que acaba, e talvez uma proposta (mais chance no fim do ciclo da Copa). */
export function viradaSelecao(pacote: PacoteDados, s: SaveTecnico, tAntes: number, nota: (t: string) => void) {
  const sel = s.selecao;
  if (sel) {
    if (ehCopaDoMundo(tAntes)) sel.elim = { p: 0, j: 0 };
    if (tAntes >= sel.ate) {
      if (sel.confianca >= 55) { sel.ate = proximaCopa(tAntes + 1); nota(`A federação renovou com você ${artigo(pacote, sel.pais).em} até a Copa de ${ANO_INICIAL_T + sel.ate}.`); }
      else { nota(`Acabou o seu ciclo ${artigo(pacote, sel.pais).em}: a federação não renovou.`); s.selecao = undefined; }
    }
    return;
  }
  if (s.ofertaSel && s.ofertaSel.expira <= semanaAbs(s)) s.ofertaSel = undefined;
  if (s.ofertaSel) return;
  const rng = new RNG(`${s.semente}|ofertaSel|${tAntes}`), lst = listaSelecoes(pacote, s).filter((x) => x.cabe);
  if (!lst.length) return;
  const chance = (ehCopaDoMundo(tAntes) ? 0.45 : 0.18) + (s.interesseSel ? 0.15 : 0) + (s.tecnico.reputacao >= 80 ? 0.1 : 0);
  if (!rng.chance(chance)) return;
  const pesos = lst.map((x) => (x.pais === s.tecnico.nac ? 4 : 1) * (x.interesse ? 5 : 1) * (1 + (x.forca - 60) / 20));
  let r = rng.next() * pesos.reduce((a, b) => a + b, 0), esc = lst[0];
  for (let i = 0; i < lst.length; i++) { r -= pesos[i]; if (r <= 0) { esc = lst[i]; break; } }
  s.ofertaSel = { pais: esc.pais, salario: esc.salario, expira: semanaAbs(s) + 6, texto: esc.pais === s.tecnico.nac ? "A federação do seu país quer você no comando. Dá para seguir no clube ao mesmo tempo." : `A federação ${artigo(pacote, esc.pais).de} procura técnico e lembrou do seu trabalho. Dá para seguir no clube ao mesmo tempo.` };
  s.interesseSel = undefined;
  nota(`Proposta para treinar a seleção: ${esc.nome}! Veja na tela inicial.`);
}
