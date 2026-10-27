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
import { RNG } from "./rng.js";
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
      ligas.push(ligaDe(li, clubes));
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
  ref = Object.fromEntries(Object.values(m.clube).map((c) => [c.id, { forca: c.forca, top: forcaDoElenco(c.elenco), tamanho: c.elenco.length, nivel: nivelBase(c.id, info[c.id]?.forca ?? c.forca, c.pais) }]));
  grupos = { pro: ligas.flatMap((l) => l.clubes), convidados: conv, amadores: amadoras.flatMap((l) => l.clubes), ligas: [...ligas.map((l) => l.clubes), ...amadoras.map((l) => l.clubes), conv] };
  estado = undefined;
  return m;
}

// ------------------------------------------------------------------ seleções nacionais
/** Seleções: [país, nome, apelido, cores, força base (quando o país tem poucos jogadores no mundo do jogo)]. */
const SELECOES: [string, string, string, string[], number][] = [
  ["BRA", "Seleção Brasileira", "Canarinho", ["#F5C400", "#0B7A3B"], 86], ["ARG", "Seleção Argentina", "Albiceleste", ["#6CB4E4", "#FFFFFF"], 87],
  ["URU", "Seleção Uruguaia", "Celeste", ["#6CB4E4", "#111111"], 80], ["COL", "Seleção Colombiana", "Cafeteros", ["#F5C400", "#0B3D91"], 80],
  ["CHI", "Seleção Chilena", "La Roja", ["#C8102E", "#0B3D91"], 74], ["PAR", "Seleção Paraguaia", "Albirroja", ["#C8102E", "#FFFFFF"], 75],
  ["ECU", "Seleção Equatoriana", "La Tri", ["#F5C400", "#0B3D91"], 78], ["PER", "Seleção Peruana", "La Blanquirroja", ["#FFFFFF", "#C8102E"], 72],
  ["MEX", "Seleção Mexicana", "El Tri", ["#0B7A3B", "#FFFFFF"], 77], ["USA", "Seleção dos EUA", "USMNT", ["#FFFFFF", "#0B2F7A"], 78],
  ["CAN", "Seleção Canadense", "Canucks", ["#C8102E", "#FFFFFF"], 75], ["ENG", "Seleção Inglesa", "Three Lions", ["#FFFFFF", "#0B2F7A"], 87],
  ["FRA", "Seleção Francesa", "Les Bleus", ["#0B2F7A", "#FFFFFF"], 88], ["ESP", "Seleção Espanhola", "La Roja", ["#C8102E", "#F5C400"], 88],
  ["GER", "Seleção Alemã", "Mannschaft", ["#FFFFFF", "#111111"], 85], ["ITA", "Seleção Italiana", "Azzurra", ["#1C4FA1", "#FFFFFF"], 83],
  ["POR", "Seleção Portuguesa", "Seleção das Quinas", ["#C8102E", "#0B7A3B"], 86], ["NED", "Seleção Holandesa", "Laranja", ["#F58220", "#FFFFFF"], 84],
  ["BEL", "Seleção Belga", "Diabos Vermelhos", ["#C8102E", "#111111"], 82], ["CRO", "Seleção Croata", "Vatreni", ["#FFFFFF", "#C8102E"], 81],
  ["DEN", "Seleção Dinamarquesa", "Dinamite", ["#C8102E", "#FFFFFF"], 80], ["SUI", "Seleção Suíça", "Nati", ["#C8102E", "#FFFFFF"], 79],
  ["SRB", "Seleção Sérvia", "Orlovi", ["#C8102E", "#0B3D91"], 77], ["POL", "Seleção Polonesa", "Biało-czerwoni", ["#FFFFFF", "#C8102E"], 77],
  ["TUR", "Seleção Turca", "Crescentes", ["#C8102E", "#FFFFFF"], 79], ["NOR", "Seleção Norueguesa", "Løvene", ["#C8102E", "#0B2F7A"], 80],
  ["SWE", "Seleção Sueca", "Blågult", ["#F5C400", "#1C4FA1"], 77], ["AUT", "Seleção Austríaca", "Das Team", ["#C8102E", "#FFFFFF"], 79],
  ["SCO", "Seleção Escocesa", "Tartan Army", ["#0B2F7A", "#FFFFFF"], 75], ["UKR", "Seleção Ucraniana", "Zbirna", ["#F5C400", "#1C4FA1"], 76],
  ["MAR", "Seleção Marroquina", "Leões do Atlas", ["#C8102E", "#0B7A3B"], 81], ["SEN", "Seleção Senegalesa", "Leões de Teranga", ["#FFFFFF", "#0B7A3B"], 79],
  ["NGA", "Seleção Nigeriana", "Super Águias", ["#0B7A3B", "#FFFFFF"], 77], ["GHA", "Seleção Ganesa", "Estrelas Negras", ["#FFFFFF", "#111111"], 75],
  ["CIV", "Seleção Marfinense", "Elefantes", ["#F58220", "#0B7A3B"], 78], ["CMR", "Seleção Camaronesa", "Leões Indomáveis", ["#0B7A3B", "#C8102E"], 75],
  ["EGY", "Seleção Egípcia", "Faraós", ["#C8102E", "#FFFFFF"], 76], ["ALG", "Seleção Argelina", "Raposas do Deserto", ["#FFFFFF", "#0B7A3B"], 76],
  ["TUN", "Seleção Tunisiana", "Águias de Cartago", ["#C8102E", "#FFFFFF"], 73], ["JPN", "Seleção Japonesa", "Samurai Blue", ["#0B2F7A", "#FFFFFF"], 80],
  ["KOR", "Seleção Sul-Coreana", "Tigres da Ásia", ["#C8102E", "#0B2F7A"], 78], ["KSA", "Seleção Saudita", "Falcões Verdes", ["#0B7A3B", "#FFFFFF"], 72],
  ["AUS", "Seleção Australiana", "Socceroos", ["#F5C400", "#0B7A3B"], 74], ["IRN", "Seleção Iraniana", "Team Melli", ["#FFFFFF", "#C8102E"], 75],
  ["QAT", "Seleção do Catar", "Al-Annabi", ["#7A1E2B", "#FFFFFF"], 70], ["NZL", "Seleção Neozelandesa", "All Whites", ["#FFFFFF", "#111111"], 66],
  ["BOL", "Seleção Boliviana", "La Verde", ["#0B7A3B", "#FFFFFF"], 68], ["VEN", "Seleção Venezuelana", "La Vinotinto", ["#7A1E2B", "#FFFFFF"], 71],
  ["CRC", "Seleção Costarriquenha", "Los Ticos", ["#C8102E", "#0B2F7A"], 70], ["PAN", "Seleção Panamenha", "Los Canaleros", ["#C8102E", "#FFFFFF"], 71],
  ["JAM", "Seleção Jamaicana", "Reggae Boyz", ["#F5C400", "#0B7A3B"], 69], ["HON", "Seleção Hondurenha", "Los Catrachos", ["#1C4FA1", "#FFFFFF"], 67],
  ["MLI", "Seleção Malinesa", "Águias", ["#0B7A3B", "#F5C400"], 74], ["RSA", "Seleção Sul-Africana", "Bafana Bafana", ["#F5C400", "#0B7A3B"], 71],
  ["IRQ", "Seleção Iraquiana", "Leões da Mesopotâmia", ["#FFFFFF", "#0B7A3B"], 70], ["UAE", "Seleção dos Emirados", "Al-Abyad", ["#FFFFFF", "#C8102E"], 68],
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
let original = new Map<Clube, JogadorNPC[]>(), ref: Record<string, Referencia> = {}, grupos: GruposMundo = { pro: [], convidados: [], amadores: [], ligas: [] };
let estado: { semente: string; temporada: number; base: Record<string, JogadorNPC[]>; usados: Set<string>; virada?: ViradaMundo; viradas: Record<number, ViradaMundo>; meio: Record<number, ViradaMundo>; feitoMeio: boolean; livres: AgenteLivre[]; hist: Map<string, LinhaHistorico[]>; saiu: Map<string, { t: number; motivo: string }> } | undefined;
/** Uma temporada na carreira de um jogador do mundo. */
/** `liga`: o que a temporada imaginada precisa (fila na posição, titulares, força do clube, média da liga, rodadas);
 *  as estatísticas são sorteadas só quando alguém olha (st guarda o resultado). */
export interface LinhaHistorico { t: number; clubeId: string; idade: number; ovr: number; pot: number; posicao: string; base: boolean; meio?: boolean; liga?: [number, number, number, number, number, number?, number?]; st?: StatsNPC }
const VAGAS: Record<string, number> = { GOL: 1, ...VAGAS_433 };
function registrarTemporada(m: Mundo) {
  const e = estado!, add = (j: JogadorNPC, clubeId: string, base: boolean) => {
    const l = e.hist.get(j.nome) ?? [];
    if (!l.length || l[l.length - 1].t !== e.temporada) l.push({ t: e.temporada, clubeId, idade: j.idade, ovr: j.ovr, pot: j.pot ?? j.ovr, posicao: j.posicao, base });
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
export function sincronizarMundo(pacote: PacoteDados, semente: string, temporada: number, semana = 0) {
  const m = mundo(pacote), comMeio = semana >= SEMANA_JANELA_MEIO;
  if (estado && estado.semente === semente && estado.temporada === temporada && estado.feitoMeio === comMeio) return;
  if (!estado || estado.semente !== semente || estado.temporada > temporada || (estado.temporada === temporada && estado.feitoMeio && !comMeio)) {
    for (const [c, el] of original) { c.elenco = el.map((j) => ({ ...j })); c.forca = ref[c.id].forca; }
    for (const id of Object.keys(m.clube)) if (id.startsWith("NAT-")) { delete m.clube[id]; delete m.info[id]; }
    const usados = new Set([...Object.values(m.clube).flatMap((c) => c.elenco.map((j) => j.nome)), ...nomesSelecao]);
    const base: Record<string, JogadorNPC[]> = {};
    for (const c of grupos.pro) base[c.id] = criarBase(new RNG(`${semente}|base|${c.id}`), ref[c.id].nivel, c.pais, usados, c.id);
    estado = { semente, temporada: 0, base, usados, viradas: {}, meio: {}, feitoMeio: false, livres: [], hist: new Map(), saiu: new Map() };
    registrarTemporada(m);
  }
  const e = estado;
  const fazerMeio = () => { e.meio[e.temporada] = virarTemporada(grupos, e.base, ref, semente, e.temporada, e.usados, true, e.livres); e.feitoMeio = true; registrarMeio(m); };
  while (e.temporada < temporada) {
    if (!e.feitoMeio) fazerMeio();
    e.temporada++; e.feitoMeio = false;
    e.virada = e.viradas[e.temporada] = virarTemporada(grupos, e.base, ref, semente, e.temporada, e.usados, false, e.livres); registrarTemporada(m);
  }
  if (comMeio && !e.feitoMeio) fazerMeio();
  montarSelecoes(m);
  versao++; indice = undefined;
}
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
/** Temporada imaginada (jogos, gols, assistências, nota) de uma linha do histórico; sempre a mesma para a mesma carreira. */
export function statsDaLinha(pacote: PacoteDados, nome: string, x: LinhaHistorico): StatsNPC | undefined {
  if (x.st || !x.liga) return x.st;
  const [rank, vagas, forca, media, n, ini, fim] = x.liga;
  x.st = gerarStats(new RNG(`${garantir(pacote).semente}|stats|${x.t}|${x.clubeId}|${nome}`), { nome, posicao: x.posicao as JogadorNPC["posicao"], ovr: x.ovr, idade: x.idade, nacionalidade: "" }, rank, vagas, forca, media, n, ini ?? 0, fim ?? n);
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
  FLA: "listrasH", FLU: "listrasV", BOT: "listrasV", VAS: "faixa", GRE: "listrasV", CAM: "listrasV", BAH: "listrasH", VIT: "listrasH", CAP: "listrasH",
  SPA: "faixaH", SAN: "lisa", PAL: "lisa", COR: "lisa", INT: "lisa", CRU: "lisa", CFC: "lisa", RBB: "lisa", MIR: "lisa", REM: "lisa", CHA: "lisa",
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
