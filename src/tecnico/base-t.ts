// Categorias de base no modo técnico: duas categorias (no Brasil, Sub-17 e Sub-20; na Inglaterra, Sub-18 e Sub-21; na
// Itália, Sub-17 e Primavera...). Você não treina a base, mas acompanha: cada garoto evolui toda semana (mais rápido com
// base melhor, coordenador bom e jogando), a categoria joga o campeonato dela e você vê quem está subindo.
// Todo começo de temporada tem peneira: aparecem candidatos de 14 a 16 anos, com o nível e o potencial em faixa (a
// avaliação vai fechando a faixa semana a semana). Você aprova quem entra; quem você demora para aprovar pode ser levado
// por outro clube. Quem passa da idade da categoria sobe (do Sub-17 para o Sub-20) ou tem que ser decidido: sobe para o
// profissional ou é dispensado. Jogador do profissional que ainda tem idade de base pode ser mandado para jogar lá.
import { RNG, clamp } from "../rng.js";
import type { PacoteDados } from "../liga.js";
import { infoLiga } from "../ligas.js";
import { gerarNome } from "../nomes.js";
import { confederacao } from "../copas.js";
import { evoluirSemana } from "../atributos.js";
import { gerarAtributos, ovrDe, type Atleta, type PosT } from "./modelo.js";
import type { SaveTecnico } from "./motor.js";
import { _int, nivelStaff, semanaAbs, SEMANAS_PRE_T, semanasDaTemporada, ANO_INICIAL_T } from "./motor.js";

export interface Categoria { nome: string; max: number; liga: string }
/** As duas categorias do país (a de baixo e a de cima). */
export function categorias(pais: string): [Categoria, Categoria] {
  const c = (nome: string, max: number, liga: string): Categoria => ({ nome, max, liga });
  if (pais === "BRA") return [c("Sub-17", 17, "Brasileiro Sub-17"), c("Sub-20", 20, "Brasileiro Sub-20")];
  if (["ENG", "SCO", "WAL", "NIR", "IRL"].includes(pais)) return [c("Sub-18", 18, "Premier League Sub-18"), c("Sub-21", 21, "Premier League 2")];
  if (pais === "ITA") return [c("Sub-17", 17, "Campeonato Sub-17"), c("Primavera", 20, "Campionato Primavera")];
  if (pais === "ESP") return [c("Juvenil", 18, "División de Honor Juvenil"), c("Time B", 21, "Primera Federación")];
  if (["GER", "AUT", "SUI"].includes(pais)) return [c("Sub-17", 17, "Liga Sub-17"), c("Sub-19", 19, "Liga Sub-19")];
  if (pais === "MEX") return [c("Sub-17", 17, "Liga MX Sub-17"), c("Sub-23", 23, "Liga MX Sub-23")];
  if (pais === "USA") return [c("Sub-17", 17, "MLS Next"), c("Time B", 21, "MLS Next Pro")];
  if (confederacao(pais) === "CONMEBOL") return [c("Sub-17", 17, "Torneio Sub-17"), c("Sub-20", 20, "Torneio de Reservas")];
  if (confederacao(pais) === "UEFA") return [c("Sub-17", 17, "Liga Sub-17"), c("Sub-19", 19, "Liga Sub-19")];
  return [c("Sub-17", 17, "Liga Sub-17"), c("Sub-20", 20, "Liga Sub-20")];
}
export interface Jovem {
  a: Atleta; cat: 1 | 2;
  /** nível no começo da temporada (para mostrar a evolução) */ ovr0: number;
  j: number; g: number; as: number; notas: number[];
  /** veio do profissional (o salário continua o de profissional) */ doPro?: boolean;
  /** passou da idade da categoria de cima: sobe ou é dispensado */ estourou?: boolean;
  /** semanas no clube (a faixa do potencial vai fechando) */ semanas: number;
}
export interface Candidato { id: string; nome: string; pos: PosT; idade: number; nac: string; ovr: number; pot: number; prof: number; temp: number; destaque: string; aprovado?: boolean; levado?: string; semanas: number }
export interface Campanha { v: number; e: number; d: number; gp: number; gc: number }
export interface BaseT {
  jovens: Jovem[];
  peneira?: { t: number; candidatos: Candidato[]; ate: number };
  campanha: Record<1 | 2, Campanha>;
  hist: { t: number; cat: 1 | 2; pos: number; titulo: boolean }[];
  /** temporada em que a base foi montada */ desde: number;
}
const POS: PosT[] = ["GOL", "ZAG", "ZAG", "LAT", "LAT", "VOL", "VOL", "MEI", "MEI", "PON", "PON", "ATA", "ATA"];
const DESTAQUES: Record<PosT, string[]> = {
  GOL: ["reflexo rápido", "sai bem do gol", "joga bem com os pés", "alto para a idade"],
  ZAG: ["forte no jogo aéreo", "sai jogando", "líder da defesa", "rápido na cobertura"],
  LAT: ["chega bem ao ataque", "cruza bem", "muito veloz", "marca forte"],
  VOL: ["desarma muito", "passe longo bom", "incansável", "lê bem o jogo"],
  MEI: ["visão de jogo", "chute de fora", "drible curto", "bate bem na bola parada"],
  PON: ["drible em velocidade", "muito rápido", "corta para dentro", "ambidestro"],
  ATA: ["faro de gol", "bom de cabeça", "finaliza com as duas", "forte no pivô"],
};
const nivelBase = (s: SaveTecnico) => s.clube.baseNivel ?? 1;
const coordDe = (s: SaveTecnico) => { try { return nivelStaff(s, "base"); } catch { return 1; } };
/** Nível típico de um garoto da idade, pela base do clube e pela força da liga. */
function ovrTipico(s: SaveTecnico, idade: number): number {
  const fL = infoLiga(s.ligaId).fLiga;
  return 34 + (idade - 14) * 3.6 + nivelBase(s) * 2 + clamp(fL, 0.2, 1.2) * 5;
}
function potGerado(rng: RNG, s: SaveTecnico, ovr: number): number {
  return Math.round(clamp(56 + nivelBase(s) * 3 + coordDe(s) * 1.6 + clamp(infoLiga(s.ligaId).fLiga, 0.2, 1.2) * 4 + rng.normal(0, 8), ovr + 6, 95));
}
function novoAtleta(rng: RNG, s: SaveTecnico, nome: string, pos: PosT, idade: number, ovr: number, pot: number, prof: number, temp: number): Atleta {
  return { id: `${s.clubeId}|base|${nome}`, nome, pos, idade, nac: infoLiga(s.ligaId).pais, at: gerarAtributos(rng, pos, ovr), pot, numero: 0, moral: 75, condicao: 100, lesao: 0, suspenso: 0, amarelos: 0,
    salario: bolsa(s, idade), contratoAte: s.temporada + 2, prof, temp, relacao: 60, notas: [], jogos: 0, gols: 0, assist: 0, amarelosT: 0, vermelhosT: 0, semJogar: 0, base: true, desde: s.temporada };
}
/** Ajuda de custo de um garoto da base (R$/mês). */
export const bolsa = (s: SaveTecnico, idade: number) => Math.round(Math.max(600, 2500 * clamp(infoLiga(s.ligaId).fLiga, 0.15, 1.3) * (idade >= 18 ? 2.2 : 1)) / 100) * 100;
const usadosDe = (s: SaveTecnico, b?: BaseT) => new Set([...s.elenco.map((a) => a.nome), ...(b?.jovens ?? []).map((j) => j.a.nome), ...(b?.peneira?.candidatos ?? []).map((c) => c.nome)]);

/** A base do clube (na primeira vez, monta as duas categorias). */
export function baseDe(s: SaveTecnico): BaseT {
  if (s.base && (s.base as BaseT).campanha) return s.base as BaseT;
  const rng = new RNG(`${s.semente}|base|${s.clubeId}|${s.temporada}`), [c1, c2] = categorias(infoLiga(s.ligaId).pais);
  const b: BaseT = { jovens: [], campanha: { 1: zero(), 2: zero() }, hist: [], desde: s.temporada };
  const usados = usadosDe(s);
  const montar = (cat: 1 | 2, n: number, iMin: number, iMax: number) => {
    for (let k = 0; k < n; k++) {
      const pos = k < 2 ? "GOL" : POS[(k - 2) % POS.length], idade = rng.int(iMin, iMax), ovr = Math.round(clamp(ovrTipico(s, idade) + rng.normal(0, 4), 30, 70));
      const nome = gerarNome(rng, infoLiga(s.ligaId).pais, usados); usados.add(nome);
      const a = novoAtleta(rng, s, nome, pos, idade, ovr, potGerado(rng, s, ovr), rng.int(5, 20), rng.int(1, 20));
      b.jovens.push({ a, cat, ovr0: ovrDe(a), j: 0, g: 0, as: 0, notas: [], semanas: 20 });
    }
  };
  montar(1, 18, c1.max - 2, c1.max);
  montar(2, 18, c1.max + 1, c2.max);
  s.base = b;
  return b;
}
const zero = (): Campanha => ({ v: 0, e: 0, d: 0, gp: 0, gc: 0 });
export const daCat = (b: BaseT, cat: 1 | 2) => b.jovens.filter((j) => j.cat === cat).sort((x, y) => ovrDe(y.a) - ovrDe(x.a));
export const LIMITE_CAT = 30;

/** Faixa do potencial que a comissão da base enxerga (fecha com o tempo e com um coordenador bom). */
export function faixaPot(s: SaveTecnico, pot: number, semanas: number, id: string): [number, number] {
  const larg = Math.max(1, Math.round(13 - coordDe(s) * 1.4 - Math.min(semanas, 40) / 5));
  const r = new RNG(`${s.semente}|fxp|${id}`), desl = Math.round((r.next() - 0.5) * larg);
  const lo = clamp(pot - Math.ceil(larg / 2) + desl, 40, 99), hi = clamp(lo + larg, 40, 99);
  return [Math.min(lo, pot), Math.max(hi, pot)];
}
export function faixaOvrCand(s: SaveTecnico, c: Candidato): [number, number] {
  const larg = Math.max(1, Math.round(8 - coordDe(s) - c.semanas * 1.5)), r = new RNG(`${s.semente}|fxo|${c.id}`), desl = Math.round((r.next() - 0.5) * larg);
  const lo = c.ovr - Math.ceil(larg / 2) + desl;
  return [Math.min(lo, c.ovr), Math.max(lo + larg, c.ovr)];
}

// ------------------------------------------------------------------ peneira
/** Abre a peneira da temporada (no começo da pré-temporada). */
export function abrirPeneira(s: SaveTecnico): BaseT["peneira"] {
  const b = baseDe(s);
  if (b.peneira?.t === s.temporada) return b.peneira;
  const rng = new RNG(`${s.semente}|peneira|${s.clubeId}|${s.temporada}`), pais = infoLiga(s.ligaId).pais, usados = usadosDe(s, b);
  const n = 12 + nivelBase(s) * 2 + Math.round(clamp(infoLiga(s.ligaId).fLiga, 0.2, 1.2) * 4), cands: Candidato[] = [];
  for (let k = 0; k < n; k++) {
    const pos = k === 0 ? "GOL" : rng.pick(POS), idade = rng.int(14, 16), ovr = Math.round(clamp(ovrTipico(s, idade) - 3 + rng.normal(0, 5), 26, 64));
    // a maioria tem potencial comum; um ou outro é joia
    const pot = Math.round(clamp(potGerado(rng, s, ovr) + (rng.chance(0.08) ? rng.int(6, 12) : rng.chance(0.35) ? -rng.int(4, 12) : 0), ovr + 5, 96));
    const nome = gerarNome(rng, rng.chance(0.06) ? rng.pick(["ARG", "URU", "PAR", "COL", "ANG", "POR"].filter((x) => x !== pais)) : pais, usados); usados.add(nome);
    cands.push({ id: `pen|${s.temporada}|${k}|${nome}`, nome, pos, idade, nac: pais, ovr, pot, prof: rng.int(4, 20), temp: rng.int(1, 20), destaque: rng.pick(DESTAQUES[pos]), semanas: 0 });
  }
  b.peneira = { t: s.temporada, candidatos: cands, ate: SEMANAS_PRE_T + 5 };
  return b.peneira;
}
export const vagasSub = (b: BaseT, cat: 1 | 2) => Math.max(0, LIMITE_CAT - daCat(b, cat).length);
export function aprovar(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const b = baseDe(s), p = b.peneira, c = p?.candidatos.find((x) => x.id === id);
  if (!p || !c || c.aprovado || c.levado) return { ok: false, msg: "Esse garoto não está mais na peneira." };
  if (p.t !== s.temporada || s.semana > p.ate) return { ok: false, msg: "A peneira desta temporada já acabou." };
  if (!vagasSub(b, 1)) return { ok: false, msg: `O ${categorias(infoLiga(s.ligaId).pais)[0].nome} está cheio: dispense alguém antes.` };
  c.aprovado = true;
  const rng = new RNG(`${s.semente}|aprov|${c.id}`), a = novoAtleta(rng, s, c.nome, c.pos, c.idade, c.ovr, c.pot, c.prof, c.temp);
  a.nac = c.nac;
  b.jovens.push({ a, cat: 1, ovr0: ovrDe(a), j: 0, g: 0, as: 0, notas: [], semanas: c.semanas });
  return { ok: true, msg: `${c.nome} aprovado na peneira: entra no ${categorias(infoLiga(s.ligaId).pais)[0].nome}.` };
}
export function reprovar(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const p = baseDe(s).peneira, i = p?.candidatos.findIndex((x) => x.id === id) ?? -1;
  if (!p || i < 0) return { ok: false, msg: "Esse garoto não está mais na peneira." };
  const [c] = p.candidatos.splice(i, 1);
  return { ok: true, msg: `${c.nome} foi dispensado da peneira.` };
}

// ------------------------------------------------------------------ decisões
export function subirParaCat2(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const b = baseDe(s), j = b.jovens.find((x) => x.a.id === id), [, c2] = categorias(infoLiga(s.ligaId).pais);
  if (!j || j.cat !== 1) return { ok: false, msg: "Esse garoto não está na categoria de baixo." };
  if (!vagasSub(b, 2)) return { ok: false, msg: `O ${c2.nome} está cheio.` };
  j.cat = 2;
  return { ok: true, msg: `${j.a.nome} sobe para o ${c2.nome}.` };
}
export function descerParaCat1(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const b = baseDe(s), j = b.jovens.find((x) => x.a.id === id), [c1] = categorias(infoLiga(s.ligaId).pais);
  if (!j || j.cat !== 2) return { ok: false, msg: "Esse garoto não está na categoria de cima." };
  if (j.a.idade > c1.max) return { ok: false, msg: `${j.a.nome} já passou da idade do ${c1.nome}.` };
  j.cat = 1;
  return { ok: true, msg: `${j.a.nome} volta para o ${c1.nome}.` };
}
/** Sobe o garoto para o profissional (contrato de três anos, salário de profissional). */
export function subirProfissional(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const b = baseDe(s), i = b.jovens.findIndex((x) => x.a.id === id);
  if (i < 0) return { ok: false, msg: "Esse garoto não está mais na base." };
  if (s.elenco.length >= 34) return { ok: false, msg: "O elenco profissional está cheio (34)." };
  const [j] = b.jovens.splice(i, 1), a = j.a;
  if (!j.doPro) { a.salario = Math.max(a.salario, Math.round(_int.sal(s, 0.6)(ovrDe(a), a.idade) * 0.5 / 100) * 100); a.contratoAte = s.temporada + 3; a.desde = s.temporada; }
  a.moral = clamp(a.moral + (j.doPro ? 4 : 12), 0, 100); a.condicao = 100;
  s.elenco.push(a); _int.numerar(s);
  return { ok: true, msg: j.doPro ? `${a.nome} volta para o elenco profissional.` : `${a.nome} sobe para o profissional com contrato de três anos.` };
}
export function dispensar(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const b = baseDe(s), i = b.jovens.findIndex((x) => x.a.id === id);
  if (i < 0) return { ok: false, msg: "Esse garoto não está mais na base." };
  if (b.jovens[i].doPro) return { ok: false, msg: "Ele tem contrato profissional: traga de volta ao elenco para negociar ou rescindir." };
  const [j] = b.jovens.splice(i, 1);
  return { ok: true, msg: `${j.a.nome} foi dispensado da base.` };
}
/** Manda um jogador do profissional (com idade de base) jogar na categoria. */
export function mandarParaBase(s: SaveTecnico, id: string): { ok: boolean; msg: string } {
  const b = baseDe(s), a = s.elenco.find((x) => x.id === id), [c1, c2] = categorias(infoLiga(s.ligaId).pais);
  if (!a) return { ok: false, msg: "Jogador não encontrado." };
  if (a.idade > c2.max) return { ok: false, msg: `${a.nome} já passou da idade do ${c2.nome} (até ${c2.max} anos).` };
  if (a.emprestadoDe) return { ok: false, msg: "Jogador emprestado não pode ir para a base." };
  if (s.elenco.length <= 18) return { ok: false, msg: "O elenco ficaria curto demais (mínimo de 18)." };
  const cat: 1 | 2 = a.idade <= c1.max ? 1 : 2;
  s.elenco = s.elenco.filter((x) => x !== a);
  s.esc.titulares = s.esc.titulares.filter((x) => x !== id); s.esc.reservas = s.esc.reservas.filter((x) => x !== id);
  if (s.esc.capitao === id) s.esc.capitao = undefined as unknown as string;
  b.jovens.push({ a, cat, ovr0: ovrDe(a), j: 0, g: 0, as: 0, notas: [], doPro: true, semanas: 40 });
  return { ok: true, msg: `${a.nome} vai jogar no ${cat === 1 ? c1.nome : c2.nome} para ganhar minutos. Dá para trazer de volta quando quiser.` };
}

// ------------------------------------------------------------------ semana e virada
/** Toda semana: treino e evolução da base; em semana de rodada, cada categoria joga. */
export function semanaBase(pacote: PacoteDados, s: SaveTecnico, eventos: string[]) {
  const b = baseDe(s), ab = semanaAbs(s), [c1, c2] = categorias(infoLiga(s.ligaId).pais);
  if (s.semana === 0 || !b.peneira || b.peneira.t !== s.temporada) {
    abrirPeneira(s);
    eventos.push(`A peneira de ${ANO_INICIAL_T + s.temporada} começou: ${b.peneira!.candidatos.length} garotos estão sendo avaliados na base.`);
  }
  const p = b.peneira!;
  if (p.t === s.temporada && s.semana <= p.ate) {
    for (const c of p.candidatos) if (!c.aprovado && !c.levado) c.semanas++;
    // outro clube pode levar quem você não aprovou (os melhores primeiro)
    const rng = new RNG(`${s.semente}|leva|${ab}`);
    for (const c of p.candidatos) if (!c.aprovado && !c.levado && c.pot >= 78 && rng.chance(0.12 + (c.pot - 78) * 0.015)) { c.levado = "outro clube"; eventos.push(`${c.nome}, da peneira, acertou com outro clube.`); }
    if (s.semana === p.ate) { const n = p.candidatos.filter((c) => !c.aprovado && !c.levado).length; if (n) eventos.push(`A peneira acabou: ${n} ${n === 1 ? "garoto não foi aprovado" : "garotos não foram aprovados"}.`); }
  }
  const nb = nivelBase(s), coord = coordDe(s), jogo = s.semana >= SEMANAS_PRE_T && s.semana < semanasDaTemporada(s);
  for (const cat of [1, 2] as const) {
    const lista = daCat(b, cat), tit = new Set(lista.slice(0, 11).map((j) => j.a.id)), banco = new Set(lista.slice(11, 16).map((j) => j.a.id));
    if (jogo && lista.length >= 11) {
      const rng = new RNG(`${s.semente}|jogoBase|${cat}|${ab}`), meu = lista.slice(0, 11).reduce((x, j) => x + ovrDe(j.a), 0) / 11;
      const idadeRef = cat === 1 ? c1.max - 1 : c2.max - 1.5, adv = ovrTipico(s, idadeRef) - 1 + rng.normal(0, 4);
      const lam = (d: number) => clamp(1.35 + d * 0.07, 0.25, 3.6), gp = poisson(rng, lam(meu - adv)), gc = poisson(rng, lam(adv - meu));
      const cp = b.campanha[cat]; cp.gp += gp; cp.gc += gc; if (gp > gc) cp.v++; else if (gp === gc) cp.e++; else cp.d++;
      // gols e assistências para quem jogou
      const ataque = lista.filter((j) => tit.has(j.a.id) || (banco.has(j.a.id) && rng.chance(0.5)));
      for (const j of ataque) { j.j++; j.a.semJogar = 0; j.notas.push(clamp(6.4 + (ovrDe(j.a) - meu) * 0.06 + (gp - gc) * 0.25 + rng.normal(0, 0.6), 4, 10)); j.notas = j.notas.slice(-10); }
      const pesoGol = (x: Jovem) => ({ ATA: 5, PON: 3, MEI: 2.5, VOL: 0.8, LAT: 0.6, ZAG: 0.5, GOL: 0 } as Record<PosT, number>)[x.a.pos] * (0.6 + ovrDe(x.a) / 100);
      for (let k = 0; k < gp; k++) { const autor = escolhe(rng, ataque, pesoGol); if (autor) { autor.g++; const ass = escolhe(rng, ataque.filter((x) => x !== autor), (x) => ({ MEI: 3, PON: 2.6, LAT: 1.6, ATA: 1.5, VOL: 1, ZAG: 0.3, GOL: 0.05 } as Record<PosT, number>)[x.a.pos]); if (ass && rng.chance(0.75)) ass.as++; } }
    }
    for (const j of lista) {
      const participacao = jogo && tit.has(j.a.id) ? "titular" : jogo && banco.has(j.a.id) ? "entrou" : "naoJogou";
      j.a.at = evoluirSemana(j.a.at, j.a.pot, { idade: j.a.idade, foco: "tecnico", intensidade: "normal", participacao, moral: j.a.moral, personalTrainer: false, profissionalismo: j.a.prof, fClube: (0.9 + 0.03 * nb) * (0.92 + 0.035 * coord) });
      j.semanas++;
    }
  }
  void pacote;
}
function poisson(rng: RNG, l: number) { let k = 0, p = 1; const L = Math.exp(-l); do { k++; p *= rng.next(); } while (p > L); return k - 1; }
function escolhe<T>(rng: RNG, l: T[], peso: (x: T) => number): T | undefined {
  const t = l.reduce((a, x) => a + peso(x), 0); if (t <= 0) return undefined; let r = rng.next() * t;
  for (const x of l) { r -= peso(x); if (r <= 0) return x; } return l[l.length - 1];
}
/** Posição final aproximada da categoria no campeonato (pelo aproveitamento). */
export function posicaoCampanha(c: Campanha): number {
  const j = c.v + c.e + c.d; if (!j) return 0;
  const ap = (c.v * 3 + c.e) / (j * 3);
  return clamp(Math.round(1 + (1 - ap) * 22 - (c.gp - c.gc) / Math.max(4, j)), 1, 20);
}
/** Custo mensal das categorias de base (bolsas e estrutura). Quem veio do profissional segue na folha do profissional. */
export function custoBase(s: SaveTecnico): number {
  const b = s.base as BaseT | undefined; if (!b?.jovens) return 0;
  const bolsas = b.jovens.reduce((x, j) => x + j.a.salario, 0);
  return bolsas + Math.round(bolsa(s, 17) * 8 * (1 + nivelBase(s) * 0.5));
}
/** Virada de temporada: campeonatos fecham, garotos fazem aniversário, quem passou da idade sobe ou espera decisão. */
export function viradaBase(s: SaveTecnico, tAntes: number): string[] {
  const b = baseDe(s), av: string[] = [], [c1, c2] = categorias(infoLiga(s.ligaId).pais);
  for (const cat of [1, 2] as const) {
    const c = b.campanha[cat], pos = posicaoCampanha(c);
    if (c.v + c.e + c.d) { const titulo = pos === 1; b.hist.unshift({ t: tAntes, cat, pos, titulo }); av.push(titulo ? `O ${cat === 1 ? c1.nome : c2.nome} foi campeão do ${cat === 1 ? c1.liga : c2.liga}!` : `O ${cat === 1 ? c1.nome : c2.nome} terminou o ${cat === 1 ? c1.liga : c2.liga} em ${pos}º (${c.v}V ${c.e}E ${c.d}D).`); }
    b.campanha[cat] = zero();
  }
  b.hist = b.hist.slice(0, 20);
  // quem estourou e não foi decidido sai; os do profissional voltam ao elenco
  for (const j of b.jovens.filter((x) => x.estourou)) {
    b.jovens = b.jovens.filter((x) => x !== j);
    if (j.doPro) { s.elenco.push(j.a); av.push(`${j.a.nome} passou da idade e volta ao elenco profissional.`); }
    else av.push(`${j.a.nome} passou da idade sem ser aproveitado e deixou o clube.`);
  }
  for (const j of b.jovens) {
    j.a.idade++; j.ovr0 = ovrDe(j.a); j.j = 0; j.g = 0; j.as = 0; j.notas = [];
    if (j.cat === 1 && j.a.idade > c1.max) { j.cat = 2; av.push(`${j.a.nome} subiu do ${c1.nome} para o ${c2.nome}.`); }
    else if (j.cat === 2 && j.a.idade > c2.max) { j.estourou = true; av.push(`${j.a.nome} passou da idade do ${c2.nome}: suba para o profissional ou ele vai embora no fim da temporada.`); }
  }
  return av;
}
/** Garotos que estouraram a idade e precisam de decisão. */
export const pendentesBase = (s: SaveTecnico) => (s.base as BaseT | undefined)?.jovens?.filter((j) => j.estourou).length ?? 0;
