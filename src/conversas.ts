// Conversas de verdade no chat: ela puxa um assunto (que depende da fase de vocês, do jeito dela, da profissão e da
// sua semana: vitória, derrota, gol, viagem), você escolhe o que responder entre frases concretas, ela reage àquela
// frase e a conversa segue por dois ou três turnos. Cada resposta tem um tom; cada jeito dela gosta de uns tons e
// detesta outros. No fim, a relação mudou e ela pode ter contado do que gosta, chamado para sair ou feito uma proposta.
import { RNG, clamp } from "./rng.js";
import type { Par, Gosto } from "./namoro.js";

export type Tom = "engracado" | "romantico" | "direto" | "convencido" | "curioso" | "carinhoso" | "ousado" | "frio";
export const NOME_TOM: Record<Tom, string> = { engracado: "engraçado", romantico: "romântico", direto: "direto", convencido: "convencido", curioso: "curioso", carinhoso: "carinhoso", ousado: "ousado", frio: "seco" };
/** Quanto cada jeito curte cada tom (−2 a +2). */
const GOSTA_TOM: Record<string, Partial<Record<Tom, number>>> = {
  "engraçada": { engracado: 2, curioso: 1, ousado: 1, romantico: 0, frio: -2, convencido: -1 },
  "romântica": { romantico: 2, carinhoso: 2, curioso: 1, ousado: 0, frio: -2, convencido: -1, engracado: 0 },
  workaholic: { direto: 2, curioso: 1, engracado: 0, romantico: -1, carinhoso: 0, convencido: -1 },
  independente: { direto: 2, engracado: 1, curioso: 1, carinhoso: -1, romantico: -1, convencido: -2, frio: 0 },
  festeira: { ousado: 2, engracado: 2, convencido: 1, direto: 1, frio: -2, romantico: -1 },
  caseira: { carinhoso: 2, romantico: 1, curioso: 1, ousado: -1, convencido: -2, frio: -2 },
  aventureira: { ousado: 2, direto: 1, engracado: 1, curioso: 1, frio: -2, carinhoso: 0 },
  competitiva: { convencido: 2, direto: 1, ousado: 1, engracado: 1, carinhoso: -1, frio: -1 },
  tranquila: { curioso: 2, carinhoso: 1, romantico: 1, convencido: -2, ousado: -1, frio: -1 },
  ciumenta: { romantico: 2, carinhoso: 2, curioso: 0, ousado: -2, convencido: -2, frio: -2 },
};
export const notaDoTom = (jeito: string, t: Tom) => GOSTA_TOM[jeito]?.[t] ?? (t === "frio" ? -2 : t === "convencido" ? -1 : 0);

interface Fala {
  id: string; texto: string; tom: Tom;
  /** a reação dela a esta frase: [quando ela gostou, quando não gostou] (sem isso, uma reação do tom) */
  reage?: [string, string];
  /** próximo passo da conversa (sem: a conversa termina) */
  prox?: string;
  /** bônus que vem da frase em si (além do tom) */
  bonus?: number;
  /** ela conta do que gosta / chama para sair / quer subir de fase */
  revela?: boolean; convite?: boolean;
}
interface Passo { dela: string; falas: Fala[] }
export interface CtxConversa {
  apelido: string; clube: string; adv?: string; resultado?: "vitoria" | "derrota" | "empate"; gols?: number; nota?: number;
  foraDeCasa?: boolean; exterior?: boolean; fama: number; semanaAbs: number; gostoDela: Gosto; profissao: string;
}
interface Topico { id: string; quando: (p: Par, c: CtxConversa) => boolean; peso?: number; inicio: string; passos: (p: Par, c: CtxConversa) => Record<string, Passo> }

const nm = (p: Par) => p.nome.split(" ")[0];
const serio = (p: Par) => ["namorando", "morando", "noivos", "casados"].includes(p.etapa);
const NOME_GOSTO_CHAT: Record<Gosto, string> = { praia: "praia", balada: "uma boa balada", cinema: "cinema e série", futebol: "futebol (acredita?)", viagem: "viajar", comida: "comer bem", musica: "show e música ao vivo", natureza: "trilha e cachoeira", moda: "moda", games: "videogame" };
const PROF_TRABALHO: Record<string, string> = { influencer: "a gravação de uma publi", psicologa: "o consultório", agente: "uma negociação de contrato", modelo: "um ensaio", medica: "o plantão", jornalista: "a redação", personal: "os alunos", nutricionista: "o consultório", advogada: "uma audiência", professora: "a escola", estudante: "a faculdade", arquiteta: "uma obra" };

const TOPICOS: Topico[] = [
  { id: "primeiro", quando: (p) => p.etapa === "match" && p.conversas === 0, peso: 50, inicio: "a", passos: (p, c) => ({
    a: { dela: `Oi! Dei match e já fiquei pensando: você é sempre sério assim nas fotos? 😅`, falas: [
      { id: "piada", tom: "engracado", texto: "Sério só nas fotos. Pessoalmente eu sou um palhaço profissional.", reage: ["Hahaha ok, palhaço profissional, me convenceu 😂", "Hm... ok, vou acreditar."], prox: "b" },
      { id: "carinho", tom: "romantico", texto: "Até agora. Depois do seu oi já tô sorrindo.", reage: ["Que fofo! Ganhou pontos 😊", "Calma, a gente acabou de se conhecer 😅"], prox: "b" },
      { id: "direto", tom: "direto", texto: "Me conhece pessoalmente e tira a dúvida. Um café essa semana?", reage: ["Gostei da coragem. Vamos ver 😏", "Nossa, já? Vamos conversar um pouco antes."], prox: "b" },
      { id: "gabar", tom: "convencido", texto: `É a cara de quem joga no ${c.clube}, né.`, reage: ["Haha, adorei a confiança.", "Nossa... humilde, hein?"], prox: "b" },
      { id: "pergunta", tom: "curioso", texto: "Depende. O que você viu no meu perfil pra dar match?", reage: ["Boa pergunta! Foi o sorriso da terceira foto.", "Ah, sei lá, deu vontade."], prox: "b" },
    ] },
    b: { dela: `E fora do futebol, o que você gosta de fazer?`, falas: [
      { id: "conta", tom: "curioso", texto: "Te conto se você me contar primeiro. Qual o seu programa perfeito?", reage: [`Fácil: ${NOME_GOSTO_CHAT[c.gostoDela]}. Anotou? 😉`, `Ah, ${NOME_GOSTO_CHAT[c.gostoDela]}, sei lá.`], revela: true },
      { id: "casa", tom: "carinhoso", texto: "Ficar em casa, cozinhar alguma coisa e ver um filme bem coberto.", reage: ["Ai, que delícia. Me chama 🥰", "Hm, meio parado, não?"] },
      { id: "aventura", tom: "ousado", texto: "Inventar moda. Já fui de Uber até outra cidade só pra comer um pastel.", reage: ["Hahaha você é doido. Gostei 🔥", "Isso é meio irresponsável, não?"] },
      { id: "dormir", tom: "frio", texto: "Dormir. Treino cansa.", reage: ["Justo 😅", "Ah... tá bom então."] },
    ] },
  }) },
  { id: "pos-vitoria", quando: (_p, c) => c.resultado === "vitoria", peso: 4, inicio: "a", passos: (p, c) => ({
    a: { dela: `Vi o jogo! ${c.gols ? `E VOCÊ FEZ GOL! 😱` : `Que vitória!`} Comemorou como?`, falas: [
      { id: "dedica", tom: "romantico", texto: c.gols ? "Esse gol foi pra você. Só não contei pra ninguém ainda." : "Pensando em você, se quer saber.", reage: ["Para, assim eu derreto 🥹", "Hm, você fala isso pra todas?"], bonus: 2 },
      { id: "festa", tom: "ousado", texto: "Ainda não comemorei. Tava esperando você topar sair hoje.", reage: ["Então se arruma que eu vou 💃", "Hoje não dá, mas gostei do convite."], convite: true },
      { id: "humilde", tom: "carinhoso", texto: "O time jogou muito. E você, como foi seu dia?", reage: ["Que fofo perguntar. Foi corrido, mas melhorou agora 😊", "Normal."] },
      { id: "gabar", tom: "convencido", texto: c.gols ? "Viu o gol? Foi o mais bonito da rodada, fácil." : "Com a gente em campo, ganhar é obrigação.", reage: ["Hahaha convencido! Mas foi lindo mesmo 😏", "Nossa, o ego tá em dia."] },
      { id: "seco", tom: "frio", texto: "Normal. Foi só mais um jogo.", reage: ["Haha, cara de pau. Mas eu sei que você ficou feliz.", "Ok então."] },
    ] },
  }) },
  { id: "pos-derrota", quando: (_p, c) => c.resultado === "derrota", peso: 5, inicio: "a", passos: (p, c) => ({
    a: { dela: `Vi o resultado contra o ${c.adv ?? "time deles"}... Tá tudo bem? ❤️`, falas: [
      { id: "abre", tom: "carinhoso", texto: "Não muito. Mas melhorou agora que você mandou mensagem.", reage: ["Então vou ficar aqui até melhorar de vez 🫂", "Ah, tá bom."], prox: "b", bonus: 2 },
      { id: "fecha", tom: "frio", texto: "Não quero falar disso.", reage: ["Tudo bem, respeito. Tô aqui se quiser.", "Ok... não precisa ser grosso."] },
      { id: "piada", tom: "engracado", texto: "Perdemos, mas meu cabelo continuou impecável. Já é uma vitória.", reage: ["HAHAHA ok, o cabelo tava ótimo mesmo 😂", "Você nem liga, né?"] },
      { id: "foco", tom: "direto", texto: "Doeu, mas domingo tem outro. Vou treinar dobrado.", reage: ["Adoro esse seu jeito. Vai dar certo 💪", "Hm, só pensa em futebol."] },
    ] },
    b: { dela: "Quer que eu vá aí? Posso levar comida e a gente não fala de futebol.", falas: [
      { id: "vem", tom: "romantico", texto: "Vem. É exatamente o que eu preciso.", reage: ["Já tô saindo 🍕", "Hoje não dá, desculpa, mas amanhã eu vou."], bonus: 3 },
      { id: "sozinho", tom: "direto", texto: "Hoje prefiro ficar quieto. Mas obrigado, de verdade.", reage: ["Entendo total. Amanhã te ligo 💛", "Ah... ok."] },
    ] },
  }) },
  { id: "dia-dela", quando: (p) => p.etapa !== "match", peso: 3, inicio: "a", passos: (p) => ({
    a: { dela: `Hoje foi um dia horrível. ${PROF_TRABALHO[p.profissao] ?? "O trabalho"} acabou comigo 😩`, falas: [
      { id: "ouvir", tom: "curioso", texto: "O que aconteceu? Me conta tudo, tô ouvindo.", reage: ["Ai, obrigada por perguntar. É uma longa história...", "Ah, deixa pra lá."], prox: "b" },
      { id: "colo", tom: "carinhoso", texto: "Vem pra cá. Eu faço um chocolate quente e você esquece disso.", reage: ["Você é o melhor 🥺", "Hoje não, tô morta."], bonus: 2 },
      { id: "piada", tom: "engracado", texto: "Quer que eu mande o pessoal da torcida organizada ir lá resolver? 😂", reage: ["HAHAHA para, me fez rir num dia ruim.", "Não é hora de piada..."] },
      { id: "minimiza", tom: "frio", texto: "Todo mundo tem dia ruim. Amanhã passa.", reage: ["Verdade. Valeu.", "Nossa, valeu pelo apoio, hein."] },
    ] },
    b: { dela: "Enfim, me senti meio desvalorizada, sabe? Às vezes acho que ninguém vê o que eu faço.", falas: [
      { id: "valor", tom: "romantico", texto: "Eu vejo. Você é a pessoa mais dedicada que eu conheço.", reage: ["Você não sabe o quanto eu precisava ouvir isso ❤️", "Fala isso porque gosta de mim."], bonus: 3 },
      { id: "conselho", tom: "direto", texto: "Então fala com seu chefe. Você merece ser reconhecida.", reage: ["Você tem razão. Vou falar amanhã!", "Não é tão simples assim..."] },
      { id: "pergunta", tom: "curioso", texto: "E o que te faria se sentir valorizada lá?", reage: ["Hm... nunca tinha pensado assim. Obrigada.", "Sei lá."] },
    ] },
  }) },
  { id: "ciume", quando: (p) => p.etapa !== "match" && (p.jeito === "ciumenta" || p.relacao < 55), peso: 2, inicio: "a", passos: () => ({
    a: { dela: "Quem é essa que comentou \"lindo 😍\" na sua foto? 🤨", falas: [
      { id: "unica", tom: "romantico", texto: "Não faço ideia. A única que eu vejo aqui é você.", reage: ["Hm... tá bom, gostei da resposta 😌", "Sei..."], bonus: 1 },
      { id: "tia", tom: "engracado", texto: "Minha tia Neide. Ela comenta isso em todas as fotos desde 2014.", reage: ["HAHAHA tia Neide 😂 tá perdoado.", "Não tem graça."] },
      { id: "fa", tom: "direto", texto: "Uma fã. Não conheço. Pode olhar meu celular se quiser.", reage: ["Não precisa, confio em você.", "Vou olhar mesmo."] },
      { id: "fama", tom: "convencido", texto: "Ué, tenho muitas fãs. Faz parte.", reage: ["Haha, e eu sou a única que te aguenta.", "Que bom pra você, então."] },
      { id: "briga", tom: "frio", texto: "Não começa com isso de novo.", reage: ["Tá, desculpa.", "\"De novo\"? Então tá."], bonus: -2 },
    ] },
  }) },
  { id: "viagem", quando: () => true, peso: 2, inicio: "a", passos: (p, c) => ({
    a: { dela: "Pergunta aleatória: se você pudesse ir pra qualquer lugar amanhã, iria pra onde?", falas: [
      { id: "paris", tom: "romantico", texto: "Paris. Com você, claro.", reage: ["Que clichê... e eu amei 🥰", "Clichê, hein."], prox: "b" },
      { id: "praia", tom: "carinhoso", texto: "Uma praia deserta, sem celular, sem jogo, só descanso.", reage: ["Ai, eu iria AGORA.", "Hm, sem celular? Difícil."], prox: "b" },
      { id: "aventura", tom: "ousado", texto: "Islândia, ver aurora boreal e pular num lago congelado.", reage: ["Você é doido e eu topo 😂", "Que frio, credo."], prox: "b" },
      { id: "voce", tom: "curioso", texto: "Depende. Pra onde você iria?", reage: ["Ah, sempre quis conhecer o Japão!", "Sei lá."], prox: "b" },
    ] },
    b: { dela: c.fama >= 50 ? "Imagina a gente lá sem ninguém te reconhecendo... 😅" : "Um dia a gente faz uma viagem dessas, né?", falas: [
      { id: "marca", tom: "direto", texto: "Bora marcar. Nas férias a gente vai.", reage: ["Tô cobrando, hein! ✈️", "Promessa de jogador..."], convite: true, bonus: 2 },
      { id: "sonho", tom: "romantico", texto: "Pra mim já é um sonho você topar ir comigo.", reage: ["Para que eu fico boba 🥹", "Que meloso."] },
      { id: "piada", tom: "engracado", texto: "Só se eu puder levar a bola. Não confio em hotel sem campo.", reage: ["Hahaha viciado!", "Nossa, só futebol."] },
    ] },
  }) },
  { id: "comida", quando: () => true, peso: 2, inicio: "a", passos: () => ({
    a: { dela: "Pergunta muito séria que define muita coisa: qual sua comida favorita?", falas: [
      { id: "mae", tom: "carinhoso", texto: "Feijão da minha mãe. Nada no mundo ganha.", reage: ["Que amor. Quero provar esse feijão 🥰", "Clássico."] },
      { id: "pizza", tom: "engracado", texto: "Pizza. Com ketchup. Pode me julgar.", reage: ["KETCHUP?! Ok, vou ter que repensar tudo 😂", "Que nojo kkkk"] },
      { id: "chique", tom: "convencido", texto: "Um japonês com estrela no guia. Quem prova, não volta pro rodízio.", reage: ["Hm, chique! Me leva então 😏", "Que metido."] },
      { id: "cozinha", tom: "ousado", texto: "A que eu cozinhar pra você no sábado. Topa?", reage: ["Topo! E se ficar ruim eu vou falar, hein 😂", "Você cozinha? Duvido."], convite: true },
    ] },
  }) },
  { id: "musica", quando: () => true, peso: 2, inicio: "a", passos: (_p, c) => ({
    a: { dela: "O que toca no seu fone antes do jogo?", falas: [
      { id: "pagode", tom: "engracado", texto: "Pagode dos anos 90. O vestiário inteiro canta junto, desafinado.", reage: ["HAHAHA imaginei a cena 😂", "Hm, não é muito minha praia."] },
      { id: "nossa", tom: "romantico", texto: "Ultimamente? A música que você me mandou semana passada.", reage: ["Mentira! 🥹", "Sei, sei."] },
      { id: "funk", tom: "ousado", texto: "Funk no talo. Entro em campo pilhado.", reage: ["Então vamos num baile qualquer dia 🔥", "Barulhento demais pra mim."] },
      { id: "silencio", tom: "direto", texto: "Nada. Silêncio total, foco no jogo.", reage: ["Que concentração. Respeito.", "Que sem graça kkk"] },
    ] },
  }) },
  { id: "familia", quando: (p) => (p.etapa === "saindo" || p.etapa === "namorando") && !p.conheceuFamilia, peso: 2, inicio: "a", passos: () => ({
    a: { dela: "Você é muito ligado na sua família?", falas: [
      { id: "tudo", tom: "carinhoso", texto: "Muito. Tudo que eu faço é por eles.", reage: ["Isso me diz muito sobre você ❤️", "Hm, legal."], prox: "b" },
      { id: "longe", tom: "direto", texto: "Gosto, mas sou independente. Saí cedo de casa pra jogar.", reage: ["Entendo. Também saí cedo.", "Ah, meio distante, né?"], prox: "b" },
      { id: "mae", tom: "engracado", texto: "Minha mãe já perguntou de você três vezes. Tô tentando segurar ela.", reage: ["HAHAHA sua mãe sabe de mim?! 😳😂", "Ai, já?"], prox: "b" },
    ] },
    b: { dela: "Um dia você me apresenta pra eles?", falas: [
      { id: "sim", tom: "romantico", texto: "No domingo, se você quiser. Minha mãe vai fazer o feijão.", reage: ["Que nervoso! Mas eu quero 🥹", "Calma, ainda é cedo."], bonus: 2 },
      { id: "calma", tom: "direto", texto: "Vamos com calma. Quando for a hora, eu te levo.", reage: ["Justo. Sem pressa.", "Ah, tá..."] },
    ] },
  }) },
  { id: "futuro", quando: (p) => serio(p), peso: 2, inicio: "a", passos: (p) => ({
    a: { dela: "Às vezes fico pensando onde a gente vai estar daqui a uns cinco anos...", falas: [
      { id: "casa", tom: "romantico", texto: p.etapa === "casados" ? "Com uma casa cheia e um cachorro destruindo o sofá." : "Juntos. Numa casa nossa. Com você brigando comigo por causa da toalha molhada.", reage: ["Você sabe exatamente o que dizer 🥹", "Hm, você tem certeza disso?"], bonus: 3 },
      { id: "europa", tom: "convencido", texto: "Eu na Europa, campeão de tudo, e você do meu lado.", reage: ["Se for do seu lado, topo qualquer país 😍", "E a minha carreira, onde fica?"] },
      { id: "pergunta", tom: "curioso", texto: "E você, onde se vê?", reage: ["Que bom que perguntou. Me vejo com você, mas também crescendo no trabalho.", "Sei lá, depende de você."] },
      { id: "dia", tom: "frio", texto: "Não gosto de pensar tão longe. Vamos vivendo.", reage: ["É, faz sentido.", "Às vezes parece que você não pensa em nós."], bonus: -2 },
    ] },
  }) },
  { id: "saudade", quando: (p, c) => p.etapa !== "match" && (!!c.foraDeCasa || !!c.exterior), peso: 3, inicio: "a", passos: () => ({
    a: { dela: "Tô com saudade. Hotel de concentração tem wi-fi pelo menos? 🥺", falas: [
      { id: "video", tom: "romantico", texto: "Tem. Liga a câmera que eu quero te ver antes de dormir.", reage: ["Ligando 📹❤️", "Agora não, tô ocupada."], bonus: 2 },
      { id: "piada", tom: "engracado", texto: "Tem wi-fi e o colega de quarto ronca. Me salva.", reage: ["HAHAHA coitado de você 😂", "Kkk"] },
      { id: "foco", tom: "direto", texto: "Também tô. Volto domingo à noite, já marca o jantar.", reage: ["Marcado! 🍷", "Tá."], convite: true },
    ] },
  }) },
  { id: "festa", quando: (p) => p.jeito === "festeira" || p.jeito === "aventureira", peso: 2, inicio: "a", passos: () => ({
    a: { dela: "Hoje tem festa na casa de uma amiga. Bora? 💃", falas: [
      { id: "bora", tom: "ousado", texto: "Bora. E a gente só vai embora quando o DJ pedir arrego.", reage: ["É ASSIM QUE SE FALA 🔥", "Calma, não precisa exagerar."], bonus: 1 },
      { id: "nos", tom: "romantico", texto: "Prefiro uma festa só nós dois. Topa trocar?", reage: ["Hmm... proposta aceita 😏", "Ah, mas eu queria a festa."] },
      { id: "treino", tom: "direto", texto: "Hoje não dá, amanhã tem treino cedo. Sábado eu vou.", reage: ["Ok, atleta. Sábado tá cobrado!", "Sempre o treino..."] },
    ] },
  }) },
  { id: "desafio", quando: (p) => p.jeito === "competitiva" || p.jeito === "engraçada", peso: 2, inicio: "a", passos: () => ({
    a: { dela: "Aposto que te ganho no videogame. Valendo um jantar 😏", falas: [
      { id: "aceita", tom: "convencido", texto: "Pode escolher o restaurante. Você vai pagar.", reage: ["Veremos, convencido 😤🎮", "Que metido."], convite: true },
      { id: "perde", tom: "carinhoso", texto: "Eu perco de propósito só pra jantar com você.", reage: ["Não vale perder de propósito! 😂 Mas aceito o jantar.", "Sem graça assim."] },
      { id: "outra", tom: "ousado", texto: "Videogame é fácil. Te desafio no kart.", reage: ["Ah é? Sábado, kartódromo. Vai chorar 😂", "Kart dá medo."] },
    ] },
  }) },
  { id: "carreira-dela", quando: (p) => serio(p) && p.profissao !== "estudante", peso: 1.5, inicio: "a", passos: (p) => ({
    a: { dela: `Recebi uma proposta para crescer ${p.profissao === "influencer" ? "como influencer" : "no trabalho"}, mas vou ter que viajar bem mais...`, falas: [
      { id: "apoia", tom: "carinhoso", texto: "Vai! Você merece. A gente dá um jeito com a distância.", reage: ["Você não sabe o quanto isso significa 😭❤️", "Sério? Você não liga de eu ficar longe?"], bonus: 3 },
      { id: "fica", tom: "frio", texto: "Mais viagem? Já é difícil com os meus jogos.", reage: ["Eu sei... vou pensar.", "Então minha carreira não importa?"], bonus: -3 },
      { id: "pensa", tom: "curioso", texto: "O que você quer de verdade? Isso é o que importa.", reage: ["Acho que eu quero aceitar. Obrigada por perguntar.", "Não sei ainda."], bonus: 1 },
    ] },
  }) },
  { id: "flerte", quando: (p) => p.etapa !== "match" && p.relacao >= 50, peso: 2, inicio: "a", passos: () => ({
    a: { dela: "Tô aqui deitada pensando em você 🙈", falas: [
      { id: "tambem", tom: "romantico", texto: "Eu também. Faz uns dez minutos que tô olhando nossa foto.", reage: ["Para 🥹❤️", "Hm, sei."], bonus: 1 },
      { id: "vem", tom: "ousado", texto: "Então para de pensar e vem pra cá.", reage: ["Tô pegando a chave do carro 😏", "Hoje não, mocinho."] },
      { id: "piada", tom: "engracado", texto: "Pensando em mim ou na minha conta bancária? 😂", reage: ["Nos dois, óbvio 😂", "Que palhaço."] },
      { id: "dormir", tom: "frio", texto: "Dorme, amanhã cedo tem treino.", reage: ["Tá bom, boa noite.", "Que romântico, hein."] },
    ] },
  }) },
  { id: "sumido", quando: (p) => p.etapa !== "match" && p.relacao < 42, peso: 4, inicio: "a", passos: () => ({
    a: { dela: "Você anda sumido. Esqueceu de mim?", falas: [
      { id: "desculpa", tom: "carinhoso", texto: "Desculpa. Semana pesada, mas nada justifica. Posso te compensar?", reage: ["Pode. Sábado você é meu 😌", "Vou pensar."], prox: "b", bonus: 2 },
      { id: "verdade", tom: "direto", texto: "Tô focado no campeonato. Não é nada com você.", reage: ["Ok, entendo. Só não some de vez.", "Sempre tem uma desculpa."], prox: "b" },
      { id: "frio", tom: "frio", texto: "Tô ocupado, ué.", reage: ["Tudo bem.", "Percebi."], bonus: -4 },
    ] },
    b: { dela: "Só quero sentir que eu sou prioridade às vezes, sabe?", falas: [
      { id: "prioridade", tom: "romantico", texto: "Você é. E vou te mostrar isso, não só falar.", reage: ["Tô esperando 😊", "Veremos."], bonus: 3 },
      { id: "plano", tom: "direto", texto: "Vou reservar a folga de domingo só pra gente. Combinado?", reage: ["Combinado ❤️", "Tá."], convite: true, bonus: 2 },
    ] },
  }) },
];

export interface Mensagem { de: "ela" | "eu"; texto: string; tom?: Tom; delta?: number }
export interface Conversa { topico: string; passo?: string; hist: Mensagem[]; s: number; total: number; fim?: boolean; convite?: boolean; revelou?: boolean }
export interface OpcaoConversa { id: string; texto: string; tom: Tom }

function sortearTopico(p: Par, c: CtxConversa, rng: RNG, usados: string[]): Topico {
  const ok = TOPICOS.filter((t) => t.quando(p, c));
  const pesos = ok.map((t) => (t.peso ?? 1) * (usados.includes(t.id) ? 0.25 : 1));
  let x = rng.next() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < ok.length; i++) { x -= pesos[i]; if (x <= 0) return ok[i]; }
  return ok[ok.length - 1];
}
/** A conversa da semana com ela (começa uma nova se não houver). */
export function conversaDaSemana(p: Par & { conversa?: Conversa; topicosVistos?: string[] }, c: CtxConversa): Conversa {
  if (p.conversa && p.conversa.s === c.semanaAbs) return p.conversa;
  const t = sortearTopico(p, c, new RNG(`conversa|${p.id}|${c.semanaAbs}`), p.topicosVistos ?? []);
  const passo = t.passos(p, c)[t.inicio];
  p.topicosVistos = [...(p.topicosVistos ?? []).filter((x) => x !== t.id), t.id].slice(-8);
  p.conversa = { topico: t.id, passo: t.inicio, hist: [{ de: "ela", texto: passo.dela }], s: c.semanaAbs, total: 0 };
  return p.conversa;
}
export function opcoesConversa(p: Par, cv: Conversa, c: CtxConversa): OpcaoConversa[] {
  if (cv.fim || !cv.passo) return [];
  const t = TOPICOS.find((x) => x.id === cv.topico);
  const passo = t?.passos(p, c)[cv.passo];
  return (passo?.falas ?? []).map((f) => ({ id: f.id, texto: f.texto, tom: f.tom }));
}
const REACAO_GENERICA: Record<"bom" | "ok" | "ruim", string[]> = {
  bom: ["Hahaha adorei 😄", "Você sabe conversar, hein 😏", "Gostei disso ❤️"],
  ok: ["Haha, ok.", "Entendi 🙂", "Hm, interessante."],
  ruim: ["Nossa...", "Tá bom então.", "Hm. Ok."],
};
/** Você responde: ela reage àquela frase, a relação muda e a conversa segue (ou termina). */
export function responderConversa(p: Par & { conversa?: Conversa }, falaId: string, c: CtxConversa, rng: RNG): { ok: boolean; delta: number; reacao: string; fim: boolean; convite?: boolean; revelou?: boolean } {
  const cv = p.conversa;
  if (!cv || cv.fim || !cv.passo) return { ok: false, delta: 0, reacao: "", fim: true };
  const t = TOPICOS.find((x) => x.id === cv.topico), passos = t?.passos(p, c), passo = passos?.[cv.passo], f = passo?.falas.find((x) => x.id === falaId);
  if (!t || !passos || !passo || !f) return { ok: false, delta: 0, reacao: "", fim: true };
  const nota = notaDoTom(p.jeito, f.tom) + (f.bonus ?? 0) / 2;
  const delta = Math.round(nota >= 2 ? rng.int(9, 12) : nota >= 1 ? rng.int(5, 7) : nota >= 0 ? rng.int(1, 3) : nota >= -1 ? -3 : -7) + (f.bonus ?? 0);
  const gostou = nota >= 0.5;
  const reacao = f.reage ? (gostou || (nota >= 0 && rng.chance(0.5)) ? f.reage[0] : f.reage[1]) : rng.pick(REACAO_GENERICA[nota >= 1 ? "bom" : nota >= 0 ? "ok" : "ruim"]);
  cv.hist.push({ de: "eu", texto: f.texto, tom: f.tom, delta });
  cv.hist.push({ de: "ela", texto: reacao });
  cv.total += delta;
  if (f.revela) cv.revelou = true;
  if (f.convite && gostou) cv.convite = true;
  // segue a conversa só se ela não esfriou
  if (f.prox && passos[f.prox] && delta > -5) { cv.passo = f.prox; cv.hist.push({ de: "ela", texto: passos[f.prox].dela }); }
  else { cv.passo = undefined; cv.fim = true; }
  p.relacao = clamp(p.relacao + delta, 0, 100);
  return { ok: true, delta, reacao, fim: !!cv.fim, convite: cv.convite, revelou: cv.revelou };
}
