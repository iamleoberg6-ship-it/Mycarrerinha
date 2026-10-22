// O mundo jogável: a Série A do pacote e mais 12 ligas reais em paródia (data/mundo-2026.json, gerado por
// scripts/construir_mundo.py a partir dos elencos de out/2026). Nome, cores, estádio e padrão de camisa de cada clube;
// elencos com os jogadores reais parodiados. Os mesmos clubes e jogadores em qualquer carreira.
import type { Posicao } from "./atributos.js";
import { ligaDoPacote, type Clube, type JogadorNPC, type Liga, type PacoteDados } from "./liga.js";
import { LIGAS, LIGA_INFO, type InfoLiga } from "./ligas.js";
import dados from "../data/mundo-2026.json";
import { CONVIDADOS, clubeConvidado } from "./convidados.js";

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
  return m;
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
