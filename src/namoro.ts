// Namoro pelo app do celular (paródia de app de encontros): perfis gerados, curtir ou passar, deu match,
// conversa, primeiro encontro, namoro, morar junto e casamento. A profissão dela mexe no jogo
// (influencer dá fama, psicóloga dá moral, agente negocia por você...). Só a partir dos 18 anos.
import { RNG, clamp } from "./rng.js";

export const IDADE_MINIMA_APP = 18;
export type Profissao = "influencer" | "psicologa" | "agente" | "modelo" | "medica" | "jornalista" | "personal" | "nutricionista" | "advogada" | "professora" | "estudante" | "arquiteta";
export const PROFISSOES: Record<Profissao, { nome: string; efeito: string }> = {
  influencer: { nome: "Influenciadora", efeito: "Mais fama e engajamento nas redes" },
  psicologa: { nome: "Psicóloga", efeito: "Moral mais alta e menos pressão" },
  agente: { nome: "Agente de jogadores", efeito: "Negocia seus contratos melhor" },
  modelo: { nome: "Modelo", efeito: "Status e fama (e mais convites para a noite)" },
  medica: { nome: "Médica", efeito: "Recuperação mais rápida" },
  jornalista: { nome: "Jornalista esportiva", efeito: "Imprensa e torcida do seu lado" },
  personal: { nome: "Personal trainer", efeito: "Treino rende mais" },
  nutricionista: { nome: "Nutricionista", efeito: "Recuperação e evolução" },
  advogada: { nome: "Advogada", efeito: "Contratos sem armadilha: luvas maiores" },
  professora: { nome: "Professora", efeito: "Vida tranquila: moral estável" },
  estudante: { nome: "Estudante", efeito: "Sem efeito especial" },
  arquiteta: { nome: "Arquiteta", efeito: "A casa fica mais confortável" },
};
const PESO_PROF: [Profissao, number][] = [["influencer", 3], ["modelo", 2], ["psicologa", 2], ["agente", 1], ["medica", 1.5], ["jornalista", 1.5], ["personal", 2], ["nutricionista", 1.5], ["advogada", 1.5], ["professora", 2], ["estudante", 2.5], ["arquiteta", 1.5]];
const JEITOS = ["caseira", "festeira", "aventureira", "workaholic", "romântica", "competitiva", "tranquila", "engraçada", "ciumenta", "independente"];
/** Do que ela gosta (e o que ela não suporta): acertar o programa rende muito mais. */
export type Gosto = "praia" | "balada" | "cinema" | "futebol" | "viagem" | "comida" | "musica" | "natureza" | "moda" | "games";
export const NOME_GOSTO: Record<Gosto, string> = { praia: "praia", balada: "balada", cinema: "cinema e séries", futebol: "futebol", viagem: "viajar", comida: "comer bem", musica: "show e música", natureza: "trilha e natureza", moda: "moda e presentes", games: "videogame" };
const GOSTOS = Object.keys(NOME_GOSTO) as Gosto[];
export function gostosDe(p: Perfil): { gosta: Gosto[]; odeia: Gosto } {
  if (p.gostos && p.odeia) return { gosta: p.gostos, odeia: p.odeia };
  const r = new RNG(`gostos|${p.id}`), l = [...GOSTOS];
  const tira = () => l.splice(Math.floor(r.next() * l.length), 1)[0];
  const gosta = [tira(), tira()];
  if (p.jeito === "festeira" && !gosta.includes("balada")) gosta[1] = "balada";
  if (p.jeito === "aventureira" && !gosta.includes("natureza") && !gosta.includes("viagem")) gosta[1] = "viagem";
  return { gosta, odeia: l.filter((g) => !gosta.includes(g))[Math.floor(r.next() * (l.length - 2))] ?? "games" };
}
/** Ela já contou do que gosta? (depois de umas conversas ou do primeiro encontro) */
export const conheceGostos = (p: Par) => p.etapa !== "match" || p.conversas >= 2;
const fatorGosto = (p: Perfil, g?: Gosto) => { if (!g) return 1; const x = gostosDe(p); return x.gosta.includes(g) ? 1.6 : x.odeia === g ? 0.3 : 1; };
const comentarioGosto = (p: Perfil, g?: Gosto) => { const f = fatorGosto(p, g); return f > 1 ? " Ela amou: é a cara dela." : f < 1 ? " Ela não curtiu muito." : ""; };
/** Lugares para um encontro: cada um combina com um gosto. */
export type Lugar = "restaurante" | "barzinho" | "balada" | "praia" | "show" | "cinema" | "trilha" | "estadio" | "fliperama";
export const LUGARES: Record<Lugar, { nome: string; gosto: Gosto; custo: number }> = {
  restaurante: { nome: "Restaurante chique", gosto: "comida", custo: 0.02 }, barzinho: { nome: "Barzinho com música ao vivo", gosto: "musica", custo: 0.006 },
  balada: { nome: "Balada", gosto: "balada", custo: 0.01 }, praia: { nome: "Fim de tarde na praia", gosto: "praia", custo: 0.002 },
  show: { nome: "Show de um cantor famoso", gosto: "musica", custo: 0.012 }, cinema: { nome: "Cinema", gosto: "cinema", custo: 0.003 },
  trilha: { nome: "Trilha com cachoeira", gosto: "natureza", custo: 0.002 }, estadio: { nome: "Jogo de outro time no estádio", gosto: "futebol", custo: 0.004 },
  fliperama: { nome: "Fliperama e boliche", gosto: "games", custo: 0.004 },
};
/** Um momento no meio do encontro, com escolha (cada jeito dela reage diferente). */
export interface Cena { texto: string; opcoes: { id: string; rotulo: string }[]; tipo: string }
const CENAS: { tipo: string; texto: string; opcoes: { id: string; rotulo: string; delta: Partial<Record<string, number>> & { base: number }; fama?: number }[] }[] = [
  { tipo: "fa", texto: "Um torcedor reconhece você e pede foto no meio do encontro. Logo vem outro.", opcoes: [
    { id: "foto", rotulo: "Tirar foto com todo mundo", delta: { base: -2, independente: 5, festeira: 4, ciumenta: -4, caseira: -4 }, fama: 0.3 },
    { id: "educado", rotulo: "Pedir licença com educação: hoje é dela", delta: { base: 6, romântica: 4, caseira: 3 } }] },
  { tipo: "conta", texto: "A conta chegou. Ela já está pegando a bolsa.", opcoes: [
    { id: "pagar", rotulo: "Pagar tudo", delta: { base: 3, romântica: 4, independente: -5 } },
    { id: "dividir", rotulo: "Dividir", delta: { base: -1, independente: 7, workaholic: 3, romântica: -5 } }] },
  { tipo: "ex", texto: "Do nada, ela pergunta: \"E a sua ex? Vocês ainda se falam?\"", opcoes: [
    { id: "sincero", rotulo: "Ser sincero sobre tudo", delta: { base: 4, ciumenta: -3, tranquila: 4 } },
    { id: "desviar", rotulo: "Mudar de assunto com uma piada", delta: { base: 0, engraçada: 6, ciumenta: -7 } }] },
  { tipo: "danca", texto: "Começa a tocar uma música lenta. Ela olha para você e sorri.", opcoes: [
    { id: "dancar", rotulo: "Chamar para dançar", delta: { base: 6, romântica: 6, festeira: 4, caseira: -2 } },
    { id: "mesa", rotulo: "Ficar na mesa conversando", delta: { base: -1, caseira: 4, tranquila: 3, romântica: -5 } }] },
  { tipo: "chuva", texto: "Cai um temporal de repente. Os dois ficam encharcados em segundos.", opcoes: [
    { id: "rir", rotulo: "Correr rindo e transformar em aventura", delta: { base: 6, aventureira: 7, engraçada: 4 } },
    { id: "reclamar", rotulo: "Reclamar do tempo e chamar um carro", delta: { base: -4, workaholic: 2 } }] },
  { tipo: "desafio", texto: "Ela desafia: \"Duvido você me ganhar no fliperama… ou em qualquer coisa.\"", opcoes: [
    { id: "aceitar", rotulo: "Aceitar e jogar para ganhar", delta: { base: 3, competitiva: 8, engraçada: 3 } },
    { id: "perder", rotulo: "Deixar ela ganhar", delta: { base: 1, competitiva: -6, romântica: 3 } }] },
];
const NOMES = ["Ana", "Bia", "Bruna", "Camila", "Carol", "Clara", "Duda", "Fernanda", "Gabi", "Giovanna", "Helena", "Isabela", "Jéssica", "Júlia", "Larissa", "Laura", "Letícia",
  "Lívia", "Luana", "Manu", "Mariana", "Marina", "Natália", "Paula", "Rafaela", "Raquel", "Sofia", "Thaís", "Valentina", "Vitória", "Yasmin", "Lara", "Alice", "Nina", "Lorena"];
const SOBRENOMES = ["Alves", "Araújo", "Barros", "Campos", "Cardoso", "Costa", "Dias", "Duarte", "Freitas", "Gomes", "Lima", "Lopes", "Machado", "Martins", "Melo", "Moraes", "Nunes",
  "Oliveira", "Pereira", "Ramos", "Reis", "Ribeiro", "Rocha", "Santos", "Silva", "Souza", "Teixeira", "Vieira"];

export interface Perfil { id: string; nome: string; idade: number; cidade: string; profissao: Profissao; jeito: string; bio: string; /** quanto ela está a fim (0–100) */ interesse: number; gostos?: Gosto[]; odeia?: Gosto }
export type Etapa = "match" | "saindo" | "namorando" | "morando" | "noivos" | "casados";
export const NOME_ETAPA: Record<Etapa, string> = { match: "Deu match", saindo: "Saindo", namorando: "Namorando", morando: "Morando juntos", noivos: "Noivos", casados: "Casados" };
export interface Par extends Perfil { etapa: Etapa; relacao: number; desde: number; conversas: number; cidadeClube: string;
  /** quantas vezes vocês fizeram algo nesta semana (a 5ª conversa rende menos que a 1ª) */
  vezes?: { s: number; n: number }; conheceuFamilia?: boolean;
  /** caso escondido: encontros nesta semana (aumentam o risco) e se já saiu na mídia */
  escondidos?: number; exposto?: boolean;
  /** conversa do app esperando resposta, momento do encontro esperando escolha, ela virou famosa, aniversário (semana da temporada) */
  chat?: { msg: string; s: number }; cena?: Cena; famosa?: boolean; aniver?: number }
export interface Filho { nome: string; mae: string; ano: number; /** mãe não é a companheira atual: pensão */ pensao: boolean;
  /** relação com o pai (0–100) e a semana do último programa juntos */ relacao?: number; contato?: number; vezes?: { s: number; n: number };
  /** o filho que quer ser jogador: escolinha, base de um clube, profissional, ou largou */
  futebol?: { fase: "escolinha" | "base" | "pro" | "parou"; ovr: number; pot: number; clubeId?: string };
  adulto?: boolean }
export interface Gravidez { mae: string; parto: number; caso: boolean }
export interface EstadoNamoro {
  /** perfis do dia no app (renovam toda semana) e a semana em que foram gerados */
  baralho: Perfil[]; geradoEm: number; vistos: number;
  matches: Par[]; par?: Par; semana: number; feitas: number; ex: string[];
  /** relacionamentos paralelos (amantes), filhos e escândalos na mídia */
  casos?: Par[]; filhos?: Filho[]; escandalos?: number; gravidez?: Gravidez;
  /** mudança de cidade esperando a decisão do casal (e a cidade já decidida) */
  mudanca?: string; mudancaDecidida?: string;
}
export const novoNamoro = (): EstadoNamoro => ({ baralho: [], geradoEm: -1, vistos: 0, matches: [], semana: -1, feitas: 0, ex: [], casos: [], filhos: [] });
export const MAX_ACOES_NAMORO = 20;

export interface CtxNamoro { ano?: number; semente: string; semanaAbs: number; idadeJogador: number; fama: number; cidade: string; salario: number; saldo: number; vidaNoturna: number }

function sortearProf(rng: RNG): Profissao {
  const tot = PESO_PROF.reduce((a, [, p]) => a + p, 0); let r = rng.next() * tot;
  for (const [k, p] of PESO_PROF) { r -= p; if (r <= 0) return k; }
  return "estudante";
}
const BIO: Record<Profissao, string[]> = {
  influencer: ["Postando a vida em stories. Se der match, vira conteúdo 😅", "Viagem, café e luz boa para foto."],
  psicologa: ["Escuto bem e falo pouco. Me conta sobre você.", "Terapia pros outros, praia pra mim."],
  agente: ["Fecho contrato de dia e janta à noite.", "Já li mais cláusula de rescisão do que livro de romance."],
  modelo: ["Semana de moda em São Paulo, fim de semana sem maquiagem.", "Passarela, academia e pizza no domingo."],
  medica: ["Plantão é minha segunda casa. A primeira tem um gato.", "Se você se machucar, eu sei o que fazer."],
  jornalista: ["Cubro futebol. Prometo não te dar nota 5 no jornal.", "Microfone na mão e opinião forte."],
  personal: ["Treino às 6h. Se acompanhar, a gente conversa.", "Corpo são, mente sã, e um açaí de vez em quando."],
  nutricionista: ["Nada de fritura antes do jogo, combinado?", "Planejo cardápio e viagem com a mesma planilha."],
  advogada: ["Leio as letras miúdas pra você.", "Direito de dia, samba à noite."],
  professora: ["Ensino crianças a ler e adultos a respeitar o horário.", "Paciência infinita, menos com quem chega atrasado."],
  estudante: ["Último ano da faculdade e muita vontade de viajar.", "Entre provas e festas, me sobra um tempo pra você."],
  arquiteta: ["Tenho opinião sobre o seu sofá.", "Casas bonitas, plantas e luz natural."],
};

/** Perfis da semana no app: idade perto da sua, todas adultas, na cidade do clube ou perto. */
export function baralhoDaSemana(n: EstadoNamoro, ctx: CtxNamoro): Perfil[] {
  if (ctx.idadeJogador < IDADE_MINIMA_APP) return [];
  if (n.geradoEm === ctx.semanaAbs) return n.baralho;
  const rng = new RNG(`${ctx.semente}|app|${ctx.semanaAbs}`);
  n.baralho = Array.from({ length: 6 }, (_, i) => {
    const prof = sortearProf(rng);
    return { id: `p${ctx.semanaAbs}-${i}`, nome: `${rng.pick(NOMES)} ${rng.pick(SOBRENOMES)}`, idade: Math.max(IDADE_MINIMA_APP, ctx.idadeJogador + rng.int(-3, 4)),
      cidade: rng.chance(0.75) ? ctx.cidade : "região metropolitana", profissao: prof, jeito: rng.pick(JEITOS), bio: rng.pick(BIO[prof]), interesse: rng.int(25, 70) } as Perfil;
  });
  for (const p of n.baralho) { const g = gostosDe(p); p.gostos = g.gosta; p.odeia = g.odeia; }
  n.geradoEm = ctx.semanaAbs; n.vistos = 0;
  return n.baralho;
}
/** Chance de dar match: fama ajuda muito; quem já namora sério no app chama atenção (e não é bem visto). */
export const chanceMatch = (p: Perfil, fama: number) => clamp(0.18 + fama / 140 + (p.interesse - 45) / 150 + (p.profissao === "influencer" || p.profissao === "modelo" ? fama / 400 : 0), 0.08, 0.9);

export function curtir(n: EstadoNamoro, id: string, sim: boolean, ctx: CtxNamoro): { ok: boolean; msg: string; match?: boolean } {
  if (ctx.idadeJogador < IDADE_MINIMA_APP) return { ok: false, msg: "O app é só para maiores de 18." };
  const p = n.baralho.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Esse perfil já passou." };
  n.baralho = n.baralho.filter((x) => x.id !== id); n.vistos++;
  if (!sim) return { ok: true, msg: `Você passou ${p.nome.split(" ")[0]}.` };
  const rng = new RNG(`${ctx.semente}|match|${id}`);
  if (!rng.chance(chanceMatch(p, ctx.fama))) return { ok: true, msg: `Você curtiu ${p.nome.split(" ")[0]}. Ainda não rolou match.`, match: false };
  n.matches = [{ ...p, etapa: "match" as Etapa, relacao: p.interesse, desde: ctx.semanaAbs, conversas: 0, cidadeClube: ctx.cidade }, ...n.matches].slice(0, 8);
  return { ok: true, msg: `Deu match com ${p.nome.split(" ")[0]}! Mande uma mensagem.`, match: true };
}

export type AcaoNamoro = "encontro" | "conversar" | "convidar" | "pedirNamoro" | "jantar" | "presente" | "viagem" | "morarJunto" | "pedirCasamento" | "terminar"
  | "cozinhar" | "serie" | "levarJogo" | "postarFoto" | "conhecerFamilia" | "encontroEscondido" | "assumir" | "tentarFilho";
export const NOME_ACAO_NAMORO: Record<AcaoNamoro, string> = {
  encontro: "Marcar um encontro", conversar: "Conversar", convidar: "Chamar para sair", pedirNamoro: "Pedir em namoro", jantar: "Jantar fora", presente: "Dar um presente",
  viagem: "Viagem de fim de semana", morarJunto: "Chamar para morar junto", pedirCasamento: "Pedir em casamento", terminar: "Terminar",
  cozinhar: "Cozinhar em casa", serie: "Maratonar uma série", levarJogo: "Levar ao jogo", postarFoto: "Postar foto juntos", conhecerFamilia: "Apresentar à família",
  encontroEscondido: "Encontro escondido", assumir: "Assumir o relacionamento", tentarFilho: "Tentar ter um filho",
};
const ehCaso = (n: EstadoNamoro, p: Par) => !!n.casos?.some((x) => x.id === p.id);
export function acoesNamoro(p: Par, semanaAbs: number, caso = false, gravida = false): AcaoNamoro[] {
  const filho = !gravida && p.relacao >= 60 && (caso ? p.etapa === "namorando" : ["morando", "noivos", "casados"].includes(p.etapa)) ? ["tentarFilho" as const] : [];
  if (caso) return ["conversar", "encontroEscondido", "presente", ...(p.etapa === "saindo" && p.relacao >= 55 ? ["pedirNamoro" as const] : []), ...filho, "assumir", "terminar"];
  const casa = ["cozinhar", "serie"] as AcaoNamoro[], publico = ["levarJogo", "postarFoto"] as AcaoNamoro[];
  switch (p.etapa) {
    case "match": return ["conversar", ...(p.conversas >= 2 ? ["convidar" as const] : [])];
    case "saindo": return ["conversar", "encontro", "jantar", "serie", ...(p.relacao >= 55 ? ["pedirNamoro" as const] : []), "terminar"];
    case "namorando": return [...filho, "conversar", "encontro", "jantar", ...casa, ...publico, "presente", "viagem", ...(!p.conheceuFamilia ? ["conhecerFamilia" as const] : []), ...(p.relacao >= 70 && semanaAbs - p.desde >= 12 ? ["morarJunto" as const] : []), "terminar"];
    case "morando": return [...filho, "conversar", "encontro", "jantar", ...casa, ...publico, "presente", "viagem", ...(!p.conheceuFamilia ? ["conhecerFamilia" as const] : []), ...(p.relacao >= 78 && semanaAbs - p.desde >= 20 ? ["pedirCasamento" as const] : []), "terminar"];
    case "noivos": case "casados": return [...filho, "conversar", "encontro", "jantar", ...casa, ...publico, "presente", "viagem", "terminar"];
  }
}
export interface ResultadoNamoro { ok: boolean; msg: string; custo?: number; moral?: number; cansaco?: number; noticia?: string; fama?: number; engajamento?: number; torcida?: number; escandalo?: boolean }

const GOSTO_ACAO: Partial<Record<AcaoNamoro, Gosto>> = { jantar: "comida", cozinhar: "comida", serie: "cinema", levarJogo: "futebol", viagem: "viagem", presente: "moda", postarFoto: "moda" };
export type ModoPedido = "estadio" | "viagem" | "jantar";
export const NOME_PEDIDO: Record<ModoPedido, string> = { estadio: "No gramado, depois do jogo", viagem: "Numa viagem romântica", jantar: "Num jantar só de vocês dois" };
function sortearCena(rng: RNG, lugar?: Lugar): Cena {
  const l = CENAS.filter((c) => (c.tipo !== "desafio" || lugar === "fliperama" || lugar === "estadio" || rng.chance(0.3)) && (c.tipo !== "chuva" || lugar === "praia" || lugar === "trilha" || rng.chance(0.2)) && (c.tipo !== "danca" || lugar === "barzinho" || lugar === "balada" || lugar === "show" || rng.chance(0.2)));
  const c = rng.pick(l);
  return { tipo: c.tipo, texto: c.texto, opcoes: c.opcoes.map((o) => ({ id: o.id, rotulo: o.rotulo })) };
}
/** A escolha no meio do encontro. */
export function responderCena(n: EstadoNamoro, id: string, opcao: string): ResultadoNamoro {
  const p = n.par?.id === id ? n.par : n.casos?.find((x) => x.id === id);
  if (!p?.cena) return { ok: false, msg: "Esse momento já passou." };
  const c = CENAS.find((x) => x.tipo === p.cena!.tipo), o = c?.opcoes.find((x) => x.id === opcao);
  p.cena = undefined;
  if (!o) return { ok: false, msg: "Esse momento já passou." };
  const d = o.delta.base + (o.delta[p.jeito] ?? 0), nome = p.nome.split(" ")[0];
  p.relacao = clamp(p.relacao + d, 0, 100);
  return { ok: true, msg: d >= 6 ? `${nome} adorou. Esse vai ficar na memória.` : d >= 2 ? `${nome} gostou.` : d >= 0 ? `${nome} não ligou muito.` : `${nome} ficou meio sem graça. Não era isso que ela esperava.`, ...(o.fama ? { fama: o.fama } : {}) };
}
/** Química: o jeito dela com o seu estilo de vida, e o quanto ela está a fim. */
export function quimica(p: Par, vidaNoturna: number): number {
  const noite = p.jeito === "festeira" ? (vidaNoturna - 30) / 2 : p.jeito === "caseira" || p.jeito === "tranquila" ? (30 - vidaNoturna) / 2 : 0;
  return Math.round(clamp(45 + p.interesse / 3 + noite + (p.relacao - 50) / 4, 5, 98));
}
/** O que ela pensa de você hoje. */
export function pensamentoDela(p: Par): string {
  const r = p.relacao;
  const base = r >= 80 ? "Fala de você para todas as amigas." : r >= 60 ? "Está gostando de verdade." : r >= 40 ? "Gosta, mas sente falta de você." : r >= 20 ? "Anda distante e responde seco." : "Está pensando em terminar.";
  const extra: Record<string, string> = { ciumenta: " E fica de olho em cada comentário nas suas fotos.", independente: " Mas não abre mão do espaço dela.", festeira: " Quer sair mais.", caseira: " Prefere vocês dois em casa.", romântica: " Sonha alto com vocês dois.", workaholic: " Mesmo com a agenda lotada.", competitiva: " E quer ver você ganhando tudo.", aventureira: " E já pensa na próxima viagem.", tranquila: " Sem drama.", "engraçada": " E ri das suas piadas, até das ruins." };
  return base + (extra[p.jeito] ?? "");
}

export function agirNamoro(n: EstadoNamoro, id: string, acao: AcaoNamoro, ctx: CtxNamoro, extra?: string): ResultadoNamoro {
  if (n.semana !== ctx.semanaAbs) { n.semana = ctx.semanaAbs; n.feitas = 0; }
  n.casos ??= []; n.filhos ??= [];
  const p = n.par?.id === id ? n.par : n.casos.find((x) => x.id === id) ?? n.matches.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Conversa não encontrada." };
  if (acao !== "terminar" && n.feitas >= MAX_ACOES_NAMORO) return { ok: false, msg: `Já foram ${MAX_ACOES_NAMORO} programas nesta semana.` };
  const caso = ehCaso(n, p);
  if (!acoesNamoro(p, ctx.semanaAbs, caso, !!n.gravidez).includes(acao)) return { ok: false, msg: "Ainda não é hora." };
  const rng = new RNG(`${ctx.semente}|namoro|${id}|${acao}|${ctx.semanaAbs}|${n.feitas}`), nome = p.nome.split(" ")[0];
  // a mesma pessoa várias vezes na semana: cada programa rende menos
  if (!p.vezes || p.vezes.s !== ctx.semanaAbs) p.vezes = { s: ctx.semanaAbs, n: 0 };
  const rende = Math.max(0.2, 1 - 0.15 * p.vezes.n);
  const gostoAcao = GOSTO_ACAO[acao], fg = fatorGosto(p, gostoAcao) * (p.jeito === "romântica" ? 1.15 : 1) * (acao === "viagem" && p.jeito === "aventureira" ? 1.4 : 1);
  const sobe = (v: number) => { p.relacao = clamp(p.relacao + v * rende * fg, 0, 100); n.feitas++; p.vezes!.n++; };
  const gc = comentarioGosto(p, gostoAcao);
  const custo = (k: number, piso: number) => Math.round(Math.max(piso, ctx.salario * k));
  switch (acao) {
    case "conversar": sobe(rng.int(2, 6)); p.conversas++; return { ok: true, msg: `Você e ${nome} ficaram até tarde trocando mensagem.` };
    case "convidar": {
      n.feitas++;
      if (!rng.chance(clamp(0.3 + p.relacao / 120 + ctx.fama / 300, 0.1, 0.92))) { p.relacao = clamp(p.relacao - 3, 0, 100); return { ok: true, msg: `${nome} disse que essa semana não dá. Quem sabe na próxima.` }; }
      const lugar1 = (extra && extra in LUGARES ? extra : "barzinho") as Lugar;
      p.etapa = "saindo"; p.desde = ctx.semanaAbs; p.relacao = clamp(p.relacao + 8 * fatorGosto(p, LUGARES[lugar1].gosto), 0, 100); n.matches = n.matches.filter((x) => x.id !== p.id);
      p.cena = sortearCena(rng, lugar1);
      if (n.par) { n.casos.push(p); return { ok: true, msg: `Você saiu escondido com ${nome}. Agora é um caso: cuidado com a mídia (e com ${n.par.nome.split(" ")[0]}).`, moral: 2 }; }
      n.par = p;
      return { ok: true, msg: `Primeiro encontro com ${nome}: ${LUGARES[lugar1].nome.toLowerCase()}.${comentarioGosto(p, LUGARES[lugar1].gosto)}`, moral: 3 };
    }
    case "encontro": {
      const lugar = (extra && extra in LUGARES ? extra : "restaurante") as Lugar, L = LUGARES[lugar];
      const c = custo(L.custo, 150); if (ctx.saldo < c) return { ok: false, msg: "Dinheiro curto para esse programa." };
      const g = fatorGosto(p, L.gosto);
      p.relacao = clamp(p.relacao + 7 * rende * g * (p.jeito === "romântica" ? 1.15 : 1), 0, 100); n.feitas++; p.vezes.n++;
      p.cena = sortearCena(rng, lugar);
      return { ok: true, msg: `${L.nome} com ${nome}${c > 200 ? ` (R$ ${c.toLocaleString("pt-BR")})` : ""}.${comentarioGosto(p, L.gosto)}`, custo: c, moral: 2 };
    }
    case "tentarFilho": {
      n.feitas++;
      if (!rng.chance(clamp(0.25 + (p.relacao - 60) / 100, 0.2, 0.55))) return { ok: true, msg: `Vocês estão tentando. Ainda não foi desta vez.`, moral: 1 };
      n.gravidez = { mae: p.nome, parto: ctx.semanaAbs + 36, caso };
      p.relacao = clamp(p.relacao + 8, 0, 100);
      return { ok: true, msg: `${nome} está grávida! O bebê chega em uns nove meses.`, moral: 8, ...(caso ? {} : { noticia: `${nome} está grávida: o jogador vai ser pai` }) };
    }
    case "cozinhar": sobe(rng.int(3, 6)); return { ok: true, msg: `Você cozinhou para ${nome}. Não ficou bom, mas a intenção valeu.${gc}`, moral: 1 };
    case "serie": sobe(rng.int(2, 5)); return { ok: true, msg: `Sofá, pipoca e três episódios com ${nome}.${gc}`, cansaco: -3 };
    case "levarJogo": sobe(rng.int(4, 7)); return { ok: true, msg: `${nome} assistiu ao jogo do camarote e mandou foto da arquibancada.${gc}`, moral: 2, torcida: 0.5 };
    case "postarFoto": sobe(rng.int(3, 6)); return { ok: true, msg: `Foto com ${nome} nas redes: chuva de curtidas.`, fama: p.profissao === "influencer" || p.profissao === "modelo" ? 0.4 : 0.15, engajamento: 4 };
    case "conhecerFamilia": p.conheceuFamilia = true; sobe(rng.int(7, 11)); return { ok: true, msg: `Almoço de família com ${nome}. Sua mãe já está falando em neto.`, moral: 3 };
    case "encontroEscondido": {
      const c = custo(0.02, 400); if (ctx.saldo < c) return { ok: false, msg: "Hotel discreto custa caro. Falta dinheiro." };
      sobe(rng.int(6, 10)); p.escondidos = (p.escondidos ?? 0) + 1;
      return { ok: true, msg: `Encontro escondido com ${nome} num hotel longe do centro: R$ ${c.toLocaleString("pt-BR")}.`, custo: c, moral: 2, cansaco: 4 };
    }
    case "assumir": {
      n.feitas++;
      const antiga = n.par;
      n.casos = n.casos.filter((x) => x.id !== p.id);
      if (p.etapa === "saindo" && p.relacao >= 55) p.etapa = "namorando";
      p.exposto = true; n.par = p; p.desde = ctx.semanaAbs;
      if (antiga) {
        n.ex.push(antiga.nome);
        const div = antiga.etapa === "casados" ? Math.round(ctx.saldo * 0.3) : 0;
        n.escandalos = (n.escandalos ?? 0) + 1;
        return { ok: true, msg: `Você terminou com ${antiga.nome.split(" ")[0]} e assumiu ${nome}.${div ? ` O divórcio custou R$ ${div.toLocaleString("pt-BR")}.` : ""}`, custo: div, moral: -3, fama: 0.8, torcida: -2, escandalo: true,
          noticia: `${antiga.etapa === "casados" ? "Divórcio e namoro novo" : "Troca de namorada"}: o jogador assume ${nome} depois de terminar com ${antiga.nome.split(" ")[0]}` };
      }
      return { ok: true, msg: `Agora é oficial: você e ${nome}.`, moral: 4, noticia: `${nome} é a namorada nova do jogador` };
    }
    case "pedirNamoro": {
      n.feitas++;
      if (caso) { if (!rng.chance(clamp((p.relacao - 35) / 45, 0.15, 0.95))) return { ok: true, msg: `${nome} quer mais que um caso, mas ainda não confia em você.` }; p.etapa = "namorando"; return { ok: true, msg: `${nome} topou um namoro escondido. Duas vidas ao mesmo tempo.`, moral: 3 }; }
      if (!rng.chance(clamp((p.relacao - 35) / 45, 0.15, 0.95))) { p.relacao = clamp(p.relacao - 6, 0, 100); return { ok: true, msg: `${nome} pediu um pouco mais de tempo.` }; }
      p.etapa = "namorando"; p.desde = ctx.semanaAbs; sobe(6); n.feitas--;
      return { ok: true, msg: `${nome} disse sim. Agora é namoro!`, moral: 6, noticia: `${nome} é a namorada nova do jogador` };
    }
    case "jantar": { const c = custo(0.015, 250); if (ctx.saldo < c) return { ok: false, msg: "Dinheiro curto para jantar fora." }; sobe(6); return { ok: true, msg: `Jantar com ${nome}: R$ ${c.toLocaleString("pt-BR")}.${gc}`, custo: c, moral: 2 }; }
    case "presente": { const c = custo(0.04, 500); if (ctx.saldo < c) return { ok: false, msg: "Dinheiro curto para presente." }; sobe(7); return { ok: true, msg: `Presente para ${nome}: R$ ${c.toLocaleString("pt-BR")}.${gc}`, custo: c }; }
    case "viagem": { const c = custo(0.15, 3000); if (ctx.saldo < c) return { ok: false, msg: "A viagem não cabe no bolso agora." }; sobe(12); return { ok: true, msg: `Fim de semana viajando com ${nome}: R$ ${c.toLocaleString("pt-BR")}.${gc}`, custo: c, moral: 5, cansaco: 6 }; }
    case "morarJunto": {
      n.feitas++;
      if (!rng.chance(clamp((p.relacao - 50) / 35, 0.2, 0.95))) return { ok: true, msg: `${nome} acha cedo para morar junto.` };
      p.etapa = "morando"; p.desde = ctx.semanaAbs;
      return { ok: true, msg: `${nome} trouxe as malas. Agora vocês moram juntos.`, moral: 5 };
    }
    case "pedirCasamento": {
      const c = custo(1, 15000); if (ctx.saldo < c) return { ok: false, msg: "Falta dinheiro para a aliança." };
      n.feitas++;
      const modo = (extra && extra in NOME_PEDIDO ? extra : "jantar") as ModoPedido;
      const publico = ["festeira", "competitiva", "aventureira"].includes(p.jeito) || ["influencer", "modelo"].includes(p.profissao), discreta = ["caseira", "tranquila", "independente"].includes(p.jeito);
      const bonus = modo === "estadio" ? (publico ? 0.15 : discreta ? -0.2 : 0) : modo === "viagem" ? (["romântica", "aventureira"].includes(p.jeito) ? 0.15 : 0.05) : (["caseira", "romântica", "tranquila"].includes(p.jeito) ? 0.15 : 0);
      const extraCusto = modo === "viagem" ? custo(0.15, 3000) : 0;
      if (!rng.chance(clamp((p.relacao - 55) / 30 + bonus, 0.2, 0.97))) { p.relacao = clamp(p.relacao - 8, 0, 100); return { ok: true, msg: modo === "estadio" ? `${nome} ficou vermelha com o estádio inteiro olhando e pediu para conversarem em casa. Ainda não.` : `${nome} chorou, abraçou e pediu para esperar mais um pouco.`, custo: extraCusto, ...(modo === "estadio" ? { fama: 1, engajamento: 10, noticia: `${nome} não responde ao pedido de casamento do jogador no gramado` } : {}) }; }
      p.etapa = "noivos"; p.desde = ctx.semanaAbs;
      if (modo === "estadio") return { ok: true, msg: `De joelhos no gramado, com o telão mostrando os dois: ${nome} disse SIM! O estádio inteiro aplaudiu.`, custo: c, moral: 12, fama: 2, engajamento: 18, torcida: 3, noticia: `${nome} e o jogador estão noivos: pedido foi no gramado, na frente da torcida` };
      if (modo === "viagem") return { ok: true, msg: `No pôr do sol, longe de tudo: ${nome} disse SIM! Aliança e viagem: R$ ${(c + extraCusto).toLocaleString("pt-BR")}.`, custo: c + extraCusto, moral: 12, noticia: `${nome} e o jogador estão noivos` };
      return { ok: true, msg: `Ela disse SIM! Aliança de R$ ${c.toLocaleString("pt-BR")}. O casamento é no fim da temporada.`, custo: c, moral: 10, noticia: `${nome} e o jogador estão noivos` };
    }
    case "terminar": {
      n.ex.push(p.nome);
      if (caso) { n.casos = n.casos.filter((x) => x.id !== p.id); return { ok: true, msg: `Você encerrou o caso com ${nome}.`, moral: -1 }; }
      n.par = undefined;
      if (p.etapa === "casados" || p.etapa === "noivos") {
        const div = p.etapa === "casados" ? Math.round(ctx.saldo * 0.3) : 0;
        return { ok: true, msg: p.etapa === "casados" ? `Divórcio de ${nome}. Metade da casa e um advogado caro: R$ ${div.toLocaleString("pt-BR")}.` : `Noivado desfeito com ${nome}.`, custo: div, moral: -10,
          noticia: p.etapa === "casados" ? `Fim do casamento: o jogador e ${nome} se separam` : `Noivado desfeito: o jogador e ${nome} terminam` };
      }
      return { ok: true, msg: `Você terminou com ${nome}.`, moral: -4 };
    }
  }
}

export type AcaoFilho = "brincar" | "passear" | "presente" | "levarJogo";
export const NOME_ACAO_FILHO: Record<AcaoFilho, string> = { brincar: "Brincar em casa", passear: "Passeio no parque", presente: "Dar um presente", levarJogo: "Levar ao jogo" };
/** Um programa com um filho (conta nos programas da semana; com a mesma criança, cada vez rende menos). */
export function agirFilho(n: EstadoNamoro, i: number, acao: AcaoFilho, ctx: CtxNamoro): ResultadoNamoro {
  if (n.semana !== ctx.semanaAbs) { n.semana = ctx.semanaAbs; n.feitas = 0; }
  const f = n.filhos?.[i];
  if (!f) return { ok: false, msg: "Filho não encontrado." };
  if (n.feitas >= MAX_ACOES_NAMORO) return { ok: false, msg: `Já foram ${MAX_ACOES_NAMORO} programas nesta semana.` };
  if (!f.vezes || f.vezes.s !== ctx.semanaAbs) f.vezes = { s: ctx.semanaAbs, n: 0 };
  const rende = Math.max(0.2, 1 - 0.15 * f.vezes.n), sobe = (v: number) => { f.relacao = clamp((f.relacao ?? 70) + v * rende, 0, 100); f.contato = ctx.semanaAbs; f.vezes!.n++; n.feitas++; };
  const longe = f.pensao ? " (foi buscar na casa da mãe)" : "";
  switch (acao) {
    case "brincar": sobe(5); return { ok: true, msg: `Tarde inteira brincando com ${f.nome}${longe}.`, moral: 2 };
    case "passear": sobe(7); return { ok: true, msg: `Passeio no parque com ${f.nome}${longe}. Teve sorvete.`, moral: 3, cansaco: 2 };
    case "presente": { const c = Math.round(Math.max(200, ctx.salario * 0.01)); if (ctx.saldo < c) return { ok: false, msg: "Dinheiro curto para presente." }; sobe(5); return { ok: true, msg: `Presente para ${f.nome}: R$ ${c.toLocaleString("pt-BR")}.`, custo: c, moral: 1 }; }
    case "levarJogo": sobe(9); return { ok: true, msg: `${f.nome} foi ao estádio com a sua camisa.`, moral: 3, fama: 0.1 };
  }
}
export interface EfeitosNamoro { moral: number; fama: number; engajamento: number; recuperacao: number; evolucao: number; torcida: number; pressao: number; noite: number; agente: number; luvas: number; conforto: number }
const ZERO: EfeitosNamoro = { moral: 0, fama: 0, engajamento: 0, recuperacao: 0, evolucao: 0, torcida: 0, pressao: 0, noite: 0, agente: 0, luvas: 0, conforto: 0 };
/** O que ela muda na sua semana, conforme a profissão e o quão sério é. */
export function efeitosNamoro(n: EstadoNamoro | undefined): EfeitosNamoro {
  const p = n?.par;
  if (!p || p.etapa === "match") return { ...ZERO };
  const k = p.etapa === "saindo" ? 0.4 : p.etapa === "casados" ? 1.4 : p.etapa === "noivos" || p.etapa === "morando" ? 1.2 : 1;
  const bem = p.relacao >= 50 ? 1 : 0.4;
  const e: EfeitosNamoro = { ...ZERO, moral: (p.relacao - 45) / 15 + Math.min(3, (n?.filhos ?? []).filter((f) => !f.pensao).length) };
  const f = k * bem;
  if (p.famosa) { e.fama += 0.05 * f; e.engajamento += 0.8 * f; }
  switch (p.profissao) {
    case "influencer": e.fama += 0.06 * f; e.engajamento += 1.2 * f; break;
    case "psicologa": e.moral += 2.5 * f; e.pressao = -0.6 * f; break;
    case "agente": e.agente = 0.1 * f; break;
    case "modelo": e.fama += 0.08 * f; e.noite = 0.25 * f; break;
    case "medica": e.recuperacao = 3 * f; break;
    case "jornalista": e.torcida = 0.12 * f; e.fama += 0.02 * f; break;
    case "personal": e.evolucao = 2 * f; e.recuperacao = 1 * f; break;
    case "nutricionista": e.recuperacao = 2 * f; e.evolucao = 1 * f; break;
    case "advogada": e.luvas = 0.15 * f; break;
    case "professora": e.moral += 1.2 * f; break;
    case "arquiteta": e.conforto = 3 * f; break;
    case "estudante": break;
  }
  return e;
}

/** A semana do casal: sem atenção a relação esfria; a vida noturna incomoda; quem esfria demais termina. */
export function semanaNamoro(n: EstadoNamoro, ctx: CtxNamoro & { mudouDeCidade?: string }): { avisos: string[]; moral: number; noticia?: string; escandalo?: boolean; custo?: number } {
  const avisos: string[] = [];
  let moral = 0;
  n.matches = n.matches.filter((m) => ctx.semanaAbs - m.desde <= 6); // match sem conversa some
  const p = n.par;
  // o parto (e a notícia; filho de caso vira escândalo)
  let noticiaFilho: string | undefined, escFilho = false;
  const g = n.gravidez;
  if (g && ctx.semanaAbs >= g.parto) {
    const rng = new RNG(`${ctx.semente}|parto|${g.parto}`), nomeF = rng.pick(NOMES_FILHO), mae = g.mae.split(" ")[0];
    (n.filhos ??= []).push({ nome: nomeF, mae: g.mae, ano: ctx.ano ?? 0, pensao: !p || p.nome !== g.mae, relacao: 70, contato: ctx.semanaAbs });
    n.gravidez = undefined; moral += 10;
    avisos.push(`Nasceu ${nomeF}! Filho seu com ${mae}.`);
    noticiaFilho = g.caso ? `Filho fora do casamento: nasce ${nomeF}, filho do jogador com ${mae}` : `Nasceu ${nomeF}, filho do jogador com ${mae}`;
    if (g.caso) { escFilho = true; n.escandalos = (n.escandalos ?? 0) + 1; const c = n.casos?.find((x) => x.nome === g.mae); if (c) c.exposto = true; if (p) p.relacao = clamp(p.relacao - 35, 0, 100); }
  }
  // filhos: sem atenção a relação esfria (mais rápido quando moram longe)
  for (const f of n.filhos ?? []) { f.relacao ??= 70; f.relacao = clamp(f.relacao - (f.pensao ? 1.2 : 0.5), 0, 100); if (f.relacao < 30) moral -= 0.5; }
  if (noticiaFilho && !p) return { avisos, moral, noticia: noticiaFilho, escandalo: escFilho };
  // casos escondidos: esfriam sem atenção; quanto mais casos, encontros e fama, maior o risco de a mídia descobrir
  let noticiaCaso: string | undefined, escandalo = false;
  for (const x of [...(n.casos ?? [])]) {
    x.relacao = clamp(x.relacao - 1.5, 0, 100);
    const nm = x.nome.split(" ")[0];
    if (x.relacao < 20) { n.casos = n.casos!.filter((y) => y.id !== x.id); avisos.push(`${nm} cansou de ser segredo e sumiu.`); continue; }
    const risco = x.exposto ? 0 : clamp(0.015 + ctx.fama / 700 + 0.02 * ((n.casos?.length ?? 1) - 1) + 0.025 * (x.escondidos ?? 0) + (["influencer", "jornalista", "modelo"].includes(x.profissao) ? 0.02 : 0), 0, 0.5);
    x.escondidos = 0;
    if (p && new RNG(`${ctx.semente}|flagra|${x.id}|${ctx.semanaAbs}`).chance(risco)) {
      x.exposto = true; escandalo = true; n.escandalos = (n.escandalos ?? 0) + 1;
      const pn = p.nome.split(" ")[0];
      p.relacao = clamp(p.relacao - 40, 0, 100); moral -= 8;
      noticiaCaso = `Flagra! O jogador é visto com ${nm}, e não é ${pn}`;
      avisos.push(`Saiu na mídia: você foi flagrado com ${nm}. ${pn} viu tudo.`);
    }
  }
  if (!p) return { avisos, moral, ...(noticiaCaso ? { noticia: noticiaCaso, escandalo } : {}) };
  if (noticiaFilho && !noticiaCaso) { noticiaCaso = noticiaFilho; escandalo = escFilho; }
  const nome = p.nome.split(" ")[0];
  if (ctx.mudouDeCidade && ctx.mudouDeCidade !== p.cidadeClube && (p.etapa === "namorando" || p.etapa === "morando") && n.mudanca !== ctx.mudouDeCidade) {
    // namoro sério: vira uma decisão na agenda (ela vem junto? fica? termina?)
    n.mudanca = ctx.mudouDeCidade;
  } else if (ctx.mudouDeCidade && ctx.mudouDeCidade !== p.cidadeClube && n.mudanca !== ctx.mudouDeCidade) {
    const vem = p.etapa === "casados" || p.etapa === "noivos" || (p.etapa !== "saindo" && new RNG(`${ctx.semente}|mudanca|${p.id}|${ctx.semanaAbs}`).chance(clamp((p.relacao - 40) / 50 + (["influencer", "modelo", "estudante", "personal"].includes(p.profissao) ? 0.2 : -0.1), 0.05, 0.95)));
    if (vem) { p.cidadeClube = ctx.mudouDeCidade; p.cidade = ctx.mudouDeCidade; avisos.push(`${nome} fez as malas e veio junto para ${ctx.mudouDeCidade}.`); }
    else { p.relacao = clamp(p.relacao - 20, 0, 100); avisos.push(`${nome} ficou em ${p.cidadeClube}. Agora é namoro à distância.`); }
  }
  const longe = p.cidadeClube !== ctx.cidade;
  const jeito = p.jeito === "independente" || p.jeito === "workaholic" ? 0.7 : p.jeito === "romântica" ? 1.2 : 1;
  const noite = p.jeito === "festeira" ? 0 : (p.jeito === "caseira" || p.jeito === "ciumenta" ? 2 : 1) * Math.max(0, ctx.vidaNoturna - 40) / 40;
  const queda = ((p.etapa === "casados" ? 0.5 : p.etapa === "saindo" ? 2 : 1.1) + (longe ? 1.2 : 0)) * jeito * (1.2 - quimica(p, ctx.vidaNoturna) / 250) + noite;
  p.relacao = clamp(p.relacao - queda, 0, 100);
  if (p.relacao < (p.etapa === "saindo" ? 25 : 15)) {
    n.ex.push(p.nome); n.par = undefined; moral -= p.etapa === "casados" ? 12 : 7;
    const custo = p.etapa === "casados" ? Math.round(ctx.saldo * 0.3) : 0;
    avisos.push(p.etapa === "casados" ? `${nome} pediu o divórcio${custo ? `: R$ ${custo.toLocaleString("pt-BR")} na partilha` : ""}.` : `${nome} terminou com você.`);
    return { avisos, moral, custo, escandalo, noticia: noticiaCaso ? `${noticiaCaso}. ${nome} termina com ele` : p.etapa === "casados" ? `Fim do casamento: ${nome} pede o divórcio` : undefined };
  }
  return { avisos, moral, ...(noticiaCaso ? { noticia: noticiaCaso, escandalo } : {}) };
}

/** Fim da temporada: noivos se casam. */
const NOMES_FILHO = ["Miguel", "Arthur", "Heitor", "Théo", "Davi", "Gael", "Bernardo", "Helena", "Alice", "Laura", "Maitê", "Cecília", "Liz", "Aurora", "Benjamin", "Lorenzo"];
/** Fim da temporada: noivos se casam; pode nascer filho (da companheira ou de um caso); pensão dos filhos de fora. */
export function temporadaNamoro(n: EstadoNamoro, eventos: string[], ctx?: { semente: string; ano: number; salario: number }): { custo: number; noticia?: string; escandalo?: boolean; casou?: string } {
  const p = n.par, filhos = (n.filhos ??= []);
  let noticia: string | undefined, escandalo = false;
  if (p?.etapa === "noivos") {
    p.etapa = "casados"; p.relacao = clamp(p.relacao + 10, 0, 100);
    eventos.push(`Casamento com ${p.nome.split(" ")[0]}! Festa para a família e os amigos do futebol.`);
    noticia = `${p.nome.split(" ")[0]} e o jogador se casaram`;
  }
  const casou = p?.etapa === "casados" && noticia?.endsWith("se casaram") ? p.nome.split(" ")[0] : undefined;
  if (ctx) {
    const rng = new RNG(`${ctx.semente}|filhos|${ctx.ano}`);
    if (p && !n.gravidez && (p.etapa === "casados" || p.etapa === "morando") && p.relacao >= 60 && rng.chance(0.08)) {
      const nome = rng.pick(NOMES_FILHO); filhos.push({ nome, mae: p.nome, ano: ctx.ano, pensao: false });
      eventos.push(`Nasceu ${nome}, filho com ${p.nome.split(" ")[0]}!`); noticia = `Nasceu ${nome}, filho do jogador com ${p.nome.split(" ")[0]}`;
    }
    for (const x of n.casos ?? []) if (x.etapa === "namorando" && rng.chance(0.06)) {
      const nome = rng.pick(NOMES_FILHO); filhos.push({ nome, mae: x.nome, ano: ctx.ano, pensao: true });
      x.exposto = true; escandalo = true; n.escandalos = (n.escandalos ?? 0) + 1;
      eventos.push(`${x.nome.split(" ")[0]} teve um filho seu: ${nome}. A notícia vazou.`);
      noticia = `Filho fora do casamento: ${x.nome.split(" ")[0]} confirma que ${nome} é filho do jogador`;
      if (p) p.relacao = clamp(p.relacao - 35, 0, 100);
    }
    // filhos com quem não é mais a companheira: pensão
    for (const f of filhos) f.pensao = !p || f.mae !== p.nome;
  }
  const pensao = ctx ? filhos.filter((f) => f.pensao).length * Math.round(Math.max(3000, ctx.salario * 0.08)) * 12 : 0;
  const criacao = ctx ? filhos.filter((f) => !f.pensao).length * Math.round(Math.max(1500, ctx.salario * 0.03)) * 12 : 0;
  if (pensao) eventos.push(`Pensão dos filhos no ano: R$ ${pensao.toLocaleString("pt-BR")}.`);
  if (criacao) eventos.push(`Escola, plano de saúde e tudo mais dos filhos em casa: R$ ${criacao.toLocaleString("pt-BR")} no ano.`);
  return { custo: pensao + criacao, noticia, escandalo, ...(casou ? { casou } : {}) };
}

/** Política automática: não usa o app (fica solteiro), só mantém quem já existe. */
export function namoroAutomatico(n: EstadoNamoro, ctx: CtxNamoro): void {
  if (n.par && n.par.relacao < 50 && n.par.etapa !== "match") agirNamoro(n, n.par.id, "conversar", ctx);
}
