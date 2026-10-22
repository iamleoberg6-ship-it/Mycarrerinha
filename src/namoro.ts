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
const JEITOS = ["caseira", "festeira", "aventureira", "workaholic", "romântica", "competitiva", "tranquila", "engraçada"];
const NOMES = ["Ana", "Bia", "Bruna", "Camila", "Carol", "Clara", "Duda", "Fernanda", "Gabi", "Giovanna", "Helena", "Isabela", "Jéssica", "Júlia", "Larissa", "Laura", "Letícia",
  "Lívia", "Luana", "Manu", "Mariana", "Marina", "Natália", "Paula", "Rafaela", "Raquel", "Sofia", "Thaís", "Valentina", "Vitória", "Yasmin", "Lara", "Alice", "Nina", "Lorena"];
const SOBRENOMES = ["Alves", "Araújo", "Barros", "Campos", "Cardoso", "Costa", "Dias", "Duarte", "Freitas", "Gomes", "Lima", "Lopes", "Machado", "Martins", "Melo", "Moraes", "Nunes",
  "Oliveira", "Pereira", "Ramos", "Reis", "Ribeiro", "Rocha", "Santos", "Silva", "Souza", "Teixeira", "Vieira"];

export interface Perfil { id: string; nome: string; idade: number; cidade: string; profissao: Profissao; jeito: string; bio: string; /** quanto ela está a fim (0–100) */ interesse: number }
export type Etapa = "match" | "saindo" | "namorando" | "morando" | "noivos" | "casados";
export const NOME_ETAPA: Record<Etapa, string> = { match: "Deu match", saindo: "Saindo", namorando: "Namorando", morando: "Morando juntos", noivos: "Noivos", casados: "Casados" };
export interface Par extends Perfil { etapa: Etapa; relacao: number; desde: number; conversas: number; cidadeClube: string }
export interface EstadoNamoro {
  /** perfis do dia no app (renovam toda semana) e a semana em que foram gerados */
  baralho: Perfil[]; geradoEm: number; vistos: number;
  matches: Par[]; par?: Par; semana: number; feitas: number; ex: string[];
}
export const novoNamoro = (): EstadoNamoro => ({ baralho: [], geradoEm: -1, vistos: 0, matches: [], semana: -1, feitas: 0, ex: [] });
export const MAX_ACOES_NAMORO = 2;

export interface CtxNamoro { semente: string; semanaAbs: number; idadeJogador: number; fama: number; cidade: string; salario: number; saldo: number; vidaNoturna: number }

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
      cidade: rng.chance(0.75) ? ctx.cidade : "região metropolitana", profissao: prof, jeito: rng.pick(JEITOS), bio: rng.pick(BIO[prof]), interesse: rng.int(25, 70) };
  });
  n.geradoEm = ctx.semanaAbs; n.vistos = 0;
  return n.baralho;
}
/** Chance de dar match: fama ajuda muito; quem já namora sério no app chama atenção (e não é bem visto). */
export const chanceMatch = (p: Perfil, fama: number) => clamp(0.18 + fama / 140 + (p.interesse - 45) / 150 + (p.profissao === "influencer" || p.profissao === "modelo" ? fama / 400 : 0), 0.08, 0.9);

export function curtir(n: EstadoNamoro, id: string, sim: boolean, ctx: CtxNamoro): { ok: boolean; msg: string; match?: boolean } {
  if (ctx.idadeJogador < IDADE_MINIMA_APP) return { ok: false, msg: "O app é só para maiores de 18." };
  if (n.par && n.par.etapa !== "match" && n.par.etapa !== "saindo") return { ok: false, msg: "Você está num relacionamento sério. O app ficou guardado." };
  const p = n.baralho.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Esse perfil já passou." };
  n.baralho = n.baralho.filter((x) => x.id !== id); n.vistos++;
  if (!sim) return { ok: true, msg: `Você passou ${p.nome.split(" ")[0]}.` };
  const rng = new RNG(`${ctx.semente}|match|${id}`);
  if (!rng.chance(chanceMatch(p, ctx.fama))) return { ok: true, msg: `Você curtiu ${p.nome.split(" ")[0]}. Ainda não rolou match.`, match: false };
  n.matches = [{ ...p, etapa: "match" as Etapa, relacao: p.interesse, desde: ctx.semanaAbs, conversas: 0, cidadeClube: ctx.cidade }, ...n.matches].slice(0, 8);
  return { ok: true, msg: `Deu match com ${p.nome.split(" ")[0]}! Mande uma mensagem.`, match: true };
}

export type AcaoNamoro = "conversar" | "convidar" | "pedirNamoro" | "jantar" | "presente" | "viagem" | "morarJunto" | "pedirCasamento" | "terminar";
export const NOME_ACAO_NAMORO: Record<AcaoNamoro, string> = {
  conversar: "Conversar", convidar: "Chamar para sair", pedirNamoro: "Pedir em namoro", jantar: "Jantar fora", presente: "Dar um presente",
  viagem: "Viagem de fim de semana", morarJunto: "Chamar para morar junto", pedirCasamento: "Pedir em casamento", terminar: "Terminar",
};
export function acoesNamoro(p: Par, semanaAbs: number): AcaoNamoro[] {
  switch (p.etapa) {
    case "match": return ["conversar", ...(p.conversas >= 2 ? ["convidar" as const] : [])];
    case "saindo": return ["conversar", "jantar", ...(p.relacao >= 55 ? ["pedirNamoro" as const] : []), "terminar"];
    case "namorando": return ["conversar", "jantar", "presente", "viagem", ...(p.relacao >= 70 && semanaAbs - p.desde >= 12 ? ["morarJunto" as const] : []), "terminar"];
    case "morando": return ["conversar", "jantar", "presente", "viagem", ...(p.relacao >= 78 && semanaAbs - p.desde >= 20 ? ["pedirCasamento" as const] : []), "terminar"];
    case "noivos": case "casados": return ["conversar", "jantar", "presente", "viagem"];
  }
}
export interface ResultadoNamoro { ok: boolean; msg: string; custo?: number; moral?: number; cansaco?: number; noticia?: string }

export function agirNamoro(n: EstadoNamoro, id: string, acao: AcaoNamoro, ctx: CtxNamoro): ResultadoNamoro {
  if (n.semana !== ctx.semanaAbs) { n.semana = ctx.semanaAbs; n.feitas = 0; }
  const p = n.par?.id === id ? n.par : n.matches.find((x) => x.id === id);
  if (!p) return { ok: false, msg: "Conversa não encontrada." };
  if (acao !== "terminar" && n.feitas >= MAX_ACOES_NAMORO) return { ok: false, msg: `Já foram ${MAX_ACOES_NAMORO} programas nesta semana.` };
  if (!acoesNamoro(p, ctx.semanaAbs).includes(acao)) return { ok: false, msg: "Ainda não é hora." };
  const rng = new RNG(`${ctx.semente}|namoro|${id}|${acao}|${ctx.semanaAbs}`), nome = p.nome.split(" ")[0];
  const sobe = (v: number) => { p.relacao = clamp(p.relacao + v, 0, 100); n.feitas++; };
  const custo = (k: number, piso: number) => Math.round(Math.max(piso, ctx.salario * k));
  switch (acao) {
    case "conversar": sobe(rng.int(2, 6)); p.conversas++; return { ok: true, msg: `Você e ${nome} ficaram até tarde trocando mensagem.` };
    case "convidar": {
      if (n.par && n.par.id !== p.id) return { ok: false, msg: `Você já está saindo com ${n.par.nome.split(" ")[0]}.` };
      n.feitas++;
      if (!rng.chance(clamp(0.3 + p.relacao / 120 + ctx.fama / 300, 0.1, 0.92))) { p.relacao = clamp(p.relacao - 3, 0, 100); return { ok: true, msg: `${nome} disse que essa semana não dá. Quem sabe na próxima.` }; }
      p.etapa = "saindo"; p.desde = ctx.semanaAbs; p.relacao = clamp(p.relacao + 8, 0, 100); n.par = p; n.matches = n.matches.filter((x) => x.id !== p.id);
      return { ok: true, msg: `Primeiro encontro com ${nome}: um barzinho que virou três horas de conversa.`, moral: 3 };
    }
    case "pedirNamoro": {
      n.feitas++;
      if (!rng.chance(clamp((p.relacao - 35) / 45, 0.15, 0.95))) { p.relacao = clamp(p.relacao - 6, 0, 100); return { ok: true, msg: `${nome} pediu um pouco mais de tempo.` }; }
      p.etapa = "namorando"; p.desde = ctx.semanaAbs; sobe(6); n.feitas--;
      return { ok: true, msg: `${nome} disse sim. Agora é namoro!`, moral: 6, noticia: `${nome} é a namorada nova do jogador` };
    }
    case "jantar": { const c = custo(0.015, 250); if (ctx.saldo < c) return { ok: false, msg: "Dinheiro curto para jantar fora." }; sobe(6); return { ok: true, msg: `Jantar com ${nome}: R$ ${c.toLocaleString("pt-BR")}.`, custo: c, moral: 2 }; }
    case "presente": { const c = custo(0.04, 500); if (ctx.saldo < c) return { ok: false, msg: "Dinheiro curto para presente." }; sobe(7); return { ok: true, msg: `Presente para ${nome}: R$ ${c.toLocaleString("pt-BR")}.`, custo: c }; }
    case "viagem": { const c = custo(0.15, 3000); if (ctx.saldo < c) return { ok: false, msg: "A viagem não cabe no bolso agora." }; sobe(12); return { ok: true, msg: `Fim de semana na praia com ${nome}: R$ ${c.toLocaleString("pt-BR")}.`, custo: c, moral: 5, cansaco: 6 }; }
    case "morarJunto": {
      n.feitas++;
      if (!rng.chance(clamp((p.relacao - 50) / 35, 0.2, 0.95))) return { ok: true, msg: `${nome} acha cedo para morar junto.` };
      p.etapa = "morando"; p.desde = ctx.semanaAbs;
      return { ok: true, msg: `${nome} trouxe as malas. Agora vocês moram juntos.`, moral: 5 };
    }
    case "pedirCasamento": {
      const c = custo(1, 15000); if (ctx.saldo < c) return { ok: false, msg: "Falta dinheiro para a aliança." };
      n.feitas++;
      if (!rng.chance(clamp((p.relacao - 55) / 30, 0.3, 0.97))) { p.relacao = clamp(p.relacao - 8, 0, 100); return { ok: true, msg: `${nome} chorou, abraçou e pediu para esperar mais um pouco.`, custo: 0 }; }
      p.etapa = "noivos"; p.desde = ctx.semanaAbs;
      return { ok: true, msg: `Ela disse SIM! Aliança de R$ ${c.toLocaleString("pt-BR")}. O casamento é no fim da temporada.`, custo: c, moral: 10, noticia: `${nome} e o jogador estão noivos` };
    }
    case "terminar": {
      n.ex.push(p.nome); n.par = undefined;
      return { ok: true, msg: `Você terminou com ${nome}.`, moral: -4 };
    }
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
  const e: EfeitosNamoro = { ...ZERO, moral: (p.relacao - 45) / 15 };
  const f = k * bem;
  switch (p.profissao) {
    case "influencer": e.fama = 0.06 * f; e.engajamento = 1.2 * f; break;
    case "psicologa": e.moral += 2.5 * f; e.pressao = -0.6 * f; break;
    case "agente": e.agente = 0.1 * f; break;
    case "modelo": e.fama = 0.08 * f; e.noite = 0.25 * f; break;
    case "medica": e.recuperacao = 3 * f; break;
    case "jornalista": e.torcida = 0.12 * f; e.fama = 0.02 * f; break;
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
export function semanaNamoro(n: EstadoNamoro, ctx: CtxNamoro & { mudouDeCidade?: string }): { avisos: string[]; moral: number; noticia?: string } {
  const avisos: string[] = [];
  let moral = 0;
  n.matches = n.matches.filter((m) => ctx.semanaAbs - m.desde <= 6); // match sem conversa some
  const p = n.par;
  if (!p) return { avisos, moral };
  const nome = p.nome.split(" ")[0];
  if (ctx.mudouDeCidade && ctx.mudouDeCidade !== p.cidadeClube) {
    const vem = p.etapa === "casados" || p.etapa === "noivos" || (p.etapa !== "saindo" && new RNG(`${ctx.semente}|mudanca|${p.id}|${ctx.semanaAbs}`).chance(clamp((p.relacao - 40) / 50 + (["influencer", "modelo", "estudante", "personal"].includes(p.profissao) ? 0.2 : -0.1), 0.05, 0.95)));
    if (vem) { p.cidadeClube = ctx.mudouDeCidade; p.cidade = ctx.mudouDeCidade; avisos.push(`${nome} fez as malas e veio junto para ${ctx.mudouDeCidade}.`); }
    else { p.relacao = clamp(p.relacao - 20, 0, 100); avisos.push(`${nome} ficou em ${p.cidadeClube}. Agora é namoro à distância.`); }
  }
  const longe = p.cidadeClube !== ctx.cidade;
  const queda = (p.etapa === "casados" ? 0.5 : p.etapa === "saindo" ? 2 : 1.1) + (longe ? 1.2 : 0) + Math.max(0, ctx.vidaNoturna - 40) / 40;
  p.relacao = clamp(p.relacao - queda, 0, 100);
  if (p.relacao < (p.etapa === "saindo" ? 25 : 15)) {
    n.ex.push(p.nome); n.par = undefined; moral -= p.etapa === "casados" ? 12 : 7;
    avisos.push(p.etapa === "casados" ? `${nome} pediu o divórcio.` : `${nome} terminou com você.`);
    return { avisos, moral, noticia: p.etapa === "casados" ? `Fim do casamento: ${nome} pede o divórcio` : undefined };
  }
  return { avisos, moral };
}

/** Fim da temporada: noivos se casam. */
export function temporadaNamoro(n: EstadoNamoro, eventos: string[]): { custo: number; noticia?: string } {
  const p = n.par;
  if (p?.etapa !== "noivos") return { custo: 0 };
  p.etapa = "casados"; p.relacao = clamp(p.relacao + 10, 0, 100);
  eventos.push(`Casamento com ${p.nome.split(" ")[0]}! Festa para a família e os amigos do futebol.`);
  return { custo: 0, noticia: `${p.nome.split(" ")[0]} e o jogador se casaram` };
}

/** Política automática: não usa o app (fica solteiro), só mantém quem já existe. */
export function namoroAutomatico(n: EstadoNamoro, ctx: CtxNamoro): void {
  if (n.par && n.par.relacao < 50 && n.par.etapa !== "match") agirNamoro(n, n.par.id, "conversar", ctx);
}
