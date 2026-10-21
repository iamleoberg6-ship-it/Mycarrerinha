// A carreira jogável, semana a semana. Tudo que o jogo precisa guardar fica num Save (JSON).
// Cada sorteio usa uma semente derivada do save + semana, então recarregar a página não muda resultados.
import { RNG, clamp } from "./rng.js";
import { ATRIBUTOS, ovr as calcOvr, evoluirSemana, type Atributo, type Atributos, type Grupo, type Intensidade, type Participacao, type Posicao } from "./atributos.js";
import { simularPlacar, desempenhoJogador, sortearLesao, pontuacaoTitular, VAGAS_433 } from "./partida.js";
import { ligaDoPacote, tabelaTurnoReturno, novaTabela, registrar, ordenar, type Clube, type Liga, type LinhaTabela, type PacoteDados } from "./liga.js";
import { salarioMensal, AGENTES, seguidoresDaFama, type TipoAgente } from "./mercado.js";
import type { PersonalidadeDNA, ResultadoCriacao, TracoId } from "./dna.js";
import { definirPerfil, type Efeitos as EfeitosPerfil } from "./perfil.js";
import { SITUACAO, COMEMORACAO, POS_JOGO, MEMORIA_RECENTE, contextoPadrao, escolherSituacao, montarDecisao, resolverEfeito, habilidade, sortearNivel, notaEsperada, type Contexto, type Efeito, type Memoria, type Nivel } from "./lances.js";
import { elencoDe, nomesDaPartida, narrarGol, narrarPartida, type LinhaNarracao } from "./narracao.js";
import { reliquiasDaPartida, premiosDaTemporada, type Ganho } from "./reliquias.js";
import { ganharReliquia, novoEstado, fecharMes, efeitosDaCasa, alojamentosDoClube, estruturaDoClube, ESTRUTURAS, IMOVEL, nomeImovel, type EstadoCasa, type ClubeCasa } from "./casa.js";

// ------------------------------------------------------------------ tipos
export interface Jogador {
  nome: string; apelido: string; posicao: Posicao; pais: string; nacionalidade: string; idade: number;
  at: Atributos; pot: number; faixaPot: [number, number]; personalidade: PersonalidadeDNA; tracos: TracoId[];
  perfilId: string; perfilNome: string; aparencia: unknown; numero: string; familia: string;
}
export interface Stats { jogos: number; titular: number; gols: number; assist: number; notas: number[]; base: number; baseGols: number; baseNotas?: number[] }
export interface ResumoTemporada { ano: number; idade: number; clube: string; ovr: number; jogos: number; gols: number; assist: number; nota: number; posicao: number; titulo: boolean; base: number; baseGols?: number; premios?: string[] }
export interface Noticia { semana: string; titulo: string; texto: string; tipo: "jogo" | "clube" | "vida" | "dinheiro" | "polemica" | "lesao" }
export interface Carreira {
  clubeId: string; salario: number; anosContrato: number; formacao: boolean; agente: TipoAgente;
  moral: number; fama: number; seguidores: number; cansaco: number; lesao: number; relTecnico: number; formaUlt: number[];
  suspensao?: number;
  /** lances já vividos: os recentes aparecem menos, os inéditos mais */
  memoria?: Memoria;
  /** jogos como profissional por clube (camisa de cada clube) */
  jogosPorClube?: Record<string, number>;
  bonusEvolucao: number; patrocinioMensal: number; mesesPatrocinio: number; pressao: number; vidaNoturna: number; exposicao: number;
  temporada: number; semana: number; ordem: string[]; tabela: LinhaTabela[]; stats: Stats; historico: ResumoTemporada[];
}
export interface Save { versao: 1; semente: string; jogador: Jogador; carreira: Carreira; casa: EstadoCasa; noticias: Noticia[] }

export const ANO_INICIAL = 2026;
export const SEMANAS_PRE = 2, RODADAS = 38, SEMANAS_TEMPORADA = SEMANAS_PRE + RODADAS;
const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

// ------------------------------------------------------------------ mundo (liga e clubes)
/** Clássicos entre cidades diferentes (os da mesma cidade já contam sozinhos). */
const CLASSICOS_EXTRA: Record<string, true> = { "PAL-SAN": true, "COR-SAN": true, "SAN-SPA": true };
let ligaCache: { pacote: PacoteDados; liga: Liga } | undefined;
export function liga(pacote: PacoteDados): Liga {
  if (!ligaCache || ligaCache.pacote !== pacote) ligaCache = { pacote, liga: ligaDoPacote(pacote) };
  return ligaCache.liga;
}
export const clubeDe = (l: Liga, id: string) => l.clubes.find((c) => c.id === id)!;
export function clubeCasa(pacote: PacoteDados, id: string): ClubeCasa {
  const c = (pacote.clubes as unknown as { id: string; nome: string; apelido: string; cores: string[]; forca: number }[]).find((x) => x.id === id)!;
  return { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca };
}
const rngDe = (s: Save, ...partes: (string | number)[]) => new RNG(`${s.semente}|${s.carreira.temporada}|${s.carreira.semana}|${partes.join("|")}`);
export const ovr = (j: Jogador) => calcOvr(j.at, j.posicao);
export const forma = (c: Carreira) => (c.formaUlt.length ? c.formaUlt.reduce((a, b) => a + b, 0) / c.formaUlt.length : 6.5);

// ------------------------------------------------------------------ início
export interface DadosCriacao { resultado: ResultadoCriacao; aparencia: unknown; clube: string | null; perfil?: string; decisao?: string | null }
export interface OfertaBase { clubeId: string; nome: string; apelido: string; cores: string[]; forca: number; estrutura: number; nomeEstrutura: string; moradia: string; fila: number; texto: string }

/** Três clubes oferecem vaga na base. Promessa de clube grande recebe convites dos grandes; os outros, de clubes menores. */
export function ofertasDeBase(pacote: PacoteDados, d: DadosCriacao): OfertaBase[] {
  const l = liga(pacote), perfil = definirPerfil(d.resultado), rng = new RNG(`ofertas|${d.resultado.escolhas.nome}|${d.resultado.potencial}`);
  const min = perfil.efeitos.forcaMinimaClubeInicial;
  const casas = (pacote.clubes as unknown as { id: string; forca: number }[]);
  const forcaPacote = (id: string) => casas.find((c) => c.id === id)!.forca;
  let pool = l.clubes.filter((c) => (min ? forcaPacote(c.id) >= min : forcaPacote(c.id) <= 72));
  if (pool.length < 3) pool = [...l.clubes];
  const escolhidos: Clube[] = [];
  const coracao = l.clubes.find((c) => c.id === d.clube);
  if (coracao && pool.includes(coracao)) escolhidos.push(coracao);
  while (escolhidos.length < 3) { const c = rng.pick(pool); if (!escolhidos.includes(c)) escolhidos.push(c); }
  return escolhidos.map((c) => {
    const cc = clubeCasa(pacote, c.id), est = estruturaDoClube(cc), alojId = alojamentosDoClube(cc)[0], aloj = { nome: nomeImovel(novoEstado(0, alojId, cc), IMOVEL[alojId]) };
    const fila = c.elenco.filter((j) => j.posicao === d.resultado.escolhas.posicao).length;
    const texto = c.id === d.clube ? "O clube do seu coração abriu as portas." : est >= 4 ? "Estrutura de primeiro mundo, mas a fila para subir é longa." : est === 1 ? "Clube pobre: a moradia é apertada, mas a chance de jogar no profissional chega cedo." : est === 2 ? "Clube modesto: pouco conforto, caminho mais curto até o profissional." : "Clube organizado, meio do caminho.";
    return { clubeId: c.id, nome: c.nome, apelido: cc.apelido, cores: cc.cores, forca: Math.round(cc.forca), estrutura: est, nomeEstrutura: ESTRUTURAS[est], moradia: aloj.nome, fila, texto };
  });
}

export function novoJogo(pacote: PacoteDados, d: DadosCriacao, clubeId: string, sementeFixa?: string): Save {
  const r = d.resultado, e = r.escolhas, perfil = definirPerfil(r);
  const ef: EfeitosPerfil = { ...perfil.efeitos };
  const dec = perfil.evento?.opcoes.find((o) => o.id === d.decisao);
  if (dec) for (const [k, v] of Object.entries(dec.efeitos)) {
    const chave = k as keyof EfeitosPerfil;
    if (typeof v === "number") (ef as Record<string, unknown>)[chave] = ((ef[chave] as number | undefined) ?? 0) + v; else (ef as Record<string, unknown>)[chave] = v;
  }
  const pers = { ...r.personalidade, profissionalismo: clamp(r.personalidade.profissionalismo + (ef.profissionalismo ?? 0), 1, 20) };
  const semente = sementeFixa ?? `${e.nome}|${r.potencial}|${Date.now() % 100000}`;
  const l = liga(pacote), rng = new RNG(semente);
  const jogador: Jogador = {
    nome: e.nome, apelido: e.apelido || e.nome.split(" ")[0], posicao: e.posicao, pais: e.pais, nacionalidade: r.nacionalidade, idade: 16,
    at: { ...r.atributos }, pot: r.potencial, faixaPot: r.faixaPotencial, personalidade: pers, tracos: r.tracos, perfilId: perfil.id, perfilNome: perfil.nome,
    aparencia: d.aparencia, numero: String(rng.int(26, 49)), familia: e.familia,
  };
  const ordem = l.clubes.map((c) => c.id);
  for (let i = ordem.length - 1; i > 0; i--) { const j = rng.int(0, i); [ordem[i], ordem[j]] = [ordem[j], ordem[i]]; }
  const fama = ef.fama ?? 0;
  const carreira: Carreira = {
    clubeId, salario: 3000, anosContrato: 2, formacao: true, agente: ef.agente ?? "pai",
    moral: 62, fama, seguidores: Math.round((ef.seguidores ?? 0) + 300), cansaco: 0, lesao: 0, relTecnico: clamp(50 + (ef.relTecnico ?? 0), 0, 100), formaUlt: [],
    bonusEvolucao: ef.bonusEvolucao ?? 0, patrocinioMensal: ef.patrocinioMensal ?? 0, mesesPatrocinio: ef.mesesPatrocinio ?? 0, pressao: ef.pressao ?? 0,
    vidaNoturna: r.vidaNoturnaInicial + (ef.vidaNoturna ?? 0), exposicao: ef.exposicao ?? 0,
    temporada: 0, semana: 0, ordem, tabela: novaTabela(l), stats: statsVazias(), historico: [],
  };
  const cc = clubeCasa(pacote, clubeId);
  const casa = novoEstado(r.dinheiroInicial, alojamentosDoClube(cc)[0], cc);
  const save: Save = { versao: 1, semente, jogador, carreira, casa, noticias: [] };
  const c = clubeDe(l, clubeId);
  noticia(save, "clube", `Bem-vindo ao ${c.nome}`, `${jogador.apelido} assina com a base do ${c.nome}. Mora em: ${nomeImovel(casa, IMOVEL[casa.imovel])}. Ajuda de custo de R$ 3.000 por mês.`);
  if (perfil.evento) noticia(save, "vida", perfil.evento.titulo, dec ? dec.resultado : perfil.evento.texto);
  return save;
}
const statsVazias = (): Stats => ({ jogos: 0, titular: 0, gols: 0, assist: 0, notas: [], base: 0, baseGols: 0 });

export function rotuloSemana(c: Carreira): string {
  const ano = ANO_INICIAL + c.temporada;
  return c.semana < SEMANAS_PRE ? `Pré-temporada ${ano} · semana ${c.semana + 1}` : `Temporada ${ano} · rodada ${c.semana - SEMANAS_PRE + 1}`;
}
function noticia(s: Save, tipo: Noticia["tipo"], titulo: string, texto: string) {
  s.noticias.unshift({ semana: rotuloSemana(s.carreira), titulo, texto, tipo });
  s.noticias = s.noticias.slice(0, 60);
}

// ------------------------------------------------------------------ calendário
export interface Jogo { casa: string; fora: string }
export function jogosDaRodada(c: Carreira, rodada: number): Jogo[] {
  return tabelaTurnoReturno(c.ordem.length)[rodada].map(([a, b]) => ({ casa: c.ordem[a], fora: c.ordem[b] }));
}
export function jogoDaSemana(s: Save): (Jogo & { rodada: number; souCasa: boolean; adversario: string }) | undefined {
  const c = s.carreira;
  if (c.semana < SEMANAS_PRE) return;
  const r = c.semana - SEMANAS_PRE, j = jogosDaRodada(c, r).find((x) => x.casa === c.clubeId || x.fora === c.clubeId)!;
  return { ...j, rodada: r, souCasa: j.casa === c.clubeId, adversario: j.casa === c.clubeId ? j.fora : j.casa };
}

// ------------------------------------------------------------------ escalação
export type Escalacao = "titular" | "banco" | "base" | "fora" | "lesionado" | "semJogo" | "suspenso";
export const NOME_ESCALACAO: Record<Escalacao, string> = {
  titular: "Titular", banco: "No banco", base: "Jogo da base", fora: "Fora dos relacionados", lesionado: "Lesionado", semJogo: "Sem jogo", suspenso: "Suspenso",
};
export function escalacao(pacote: PacoteDados, s: Save, cansacoPrevisto = s.carreira.cansaco): Escalacao {
  const c = s.carreira, j = s.jogador;
  if (c.lesao > 0) return "lesionado";
  if (c.semana < SEMANAS_PRE) return "semJogo";
  if (c.suspensao) return "suspenso";
  const clube = clubeDe(liga(pacote), c.clubeId);
  const meu = pontuacaoTitular(ovr(j), forma(c), c.relTecnico, cansacoPrevisto);
  const rank = clube.elenco.filter((x) => x.posicao === j.posicao).filter((x) => pontuacaoTitular(x.ovr, 6.5, 50, 0) > meu).length;
  const vagas = VAGAS_433[j.posicao];
  if (rank < vagas) return "titular";
  if (rank <= vagas + 1) return "banco";
  if (j.idade <= 19) {
    // garoto da base em grande fase ganha chance de ficar no banco do profissional
    if (forma(c) >= 7.4 && c.relTecnico >= 65 && rngDe(s, "relacionado").chance(0.35)) return "banco";
    return "base";
  }
  return "fora";
}

// ------------------------------------------------------------------ plano da semana
export type Acao = "treino" | "descanso" | "familia" | "amigos" | "redes" | "video";
export const ACOES: Record<Acao, { nome: string; efeito: string }> = {
  treino: { nome: "Treino extra", efeito: "+10% de evolução, +10 de cansaço" },
  descanso: { nome: "Descanso", efeito: "−15 de cansaço" },
  familia: { nome: "Família", efeito: "+2 de moral" },
  amigos: { nome: "Sair com amigos", efeito: "+4 de moral, +10 de cansaço, risco de polêmica" },
  redes: { nome: "Redes sociais", efeito: "Mais seguidores e fama, risco de polêmica" },
  video: { nome: "Estudar o adversário", efeito: "Melhora a nota do jogo e a relação com o técnico" },
};
export interface Plano { foco: Grupo; intensidade: Intensidade; acoes: Acao[] }
export const planoPadrao = (): Plano => ({ foco: "tecnico", intensidade: "normal", acoes: ["treino", "descanso", "familia", "video", "descanso"] });

/** O que o plano faz com cansaço e moral antes do jogo (sem sorteios). */
export function previaPlano(s: Save, p: Plano) {
  const casa = efeitosDaCasa(s.casa).total, cont = (a: Acao) => p.acoes.filter((x) => x === a).length;
  const cansaco = clamp(s.carreira.cansaco + 10 * cont("treino") - 15 * cont("descanso") + 10 * cont("amigos") + (p.intensidade === "alta" ? 10 : p.intensidade === "leve" ? -10 : 0) + 12, 0, 100);
  const moral = clamp(s.carreira.moral + 2 * cont("familia") + 4 * cont("amigos"), 0, 100);
  const evolucao = Math.round(100 * (cont("treino") * 0.1 + (p.intensidade === "alta" ? 0.2 : p.intensidade === "leve" ? -0.2 : 0) + casa.evolucao / 100 + s.carreira.bonusEvolucao));
  return { cansaco: Math.round(cansaco), moral: Math.round(moral), evolucao, notaExtra: Math.min(0.3, 0.15 * cont("video")) };
}

// ------------------------------------------------------------------ partida
export interface Opcao { id: string; rotulo: string }
export interface Decisao { min: number; titulo: string; texto: string; opcoes: Opcao[]; situacao: string }
export interface Lance { min: number; lado: "casa" | "fora"; meu?: "gol" | "assist"; texto: string }
export interface Partida {
  tipo: "profissional" | "base"; escalacao: Escalacao; casa: string; fora: string; nomeCasa: string; nomeFora: string; souCasa: boolean;
  entrada: number; saida: number; golsCasa: number; golsFora: number; lances: Lance[]; decisoes: Decisao[];
  base: { gols: number; assist: number; nota: number }; fAdv: number;
  /** nomes do elenco usados nos textos, contexto do jogo e narração de ambiente */
  nomes: Record<string, string>; ctx: Contexto; abertura: string; narracao: LinhaNarracao[];
}
export interface ResultadoDecisao extends Efeito { min: number; nivel: Nivel; situacao: string; opcao?: string }
/** Decisão extra que a tela abre quando o jogador marca pela primeira vez no jogo: como comemorar. */
export function decisaoComemoracao(s: Save, p: Partida, min: number): Decisao {
  return { min, ...montarDecisao(rngDe(s, "comemoracao", min), COMEMORACAO, { ...p.ctx, min, jaFezGol: (s.carreira.stats.gols + s.carreira.historico.reduce((a, h) => a + h.gols, 0)) > 0 }, p.nomes) };
}
/** Depois do apito final (nem sempre): entrevista, troca de camisa, conversa com o técnico... */
export function decisaoPosJogo(s: Save, p: Partida, resultados: ResultadoDecisao[]): Decisao | undefined {
  if (Math.min(90, p.saida) - p.entrada <= 0) return;
  const meuLado = p.souCasa;
  let gm = meuLado ? p.golsCasa : p.golsFora, ga = meuLado ? p.golsFora : p.golsCasa, gols = p.lances.filter((l) => l.meu === "gol").length, nota = p.base.nota, amarelos = 0, expulso = false;
  for (const r of resultados) { if (r.golPro) gm++; if (r.golContra) ga++; if (r.meu === "gol") gols++; nota += r.nota; if (r.amarelo) amarelos++; if (r.vermelho || amarelos >= 2) expulso = true; }
  const rng = rngDe(s, "posjogo");
  if (!expulso && !rng.chance(0.5)) return;
  const ctx: Contexto = { ...p.ctx, min: 90, saldo: gm - ga, resultado: gm > ga ? "v" : gm === ga ? "e" : "d", gols, expulso, nota };
  const sit = escolherSituacao(rng, ctx, [], s.carreira.memoria, POS_JOGO);
  if (sit.peso(ctx) <= 0) return;
  return { min: 90, ...montarDecisao(rng, sit, ctx, { ...p.nomes, marco: String(ctx.jogosPro + 1) }) };
}

/** Força dos times da base (sub-17/20) a partir da força do profissional. */
const forcaBase = (forcaPro: number) => 46 + (forcaPro - 70) * 0.6;

export function prepararPartida(pacote: PacoteDados, s: Save, plano: Plano): Partida | undefined {
  const l = liga(pacote), c = s.carreira, j = s.jogador, jogo = jogoDaSemana(s);
  if (!jogo) return;
  const prev = previaPlano(s, plano);
  const esc = escalacao(pacote, s, prev.cansaco);
  if (esc === "lesionado" || esc === "fora" || esc === "suspenso") return { tipo: "profissional", escalacao: esc, casa: jogo.casa, fora: jogo.fora, nomeCasa: clubeDe(l, jogo.casa).nome, nomeFora: clubeDe(l, jogo.fora).nome, souCasa: jogo.souCasa, entrada: 0, saida: 0, golsCasa: 0, golsFora: 0, lances: [], decisoes: [], base: { gols: 0, assist: 0, nota: 0 }, fAdv: 0, nomes: {}, ctx: contextoPadrao(), abertura: "", narracao: [] };
  const rng = rngDe(s, "partida");
  const base = esc === "base";
  const meuClube = clubeDe(l, c.clubeId), adv = clubeDe(l, jogo.adversario);
  let fCasa = clubeDe(l, jogo.casa).forca, fFora = clubeDe(l, jogo.fora).forca;
  const ovrEf = ovr(j) * (0.92 + (0.08 * prev.moral) / 100) * (prev.cansaco > 70 ? 0.9 : 1);
  if (base) { fCasa = forcaBase(fCasa); fFora = forcaBase(fFora); }
  const meuF = jogo.souCasa ? fCasa : fFora, advF = jogo.souCasa ? fFora : fCasa;
  const entrada = esc === "banco" ? (rng.chance(0.6) ? rng.int(55, 80) : 91) : 0;
  const saida = esc === "titular" && prev.cansaco > 75 ? rng.int(60, 75) : 90;
  const minutos = Math.max(0, Math.min(90, saida) - entrada);
  if (minutos > 0 && (esc === "titular" || base)) {
    const bonus = (ovrEf - (base ? meuF + 4 : meuClube.forca)) / 11;
    if (jogo.souCasa) fCasa += bonus; else fFora += bonus;
  }
  const [gc, gf] = simularPlacar(rng, fCasa, fFora);
  const golsMeu = jogo.souCasa ? gc : gf, golsAdv = jogo.souCasa ? gf : gc;
  const d = minutos > 0 ? desempenhoJogador(rng, { posicao: j.posicao, ovrEfetivo: ovrEf, fin: j.at.FIN, passeOuCruz: Math.max(j.at.PAS, j.at.CRU), minutos, golsTime: golsMeu, golsSofridos: golsAdv, fAdv: advF }) : { gols: 0, assistencias: 0, nota: 0 };
  // lances: minutos dos gols; os do jogador caem dentro do tempo em campo
  const lado = (meu: boolean): "casa" | "fora" => (meu === jogo.souCasa ? "casa" : "fora");
  const lances: Lance[] = [];
  const minutosLivres = () => rng.int(2, 89);
  const meusGolsMin: number[] = Array.from({ length: golsMeu }, minutosLivres).sort((a, b) => a - b);
  let g = d.gols, a = d.assistencias;
  for (const m of meusGolsMin) {
    const emCampo = m >= entrada && m <= saida;
    let meu: Lance["meu"];
    if (emCampo && g > 0) { meu = "gol"; g--; } else if (emCampo && a > 0) { meu = "assist"; a--; }
    lances.push({ min: m, lado: lado(true), meu, texto: "" });
  }
  for (let i = 0; i < golsAdv; i++) lances.push({ min: minutosLivres(), lado: lado(false), texto: "" });
  // quem é quem, contexto do jogo e narração (sorteios próprios: não mexem no placar)
  const rngN = rngDe(s, "narracao"), rngL = rngDe(s, "lances");
  type ClubePacote = { id: string; apelido: string; cidade: string; estadio: { nome: string } };
  const cp = (id: string) => (pacote.clubes as unknown as ClubePacote[]).find((x) => x.id === id)!;
  const classico = cp(jogo.casa).cidade === cp(jogo.fora).cidade || [jogo.casa, jogo.fora].sort().join("-") in CLASSICOS_EXTRA;
  const chuva = rngN.chance(0.14);
  const elMeu = elencoDe(pacote, c.clubeId, base), elAdv = elencoDe(pacote, jogo.adversario, base);
  const estadio = base ? `CT do ${cp(jogo.casa).apelido}` : cp(jogo.casa).estadio.nome;
  const nomes = nomesDaPartida(rngN, elMeu, elAdv, { nome: j.apelido, meu: cp(c.clubeId).apelido, adv: cp(jogo.adversario).apelido, estadio, posJogador: j.posicao });
  const posTab = posicaoNaTabela(undefined, s), reta = c.semana >= SEMANAS_PRE + 28;
  const jogosPro = c.stats.jogos + c.historico.reduce((acc, h) => acc + h.jogos, 0);
  const ctx: Contexto = { pos: j.posicao, min: 0, saldo: 0, base, jaFezGol: false, classico, mandante: jogo.souCasa, reta,
    briga: base || !reta ? "" : posTab <= 3 ? "titulo" : posTab >= 17 ? "rebaixamento" : "", fama: c.fama, estreia: !base && jogosPro === 0,
    chuva, idade: j.idade, relTecnico: c.relTecnico, moral: c.moral, jogosPro };
  // decisões dentro do tempo em campo: de uma a três, situações diferentes conforme posição, minuto, placar, contexto e memória
  const nDec = minutos <= 0 ? 0 : minutos < 30 ? 1 : rng.chance(0.25) ? 1 : rng.chance(0.7) ? 2 : 3;
  const decisoes: Decisao[] = [], usadas: string[] = [];
  const janelas = nDec === 1 ? [[entrada + 3, saida - 2]] : nDec === 2 ? [[Math.max(entrada + 3, 6), 44], [Math.max(entrada + 3, 50), saida - 1]] : [[Math.max(entrada + 3, 6), 32], [Math.max(entrada + 3, 36), 66], [Math.max(entrada + 3, 70), saida - 1]];
  for (const [lo0, hi0] of janelas) {
    const lo = Math.min(lo0, hi0), hi = Math.max(lo0, hi0), min = rng.int(lo, hi);
    const saldo = lances.filter((x) => x.min < min).reduce((acc, x) => acc + (x.lado === lado(true) ? 1 : -1), 0);
    const ctxMin = { ...ctx, min, saldo };
    const sit = ctx.estreia && !decisoes.length ? SITUACAO.estreia : escolherSituacao(rngL, ctxMin, usadas, c.memoria);
    usadas.push(sit.id);
    decisoes.push({ min, ...montarDecisao(rngL, sit, ctxMin, nomes) });
  }
  lances.sort((x, y) => x.min - y.min);
  for (const x of lances) x.texto = narrarGol(rngN, x.lado === lado(true), x.meu, nomes, elMeu, elAdv);
  const narr = narrarPartida(rngN, { mandante: jogo.souCasa, classico, chuva, base, pos: j.posicao, nota: d.nota, entrada, saida }, nomes, elMeu, elAdv);
  const nomeC = base ? `${clubeDe(l, jogo.casa).nome} sub-17` : clubeDe(l, jogo.casa).nome, nomeF = base ? `${clubeDe(l, jogo.fora).nome} sub-17` : clubeDe(l, jogo.fora).nome;
  void adv;
  return { tipo: base ? "base" : "profissional", escalacao: esc, casa: jogo.casa, fora: jogo.fora, nomeCasa: nomeC, nomeFora: nomeF, souCasa: jogo.souCasa,
    entrada, saida, golsCasa: gc, golsFora: gf, lances, decisoes, base: { gols: d.gols, assist: d.assistencias, nota: d.nota }, fAdv: advF,
    nomes, ctx, abertura: narr.abertura, narracao: narr.linhas };
}

/** Nível do adversário no lance: no profissional o lance já nasce numa situação boa para quem decide. */
const nivelAdversario = (p: Partida) => (p.tipo === "base" ? p.fAdv - 2 : p.fAdv - 6);

export function resolverDecisao(s: Save, p: Partida, d: Decisao, opcaoId: string): ResultadoDecisao {
  const op = SITUACAO[d.situacao].opcoes.find((o) => o.id === opcaoId)!;
  const hab = habilidade(s.jogador.at, s.jogador.personalidade, s.jogador.tracos, op);
  const rng = rngDe(s, "decisao", d.situacao, d.min, opcaoId);
  const nivel = sortearNivel(rng, hab, nivelAdversario(p), op);
  return { ...resolverEfeito(rng, op, nivel, { ...p.nomes, marco: String((p.ctx?.jogosPro ?? 0) + 1) }), min: d.min, nivel, situacao: d.situacao, opcao: opcaoId };
}
/** Melhor opção pela nota esperada (só para a política automática; a tela não mostra nada disso). */
export function melhorOpcao(s: Save, p: Partida, d: Decisao): string {
  const ops = SITUACAO[d.situacao].opcoes.filter((o) => d.opcoes.some((x) => x.id === o.id));
  return ops.map((op) => ({ id: op.id, v: notaEsperada(habilidade(s.jogador.at, s.jogador.personalidade, s.jogador.tracos, op), nivelAdversario(p), op) })).sort((a, b) => b.v - a.v)[0].id;
}

// ------------------------------------------------------------------ fim da semana
export interface ResumoSemana {
  rotulo: string; escalacao: Escalacao; partida?: { nomeCasa: string; nomeFora: string; golsCasa: number; golsFora: number; nota: number; gols: number; assist: number; minutos: number; tipo: Partida["tipo"] };
  ovrAntes: number; ovrDepois: number; ganhos: [Atributo, number][]; moral: [number, number]; cansaco: [number, number]; fama: [number, number];
  dinheiro?: { salario: number; aluguel: number }; eventos: string[]; posicaoTabela: number; fimDeTemporada?: ResumoTemporada;
}

const POLEMICAS = [
  "Um vídeo seu dançando na balada às 3 da manhã rodou os grupos da torcida.",
  "Você respondeu um torcedor nas redes e virou assunto no programa de esporte.",
  "Uma foto sua na fila do show apareceu no perfil de fofoca na véspera do treino.",
];

export function concluirSemana(pacote: PacoteDados, s: Save, plano: Plano, partida: Partida | undefined, decisoes: ResultadoDecisao[]): ResumoSemana {
  const l = liga(pacote), c = s.carreira, j = s.jogador, rng = rngDe(s, "semana");
  const casa = efeitosDaCasa(s.casa).total;
  const rotulo = rotuloSemana(c);
  const ovrAntes = ovr(j), atAntes = { ...j.at }, moral0 = c.moral, cansaco0 = c.cansaco, fama0 = c.fama;
  const eventos: string[] = [];
  const cont = (a: Acao) => plano.acoes.filter((x) => x === a).length;

  // 1. a semana fora de campo
  const prev = previaPlano(s, plano);
  c.cansaco = prev.cansaco; c.moral = prev.moral;
  c.relTecnico = clamp(c.relTecnico + cont("video") + (cont("treino") >= 2 ? 1 : 0), 0, 100);
  if (cont("redes")) {
    const ganho = Math.round(c.seguidores * 0.01 * cont("redes") + 200 * cont("redes") * (1 + j.personalidade.carisma / 10));
    c.seguidores += ganho; c.fama = clamp(c.fama + 0.3 * cont("redes"), 0, 100); c.exposicao = clamp(c.exposicao + 2 * cont("redes"), 0, 100);
    eventos.push(`+${ganho.toLocaleString("pt-BR")} seguidores nas redes.`);
  }
  if (cont("amigos")) c.vidaNoturna = clamp(c.vidaNoturna + 2 * cont("amigos"), 0, 100);
  plano.acoes.forEach((a, dia) => {
    const risco = a === "amigos" ? (dia === 4 && partida ? 0.1 : 0.05) : a === "redes" ? 0.01 + j.personalidade.temperamento / 400 : 0;
    if (risco && rng.chance(risco)) {
      const t = rng.pick(POLEMICAS);
      c.moral = clamp(c.moral - 5, 0, 100); c.relTecnico = clamp(c.relTecnico - 4, 0, 100); c.fama = clamp(c.fama + 1, 0, 100);
      eventos.push(`Polêmica na ${DIAS[dia].toLowerCase()}: ${t}`);
      noticia(s, "polemica", "Polêmica", t);
    }
  });

  // 2. o jogo
  let participacao: Participacao = c.semana < SEMANAS_PRE ? "base" : "naoJogou";
  let resumoPartida: ResumoSemana["partida"];
  const jogo = jogoDaSemana(s);
  let placarMeuJogo: [number, number] | undefined;
  if (partida?.escalacao === "suspenso") { c.suspensao = 0; eventos.push("Cumpriu suspensão."); }
  if (partida && jogo && partida.escalacao !== "lesionado" && partida.escalacao !== "fora" && partida.escalacao !== "suspenso") {
    let gc = partida.golsCasa, gf = partida.golsFora, gols = partida.base.gols, assist = partida.base.assist, nota = partida.base.nota;
    // expulsão: dois amarelos ou um vermelho tiram o jogador do jogo naquele minuto
    let amarelos = 0, expulsoMin = 99, saiuMin = 99;
    const mem: Memoria = c.memoria ?? (c.memoria = { vistos: {}, recentes: [] });
    for (const d of decisoes) { mem.vistos[d.situacao] = (mem.vistos[d.situacao] ?? 0) + 1; mem.recentes = [...mem.recentes.filter((x) => x !== d.situacao), d.situacao].slice(-MEMORIA_RECENTE); }
    for (const d of [...decisoes].sort((a, b) => a.min - b.min)) {
      const pos = SITUACAO[d.situacao]?.momento === "pos";
      if (!pos && d.min > Math.min(expulsoMin, saiuMin)) continue;
      if (d.golPro) { if (partida.souCasa) gc++; else gf++; }
      if (d.golContra) { if (partida.souCasa) gf++; else gc++; }
      if (d.meu === "gol") gols++; if (d.meu === "assist") assist++;
      nota += d.nota;
      if (d.fama) c.fama = clamp(c.fama + d.fama, 0, 100);
      if (d.moral) c.moral = clamp(c.moral + d.moral, 0, 100);
      if (d.relTecnico) c.relTecnico = clamp(c.relTecnico + d.relTecnico, 0, 100);
      if (d.seguidores) c.seguidores = Math.round(c.seguidores * (1 + d.seguidores) + 500 * d.seguidores * 100);
      if (d.lesao) c.lesao = Math.max(c.lesao, d.lesao);
      if (d.noticia) noticia(s, "polemica", "Repercussão", d.noticia);
      if (d.amarelo) amarelos++;
      if (d.vermelho || amarelos >= 2) { expulsoMin = d.min; eventos.push(amarelos >= 2 && !d.vermelho ? "Expulso com dois amarelos. Fica fora do próximo jogo." : "Cartão vermelho. Fica fora do próximo jogo."); c.suspensao = 1; }
      else if (d.amarelo) eventos.push("Levou cartão amarelo.");
      if (d.sai && !d.vermelho && saiuMin === 99 && expulsoMin === 99) { saiuMin = d.min; eventos.push(`Saiu de campo aos ${d.min} minutos.`); }
    }
    const foraMin = Math.min(expulsoMin, saiuMin);
    if (foraMin < 99) {
      // tira do jogador os gols e assistências do placar original que vieram depois de ele sair
      for (const l of partida.lances) if (l.meu && l.min > foraMin) { if (l.meu === "gol") gols--; else assist--; }
      partida.saida = Math.min(partida.saida, foraMin);
      if (expulsoMin < 99) nota -= 0.5;
    }
    const minutos = Math.max(0, Math.min(90, partida.saida) - partida.entrada);
    if (minutos > 0) nota = Math.round(clamp(nota + prev.notaExtra, 3, 10) * 10) / 10; else nota = 0;
    if (partida.tipo === "profissional") placarMeuJogo = [gc, gf];
    resumoPartida = { nomeCasa: partida.nomeCasa, nomeFora: partida.nomeFora, golsCasa: gc, golsFora: gf, nota, gols, assist, minutos, tipo: partida.tipo };
    if (minutos > 0) {
      const pro = partida.tipo === "profissional";
      participacao = pro ? (partida.escalacao === "titular" ? "titular" : "entrou") : "base";
      if (pro) { c.stats.jogos++; if (partida.escalacao === "titular") c.stats.titular++; c.stats.gols += gols; c.stats.assist += assist; c.stats.notas.push(nota); }
      else { c.stats.base++; c.stats.baseGols += gols; (c.stats.baseNotas ??= []).push(nota); }
      if (pro) { c.jogosPorClube ??= {}; c.jogosPorClube[c.clubeId] = (c.jogosPorClube[c.clubeId] ?? 0) + 1; }
      // relíquias do jogo: estreia, primeiro gol, hat-trick, golaços, marcas
      const meusGols = partida.souCasa ? gc : gf, golsAdv = partida.souCasa ? gf : gc, cc = clubeCasa(pacote, c.clubeId);
      const totPro = (k: "jogos" | "gols") => c.stats[k] + c.historico.reduce((a, h) => a + h[k], 0);
      const ganhos = reliquiasDaPartida({
        tipo: partida.tipo, ano: ANO_INICIAL + c.temporada, semana: c.semana, adversario: clubeCasa(pacote, jogo.adversario).apelido, clubeId: c.clubeId, clubeNome: cc.nome, cores: cc.cores, numero: j.numero,
        placar: `${meusGols} × ${golsAdv}`, gols, minutos, jogosPro: totPro("jogos"), golsPro: totPro("gols"),
        jogosBase: c.stats.base + c.historico.reduce((a, h) => a + h.base, 0), golsBase: c.stats.baseGols + c.historico.reduce((a, h) => a + (h.baseGols ?? 0), 0),
        jogosNoClube: c.jogosPorClube?.[c.clubeId] ?? 0,
        golacos: decisoes.filter((d) => d.nivel === 0 && d.meu === "gol" && d.min <= foraMin).map((d) => `${d.situacao}/${d.opcao}`),
      }, (id) => (s.casa.reliquias ?? []).some((r) => r.id === id));
      receberReliquias(s, ganhos, eventos);
      c.formaUlt = [...c.formaUlt.slice(-4), nota];
      c.moral = clamp(c.moral + 3 * (nota - 6.5), 0, 100);
      c.relTecnico = clamp(c.relTecnico + (nota - 6.5) * (pro ? 1 : 1.5), 0, 100);
      const grande = clubeDe(l, c.clubeId).forca >= 75 ? 1.5 : 1;
      c.fama = clamp(c.fama + (pro ? grande * (0.5 * gols + (nota >= 8 ? 0.3 : 0)) : 0.1 * gols + (nota >= 8 ? 0.1 : 0)), 0, 100);
      c.cansaco = clamp(c.cansaco + (30 * minutos) / 90, 0, 100);
      const l2 = sortearLesao(rng, c.cansaco, plano.intensidade === "alta", j.idade, 1 - (1 - casa.lesao / 100) * (pro ? 1 : 0.6));
      if (l2) { c.lesao = l2.semanas; eventos.push(`Lesão ${l2.tipo === "leve" ? "leve" : l2.tipo === "media" ? "muscular" : "grave"}: ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); noticia(s, "lesao", "Lesão", `${j.apelido} se machucou e fica ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); }
      const res = (partida.souCasa ? gc - gf : gf - gc) > 0 ? "vitória" : gc === gf ? "empate" : "derrota";
      noticia(s, "jogo", `${partida.nomeCasa} ${gc} × ${gf} ${partida.nomeFora}`,
        `${res[0].toUpperCase() + res.slice(1)}${pro ? "" : " na base"}. ${j.apelido} jogou ${minutos} minutos${gols ? `, fez ${gols} ${gols > 1 ? "gols" : "gol"}` : ""}${assist ? `, deu ${assist} ${assist > 1 ? "assistências" : "assistência"}` : ""} e tirou nota ${nota.toFixed(1)}.`);
    } else if (partida.escalacao === "banco") { c.moral = clamp(c.moral - 1, 0, 100); eventos.push("Ficou no banco o jogo todo."); }
  } else if (partida?.escalacao === "fora") { c.moral = clamp(c.moral - 3, 0, 100); eventos.push("Não foi relacionado para o jogo."); }

  // 3. a rodada da liga
  if (jogo) {
    for (const g of jogosDaRodada(c, jogo.rodada)) {
      const meu = g.casa === c.clubeId || g.fora === c.clubeId;
      const [a, b] = meu && placarMeuJogo ? placarMeuJogo : simularPlacar(rng, clubeDe(l, g.casa).forca, clubeDe(l, g.fora).forca);
      registrar(c.tabela.find((t) => t.clube === g.casa)!, a, b);
      registrar(c.tabela.find((t) => t.clube === g.fora)!, b, a);
    }
  }

  // 4. evolução e recuperação
  if (c.lesao > 0 && participacao !== "titular" && participacao !== "entrou") { participacao = "ferias"; }
  const evoluido = evoluirSemana(j.at, j.pot, { idade: j.idade, foco: plano.foco, intensidade: plano.intensidade, participacao, moral: c.moral, personalTrainer: false, profissionalismo: j.personalidade.profissionalismo });
  const mult = 1 + cont("treino") * 0.1 + casa.evolucao / 100 + c.bonusEvolucao;
  for (const k of ATRIBUTOS) j.at[k] = clamp(j.at[k] + (evoluido[k] - j.at[k]) * (evoluido[k] > j.at[k] ? mult : 1), 1, 99);
  if (c.lesao > 0) c.lesao--;
  c.cansaco = clamp(c.cansaco - 20 - casa.recuperacao, 0, 100);
  c.moral = clamp(c.moral + 0.18 * (60 + casa.moral - c.moral), 0, 100);
  c.fama = clamp(c.fama + casa.fama * 0.02, 0, 100);
  if (participacao !== "titular" && participacao !== "entrou") c.fama = clamp(c.fama * 0.995, 0, 100);
  c.seguidores = Math.max(c.seguidores, Math.round(seguidoresDaFama(c.fama) * 0.1 * (1 + c.exposicao / 50)));

  // 5. dinheiro no fim do mês
  let dinheiro: ResumoSemana["dinheiro"];
  if (c.semana % 4 === 3) {
    const liquido = salarioLiquido(c);
    const { aluguel } = fecharMes(s.casa, liquido);
    if (c.mesesPatrocinio > 0) c.mesesPatrocinio--; else c.patrocinioMensal = 0;
    dinheiro = { salario: Math.round(liquido), aluguel };
    noticia(s, "dinheiro", "Caiu o salário", `R$ ${Math.round(liquido).toLocaleString("pt-BR")} na conta${aluguel ? `, R$ ${aluguel.toLocaleString("pt-BR")} de aluguel` : ""}.`);
  }

  // 6. avança
  const ganhos = ATRIBUTOS.map((k) => [k, j.at[k] - atAntes[k]] as [Atributo, number]).sort((x, y) => y[1] - x[1]).slice(0, 3);
  c.semana++;
  let fim: ResumoTemporada | undefined;
  if (c.semana >= SEMANAS_TEMPORADA) fim = fimDeTemporada(pacote, s);
  return {
    rotulo, escalacao: partida?.escalacao ?? (c.semana - 1 < SEMANAS_PRE ? "semJogo" : "fora"), partida: resumoPartida,
    ovrAntes, ovrDepois: ovr(j), ganhos, moral: [moral0, c.moral], cansaco: [cansaco0, c.cansaco], fama: [fama0, c.fama], dinheiro, eventos,
    posicaoTabela: posicaoNaTabela(fim ? s.carreira.historico.at(-1)!.posicao : undefined, s), fimDeTemporada: fim,
  };
}

export function salarioLiquido(c: Carreira): number {
  const s = c.salario, ir = 0.275 * Math.max(0, s - 5000);
  return s - ir - AGENTES[c.agente].comissao * s + c.patrocinioMensal;
}
function posicaoNaTabela(fixa: number | undefined, s: Save): number {
  if (fixa) return fixa;
  return ordenar(s.carreira.tabela).findIndex((t) => t.clube === s.carreira.clubeId) + 1;
}

/** Coloca as relíquias ganhas na casa e conta na semana e nas notícias. */
function receberReliquias(s: Save, ganhos: Ganho[], eventos: string[]) {
  for (const g of ganhos) {
    const r = ganharReliquia(s.casa, g.reliquia);
    if (!r.ok) continue;
    eventos.push(`Relíquia nova: ${r.msg}`);
    noticia(s, "vida", g.reliquia.tipo === "trofeu" ? g.reliquia.nome : `Relíquia: ${g.reliquia.nome}`, `${g.reliquia.legenda}. Já faz parte da coleção de ${s.jogador.apelido}.`);
  }
}

function fimDeTemporada(pacote: PacoteDados, s: Save): ResumoTemporada {
  const l = liga(pacote), c = s.carreira, j = s.jogador;
  const posicao = ordenar(c.tabela).findIndex((t) => t.clube === c.clubeId) + 1;
  const titulo = posicao === 1 && c.stats.jogos >= 10;
  const notas = c.stats.notas, media = (x: number[]) => (x.length ? +(x.reduce((a, b) => a + b, 0) / x.length).toFixed(2) : 0);
  const r: ResumoTemporada = { ano: ANO_INICIAL + c.temporada, idade: j.idade, clube: clubeDe(l, c.clubeId).nome, ovr: Math.round(ovr(j)), jogos: c.stats.jogos, gols: c.stats.gols, assist: c.stats.assist, nota: media(notas), posicao, titulo, base: c.stats.base, baseGols: c.stats.baseGols };
  // premiação: troféus que vão para a casa
  const cc = clubeCasa(pacote, c.clubeId), ev: string[] = [];
  const premios = premiosDaTemporada(rngDe(s, "premios"), { ano: r.ano, idade: j.idade, clubeId: c.clubeId, clubeNome: cc.nome, cores: cc.cores, numero: j.numero,
    jogos: r.jogos, gols: r.gols, assist: r.assist, nota: r.nota, titulo, base: r.base, golsBase: c.stats.baseGols, notaBase: media(c.stats.baseNotas ?? []),
    temporadasCheias: c.historico.filter((h) => h.jogos >= 15).length });
  receberReliquias(s, premios, ev);
  r.premios = premios.filter((g) => g.reliquia.tipo === "trofeu").map((g) => g.reliquia.nome);
  c.historico.push(r);
  if (titulo) c.fama = clamp(c.fama + 5, 0, 100);
  noticia(s, "clube", `Fim da temporada ${r.ano}`, `${r.clube} terminou em ${posicao}º. ${j.apelido}: ${r.jogos} jogos no profissional, ${r.gols} gols, ${r.assist} assistências${r.base ? `, ${r.base} jogos na base` : ""}.`);
  // nova temporada
  j.idade++; c.temporada++; c.semana = 0; c.anosContrato--;
  c.tabela = novaTabela(l); c.stats = statsVazias();
  const clube = clubeDe(l, c.clubeId);
  if (c.formacao && j.idade >= 18) {
    c.formacao = false; c.anosContrato = 3;
    c.salario = Math.round(salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama }));
    noticia(s, "clube", "Primeiro contrato profissional", `${j.apelido} assina por 3 anos: R$ ${c.salario.toLocaleString("pt-BR")} por mês.`);
  } else if (c.anosContrato <= 0) {
    c.anosContrato = 2;
    c.salario = Math.round(Math.max(c.formacao ? 3000 : 8000, salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama, formacao: c.formacao })));
    noticia(s, "clube", "Contrato renovado", `Mais 2 anos, R$ ${c.salario.toLocaleString("pt-BR")} por mês.`);
  }
  return r;
}

// ------------------------------------------------------------------ política automática (para testes e balanceamento)
export function planoAutomatico(s: Save): Plano {
  const c = s.carreira, foco: Grupo = (["fisico", "tecnico", "tatico"] as Grupo[])[(c.semana + c.temporada) % 3];
  const acoes: Acao[] = c.cansaco > 40 ? ["descanso", "treino", "descanso", "familia", "video"] : ["treino", "familia", "treino", "video", "descanso"];
  return { foco, intensidade: c.cansaco > 60 ? "leve" : "normal", acoes };
}
/** Joga uma semana inteira sem interface, escolhendo a primeira opção de cada decisão. */
export function semanaAutomatica(pacote: PacoteDados, s: Save): ResumoSemana {
  const plano = planoAutomatico(s), p = prepararPartida(pacote, s, plano);
  const ds: ResultadoDecisao[] = [];
  let fora = 99;
  for (const d of p?.decisoes ?? []) { if (d.min > fora) break; const r = resolverDecisao(s, p!, d, melhorOpcao(s, p!, d)); ds.push(r); if (r.vermelho || r.sai || ds.filter((x) => x.amarelo).length >= 2) fora = d.min; }
  // primeiro gol do jogador no jogo: comemoração, como na tela
  const golMin = p ? [...p.lances.filter((l) => l.meu === "gol" && l.min <= fora).map((l) => l.min), ...ds.filter((r) => r.meu === "gol").map((r) => r.min)].sort((a, b) => a - b)[0] : undefined;
  if (p && golMin !== undefined) { const d = decisaoComemoracao(s, p, golMin); ds.push(resolverDecisao(s, p, d, melhorOpcao(s, p, d))); }
  const pos = p ? decisaoPosJogo(s, p, ds) : undefined;
  if (p && pos) ds.push(resolverDecisao(s, p, pos, melhorOpcao(s, p, pos)));
  return concluirSemana(pacote, s, plano, p, ds);
}
