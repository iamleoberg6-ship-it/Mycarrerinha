import { curtoBrl } from "./moeda.js";
// Estilo de vida: a garagem (carros, relógios, arte), os hobbies, os estudos (idiomas, licença de técnico, faculdade),
// a adaptação quando o jogador vai jogar num país de outra língua e a fundação (filantropia, com prêmio no fim do ano).
import { RNG, clamp } from "./rng.js";
import { agendar, type EstadoAgenda, type OpcaoOcasiao, type EfeitoVida } from "./agenda.js";

const op = (id: string, rotulo: string, texto: string, ef: EfeitoVida, risco?: OpcaoOcasiao["risco"]): OpcaoOcasiao => ({ id, rotulo, texto, ef, ...(risco ? { risco } : {}) });

// ------------------------------------------------------------------ garagem e luxo
export type TipoLuxo = "popular" | "suv" | "esportivo" | "super" | "hiper" | "relogio" | "relogioRaro" | "corrente" | "quadro" | "iate";
export const LUXO: Record<TipoLuxo, { nome: string; cat: "carro" | "relogio" | "joia" | "arte" | "barco"; preco: number; famaMin: number; mes: number; vol?: number; status: number; emoji: string }> = {
  popular: { nome: "Carro popular zero", cat: "carro", preco: 90_000, famaMin: 0, mes: -0.012, status: 1, emoji: "🚗" },
  suv: { nome: "SUV de luxo", cat: "carro", preco: 600_000, famaMin: 15, mes: -0.014, status: 4, emoji: "🚙" },
  esportivo: { nome: "Esportivo alemão", cat: "carro", preco: 1_200_000, famaMin: 30, mes: -0.015, status: 8, emoji: "🏎️" },
  super: { nome: "Superesportivo italiano", cat: "carro", preco: 3_500_000, famaMin: 50, mes: -0.01, status: 15, emoji: "🏎️" },
  hiper: { nome: "Hipercarro de edição limitada", cat: "carro", preco: 15_000_000, famaMin: 80, mes: -0.003, status: 30, emoji: "🏁" },
  relogio: { nome: "Relógio suíço", cat: "relogio", preco: 150_000, famaMin: 10, mes: 0.002, status: 2, emoji: "⌚" },
  relogioRaro: { nome: "Relógio de edição limitada", cat: "relogio", preco: 1_500_000, famaMin: 45, mes: 0.006, status: 9, emoji: "⌚" },
  corrente: { nome: "Corrente de ouro com pingente", cat: "joia", preco: 120_000, famaMin: 10, mes: 0.001, status: 2, emoji: "📿" },
  quadro: { nome: "Quadro de artista em alta", cat: "arte", preco: 800_000, famaMin: 40, mes: 0.004, vol: 0.05, status: 5, emoji: "🖼️" },
  iate: { nome: "Iate", cat: "barco", preco: 25_000_000, famaMin: 85, mes: -0.008, status: 35, emoji: "🛥️" },
};
export interface ItemLuxo { uid: string; tipo: TipoLuxo; valor: number; ano: number; novidade: number }
export const MAX_LUXO = 14;
export const statusLuxo = (l: ItemLuxo[]) => l.reduce((a, i) => a + LUXO[i.tipo].status, 0);
export const valoresEmCasa = (l: ItemLuxo[]) => l.filter((i) => ["relogio", "joia", "arte"].includes(LUXO[i.tipo].cat)).reduce((a, i) => a + i.valor, 0);
export const temEsportivo = (l: ItemLuxo[]) => l.some((i) => ["esportivo", "super", "hiper"].includes(i.tipo));
export function mesLuxo(l: ItemLuxo[], rng: RNG) { for (const i of l) { const x = LUXO[i.tipo]; i.valor = Math.round(i.valor * (1 + x.mes + (x.vol ? rng.normal(0, x.vol) : 0))); } }

// ------------------------------------------------------------------ hobbies
export type Hobby = "poquer" | "games" | "pagode" | "pesca" | "golfe" | "leitura";
export const HOBBIES: Record<Hobby, { nome: string; desc: string; custo: number; emoji: string }> = {
  poquer: { nome: "Pôquer", desc: "Pode ganhar, pode perder. Noites longas.", custo: 0, emoji: "🃏" },
  games: { nome: "Videogame", desc: "Engajamento nas lives; um dia, um time de e-sports.", custo: 3_000, emoji: "🎮" },
  pagode: { nome: "Pagode", desc: "Moral lá em cima. Às vezes vira música gravada.", custo: 4_000, emoji: "🎤" },
  pesca: { nome: "Pesca", desc: "Silêncio no rio: menos pressão, corpo descansado.", custo: 3_000, emoji: "🎣" },
  golfe: { nome: "Golfe", desc: "Calma e contatos: empresários e marcas jogam golfe.", custo: 8_000, emoji: "⛳" },
  leitura: { nome: "Leitura e xadrez", desc: "Cabeça fria e boa fama com a imprensa.", custo: 500, emoji: "♟️" },
};
export const MAX_HOBBIES = 2;
export interface EstadoHobbies { ativos: Hobby[]; nivel: Partial<Record<Hobby, number>>; esports?: { valor: number; titulos: number } ; musica?: number }
export interface EfeitoHobby { moral: number; pressao: number; desgaste: number; engajamento: number; vidaNoturna: number; imprensa: number; dinheiro: number; avisos: string[] }
export function semanaHobbies(h: EstadoHobbies, a: EstadoAgenda, rng: RNG, semanaAbs: number, fama: number): EfeitoHobby {
  const e: EfeitoHobby = { moral: 0, pressao: 0, desgaste: 0, engajamento: 0, vidaNoturna: 0, imprensa: 0, dinheiro: 0, avisos: [] };
  for (const k of h.ativos) {
    const n = (h.nivel[k] = clamp((h.nivel[k] ?? 0) + 1.5, 0, 100));
    if (k === "poquer") { e.vidaNoturna += 0.5; e.moral += 0.3; e.dinheiro += Math.round(rng.normal(n * 40 - 1200, 4000 * (1 + fama / 50))); }
    if (k === "games") { e.engajamento += 1.2; e.moral += 0.4; }
    if (k === "pagode") { e.moral += 1; e.vidaNoturna += 0.6; e.engajamento += 0.8; }
    if (k === "pesca") { e.moral += 0.7; e.pressao -= 0.6; e.desgaste -= 0.4; }
    if (k === "golfe") { e.moral += 0.5; e.pressao -= 0.4; e.imprensa += 0.1; }
    if (k === "leitura") { e.pressao -= 0.5; e.imprensa += 0.15; }
    e.dinheiro -= Math.round(HOBBIES[k].custo / 4);
    // marcos de cada hobby
    if (k === "poquer" && n >= 40 && rng.chance(0.02)) agendar(a, semanaAbs, { origem: "hobby", chave: "poquer-torneio", titulo: "Torneio de pôquer", texto: `Um torneio internacional de pôquer em Las Vegas convidou você. Buy-in de ${curtoBrl(250_000)}.`, opcoes: [
      op("jogar", "Jogar o torneio", `Mesa final! Você saiu com ${curtoBrl(1_800_000)} e uma foto com lendas do pôquer.`, { dinheiro: 1_550_000, fama: 1, moral: 5, vidaNoturna: 4 }, { chance: 0.7, texto: "Caiu no segundo dia com um par de ases. Faz parte.", ef: { dinheiro: -250_000, moral: -2, vidaNoturna: 4 } }),
      op("recusar", "Recusar", "Pôquer fica no apartamento com os amigos.", {}),
    ] }, 60);
    if (k === "games" && n >= 40 && !h.esports && rng.chance(0.03)) agendar(a, semanaAbs, { origem: "hobby", chave: "esports", titulo: "Seu time de e-sports", texto: `Uma organização propõe montar um time de e-sports com o seu nome. Precisa de ${curtoBrl(400_000)}.`, opcoes: [
      op("montar", "Montar o time", "O time estreou no campeonato nacional com o seu escudo.", { dinheiro: -400_000, engajamento: 10, gatilho: "esports" }),
      op("recusar", "Recusar", "Você segue só jogando.", {}),
    ] }, 80);
    if (k === "pagode" && n >= 50 && !h.musica && rng.chance(0.025)) agendar(a, semanaAbs, { origem: "hobby", chave: "musica", titulo: "Gravar uma música", texto: "Um grupo de pagode famoso ouviu você cantando numa live e quer gravar uma faixa com você.", opcoes: [
      op("gravar", "Gravar", "A música entrou no top 50. Toca até no vestiário.", { fama: 2, engajamento: 15, hype: 0.15, moral: 5, gatilho: "musica", marco: { tipo: "marco", texto: "Grava uma música com um grupo de pagode" } }, { chance: 0.3, texto: "A música virou meme pelo seu agudo desafinado. Pelo menos todo mundo ouviu.", ef: { fama: 1.5, engajamento: 18, hype: 0.12, moral: -1, gatilho: "musica" } }),
      op("recusar", "Recusar", "Pagode é na resenha, não no estúdio.", {}),
    ] }, 120);
  }
  if (h.esports) {
    h.esports.valor = Math.round(h.esports.valor * (1 + rng.normal(0.004, 0.03)));
    e.engajamento += 1;
    if (rng.chance(0.006)) { h.esports.titulos++; e.avisos.push("Seu time de e-sports foi campeão!"); e.engajamento += 6; e.moral += 3; }
  }
  return e;
}

// ------------------------------------------------------------------ estudos e idiomas
export type Lingua = "en" | "es" | "it" | "de" | "fr" | "ar" | "pt";
export const NOME_LINGUA: Record<Lingua, string> = { en: "Inglês", es: "Espanhol", it: "Italiano", de: "Alemão", fr: "Francês", ar: "Árabe", pt: "Português" };
export const NIVEL_LINGUA = ["Nada", "Básico", "Intermediário", "Fluente"];
export type Curso = `idioma-${Lingua}` | "licenca-c" | "licenca-b" | "licenca-a" | "licenca-pro" | "edfisica" | "gestao";
export const CURSOS: Record<string, { nome: string; semanas: number; custo: number; desc: string }> = {
  "licenca-c": { nome: "Licença C de técnico", semanas: 20, custo: 4_000, desc: "O começo do caminho para ser treinador." },
  "licenca-b": { nome: "Licença B de técnico", semanas: 24, custo: 6_000, desc: "Pode treinar categorias de base." },
  "licenca-a": { nome: "Licença A de técnico", semanas: 30, custo: 9_000, desc: "Pode ser auxiliar no profissional." },
  "licenca-pro": { nome: "Licença Pro de técnico", semanas: 36, custo: 15_000, desc: "A licença máxima: pode treinar qualquer time." },
  edfisica: { nome: "Faculdade de Educação Física (EAD)", semanas: 120, custo: 1_500, desc: "Diploma de verdade, estudando à distância." },
  gestao: { nome: "Gestão esportiva", semanas: 60, custo: 3_000, desc: "Para ser dirigente ou cuidar dos próprios negócios." },
};
export const cursoIdioma = (l: Lingua) => ({ nome: `Curso de ${NOME_LINGUA[l].toLowerCase()}`, semanas: 16, custo: 2_500, desc: "Cada nível: umas 16 semanas de aula." });
export const infoCurso = (c: Curso) => (c.startsWith("idioma-") ? cursoIdioma(c.slice(7) as Lingua) : CURSOS[c]);
export interface EstadoEstudos { atual?: { curso: Curso; progresso: number }; idiomas: Partial<Record<Lingua, number>>; formacoes: string[] }
export function cursosDisponiveis(e: EstadoEstudos, nativa: Lingua): Curso[] {
  const l: Curso[] = (["en", "es", "it", "de", "fr", "ar"] as Lingua[]).filter((x) => x !== nativa && (e.idiomas[x] ?? 0) < 3).map((x) => `idioma-${x}` as Curso);
  const lic = ["licenca-c", "licenca-b", "licenca-a", "licenca-pro"] as Curso[];
  const prox = lic.find((x) => !e.formacoes.includes(CURSOS[x].nome));
  if (prox) l.push(prox);
  for (const x of ["edfisica", "gestao"] as Curso[]) if (!e.formacoes.includes(CURSOS[x].nome)) l.push(x);
  return l;
}
/** Uma semana de estudo: avança o curso; ao terminar, ganha o nível ou o diploma. */
export function semanaEstudos(e: EstadoEstudos, cansacoAlto: boolean): { custo: number; cansaco: number; concluiu?: string } {
  if (!e.atual) return { custo: 0, cansaco: 0 };
  const info = infoCurso(e.atual.curso);
  e.atual.progresso += cansacoAlto ? 0.5 : 1;
  const r = { custo: Math.round(info.custo / 4), cansaco: 1.5 } as { custo: number; cansaco: number; concluiu?: string };
  if (e.atual.progresso >= info.semanas) {
    const c = e.atual.curso;
    if (c.startsWith("idioma-")) { const l = c.slice(7) as Lingua; e.idiomas[l] = Math.min(3, (e.idiomas[l] ?? 0) + 1); r.concluiu = `${NOME_LINGUA[l]}: nível ${NIVEL_LINGUA[e.idiomas[l]!].toLowerCase()}`; }
    else { e.formacoes.push(info.nome); r.concluiu = info.nome; }
    e.atual = undefined;
  }
  return r;
}
/** Língua falada em cada país das ligas. */
export const LINGUA_PAIS: Record<string, Lingua> = { BRA: "pt", POR: "pt", ENG: "en", USA: "en", SCO: "en", ESP: "es", ARG: "es", URU: "es", MEX: "es", COL: "es", CHI: "es", ITA: "it", GER: "de", AUT: "de", SUI: "de", FRA: "fr", BEL: "fr", KSA: "ar", UAE: "ar", QAT: "ar", NED: "en", TUR: "en", JPN: "en" };
export const linguaNativa = (pais: string): Lingua => LINGUA_PAIS[pais] ?? "en";

// ------------------------------------------------------------------ adaptação no exterior
export interface Adaptacao { pais: string; valor: number; desde: number }
/** Começo num país novo: língua parecida e idioma estudado ajudam. */
export function novaAdaptacao(pais: string, nativa: Lingua, idiomas: Partial<Record<Lingua, number>>, semanaAbs: number): Adaptacao {
  const l = linguaNativa(pais);
  const base = l === nativa ? 85 : (l === "es" && nativa === "pt") || (l === "pt" && nativa === "es") || (l === "it" && (nativa === "es" || nativa === "pt")) ? 50 : 25;
  return { pais, valor: clamp(base + 18 * (idiomas[l] ?? 0), 0, 100), desde: semanaAbs };
}
export function semanaAdaptacao(ad: Adaptacao, idiomas: Partial<Record<Lingua, number>>, comPar: boolean, comParcas: boolean): number {
  const l = linguaNativa(ad.pais), antes = ad.valor;
  ad.valor = clamp(ad.valor + 0.7 + 0.5 * (idiomas[l] ?? 0) + (comPar ? 0.3 : 0) + (comParcas ? 0.2 : 0), 0, 100);
  return ad.valor - antes;
}
/** Moral que a saudade tira por semana e o quanto a adaptação pesa no jogo (multiplicador do OVR em campo). */
export const moralAdaptacao = (ad?: Adaptacao) => (ad ? -((100 - ad.valor) / 100) * 1.2 : 0);
export const fatorAdaptacao = (ad?: Adaptacao) => (ad ? 0.965 + 0.035 * ad.valor / 100 : 1);
export function ocasioesExterior(a: EstadoAgenda, rng: RNG, ad: Adaptacao, semanaAbs: number, casado: boolean, nomePar?: string) {
  if (ad.valor >= 65 || !rng.chance(0.05)) return;
  const r = rng.int(0, 2);
  if (r === 0) agendar(a, semanaAbs, { origem: "exterior", chave: "saudade", titulo: "Saudade de casa", texto: "Domingo à noite, frio lá fora, ninguém fala a sua língua. A saudade bateu forte.", opcoes: [
    op("trazer", "Trazer a família para uma visita", "A casa encheu de voz conhecida. Feijão no fogo de novo.", { dinheiro: -45_000, adaptacao: 10, moral: 6, gatilho: "familia-todos:6" }),
    op("brasileiros", "Procurar a comunidade brasileira da cidade", "Churrasco com brasileiros que moram lá. Você se sentiu em casa.", { adaptacao: 6, moral: 3 }),
    op("ligar", "Chamada de vídeo com a família", "Ajudou um pouco.", { moral: 1 }),
  ] }, 12);
  else if (r === 1) agendar(a, semanaAbs, { origem: "exterior", chave: "comida", titulo: "A comida não desce", texto: "Você perdeu dois quilos. A comida do clube é ótima, mas não é a sua.", opcoes: [
    op("cozinheiro", "Contratar um cozinheiro brasileiro", "Arroz, feijão e farofa toda semana. O corpo agradeceu.", { dinheiro: -35_000, adaptacao: 7, desgaste: -3 }),
    op("aprender", "Aprender a cozinhar", "Seu arroz ainda empapa, mas é seu.", { adaptacao: 4, cansaco: 3 }),
    op("aguentar", "Se acostumar", "Uma hora acostuma.", {}),
  ] }, 20);
  else if (casado) agendar(a, semanaAbs, { origem: "exterior", chave: "par-voltar", titulo: `${nomePar ?? "Sua esposa"} quer voltar`, texto: `${nomePar ?? "Ela"} não se adaptou: sem amigos, sem trabalho, sem a família por perto. Pergunta se não dá para voltar ao Brasil.`, opcoes: [
    op("ouvir", "Ouvir e planejar mais tempo juntos", "Viagens nos dias de folga, curso para ela, uma rotina a dois. Ajudou.", { gatilho: "par:6", adaptacao: 4, cansaco: 4 }),
    op("voltar", "Prometer pedir para voltar na próxima janela", "Ela ficou aliviada. Agora você precisa cumprir.", { gatilho: "par:10", moral: -2 }),
    op("insistir", "Dizer que a carreira vem primeiro", "O silêncio no jantar disse tudo.", { gatilho: "par:-12", moral: -3 }),
  ] }, 30);
}

// ------------------------------------------------------------------ fundação
export interface Fundacao { nome: string; cidade: string; criada: number; nivel: 0 | 1 | 2 | 3; impacto: number; impactoAno: number; premios: number[] }
export const DOACAO = [0, 20_000, 100_000, 400_000];
export const NOME_DOACAO = ["Parada", "Pequena", "Média", "Grande"];
export const CUSTO_FUNDACAO = 500_000;
export function mesFundacao(f: Fundacao): { custo: number; impacto: number; torcida: number; imprensa: number } {
  const imp = [0, 3, 9, 22][f.nivel];
  f.impacto += imp; f.impactoAno += imp;
  return { custo: DOACAO[f.nivel], impacto: imp, torcida: [0, 0.5, 1.2, 2.5][f.nivel], imprensa: [0, 0.6, 1.2, 2][f.nivel] };
}
export function ocasioesFundacao(a: EstadoAgenda, rng: RNG, f: Fundacao, semanaAbs: number) {
  if (!rng.chance(0.025)) return;
  if (rng.chance(0.4)) agendar(a, semanaAbs, { origem: "fundacao", chave: "enchente", titulo: `Enchente em ${f.cidade}`, texto: `A chuva destruiu o bairro onde você cresceu. A ${f.nome} pode ajudar.`, opcoes: [
    op("doar", `Doar ${curtoBrl(1_000_000)}`, "Cestas, colchões e casas reformadas. O bairro pintou um mural com o seu rosto.", { dinheiro: -1_000_000, impacto: 30, torcida: 4, fama: 1, imprensa: 5, moral: 4 }),
    op("visitar", "Ir até lá ajudar com as próprias mãos", "Você carregou caixas o dia inteiro. As fotos emocionaram o país.", { impacto: 12, cansaco: 12, imprensa: 6, torcida: 3, moral: 5, relTecnico: -2 }),
    op("mensagem", "Fazer uma campanha nas redes", "Seus seguidores doaram muito.", { impacto: 5, engajamento: 6 }),
  ] }, 60);
  else agendar(a, semanaAbs, { origem: "fundacao", chave: "hospital", titulo: "Visita ao hospital infantil", texto: "Um hospital infantil pergunta se você pode visitar as crianças na quinta-feira.", opcoes: [
    op("ir", "Ir e passar a tarde", "Bola, foto, abraço. Um menino disse que vai ser jogador como você.", { impacto: 6, moral: 5, engajamento: 5, imprensa: 3, cansaco: 3 }),
    op("video", "Mandar um vídeo e camisas", "As crianças adoraram o vídeo.", { impacto: 2 }),
  ] }, 30);
}
/** Prêmio humanitário do ano (Prêmio Coração de Ouro) para quem fez a diferença. */
export const ganhouCoracaoDeOuro = (f?: Fundacao) => !!f && f.impactoAno >= 60;
