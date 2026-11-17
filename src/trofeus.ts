// Qual taça cada competição entrega. Cada torneio tem uma silhueta própria, inspirada nos troféus de verdade:
// orelhas grandes nos lados (Champions), globo sobre coluna espiralada (Copa do Mundo), taça alta de alças retas
// (Libertadores), fitas entrelaçadas (Premier League), taça larga de pé curto (Europa), coluna com anéis (Brasileirão).
export type ModeloTaca = "taca" | "orelhas" | "globo" | "alcas" | "fitas" | "bowl" | "coluna" | "estrela" | "mundial" | "brasileirao" | "premier" | "laliga" | "seriea" | "salva" | "eurocopa" | "copabr" | "intercontinental";

/** Liga ou copa → silhueta da taça. Quem não tem entrada usa a taça padrão. */
export const TACA_DO_TORNEIO: Record<string, ModeloTaca> = {
  // copas
  UCL: "orelhas", COP: "globo", LIB: "alcas", MUN: "mundial", ACL: "estrela", EUR: "eurocopa", CON: "coluna", INT: "intercontinental", NAC: "copabr",
  // ligas
  BRA1: "brasileirao", ENG1: "premier", ESP1: "laliga", ITA1: "seriea", GER1: "salva",
};
/** A taça do campeão da liga pelo nome curto da liga (o histórico do jogador guarda o nome, não o id). */
export const TACA_DA_LIGA_CURTO: Record<string, ModeloTaca> = { "Série A": "brasileirao", "Premiê Liga": "premier", "La Lyga": "laliga", "Serie Á": "seriea", "Bundesligue": "salva" };
