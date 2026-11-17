// Quem é o técnico: a origem (de onde ele veio), a idade, a filosofia de jogo, a personalidade e os pontos fortes.
// Tudo isso muda o começo (reputação, licença, propostas) e o dia a dia: a força do time em campo, a beira do campo,
// as lesões, o treino, a base, o mercado, a imprensa e o vestiário. Os efeitos são pequenos e somam: ninguém vira
// gênio só pela origem, mas cada caminho tem a sua cara.
import { clamp, RNG } from "../rng.js";
import type { Tatica } from "./modelo.js";

export type Origem = "exJogador" | "preparador" | "auxiliar" | "base" | "analista" | "olheiro" | "varzea";
export type NivelEx = "craque" | "bom" | "modesto";
export type Filosofia = "posse" | "contra" | "pressao" | "retranca";
export type Personalidade = "disciplinador" | "paizao" | "motivador" | "estrategista";
export type AtribT = "tatica" | "motivacao" | "gestao" | "jovens" | "negociacao" | "midia";
export const ATRIBS_T: AtribT[] = ["tatica", "motivacao", "gestao", "jovens", "negociacao", "midia"];
export const NOME_ATRIB_T: Record<AtribT, string> = { tatica: "Tática", motivacao: "Motivação", gestao: "Gestão de elenco", jovens: "Revelar jovens", negociacao: "Negociação", midia: "Mídia" };
export const TEXTO_ATRIB_T: Record<AtribT, string> = {
  tatica: "O time rende mais em campo e a mudança de tática pesa mais.",
  motivacao: "Preleção e grito da beira mexem mais com o time.",
  gestao: "O vestiário fica mais tranquilo e a moral não despenca.",
  jovens: "Garotos evoluem mais rápido e a base revela mais talento.",
  negociacao: "Salários e transferências saem mais baratos.",
  midia: "A reputação cresce mais com os bons resultados.",
};
/** Pontos para distribuir na criação (em cima da base da origem). */
export const PONTOS_LIVRES = 12;
export const MAX_ATRIB = 20;

export interface PerfilTecnico {
  origem: Origem; nivelEx?: NivelEx; filosofia: Filosofia; personalidade: Personalidade;
  atrib: Record<AtribT, number>; /** técnico com quem trabalhou (ex-auxiliar) */ mentor?: string; bio?: string;
}
interface InfoOrigem { nome: string; curto: string; texto: string; efeito: string; base: Record<AtribT, number>; reputacao: number; licenca: number; idadeMin: number }
const A = (tatica: number, motivacao: number, gestao: number, jovens: number, negociacao: number, midia: number) => ({ tatica, motivacao, gestao, jovens, negociacao, midia });
export const ORIGENS: Record<Origem, InfoOrigem> = {
  exJogador: { nome: "Ex-jogador", curto: "ex-jogador", texto: "Pendurou as chuteiras e foi para a beira do campo.", efeito: "O vestiário respeita desde o primeiro dia e a reputação começa alta (mais ainda se foi craque). Chega com pouca licença e cru de tática.", base: A(7, 12, 11, 9, 9, 11), reputacao: 40, licenca: 2, idadeMin: 32 },
  preparador: { nome: "Preparador físico", curto: "ex-preparador físico", texto: "Anos cuidando do corpo dos atletas antes de assumir um time.", efeito: "Menos lesões no elenco e o treino rende mais. Reputação baixa no começo.", base: A(9, 10, 12, 10, 8, 7), reputacao: 22, licenca: 2, idadeMin: 28 },
  auxiliar: { nome: "Ex-auxiliar técnico", curto: "ex-auxiliar", texto: "Foi o braço direito de um técnico famoso.", efeito: "Bom de tática desde o início, comissão técnica melhor e um mentor famoso que abre portas no mercado.", base: A(13, 9, 10, 9, 10, 8), reputacao: 32, licenca: 3, idadeMin: 30 },
  base: { nome: "Técnico da base", curto: "técnico da base", texto: "Formou garotos no sub-17 e no sub-20 antes do profissional.", efeito: "Revela mais jovens, garotos evoluem mais e ele já conhece talentos da base. Começa em clube menor.", base: A(10, 10, 9, 15, 8, 7), reputacao: 24, licenca: 3, idadeMin: 28 },
  analista: { nome: "Analista de desempenho", curto: "ex-analista", texto: "O técnico de notebook: vídeo, dados e relatório de tudo.", efeito: "Estuda o adversário como ninguém (o time rende mais contra quem ele já viu) e lê o jogo pelo xG. Os veteranos desconfiam no começo.", base: A(15, 7, 8, 10, 9, 8), reputacao: 26, licenca: 3, idadeMin: 28 },
  olheiro: { nome: "Olheiro", curto: "ex-olheiro", texto: "Rodou estádios do mundo atrás de talento.", efeito: "Acha jogador bom e barato: os clubes aceitam propostas menores e os atletas pedem menos. Fraco na beira do campo.", base: A(8, 8, 9, 12, 14, 7), reputacao: 22, licenca: 2, idadeMin: 28 },
  varzea: { nome: "Sem passado no futebol", curto: "vindo da várzea", texto: "Professor de educação física, técnico de várzea, ninguém conhece.", efeito: "Começa do zero, em clube pequeno, mas cada vitória rende mais reputação e o grupo compra a ideia fácil.", base: A(8, 12, 10, 10, 9, 6), reputacao: 10, licenca: 1, idadeMin: 28 },
};
export const ORDEM_ORIGENS: Origem[] = ["exJogador", "preparador", "auxiliar", "base", "analista", "olheiro", "varzea"];
export const NIVEL_EX: Record<NivelEx, { nome: string; texto: string; reputacao: number; licenca: number; bonus: Partial<Record<AtribT, number>> }> = {
  craque: { nome: "Craque", texto: "Jogou em gigante e na seleção. Todo mundo conhece.", reputacao: 62, licenca: 1, bonus: { midia: 4, motivacao: 1 } },
  bom: { nome: "Carreira boa", texto: "Titular por anos em clube grande da liga.", reputacao: 44, licenca: 2, bonus: { midia: 1, gestao: 1 } },
  modesto: { nome: "Modesto", texto: "Rodou clubes menores, conhece o vestiário por dentro.", reputacao: 28, licenca: 2, bonus: { gestao: 2, tatica: 1 } },
};
export const FILOSOFIAS: Record<Filosofia, { nome: string; texto: string }> = {
  posse: { nome: "Posse de bola", texto: "Time ofensivo, ritmo cadenciado e sem chutão." },
  contra: { nome: "Contra-ataque", texto: "Espera atrás e sai rápido quando rouba a bola." },
  pressao: { nome: "Pressão alta", texto: "Marca lá em cima e joga acelerado." },
  retranca: { nome: "Retranca", texto: "Linha baixa, time fechado e pouco espaço para o adversário." },
};
export const PERSONALIDADES: Record<Personalidade, { nome: string; texto: string }> = {
  disciplinador: { nome: "Disciplinador", texto: "Cobra horário e postura: menos cartão e a bronca funciona mais. Promessa quebrada pesa menos com ele." },
  paizao: { nome: "Paizão", texto: "Protege o grupo: a moral sobe aos poucos toda semana e o vestiário fica mais unido." },
  motivador: { nome: "Motivador", texto: "Discurso que arrepia: a preleção e o grito da beira mexem muito mais com o time." },
  estrategista: { nome: "Estrategista", texto: "Frio e calculista: a tática pesa mais no resultado e a leitura do jogo é melhor." },
};

/** A base de pontos de quem escolheu essa origem (com o nível do ex-jogador). */
export function atribBase(origem: Origem, nivelEx?: NivelEx): Record<AtribT, number> {
  const b = { ...ORIGENS[origem].base };
  if (origem === "exJogador" && nivelEx) for (const [k, v] of Object.entries(NIVEL_EX[nivelEx].bonus)) b[k as AtribT] += v!;
  return b;
}
export function reputacaoDaOrigem(origem: Origem, nivelEx?: NivelEx): number { return origem === "exJogador" ? NIVEL_EX[nivelEx ?? "bom"].reputacao : ORIGENS[origem].reputacao; }
export function licencaDaOrigem(origem: Origem, nivelEx?: NivelEx): number { return origem === "exJogador" ? NIVEL_EX[nivelEx ?? "bom"].licenca : ORIGENS[origem].licenca; }
/** A idade muda um pouco o começo: quem começa mais velho chega com mais bagagem (e um pouco mais de reputação). */
export const ajusteIdade = (idade: number) => clamp(Math.round((idade - 38) / 4), -2, 4);

const MENTORES = ["Pep Guardiolo", "Carlo Ancelotte", "Jürgen Kloppe", "José Mourinha", "Diego Simeoni", "Luiz Felipe Scolare", "Marcelo Bielse", "Abel Ferreiro", "Tite Bacchi", "Zinedine Zidano"];
export const mentorDe = (semente: string) => MENTORES[new RNG(`${semente}|mentorT`).int(0, MENTORES.length - 1)];

/** Monta o perfil final (base da origem + pontos distribuídos, sem passar do máximo). */
export function montarPerfil(p: { origem: Origem; nivelEx?: NivelEx; filosofia: Filosofia; personalidade: Personalidade; extra: Partial<Record<AtribT, number>> }, semente: string): PerfilTecnico {
  const base = atribBase(p.origem, p.nivelEx), atrib = { ...base };
  let livres = PONTOS_LIVRES;
  for (const k of ATRIBS_T) { const n = clamp(Math.round(p.extra[k] ?? 0), 0, livres); const add = Math.min(n, MAX_ATRIB - atrib[k]); atrib[k] += add; livres -= add; }
  if (p.personalidade === "estrategista") atrib.tatica = Math.min(MAX_ATRIB, atrib.tatica + 1);
  if (p.personalidade === "motivador") atrib.motivacao = Math.min(MAX_ATRIB, atrib.motivacao + 1);
  if (p.personalidade === "paizao") atrib.gestao = Math.min(MAX_ATRIB, atrib.gestao + 1);
  return { origem: p.origem, ...(p.origem === "exJogador" ? { nivelEx: p.nivelEx ?? "bom" } : {}), filosofia: p.filosofia, personalidade: p.personalidade, atrib, ...(p.origem === "auxiliar" ? { mentor: mentorDe(semente) } : {}) };
}

/** A biografia curta que aparece no perfil e na revista. */
export function biografia(p: PerfilTecnico, d: { nome: string; idade: number; pais: string; apelidoEx?: string }): string {
  const fil = FILOSOFIAS[p.filosofia].nome.toLowerCase(), per = PERSONALIDADES[p.personalidade].nome.toLowerCase();
  const forte = [...ATRIBS_T].sort((a, b) => p.atrib[b] - p.atrib[a])[0];
  const passado = p.origem === "exJogador"
    ? (d.apelidoEx ? `Depois de uma carreira como ${d.apelidoEx}, ` : p.nivelEx === "craque" ? "Depois de uma carreira de craque, com camisa de seleção e taça levantada, " : p.nivelEx === "modesto" ? "Depois de rodar o interior e clubes pequenos como jogador, " : "Depois de anos como titular de clube grande, ")
    : p.origem === "auxiliar" ? `Depois de anos como auxiliar de ${p.mentor ?? "um técnico famoso"}, `
    : p.origem === "preparador" ? "Depois de anos como preparador físico, cuidando do corpo de elencos inteiros, "
    : p.origem === "base" ? "Depois de formar garotos no sub-17 e no sub-20, "
    : p.origem === "analista" ? "Depois de anos atrás do notebook, analisando vídeo e números para outros técnicos, "
    : p.origem === "olheiro" ? "Depois de rodar estádios do mundo atrás de talento como olheiro, "
    : "Sem nunca ter passado por um clube profissional, vindo das aulas de educação física e da várzea, ";
  return `${passado}${d.nome} assume o primeiro time aos ${d.idade} anos. É um técnico ${per}, adepto do jogo de ${fil}, e o que mais sabe fazer é ${NOME_ATRIB_T[forte].toLowerCase()}.`;
}

// ---- efeitos no jogo (todos voltam 1 / 0 quando o técnico não tem perfil, como nos saves antigos) ----
type ComPerfil = { tecnico: { perfil?: PerfilTecnico } };
const at = (s: ComPerfil, k: AtribT) => s.tecnico.perfil?.atrib[k] ?? 10;
/** A tática do time combina com a filosofia do técnico? */
export function combinaFilosofia(f: Filosofia, t: Tatica): boolean {
  if (f === "posse") return t.mentalidade >= 2 && t.ritmo <= 1 && !t.contraAtaque;
  if (f === "contra") return t.contraAtaque && t.mentalidade <= 2;
  if (f === "pressao") return t.pressao === 2 && t.ritmo >= 1;
  return t.mentalidade <= 1 && t.linha === 0;
}
/** Quanto o time rende em campo pela cabeça do técnico: [ataque, defesa (menor = melhor)]. */
export function fatorTecnicoJogo(s: ComPerfil & { tatica: Tatica }, advVisto = false): [number, number] {
  const p = s.tecnico.perfil;
  if (!p) return [1, 1];
  const tat = (at(s, "tatica") - 10) * (p.personalidade === "estrategista" ? 0.0055 : 0.004);
  const fil = combinaFilosofia(p.filosofia, s.tatica) ? 0.03 : 0;
  const ana = p.origem === "analista" && advVisto ? 0.02 : 0;
  return [1 + tat + fil + ana, 1 - tat * 0.8 - fil * 0.6 - ana];
}
/** Multiplica o efeito da preleção e do grito (só o desvio em relação a 1). */
export function fatorBeira(s: ComPerfil): number {
  const p = s.tecnico.perfil;
  if (!p) return 1;
  return clamp(1 + (at(s, "motivacao") - 10) * 0.05 + (p.personalidade === "motivador" ? 0.25 : 0), 0.5, 2);
}
export const fatorLesao = (s: ComPerfil) => (s.tecnico.perfil?.origem === "preparador" ? 0.75 : 1);
export const fatorCartao = (s: ComPerfil) => (s.tecnico.perfil?.personalidade === "disciplinador" ? 0.8 : 1);
/** Treino: o preparador tira mais do corpo; quem revela jovens tira mais dos garotos. */
export function fatorTreino(s: ComPerfil, idade: number): number {
  const p = s.tecnico.perfil;
  if (!p) return 1;
  return 1 + (p.origem === "preparador" ? 0.04 : 0) + (idade <= 21 ? (at(s, "jovens") - 10) * 0.012 + (p.origem === "base" ? 0.05 : 0) : 0);
}
/** Potencial a mais dos garotos que chegam na base. */
export const bonusBase = (s: ComPerfil) => (s.tecnico.perfil ? (at(s, "jovens") - 10) * 0.35 + (s.tecnico.perfil.origem === "base" ? 2 : 0) : 0);
/** Desconto no salário pedido e no preço do clube. */
export function fatorNegocio(s: ComPerfil): number {
  const p = s.tecnico.perfil;
  if (!p) return 1;
  return clamp(1 - (at(s, "negociacao") - 10) * 0.008 - (p.origem === "olheiro" ? 0.05 : 0), 0.85, 1.08);
}
/** Quanto a reputação ganha com o bom resultado (a perda não muda). */
/** Reputação ganha cada vez mais devagar perto do topo: chegar a 100 é coisa de lenda (anos ganhando), não de uma boa temporada. */
export const freioReputacao = (rep: number) => clamp(1.15 - rep / 110, 0.15, 1);
export function fatorReputacao(s: ComPerfil): number {
  const p = s.tecnico.perfil;
  if (!p) return 1;
  return clamp(1 + (at(s, "midia") - 10) * 0.04 + (p.origem === "varzea" ? 0.3 : 0), 0.7, 1.7);
}
/** A moral da semana pela gestão de grupo: puxa para cima quem está baixo (paizão puxa mais). */
export function ajusteMoralSemana(s: ComPerfil, moral: number): number {
  const p = s.tecnico.perfil;
  if (!p) return moral;
  const alvo = 72, f = (at(s, "gestao") - 8) * 0.012 + (p.personalidade === "paizao" ? 0.06 : 0);
  return moral < alvo && f > 0 ? Math.min(alvo, moral + (alvo - moral) * f) : moral;
}
/** Como o elenco recebe o técnico novo (moral de partida de cada atleta). */
export function moralDeChegada(s: ComPerfil, a: { idade: number; moral: number }): number {
  const p = s.tecnico.perfil;
  if (!p) return a.moral;
  if (p.origem === "exJogador") return clamp(a.moral + (p.nivelEx === "craque" ? 8 : p.nivelEx === "bom" ? 5 : 3), 0, 100);
  if (p.origem === "analista" && a.idade >= 30) return clamp(a.moral - 8, 0, 100);
  if (p.origem === "varzea") return clamp(a.moral + 3, 0, 100);
  return a.moral;
}
