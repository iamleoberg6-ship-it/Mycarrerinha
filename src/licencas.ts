// Licenças de técnico (C, B, A e Pro): um curso por vez, com custo e semanas de estudo. O jogador pode fazer durante a
// carreira e chega pronto ao modo técnico; os clubes grandes só contratam técnico com licença alta.
export const LICENCAS = ["Sem licença", "Licença C", "Licença B", "Licença A", "Licença Pro"] as const;
/** Semanas de estudo e custo (R$) de cada licença, e a idade mínima para começar. */
export const CURSO_LICENCA: Record<number, { semanas: number; custo: number; idadeMin: number }> = {
  1: { semanas: 16, custo: 9_000, idadeMin: 22 },
  2: { semanas: 24, custo: 25_000, idadeMin: 24 },
  3: { semanas: 32, custo: 70_000, idadeMin: 26 },
  4: { semanas: 40, custo: 180_000, idadeMin: 28 },
};
export interface CursoTecnico { licenca: number; estudando?: number; progresso?: number }
/** Licença que um clube exige do técnico, pela força (os grandes pedem A ou Pro). */
export const licencaExigida = (forca: number) => (forca >= 80 ? 4 : forca >= 74 ? 3 : forca >= 66 ? 2 : 1);
/** Uma semana de estudo: devolve a licença concluída, se terminou. */
export function semanaCurso(c: CursoTecnico, ritmo = 1): number | undefined {
  if (!c.estudando) return undefined;
  const alvo = c.estudando, tot = CURSO_LICENCA[alvo].semanas;
  c.progresso = Math.min(tot, (c.progresso ?? 0) + ritmo);
  if (c.progresso >= tot) { c.licenca = alvo; c.estudando = undefined; c.progresso = 0; return alvo; }
  return undefined;
}
