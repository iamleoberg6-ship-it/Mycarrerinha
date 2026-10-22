// O mundo jogável: a Série A do pacote e mais 12 ligas reais em paródia (data/mundo-2026.json, gerado por
// scripts/construir_mundo.py a partir dos elencos de out/2026). Nome, cores, estádio e padrão de camisa de cada clube;
// elencos com os jogadores reais parodiados. Os mesmos clubes e jogadores em qualquer carreira.
import type { Posicao } from "./atributos.js";
import { ligaDoPacote, type Clube, type JogadorNPC, type Liga, type PacoteDados } from "./liga.js";
import { LIGAS, LIGA_INFO, type InfoLiga } from "./ligas.js";
import dados from "../data/mundo-2026.json";
import { CONVIDADOS, clubeConvidado } from "./convidados.js";
import { RNG } from "./rng.js";
import { forcaDoElenco } from "./liga.js";
import { criarBase, nivelBase, virarTemporada, type GruposMundo, type Referencia, type ViradaMundo, type NivelBase } from "./evolucao.js";

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
  for (const li of LIGAS) {
    if (li.id === "BRA1") {
      const l = ligaDoPacote(pacote);
      ligas.push(l);
      type CP = { id: string; nome: string; apelido: string; cores: string[]; forca: number; cidade: string; estadio: { nome: string; capacidade?: number } };
      for (const c of pacote.clubes as unknown as CP[]) info[c.id] = { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca, cidade: c.cidade, estadio: c.estadio.nome, capacidade: c.estadio.capacidade ?? 0, padrao: PADRAO_BRA1[c.id] ?? "lisa", ligaId: "BRA1", pais: "BRA" };
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
  original = new Map(Object.values(m.clube).map((c) => [c, c.elenco.map((j) => ({ ...j }))]));
  ref = Object.fromEntries(Object.values(m.clube).map((c) => [c.id, { forca: c.forca, top: forcaDoElenco(c.elenco), tamanho: c.elenco.length, nivel: nivelBase(c.id, info[c.id]?.forca ?? c.forca, c.pais) }]));
  grupos = { pro: ligas.flatMap((l) => l.clubes), convidados: conv, amadores: amadoras.flatMap((l) => l.clubes), ligas: [...ligas.map((l) => l.clubes), ...amadoras.map((l) => l.clubes), conv] };
  estado = undefined;
  return m;
}

// ------------------------------------------------------------------ o mundo ao longo das temporadas
let original = new Map<Clube, JogadorNPC[]>(), ref: Record<string, Referencia> = {}, grupos: GruposMundo = { pro: [], convidados: [], amadores: [], ligas: [] };
let estado: { semente: string; temporada: number; base: Record<string, JogadorNPC[]>; usados: Set<string>; virada?: ViradaMundo } | undefined;
let versao = 0;
/** Muda a cada vez que o mundo muda (caches de quem lê o mundo comparam com isto). */
export const versaoMundo = () => versao;

/** Põe o mundo na temporada t da carreira de semente `semente` (0 = elencos reais de 2026, com as bases sorteadas). */
export function sincronizarMundo(pacote: PacoteDados, semente: string, temporada: number) {
  const m = mundo(pacote);
  if (estado && estado.semente === semente && estado.temporada === temporada) return;
  if (!estado || estado.semente !== semente || estado.temporada > temporada) {
    for (const [c, el] of original) { c.elenco = el.map((j) => ({ ...j })); c.forca = ref[c.id].forca; }
    const usados = new Set(Object.values(m.clube).flatMap((c) => c.elenco.map((j) => j.nome)));
    const base: Record<string, JogadorNPC[]> = {};
    for (const c of grupos.pro) base[c.id] = criarBase(new RNG(`${semente}|base|${c.id}`), ref[c.id].nivel, c.pais, usados);
    estado = { semente, temporada: 0, base, usados };
  }
  while (estado.temporada < temporada) { estado.temporada++; estado.virada = virarTemporada(grupos, estado.base, ref, semente, estado.temporada, estado.usados); }
  versao++; indice = undefined;
}
const garantir = (pacote: PacoteDados) => { mundo(pacote); if (!estado) sincronizarMundo(pacote, "", 0); return estado!; };
/** Os garotos da base do clube (15 a 19 anos), do melhor para o pior. Vazio para quem não tem base (amadores, convidados). */
export const baseDoClube = (pacote: PacoteDados, id: string): JogadorNPC[] => [...(garantir(pacote).base[idClube(id)] ?? [])].sort((a, b) => b.ovr - a.ovr);
/** Nível da base do clube (estrutura, cultura, escola do país). */
export const nivelDaBase = (pacote: PacoteDados, id: string): NivelBase | undefined => { mundo(pacote); return ref[idClube(id)]?.nivel; };
/** Quem saiu e quem chegou em cada clube na última virada de temporada (vazio na primeira temporada). */
export const viradaAtual = (pacote: PacoteDados): ViradaMundo => garantir(pacote).virada ?? { saidas: {}, chegadas: {}, destaques: [] };
let indice: Map<string, { clubeId: string; base: boolean }> | undefined;
/** Onde joga um jogador hoje (pelo nome): clube, ou base do clube. undefined = aposentado ou sem clube. */
export function ondeJoga(pacote: PacoteDados, nome: string) {
  const e = garantir(pacote), m = mundo(pacote);
  if (!indice) {
    indice = new Map();
    for (const c of Object.values(m.clube)) for (const j of c.elenco) indice.set(j.nome, { clubeId: c.id, base: false });
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
