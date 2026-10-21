// Atributos, OVR e evolução semanal — seções "Criação do jogador" e "Atributos e evolução" do documento de design.
import { RNG, clamp } from "./rng.js";

export const ATRIBUTOS = ["VEL", "RES", "FOR", "PAS", "CRU", "DRI", "FIN", "CAB", "MAR", "VIS", "POS", "COM"] as const;
export type Atributo = (typeof ATRIBUTOS)[number];
export type Atributos = Record<Atributo, number>;
export type Posicao = "ZAG" | "LAT" | "VOL" | "MEI" | "PON" | "ATA";
export const POSICOES: Posicao[] = ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"];

export type Grupo = "fisico" | "tecnico" | "tatico";
export const GRUPO: Record<Atributo, Grupo> = {
  VEL: "fisico", RES: "fisico", FOR: "fisico",
  PAS: "tecnico", CRU: "tecnico", DRI: "tecnico", FIN: "tecnico", CAB: "tecnico",
  MAR: "tatico", POS: "tatico", VIS: "tatico", COM: "tatico",
};

// Pesos do OVR por posição: peso 3, peso 2; os demais valem 1.
const PESO3: Record<Posicao, Atributo[]> = {
  ZAG: ["MAR", "CAB", "FOR"], LAT: ["VEL", "CRU", "MAR"], VOL: ["MAR", "PAS", "POS"],
  MEI: ["PAS", "VIS", "DRI"], PON: ["VEL", "DRI", "CRU"], ATA: ["FIN", "POS", "COM"],
};
const PESO2: Record<Posicao, Atributo[]> = {
  ZAG: ["POS", "COM", "VEL"], LAT: ["RES", "PAS", "DRI"], VOL: ["RES", "FOR", "VIS"],
  MEI: ["COM", "FIN", "POS"], PON: ["FIN", "PAS", "RES"], ATA: ["VEL", "CAB", "DRI"],
};
export function peso(pos: Posicao, a: Atributo): number {
  if (PESO3[pos].includes(a)) return 3;
  if (PESO2[pos].includes(a)) return 2;
  return 1;
}

export function ovr(at: Atributos, pos: Posicao): number {
  let s = 0, w = 0;
  for (const a of ATRIBUTOS) {
    const p = peso(pos, a);
    s += p * at[a];
    w += p;
  }
  return s / w;
}

export interface Personalidade {
  profissionalismo: number; // 1–20
  ambicao: number;
  temperamento: number;
}

export interface NovoJogadorOpts {
  posicao: Posicao;
  potencial?: number;
}

/** Atributos iniciais aos 16 anos: base 35 + 120 pontos com peso dobrado nos principais + ruído ±3. */
export function atributosIniciais(rng: RNG, pos: Posicao): Atributos {
  const at = {} as Atributos;
  const pesos = ATRIBUTOS.map((a) => (peso(pos, a) >= 2 ? 2 : 1));
  const total = pesos.reduce((x, y) => x + y, 0);
  ATRIBUTOS.forEach((a, i) => {
    at[a] = clamp(Math.round(35 + (120 * pesos[i]) / total + rng.range(-3, 3)), 20, 70);
  });
  return at;
}

export function sortearPotencial(rng: RNG): number {
  return Math.round(clamp(rng.normal(72, 7), 60, 95));
}

export function sortearPersonalidade(rng: RNG): Personalidade {
  return { profissionalismo: rng.int(4, 20), ambicao: rng.int(1, 20), temperamento: rng.int(1, 20) };
}

// ---------- Evolução semanal ----------

export type Participacao = "titular" | "entrou" | "naoJogou" | "base" | "ferias";
export type Intensidade = "leve" | "normal" | "alta";

export interface ContextoTreino {
  idade: number;
  foco: Grupo;
  intensidade: Intensidade;
  participacao: Participacao;
  moral: number; // 0–100
  personalTrainer: boolean;
  profissionalismo: number; // 1–20
}

export const CALIB = {
  taxaBase: 0.36, // ΔA = taxaBase × fatores × (1 − A/POT)
};

export function fIdade(idade: number, grupo: Grupo): number {
  if (grupo === "tatico" && idade <= 33 && idade >= 31) return 0.3;
  if (idade <= 19) return 1.3;
  if (idade <= 23) return 1.1;
  if (idade <= 26) return 0.8;
  if (idade <= 28) return 0.3;
  if (idade <= 30) return 0.1;
  return 0;
}

const F_JOGO: Record<Participacao, number> = { titular: 1.2, entrou: 1.0, naoJogou: 0.8, base: 1.1, ferias: 0.3 };

/** Aplica uma semana de evolução e declínio. Retorna os atributos novos (não muta). */
export function evoluirSemana(at: Atributos, pot: number, ctx: ContextoTreino): Atributos {
  const novo = { ...at };
  const fMoral = 0.8 + (0.4 * ctx.moral) / 100;
  const fInt = ctx.intensidade === "alta" ? 1.2 : ctx.intensidade === "leve" ? 0.8 : 1;
  const fProf = 0.9 + (0.2 * ctx.profissionalismo) / 20; // 0,9 a 1,1
  const reducaoDeclinio = 1 - 0.4 * (ctx.profissionalismo / 20);
  for (const a of ATRIBUTOS) {
    const g = GRUPO[a];
    const fTreino = (g === ctx.foco ? 1.5 : 0.85) * fInt * (ctx.personalTrainer ? 1.1 : 1);
    const ganho = CALIB.taxaBase * fIdade(ctx.idade, g) * fTreino * F_JOGO[ctx.participacao] * fMoral * fProf * Math.max(0, 1 - at[a] / pot);
    let declinio = 0;
    // o corpo cobra cada vez mais depois dos 33: aos 38, o físico cai quase 6 pontos por temporada
    if (g === "fisico" && ctx.idade >= 29) declinio = ctx.idade >= 36 ? 0.15 : ctx.idade >= 33 ? 0.09 : 0.05;
    if (g === "tecnico" && ctx.idade >= 32) declinio = ctx.idade >= 36 ? 0.07 : 0.03;
    if (g === "tatico" && ctx.idade >= 34) declinio = ctx.idade >= 37 ? 0.05 : 0.03;
    novo[a] = clamp(at[a] + ganho - declinio * reducaoDeclinio, 1, 99);
  }
  return novo;
}
