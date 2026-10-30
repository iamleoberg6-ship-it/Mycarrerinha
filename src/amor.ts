// A vida a dois além dos programas: o chat do app (cada jeito gosta de um tipo de resposta), e os momentos do casal
// na agenda: aniversários, Dia dos Namorados, ciúme, sogra, pressão para casar, filho, a carreira dela, a ex que
// volta, a mudança de cidade, o casamento e a lua de mel.
import { RNG, clamp } from "./rng.js";
import { agendar, type EstadoAgenda, type OpcaoOcasiao, type EfeitoVida, type Ocasiao } from "./agenda.js";
import type { EstadoNamoro, Par } from "./namoro.js";
import { valorBrl } from "./moeda.js";

const op = (id: string, rotulo: string, texto: string, ef: EfeitoVida, risco?: OpcaoOcasiao["risco"]): OpcaoOcasiao => ({ id, rotulo, texto, ef, ...(risco ? { risco } : {}) });
const pn = (p: Par) => p.nome.split(" ")[0];

// ------------------------------------------------------------------ chat do app
export type EstiloChat = "engracado" | "romantico" | "direto" | "convencido";
export const NOME_ESTILO_CHAT: Record<EstiloChat, string> = { engracado: "Mandar uma piada", romantico: "Responder com carinho", direto: "Ser direto e chamar para sair", convencido: "Se gabar um pouco" };
const PREFERE: Record<string, EstiloChat[]> = {
  "engraçada": ["engracado"], "romântica": ["romantico"], workaholic: ["direto"], independente: ["direto"], festeira: ["engracado", "convencido"], caseira: ["romantico"],
  aventureira: ["direto", "engracado"], competitiva: ["convencido", "direto"], tranquila: ["romantico", "direto"], ciumenta: ["romantico"],
};
const MSG: Record<string, string[]> = {
  "engraçada": ["Se você for tão bom no papo quanto é no campo, já ganhou um ponto 😂", "Pergunta séria: pizza com ketchup, sim ou não?"],
  "romântica": ["Vi seu gol de domingo. Fiquei pensando se você é tão gentil quanto parece nas entrevistas.", "Acredita em amor à primeira vista ou preciso dar match de novo? 😊"],
  workaholic: ["Oi. Minha semana tá uma loucura, mas confesso que fiquei curiosa.", "Sem enrolação: o que você faz quando não está treinando?"],
  independente: ["Gosto de gente que sabe o que quer. Você sabe?", "Não sou fã de futebol, aviso logo. Ainda quer conversar?"],
  festeira: ["Sexta tem festa no rooftop. Você dança ou só joga bola? 💃", "Qual foi a melhor festa da sua vida? Quero saber se você aguenta o meu ritmo."],
  caseira: ["Meu programa favorito é sofá, filme e brigadeiro de panela. Julgue.", "Você cozinha? Porque eu como muito bem 😅"],
  aventureira: ["Já pulou de paraquedas? Eu já. Sua vez.", "Próximo feriado vou fazer uma trilha. Topa?"],
  competitiva: ["Aposto que eu te ganho em qualquer coisa que não seja futebol.", "Você é do tipo que aceita perder? Pergunto por motivos 😏"],
  tranquila: ["Oi! Que bom o match. Como foi seu dia?", "Gosto de conversa sem pressa. Me conta de você."],
  ciumenta: ["Oi... vi que você tem muita fã nos comentários, né? 👀", "Antes de tudo: você está conversando com mais alguém aqui?"],
};
export function mensagemDela(p: Par, semanaAbs: number): string {
  const l = MSG[p.jeito] ?? MSG.tranquila;
  let h = 0; for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return l[(semanaAbs + p.conversas + h) % l.length];
}
/** A sua resposta no chat: certa para o jeito dela, sobe bem; errada, esfria; se gabar quase sempre pega mal. */
export function respostaChat(p: Par, e: EstiloChat, rng: RNG): { delta: number; texto: string } {
  const pref = PREFERE[p.jeito] ?? ["romantico"], n = pn(p);
  if (pref.includes(e)) return { delta: rng.int(8, 12), texto: rng.pick([`${n}: "Hahaha gostei de você 😄"`, `${n}: "Ok, você ganhou minha atenção."`, `${n}: "Adorei. Continua assim 😊"`]) };
  if (e === "convencido") return { delta: -5, texto: `${n}: "Nossa... humilde, hein?"` };
  return { delta: rng.int(1, 4), texto: rng.pick([`${n}: "Haha, ok."`, `${n}: "Entendi 🙂"`, `${n}: "Legal. E você, o que mais gosta de fazer?"`]) };
}

// ------------------------------------------------------------------ momentos do casal na agenda
export interface CtxAmor { semanaAbs: number; semana: number; ano: number; fama: number; salario: number; exterior: boolean; apelido: string; temFilhoComEla: boolean }
export function semanaAmor(a: EstadoAgenda, rng: RNG, n: EstadoNamoro, x: CtxAmor): void {
  const p = n.par;
  const ag = (o: Omit<Ocasiao, "uid" | "expira"> & { prazo?: number }, intervalo?: number) => agendar(a, x.semanaAbs, o, intervalo);
  const v = (base: number, k: number) => Math.round(Math.max(base, x.salario * k) / 100) * 100;
  // a ex que volta (com ou sem namorada)
  if (n.ex.length && rng.chance(0.006)) {
    const ex = n.ex[n.ex.length - 1].split(" ")[0];
    if (p && p.etapa !== "saindo") ag({ origem: "amor", chave: "ex-volta", titulo: `Mensagem da ${ex}`, texto: `Meia-noite. "${ex}: oi... sumido. Lembrei de você hoje." ${pn(p)} está dormindo do seu lado.`, opcoes: [
      op("responder", "Responder", "Uma conversa inocente, você disse a si mesmo.", { moral: 1 }, { chance: 0.4, texto: `${pn(p)} viu a conversa no seu celular. Briga feia.`, ef: { gatilho: "par:-20", moral: -5 } }),
      op("contar", `Mostrar a mensagem para ${pn(p)}`, `${pn(p)} achou bonito você contar. Bloqueou a ${ex} junto com você.`, { gatilho: p.jeito === "ciumenta" ? "par:2" : "par:6" }),
      op("ignorar", "Ignorar", "Mensagem visualizada e esquecida.", {}),
    ] }, 80);
    else if (!p) ag({ origem: "amor", chave: "ex-volta", titulo: `A ${ex} voltou a falar com você`, texto: `"${ex}: tô com saudade. Será que a gente não errou?"`, opcoes: [
      op("reatar", "Dar mais uma chance", `Jantar, conversa longa e um beijo no fim. Vocês voltaram.`, { moral: 6, gatilho: `ex-reatar:${n.ex[n.ex.length - 1]}` }),
      op("conversar", "Conversar como amigos", "Foi bom conversar. Só isso.", { moral: 1 }),
      op("ignorar", "Deixar no passado", "Passado é passado.", {}),
    ] }, 80);
  }
  if (!p || p.etapa === "match") return;
  const nome = pn(p), serio = p.etapa !== "saindo";
  // mudança de cidade: ela vem junto?
  if (n.mudanca && n.mudancaDecidida !== n.mudanca) {
    ag({ origem: "amor", chave: `mudanca-${n.mudanca}`, titulo: `E a ${nome}?`, texto: `Você vai morar em ${n.mudanca}. ${nome} tem a vida dela em ${p.cidadeClube}: trabalho, família, amigos.`, prazo: 2, opcoes: [
      op("convidar", "Pedir para ela vir junto", `${nome} pensou dois dias. Disse que vai.`, { gatilho: "par-vem", moral: 4 }, { chance: clamp(0.65 - p.relacao / 200 + (p.jeito === "independente" || p.jeito === "workaholic" ? 0.25 : 0), 0.05, 0.8), texto: `${nome} disse que não larga a vida dela. Vão tentar à distância.`, ef: { gatilho: "par-distancia", moral: -3 } }),
      op("bancar", "Bancar a mudança e um recomeço para ela lá", `${nome} topou: você pagou a mudança e um curso para ela recomeçar.`, { dinheiro: -v(30_000, 1), gatilho: "par-vem", moral: 4 }),
      op("distancia", "Namoro à distância", "Videochamada toda noite. Vai ser difícil.", { gatilho: "par-distancia" }),
      op("terminar", "Terminar antes da mudança", "Um fim triste, mas em paz.", { gatilho: "par-fim", moral: -6 }),
    ] }, 0);
  }
  // aniversário dela
  const aniver = p.aniver ?? (p.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0) % 37) + 2;
  if (x.semana === aniver && serio) ag({ origem: "amor", chave: `aniver-par-${x.ano}`, titulo: `Aniversário da ${nome}`, texto: `Sábado é aniversário da ${nome}. Ela finge que não liga.`, opcoes: [
    op("festa", "Festa surpresa com os amigos dela", `${nome} chorou quando entrou. A melhor festa da vida dela, ela disse.`, { dinheiro: -v(5_000, 0.3), gatilho: "par:14", moral: 3, cansaco: 5 }),
    op("jantar", "Jantar romântico e presente", `${nome} amou o presente.`, { dinheiro: -v(1_000, 0.06), gatilho: "par:8", moral: 2 }),
    op("esquecer", "Seguir a rotina", `Você esqueceu. ${nome} não.`, { gatilho: "par:-15", moral: -2 }),
  ] }, 0);
  // aniversário de namoro (a cada temporada desde o começo)
  const tempo = x.semanaAbs - p.desde;
  if (serio && tempo > 0 && tempo % 40 === 0) ag({ origem: "amor", chave: `aniver-namoro-${x.ano}`, titulo: `${Math.round(tempo / 40)} ${tempo / 40 === 1 ? "ano" : "anos"} juntos`, texto: `Hoje faz ${Math.round(tempo / 40)} ${tempo / 40 === 1 ? "ano" : "anos"} que você e ${nome} estão juntos.`, opcoes: [
    op("viagem", "Surpresa: viagem de fim de semana", "Hotel com vista, café na cama. Ela guardou até o guardanapo.", { dinheiro: -v(4_000, 0.15), gatilho: "par:12", moral: 4, cansaco: 4 }),
    op("carta", "Escrever uma carta à mão", "Ela leu três vezes e guardou na gaveta.", { gatilho: "par:7", moral: 2 }),
    op("esquecer", "Passar batido", `${nome} esperou o dia todo uma mensagem.`, { gatilho: "par:-12" }),
  ] }, 0);
  // Dia dos Namorados (12 de junho no Brasil; 14 de fevereiro lá fora)
  if (serio && x.semana === (x.exterior ? 5 : 22)) ag({ origem: "amor", chave: `namorados-${x.ano}`, titulo: "Dia dos Namorados", texto: `É Dia dos Namorados. Os restaurantes estão lotados e ${nome} está de olho no celular.`, opcoes: [
    op("especial", "Noite especial planejada", "Restaurante reservado há um mês, flores, música. Acertou em cheio.", { dinheiro: -v(1_500, 0.06), gatilho: "par:10", moral: 3 }),
    op("post", "Post romântico nas redes", "A legenda rendeu curtidas e um sorriso dela.", { gatilho: "par:4", engajamento: 5 }),
    op("esquecer", "Concentração antes do jogo", `${nome} jantou com as amigas e postou indireta.`, { gatilho: "par:-10" }),
  ] }, 0);
  // ciúme
  if (rng.chance(0.012 * (p.jeito === "ciumenta" ? 3 : 1) * (0.5 + x.fama / 60))) ag({ origem: "amor", chave: "ciume", titulo: "Crise de ciúme", texto: `${nome} viu uma fã comentando "lindo 😍" em todas as suas fotos, e você curtiu uma delas.`, opcoes: [
    op("explicar", "Explicar com calma e apagar a curtida", `${nome} ainda ficou de cara, mas passou.`, { gatilho: "par:2" }),
    op("foto", "Postar uma foto juntos com declaração", `A fã sumiu dos comentários. ${nome} sorriu.`, { gatilho: "par:6", engajamento: 4 }),
    op("ignorar", "Dizer que é bobeira", "Dois dias sem se falar direito.", { gatilho: p.jeito === "ciumenta" ? "par:-12" : "par:-5", moral: -2 }),
  ] }, 20);
  // sogra
  if (["morando", "noivos", "casados"].includes(p.etapa) && rng.chance(0.009)) ag({ origem: "amor", chave: "sogra", titulo: "A sogra vem aí", texto: `A mãe da ${nome} quer passar um mês na casa de vocês. "Só para ajudar."`, opcoes: [
    op("receber", "Receber de braços abertos", "Comida boa todo dia, opinião sobre tudo também.", { gatilho: "par:8", moral: -1, cansaco: 3 }),
    op("hotel", "Pagar um hotel perto", "A sogra adorou o hotel. Diplomacia nota 10.", { dinheiro: -v(8_000, 0.3), gatilho: "par:3" }),
    op("recusar", "Dizer que agora não dá", `${nome} ficou dividida entre você e a mãe.`, { gatilho: "par:-10" }),
  ] }, 60);
  // pressão para casar
  if ((p.etapa === "namorando" || p.etapa === "morando") && tempo > 30 && rng.chance(0.01 * (p.jeito === "romântica" ? 2.5 : 1))) ag({ origem: "amor", chave: "casar", titulo: "A conversa sobre casamento", texto: `${nome}: "A gente tá junto faz tempo. Você pensa em casar comigo?"`, opcoes: [
    op("sim", "Dizer que sim, logo logo", `Os olhos dela brilharam. Agora ela espera o pedido.`, { gatilho: "par:6" }),
    op("sincero", "Ser sincero: ainda não sabe", "Doeu, mas ela agradeceu a sinceridade.", { gatilho: p.jeito === "independente" ? "par:3" : "par:-6" }),
    op("desviar", "Mudar de assunto", "Ela percebeu.", { gatilho: "par:-10" }),
  ] }, 40);
  // filho
  if (p.etapa === "casados" && !n.gravidez && !x.temFilhoComEla && rng.chance(0.01)) ag({ origem: "amor", chave: "quer-filho", titulo: `${nome} quer ser mãe`, texto: `${nome}: "Acho que chegou a hora. Vamos ter um filho?"`, opcoes: [
    op("sim", "Vamos tentar", "Vocês decidiram: agora é tentar.", { gatilho: "par-filho", moral: 3 }),
    op("esperar", "Esperar a carreira estabilizar", "Ela entendeu, mas ficou um pouco triste.", { gatilho: "par:-6" }),
  ] }, 60);
  // a carreira dela
  if (serio && !p.famosa && rng.chance(0.005)) {
    if (["influencer", "modelo", "jornalista"].includes(p.profissao)) ag({ origem: "amor", chave: "ela-famosa", titulo: `${nome} estourou`, texto: p.profissao === "influencer" ? `${nome} bateu um milhão de seguidores e virou capa de revista.` : p.profissao === "modelo" ? `${nome} foi chamada para desfilar em Paris.` : `${nome} ganhou um programa próprio na TV.`, opcoes: [
      op("junto", "Aparecer junto: casal do ano", "Capa de revista dos dois. O país inteiro shippa vocês.", { gatilho: "par-famosa", fama: 2, engajamento: 12 }),
      op("apoiar", "Apoiar de longe", `${nome} brilhou sozinha e amou o seu apoio.`, { gatilho: "par-famosa" }),
    ] }, 999);
    else ag({ origem: "amor", chave: "ela-proposta", titulo: `${nome} recebeu uma proposta`, texto: `${nome} foi chamada para um cargo importante em outra cidade. É o sonho dela.`, opcoes: [
      op("apoiar", "Apoiar: namoro à distância por um tempo", "Ela foi. Vocês contam os dias para os fins de semana.", { gatilho: "par-longe", moral: -2 }),
      op("negocio", "Ajudar ela a abrir o próprio negócio aqui", "Ela ficou e abriu o negócio dela. Orgulho.", { dinheiro: -v(150_000, 2), gatilho: "par:10" }),
      op("ficar", "Pedir para ela ficar", "Ela ficou. Mas vai lembrar disso.", { gatilho: "par:-12" }),
    ] }, 999);
  }
}
/** Casamento: como vai ser a festa (e depois a lua de mel). */
export function agendarCasamento(a: EstadoAgenda, semanaAbs: number, nome: string, salario: number) {
  const v = (base: number, k: number) => Math.round(Math.max(base, salario * k) / 1000) * 1000;
  agendar(a, semanaAbs, { origem: "amor", chave: `casamento-${nome}`, titulo: `O casamento com ${nome}`, texto: `Está marcado. Agora, como vai ser a festa?`, prazo: 3, opcoes: [
    op("festao", `Festão para 600 convidados (${valorBrl(v(400_000, 6))})`, "Companheiros, parças, famosos e a família toda. Festa até o sol nascer, capa de revista.", { dinheiro: -v(400_000, 6), fama: 2, moral: 8, engajamento: 15, gatilho: "par:10", marco: { tipo: "amor", texto: `Casa com ${nome} num festão` }, noticia: { titulo: `O casamento do ano: o jogador e ${nome}`, texto: "Seiscentos convidados, show particular e jogadores de vários clubes.", tipo: "vida" } }),
    op("praia", `Casamento na praia (${valorBrl(v(150_000, 3))})`, "Pé na areia, pôr do sol, só quem importa.", { dinheiro: -v(150_000, 3), moral: 8, gatilho: "par:12", marco: { tipo: "amor", texto: `Casa com ${nome} na praia` } }),
    op("pequeno", "Cerimônia pequena só com a família", "Simples e bonito. A sua mãe e a dela choraram juntas.", { dinheiro: -v(30_000, 0.5), moral: 6, gatilho: "par:8", marco: { tipo: "amor", texto: `Casa com ${nome}` } }),
    op("cartorio", "Só o cartório", "Assinatura, almoço e pronto.", { moral: 3, gatilho: "par:-3", marco: { tipo: "amor", texto: `Casa com ${nome} no cartório` } }),
  ] }, 0);
}
export function agendarLuaDeMel(a: EstadoAgenda, semanaAbs: number, salario: number) {
  const v = (base: number, k: number) => Math.round(Math.max(base, salario * k) / 1000) * 1000;
  agendar(a, semanaAbs, { origem: "amor", chave: `lua-${semanaAbs}`, titulo: "Lua de mel", texto: "Para onde vai a lua de mel?", prazo: 2, opcoes: [
    op("maldivas", `Maldivas (${valorBrl(v(120_000, 2))})`, "Bangalô sobre o mar, sem sinal de celular. Perfeito.", { dinheiro: -v(120_000, 2), moral: 8, desgaste: -8, gatilho: "par:10", engajamento: 8 }),
    op("paris", `Paris (${valorBrl(v(80_000, 1.5))})`, "Torre Eiffel, croissant e um jantar inesquecível.", { dinheiro: -v(80_000, 1.5), moral: 7, desgaste: -6, gatilho: "par:9" }),
    op("noronha", `Fernando de Noronha (${valorBrl(v(40_000, 0.8))})`, "Mergulho com tartaruga e pôr do sol no Boldró.", { dinheiro: -v(40_000, 0.8), moral: 6, desgaste: -6, gatilho: "par:8" }),
    op("depois", "Deixar para depois", "Ela entendeu. Mais ou menos.", { gatilho: "par:-6" }),
  ] }, 0);
}
