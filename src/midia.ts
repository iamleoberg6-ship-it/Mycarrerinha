// Imprensa e redes: o feed da semana (torcedores, rivais, memes, o colunista que te acompanha), o que você posta
// (bastidores, família, ostentação, publi, resposta a crítico, live, trend) e as entrevistas: perguntas que mudam
// com a fase (má fase, boa fase, rumor de transferência, vida pessoal, técnico, seleção).
import { RNG, clamp } from "./rng.js";

export type TomPost = 1 | 0 | -1;
export interface Post { autor: string; arroba: string; tipo: "torcedor" | "rival" | "jornalista" | "meme" | "fa"; texto: string; tom: TomPost; curtidas: number }
export type TemaPauta = "faseRuim" | "faseBoa" | "rumor" | "vida" | "tecnico" | "selecao" | "temporada";
export interface Pauta { tema: TemaPauta; pergunta: string; expira: number }
export interface EstadoMidia {
  /** relação com a imprensa (0–100) */
  imprensa: number;
  colunista: { nome: string; veiculo: string; relacao: number };
  feed: Post[]; assunto?: string; posts: { semana: number; n: number; feitos: string[] }; pauta?: Pauta; ultimaPauta?: number;
}
export const MAX_POSTS = 2;
const COLUNISTAS = ["Caio Barreto", "Renata Fontes", "Márcio Galvão", "Juliana Prado", "Téo Saldanha", "Beatriz Quintela"];
const VEICULOS = ["Canal Arquibancada", "Rádio Bola Rolando", "Portal Lance Livre", "Jornal do Gramado", "Podcast Resenha Tática"];
export function novaMidia(rng: RNG): EstadoMidia {
  return { imprensa: 50, colunista: { nome: rng.pick(COLUNISTAS), veiculo: rng.pick(VEICULOS), relacao: 45 + rng.int(0, 10) }, feed: [], posts: { semana: -1, n: 0, feitos: [] } };
}

export interface CtxMidia {
  apelido: string; clube: string; adv?: string; nota?: number; gols: number; resultado?: "v" | "e" | "d"; minutos: number;
  polemica: boolean; escandalo: boolean; lesionado: boolean; forma: number; fama: number; seguidores: number; janela: boolean;
  relTecnico: number; selecao: boolean; base: boolean; semanaAbs: number; temperamento: number; carisma: number; patrocinios: number;
}

// ------------------------------------------------------------------ feed
const ARROBAS_TORC = ["@{c}_da_massa", "@raiz_{c}", "@arquibancada{n}", "@{c}ate_morrer", "@fiel_{n}", "@sofredor_{c}"];
const ARROBAS_RIVAL = ["@zoeira_rival", "@rival_{n}", "@secador_oficial", "@corneta_fc"];
const ARROBAS_MEME = ["@futmemes", "@resenhafc", "@memesdabola", "@varzeiro_memes"];
const NOMES = ["Lucas", "Bruna", "Thiago", "Camila", "Diego", "Fernanda", "Rafa", "Jéssica", "Matheus", "Ana", "Gui", "Paty"];
const fill = (t: string, x: CtxMidia) => t.replaceAll("{a}", x.apelido).replaceAll("{c}", x.clube).replaceAll("{adv}", x.adv ?? "rival");
function post(rng: RNG, tipo: Post["tipo"], tom: TomPost, textos: string[], x: CtxMidia, colunista?: EstadoMidia["colunista"]): Post {
  const slug = x.clube.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "").slice(0, 10) || "time";
  const arroba = (tipo === "rival" ? rng.pick(ARROBAS_RIVAL) : tipo === "meme" ? rng.pick(ARROBAS_MEME) : rng.pick(ARROBAS_TORC)).replaceAll("{c}", slug).replaceAll("{n}", String(rng.int(7, 99)));
  const autor = tipo === "jornalista" && colunista ? colunista.nome : tipo === "meme" ? "Memes da Bola" : tipo === "rival" ? "Secador" : rng.pick(NOMES);
  const base = Math.max(30, x.seguidores / 400);
  return { autor, arroba: tipo === "jornalista" && colunista ? colunista.veiculo : arroba, tipo, tom, texto: fill(rng.pick(textos), x), curtidas: Math.round(base * rng.range(0.3, 2.5) * (tom === 0 ? 0.5 : 1)) };
}
/** O que estão falando de você nesta semana (3 a 5 posts) e o assunto do momento. */
export function feedDaSemana(m: EstadoMidia, rng: RNG, x: CtxMidia): void {
  const l: Post[] = [];
  const otimo = x.minutos > 0 && ((x.nota ?? 0) >= 7.8 || x.gols >= 2), ruim = x.minutos > 0 && (x.nota ?? 10) < 6.1;
  if (x.lesionado) {
    l.push(post(rng, "torcedor", 1, ["Força, {a}! Volta logo que o time precisa de você 🙏", "Recupera com calma, {a}. Estamos juntos 💪"], x));
    l.push(post(rng, "rival", -1, ["{a} machucado de novo? Vidro puro 😂", "Melhor notícia da semana: {a} fora 🙌"], x));
  } else if (otimo) {
    l.push(post(rng, "torcedor", 1, ["{a} jogou MUITO hoje 🔥🔥", "Paga o que ele pedir, diretoria. {a} é diferente.", "Que jogador, meu Deus. {a} é o nosso camisa 10 de verdade."], x));
    l.push(post(rng, "meme", 1, ["O zagueiro do {adv} procurando o {a} até agora 🔎", "{a} hoje: modo videogame ativado 🎮", "Ninguém: \n{a}: mais um golaço 🤷"], x));
    if (x.resultado === "v") l.push(post(rng, "rival", -1, ["Sorte. Semana que vem ele some de novo.", "Jogou bem contra time pequeno, quero ver contra time grande."], x));
  } else if (ruim) {
    l.push(post(rng, "torcedor", -1, ["{a} sumiu de novo. Banco nele!", "Cadê o {a}? Só aparece no Instagram.", "Com todo respeito, {a} não está jogando nada."], x));
    l.push(post(rng, "rival", -1, ["Obrigado, {a}, pelos três pontos 😂", "{a} melhor jogador... do nosso time 🤣"], x));
    l.push(post(rng, "meme", -1, ["{a} em campo hoje: 📵 fora de área", "Escalação do {c}: 10 jogadores e o {a}"], x));
  } else if (x.minutos === 0 && !x.base) {
    l.push(post(rng, "torcedor", -1, ["Cadê o {a}? Nem relacionado foi?", "Alguém explica por que o {a} não jogou?", "Pagando salário de craque para ver o {a} no sofá."], x));
    l.push(post(rng, "torcedor", 1, ["Saudade de ver o {a} em campo. Bota ele, professor!", "Com o {a} o time é outro. Quero ver ele jogando."], x));
  } else if (x.minutos > 0) {
    l.push(post(rng, "torcedor", 0, ["Jogo ok do {a}. Dá pra mais.", "{a} correu bastante, faltou o último passe.", "Nem bem nem mal. Segue o jogo."], x));
  }
  if (x.polemica || x.escandalo) {
    l.push(post(rng, "torcedor", -1, ["Vida de jogador é boa, né {a}? E o treino?", "Menos noitada e mais futebol, {a}.", "Ninguém aguenta mais polêmica do {a}."], x));
    l.push(post(rng, "meme", 0, ["{a} na segunda-feira explicando o fim de semana 🫠", "Assessoria do {a} trabalhando dobrado 📞"], x));
  }
  if (x.fama >= 70 && rng.chance(0.6)) l.push(post(rng, "fa", 1, ["Brazilian magic ✨ {a} is different", "{a} en el próximo nivel 🔥", "Watching {a} from Tokyo 🇯🇵⚽"], x));
  else if (rng.chance(0.5)) l.push(post(rng, "fa", 1, ["Tirei foto com o {a} no aeroporto, que pessoa humilde 🙏", "Meu filho só dorme com a camisa do {a} 💛", "Vi o {a} no mercado e ele parou para todo mundo."], x));
  // coluna da semana: o tom depende da relação com o colunista e da fase
  const cl = m.colunista, gosta = cl.relacao >= 55, odeia = cl.relacao < 35;
  if (x.minutos > 0 || rng.chance(0.4)) {
    if (otimo) l.push(post(rng, "jornalista", odeia ? 0 : 1, odeia ? ["Boa partida de {a}. Uma andorinha só não faz verão."] : ["{a} decidiu. Hoje é o jogador mais importante do {c}.", "Quem duvidava de {a} vai ter que rever os conceitos."], x, cl));
    else if (ruim) l.push(post(rng, "jornalista", gosta ? 0 : -1, gosta ? ["{a} passa por fase ruim, mas tem crédito. Calma com ele."] : ["{a} vive a pior fase desde que chegou. O técnico precisa decidir.", "Tem jogador vivendo da fama. {a} precisa mostrar mais."], x, cl));
    else l.push(post(rng, "jornalista", 0, ["Semana tranquila no {c}. {a} segue como peça importante.", "{a} faz o arroz com feijão. Falta o algo a mais."], x, cl));
  }
  m.feed = l.slice(0, 5);
  const tom = l.reduce((a, p) => a + p.tom, 0), tag = x.apelido.replace(/\s+/g, "");
  m.assunto = x.lesionado ? `#Força${tag}` : x.escandalo || x.polemica ? `#${tag}Polêmica` : otimo ? `#${tag}Gênio` : ruim ? `#Fora${tag}` : tom > 0 ? `#${tag}` : undefined;
}

// ------------------------------------------------------------------ postar
export type TipoPost = "treino" | "familia" | "ostentacao" | "publi" | "resposta" | "live" | "trend";
export const POSTS: Record<TipoPost, { nome: string; desc: string }> = {
  treino: { nome: "Bastidores do treino", desc: "Mostra trabalho. O técnico gosta." },
  familia: { nome: "Foto com a família", desc: "Carinho nos comentários e a moral sobe." },
  ostentacao: { nome: "Ostentação: carro, viagem, relógio", desc: "Bomba nas redes. Na fase ruim, a torcida não perdoa." },
  publi: { nome: "Publi de patrocinador", desc: "Dinheiro pelo post. Os seguidores percebem." },
  resposta: { nome: "Responder um crítico", desc: "Arriscado: pode virar ídolo ou virar polêmica." },
  live: { nome: "Live com a torcida", desc: "Uma hora conversando com os fãs. Cansa um pouco." },
  trend: { nome: "Entrar na trend da semana", desc: "Viraliza fácil. Depois de derrota, pega mal." },
};
export interface EfeitoPost { msg: string; engajamento?: number; hype?: number; torcida?: number; moral?: number; relTecnico?: number; fama?: number; cansaco?: number; dinheiro?: number; imprensa?: number; noticia?: { titulo: string; texto: string; polemica?: boolean } }
export function postsDisponiveis(m: EstadoMidia, x: CtxMidia): TipoPost[] {
  return (Object.keys(POSTS) as TipoPost[]).filter((t) => (t !== "publi" || x.patrocinios > 0) && (t !== "resposta" || m.feed.some((p) => p.tom < 0)) && !(m.posts.semana === x.semanaAbs && m.posts.feitos.includes(t)));
}
export function postar(m: EstadoMidia, t: TipoPost, rng: RNG, x: CtxMidia): EfeitoPost | { erro: string } {
  if (m.posts.semana !== x.semanaAbs) m.posts = { semana: x.semanaAbs, n: 0, feitos: [] };
  if (m.posts.n >= MAX_POSTS) return { erro: `Já postou ${MAX_POSTS} vezes nesta semana. Deixa o povo sentir saudade.` };
  if (!postsDisponiveis(m, x).includes(t)) return { erro: "Esse post não faz sentido agora." };
  m.posts.n++; m.posts.feitos.push(t);
  const forma = x.forma;
  switch (t) {
    case "treino": return { msg: "Vídeo do treino puxado: \"esse é dedicado\" nos comentários.", engajamento: 7, relTecnico: 1, torcida: 0.5 };
    case "familia": return { msg: "A foto com a família encheu de corações.", engajamento: 6, moral: 2 };
    case "ostentacao": {
      if (forma < 6.4 || rng.chance(0.12)) return { msg: "Bombou, mas do jeito errado: \"carrão e nada em campo\".", engajamento: 10, hype: 0.05, torcida: -4, imprensa: -4, noticia: { titulo: `Ostentação de ${x.apelido} irrita a torcida`, texto: "Post com carro de luxo em plena fase ruim virou assunto nas redes.", polemica: true } };
      return { msg: "Carro novo na garagem e milhares de curtidas.", engajamento: 10, hype: 0.07 };
    }
    case "publi": { const v = Math.round(clamp(x.seguidores * 0.004, 2_000, 450_000)); return { msg: `Publi feita: R$ ${v.toLocaleString("pt-BR")} na conta.`, dinheiro: v, engajamento: -3 }; }
    case "resposta": {
      const chance = clamp(0.35 + x.carisma / 40 - x.temperamento / 50, 0.1, 0.85);
      if (rng.chance(chance)) return { msg: "Resposta afiada e com classe. Virou o assunto do dia, a seu favor.", hype: 0.12, fama: 1, torcida: 2, engajamento: 8 };
      return { msg: "A resposta saiu atravessada. Print, repercussão e nota oficial do clube.", torcida: -4, imprensa: -8, relTecnico: -2, engajamento: 6, noticia: { titulo: `${x.apelido} bate boca com torcedor nas redes`, texto: "A resposta do jogador a uma crítica repercutiu mal.", polemica: true } };
    }
    case "live": return { msg: "Uma hora de live: perguntas, risadas, até a sua mãe apareceu.", engajamento: 12, torcida: 2, cansaco: 4 };
    case "trend": {
      if (x.resultado === "d") return { msg: "Dancinha dois dias depois da derrota. O técnico não achou graça.", hype: 0.1, engajamento: 8, relTecnico: -3, torcida: -2 };
      return { msg: "A trend viralizou: milhões de visualizações.", hype: 0.12, engajamento: 8 };
    }
  }
}

// ------------------------------------------------------------------ entrevistas
interface RespostaDef { id: "humilde" | "confiante" | "polemico"; rotulo: string; frase: string; ef: Omit<EfeitoPost, "msg"> }
const PAUTAS: Record<TemaPauta, { titulo: string; perguntas: string[]; respostas: RespostaDef[] }> = {
  faseRuim: { titulo: "Má fase", perguntas: ["A torcida está cobrando. O que está acontecendo com você?", "Já são alguns jogos abaixo. Você se sente ameaçado no time?"], respostas: [
    { id: "humilde", rotulo: "Assumir e prometer trabalho", frase: "A fase não é boa, eu sei. Vou trabalhar em dobro para dar a volta por cima.", ef: { torcida: 3, relTecnico: 2, imprensa: 4 } },
    { id: "confiante", rotulo: "Mostrar confiança", frase: "Fase ruim todo mundo tem. Daqui a pouco eu volto a decidir.", ef: { moral: 3, imprensa: 1 } },
    { id: "polemico", rotulo: "Culpar o esquema do técnico", frase: "Do jeito que o time joga, fica difícil para o atacante aparecer.", ef: { relTecnico: -10, torcida: -2, imprensa: -2, hype: 0.06, noticia: { titulo: "", texto: "", polemica: true } } },
  ] },
  faseBoa: { titulo: "Grande fase", perguntas: ["Você vive o melhor momento da carreira. Qual o segredo?", "Já se fala em você como o melhor do campeonato. Concorda?"], respostas: [
    { id: "humilde", rotulo: "Dividir o mérito com o grupo", frase: "O mérito é do grupo. Sem os companheiros eu não faço nada.", ef: { relTecnico: 3, torcida: 2, imprensa: 3 } },
    { id: "confiante", rotulo: "Assumir o protagonismo", frase: "Trabalhei a vida inteira para isso. Estou pronto para ser o melhor.", ef: { fama: 1.5, hype: 0.05, imprensa: 1 } },
    { id: "polemico", rotulo: "Mandar recado para os críticos", frase: "Muita gente que duvidava agora quer entrevista. Eu não esqueço.", ef: { hype: 0.12, fama: 1, imprensa: -8, noticia: { titulo: "", texto: "" } } },
  ] },
  rumor: { titulo: "Rumor de transferência", perguntas: ["Dizem que tem clube grande de olho em você. Você fica?", "Seu agente foi visto com dirigentes de fora. Está de saída?"], respostas: [
    { id: "humilde", rotulo: "Jurar amor ao clube", frase: "Meu foco é total aqui. Sou feliz neste clube.", ef: { torcida: 5, imprensa: 2 } },
    { id: "confiante", rotulo: "Deixar a porta aberta", frase: "Futebol é dinâmico. Tenho contrato, mas ninguém sabe o amanhã.", ef: { fama: 1, hype: 0.05, torcida: -2 } },
    { id: "polemico", rotulo: "Dizer que sonha com a Europa", frase: "Todo jogador sonha com a Europa. Eu não sou diferente.", ef: { torcida: -7, hype: 0.1, fama: 1.5, relTecnico: -2, noticia: { titulo: "", texto: "" } } },
  ] },
  vida: { titulo: "Vida pessoal", perguntas: ["Sua vida fora de campo virou assunto. Isso atrapalha?", "As fotos do fim de semana repercutiram. Quer comentar?"], respostas: [
    { id: "humilde", rotulo: "Pedir desculpas", frase: "Errei, peço desculpas ao clube e à torcida. Não vai se repetir.", ef: { torcida: 4, relTecnico: 3, imprensa: 3, moral: -1 } },
    { id: "confiante", rotulo: "Separar as coisas", frase: "Minha vida pessoal é minha. Em campo, eu respondo.", ef: { moral: 2, imprensa: -2 } },
    { id: "polemico", rotulo: "Atacar a imprensa", frase: "Vocês adoram inventar história. Vão procurar notícia de verdade.", ef: { imprensa: -12, hype: 0.08, torcida: -1, noticia: { titulo: "", texto: "", polemica: true } } },
  ] },
  tecnico: { titulo: "Relação com o técnico", perguntas: ["Você tem jogado pouco. Como está a relação com o técnico?", "Dizem que vocês discutiram no treino. É verdade?"], respostas: [
    { id: "humilde", rotulo: "Respeitar a decisão dele", frase: "O professor decide, eu respeito. Vou mostrar no treino.", ef: { relTecnico: 6, imprensa: 2 } },
    { id: "confiante", rotulo: "Pedir mais chances", frase: "Acho que mereço mais oportunidades, e vou provar isso.", ef: { relTecnico: -1, moral: 2, torcida: 1 } },
    { id: "polemico", rotulo: "Dizer que não entende o técnico", frase: "Sinceramente? Não entendo os critérios dele.", ef: { relTecnico: -14, hype: 0.06, torcida: 1, noticia: { titulo: "", texto: "", polemica: true } } },
  ] },
  selecao: { titulo: "Seleção", perguntas: ["Você está jogando muito e não foi convocado. Ficou chateado?", "Acha que tem espaço na seleção?"], respostas: [
    { id: "humilde", rotulo: "Dizer que vai continuar trabalhando", frase: "A convocação é consequência. Vou seguir trabalhando.", ef: { imprensa: 3, moral: 1 } },
    { id: "confiante", rotulo: "Dizer que está pronto", frase: "Estou pronto. Se chamarem, vou dar conta.", ef: { fama: 1, hype: 0.04 } },
    { id: "polemico", rotulo: "Criticar o técnico da seleção", frase: "Tem gente lá que joga menos que eu. Todo mundo vê.", ef: { fama: 2, hype: 0.12, imprensa: -6, noticia: { titulo: "", texto: "", polemica: true } } },
  ] },
  temporada: { titulo: "Objetivos", perguntas: ["Qual é o seu objetivo para esta temporada?", "O que o torcedor pode esperar de você?"], respostas: [
    { id: "humilde", rotulo: "Ajudar o time", frase: "Ajudar o time a conquistar o máximo possível.", ef: { torcida: 2, relTecnico: 1, imprensa: 2 } },
    { id: "confiante", rotulo: "Ser artilheiro e campeão", frase: "Quero ser artilheiro e levantar taça. Nada menos.", ef: { fama: 1, hype: 0.04, moral: 2 } },
    { id: "polemico", rotulo: "Prometer o título", frase: "Pode escrever: este ano o título é nosso.", ef: { torcida: 4, hype: 0.1, imprensa: -2, noticia: { titulo: "", texto: "" } } },
  ] },
};
export const respostasDaPauta = (p: Pauta) => PAUTAS[p.tema].respostas.map((r) => ({ id: r.id, rotulo: r.rotulo }));
export const tituloDaPauta = (p: Pauta) => PAUTAS[p.tema].titulo;
/** Pedido de entrevista da semana (um por vez, com intervalo), puxado pelo momento. */
export function sortearPauta(m: EstadoMidia, rng: RNG, x: CtxMidia): void {
  if (m.pauta && x.semanaAbs <= m.pauta.expira) return;
  m.pauta = undefined;
  if (x.base || (m.ultimaPauta !== undefined && x.semanaAbs - m.ultimaPauta < 3) || x.fama < 12) return;
  const tema: TemaPauta | undefined = x.escandalo || x.polemica ? "vida" : x.forma && x.forma < 6.2 ? "faseRuim" : x.forma >= 7.6 ? "faseBoa"
    : x.janela && x.fama >= 35 && rng.chance(0.5) ? "rumor" : x.relTecnico < 35 ? "tecnico" : !x.selecao && x.fama >= 55 && x.forma >= 7 && rng.chance(0.4) ? "selecao" : rng.chance(0.15) ? "temporada" : undefined;
  if (!tema || !rng.chance(0.55)) return;
  m.pauta = { tema, pergunta: rng.pick(PAUTAS[tema].perguntas), expira: x.semanaAbs + 1 };
}
export function responderPauta(m: EstadoMidia, id: string, x: CtxMidia): EfeitoPost | { erro: string } {
  const p = m.pauta;
  if (!p) return { erro: "A entrevista já passou." };
  const r = PAUTAS[p.tema].respostas.find((y) => y.id === id);
  if (!r) return { erro: "Resposta inválida." };
  m.pauta = undefined; m.ultimaPauta = x.semanaAbs;
  const ef: EfeitoPost = { msg: `"${r.frase}"`, ...r.ef };
  if (r.ef.noticia || r.id === "confiante") ef.noticia = { titulo: `${x.apelido}: "${r.frase.length > 70 ? r.frase.slice(0, 67) + "..." : r.frase}"`, texto: `Entrevista sobre ${PAUTAS[p.tema].titulo.toLowerCase()}. ${r.id === "polemico" ? "A declaração repercutiu." : "A fala repercutiu bem."}`, polemica: r.ef.noticia?.polemica };
  m.colunista.relacao = clamp(m.colunista.relacao + (r.id === "humilde" ? 3 : r.id === "polemico" ? -5 : 0), 0, 100);
  return ef;
}
