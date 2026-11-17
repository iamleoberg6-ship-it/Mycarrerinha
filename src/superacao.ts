// Esticar o potencial do seu jogador: o potencial do começo não é uma sentença. Três caminhos:
// 1) Projeto de superação (um por vez): treino extra, preparador particular, psicólogo do esporte, estudo de vídeo e
//    tática, ou mentoria com um veterano do clube. Cada semana enche uma barra; cada etapa completa sobe o potencial.
// 2) Superar-se em campo: temporada com nota alta (ou prêmio) também sobe o potencial.
// 3) Quem floresce tarde ganha potencial naturalmente entre os 23 e os 27.
// Tem limite: no máximo +10 de potencial por trabalho na carreira, e só até uma idade (que depende da curva dele).
import { clamp } from "./rng.js";
import { curvaDe, idadeLimiteSuperacao, fSuperacaoCurva, potTardio, type Curva } from "./curvas.js";

export type Projeto = "extra" | "personal" | "psicologo" | "video" | "mentor";
export const PROJETOS: { id: Projeto; nome: string; texto: string; custoSemana: (salario: number) => number; taxa: number }[] = [
  { id: "extra", nome: "Treino extra depois do treino", texto: "Fica uma hora a mais todo dia. Não custa nada, mas cansa (mais cansaço toda semana). Rende mais com 2 ou mais treinos no plano.", custoSemana: () => 0, taxa: 1 },
  { id: "personal", nome: "Preparador particular", texto: "Um profissional só seu, com plano individual. Custa por semana, rende bem e sem cansaço a mais.", custoSemana: (sal) => Math.max(1500, Math.round(sal * 0.06 / 100) * 100), taxa: 1.3 },
  { id: "psicologo", nome: "Psicólogo do esporte", texto: "Trabalha confiança e pressão. Custa por semana; além do potencial, a moral sobe e a pressão cai.", custoSemana: (sal) => Math.max(800, Math.round(sal * 0.035 / 100) * 100), taxa: 0.9 },
  { id: "video", nome: "Estudo de vídeo e tática", texto: "Com o auxiliar, estuda seus jogos e os adversários. Grátis; rende mais com a ação de vídeo no plano.", custoSemana: () => 0, taxa: 0.85 },
  { id: "mentor", nome: "Mentoria com um veterano", texto: "Um veterano do clube te orienta (ele precisa aceitar). Grátis e rende bem; acaba se ele ou você mudar de clube.", custoSemana: () => 0, taxa: 1.25 },
];
export interface Superacao {
  projeto?: Projeto; progresso: number; etapas: number; /** potencial ganho com trabalho e em campo (limite de 10) */ ganho: number;
  mentor?: { nome: string; clubeId: string }; recusou?: string[]; hist: { ano: number; texto: string }[]; tardio?: number;
}
export const LIMITE_GANHO = 10;
export const superacaoDe = (c: { superacao?: Superacao }): Superacao => (c.superacao ??= { progresso: 0, etapas: 0, ganho: 0, hist: [] });
export const curvaDoJogador = (j: { curva?: Curva; nome: string }, semente: string): Curva => (j.curva ??= curvaDe(`${j.nome}|${semente}`));
/** Pontos de uma etapa (cada etapa pede um pouco mais que a anterior). */
export const metaEtapa = (etapas: number) => Math.round(100 * (1 + 0.25 * etapas));
export function podeEsticar(sup: Superacao, idade: number, curva: Curva): { ok: boolean; motivo?: string } {
  if (sup.ganho >= LIMITE_GANHO) return { ok: false, motivo: "Você já esticou o potencial o máximo que dá com trabalho (+10)." };
  if (idade > idadeLimiteSuperacao(curva)) return { ok: false, motivo: `Com ${idade} anos, o trabalho mantém o nível, mas já não sobe o potencial.` };
  return { ok: true };
}
/** Uma semana de projeto: devolve o que mudou (o jogo aplica dinheiro, cansaço, moral e o potencial). */
export function semanaSuperacao(sup: Superacao, ctx: { idade: number; curva: Curva; prof: number; treinos: number; video: boolean; salario: number; saldo: number; clubeId: string; ano: number }): { custo: number; cansaco: number; moral: number; pressao: number; subiu: number; avisos: string[] } {
  const out = { custo: 0, cansaco: 0, moral: 0, pressao: 0, subiu: 0, avisos: [] as string[] };
  const p = PROJETOS.find((x) => x.id === sup.projeto);
  if (!p) return out;
  if (p.id === "mentor" && (!sup.mentor || sup.mentor.clubeId !== ctx.clubeId)) { sup.projeto = undefined; sup.mentor = undefined; out.avisos.push("A mentoria acabou: vocês não estão mais no mesmo clube."); return out; }
  const custo = p.custoSemana(ctx.salario);
  if (custo > ctx.saldo) { out.avisos.push(`Sem dinheiro para pagar ${p.nome.toLowerCase()} nesta semana: o projeto ficou parado.`); return out; }
  out.custo = custo;
  const idade = ctx.idade <= 21 ? 1.2 : ctx.idade <= 25 ? 1 : ctx.idade <= 29 ? 0.8 : 0.55;
  const extra = p.id === "extra" ? (ctx.treinos >= 2 ? 1.15 : 0.8) : p.id === "video" ? (ctx.video ? 1.2 : 0.75) : 1;
  const ganho = 8 * p.taxa * idade * extra * (0.7 + ctx.prof / 33) * fSuperacaoCurva(ctx.curva, ctx.idade);
  if (p.id === "extra") out.cansaco = 6;
  if (p.id === "psicologo") { out.moral = 1.5; out.pressao = -2; }
  const pode = podeEsticar(sup, ctx.idade, ctx.curva);
  if (!pode.ok) return out;
  sup.progresso += ganho;
  const meta = metaEtapa(sup.etapas);
  if (sup.progresso >= meta) {
    sup.progresso -= meta; sup.etapas++;
    out.subiu = Math.min(LIMITE_GANHO - sup.ganho, ctx.idade <= 21 ? 2 : 1); sup.ganho += out.subiu;
    sup.hist.unshift({ ano: ctx.ano, texto: `${p.nome}: potencial +${out.subiu}` });
    out.avisos.push(`📈 O trabalho deu resultado (${p.nome.toLowerCase()}): seu potencial subiu ${out.subiu}.`);
  }
  return out;
}
/** Fim de temporada: superar-se em campo e o potencial que aparece em quem floresce tarde. */
export function viradaSuperacao(sup: Superacao, ctx: { idade: number; curva: Curva; jogos: number; media: number; premios: number; ano: number; sorte: number }): { subiu: number; avisos: string[] } {
  let subiu = 0; const av: string[] = [];
  if (podeEsticar(sup, ctx.idade, ctx.curva).ok && ((ctx.jogos >= 15 && ctx.media >= 7.2) || ctx.premios > 0)) {
    const n = Math.min(LIMITE_GANHO - sup.ganho, ctx.media >= 7.6 || ctx.premios > 1 ? 2 : 1);
    if (n > 0) { sup.ganho += n; subiu += n; sup.hist.unshift({ ano: ctx.ano, texto: `Temporada acima do esperado: potencial +${n}` }); av.push(`📈 Você foi além do que se esperava nesta temporada: potencial +${n}.`); }
  }
  const t = potTardio(ctx.curva, ctx.idade, ctx.sorte);
  if (t) { subiu += t; sup.tardio = (sup.tardio ?? 0) + t; sup.hist.unshift({ ano: ctx.ano, texto: `Floresceu: potencial +${t}` }); av.push(`🌱 Você é dos que florescem tarde: o potencial subiu ${t} nesta virada.`); }
  return { subiu, avisos: av };
}
/** Aplica a subida no potencial e na faixa que os olheiros enxergam. */
export function subirPotencial(j: { pot: number; faixaPot: [number, number] }, n: number) {
  if (!n) return;
  j.pot = clamp(j.pot + n, 30, 99);
  j.faixaPot = [clamp(j.faixaPot[0] + n, 30, 99), clamp(j.faixaPot[1] + n, 30, 99)];
}
/** Pedir a um veterano para ser seu mentor: aceita mais quem é do seu país, quando você tem fama e boa relação com o técnico. */
export function pedirMentor(sup: Superacao, v: { nome: string; clubeId: string; idade: number; nac: string }, ctx: { nac: string; fama: number; relTecnico: number; sorte: number }): { ok: boolean; msg: string } {
  if ((sup.recusou ?? []).includes(v.nome)) return { ok: false, msg: `${v.nome} já disse não nesta temporada.` };
  const chance = clamp(0.35 + (v.nac === ctx.nac ? 0.2 : 0) + ctx.fama / 250 + (ctx.relTecnico - 50) / 200 + (v.idade >= 32 ? 0.1 : 0), 0.15, 0.9);
  if (ctx.sorte > chance) { (sup.recusou ??= []).push(v.nome); return { ok: false, msg: `${v.nome} disse que está focado na própria temporada. Tente outro veterano.` }; }
  sup.mentor = { nome: v.nome, clubeId: v.clubeId }; sup.projeto = "mentor";
  return { ok: true, msg: `${v.nome} topou ser seu mentor. A mentoria é o seu projeto de superação agora.` };
}
