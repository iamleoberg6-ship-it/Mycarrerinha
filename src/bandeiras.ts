// Bandeira de cada seleção (pelo código do país). Usa o emoji da bandeira: Inglaterra e Escócia são bandeiras de
// subdivisão, feitas com sequências de tags.
const ISO: Record<string, string> = {
  BRA: "BR", ARG: "AR", URU: "UY", COL: "CO", CHI: "CL", PAR: "PY", ECU: "EC", PER: "PE", MEX: "MX", USA: "US", CAN: "CA",
  ENG: "gb-eng", FRA: "FR", ESP: "ES", GER: "DE", ITA: "IT", POR: "PT", NED: "NL", BEL: "BE", CRO: "HR", DEN: "DK", SUI: "CH",
  SRB: "RS", POL: "PL", TUR: "TR", NOR: "NO", SWE: "SE", AUT: "AT", SCO: "gb-sct", UKR: "UA", MAR: "MA", SEN: "SN", NGA: "NG",
  GHA: "GH", CIV: "CI", CMR: "CM", EGY: "EG", ALG: "DZ", TUN: "TN", JPN: "JP", KOR: "KR", KSA: "SA", AUS: "AU", IRN: "IR",
  QAT: "QA", NZL: "NZ", BOL: "BO", VEN: "VE", CRC: "CR", PAN: "PA", JAM: "JM", HON: "HN", MLI: "ML", RSA: "ZA", IRQ: "IQ", UAE: "AE",
};
const tags = (sub: string) => String.fromCodePoint(0x1f3f4, ...[...sub].map((c) => 0xe0000 + c.charCodeAt(0)), 0xe007f);

/** Emoji da bandeira do país (código de três letras do jogo). Sem bandeira conhecida, uma bandeira branca. */
export function bandeiraEmoji(pais: string): string {
  const c = ISO[pais];
  if (!c) return "\u{1F3F3}";
  if (c.startsWith("gb-")) return tags(c.slice(3));
  return String.fromCodePoint(...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}

/** Inglaterra e Escócia: a bandeira desenhada (o emoji delas não aparece em todo aparelho). Caixa 40×46, bandeira em 4..36 × 13..33. */
export function bandeiraDesenhada(pais: string): string | undefined {
  if (pais === "ENG") return `<rect x="4" y="13" width="32" height="20" fill="#FFFFFF"/><rect x="16" y="13" width="8" height="20" fill="#C8102E"/><rect x="4" y="19" width="32" height="8" fill="#C8102E"/>`;
  if (pais === "SCO") return `<rect x="4" y="13" width="32" height="20" fill="#0B2F7A"/><path d="M4 13L36 33M36 13L4 33" stroke="#FFFFFF" stroke-width="4"/>`;
  return undefined;
}

/** A bandeira como SVG da mesma caixa 40×46 do escudo (para ocupar o lugar dele na tela). */
export function bandeiraSvg(pais: string, cls = "escudo bandeira"): string {
  const desenho = bandeiraDesenhada(pais);
  return `<svg class="${cls}" viewBox="0 0 40 46" role="img" aria-label="Bandeira">${desenho ?? `<text x="20" y="34" font-size="30" text-anchor="middle">${bandeiraEmoji(pais)}</text>`}</svg>`;
}
