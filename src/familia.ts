// Família do jogador: pai, mãe e irmãos, sorteados no começo da carreira conforme o país e a origem.
// Às vezes o pai tem passado no futebol (treinador ou ex-jogador), o irmão mais velho é jogador de verdade
// num elenco do mundo, e o irmão mais novo joga bola e pode ser indicado à base do seu clube.
// Cada um tem relação de 0 a 100: família perto e bem cuidada dá moral; distância, sumiço e polêmica pesam.
import { RNG, clamp } from "./rng.js";
import type { PacoteDados } from "./liga.js";
import type { Posicao } from "./atributos.js";
import { mundo, infoClube } from "./mundo.js";
import { infoLiga } from "./ligas.js";

export type Parentesco = "pai" | "mae" | "irmao" | "irma";
export type TracoFamilia = "treinador" | "exJogador";
/** Futebol de um irmão: criança, joga por diversão (amador), na base de um clube, profissional, parou. */
export type FaseIrmao = "crianca" | "amador" | "base" | "pro" | "parou";
export interface FutebolIrmao { fase: FaseIrmao; posicao: Posicao; ovr: number; pot: number; clubeId?: string; indicado?: number }
export interface Familiar {
  id: string; parentesco: Parentesco; nome: string; nasc: number; profissao: string; relacao: number;
  /** semana (absoluta) do último contato */
  contato: number;
  traco?: TracoFamilia; futebol?: FutebolIrmao;
}
export interface EstadoFamilia { membros: Familiar[]; semana: number; feitas: string[] }
export type AcaoFamilia = "ligar" | "visitar" | "presente" | "jogo" | "conselho" | "indicarBase" | "pedirIndicacao";
export const NOME_ACAO_FAM: Record<AcaoFamilia, string> = {
  ligar: "Ligar", visitar: "Visitar", presente: "Dar um presente", jogo: "Levar ao jogo", conselho: "Pedir conselho",
  indicarBase: "Indicar à base do clube", pedirIndicacao: "Pedir indicação ao clube dele",
};
export const MAX_ACOES_FAMILIA = 2;
export const NOME_PARENTESCO: Record<Parentesco, string> = { pai: "Pai", mae: "Mãe", irmao: "Irmão", irma: "Irmã" };
export const NOME_TRACO: Record<TracoFamilia, string> = { treinador: "Treinador", exJogador: "Ex-jogador" };
export const NOME_FASE_IRMAO: Record<FaseIrmao, string> = { crianca: "Ainda criança", amador: "Joga bola no bairro", base: "Na base", pro: "Profissional", parou: "Largou o futebol" };

// ------------------------------------------------------------------ nomes por língua
const NOMES: Record<string, [string[], string[]]> = {
  pt: [["Carlos", "José", "Marcos", "Paulo", "Ricardo", "Sérgio", "Antônio", "Luiz", "Fábio", "Rogério", "Davi", "Pedro", "Lucas", "Mateus", "Rafael", "Enzo", "Thiago", "Caio"],
    ["Maria", "Ana", "Cláudia", "Patrícia", "Fernanda", "Sandra", "Márcia", "Juliana", "Luciana", "Rosana", "Beatriz", "Larissa", "Camila", "Júlia", "Manuela", "Letícia"]],
  es: [["Jorge", "Carlos", "Diego", "Martín", "Pablo", "Luis", "Sergio", "Javier", "Nicolás", "Matías", "Santiago", "Joaquín", "Tomás", "Facundo"],
    ["María", "Ana", "Laura", "Silvia", "Gabriela", "Lucía", "Carolina", "Valentina", "Sofía", "Camila", "Florencia", "Paula"]],
  en: [["John", "David", "Michael", "Paul", "Mark", "James", "Chris", "Daniel", "Tom", "Ryan", "Jack", "Kevin", "Emeka", "Kwame", "Tunde", "Kofi"],
    ["Sarah", "Emma", "Laura", "Claire", "Rachel", "Jessica", "Amy", "Grace", "Chloe", "Ngozi", "Ama", "Adaeze", "Efua", "Funmi"]],
  fr: [["Pierre", "Jean", "Michel", "Olivier", "Laurent", "Nicolas", "Thomas", "Hugo", "Lucas", "Mamadou", "Ibrahima", "Moussa", "Cheikh"],
    ["Marie", "Sophie", "Isabelle", "Nathalie", "Camille", "Léa", "Chloé", "Aminata", "Fatou", "Awa", "Mariama"]],
  de: [["Thomas", "Michael", "Stefan", "Andreas", "Jens", "Markus", "Lukas", "Jonas", "Felix", "Leon", "Niklas"], ["Sabine", "Petra", "Claudia", "Anja", "Katrin", "Lena", "Mia", "Hannah", "Lea", "Laura"]],
  it: [["Marco", "Giuseppe", "Antonio", "Luca", "Andrea", "Francesco", "Matteo", "Lorenzo", "Alessandro", "Davide"], ["Giulia", "Francesca", "Chiara", "Sara", "Paola", "Elena", "Martina", "Sofia", "Aurora"]],
  nl: [["Jan", "Pieter", "Kees", "Dennis", "Ruud", "Mark", "Daan", "Sem", "Lars", "Bram"], ["Anna", "Ingrid", "Marieke", "Linda", "Sanne", "Emma", "Julia", "Fenna", "Lotte"]],
  ja: [["Hiroshi", "Takeshi", "Kenji", "Satoshi", "Yuki", "Haruto", "Ren", "Sota", "Kaito", "Riku"], ["Yoko", "Keiko", "Naomi", "Akiko", "Yui", "Hina", "Sakura", "Aoi", "Mei"]],
  ko: [["Min-jun", "Seo-jun", "Ji-ho", "Hyun-woo", "Sung-min", "Dong-hyun", "Jae-won", "Tae-yang"], ["Ji-woo", "Seo-yeon", "Min-seo", "Ha-eun", "Soo-ah", "Ye-jin", "Da-eun"]],
};
const LINGUA: Record<string, string> = { BRA: "pt", ARG: "es", URU: "es", ESP: "es", NED: "nl", GER: "de", ITA: "it", ENG: "en", FRA: "fr", NGA: "en", SEN: "fr", GHA: "en", JPN: "ja", KOR: "ko" };

// ------------------------------------------------------------------ profissões por origem
const PROF_PAI: Record<string, string[]> = {
  humilde: ["Pedreiro", "Motorista de ônibus", "Porteiro", "Feirante", "Mecânico", "Pintor", "Segurança"],
  media: ["Professor", "Vendedor", "Bancário", "Policial", "Técnico de informática", "Representante comercial"],
  rica: ["Empresário", "Médico", "Advogado", "Engenheiro", "Dono de concessionária"],
};
const PROF_MAE: Record<string, string[]> = {
  humilde: ["Diarista", "Costureira", "Cabeleireira", "Cozinheira", "Caixa de supermercado", "Merendeira"],
  media: ["Professora", "Enfermeira", "Secretária", "Contadora", "Dona de loja"],
  rica: ["Médica", "Advogada", "Arquiteta", "Empresária", "Dentista"],
};
const PROF_IRMAO = ["Estudante", "Trabalha no comércio", "Faz faculdade", "Motoboy", "Trabalha com o pai", "Programador", "Barbeiro"];
const PROF_IRMA = ["Estudante", "Faz faculdade", "Enfermeira", "Professora", "Trabalha no comércio", "Designer", "Advogada"];

const POSICOES: Posicao[] = ["ZAG", "LAT", "VOL", "MEI", "PON", "ATA"];

// ------------------------------------------------------------------ sorteio
export interface DadosFamilia { semente: string; nome: string; pais: string; origem: string; idade: number; ano: number }
const sobrenomeDe = (nome: string) => { const p = nome.trim().split(/\s+/); return p.length > 1 ? p[p.length - 1] : ""; };

/** A família da carreira (sorteada uma vez; saves antigos ganham na primeira semana). */
export function gerarFamilia(pacote: PacoteDados, d: DadosFamilia): EstadoFamilia {
  const rng = new RNG(`${d.semente}|familia`), lingua = LINGUA[d.pais] ?? "pt", [hom, mul] = NOMES[lingua];
  const sob = sobrenomeDe(d.nome), comSob = (n: string) => (sob ? `${n} ${sob}` : n);
  const origem = PROF_PAI[d.origem] ? d.origem : "media";
  const usados = new Set<string>([d.nome.split(" ")[0]]);
  const nomeNovo = (lista: string[]) => { for (let t = 0; t < 20; t++) { const n = rng.pick(lista); if (!usados.has(n)) { usados.add(n); return n; } } return rng.pick(lista); };
  const membros: Familiar[] = [];
  const idadePai = d.idade + rng.int(24, 38), idadeMae = Math.max(d.idade + 18, idadePai + rng.int(-6, 2));
  // pai com passado no futebol: treinador de várzea/escolinha/base ou ex-jogador
  const r = rng.next(), traco: TracoFamilia | undefined = r < 0.16 ? "treinador" : r < 0.27 ? "exJogador" : undefined;
  membros.push({ id: "pai", parentesco: "pai", nome: comSob(nomeNovo(hom)), nasc: d.ano - idadePai, relacao: rng.int(55, 75), contato: 0,
    profissao: traco === "treinador" ? (origem === "rica" ? "Treinador da base de um clube" : "Treinador de escolinha") : traco === "exJogador" ? "Ex-jogador, hoje comentarista na rádio" : rng.pick(PROF_PAI[origem]), ...(traco ? { traco } : {}) });
  membros.push({ id: "mae", parentesco: "mae", nome: comSob(nomeNovo(mul)), nasc: d.ano - idadeMae, relacao: rng.int(62, 82), contato: 0, profissao: rng.pick(PROF_MAE[origem]) });
  // irmãos: 0 (30%), 1 (45%) ou 2 (25%)
  const nIrm = rng.chance(0.3) ? 0 : rng.chance(0.64) ? 1 : 2;
  for (let i = 0; i < nIrm; i++) {
    const velho = rng.chance(0.5), homem = rng.chance(0.55), dif = rng.int(1, 7);
    const idade = Math.max(3, velho ? d.idade + dif : d.idade - dif);
    const m: Familiar = { id: `irm${i}`, parentesco: homem ? "irmao" : "irma", nome: comSob(nomeNovo(homem ? hom : mul)), nasc: d.ano - idade, relacao: rng.int(50, 80), contato: 0,
      profissao: idade < 15 ? "Estudante" : rng.pick(homem ? PROF_IRMAO : PROF_IRMA) };
    if (homem && velho && idade >= 18 && rng.chance(0.32)) {
      // irmão mais velho jogador profissional: existe num elenco do mundo, de divisão compatível
      const ovr = Math.round(clamp(rng.normal(60, 6) + (idade >= 24 ? 3 : 0), 50, 76));
      m.futebol = { fase: "pro", posicao: rng.pick(POSICOES), ovr, pot: Math.max(ovr, ovr + rng.int(0, 6)), clubeId: clubePara(pacote, rng, ovr, d.pais) };
      m.profissao = "Jogador profissional";
    } else if (homem && !velho && rng.chance(0.62)) {
      const pot = Math.round(clamp(rng.normal(67, 8), 50, 90));
      m.futebol = { fase: idade >= 10 ? "amador" : "crianca", posicao: rng.pick(POSICOES), pot, ovr: ovrNaIdade(pot, idade) };
    }
    membros.push(m);
  }
  return { membros, semana: -1, feitas: [] };
}
const ovrNaIdade = (pot: number, idade: number) => Math.round(clamp(pot - Math.max(0, 22 - idade) * 3.4, 20, pot));

/** Clube para um irmão profissional: força perto do OVR, de preferência no país da família. */
function clubePara(pacote: PacoteDados, rng: RNG, ovr: number, pais: string, exceto?: string): string | undefined {
  const w = mundo(pacote);
  const todos = w.ligas.flatMap((l) => l.clubes.map((c) => ({ c, pais: infoLiga(l.id).pais })));
  const doPais = todos.filter((x) => x.pais === pais && x.c.id !== exceto);
  const pool = (doPais.length >= 8 ? doPais : todos).filter((x) => x.c.id !== exceto).sort((a, b) => Math.abs(a.c.forca - ovr) - Math.abs(b.c.forca - ovr)).slice(0, 10);
  return pool.length ? rng.pick(pool).c.id : undefined;
}

// ------------------------------------------------------------------ consultas
export const idadeDe = (m: Familiar, ano: number) => ano - m.nasc;
export const membro = (f: EstadoFamilia, id: string) => f.membros.find((m) => m.id === id);
export const pais = (f: EstadoFamilia) => f.membros.filter((m) => m.parentesco === "pai" || m.parentesco === "mae");
export const rotuloRelacaoFam = (n: number) => (n >= 80 ? "Muito próximos" : n >= 60 ? "Próximos" : n >= 40 ? "Tranquilo" : n >= 20 ? "Distantes" : "Brigados");
/** "Irmão mais velho", "Irmã mais nova"... */
export function parentescoCompleto(m: Familiar, idadeJogador: number, ano: number): string {
  if (m.parentesco === "pai" || m.parentesco === "mae") return NOME_PARENTESCO[m.parentesco];
  const velho = idadeDe(m, ano) > idadeJogador, f = m.parentesco === "irma";
  return `${NOME_PARENTESCO[m.parentesco]} mais ${velho ? (f ? "velha" : "velho") : f ? "nova" : "novo"}`;
}
/** Pai treinador e bem com o filho: treino rende mais e o olheiro escuta. */
export const paiTreinador = (f: EstadoFamilia | undefined) => { const p = f && membro(f, "pai"); return !!p && p.traco === "treinador" && p.relacao >= 45; };
/** Pai ex-jogador como agente: conhece gente e negocia melhor. */
export const paiExJogador = (f: EstadoFamilia | undefined) => { const p = f && membro(f, "pai"); return !!p && p.traco === "exJogador" && p.relacao >= 45; };
/** Irmão que joga no mesmo clube que você. */
export const irmaoNoClube = (f: EstadoFamilia | undefined, clubeId: string) => f?.membros.find((m) => m.futebol?.fase === "pro" && m.futebol.clubeId === clubeId);

// ------------------------------------------------------------------ ações (até 2 por semana)
export interface CtxFamilia {
  semanaAbs: number; ano: number; idadeJogador: number; exterior: boolean; salario: number; saldo: number;
  /** o jogador tem clube (não está na várzea/colégio) e é profissional */
  profissional: boolean; clubeId: string; forcaClube: number; relTecnico: number; fama: number;
  /** jogo em casa nesta semana (dá para levar a família) */
  jogoEmCasa: boolean; janela: boolean; temporada: number;
}
export interface ResultadoAcaoFam { ok: boolean; msg: string; custo?: number; moral?: number; cansaco?: number; indicacaoClube?: string }

export function acoesDe(m: Familiar, ctx: CtxFamilia): AcaoFamilia[] {
  const a: AcaoFamilia[] = ["ligar", ctx.exterior ? "visitar" : "visitar", "presente"];
  if (ctx.jogoEmCasa) a.push("jogo");
  if (m.traco || m.futebol?.fase === "pro") a.push("conselho");
  const fb = m.futebol, idade = idadeDe(m, ctx.ano);
  if (fb && (fb.fase === "amador" || fb.fase === "crianca") && idade >= 14 && idade <= 17 && ctx.profissional && fb.indicado !== ctx.temporada) a.push("indicarBase");
  if (fb?.fase === "pro" && fb.clubeId && fb.clubeId !== ctx.clubeId && m.relacao >= 60 && ctx.janela && ctx.profissional) a.push("pedirIndicacao");
  return a;
}

export function podeAgirFam(f: EstadoFamilia, semanaAbs: number): string | undefined {
  if (f.semana !== semanaAbs) { f.semana = semanaAbs; f.feitas = []; }
  return f.feitas.length >= MAX_ACOES_FAMILIA ? `Já falou com a família ${MAX_ACOES_FAMILIA} vezes nesta semana.` : undefined;
}

export function agirFamilia(f: EstadoFamilia, id: string, acao: AcaoFamilia, ctx: CtxFamilia, rng: RNG): ResultadoAcaoFam {
  const m = membro(f, id);
  if (!m) return { ok: false, msg: "Familiar não encontrado." };
  const bloqueio = podeAgirFam(f, ctx.semanaAbs);
  if (bloqueio) return { ok: false, msg: bloqueio };
  if (!acoesDe(m, ctx).includes(acao)) return { ok: false, msg: "Agora não dá." };
  const primeiro = m.nome.split(" ")[0];
  const feito = (v: number, msg: string, extra: Partial<ResultadoAcaoFam> = {}): ResultadoAcaoFam => {
    m.relacao = clamp(m.relacao + v, 0, 100); m.contato = ctx.semanaAbs; f.feitas.push(id);
    return { ok: true, msg: `${msg} (${rotuloRelacaoFam(m.relacao).toLowerCase()} · ${Math.round(m.relacao)})`, ...extra };
  };
  switch (acao) {
    case "ligar": return feito(4, `Você ligou para ${primeiro}.`, { moral: 1 });
    case "visitar": {
      if (!ctx.exterior) return feito(8, `Almoço de domingo com ${primeiro}.`, { moral: 2, cansaco: 4 });
      const custo = 6000;
      if (ctx.saldo < custo) return { ok: false, msg: "A passagem está cara demais para agora." };
      return feito(11, `Você pegou um voo para ver ${primeiro}: R$ ${custo.toLocaleString("pt-BR")}.`, { custo, moral: 3, cansaco: 10 });
    }
    case "presente": {
      const custo = Math.round(Math.max(400, ctx.salario * 0.03));
      if (ctx.saldo < custo) return { ok: false, msg: "Dinheiro curto para presente." };
      return feito(6, `Presente para ${primeiro}: R$ ${custo.toLocaleString("pt-BR")}.`, { custo });
    }
    case "jogo": return feito(7, `${primeiro} vai estar na arquibancada no jogo desta semana.`, { moral: 2 });
    case "conselho": {
      const quem = m.traco === "treinador" ? "o olho de treinador" : m.traco === "exJogador" ? "quem já viveu isso" : "o irmão que joga";
      return feito(3, `Conversa longa com ${primeiro}, ${quem}. Você saiu mais leve.`, { moral: 3 });
    }
    case "indicarBase": {
      const fb = m.futebol!;
      fb.indicado = ctx.temporada;
      const chance = clamp((fb.pot - 55) / 32 + (ctx.relTecnico - 50) / 200 + ctx.fama / 400, 0.05, 0.9);
      if (!rng.chance(chance)) return feito(3, `O clube olhou ${primeiro} num treino, mas não ficou com ele agora. Dá para tentar de novo na próxima temporada.`);
      fb.fase = "base"; fb.clubeId = ctx.clubeId;
      return feito(10, `${primeiro} passou no teste e entrou na base do seu clube!`, { moral: 4 });
    }
    case "pedirIndicacao": {
      const fb = m.futebol!;
      if (!rng.chance(clamp((m.relacao - 50) / 50 + 0.15, 0.1, 0.8))) return feito(1, `${primeiro} falou de você no clube dele, mas não abriram vaga agora.`);
      return feito(2, `${primeiro} te indicou no clube dele.`, { indicacaoClube: fb.clubeId });
    }
  }
}

// ------------------------------------------------------------------ semana e temporada
export interface CtxSemanaFam { semanaAbs: number; exterior: boolean; padraoFamilia: number; polemica: boolean; clubeId: string }
/** Relações andam sozinhas: a mesada aproxima, a distância e o sumiço afastam. Devolve o efeito na moral do jogador. */
export function semanaFamilia(f: EstadoFamilia, ctx: CtxSemanaFam): { moral: number; avisos: string[] } {
  const avisos: string[] = [];
  for (const m of f.membros) {
    const longe = ctx.semanaAbs - m.contato;
    let d = 0;
    if (m.parentesco === "pai" || m.parentesco === "mae") d += [-0.25, 0.25, 0.6][ctx.padraoFamilia] ?? 0;
    if (longe > 4) d -= ctx.exterior ? 0.9 : 0.45;
    if (ctx.polemica && m.parentesco === "mae") d -= 4;
    if (m.futebol?.fase === "pro" && m.futebol.clubeId === ctx.clubeId) d += 0.6; // jogam juntos
    const antes = m.relacao;
    m.relacao = clamp(m.relacao + d, 0, 100);
    if (antes >= 40 && m.relacao < 40) avisos.push(`${m.nome.split(" ")[0]} anda chateado com a falta de notícias.`);
  }
  const ps = pais(f), media = ps.reduce((a, m) => a + m.relacao, 0) / Math.max(1, ps.length);
  return { moral: (media - 55) / 12 + (irmaoNoClube(f, ctx.clubeId) ? 1 : 0), avisos };
}

/** Fim da temporada: os irmãos que jogam evoluem, trocam de clube, sobem da base ou largam. */
export function temporadaFamilia(pacote: PacoteDados, f: EstadoFamilia, rng: RNG, ano: number, pais: string, eventos: string[]): void {
  const w = mundo(pacote);
  for (const m of f.membros) {
    const fb = m.futebol, idade = idadeDe(m, ano), nome = m.nome.split(" ")[0];
    if (!fb) continue;
    if (fb.fase === "crianca" && idade >= 10) fb.fase = "amador";
    if (fb.fase === "amador" || fb.fase === "base") {
      fb.ovr = Math.round(clamp(Math.max(fb.ovr + (fb.fase === "base" ? 3 : 1.5), ovrNaIdade(fb.pot, idade) - (fb.fase === "base" ? 0 : 4)), 20, fb.pot));
      if (fb.fase === "amador" && idade >= 20) { fb.fase = "parou"; m.profissao = rng.pick(PROF_IRMAO); }
    }
    if (fb.fase === "base" && idade >= 18) {
      const clube = fb.clubeId ? w.clube[fb.clubeId] : undefined;
      if (clube && fb.ovr >= clube.forca - 14) { fb.fase = "pro"; m.profissao = "Jogador profissional"; eventos.push(`${nome} assinou o primeiro contrato profissional com o ${infoClube(pacote, clube.id).nome}!`); }
      else { fb.fase = "amador"; fb.clubeId = undefined; eventos.push(`${nome} foi dispensado da base. Ele diz que não vai desistir.`); }
    } else if (fb.fase === "pro") {
      fb.ovr = Math.round(clamp(fb.ovr + (idade < 25 ? rng.int(0, 3) : idade <= 29 ? rng.int(-1, 1) : -rng.int(1, 3)), 40, Math.max(fb.pot, fb.ovr)));
      if (idade >= 35 || fb.ovr < 48) { fb.fase = "parou"; fb.clubeId = undefined; m.profissao = "Ex-jogador"; eventos.push(`${nome} pendurou as chuteiras.`); }
      else if (rng.chance(0.22)) {
        const novo = clubePara(pacote, rng, fb.ovr, pais, fb.clubeId);
        if (novo) { fb.clubeId = novo; eventos.push(`${nome} trocou de clube: agora joga no ${infoClube(pacote, novo).nome}.`); }
      }
    }
  }
}

/** Política automática: liga para quem está mais longe. */
export function familiaAutomatica(f: EstadoFamilia, ctx: CtxFamilia, rng: RNG): void {
  const alvo = [...f.membros].sort((a, b) => a.relacao - b.relacao)[0];
  if (alvo) agirFamilia(f, alvo.id, "ligar", ctx, rng);
  const novo = f.membros.find((m) => acoesDe(m, ctx).includes("indicarBase"));
  if (novo) agirFamilia(f, novo.id, "indicarBase", ctx, rng);
}
