// Vestiário: o lugar do jogador no grupo (liderança, braçadeira de capitão), os companheiros que importam (o parceiro,
// o invejoso, o veterano que ensina, o garoto que pede conselho) e a relação com o técnico quando o clima pesa
// (técnico novo, geladeira, panelinha). Quase tudo vira momento na agenda (src/agenda.ts); a liderança sobe com o
// tempo de casa, a idade, o carisma, a fama e as escolhas.
import { RNG, clamp } from "./rng.js";
import { agendar, type EstadoAgenda, type OpcaoOcasiao, type EfeitoVida } from "./agenda.js";

const op = (id: string, rotulo: string, texto: string, ef: EfeitoVida, risco?: OpcaoOcasiao["risco"]): OpcaoOcasiao => ({ id, rotulo, texto, ef, ...(risco ? { risco } : {}) });
const primeiro = (n: string) => n.split(" ")[0];

export type PapelVestiario = "novato" | "elenco" | "lider" | "vice" | "capitao";
export const NOME_PAPEL_VEST: Record<PapelVestiario, string> = { novato: "Novato", elenco: "Do elenco", lider: "Liderança", vice: "Vice-capitão", capitao: "Capitão" };
export type TipoComp = "parceiro" | "invejoso" | "mentor" | "pupilo";
export const NOME_COMP: Record<TipoComp, [string, string]> = {
  parceiro: ["Parceiro", "Divide o quarto nas viagens. Com ele bem, a moral anda."],
  invejoso: ["Invejoso", "Disputa a mesma vaga e não esconde que não gosta de você."],
  mentor: ["Veterano que ensina", "Dá dica de treino e de vida. Ouvir rende evolução."],
  pupilo: ["Garoto que te admira", "Pede conselho. Ajudar faz de você referência."],
};
export interface Companheiro { nome: string; tipo: TipoComp; rel: number; desde: number }
export interface Vestiario {
  clubeId: string; lideranca: number; papel: PapelVestiario; comp: Companheiro[];
  /** técnico que o jogador já conheceu (para a conversa com o técnico novo) */
  tecnicoVisto?: string;
  /** relação com o técnico na última semana (vira a relação com o ex-técnico quando ele sai) */
  relUlt?: number;
  /** semanas na geladeira (fora dos relacionados por decisão do técnico) */
  geladeira?: number;
  capitaoDesde?: number;
  /** ex-técnicos e a relação com cada um (podem chamar o jogador para o clube novo) */
  exTecnicos?: { nome: string; rel: number; avisado?: number }[];
}
export interface NpcElenco { nome: string; idade: number; ovr: number; posicao: string }

/** Companheiros que importam, sorteados quando o jogador chega ao clube. */
export function novoVestiario(rng: RNG, clubeId: string, elenco: NpcElenco[], eu: { idade: number; posicao: string; ovr: number }, ab: number): Vestiario {
  const comp: Companheiro[] = [], usados = new Set<string>(), add = (x: NpcElenco | undefined, tipo: TipoComp, rel: number) => { if (x && !usados.has(x.nome)) { usados.add(x.nome); comp.push({ nome: x.nome, tipo, rel, desde: ab }); } };
  const mesmaPos = elenco.filter((x) => x.posicao === eu.posicao && Math.abs(x.ovr - eu.ovr) <= 6);
  const vets = elenco.filter((x) => x.idade >= 30).sort((x, y) => y.ovr - x.ovr).slice(0, 3);
  if (eu.idade <= 24 && vets.length) add(rng.pick(vets), "mentor", 55);
  const pares = elenco.filter((x) => Math.abs(x.idade - eu.idade) <= 3 && x.posicao !== eu.posicao);
  if (pares.length) add(rng.pick(pares), "parceiro", 60);
  if (mesmaPos.length && rng.chance(0.65)) add(rng.pick(mesmaPos), "invejoso", 30);
  const garotos = elenco.filter((x) => x.idade <= 20);
  if (eu.idade >= 28 && garotos.length) add(rng.pick(garotos), "pupilo", 55);
  return { clubeId, lideranca: 10, papel: "novato", comp };
}

export interface CtxVestiario {
  ab: number; idade: number; fama: number; carisma: number; titular: boolean; nota: number; jogosNoClube: number; temporadasNoClube: number;
  relTecnico: number; tecnico?: string; tecnicoEstilo?: string; apelido: string; clube: string; salario: number; elenco: NpcElenco[]; posicao: string; ovr: number;
  /** jogo grande na semana que vem (clássico, decisão) */
  jogoGrande?: string;
}
export interface EfeitoVestiario { moral: number; relTecnico: number; torcida: number; pressao: number; avisos: string[]; noticias: { titulo: string; texto: string; tipo?: "clube" | "polemica" }[]; marcos: string[] }

/** Até onde a liderança chega com o que o jogador é hoje (o resto vem das escolhas). */
export function liderancaAlvo(c: CtxVestiario): number {
  return clamp(Math.min(36, c.temporadasNoClube * 9 + c.jogosNoClube * 0.35) + (c.idade - 19) * 1.6 + c.carisma * 1.1 + c.fama * 0.18 + (c.titular ? 6 : -6), 0, 100);
}
function papelDe(v: Vestiario, c: CtxVestiario): PapelVestiario {
  const l = v.lideranca, era = v.papel;
  if (c.jogosNoClube < 8 && c.temporadasNoClube < 1) return "novato";
  // braçadeira: precisa de casa, idade e vaga; perde só quando cai bem abaixo (para não trocar toda semana)
  if ((era === "capitao" && l >= 62) || (l >= 74 && c.idade >= 23 && c.jogosNoClube >= 20 && c.titular)) return "capitao";
  if ((era === "vice" && l >= 52) || (l >= 60 && c.jogosNoClube >= 12)) return "vice";
  return l >= 42 ? "lider" : "elenco";
}

/** A semana no vestiário: liderança anda, papel muda, companheiros e técnico geram momentos. */
export function semanaVestiario(v: Vestiario, a: EstadoAgenda, rng: RNG, c: CtxVestiario): EfeitoVestiario {
  const e: EfeitoVestiario = { moral: 0, relTecnico: 0, torcida: 0, pressao: 0, avisos: [], noticias: [], marcos: [] };
  v.lideranca = clamp(v.lideranca + (liderancaAlvo(c) - v.lideranca) * 0.04, 0, 100);
  const antes = v.papel, agora = papelDe(v, c);
  if (agora !== antes) {
    v.papel = agora;
    if (agora === "capitao") {
      v.capitaoDesde = c.ab;
      e.moral += 8; e.torcida += 4;
      e.noticias.push({ titulo: `${c.apelido} é o novo capitão do ${c.clube}`, texto: `O técnico entregou a braçadeira a ${c.apelido}. No vestiário, ninguém discutiu.` });
      e.marcos.push(`Capitão do ${c.clube}`);
      e.avisos.push("Você é o novo capitão do time!");
    } else if (antes === "capitao") {
      e.moral -= 6;
      e.noticias.push({ titulo: `${c.apelido} perde a braçadeira`, texto: `O ${c.clube} tem novo capitão. ${c.apelido} segue no elenco, mas o peso no vestiário mudou.`, tipo: "polemica" });
      e.avisos.push("Você perdeu a braçadeira de capitão.");
    } else if (agora === "vice") e.avisos.push("O grupo já te vê como liderança: você é o vice-capitão.");
  }
  if (v.papel === "capitao") { e.moral += 0.4; e.relTecnico += 0.2; e.pressao += 0.3; }
  // companheiros
  for (const x of v.comp) {
    x.rel = clamp(x.rel + (50 - x.rel) * 0.01, 0, 100);
    if (x.tipo === "parceiro" && x.rel >= 60) e.moral += 0.25;
    if (x.tipo === "invejoso" && x.rel <= 30) e.moral -= 0.2;
  }
  // quem saiu do clube some da lista (o nome não está mais no elenco)
  const nomes = new Set(c.elenco.map((x) => x.nome));
  const foram = v.comp.filter((x) => !nomes.has(x.nome));
  for (const x of foram) if (x.tipo === "parceiro" || x.tipo === "mentor") { e.avisos.push(`${x.nome} deixou o clube. Vai fazer falta no vestiário.`); e.moral -= 2; }
  v.comp = v.comp.filter((x) => nomes.has(x.nome));
  if (c.idade >= 27 && !v.comp.some((x) => x.tipo === "pupilo") && rng.chance(0.03)) {
    const g = c.elenco.filter((x) => x.idade <= 20).sort((x, y) => y.ovr - x.ovr)[0];
    if (g) agendar(a, c.ab, { origem: "vestiario", chave: `pupilo-${g.nome}`, titulo: `${primeiro(g.nome)} pede conselho`, texto: `O garoto ${g.nome}, ${g.idade} anos, te procurou depois do treino: quer saber como chegar onde você chegou.`, opcoes: [
      op("ajudar", "Adotar o garoto", `Você virou referência para ${primeiro(g.nome)}. O vestiário viu.`, { moral: 3, gatilho: `vest:pupilo:${g.nome}` }),
      op("dica", "Uma dica rápida", "Um conselho e um tapinha nas costas.", { moral: 1, gatilho: "vest:lid:2" }),
      op("nao", "Sem tempo agora", `${primeiro(g.nome)} entendeu. Ou fingiu que entendeu.`, { gatilho: "vest:lid:-1" }),
    ] }, 60);
  }
  // momentos do vestiário (um sorteio por semana, sem repetir a mesma chave tão cedo)
  const r = rng.next();
  const inv = v.comp.find((x) => x.tipo === "invejoso"), men = v.comp.find((x) => x.tipo === "mentor"), par = v.comp.find((x) => x.tipo === "parceiro");
  if (inv && r < 0.035) agendar(a, c.ab, { origem: "vestiario", chave: `indireta-${inv.nome}`, titulo: `Indireta de ${primeiro(inv.nome)}`, texto: `${inv.nome} postou "tem gente que joga pela câmera, não pelo time". Todo mundo entendeu para quem foi.`, opcoes: [
    op("conversar", "Chamar para conversar", `Papo reto no vestiário. ${primeiro(inv.nome)} baixou a bola.`, { gatilho: `vest:comp:${inv.nome}:15`, moral: 1 }),
    op("responder", "Responder nas redes", "A torcida adorou a resposta. O técnico, não.", { engajamento: 8, hype: 0.15, relTecnico: -3, gatilho: `vest:comp:${inv.nome}:-15` }, { chance: 0.35, texto: "A troca de farpas virou manchete: clima ruim no elenco.", ef: { relTecnico: -6, moral: -4, imprensa: -6, noticia: { titulo: "Racha no vestiário", texto: `${c.apelido} e ${inv.nome} trocam indiretas nas redes. A diretoria pediu silêncio.`, tipo: "polemica" } } }),
    op("ignorar", "Deixar para lá", "Você respondeu em campo. Ou pelo menos tentou.", { moral: -1 }),
  ] }, 26);
  else if (men && r < 0.07) agendar(a, c.ab, { origem: "vestiario", chave: `mentor-${men.nome}`, titulo: `${primeiro(men.nome)} chama para treinar depois`, texto: `O veterano ${men.nome} ficou depois do treino e te chamou: "Vou te mostrar uma coisa que ninguém me ensinou."`, opcoes: [
    op("ficar", "Ficar e aprender", "Uma hora a mais de treino, e um segredo de quem já viu tudo.", { evolucao: 0.04, cansaco: 6, gatilho: `vest:comp:${men.nome}:10` }),
    op("jantar", "Chamar para jantar", "Conversa de vida, de carreira e de dinheiro. Valeu mais que o treino.", { moral: 3, dinheiro: -1500, gatilho: `vest:comp:${men.nome}:12` }),
    op("depois", "Hoje não dá", "Fica para outro dia.", {}),
  ] }, 22);
  else if (r < 0.095 && c.relTecnico < 45) agendar(a, c.ab, { origem: "vestiario", chave: "panelinha", titulo: "Panelinha contra o técnico", texto: `Alguns jogadores estão se juntando para pressionar a diretoria contra ${c.tecnico ?? "o técnico"}. Querem você junto.`, opcoes: [
    op("entrar", "Entrar na panelinha", "O grupo te vê como um dos líderes do movimento.", { relTecnico: -8, gatilho: "vest:lid:5" }, { chance: 0.4, texto: "Vazou. O técnico soube que você estava na conversa.", ef: { relTecnico: -16, torcida: -3, noticia: { titulo: "Motim no vestiário", texto: `Jogadores, entre eles ${c.apelido}, pressionaram contra o técnico. A diretoria não gostou.`, tipo: "polemica" } } }),
    op("avisar", "Avisar o técnico", "O técnico ficou grato. Parte do elenco te chama de dedo-duro.", { relTecnico: 9, moral: -2, gatilho: "vest:lid:-7" }),
    op("fora", "Ficar de fora", "Você não entrou na briga.", {}),
  ] }, 30);
  else if (r < 0.12) agendar(a, c.ab, { origem: "vestiario", chave: "briga-treino", titulo: "Briga no treino", texto: "Uma dividida mais dura virou empurra-empurra no meio do coletivo. Todo mundo olhou para você.", opcoes: [
    op("separar", "Separar a briga", "Você entrou no meio e acalmou todo mundo. Atitude de líder.", { gatilho: "vest:lid:4", relTecnico: 2 }),
    op("entrar", "Tomar as dores do companheiro", `Você defendeu ${par ? primeiro(par.nome) : "o companheiro"}. O grupo respeitou, o técnico multou.`, { dinheiro: -Math.round(c.salario * 0.1), relTecnico: -3, gatilho: par ? `vest:comp:${par.nome}:12` : "vest:lid:2" }),
    op("olhar", "Deixar resolverem", "Passou. Mas ninguém esqueceu quem ficou parado.", { gatilho: "vest:lid:-2" }),
  ] }, 26);
  else if (r < 0.14 && c.salario >= 20000) agendar(a, c.ab, { origem: "vestiario", chave: "churrasco-elenco", titulo: "Churrasco do elenco", texto: "O grupo quer um churrasco para unir o time. Alguém precisa bancar.", opcoes: [
    op("bancar", "Bancar tudo", "Carne boa, pagode e o elenco todo na sua casa. Melhor investimento do ano.", { dinheiro: -Math.round(c.salario * 0.25), moral: 3, gatilho: "vest:lid:6" }),
    op("ir", "Ir e rachar", "Você foi, rachou a conta e voltou cedo.", { dinheiro: -2000, moral: 2, gatilho: "vest:lid:2" }),
    op("nao", "Não ir", "Faltou você na foto.", { gatilho: "vest:lid:-3" }),
  ] }, 30);
  else if (r < 0.16 && v.papel === "novato") agendar(a, c.ab, { origem: "vestiario", chave: "trote", titulo: "Trote do novato", texto: "Os veteranos decidiram: o novato tem que cantar em cima da cadeira na concentração.", opcoes: [
    op("cantar", "Soltar a voz", "Desafinou, mas o vídeo bombou e o grupo te abraçou.", { engajamento: 6, moral: 2, gatilho: "vest:lid:5" }),
    op("recusar", "Recusar", "Os veteranos não gostaram. Vai demorar para entrar na roda.", { gatilho: "vest:lid:-4" }),
  ] }, 200);
  if (c.jogoGrande && v.papel === "capitao") agendar(a, c.ab, { origem: "vestiario", chave: `discurso-${c.ab}`, titulo: "Discurso antes da decisão", prazo: 1, texto: `Antes de ${c.jogoGrande}, o técnico deixou o vestiário com você. Todos esperam o capitão falar.`, opcoes: [
    op("emocao", "Discurso emocionante", "Você falou da família, da torcida e de quem veio antes. Teve gente chorando.", { moral: 4, gatilho: "vest:lid:3" }, { chance: 0.15, texto: "Exagerou no tom e o time entrou nervoso.", ef: { moral: -2 } }),
    op("tatica", "Lembrar o plano de jogo", "Curto e objetivo. O técnico gostou.", { relTecnico: 3, moral: 1 }),
    op("tecnico", "Deixar o técnico falar", "O técnico falou. Você só bateu palmas.", {}),
  ] }, 4);
  return e;
}

/** Técnico novo: a primeira conversa. */
export function conversaTecnicoNovo(a: EstadoAgenda, ab: number, tecnico: string, estilo: string, fama: number) {
  agendar(a, ab, { origem: "tecnico", chave: `tecnico-novo-${tecnico}`, titulo: `Primeira conversa com ${tecnico}`, prazo: 2, texto: `O técnico novo (${estilo.toLowerCase()}) chamou os jogadores um a um. Chegou a sua vez.`, opcoes: [
    op("servico", "Mostrar serviço no treino", "Treinou como se fosse jogo. O técnico anotou seu nome.", { relTecnico: 8, cansaco: 8 }),
    op("garantia", "Pedir garantia de titular", fama >= 55 ? "Ele ouviu, olhou seu currículo e prometeu espaço." : "Ele não gostou de ouvir isso de quem ainda não provou nada.", fama >= 55 ? { relTecnico: 4, moral: 3 } : { relTecnico: -7 }),
    op("ouvir", "Ouvir o que ele quer", "Você entendeu o que ele espera de você.", { relTecnico: 3 }),
  ] }, 1);
}

/** Geladeira: o técnico tira o jogador dos relacionados por algumas semanas. Devolve as semanas (0 = nada). */
export function talvezGeladeira(v: Vestiario, a: EstadoAgenda, rng: RNG, ab: number, relTecnico: number, tecnico: string, apelido: string): number {
  if (v.geladeira || relTecnico >= 18 || !rng.chance(0.12)) return 0;
  v.geladeira = rng.int(3, 6);
  agendar(a, ab, { origem: "tecnico", chave: "geladeira", titulo: "Na geladeira", prazo: 3, texto: `${tecnico} tirou você dos relacionados "por opção técnica". A imprensa já fala em geladeira.`, opcoes: [
    op("conversa", "Pedir uma conversa", "Conversa dura, mas sincera. Ele vai te dar outra chance antes do previsto.", { relTecnico: 8, gatilho: "tec:geladeira:-2" }, { chance: 0.25, texto: "A conversa terminou em discussão. Mais tempo fora.", ef: { relTecnico: -4, gatilho: "tec:geladeira:2" } }),
    op("calado", "Treinar calado", "Cabeça baixa e trabalho. O técnico percebeu.", { relTecnico: 5, moral: -2 }),
    op("imprensa", "Desabafar na imprensa", `"Não sei por que estou fora." A torcida ficou do seu lado; o técnico, não.`, { torcida: 5, relTecnico: -10, imprensa: 4, noticia: { titulo: `${apelido} cobra explicação`, texto: `Fora dos relacionados, ${apelido} diz que não entende a decisão do técnico.`, tipo: "polemica" }, gatilho: "tec:geladeira:2" }),
  ] }, 20);
  return v.geladeira;
}
