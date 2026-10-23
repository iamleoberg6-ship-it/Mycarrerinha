// O mundo anda: a cada temporada todo jogador fica um ano mais velho, evolui (jovem) ou cai (veterano), alguns se
// aposentam, a base de cada clube revela garotos, os craques dos clubes pequenos são vendidos aos grandes e quem sobra
// procura clube. Tudo sorteado pela semente da carreira: a mesma carreira sempre vê o mesmo mundo.
//
// A base de cada clube (15 a 19 anos) é gerada pelo nível do clube:
//  - estrutura (1–5, pela força do clube): talento médio dos garotos e o quanto evoluem;
//  - cultura de base (1–5, src/identidade.ts): talento, evolução e quantos sobem por temporada;
//  - escola do país: Brasil, Argentina, França, Espanha, Portugal revelam mais.
import { RNG, clamp } from "./rng.js";
import { forcaDoElenco, type Clube, type JogadorNPC } from "./liga.js";
import { culturaBase } from "./identidade.js";
import { gerarNome, nacionalidadeEstrangeira, FATIA_ESTRANGEIRA } from "./nomes.js";
import { VAGAS_433 } from "./partida.js";
import { numerosDoClube, numeroParaChegada, limparNumeros } from "./numeros.js";
import { valorMercado } from "./mercado.js";
import { LIGA_INFO } from "./ligas.js";

type Pos = JogadorNPC["posicao"];
const POSICOES: Pos[] = ["GOL", "ZAG", "LAT", "VOL", "MEI", "PON", "ATA"];
const VAGAS: Record<Pos, number> = { GOL: 1, ...VAGAS_433 };
/** mínimos por posição num elenco profissional */
const MINIMO: Record<Pos, number> = { GOL: 2, ZAG: 3, LAT: 2, VOL: 2, MEI: 2, PON: 2, ATA: 2 };
/** como a base de 25 se divide */
const ALVO_BASE: Record<Pos, number> = { GOL: 3, ZAG: 5, LAT: 4, VOL: 3, MEI: 4, PON: 3, ATA: 3 };
const GAP_IDADE: Record<number, number> = { 14: 26, 15: 24, 16: 21, 17: 18, 18: 14, 19: 11 };

const SUL = new Set(["BRA", "ARG", "URU", "COL", "CHI", "PAR", "ECU", "PER", "BOL", "VEN"]);
const VIZINHOS = ["ARG", "URU", "COL", "CHI", "PAR", "ECU", "BRA"];
// continente de cada nacionalidade (para a afinidade de quem contrata)
const CONTINENTE: Record<string, string> = {};
for (const [k, l] of Object.entries({
  SUL: [...SUL],
  NAM: ["USA", "CAN", "MEX", "CRC", "PAN", "HON", "JAM", "SLV", "GUA", "HAI", "TRI", "CUW", "SUR", "DOM", "CUB"],
  AFR: ["SEN", "CIV", "MLI", "GUI", "CMR", "BFA", "COD", "GAB", "TOG", "BEN", "CGO", "CTA", "NGA", "GHA", "SLE", "LBR", "GAM", "KEN", "ZAM", "ZIM", "RSA", "UGA", "TAN", "ANG", "CPV", "GNB", "MOZ", "MAR", "ALG", "TUN", "EGY", "LBY", "EQG", "MTN", "COM", "BDI", "RWA", "NAM"],
  ASI: ["KSA", "UAE", "QAT", "IRN", "IRQ", "JOR", "SYR", "LBN", "JPN", "KOR", "CHN", "AUS", "THA", "MAS", "IDN", "UZB", "PHI", "SGP", "BAN", "NZL"],
})) for (const n of l) CONTINENTE[n] = k;
const continente = (n: string) => CONTINENTE[n] ?? "EUR";
/**
 * Afinidade de um clube com um jogador: do mesmo país pesa mais, do mesmo continente menos, do resto do mundo pouco.
 * Liga que importa muito (Inglaterra, Golfo, Turquia) liga menos para a origem. Quem já joga no país do clube pesa mais.
 */
export function afinidade(paisClube: string, nacionalidade: string, paisOrigem?: string): number {
  const abertura = 0.5 + 2 * (FATIA_ESTRANGEIRA[paisClube] ?? 0.3);
  let w = nacionalidade === paisClube ? 1 : continente(nacionalidade) === continente(paisClube) ? 0.3 * abertura : 0.07 * abertura;
  if (paisOrigem === paisClube) w *= 1.6;
  return w;
}
function sortearPeso<T>(rng: RNG, l: T[], peso: (x: T) => number): T | undefined {
  const ps = l.map(peso), tot = ps.reduce((a, b) => a + b, 0);
  if (!l.length || tot <= 0) return undefined;
  let r = rng.next() * tot;
  for (let i = 0; i < l.length; i++) { r -= ps[i]; if (r <= 0) return l[i]; }
  return l[l.length - 1];
}
const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };

// ------------------------------------------------------------------ nível do clube
export const estruturaPorForca = (f: number) => (f >= 76 ? 5 : f >= 73 ? 4 : f >= 71 ? 3 : f >= 68 ? 2 : 1);
const ESCOLA: Record<string, number> = { BRA: 2, ARG: 2, FRA: 2, ESP: 2, POR: 2, URU: 1.5, NED: 1.5, ENG: 1, GER: 1, ITA: 1, BEL: 1, USA: -1, KSA: -2 };
export interface NivelBase { estrutura: number; cultura: number; escola: number; potMedio: number; fEvolucao: number; maxSobe: number }
/** Nível da base de um clube: talento médio dos garotos, o quanto evoluem e quantos sobem por temporada.
 *  O garoto médio fica abaixo do profissional; só os melhores de cada turma chegam ao nível do time de cima. */
export function nivelBase(clubeId: string, forca: number, pais: string): NivelBase {
  const estrutura = estruturaPorForca(forca), cultura = culturaBase(clubeId), escola = ESCOLA[pais] ?? 0;
  return {
    estrutura, cultura, escola,
    potMedio: forca - 11 + 1.2 * (cultura - 3) + 1.0 * (estrutura - 3) + 0.5 * escola,
    fEvolucao: 0.8 + 0.06 * estrutura + 0.05 * cultura,
    maxSobe: [1, 1, 2, 2, 3][cultura - 1],
  };
}

// ------------------------------------------------------------------ potencial e evolução
/** Potencial de um jogador (os dos elencos reais saem do nome e da idade: sempre o mesmo). */
export function potDe(j: JogadorNPC): number {
  if (j.pot !== undefined) return j.pot;
  const h = (hash(j.nome) % 1000) / 1000;
  const folga = Math.max(0, (24 - j.idade) * 1.4 + h * 6 - 2.5) * (j.ovr >= 80 ? 0.6 : 1);
  j.pot = j.idade <= 23 ? Math.round(clamp(j.ovr + folga, j.ovr, 95)) : j.ovr + (h < 0.3 ? 1 : 0);
  return j.pot;
}
/** Um ano de carreira: jovem cresce rumo ao potencial (mais com estrutura e minutos), veterano cai. Muta o jogador. */
export function evoluirAno(j: JogadorNPC, rng: RNG, f: number) {
  const pot = potDe(j), gol = j.posicao === "GOL" ? 2 : 0, a = j.idade - gol;
  let d: number;
  if (j.idade <= 23) {
    const k = j.idade <= 19 ? 0.32 : j.idade <= 21 ? 0.3 : 0.28;
    d = Math.max(0, pot - j.ovr) * k * f + rng.normal(0, 1);
    // nem toda promessa vinga, e tem quem desabroche tarde
    if (rng.chance(0.12)) j.pot = Math.max(j.ovr, pot - rng.int(1, 4));
    else if (rng.chance(0.06)) j.pot = Math.min(95, pot + rng.int(1, 5));
  } else if (a <= 27) d = clamp(pot - j.ovr, 0, 2) * 0.5 + rng.normal(0, 0.8);
  else if (a <= 29) d = -0.3 + rng.normal(0, 0.8);
  else if (a <= 31) d = -1.2 + rng.normal(0, 1);
  else if (a <= 33) d = -2.2 + rng.normal(0, 1.2);
  else d = -3.5 + rng.normal(0, 1.5);
  j.ovr = clamp(Math.round(j.ovr + d), 30, 95);
  j.pot = Math.max(j.pot ?? j.ovr, j.ovr);
  j.idade++;
}

// ------------------------------------------------------------------ geração
/** Garoto da base: potencial pelo nível do clube (com uma joia de vez em quando), OVR pela idade. */
export function gerarJovem(rng: RNG, n: NivelBase, idade: number, posicao: Pos, nacionalidade: string, usados: Set<string>): JogadorNPC {
  let pot = rng.normal(n.potMedio, 5.5);
  if (rng.chance(0.006 + 0.004 * n.cultura + 0.004 * n.estrutura)) pot += rng.int(8, 15);
  pot = Math.round(clamp(pot, 45, 94));
  const ovr = Math.round(clamp(pot - (GAP_IDADE[idade] ?? 10) + rng.normal(0, 2.5), 30, pot));
  return { nome: gerarNome(rng, nacionalidade, usados), posicao, ovr, idade, nacionalidade, pot, base: true };
}
/** Reforço gerado (quando não há ninguém livre do nível certo): já formado, do país da liga ou de fora. */
export function gerarReforco(rng: RNG, ovr: number, posicao: Pos, pais: string, usados: Set<string>, idade = 20 + Math.floor(rng.next() ** 1.4 * 12)): JogadorNPC {
  const fora = rng.chance(FATIA_ESTRANGEIRA[pais] ?? 0.3);
  const nac = fora ? (SUL.has(pais) ? rng.pick(VIZINHOS.filter((x) => x !== pais)) : nacionalidadeEstrangeira(rng, pais)) : pais === "INT" ? "ENG" : pais;
  const o = Math.round(clamp(ovr, 35, 92));
  return { nome: gerarNome(rng, nac, usados), posicao, ovr: o, idade, nacionalidade: nac, pot: idade <= 23 ? o + rng.int(2, 8) : o };
}
const nacDaBase = (rng: RNG, pais: string, estrutura: number) => (rng.chance(SUL.has(pais) ? 0.01 : estrutura >= 5 ? 0.2 : 0.08) ? nacionalidadeEstrangeira(rng, pais) : pais);
/** Posição que mais falta numa lista (para a base e para os reforços). */
function posQueFalta(lista: JogadorNPC[], alvo: Record<Pos, number>, rng: RNG): Pos {
  const falta = POSICOES.map((p) => [p, alvo[p] - lista.filter((j) => j.posicao === p).length] as const).sort((a, b) => b[1] - a[1] || rng.next() - 0.5);
  return falta[0][1] > 0 ? falta[0][0] : rng.pick(POSICOES.filter((p) => p !== "GOL"));
}
/** A base inteira de um clube (começo do jogo): cinco garotos por idade, de 15 a 19 anos. */
export function criarBase(rng: RNG, n: NivelBase, pais: string, usados: Set<string>): JogadorNPC[] {
  const base: JogadorNPC[] = [];
  for (let idade = 15; idade <= 19; idade++) for (let k = 0; k < 5; k++) base.push(gerarJovem(rng, n, idade, posQueFalta(base, ALVO_BASE, rng), nacDaBase(rng, pais, n.estrutura), usados));
  return base;
}

// ------------------------------------------------------------------ virada da temporada
/** `de` ausente num contratado = veio de um clube de fora do jogo. `taxa` 0 = chegou livre. */
export interface Movimento { nome: string; posicao: Pos; numero?: number; ovr: number; idade: number; motivo: "aposentou" | "vendido" | "dispensado" | "subiu" | "contratado"; de?: string; para?: string; taxa?: number }
export interface Referencia { forca: number; top: number; tamanho: number; nivel: NivelBase }
export interface ViradaMundo { saidas: Record<string, Movimento[]>; chegadas: Record<string, Movimento[]>; destaques: Movimento[] }
export interface GruposMundo { pro: Clube[]; convidados: Clube[]; amadores: Clube[]; ligas: Clube[][] }

const titulares = (elenco: JogadorNPC[]) => {
  const t = new Set<JogadorNPC>();
  for (const p of POSICOES) for (const j of elenco.filter((x) => x.posicao === p).sort((a, b) => b.ovr - a.ovr).slice(0, VAGAS[p])) t.add(j);
  return t;
};
/** Faixa de idade dos amadores (colégio americano, universidade, várzea): quem passa da idade sai e entra gente nova. */
function faixaAmadora(id: string): [number, number, number] {
  if (id.startsWith("HS-")) return [14, 15, 18];
  if (id.startsWith("NC-")) return [18, 18, 22];
  return [17, 22, 36]; // várzea: entra entre 17 e 22, para até os 36
}

/**
 * Leva o mundo da temporada t−1 para t. Muta elencos e bases, devolve quem saiu e quem chegou em cada clube.
 * `ref` guarda o tamanho do clube (força e elenco originais): o clube grande continua grande, com outros nomes.
 */
export function virarTemporada(g: GruposMundo, base: Record<string, JogadorNPC[]>, ref: Record<string, Referencia>, semente: string, t: number, usados: Set<string>, meio = false): ViradaMundo {
  // `meio`: janela do meio do ano. Só o mercado (menos negócios) e a reposição; ninguém envelhece nem sobe da base.
  const rngDe = (...p: (string | number)[]) => new RNG(`${semente}|mundo|${t}|${meio ? "meio|" : ""}${p.join("|")}`);
  const saidas: Record<string, Movimento[]> = {}, chegadas: Record<string, Movimento[]> = {}, destaques: Movimento[] = [];
  const mov = (j: JogadorNPC, motivo: Movimento["motivo"], extra: Partial<Movimento> = {}): Movimento => ({ nome: j.nome, posicao: j.posicao, numero: j.numero, ovr: j.ovr, idade: j.idade, motivo, ...extra });
  const sai = (c: Clube, j: JogadorNPC, m: Movimento) => { const i = c.elenco.indexOf(j); if (i < 0) return; c.elenco.splice(i, 1); (saidas[c.id] ??= []).push(m); };
  const rTaxa = rngDe("taxas");
  /** taxa da transferência: o valor de mercado do jogador na liga de quem compra, com a negociação no meio */
  const taxa = (j: JogadorNPC, c: Clube) => g.amadores.includes(c) ? 0 : Math.round(valorMercado(j.ovr, j.idade, 3, LIGA_INFO[c.ligaId]?.fLiga ?? 0.6) * rTaxa.range(0.75, 1.3) / 1e4) * 1e4;
  const chega = (c: Clube, j: JogadorNPC, motivo: Movimento["motivo"], de?: string, valor?: number) => {
    j.numero = numeroParaChegada(c, j.posicao, j.nome, c.elenco.map((x) => x.numero ?? 0)); j.base = undefined;
    c.elenco.push(j); (chegadas[c.id] ??= []).push(mov(j, motivo, { ...(de ? { de } : {}), ...(valor !== undefined ? { taxa: valor } : {}) }));
  };
  const todos = [...g.pro, ...g.convidados, ...g.amadores];
  // números fixos antes de mexer (quem não tinha número oficial guarda o que já usava)
  for (const c of todos) { const nums = numerosDoClube(c); for (const j of c.elenco) j.numero ??= nums.get(j.nome); }

  // 1) um ano a mais para todo mundo; aposentadorias
  for (const c of meio ? [] : todos) {
    const r = rngDe("ano", c.id), tit = titulares(c.elenco), est = ref[c.id]?.nivel.estrutura ?? 2;
    for (const j of [...c.elenco]) evoluirAno(j, r, 0.85 + 0.05 * est + (tit.has(j) ? 0.15 : 0));
    const amador = g.amadores.includes(c), [, , maxIdade] = amador ? faixaAmadora(c.id) : [0, 0, 40];
    for (const j of [...c.elenco]) {
      const longe = j.ovr < c.forca - 12;
      const p = amador ? (j.idade > maxIdade ? 1 : 0) : j.idade >= 39 ? 1 : j.idade >= 34 ? 0.35 + (j.idade - 34) * 0.2 + (longe ? 0.2 : 0) : j.idade === 33 ? 0.15 : j.idade >= 31 && longe ? 0.12 : 0;
      if (p && r.chance(p)) {
        const m = mov(j, amador ? "dispensado" : "aposentou");
        sai(c, j, m);
        if (!amador && j.ovr >= 78) destaques.push({ ...m, de: c.id });
      }
    }
  }

  // 2) bases: um ano a mais, os melhores sobem, quem passou da idade é dispensado, chega a turma nova
  const livres: { j: JogadorNPC; de: string }[] = [];
  const subiram: Record<string, JogadorNPC[]> = {};
  for (const c of meio ? [] : [...g.pro]) {
    const b = base[c.id];
    if (!b) continue;
    const n = ref[c.id].nivel, r = rngDe("base", c.id);
    for (const j of b) evoluirAno(j, r, n.fEvolucao);
    const corte = c.forca - 8 - (n.cultura - 3) * 1.5;
    const candidatos = b.filter((j) => j.idade >= 18 && (j.ovr >= corte || (n.cultura >= 3 && potDe(j) >= c.forca + 3 && j.ovr >= corte - 4))).sort((a, b2) => b2.ovr + potDe(b2) * 0.5 - (a.ovr + potDe(a) * 0.5));
    subiram[c.id] = candidatos.slice(0, n.maxSobe);
    for (const j of subiram[c.id]) b.splice(b.indexOf(j), 1);
    for (const j of b.filter((x) => x.idade >= 20)) { b.splice(b.indexOf(j), 1); if (j.ovr >= 48) livres.push({ j: { ...j, base: undefined }, de: c.id }); }
    for (let k = 0; k < 5 && b.length < 25; k++) b.push(gerarJovem(r, n, 15, posQueFalta(b, ALVO_BASE, r), nacDaBase(r, c.pais, n.estrutura), usados));
  }

  // 3) mercado entre os clubes: craque de clube menor vai para um maior, reserva vai para um menor
  const r3 = rngDe("mercado"), porForca = [...g.pro].sort((a, b) => a.forca - b.forca);
  const vendas: { j: JogadorNPC; de: Clube }[] = [];
  for (const c of g.pro) {
    for (const j of c.elenco) {
      if (j.idade <= 30 && j.ovr >= c.forca + 5 && r3.chance(meio ? 0.1 : 0.3)) vendas.push({ j, de: c });
      else if (j.ovr < c.forca - 6 && r3.chance(meio ? 0.08 : 0.25)) vendas.push({ j, de: c });
    }
  }
  vendas.sort((a, b) => b.j.ovr - a.j.ovr || a.j.nome.localeCompare(b.j.nome));
  for (const { j, de } of vendas) {
    const subindo = j.ovr >= de.forca + 5;
    // qualquer clube do mundo do nível certo; a chance de cada um vem da afinidade com o jogador
    const alvo = porForca.filter((c) => c !== de && c.elenco.length < 32 && (subindo ? c.forca > de.forca && c.forca >= j.ovr - 5 && c.forca <= j.ovr + 1 : c.forca <= j.ovr + 4 && c.forca >= j.ovr - 3));
    if (!alvo.length) { if (!subindo) { sai(de, j, mov(j, "dispensado")); livres.push({ j, de: de.id }); } continue; }
    const para = sortearPeso(r3, alvo, (c) => afinidade(c.pais, j.nacionalidade, de.pais))!;
    const t = taxa(j, para);
    sai(de, j, mov(j, "vendido", { para: para.id, taxa: t }));
    chega(para, j, "contratado", de.id, t);
    if (j.ovr >= 80) destaques.push(mov(j, "vendido", { de: de.id, para: para.id }));
  }

  const paisDe = Object.fromEntries(todos.map((c) => [c.id, c.pais]));
  // reservas de cada clube profissional (fora do time titular), por posição: podem ser contratados por outro clube
  const reservas: Partial<Record<Pos, { j: JogadorNPC; de: Clube }[]>> = {};
  // só quem sobra além dos titulares e do mínimo da posição (levar um deles nunca desmonta o time)
  for (const c of g.pro) for (const p of POSICOES) {
    const fila = c.elenco.filter((j) => j.posicao === p).sort((a, b) => b.ovr - a.ovr);
    for (const j of fila.slice(Math.max(VAGAS[p], MINIMO[p] + 1))) if (j.idade >= 19) (reservas[p] ??= []).push({ j, de: c });
  }
  const tomados = new Set<JogadorNPC>();
  { const rr = rngDe("reservas"); for (const l of Object.values(reservas)) rr.shuffle(l!); }
  // 4) cada clube recompõe o elenco: quem subiu da base, livres do nível certo, reforços gerados; tamanho de antes
  livres.sort((a, b) => b.j.ovr - a.j.ovr);
  for (const c of todos) {
    const rf = ref[c.id], r = rngDe("elenco", c.id), amador = g.amadores.includes(c);
    if (!rf) continue;
    for (const j of subiram[c.id] ?? []) chega(c, j, "subiu");
    const nivelAlvo = rf.forca - 3 + (c.forca - rf.forca) * 0.3; // reforço do tamanho do clube
    const reforco = (pos: Pos) => {
      if (!amador && !g.convidados.includes(c)) {
        // procura no mundo: livres e reservas de outros clubes, do nível certo; a afinidade decide quem vem
        const nivelOk = (j: JogadorNPC) => j.posicao === pos && j.ovr >= nivelAlvo - 6 && j.ovr <= nivelAlvo + 3;
        const cand: { j: JogadorNPC; de?: Clube; livre?: number }[] = [];
        for (let i = 0, achados = 0; i < livres.length && achados < 15; i++) if (nivelOk(livres[i].j)) { cand.push({ j: livres[i].j, livre: i }); achados++; }
        // até 40 candidatos, a partir de um ponto sorteado da lista (a conta fica leve com milhares de reservas no mundo)
        const lr = reservas[pos] ?? [], ini = Math.floor(r.next() * lr.length);
        for (let k = 0, achados = 0; k < lr.length && achados < 40; k++) {
          const o = lr[(ini + k) % lr.length];
          if (nivelOk(o.j) && o.de !== c && !tomados.has(o.j) && o.de.elenco.includes(o.j)) { cand.push(o); achados++; }
        }
        const x = sortearPeso(r, cand, (k) => afinidade(c.pais, k.j.nacionalidade, k.de?.pais ?? paisDe[livres[k.livre!]?.de]) * (k.livre !== undefined ? 1.3 : 1));
        if (x && x.livre !== undefined) { const l0 = livres.splice(x.livre, 1)[0]; chega(c, l0.j, "contratado", l0.de, 0); return; }
        if (x && x.de) { tomados.add(x.j); const t = taxa(x.j, c); sai(x.de, x.j, mov(x.j, "vendido", { para: c.id, taxa: t })); chega(c, x.j, "contratado", x.de.id, t); return; }
      }
      const [i0, i1] = amador ? faixaAmadora(c.id) : [21, 31];
      const nj = gerarReforco(r, nivelAlvo + r.normal(0, 3), pos, c.pais, usados, r.int(i0, i1));
      chega(c, nj, "contratado", undefined, amador ? undefined : taxa(nj, c));
    };
    for (const p of POSICOES) while (c.elenco.filter((j) => j.posicao === p).length < MINIMO[p]) reforco(p);
    while (c.elenco.length < rf.tamanho) reforco(posQueFalta(c.elenco, MINIMO, r));
    // elenco inchado: dispensa os piores (mais velhos primeiro), sem furar o mínimo da posição
    while (c.elenco.length > rf.tamanho + 3) {
      const cand = [...c.elenco].filter((j) => c.elenco.filter((x) => x.posicao === j.posicao).length > MINIMO[j.posicao]).sort((a, b) => a.ovr - b.ovr || b.idade - a.idade)[0];
      if (!cand) break;
      sai(c, cand, mov(cand, "dispensado"));
    }
    // o tamanho do clube se mantém: time que caiu muito vai ao mercado buscar titulares
    for (let k = 0; k < 3 && forcaDoElenco(c.elenco) < rf.top - 2; k++) {
      const tit = titulares(c.elenco), pior = [...tit].sort((a, b) => a.ovr - b.ovr)[0];
      if (!pior) break;
      const nj = gerarReforco(r, rf.top + 1 + r.normal(0, 2), pior.posicao, c.pais, usados);
      chega(c, nj, "contratado", undefined, taxa(nj, c));
      sai(c, pior, mov(pior, "dispensado"));
    }
  }
  // 5) o nível de cada liga fica onde estava: a régua é relativa (craque continua craque, mas a liga não infla)
  for (const l of meio ? [] : g.ligas) {
    const refs = l.map((c) => ref[c.id]).filter(Boolean);
    if (!refs.length) continue;
    const delta = l.reduce((a, c) => a + forcaDoElenco(c.elenco), 0) / l.length - refs.reduce((a, r) => a + r.top, 0) / refs.length;
    if (Math.abs(delta) < 0.25) continue;
    const r = rngDe("regua", l[0].id), inteiro = Math.trunc(delta), frac = Math.abs(delta - inteiro);
    for (const c of l) for (const j of c.elenco) {
      const d = inteiro + (r.chance(frac) ? Math.sign(delta) : 0);
      j.ovr = clamp(j.ovr - d, 30, 95); if (j.pot !== undefined) j.pot = Math.max(j.ovr, j.pot - d);
    }
  }
  for (const c of todos) if (ref[c.id]) c.forca = ref[c.id].forca + (forcaDoElenco(c.elenco) - ref[c.id].top);
  limparNumeros();
  return { saidas, chegadas, destaques };
}
