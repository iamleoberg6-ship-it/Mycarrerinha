// Sorteio de personagens com a arte nova (traço de jogo esportivo, sem fotorrealismo).
// Mulheres: retratos (cabelo pronto ou rosto liso em 3 tons) e corpos inteiros em 3 tons.
// Bebês: corpo inteiro em 3 tons. Tudo vem de ARTE_IMG; o sorteio é determinístico pela semente.
import { RNG } from "../../src/rng.js";
import { ARTE_IMG } from "./arte-dados.js";

export type Tom = "claro" | "escuro" | "medio";
export const TONS: Tom[] = ["claro", "escuro", "medio"];

export const MULHERES_RETRATO = ["hair-female-01", "hair-female-02", "hair-female-03", "hair-female-04", "hair-female-05", "hair-female-06", "face-female-01", "face-female-02", "face-female-03"] as const;
export const MULHERES_CORPO = ["corpo-mulher", "body-female-02", "body-female-03"] as const;
export const BEBES = ["baby-01", "baby-02"] as const;

/** Chave da imagem para uma base e um tom. Cabelo pronto só existe no tom claro. */
export function chaveArte(base: string, tom: Tom): string {
  return base.startsWith("hair-") ? `${base}-claro` : `${base}-${tom}`;
}

export function imagemArte(chave: string): string | undefined {
  return ARTE_IMG[chave];
}

/** Sorteia uma mulher (retrato) com a semente dada. */
export function sortearMulherRetrato(semente: string): { base: string; tom: Tom; src: string } {
  const r = new RNG(`arte-mulher|${semente}`);
  const base = r.pick([...MULHERES_RETRATO]);
  const tom = base.startsWith("hair-") ? "claro" : r.pick(TONS);
  return { base, tom, src: imagemArte(chaveArte(base, tom)) ?? "" };
}

/** Sorteia um corpo inteiro de mulher. */
export function sortearMulherCorpo(semente: string): { base: string; tom: Tom; src: string } {
  const r = new RNG(`arte-corpo-mulher|${semente}`);
  const base = r.pick([...MULHERES_CORPO]);
  const tom = r.pick(TONS);
  return { base, tom, src: imagemArte(chaveArte(base, tom)) ?? "" };
}

/** Sorteia um bebê (corpo inteiro). */
export function sortearBebe(semente: string): { base: string; tom: Tom; src: string } {
  const r = new RNG(`arte-bebe|${semente}`);
  const base = r.pick([...BEBES]);
  const tom = r.pick(TONS);
  return { base, tom, src: imagemArte(chaveArte(base, tom)) ?? "" };
}
