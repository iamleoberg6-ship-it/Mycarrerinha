// Rostos gerados por IA (Gamma) para pais, mães e agentes, no mesmo traço dos retratos do app de namoro.
// Os pais seguem o tom de pele do jogador; os agentes, a região de origem.
import { ROSTOS_IA } from "./rostos-ia.js";

const hash = (t: string) => { let h = 2166136261; for (const ch of t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; };
const img = (chave: string | undefined, alt = "") => chave && ROSTOS_IA[chave] ? `<img src="${ROSTOS_IA[chave]}" alt="${alt}" loading="lazy" decoding="async">` : undefined;
const variantes = (prefixo: string) => Object.keys(ROSTOS_IA).filter((k) => k.startsWith(prefixo + "-")).sort();
const pick = (prefixo: string, id: string) => { const l = variantes(prefixo); return l.length ? l[hash(id) % l.length] : undefined; };

/** Tom da família pelo tom de pele do jogador (0 a 7 na criação). */
export const tomFamilia = (pele: number | undefined) => ((pele ?? 3) <= 2 ? "claro" : (pele ?? 3) <= 4 ? "medio" : "escuro");

/** Rosto do pai ou da mãe (irmãos ficam com as iniciais). */
export function rostoParente(parentesco: string, id: string, pele: number | undefined): string | undefined {
  if (parentesco !== "pai" && parentesco !== "mae") return undefined;
  return img(pick(`${parentesco}-${tomFamilia(pele)}`, id));
}

const REGIAO: Record<string, string> = {
  BRA: "br", POR: "eu", ESP: "eu", ITA: "eu", FRA: "eu", GER: "eu", ENG: "eu", NED: "eu", CRO: "eu", TUR: "eu", BEL: "eu", SUI: "eu",
  ARG: "la", URU: "la", PAR: "la", COL: "la", MEX: "la", CHI: "la", ECU: "la", PER: "la", USA: "la",
  MAR: "ar", EGY: "ar", KSA: "ar", ALG: "ar", TUN: "ar", JPN: "as", KOR: "as", CHN: "as",
};
const MULHERES = new Set(["Sofia", "Ana", "Maria", "Paula", "Carla", "Julia", "Laura"]);
/** Rosto de um agente do banco (mulheres pelo primeiro nome). */
export function rostoAgente(id: string, nome: string, pais: string): string | undefined {
  const pre = MULHERES.has(nome.split(" ")[0]) ? "agente-mulher" : `agente-${REGIAO[pais] ?? "eu"}`;
  return img(pick(pre, id) ?? pick("agente-eu", id), nome);
}
