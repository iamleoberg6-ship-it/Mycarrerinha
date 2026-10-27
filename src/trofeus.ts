// Qual taça cada competição entrega. Cada torneio tem uma silhueta própria, inspirada nos troféus de verdade:
// orelhas grandes nos lados (Champions), globo sobre coluna espiralada (Copa do Mundo), taça alta de alças retas
// (Libertadores), fitas entrelaçadas (Premier League), taça larga de pé curto (Europa), coluna com anéis (Brasileirão).
export type ModeloTaca = "taca" | "orelhas" | "globo" | "alcas" | "fitas" | "bowl" | "coluna" | "estrela";

/** Liga ou copa → silhueta da taça. Quem não tem entrada usa a taça padrão. */
export const TACA_DO_TORNEIO: Record<string, ModeloTaca> = {
  // copas
  UCL: "orelhas", COP: "globo", LIB: "alcas", ACL: "estrela", EUR: "bowl", CON: "coluna", INT: "fitas",
  // ligas
  BRA1: "coluna", ENG1: "fitas", ESP1: "bowl", ITA1: "estrela", GER1: "alcas",
};
