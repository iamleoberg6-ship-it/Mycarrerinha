// Limite de estrangeiros por liga (regras de 2026; algumas são aproximadas para caber no jogo).
// "relacionados": quantos estrangeiros podem estar na súmula (titulares + banco). "inscritos": quantos o clube pode ter no
// elenco. "foraDaUE": na Espanha e na França o limite só conta quem não é da União Europeia (extracomunitário).
// No Brasil a CBF aprovou reduzir um por ano a partir de 2027 (9 → 8 → 7 → 6 → 5).
export interface LimiteEstrangeiros { relacionados?: number; inscritos?: number; foraDaUE?: boolean; texto: string }
const UE = new Set(["AUT", "BEL", "BUL", "CRO", "CYP", "CZE", "DEN", "EST", "FIN", "FRA", "GER", "GRE", "HUN", "IRL", "ITA", "LVA", "LTU", "LUX", "MLT", "NED", "POL", "POR", "ROU", "SVK", "SVN", "ESP", "SWE", "NOR", "ISL", "SUI"]);
export const daUE = (nac: string) => UE.has(nac);
export function limiteEstrangeiros(pais: string, ano: number): LimiteEstrangeiros | undefined {
  switch (pais) {
    case "BRA": { const n = ano <= 2026 ? 9 : Math.max(5, 9 - (ano - 2026)); return { relacionados: n, texto: `Até ${n} estrangeiros relacionados por jogo (regra da CBF${ano > 2026 ? `, que cai um por ano até 5` : ""}).` }; }
    case "ARG": return { inscritos: 6, relacionados: 5, texto: "Até 6 estrangeiros no elenco e 5 relacionados por jogo." };
    case "CHI": return { relacionados: 5, texto: "Até 5 estrangeiros relacionados por jogo." };
    case "PAR": case "ECU": return { relacionados: 5, texto: "Até 5 estrangeiros relacionados por jogo." };
    case "COL": case "URU": return { relacionados: 4, texto: "Até 4 estrangeiros relacionados por jogo." };
    case "MEX": return { inscritos: 9, texto: "Até 9 estrangeiros no elenco (não formados no México)." };
    case "USA": return { inscritos: 8, texto: "Até 8 vagas de estrangeiro no elenco (vagas internacionais da liga)." };
    case "ESP": return { inscritos: 3, foraDaUE: true, texto: "Até 3 extracomunitários (de fora da União Europeia) no elenco." };
    case "FRA": return { inscritos: 4, foraDaUE: true, texto: "Até 4 jogadores de fora da União Europeia no elenco." };
    case "KSA": return { inscritos: 10, texto: "Até 10 estrangeiros no elenco." };
    case "TUR": return { inscritos: 14, texto: "Até 14 estrangeiros no elenco." };
    case "JPN": return { relacionados: 5, texto: "Até 5 estrangeiros relacionados por jogo." };
    case "KOR": return { inscritos: 6, relacionados: 5, texto: "Até 6 estrangeiros no elenco e 5 relacionados por jogo." };
    case "AUS": return { inscritos: 5, texto: "Até 5 jogadores com visto de estrangeiro no elenco." };
    case "EGY": case "MAR": return { inscritos: 5, texto: "Até 5 estrangeiros no elenco." };
    default: return undefined;
  }
}
/** Conta como estrangeiro para a regra desta liga? */
export function contaComoEstrangeiro(nac: string, pais: string, lim?: LimiteEstrangeiros): boolean {
  if (nac === pais) return false;
  // Reino Unido: as quatro seleções contam como da casa entre si
  const uk = ["ENG", "SCO", "WAL", "NIR"];
  if (uk.includes(nac) && uk.includes(pais)) return false;
  if (lim?.foraDaUE) return !daUE(nac);
  return true;
}
