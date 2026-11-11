// A estrutura do clube como no Football Manager: seis departamentos (comissão técnica, preparação física, departamento
// médico, análise de desempenho, scout e base), cada um com um chefe e a equipe dele. Cada profissional tem várias
// habilidades (de 1 a 20) e você decide o cargo de cada um: o treinador de ataque melhora finalização e drible, o de
// defesa melhora marcação e posicionamento, o de bola parada melhora cruzamento, cabeceio e os gols de bola parada...
import { clamp } from "../rng.js";
import type { Atributo } from "../atributos.js";
import { ATRIBUTOS } from "../atributos.js";
import type { Membro, PosT } from "./modelo.js";

export type Dep = "tecnica" | "fisica" | "medica" | "analise" | "scout" | "base";
export const DEPS: Dep[] = ["tecnica", "fisica", "medica", "analise", "scout", "base"];
export const NOME_DEP: Record<Dep, string> = { tecnica: "Comissão técnica", fisica: "Preparação física", medica: "Departamento médico", analise: "Análise de desempenho", scout: "Scout", base: "Categoria de base" };

export type Hab = "ATQ" | "DEF" | "TEC" | "BP" | "GOL" | "FIS" | "TAT" | "MOT" | "MED" | "FST" | "AVA" | "POT" | "JOV" | "DAD";
export const HABS: Hab[] = ["ATQ", "DEF", "TEC", "BP", "GOL", "FIS", "TAT", "MOT", "MED", "FST", "AVA", "POT", "JOV", "DAD"];
export const NOME_HAB: Record<Hab, string> = {
  ATQ: "Treino de ataque", DEF: "Treino de defesa", TEC: "Treino técnico", BP: "Bola parada", GOL: "Treino de goleiros", FIS: "Preparação física",
  TAT: "Conhecimento tático", MOT: "Motivação", MED: "Medicina esportiva", FST: "Fisioterapia", AVA: "Avaliar jogadores", POT: "Ver potencial", JOV: "Trabalho com jovens", DAD: "Análise de dados",
};
/** As habilidades que importam em cada departamento (as outras quase não aparecem na ficha). */
export const HABS_DEP: Record<Dep, Hab[]> = {
  tecnica: ["ATQ", "DEF", "TEC", "BP", "GOL", "TAT", "MOT"], fisica: ["FIS", "MED", "MOT"], medica: ["MED", "FST", "FIS"],
  analise: ["DAD", "TAT", "AVA", "TEC"], scout: ["AVA", "POT", "DAD"], base: ["JOV", "POT", "TEC", "MOT"],
};

export type Cargo =
  | "assistente" | "auxiliar" | "t_ataque" | "t_defesa" | "t_posse" | "t_bp" | "t_goleiros"
  | "chefe_fis" | "preparador" | "fisiologista"
  | "chefe_med" | "medico" | "fisio" | "nutri"
  | "chefe_ana" | "ana_adv" | "ana_des"
  | "chefe_scout" | "olheiro"
  | "coord_base" | "t_base";
export interface InfoCargo { dep: Dep; nome: string; chefe?: boolean; peso: Partial<Record<Hab, number>>; efeito: string;
  /** atributos dos jogadores que esse cargo faz evoluir (peso de 0 a 1) e para quem vale inteiro */ atrib?: Partial<Record<Atributo, number>>; pos?: PosT[] }
export const CARGOS: Record<Cargo, InfoCargo> = {
  assistente: { dep: "tecnica", nome: "Assistente técnico", chefe: true, peso: { TAT: 0.4, MOT: 0.3, AVA: 0.15, TEC: 0.15 }, efeito: "Seu braço direito: coordena os outros treinadores, o time pega a tática mais rápido e as conversas rendem mais." },
  auxiliar: { dep: "tecnica", nome: "Auxiliar técnico", peso: { ATQ: 0.25, DEF: 0.25, TEC: 0.25, TAT: 0.15, MOT: 0.1 }, efeito: "Ajuda em tudo: todos os atributos evoluem um pouco mais.", atrib: Object.fromEntries(ATRIBUTOS.map((a) => [a, 0.35])) },
  t_ataque: { dep: "tecnica", nome: "Treinador de ataque", peso: { ATQ: 0.7, TEC: 0.2, MOT: 0.1 }, efeito: "Finalização, drible e cabeceio (atacantes, pontas e meias).", atrib: { FIN: 1, DRI: 0.7, CAB: 0.4, COM: 0.3 }, pos: ["ATA", "PON", "MEI"] },
  t_defesa: { dep: "tecnica", nome: "Treinador de defesa", peso: { DEF: 0.7, TAT: 0.2, MOT: 0.1 }, efeito: "Marcação, posicionamento e jogo aéreo (zagueiros, laterais e volantes).", atrib: { MAR: 1, POS: 1, CAB: 0.4, FOR: 0.3 }, pos: ["ZAG", "LAT", "VOL"] },
  t_posse: { dep: "tecnica", nome: "Treinador de posse de bola", peso: { TEC: 0.6, TAT: 0.3, MOT: 0.1 }, efeito: "Passe, visão de jogo e calma com a bola (todos, mais os meias e volantes).", atrib: { PAS: 1, VIS: 1, COM: 0.7, DRI: 0.3 }, pos: ["MEI", "VOL", "LAT", "ZAG", "PON", "ATA"] },
  t_bp: { dep: "tecnica", nome: "Treinador de bola parada", peso: { BP: 0.7, TEC: 0.2, ATQ: 0.1 }, efeito: "Cruzamento e cabeceio, e o time faz mais gols (e leva menos) de bola parada.", atrib: { CRU: 1, CAB: 0.8 } },
  t_goleiros: { dep: "tecnica", nome: "Treinador de goleiros", peso: { GOL: 0.8, MOT: 0.1, TEC: 0.1 }, efeito: "Os goleiros evoluem bem mais (reflexos, colocação, saída do gol).", pos: ["GOL"] },
  chefe_fis: { dep: "fisica", nome: "Chefe da preparação física", chefe: true, peso: { FIS: 0.6, MOT: 0.2, MED: 0.2 }, efeito: "Coordena os preparadores: o trabalho deles rende mais." },
  preparador: { dep: "fisica", nome: "Preparador físico", peso: { FIS: 0.8, MOT: 0.2 }, efeito: "Velocidade, resistência e força evoluem mais; o time cansa menos e se machuca menos.", atrib: { VEL: 0.8, RES: 1, FOR: 1 } },
  fisiologista: { dep: "fisica", nome: "Fisiologista", peso: { FIS: 0.5, MED: 0.5 }, efeito: "Controla a carga: o time recupera mais rápido entre os jogos e se machuca menos." },
  chefe_med: { dep: "medica", nome: "Médico-chefe", chefe: true, peso: { MED: 0.8, MOT: 0.2 }, efeito: "Coordena o departamento médico e encurta as lesões." },
  medico: { dep: "medica", nome: "Médico", peso: { MED: 1 }, efeito: "Lesões mais curtas." },
  fisio: { dep: "medica", nome: "Fisioterapeuta", peso: { FST: 0.8, MED: 0.2 }, efeito: "Recuperação física mais rápida e volta mais cedo de lesão." },
  nutri: { dep: "medica", nome: "Nutricionista", peso: { MED: 0.5, FIS: 0.5 }, efeito: "Condição física melhor e menos lesões; segura a queda física dos veteranos.", atrib: { RES: 0.3, VEL: 0.2 } },
  chefe_ana: { dep: "analise", nome: "Chefe de análise", chefe: true, peso: { DAD: 0.6, TAT: 0.4 }, efeito: "Coordena os analistas: o que eles estudam chega melhor ao campo." },
  ana_adv: { dep: "analise", nome: "Analista de adversários", peso: { DAD: 0.6, TAT: 0.4 }, efeito: "Estuda os adversários: o time entra em campo mais bem armado." },
  ana_des: { dep: "analise", nome: "Analista de desempenho", peso: { DAD: 0.6, AVA: 0.2, TEC: 0.2 }, efeito: "Mostra a cada jogador onde melhorar: evolução e entrosamento um pouco maiores.", atrib: Object.fromEntries(ATRIBUTOS.map((a) => [a, 0.2])) },
  chefe_scout: { dep: "scout", nome: "Chefe de scout", chefe: true, peso: { AVA: 0.5, POT: 0.5 }, efeito: "Organiza a rede de olheiros: acha nomes melhores e erra menos a avaliação." },
  olheiro: { dep: "scout", nome: "Olheiro", peso: { AVA: 0.5, POT: 0.4, DAD: 0.1 }, efeito: "Mostra o potencial dos jogadores e acha agentes livres melhores." },
  coord_base: { dep: "base", nome: "Coordenador da base", chefe: true, peso: { JOV: 0.6, POT: 0.4 }, efeito: "Garotos melhores na base todo começo de temporada." },
  t_base: { dep: "base", nome: "Treinador da base", peso: { JOV: 0.7, TEC: 0.2, MOT: 0.1 }, efeito: "Os jogadores de até 21 anos do elenco evoluem mais, e a base revela mais gente." },
};
export const CARGOS_DEP = (d: Dep) => (Object.keys(CARGOS) as Cargo[]).filter((c) => CARGOS[c].dep === d);
export const CHEFE_DEP = (d: Dep) => CARGOS_DEP(d).find((c) => CARGOS[c].chefe)!;

/** Nota (0 a 5 estrelas) de alguém num cargo, pelas habilidades. */
export function notaNoCargo(m: Membro, c: Cargo): number {
  const h = m.hab; if (!h) return m.nivel;
  const p = CARGOS[c].peso; let soma = 0, tot = 0;
  for (const [k, w] of Object.entries(p) as [Hab, number][]) { soma += (h[k] ?? 1) * w; tot += w; }
  return clamp((soma / tot) / 4, 0, 5);
}
/** O cargo em que a pessoa rende mais dentro do departamento (o de chefe só se pedir). */
export function melhorCargo(m: Membro, d: Dep, comChefe = false): Cargo {
  return CARGOS_DEP(d).filter((c) => comChefe || !CARGOS[c].chefe).sort((a, b) => notaNoCargo(m, b) - notaNoCargo(m, a))[0];
}
/** As habilidades mais fortes (para a ficha curta). */
export const melhoresHabs = (m: Membro, n = 3): Hab[] => m.hab ? (Object.keys(m.hab) as Hab[]).sort((a, b) => m.hab![b]! - m.hab![a]!).slice(0, n) : [];

/** Nível que um conjunto de notas entrega: o melhor inteiro, cada um a mais soma um pedaço (retorno menor). */
export function somaNotas(l: number[]): number {
  const o = [...l].sort((a, b) => b - a);
  if (!o.length) return 0;
  return Math.min(6.5, o[0] + o.slice(1).reduce((a, v, i) => a + (v * 0.32) / (i + 1), 0));
}
export type Deps = Partial<Record<Dep, Membro[]>>;
/** Nível de um cargo no clube (com o chefe do departamento ajudando ou atrapalhando). */
export function nivelCargo(deps: Deps | undefined, c: Cargo): number {
  const d = CARGOS[c].dep, eq = deps?.[d] ?? [];
  const n = somaNotas(eq.filter((m) => m.cargo === c).map((m) => notaNoCargo(m, c)));
  if (CARGOS[c].chefe) return n;
  return n * fatorChefe(deps, d);
}
/** O chefe coordena: bom chefe faz o departamento render até 10% mais; sem chefe, 12% menos. */
export function fatorChefe(deps: Deps | undefined, d: Dep): number {
  const ch = (deps?.[d] ?? []).find((m) => m.cargo === CHEFE_DEP(d));
  return ch ? 0.9 + 0.04 * notaNoCargo(ch, CHEFE_DEP(d)) : 0.88;
}

/** Quanto cada atributo de um jogador evolui a mais (ou a menos) por causa da comissão. Sem ninguém, 0,9. */
export function fatorAtributos(deps: Deps | undefined, pos: PosT, idade: number): Partial<Record<Atributo, number>> {
  const f: Partial<Record<Atributo, number>> = {};
  for (const a of ATRIBUTOS) f[a] = 0.93;
  if (pos === "GOL") {
    const g = nivelCargo(deps, "t_goleiros"), aux = nivelCargo(deps, "auxiliar");
    for (const a of ATRIBUTOS) f[a] = (0.93 + 0.012 * aux) * (1 + 0.07 * g);
  } else {
    for (const c of ["auxiliar", "t_ataque", "t_defesa", "t_posse", "t_bp", "preparador", "nutri", "ana_des"] as Cargo[]) {
      const info = CARGOS[c], n = nivelCargo(deps, c);
      if (!n || !info.atrib) continue;
      const k = info.pos && !info.pos.includes(pos) ? 0.45 : 1;
      for (const [a, w] of Object.entries(info.atrib) as [Atributo, number][]) f[a]! += 0.035 * n * w * k;
    }
  }
  if (idade <= 21) { const b = nivelCargo(deps, "t_base"); for (const a of ATRIBUTOS) f[a]! += 0.02 * b; }
  return f;
}

/** Vagas máximas de cada departamento (o que a diretoria pode chegar a autorizar). */
export const LIMITE_DEP: Record<Dep, number> = { tecnica: 9, fisica: 5, medica: 6, analise: 5, scout: 10, base: 4 };
export function vagasIniciaisDep(nivel: number): Record<Dep, number> {
  const n = clamp(Math.round(nivel), 1, 5);
  return { tecnica: 2 + n, fisica: 1 + Math.ceil(n / 2), medica: 1 + Math.ceil(n / 2), analise: Math.max(1, Math.floor(n / 2) + 1), scout: 1 + n, base: n >= 3 ? 3 : 2 };
}
/** Os cargos que o clube preenche primeiro, por departamento (na ordem). */
export const ORDEM_INICIAL: Record<Dep, Cargo[]> = {
  tecnica: ["assistente", "t_goleiros", "auxiliar", "t_defesa", "t_ataque", "t_posse", "t_bp", "auxiliar", "auxiliar"],
  fisica: ["chefe_fis", "preparador", "fisiologista", "preparador", "preparador"],
  medica: ["chefe_med", "fisio", "medico", "nutri", "fisio", "medico"],
  analise: ["chefe_ana", "ana_adv", "ana_des", "ana_adv", "ana_des"],
  scout: ["chefe_scout", "olheiro", "olheiro", "olheiro", "olheiro", "olheiro", "olheiro", "olheiro", "olheiro", "olheiro"],
  base: ["coord_base", "t_base", "t_base", "t_base"],
};
