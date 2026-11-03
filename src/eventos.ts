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
    unico: cad.unico, quando: (c) => temPersonagem(cad, c.paisClube) && (cad.quando?.(c) ?? true),
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
// família (pai, mãe e irmãos sorteados no começo da carreira)
const TODAS: Fase[] = ["base", "inicio", "estabelecido", "estrela", "veterano"];
EVENTOS.push(
  ev("aniversario-mae", TODAS, "Aniversário da sua mãe", "Hoje é aniversário da sua mãe, e o treino do {clube} é à tarde.", [
    op("festa", "Fazer uma festa surpresa", "A casa encheu de tia, primo e vizinho. Sua mãe chorou no parabéns.", { sal: -0.3, moral: 5, pais: 8 }),
    op("flores", "Ligar cedo e mandar flores", "Ela mandou foto das flores para o grupo da família inteira.", { dinheiro: -400, moral: 2, pais: 4 }),
    op("esquecer", "Deixar para depois", "Ela não reclamou. Seu pai reclamou por ela.", { moral: -3, pais: -10 }),
  ]),
  ev("pai-saude", TODAS, "Seu pai no hospital", "Seu pai passou mal e ficou internado. Os médicos pedem exames caros.", [
    op("melhor", "Pagar o melhor hospital", "Ele saiu em uma semana, mandando você voltar a treinar.", { sal: -1.5, moral: 2, pais: 12 }),
    op("plano", "Pagar um plano de saúde", "Tratamento bom, sem luxo. Ele já está em casa.", { dinheiro: -8000, pais: 6 }),
    op("publico", "Deixar com o hospital público", "Demorou, mas ele está bem. A família comentou.", { moral: -3, pais: -8 }),
  ], { quando: (c) => !!c.paiVelho }),
  ev("irmao-largar", TODAS, "Seu irmão quer largar o futebol", "Seu irmão mais novo cansou de ser cobrado e diz que quer largar a bola para estudar.", [
    op("convencer", "Convencer a continuar", "Ele voltou para o treino. Sem muita vontade, mas voltou.", { irmao: -4 }),
    op("escolinha", "Pagar uma escolinha particular", "Treinador novo, chuteira nova. O brilho nos olhos voltou.", { dinheiro: -6000, irmao: 8, irmaoPot: 3 }),
    op("apoiar", "Apoiar a decisão dele", "Ele vai fazer cursinho. Disse que você é o melhor irmão do mundo.", { irmao: 10, irmaoPara: true }),
  ], { quando: (c) => !!c.irmaoJoga }),
  ev("pai-transferencia", ["inicio", "estabelecido", "estrela", "veterano"], "Seu pai quer opinar", "Tem proposta na mesa e seu pai ligou: quer conversar antes de você decidir.", [
    op("ouvir", "Ouvir o pai com calma", "Ele falou da cidade, do clube e da sua mãe. Você ficou mais tranquilo.", { pais: 6, moral: 2 }),
    op("sozinho", "Decidir sozinho", "A carreira é sua. Ele entendeu, mas ficou magoado.", { pais: -5 }),
  ], { quando: (c) => !!c.proposta }),
  ev("visita-exterior", ["inicio", "estabelecido", "estrela", "veterano"], "Saudade de casa", "A família quer vir passar as férias com você em {cidade}.", [
    op("pagar", "Pagar as passagens de todo mundo", "Duas semanas de casa cheia e comida de mãe.", { sal: -0.5, moral: 6, pais: 10 }),
    op("adiar", "Pedir para virem no ano que vem", "Sua mãe disse que tudo bem. Não estava tudo bem.", { pais: -6, moral: -2 }),
  ], { quando: (c) => c.exterior }),
  ev("irmao-ajuda", TODAS, "Seu irmão precisa de ajuda", "Seu irmão se machucou e o clube dele não paga a fisioterapia.", [
    op("pagar", "Pagar a fisioterapia", "Ele voltou a jogar em dois meses e postou agradecendo.", { dinheiro: -12000, irmao: 10 }),
    op("fisio", "Pedir ajuda ao fisioterapeuta do seu clube", "Seu fisio atendeu ele de graça nas folgas.", { irmao: 6, relTecnico: -1 }),
  ], { quando: (c) => !!c.irmaoPro }),
);
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
