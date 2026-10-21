// A carreira jogável, semana a semana. Tudo que o jogo precisa guardar fica num Save (JSON).
// Cada sorteio usa uma semente derivada do save + semana, então recarregar a página não muda resultados.
import { RNG, clamp } from "./rng.js";
import { ATRIBUTOS, ovr as calcOvr, evoluirSemana, type Atributo, type Atributos, type Grupo, type Intensidade, type Participacao, type Posicao } from "./atributos.js";
import { simularPlacar, desempenhoJogador, sortearLesao, pontuacaoTitular, VAGAS_433 } from "./partida.js";
import { ligaDoPacote, rodadasDaLiga, novaTabela, registrar, ordenar, type Clube, type Liga, type LinhaTabela, type PacoteDados } from "./liga.js";
import { salarioMensal, AGENTES, type TipoAgente } from "./mercado.js";
import type { PersonalidadeDNA, ResultadoCriacao, TracoId } from "./dna.js";
import { definirPerfil, type Efeitos as EfeitosPerfil } from "./perfil.js";
import { SITUACAO, COMEMORACAO, POS_JOGO, MEMORIA_RECENTE, contextoPadrao, escolherSituacao, montarDecisao, resolverEfeito, habilidade, sortearNivel, notaEsperada, type Contexto, type Efeito, type Memoria, type Nivel } from "./lances.js";
import { mundo, infoClube, idClube } from "./mundo.js";
import { infoLiga } from "./ligas.js";
import { familiaridadeInicial, penalidade, ganhoSemanal, sugestaoDoTecnico, PODE_JOGAR, type Familiaridade } from "./posicoes.js";
import { estrelas, relacoesDe, relacao, semanaRelacoes, subir, atencao, chanceCamisa, chanceIndicacao, podeAgir, rotuloNivel, type EstadoRelacoes, type AcaoRel } from "./relacoes.js";
import { estatisticasEstimadas, type EstatEstimada } from "./perfil-jogador.js";
import { TATUAGEM, custoRemocao, visualDe, NOME_AREA, noArea, VISUAL_PADRAO, type Visual, type AreaTatuagem, type Fisico } from "./visual.js";
import { MARCA, ofertasDaMarca, marcaInteressada, bonusDoMes, type ContratoPatrocinio, type PropostaPatrocinio, type TipoContrato } from "./marcas.js";
import { EVENTO, fasesDe, sortearEvento, preencher, dinheiroDoEfeito, patrocinioDoEfeito, type CtxEvento, type EfeitoEvento } from "./eventos.js";
import { alvoSeguidores, famaDeReferencia, efeitosVida, gastosDoMes, imposto, semanaRedes, visibilidade, PADRAO_INICIAL, type PadraoVida } from "./vida.js";
import { bonusJovem, chanceSubir, culturaBase, NOME_CULTURA, type Cultura } from "./identidade.js";
import { semanaDoMercado, propostaPorIndicacao, janelaAberta, fimDaTemporadaNoMercado, contratoVencido, decidirAutomatico, type DadosMercado } from "./transferencias.js";
import { elencoDe, nomesDaPartida, narrarGol, narrarPartida, type LinhaNarracao } from "./narracao.js";
import { reliquiasDaPartida, premiosDaTemporada, type Ganho } from "./reliquias.js";
import { ganharReliquia, novoEstado, fecharMes, manutencaoMensal, efeitosDaCasa, alojamentosDoClube, estruturaDoClube, ESTRUTURAS, IMOVEL, nomeImovel, type EstadoCasa, type ClubeCasa } from "./casa.js";

// ------------------------------------------------------------------ tipos
export interface Jogador {
  nome: string; apelido: string; posicao: Posicao; pais: string; nacionalidade: string; idade: number;
  at: Atributos; pot: number; faixaPot: [number, number]; personalidade: PersonalidadeDNA; tracos: TracoId[];
  perfilId: string; perfilNome: string; aparencia: unknown; numero: string; familia: string;
  /** corpo inteiro: físico, uniforme, roupa do dia a dia e tatuagens */
  visual?: Visual; alturaCm?: number; pe?: string;
  /** quanto domina cada posição (0–100; a natural começa em 100) */
  familiaridade?: Familiaridade;
}
export interface Stats { jogos: number; titular: number; gols: number; assist: number; notas: number[]; base: number; baseGols: number; baseNotas?: number[] }
export interface ResumoTemporada { ano: number; idade: number; clube: string; clubeId?: string; liga?: string; est?: EstatEstimada; ovr: number; jogos: number; gols: number; assist: number; nota: number; posicao: number; titulo: boolean; base: number; baseGols?: number; premios?: string[] }
/** Dados da imagem da notícia (o desenho é feito na tela, a partir destes ids). */
export type ImgNoticia = { k: "placar"; casa: string; fora: string; gc: number; gf: number } | { k: "transferencia"; clube: string; tipo: string; ate: number; taxa: number } | { k: "patrocinio"; marca: string } | { k: "trofeu" } | { k: "vida" } | { k: "tatuagem" };
export interface Noticia { semana: string; titulo: string; texto: string; tipo: "jogo" | "clube" | "vida" | "dinheiro" | "polemica" | "lesao"; img?: ImgNoticia }
export interface Carreira {
  clubeId: string; salario: number; anosContrato: number; formacao: boolean; agente: TipoAgente;
  moral: number; fama: number; seguidores: number; cansaco: number; lesao: number; relTecnico: number; formaUlt: number[];
  suspensao?: number;
  /** liga do clube atual (saves antigos: Série A) */
  ligaId?: string;
  /** propostas, empréstimo, histórico de transferências, agente */
  mercado?: DadosMercado;
  /** lances já vividos: os recentes aparecem menos, os inéditos mais */
  memoria?: Memoria;
  /** temporada em que chegou ao clube atual por transferência (prêmio de melhor contratação) */
  chegadaClube?: number;
  /** jogos como profissional por clube (camisa de cada clube) */
  jogosPorClube?: Record<string, number>;
  /** redes sociais: quanto posta (0–100) e repercussão recente de lances (decai) */
  engajamento?: number; hype?: number;
  /** padrão de vida escolhido (alimentação, carro, lazer, família) */
  padrao?: PadraoVida;
  /** evento fora de campo esperando decisão, e a temporada em que cada evento apareceu */
  evento?: string; eventosVistos?: Record<string, number>;
  /** reputação com a torcida do clube atual (0–100) */
  torcida?: number;
  /** relacionamento com outros jogadores */
  relacoes?: EstadoRelacoes;
  /** treino de posição em andamento e sugestão do técnico */
  treinoPosicao?: Posicao; sugestaoPos?: { pos: Posicao; aceita?: boolean };
  /** maior reputação que teve com a torcida de cada clube */
  torcidaMax?: Record<string, number>;
  /** patrocinadores: contratos ativos, proposta na mesa, marcas recusadas na temporada e números do mês para os bônus */
  patrocinios?: ContratoPatrocinio[]; propPatrocinio?: PropostaPatrocinio; recusadas?: string[]; mesStats?: { gols: number; assist: number; notas8: number };
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
/** A Série A (início de carreira e ofertas da base). */
export function liga(pacote: PacoteDados): Liga {
  if (!ligaCache || ligaCache.pacote !== pacote) ligaCache = { pacote, liga: mundo(pacote).liga.BRA1 };
  return ligaCache.liga;
}
/** A liga em que o jogador está agora. */
export const ligaAtual = (pacote: PacoteDados, s: Save): Liga => mundo(pacote).liga[infoLiga(s.carreira.ligaId).id];
/** Saves de antes das ligas reais: clubes e ligas antigas viram os equivalentes atuais. Devolve true se mudou algo. */
export function migrarSave(pacote: PacoteDados, s: Save): boolean {
  const c = s.carreira, w = mundo(pacote);
  const existe = (id: string) => !!w.clube[id];
  if (existe(c.clubeId) && (c.ligaId ?? "BRA1") === w.info[c.clubeId].ligaId && c.ordem.every(existe)) return false;
  c.clubeId = idClube(c.clubeId);
  if (!existe(c.clubeId)) c.clubeId = "FLA";
  c.ligaId = w.info[c.clubeId].ligaId;
  const l = w.liga[c.ligaId];
  if (c.ordem.length !== l.clubes.length || !c.ordem.every((id) => existe(idClube(id)) && w.info[idClube(id)].ligaId === c.ligaId)) {
    c.ordem = l.clubes.map((x) => x.id);
    c.tabela = novaTabela(l);
  } else {
    c.ordem = c.ordem.map(idClube);
    for (const t of c.tabela) t.clube = idClube(t.clube);
  }
  const m = c.mercado;
  if (m) {
    m.propostas = m.propostas.filter((p) => existe(idClube(p.clubeId))).map((p) => ({ ...p, clubeId: idClube(p.clubeId), ligaId: w.info[idClube(p.clubeId)].ligaId }));
    for (const t of m.transferencias) { t.de = idClube(t.de); t.para = idClube(t.para); }
    if (m.emprestimo) {
      m.emprestimo.origem = idClube(m.emprestimo.origem);
      if (!existe(m.emprestimo.origem)) m.emprestimo = undefined;
      else { const lo = w.liga[w.info[m.emprestimo.origem].ligaId]; m.emprestimo.ligaOrigem = lo.id; m.emprestimo.ordemOrigem = lo.clubes.map((x) => x.id); }
    }
  }
  if (c.jogosPorClube) c.jogosPorClube = Object.fromEntries(Object.entries(c.jogosPorClube).map(([k, v]) => [idClube(k), v]));
  s.casa.clube = clubeCasa(pacote, c.clubeId);
  return true;
}
export const nRodadas = (c: Carreira) => rodadasDaLiga(c.ordem.length).length;
export const clubeDe = (l: Liga, id: string) => l.clubes.find((c) => c.id === id)!;
export function clubeCasa(pacote: PacoteDados, id: string): ClubeCasa {
  const c = infoClube(pacote, id);
  return { id: c.id, nome: c.nome, apelido: c.apelido, cores: c.cores, forca: c.forca };
}
const rngDe = (s: Save, ...partes: (string | number)[]) => new RNG(`${s.semente}|${s.carreira.temporada}|${s.carreira.semana}|${partes.join("|")}`);
export const familiaridadeDe = (j: Jogador): Familiaridade => (j.familiaridade ??= familiaridadeInicial(j.posicao));
/** OVR na posição em que joga, com desconto se ainda não domina a posição. */
export const ovr = (j: Jogador) => calcOvr(j.at, j.posicao) - penalidade(familiaridadeDe(j)[j.posicao] ?? 100);
export const ovrEm = (j: Jogador, p: Posicao) => calcOvr(j.at, p) - penalidade(familiaridadeDe(j)[p] ?? 0);
export const forma = (c: Carreira) => (c.formaUlt.length ? c.formaUlt.reduce((a, b) => a + b, 0) / c.formaUlt.length : 6.5);

// ------------------------------------------------------------------ início
export interface DadosCriacao { resultado: ResultadoCriacao; aparencia: unknown; clube: string | null; perfil?: string; decisao?: string | null }
export interface OfertaBase { clubeId: string; nome: string; apelido: string; cores: string[]; forca: number; estrutura: number; nomeEstrutura: string; moradia: string; fila: number; texto: string; cultura: Cultura; nomeCultura: string }

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
    const cult = culturaBase(c.id);
    const estrutura = est >= 4 ? "Estrutura de primeiro mundo" : est === 1 ? "Clube pobre, moradia apertada" : est === 2 ? "Clube modesto, pouco conforto" : "Clube organizado";
    const base = cult >= 5 ? "e aqui se vive de revelar garotos: a chance chega cedo." : cult === 4 ? "e aqui se gosta de lançar jovens." : cult <= 2 ? "mas aqui se prefere contratar pronto: subir vai exigir muito." : est >= 4 ? "mas a fila para subir é longa." : "e quem estiver melhor joga.";
    const texto = (c.id === d.clube ? "O clube do seu coração abriu as portas. " : "") + `${estrutura}, ${base}`;
    return { clubeId: c.id, nome: c.nome, apelido: cc.apelido, cores: cc.cores, forca: Math.round(cc.forca), estrutura: est, nomeEstrutura: ESTRUTURAS[est], moradia: aloj.nome, fila, texto, cultura: cult, nomeCultura: NOME_CULTURA[cult] };
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
    alturaCm: e.alturaCm, pe: e.pe, visual: { ...VISUAL_PADRAO, tatuagens: {}, fisico: fisicoInicial(r.atributos) },
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
  const r = c.semana - SEMANAS_PRE + 1;
  return c.semana < SEMANAS_PRE ? `Pré-temporada ${ano} · semana ${c.semana + 1}` : r > nRodadas(c) ? `Temporada ${ano} · fim de calendário` : `Temporada ${ano} · rodada ${r}`;
}
export function noticia(s: Save, tipo: Noticia["tipo"], titulo: string, texto: string, img?: ImgNoticia) {
  s.noticias.unshift({ semana: rotuloSemana(s.carreira), titulo, texto, tipo, ...(img ? { img } : {}) });
  s.noticias = s.noticias.slice(0, 60);
}

// ------------------------------------------------------------------ calendário
export interface Jogo { casa: string; fora: string }
export function jogosDaRodada(c: Carreira, rodada: number): Jogo[] {
  return rodadasDaLiga(c.ordem.length)[rodada].map(([a, b]) => ({ casa: c.ordem[a], fora: c.ordem[b] }));
}
export function jogoDaSemana(s: Save): (Jogo & { rodada: number; souCasa: boolean; adversario: string }) | undefined {
  const c = s.carreira;
  if (c.semana < SEMANAS_PRE || c.semana - SEMANAS_PRE >= nRodadas(c)) return;
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
  const clube = clubeDe(ligaAtual(pacote, s), c.clubeId);
  const meu = pontuacaoTitular(ovr(j), forma(c), c.relTecnico, cansacoPrevisto) + bonusJovem(c.clubeId, j.idade);
  const rank = clube.elenco.filter((x) => x.posicao === j.posicao).filter((x) => pontuacaoTitular(x.ovr, 6.5, 50, 0) > meu).length;
  const vagas = VAGAS_433[j.posicao];
  if (rank < vagas) return "titular";
  if (rank <= vagas + 1) return "banco";
  if (j.idade <= 19) {
    // garoto da base em grande fase ganha chance de ficar no banco do profissional
    const sub = chanceSubir(c.clubeId);
    if (forma(c) >= sub.formaMin && c.relTecnico >= 60 && rngDe(s, "relacionado").chance(sub.chance)) return "banco";
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
  const evolucao = Math.round(100 * (cont("treino") * 0.1 + (p.intensidade === "alta" ? 0.2 : p.intensidade === "leve" ? -0.2 : 0) + (casa.evolucao + efeitosVida(padraoDe(s.carreira)).evolucao) / 100 + s.carreira.bonusEvolucao));
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

/** Categoria da base pela idade. */
export const categoriaBase = (idade: number) => (idade <= 17 ? "sub-17" : "sub-20");
/** Força dos times da base (sub-17/20) a partir da força do profissional. */
const forcaBase = (forcaPro: number) => 46 + (forcaPro - 70) * 0.6;

export function prepararPartida(pacote: PacoteDados, s: Save, plano: Plano): Partida | undefined {
  const l = ligaAtual(pacote, s), c = s.carreira, j = s.jogador, jogo = jogoDaSemana(s);
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
  const cp = (id: string) => infoClube(pacote, id);
  const classico = cp(jogo.casa).cidade === cp(jogo.fora).cidade || [jogo.casa, jogo.fora].sort().join("-") in CLASSICOS_EXTRA;
  const chuva = rngN.chance(0.14);
  const elMeu = elencoDe(meuClube, base), elAdv = elencoDe(adv, base);
  const estadio = base ? `CT do ${cp(jogo.casa).apelido}` : cp(jogo.casa).estadio;
  const nomes = nomesDaPartida(rngN, elMeu, elAdv, { nome: j.apelido, meu: cp(c.clubeId).apelido, adv: cp(jogo.adversario).apelido, estadio, posJogador: j.posicao });
  const posTab = posicaoNaTabela(undefined, s), reta = c.semana >= SEMANAS_PRE + 28;
  const jogosPro = c.stats.jogos + c.historico.reduce((acc, h) => acc + h.jogos, 0);
  const ctx: Contexto = { pos: j.posicao, min: 0, saldo: 0, base, jaFezGol: false, classico, mandante: jogo.souCasa, reta,
    briga: base || !reta ? "" : posTab <= 3 ? "titulo" : posTab > c.ordem.length - 4 ? "rebaixamento" : "", fama: c.fama, estreia: !base && jogosPro === 0,
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
  const cat = categoriaBase(j.idade), nomeC = base ? `${clubeDe(l, jogo.casa).nome} ${cat}` : clubeDe(l, jogo.casa).nome, nomeF = base ? `${clubeDe(l, jogo.fora).nome} ${cat}` : clubeDe(l, jogo.fora).nome;
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
  dinheiro?: { salario: number; aluguel: number; gastos?: number }; eventos: string[]; posicaoTabela: number; fimDeTemporada?: ResumoTemporada;
}

const POLEMICAS = [
  "Um vídeo seu dançando na balada às 3 da manhã rodou os grupos da torcida.",
  "Você respondeu um torcedor nas redes e virou assunto no programa de esporte.",
  "Uma foto sua na fila do show apareceu no perfil de fofoca na véspera do treino.",
];

export function concluirSemana(pacote: PacoteDados, s: Save, plano: Plano, partida: Partida | undefined, decisoes: ResultadoDecisao[]): ResumoSemana {
  const l = ligaAtual(pacote, s), c = s.carreira, j = s.jogador, rng = rngDe(s, "semana");
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
    c.engajamento = clamp((c.engajamento ?? 40) + 9 * cont("redes"), 0, 100);
    c.fama = clamp(c.fama + 0.15 * cont("redes"), 0, 100); c.exposicao = clamp(c.exposicao + 2 * cont("redes"), 0, 100);
  }
  if (cont("amigos")) c.vidaNoturna = clamp(c.vidaNoturna + 2 * cont("amigos"), 0, 100);
  plano.acoes.forEach((a, dia) => {
    const risco = a === "amigos" ? (dia === 4 && partida ? 0.1 : 0.05) : a === "redes" ? 0.01 + j.personalidade.temperamento / 400 : 0;
    if (risco && rng.chance(risco)) {
      const t = rng.pick(POLEMICAS);
      c.moral = clamp(c.moral - 5, 0, 100); c.relTecnico = clamp(c.relTecnico - 4, 0, 100); c.fama = clamp(c.fama + 1, 0, 100); c.torcida = clamp((c.torcida ?? 50) - 2, 0, 100);
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
      if (d.seguidores) c.hype = clamp((c.hype ?? 0) + 2 * d.seguidores, -0.3, 1.5);
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
      if (pro) { c.stats.jogos++; if (partida.escalacao === "titular") c.stats.titular++; c.stats.gols += gols; c.stats.assist += assist; c.stats.notas.push(nota);
        const ms = (c.mesStats ??= { gols: 0, assist: 0, notas8: 0 }); ms.gols += gols; ms.assist += assist; if (nota >= 8) ms.notas8++; }
      else { c.stats.base++; c.stats.baseGols += gols; (c.stats.baseNotas ??= []).push(nota); }
      if (pro) { c.jogosPorClube ??= {}; c.jogosPorClube[c.clubeId] = (c.jogosPorClube[c.clubeId] ?? 0) + 1; }
      // relíquias do jogo: estreia, primeiro gol, hat-trick, golaços, marcas
      const meusGols = partida.souCasa ? gc : gf, golsAdv = partida.souCasa ? gf : gc, cc = clubeCasa(pacote, c.clubeId);
      const totPro = (k: "jogos" | "gols") => c.stats[k] + c.historico.reduce((a, h) => a + h[k], 0);
      const ganhos = reliquiasDaPartida({
        tipo: partida.tipo, ano: ANO_INICIAL + c.temporada, semana: c.semana, adversario: clubeCasa(pacote, jogo.adversario).apelido, clubeId: c.clubeId, clubeNome: cc.nome, cores: cc.cores, numero: j.numero,
        padrao: infoClube(pacote, c.clubeId).padrao, ligaId: infoLiga(c.ligaId).id,
        placar: `${meusGols} × ${golsAdv}`, gols, minutos, jogosPro: totPro("jogos"), golsPro: totPro("gols"),
        jogosBase: c.stats.base + c.historico.reduce((a, h) => a + h.base, 0), golsBase: c.stats.baseGols + c.historico.reduce((a, h) => a + (h.baseGols ?? 0), 0),
        jogosNoClube: c.jogosPorClube?.[c.clubeId] ?? 0,
        golacos: decisoes.filter((d) => d.nivel === 0 && d.meu === "gol" && d.min <= foraMin).map((d) => `${d.situacao}/${d.opcao}`),
      }, (id) => (s.casa.reliquias ?? []).some((r) => r.id === id));
      receberReliquias(s, ganhos, eventos);
      c.formaUlt = [...c.formaUlt.slice(-4), nota];
      if (pro) c.torcida = clamp((c.torcida ?? 50) + (nota - 6.5) * 1.5 + gols, 0, 100);
      c.moral = clamp(c.moral + 3 * (nota - 6.5), 0, 100);
      c.relTecnico = clamp(c.relTecnico + (nota - 6.5) * (pro ? 1 : 1.5), 0, 100);
      const grande = clubeDe(l, c.clubeId).forca >= 75 ? 1.5 : 1;
      c.fama = clamp(c.fama + (1 - c.fama / 110) * (pro ? grande * (0.5 * gols + (nota >= 8 ? 0.3 : 0)) : 0.1 * gols + (nota >= 8 ? 0.1 : 0)), 0, 100);
      c.cansaco = clamp(c.cansaco + (30 * minutos) / 90, 0, 100);
      const l2 = sortearLesao(rng, c.cansaco, plano.intensidade === "alta", j.idade, 1 - (1 - casa.lesao / 100) * (pro ? 1 : 0.6));
      if (l2) { c.lesao = l2.semanas; eventos.push(`Lesão ${l2.tipo === "leve" ? "leve" : l2.tipo === "media" ? "muscular" : "grave"}: ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); noticia(s, "lesao", "Lesão", `${j.apelido} se machucou e fica ${l2.semanas} ${l2.semanas > 1 ? "semanas" : "semana"} fora.`); }
      const res = (partida.souCasa ? gc - gf : gf - gc) > 0 ? "vitória" : gc === gf ? "empate" : "derrota";
      noticia(s, "jogo", `${partida.nomeCasa} ${gc} × ${gf} ${partida.nomeFora}`,
        `${res[0].toUpperCase() + res.slice(1)}${pro ? "" : " na base"}. ${j.apelido} jogou ${minutos} minutos${gols ? `, fez ${gols} ${gols > 1 ? "gols" : "gol"}` : ""}${assist ? `, deu ${assist} ${assist > 1 ? "assistências" : "assistência"}` : ""} e tirou nota ${nota.toFixed(1)}.`, { k: "placar", casa: jogo.casa, fora: jogo.fora, gc, gf });
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
  const vida = efeitosVida(padraoDe(c));
  const mult = 1 + cont("treino") * 0.1 + (casa.evolucao + vida.evolucao) / 100 + c.bonusEvolucao - (c.treinoPosicao ? 0.1 : 0);
  for (const k of ATRIBUTOS) j.at[k] = clamp(j.at[k] + (evoluido[k] - j.at[k]) * (evoluido[k] > j.at[k] ? mult : 1), 1, 99);
  if (c.lesao > 0) c.lesao--;
  c.cansaco = clamp(c.cansaco - 20 - casa.recuperacao - vida.recuperacao, 0, 100);
  c.moral = clamp(c.moral + 0.18 * (60 + casa.moral + vida.moral - c.moral), 0, 100);
  c.fama = clamp(c.fama + (casa.fama + vida.fama) * 0.02, 0, 100);
  if (vida.noite) c.vidaNoturna = clamp(c.vidaNoturna + 0.3 * vida.noite, 0, 100);
  if (participacao !== "titular" && participacao !== "entrou") c.fama = clamp(c.fama * 0.995, 0, 100);
  { // a fama volta aos poucos para o tamanho real do jogador e do clube
    const cl = clubeDe(l, c.clubeId), ref = famaDeReferencia(ovr(j), visibilidade(c.clubeId, c.ligaId, cl.fClube));
    c.fama = clamp(c.fama + (ref - c.fama) * (c.fama > ref ? 0.012 : 0.004), 0, 100);
  }
  // redes: quem não posta perde engajamento; repercussão de lance passa
  c.engajamento = clamp((c.engajamento ?? 40) - 2.5, 0, 100);
  c.hype = (c.hype ?? 0) * 0.85;
  c.torcida = clamp((c.torcida ?? 50) + (50 - (c.torcida ?? 50)) * 0.005, 0, 100);
  (c.torcidaMax ??= {})[c.clubeId] = Math.max(c.torcidaMax[c.clubeId] ?? 0, c.torcida);
  const seg0 = c.seguidores;
  c.seguidores = semanaRedes(c.seguidores, alvoDeSeguidores(pacote, s));
  if (Math.abs(c.seguidores - seg0) >= Math.max(5000, seg0 * 0.01)) eventos.push(`${c.seguidores > seg0 ? "+" : "−"}${Math.abs(c.seguidores - seg0).toLocaleString("pt-BR")} seguidores nas redes.`);

  // 5. dinheiro no fim do mês
  let dinheiro: ResumoSemana["dinheiro"];
  if (c.semana % 4 === 3) {
    const pat = fecharMesPatrocinios(s, eventos);
    const liquido = salarioLiquido(c) + pat, g = gastosDoMes(padraoDe(c), c.ligaId, c.salario, c.fama, c.formacao, manutencaoMensal(s.casa));
    const { aluguel } = fecharMes(s.casa, liquido - g.total);
    if (c.mesesPatrocinio > 0) c.mesesPatrocinio--; else c.patrocinioMensal = 0;
    dinheiro = { salario: Math.round(liquido), aluguel, gastos: g.total };
    noticia(s, "dinheiro", "Fechou o mês", `R$ ${Math.round(liquido).toLocaleString("pt-BR")} de salário líquido, R$ ${g.total.toLocaleString("pt-BR")} de custo de vida${aluguel ? `, R$ ${aluguel.toLocaleString("pt-BR")} de aluguel` : ""}.`);
    if (s.casa.saldo < 0) { c.moral = clamp(c.moral - 4, 0, 100); eventos.push("Conta no vermelho: o custo de vida está maior que o salário."); noticia(s, "dinheiro", "Conta no vermelho", "Os gastos passaram do que entra. Hora de rever o padrão de vida."); }
  }

  // 6. avança
  const ganhos = ATRIBUTOS.map((k) => [k, j.at[k] - atAntes[k]] as [Atributo, number]).sort((x, y) => y[1] - x[1]).slice(0, 3);
  c.semana++;
  let fim: ResumoTemporada | undefined;
  if (c.semana >= SEMANAS_TEMPORADA) fim = fimDeTemporada(pacote, s, eventos);
  // 7. mercado: propostas da janela, renovação, empréstimo
  semanaDoMercado(pacote, s, rngDe(s, "mercado"), eventos);
  // 8. patrocinadores: proposta vence em 4 semanas; marcas novas aparecem conforme a fama
  if (c.propPatrocinio && semanaAbsJogo(c) >= c.propPatrocinio.expira) { eventos.push(`A proposta da ${MARCA[c.propPatrocinio.marca]?.nome ?? "marca"} expirou.`); c.propPatrocinio = undefined; }
  if (!c.propPatrocinio && (c.patrocinios?.length ?? 0) < 4) {
    const r3 = rngDe(s, "patrocinio");
    if (r3.chance(0.025 + c.fama / 700)) {
      const m = marcaInteressada(r3, c.fama, j.idade, c.patrocinios ?? [], c.recusadas ?? []);
      if (m) { c.propPatrocinio = { marca: m.id, opcoes: ofertasDaMarca(r3, m, c.fama, c.seguidores), expira: semanaAbsJogo(c) + 4 }; eventos.push(`Proposta de patrocínio: ${m.nome}.`); noticia(s, "dinheiro", `${m.nome} quer patrocinar ${j.apelido}`, `A marca mandou três modelos de contrato. A proposta vale por quatro semanas.`, { k: "patrocinio", marca: m.id }); }
    }
  }
  // 9. relações: convivência, redes, túnel do jogo e troca de camisa
  {
    const rr = relacoesDe(c), r4 = rngDe(s, "relacoes"), ano = ANO_INICIAL + c.temporada, clube = mundo(pacote).clube[idClube(c.clubeId)];
    semanaRelacoes(rr, r4, clube?.elenco ?? [], c.clubeId, ano, cont("amigos"));
    const est = estrelas(pacote);
    for (let k = 0; k < cont("redes"); k++) {
      const seguidas = est.filter((e) => (rr.lista[e.nome]?.nivel ?? 0) > 0);
      const e = seguidas.length && r4.chance(0.7) ? r4.pick(seguidas) : r4.pick(est.slice(0, 60));
      subir(relacao(rr, e.nome, e.clubeId, ano), 2 * atencao(c.fama, e.fama));
    }
    if (jogo && partida && participacao !== "naoJogou" && participacao !== "base") {
      for (const e of est.filter((x) => x.clubeId === jogo.adversario)) {
        const x = relacao(rr, e.nome, e.clubeId, ano); subir(x, 2);
        if (rr.camisaPedida === e.nome) {
          rr.camisaPedida = undefined;
          if (r4.chance(chanceCamisa(x.nivel, c.fama, e.fama))) {
            x.camisa = true; subir(x, 8);
            const info = infoClube(pacote, e.clubeId);
            receberReliquias(s, [{ conquista: "camisa-troca", reliquia: { id: `rel-camisa-troca-${e.nome.replace(/\W+/g, "")}-${ano}`, chave: "camisa-troca", tipo: "camisa", nome: `Camisa de ${e.nome}`, legenda: `${info.nome} · troca depois do jogo · ${ano}`, ano, cores: [info.cores[0], info.cores[1] ?? "#FFFFFF"], modelo: info.padrao, numero: String(e.numero) } }], eventos);
            eventos.push(`${e.nome} trocou de camisa com você no fim do jogo!`);
          } else { subir(x, -2); eventos.push(`Você pediu, mas ${e.nome} trocou a camisa com outro jogador.`); }
        }
      }
    }
    if (rr.camisaPedida && (!jogo || !est.some((e) => e.nome === rr.camisaPedida && e.clubeId === jogo.adversario))) rr.camisaPedida = undefined;
  }
  // 10. treino de posição e sugestão do técnico
  {
    const fam = familiaridadeDe(j);
    if (c.treinoPosicao && c.treinoPosicao !== j.posicao) {
      const p = c.treinoPosicao, antes = fam[p] ?? 0;
      fam[p] = clamp(antes + ganhoSemanal(j.at, j.posicao, p, c.sugestaoPos?.pos === p && !!c.sugestaoPos.aceita, cont("treino")), 0, 100);
      if (antes < PODE_JOGAR && fam[p]! >= PODE_JOGAR) { eventos.push(`Já dá para jogar de ${NOME_POSICAO[p].toLowerCase()}.`); noticia(s, "clube", "Posição nova", `${j.apelido} já está pronto para jogar de ${NOME_POSICAO[p].toLowerCase()}. Ainda falta lapidar, mas o técnico pode contar com ele ali.`); }
      if (fam[p]! >= 100) { c.treinoPosicao = undefined; eventos.push(`Domina a posição de ${NOME_POSICAO[p].toLowerCase()}.`); }
    } else if (!c.sugestaoPos && c.semana > 2 && rngDe(s, "sugestao").chance(0.025)) {
      const p = sugestaoDoTecnico(j.at, j.posicao, fam);
      if (p) { c.sugestaoPos = { pos: p }; eventos.push(`O técnico quer testar você como ${NOME_POSICAO[p].toLowerCase()}.`); noticia(s, "clube", "Conversa com o técnico", `O técnico chamou ${j.apelido}: "Vejo você jogando de ${NOME_POSICAO[p].toLowerCase()}. Topa treinar?"`); }
    }
  }
  // 11. vida fora de campo: de vez em quando, uma decisão
  if (c.evento && !EVENTO[c.evento]) c.evento = undefined;
  if (!c.evento && c.semana > 0) {
    const r2 = rngDe(s, "evento");
    if (r2.chance(0.14)) {
      const ctx = contextoEvento(pacote, s), e = sortearEvento(r2, ctx, c.eventosVistos ??= {});
      if (e) { c.evento = e.id; c.eventosVistos[e.id] = c.temporada; eventos.push(`Fora de campo: ${e.titulo}.`); }
    }
  }
  return {
    rotulo, escalacao: partida?.escalacao ?? (c.semana - 1 < SEMANAS_PRE ? "semJogo" : "fora"), partida: resumoPartida,
    ovrAntes, ovrDepois: ovr(j), ganhos, moral: [moral0, c.moral], cansaco: [cansaco0, c.cansaco], fama: [fama0, c.fama], dinheiro, eventos,
    posicaoTabela: posicaoNaTabela(fim ? s.carreira.historico.at(-1)!.posicao : undefined, s), fimDeTemporada: fim,
  };
}

export function salarioLiquido(c: Carreira): number {
  const s = c.salario, ir = c.formacao ? 0 : imposto(s, c.ligaId);
  return s - ir - AGENTES[c.agente].comissao * s + c.patrocinioMensal;
}
export function contextoEvento(pacote: PacoteDados, s: Save): CtxEvento {
  const c = s.carreira, info = infoClube(pacote, c.clubeId), li = infoLiga(c.ligaId);
  const base = { idade: s.jogador.idade, fama: c.fama, salario: c.salario, saldo: s.casa.saldo, exterior: li.regiao !== "BRA", golfo: li.id === "KSA1",
    titular: c.stats.titular > c.stats.jogos / 2, nome: s.jogador.apelido, clube: info.nome, cidade: info.cidade, liga: li.curto, temporada: c.temporada, seguidores: c.seguidores };
  return { ...base, fase: fasesDe(base, c.formacao) };
}
/** Evento esperando decisão (com o texto já preenchido). */
export function eventoPendente(pacote: PacoteDados, s: Save) {
  const e = s.carreira.evento ? EVENTO[s.carreira.evento] : undefined;
  if (!e) return undefined;
  const ctx = contextoEvento(pacote, s);
  return { id: e.id, titulo: e.titulo, texto: preencher(e.texto, ctx), opcoes: e.opcoes.map((o) => ({ id: o.id, rotulo: o.rotulo, custo: dinheiroDoEfeito(o.efeitos, s.carreira.salario) })) };
}
function aplicarEfeito(s: Save, f: EfeitoEvento): string[] {
  const c = s.carreira, notas: string[] = [];
  const din = dinheiroDoEfeito(f, c.salario);
  if (din) { s.casa.saldo += din; notas.push(`${din > 0 ? "+" : "−"}R$ ${Math.abs(din).toLocaleString("pt-BR")}`); }
  if (f.moral) c.moral = clamp(c.moral + f.moral, 0, 100);
  if (f.fama) c.fama = clamp(c.fama + f.fama, 0, 100);
  if (f.relTecnico) c.relTecnico = clamp(c.relTecnico + f.relTecnico, 0, 100);
  if (f.engajamento) c.engajamento = clamp((c.engajamento ?? 40) + f.engajamento, 0, 100);
  if (f.hype) c.hype = clamp((c.hype ?? 0) + f.hype, -0.3, 1.5);
  if (f.pressao) c.pressao = clamp(c.pressao + f.pressao, 0, 100);
  if (f.vidaNoturna) c.vidaNoturna = clamp(c.vidaNoturna + f.vidaNoturna, 0, 100);
  if (f.cansaco) c.cansaco = clamp(c.cansaco + f.cansaco, 0, 100);
  if (f.evolucao) c.bonusEvolucao += f.evolucao;
  const pat = patrocinioDoEfeito(f, c.salario);
  if (pat && f.patrocinio) { c.patrocinioMensal += pat; c.mesesPatrocinio = Math.max(c.mesesPatrocinio, f.patrocinio.meses); notas.push(`patrocínio de R$ ${pat.toLocaleString("pt-BR")}/mês`); }
  return notas;
}
/** O jogador decide o evento fora de campo. */
export function resolverEvento(pacote: PacoteDados, s: Save, opcaoId: string): { titulo: string; texto: string } | undefined {
  const c = s.carreira, e = c.evento ? EVENTO[c.evento] : undefined, o = e?.opcoes.find((x) => x.id === opcaoId);
  if (!e || !o) return;
  c.evento = undefined;
  const ctx = contextoEvento(pacote, s);
  let texto = preencher(o.resultado, ctx), notas = aplicarEfeito(s, o.efeitos);
  if (o.risco && rngDe(s, "evento-risco", e.id).chance(o.risco.chance)) { texto += " " + preencher(o.risco.resultado, ctx); notas = [...notas, ...aplicarEfeito(s, o.risco.efeitos)]; }
  const final = texto + (notas.length ? ` (${notas.join(", ")})` : "");
  noticia(s, "vida", e.titulo, final, { k: "vida" });
  return { titulo: e.titulo, texto: final };
}
export const semanaAbsJogo = (c: Carreira) => c.temporada * SEMANAS_TEMPORADA + c.semana;
/** Paga os patrocínios do mês (fixo + bônus) e encerra os contratos que acabaram. */
function fecharMesPatrocinios(s: Save, eventos: string[]): number {
  const c = s.carreira, ms = c.mesStats ?? { gols: 0, assist: 0, notas8: 0 };
  let total = 0;
  for (const k of c.patrocinios ?? []) {
    const b = bonusDoMes(k, ms);
    total += k.mensal + b;
    if (b) eventos.push(`Bônus da ${MARCA[k.marca]?.nome}: R$ ${b.toLocaleString("pt-BR")}.`);
    k.restantes--;
  }
  for (const k of (c.patrocinios ?? []).filter((x) => x.restantes <= 0)) noticia(s, "dinheiro", `Fim do contrato com a ${MARCA[k.marca]?.nome}`, `O contrato de ${k.meses} meses terminou. A marca pode voltar a procurar ${s.jogador.apelido}.`);
  c.patrocinios = (c.patrocinios ?? []).filter((x) => x.restantes > 0);
  c.mesStats = { gols: 0, assist: 0, notas8: 0 };
  return total;
}
export function aceitarPatrocinio(s: Save, tipo: TipoContrato): ContratoPatrocinio | undefined {
  const c = s.carreira, p = c.propPatrocinio, o = p?.opcoes.find((x) => x.tipo === tipo);
  if (!p || !o) return;
  const k: ContratoPatrocinio = { ...o, marca: p.marca, restantes: o.meses, desde: ANO_INICIAL + c.temporada };
  (c.patrocinios ??= []).push(k);
  c.propPatrocinio = undefined;
  if (o.luvas) s.casa.saldo += o.luvas;
  c.fama = clamp(c.fama + 1, 0, 100);
  const m = MARCA[p.marca];
  noticia(s, "dinheiro", `${s.jogador.apelido} é o novo rosto da ${m.nome}`, `Contrato ${tipo === "fixo" ? "de valor fixo" : tipo === "desempenho" ? "por desempenho" : "de longo prazo"}: ${o.meses} meses, R$ ${o.mensal.toLocaleString("pt-BR")} por mês${o.luvas ? ` e R$ ${o.luvas.toLocaleString("pt-BR")} de luvas` : ""}. "${m.slogan}"`, { k: "patrocinio", marca: m.id });
  return k;
}
export function recusarPatrocinio(s: Save) {
  const c = s.carreira;
  if (!c.propPatrocinio) return;
  (c.recusadas ??= []).push(c.propPatrocinio.marca);
  c.propPatrocinio = undefined;
}
export const receitaPatrocinios = (c: Carreira) => (c.patrocinios ?? []).reduce((a, k) => a + k.mensal, 0);
/** Estúdio de tatuagem: paga e a tatuagem aparece no corpo. */
export function tatuar(s: Save, area: AreaTatuagem, id: string): { ok: boolean; msg: string } {
  const t = TATUAGEM[id], v = visualDe(s.jogador);
  if (!t || !t.areas.includes(area)) return { ok: false, msg: "Esse desenho não cabe aí." };
  if (v.tatuagens[area]) return { ok: false, msg: `Já tem tatuagem ${noArea(area)}. Tire antes com laser.` };
  if (s.casa.saldo < t.preco) return { ok: false, msg: "Dinheiro não dá." };
  s.casa.saldo -= t.preco; v.tatuagens[area] = id;
  s.carreira.moral = clamp(s.carreira.moral + 2, 0, 100); s.carreira.hype = clamp((s.carreira.hype ?? 0) + 0.05, -0.3, 1.5);
  noticia(s, "vida", "Tatuagem nova", `${s.jogador.apelido} apareceu com ${t.nome.toLowerCase()} ${noArea(area)}. A foto rodou as redes.`, { k: "tatuagem" });
  return { ok: true, msg: `${t.nome} ${noArea(area)}: R$ ${t.preco.toLocaleString("pt-BR")}.` };
}
export function removerTatuagem(s: Save, area: AreaTatuagem): { ok: boolean; msg: string } {
  const v = visualDe(s.jogador), id = v.tatuagens[area];
  if (!id) return { ok: false, msg: "Não tem tatuagem aí." };
  const custo = custoRemocao(id);
  if (s.casa.saldo < custo) return { ok: false, msg: "O laser é caro: dinheiro não dá." };
  s.casa.saldo -= custo; delete v.tatuagens[area];
  return { ok: true, msg: `Removida com laser: R$ ${custo.toLocaleString("pt-BR")}.` };
}
function fisicoInicial(at: Record<string, number>): Fisico {
  const vals = Object.values(at), media = vals.reduce((a, b) => a + b, 0) / vals.length;
  return at.FOR >= media + 6 ? "forte" : at.FOR <= media - 6 ? "magro" : "atletico";
}
/** Amigos mais próximos (para a bio e o perfil). */
export function melhoresAmigos(pacote: PacoteDados, c: Carreira, n = 2): { nome: string; clube: string; nivel: number }[] {
  return Object.values(c.relacoes?.lista ?? {}).filter((x) => x.nivel >= 40).sort((a, b) => b.nivel - a.nivel).slice(0, n)
    .map((x) => ({ nome: x.nome, clube: infoClube(pacote, x.clubeId)?.nome ?? x.clubeId, nivel: x.nivel }));
}
export const NOME_POSICAO: Record<Posicao, string> = { ZAG: "Zagueiro", LAT: "Lateral", VOL: "Volante", MEI: "Meia", PON: "Ponta", ATA: "Centroavante" };
/** Responder à sugestão de posição do técnico. */
export function responderSugestao(s: Save, aceita: boolean): string {
  const c = s.carreira, sg = c.sugestaoPos;
  if (!sg || sg.aceita !== undefined) return "";
  if (aceita) { sg.aceita = true; c.treinoPosicao = sg.pos; c.relTecnico = clamp(c.relTecnico + 4, 0, 100); return `Combinado: você treina de ${NOME_POSICAO[sg.pos].toLowerCase()} (rende 30% mais por ser pedido do técnico).`; }
  sg.aceita = false; c.relTecnico = clamp(c.relTecnico - 2, 0, 100); return "Você agradeceu e preferiu seguir na sua posição.";
}
export function treinarPosicao(s: Save, p: Posicao | undefined): string {
  s.carreira.treinoPosicao = p && p !== s.jogador.posicao ? p : undefined;
  return p ? `Treino de ${NOME_POSICAO[p].toLowerCase()} começa nesta semana.` : "Sem treino de posição.";
}
/** Passa a jogar na posição (a partir de 70% de domínio). */
export function mudarPosicao(s: Save, p: Posicao): { ok: boolean; msg: string } {
  const j = s.jogador, fam = familiaridadeDe(j);
  if (p === j.posicao) return { ok: false, msg: "Já é a sua posição." };
  if ((fam[p] ?? 0) < PODE_JOGAR) return { ok: false, msg: `Precisa de ${PODE_JOGAR}% de domínio para jogar ali.` };
  j.posicao = p;
  noticia(s, "clube", "Mudança de posição", `${j.apelido} passa a jogar de ${NOME_POSICAO[p].toLowerCase()}.`);
  return { ok: true, msg: `Agora você joga de ${NOME_POSICAO[p].toLowerCase()}.` };
}
/** Uma conversa com outro jogador (até 3 por semana, uma por pessoa). */
export function agirRelacao(pacote: PacoteDados, s: Save, nome: string, acao: AcaoRel): { ok: boolean; msg: string } {
  const c = s.carreira, rr = relacoesDe(c), x = rr.lista[nome], ano = ANO_INICIAL + c.temporada;
  const est = estrelas(pacote).find((e) => e.nome === nome);
  const alvo = x ?? (est ? relacao(rr, est.nome, est.clubeId, ano) : undefined);
  if (!alvo) return { ok: false, msg: "Jogador não encontrado." };
  const bloqueio = podeAgir(rr, semanaAbsJogo(c), nome);
  if (bloqueio && acao !== "camisa") return { ok: false, msg: bloqueio };
  const fazer = (v: number, msg: string) => { subir(alvo, v); rr.feitas.push(nome); return { ok: true, msg: `${msg} (${rotuloNivel(alvo.nivel).toLowerCase()} · ${Math.round(alvo.nivel)})` }; };
  switch (acao) {
    case "mensagem": return fazer(est && !alvo.companheiro ? 3 * atencao(c.fama, est.fama) : 3, `Você mandou mensagem para ${nome}.`);
    case "jantar": {
      if (!alvo.companheiro) return { ok: false, msg: "Jantar é com companheiro de clube." };
      const custo = Math.round(Math.max(300, c.salario * 0.01));
      if (s.casa.saldo < custo) return { ok: false, msg: "Dinheiro curto para o jantar." };
      s.casa.saldo -= custo;
      return fazer(7, `Jantar com ${nome}: R$ ${custo.toLocaleString("pt-BR")}.`);
    }
    case "redes": {
      if (!est) return { ok: false, msg: "Comentar nas redes é para estrela." };
      c.engajamento = clamp((c.engajamento ?? 40) + 3, 0, 100);
      return fazer(3 * atencao(c.fama, est.fama), `Você comentou na foto de ${nome}.`);
    }
    case "camisa": {
      const jg = jogoDaSemana(s);
      if (!est || !jg || jg.adversario !== est.clubeId) return { ok: false, msg: "Só dá para pedir a camisa na semana do jogo contra ele." };
      if (alvo.camisa) return { ok: false, msg: "Você já tem a camisa dele." };
      rr.camisaPedida = nome;
      return { ok: true, msg: `Combinado: depois do jogo você pede a camisa de ${nome}. Chance de ${Math.round(100 * chanceCamisa(alvo.nivel, c.fama, est.fama))}%.` };
    }
    case "indicacao": {
      if (alvo.companheiro) return { ok: false, msg: "Ele já joga com você." };
      if (alvo.nivel < 60) return { ok: false, msg: "Precisa ser parceiro (60+) para pedir isso." };
      if (alvo.indicacao === c.temporada) return { ok: false, msg: "Ele já tentou nesta temporada." };
      const w = mundo(pacote), clube = w.clube[alvo.clubeId];
      if (!janelaAberta(c)) return { ok: false, msg: "Peça na janela de transferências." };
      alvo.indicacao = c.temporada; rr.feitas.push(nome);
      if (!rngDe(s, "indicacao", nome).chance(chanceIndicacao(alvo.nivel, ovr(s.jogador), clube.forca))) return { ok: true, msg: `${nome} falou com a diretoria do ${clube.nome}, mas eles não quiseram agora.` };
      const p = propostaPorIndicacao(pacote, s, clube.id);
      return p ? { ok: true, msg: `${nome} te indicou e o ${clube.nome} fez uma proposta! Veja no Mercado.` } : { ok: true, msg: `${nome} tentou, mas não deu certo agora.` };
    }
  }
}
export const padraoDe = (c: Carreira): PadraoVida => (c.padrao ??= { ...PADRAO_INICIAL });
/** Seguidores que o jogador "deveria" ter no clube atual. */
export function alvoDeSeguidores(pacote: PacoteDados, s: Save, clubeId = s.carreira.clubeId): number {
  const c = s.carreira, cl = mundo(pacote).clube[clubeId];
  return alvoSeguidores(c.fama, visibilidade(clubeId, cl?.ligaId, cl?.fClube ?? 1), s.jogador.personalidade.carisma ?? 10, c.engajamento ?? 40, c.hype ?? 0);
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
    noticia(s, "vida", g.reliquia.tipo === "trofeu" ? g.reliquia.nome : `Relíquia: ${g.reliquia.nome}`, `${g.reliquia.legenda}. Já faz parte da coleção de ${s.jogador.apelido}.`, { k: "trofeu" });
  }
}

function fimDeTemporada(pacote: PacoteDados, s: Save, eventos: string[]): ResumoTemporada {
  const l = ligaAtual(pacote, s), c = s.carreira, j = s.jogador;
  const posicao = ordenar(c.tabela).findIndex((t) => t.clube === c.clubeId) + 1;
  const titulo = posicao === 1 && c.stats.jogos >= 10;
  const notas = c.stats.notas, media = (x: number[]) => (x.length ? +(x.reduce((a, b) => a + b, 0) / x.length).toFixed(2) : 0);
  const r: ResumoTemporada = { ano: ANO_INICIAL + c.temporada, idade: j.idade, clube: clubeDe(l, c.clubeId).nome, clubeId: c.clubeId, liga: infoLiga(c.ligaId).curto, est: estatisticasEstimadas(j.at, j.posicao, `${s.semente}|${c.temporada}`), ovr: Math.round(ovr(j)), jogos: c.stats.jogos, gols: c.stats.gols, assist: c.stats.assist, nota: media(notas), posicao, titulo, base: c.stats.base, baseGols: c.stats.baseGols };
  // premiação: troféus que vão para a casa
  const cc = clubeCasa(pacote, c.clubeId), ev: string[] = [];
  const premios = premiosDaTemporada(rngDe(s, "premios"), { ano: r.ano, idade: j.idade, clubeId: c.clubeId, clubeNome: cc.nome, cores: cc.cores, numero: j.numero,
    padrao: infoClube(pacote, c.clubeId).padrao, ligaCurto: infoLiga(c.ligaId).curto, recemContratado: c.chegadaClube === c.temporada,
    jogos: r.jogos, gols: r.gols, assist: r.assist, nota: r.nota, titulo, base: r.base, golsBase: c.stats.baseGols, notaBase: media(c.stats.baseNotas ?? []),
    temporadasCheias: c.historico.filter((h) => h.jogos >= 15).length });
  receberReliquias(s, premios, ev);
  r.premios = premios.filter((g) => g.reliquia.tipo === "trofeu").map((g) => g.reliquia.nome);
  c.historico.push(r);
  if (titulo) { c.fama = clamp(c.fama + 5, 0, 100); c.torcida = clamp((c.torcida ?? 50) + 10, 0, 100); }
  noticia(s, "clube", `Fim da temporada ${r.ano}`, `${r.clube} terminou em ${posicao}º. ${j.apelido}: ${r.jogos} jogos no profissional, ${r.gols} gols, ${r.assist} assistências${r.base ? `, ${r.base} jogos na base` : ""}.`);
  // nova temporada
  j.idade++; c.temporada++; c.semana = 0; c.anosContrato--; c.recusadas = [];
  c.tabela = novaTabela(l); c.stats = statsVazias();
  const clube = clubeDe(l, c.clubeId);
  if (c.formacao && j.idade >= 18) {
    c.formacao = false; c.anosContrato = 3;
    c.salario = Math.round(salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama }));
    noticia(s, "clube", "Primeiro contrato profissional", `${j.apelido} assina por 3 anos: R$ ${c.salario.toLocaleString("pt-BR")} por mês.`);
  } else if (c.anosContrato <= 0 && c.formacao) {
    c.anosContrato = 2;
    c.salario = Math.round(Math.max(3000, salarioMensal({ ovr: ovr(j), idade: j.idade, liga: l, clube, agente: c.agente, fama: c.fama, formacao: true })));
    noticia(s, "clube", "Contrato renovado", `Mais 2 anos na base, R$ ${c.salario.toLocaleString("pt-BR")} por mês.`);
  }
  // mercado: fim de empréstimo e contrato vencido
  fimDaTemporadaNoMercado(pacote, s, eventos);
  contratoVencido(pacote, s, eventos);
  return r;
}

// ------------------------------------------------------------------ política automática (para testes e balanceamento)
export function planoAutomatico(s: Save): Plano {
  const c = s.carreira, foco: Grupo = (["fisico", "tecnico", "tatico"] as Grupo[])[(c.semana + c.temporada) % 3];
  const acoes: Acao[] = c.cansaco > 40 ? ["descanso", "treino", "descanso", "familia", "video"] : ["treino", "familia", "treino", "video", "descanso"];
  return { foco, intensidade: c.cansaco > 60 ? "leve" : "normal", acoes };
}
/** Joga uma semana inteira sem interface, escolhendo a primeira opção de cada decisão. */
export function semanaAutomatica(pacote: PacoteDados, s: Save, decidirMercado = true): ResumoSemana {
  if (decidirMercado) decidirAutomatico(pacote, s);
  if (s.carreira.propPatrocinio) aceitarPatrocinio(s, "fixo");
  if (s.carreira.evento) resolverEvento(pacote, s, EVENTO[s.carreira.evento]?.opcoes[0].id ?? "");
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
