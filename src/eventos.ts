// Eventos fora de campo que acompanham a fase da carreira: na base, a escola e a família; no começo, o primeiro
// carro e o empresário; já estabelecido, patrocínio e televisão; como estrela, documentário, gala e marca própria;
// veterano, despedida, mentor e o que fazer depois. Um por vez, com decisão.
import { RNG, clamp } from "./rng.js";
import { CADEIAS } from "./cadeias-dados.js";
import { temPersonagem } from "./cadeias.js";

export type Fase = "base" | "inicio" | "estabelecido" | "estrela" | "veterano";
export interface CtxEvento {
  /** nacionalidade do jogador (código do país) */
  pais?: string;
  fase: Fase[]; idade: number; fama: number; salario: number; saldo: number; exterior: boolean; golfo: boolean; titular: boolean;
  nome: string; clube: string; cidade: string; liga: string; temporada: number; seguidores: number;
  /** país do clube no momento do evento: escolhe o personagem da cadeia */
  paisClube?: string;
  /** família: pai com mais idade, irmão mais novo que joga, irmão profissional, proposta na mesa */
  paiVelho?: boolean; irmaoJoga?: boolean; irmaoPro?: boolean; proposta?: boolean;
}
export interface EfeitoEvento {
  /** dinheiro em R$ (negativo = gasto) ou em salários do jogador (sal) */
  dinheiro?: number; sal?: number;
  moral?: number; fama?: number; relTecnico?: number; engajamento?: number; hype?: number; pressao?: number; vidaNoturna?: number; cansaco?: number;
  /** bônus permanente de evolução (0,02 = +2%) */
  evolucao?: number;
  /** patrocínio: fração do salário por mês, por N meses (piso em reais para quem ganha pouco) */
  patrocinio?: { pct: number; piso: number; meses: number };
  /** família: relação com pai e mãe, com o irmão do evento; potencial do irmão mais novo; o irmão larga o futebol */
  pais?: number; irmao?: number; irmaoPot?: number; irmaoPara?: boolean;
}
export interface OpcaoEvento { id: string; rotulo: string; resultado: string; efeitos: EfeitoEvento; risco?: { chance: number; resultado: string; efeitos: EfeitoEvento } }
export interface EventoVida {
  id: string; fases: Fase[]; titulo: string; texto: string; opcoes: OpcaoEvento[];
  /** só uma vez na carreira */
  unico?: boolean; quando?: (c: CtxEvento) => boolean;
}

const ev = (id: string, fases: Fase[], titulo: string, texto: string, opcoes: OpcaoEvento[], extra: Partial<EventoVida> = {}): EventoVida => ({ id, fases, titulo, texto, opcoes, ...extra });
const op = (id: string, rotulo: string, resultado: string, efeitos: EfeitoEvento, risco?: OpcaoEvento["risco"]): OpcaoEvento => ({ id, rotulo, resultado, efeitos, risco });

export const EVENTOS: EventoVida[] = [
  // Eventos com cadeia: textos e escolhas vêm de cadeias-dados.ts, com um personagem por país do clube.
  ...Object.values(CADEIAS).map((cad) => ev(cad.id, cad.fases, cad.inicio.titulo, cad.inicio.texto, cad.inicio.opcoes.map((o) => op(o.id, o.rotulo, o.resultado, {})), {
    unico: cad.unico, quando: (c) => (cad.familia ? true : temPersonagem(cad, c.paisClube)) && (cad.quando?.(c) ?? true),
  })),
  // ------------------------------------------------------------ base
  // ------------------------------------------------------------ estabelecido
  // ------------------------------------------------------------ estrela
  // ------------------------------------------------------------ veterano
];

// ------------------------------------------------------------ fora de campo por nacionalidade
// Costumes do país de origem: aparecem só para quem nasceu lá (o campo `pais` do contexto).
const NACIONAIS: EventoVida[] = [
];
EVENTOS.push(...NACIONAIS);
export const EVENTO: Record<string, EventoVida> = Object.fromEntries(EVENTOS.map((e) => [e.id, e]));

export function fasesDe(c: Omit<CtxEvento, "fase">, formacao: boolean): Fase[] {
  if (formacao) return ["base"];
  const f: Fase[] = [];
  if (c.idade >= 32) f.push("veterano");
  if (c.fama >= 65) f.push("estrela");
  else if (c.fama >= 35 || c.idade >= 24) f.push("estabelecido");
  else f.push("inicio");
  return f;
}

export function sortearEvento(rng: RNG, ctx: CtxEvento, vistos: Record<string, number>): EventoVida | undefined {
  const pool = EVENTOS.filter((e) => e.fases.some((f) => ctx.fase.includes(f)) && (!e.quando || e.quando(ctx))
    && !(e.unico && vistos[e.id] !== undefined) && !(vistos[e.id] !== undefined && ctx.temporada - vistos[e.id] < 3));
  return pool.length ? rng.pick(pool) : undefined;
}

export const preencher = (t: string, c: CtxEvento, pessoa?: { nome: string }) => t.replaceAll("{clube}", c.clube).replaceAll("{cidade}", c.cidade).replaceAll("{nome}", c.nome).replaceAll("{pessoa}", pessoa?.nome ?? "");
export const dinheiroDoEfeito = (e: EfeitoEvento, salario: number) => Math.round((e.dinheiro ?? 0) + (e.sal ?? 0) * Math.max(3000, salario));
export const patrocinioDoEfeito = (e: EfeitoEvento, salario: number) => (e.patrocinio ? Math.round(Math.max(e.patrocinio.piso, e.patrocinio.pct * salario)) : 0);
export const limitar = (x: number) => clamp(x, 0, 100);
