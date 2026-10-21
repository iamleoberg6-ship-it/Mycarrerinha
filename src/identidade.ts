// Identidade dos clubes: a cultura de base. Tem clube que lança garoto toda temporada e clube que só compra pronto.
// A cultura pesa na escalação (além da fila na posição): no clube formador, o jovem passa na frente de um veterano do
// mesmo nível; no clube comprador, precisa ser bem melhor para jogar.

/** 1 = não dá chance; 2 = compra pronto; 3 = equilibrado; 4 = gosta de lançar; 5 = vive da base. */
export type Cultura = 1 | 2 | 3 | 4 | 5;

const CULTURA: Record<string, Cultura> = {
  // Série A
  SAN: 5, PAL: 5, FLU: 5, SPA: 5, CAP: 4, GRE: 4, INT: 4, VAS: 4, RBB: 4, CRU: 3, FLA: 3, COR: 3, CAM: 3, VIT: 3, CFC: 3, CHA: 3,
  BAH: 2, BOT: 2, MIR: 2, REM: 2,
  // Série B
  AME: 4, PON: 4, CRI: 3, AVA: 3, GOI: 3, JUV: 3, SPT: 3, CEA: 3, FOR: 2, CUI: 2, ACG: 3, NOV: 2, ATH: 2, BFC: 3, CRB: 3, LON: 3, NAU: 3, OPE: 3, SBE: 3, VNO: 3,
  // Inglaterra
  "EN-ARS": 4, "EN-MUN": 4, "EN-LIV": 3, "EN-MCI": 2, "EN-CHE": 2, "EN-TOT": 2, "EN-NEW": 2, "EN-AVL": 2, "EN-NFO": 2, "EN-BHA": 3, "EN-BRE": 3, "EN-EVE": 3,
  "EN-CRY": 3, "EN-FUL": 2, "EN-BOU": 2, "EN-LEE": 3, "EN-SUN": 4, "EN-COV": 3, "EN-IPS": 3, "EN-HUL": 3,
  "EN-SOU": 5, "EN-WHU": 4, "EN-WOL": 2, "EN-MID": 4, "EN-NOR": 4, "EN-BLB": 4, "EN-CHA": 4, "EN-DER": 4, "EN-MIL": 3, "EN-WRE": 1, "EN-BIR": 2, "EN-WAT": 2,
  // Espanha
  "ES-BAR": 5, "ES-ATH": 5, "ES-RSO": 5, "ES-VIL": 4, "ES-VAL": 4, "ES-RMA": 2, "ES-ATM": 2, "ES-BET": 3, "ES-SEV": 3, "ES-CEL": 5, "ES-ESP": 4, "ES-RAC": 4,
  "ES-DEP": 4, "ES-OSA": 4, "ES-MAL": 4, "ES-GET": 2, "ES-RAY": 3, "ES-ALA": 3, "ES-ELC": 3, "ES-LEV": 4,
  "ES-RSB": 5, "ES-CEB": 5, "ES-LPA": 4, "ES-SPG": 4, "ES-TEN": 4, "ES-GIR": 2, "ES-MLL": 3, "ES-AND": 2,
  // Itália
  "IT-ATA": 4, "IT-JUV": 3, "IT-INT": 2, "IT-MIL": 3, "IT-ROM": 3, "IT-NAP": 2, "IT-LAZ": 2, "IT-COM": 2, "IT-FIO": 3, "IT-BOL": 3, "IT-EMP": 4, "IT-GEN": 3,
  "IT-SAS": 4, "IT-TOR": 3, "IT-UDI": 3, "IT-PAR": 3, "IT-LEC": 3, "IT-CAG": 3, "IT-MON": 3, "IT-VEN": 3, "IT-FRO": 3,
  // Alemanha
  "DE-BVB": 4, "DE-RBL": 4, "DE-FCB": 2, "DE-B04": 3, "DE-VFB": 4, "DE-SCF": 4, "DE-S04": 4, "DE-SGE": 3, "DE-TSG": 4, "DE-M05": 3, "DE-BMG": 3, "DE-KOE": 4,
  "DE-SVW": 3, "DE-HSV": 3, "DE-FCU": 2, "DE-AUG": 3, "DE-ELV": 3, "DE-SCP": 3,
  // França
  "FR-LYO": 5, "FR-REN": 5, "FR-ASM": 4, "FR-LIL": 4, "FR-PSG": 2, "FR-OM": 2, "FR-NIC": 3, "FR-LEN": 3, "FR-STR": 4, "FR-TOU": 4, "FR-PFC": 2, "FR-HAV": 4,
  "FR-AUX": 4, "FR-BRE": 3, "FR-ANG": 3, "FR-LOR": 4, "FR-LEM": 3, "FR-TRO": 3,
  // Portugal
  "PT-SLB": 5, "PT-SCP": 5, "PT-FCP": 4, "PT-SCB": 4, "PT-VSC": 4, "PT-RAV": 3, "PT-FAM": 3, "PT-GIL": 3, "PT-EST": 3, "PT-CPI": 2, "PT-ARO": 2, "PT-ALV": 3,
  "PT-MAR": 3, "PT-MOR": 3, "PT-NAC": 3, "PT-SCL": 3, "PT-EAM": 3, "PT-ACV": 3,
  // Holanda
  "NL-AJA": 5, "NL-AZ": 5, "NL-PSV": 4, "NL-FEY": 4, "NL-TWE": 4, "NL-UTR": 4, "NL-HEE": 4, "NL-GRO": 4, "NL-SPA": 4, "NL-NEC": 3, "NL-GAE": 3, "NL-PEC": 3,
  "NL-FOR": 3, "NL-EXC": 4, "NL-TEL": 3, "NL-CAM": 3, "NL-WIL": 4, "NL-ADO": 4,
  // Golfo: compra pronto
  "SA-HIL": 2, "SA-AHL": 2, "SA-SHA": 2, "SA-ETT": 2,
  // Argentina
  "AR-RIV": 5, "AR-ARG": 5, "AR-VEL": 5, "AR-NOB": 5, "AR-LAN": 4, "AR-BOC": 4, "AR-RAC": 4, "AR-IND": 4, "AR-EST": 3, "AR-SLO": 4, "AR-TAL": 3, "AR-ROS": 4,
  "AR-HUR": 3, "AR-BAN": 4, "AR-GLP": 4, "AR-DYJ": 3, "AR-TIG": 3, "AR-PLA": 3, "AR-BEL": 3, "AR-INS": 3,
};

export function culturaBase(clubeId: string): Cultura {
  return CULTURA[clubeId] ?? (clubeId.startsWith("SA-") ? 1 : 3);
}

export const NOME_CULTURA: Record<Cultura, string> = {
  1: "Não dá chance à base", 2: "Compra jogador pronto", 3: "Equilibrado", 4: "Gosta de lançar garotos", 5: "Vive da base",
};
export const TEXTO_CULTURA: Record<Cultura, string> = {
  1: "Aqui o elenco é montado no mercado. Garoto só joga se for muito melhor que o titular.",
  2: "A torcida cobra resultado imediato e o clube prefere contratar. Jovem precisa estar acima dos outros para ter vez.",
  3: "Quem estiver melhor joga, tenha 18 ou 32 anos.",
  4: "O clube gosta de lançar garotos: um jovem do mesmo nível passa na frente do veterano.",
  5: "Revelar é a identidade do clube. Garoto bom sobe cedo e ganha minutos mesmo com fila na posição.",
};

/** Bônus na disputa por posição para jovens: cheio até 19 anos, metade aos 20–21, nada depois. */
export function bonusJovem(clubeId: string, idade: number): number {
  if (idade > 21) return 0;
  const b = [-4, -2, 0, 2, 4][culturaBase(clubeId) - 1];
  return idade <= 19 ? b : b / 2;
}

/** Chance de um garoto da base em boa fase ser chamado para o banco do profissional. */
export function chanceSubir(clubeId: string): { chance: number; formaMin: number } {
  const k = culturaBase(clubeId);
  return { chance: [0.08, 0.2, 0.35, 0.45, 0.55][k - 1], formaMin: [7.8, 7.6, 7.4, 7.2, 7.0][k - 1] };
}
