// Idiomas: cada pessoa fala a língua de casa e aprende outras morando fora (devagar, todo dia) ou com curso (rápido,
// pago). Falar a língua do país ajuda na adaptação, na conversa com o técnico e com o elenco.
import { RNG, clamp } from "./rng.js";

export const LINGUA_DO_PAIS: Record<string, string> = {
  BRA: "pt", POR: "pt", ANG: "pt", MOZ: "pt",
  ESP: "es", ARG: "es", URU: "es", COL: "es", CHI: "es", PAR: "es", ECU: "es", PER: "es", VEN: "es", BOL: "es", MEX: "es", CRC: "es", HON: "es", PAN: "es",
  ENG: "en", SCO: "en", USA: "en", AUS: "en", NZL: "en", RSA: "en", CAN: "en", JAM: "en", IRL: "en", GHA: "en", NGA: "en", INT: "en", WAL: "en",
  FRA: "fr", BEL: "fr", CIV: "fr", CMR: "fr", MLI: "fr", SEN: "fr",
  ITA: "it", GER: "de", AUT: "de", SUI: "de", NED: "nl", TUR: "tr", CRO: "hr", SRB: "hr", POL: "pl", UKR: "uk",
  DEN: "da", NOR: "no", SWE: "sv", KSA: "ar", UAE: "ar", QAT: "ar", IRQ: "ar", EGY: "ar", MAR: "ar", ALG: "ar", TUN: "ar",
  IRN: "fa", JPN: "ja", KOR: "ko", CHN: "zh", THA: "th", MAS: "ms",
};
export const NOME_LINGUA: Record<string, string> = {
  pt: "Português", es: "Espanhol", en: "Inglês", fr: "Francês", it: "Italiano", de: "Alemão", nl: "Holandês", tr: "Turco", hr: "Croata", pl: "Polonês", uk: "Ucraniano",
  da: "Dinamarquês", no: "Norueguês", sv: "Sueco", ar: "Árabe", fa: "Persa", ja: "Japonês", ko: "Coreano", zh: "Chinês", th: "Tailandês", ms: "Malaio",
};
/** Línguas parecidas: quem fala uma entende um pouco da outra. */
const VIZINHA: Record<string, string[]> = { pt: ["es", "it"], es: ["pt", "it"], it: ["es", "pt", "fr"], fr: ["it", "es"], nl: ["de"], de: ["nl"], da: ["no", "sv"], no: ["da", "sv"], sv: ["no", "da"], hr: ["pl", "uk"], pl: ["hr", "uk"], uk: ["pl", "hr"] };
export const linguaDe = (pais: string | undefined) => LINGUA_DO_PAIS[pais ?? ""] ?? "en";
export type Idiomas = Record<string, number>;

/** Línguas de quem nasceu num país: a de casa (100), um pouco de inglês, às vezes uma vizinha. */
export function idiomasIniciais(chave: string, pais: string, idade: number): Idiomas {
  const r = new RNG(`${chave}|idiomas`), casa = linguaDe(pais), id: Idiomas = { [casa]: 100 };
  if (casa !== "en") id.en = Math.round(clamp(r.normal(18 + idade * 0.6, 12), 0, 85));
  for (const v of VIZINHA[casa] ?? []) if (r.chance(0.35)) id[v] = Math.round(clamp(r.normal(25, 12), 5, 70));
  return id;
}
/** Nível que vale na conversa: o direto ou, se não fala, um pouco pela língua vizinha. */
export function nivelEm(id: Idiomas, lingua: string): number {
  const direto = id[lingua] ?? 0, viz = Math.max(0, ...Object.entries(id).filter(([l]) => (VIZINHA[l] ?? []).includes(lingua)).map(([, n]) => n * 0.35));
  return Math.round(Math.max(direto, viz));
}
export const rotuloNivel = (n: number) => (n >= 90 ? "Fluente" : n >= 65 ? "Avançado" : n >= 40 ? "Intermediário" : n >= 15 ? "Básico" : "Não fala");
/** Uma semana: morando no país aprende a língua dele; o curso acelera (e serve para qualquer língua). */
export function semanaIdiomas(id: Idiomas, linguaLocal: string, curso?: string): string[] {
  const subiu: string[] = [];
  const antes = { ...id };
  const local = id[linguaLocal] ?? 0;
  if (local < 100) id[linguaLocal] = clamp(local + (1.1 + (curso === linguaLocal ? 2.6 : 0)) * (1 - local / 120), 0, 100);
  if (curso && curso !== linguaLocal) id[curso] = clamp((id[curso] ?? 0) + 2.4 * (1 - (id[curso] ?? 0) / 120), 0, 100);
  for (const [l, n] of Object.entries(id)) if (rotuloNivel(n) !== rotuloNivel(antes[l] ?? 0)) subiu.push(`${NOME_LINGUA[l] ?? l}: ${rotuloNivel(n).toLowerCase()}`);
  return subiu;
}
/** Peso da língua na adaptação: 0 (não fala) a 1 (fluente). */
export const fatorComunicacao = (nivel: number) => clamp(nivel / 70, 0, 1);
