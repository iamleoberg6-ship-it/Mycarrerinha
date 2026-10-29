// O mundo jogável: a Série A do pacote e mais 12 ligas reais em paródia (data/mundo-2026.json, gerado por
// scripts/construir_mundo.py a partir dos elencos de out/2026). Nome, cores, estádio e padrão de camisa de cada clube;
// elencos com os jogadores reais parodiados. Os mesmos clubes e jogadores em qualquer carreira.
import type { Posicao } from "./atributos.js";
import { ligaDoPacote, type Clube, type JogadorNPC, type Liga, type PacoteDados } from "./liga.js";
import { LIGAS, LIGA_INFO, type InfoLiga } from "./ligas.js";
import dados from "../data/mundo-2026.json";
import { CONVIDADOS, clubeConvidado } from "./convidados.js";
import { gerarNome } from "./nomes.js";
import { CLUBES_EXTRA, clubeExtra } from "./ligas-extra.js";
import { RNG, clamp } from "./rng.js";
import { gerarTecnico, chanceDeDemissao, type Tecnico, type TrocaTecnico } from "./tecnicos.js";
import { ordemFinal } from "./copas.js";
import { forcaDoElenco, rodadasDaLiga } from "./liga.js";
import { gerarStats, statsAte, type StatsNPC } from "./estatisticas.js";
import { VAGAS_433 } from "./partida.js";
import { criarBase, CLUBES_BASCOS, SO_BASCOS, nivelBase, virarTemporada, type GruposMundo, type Referencia, type ViradaMundo, type NivelBase, type AgenteLivre } from "./evolucao.js";

export { LIGAS, LIGA_INFO, type InfoLiga };
export interface InfoClube { id: string; nome: string; apelido: string; cores: string[]; forca: number; cidade: string; estadio: string; capacidade: number; padrao: string; ligaId: string; pais: string }

interface ClubeJson { id: string; nome: string; apelido: string; cidade: string; estadio: string; capacidade: number; cores: string[]; padrao: string; forca: number; fClube: number; elenco: [string, string, number, number, string, number, number][] }
const DADOS = dados as unknown as { ligas: { id: string; clubes: ClubeJson[] }[] };

// ------------------------------------------------------------------ montagem
/** ligas: só as profissionais (mercado, estrelas); amadoras: várzea, colegial e universitário. liga/clube/info têm todas. */
export interface Mundo { ligas: Liga[]; amadoras: Liga[]; liga: Record<string, Liga>; clube: Record<string, Clube>; info: Record<string, InfoClube> }
let cache: { pacote: PacoteDados; m: Mundo } | undefined;

const ligaDe = (li: InfoLiga, clubes: Clube[]): Liga => ({ id: li.id, nome: li.nome, pais: li.pais, nivel: li.nivel, fLiga: li.fLiga, fSalario: li.fSalario, rebaixados: li.rebaixados, clubes });

export function mundo(pacote: PacoteDados): Mundo {
  if (cache?.pacote === pacote) return cache.m;
  const ligas: Liga[] = [], amadoras: Liga[] = [], info: Record<string, InfoClube> = {};
  const json = Object.fromEntries(DADOS.ligas.map((l) => [l.id, l]));
  const usadosExtra = new Set([...DADOS.ligas.flatMap((l) => l.clubes.flatMap((c) => c.elenco.map((j) => j[0]))), ...pacote.jogadores.map((j) => j.nome)]);
  for (const li of LIGAS) {
    if (li.id === "BRA1") {
      const l = ligaDoPacote(pacote);
      ligas.push(l);
      type CP = { id: string; nome: string; apelido: string; cores: string[]; forca: number; cidade: string; estadio: { nome: string; capacidade?: number } };
      for (const c of pacote.clubes as unknown as CP[]) info[c.id] = { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca, cidade: c.cidade, estadio: c.estadio.nome, capacidade: c.estadio.capacidade ?? 0, padrao: PADRAO_BRA1[c.id] ?? "lisa", ligaId: "BRA1", pais: "BRA" };
      continue;
    }
    if (CLUBES_EXTRA[li.id]) {
      const clubes = CLUBES_EXTRA[li.id].map((c) => {
        info[c.id] = { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca, cidade: c.cidade, estadio: c.estadio, capacidade: c.capacidade, padrao: c.padrao, ligaId: li.id, pais: c.pais };
        return clubeExtra(c, li.id, usadosExtra);
      });
      (li.amador ? amadoras : ligas).push(ligaDe(li, clubes));
      continue;
    }
    const clubes: Clube[] = (json[li.id]?.clubes ?? []).map((c) => {
      const elenco: JogadorNPC[] = c.elenco.map(([nome, posicao, ovr, idade, nacionalidade, numero]) => ({ nome, posicao: posicao as Posicao | "GOL", ovr, idade, nacionalidade, numero: numero || undefined }));
      info[c.id] = { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca, cidade: c.cidade, estadio: c.estadio, capacidade: c.capacidade, padrao: c.padrao, ligaId: li.id, pais: li.pais };
      return { id: c.id, nome: c.nome, ligaId: li.id, forca: c.forca, fClube: c.fClube, elenco, pais: li.pais };
    });
    (li.amador ? amadoras : ligas).push(ligaDe(li, clubes));
  }
  // convidados das copas continentais: entram no mapa de clubes, mas não em ligas/amadoras (fora do mercado e das estrelas)
  const conv: Clube[] = CONVIDADOS.map((c) => {
    info[c.id] = { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca, cidade: c.cidade, estadio: c.estadio, capacidade: 40000, padrao: c.padrao, ligaId: "CONV", pais: c.pais };
    return clubeConvidado(c);
  });
  const todas = [...ligas, ...amadoras, { id: "CONV", nome: "Clubes convidados", pais: "INT", nivel: 3 as const, fLiga: 0.6, fSalario: 0.6, rebaixados: 0, clubes: conv }];
  const m: Mundo = { ligas, amadoras, liga: Object.fromEntries(todas.map((l) => [l.id, l])), clube: Object.fromEntries(todas.flatMap((l) => l.clubes.map((c) => [c.id, c]))), info };
  cache = { pacote, m };
  // o mundo de 2026 fica guardado: as temporadas seguintes são calculadas a partir dele (src/evolucao.ts)
  // bascos: todo o elenco do Atlético Bilbau (é a regra do clube) e boa parte dos espanhóis dos vizinhos
  for (const c of Object.values(m.clube)) if (CLUBES_BASCOS.has(c.id)) for (const j of c.elenco) if (c.id === SO_BASCOS || (j.nacionalidade === "ESP" && hashS(`basco|${j.nome}`) % 10 < 6)) j.basco = true;
  original = new Map(Object.values(m.clube).map((c) => [c, c.elenco.map((j) => ({ ...j }))]));
  ligasOriginais = new Map(ligas.map((l) => [l, [...l.clubes]]));
  ref = Object.fromEntries(Object.values(m.clube).map((c) => [c.id, { forca: c.forca, top: forcaDoElenco(c.elenco), tamanho: c.elenco.length, nivel: nivelBase(c.id, info[c.id]?.forca ?? c.forca, c.pais) }]));
  grupos = { pro: ligas.flatMap((l) => l.clubes), convidados: conv, amadores: amadoras.flatMap((l) => l.clubes), ligas: [...ligas.map((l) => l.clubes), ...amadoras.map((l) => l.clubes), conv] };
  estado = undefined;
  return m;
}

// ------------------------------------------------------------------ seleções nacionais
/** Seleções: [país, nome, apelido, cores, força base (quando o país tem poucos jogadores no mundo do jogo)]. */
const SELECOES: [string, string, string, string[], number][] = [
  ["BRA", "Brasil", "Canarinho", ["#F5C400", "#0B7A3B"], 86], ["ARG", "Argentina", "Albiceleste", ["#6CB4E4", "#FFFFFF"], 87],
  ["URU", "Uruguai", "Celeste", ["#6CB4E4", "#111111"], 80], ["COL", "Colômbia", "Cafeteros", ["#F5C400", "#0B3D91"], 80],
  ["CHI", "Chile", "La Roja", ["#C8102E", "#0B3D91"], 74], ["PAR", "Paraguai", "Albirroja", ["#C8102E", "#FFFFFF"], 75],
  ["ECU", "Equador", "La Tri", ["#F5C400", "#0B3D91"], 78], ["PER", "Peru", "La Blanquirroja", ["#FFFFFF", "#C8102E"], 72],
  ["MEX", "México", "El Tri", ["#0B7A3B", "#FFFFFF"], 77], ["USA", "Estados Unidos", "USMNT", ["#FFFFFF", "#0B2F7A"], 78],
  ["CAN", "Canadá", "Canucks", ["#C8102E", "#FFFFFF"], 75], ["ENG", "Inglaterra", "Three Lions", ["#FFFFFF", "#0B2F7A"], 87],
  ["FRA", "França", "Les Bleus", ["#0B2F7A", "#FFFFFF"], 88], ["ESP", "Espanha", "La Roja", ["#C8102E", "#F5C400"], 88],
  ["GER", "Alemanha", "Mannschaft", ["#FFFFFF", "#111111"], 85], ["ITA", "Itália", "Azzurra", ["#1C4FA1", "#FFFFFF"], 83],
  ["POR", "Portugal", "Seleção das Quinas", ["#C8102E", "#0B7A3B"], 86], ["NED", "Holanda", "Laranja", ["#F58220", "#FFFFFF"], 84],
  ["BEL", "Bélgica", "Diabos Vermelhos", ["#C8102E", "#111111"], 82], ["CRO", "Croácia", "Vatreni", ["#FFFFFF", "#C8102E"], 81],
  ["DEN", "Dinamarca", "Dinamite", ["#C8102E", "#FFFFFF"], 80], ["SUI", "Suíça", "Nati", ["#C8102E", "#FFFFFF"], 79],
  ["SRB", "Sérvia", "Orlovi", ["#C8102E", "#0B3D91"], 77], ["POL", "Polônia", "Biało-czerwoni", ["#FFFFFF", "#C8102E"], 77],
  ["TUR", "Turquia", "Crescentes", ["#C8102E", "#FFFFFF"], 79], ["NOR", "Noruega", "Løvene", ["#C8102E", "#0B2F7A"], 80],
  ["SWE", "Suécia", "Blågult", ["#F5C400", "#1C4FA1"], 77], ["AUT", "Áustria", "Das Team", ["#C8102E", "#FFFFFF"], 79],
  ["SCO", "Escócia", "Tartan Army", ["#0B2F7A", "#FFFFFF"], 75], ["UKR", "Ucrânia", "Zbirna", ["#F5C400", "#1C4FA1"], 76],
  ["MAR", "Marrocos", "Leões do Atlas", ["#C8102E", "#0B7A3B"], 81], ["SEN", "Senegal", "Leões de Teranga", ["#FFFFFF", "#0B7A3B"], 79],
  ["NGA", "Nigéria", "Super Águias", ["#0B7A3B", "#FFFFFF"], 77], ["GHA", "Gana", "Estrelas Negras", ["#FFFFFF", "#111111"], 75],
  ["CIV", "Costa do Marfim", "Elefantes", ["#F58220", "#0B7A3B"], 78], ["CMR", "Camarões", "Leões Indomáveis", ["#0B7A3B", "#C8102E"], 75],
  ["EGY", "Egito", "Faraós", ["#C8102E", "#FFFFFF"], 76], ["ALG", "Argélia", "Raposas do Deserto", ["#FFFFFF", "#0B7A3B"], 76],
  ["TUN", "Tunísia", "Águias de Cartago", ["#C8102E", "#FFFFFF"], 73], ["JPN", "Japão", "Samurai Blue", ["#0B2F7A", "#FFFFFF"], 80],
  ["KOR", "Coreia do Sul", "Tigres da Ásia", ["#C8102E", "#0B2F7A"], 78], ["KSA", "Arábia Saudita", "Falcões Verdes", ["#0B7A3B", "#FFFFFF"], 72],
  ["AUS", "Austrália", "Socceroos", ["#F5C400", "#0B7A3B"], 74], ["IRN", "Irã", "Team Melli", ["#FFFFFF", "#C8102E"], 75],
  ["QAT", "Catar", "Al-Annabi", ["#7A1E2B", "#FFFFFF"], 70], ["NZL", "Nova Zelândia", "All Whites", ["#FFFFFF", "#111111"], 66],
  ["BOL", "Bolívia", "La Verde", ["#0B7A3B", "#FFFFFF"], 68], ["VEN", "Venezuela", "La Vinotinto", ["#7A1E2B", "#FFFFFF"], 71],
  ["CRC", "Costa Rica", "Los Ticos", ["#C8102E", "#0B2F7A"], 70], ["PAN", "Panamá", "Los Canaleros", ["#C8102E", "#FFFFFF"], 71],
  ["JAM", "Jamaica", "Reggae Boyz", ["#F5C400", "#0B7A3B"], 69], ["HON", "Honduras", "Los Catrachos", ["#1C4FA1", "#FFFFFF"], 67],
  ["MLI", "Mali", "Águias", ["#0B7A3B", "#F5C400"], 74], ["RSA", "África do Sul", "Bafana Bafana", ["#F5C400", "#0B7A3B"], 71],
  ["IRQ", "Iraque", "Leões da Mesopotâmia", ["#FFFFFF", "#0B7A3B"], 70], ["UAE", "Emirados Árabes Unidos", "Al-Abyad", ["#FFFFFF", "#C8102E"], 68],
];
export const idSelecao = (pais: string) => `NAT-${pais}`;
export const temSelecao = (pais: string) => SELECOES.some((x) => x[0] === pais);
/** Monta (ou refaz, quando o mundo muda) os elencos das seleções: os 23 melhores de cada país; completa com gerados se faltar gente. */
function montarSelecoes(m: Mundo) {
  const porPais = new Map<string, JogadorNPC[]>();
  for (const l of [...m.ligas, m.liga.CONV].filter(Boolean)) for (const c of l.clubes) for (const j of c.elenco) if (j.idade >= 17) { const a = porPais.get(j.nacionalidade) ?? []; a.push(j); porPais.set(j.nacionalidade, a); }
  for (const [pais, nome, apelido, cores, base] of SELECOES) {
    const id = idSelecao(pais);
    const pos: JogadorNPC["posicao"][] = ["GOL", "GOL", "GOL", "ZAG", "ZAG", "ZAG", "ZAG", "LAT", "LAT", "LAT", "LAT", "VOL", "VOL", "VOL", "MEI", "MEI", "MEI", "MEI", "PON", "PON", "PON", "ATA", "ATA", "ATA"];
    const todos = [...(porPais.get(pais) ?? [])].sort((a, b) => b.ovr - a.ovr), elenco: JogadorNPC[] = [];
    const quer: Record<string, number> = {}; for (const p of pos) quer[p] = (quer[p] ?? 0) + 1;
    for (const j of todos) if ((quer[j.posicao] ?? 0) > 0) { elenco.push(j); quer[j.posicao]--; }
    // completa com jogadores do país que não estão no mundo do jogo (sempre os mesmos, só da seleção)
    const extras = (completar[pais] ??= (() => { const rng = new RNG(`selecao|${pais}`), l: JogadorNPC[] = []; for (const p of pos) l.push({ nome: gerarNome(rng, pais, nomesSelecao), posicao: p, ovr: Math.round(base - 6 + rng.normal(0, 2)), idade: rng.int(21, 32), nacionalidade: pais }); return l; })());
    for (const [p, k] of Object.entries(quer)) elenco.push(...extras.filter((x) => x.posicao === p).slice(0, k));
    const forca = Math.round(forcaDoElenco(elenco) * 10) / 10;
    const c = m.clube[id];
    if (c) { c.elenco = elenco; c.forca = forca; }
    else {
      const novo: Clube = { id, nome, ligaId: "SELECOES", forca, fClube: 1, elenco, pais };
      m.clube[id] = novo;
      m.info[id] = { id, nome, apelido, cores, forca: base, cidade: "", estadio: "Estádio nacional", capacidade: 60000, padrao: "lisa", ligaId: "SELECOES", pais };
    }
  }
}
const completar: Record<string, JogadorNPC[]> = {}, nomesSelecao = new Set<string>(["—"]);
/** As seleções (time com elenco e força), pela sigla do país. */
export const selecaoDe = (pacote: PacoteDados, pais: string): Clube | undefined => { mundo(pacote); return mundo(pacote).clube[idSelecao(pais)]; };
export const todasSelecoes = (pacote: PacoteDados) => SELECOES.map((x) => mundo(pacote).clube[idSelecao(x[0])]).filter(Boolean) as Clube[];

// ------------------------------------------------------------------ o mundo ao longo das temporadas
let ligasOriginais = new Map<Liga, Clube[]>();
let original = new Map<Clube, JogadorNPC[]>(), ref: Record<string, Referencia> = {}, grupos: GruposMundo = { pro: [], convidados: [], amadores: [], ligas: [] };
let estado: { semente: string; temporada: number; base: Record<string, JogadorNPC[]>; usados: Set<string>; virada?: ViradaMundo; viradas: Record<number, ViradaMundo>; meio: Record<number, ViradaMundo>; feitoMeio: boolean; livres: AgenteLivre[]; hist: Map<string, LinhaHistorico[]>; campeoes: { t: number; liga: string; clube: string }[]; saiu: Map<string, { t: number; motivo: string }>;
  /** técnico de cada clube profissional, técnicos sem clube e as trocas de cada virada */
  tecnicos: Record<string, Tecnico>; tecLivres: Tecnico[]; trocas: Record<number, TrocaTecnico[]>; nomesTec: Set<string>;
  /** lesões graves da temporada (rodadas da liga em que o jogador fica fora) */
  lesoes: Map<string, Lesao>;
  /** acesso e rebaixamento de cada virada (quem subiu e quem caiu, de onde para onde) */
  acessos: Record<number, Acesso[]>;
  /** primeira temporada com acesso e rebaixamento (saves antigos começam na última temporada jogada) */
  desde: number } | undefined;
export interface Acesso { clubeId: string; de: string; para: string; sobe: boolean; campeao?: boolean }
/** Tabela real (a do campeonato que o jogador disputou) de cada temporada: decide quem sobe e quem cai na liga dele. */
export type TabelasReais = Record<number, { ligaId: string; ordem: string[] }>;
export interface Lesao { t: number; clubeId: string; ini: number; fim: number; tipo: string; ovr: number }
/** Uma temporada na carreira de um jogador do mundo. */
/** `liga`: o que a temporada imaginada precisa (fila na posição, titulares, força do clube, média da liga, rodadas);
 *  as estatísticas são sorteadas só quando alguém olha (st guarda o resultado). */
export interface LinhaHistorico { t: number; clubeId: string; idade: number; ovr: number; pot: number; posicao: string; base: boolean; /** país do jogador (bandeira no perfil) */ nat?: string; meio?: boolean; les?: [number, number]; liga?: [number, number, number, number, number, number?, number?]; st?: StatsNPC }
const VAGAS: Record<string, number> = { GOL: 1, ...VAGAS_433 };
function registrarTemporada(m: Mundo) {
  const e = estado!, add = (j: JogadorNPC, clubeId: string, base: boolean) => {
    const l = e.hist.get(j.nome) ?? [];
    if (!l.length || l[l.length - 1].t !== e.temporada) l.push({ t: e.temporada, clubeId, idade: j.idade, ovr: j.ovr, pot: j.pot ?? j.ovr, posicao: j.posicao, base, nat: j.nacionalidade });
    e.hist.set(j.nome, l);
  };
  for (const c of Object.values(m.clube)) if (c.ligaId !== "SELECOES") for (const j of c.elenco) add(j, c.id, false);
  for (const [id, b] of Object.entries(e.base)) for (const j of b) add(j, id, true);
  // o lugar de cada um no time e na liga, para imaginar a temporada dele quando alguém olhar
  for (const l of [...m.ligas, ...m.amadoras]) {
    const n = rodadasDaLiga(l.clubes.length).length, media = l.clubes.reduce((a, c) => a + c.forca, 0) / l.clubes.length;
    for (const c of l.clubes) {
      const fila: Record<string, JogadorNPC[]> = {};
      for (const j of [...c.elenco].sort((a, b) => b.ovr - a.ovr)) (fila[j.posicao] ??= []).push(j);
      for (const [pos, js] of Object.entries(fila)) js.forEach((j, rank) => {
        const l2 = e.hist.get(j.nome), linha = l2?.[l2.length - 1];
        if (linha && linha.t === e.temporada && linha.clubeId === c.id) linha.liga = [rank, VAGAS[pos] ?? 1, c.forca, media, n];
      });
    }
  }
  for (const lista of Object.values(e.virada?.saidas ?? {})) for (const x of lista) if (x.motivo === "aposentou") e.saiu.set(x.nome, { t: e.temporada, motivo: "aposentou" });
  sortearLesoes(m);
}
const TIPOS_LESAO: [string, number, number][] = [["lesão muscular grave", 5, 9], ["fratura", 8, 14], ["lesão no tornozelo", 6, 11], ["ruptura do ligamento do joelho", 18, 28]];
/** Lesões graves da temporada nas ligas profissionais: mais comuns depois dos 30; a de ligamento tira o resto do ano. */
function sortearLesoes(m: Mundo) {
  const e = estado!;
  for (const [k, v] of e.lesoes) if (v.t < e.temporada - 1) e.lesoes.delete(k);
  for (const l of m.ligas) {
    const n = rodadasDaLiga(l.clubes.length).length;
    for (const c of l.clubes) for (const j of c.elenco) {
      const r = new RNG(`${e.semente}|lesao|${e.temporada}|${j.nome}`);
      if (!r.chance(0.022 + (j.idade >= 30 ? 0.014 : 0) + (j.idade >= 33 ? 0.01 : 0))) continue;
      const [tipo, a, b] = r.pick(TIPOS_LESAO), dur = r.int(a, b), ini = r.int(0, Math.max(0, n - 4));
      const les: Lesao = { t: e.temporada, clubeId: c.id, ini, fim: Math.min(n, ini + dur), tipo, ovr: j.ovr };
      e.lesoes.set(j.nome, les);
      const linha = e.hist.get(j.nome)?.at(-1);
      if (linha && linha.t === e.temporada) linha.les = [les.ini, les.fim];
    }
  }
}
/** Lesão grave do jogador nesta temporada (rodadas da liga), se houver. */
export function lesaoDe(pacote: PacoteDados, nome: string): Lesao | undefined {
  const e = garantir(pacote), x = e.lesoes.get(nome);
  return x && x.t === e.temporada ? x : undefined;
}
/** Quem do clube está fora por lesão grave na rodada. */
export function lesionadosDoClube(pacote: PacoteDados, clubeId: string, rodada: number): Set<string> {
  const e = garantir(pacote), out = new Set<string>();
  for (const [nome, x] of e.lesoes) if (x.t === e.temporada && x.clubeId === clubeId && rodada >= x.ini && rodada < x.fim) out.add(nome);
  return out;
}
/** Lesões graves que começam na rodada (para as notícias). */
export function lesoesQueComecam(pacote: PacoteDados, rodada: number): (Lesao & { nome: string })[] {
  const e = garantir(pacote), out: (Lesao & { nome: string })[] = [];
  for (const [nome, x] of e.lesoes) if (x.t === e.temporada && x.ini === rodada) out.push({ nome, ...x });
  return out;
}

/** Lesão longa deixa marca: quem ficou meio ano fora volta um pouco pior. */
function sequelas(m: Mundo) {
  const e = estado!, longas = new Map([...e.lesoes].filter(([, x]) => x.t === e.temporada && x.fim - x.ini >= 15));
  if (!longas.size) return;
  for (const l of m.ligas) for (const c of l.clubes) for (const j of c.elenco) if (longas.has(j.nome)) {
    const d = new RNG(`${e.semente}|sequela|${e.temporada}|${j.nome}`).int(1, 3);
    j.ovr = Math.max(30, j.ovr - d); if (j.pot !== undefined) j.pot = Math.max(j.ovr, j.pot - d);
  }
}
// ------------------------------------------------------------------ técnicos
function tecnicosIniciais() {
  const m = cache!.m, tecnicos: Record<string, Tecnico> = {}, nomesTec = new Set<string>();
  for (const l of m.ligas) for (const c of l.clubes) tecnicos[c.id] = { ...gerarTecnico(new RNG(`tecnico|${c.id}`), (m.info[c.id]?.forca ?? c.forca) + new RNG(`tecnico-rep|${c.id}`).normal(0, 3), c.pais, nomesTec, 0), desde: -new RNG(`tecnico-desde|${c.id}`).int(0, 4) };
  const r = new RNG("tecnicos-livres"), tecLivres = Array.from({ length: 60 }, () => gerarTecnico(r, r.range(58, 86), r.pick(["BRA", "ARG", "POR", "ESP", "ITA", "GER", "FRA", "ENG", "NED", "URU", "MEX", "TUR"]), nomesTec, 0));
  return { tecnicos, tecLivres, trocas: {} as Record<number, TrocaTecnico[]>, nomesTec };
}
/** Fim da temporada nos outros clubes: demissões pela campanha, aposentadorias, e as contratações (livres ou levados de clubes menores). */
function virarTecnicos(m: Mundo, semente: string) {
  const e = estado!, t = e.temporada, trocas: TrocaTecnico[] = [];
  const fonte = { ligas: m.liga, semente: `${semente}|sim`, temporada: t };
  const vagas: { c: Clube; saiu?: string }[] = [], bons: { c: Clube; tec: Tecnico }[] = [];
  for (const l of m.ligas) {
    const ordem = ordemFinal(fonte, l.id), porForca = [...l.clubes].sort((a, b) => b.forca - a.forca).map((c) => c.id);
    // o campeão da temporada fica registrado (títulos do perfil do clube)
    if (ordem[0] && !e.campeoes.some((x) => x.t === t && x.liga === l.id)) e.campeoes.push({ t, liga: l.id, clube: ordem[0] });
    for (const c of l.clubes) {
      const tec = e.tecnicos[c.id], r = new RNG(`${semente}|tecnico|${t}|${c.id}`);
      if (!tec) continue;
      tec.idade++;
      const pos = ordem.indexOf(c.id) + 1, esp = porForca.indexOf(c.id) + 1;
      if (pos && pos <= esp - 3) { tec.rep = clamp(tec.rep + 2, 45, 95); bons.push({ c, tec }); } else if (pos && pos >= esp + 3) tec.rep = clamp(tec.rep - 1, 45, 95);
      const aposenta = tec.idade >= 70 || (tec.idade >= 66 && r.chance(0.3));
      if (aposenta || (pos && r.chance(chanceDeDemissao(pos, esp, l.clubes.length, l.rebaixados, t - tec.desde)))) {
        delete e.tecnicos[c.id];
        if (!aposenta) e.tecLivres.push({ ...tec, rep: clamp(tec.rep - 4, 45, 95), ultimo: c.id });
        vagas.push({ c, saiu: `${tec.nome}|${aposenta ? "aposentou" : "demitido"}` });
      }
    }
  }
  vagas.sort((a, b) => b.c.forca - a.c.forca);
  for (const v of vagas) {
    const r = new RNG(`${semente}|contrata|${t}|${v.c.id}`), alvo = m.info[v.c.id]?.forca ?? v.c.forca;
    const [saiu, motivo] = (v.saiu ?? "").split("|") as [string, TrocaTecnico["motivo"]];
    // clube grande pode tirar quem fez milagre num clube menor
    const levar = bons.filter((b) => b.c.forca < v.c.forca - 4 && e.tecnicos[b.c.id] === b.tec && b.tec.rep >= alvo - 8).sort((a, b) => b.tec.rep - a.tec.rep)[0];
    let novo: Tecnico | undefined, de: string | undefined;
    if (levar && r.chance(0.45)) { novo = levar.tec; de = levar.c.id; delete e.tecnicos[levar.c.id]; vagas.push({ c: levar.c, saiu: `${levar.tec.nome}|levado` }); }
    else {
      const cand = e.tecLivres.filter((x) => x.rep >= alvo - 7 && x.rep <= alvo + 5 && x.idade < 68 && x.ultimo !== v.c.id).sort((a, b) => b.rep - a.rep).slice(0, 4);
      if (cand.length) { novo = r.pick(cand); e.tecLivres.splice(e.tecLivres.indexOf(novo), 1); }
      else novo = gerarTecnico(r, alvo - 3 + r.normal(0, 2), v.c.pais, e.nomesTec, t + 1);
    }
    novo.desde = t + 1;
    e.tecnicos[v.c.id] = novo;
    trocas.push({ clubeId: v.c.id, ...(saiu ? { saiu } : {}), entrou: novo.nome, motivo: motivo ?? "demitido", ...(de ? { de } : {}), t: t + 1 });
  }
  e.tecLivres = e.tecLivres.filter((x) => x.idade < 70).sort((a, b) => b.rep - a.rep).slice(0, 200);
  for (const x of e.tecLivres) x.idade++;
  e.trocas[t + 1] = trocas;
}
/** Técnico de um clube no mundo (o do clube do jogador é o da carreira, veja jogo.ts). */
export const tecnicoDoClube = (pacote: PacoteDados, clubeId: string): Tecnico | undefined => garantir(pacote).tecnicos[clubeId];
/** Trocas de técnico na virada para a temporada t. */
export const trocasDeTecnicoEm = (pacote: PacoteDados, t: number): TrocaTecnico[] => garantir(pacote).trocas[t] ?? [];
/** Lesões graves da temporada atual (todas), com o nome. */
export function lesoesDaTemporada(pacote: PacoteDados): (Lesao & { nome: string })[] {
  const e = garantir(pacote);
  return [...e.lesoes].filter(([, x]) => x.t === e.temporada).map(([nome, x]) => ({ nome, ...x }));
}
/** Trocas de técnico na virada para a temporada atual. */
export const trocasDeTecnico = (pacote: PacoteDados): TrocaTecnico[] => { const e = garantir(pacote); return e.trocas[e.temporada] ?? []; };
/** Um técnico sem clube para o clube do jogador (o melhor do tamanho dele; se não houver, um novo). */
export function tecnicoLivrePara(pacote: PacoteDados, clubeId: string, chave: string): Tecnico {
  const e = garantir(pacote), m = mundo(pacote), alvo = m.info[clubeId]?.forca ?? m.clube[clubeId]?.forca ?? 70, r = new RNG(`${e.semente}|tec-usuario|${chave}`);
  const cand = e.tecLivres.filter((x) => x.rep >= alvo - 7 && x.rep <= alvo + 5 && x.idade < 68 && x.ultimo !== clubeId).sort((a, b) => b.rep - a.rep).slice(0, 4);
  return { ...(cand.length ? r.pick(cand) : gerarTecnico(r, alvo - 3, m.clube[clubeId]?.pais ?? "BRA", e.nomesTec, e.temporada)), desde: e.temporada };
}
let versao = 0;
/** Muda a cada vez que o mundo muda (caches de quem lê o mundo comparam com isto). */
export const versaoMundo = () => versao;

/** Põe o mundo na temporada t da carreira de semente `semente` (0 = elencos reais de 2026, com as bases sorteadas). */
/** Semana em que fecha a janela do meio do ano (os negócios dos outros clubes saem nela). */
export const SEMANA_JANELA_MEIO = 24;
/** Rodada da liga em que os negociados no meio do ano trocam de time (rodadas antes: clube antigo). */
const RODADA_MEIO = SEMANA_JANELA_MEIO - 2;
/** Põe o mundo na temporada t (e semana) da carreira de semente `semente` (0 = elencos reais de 2026, com as bases sorteadas). */
export function sincronizarMundo(pacote: PacoteDados, semente: string, temporada: number, semana = 0, reais: TabelasReais = {}, desde = 0) {
  const m = mundo(pacote), comMeio = semana >= SEMANA_JANELA_MEIO;
  if (estado && estado.semente === semente && estado.temporada === temporada && estado.feitoMeio === comMeio) return;
  if (!estado || estado.semente !== semente || estado.desde !== desde || estado.temporada > temporada || (estado.temporada === temporada && estado.feitoMeio && !comMeio)) {
    for (const [c, el] of original) { c.elenco = el.map((j) => ({ ...j })); c.forca = ref[c.id].forca; }
    // cada clube volta para a divisão de 2026
    for (const [l, cl] of ligasOriginais) { l.clubes.splice(0, l.clubes.length, ...cl); for (const c of cl) { c.ligaId = l.id; if (m.info[c.id]) m.info[c.id].ligaId = l.id; } }
    for (const id of Object.keys(m.clube)) if (id.startsWith("NAT-")) { delete m.clube[id]; delete m.info[id]; }
    const usados = new Set([...Object.values(m.clube).flatMap((c) => c.elenco.map((j) => j.nome)), ...nomesSelecao]);
    const base: Record<string, JogadorNPC[]> = {};
    for (const c of grupos.pro) base[c.id] = criarBase(new RNG(`${semente}|base|${c.id}`), ref[c.id].nivel, c.pais, usados, c.id);
    estado = { semente, temporada: 0, base, usados, viradas: {}, meio: {}, feitoMeio: false, livres: [], hist: new Map(), campeoes: [], saiu: new Map(), ...tecnicosIniciais(), lesoes: new Map(), acessos: {}, desde };
    registrarTemporada(m);
  }
  const e = estado;
  const fazerMeio = () => { e.meio[e.temporada] = virarTemporada(grupos, e.base, ref, semente, e.temporada, e.usados, true, e.livres); e.feitoMeio = true; registrarMeio(m); };
  while (e.temporada < temporada) {
    if (!e.feitoMeio) fazerMeio();
    virarTecnicos(m, semente);
    sequelas(m);
    e.acessos[e.temporada] = e.temporada >= e.desde ? acessoERebaixamento(m, semente, e.temporada, reais[e.temporada]) : [];
    e.temporada++; e.feitoMeio = false;
    e.virada = e.viradas[e.temporada] = virarTemporada(grupos, e.base, ref, semente, e.temporada, e.usados, false, e.livres); registrarTemporada(m);
  }
  if (comMeio && !e.feitoMeio) fazerMeio();
  montarSelecoes(m);
  versao++; indice = undefined;
}
// ------------------------------------------------------------------ acesso e rebaixamento
/** Pirâmides com acesso: [divisão de cima, de baixo, quantos trocam]. A Série D sobe pelos campeões dos grupos. */
const PIRAMIDES: [string, string, number][] = [["BRA1", "BRA2", 4], ["BRA2", "BRA3", 4], ["ENG1", "ENG2", 3], ["ENG2", "ENG3", 3], ["ENG3", "ENG4", 3], ["ESP1", "ESP2", 3]];
const GRUPOS_D = "ABCDEFGH".split("").map((g) => `BRA4${g}`);
/** Fim da temporada t: os últimos de cada divisão descem, os primeiros de baixo sobem (a tabela real vale para a liga do jogador). */
function acessoERebaixamento(m: Mundo, semente: string, t: number, real?: { ligaId: string; ordem: string[] }): Acesso[] {
  const fonte = { ligas: m.liga, semente: `${semente}|sim`, temporada: t, ...(real ? { tabelaReal: real } : {}) };
  const ordem = (id: string) => { const o = ordemFinal(fonte, id), l = m.liga[id]; return o.filter((x) => l?.clubes.some((c) => c.id === x)); };
  const trocas: { de: Liga; para: Liga; clube: Clube; sobe: boolean; campeao: boolean }[] = [];
  for (const [cima, baixo, n] of PIRAMIDES) {
    const lc = m.liga[cima], lb = m.liga[baixo];
    if (!lc || !lb) continue;
    const oc = ordem(cima), ob = ordem(baixo);
    for (const id of oc.slice(-n)) trocas.push({ de: lc, para: lb, clube: m.clube[id], sobe: false, campeao: false });
    ob.slice(0, n).forEach((id, i) => trocas.push({ de: lb, para: lc, clube: m.clube[id], sobe: true, campeao: i === 0 }));
  }
  // Série D: dos oito campeões de grupo, quatro sobem (mata-mata simulado pela força); os quatro últimos da C caem nas vagas deles
  const lc = m.liga.BRA3;
  if (lc && GRUPOS_D.every((g) => m.liga[g])) {
    const r = new RNG(`${semente}|acesso-D|${t}`);
    const campeoes = GRUPOS_D.map((g) => ({ g, id: ordem(g)[0] })).filter((x) => x.id);
    const sobem = campeoes.map((x) => ({ ...x, v: (m.clube[x.id]?.forca ?? 50) + r.normal(0, 4) + (real?.ligaId === x.g && real.ordem[0] === x.id ? 2 : 0) })).sort((a, b) => b.v - a.v).slice(0, 4);
    const caem = ordem("BRA3").slice(-sobem.length);
    sobem.forEach((x, i) => {
      trocas.push({ de: m.liga[x.g], para: lc, clube: m.clube[x.id], sobe: true, campeao: i === 0 });
      if (caem[i]) trocas.push({ de: lc, para: m.liga[x.g], clube: m.clube[caem[i]], sobe: false, campeao: false });
    });
  }
  const feitos: Acesso[] = [];
  for (const x of trocas) {
    if (!x.clube || !x.de.clubes.includes(x.clube)) continue;
    x.de.clubes.splice(x.de.clubes.indexOf(x.clube), 1); x.para.clubes.push(x.clube);
    x.clube.ligaId = x.para.id; if (m.info[x.clube.id]) m.info[x.clube.id].ligaId = x.para.id;
    feitos.push({ clubeId: x.clube.id, de: x.de.id, para: x.para.id, sobe: x.sobe, ...(x.campeao ? { campeao: true } : {}) });
  }
  return feitos;
}
/** Quem subiu e quem caiu na virada para a temporada t (vem da temporada t − 1). */
export const acessosDaVirada = (pacote: PacoteDados, t: number): Acesso[] => { garantir(pacote); return estado?.acessos[t - 1] ?? []; };

/** Depois da janela do meio: quem trocou de clube ganha uma linha nova na mesma temporada (do clube novo, da rodada do meio em diante). */
function registrarMeio(m: Mundo) {
  const e = estado!, v = e.meio[e.temporada];
  const ligaDe = (id: string) => Object.values(m.liga).find((l) => l.clubes.some((c) => c.id === id));
  for (const [para, ch] of Object.entries(v.chegadas)) for (const x of ch) {
    const l = e.hist.get(x.nome) ?? [], ant = l[l.length - 1];
    if (ant && ant.t === e.temporada && ant.liga) { const a = ant.liga; ant.liga = [a[0], a[1], a[2], a[3], a[4], a[5] ?? 0, RODADA_MEIO]; ant.st = undefined; }
    const c = m.clube[para], lg = ligaDe(para);
    if (!c || !lg) continue;
    const j = c.elenco.find((y) => y.nome === x.nome);
    if (!j) continue;
    const n = rodadasDaLiga(lg.clubes.length).length, media = lg.clubes.reduce((a, k) => a + k.forca, 0) / lg.clubes.length;
    const rank = c.elenco.filter((y) => y.posicao === j.posicao && y.ovr > j.ovr).length;
    l.push({ t: e.temporada, clubeId: para, idade: j.idade, ovr: j.ovr, pot: j.pot ?? j.ovr, posicao: j.posicao, base: false, meio: true, liga: [rank, VAGAS[j.posicao] ?? 1, c.forca, media, n, RODADA_MEIO, n] });
    e.hist.set(x.nome, l);
  }
  for (const lista of Object.values(v.saidas)) for (const x of lista) {
    if (x.para) continue;
    const l = e.hist.get(x.nome), ant = l?.[l.length - 1];
    if (ant && ant.t === e.temporada && ant.liga) { const a = ant.liga; ant.liga = [a[0], a[1], a[2], a[3], a[4], a[5] ?? 0, RODADA_MEIO]; ant.st = undefined; }
  }
}
const garantir = (pacote: PacoteDados) => { mundo(pacote); if (!estado) sincronizarMundo(pacote, "", 0); return estado!; };
/** Campeonatos que o clube ganhou: liga e temporada (a história inteira da simulação). */
export const campeoesDoClube = (pacote: PacoteDados, clubeId: string) => garantir(pacote).campeoes.filter((x) => x.clube === clubeId);
/** Os garotos da base do clube (15 a 19 anos), do melhor para o pior. Vazio para quem não tem base (amadores, convidados). */
export const baseDoClube = (pacote: PacoteDados, id: string): JogadorNPC[] => [...(garantir(pacote).base[idClube(id)] ?? [])].sort((a, b) => b.ovr - a.ovr);
/** Nível da base do clube (estrutura, cultura, escola do país). */
export const nivelDaBase = (pacote: PacoteDados, id: string): NivelBase | undefined => { mundo(pacote); return ref[idClube(id)]?.nivel; };
/** Quem saiu e quem chegou em cada clube na última virada de temporada (vazio na primeira temporada). */
export const viradaAtual = (pacote: PacoteDados): ViradaMundo => garantir(pacote).virada ?? { saidas: {}, chegadas: {}, destaques: [] };
/** Carreira de um jogador do mundo, temporada a temporada (desde 2026 ou desde que entrou na base). */
export function historicoDe(pacote: PacoteDados, nome: string): { linhas: LinhaHistorico[]; aposentouEm?: number } {
  const e = garantir(pacote), linhas = e.hist.get(nome) ?? [], ap = e.saiu.get(nome);
  return { linhas, ...(ap && !ondeJoga(pacote, nome) ? { aposentouEm: ap.t } : {}) };
}
/** País de um jogador: pelo elenco atual, ou pelo registro guardado. */
export function nacionalidadeDe(pacote: PacoteDados, nome: string): string | undefined {
  for (const c of Object.values(mundo(pacote).clube)) { const j = c.elenco.find((x) => x.nome === nome); if (j) return j.nacionalidade; }
  return garantir(pacote).hist.get(nome)?.at(-1)?.nat;
}
/** Temporada imaginada (jogos, gols, assistências, nota) de uma linha do histórico; sempre a mesma para a mesma carreira. */
export function statsDaLinha(pacote: PacoteDados, nome: string, x: LinhaHistorico): StatsNPC | undefined {
  if (x.st || !x.liga) return x.st;
  const [rank, vagas, forca, media, n, ini, fim] = x.liga;
  x.st = gerarStats(new RNG(`${garantir(pacote).semente}|stats|${x.t}|${x.clubeId}|${nome}`), { nome, posicao: x.posicao as JogadorNPC["posicao"], ovr: x.ovr, idade: x.idade, nacionalidade: "" }, rank, vagas, forca, media, n, ini ?? 0, fim ?? n, x.les);
  return x.st;
}
/** Uma movimentação da janela de transferências do mundo (na virada para a temporada t). */
export interface Negocio { nome: string; posicao: string; idade: number; ovr: number; tipo: "transferencia" | "livre" | "exterior" | "base" | "aposentadoria"; de?: string; para?: string; taxa: number }
/** Todas as movimentações de uma janela: a da virada para a temporada t (t ≥ 1), ou a do meio do ano de t (`meio`). */
export function janelaDoMundo(pacote: PacoteDados, t: number, meio = false): Negocio[] {
  const v = meio ? garantir(pacote).meio[t] : garantir(pacote).viradas[t];
  if (!v) return [];
  const l: Negocio[] = [];
  for (const [para, ch] of Object.entries(v.chegadas)) for (const x of ch) {
    if (x.motivo === "subiu") l.push({ nome: x.nome, posicao: x.posicao, idade: x.idade, ovr: x.ovr, tipo: "base", para, taxa: 0 });
    else if (x.taxa !== undefined) l.push({ nome: x.nome, posicao: x.posicao, idade: x.idade, ovr: x.ovr, tipo: x.taxa ? (x.de ? "transferencia" : "exterior") : "livre", de: x.de, para, taxa: x.taxa });
  }
  for (const [de, sa] of Object.entries(v.saidas)) for (const x of sa) if (x.motivo === "aposentou") l.push({ nome: x.nome, posicao: x.posicao, idade: x.idade, ovr: x.ovr, tipo: "aposentadoria", de, taxa: 0 });
  return l.sort((a, b) => b.taxa - a.taxa || b.ovr - a.ovr);
}
/** O banco de agentes livres agora (sem clube), do melhor para o pior. */
export const agentesLivres = (pacote: PacoteDados) => garantir(pacote).livres.map((x) => ({ nome: x.j.nome, posicao: x.j.posicao, idade: x.j.idade, ovr: x.j.ovr, de: x.de, desde: x.desde })).sort((a, b) => b.ovr - a.ovr);
/** Temporadas que já tiveram janela (para escolher o ano na tela). */
export const janelasFeitas = (pacote: PacoteDados): { t: number; meio: boolean }[] => {
  const e = garantir(pacote);
  return [...Object.keys(e.viradas).map((t) => ({ t: +t, meio: false })), ...Object.keys(e.meio).map((t) => ({ t: +t, meio: true }))].sort((a, b) => b.t - a.t || Number(b.meio) - Number(a.meio));
};
/** A janela do meio do ano da temporada atual, se já fechou (notícias). */
export const janelaDoMeioAtual = (pacote: PacoteDados) => { const e = garantir(pacote); return e.feitoMeio ? e.meio[e.temporada] : undefined; };
// ------------------------------------------------------------------ seleção da rodada / do mês
/** Um jogador numa seleção (ou nas notas de uma rodada): nota da rodada (ou média do mês), gols e assistências. */
export interface Selecionado { nome: string; clubeId: string; posicao: string; nota: number; gols: number; assist: number; jogos?: number; idade?: number; eu?: boolean }
const hashS = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
/** As notas dos outros jogadores da liga numa rodada (quem jogou): a média da temporada dele, os gols e passes da rodada e o dia. */
export function notasDaRodada(pacote: PacoteDados, ligaId: string, rodada: number, clubes?: string[]): Selecionado[] {
  const e = garantir(pacote), l = mundo(pacote).liga[ligaId];
  if (!l) return [];
  const n = rodadasDaLiga(l.clubes.length).length, out: Selecionado[] = [];
  for (const c of l.clubes) {
    if (clubes && !clubes.includes(c.id)) continue;
    for (const j of c.elenco) {
      const linha = (e.hist.get(j.nome) ?? []).find((x) => x.t === e.temporada && x.clubeId === c.id && (!x.liga || ((x.liga[5] ?? 0) <= rodada && rodada < (x.liga[6] ?? n))));
      const st = linha && statsDaLinha(pacote, j.nome, linha);
      if (!st?.jr?.includes(rodada)) continue;
      const g = st.gr!.filter((r) => r === rodada).length, a = st.ar!.filter((r) => r === rodada).length;
      const dia = ((hashS(`${e.semente}|${j.nome}|${rodada}`) % 1000) / 1000 - 0.5) * 1.8;
      out.push({ nome: j.nome, clubeId: c.id, posicao: j.posicao, nota: Math.round(Math.min(9.6, Math.max(4.5, st.n + 1.0 * g + 0.5 * a + dia)) * 10) / 10, gols: g, assist: a });
    }
  }
  return out;
}
/** Os 11 da seleção (4-3-3: goleiro, 2 zagueiros, 2 laterais, volante, 2 meias, 2 pontas, centroavante). */
export const VAGAS_SELECAO: [string, number][] = [["GOL", 1], ["LAT", 2], ["ZAG", 2], ["VOL", 1], ["MEI", 2], ["PON", 2], ["ATA", 1]];
function montarSelecao(lista: Selecionado[]): Selecionado[] {
  const ord = [...lista].sort((a, b) => b.nota - a.nota || b.gols - a.gols || Number(!!b.eu) - Number(!!a.eu));
  return VAGAS_SELECAO.flatMap(([p, k]) => ord.filter((x) => x.posicao === p).slice(0, k));
}
/** Seleção da rodada da liga. `extra`: o jogador do usuário, com a nota dele na rodada. */
export function selecaoDaRodada(pacote: PacoteDados, ligaId: string, rodada: number, extra: Selecionado[] = []): Selecionado[] {
  return montarSelecao([...notasDaRodada(pacote, ligaId, rodada), ...extra]);
}
/** Seleção do mês (quatro rodadas): média de quem jogou pelo menos três, com um bônus pelos gols e passes. */
export function selecaoDoMes(pacote: PacoteDados, ligaId: string, rodadas: number[], extra: Selecionado[] = []): Selecionado[] {
  const soma = new Map<string, Selecionado>();
  for (const x of [...rodadas.flatMap((r) => notasDaRodada(pacote, ligaId, r)), ...extra]) {
    const k = `${x.nome}|${x.clubeId}`, y = soma.get(k);
    if (y) { y.nota += x.nota; y.gols += x.gols; y.assist += x.assist; y.jogos = (y.jogos ?? 1) + (x.jogos ?? 1); } else soma.set(k, { ...x, jogos: x.jogos ?? 1 });
  }
  const minimo = Math.max(1, rodadas.length - 1);
  const lista = [...soma.values()].filter((x) => (x.jogos ?? 0) >= minimo).map((x) => ({ ...x, nota: Math.round((x.nota / x.jogos! + 0.05 * (x.gols + x.assist * 0.5)) * 100) / 100 }));
  return montarSelecao(lista);
}
/** Prêmios da temporada de uma liga: seleção do campeonato, craque, artilheiro, garçom e revelação (até 21 anos). */
export interface PremiosLiga { ligaId: string; ano: number; selecao: Selecionado[]; craque?: Selecionado; artilheiro?: Selecionado; garcom?: Selecionado; revelacao?: Selecionado }
export function premiosDaLiga(pacote: PacoteDados, ligaId: string, ano: number, extra: Selecionado[] = []): PremiosLiga {
  const e = garantir(pacote), l = mundo(pacote).liga[ligaId];
  if (!l) return { ligaId, ano, selecao: [] };
  const n = rodadasDaLiga(l.clubes.length).length, minimo = Math.ceil(n * 0.5);
  const lista: Selecionado[] = [];
  for (const c of l.clubes) for (const j of c.elenco) {
    const linhas = (e.hist.get(j.nome) ?? []).filter((x) => x.t === e.temporada && l.clubes.some((k) => k.id === x.clubeId));
    let jogos = 0, gols = 0, assist = 0, somaNota = 0;
    for (const x of linhas) { const st = statsDaLinha(pacote, j.nome, x); if (!st) continue; jogos += st.j; gols += st.g; assist += st.a; somaNota += st.n * st.j; }
    if (jogos) lista.push({ nome: j.nome, clubeId: c.id, posicao: j.posicao, nota: Math.round((somaNota / jogos) * 100) / 100, gols, assist, jogos, idade: j.idade });
  }
  const todos = [...lista, ...extra];
  const regulares = todos.filter((x) => (x.jogos ?? 0) >= minimo);
  const melhor = (l2: Selecionado[], k: (x: Selecionado) => number) => [...l2].sort((a, b) => k(b) - k(a) || Number(!!b.eu) - Number(!!a.eu))[0];
  // craque: a nota pesa, e gols e passes desempatam (um pouco de bônus para quem decide)
  const craque = melhor(regulares, (x) => x.nota + 0.02 * (x.gols + 0.5 * x.assist));
  return {
    ligaId, ano, selecao: montarSelecao(regulares), craque,
    artilheiro: melhor(todos, (x) => x.gols * 100 - (x.jogos ?? 0)), garcom: melhor(todos, (x) => x.assist * 100 - (x.jogos ?? 0)),
    revelacao: melhor(regulares.filter((x) => (x.idade ?? 99) <= 21), (x) => x.nota + 0.02 * (x.gols + 0.5 * x.assist)),
  };
}
/** Todos os jogadores das ligas com a temporada atual (para os prêmios do ano): números da liga, nível, idade, nacionalidade. */
export interface Candidato extends Selecionado { ligaId: string; ovr: number; nacionalidade: string; minimo: number }
export function candidatosDoAno(pacote: PacoteDados): Candidato[] {
  const e = garantir(pacote), m = mundo(pacote), out: Candidato[] = [];
  for (const [ligaId, l] of Object.entries(m.liga)) {
    if (ligaId === "SELECOES" || ligaId === "CONV") continue;
    const n = rodadasDaLiga(l.clubes.length).length, minimo = Math.ceil(n * 0.5);
    for (const c of l.clubes) for (const j of c.elenco) {
      if (j.ovr < 68) continue; // ninguém abaixo disso entra em lista de prêmio do mundo
      const linhas = (e.hist.get(j.nome) ?? []).filter((x) => x.t === e.temporada && x.clubeId === c.id);
      let jogos = 0, gols = 0, assist = 0, somaNota = 0;
      for (const x of linhas) { const st = statsDaLinha(pacote, j.nome, x); if (!st) continue; jogos += st.j; gols += st.g; assist += st.a; somaNota += st.n * st.j; }
      if (jogos >= minimo) out.push({ nome: j.nome, clubeId: c.id, posicao: j.posicao, nota: Math.round((somaNota / jogos) * 100) / 100, gols, assist, jogos, idade: j.idade, ligaId, ovr: j.ovr, nacionalidade: j.nacionalidade, minimo });
    }
  }
  return out;
}
/** Quem foi convocado para a seleção (nome está no elenco atual da seleção do país). */
export const naSelecao = (pacote: PacoteDados, pais: string, nome: string) => !!mundo(pacote).clube[idSelecao(pais)]?.elenco.some((x) => x.nome === nome);
export { montarSelecao };
export interface LinhaRanking { nome: string; clubeId: string; valor: number; jogos: number }
/** Artilharia ou assistências da liga até a rodada `feitas` (os outros jogadores; o do usuário entra na tela). */
export function rankingDaLiga(pacote: PacoteDados, ligaId: string, feitas: number, tipo: "g" | "a", limite = 10): LinhaRanking[] {
  const e = garantir(pacote), l = mundo(pacote).liga[ligaId];
  if (!l) return [];
  const n = rodadasDaLiga(l.clubes.length).length, lista: LinhaRanking[] = [];
  for (const c of l.clubes) for (const j of c.elenco) {
    // a temporada inteira na liga (quem trocou de time no meio do ano soma as duas partes, se as duas foram nesta liga)
    const linhas = (e.hist.get(j.nome) ?? []).filter((x) => x.t === e.temporada && l.clubes.some((k) => k.id === x.clubeId));
    let valor = 0, jogos = 0;
    for (const linha of linhas) { const st = statsDaLinha(pacote, j.nome, linha); if (!st) continue; const x = statsAte(st, feitas, n); valor += x[tipo]; jogos += x.j; }
    if (valor > 0) lista.push({ nome: j.nome, clubeId: c.id, valor, jogos });
  }
  return lista.sort((a, b) => b.valor - a.valor || a.jogos - b.jogos).slice(0, limite);
}
let indice: Map<string, { clubeId: string; base: boolean }> | undefined;
/** Onde joga um jogador hoje (pelo nome): clube, ou base do clube. undefined = aposentado ou sem clube. */
export function ondeJoga(pacote: PacoteDados, nome: string) {
  const e = garantir(pacote), m = mundo(pacote);
  if (!indice) {
    indice = new Map();
    for (const c of Object.values(m.clube)) if (c.ligaId !== "SELECOES") for (const j of c.elenco) indice.set(j.nome, { clubeId: c.id, base: false });
    for (const [id, b] of Object.entries(e.base)) for (const j of b) indice.set(j.nome, { clubeId: id, base: true });
  }
  return indice.get(nome);
}

/** Padrão das camisas da Série A (só cores e desenho, nada de escudo). */
const PADRAO_BRA1: Record<string, string> = {
  FLA: "listrasH", FLU: "listrasV", BOT: "listrasV", VAS: "faixa", GRE: "listrasV", CAM: "listrasV", BAH: "listrasV", VIT: "listrasV", CAP: "diagonais",
  SPA: "faixaH", SAN: "lisa", PAL: "lisa", COR: "lisa", INT: "lisa", CRU: "lisa", CFC: "duasFaixasH", RBB: "lisa", MIR: "lisa", REM: "lisa", CHA: "lisa",
};

/** Clubes de saves antigos (antes das ligas reais) → clube atual equivalente. */
export const CLUBE_ANTIGO: Record<string, string> = {
  "E1-RMD": "ES-RMA", "E1-BAR": "ES-BAR", "E1-MCI": "EN-MCI", "E1-MUN": "EN-MUN", "E1-LIV": "EN-LIV", "E1-ARS": "EN-ARS", "E1-CHE": "EN-CHE", "E1-TOT": "EN-TOT",
  "E1-BAY": "DE-FCB", "E1-BVB": "DE-BVB", "E1-PSG": "FR-PSG", "E1-JUV": "IT-JUV", "E1-INT": "IT-INT", "E1-MIL": "IT-MIL", "E1-NAP": "IT-NAP", "E1-ROM": "IT-ROM",
  "E1-ATM": "ES-ATM", "E1-BEN": "PT-SLB", "E1-POR": "PT-FCP", "E1-AJX": "NL-AJA",
  "E2-SEV": "ES-SEV", "E2-VAL": "ES-VAL", "E2-VIL": "ES-VIL", "E2-OM": "FR-OM", "E2-LYO": "FR-LYO", "E2-MON": "FR-ASM", "E2-LIL": "FR-LIL", "E2-SCP": "PT-SCP",
  "E2-PSV": "NL-PSV", "E2-FEY": "NL-FEY", "E2-LEV": "DE-B04", "E2-RBL": "DE-RBL", "E2-SGE": "DE-SGE", "E2-LAZ": "IT-LAZ", "E2-ATA": "IT-ATA", "E2-FIO": "IT-FIO",
  "E2-CEL": "NL-AZ", "E2-GAL": "PT-SCB",
  "AR-HIL": "SA-HIL", "AR-NAS": "SA-NAS", "AR-ITT": "SA-ITT", "AR-AHL": "SA-AHL", "AR-SHA": "SA-SHA", "AR-ETT": "SA-ETT", "AR-QAD": "SA-QAD", "AR-TAA": "SA-TAA",
  "AR-FAT": "SA-FAT", "AR-FAY": "SA-FAY", "AR-DAM": "SA-ABH", "AR-KHA": "SA-KHA", "AR-RAE": "SA-HAZ", "AR-WEH": "SA-FAI", "AR-OKH": "SA-DIR", "AR-RIY": "SA-RIY",
  "AR-KHO": "SA-KHO", "AR-ORO": "SA-NEO",
  "B2-PON": "PON", "B2-GUA": "SBE", "B2-SPT": "SPT", "B2-NAU": "NAU", "B2-CEA": "CEA", "B2-FOR": "FOR", "B2-GOI": "GOI", "B2-ACG": "ACG", "B2-VNO": "VNO",
  "B2-AME": "AME", "B2-AVA": "AVA", "B2-CRI": "CRI", "B2-PAY": "CUI", "B2-OPE": "OPE", "B2-CRB": "CRB", "B2-NOV": "NOV", "B2-AMZ": "JUV", "B2-FER": "LON",
  "B2-VRE": "ATH", "B2-BFR": "BFC",
};
export const idClube = (id: string) => CLUBE_ANTIGO[id] ?? id;
export const infoClube = (pacote: PacoteDados, id: string): InfoClube => mundo(pacote).info[idClube(id)];
export const ligaDoClube = (pacote: PacoteDados, id: string): Liga => mundo(pacote).liga[infoClube(pacote, id).ligaId];

// ------------------------------------------------------------------ perfil do clube: linhas do histórico por clube
let indiceClubes: { estado: unknown; mapa: Map<string, { nome: string; x: LinhaHistorico }[]> } | undefined;
/** Todas as temporadas (de todos os jogadores do mundo) passadas por um clube, para títulos e o time de todos os tempos. */
export function linhasDoClube(pacote: PacoteDados, clubeId: string): { nome: string; x: LinhaHistorico }[] {
  const e = garantir(pacote);
  if (!indiceClubes || indiceClubes.estado !== e) {
    const mapa = new Map<string, { nome: string; x: LinhaHistorico }[]>();
    for (const [nome, ls] of e.hist) for (const x of ls) {
      const lista = mapa.get(x.clubeId) ?? [];
      lista.push({ nome, x });
      mapa.set(x.clubeId, lista);
    }
    indiceClubes = { estado: e, mapa };
  }
  return indiceClubes.mapa.get(clubeId) ?? [];
}
/** Um familiar que joga de verdade (irmão profissional) é um jogador do mundo: entra no elenco do clube dele e tem as
 *  temporadas na história, como qualquer um. Tira-o de qualquer outro clube. Chamado a cada sincronização (o mundo é
 *  refeito a partir da semente, então ele volta sempre). `clubeId` vazio = fora do mundo (parou, base, amador). */
export function encaixarNoMundo(pacote: PacoteDados, j: { nome: string; posicao: string; ovr: number; pot: number; idade: number; nacionalidade: string }, clubeId: string | undefined, temporadas: { t: number; clubeId: string; ovr: number; pot: number; posicao: string; idade: number }[]) {
  const e = garantir(pacote), m = mundo(pacote);
  for (const c of Object.values(m.clube)) if (c.id !== clubeId && c.elenco.some((x) => x.nome === j.nome)) c.elenco = c.elenco.filter((x) => x.nome !== j.nome);
  const clube = clubeId ? m.clube[idClube(clubeId)] : undefined;
  if (clube) {
    const no = clube.elenco.find((x) => x.nome === j.nome);
    const dados = { nome: j.nome, posicao: j.posicao as JogadorNPC["posicao"], ovr: j.ovr, pot: j.pot, idade: j.idade, nacionalidade: j.nacionalidade, numero: numeroDeNome(j.nome) };
    if (no) Object.assign(no, dados); else clube.elenco.push(dados);
  }
  // a história: uma linha por temporada, no clube daquela temporada (a da temporada atual leva a posição na liga)
  const l = (e.hist.get(j.nome) ?? []).filter((x) => !temporadas.some((r) => r.t === x.t && r.clubeId !== x.clubeId));
  for (const r of temporadas) {
    if (l.some((x) => x.t === r.t && x.clubeId === r.clubeId)) continue;
    const c = m.clube[idClube(r.clubeId)], lg = ligaDoClube(pacote, r.clubeId);
    let liga: LinhaHistorico["liga"];
    if (c && lg) {
      const n = rodadasDaLiga(lg.clubes.length).length, media = lg.clubes.reduce((a, k) => a + k.forca, 0) / lg.clubes.length;
      const rank = c.elenco.filter((y) => y.posicao === r.posicao && y.ovr > r.ovr).length;
      liga = [rank, VAGAS[r.posicao] ?? 1, c.forca, media, n];
    }
    l.push({ t: r.t, clubeId: r.clubeId, idade: r.idade, ovr: r.ovr, pot: r.pot, posicao: r.posicao, base: false, nat: j.nacionalidade, liga });
  }
  e.hist.set(j.nome, l.sort((a, b) => a.t - b.t));
}
const numeroDeNome = (nome: string) => { let h = 0; for (const ch of nome) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return [7, 9, 10, 11, 8, 17, 19, 21, 22][h % 9]; };
/** Todas as temporadas dos jogadores de um país, em qualquer clube: a base da seleção de todos os tempos. */
export function linhasDoPais(pacote: PacoteDados, pais: string): { nome: string; x: LinhaHistorico }[] {
  const out: { nome: string; x: LinhaHistorico }[] = [];
  for (const [nome, ls] of garantir(pacote).hist) for (const x of ls) if (x.nat === pais) out.push({ nome, x });
  return out;
}
