// As ligas do mundo (só os metadados: nome-paródia, prestígio, salários, bolas). Os clubes ficam em mundo.ts.
// Profissionais: as 13 grandes, a liga americana e as Séries C e D. Amadoras (sem salário, fora do mercado): várzea das capitais,
// colegial e universitário dos EUA.
import type { Liga } from "./liga.js";

export type Regiao = "BRA" | "SUL" | "EUR" | "ARA" | "NAM";
export interface InfoLiga {
  id: string; nome: string; curto: string; pais: string; regiao: Regiao; divisao: number;
  /** liga amadora: não paga salário e não entra no mercado (várzea, colegial, universitário) */
  amador?: boolean;
  /** prestígio: 1 = cinco grandes, 2 = Série A, Portugal, Holanda, 3 = Golfo, Argentina, 2ª inglesa, 4 = segundas divisões */
  nivel: Liga["nivel"]; fLiga: number; fSalario: number; rebaixados: number;
  /** liga de cima/de baixo na pirâmide do país (acesso e rebaixamento) */
  acima?: string; abaixo?: string;
  bolas: [string, string][];
}

/** Cidades com liga de várzea (o jogador que começa na várzea joga na da sua cidade). */
export const CIDADES_VARZEA: Record<string, string> = { SP: "São Paulo", RJ: "Rio de Janeiro", BH: "Belo Horizonte", POA: "Porto Alegre", SSA: "Salvador", REC: "Recife", FOR: "Fortaleza", CWB: "Curitiba" };
/** "do Rio de Janeiro", "de São Paulo"… */
export const DA_CIDADE: Record<string, string> = { SP: "de São Paulo", RJ: "do Rio de Janeiro", BH: "de Belo Horizonte", POA: "de Porto Alegre", SSA: "de Salvador", REC: "do Recife", FOR: "de Fortaleza", CWB: "de Curitiba" };
export const NA_CIDADE: Record<string, string> = { SP: "em São Paulo", RJ: "no Rio de Janeiro", BH: "em Belo Horizonte", POA: "em Porto Alegre", SSA: "em Salvador", REC: "no Recife", FOR: "em Fortaleza", CWB: "em Curitiba" };
const GRUPO_D = ["Norte", "Norte e Nordeste", "Nordeste", "Nordeste", "Nordeste e Centro-Oeste", "Centro-Oeste e Sudeste", "Sudeste", "Sul"];
export const ehSerieD = (id: string | undefined) => !!id && id.startsWith("BRA4");

export const LIGAS: InfoLiga[] = [
  { id: "BRA1", nome: "Campeonato Nacional Série A", curto: "Série A", pais: "BRA", regiao: "BRA", divisao: 1, nivel: 2, fLiga: 0.7, fSalario: 1, rebaixados: 4, abaixo: "BRA2", bolas: [["#2E7D4F", "#F2B705"], ["#1F3A5F", "#E3B341"], ["#C0392B", "#1F3A5F"], ["#18A0A8", "#F08A24"], ["#6A3FA0", "#F2B705"]] },
  { id: "BRA2", nome: "Campeonato Nacional Série B", curto: "Série B", pais: "BRA", regiao: "BRA", divisao: 2, nivel: 4, fLiga: 0.5, fSalario: 0.6, rebaixados: 4, acima: "BRA1", abaixo: "BRA3", bolas: [["#F2B705", "#1F3A5F"], ["#2B2B2B", "#2E7D4F"]] },
  { id: "ENG1", nome: "Premiê Liga Inglesa", curto: "Premiê Liga", pais: "ENG", regiao: "EUR", divisao: 1, nivel: 1, fLiga: 1.1, fSalario: 1.5, rebaixados: 3, abaixo: "ENG2", bolas: [["#3D195B", "#00FF85"], ["#1F3A5F", "#E90052"], ["#04F5FF", "#3D195B"], ["#F2B705", "#3D195B"]] },
  { id: "ENG2", nome: "Championchip Inglês", curto: "Championchip", pais: "ENG", regiao: "EUR", divisao: 2, nivel: 3, fLiga: 0.8, fSalario: 0.9, rebaixados: 3, acima: "ENG1", bolas: [["#1F3A5F", "#E3B341"], ["#C0392B", "#2B2B2B"]] },
  { id: "ESP1", nome: "La Lyga Hispânica", curto: "La Lyga", pais: "ESP", regiao: "EUR", divisao: 1, nivel: 1, fLiga: 1.0, fSalario: 1.3, rebaixados: 3, abaixo: "ESP2", bolas: [["#FF4B44", "#1F1F1F"], ["#F2B705", "#C0392B"], ["#18A0A8", "#2B2B2B"], ["#FFFFFF", "#FF4B44"]] },
  { id: "ESP2", nome: "La Lyga 2 Hispânica", curto: "La Lyga 2", pais: "ESP", regiao: "EUR", divisao: 2, nivel: 4, fLiga: 0.6, fSalario: 0.5, rebaixados: 4, acima: "ESP1", bolas: [["#00A3E0", "#1F1F1F"], ["#F08A24", "#1F3A5F"]] },
  { id: "ITA1", nome: "Serie Á Italiana", curto: "Serie Á", pais: "ITA", regiao: "EUR", divisao: 1, nivel: 1, fLiga: 0.95, fSalario: 1.1, rebaixados: 3, bolas: [["#00205B", "#E3B341"], ["#2E7D4F", "#C0392B"], ["#6A3FA0", "#18A0A8"]] },
  { id: "GER1", nome: "Bundesligue Alemã", curto: "Bundesligue", pais: "GER", regiao: "EUR", divisao: 1, nivel: 1, fLiga: 0.95, fSalario: 1.1, rebaixados: 2, bolas: [["#D20515", "#1F1F1F"], ["#F2B705", "#1F1F1F"], ["#FFFFFF", "#D20515"]] },
  { id: "FRA1", nome: "Ligue Um Francesa", curto: "Ligue Um", pais: "FRA", regiao: "EUR", divisao: 1, nivel: 1, fLiga: 0.9, fSalario: 1.0, rebaixados: 2, bolas: [["#091C3E", "#DAE025"], ["#1F3A5F", "#C0392B"], ["#18A0A8", "#091C3E"]] },
  { id: "POR1", nome: "Liga Lusitana", curto: "Liga Lusitana", pais: "POR", regiao: "EUR", divisao: 1, nivel: 2, fLiga: 0.85, fSalario: 0.7, rebaixados: 2, bolas: [["#1C2E5A", "#E3B341"], ["#2E7D4F", "#C0392B"]] },
  { id: "NED1", nome: "Eredivisão Holandesa", curto: "Eredivisão", pais: "NED", regiao: "EUR", divisao: 1, nivel: 2, fLiga: 0.85, fSalario: 0.75, rebaixados: 2, bolas: [["#F36C21", "#1F3A5F"], ["#FFFFFF", "#F36C21"]] },
  { id: "KSA1", nome: "Liga do Golfo", curto: "Golfo", pais: "KSA", regiao: "ARA", divisao: 1, nivel: 3, fLiga: 0.7, fSalario: 2.5, rebaixados: 3, bolas: [["#0E5E3A", "#C9A14A"], ["#7A1F3D", "#E3B341"], ["#1F3A5F", "#C9A14A"]] },
  { id: "ARG1", nome: "Liga Profissional Argentina", curto: "Liga Argentina", pais: "ARG", regiao: "SUL", divisao: 1, nivel: 3, fLiga: 0.6, fSalario: 0.55, rebaixados: 2, bolas: [["#75AADB", "#FFFFFF"], ["#1F3A5F", "#75AADB"], ["#F2B705", "#75AADB"]] },
  { id: "USA1", nome: "Méjor Liga Soccer", curto: "MLS", pais: "USA", regiao: "NAM", divisao: 1, nivel: 3, fLiga: 0.65, fSalario: 1.0, rebaixados: 0, bolas: [["#1F3A5F", "#E03A3E"], ["#FFFFFF", "#1F3A5F"], ["#F2B705", "#1F3A5F"]] },
  { id: "URU1", nome: "Campeonato Uruguaio", curto: "Liga Uruguaia", pais: "URU", regiao: "SUL", divisao: 1, nivel: 4, fLiga: 0.45, fSalario: 0.3, rebaixados: 2, bolas: [["#6CB4E4", "#FFFFFF"], ["#F5C400", "#111111"]] },
  { id: "COL1", nome: "Liga Bétpley Colombiana", curto: "Liga Colombiana", pais: "COL", regiao: "SUL", divisao: 1, nivel: 4, fLiga: 0.45, fSalario: 0.3, rebaixados: 2, bolas: [["#F5C400", "#0B3D91"], ["#C8102E", "#F5C400"]] },
  { id: "CHI1", nome: "Liga de Primeira Chilena", curto: "Liga Chilena", pais: "CHI", regiao: "SUL", divisao: 1, nivel: 4, fLiga: 0.4, fSalario: 0.3, rebaixados: 2, bolas: [["#C8102E", "#0B3D91"], ["#FFFFFF", "#C8102E"]] },
  { id: "PAR1", nome: "Divisão de Honra Paraguaia", curto: "Liga Paraguaia", pais: "PAR", regiao: "SUL", divisao: 1, nivel: 4, fLiga: 0.35, fSalario: 0.22, rebaixados: 2, bolas: [["#C8102E", "#0B3D91"], ["#FFFFFF", "#0B3D91"]] },
  { id: "ECU1", nome: "Liga Pro Equatoriana", curto: "Liga Equatoriana", pais: "ECU", regiao: "SUL", divisao: 1, nivel: 4, fLiga: 0.4, fSalario: 0.27, rebaixados: 2, bolas: [["#F5C400", "#0B3D91"], ["#C8102E", "#F5C400"]] },
  { id: "TUR1", nome: "Süper Lig Turca", curto: "Süper Lig", pais: "TUR", regiao: "EUR", divisao: 1, nivel: 3, fLiga: 0.75, fSalario: 0.8, rebaixados: 4, bolas: [["#C8102E", "#FFFFFF"], ["#0B2F7A", "#F5C400"]] },
  { id: "MEX1", nome: "Liga MêX", curto: "Liga MX", pais: "MEX", regiao: "NAM", divisao: 1, nivel: 3, fLiga: 0.65, fSalario: 0.7, rebaixados: 0, bolas: [["#0B7A3B", "#FFFFFF"], ["#C8102E", "#0B7A3B"]] },
  { id: "BRA3", nome: "Campeonato Nacional Série C", curto: "Série C", pais: "BRA", regiao: "BRA", divisao: 3, nivel: 5, fLiga: 0.35, fSalario: 0.3, rebaixados: 4, acima: "BRA2", bolas: [["#2E7D4F", "#FFFFFF"], ["#1F3A5F", "#F2B705"]] },
  ...GRUPO_D.map((_, i): InfoLiga => ({
    id: `BRA4${"ABCDEFGH"[i]}`, nome: `Campeonato Nacional Série D · Grupo ${i + 1} (${GRUPO_D[i]})`, curto: `Série D · G${i + 1}`, pais: "BRA", regiao: "BRA", divisao: 4, nivel: 5,
    fLiga: 0.25, fSalario: 0.15, rebaixados: 0, acima: "BRA3", bolas: [["#F2B705", "#2E7D4F"], ["#FFFFFF", "#C0392B"]],
  })),
  ...(Object.entries(CIDADES_VARZEA) as [string, string][]).map(([sigla, cidade]): InfoLiga => ({
    id: `VAR-${sigla}`, nome: `Liga da Várzea ${DA_CIDADE[sigla]}`, curto: `Várzea · ${cidade}`, pais: "BRA", regiao: "BRA", divisao: 9, nivel: 5, fLiga: 0.1, fSalario: 0, rebaixados: 0, amador: true,
    bolas: [["#C9A14A", "#5A3E1B"], ["#FFFFFF", "#2B2B2B"]],
  })),
  { id: "USA-HS", nome: "Liga Colegial da Flórida (high school)", curto: "High school", pais: "USA", regiao: "NAM", divisao: 9, nivel: 5, fLiga: 0.1, fSalario: 0, rebaixados: 0, amador: true, bolas: [["#FFFFFF", "#1F3A5F"]] },
  { id: "USA-NCAA", nome: "Liga Universitária Americana", curto: "Universitário", pais: "USA", regiao: "NAM", divisao: 9, nivel: 5, fLiga: 0.15, fSalario: 0, rebaixados: 0, amador: true, bolas: [["#FFFFFF", "#C0392B"], ["#F2B705", "#1F3A5F"]] },
];
export const LIGA_INFO: Record<string, InfoLiga> = Object.fromEntries(LIGAS.map((l) => [l.id, l]));
/** Clubes convidados das copas continentais (sem liga jogável): fora de LIGAS, só para infoLiga não cair na Série A. */
LIGA_INFO.CONV = { id: "CONV", nome: "Clubes convidados", curto: "Convidados", pais: "INT", regiao: "SUL", divisao: 9, nivel: 3, fLiga: 0.6, fSalario: 0.6, rebaixados: 0, amador: true, bolas: [["#FFFFFF", "#1F3A5F"]] };
/** Ids antigos (antes das ligas reais) que podem estar em saves velhos. */
export const LIGA_ANTIGA: Record<string, string> = { EUR1: "ENG1", EUR2: "FRA1", ARA1: "KSA1" };
export const infoLiga = (id: string | undefined): InfoLiga => LIGA_INFO[LIGA_ANTIGA[id ?? ""] ?? id ?? "BRA1"] ?? LIGA_INFO.BRA1;
